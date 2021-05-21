import { DataSource } from "apollo-datasource";
import { Service } from "typedi";
import { v4 as uuid } from "uuid";
import { Block, BlockConfig, BlockDb, TrackConfig } from "../../types/Block";
import { Group } from "../../types/Group";
import { RoomSession, Session, SessionConfig } from "../../types/Session";
import { GroupStore } from "./GroupStore";
import { SessionStore } from "./SessionStore";

@Service()
export class BlockStore extends DataSource {
  private blocks: BlockDb[] = [];
  constructor(private groupStore: GroupStore, private sessionStore: SessionStore) {
    super();
  }

  public addBlock(blockConfig: BlockConfig): BlockDb {
    let blockDb: BlockDb;
    if (blockConfig.type === "GROUP_BLOCK") {
      blockDb = {
        id: uuid(),
        type: blockConfig.type,
        name: blockConfig.name,
        group: this.groupStore.importGroupConfig(blockConfig.group),
      };
    } else if (blockConfig.type === "SCHEDULE_BLOCK") {
      blockDb = {
        id: uuid(),
        type: blockConfig.type,
        name: blockConfig.name,
        tracks: blockConfig.tracks?.map((trackConfig: TrackConfig) => this.sessionStore.importTrackConfig(trackConfig)),
        sessions: blockConfig.sessions.map((sessionConfig: SessionConfig) =>
          this.sessionStore.importSessionConfig(sessionConfig)
        ),
      };
    } else {
      blockDb = {
        id: uuid(),
        name: blockConfig.name,
        type: blockConfig.type,
        sessions: blockConfig.sessions.map((sessionConfig: SessionConfig) =>
          this.sessionStore.importSessionConfig(sessionConfig)
        ),
        title: blockConfig.title,
      };
    }

    this.blocks.push(blockDb);
    return blockDb;
  }

  public getBlock(id: string): Block | undefined {
    const blockDb: BlockDb | undefined = this.blocks.find((block: BlockDb) => block.id === id);
    if (!blockDb) {
      return undefined;
    } else if (blockDb.type === "GROUP_BLOCK") {
      const group: Group | undefined = this.groupStore.getGroup(blockDb.group);
      if (group) {
        return {
          id: blockDb.id,
          type: blockDb.type,
          name: blockDb.name,
          group: group,
        };
      }
    } else if (blockDb.type === "SCHEDULE_BLOCK") {
      const sessions: RoomSession[] = blockDb.sessions
        .map((sessionId: string) => this.sessionStore.getSession(sessionId))
        .filter((session: Session | undefined): session is RoomSession => session !== undefined);
      if (sessions.length > 0) {
        return {
          id: blockDb.id,
          type: blockDb.type,
          name: blockDb.name,
          sessions: sessions,
          tracks: blockDb.tracks,
        };
      }
    } else if (blockDb.type === "SESSION_BLOCK") {
      const sessions: RoomSession[] = blockDb.sessions
        .map((sessionId: string) => this.sessionStore.getSession(sessionId))
        .filter((session: Session | undefined): session is RoomSession => session !== undefined);
      if (sessions.length > 0) {
        return {
          id: blockDb.id,
          type: blockDb.type,
          name: blockDb.name,
          sessions: sessions,
          title: blockDb.title,
        };
      }
    }
  }

  clear() {
    this.blocks = [];
  }
}
