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

export const hasSlackNotifications = (room: Room): room is MarkRequired<Room, "slackNotification"> =>
  !!room.slackNotification;
