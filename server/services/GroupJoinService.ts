import { Service } from "typedi";
import { minBy, random } from "lodash";

import { Room } from "../express/types/Room";
import { OfficeService } from "./OfficeService";
import { RoomWithParticipants } from "../express/types/RoomWithParticipants";
import { RoomsService } from "./RoomsService";

function randomRoomIn(rooms: RoomWithParticipants[]): RoomWithParticipants | undefined {
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

  constructor(private readonly officeService: OfficeService, roomService: RoomsService) {
    setInterval(() => this.cleanupReservedSpaces(), cleanupReservationsInterval);
    roomService.listenRoomChange((event) => {
      if (event.type === "join") {
        this.removeReservedSpaceIn(event.roomId);
      }
    });
  }

  joinRoomFor(groupId: string): Room | undefined {
    const office = this.officeService.getOffice();
    const group = office.groups.find((group) => group.id === groupId);
    if (!group || !group.groupJoin) {
      return undefined;
    }

    const groupRooms = office.rooms.filter((room) => room.groupId === groupId);
    if (groupRooms.length === 0) {
      return undefined;
    }
    const notEmptyRooms = groupRooms.filter((room) => this.participantsInRoom(room) > 0);
    const roomWithMinimum = minBy(notEmptyRooms, (room) => this.participantsInRoom(room));
    const availableMinimumCount = roomWithMinimum ? this.participantsInRoom(roomWithMinimum) : 0;
    const roomsWithMinimumParticipantCount = this.roomsWithParticipants(groupRooms, availableMinimumCount);

    // First fill up rooms that are not empty, but have less participants than we configured
    if (availableMinimumCount > 0 && availableMinimumCount < group.groupJoin.minimumParticipantCount) {
      return randomRoomIn(roomsWithMinimumParticipantCount);
    }

    // Then start an empty room
    const emptyRooms = this.roomsWithParticipants(groupRooms, 0);
    if (emptyRooms.length > 0) {
      return randomRoomIn(emptyRooms);
    }

    // And when no empty rooms are available, but all rooms have participants above the threshold, take
    // a room with a minimum number of participants.
    const chosenRoom = randomRoomIn(roomsWithMinimumParticipantCount);

    this.reserveSpaceIn(chosenRoom.id);

    return chosenRoom;
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

  participantsInRoom(room: RoomWithParticipants): number {
    const reserved = this.reservedSpaces[room.id] || [];
    const participants = room.participants.length;
    return participants + reserved.length;
  }

  private roomsWithParticipants(rooms: RoomWithParticipants[], count: number): RoomWithParticipants[] {
    return rooms.filter((room) => this.participantsInRoom(room) === count);
  }
}
