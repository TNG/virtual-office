import { DateTime } from "luxon";
import { GroupLegacy } from "../../server/types/legacyTypes/GroupLegacy";

export interface PotentiallyDisabledGroup {
  isUpcoming: boolean;
  isExpired: boolean;
  isJoinable: boolean;
  group: GroupLegacy;
}

function toPotentiallyDisabledGroup(group: GroupLegacy, zone?: string): PotentiallyDisabledGroup {
  const now = DateTime.local();
  const isExpired = (group.disabledAfter && DateTime.fromISO(group.disabledAfter, { zone }) <= now) || false;
  const isUpcoming = (group.disabledBefore && DateTime.fromISO(group.disabledBefore, { zone }) >= now) || false;
  const isJoinable = group.joinableAfter
    ? DateTime.fromISO(group.joinableAfter, { zone }) <= now && !isExpired
    : !isUpcoming && !isExpired;

  return { isUpcoming, isExpired, isJoinable, group };
}

export function mapPotentiallyDisabledGroups(groups: GroupLegacy[], timezone?: string): PotentiallyDisabledGroup[] {
  return groups.map((group) => toPotentiallyDisabledGroup(group, timezone));
}
