import * as t from "io-ts";
import { OfficeLegacyCodec } from "./OfficeLegacy";
import { SessionCodec } from "./Session";
import { GroupCodec } from "./Group";

const TrackCodec = t.type({
  name: t.string,
});

const BlockInterfaceCodec = t.type({
  type: t.union([t.literal("GROUP_BLOCK"), t.literal("SCHEDULE_BLOCK")]),
});

const GroupBlockCodec = t.intersection([
  BlockInterfaceCodec,
  t.type({
    type: t.literal("GROUP_BLOCK"),
    group: GroupCodec,
  }),
]);

const ScheduleBlockCodec = t.intersection([
  BlockInterfaceCodec,
  t.type({
    type: t.literal("SCHEDULE_BLOCK"),
    tracks: t.array(TrackCodec),
    sessions: t.array(SessionCodec),
  }),
]);

const BlockCodec = t.union([GroupBlockCodec, ScheduleBlockCodec]);

export const OfficeWithBlocksCodec = t.type({
  version: t.literal("2"),
  blocks: t.array(BlockCodec),
});
export type OfficeWithBlocks = t.TypeOf<typeof OfficeWithBlocksCodec>;

export const OfficeCodec = t.union([OfficeWithBlocksCodec, OfficeLegacyCodec]);
export type Office = t.TypeOf<typeof OfficeCodec>;
