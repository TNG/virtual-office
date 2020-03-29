import { ExpressRoute } from "./ExpressRoute";
import { Request, Response, Router } from "express";
import { Service } from "typedi";

@Service()
export class MonitoringRoute implements ExpressRoute {
  constructor() {}
  public router(): Router {
    const router = Router();

    router.get("/health", async (req: Request, res: Response) => {
      res.status(200).send("OK").end();
    });
    return router;
  }
}
