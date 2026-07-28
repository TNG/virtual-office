import { MeetingParticipant } from "../types/MeetingParticipant.js";
import { User } from "../types/User.js";

export function enrichParticipant(participant: MeetingParticipant, user: User): MeetingParticipant {
  return {
    ...participant,
    email: participant.email || user.email,
    imageUrl: participant.imageUrl || user.imageUrl,
  };
}
