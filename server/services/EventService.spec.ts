import { Config } from "../Config";
import { instance, mock, when } from "ts-mockito";
import { OfficeLegacy } from "../types/legacyTypes/OfficeLegacy";
import { EventService } from "./EventService";
import axios from "axios";
import { Settings } from "luxon";
import { OfficeService } from "./OfficeService";

jest.mock("axios");

describe("EventService", () => {
  let eventService: EventService;
  let config: Config;

  const office: OfficeLegacy = {
    schedule: {
      tracks: [],
      sessions: [
        { roomId: "1", start: "10:00", end: "12:00" },
        { roomId: "2", start: "12:00", end: "13:00" },
        { roomId: "2-2", start: "13:00", end: "14:00" },
        { groupId: "group-1", start: "14:00", end: "16:00" },
      ],
    },
    rooms: [
      {
        roomId: "1",
        meetingId: "meeting-1",
        name: "Test",
        joinUrl: "http://bla.blub",
      },
      {
        roomId: "2",
        meetingId: "meeting-2",
        name: "Täst2",
        joinUrl: "http://bla.blub",
      },
      {
        roomId: "2-2",
        meetingId: "meeting-2",
        name: "Test2-2",
        joinUrl: "http://bla.blub",
      },
      {
        roomId: "3",
        groupId: "group-1",
        meetingId: "meeting-3",
        name: "Test3",
        joinUrl: "http://bla.blub",
      },
    ],
    groups: [{ id: "group-1", name: "Group 1" }],
  };

  beforeEach(() => {
    config = mock(Config);
    when(config.configOptions).thenReturn(office);
    when(config.clientConfig).thenReturn({ theme: "dark", viewMode: "list", sessionStartMinutesOffset: 10 });
    when(config.eventWebhook).thenReturn(
      "https://my_event_backend.com/track.php?e_c=EVENT_CATEGORY&e_a=EVENT_ACTION&e_n=EVENT_NAME&uid=USER_ID"
    );

    jest.resetAllMocks();

    eventService = new EventService(instance(config), new OfficeService(instance(config)));
  });

  it("should track a join event for a single room", () => {
    const meetingId = "meeting-2";
    const participant = { id: "userId", username: "username" };

    Settings.now = () => new Date(2020, 8, 21, 12, 20, 0).valueOf();

    eventService.trackJoinEvent(meetingId, participant);

    expect(axios.post).toHaveBeenCalledWith(
      "https://my_event_backend.com/track.php?e_c=Session&e_a=Join&e_n=T%C3%A4st2&uid=userId"
    );
  });

  it("should track a join event for the room of the session with the closest start date", () => {
    const meetingId = "meeting-2";
    const participant = { id: "userId", username: "username" };

    Settings.now = () => new Date(2020, 8, 21, 12, 55, 0).valueOf();

    eventService.trackJoinEvent(meetingId, participant);

    expect(axios.post).toHaveBeenCalledWith(
      "https://my_event_backend.com/track.php?e_c=Session&e_a=Join&e_n=Test2-2&uid=userId"
    );
  });

  it("should not track a join event if no active session can be found", () => {
    const meetingId = "meeting-2";
    const participant = { id: "id", username: "username" };

    Settings.now = () => new Date(2020, 8, 21, 16, 20, 0).valueOf();

    eventService.trackJoinEvent(meetingId, participant);

    expect(axios.post).not.toHaveBeenCalled();
  });

  it("should not track a join event if the event webhook is not set", () => {
    const meetingId = "meeting-2";
    const participant = { id: "id", username: "username" };

    when(config.eventWebhook).thenReturn(undefined);

    eventService.trackJoinEvent(meetingId, participant);

    expect(axios.post).not.toHaveBeenCalled();
  });

  it("should track a join event for a room in a group", () => {
    const meetingId = "meeting-3";
    const participant = { id: "userId", username: "username" };

    Settings.now = () => new Date(2020, 8, 21, 14, 20, 0).valueOf();

    eventService.trackJoinEvent(meetingId, participant);

    expect(axios.post).toHaveBeenCalledWith(
      "https://my_event_backend.com/track.php?e_c=Session&e_a=Join&e_n=Test3&uid=userId"
    );
  });
});
