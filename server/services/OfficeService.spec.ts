import { OfficeService } from "./OfficeService";
import { Config } from "../Config";
import { instance, mock, when } from "ts-mockito";
import { RoomLegacy } from "../express/types/RoomLegacy";

describe("OfficeService", () => {
  let officeService: OfficeService;
  let config: Config;

  const existingRoom: RoomLegacy = {
    roomId: "1",
    meetingId: "meeting-1",
    name: "Test",
    joinUrl: "http://bla.blub",
  };
  const existingRoom2: RoomLegacy = {
    roomId: "2",
    meetingId: "meeting-2",
    name: "Test2",
    description: "Come in and chill out",
    joinUrl: "http://bla.blub",
  };

  beforeEach(() => {
    config = mock(Config);
    when(config.clientConfig).thenReturn({ timezone: undefined, sessionStartMinutesOffset: 10 } as any);
    when(config.configOptions).thenReturn({ rooms: [existingRoom, existingRoom2], groups: [] });

    officeService = new OfficeService(instance(config));
  });

  describe("should sort the schedule by start time", () => {
    const configOptions = {
      rooms: [existingRoom, existingRoom2],
      groups: [],
      schedule: {
        sessions: [
          { start: "14:00", end: "14:30", roomId: existingRoom2.roomId },
          { start: "11:00", end: "11:30", roomId: existingRoom.roomId },
        ],
        tracks: [],
      },
    };

    it("on initial load", () => {
      when(config.configOptions).thenReturn(configOptions);

      officeService = new OfficeService(instance(config));

      expect(officeService.getOffice().schedule?.sessions).toEqual([
        { start: "11:00", end: "11:30", roomId: existingRoom.roomId },
        { start: "14:00", end: "14:30", roomId: existingRoom2.roomId },
      ]);
    });

    it("on replaceConfig", () => {
      officeService.replaceOfficeWith(configOptions);

      expect(officeService.getOffice().schedule?.sessions).toEqual([
        { start: "11:00", end: "11:30", roomId: existingRoom.roomId },
        { start: "14:00", end: "14:30", roomId: existingRoom2.roomId },
      ]);
    });
  });

  it("can create and delete temporary rooms", () => {
    const temporaryRoom: RoomLegacy = {
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
