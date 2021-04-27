import * as t from "io-ts";

export const GroupJoinConfigLegacyCodec = t.intersection([
  t.type({
    minimumParticipantCount: t.number,
    title: t.string,
    description: t.string,
  }),
  t.partial({
    subtitle: t.string,
  }),
]);
export type GroupJoinConfigLegacy = t.TypeOf<typeof GroupJoinConfigLegacyCodec>;

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
    groupJoin: GroupJoinConfigLegacyCodec,
  }),
]);
export type GroupLegacy = t.TypeOf<typeof GroupLegacyCodec>;

export interface GroupWithGroupJoinLegacy extends GroupLegacy {
  groupJoin: GroupJoinConfigLegacy;
}

export const hasGroupJoin = (group: GroupLegacy): group is GroupWithGroupJoinLegacy => !!group.groupJoin;
