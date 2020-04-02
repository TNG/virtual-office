import express, { Express, static as serveStatic } from "express";
import cors from "cors";
import { Service } from "typedi";
import session from "express-session";
import passport from "passport";
import { Server } from "http";
import { Socket } from "socket.io";
import sharedSession from "express-socket.io-session";
import bodyParser = require("body-parser");

import { AuthRoute } from "./routes/AuthRoute";
import exceptionHandler from "./middleware/exceptionHandler";
import { ApiDocsRoute } from "./routes/ApiDocsRoute";
import { ApiRoute } from "./routes/ApiRoute";
import { findRootDir } from "./utils/findRootDir";
import { Config } from "../Config";

@Service()
export class ExpressApp {
  constructor(
    private readonly authRoute: AuthRoute,
    private readonly apiRoute: ApiRoute,
    private readonly apiDocsRoute: ApiDocsRoute,
    private readonly config: Config
  ) {}

  private readonly expressSession = session({
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
    app.use(passport.initialize());
    app.use(passport.session());
    app.use(this.expressSession);

    app.use("/", this.authRoute.router());
    app.use("/", this.apiDocsRoute.router());
    app.use("/api", this.apiRoute.router());

    const rootDir = await findRootDir();
    app.use("/", serveStatic(`${rootDir}/client/build`));
    app.use(exceptionHandler);

    return app;
  }

  public updateWebsocket(server: Server): Socket {
    const socket: Socket = require("socket.io")(server, {
      path: "/api/updates",
      pingInterval: 5000,
      pingTimeout: 5000,
    });
    socket.use(sharedSession(this.expressSession, { autoSave: true }));
    return socket;
  }
}
