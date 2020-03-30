import { MeetingParticipant } from "../types/MeetingParticipant";
import { User } from "../types/User";

export function enrichParticipant(participant: MeetingParticipant, user: User): MeetingParticipant {
  return {
    ...participant,
    email: participant.email || user.email,
    imageUrl: participant.imageUrl || user.imageUrl,
  };
}
