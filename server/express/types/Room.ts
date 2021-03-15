import * as t from "io-ts";
import { MeetingCodec } from "./Meeting";
import { RoomLinkCodec } from "./RoomLink";
import { SlackNotificationCodec } from "./RoomLegacy";

export const RoomCodec = t.intersection([
  t.type({
    name: t.string,
    meeting: MeetingCodec,
  }),
  t.partial({
    subtitle: t.string,
    description: t.string,
    joinUrl: t.string,
    titleUrl: t.string,
    icon: t.string,
    roomLinks: t.array(RoomLinkCodec),
    slackNotification: SlackNotificationCodec,
  }),
]);
export type Room = t.TypeOf<typeof RoomCodec>;
