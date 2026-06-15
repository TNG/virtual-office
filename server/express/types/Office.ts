import { Group } from "./Group.js";
import { Room } from "./Room.js";
import { Schedule } from "./Schedule.js";

export interface Office {
  rooms: Room[];
  groups: Group[];
  schedule?: Schedule;
}
