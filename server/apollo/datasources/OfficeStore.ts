import { DataSource } from "apollo-datasource";
import { Config } from "../../Config";
import { OfficeWithBlocks, OfficeWithBlocksConfig } from "../../types/OfficeWithBlocks";
import { Service } from "typedi";
import { v4 as uuid } from "uuid";
import { getOfficeWithBlocksConfigFromOfficeConfig } from "../../express/utils/convertOffice";
import { OfficeWithBlocksDb } from "../../types/OfficeWithBlocks";
import { Block, BlockConfig, BlockDb, TrackConfig, TrackDb } from "../../types/Block";
import {
  Group,
  GroupConfig,
  GroupDb,
  GroupJoinConfig,
  GroupJoinConfigConfig,
  GroupJoinConfigDb,
} from "../../types/Group";
import { RoomSession, Session, SessionConfig, SessionDb } from "../../types/Session";
import {
  Room,
  RoomConfig,
  RoomDb,
  RoomLink,
  RoomLinkConfig,
  RoomLinkDb,
  SlackNotificationConfig,
  SlackNotificationDb,
} from "../../types/Room";
import { OfficeConfig } from "../../types/Office";

@Service()
export class OfficeStore extends DataSource {
  private office: OfficeWithBlocksDb = {
    id: uuid(),
    version: "2",
    blocks: [],
  };
  private blocks: BlockDb[] = [];
  private groups: GroupDb[] = [];
  private sessions: SessionDb[] = [];
  private rooms: RoomDb[] = [];

  constructor(config: Config) {
    super();
    const officeParsed: OfficeConfig = config.configOptions;
    this.createOffice(officeParsed);
  }

  initialize() {
    //this.context = config.context;
  }

  private createOffice(officeParsed: OfficeConfig) {
    const officeWithBlocks: OfficeWithBlocksConfig = getOfficeWithBlocksConfigFromOfficeConfig(officeParsed);
    officeWithBlocks.blocks.forEach((blockConfig: BlockConfig) => {
      const blockDb: BlockDb = this.importBlockConfig(blockConfig);
      this.office.blocks.push(blockDb.id);
    });
  }

  private importBlockConfig(blockConfig: BlockConfig): BlockDb {
    let blockDb: BlockDb;
    if (blockConfig.type === "GROUP_BLOCK") {
      blockDb = {
        id: uuid(),
        type: blockConfig.type,
        name: blockConfig.name,
        group: this.importGroupConfig(blockConfig.group).id,
      };
    } else if (blockConfig.type === "SCHEDULE_BLOCK") {
      blockDb = {
        id: uuid(),
        type: blockConfig.type,
        name: blockConfig.name,
        tracks: blockConfig.tracks?.map((trackConfig: TrackConfig) => this.importTrackConfig(trackConfig)),
        sessions: blockConfig.sessions.map(
          (sessionConfig: SessionConfig) => this.importSessionConfig(sessionConfig).id
        ),
      };
    } else {
      blockDb = {
        id: uuid(),
        name: blockConfig.name,
        type: blockConfig.type,
        sessions: blockConfig.sessions.map(
          (sessionConfig: SessionConfig) => this.importSessionConfig(sessionConfig).id
        ),
        title: blockConfig.title,
      };
    }

    this.blocks.push(blockDb);
    return blockDb;
  }

  private importTrackConfig(trackConfig: TrackConfig): TrackDb {
    return {
      id: uuid(),
      name: trackConfig.name,
    };
  }

  private importGroupConfig(groupConfig: GroupConfig): GroupDb {
    const groupDb: GroupDb = {
      id: uuid(),
      name: groupConfig.name,
      rooms: groupConfig.rooms.map((roomConfig: RoomConfig) => this.importRoomConfig(roomConfig).id),
      description: groupConfig.description,
      groupJoinConfig: groupConfig.groupJoinConfig
        ? this.importGroupJoinConfigConfig(groupConfig.groupJoinConfig)
        : undefined,
    };
    this.groups.push(groupDb);
    return groupDb;
  }

  private importGroupJoinConfigConfig(groupJoinConfigConfig: GroupJoinConfigConfig): GroupJoinConfigDb {
    return {
      id: uuid(),
      minimumParticipantCount: groupJoinConfigConfig.minimumParticipantCount,
      title: groupJoinConfigConfig.title,
      description: groupJoinConfigConfig.description,
      subtitle: groupJoinConfigConfig.subtitle,
    };
  }

  private importSessionConfig(sessionConfig: SessionConfig): SessionDb {
    let sessionDb: SessionDb;
    if (sessionConfig.type === "GROUP_SESSION") {
      sessionDb = {
        id: uuid(),
        type: sessionConfig.type,
        start: sessionConfig.start,
        end: sessionConfig.end,
        trackName: sessionConfig.trackName,
        group: this.importGroupConfig(sessionConfig.group).id,
      };
    } else {
      sessionDb = {
        id: uuid(),
        type: sessionConfig.type,
        start: sessionConfig.start,
        end: sessionConfig.end,
        trackName: sessionConfig.trackName,
        room: this.importRoomConfig(sessionConfig.room).id,
      };
    }
    this.sessions.push(sessionDb);
    return sessionDb;
  }

