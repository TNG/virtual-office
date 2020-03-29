import express, { Express } from "express";
import cors from "cors";
import { Service } from "typedi";
import session from "express-session";
import bodyParser = require("body-parser");
import passport from "passport";

import { ContentRoute } from "./routes/ContentRoute";
import { AuthRoute } from "./routes/AuthRoute";
import exceptionHandler from "./middleware/exceptionHandler";

@Service()
export class ExpressApp {
  constructor(private readonly contentRoute: ContentRoute, private readonly authRoute: AuthRoute) {}

  public create(): Express {
    const app = express();
    app.set("trust proxy", true);
    app.use(cors());
    app.use(bodyParser.json());
    app.use(session({ secret: "secret" }));
    app.use(passport.initialize());
    app.use(passport.session());
    app.use("/", this.contentRoute.router());
    app.use("/", this.authRoute.router());
    app.use(exceptionHandler);

    return app;
  }
}
