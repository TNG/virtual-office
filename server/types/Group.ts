import * as t from "io-ts";
import { Room, RoomConfigCodec } from "./Room";

export const GroupJoinConfigConfigCodec = t.intersection([
  t.type({
    minimumParticipantCount: t.number,
    title: t.string,
    description: t.string,
  }),
  t.partial({
    subtitle: t.string,
  }),
]);
export type GroupJoinConfigConfig = t.TypeOf<typeof GroupJoinConfigConfigCodec>;
export type GroupJoinConfigDb = GroupJoinConfigConfig & { id: string };
export type GroupJoinConfig = GroupJoinConfigConfig & { id: string };

export const GroupConfigCodec = t.intersection([
  t.type({
    name: t.string,
    rooms: t.array(RoomConfigCodec),
  }),
  t.partial({
    description: t.string,
    groupJoinConfig: GroupJoinConfigConfigCodec,
  }),
]);
export type GroupConfig = t.TypeOf<typeof GroupConfigCodec>;
export type GroupDb = Omit<GroupConfig, "rooms" | "groupJoinConfig"> & {
  id: string;
  rooms: string[];
  groupJoinConfig?: GroupJoinConfig;
};
export type Group = Omit<GroupConfig, "rooms" | "groupJoinConfig"> & {
  id: string;
  rooms: Room[];
  groupJoinConfig?: GroupJoinConfig;
};
