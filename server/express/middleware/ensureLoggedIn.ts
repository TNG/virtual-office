import { NextFunction, Request, Response } from "express";

function isLoggedIn(req: Request): boolean {
  const session = (req as any).session;
  const currentUser = session.currentUser;

  return !!currentUser;
}

export default function ensureLoggedIn(req: Request, res: Response, next: NextFunction) {
  if (!isLoggedIn(req)) {
    res.status(401).end();
    next("router");
    return;
  }
  next();
}
