import { NextFunction, Request, Response } from "express";

export default function ensureLoggedIn(req: Request, res: Response, next: NextFunction) {
  const session = (req as any).session;
  const currentUser = session.currentUser;

  if (!currentUser) {
    res.status(401).end();
    next("router");
    return;
  }
  next();
}
