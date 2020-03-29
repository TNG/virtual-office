import { RoomsService } from "./RoomsService";
import { Config } from "../Config";
import { instance, mock, when } from "ts-mockito";
import { KnownUsersService } from "./KnownUsersService";
import { RoomEvent } from "../express/types/RoomEvent";

describe("RoomsService", () => {
  let roomsService: RoomsService;
  let knownUsersService: KnownUsersService;

  const existingRoomId = "1234";
  const existingRoom = {
    id: existingRoomId,
    name: "Test",
    joinUrl: "http://bla.blub",
  };

  const listener = jest.fn();

  beforeEach(() => {
    const config = mock(Config);
    knownUsersService = mock(KnownUsersService);

    when(config.rooms).thenReturn([existingRoom]);

    roomsService = new RoomsService(instance(config), instance(knownUsersService));
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

  it("can enrich a participant", () => {
    const participant = { id: "123", username: "bla" };
    let knownUser = {
      imageUrl: "http://bla.blub",
      email: "bla@example.com",
      name: "Hello World",
      id: "1234",
    };
    when(knownUsersService.find(participant.username)).thenReturn(knownUser);

    roomsService.joinRoom(existingRoomId, participant);

    expect(roomsService.getRoomWithParticipants(existingRoomId)).toEqual({
      ...existingRoom,
      participants: [{ ...participant, email: knownUser.email, imageUrl: knownUser.imageUrl }],
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

  it("notifies on enter", () => {
    const participant = { id: "123", username: "bla" };
    roomsService.listen(listener);

    roomsService.joinRoom(existingRoomId, participant);

    expect(listener).toHaveBeenCalledWith({
      type: "join",
      roomId: existingRoomId,
      participant,
    } as RoomEvent);
  });

  it("notifies on leave", () => {
    const participant = { id: "123", username: "bla" };
    roomsService.joinRoom(existingRoomId, participant);
    roomsService.listen(listener);

    roomsService.leaveRoom(existingRoomId, participant);

    expect(listener).toHaveBeenCalledWith({
      type: "leave",
      roomId: existingRoomId,
      participant,
    } as RoomEvent);
  });
});
