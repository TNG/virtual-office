import { Room } from "./Room";
import { Participant } from "./Participant";

export interface RoomWithParticipants extends Room {
  participants: Participant[];
}
