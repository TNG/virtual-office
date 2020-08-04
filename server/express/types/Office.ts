import { Group } from "./Group";
import { Room } from "./Room";
import { Schedule } from "./Schedule";

export interface Office {
  rooms: Room[];
  groups: Group[];
  schedule?: Schedule;
}
