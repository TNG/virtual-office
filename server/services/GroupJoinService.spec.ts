import { capture, instance, mock, when } from "ts-mockito";
import { v4 as uuid } from "uuid";
import fakeTimers, { InstalledClock } from "@sinonjs/fake-timers";

import { GroupJoinService } from "./GroupJoinService";
import { OfficeService } from "./OfficeService";
import { Group } from "../express/types/Group";
import { RoomWithParticipants } from "../express/types/RoomWithParticipants";
import { MeetingParticipant } from "../express/types/MeetingParticipant";
import { RoomsService } from "./RoomsService";
import { RoomEvent } from "../express/types/RoomEvent";

describe("GroupJoinService", () => {
  let groupJoinService: GroupJoinService;
  let officeService: OfficeService;
  let roomsService: RoomsService;

  const groupId = "groupId";
  const minimum = 2;

  const group = {
    groupJoin: {
      minimumParticipantCount: minimum,
      description: "Take me somewhere funny",
    },
    name: "bla",
    id: groupId,
  };

  const groups: Group[] = [group];

  const emptyRoom = roomWithParticipants(0);
  const roomWithLessThanMinimum = roomWithParticipants(minimum - 1);
  const roomWithMinimum = roomWithParticipants(minimum);
  const roomWithMoreThanMinimum = roomWithParticipants(minimum + 1);

  function roomWithParticipants(count: number): RoomWithParticipants {
    const participants = Array.from(Array(count)).map(() => ({} as MeetingParticipant));
    return {
      groupId,
      participants,
      id: `${count}__${uuid()}`,
    } as RoomWithParticipants;
  }

  let clock: InstalledClock<any>;

  afterEach(() => {
    clock.uninstall();
  });

  beforeEach(() => {
    clock = fakeTimers.install({ now: 1 });
    officeService = mock(OfficeService);
    roomsService = mock(RoomsService);
    groupJoinService = new GroupJoinService(instance(officeService), instance(roomsService));
  });

  it("should fill up rooms below the threshold first", () => {
    when(officeService.getOffice()).thenReturn({
      rooms: [emptyRoom, roomWithMoreThanMinimum, roomWithLessThanMinimum, roomWithMinimum],
      groups,
    });

    const room = groupJoinService.joinRoomFor(groupId);

    expect(room).toEqual(roomWithLessThanMinimum);
  });

  it("should start a new room when all services are above the threshold", () => {
    when(officeService.getOffice()).thenReturn({
      rooms: [emptyRoom, roomWithMoreThanMinimum, roomWithMinimum],
      groups,
    });

    const room = groupJoinService.joinRoomFor(groupId);

    expect(room).toEqual(emptyRoom);
  });

  it("should start filling rooms above the threshold when no empty room is left", () => {
    when(officeService.getOffice()).thenReturn({
      rooms: [roomWithMoreThanMinimum, roomWithMinimum],
      groups,
    });

    const room = groupJoinService.joinRoomFor(groupId);

    expect(room).toEqual(roomWithMinimum);
  });

  it("should return undefined when no room is available", () => {
    when(officeService.getOffice()).thenReturn({
      rooms: [],
      groups,
    });

    const room = groupJoinService.joinRoomFor(groupId);

    expect(room).toBeUndefined();
  });

  it("should return undefined when the group cannot be found", () => {
    when(officeService.getOffice()).thenReturn({
      rooms: [roomWithMinimum],
      groups,
    });

    const room = groupJoinService.joinRoomFor(groupId + "a");

    expect(room).toBeUndefined();
  });

  describe("space reservations", () => {
    it("should consider room reservations when distributing new places", () => {
      const roomA = roomWithParticipants(1);
      const roomB = roomWithParticipants(2);

      when(officeService.getOffice()).thenReturn({
        rooms: [roomA, roomB],
        groups,
      });

      groupJoinService.reserveSpaceIn(roomA.id);
      groupJoinService.reserveSpaceIn(roomA.id);

      const room = groupJoinService.joinRoomFor(groupId);

      expect(room).toEqual(roomB);
    });

    it("should remove reservations when a participant joins", () => {
      const room = roomWithParticipants(1);
      when(officeService.getOffice()).thenReturn({
        rooms: [room],
        groups,
      });

      groupJoinService.reserveSpaceIn(room.id);
      expect(groupJoinService.participantsInRoom(room)).toEqual(2);

      const listener = capture(roomsService.listenRoomChange).last()[0];
      (listener as any)({
        roomId: room.id,
        type: "join",
      } as RoomEvent);

      expect(groupJoinService.participantsInRoom(room)).toEqual(1);
    });

    it("should ignore participant leave events", () => {
      const room = roomWithParticipants(1);
      when(officeService.getOffice()).thenReturn({
        rooms: [room],
        groups,
      });

      groupJoinService.reserveSpaceIn(room.id);
      expect(groupJoinService.participantsInRoom(room)).toEqual(2);

      const listener = capture(roomsService.listenRoomChange).last()[0];
      (listener as any)({
        roomId: room.id,
        type: "leave",
      } as RoomEvent);

      expect(groupJoinService.participantsInRoom(room)).toEqual(2);
    });

    it("should remove outdated reservations in a given interval", () => {
      const room = roomWithParticipants(0);
      when(officeService.getOffice()).thenReturn({
        rooms: [room],
        groups,
      });

      groupJoinService.reserveSpaceIn(room.id);
      expect(groupJoinService.participantsInRoom(room)).toEqual(1);

      clock.tick(20000);

      groupJoinService.reserveSpaceIn(room.id);
      expect(groupJoinService.participantsInRoom(room)).toEqual(2);

      clock.tick(60000);

      expect(groupJoinService.participantsInRoom(room)).toEqual(1);

      clock.tick(30000);

      expect(groupJoinService.participantsInRoom(room)).toEqual(0);
    });
  });
});
