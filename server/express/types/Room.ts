import { RoomLink } from "./RoomLink";

export interface Room {
  id: string;
  name: string;
  joinUrl: string;
  links?: RoomLink[];
  group?: string;
  icon?: string;
}
