import { RoomLink } from "./RoomLink";

export interface Room {
  id: string;
  name: string;
  joinUrl?: string;
  temporary?: boolean;
  links?: RoomLink[];
  group?: string;
  icon?: string;
  slackNotification?: {
    channelId: string;
    notificationInterval?: number;
  };
}
