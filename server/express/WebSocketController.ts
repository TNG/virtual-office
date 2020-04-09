import { Service } from "typedi";
import { Socket } from "socket.io";
import { logger } from "../log";
import { Server } from "http";
import { RoomsService } from "../services/RoomsService";
import cookieParser from "cookie-parser";
import { Config } from "../Config";
import { KnownUsersService } from "../services/KnownUsersService";

@Service({ multiple: false })
export class WebSocketController {
  private socket?: Socket = undefined;

  constructor(
    private readonly roomsService: RoomsService,
    private readonly config: Config,
    private readonly knownUsersService: KnownUsersService
  ) {}

  init(server: Server) {
    this.socket = this.createSocket(server);

    this.roomsService.listenRoomChange((event) => {
      this.socket.emit("notify", event);
    });
    this.roomsService.listenAllRoomChanges((rooms) => {
      this.socket.emit("rooms", rooms);
    });
  }

  private createSocket(server: Server): Socket {
    const io = require("socket.io");
    const socket = io(server, {
      path: "/api/updates",
      pingInterval: 5000,
      pingTimeout: 5000,
      cookie: false,
    });
    const secureCookieParser = cookieParser(this.config.sessionSecret);

    socket.on("connection", (request: any) => {
      secureCookieParser(request.handshake, {}, () => {});
      const currentUser = request.handshake.signedCookies.currentUser;
      if (!currentUser) {
        socket.to(request.id).emit("unauthenticated");
        request.disconnect(true);
      } else {
        socket.to(request.id).emit("rooms", this.roomsService.getAllRooms());
        this.knownUsersService.add(JSON.parse(currentUser));
      }
      logger.trace(`createSocket - new client socket connection => sending current state`);
      socket.on("disconnect", () => {
        logger.trace(`createSocket - client socket connection disconnected`);
      });
    });

    return socket;
  }
}
