import { Participant } from "../../../client/src/types/Participant";
import { User } from "../../../client/src/types/User";

export function enrichParticipant(participant: Participant, user: User): Participant {
  return {
    ...participant,
    email: participant.email || user.email,
    imageUrl: participant.imageUrl || user.imageUrl,
  };
}
