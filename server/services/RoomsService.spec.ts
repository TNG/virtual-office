import { RoomsService } from "./RoomsService";
import { Config } from "../Config";
import { instance, mock, when } from "ts-mockito";
import { KnownUsersService } from "./KnownUsersService";
import { RoomEvent } from "../express/types/RoomEvent";
import { User } from "../express/types/User";

describe("RoomsService", () => {
  let roomsService: RoomsService;
  let knownUsersService: KnownUsersService;
  let config: Config;

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
    config = mock(Config);
    knownUsersService = mock(KnownUsersService);
    listener = jest.fn();

    when(config.configOptions).thenReturn({ rooms: [existingRoom, existingRoom2], groups: [] });
  });

  describe("with named participants", () => {
    beforeEach(() => {
      roomsService = new RoomsService(instance(config), instance(knownUsersService));
    });

    it("should join and leave an existing room", () => {
      const participant = { id: "123", username: "bla" };

      roomsService.joinRoom(existingRoom.id, participant);

      expect(roomsService.getRoomWithParticipants(existingRoom.id)).toEqual({
        ...existingRoom,
        participants: [participant],
      });

      roomsService.leave(existingRoom.id, participant);

      expect(roomsService.getRoomWithParticipants(existingRoom.id)).toEqual({ ...existingRoom, participants: [] });
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

      roomsService.leave(existingRoom.id, participant);

      expect(roomsService.getRoomWithParticipants(existingRoom.id)).toEqual({ ...existingRoom, participants: [] });
    });

    it("should join a not existing room", () => {
      const participant = { id: "123", username: "bla" };

      roomsService.joinRoom(existingRoom.id + "a", participant);

      expect(roomsService.getRoomWithParticipants(existingRoom.id)).toEqual({ ...existingRoom, participants: [] });
    });

    it("notifies on enter", () => {
      const participant = { id: "123", username: "bla" };
      roomsService.listenRoomChange(listener);

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

      roomsService.listenRoomChange(listener);
      roomsService.joinRoom(existingRoom.id, participant);

      expect(listener).not.toHaveBeenCalled();
    });

    it("notifies on leave", () => {
      const participant = { id: "123", username: "bla" };
      roomsService.joinRoom(existingRoom.id, participant);
      roomsService.listenRoomChange(listener);

      roomsService.leave(existingRoom.id, participant);

      expect(listener).toHaveBeenCalledWith({
        type: "leave",
        roomId: existingRoom.id,
        participant,
      } as RoomEvent);
    });

    it("notifies leave for all participants on meeting end", () => {
      const participant = { id: "123", username: "bla" };
      roomsService.joinRoom(existingRoom.id, participant);
      roomsService.listenRoomChange(listener);

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
      roomsService.listenRoomChange(listener);

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

    it("can create and delete temporary rooms", () => {
      const temporaryRoom = {
        id: "3",
        name: "Puppenkiste",
        joinUrl: "http://kasperl.theater",
        group: "fun",
        icon: "http://my.image.com/urmel.png",
      };

      expect(roomsService.getAllRooms().find((room) => room.id === temporaryRoom.id)).toBeUndefined();

      roomsService.createRoom(temporaryRoom);
      expect(roomsService.getAllRooms().find((room) => room.id === temporaryRoom.id)).toMatchObject(temporaryRoom);

      roomsService.deleteRoom(temporaryRoom.id);
      expect(roomsService.getAllRooms().find((room) => room.id === temporaryRoom.id)).toBeUndefined();
    });

    it("can not overwrite existing rooms", () => {
      expect(roomsService.getAllRooms().find((room) => room.id === existingRoom.id)).toBeDefined();

      const success = roomsService.createRoom({
        ...existingRoom,
        joinUrl: "http://happy-phishing.com",
      });

      expect(success).toBe(false);
      expect(roomsService.getAllRooms().find((room) => room.id === existingRoom.id)).toMatchObject(existingRoom);
    });

    it("can not delete protected rooms", () => {
      expect(roomsService.getAllRooms().find((room) => room.id === existingRoom.id)).toBeDefined();

      const success = roomsService.deleteRoom(existingRoom.id);

      expect(success).toBe(false);
      expect(roomsService.getAllRooms().find((room) => room.id === existingRoom.id)).toBeDefined();
    });
  });

  describe("with anonymous participants", () => {
    beforeEach(() => {
      when(config.anonymousParticipants).thenReturn(true);

      roomsService = new RoomsService(instance(config), instance(knownUsersService));
    });

    it("should anonymize a participant if config option is set", () => {
      const participant = { id: "123", username: "bla" };

      roomsService.joinRoom(existingRoom.id, participant);

      expect(roomsService.getRoomWithParticipants(existingRoom.id)).toEqual({
        ...existingRoom,
        participants: [{ ...participant, username: "Anonymous" }],
      });

      roomsService.leave(existingRoom.id, participant);

      expect(roomsService.getRoomWithParticipants(existingRoom.id)).toEqual({ ...existingRoom, participants: [] });
    });
  });
});
