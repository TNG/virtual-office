import io from "socket.io-client";
import { fromEvent, Observable } from "rxjs";
import { OfficeLegacy } from "../../../server/express/types/OfficeLegacy";
import { Meeting } from "../../../server/express/types/Meeting";
import { ClientConfig } from "../../../server/express/types/ClientConfig";

export class SocketService {
  private socket: SocketIOClient.Socket = {} as SocketIOClient.Socket;

  public init(): SocketService {
    this.socket = io({ path: "/api/updates" });
    this.socket.on("unauthenticated", () => {
      document.location.reload();
    });
    return this;
  }

  // link message event to rxjs data source
  public onNotify(): Observable<any> {
    return fromEvent(this.socket, "notify");
  }

  public onOffice(): Observable<OfficeLegacy> {
    return fromEvent(this.socket, "office");
  }

  public onClientConfig(): Observable<ClientConfig> {
    return fromEvent(this.socket, "clientConfig");
  }

  public onInit(): Observable<{ office: OfficeLegacy; meetings: Meeting[]; config: ClientConfig }> {
    return fromEvent(this.socket, "init");
  }

  public disconnect(): void {
    this.socket.disconnect();
  }
}
