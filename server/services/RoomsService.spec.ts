import { RoomsService } from "./RoomsService";
import { Config } from "../Config";
import { instance, mock, when } from "ts-mockito";
import { KnownUsersService } from "./KnownUsersService";
import { RoomEvent } from "../express/types/RoomEvent";
import { User } from "../express/types/User";

describe("RoomsService", () => {
  let roomsService: RoomsService;
  let knownUsersService: KnownUsersService;

  const existingRoom = {
    id: "1",
    name: "Test",
    joinUrl: "http://bla.blub",
  };
  const existingRoom2 = {
    id: "2",
    name: "Test2",
    joinUrl: "http://bla.blub",
  };

  let listener: jest.Mock;

  beforeEach(() => {
    const config = mock(Config);
    knownUsersService = mock(KnownUsersService);
    listener = jest.fn();

    when(config.rooms).thenReturn([existingRoom, existingRoom2]);

    roomsService = new RoomsService(instance(config), instance(knownUsersService));
  });

  it("should join and leave an existing room", () => {
    const participant = { id: "123", username: "bla" };

    roomsService.joinRoom(existingRoom.id, participant);

    expect(roomsService.getRoomWithParticipants(existingRoom.id)).toEqual({
      ...existingRoom,
      participants: [participant],
    });

    roomsService.leave(participant);

    expect(roomsService.getRoomWithParticipants(existingRoom.id)).toEqual({ ...existingRoom, participants: [] });
  });

  it("should automatically leave any existing room when joining a new room", () => {
    const participant = { id: "123", username: "bla" };

    roomsService.joinRoom(existingRoom2.id, participant);
    roomsService.joinRoom(existingRoom.id, participant);

    expect(roomsService.getRoomWithParticipants(existingRoom.id)).toEqual({
      ...existingRoom,
      participants: [participant],
    });
    expect(roomsService.getRoomWithParticipants(existingRoom2.id)).toEqual({ ...existingRoom2, participants: [] });
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

    roomsService.joinRoom(existingRoom.id, participant);

    expect(roomsService.getRoomWithParticipants(existingRoom.id)).toEqual({
      ...existingRoom,
      participants: [{ ...participant, email: knownUser.email, imageUrl: knownUser.imageUrl }],
    });

    roomsService.leave(participant);

    expect(roomsService.getRoomWithParticipants(existingRoom.id)).toEqual({ ...existingRoom, participants: [] });
  });

  it("should join a not existing room", () => {
    const participant = { id: "123", username: "bla" };

    roomsService.joinRoom(existingRoom.id + "a", participant);

    expect(roomsService.getRoomWithParticipants(existingRoom.id)).toEqual({ ...existingRoom, participants: [] });
  });

  it("notifies on enter", () => {
    const participant = { id: "123", username: "bla" };
    roomsService.listen(listener);

    roomsService.joinRoom(existingRoom.id, participant);

    expect(listener).toHaveBeenCalledWith({
      type: "join",
      roomId: existingRoom.id,
      participant,
    } as RoomEvent);
  });

  it("won't notify on enter when the user is already in the room", () => {
    const participant = { id: "123", username: "bla" };
    roomsService.joinRoom(existingRoom.id, participant);

    roomsService.listen(listener);
    roomsService.joinRoom(existingRoom.id, participant);

    expect(listener).not.toHaveBeenCalled();
  });

  it("notifies on leave", () => {
    const participant = { id: "123", username: "bla" };
    roomsService.joinRoom(existingRoom.id, participant);
    roomsService.listen(listener);

    roomsService.leave(participant);

    expect(listener).toHaveBeenCalledWith({
      type: "leave",
      roomId: existingRoom.id,
      participant,
    } as RoomEvent);
  });

  it("notifies leave for all participants on meeting end", () => {
    const participant = { id: "123", username: "bla" };
    roomsService.joinRoom(existingRoom.id, participant);
    roomsService.listen(listener);

    roomsService.endRoom(existingRoom.id);

    expect(listener).toHaveBeenCalledWith({
      type: "leave",
      roomId: existingRoom.id,
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
    roomsService.joinRoom(existingRoom.id, participant);
    roomsService.listen(listener);

    roomsService.onUserUpdate(user);

    expect(listener).toHaveBeenCalledWith({
      participant: {
        ...participant,
        imageUrl: user.imageUrl,
        email: user.email,
      },
      roomId: existingRoom.id,
      type: "update",
    } as RoomEvent);
  });
});
