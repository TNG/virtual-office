export type GroupJoinConfig = {
  minimumParticipantCount: number;
  title: string;
  subtitle?: string;
  description: string;
};

export interface Group {
  id: string;
  name: string;
  disabledAfter?: string;
  disabledBefore?: string;
  groupJoin?: GroupJoinConfig;
}
