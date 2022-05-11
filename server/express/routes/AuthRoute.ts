import { Service } from "typedi";
import { ExpressRoute } from "./ExpressRoute";
import { Router } from "express";
import passport from "passport";
import { Config } from "../../Config";
import { Strategy as SlackStrategy } from "passport-slack-oauth2";
import { BasicStrategy } from "passport-http";
import { User } from "../types/User";
import { KnownUsersService } from "../../services/KnownUsersService";
import { logger } from "../../log";

passport.serializeUser(function (user, done) {
  done(null, user);
});

passport.deserializeUser(function (user, done) {
  done(null, user as User);
});

function adaptSlackUser(profile: any): User {
  const {
    id,
    displayName: name,
    user: { email, image_48: imageUrl },
  } = profile;

  return {
    id,
    imageUrl,
    name,
    email,
  };
}

@Service()
export class AuthRoute implements ExpressRoute {
  constructor(readonly config: Config, readonly knownUsersService: KnownUsersService) {
    const authConfig = config.authConfig;
    if (authConfig?.type === "slack") {
      logger.info("Using slack strategy");
      passport.use(
        new SlackStrategy(
          {
            clientID: authConfig.clientId,
            clientSecret: authConfig.secret,
            callbackURL: authConfig.callbackURL,
            scope: ["identity.basic", "identity.email", "identity.avatar"],
          },
          (accessToken: string, refreshToken: string, profile: any, cb: any) => {
            const user = adaptSlackUser(profile);
            return cb(undefined, user);
          }
        )
      );
    } else if (authConfig?.type === "basic") {
      logger.info("Using basic strategy");
      passport.use(
        new BasicStrategy(function (username, password, cb) {
          console.log(username, password, authConfig);
          if (username === authConfig.username && password === authConfig.password) {
            cb(undefined, { type: "basic" });
          }
          cb(undefined, false);
        })
      );
    }
  }

  router(): Router {
    const router = Router();

    router.get("/auth/slack", passport.authenticate("Slack"));

    router.get("/auth/slack/callback", (req, res, next) => {
      passport.authenticate("Slack", (err, profile) => {
        if (err || !profile) {
          const message = (err && err.message) || "Unknown error";
          return res.redirect(`/?error=${encodeURIComponent(message)}`);
        }

        this.knownUsersService.add(profile);
        res.cookie("currentUser", JSON.stringify(profile), {
          signed: true,
          maxAge: this.config.cookieMaxAgeMs,
          httpOnly: true,
        });

        return res.redirect("/");
      })(req, res, next);
    });

    router.get("/logout", (req, res) => {
      res.cookie("currentUser", {}, { maxAge: 0 });
      return res.redirect("/");
    });

    return router;
  }
}
