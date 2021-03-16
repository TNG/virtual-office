import * as t from "io-ts";
import { GroupCodec } from "./Group";
import { RoomCodec } from "./Room";

const SessionInterfaceCodec = t.intersection([
  t.type({
    type: t.union([t.literal("GROUP_SESSION"), t.literal("ROOM_SESSION")]),
    start: t.string,
    end: t.string,
  }),
  t.partial({
    trackId: t.string,
  }),
]);

const GroupSessionCodec = t.intersection([
  SessionInterfaceCodec,
  t.type({
    type: t.literal("GROUP_SESSION"),
    group: GroupCodec,
  }),
]);
export type GroupSession = t.TypeOf<typeof GroupSessionCodec>;

const RoomSessionCodec = t.intersection([
  SessionInterfaceCodec,
  t.type({
    type: t.literal("ROOM_SESSION"),
    room: RoomCodec,
  }),
]);
export type RoomSession = t.TypeOf<typeof RoomSessionCodec>;

export const SessionCodec = t.union([GroupSessionCodec, RoomSessionCodec]);
export type Session = t.TypeOf<typeof SessionCodec>;
