import express, { Express, static as serveStatic } from "express";
import cors from "cors";
import { Service } from "typedi";
import session from "express-session";
import passport from "passport";

import { AuthRoute } from "./routes/AuthRoute";
import exceptionHandler from "./middleware/exceptionHandler";
import { ApiDocsRoute } from "./routes/ApiDocsRoute";
import { ApiRoute } from "./routes/ApiRoute";
import { findRootDir } from "./utils/findRootDir";
import { Config } from "../Config";
import bodyParser = require("body-parser");

@Service()
export class ExpressApp {
  constructor(
    private readonly authRoute: AuthRoute,
    private readonly apiRoute: ApiRoute,
    private readonly apiDocsRoute: ApiDocsRoute,
    private readonly config: Config
  ) {}

  public readonly expressSession = session({
    secret: this.config.sessionSecret,
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: this.config.cookieMaxAgeMs,
    },
  });

  public async create(): Promise<Express> {
    const app = express();
    app.set("trust proxy", true);
    app.use(cors());
    app.use(bodyParser.json());
    app.use(this.expressSession);
    app.use(passport.initialize());
    app.use(passport.session());

    app.use("/", this.authRoute.router());
    app.use("/", this.apiDocsRoute.router());
    app.use("/api", this.apiRoute.router());

    const rootDir = await findRootDir();
    app.use("/", serveStatic(`${rootDir}/client/build`));
    app.use(exceptionHandler);

    return app;
  }
}
