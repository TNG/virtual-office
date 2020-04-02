import { Service } from "typedi";
import { ExpressRoute } from "./ExpressRoute";
import { Router } from "express";
import { MonitoringRoute } from "./MonitoringRoute";
import { RoomsService } from "../../services/RoomsService";
import ensureLoggedIn from "../middleware/ensureLoggedIn";
import { ZoomUsWebHookRoute } from "./ZoomUsWebHookRoute";

@Service()
export class ApiRoute implements ExpressRoute {
  constructor(
    private readonly monitoringRoute: MonitoringRoute,
    private readonly roomsService: RoomsService,
    private readonly zoomUsWebHookRoute: ZoomUsWebHookRoute
  ) {}

  public router(): Router {
    const router = Router();

    router.use("/monitoring", this.monitoringRoute.router());

    router.get("/rooms", ensureLoggedIn, (req, res) => {
      res.json(this.roomsService.getAllRooms());
    });
    router.post("/rooms", ensureLoggedIn, (req, res) => {
      const success = this.roomsService.createRoom(req.body);
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

    router.get("/me", (req, res) => {
      const session = (req as any).session;
      if (!session.currentUser) {
        res.sendStatus(401);
        return;
      }
      res.status(200).send(session.currentUser);
    });

    router.use("/", this.zoomUsWebHookRoute.router());

    return router;
  }
}
