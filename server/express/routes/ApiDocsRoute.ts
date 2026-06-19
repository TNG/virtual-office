import { Request, Response, Router } from "express";
import swaggerUi from "swagger-ui-express";
import { readFileSync } from "fs";
import { join } from "path";
import { ExpressRoute } from "./ExpressRoute.js";
import { Service } from "typedi";
import { getAdminLoggedInMiddleware } from "../middleware/getAdminLoggedInMiddleware.js";
import { Config } from "../../Config.js";
import { findRootDir } from "../utils/findRootDir.js";

const apiJsonPath = join(findRootDir(), "server", "express", "routes", "api.json");
const apiJson = JSON.parse(readFileSync(apiJsonPath, "utf-8"));

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