  private importRoomConfig(roomConfig: RoomConfig): RoomDb {
    const roomDb: RoomDb = {
      id: uuid(),
      name: roomConfig.name,
      description: roomConfig.description,
      joinUrl: roomConfig.joinUrl,
      titleUrl: roomConfig.titleUrl,
      icon: roomConfig.icon,
      roomLinks: roomConfig.roomLinks?.map((roomLinkConfig: RoomLinkConfig) =>
        this.importRoomLinkConfig(roomLinkConfig)
      ),
      slackNotification: roomConfig.slackNotification
        ? this.importSlackNotificationConfig(roomConfig.slackNotification)
        : undefined,
      meetingId: roomConfig.meetingId,
    };
    this.rooms.push(roomDb);
    return roomDb;
  }

  private importRoomLinkConfig(roomLinkConfig: RoomLinkConfig): RoomLinkDb {
    return {
      id: uuid(),
      href: roomLinkConfig.href,
      text: roomLinkConfig.text,
      icon: roomLinkConfig.icon,
      linkGroup: roomLinkConfig.linkGroup,
    };
  }

  private importSlackNotificationConfig(slackNotificationConfig: SlackNotificationConfig): SlackNotificationDb {
    return {
      id: uuid(),
      channelId: slackNotificationConfig.channelId,
      notificationInterval: slackNotificationConfig.notificationInterval,
    };
  }

  public getOffice(): OfficeWithBlocks {
    const officeDb: OfficeWithBlocksDb = this.office;
    return {
      id: officeDb.id,
      version: officeDb.version,
      blocks: officeDb.blocks
        .map((blockId: string) => this.getBlock(blockId))
        .filter((block: Block | undefined): block is Block => block !== undefined),
    };
  }

  public getBlock(id: string): Block | undefined {
    const blockDb: BlockDb | undefined = this.blocks.find((block: BlockDb) => block.id === id);
    if (!blockDb) {
      return undefined;
    } else if (blockDb.type === "GROUP_BLOCK") {
      const group: Group | undefined = this.getGroup(blockDb.group);
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
        .map((sessionId: string) => this.getSession(sessionId))
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
        .map((sessionId: string) => this.getSession(sessionId))
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

  public getGroup(id: string): Group | undefined {
    const groupDb: GroupDb | undefined = this.groups.find((group: GroupDb) => group.id === id);
    if (groupDb) {
      const rooms: Room[] = groupDb.rooms
        .map((roomId: string) => this.getRoom(roomId))
        .filter((room: Room | undefined): room is Room => room !== undefined);
      if (rooms.length > 0) {
        return {
          id: groupDb.id,
          name: groupDb.name,
          rooms: rooms,
          description: groupDb.description,
          groupJoinConfig: groupDb.groupJoinConfig,
        };
      }
    }
  }

  public getGroupJoinConfig(id: string): GroupJoinConfig | undefined {
    for (let i = 0; i < this.groups.length; i++) {
      if (this.groups[i].groupJoinConfig?.id === id) {
        return this.groups[i].groupJoinConfig;
      }
    }
    return undefined;
  }

  public getSession(id: string): Session | undefined {
    const sessionDb: SessionDb | undefined = this.sessions.find((session: SessionDb) => session.id === id);
    if (!sessionDb) {
      return undefined;
    } else if (sessionDb.type === "GROUP_SESSION") {
      const group: Group | undefined = this.getGroup(sessionDb.group);
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
      const room: Room | undefined = this.getRoom(sessionDb.room);
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

  public getRoom(id: string): Room | undefined {
    return this.rooms.find((room: Room) => room.id === id);
  }

  public getRoomLinks(ids: string[]): RoomLink[] {
    const roomLinks: RoomLink[] = [];
    this.rooms.forEach((room: Room) => {
      room.roomLinks?.forEach((roomLink: RoomLink) => {
        if (ids.includes(roomLink.id)) {
          roomLinks.push(roomLink);
        }
      });
    });
    return roomLinks;
  }

  public updateOffice(officeInput: OfficeWithBlocks): boolean {
    this.office = {
      id: uuid(),
      version: "2",
      blocks: [],
    };
    this.blocks = [];
    this.groups = [];
    this.sessions = [];
    this.rooms = [];
    officeInput.blocks.forEach((blockConfig: BlockConfig) => {
      const blockDb: BlockDb = this.importBlockConfig(blockConfig);
      this.office.blocks.push(blockDb.id);
    });
    return true;
  }

  public addRoomToGroup(roomConfig: RoomConfig, groupId: string): { success: boolean; room: Room | undefined } {
    for (let group of this.groups) {
      if (group.id === groupId) {
        const roomDb: RoomDb = this.importRoomConfig(roomConfig);
        group.rooms.push(roomDb.id);
        return { success: true, room: roomDb };
      }
    }
    return { success: false, room: undefined };
  }

  public removeRoomFromGroup(roomId: string, groupId: string): boolean {
    for (let group of this.groups) {
      if (group.id === groupId) {
        const roomCountBefore: number = group.rooms.length;
        group.rooms = group.rooms.filter((roomIdInDb: string) => roomIdInDb !== roomId);
        return roomCountBefore > group.rooms.length;
      }
    }
    return false;
  }
}
