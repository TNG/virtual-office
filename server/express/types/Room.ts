import * as t from "io-ts";
import { RoomLinkCodec } from "./RoomLink";
import { SlackNotificationCodec } from "./RoomLegacy";

export const RoomCodec = t.intersection([
  t.type({
    name: t.string,
  }),
  t.partial({
    meetingId: t.string,
    description: t.string,
    joinUrl: t.string,
    titleUrl: t.string,
    icon: t.string,
    roomLinks: t.array(RoomLinkCodec),
    slackNotification: SlackNotificationCodec,
  }),
]);
export type Room = t.TypeOf<typeof RoomCodec>;

export const RoomWithMeetingIdCodec = t.intersection([
  RoomCodec,
  t.type({
    meetingId: t.string,
  }),
]);
export type RoomWithMeetingId = t.TypeOf<typeof RoomWithMeetingIdCodec>;
