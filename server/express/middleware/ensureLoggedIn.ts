import { NextFunction, Request, Response } from "express";
import { Container } from "typedi";
import { Config } from "../../Config";
import { User } from "../types/User";
import passport from "passport";
import { logger } from "../../log";

function getLoginUser(req: Request): User | undefined {
  const userValue = req.signedCookies.currentUser;
  return userValue && JSON.parse(userValue);
}

export default function ensureLoggedIn(req: Request, res: Response, next: NextFunction) {
  const config = Container.get(Config);
  const authConfig = config.authConfig;
  if (!authConfig) {
    logger.error("No auth config found!");
    res.status(401).end();
    next("router");
  }
  const loginUser = getLoginUser(req);
  if (loginUser) {
    if (
      (loginUser.id !== "basic" && config.authConfig.type === "basic") ||
      (loginUser.id === "basic" && config.authConfig.type === "slack")
    ) {
      // Log out after auth type change
      res.cookie("currentUser", {}, { maxAge: 0 });
      res.status(401).end();
      next("router");
    } else {
      (req as AuthenticatedRequest).currentUser = loginUser;
      return next();
    }
  }
  if (authConfig.type === "basic") {
    return passport.authenticate("basic", { session: false }, (err, user) => {
      console.log(err, user);
      if (err) {
        next(err);
      } else if (user) {
        res.cookie("currentUser", JSON.stringify({ id: "basic" }), {
          signed: true,
          maxAge: config.cookieMaxAgeMs,
          httpOnly: true,
        });
        next();
      } else {
        res.status(401).end();
        next("router");
      }
    })(req, res, next);
  }
  res.status(401).end();
  next("router");
  return;
}

export interface AuthenticatedRequest extends Request {
  currentUser?: User;
}
