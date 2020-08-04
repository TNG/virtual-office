import { Service } from "typedi";
import { minBy, random } from "lodash";

import { Room } from "../express/types/Room";
import { OfficeService } from "./OfficeService";
import { MeetingsService } from "./MeetingsService";
import { logger } from "../log";
import { GroupWithGroupJoin, hasGroupJoin } from "../express/types/Group";

function randomRoomIn(rooms: Room[]): Room | undefined {
  const entry = random(0, rooms.length - 1);
  return rooms[entry];
}

interface ReservedSpaces {
  [roomId: string]: ReservedSpace[];
}

interface ReservedSpace {
  expires: number;
}

const roomReservationExpiryTimeInMs = 1000 * 60; // 60 seconds
const cleanupReservationsInterval = 1000 * 30; // 30 seconds;

@Service()
export class GroupJoinService {
  private reservedSpaces: ReservedSpaces = {};

  constructor(private readonly officeService: OfficeService, private readonly meetingsService: MeetingsService) {
    setInterval(() => this.cleanupReservedSpaces(), cleanupReservationsInterval);
    meetingsService.listenParticipantsChange((event) => {
      if (event.type === "join") {
        this.removeReservedSpaceIn(event.meetingId);
      }
    });
  }

  joinRoomFor(groupId: string): Room | undefined {
    const office = this.officeService.getOffice();
    const group = office.groups.find((group) => group.id === groupId);
    if (!group || !hasGroupJoin(group)) {
      logger.info(`joinRoomFor(groupId=${groupId}) - cannot find group`);
      return undefined;
    }

    const groupRooms = office.rooms.filter((room) => room.groupId === groupId);
    if (groupRooms.length === 0) {
      logger.info(`joinRoomFor(groupId=${groupId}) - cannot find any rooms for the given group`);
      return undefined;
    }

    const room = this.chooseRoom(group, groupRooms);
    if (room) {
      this.reserveSpaceIn(room.meetingId);
      logger.info(`joinRoomFor(groupId=${groupId}) - chosen room is ${room.meetingId} - ${room.name}`);
    } else {
      logger.info(`joinRoomFor(groupId=${groupId}) - did not choose any room`);
    }

    return room;
  }

  private chooseRoom(group: GroupWithGroupJoin, groupRooms: Room[]): Room | undefined {
    const notEmptyRooms = groupRooms.filter((room) => this.participantsInRoom(room) > 0);
    const roomWithMinimum = minBy(notEmptyRooms, (room) => this.participantsInRoom(room));
    const availableMinimumCount = roomWithMinimum ? this.participantsInRoom(roomWithMinimum) : 0;
    const roomsWithMinimumParticipantCount = this.roomsWithParticipants(groupRooms, availableMinimumCount);

    logger.info(
      `chooseRoom(group=${group.id}) - ${JSON.stringify({
        notEmptyRooms: notEmptyRooms.length,
        roomWithMinimum: roomWithMinimum?.roomId,
        availableMinimumCount,
        roomsWithMinimumParticipantCount: roomsWithMinimumParticipantCount.map((room) => room.meetingId),
      })}`
    );

    // First fill up rooms that are not empty, but have less participants than we configured
    if (availableMinimumCount > 0 && availableMinimumCount < group.groupJoin.minimumParticipantCount) {
      logger.info(
        `chooseRoom(group=${group.id}) - taking a room that is not empty and has less participants than ${group.groupJoin.minimumParticipantCount}`
      );
      return randomRoomIn(roomsWithMinimumParticipantCount);
    }

    // Then start an empty room
    const emptyRooms = this.roomsWithParticipants(groupRooms, 0);
    if (emptyRooms.length > 0) {
      logger.info(`chooseRoom(group=${group.id}) - choosing an empty room`);
      return randomRoomIn(emptyRooms);
    }

    // And when no empty rooms are available, but all rooms have participants above the threshold, take
    // a room with a minimum number of participants.
    logger.info(`chooseRoom(group=${group.id}) - choosing a random room`);
    return randomRoomIn(roomsWithMinimumParticipantCount);
  }

  reserveSpaceIn(roomId: string) {
    this.reservedSpaces[roomId] = [
      ...(this.reservedSpaces[roomId] || []),
      { expires: new Date().getTime() + roomReservationExpiryTimeInMs },
    ];
  }

  private cleanupReservedSpaces() {
    const now = new Date().getTime();
    Object.keys(this.reservedSpaces).forEach((roomId) => {
      this.reservedSpaces[roomId] = this.reservedSpaces[roomId].filter(({ expires }) => now < expires);
    });
  }

  private removeReservedSpaceIn(roomId: string) {
    const spaces = this.reservedSpaces[roomId] || [];
    const min = minBy(spaces, (space) => space.expires);
    if (min) {
      this.reservedSpaces[roomId] = this.reservedSpaces[roomId].filter((space) => space !== min);
    }
  }

  participantsInRoom(room: Room): number {
    const reserved = this.reservedSpaces[room.meetingId] || [];
    const participants = this.meetingsService.getParticipantsIn(room.meetingId).length;
    return participants + reserved.length;
  }

  private roomsWithParticipants(rooms: Room[], count: number): Room[] {
    return rooms.filter((room) => this.participantsInRoom(room) === count);
  }
}
