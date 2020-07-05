import { Service } from "typedi";
import { Socket } from "socket.io";
import { logger } from "../log";
import { Server } from "http";
import { MeetingsService } from "../services/MeetingsService";
import cookieParser from "cookie-parser";
import { Config } from "../Config";
import { KnownUsersService } from "../services/KnownUsersService";
import { OfficeService } from "../services/OfficeService";
import { ClientConfigService } from "../services/ClientConfigService";

@Service({ multiple: false })
export class WebSocketController {
  private socket?: Socket = undefined;

  constructor(
    private readonly officeService: OfficeService,
    private readonly meetingsService: MeetingsService,
    private readonly config: Config,
    private readonly knownUsersService: KnownUsersService,
    private readonly clientConfigService: ClientConfigService
  ) {}

  init(server: Server) {
    this.socket = this.createSocket(server);

    this.meetingsService.listenParticipantsChange((event) => {
      this.socket.emit("notify", event);
    });
    this.officeService.listenOfficeChanges((office) => {
      this.socket.emit("office", office);
    });
    this.clientConfigService.listenClientConfig((config) => {
      this.socket.emit("clientConfig", config);
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
      if (!currentUser && !this.config.disableAuth) {
        socket.to(request.id).emit("unauthenticated");
        request.disconnect(true);
      } else {
        socket.to(request.id).emit("init", {
          office: this.officeService.getOffice(),
          meetings: this.meetingsService.getAllMeetings(),
          config: this.clientConfigService.getClientConfig(),
        });

        if (currentUser) {
          this.knownUsersService.add(JSON.parse(currentUser));
        }
      }

      logger.trace(`createSocket - new client socket connection => sending current state`);
      request.on("disconnect", () => {
        logger.trace(`createSocket - client socket connection disconnected`);
      });
    });

    return socket;
  }
}
