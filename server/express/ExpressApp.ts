import express, { Express, static as serveStatic } from "express";
import cors from "cors";
import { Service } from "typedi";
import passport from "passport";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";

import { AuthRoute } from "./routes/AuthRoute.js";
import exceptionHandler from "./middleware/exceptionHandler.js";
import { ApiDocsRoute } from "./routes/ApiDocsRoute.js";
import { ApiRoute } from "./routes/ApiRoute.js";
import { findRootDir } from "./utils/findRootDir.js";
import { Config } from "../Config.js";

@Service()
export class ExpressApp {
  constructor(
    private readonly authRoute: AuthRoute,
    private readonly apiRoute: ApiRoute,
    private readonly apiDocsRoute: ApiDocsRoute,
    private readonly config: Config
  ) {}

  public async create(): Promise<Express> {
    const app = express();
    app.set("trust proxy", true);
    app.use(cors());
    app.use(bodyParser.json({ limit: "10mb" }));
    app.use(passport.initialize());
    app.use(cookieParser(this.config.sessionSecret));

    app.use("/", this.authRoute.router());
    app.use("/", this.apiDocsRoute.router());
    app.use("/api", this.apiRoute.router());

    const rootDir = await findRootDir();
    app.use("/", serveStatic(`${rootDir}/client/build`));
    app.use("/login", serveStatic(`${rootDir}/client/build`));
    app.use(exceptionHandler);

    return app;
  }
}
