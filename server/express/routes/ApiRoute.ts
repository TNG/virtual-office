import { Service } from "typedi";
import { ExpressRoute } from "./ExpressRoute.js";
import { Router } from "express";
import { MonitoringRoute } from "./MonitoringRoute.js";
import ensureLoggedIn, { AuthenticatedRequest } from "../middleware/ensureLoggedIn.js";
import { ZoomUsWebHookRoute } from "./ZoomUsWebHookRoute.js";
import { OfficeService } from "../../services/OfficeService.js";
import { AdminRoute } from "./AdminRoute.js";
import { GroupJoinService } from "../../services/GroupJoinService.js";
import { MeetingsService } from "../../services/MeetingsService.js";
import { ClientConfigService } from "../../services/ClientConfigService.js";

@Service()
export class ApiRoute implements ExpressRoute {
  constructor(
    private readonly monitoringRoute: MonitoringRoute,
    private readonly officeService: OfficeService,
    private readonly meetingsService: MeetingsService,
    private readonly zoomUsWebHookRoute: ZoomUsWebHookRoute,
    private readonly groupJoinService: GroupJoinService,
    private readonly clientConfigService: ClientConfigService,
    private readonly adminRoute: AdminRoute
  ) {}

  public router(): Router {
    const router = Router();

    router.use("/monitoring", this.monitoringRoute.router());
    router.use("/admin", this.adminRoute.router());

    router.get("/clientConfig", (req, res) => {
      res.json(this.clientConfigService.getClientConfig());
    });

    router.get("/office", ensureLoggedIn, (req, res) => {
      res.json(this.officeService.getOffice());
    });
    router.get("/meeting/:meetingId/participants", ensureLoggedIn, (req, res) => {
      res.json(this.meetingsService.getParticipantsIn(req.params.meetingId));
    });

    router.get("/groups/:groupId/join", ensureLoggedIn, (req, res) => {
      const room = this.groupJoinService.joinRoomFor(req.params.groupId);
      if (!room) {
        res.json({ error: "could not find a room to join for the group" }).status(404);
      } else if (room.joinUrl) {
        res.redirect(room.joinUrl);
      }
    });

    router.get("/me", ensureLoggedIn, (req: AuthenticatedRequest, res) => {
      res.status(200).send(req.currentUser);
    });

    router.use("/", this.zoomUsWebHookRoute.router());

    return router;
  }
}
