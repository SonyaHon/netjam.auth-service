import {
  ProviderBase,
  Provider,
  ProviderType,
  AfterStartInit,
  Post,
  Body,
  Res,
} from "@netjam/server";
import { DatabaseProvider } from "./database.provider";
import { User, ICreateUser } from "../entity/user.entity";
import { v4 as uuid } from "uuid";
import { EPermissions } from "../reference/permissions";
import { Response } from "express";

@Provider(ProviderType.REST, {
  prefix: "/user",
})
export class UserProvider extends ProviderBase {
  private db: DatabaseProvider;

  @AfterStartInit
  async afterStartInit() {
    this.db = this.getProvider<DatabaseProvider>(DatabaseProvider.name);
  }

  @Post("/create")
  async createUser(@Body() body: ICreateUser, @Res() response: Response) {
    // validation
    if (!body.username || !body.password || !body.salt) {
      response.status(400);
      return;
    }

    try {
      const user = User.Create(body);
      await this.db.getRepository("user").save(user);
      response.status(204);
    } catch (e) {
      console.error(e);
      response.status(500);
    }
  }
}
