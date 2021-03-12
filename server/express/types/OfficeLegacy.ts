import { GroupLegacy } from "./GroupLegacy";
import { Room } from "./Room";
import { Schedule } from "./Schedule";

export interface OfficeLegacy {
  rooms: Room[];
  groups: GroupLegacy[];
  schedule?: Schedule;
}
