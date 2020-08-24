import { ProviderBase, Init } from "@netjam/server";
import { createConnection, Connection, Repository } from "typeorm";
import { User } from "../entity/user.entity";

export class DatabaseProvider extends ProviderBase {
  private connection: Connection;
  private userRepository: Repository<User>;

  @Init
  async init() {
    this.connection = await createConnection({
      type: "postgres",
      host: process.env.DB_HOST || "localhost",
      port: 5432,
      username: process.env.DB_USERNAME || "postgres",
      password: process.env.DB_PASS || "gopniki",
      database: "auth_service",
      synchronize: true,
      logging: false,
      entities: ["src/entity/**/*.ts"],
    });
    this.userRepository = this.connection.getRepository(User);
  }

  getRepository(repository: "user") {
    const map = {
      user: this.userRepository,
    };

    return map[repository];
  }
}
