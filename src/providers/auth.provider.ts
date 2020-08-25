import {
  ProviderBase,
  AfterStartInit,
  Provider,
  ProviderType,
  Post,
  Body,
  Res,
} from "@netjam/server";
import { DatabaseProvider } from "./database.provider";
import { Response } from "express";
import { UserProvider } from "./user.provider";
import { User } from "../entity/user.entity";
import { HTTP_CODE, Errorable, ERROR_CODE } from "../reference/error";
import { compare } from "bcrypt";
import { rejects } from "assert";

export interface IAuthLogin {
  username: string;
  password: string;
}

@Provider(ProviderType.REST, {
  prefix: "/auth",
})
export class AuthProvider extends ProviderBase {
  private db: DatabaseProvider;

  @AfterStartInit
  async afterStartInit() {
    this.db = this.getProvider<DatabaseProvider>(DatabaseProvider.name);
  }

  @Post("/login")
  async login(
    @Body() body: IAuthLogin,
    @Res() response: Response
  ): Promise<Errorable<any>> {
    const user = await this.getProvider<UserProvider>(
      UserProvider.name
    ).getUser(body.username);

    if (!user) {
      response.status(HTTP_CODE.NOT_FOUND);
      return {
        code: ERROR_CODE.USER_NOT_FOUND,
        message: "Username or password is incorrect",
      };
    }
    let unwrapedUser = user as User;
    const res = await compare(body.password, unwrapedUser.password);
    if (res) {
      // login user
      return true;
    }
  }
}
