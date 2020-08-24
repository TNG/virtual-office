import { Service } from "typedi";
import { ExpressRoute } from "./ExpressRoute";
import { Router } from "express";
import passport from "passport";
import { Config } from "../../Config";
import { Strategy as SlackStrategy } from "passport-slack";
import { User } from "../types/User";
import { KnownUsersService } from "../../services/KnownUsersService";
import OAuth2Strategy from "passport-oauth2";
import axios from "axios";

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
    type: "slack",
    id,
    imageUrl,
    name,
    email,
  };
}

function adaptZoomUser(profile: any): User {
  return {
    type: "zoom",
    id: profile.id,
    imageUrl: profile.pic_url,
    name: `${profile.first_name} ${profile.last_name}`,
    email: profile.email,
  };
}

@Service()
export class AuthRoute implements ExpressRoute {
  constructor(readonly config: Config, readonly knownUsersService: KnownUsersService) {
    const slackConfig = config.slack;
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
    const zoomConfig = config.zoom;
    passport.use(
      new OAuth2Strategy(
        {
          authorizationURL: "https://zoom.us/oauth/authorize",
          tokenURL: "https://zoom.us/oauth/token",
          clientID: zoomConfig.clientId,
          clientSecret: zoomConfig.secret,
          callbackURL: zoomConfig.callbackURL,
          scope: ["user_profile"],
        },
        function (accessToken: string, refreshToken: string, profile: any, cb: any) {
          axios
            .get("https://api.zoom.us/v2/users/me", { headers: { Authorization: `Bearer ${accessToken}` } })
            .then((result) => {
              cb(undefined, adaptZoomUser(result.data));
            })
            .catch((error) => cb(error));
        }
      )
    );
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

    router.get("/auth/zoom", passport.authenticate("oauth2"));

    router.get("/auth/zoom/callback", (req, res, next) => {
      passport.authenticate("oauth2", (err, profile) => {
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
