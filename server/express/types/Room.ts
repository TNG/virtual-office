import { RoomLink } from "./RoomLink";

interface RoomWithoutId {
  meetingId: string;
  name: string;
  joinUrl?: string;
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
