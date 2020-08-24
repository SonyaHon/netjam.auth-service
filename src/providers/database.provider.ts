import { ProviderBase, Init } from "@netjam/server";
import { createConnection, Connection } from "typeorm";

export class DatabaseProvider extends ProviderBase {
  private connection: Connection;

  @Init
  async init() {
    this.connection = await createConnection();
  }
}
