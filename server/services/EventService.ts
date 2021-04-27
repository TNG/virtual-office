import axios from "axios";
import { Service } from "typedi";
import { Config } from "../Config";
import { logger } from "../log";
import { MeetingParticipantLegacy } from "../types/legacyTypes/MeetingLegacy";
import { OfficeService } from "./OfficeService";

@Service()
export class EventService {
  constructor(private config: Config, private officeService: OfficeService) {}

  async trackJoinEvent(meetingId: string, toJoin: MeetingParticipantLegacy) {
    const activeRoom = this.officeService.getActiveRoom(meetingId);
    if (activeRoom) {
      await this.trackEvent(toJoin.id, "Session", "Join", activeRoom?.name);
    }
  }

  async trackEvent(userId: string, eventCategory: string, eventAction: string, eventName?: string) {
    if (this.config.eventWebhook) {
      const webhookTemplate = this.config.eventWebhook
        .replace("USER_ID", encodeURIComponent(userId))
        .replace("EVENT_CATEGORY", encodeURIComponent(eventCategory))
        .replace("EVENT_ACTION", encodeURIComponent(eventAction))
        .replace("EVENT_NAME", encodeURIComponent(eventName || ""));
      try {
        await axios.post(webhookTemplate);
      } catch (error) {
        logger.error("Failed to track event", error);
      }
    }
  }
}
