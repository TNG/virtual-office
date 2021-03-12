import { GroupLegacy } from "./GroupLegacy";
import { RoomLegacy } from "./RoomLegacy";
import { Schedule } from "./Schedule";

export interface OfficeLegacy {
  rooms: RoomLegacy[];
  groups: GroupLegacy[];
  schedule?: Schedule;
}
