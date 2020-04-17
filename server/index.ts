import "reflect-metadata";

import dotenv from "dotenv";
import { Container } from "typedi";

import { logger } from "./log";
import { Config } from "./Config";
import { ExpressApp } from "./express/ExpressApp";
import { WebSocketController } from "./express/WebSocketController";
import { SlackBotService } from "./services/SlackBotService";

const result = dotenv.config();
if (result.error) {
  logger.warn(`Ignored dotenv config: ${result.error.message}`);
} else {
  logger.info(`Loaded dotenv config: ${JSON.stringify(result.parsed)}`);
}

(async function () {
  const expressApp = Container.get(ExpressApp);
  const appInstance = await expressApp.create();
  const config = Container.get(Config);

  const server = appInstance.listen(config.port);

  Container.get(WebSocketController).init(server);

  if (config.slack.botOAuthAccessToken) {
    Container.get(SlackBotService).init(config.slack);
  }

  logger.info(`started on port ${config.port}`);
})();
