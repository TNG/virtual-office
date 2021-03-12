import { RoomConfig } from "./Room";
import { GroupLegacy } from "./GroupLegacy";
import { Schedule } from "./Schedule";

export interface ConfigOptions {
  rooms: RoomConfig[];
  groups: GroupLegacy[];
  schedule?: Schedule;
}
