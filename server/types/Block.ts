import * as t from "io-ts";
import { Group, GroupConfigCodec } from "./Group";
import { RoomSession, RoomSessionConfigCodec, Session, SessionConfigCodec } from "./Session";

const TrackConfigCodec = t.type({
  name: t.string,
});
export type TrackConfig = t.TypeOf<typeof TrackConfigCodec>;
export type TrackDb = TrackConfig & { id: string };
export type Track = TrackConfig & { id: string };

const BlockInterfaceConfigCodec = t.intersection([
  t.type({
    type: t.union([t.literal("GROUP_BLOCK"), t.literal("SCHEDULE_BLOCK"), t.literal("SESSION_BLOCK")]),
  }),
  t.partial({
    name: t.string,
  }),
]);

const GroupBlockConfigCodec = t.intersection([
  BlockInterfaceConfigCodec,
  t.type({
    type: t.literal("GROUP_BLOCK"),
    group: GroupConfigCodec,
  }),
]);
export type GroupBlockConfig = t.TypeOf<typeof GroupBlockConfigCodec>;
export type GroupBlockDb = Omit<GroupBlockConfig, "group"> & { id: string; group: string };
export type GroupBlock = Omit<GroupBlockConfig, "group"> & { id: string; group: Group };

const ScheduleBlockConfigCodec = t.intersection([
  BlockInterfaceConfigCodec,
  t.type({
    type: t.literal("SCHEDULE_BLOCK"),
    sessions: t.array(SessionConfigCodec),
  }),
  t.partial({
    tracks: t.array(TrackConfigCodec),
  }),
]);
export type ScheduleBlockConfig = t.TypeOf<typeof ScheduleBlockConfigCodec>;
export type ScheduleBlockDb = Omit<ScheduleBlockConfig, "sessions" | "tracks"> & {
  id: string;
  sessions: string[];
  tracks?: TrackDb[];
};
export type ScheduleBlock = Omit<ScheduleBlockConfig, "sessions" | "tracks"> & {
  id: string;
  sessions: Session[];
  tracks?: Track[];
};

const SessionBlockConfigCodec = t.intersection([
  BlockInterfaceConfigCodec,
  t.type({
    type: t.literal("SESSION_BLOCK"),
    sessions: t.array(RoomSessionConfigCodec),
    title: t.string,
  }),
]);
export type SessionBlockConfig = t.TypeOf<typeof SessionBlockConfigCodec>;
export type SessionBlockDb = Omit<SessionBlockConfig, "sessions"> & { id: string; sessions: string[] };
export type SessionBlock = Omit<SessionBlockConfig, "sessions"> & {
  id: string;
  sessions: RoomSession[];
};

export const BlockConfigCodec = t.union([GroupBlockConfigCodec, ScheduleBlockConfigCodec, SessionBlockConfigCodec]);
export type BlockConfig = t.TypeOf<typeof BlockConfigCodec>;
export type BlockDb = GroupBlockDb | ScheduleBlockDb | SessionBlockDb;
export type Block = GroupBlock | ScheduleBlock | SessionBlock;
