import io from "socket.io-client";
import { fromEvent, Observable } from "rxjs";
import { RoomWithParticipants } from "../../../server/express/types/RoomWithParticipants";

export class SocketService {
  private socket: SocketIOClient.Socket = {} as SocketIOClient.Socket;

  public init(): SocketService {
    const basePath = process.env.NODE_ENV === "production" ? "/" : process.env.REACT_APP_BACKEND_API!!;
    this.socket = io(basePath, { path: "/api/updates" });
    this.socket.on("unauthenticated", () => {
      document.location.reload();
    });
    return this;
  }

  // link message event to rxjs data source
  public onNotify(): Observable<any> {
    return fromEvent(this.socket, "notify");
  }

  public onRooms(): Observable<RoomWithParticipants[]> {
    return fromEvent(this.socket, "rooms");
  }

  public disconnect(): void {
    this.socket.disconnect();
  }
}
