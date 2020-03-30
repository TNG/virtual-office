import { Service } from "typedi";
import { Socket } from "socket.io";
import { logger } from "../log";
import { Server } from "http";
import { RoomsService } from "../services/RoomsService";
import { ExpressApp } from "./ExpressApp";
import sharedSession from "express-socket.io-session";

@Service({ multiple: false })
export class WebSocketController {
  private socket?: Socket = undefined;

  constructor(private readonly roomsService: RoomsService, private readonly expressApp: ExpressApp) {}

  init(server: Server) {
    this.socket = this.createSocket(server);

    this.roomsService.listen((event) => {
      this.socket.emit("notify", event);
    });
  }

  private createSocket(server: Server): Socket {
    const socket: Socket = require("socket.io")(server, {
      path: "/api/updates",
    });
    socket.use(sharedSession(this.expressApp.expressSession, { autoSave: true }));
    socket.on("connection", function (socket: any) {
      const session = socket.handshake.session;
      if (!session.currentUser) {
        socket.disconnect();
      }

      logger.trace(`createSocket - new client socket connection => sending current state`);
      socket.on("disconnect", () => {
        logger.trace(`createSocket - client socket connection disconnected`);
      });
    });

    return socket;
  }
}
