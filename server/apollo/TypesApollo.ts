import * as t from "io-ts";

export const RoomLinkApolloConfigCodec = t.intersection([
  t.type({
    href: t.string,
    text: t.string,
  }),
  t.partial({
    icon: t.string,
    linkGroup: t.string,
  }),
]);
export type RoomLinkApolloConfig = t.TypeOf<typeof RoomLinkApolloConfigCodec>;
export type RoomLinkApolloDb = RoomLinkApolloConfig & { id: string };
export type RoomLinkApollo = RoomLinkApolloConfig & { id: string };

export const SlackNotificationApolloConfigCodec = t.intersection([
  t.type({
    channelId: t.string,
  }),
  t.partial({
    notificationInterval: t.number,
  }),
]);
export type SlackNotificationApolloConfig = t.TypeOf<typeof SlackNotificationApolloConfigCodec>;
export type SlackNotificationApolloDb = SlackNotificationApolloConfig & { id: string };
export type SlackNotificationApollo = SlackNotificationApolloConfig & { id: string };

const RoomApolloConfigCodec = t.intersection([
  t.type({
    name: t.string,
  }),
  t.partial({
    description: t.string,
    joinUrl: t.string,
    titleUrl: t.string,
    icon: t.string,
    roomLinks: t.array(RoomLinkApolloConfigCodec),
    slackNotification: SlackNotificationApolloConfigCodec,
    meetingId: t.string,
  }),
]);
export type RoomApolloConfig = t.TypeOf<typeof RoomApolloConfigCodec>;
export type RoomApolloDb = Omit<RoomApolloConfig, "roomLinks" | "slackNotification"> & {
  id: string;
  roomLinks?: RoomLinkApolloDb[];
  slackNotification?: SlackNotificationApolloDb;
};
export type RoomApollo = Omit<RoomApolloConfig, "roomLinks" | "slackNotification"> & {
  id: string;
  roomLinks?: RoomLinkApollo[];
  slackNotification?: SlackNotificationApollo;
};

export const GroupJoinConfigApolloConfigCodec = t.intersection([
  t.type({
    minimumParticipantCount: t.number,
    title: t.string,
    description: t.string,
  }),
  t.partial({
    subtitle: t.string,
  }),
]);
export type GroupJoinConfigApolloConfig = t.TypeOf<typeof GroupJoinConfigApolloConfigCodec>;
export type GroupJoinConfigApolloDb = GroupJoinConfigApolloConfig & { id: string };
export type GroupJoinConfigApollo = GroupJoinConfigApolloConfig & { id: string };

export const GroupApolloConfigCodec = t.intersection([
  t.type({
    name: t.string,
    rooms: t.array(RoomApolloConfigCodec),
  }),
  t.partial({
    description: t.string,
    groupJoinConfig: GroupJoinConfigApolloConfigCodec,
  }),
]);
export type GroupApolloConfig = t.TypeOf<typeof GroupApolloConfigCodec>;
export type GroupApolloDb = Omit<GroupApolloConfig, "rooms" | "groupJoinConfig"> & {
  id: string;
  rooms: string[];
  groupJoinConfig?: GroupJoinConfigApollo;
};
export type GroupApollo = Omit<GroupApolloConfig, "rooms" | "groupJoinConfig"> & {
  id: string;
  rooms: RoomApollo[];
  groupJoinConfig?: GroupJoinConfigApollo;
};

const SessionInterfaceApolloConfigCodec = t.intersection([
  t.type({
    type: t.union([t.literal("GROUP_SESSION"), t.literal("ROOM_SESSION")]),
    start: t.string,
    end: t.string,
  }),
  t.partial({
    trackName: t.string,
  }),
]);

const GroupSessionApolloConfigCodec = t.intersection([
  SessionInterfaceApolloConfigCodec,
  t.type({
    type: t.literal("GROUP_SESSION"),
    group: GroupApolloConfigCodec,
  }),
]);
export type GroupSessionApolloConfig = t.TypeOf<typeof GroupSessionApolloConfigCodec>;
export type GroupSessionApolloDb = Omit<GroupSessionApolloConfig, "group"> & { id: string; group: string };
export type GroupSessionApollo = Omit<GroupSessionApolloConfig, "group"> & { id: string; group: GroupApollo };

const RoomSessionApolloConfigCodec = t.intersection([
  SessionInterfaceApolloConfigCodec,
  t.type({
    type: t.literal("ROOM_SESSION"),
    room: RoomApolloConfigCodec,
  }),
]);
export type RoomSessionApolloConfig = t.TypeOf<typeof RoomSessionApolloConfigCodec>;
export type RoomSessionApolloDb = Omit<RoomSessionApolloConfig, "room"> & { id: string; room: string };
export type RoomSessionApollo = Omit<RoomSessionApolloConfig, "room"> & { id: string; room: RoomApollo };

const SessionApolloConfigCodec = t.union([GroupSessionApolloConfigCodec, RoomSessionApolloConfigCodec]);
export type SessionApolloConfig = t.TypeOf<typeof SessionApolloConfigCodec>;
export type SessionApolloDb = GroupSessionApolloDb | RoomSessionApolloDb;
export type SessionApollo = GroupSessionApollo | RoomSessionApollo;

