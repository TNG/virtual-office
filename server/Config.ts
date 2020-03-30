import { Service } from "typedi";
import { Room } from "./express/types/Room";
import defaultRooms from "./rooms_config.json";

export interface SlackConfig {
  clientId: string;
  secret: string;
}

@Service()
export class Config {
  public readonly port = process.env.PORT || 8080;
  public readonly slack = Config.readSlackConfig();
  public readonly rooms: Room[] = Config.readRooms();

  constructor() {}

  private static readSlackConfig(): SlackConfig {
    const secret = process.env.SLACK_SECRET;
    const clientId = process.env.SLACK_CLIENT_ID;
    if (!secret || !clientId) {
      throw new Error("Slack Config invalid: SLACK_SECRET and SLACK_CLIENT_ID must be set.");
    }

    return {
      clientId,
      secret,
    };
  }

  private static readRooms(): Room[] {
    if (process.env.ROOM_CONFIG) {
      return JSON.parse(process.env.ROOM_CONFIG);
    }
    if (process.env.ROOMS_CONFIG_LOCATION) {
      return require(process.env.ROOMS_CONFIG_LOCATION);
    }
    return defaultRooms;
  }
}
