export interface Schedule {
  tracks: Track[];
  sessions: Session[];
}

export interface Track {
  id: string;
  name: string;
}

export interface Session {
  roomId?: string;
  groupId?: string;
  trackId?: string;
  start: string;
  end: string;
}
