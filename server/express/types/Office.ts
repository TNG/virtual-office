import { RoomWithParticipants } from "./RoomWithParticipants";
import { Group } from "./Group";

export interface Office {
  rooms: RoomWithParticipants[];
  groups: Group[];
}
