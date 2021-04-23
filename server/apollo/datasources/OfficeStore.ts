import { DataSource } from "apollo-datasource";
import { Config } from "../../Config";
import { Office, OfficeWithBlocks } from "../../express/types/Office";
import { Service } from "typedi";
import {
  BlockApollo,
  BlockApolloConfig,
  BlockApolloDb,
  GroupApollo,
  GroupApolloConfig,
  GroupApolloDb,
  GroupJoinConfigApollo,
  GroupJoinConfigApolloConfig,
  GroupJoinConfigApolloDb,
  OfficeApollo,
  OfficeApolloDb,
  RoomApollo,
  RoomApolloConfig,
  RoomApolloDb,
  RoomLinkApollo,
  RoomLinkApolloConfig,
  RoomLinkApolloDb,
  RoomSessionApollo,
  SessionApollo,
  SessionApolloConfig,
  SessionApolloDb,
  SlackNotificationApolloConfig,
  SlackNotificationApolloDb,
  TrackApolloConfig,
  TrackApolloDb,
} from "../TypesApollo";
import { getOfficeWithBlocksFromOffice } from "../../services/OfficeService";
import { v4 as uuid } from "uuid";

@Service()
export class OfficeStore extends DataSource {
  private office: OfficeApolloDb = {
    id: uuid(),
    version: "2_APOLLO",
    blocks: [],
  };
  private blocks: BlockApolloDb[] = [];
  private groups: GroupApolloDb[] = [];
  private sessions: SessionApolloDb[] = [];
  private rooms: RoomApolloDb[] = [];

  constructor(config: Config) {
    super();
    const officeParsed: Office = config.configOptions;
    this.createOfficeApollo(officeParsed);
  }

  initialize() {
    //this.context = config.context;
  }

  private createOfficeApollo(officeParsed: Office) {
    const officeWithBlocks: OfficeWithBlocks = getOfficeWithBlocksFromOffice(officeParsed);
    officeWithBlocks.blocks.forEach((blockApolloConfig: BlockApolloConfig) => {
      const blockApolloDb: BlockApolloDb = this.importBlockApolloConfig(blockApolloConfig);
      this.office.blocks.push(blockApolloDb.id);
    });
  }

  private importBlockApolloConfig(blockApolloConfig: BlockApolloConfig): BlockApolloDb {
    let blockApolloDb: BlockApolloDb;
    if (blockApolloConfig.type === "GROUP_BLOCK") {
      blockApolloDb = {
        id: uuid(),
        type: blockApolloConfig.type,
        name: blockApolloConfig.name,
        group: this.importGroupApolloConfig(blockApolloConfig.group).id,
      };
    } else if (blockApolloConfig.type === "SCHEDULE_BLOCK") {
      blockApolloDb = {
        id: uuid(),
        type: blockApolloConfig.type,
        name: blockApolloConfig.name,
        tracks: blockApolloConfig.tracks?.map((trackApolloConfig: TrackApolloConfig) =>
          this.importTrackApolloConfig(trackApolloConfig)
        ),
        sessions: blockApolloConfig.sessions.map(
          (sessionApolloConfig: SessionApolloConfig) => this.importSessionApolloConfig(sessionApolloConfig).id
        ),
      };
    } else {
      blockApolloDb = {
        id: uuid(),
        name: blockApolloConfig.name,
        type: blockApolloConfig.type,
        sessions: blockApolloConfig.sessions.map(
          (sessionApolloConfig: SessionApolloConfig) => this.importSessionApolloConfig(sessionApolloConfig).id
        ),
        title: blockApolloConfig.title,
      };
    }

    this.blocks.push(blockApolloDb);
    return blockApolloDb;
  }

  private importTrackApolloConfig(trackApolloConfig: TrackApolloConfig): TrackApolloDb {
    return {
      id: uuid(),
      name: trackApolloConfig.name,
    };
  }

  private importGroupApolloConfig(groupApolloConfig: GroupApolloConfig): GroupApolloDb {
    const groupApolloDb: GroupApolloDb = {
      id: uuid(),
      name: groupApolloConfig.name,
      rooms: groupApolloConfig.rooms.map(
        (roomApolloConfig: RoomApolloConfig) => this.importRoomApolloConfig(roomApolloConfig).id
      ),
      description: groupApolloConfig.description,
      groupJoinConfig: groupApolloConfig.groupJoinConfig
        ? this.importGroupJoinConfigApolloConfig(groupApolloConfig.groupJoinConfig)
        : undefined,
    };
    this.groups.push(groupApolloDb);
    return groupApolloDb;
  }

  private importGroupJoinConfigApolloConfig(
    groupJoinConfigApolloConfig: GroupJoinConfigApolloConfig
  ): GroupJoinConfigApolloDb {
    return {
      id: uuid(),
      minimumParticipantCount: groupJoinConfigApolloConfig.minimumParticipantCount,
      title: groupJoinConfigApolloConfig.title,
      description: groupJoinConfigApolloConfig.description,
      subtitle: groupJoinConfigApolloConfig.subtitle,
    };
  }

  private importSessionApolloConfig(sessionApolloConfig: SessionApolloConfig): SessionApolloDb {
    let sessionApolloDb: SessionApolloDb;
    if (sessionApolloConfig.type === "GROUP_SESSION") {
      sessionApolloDb = {
        id: uuid(),
        type: sessionApolloConfig.type,
        start: sessionApolloConfig.start,
        end: sessionApolloConfig.end,
        trackName: sessionApolloConfig.trackName,
        group: this.importGroupApolloConfig(sessionApolloConfig.group).id,
      };
    } else {
      sessionApolloDb = {
        id: uuid(),
        type: sessionApolloConfig.type,
        start: sessionApolloConfig.start,
        end: sessionApolloConfig.end,
        trackName: sessionApolloConfig.trackName,
        room: this.importRoomApolloConfig(sessionApolloConfig.room).id,
      };
    }
    this.sessions.push(sessionApolloDb);
    return sessionApolloDb;
  }

