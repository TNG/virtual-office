import { Group } from "../../server/express/types/Group";
import { DateTime } from "luxon";

export interface PotentiallyDisabledGroup {
  isUpcoming: boolean;
  isExpired: boolean;
  isJoinable: boolean;
  group: Group;
}

function toPotentiallyDisabledGroup(group: Group, zone?: string): PotentiallyDisabledGroup {
  const now = DateTime.local();
  const isExpired = (group.disabledAfter && DateTime.fromISO(group.disabledAfter, { zone }) <= now) || false;
  const isUpcoming = (group.disabledBefore && DateTime.fromISO(group.disabledBefore, { zone }) >= now) || false;
  const isJoinable = group.joinableAfter
    ? DateTime.fromISO(group.joinableAfter, { zone }) <= now && !isExpired
    : !isUpcoming && !isExpired;

  return { isUpcoming, isExpired, isJoinable, group };
}

export function mapPotentiallyDisabledGroups(groups: Group[], timezone?: string): PotentiallyDisabledGroup[] {
  return groups.map((group) => toPotentiallyDisabledGroup(group, timezone));
}
