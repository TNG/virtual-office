import { capture, instance, mock, when } from "ts-mockito";
import { v4 as uuid } from "uuid";
import { range } from "lodash";
import fakeTimers, { InstalledClock } from "@sinonjs/fake-timers";

import { GroupJoinService } from "./GroupJoinService";
import { OfficeService } from "./OfficeService";
import { Group } from "../express/types/Group";
import { MeetingParticipant } from "../express/types/MeetingParticipant";
import { MeetingsService } from "./MeetingsService";
import { MeetingEvent } from "../express/types/MeetingEvent";
import { Room } from "../express/types/Room";

describe("GroupJoinService", () => {
  let groupJoinService: GroupJoinService;
  let officeService: OfficeService;
  let participantsService: MeetingsService;

  const groupId = "groupId";
  const minimum = 2;

  const group = {
    groupJoin: {
      minimumParticipantCount: minimum,
      title: "Humpty Dumpty",
      description: "Take me somewhere funny",
    },
    name: "bla",
    id: groupId,
  };

  const groups: Group[] = [group];

  const emptyRoom = randomRoom();
  const roomWithLessThanMinimum = randomRoom();
  const roomWithMinimum = randomRoom();
  const roomWithMoreThanMinimum = randomRoom();

  function randomRoom(): Room {
    return {
      groupId,
      roomId: `room__${uuid()}`,
      meetingId: `meeting__${uuid()}`,
    } as Room;
  }

  function generateParticipants(count: number): MeetingParticipant[] {
    return range(count).map(() => ({} as MeetingParticipant));
  }

  let clock: InstalledClock<any>;

  afterEach(() => {
    clock.uninstall();
  });

  beforeEach(() => {
    clock = fakeTimers.install({ now: 1 });
    officeService = mock(OfficeService);
    participantsService = mock(MeetingsService);

    when(participantsService.getParticipantsIn(emptyRoom.meetingId)).thenReturn([]);
    when(participantsService.getParticipantsIn(roomWithLessThanMinimum.meetingId)).thenReturn(
      generateParticipants(minimum - 1)
    );
    when(participantsService.getParticipantsIn(roomWithMinimum.meetingId)).thenReturn(generateParticipants(minimum));
    when(participantsService.getParticipantsIn(roomWithMoreThanMinimum.meetingId)).thenReturn(
      generateParticipants(minimum + 1)
    );

    groupJoinService = new GroupJoinService(instance(officeService), instance(participantsService));
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
      const roomA = randomRoom();
      const roomB = randomRoom();
      when(participantsService.getParticipantsIn(roomA.meetingId)).thenReturn(generateParticipants(1));
      when(participantsService.getParticipantsIn(roomB.meetingId)).thenReturn(generateParticipants(2));

      when(officeService.getOffice()).thenReturn({
        rooms: [roomA, roomB],
        groups,
      });

      groupJoinService.reserveSpaceIn(roomA.meetingId);
      groupJoinService.reserveSpaceIn(roomA.meetingId);

      const room = groupJoinService.joinRoomFor(groupId);

      expect(room).toEqual(roomB);
    });

    it("should remove reservations when a participant joins", () => {
      const room = randomRoom();
      when(participantsService.getParticipantsIn(room.meetingId)).thenReturn(generateParticipants(1));

      groupJoinService.reserveSpaceIn(room.meetingId);

      expect(groupJoinService.participantsInRoom(room)).toEqual(2);
      const listener = capture(participantsService.listenParticipantsChange).last()[0];
      (listener as any)({
        meetingId: room.meetingId,
        type: "join",
      } as MeetingEvent);
    });

    it("should ignore participant leave events", () => {
      const room = randomRoom();
      when(participantsService.getParticipantsIn(room.meetingId)).thenReturn(generateParticipants(1));

      groupJoinService.reserveSpaceIn(room.meetingId);

      const listener = capture(participantsService.listenParticipantsChange).last()[0];
      (listener as any)({
        meetingId: room.meetingId,
        type: "leave",
      } as MeetingEvent);

      expect(groupJoinService.participantsInRoom(room)).toEqual(2);
    });

    it("should remove outdated reservations in a given interval", () => {
      const room = randomRoom();
      when(participantsService.getParticipantsIn(room.meetingId)).thenReturn([]);

      when(officeService.getOffice()).thenReturn({
        rooms: [room],
        groups,
      });

      groupJoinService.reserveSpaceIn(room.meetingId);
      expect(groupJoinService.participantsInRoom(room)).toEqual(1);

      clock.tick(20000);

      groupJoinService.reserveSpaceIn(room.meetingId);
      expect(groupJoinService.participantsInRoom(room)).toEqual(2);

      clock.tick(60000);

      expect(groupJoinService.participantsInRoom(room)).toEqual(1);

      clock.tick(30000);

      expect(groupJoinService.participantsInRoom(room)).toEqual(0);
    });
  });
});