  private importRoomApolloConfig(roomApolloConfig: RoomApolloConfig): RoomApolloDb {
    const roomApolloDb: RoomApolloDb = {
      id: uuid(),
      name: roomApolloConfig.name,
      description: roomApolloConfig.description,
      joinUrl: roomApolloConfig.joinUrl,
      titleUrl: roomApolloConfig.titleUrl,
      icon: roomApolloConfig.icon,
      roomLinks: roomApolloConfig.roomLinks?.map((roomLinkApolloConfig: RoomLinkApolloConfig) =>
        this.importRoomLinkApolloConfig(roomLinkApolloConfig)
      ),
      slackNotification: roomApolloConfig.slackNotification
        ? this.importSlackNotificationApolloConfig(roomApolloConfig.slackNotification)
        : undefined,
      meetingId: roomApolloConfig.meetingId,
    };
    this.rooms.push(roomApolloDb);
    return roomApolloDb;
  }

  private importRoomLinkApolloConfig(roomLinkApolloConfig: RoomLinkApolloConfig): RoomLinkApolloDb {
    return {
      id: uuid(),
      href: roomLinkApolloConfig.href,
      text: roomLinkApolloConfig.text,
      icon: roomLinkApolloConfig.icon,
      linkGroup: roomLinkApolloConfig.linkGroup,
    };
  }

  private importSlackNotificationApolloConfig(
    slackNotificationApolloConfig: SlackNotificationApolloConfig
  ): SlackNotificationApolloDb {
    return {
      id: uuid(),
      channelId: slackNotificationApolloConfig.channelId,
      notificationInterval: slackNotificationApolloConfig.notificationInterval,
    };
  }

  public getOffice(): OfficeApollo {
    const officeDb: OfficeApolloDb = this.office;
    return {
      id: officeDb.id,
      version: officeDb.version,
      blocks: officeDb.blocks
        .map((blockId: string) => this.getBlock(blockId))
        .filter((block: BlockApollo | undefined): block is BlockApollo => block !== undefined),
    };
  }

  public getBlock(id: string): BlockApollo | undefined {
    const blockDb: BlockApolloDb | undefined = this.blocks.find((block: BlockApolloDb) => block.id === id);
    if (!blockDb) {
      return undefined;
    } else if (blockDb.type === "GROUP_BLOCK") {
      const group: GroupApollo | undefined = this.getGroup(blockDb.group);
      if (group) {
        return {
          id: blockDb.id,
          type: blockDb.type,
          name: blockDb.name,
          group: group,
        };
      }
    } else if (blockDb.type === "SCHEDULE_BLOCK") {
      const sessions: RoomSessionApollo[] = blockDb.sessions
        .map((sessionId: string) => this.getSession(sessionId))
        .filter((session: SessionApollo | undefined): session is RoomSessionApollo => session !== undefined);
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
      const sessions: RoomSessionApollo[] = blockDb.sessions
        .map((sessionId: string) => this.getSession(sessionId))
        .filter((session: SessionApollo | undefined): session is RoomSessionApollo => session !== undefined);
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

  public getGroup(id: string): GroupApollo | undefined {
    const groupDb: GroupApolloDb | undefined = this.groups.find((group: GroupApolloDb) => group.id === id);
    if (groupDb) {
      const rooms: RoomApollo[] = groupDb.rooms
        .map((roomId: string) => this.getRoom(roomId))
        .filter((room: RoomApollo | undefined): room is RoomApollo => room !== undefined);
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

  public getGroupJoinConfig(id: string): GroupJoinConfigApollo | undefined {
    for (let i = 0; i < this.groups.length; i++) {
      if (this.groups[i].groupJoinConfig?.id === id) {
        return this.groups[i].groupJoinConfig;
      }
    }
    return undefined;
  }

  public getSession(id: string): SessionApollo | undefined {
    const sessionDb: SessionApolloDb | undefined = this.sessions.find((session: SessionApolloDb) => session.id === id);
    if (!sessionDb) {
      return undefined;
    } else if (sessionDb.type === "GROUP_SESSION") {
      const group: GroupApollo | undefined = this.getGroup(sessionDb.group);
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
      const room: RoomApollo | undefined = this.getRoom(sessionDb.room);
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

  public getRoom(id: string): RoomApollo | undefined {
    return this.rooms.find((room: RoomApollo) => room.id === id);
  }

  public getRoomLinks(ids: string[]): RoomLinkApollo[] {
    const roomLinks: RoomLinkApollo[] = [];
    this.rooms.forEach((room: RoomApollo) => {
      room.roomLinks?.forEach((roomLink: RoomLinkApollo) => {
        if (ids.includes(roomLink.id)) {
          roomLinks.push(roomLink);
        }
      });
    });
    return roomLinks;
  }

  public addRoomToGroup(roomApolloConfig: RoomApolloConfig, groupId: string): boolean {
    for (let group of this.groups) {
      if (group.id === groupId) {
        const roomApolloDb: RoomApolloDb = this.importRoomApolloConfig(roomApolloConfig);
        group.rooms.push(roomApolloDb.id);
        return true;
      }
    }
    return false;
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
