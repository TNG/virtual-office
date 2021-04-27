import * as t from "io-ts";

import { GroupLegacyCodec } from "./GroupLegacy";
import { ScheduleLegacyCodec } from "./ScheduleLegacy";
import { RoomConfigLegacyCodec } from "./RoomLegacy";

export const OfficeConfigLegacyCodec = t.intersection([
  t.type({
    rooms: t.array(RoomConfigLegacyCodec),
    groups: t.array(GroupLegacyCodec),
  }),
  t.partial({
    schedule: ScheduleLegacyCodec,
  }),
]);
export type OfficeConfigLegacy = t.TypeOf<typeof OfficeConfigLegacyCodec>;
