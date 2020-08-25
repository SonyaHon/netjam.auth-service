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
  async login(@Body() body: IAuthLogin, @Res() response: Response) {

  }
}
