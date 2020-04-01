import { NextFunction, Request, Response } from "express";
import { Container } from "typedi";
import { Config } from "../../Config";

function isLoggedIn(req: Request): boolean {
  const session = (req as any).session;
  const currentUser = session.currentUser;

  return !!currentUser;
}

export default function ensureLoggedIn(req: Request, res: Response, next: NextFunction) {
  const disableAuth = Container.get(Config).disableAuthOnApi;
  if (!isLoggedIn(req) && !disableAuth) {
    res.status(401).end();
    next("router");
    return;
  }
  next();
}
