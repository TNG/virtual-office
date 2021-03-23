import axios from "axios";
import { Service } from "typedi";
import { Config } from "../Config";
import { OfficeService } from "./OfficeService";
import { logger } from "../log";
import Timeout = NodeJS.Timeout;
import { Room } from "../express/types/Room";

const MAPPING_UPDATE_INTERVAL = 15 * 60 * 1000;

@Service({ multiple: false })
export class ZoomWebhookService {
  timeout: Timeout | undefined;

  constructor(private config: Config, private readonly officeService: OfficeService) {
    if (config.zoomWebhookApi && this.config.baseUrl) {
      this.officeService.listenOfficeChanges(() => this.sendMappingUpdate());
      this.setMappingUpdateTimeout();
      this.sendMappingUpdate();
    } else {
      logger.info("ZOOM_WEBHOOK_API or BASE_URL not configured, not sending mapping update");
    }
  }

  private setMappingUpdateTimeout() {
    if (this.timeout) {
      clearTimeout(this.timeout);
    }
    this.timeout = setTimeout(() => this.sendMappingUpdate(), MAPPING_UPDATE_INTERVAL);
  }

  private async sendMappingUpdate() {
    if (this.config.zoomWebhookApi && this.config.baseUrl) {
      const updateMappingEndpoint = this.config.zoomWebhookApi + "/mapping";

      const meetingIds = new Set<string>();

      const rooms = this.officeService.getAllRooms();
      rooms.forEach((room: Room) => room.meetingId && meetingIds.add(room.meetingId));

      const mappingUpdate = {
        endpoint: this.config.baseUrl + "/api/zoomus/webhook",
        meetingIds: Array.from(meetingIds),
      };

      try {
        await axios.post(updateMappingEndpoint, mappingUpdate, {});
        logger.info(`Sent mapping update to ${updateMappingEndpoint}`);
        logger.debug("Mapping update", mappingUpdate);
      } catch (e) {
        logger.error("Could not send mapping update", { error: e?.response?.data });
      }

      this.setMappingUpdateTimeout();
    }
  }
}
