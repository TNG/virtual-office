import { MeetingParticipant } from "./MeetingParticipant.js";

export interface Meeting {
  meetingId: string;
  participants: MeetingParticipant[];
}
