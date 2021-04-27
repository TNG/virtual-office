import { NextFunction, Request, Response } from "express";
import { Container } from "typedi";
import { Config } from "../../Config";
import { UserLegacy } from "../../types/legacyTypes/UserLegacy";

function getLoginUser(req: Request): UserLegacy | undefined {
  const userValue = req.signedCookies.currentUser;
  return userValue && JSON.parse(userValue);
}

export default function ensureLoggedIn(req: Request, res: Response, next: NextFunction) {
  const disableAuth = Container.get(Config).disableAuth;
  const loginUser = getLoginUser(req);
  if (!loginUser && !disableAuth) {
    res.status(401).end();
    next("router");
    return;
  }
  if (loginUser) {
    (req as AuthenticatedRequest).currentUser = loginUser;
  }
  next();
}

export interface AuthenticatedRequest extends Request {
  currentUser?: UserLegacy;
}
