import { Service } from "typedi";
import { Config } from "../Config";
import { ConfigOptionsLegacy } from "../express/types/ConfigOptionsLegacy";
import { GroupLegacy } from "../express/types/GroupLegacy";
import { RoomLegacy, RoomConfigLegacy, RoomWithMeetingIdLegacy } from "../express/types/RoomLegacy";
import { logger } from "../log";
import { v4 as uuid } from "uuid";
import fs from "fs";
import { Schedule, SessionLegacy } from "../express/types/Schedule";
import { DateTime } from "luxon";
import { Block, Office, OfficeWithBlocks } from "../express/types/Office";
import { officeLegacyToOfficeWithBlocks } from "../express/utils/convertOffice";
import { Room } from "../express/types/Room";
import { Session } from "../express/types/Session";

export type OfficeChangeListener = (office: OfficeWithBlocks) => void;

const sortSessionsByDiffToNow = (zone: string | undefined, sessionStartMinutesOffset: number) => (
  a: SessionLegacy,
  b: SessionLegacy
): number =>
  getStartDateTime(b.start, zone, sessionStartMinutesOffset).diffNow().valueOf() -
  getStartDateTime(a.start, zone, sessionStartMinutesOffset).diffNow().valueOf();

@Service()
export class OfficeService {
  private officeChangeListeners: OfficeChangeListener[] = [];
  private groups: GroupLegacy[] = [];
  private rooms: RoomLegacy[] = [];
  private schedule: Schedule | undefined = undefined;
  private office: OfficeWithBlocks = {
    version: "2",
    blocks: [],
  };

  public constructor(private readonly config: Config) {
    const officeParsed: Office = config.configOptions;
    this.office = getOfficeWithBlocksFromOffice(officeParsed);
  }

  getOffice(): OfficeWithBlocks {
    return this.office;
  }

  hasMeetingIdConfigured(meetingId: string): boolean {
    return this.getAllRooms().some((room: Room) => room.meetingId === meetingId);
  }

  getAllRooms(): Room[] {
    let rooms: Room[] = [];

    this.office.blocks.forEach((block: Block) => {
      if (block.type === "GROUP_BLOCK") {
        rooms.push(...block.group.rooms);
      } else if (block.type === "SCHEDULE_BLOCK") {
        block.sessions.forEach((session: Session) => {
          if (session.type === "GROUP_SESSION") {
            rooms.push(...session.group.rooms);
          } else if (session.type === "ROOM_SESSION") {
            rooms.push(session.room);
          }
        });
      }
    });

    return rooms;
  }

  getRoomsForMeetingId(meetingId: string): RoomWithMeetingIdLegacy[] {
    return this.rooms.filter((room): room is RoomWithMeetingIdLegacy => room.meetingId === meetingId);
  }

  getRoom(roomId: string): RoomLegacy | undefined {
    return this.rooms.find((room) => room.roomId === roomId);
  }

  getActiveRoom(meetingId: string): RoomLegacy | undefined {
    const { timezone, sessionStartMinutesOffset } = this.config.clientConfig ?? {};
    const activeRooms: RoomLegacy[] = this.getRoomsForMeetingId(meetingId)
      .map((room) => ({
        room,
        closestSession: this.schedule
          ? this.schedule.sessions
              .filter((session) => this.sessionIsActive(session))
              .filter(sessionBelongsToRoom(room))
              .sort(sortSessionsByDiffToNow(timezone, sessionStartMinutesOffset))[0] || undefined
          : undefined,
      }))
      .filter((data): data is { closestSession: SessionLegacy; room: RoomWithMeetingIdLegacy } => !!data.closestSession)
      .sort(({ closestSession: a }, { closestSession: b }) =>
        sortSessionsByDiffToNow(timezone, sessionStartMinutesOffset)(a, b)
      )
      .map(({ room }) => room);

    return activeRooms[0];
  }

  createRoom(room: RoomConfigLegacy): boolean {
    if (this.rooms.some((knownRoom) => knownRoom.roomId === room.roomId)) {
      logger.info(`cannot create room, as room with roomId=${room.roomId} already exists`);
      return false;
    }
    this.rooms.push(OfficeService.roomConfigLegacyToRoomLegacy(room));
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

  public static roomConfigLegacyToRoomLegacy(config: RoomConfigLegacy): RoomLegacy {
    return {
      ...config,
      roomId: config.roomId || uuid(),
    };
  }

  replaceOfficeWith(officeOrConfigOptionsLegacy: Office | ConfigOptionsLegacy) {
    this.office = getOfficeWithBlocksFromOffice(officeOrConfigOptionsLegacy);

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

  private sessionIsActive({ start, end, alwaysActive }: SessionLegacy): boolean {
    const { timezone: zone, sessionStartMinutesOffset } = this.config.clientConfig;
    const startTime = getStartDateTime(start, zone, sessionStartMinutesOffset);
    const endTime = DateTime.fromFormat(end, "HH:mm", { zone });
    const now = DateTime.local();

    return alwaysActive || (startTime < now && endTime > now);
  }
}

const sessionBelongsToRoom = (room: RoomLegacy) => (session: SessionLegacy) => {
  return (room.roomId && room.roomId === session.roomId) || (room.groupId && room.groupId === session.groupId);
};

export const getStartDateTime = (start: string, zone: string | undefined, sessionStartMinutesOffset: number) =>
  DateTime.fromFormat(start, "HH:mm", { zone }).minus({ minute: sessionStartMinutesOffset });

const getOfficeWithBlocksFromOffice = (officeOrConfigOptionsLegacy: Office | ConfigOptionsLegacy): OfficeWithBlocks => {
  if ("blocks" in officeOrConfigOptionsLegacy) {
    return officeOrConfigOptionsLegacy as OfficeWithBlocks;
  } else {
    return officeLegacyToOfficeWithBlocks(officeOrConfigOptionsLegacy as ConfigOptionsLegacy);
  }
};
