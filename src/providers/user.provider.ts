import {
  ProviderBase,
  Provider,
  ProviderType,
  AfterStartInit,
} from "@netjam/server";
import { DatabaseProvider } from "./database.provider";

@Provider(ProviderType.REST)
export class UserProvider extends ProviderBase {
  private db: DatabaseProvider;

  @AfterStartInit
  async afterStartInit() {
    this.db = this.getProvider<DatabaseProvider>(DatabaseProvider.name);
  }
}
