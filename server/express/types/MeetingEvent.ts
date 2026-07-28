import { MeetingParticipant } from "./MeetingParticipant.js";

export type EventType = "join" | "leave" | "update";

export type EventListener = (event: MeetingEvent) => void;

export interface MeetingEvent {
  type: EventType;
  participant: MeetingParticipant;
  meetingId: string;
}
