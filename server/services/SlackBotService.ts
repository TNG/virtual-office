import { Block, KnownBlock } from "@slack/types";
import { ImageElement, WebClient } from "@slack/web-api";
import { Service } from "typedi";
import { Config } from "../Config";
import { MeetingEvent } from "../express/types/MeetingEvent";
import { MeetingParticipant } from "../express/types/MeetingParticipant";
import { hasSlackNotifications, RoomWithSlackNotification } from "../express/types/Room";
import { logger } from "../log";
import { MeetingsService } from "./MeetingsService";
import { OfficeService } from "./OfficeService";

@Service({ multiple: false })
export class SlackBotService {
  private readonly slackClient: WebClient;

  private slackMessageIdsPerRoom: { [roomId: string]: string } = {};

  constructor(
    config: Config,
    private readonly meetingsService: MeetingsService,
    private readonly officeService: OfficeService
  ) {
    if (!config.slackBotOAuthAccessToken) {
      throw Error("No slack bot config found");
    }

    this.slackClient = new WebClient(config.slackBotOAuthAccessToken);
    this.meetingsService.listenParticipantsChange((event) => this.onRoomEvent(event));
  }

  private onRoomEvent(event: MeetingEvent) {
    this.officeService
      .getRoomsForMeetingId(event.meetingId)
      .filter(hasSlackNotifications)
      .map((room) =>
        this.sendSlackNotificationOnMeetingEvent(event, room).catch((error) =>
          logger.error("Failed to send slack notification", error)
        )
      );
  }

  private async sendSlackNotificationOnMeetingEvent(event: MeetingEvent, room: RoomWithSlackNotification) {
    const participants = this.meetingsService.getParticipantsIn(room.meetingId);
    const slackNotification = room.slackNotification;
    logger.info(
      `Slack message roomEvent for room=${
        room.roomId
      }, roomFound=${!!room}, slackNotification=${!!slackNotification}, participants=${
        participants.length
      }, eventType=${event.type}`
    );

    if (event.type === "join" || event.type === "leave") {
      await this.sendParticipantUpdate(room, participants);
    }
  }

  private async sendParticipantUpdate(room: RoomWithSlackNotification, participants: MeetingParticipant[]) {
    const imageElements: ImageElement[] = participants
      .filter((participant) => participant.imageUrl)
      .map((participant) => ({
        type: "image",
        image_url: participant.imageUrl || "",
        alt_text: participant.username,
      }));

    const blocks: KnownBlock[] = [
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `*${room.name}* is ${participants.length > 0 ? "occupied" : "empty"} - <${room.joinUrl}|Join>`,
        },
      },
    ];

    if (participants.length > 0) {
      blocks.push({
        type: "context",
        elements: [
          ...imageElements,
          {
            type: "mrkdwn",
            text: `${participants.length} participant${participants.length > 1 ? "s" : ""}`,
          },
        ],
      });
    }
    const slackMessageId = this.slackMessageIdsPerRoom[room.roomId]
      ? await this.updateMessageForRoom(room, blocks)
      : await this.sendMessageToRoom(room, blocks);

    if (participants.length > 0) {
      this.slackMessageIdsPerRoom[room.roomId] = slackMessageId;
    } else {
      delete this.slackMessageIdsPerRoom[room.roomId];
    }
  }

  private async sendMessageToRoom(room: RoomWithSlackNotification, blocks: (KnownBlock | Block)[]): Promise<string> {
    const res = await this.slackClient.chat.postMessage({
      channel: room.slackNotification.channelId,
      text: "",
      blocks,
    });

    return res.ts as string;
  }

  private async updateMessageForRoom(room: RoomWithSlackNotification, blocks: (KnownBlock | Block)[]): Promise<string> {
    const existingSlackMessageId = this.slackMessageIdsPerRoom[room.roomId];
    if (!existingSlackMessageId) {
      throw Error(`No slack message found for room ${room.roomId}`);
    }

    const res = await this.slackClient.chat.update({
      ts: existingSlackMessageId,
      channel: room.slackNotification.channelId,
      text: "",
      blocks,
    });

    return res.ts as string;
  }
}
