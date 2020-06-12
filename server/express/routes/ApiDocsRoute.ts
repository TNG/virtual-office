import { Request, Response, Router } from "express";
import * as swaggerUi from "swagger-ui-express";
import * as apiJson from "./api.json";
import { ExpressRoute } from "./ExpressRoute";
import { Service } from "typedi";
import { getAdminLoggedInMiddleware } from "../middleware/getAdminLoggedInMiddleware";
import { Config } from "../../Config";

@Service()
export class ApiDocsRoute implements ExpressRoute {
  constructor(private readonly config: Config) {}

  public router(): Router {
    const router = Router();
    const loggedInMiddleware = getAdminLoggedInMiddleware(this.config);
    router.use("/api-docs", loggedInMiddleware, swaggerUi.serve, swaggerUi.setup(apiJson));

    router.get("/api.json", loggedInMiddleware, (req: Request, res: Response) => {
      res.json(apiJson);
    });
    return router;
  }
}
