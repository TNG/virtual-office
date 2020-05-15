import { Service } from "typedi";
import { ImageElement, WebClient } from "@slack/web-api";
import { Config } from "../Config";
import { MeetingParticipantsService } from "./MeetingParticipantsService";
import { MeetingEvent } from "../express/types/MeetingEvent";
import { logger } from "../log";
import { Block, KnownBlock } from "@slack/types";
import { OfficeService } from "./OfficeService";
import { Room } from "../express/types/Room";
import { MeetingParticipant } from "../express/types/MeetingParticipant";

const LOOP_INTERVAL = 30 * 1000;

@Service({ multiple: false })
export class SlackBotService {
  private readonly slackClient;

  private lastNotificationTime: { [roomId: string]: number } = {};

  constructor(
    config: Config,
    private readonly participantsService: MeetingParticipantsService,
    private readonly officeService: OfficeService
  ) {
    if (config.slack.botOAuthAccessToken) {
      this.slackClient = new WebClient(config.slack.botOAuthAccessToken);
      this.participantsService.listenParticipantsChange((event) => this.onRoomEvent(event));

      setInterval(() => this.sendRecurringNotification(), LOOP_INTERVAL);
    }
  }

  private onRoomEvent(event: MeetingEvent) {
    this.officeService.getRoomsForMeetingId(event.meetingId).map((room) => this.handleMeetingEventForRoom(event, room));
  }

  private handleMeetingEventForRoom(event: MeetingEvent, room: Room) {
    const participants = this.participantsService.getParticipantsIn(room.meetingId).length;
    const slackNotification = room.slackNotification;
    logger.info(
      `Slack message roomEvent for room=${
        room.meetingId
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
      const participants = this.participantsService.getParticipantsIn(room.meetingId);
      if (room.slackNotification && participants.length > 0 && this.shouldSendRecurringNotification(room)) {
        this.sendParticipantUpdate(room, participants);
      }
    });
  }

  private sendParticipantUpdate(room: Room, participants: MeetingParticipant[]) {
    const imageElements: ImageElement[] = participants
      .filter((participant) => participant.imageUrl)
      .map((participant) => ({
        type: "image",
        image_url: participant.imageUrl,
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
    this.lastNotificationTime[room.meetingId] = Date.now();

    (async () => {
      const res = await this.slackClient.chat.postMessage({
        channel: room.slackNotification.channelId,
        blocks,
      });

      // `res` contains information about the posted message
      logger.info("Slack message sent", res.ts);
    })();
  }

  private shouldSendRecurringNotification(room: Room) {
    return (
      room.slackNotification.notificationInterval &&
      (!this.lastNotificationTime[room.meetingId] ||
        Date.now() - this.lastNotificationTime[room.meetingId] >
          room.slackNotification.notificationInterval * 60 * 1000)
    );
  }
}
