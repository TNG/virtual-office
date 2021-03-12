export interface Schedule {
  tracks: Track[];
  sessions: SessionLegacy[];
}

export interface Track {
  id: string;
  name: string;
}

export interface SessionLegacy {
  roomId?: string;
  groupId?: string;
  trackId?: string;
  start: string;
  end: string;
  alwaysActive?: boolean;
}
