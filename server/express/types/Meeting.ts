import { MeetingParticipant } from "./MeetingParticipant";

export interface Meeting {
  meetingId: string;
  participants: MeetingParticipant[];
}
