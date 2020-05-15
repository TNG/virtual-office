import pino from "pino";

type LogFn = (msg: string, obj?: any) => void;
export interface Logger {
  trace: LogFn;
  debug: LogFn;
  info: LogFn;
  warn: LogFn;
  error: LogFn;
}

const instance = pino({
  prettyPrint: true,
});

function buildLogFn(level: string) {
  return (message: string, data?: any) => instance[level](data || {}, message);
}

export const logger: Logger = {
  trace: buildLogFn("trace"),
  debug: buildLogFn("debug"),
  info: buildLogFn("info"),
  warn: buildLogFn("warn"),
  error: buildLogFn("error"),
};
