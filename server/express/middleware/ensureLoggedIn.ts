import { NextFunction, Request, Response } from "express";
import { Container } from "typedi";
import { Config } from "../../Config";
import { User } from "../../../client/src/types/User";

function getLoginUser(req: Request): User | undefined {
  const userValue = req.signedCookies.currentUser;
  return userValue && JSON.parse(userValue);
}

export default function ensureLoggedIn(req: Request, res: Response, next: NextFunction) {
  const disableAuth = Container.get(Config).disableAuthOnApi;
  const loginUser = getLoginUser(req);
  if (!loginUser && !disableAuth) {
    res.status(401).end();
    next("router");
    return;
  }
  (req as AuthenticatedRequest).currentUser = loginUser;
  next();
}

export interface AuthenticatedRequest extends Request {
  currentUser: User;
}
