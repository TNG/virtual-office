import { Service } from "typedi";
import { Socket } from "socket.io";
import { logger } from "../log";
import { Server } from "http";
import { RoomsService } from "../services/RoomsService";
import { ExpressApp } from "./ExpressApp";

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
    const socket = this.expressApp.updateWebsocket(server);

    socket.on("connection", (request: any) => {
      const session = request.handshake.session;
      if (!session.currentUser) {
        socket.emit("unauthenticated");
        request.disconnect(true);
      }
      logger.trace(`createSocket - new client socket connection => sending current state`);
      socket.on("disconnect", () => {
        logger.trace(`createSocket - client socket connection disconnected`);
      });
    });

    return socket;
  }
}
