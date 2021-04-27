import * as t from "io-ts";

export const RoomLinkConfigCodec = t.intersection([
  t.type({
    href: t.string,
    text: t.string,
  }),
  t.partial({
    icon: t.string,
    linkGroup: t.string,
  }),
]);
export type RoomLinkConfig = t.TypeOf<typeof RoomLinkConfigCodec>;
export type RoomLinkDb = RoomLinkConfig & { id: string };
export type RoomLink = RoomLinkConfig & { id: string };

export const SlackNotificationConfigCodec = t.intersection([
  t.type({
    channelId: t.string,
  }),
  t.partial({
    notificationInterval: t.number,
  }),
]);
export type SlackNotificationConfig = t.TypeOf<typeof SlackNotificationConfigCodec>;
export type SlackNotificationDb = SlackNotificationConfig & { id: string };
export type SlackNotification = SlackNotificationConfig & { id: string };

export const RoomConfigCodec = t.intersection([
  t.type({
    name: t.string,
  }),
  t.partial({
    description: t.string,
    joinUrl: t.string,
    titleUrl: t.string,
    icon: t.string,
    roomLinks: t.array(RoomLinkConfigCodec),
    slackNotification: SlackNotificationConfigCodec,
    meetingId: t.string,
  }),
]);
export type RoomConfig = t.TypeOf<typeof RoomConfigCodec>;
export type RoomDb = Omit<RoomConfig, "roomLinks" | "slackNotification"> & {
  id: string;
  roomLinks?: RoomLinkDb[];
  slackNotification?: SlackNotificationDb;
};
export type Room = Omit<RoomConfig, "roomLinks" | "slackNotification"> & {
  id: string;
  roomLinks?: RoomLink[];
  slackNotification?: SlackNotification;
};
