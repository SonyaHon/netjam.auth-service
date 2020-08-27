import { createLogger, transports, format } from "winston";

export const logger = createLogger({
  transports: [new transports.Console()],
  defaultMeta: { service: "auth.service" },
  format: format.combine(format.colorize(), format.timestamp(), format.splat(), format.simple()),
});
