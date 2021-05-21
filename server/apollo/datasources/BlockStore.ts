import { DataSource } from "apollo-datasource";
import { Service } from "typedi";
import { v4 as uuid } from "uuid";
import { BlockConfig, BlockDb, TrackConfig } from "../../types/Block";
import { SessionConfig } from "../../types/Session";
import { GroupStore } from "./GroupStore";
import { SessionStore } from "./SessionStore";
import { Block, GroupBlock, ScheduleBlock, SessionBlock } from "../../graphql/types/Block";
import { Track } from "../../graphql/types/Session";

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
      const groupBlock = new GroupBlock(id, blockDb.group);
      groupBlock.name = blockDb.name;
      return groupBlock;
    } else if (blockDb.type === "SCHEDULE_BLOCK") {
      const sessionBlock = new ScheduleBlock(
        id,
        blockDb.sessions,
        blockDb?.tracks?.map((track) => new Track(track.id, track.name))
      );
      sessionBlock.name = blockDb.name;
      return sessionBlock;
    } else if (blockDb.type === "SESSION_BLOCK") {
      const sessionBlock = new SessionBlock(id, blockDb.title, blockDb.sessions);
      sessionBlock.name = blockDb.name;
      return sessionBlock;
    }
  }

  clear() {
    this.blocks = [];
  }
}
