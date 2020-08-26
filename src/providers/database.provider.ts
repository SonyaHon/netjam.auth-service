import { ProviderBase, Init } from "@netjam/server";
import { createConnection, Connection, Repository } from "typeorm";
import { User } from "../entity/user.entity";
import { Log } from "../entity/log.entity";

export class DatabaseProvider extends ProviderBase {
  private connection: Connection;
  public userRepository: Repository<User>;
  public logRepository: Repository<Log>;

  @Init
  async init() {
    this.connection = await createConnection({
      type: "postgres",
      host: process.env.DB_HOST || "localhost",
      port: parseInt(process.env.DB_PORT, 10) || 5432,
      username: process.env.DB_USERNAME || "postgres",
      password: process.env.DB_PASSWORD || "postgres",
      database: "auth_service",
      synchronize: true,
      logging: false,
      entities: ["src/entity/**/*.ts"],
    });
    this.userRepository = this.connection.getRepository(User);
    this.logRepository = this.connection.getRepository(Log);
  }
}
