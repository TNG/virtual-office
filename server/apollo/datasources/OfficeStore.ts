import { DataSource } from "apollo-datasource";
import { Config } from "../../Config";
import { Office, OfficeWithBlocks } from "../../express/types/Office";
import { Service } from "typedi";
import {
  BlockApollo,
  BlockApolloConfig,
  BlockApolloDb,
  GroupApollo,
  GroupApolloDb,
  GroupJoinConfigApollo,
  OfficeApollo,
  OfficeApolloConfig,
  OfficeApolloDb,
  RoomApollo,
  RoomApolloDb,
  RoomLinkApollo,
  RoomLinkApolloConfig,
  RoomSessionApollo,
  SessionApollo,
  SessionApolloDb,
  SlackNotificationApollo,
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
    let officeApollo: OfficeApolloConfig = {
      version: "2_APOLLO",
      blocks: officeWithBlocks.blocks,
    };
    officeApollo.blocks.forEach((blockConfig: BlockApolloConfig) => {
      const blockWithId: BlockApollo = blockConfig as BlockApollo;
      blockWithId["id"] = uuid();
      this.office.blocks.push(blockWithId.id);
      this.extractBlock(blockWithId);
    });
  }

  private extractBlock(block: BlockApollo) {
    if (block.type === "GROUP_BLOCK") {
      const groupWithId: GroupApollo = block.group as GroupApollo;
      groupWithId["id"] = uuid();
      this.blocks.push({
        id: block.id,
        type: block.type,
        name: block.name,
        group: groupWithId.id,
      });
      this.extractGroup(groupWithId);
    } else if (block.type === "SCHEDULE_BLOCK" || block.type === "SESSION_BLOCK") {
      const sessionsWithId: SessionApollo[] = [];
      block.sessions.forEach((sessionConfig: SessionApollo) => {
        const sessionWithId: SessionApollo = sessionConfig as SessionApollo;
        sessionWithId["id"] = uuid();
        sessionsWithId.push(sessionWithId);
        this.extractSession(sessionWithId);
      });
      if (block.type === "SCHEDULE_BLOCK") {
        const tracksWithId: TrackApolloDb[] | undefined = block.tracks
          ?.map((trackConfig: TrackApolloConfig) => {
            return {
              id: uuid(),
              name: trackConfig.name,
            };
          })
          .filter((track: TrackApolloDb | undefined): track is TrackApolloDb => track !== undefined);
        this.blocks.push({
          id: block.id,
          name: block.name,
          type: block.type,
          tracks: tracksWithId,
          sessions: sessionsWithId.map((session: SessionApollo) => session.id),
        });
      } else if (block.type === "SESSION_BLOCK") {
        this.blocks.push({
          id: block.id,
          name: block.name,
          type: block.type,
          sessions: sessionsWithId.map((session: SessionApollo) => session.id),
          title: block.title,
        });
      }
    }
  }

  private extractGroup(group: GroupApollo) {
    const roomIds: string[] = [];
    group.rooms.forEach((roomConfig: RoomApollo) => {
      const roomWithId: RoomApollo = roomConfig as RoomApollo;
      roomWithId["id"] = uuid();
      roomIds.push(roomWithId.id);
      this.extractRoom(roomWithId);
    });
    const groupJoinConfigWithId: GroupJoinConfigApollo = group.groupJoinConfig as GroupJoinConfigApollo;
    if (groupJoinConfigWithId) {
      groupJoinConfigWithId["id"] = uuid();
    }
    this.groups.push({
      id: group.id,
      name: group.name,
      rooms: roomIds,
      description: group.description,
      groupJoinConfig: groupJoinConfigWithId,
    });
  }

  private extractSession(session: SessionApollo) {
    if (session.type === "GROUP_SESSION") {
      const groupWithId: GroupApollo = session.group as GroupApollo;
      groupWithId["id"] = uuid();
      this.sessions.push({
        id: session.id,
        type: session.type,
        start: session.start,
        end: session.end,
        trackName: session.trackName,
        group: groupWithId.id,
      });
      this.extractGroup(groupWithId);
    } else if (session.type === "ROOM_SESSION") {
      const roomWithId: RoomApollo = session.room as RoomApollo;
      roomWithId["id"] = uuid();
      this.sessions.push({
        id: session.id,
        type: session.type,
        start: session.start,
        end: session.end,
        trackName: session.trackName,
        room: roomWithId.id,
      });
      this.extractRoom(roomWithId);
    }
  }

  private extractRoom(room: RoomApollo) {
    const roomLinksWithId: RoomLinkApollo[] | undefined = room.roomLinks?.map(
      (roomLinkConfig: RoomLinkApolloConfig) => {
        const roomLinkWithId: RoomLinkApollo = roomLinkConfig as RoomLinkApollo;
        roomLinkWithId["id"] = uuid();
        return roomLinkWithId;
      }
    );
    // TODO: check if works
    const slackNotificationWithId: SlackNotificationApollo = room.slackNotification as SlackNotificationApollo;
    if (slackNotificationWithId) {
      slackNotificationWithId["id"] = uuid();
    }
    this.rooms.push({
      id: room.id,
      name: room.name,
      description: room.description,
      joinUrl: room.joinUrl,
      titleUrl: room.titleUrl,
      icon: room.icon,
      roomLinks: roomLinksWithId,
      slackNotification: slackNotificationWithId,
      meetingId: room.meetingId,
    });
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

  /*public addRoomToGroup(roomInput: RoomApollo, groupName: string): GroupApollo | undefined {
    let groupFromOffice: GroupApollo | undefined;
    this.groups.forEach((group: GroupApollo) => {
      if (group.name === groupName) {
        group.roomNames.push(roomInput.name);
        groupFromOffice = group;
      }
    });
    if (groupFromOffice) {
      this.rooms.push(roomInput);
    }
    return groupFromOffice;
  }*/
}
