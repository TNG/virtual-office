import { RoomConfig } from "./Room";
import { Group } from "./Group";
import { ClientConfig } from "./ClientConfig";

export interface ConfigOptions {
  rooms: RoomConfig[];
  groups: Group[];
  clientConfig?: ClientConfig;
}
