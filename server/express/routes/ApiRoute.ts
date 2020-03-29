import { Service } from "typedi";
import { ExpressRoute } from "./ExpressRoute";
import { Router } from "express";
import { MonitoringRoute } from "./MonitoringRoute";

@Service()
export class ApiRoute implements ExpressRoute {
  constructor(private readonly monitoringRoute: MonitoringRoute) {}
  public router(): Router {
    const router = Router();

    router.use("/monitoring", this.monitoringRoute.router());

    return router;
  }
}
