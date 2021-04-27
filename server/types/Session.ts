import * as t from "io-ts";
import { Group, GroupConfigCodec } from "./Group";
import { Room, RoomConfigCodec } from "./Room";

const SessionInterfaceConfigCodec = t.intersection([
  t.type({
    type: t.union([t.literal("GROUP_SESSION"), t.literal("ROOM_SESSION")]),
    start: t.string,
    end: t.string,
  }),
  t.partial({
    trackName: t.string,
  }),
]);

const GroupSessionConfigCodec = t.intersection([
  SessionInterfaceConfigCodec,
  t.type({
    type: t.literal("GROUP_SESSION"),
    group: GroupConfigCodec,
  }),
]);
export type GroupSessionConfig = t.TypeOf<typeof GroupSessionConfigCodec>;
export type GroupSessionDb = Omit<GroupSessionConfig, "group"> & { id: string; group: string };
export type GroupSession = Omit<GroupSessionConfig, "group"> & { id: string; group: Group };

export const RoomSessionConfigCodec = t.intersection([
  SessionInterfaceConfigCodec,
  t.type({
    type: t.literal("ROOM_SESSION"),
    room: RoomConfigCodec,
  }),
]);
export type RoomSessionConfig = t.TypeOf<typeof RoomSessionConfigCodec>;
export type RoomSessionDb = Omit<RoomSessionConfig, "room"> & { id: string; room: string };
export type RoomSession = Omit<RoomSessionConfig, "room"> & { id: string; room: Room };

export const SessionConfigCodec = t.union([GroupSessionConfigCodec, RoomSessionConfigCodec]);
export type SessionConfig = t.TypeOf<typeof SessionConfigCodec>;
export type SessionDb = GroupSessionDb | RoomSessionDb;
export type Session = GroupSession | RoomSession;
