import { Request, Response, Router } from "express";
import * as swaggerUi from "swagger-ui-express";
import * as apiJson from "./api.json";
import { ExpressRoute } from "./ExpressRoute";
import { Service } from "typedi";

@Service()
export class ApiDocsRoute implements ExpressRoute {
  public router(): Router {
    const router = Router();
    router.use("/api-docs", swaggerUi.serve, swaggerUi.setup(apiJson));

    router.get("/api.json", (req: Request, res: Response) => {
      res.json(apiJson);
    });
    return router;
  }
}
