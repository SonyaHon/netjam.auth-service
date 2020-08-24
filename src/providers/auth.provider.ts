import {
  ProviderBase,
  AfterStartInit,
  Provider,
  ProviderType,
} from "@netjam/server";
import { DatabaseProvider } from "./database.provider";

@Provider(ProviderType.REST)
export class AuthProvider extends ProviderBase {
  private db: DatabaseProvider;

  @AfterStartInit
  async afterStartInit() {
    this.db = this.getProvider<DatabaseProvider>(DatabaseProvider.name);
  }
}
