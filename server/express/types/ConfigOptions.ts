import { RoomConfig } from "./Room.js";
import { Group } from "./Group.js";
import { Schedule } from "./Schedule.js";

export interface ConfigOptions {
  rooms: RoomConfig[];
  groups: Group[];
  schedule?: Schedule;
}
