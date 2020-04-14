import { Participant } from "../types/Participant";
import { User } from "../types/User";

export function enrichParticipant(participant: Participant, user: User): Participant {
  return {
    ...participant,
    email: participant.email || user.email,
    imageUrl: participant.imageUrl || user.imageUrl,
  };
}
