import { Service } from "typedi";
import { ExpressRoute } from "./ExpressRoute";
import { Router } from "express";

@Service()
export class ContentRoute implements ExpressRoute {
  router(): Router {
    const router = Router();

    router.get("/", (req, res) => {
      const session = (req as any).session;
      if (!session.currentUser) {
        res.redirect("/auth/slack");
        return;
      }
      res.status(200).send(JSON.stringify(session.currentUser));
    });

    return router;
  }
}
