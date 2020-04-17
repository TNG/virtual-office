import { Service } from "typedi";
import { WebClient } from "@slack/web-api";
import { SlackConfig } from "../Config";
import { RoomsService } from "./RoomsService";
import { RoomEvent } from "../express/types/RoomEvent";
import { logger } from "../log";

@Service({ multiple: false })
export class SlackBotService {
  private slackClient;

  private lastNotificationTime: { [key: string]: number } = {};

  constructor(private readonly roomsService: RoomsService) {}

  init(config: SlackConfig) {
    if (config.botOAuthAccessToken && !this.slackClient) {
      this.slackClient = new WebClient(config.botOAuthAccessToken);
      this.roomsService.listenRoomChange((event) => this.onRoomEvent(event));
    }
  }

  private onRoomEvent(event: RoomEvent) {
    if (event.type === "join") {
      const room = this.roomsService.getRoomWithParticipants(event.roomId);
      if (this.shouldSendNotification(room)) {
        this.lastNotificationTime[room.id] = Date.now();

        (async () => {
          const res = await this.slackClient.chat.postMessage({
            channel: room.slackNotification.channelId,
            text: `The room '${room.name}' is now occupied!`,
          });

          // `res` contains information about the posted message
          logger.info("Slack message sent", res.ts);
        })();
      }
    }
  }

  private shouldSendNotification(room) {
    return (
      room.slackNotification &&
      room.participants.length === 1 &&
      (!this.lastNotificationTime[room.id] || this.lastNotificationTime[room.id] < Date.now() - 5 * 60 * 1000)
    );
  }
}
