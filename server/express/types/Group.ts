export type GroupJoinConfig = {
  minimumParticipantCount: number;
};

export interface Group {
  id: string;
  name: string;
  groupJoin?: GroupJoinConfig;
}
