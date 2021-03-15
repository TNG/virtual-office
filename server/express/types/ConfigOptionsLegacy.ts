import * as t from "io-ts";

import { GroupLegacyCodec } from "./GroupLegacy";
import { ScheduleCodec } from "./Schedule";
import { RoomConfigLegacyCodec } from "./RoomLegacy";

export const ConfigOptionsLegacyCodec = t.intersection([
  t.type({
    rooms: t.array(RoomConfigLegacyCodec),
    groups: t.array(GroupLegacyCodec),
  }),
  t.partial({
    schedule: ScheduleCodec,
  }),
]);
export type ConfigOptionsLegacy = t.TypeOf<typeof ConfigOptionsLegacyCodec>;
