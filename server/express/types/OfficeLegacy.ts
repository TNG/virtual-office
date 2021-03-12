import { Group } from "./Group";
import { Room } from "./Room";
import { Schedule } from "./Schedule";

export interface OfficeLegacy {
  rooms: Room[];
  groups: Group[];
  schedule?: Schedule;
}
