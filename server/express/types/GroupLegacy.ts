import * as t from "io-ts";

export const GroupJoinConfigCodec = t.intersection([
  t.type({
    minimumParticipantCount: t.number,
    title: t.string,
    description: t.string,
  }),
  t.partial({
    subtitle: t.string,
  }),
]);
export type GroupJoinConfig = t.TypeOf<typeof GroupJoinConfigCodec>;

export const GroupLegacyCodec = t.intersection([
  t.type({
    id: t.string,
  }),
  t.partial({
    name: t.string,
    description: t.string,
    disabledAfter: t.string,
    disabledBefore: t.string,
    joinableAfter: t.string,
    groupJoin: GroupJoinConfigCodec,
  }),
]);
export type GroupLegacy = t.TypeOf<typeof GroupLegacyCodec>;

export interface GroupWithGroupJoin extends GroupLegacy {
  groupJoin: GroupJoinConfig;
}

export const hasGroupJoin = (group: GroupLegacy): group is GroupWithGroupJoin => !!group.groupJoin;
