import { RoomLink, RoomLinkCodec } from "./RoomLink";
import { MarkRequired } from "ts-essentials";
import * as t from "io-ts";

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

const SlackNotificationCodec = t.intersection([
  t.type({
    channelId: t.string,
  }),
  t.partial({
    notificationInterval: t.number,
  }),
]);
export { SlackNotificationCodec };

export const RoomLegacyCodec = t.intersection([
  t.type({
    name: t.string,
    roomId: t.string,
  }),
  t.partial({
    meetingId: t.string,
    subtitle: t.string,
    description: t.string,
    joinUrl: t.string,
    titleUrl: t.string,
    temporary: t.boolean,
    links: t.array(RoomLinkCodec),
    groupId: t.string,
    icon: t.string,
    slackNotification: SlackNotificationCodec,
  }),
]);
export type RoomLegacy = t.TypeOf<typeof RoomLegacyCodec>;

export interface RoomWithMeetingId extends RoomLegacy {
  meetingId: string;
}

export type RoomWithSlackNotification = MarkRequired<RoomWithMeetingId, "slackNotification">;

export const hasSlackNotifications = (room: RoomLegacy): room is RoomWithSlackNotification => !!room.slackNotification;
