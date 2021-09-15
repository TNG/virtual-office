import { RoomLink } from "./RoomLink";
import { MarkRequired } from "ts-essentials";

interface RoomWithoutId {
  meetingId?: string;
  name: string;
  subtitle?: string;
  description?: string;
  joinUrl?: string;
  titleUrl?: string;
  temporary?: boolean;
  links?: RoomLink[];
  groupId?: string;
  icon?: string;
  slackNotification?: {
    channelId: string;
    notificationInterval?: number;
  };
  fullWidth?: boolean;
}

export interface RoomConfig extends RoomWithoutId {
  roomId?: string;
}

export interface Room extends RoomWithoutId {
  roomId: string;
}

export interface RoomWithMeetingId extends Room {
  meetingId: string;
}

export type RoomWithSlackNotification = MarkRequired<RoomWithMeetingId, "slackNotification">;

export const hasSlackNotifications = (room: Room): room is RoomWithSlackNotification => !!room.slackNotification;
