import { RoomConfig } from "./Room";
import { Group } from "./Group";
import { Schedule } from "./Schedule";

export interface ConfigOptions {
  rooms: RoomConfig[];
  groups: Group[];
  schedule?: Schedule;
}
