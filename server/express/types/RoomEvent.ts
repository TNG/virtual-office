import { MeetingParticipant } from "./MeetingParticipant";

export type EventType = "join" | "leave" | "update";

export type EventListener = (event: RoomEvent) => void;

export interface RoomEvent {
  type: EventType;
  participant: MeetingParticipant;
  roomId: string;
}
