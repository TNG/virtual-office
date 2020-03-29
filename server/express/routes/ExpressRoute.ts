import { Router } from "express";

export interface ExpressRoute {
  router(): Router;
}
