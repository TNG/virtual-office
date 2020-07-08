import { IBasicAuthedRequest } from "express-basic-auth";

import { ExpressRoute } from "./ExpressRoute";
import { Router } from "express";
import { logger } from "../../log";
import { MeetingsService } from "../../services/MeetingsService";
import { OfficeService } from "../../services/OfficeService";
import { Config } from "../../Config";
import { Service } from "typedi";
import { getAdminLoggedInMiddleware } from "../middleware/getAdminLoggedInMiddleware";
import { ClientConfigService } from "../../services/ClientConfigService";
import { Response } from "express-serve-static-core";

function sendNotPersistentResponse(res: Response) {
  res
    .json({
      message:
        "Please make sure to also update your deployment. Your changes will only persist until the next restart.",
    })
    .status(200);
}

@Service()
export class AdminRoute implements ExpressRoute {
  constructor(
    private readonly roomsService: MeetingsService,
    private readonly officeService: OfficeService,
    private readonly clientConfigService: ClientConfigService,
    private config: Config
  ) {}

  router(): Router {
    const router = Router();

    const loginMiddleware = getAdminLoggedInMiddleware(this.config);

    router.delete("/rooms/:roomId", loginMiddleware, (req, res) => {
      this.roomsService.endRoom(req.params.roomId);
      res.sendStatus(200);
    });
    router.delete("/rooms/:roomId/:userId", loginMiddleware, (req, res) => {
      this.roomsService.leaveRoom(req.params.roomId, req.params.userId);
      res.sendStatus(200);
    });
    router.post("/replaceOffice", loginMiddleware, (req: IBasicAuthedRequest, res) => {
      logger.info("replacing office", {
        user: req.auth.user,
        data: req.body,
      });
      this.officeService.replaceOfficeWith(req.body);

      sendNotPersistentResponse(res);
    });
    router.patch("/clientConfig", loginMiddleware, (req: IBasicAuthedRequest, res) => {
      logger.info("update clientConfig", {
        user: req.auth.user,
        data: req.body,
      });

      this.clientConfigService.updateClientConfig(req.body);
      sendNotPersistentResponse(res);
    });

    return router;
  }
}
