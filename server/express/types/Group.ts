import * as t from "io-ts";
import { GroupJoinConfigCodec } from "./GroupLegacy";
import { RoomCodec } from "./Room";

export const GroupCodec = t.intersection([
  t.type({
    name: t.string,
    rooms: t.array(RoomCodec),
  }),
  t.partial({
    description: t.string,
    groupJoinConfig: GroupJoinConfigCodec,
  }),
]);
export type Group = t.TypeOf<typeof GroupCodec>;
