import "reflect-metadata";

import { logger } from "./log";
import { Container } from "typedi";
import { ExpressApp } from "./express/ExpressApp";
import { Config } from "./Config";
import { WebSocketController } from "./express/WebSocketController";

const expressApp = Container.get(ExpressApp);
const appInstance = expressApp.create();
const config = Container.get(Config);

const server = appInstance.listen(config.port);

Container.get(WebSocketController).init(server);

logger.info(`started on port ${config.port}`);
