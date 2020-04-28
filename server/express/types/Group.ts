export type GroupJoinConfig = {
  minimumParticipantCount: number;
  description: string;
};

export interface Group {
  id: string;
  name: string;
  hideAfter?: string;
  groupJoin?: GroupJoinConfig;
}
