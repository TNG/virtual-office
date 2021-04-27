import * as t from "io-ts";
import { Block, BlockConfigCodec } from "./Block";

export const OfficeWithBlocksConfigCodec = t.type({
  version: t.literal("2"),
  blocks: t.array(BlockConfigCodec),
});
export type OfficeWithBlocksConfig = t.TypeOf<typeof OfficeWithBlocksConfigCodec>;
export type OfficeWithBlocksDb = Omit<OfficeWithBlocksConfig, "blocks"> & { id: string; blocks: string[] };
export type OfficeWithBlocks = Omit<OfficeWithBlocksConfig, "blocks"> & { id: string; blocks: Block[] };
