import { Service } from "typedi";
import { minBy, random } from "lodash";

import { Room } from "../express/types/Room";
import { OfficeService } from "./OfficeService";
import { RoomWithParticipants } from "../express/types/RoomWithParticipants";

function randomRoomIn(rooms: RoomWithParticipants[]): RoomWithParticipants | undefined {
  const entry = random(0, rooms.length - 1);
  return rooms[entry];
}

@Service()
export class GroupJoinService {
  constructor(private readonly officeService: OfficeService) {}

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
    const notEmptyRooms = groupRooms.filter((room) => room.participants.length > 0);
    const availableMinimumCount = minBy(notEmptyRooms, (room) => room.participants.length)?.participants?.length || 0;
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
    return randomRoomIn(roomsWithMinimumParticipantCount);
  }

  private roomsWithParticipants(rooms: RoomWithParticipants[], count: number): RoomWithParticipants[] {
    return rooms.filter((room) => room.participants.length === count);
  }
}
