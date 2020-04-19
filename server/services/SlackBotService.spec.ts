import { RoomsService } from "./RoomsService";
import { Config } from "../Config";
import { anything, instance, mock, when } from "ts-mockito";
import { RoomEvent } from "../express/types/RoomEvent";
import { SlackBotService } from "./SlackBotService";

const mockDateNow = jest.spyOn(Date, "now");
// @ts-ignore
Date.now = mockDateNow;

jest.useFakeTimers();

// @ts-ignore
const mockPostMessage = jest.fn().mockReturnValue(Promise.resolve({ ts: 12345 }));

jest.mock("@slack/web-api", () => ({
  __esModule: true,
  WebClient: jest.fn().mockImplementation(() => {
    return { chat: { postMessage: mockPostMessage } };
  }),
}));

describe("SlackBotService", () => {
  // @ts-ignore
  let slackBotService: SlackBotService;
  let config: Config;
  let roomsService: RoomsService;

  let onRoomEvent: (event: RoomEvent) => void;

  beforeEach(() => {
    mockPostMessage.mockClear();
    jest.clearAllTimers();

    config = mock(Config);
    when(config.slack).thenReturn({ clientId: "", secret: "", botOAuthAccessToken: "token" });

    roomsService = mock(RoomsService);
    when(roomsService.listenRoomChange(anything())).thenCall((l) => (onRoomEvent = l));

    slackBotService = new SlackBotService(instance(config), instance(roomsService));
  });

  it("should send a message when the first participant enters a room", () => {
    const participant = { id: "123", username: "bla" };

    when(roomsService.getRoomWithParticipants("1")).thenReturn({
      id: "1",
      name: "Test",
      joinUrl: "http://bla.blub",
      participants: [participant],
      slackNotification: {
        channelId: "slackChannel",
      },
    });

    onRoomEvent({ roomId: "1", type: "join", participant });

    expect(mockPostMessage).toHaveBeenCalledWith({
      channel: "slackChannel",
      blocks: [
        {
          text: {
            text: "*Test* is occupied - <http://bla.blub|Join>",
            type: "mrkdwn",
          },
          type: "section",
        },
        {
          elements: [
            {
              text: "1 participant",
              type: "mrkdwn",
            },
          ],
          type: "context",
        },
      ],
    });
  });

  it("should send a message when the last participant leaves a room", () => {
    const participant = { id: "123", username: "bla" };

    when(roomsService.getRoomWithParticipants("1")).thenReturn({
      id: "1",
      name: "Test",
      joinUrl: "http://bla.blub",
      participants: [],
      slackNotification: {
        channelId: "slackChannel",
      },
    });

    onRoomEvent({ roomId: "1", type: "leave", participant });

    expect(mockPostMessage).toHaveBeenCalledWith({
      channel: "slackChannel",
      blocks: [
        {
          text: {
            text: "*Test* is empty - <http://bla.blub|Join>",
            type: "mrkdwn",
          },
          type: "section",
        },
      ],
    });
  });

  it("should not send messages if slack notifications are not configured", () => {
    const participant = { id: "123", username: "bla" };

    when(roomsService.getRoomWithParticipants("1")).thenReturn({
      id: "1",
      name: "Test",
      joinUrl: "http://bla.blub",
      participants: [participant],
    });

    onRoomEvent({ roomId: "1", type: "join", participant });

    expect(mockPostMessage).not.toHaveBeenCalled();
  });

  it("should send a message every 5 minutes and report the number of participants", async () => {
    let clock = 0;
    const advanceClock = (seconds) => {
      clock += seconds * 1000;
      mockDateNow.mockReturnValue(clock);
      jest.advanceTimersByTime(seconds * 1000);
    };

    // given
    const room = {
      id: "1",
      name: "Test",
      joinUrl: "http://bla.blub",
      participants: [
        { id: "123", username: "bla" },
        { id: "124", username: "bla" },
      ],
      slackNotification: {
        channelId: "slackChannel",
      },
    };
    when(roomsService.getAllRooms()).thenReturn([room]);

    expect(mockPostMessage).not.toHaveBeenCalled();

    // when
    advanceClock(30);

    // then
    expect(mockPostMessage).toHaveBeenCalledTimes(1);
    expect(mockPostMessage).toHaveBeenCalledWith({
      channel: "slackChannel",
      blocks: [
        {
          text: {
            text: "*Test* is occupied - <http://bla.blub|Join>",
            type: "mrkdwn",
          },
          type: "section",
        },
        {
          elements: [
            {
              text: "2 participants",
              type: "mrkdwn",
            },
          ],
          type: "context",
        },
      ],
    });

    // when
    advanceClock(30);

    // then
    expect(mockPostMessage).toHaveBeenCalledTimes(1);

    // when
    when(roomsService.getAllRooms()).thenReturn([
      {
        ...room,
        participants: [{ id: "123", username: "bla" }],
      },
    ]);
    advanceClock(5 * 60);

    // then
    expect(mockPostMessage).toHaveBeenCalledTimes(2);
    expect(mockPostMessage).toHaveBeenCalledWith(
      expect.objectContaining({
        channel: "slackChannel",
        blocks: expect.arrayContaining([
          {
            elements: [
              {
                text: "1 participant",
                type: "mrkdwn",
              },
            ],
            type: "context",
          },
        ]),
      })
    );
  });
});
