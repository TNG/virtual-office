export interface Schedule {
  tracks: TrackLegacy[];
  sessions: SessionLegacy[];
}

export interface TrackLegacy {
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
