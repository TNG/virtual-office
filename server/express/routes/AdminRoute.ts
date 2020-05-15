import basicAuth, { IBasicAuthedRequest } from "express-basic-auth";

import { ExpressRoute } from "./ExpressRoute";
import { RequestHandler, Router } from "express";
import { logger } from "../../log";
import { MeetingParticipantsService } from "../../services/MeetingParticipantsService";
import { OfficeService } from "../../services/OfficeService";
import { Config } from "../../Config";
import { Service } from "typedi";

@Service()
export class AdminRoute implements ExpressRoute {
  constructor(
    private readonly roomsService: MeetingParticipantsService,
    private readonly officeService: OfficeService,
    private config: Config
  ) {}

  router(): Router {
    const router = Router();

    const loginMiddleware = this.getAdminLoggedInMiddleware();

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
      res
        .json({
          message:
            "Please make sure to also update your deployment. Your changes will only persist until the next restart.",
        })
        .status(200);
    });

    return router;
  }

  private getAdminLoggedInMiddleware(): RequestHandler {
    const credentials = this.config.adminEndpointsCredentials;
    if (credentials) {
      return basicAuth({ users: { [credentials.username]: credentials.password } });
    }
    return (req, res, next) => next();
  }
}
