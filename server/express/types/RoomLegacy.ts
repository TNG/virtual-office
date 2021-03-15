import { RoomLinkCodec } from "./RoomLink";
import * as t from "io-ts";

export const SlackNotificationCodec = t.intersection([
  t.type({
    channelId: t.string,
  }),
  t.partial({
    notificationInterval: t.number,
  }),
]);

const RoomWithoutIdCodec = t.intersection([
  t.type({
    name: t.string,
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
export type RoomWithoutId = t.TypeOf<typeof RoomWithoutIdCodec>;

export const RoomConfigLegacyCodec = t.intersection([
  RoomWithoutIdCodec,
  t.partial({
    roomId: t.string,
  }),
]);
export type RoomConfigLegacy = t.TypeOf<typeof RoomConfigLegacyCodec>;

export const RoomLegacyCodec = t.intersection([
  RoomWithoutIdCodec,
  t.type({
    roomId: t.string,
  }),
]);
export type RoomLegacy = t.TypeOf<typeof RoomLegacyCodec>;

const RoomWithMeetingIdCodec = t.intersection([
  RoomLegacyCodec,
  t.type({
    meetingId: t.string,
  }),
]);
export type RoomWithMeetingId = t.TypeOf<typeof RoomWithMeetingIdCodec>;

const RoomWithSlackNotificationCodec = t.intersection([
  RoomWithMeetingIdCodec,
  t.type({
    slackNotification: SlackNotificationCodec,
  }),
]);
export type RoomWithSlackNotification = t.TypeOf<typeof RoomWithSlackNotificationCodec>;

export const hasSlackNotifications = (room: RoomLegacy): room is RoomWithSlackNotification => !!room.slackNotification;
