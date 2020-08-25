import { ProviderBase, AfterStartInit } from "@netjam/server";
import { DatabaseProvider } from "./database.provider";
import { IEvent } from "../reference/event";
import { Log } from "../entity/log.entity";

export enum ELogLevel {
  INFO = "info",
  WARNING = "warning",
  ERROR = "error",
}

export class LoggerProvider extends ProviderBase {
  private db: DatabaseProvider;

  @AfterStartInit
  async afterStartInit() {
    this.db = this.getProvider<DatabaseProvider>(DatabaseProvider.name);
  }

  private async sendLog(level: ELogLevel, event: IEvent) {
    const evt = Log.CreateEvent({
      level,
      event,
    });
    await this.db.logRepository.save(evt);
  }

  public log(event: IEvent) {
    this.sendLog(ELogLevel.INFO, event);
  }

  public warn(event: IEvent) {
    this.sendLog(ELogLevel.WARNING, event);
  }

  public error(event: IEvent) {
    this.sendLog(ELogLevel.ERROR, event);
  }
}
