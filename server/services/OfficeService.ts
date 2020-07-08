import { Service } from "typedi";

import { Office } from "../express/types/Office";
import { Config } from "../Config";
import { ConfigOptions } from "../express/types/ConfigOptions";
import { Group } from "../express/types/Group";
import { RoomConfig, Room } from "../express/types/Room";
import { logger } from "../log";
import { v4 as uuid } from "uuid";
import fs from "fs";

export type OfficeChangeListener = (office: Office) => void;

@Service()
export class OfficeService {
  private officeChangeListeners: OfficeChangeListener[] = [];
  private groups: Group[] = [];
  private rooms: Room[] = [];

  public constructor(private readonly config: Config) {
    this.groups = config.configOptions.groups;
    this.updateRooms(config.configOptions.rooms);
  }

  getOffice(): Office {
    return {
      groups: this.groups,
      rooms: this.rooms,
    };
  }

  hasMeetingIdConfigured(meetingId: string): boolean {
    return this.rooms.some((room) => room.meetingId === meetingId);
  }

  getRoomsForMeetingId(meetingId: string): Room[] {
    return this.rooms.filter((room) => room.meetingId === meetingId);
  }

  getRoom(roomId: string): Room {
    return this.rooms.find((room) => room.roomId === roomId);
  }

  createRoom(room: RoomConfig): boolean {
    if (this.rooms.some((knownRoom) => knownRoom.roomId === room.roomId)) {
      logger.info(`cannot create room, as room with roomId=${room.roomId} already exists`);
      return false;
    }
    this.rooms.push(OfficeService.roomConfigToRoom(room));
    return true;
  }

  deleteRoom(roomId: string): boolean {
    const roomWithId = this.rooms.find((room) => room.roomId === roomId);
    if (roomWithId && roomWithId.temporary !== true) {
      logger.info(`cannot delete room, as room with id=${roomId} is protected`);
      return false;
    }

    this.rooms = this.rooms.filter((room) => roomId !== room.roomId);

    return true;
  }

  private updateRooms(update: RoomConfig[]) {
    this.rooms = update.map((room) => OfficeService.roomConfigToRoom(room));
  }

  private static roomConfigToRoom(config: RoomConfig): Room {
    return {
      ...config,
      roomId: config.roomId || uuid(),
    };
  }

  replaceOfficeWith(configOptions: ConfigOptions) {
    this.updateRooms(configOptions.rooms);
    this.groups = configOptions.groups;

    this.writeOfficeToFileSystem();
    this.notifyOfficeChangeListeners();
  }

  private writeOfficeToFileSystem() {
    const configFile = this.config.writeOfficeUpdatesToFileSystem && Config.getConfigFile();
    if (!configFile) {
      return;
    }

    fs.writeFileSync(configFile, JSON.stringify({ groups: this.groups, rooms: this.rooms }));
  }

  listenOfficeChanges(listener: OfficeChangeListener) {
    this.officeChangeListeners.push(listener);
  }

  private notifyOfficeChangeListeners() {
    const office = this.getOffice();
    this.officeChangeListeners.forEach((listener) => listener(office));
  }
}
