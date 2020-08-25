import { NetjamServer } from "@netjam/server";
import { DatabaseProvider } from "./providers/database.provider";
import { AuthProvider } from "./providers/auth.provider";
import { UserProvider } from "./providers/user.provider";
import njConfig from "../njconfig.json";
import { LoggerProvider } from "./providers/logger.provider";

const njApp = new NetjamServer(njConfig);

async function bootstrap() {
  njApp.useGlobalRestApiPrefix("/api");
  await njApp.bootstrap([
    new DatabaseProvider(),
    new LoggerProvider(),
    new AuthProvider(),
    new UserProvider(),
  ]);
  await njApp.start();
  console.log("AuthService started on 0.0.0.0:9091");
}

bootstrap().catch((e) => console.error(e));
