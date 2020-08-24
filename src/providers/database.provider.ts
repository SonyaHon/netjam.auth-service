import { ProviderBase, Init } from "@netjam/server";
import { createConnection, Connection, Repository } from "typeorm";
import { User } from "../entity/user.entity";

export class DatabaseProvider extends ProviderBase {
  private connection: Connection;
  private userRepository: Repository<User>;

  @Init
  async init() {
    this.connection = await createConnection();
    this.userRepository = this.connection.getRepository(User);
  }

  getRepository(repository: "user") {
    const map = {
      user: this.userRepository,
    };

    return map[repository];
  }
}
