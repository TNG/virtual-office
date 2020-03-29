import io from "socket.io-client";
import { fromEvent, Observable } from "rxjs";

export class SocketService {
  private socket: SocketIOClient.Socket = {} as SocketIOClient.Socket;

  public init(): SocketService {
    this.socket = io(process.env.REACT_APP_BACKEND_API!!, { path: "/api/updates" });
    return this;
  }

  // link message event to rxjs data source
  public onNotify(): Observable<any> {
    return fromEvent(this.socket, "notify");
  }

  public disconnect(): void {
    this.socket.disconnect();
  }
}
