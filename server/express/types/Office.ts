import * as t from "io-ts";
import { OfficeLegacyCodec } from "./OfficeLegacy";
import { RoomSessionCodec, SessionCodec } from "./Session";
import { GroupCodec } from "./Group";

const TrackCodec = t.type({
  name: t.string,
});
export type Track = t.TypeOf<typeof TrackCodec>;

const BlockInterfaceCodec = t.intersection([
  t.type({
    type: t.union([t.literal("GROUP_BLOCK"), t.literal("SCHEDULE_BLOCK"), t.literal("SESSION_BLOCK")]),
  }),
  t.partial({
    name: t.string,
  }),
]);

export const GroupBlockCodec = t.intersection([
  BlockInterfaceCodec,
  t.type({
    type: t.literal("GROUP_BLOCK"),
    group: GroupCodec,
  }),
]);
export type GroupBlock = t.TypeOf<typeof GroupBlockCodec>;

export const ScheduleBlockCodec = t.intersection([
  BlockInterfaceCodec,
  t.type({
    type: t.literal("SCHEDULE_BLOCK"),
    tracks: t.array(TrackCodec),
    sessions: t.array(SessionCodec),
  }),
]);
export type ScheduleBlock = t.TypeOf<typeof ScheduleBlockCodec>;

export const SessionBlockCodec = t.intersection([
  BlockInterfaceCodec,
  t.type({
    type: t.literal("SESSION_BLOCK"),
    title: t.string,
    sessions: t.array(RoomSessionCodec),
  }),
  t.partial({
    description: t.string,
  }),
]);
export type SessionBlock = t.TypeOf<typeof SessionBlockCodec>;

const BlockCodec = t.union([GroupBlockCodec, ScheduleBlockCodec, SessionBlockCodec]);
export type Block = t.TypeOf<typeof BlockCodec>;

export const OfficeWithBlocksCodec = t.type({
  version: t.literal("2"),
  blocks: t.array(BlockCodec),
});
export type OfficeWithBlocks = t.TypeOf<typeof OfficeWithBlocksCodec>;

export const OfficeCodec = t.union([OfficeWithBlocksCodec, OfficeLegacyCodec]);
export type Office = t.TypeOf<typeof OfficeCodec>;
