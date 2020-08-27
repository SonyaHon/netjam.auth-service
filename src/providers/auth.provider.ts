import { ProviderBase, AfterStartInit, Provider, ProviderType, Post, Body, Res } from "@netjam/server";
import { Response } from "express";
import { compare } from "bcrypt";
import { sign } from "jsonwebtoken";
import { UserProvider, IUserFrontend, IUserNavbar } from "./user.provider";
import { User } from "../entity/user.entity";
import { HTTP_CODE, Errorable, ERROR_CODE, IError } from "../reference/error";

export interface IAuthLogin {
  username: string;
  password: string;
}

@Provider(ProviderType.REST, {
  prefix: "/auth",
})
export class AuthProvider extends ProviderBase {
  private userProvider: UserProvider;

  @AfterStartInit
  async afterStartInit() {
    this.userProvider = this.getProvider<UserProvider>(UserProvider.name);
  }

  @Post("/login")
  async login(
    @Body() body: IAuthLogin,
    @Res() response: Response
  ): Promise<Errorable<{ token: string; data: IUserFrontend; navbar: IUserNavbar }>> {
    const ERR = {
      code: ERROR_CODE.USER_NOT_FOUND,
      message: "Username or password is incorrect",
    };

    const user = await this.userProvider.getUser(body.username);
    if (!user || (user as IError).code || (user as IError).message) {
      response.status(HTTP_CODE.NOT_FOUND);

      return user ? (user as IError) : ERR;
    }
    const unwrapedUser = user as User;
    const res = await compare(body.password, unwrapedUser.password);
    if (!res) {
      response.status(HTTP_CODE.NOT_FOUND);

      return ERR;
    }

    const jwtToken = sign({ userId: unwrapedUser.id }, process.env.NJ_JWT_SECRET || "secret", {
      expiresIn: unwrapedUser.data.loginTimeout ? unwrapedUser.data.loginTimeout : "7d",
    });

    return {
      token: jwtToken,
      data: UserProvider.UserToFrontendUser(unwrapedUser),
      navbar: await this.userProvider.resolveUserNavbar(unwrapedUser, "/", "main.home"),
    };
  }
}
