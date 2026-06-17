import { ExpressRoute } from "./ExpressRoute.js";
import { Router } from "express";
import { logger } from "../../log.js";
import { MeetingsService } from "../../services/MeetingsService.js";
import { OfficeService } from "../../services/OfficeService.js";
import { Config } from "../../Config.js";
import { Service } from "typedi";
import { getAdminLoggedInMiddleware } from "../middleware/getAdminLoggedInMiddleware.js";
import { ClientConfigService } from "../../services/ClientConfigService.js";
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
    router.post("/replaceOffice", loginMiddleware, (req: any, res) => {
      logger.info({ user: req.auth.user, data: req.body }, "replacing office");
      this.officeService.replaceOfficeWith(req.body);

      sendNotPersistentResponse(res);
    });
    router.patch("/clientConfig", loginMiddleware, (req: any, res) => {
      logger.info({ user: req.auth.user, data: req.body }, "update clientConfig");

      this.clientConfigService.updateClientConfig(req.body);
      sendNotPersistentResponse(res);
    });
    router.post("/clearAllParticipants", loginMiddleware, (req: any, res) => {
      logger.info("clearing all participants");
      this.roomsService.clearAllParticipants();
      res.sendStatus(200);
    });

    return router;
  }
}
