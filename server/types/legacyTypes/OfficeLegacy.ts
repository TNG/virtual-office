import { GroupLegacyCodec } from "./GroupLegacy";
import { RoomLegacyCodec } from "./RoomLegacy";
import { ScheduleCodec } from "./Schedule";
import * as t from "io-ts";

export const OfficeLegacyCodec = t.intersection([
  t.type({
    rooms: t.array(RoomLegacyCodec),
    groups: t.array(GroupLegacyCodec),
  }),
  t.partial({
    schedule: ScheduleCodec,
  }),
]);
export type OfficeLegacy = t.TypeOf<typeof OfficeLegacyCodec>;
