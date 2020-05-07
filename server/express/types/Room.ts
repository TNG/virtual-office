import { RoomLink } from "./RoomLink";

export interface Room {
  id: string;
  name: string;
  subtitle?: string;
  description?: string;
  titleLink?: string;
  subtitleLink?: string;
  joinUrl?: string;
  temporary?: boolean;
  links?: RoomLink[];
  groupId?: string;
  icon?: string;
  hasNoZoomRoom?: boolean;
  slackNotification?: {
    channelId: string;
    notificationInterval?: number;
  };
}
