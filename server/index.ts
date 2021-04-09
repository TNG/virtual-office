import "reflect-metadata";

import dotenv from "dotenv";
import { Container } from "typedi";

import { logger } from "./log";
import { Config } from "./Config";
import { ExpressApp } from "./express/ExpressApp";
import { WebSocketController } from "./express/WebSocketController";
import { SlackBotService } from "./services/SlackBotService";
import { ZoomWebhookService } from "./services/ZoomWebhookService";
import { ApolloServerService } from "./apollo/ApolloServerService";

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

  if (config.slack?.botOAuthAccessToken) {
    Container.get(SlackBotService);
  }

  if (config.zoomWebhookApi) {
    Container.get(ZoomWebhookService);
  }

  const apolloServer = Container.get(ApolloServerService);
  const apolloServerInstance = await apolloServer.init(appInstance);
  const expressServer = appInstance.listen(config.port, () => {
    logger.info(`Server listening on http://localhost:${config.port}${apolloServerInstance.graphqlPath}`);
  });
  Container.get(WebSocketController).init(expressServer);
})();
