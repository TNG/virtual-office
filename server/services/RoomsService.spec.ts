import { RoomsService } from "./RoomsService";
import { Config } from "../Config";
import { instance, mock, when } from "ts-mockito";

describe("RoomsService", () => {
  let roomsService: RoomsService;
  const existingRoomId = "1234";
  const existingRoom = {
    id: existingRoomId,
    name: "Test",
    joinUrl: "http://bla.blub",
  };

  beforeEach(() => {
    const config = mock(Config);

    when(config.rooms).thenReturn([existingRoom]);

    roomsService = new RoomsService(instance(config));
  });

  it("should join and leave an existing room", () => {
    const participant = { id: "123", username: "bla" };

    roomsService.joinRoom(existingRoomId, participant);

    expect(roomsService.getRoomWithParticipants(existingRoomId)).toEqual({
      ...existingRoom,
      participants: [participant],
    });

    roomsService.leaveRoom(existingRoomId, participant);

    expect(roomsService.getRoomWithParticipants(existingRoomId)).toEqual({ ...existingRoom, participants: [] });
  });

  it("should join a not existing room", () => {
    const participant = { id: "123", username: "bla" };

    roomsService.joinRoom(existingRoomId + "a", participant);

    expect(roomsService.getRoomWithParticipants(existingRoomId)).toEqual({ ...existingRoom, participants: [] });
  });

  it("should leave a not existing room", () => {
    const participant = { id: "123", username: "bla" };

    roomsService.leaveRoom(existingRoomId + "a", participant);

    expect(roomsService.getRoomWithParticipants(existingRoomId)).toEqual({ ...existingRoom, participants: [] });
  });
});
