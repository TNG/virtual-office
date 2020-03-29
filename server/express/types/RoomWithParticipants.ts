import { Room } from "./Room";
import { MeetingParticipant } from "./MeetingParticipant";

export interface RoomWithParticipants extends Room {
  participants: MeetingParticipant[];
}
