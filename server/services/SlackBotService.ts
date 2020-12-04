import { Service } from "typedi";
import { ImageElement, WebClient } from "@slack/web-api";
import { Config } from "../Config";
import { MeetingsService } from "./MeetingsService";
import { MeetingEvent } from "../express/types/MeetingEvent";
import { logger } from "../log";
import { Block, KnownBlock } from "@slack/types";
import { OfficeService } from "./OfficeService";
import { hasSlackNotifications, Room } from "../express/types/Room";
import { MeetingParticipant } from "../express/types/MeetingParticipant";
import { MarkRequired } from "ts-essentials";

const LOOP_INTERVAL = 30 * 1000;

@Service({ multiple: false })
export class SlackBotService {
  private readonly slackClient: WebClient | undefined;

  private lastNotificationTime: { [roomId: string]: number } = {};

  constructor(
    config: Config,
    private readonly meetingsService: MeetingsService,
    private readonly officeService: OfficeService
  ) {
    if (config.slack && config.slack.botOAuthAccessToken) {
      this.slackClient = new WebClient(config.slack.botOAuthAccessToken);
      this.meetingsService.listenParticipantsChange((event) => this.onRoomEvent(event));

      setInterval(() => this.sendRecurringNotification(), LOOP_INTERVAL);
    }
  }

  private onRoomEvent(event: MeetingEvent) {
    this.officeService.getRoomsForMeetingId(event.meetingId).map((room) => this.handleMeetingEventForRoom(event, room));
  }

  private handleMeetingEventForRoom(event: MeetingEvent, room: Room) {
    const participants = this.meetingsService.getParticipantsIn(room.roomId).length;
    const slackNotification = room.slackNotification;
    logger.info(
      `Slack message roomEvent for room=${
        room.roomId
      }, roomFound=${!!room}, slackNotification=${!!slackNotification}, participants=${participants}, eventType=${
        event.type
      }`
    );

    if (event.type === "join") {
      if (slackNotification && participants === 1) {
        this.sendMessageToRoom(room, [
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text: `*${room.name}* is occupied - <${room.joinUrl}|Join>`,
            },
          },
        ]);
      }
    } else if (event.type === "leave") {
      if (slackNotification && participants === 0) {
        this.sendMessageToRoom(room, [
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text: `*${room.name}* is empty - <${room.joinUrl}|Join>`,
            },
          },
        ]);
      }
    }
  }

  private sendRecurringNotification() {
    const rooms = this.officeService.getOffice().rooms;
    rooms.forEach((room) => {
      const participants = this.meetingsService.getParticipantsIn(room.roomId);
      if (hasSlackNotifications(room) && participants.length > 0 && this.shouldSendRecurringNotification(room)) {
        this.sendParticipantUpdate(room, participants);
      }
    });
  }

  private sendParticipantUpdate(room: Room, participants: MeetingParticipant[]) {
    const imageElements: ImageElement[] = participants
      .filter((participant) => participant.imageUrl)
      .map((participant) => ({
        type: "image",
        image_url: participant.imageUrl || "",
        alt_text: participant.username,
      }));

    this.sendMessageToRoom(room, [
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `*${room.name}* is occupied - <${room.joinUrl}|Join>`,
        },
      },
      {
        type: "context",
        elements: [
          ...imageElements,
          {
            type: "mrkdwn",
            text: `${participants.length} participant${participants.length > 1 ? "s" : ""}`,
          },
        ],
      },
    ]);
  }

  private sendMessageToRoom(room: Room, blocks: (KnownBlock | Block)[]) {
    this.lastNotificationTime[room.roomId] = Date.now();

    (async () => {
      if (!this.slackClient || !room.slackNotification) {
        return;
      }

      const res = await this.slackClient.chat.postMessage({
        channel: room.slackNotification.channelId,
        text: "",
        blocks,
      });

      // `res` contains information about the posted message
      logger.info("Slack message sent", res.ts);
    })();
  }

  private shouldSendRecurringNotification(room: MarkRequired<Room, "slackNotification">) {
    return (
      room.slackNotification.notificationInterval &&
      (!this.lastNotificationTime[room.roomId] ||
        Date.now() - this.lastNotificationTime[room.roomId] > room.slackNotification.notificationInterval * 60 * 1000)
    );
  }
}
