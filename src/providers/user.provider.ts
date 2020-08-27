import {
  ProviderBase,
  Provider,
  ProviderType,
  AfterStartInit,
  Post,
  Body,
  Res,
  Get,
  Req,
  injectRequestRestHandlerFactory,
  Query,
} from "@netjam/server";
import { Response, Request } from "express";
import { verify } from "jsonwebtoken";
import { DatabaseProvider } from "./database.provider";
import { User, ICreateUser } from "../entity/user.entity";
import { HTTP_CODE, Errorable, ERROR_CODE } from "../reference/error";
import { LoggerProvider } from "./logger.provider";
import { UserData } from "../reference/user-data";
import { EPermissions } from "../reference/permissions";
import { NAVBAR_ITEMS } from "../reference/navbar-items";

export interface IUserFrontend {
  username: string;
  id: string;
  data: UserData;
}

export interface INavbarItem {
  title: string;
  icon: string;
  to: string;
}

export interface IUserNavbar {
  project: string;
  items: INavbarItem[];
}

type TokenizedReq = { body: { token: { userId: string } } };

enum ReqType {
  GET,
  POST,
}

enum AuthType {
  TOKEN,
}

const CheckAuth = injectRequestRestHandlerFactory(
  (req: Request, response: Response, next: any, reqType: ReqType, authType: AuthType) => {
    const error = {
      code: ERROR_CODE.BAD_TOKEN,
      message: "Jwt token is invalid",
    };
    const { token } = req.query;

    if (!token) {
      response.status(HTTP_CODE.FORBIDDEN);
      response.json(error);

      return;
    }

    const decoded = verify(token as string, process.env.NJ_JWT_SECRET || "secret");
    if (!decoded) {
      response.status(HTTP_CODE.FORBIDDEN);
      response.json(error);

      return;
    }
    req.body.token = decoded;
    next();
  }
);

@Provider(ProviderType.REST, {
  prefix: "/user",
})
export class UserProvider extends ProviderBase {
  private db: DatabaseProvider;
  private logger: LoggerProvider;

  @AfterStartInit
  async afterStartInit() {
    this.db = this.getProvider<DatabaseProvider>(DatabaseProvider.name);
    this.logger = this.getProvider<LoggerProvider>(LoggerProvider.name);
  }

  async getUser(username: string): Promise<Errorable<User>> {
    try {
      return this.db.userRepository.findOne({
        where: {
          username,
        },
      });
    } catch (e) {
      // @todo parse error
      return null;
    }
  }

  static UserToFrontendUser(user: User): IUserFrontend {
    return {
      id: user.id,
      username: user.username,
      data: user.data,
    };
  }

  resolveProject(name) {
    const res = name.match(/^\$(.*)\$.*$/);

    return res[1];
  }

  async resolveUserNavbar(user: User, path: string, name: string): Promise<IUserNavbar> {
    if (user.hasPermission(EPermissions.ROOT)) {
      if (name.match(/^main\..*$/)) {
        return {
          project: null,
          items: Object.values(NAVBAR_ITEMS),
        };
      }
      const project = this.resolveProject(name);

      return {
        project,
        items: [],
      };
    }

    return {
      project: null,
      items: [],
    };
  }

  @Get("/fetch-self")
  @CheckAuth(ReqType.GET, AuthType.TOKEN)
  async fetchSelf(@Req() request: TokenizedReq) {
    const { token } = request.body;
    const { userId } = token;

    const user = await this.db.userRepository.findOne({
      where: {
        id: userId,
      },
    });

    return UserProvider.UserToFrontendUser(user);
  }

  @Get("/can-visit-route")
  @CheckAuth(ReqType.GET, AuthType.TOKEN)
  async canVisitRoute(
    @Req() request: TokenizedReq,
    @Query() query: { name: string; path: string }
  ): Promise<{ result: boolean; navbar?: IUserNavbar }> {
    if (query.name === "main") {
      return {
        result: true,
      };
    }

    const user = await this.db.userRepository.findOne({
      where: {
        id: request.body.token.userId,
      },
    });

    if (user.hasPermission(EPermissions.ROOT)) {
      return {
        result: true,
        navbar: await this.resolveUserNavbar(user, query.path, query.name),
      };
    }

    return {
      result: false,
    };
  }

  @Post("/create")
  async createUser(@Body() body: ICreateUser, @Res() response: Response): Promise<Errorable<undefined>> {
    // validation
    if (!body.username || !body.password) {
      response.status(HTTP_CODE.MALFORMED_REQUEST);

      return {
        code: ERROR_CODE.WRONG_VALIDATION,
        message: "Not all required fields are listed",
      };
    }

    try {
      const user = await User.Create(body);
      await this.db.userRepository.save(user);
      response.status(204);

      return undefined;
    } catch (e) {
      if (e.code === "23505") {
        response.status(HTTP_CODE.MALFORMED_REQUEST);

        return {
          code: ERROR_CODE.USERNAME_NOT_AVAILABLE,
          message: "Username is already taken",
        };
      }

      this.logger.error({
        code: ERROR_CODE.CATCHED_ERROR,
        message: e.message,
        data: e,
      });
      response.status(HTTP_CODE.INTERNAL_ERROR);

      return {
        message: e.message,
      };
    }
  }
}
