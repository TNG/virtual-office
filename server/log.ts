import { pino, LogFn } from "pino";

export interface Logger {
  trace: LogFn;
  debug: LogFn;
  info: LogFn;
  warn: LogFn;
  error: LogFn;
}

const instance = pino({
  transport: {
    target: "pino-pretty",
    options: {
      colorize: true,
    },
  },
  level: process.env.LOG_LEVEL || "info",
});

export const logger = instance;
