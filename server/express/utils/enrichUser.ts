import { MeetingParticipantLegacy } from "../../types/legacyTypes/MeetingLegacy";
import { UserLegacy } from "../../types/legacyTypes/UserLegacy";

export function enrichParticipant(participant: MeetingParticipantLegacy, user: UserLegacy): MeetingParticipantLegacy {
  return {
    ...participant,
    email: participant.email || user.email,
    imageUrl: participant.imageUrl || user.imageUrl,
  };
}
