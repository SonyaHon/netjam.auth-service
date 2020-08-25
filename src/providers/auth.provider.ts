import { ProviderBase, AfterStartInit, Provider, ProviderType, Post, Body, Res } from "@netjam/server";
import { DatabaseProvider } from "./database.provider";
import { Response } from "express";
import { UserProvider } from "./user.provider";
import { User } from "../entity/user.entity";
import { HTTP_CODE, Errorable, ERROR_CODE, IError } from "../reference/error";
import { compare } from "bcrypt";
import { sign, verify } from "jsonwebtoken";

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
  async login(@Body() body: IAuthLogin, @Res() response: Response): Promise<Errorable<any>> {
    const ERR = {
      code: ERROR_CODE.USER_NOT_FOUND,
      message: "Username or password is incorrect",
    };

    const user = await this.getProvider<UserProvider>(UserProvider.name).getUser(body.username);
    if (!user || (user as IError).code || (user as IError).message) {
      response.status(HTTP_CODE.NOT_FOUND);
      return user ? (user as IError) : ERR;
    }
    let unwrapedUser = user as User;
    const res = await compare(body.password, unwrapedUser.password);
    if (!res) {
      response.status(HTTP_CODE.NOT_FOUND);
      return ERR;
    }

    const jwtToken = sign({ userId: unwrapedUser.id }, process.env.NJ_JWT_SECRET || "secret", {
      expiresIn: unwrapedUser.data.loginTimeout ? unwrapedUser.data.loginTimeout : "7d",
    });
    response.cookie("nj-jwt-token", jwtToken);
    // @todo write this token to cookie
    return true;
  }
}
