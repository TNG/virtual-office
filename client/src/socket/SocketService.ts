import io from "socket.io-client";
import { fromEvent, Observable } from "rxjs";
import { OfficeWithBlocks } from "../../../server/types/OfficeWithBlocks";
import { ClientConfig } from "../../../server/types/ClientConfig";
import { Meeting } from "../../../server/types/Meeting";

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

  public onOffice(): Observable<OfficeWithBlocks> {
    return fromEvent(this.socket, "office");
  }

  public onClientConfig(): Observable<ClientConfig> {
    return fromEvent(this.socket, "clientConfig");
  }

  public onInit(): Observable<{ office: OfficeWithBlocks; meetings: Meeting[]; config: ClientConfig }> {
    return fromEvent(this.socket, "init");
  }

  public disconnect(): void {
    this.socket.disconnect();
  }
}
