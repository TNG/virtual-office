import { Service } from "typedi";
import { ExpressRoute } from "./ExpressRoute";
import { Router } from "express";
import passport from "passport";
import { Config } from "../../Config";
import { Strategy as SlackStrategy } from "passport-slack";
import { User } from "../types/User";
import { KnownUsersService } from "../../services/KnownUsersService";

passport.serializeUser(function (user, done) {
  done(null, user);
});

passport.deserializeUser(function (user, done) {
  done(null, user);
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
    const slackConfig = config.slack;
    if (slackConfig) {
      passport.use(
        new SlackStrategy(
          {
            clientID: slackConfig.clientId,
            clientSecret: slackConfig.secret,
            callbackURL: slackConfig.callbackURL,
            scope: ["identity.basic", "identity.email", "identity.avatar"],
          },
          (accessToken: string, refreshToken: string, profile: any, cb: any) => {
            const user = adaptSlackUser(profile);
            return cb(undefined, user);
          }
        )
      );
    }
  }

  router(): Router {
    const router = Router();

    router.get("/auth/slack", passport.authenticate("slack"));

    router.get("/auth/slack/callback", (req, res, next) => {
      passport.authenticate("slack", (err, profile) => {
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
