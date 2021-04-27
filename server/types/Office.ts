import * as t from "io-ts";
import { OfficeWithBlocks, OfficeWithBlocksConfigCodec } from "./OfficeWithBlocks";
import { OfficeConfigLegacyCodec } from "./legacyTypes/OfficeConfigLegacy";
import { OfficeLegacy } from "./legacyTypes/OfficeLegacy";

export const OfficeConfigCodec = t.union([OfficeWithBlocksConfigCodec, OfficeConfigLegacyCodec]);
export type OfficeConfig = t.TypeOf<typeof OfficeConfigCodec>;

export type Office = OfficeWithBlocks | OfficeLegacy;
