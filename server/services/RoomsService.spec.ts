import { RoomsService } from "./RoomsService";
import { Config } from "../Config";
import { instance, mock, when } from "ts-mockito";
import { KnownUsersService } from "./KnownUsersService";
import { RoomEvent } from "../express/types/RoomEvent";
import { User } from "../express/types/User";

describe("RoomsService", () => {
  let roomsService: RoomsService;
  let knownUsersService: KnownUsersService;

  const existingRoomId = "1234";
  const existingRoom = {
    id: existingRoomId,
    name: "Test",
    joinUrl: "http://bla.blub",
  };

  let listener: jest.Mock;

  beforeEach(() => {
    const config = mock(Config);
    knownUsersService = mock(KnownUsersService);
    listener = jest.fn();

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

  it("won't notify on enter when the user is already in the room", () => {
    const participant = { id: "123", username: "bla" };
    roomsService.joinRoom(existingRoomId, participant);

    roomsService.listen(listener);
    roomsService.joinRoom(existingRoomId, participant);

    expect(listener).not.toHaveBeenCalled();
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

  it("notifies leave for all participants on meeting end", () => {
    const participant = { id: "123", username: "bla" };
    roomsService.joinRoom(existingRoomId, participant);
    roomsService.listen(listener);

    roomsService.endRoom(existingRoomId);

    expect(listener).toHaveBeenCalledWith({
      type: "leave",
      roomId: existingRoomId,
      participant,
    } as RoomEvent);
  });

  it("can update a user", () => {
    const user: User = {
      name: "Hans Wurst",
      id: "abc",
      email: "hans.wurst@gmail.com",
      imageUrl: "http://my.image.com/myImage.png",
    };
    const participant = { id: "123", username: user.name.toLowerCase() };
    roomsService.joinRoom(existingRoomId, participant);
    roomsService.listen(listener);

    roomsService.onUserUpdate(user);

    expect(listener).toHaveBeenCalledWith({
      participant: {
        ...participant,
        imageUrl: user.imageUrl,
        email: user.email,
      },
      roomId: existingRoomId,
      type: "update",
    } as RoomEvent);
  });
});
