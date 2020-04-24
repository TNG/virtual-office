import { GroupJoinService } from "./GroupJoinService";
import { OfficeService } from "./OfficeService";
import { instance, mock, when } from "ts-mockito";
import { Group } from "../express/types/Group";
import { RoomWithParticipants } from "../express/types/RoomWithParticipants";
import { MeetingParticipant } from "../express/types/MeetingParticipant";
import { v4 as uuid } from "uuid";

describe("GroupJoinService", () => {
  let groupJoinService: GroupJoinService;
  let officeService: OfficeService;

  const groupId = "groupId";
  const minimum = 2;

  const groups: Group[] = [
    {
      groupJoin: { minimumParticipantCount: minimum },
      name: "bla",
      id: groupId,
    },
  ];

  const emptyRoom = roomWithParticipants(0);
  const roomWithLessThanMinimum = roomWithParticipants(minimum - 1);
  const roomWithMinimum = roomWithParticipants(minimum);
  const roomWithMoreThanMinimum = roomWithParticipants(minimum + 1);

  function roomWithParticipants(count: number): RoomWithParticipants {
    const participants = Array.from(Array(count)).map(() => ({} as MeetingParticipant));
    return {
      groupId,
      participants,
      id: uuid(),
    } as RoomWithParticipants;
  }

  beforeEach(() => {
    officeService = mock(OfficeService);
    groupJoinService = new GroupJoinService(instance(officeService));
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
});
