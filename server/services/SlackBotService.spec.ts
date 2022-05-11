import { MeetingsService } from "./MeetingsService";
import { Config } from "../Config";
import { anything, instance, mock, when } from "ts-mockito";
import { MeetingEvent } from "../express/types/MeetingEvent";
import { SlackBotService } from "./SlackBotService";
import { OfficeService } from "./OfficeService";

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
  let participantsService: MeetingsService;
  let officeService: OfficeService;

  let onRoomEvent: (event: MeetingEvent) => void;

  beforeEach(() => {
    mockPostMessage.mockClear();
    jest.clearAllTimers();

    config = mock(Config);
    when(config.slackBotOAuthAccessToken).thenReturn("token");

    participantsService = mock(MeetingsService);
    officeService = mock(OfficeService);
    when(participantsService.listenParticipantsChange(anything())).thenCall((l) => (onRoomEvent = l));

    slackBotService = new SlackBotService(instance(config), instance(participantsService), instance(officeService));
  });

  it("should send a message when the first participant enters a room", () => {
    const participant = { id: "123", username: "bla" };

    when(officeService.getRoomsForMeetingId("1")).thenReturn([
      {
        meetingId: "1",
        roomId: "1",
        name: "Test",
        joinUrl: "http://bla.blub",
        slackNotification: {
          channelId: "slackChannel",
        },
      },
    ]);
    when(participantsService.getParticipantsIn("1")).thenReturn([participant]);

    onRoomEvent({ meetingId: "1", type: "join", participant });

    expect(mockPostMessage).toHaveBeenCalledWith({
      channel: "slackChannel",
      text: "",
      blocks: [
        {
          text: {
            text: "*Test* is occupied - <http://bla.blub|Join>",
            type: "mrkdwn",
          },
          type: "section",
        },
        {
          type: "context",
          elements: [
            {
              type: "mrkdwn",
              text: "1 participant",
            },
          ],
        },
      ],
    });
  });

  it("should send a message when the last participant leaves a room", () => {
    const participant = { id: "123", username: "bla" };

    when(officeService.getRoomsForMeetingId("1")).thenReturn([
      {
        meetingId: "1",
        roomId: "1",
        name: "Test",
        joinUrl: "http://bla.blub",
        slackNotification: {
          channelId: "slackChannel",
        },
      },
    ]);
    when(participantsService.getParticipantsIn("1")).thenReturn([]);

    onRoomEvent({ meetingId: "1", type: "leave", participant });

    expect(mockPostMessage).toHaveBeenCalledWith({
      channel: "slackChannel",
      text: "",
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

    when(officeService.getRoomsForMeetingId("1")).thenReturn([
      {
        meetingId: "1",
        roomId: "1",
        name: "Test",
        joinUrl: "http://bla.blub",
      },
    ]);
    when(participantsService.getParticipantsIn("1")).thenReturn([participant]);

    onRoomEvent({ meetingId: "1", type: "join", participant });

    expect(mockPostMessage).not.toHaveBeenCalled();
  });
});
