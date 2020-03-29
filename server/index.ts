import "reflect-metadata";

import { logger } from "./log";
import { Container } from "typedi";
import { ExpressApp } from "./express/ExpressApp";
import { Config } from "./Config";

const expressApp = Container.get(ExpressApp);
const appInstance = expressApp.create();
const config = Container.get(Config);

appInstance.listen(config.port);

logger.info(`started on port ${config.port}`);