const TrackApolloConfigCodec = t.type({
  name: t.string,
});
export type TrackApolloConfig = t.TypeOf<typeof TrackApolloConfigCodec>;
export type TrackApolloDb = TrackApolloConfig & { id: string };
export type TrackApollo = TrackApolloConfig & { id: string };

const BlockInterfaceApolloConfigCodec = t.intersection([
  t.type({
    type: t.union([t.literal("GROUP_BLOCK"), t.literal("SCHEDULE_BLOCK"), t.literal("SESSION_BLOCK")]),
  }),
  t.partial({
    name: t.string,
  }),
]);

const GroupBlockApolloConfigCodec = t.intersection([
  BlockInterfaceApolloConfigCodec,
  t.type({
    type: t.literal("GROUP_BLOCK"),
    group: GroupApolloConfigCodec,
  }),
]);
export type GroupBlockApolloConfig = t.TypeOf<typeof GroupBlockApolloConfigCodec>;
export type GroupBlockApolloDb = Omit<GroupBlockApolloConfig, "group"> & { id: string; group: string };
export type GroupBlockApollo = Omit<GroupBlockApolloConfig, "group"> & { id: string; group: GroupApollo };

const ScheduleBlockApolloConfigCodec = t.intersection([
  BlockInterfaceApolloConfigCodec,
  t.type({
    type: t.literal("SCHEDULE_BLOCK"),
    sessions: t.array(SessionApolloConfigCodec),
  }),
  t.partial({
    tracks: t.array(TrackApolloConfigCodec),
  }),
]);
export type ScheduleBlockApolloConfig = t.TypeOf<typeof ScheduleBlockApolloConfigCodec>;
export type ScheduleBlockApolloDb = Omit<ScheduleBlockApolloConfig, "sessions" | "tracks"> & {
  id: string;
  sessions: string[];
  tracks?: TrackApolloDb[];
};
export type ScheduleBlockApollo = Omit<ScheduleBlockApolloConfig, "sessions" | "tracks"> & {
  id: string;
  sessions: SessionApollo[];
  tracks?: TrackApollo[];
};

const SessionBlockApolloConfigCodec = t.intersection([
  BlockInterfaceApolloConfigCodec,
  t.type({
    type: t.literal("SESSION_BLOCK"),
    sessions: t.array(RoomSessionApolloConfigCodec),
    title: t.string,
  }),
]);
export type SessionBlockApolloConfig = t.TypeOf<typeof SessionBlockApolloConfigCodec>;
export type SessionBlockApolloDb = Omit<SessionBlockApolloConfig, "sessions"> & { id: string; sessions: string[] };
export type SessionBlockApollo = Omit<SessionBlockApolloConfig, "sessions"> & {
  id: string;
  sessions: RoomSessionApollo[];
};

const BlockApolloConfigCodec = t.union([
  GroupBlockApolloConfigCodec,
  ScheduleBlockApolloConfigCodec,
  SessionBlockApolloConfigCodec,
]);
export type BlockApolloConfig = t.TypeOf<typeof BlockApolloConfigCodec>;
export type BlockApolloDb = GroupBlockApolloDb | ScheduleBlockApolloDb | SessionBlockApolloDb;
export type BlockApollo = GroupBlockApollo | ScheduleBlockApollo | SessionBlockApollo;

const OfficeApolloConfigCodec = t.type({
  version: t.literal("2_APOLLO"),
  blocks: t.array(BlockApolloConfigCodec),
});
export type OfficeApolloConfig = t.TypeOf<typeof OfficeApolloConfigCodec>;
export type OfficeApolloDb = Omit<OfficeApolloConfig, "blocks"> & { id: string; blocks: string[] };
export type OfficeApollo = Omit<OfficeApolloConfig, "blocks"> & { id: string; blocks: BlockApollo[] };

const ParticipantApolloCodec = t.intersection([
  t.type({
    id: t.string,
    username: t.string,
  }),
  t.partial({
    email: t.string,
    imageUrl: t.string,
  }),
]);
export type ParticipantApollo = t.TypeOf<typeof ParticipantApolloCodec>;

const MeetingApolloCodec = t.type({
  id: t.string,
  participants: t.array(ParticipantApolloCodec),
});
export type MeetingApollo = t.TypeOf<typeof MeetingApolloCodec>;

const ClientConfigApolloConfigCodec = t.intersection([
  t.type({
    viewMode: t.union([t.literal("list"), t.literal("grid")]),
    theme: t.union([t.literal("dark"), t.literal("light")]),
    sessionStartMinutesOffset: t.number,
  }),
  t.partial({
    backgroundUrl: t.string,
    timezone: t.string,
    title: t.string,
    logoUrl: t.string,
    faviconUrl: t.string,
    hideEndedSessions: t.boolean,
  }),
]);
export type ClientConfigApolloConfig = t.TypeOf<typeof ClientConfigApolloConfigCodec>;
export type ClientConfigApolloDb = ClientConfigApolloConfig & { id: string };
export type ClientConfigApollo = ClientConfigApolloConfig & { id: string };
