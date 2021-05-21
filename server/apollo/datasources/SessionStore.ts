import { DataSource } from "apollo-datasource";
import { Service } from "typedi";
import { v4 as uuid } from "uuid";
import { TrackConfig, TrackDb } from "../../types/Block";
import { Group } from "../../types/Group";
import { Session, SessionConfig, SessionDb } from "../../types/Session";
import { Room } from "../../types/Room";
import { GroupStore } from "./GroupStore";
import { RoomStore } from "./RoomStore";

@Service()
export class SessionStore extends DataSource {
  private sessions: SessionDb[] = [];

  constructor(private groupStore: GroupStore, private roomStore: RoomStore) {
    super();
  }

  importTrackConfig(trackConfig: TrackConfig): TrackDb {
    return {
      id: uuid(),
      name: trackConfig.name,
    };
  }

  importSessionConfig(sessionConfig: SessionConfig): string {
    let sessionDb: SessionDb;
    if (sessionConfig.type === "GROUP_SESSION") {
      sessionDb = {
        id: uuid(),
        type: sessionConfig.type,
        start: sessionConfig.start,
        end: sessionConfig.end,
        trackName: sessionConfig.trackName,
        group: this.groupStore.importGroupConfig(sessionConfig.group),
      };
    } else {
      sessionDb = {
        id: uuid(),
        type: sessionConfig.type,
        start: sessionConfig.start,
        end: sessionConfig.end,
        trackName: sessionConfig.trackName,
        room: this.roomStore.importRoomConfig(sessionConfig.room),
      };
    }
    this.sessions.push(sessionDb);
    return sessionDb.id;
  }

  public getSession(id: string): Session | undefined {
    const sessionDb: SessionDb | undefined = this.sessions.find((session: SessionDb) => session.id === id);
    if (!sessionDb) {
      return undefined;
    } else if (sessionDb.type === "GROUP_SESSION") {
      const group: Group | undefined = this.groupStore.getGroup(sessionDb.group);
      if (group) {
        return {
          id: sessionDb.id,
          type: sessionDb.type,
          start: sessionDb.start,
          end: sessionDb.end,
          group: group,
          trackName: sessionDb.trackName,
        };
      }
    } else if (sessionDb.type === "ROOM_SESSION") {
      const room: Room | undefined = this.roomStore.getRoom(sessionDb.room);
      if (room) {
        return {
          id: sessionDb.id,
          type: sessionDb.type,
          start: sessionDb.start,
          end: sessionDb.end,
          room: room,
          trackName: sessionDb.trackName,
        };
      }
    }
  }

  clear() {
    this.sessions = [];
  }
}
