import { Service } from "typedi";
import { Office } from "../express/types/Office";
import { Config } from "../Config";
import { ConfigOptions } from "../express/types/ConfigOptions";
import { Group } from "../express/types/Group";
import { Room, RoomConfig } from "../express/types/Room";
import { logger } from "../log";
import { v4 as uuid } from "uuid";
import fs from "fs";
import { Schedule, Session } from "../express/types/Schedule";
import { DateTime } from "luxon";

export type OfficeChangeListener = (office: Office) => void;

const sortSessionsByDiffToNow = (zone: string | undefined, sessionStartMinutesOffset: number) => (
  a: Session,
  b: Session
): number =>
  getStartDateTime(b.start, zone, sessionStartMinutesOffset).diffNow().valueOf() -
  getStartDateTime(a.start, zone, sessionStartMinutesOffset).diffNow().valueOf();

@Service()
export class OfficeService {
  private officeChangeListeners: OfficeChangeListener[] = [];
  private groups: Group[] = [];
  private rooms: Room[] = [];
  private schedule: Schedule | undefined = undefined;

  public constructor(private readonly config: Config) {
    this.groups = config.configOptions.groups;
    this.updateRooms(config.configOptions.rooms);
    this.schedule = config.configOptions.schedule;
  }

  getOffice(): Office {
    return {
      groups: this.groups,
      rooms: this.rooms,
      schedule: this.schedule,
    };
  }

  hasMeetingIdConfigured(meetingId: string): boolean {
    return this.rooms.some((room) => room.meetingId === meetingId);
  }

  getRoomsForMeetingId(meetingId: string): Room[] {
    return this.rooms.filter((room) => room.meetingId === meetingId);
  }

  getRoom(roomId: string): Room | undefined {
    return this.rooms.find((room) => room.roomId === roomId);
  }

  getActiveRoom(meetingId: string): Room | undefined {
    const { timezone, sessionStartMinutesOffset } = this.config.clientConfig ?? {};
    const activeRooms: Room[] = this.getRoomsForMeetingId(meetingId)
      .map((room) => ({
        room,
        closestSession: this.schedule
          ? this.schedule.sessions
              .filter((session) => this.sessionIsActive(session))
              .filter(sessionBelongsToRoom(room))
              .sort(sortSessionsByDiffToNow(timezone, sessionStartMinutesOffset))[0] || undefined
          : undefined,
      }))
      .filter((data): data is { closestSession: Session; room: Room } => !!data.closestSession)
      .sort(({ closestSession: a }, { closestSession: b }) =>
        sortSessionsByDiffToNow(timezone, sessionStartMinutesOffset)(a, b)
      )
      .map(({ room }) => room);

    return activeRooms[0];
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
    this.schedule = configOptions.schedule;

    this.writeOfficeToFileSystem();
    this.notifyOfficeChangeListeners();
  }

  private writeOfficeToFileSystem() {
    const configFile = this.config.writeOfficeUpdatesToFileSystem && Config.getConfigFile();
    if (!configFile) {
      return;
    }

    fs.writeFileSync(configFile, JSON.stringify({ groups: this.groups, rooms: this.rooms, schedule: this.schedule }));
  }

  listenOfficeChanges(listener: OfficeChangeListener) {
    this.officeChangeListeners.push(listener);
  }

  private notifyOfficeChangeListeners() {
    const office = this.getOffice();
    this.officeChangeListeners.forEach((listener) => listener(office));
  }

  private sessionIsActive({ start, end, alwaysActive }: Session): boolean {
    const { timezone: zone, sessionStartMinutesOffset } = this.config.clientConfig;
    const startTime = getStartDateTime(start, zone, sessionStartMinutesOffset);
    const endTime = DateTime.fromFormat(end, "HH:mm", { zone });
    const now = DateTime.local();

    return alwaysActive || (startTime < now && endTime > now);
  }
}

const sessionBelongsToRoom = (room: Room) => (session: Session) => {
  return (room.roomId && room.roomId === session.roomId) || (room.groupId && room.groupId === session.groupId);
};

const getStartDateTime = (start: string, zone: string | undefined, sessionStartMinutesOffset: number) =>
  DateTime.fromFormat(start, "HH:mm", { zone }).minus({ minute: sessionStartMinutesOffset });
