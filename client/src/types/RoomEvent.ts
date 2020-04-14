import { Participant } from "./Participant";
import { RoomWithParticipants } from "./RoomWithParticipants";

export type RoomEventListener = (event: RoomEvent | ParticipantEvent) => void;

export enum RoomEventType {
  Replace = "room.replace",
}

export interface RoomEvent {
  type: RoomEventType;
  payload: RoomWithParticipants[];
}

export enum ParticipantEventType {
  Join = "participant.join",
  Leave = "participant.leave",
  Update = "participant.update",
}

export interface ParticipantEvent {
  type: ParticipantEventType;
  payload: {
    roomId: string;
    participant: Participant;
  };
}
