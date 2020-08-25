import { ProviderBase, Provider, ProviderType, AfterStartInit, Post, Body, Res } from "@netjam/server";
import { DatabaseProvider } from "./database.provider";
import { User, ICreateUser } from "../entity/user.entity";
import { Response } from "express";
import { HTTP_CODE, IError, Errorable, ERROR_CODE } from "../reference/error";
import { LoggerProvider } from "./logger.provider";

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
        username,
      });
    } catch (e) {
      // @todo parse error
      return null;
    }
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
    } catch (e) {
      console.error(e);
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
