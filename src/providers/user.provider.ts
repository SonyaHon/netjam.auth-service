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
} from "@netjam/server";
import { Response, Request } from "express";
import { verify } from "jsonwebtoken";
import { DatabaseProvider } from "./database.provider";
import { User, ICreateUser } from "../entity/user.entity";
import { HTTP_CODE, Errorable, ERROR_CODE } from "../reference/error";
import { LoggerProvider } from "./logger.provider";
import { NJ_JWT_TOKEN } from "../reference/tokens";
import { UserData } from "../reference/user-data";

export interface IUserFrontend {
  username: string;
  id: string;
  data: UserData;
}

const CheckAuth = injectRequestRestHandlerFactory((req: Request, response: Response, next: any) => {
  const error = {
    code: ERROR_CODE.BAD_TOKEN,
    message: "Jwt token is invalid",
  };

  if (!req.cookies[NJ_JWT_TOKEN]) {
    response.status(HTTP_CODE.FORBIDDEN);
    response.json(error);

    return;
  }

  const token = req.cookies[NJ_JWT_TOKEN];
  const decoded = verify(token, process.env.NJ_JWT_SECRET || "secret");
  if (!decoded) {
    response.status(HTTP_CODE.FORBIDDEN);
    response.json(error);

    return;
  }
  req.body.token = decoded;
  next();
});

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

  @Get("/fetch-self")
  @CheckAuth()
  async fetchSelf(@Req() request: Request) {
    const { token } = request.body;
    const { userId } = token;

    const user = await this.db.userRepository.findOne({
      where: {
        id: userId,
      },
    });

    return UserProvider.UserToFrontendUser(user);
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
