import { Service } from "typedi";
import { ExpressRoute } from "./ExpressRoute";
import { Router } from "express";
import { MonitoringRoute } from "./MonitoringRoute";
import { RoomsService } from "../../services/RoomsService";
import ensureLoggedIn, { AuthenticatedRequest } from "../middleware/ensureLoggedIn";
import { ZoomUsWebHookRoute } from "./ZoomUsWebHookRoute";
import { logger } from "../../log";
import { OfficeService } from "../../services/OfficeService";

@Service()
export class ApiRoute implements ExpressRoute {
  constructor(
    private readonly monitoringRoute: MonitoringRoute,
    private readonly roomsService: RoomsService,
    private readonly officeService: OfficeService,
    private readonly zoomUsWebHookRoute: ZoomUsWebHookRoute
  ) {}

  public router(): Router {
    const router = Router();

    router.use("/monitoring", this.monitoringRoute.router());

    router.get("/office", ensureLoggedIn, (req, res) => {
      res.json(this.officeService.getOffice());
    });
    router.post("/rooms", ensureLoggedIn, (req, res) => {
      // ToDo: Should we even restrict that on the backend API?
      const success = this.roomsService.createRoom({ ...req.body, temporary: true });
      res.sendStatus(success ? 204 : 409);
    });
    router.delete("/rooms/:roomId", ensureLoggedIn, (req, res) => {
      const success = this.roomsService.deleteRoom(req.params.roomId);
      res.sendStatus(success ? 204 : 405);
    });

    router.delete("/admin/rooms/:roomId", ensureLoggedIn, (req, res) => {
      this.roomsService.endRoom(req.params.roomId);
      res.sendStatus(200);
    });
    router.delete("/admin/rooms/:roomId/:userId", ensureLoggedIn, (req, res) => {
      this.roomsService.leaveRoom(req.params.roomId, req.params.userId);
      res.sendStatus(200);
    });
    router.post("/admin/replaceOffice", ensureLoggedIn, (req: AuthenticatedRequest, res) => {
      logger.info({
        message: "replacing office",
        user: req.currentUser.name,
        email: req.currentUser.email,
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

    router.get("/me", ensureLoggedIn, (req: AuthenticatedRequest, res) => {
      res.status(200).send(req.currentUser);
    });

    router.use("/", this.zoomUsWebHookRoute.router());

    return router;
  }
}
