import { NetjamServer } from "@netjam/server";
import cookieParser from "cookie-parser";
import cors from "cors";
import { DatabaseProvider } from "./providers/database.provider";
import { AuthProvider } from "./providers/auth.provider";
import { UserProvider } from "./providers/user.provider";
import { LoggerProvider } from "./providers/logger.provider";

const njApp = new NetjamServer({
  server: {
    host: process.env.NJ_HOST || "0.0.0.0",
    port: parseInt(process.env.NJ_PORT, 10) || 9091,
  },
  ...(process.env.NJ_SERVICE_NAME
    ? {
        microservice: {
          serviceName: process.env.NJ_SERVICE_NAME,
          redisConnection: {
            port: parseInt(process.env.NJ_REDIS_PORT, 10),
            host: process.env.NJ_REDIS_HOST,
          },
        },
      }
    : {}),
});

async function bootstrap() {
  njApp.useGlobalRestApiPrefix("/api");
  njApp.express.use(cookieParser(process.env.NJ_COOKIE_SECRET || "secret"));
  njApp.express.use(cors());
  await njApp.bootstrap([new DatabaseProvider(), new LoggerProvider(), new AuthProvider(), new UserProvider()]);
  await njApp.start();
  console.log("AuthService started on 0.0.0.0:9091");
}

bootstrap().catch((e) => console.error(e));
