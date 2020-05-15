import { Group } from "./Group";
import { Room } from "./Room";

export interface Office {
  rooms: Room[];
  groups: Group[];
}
