import { ConfigOptions } from "../express/types/ConfigOptions";
import { Container } from "typedi";
import { ExpressApp } from "../express/ExpressApp";
import { Express } from "express";

export async function startTestServerWithConfig(config: ConfigOptions): Promise<Express> {
  process.env.SLACK_SECRET = "abc";
  process.env.SLACK_CLIENT_ID = "abc";
  process.env.SLACK_CALLBACK_URL = "http://localhost";
  process.env.DISABLE_AUTH_ON_API = "true";
  process.env.CONFIG = JSON.stringify(config);

  const expressApp = Container.get(ExpressApp);
  return await expressApp.create();
}
