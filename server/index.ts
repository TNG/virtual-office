import "reflect-metadata";

import dotenv from "dotenv";
import { Container } from "typedi";

import { logger } from "./log.js";
import { Config } from "./Config.js";
import { ExpressApp } from "./express/ExpressApp.js";
import { WebSocketController } from "./express/WebSocketController.js";
import { SlackBotService } from "./services/SlackBotService.js";
import { ZoomWebhookService } from "./services/ZoomWebhookService.js";

const result = dotenv.config();
if (result.error) {
  logger.warn(`Ignored dotenv config: ${result.error.message}`);
} else {
  logger.info("Loaded dotenv config");
  logger.debug("Current config", result.parsed);
}

(async function () {
  const config = Container.get(Config);
  const expressApp = Container.get(ExpressApp);
  const appInstance = await expressApp.create();

  const server = appInstance.listen(config.port);

  Container.get(WebSocketController).init(server);

  if (config.slackBotOAuthAccessToken) {
    Container.get(SlackBotService);
  }

  if (config.zoomWebhookApi) {
    Container.get(ZoomWebhookService);
  }

  logger.info(`started on port ${config.port}`);
})();
