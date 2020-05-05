import { RoomLink } from "./RoomLink";

export interface Room {
  id: string;
  name: string;
  subtitle?: string;
  titleLink?: string;
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
