export type GroupJoinConfig = {
  minimumParticipantCount: number;
  title: string;
  subtitle?: string;
  description: string;
};

export interface GroupLegacy {
  id: string;
  name?: string;
  description?: string;
  disabledAfter?: string;
  disabledBefore?: string;
  joinableAfter?: string;
  groupJoin?: GroupJoinConfig;
}

export interface GroupWithGroupJoin extends GroupLegacy {
  groupJoin: GroupJoinConfig;
}

export const hasGroupJoin = (group: GroupLegacy): group is GroupWithGroupJoin => !!group.groupJoin;
