import * as t from "io-ts";

const RoomLinkLegacyCodec = t.intersection([
  t.type({
    href: t.string,
    text: t.string,
  }),
  t.partial({
    icon: t.string,
    linkGroup: t.string,
  }),
]);
export type RoomLinkLegacy = t.TypeOf<typeof RoomLinkLegacyCodec>;

export const SlackNotificationLegacyCodec = t.intersection([
  t.type({
    channelId: t.string,
  }),
  t.partial({
    notificationInterval: t.number,
  }),
]);

const RoomWithoutIdLegacyCodec = t.intersection([
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
    links: t.array(RoomLinkLegacyCodec),
    groupId: t.string,
    icon: t.string,
    slackNotification: SlackNotificationLegacyCodec,
  }),
]);
export type RoomWithoutIdLegacy = t.TypeOf<typeof RoomWithoutIdLegacyCodec>;

export const RoomConfigLegacyCodec = t.intersection([
  RoomWithoutIdLegacyCodec,
  t.partial({
    roomId: t.string,
  }),
]);
export type RoomConfigLegacy = t.TypeOf<typeof RoomConfigLegacyCodec>;

export const RoomLegacyCodec = t.intersection([
  RoomWithoutIdLegacyCodec,
  t.type({
    roomId: t.string,
  }),
]);
export type RoomLegacy = t.TypeOf<typeof RoomLegacyCodec>;

const RoomWithMeetingIdLegacyCodec = t.intersection([
  RoomLegacyCodec,
  t.type({
    meetingId: t.string,
  }),
]);
export type RoomWithMeetingIdLegacy = t.TypeOf<typeof RoomWithMeetingIdLegacyCodec>;

const RoomWithSlackNotificationLegacyCodec = t.intersection([
  RoomWithMeetingIdLegacyCodec,
  t.type({
    slackNotification: SlackNotificationLegacyCodec,
  }),
]);
export type RoomWithSlackNotificationLegacy = t.TypeOf<typeof RoomWithSlackNotificationLegacyCodec>;

export const hasSlackNotifications = (room: RoomLegacy): room is RoomWithSlackNotificationLegacy =>
  !!room.slackNotification;
