import { Group } from "../../server/express/types/Group";
import { DateTime } from "luxon";

export interface PotentiallyDisabledGroup {
  isUpcoming: boolean;
  isExpired: boolean;
  isJoinable: boolean;
  group: Group;
}

function toPotentiallyDisabledGroup(group: Group): PotentiallyDisabledGroup {
  const now = DateTime.local();
  const isExpired = (group.disabledAfter && DateTime.fromISO(group.disabledAfter) <= now) || false;
  const isUpcoming = (group.disabledBefore && DateTime.fromISO(group.disabledBefore) >= now) || false;
  const isJoinable = group.joinableAfter
    ? DateTime.fromISO(group.joinableAfter) <= now && !isExpired
    : !isUpcoming && !isExpired;

  return { isUpcoming, isExpired, isJoinable, group };
}

export function mapPotentiallyDisabledGroups(groups: Group[]): PotentiallyDisabledGroup[] {
  return groups.map((group) => toPotentiallyDisabledGroup(group));
}
