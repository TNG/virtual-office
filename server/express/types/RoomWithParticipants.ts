import { Room } from "./Room";
import { User } from "./User";
import { Participant } from "./Participant";

export interface RoomWithParticipants extends Room {
  participants: Participant[];
}
