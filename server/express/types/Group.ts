export type GroupJoinConfig = {
  minimumParticipantCount: number;
  description: string;
};

export interface Group {
  id: string;
  name: string;
  disableAfter?: string;
  disableBefore?: string;
  groupJoin?: GroupJoinConfig;
}
