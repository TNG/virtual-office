import { Service } from "typedi";
import { Socket } from "socket.io";
import { logger } from "../log";
import { Server } from "http";

@Service({ multiple: false })
export class WebSocketController {
  private socket?: Socket = undefined;

  init(server: Server) {
    this.socket = this.createSocket(server);
    logger.info("init " + this.socket);
  }

  private createSocket(server: Server): Socket {
    const socket: Socket = require("socket.io")(server, {
      path: "/api/updates",
    });
    socket.on("connection", function (socket: any) {
      logger.trace(`createSocket - new client socket connection => sending current state`);
      socket.on("disconnect", () => {
        logger.trace(`createSocket - client socket connection disconnected`);
      });
    });

    return socket;
  }
}
