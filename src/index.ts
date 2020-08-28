import { NetjamServer, MicroserviceConnectProvider, MICROSERVICE_CONNECT } from "@netjam/server";
import cookieParser from "cookie-parser";
import cors from "cors";
import { DatabaseProvider } from "./providers/database.provider";
import { AuthProvider } from "./providers/auth.provider";
import { UserProvider } from "./providers/user.provider";
import { LoggerProvider } from "./providers/logger.provider";
import { logger } from "./utils/logger";

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
  await njApp.bootstrap([
    new MicroserviceConnectProvider(),
    new DatabaseProvider(),
    new LoggerProvider(),
    new AuthProvider(),
    new UserProvider(),
  ]);
  await njApp.start();
  logger.info(`Service "auth.service" is listening on ${process.env.NJ_HOST}:${process.env.NJ_PORT}`);
}

bootstrap().catch((e) => {
  logger.error(e.message);
});
