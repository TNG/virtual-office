import { OfficeService } from "./OfficeService";
import { Config } from "../Config";
import { instance, mock, when } from "ts-mockito";
import { RoomConfig } from "../express/types/Room";

describe("OfficeService", () => {
  let officeService: OfficeService;
  let config: Config;

  const existingRoom: RoomConfig = {
    roomId: "1",
    meetingId: "meeting-1",
    name: "Test",
    joinUrl: "http://bla.blub",
  };
  const existingRoom2: RoomConfig = {
    roomId: "2",
    meetingId: "meeting-2",
    name: "Test2",
    joinUrl: "http://bla.blub",
  };

  beforeEach(() => {
    config = mock(Config);
    when(config.configOptions).thenReturn({ rooms: [existingRoom, existingRoom2], groups: [] });

    officeService = new OfficeService(instance(config));
  });

  it("can create and delete temporary rooms", () => {
    const temporaryRoom: RoomConfig = {
      roomId: "3",
      meetingId: "4",
      name: "Puppenkiste",
      joinUrl: "http://kasperl.theater",
      icon: "http://my.image.com/urmel.png",
      temporary: true,
    };

    expect(officeService.getRoom(temporaryRoom.roomId)).toBeUndefined();

    officeService.createRoom(temporaryRoom);

    expect(officeService.getRoom(temporaryRoom.roomId)).not.toBeUndefined();

    officeService.deleteRoom(temporaryRoom.roomId);

    expect(officeService.getRoom(temporaryRoom.roomId)).toBeUndefined();
  });

  it("can not overwrite existing rooms", () => {
    expect(officeService.getRoom(existingRoom.roomId)).toBeDefined();

    const success = officeService.createRoom({
      ...existingRoom,
      joinUrl: "http://happy-phishing.com",
    });

    expect(success).toBe(false);
    expect(officeService.getRoom(existingRoom.roomId)).toEqual(existingRoom);
  });

  it("can not delete protected rooms", () => {
    expect(officeService.getRoom(existingRoom.roomId)).toBeDefined();

    const success = officeService.deleteRoom(existingRoom.roomId);

    expect(success).toBe(false);
    expect(officeService.getRoom(existingRoom.roomId)).toEqual(existingRoom);
  });
});
