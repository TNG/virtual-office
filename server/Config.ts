import { Service } from "typedi";
import { Room } from "./express/types/Room";
import { findRootDir } from "./express/utils/findRootDir";
import { v4 as uuid } from "uuid";

export interface SlackConfig {
  clientId: string;
  secret: string;
  callbackURL?: string;
}

const DAYS_30_MS = 1000 * 60 * 60 * 24 * 30;

@Service()
export class Config {
  public readonly port = process.env.PORT || 8080;
  public readonly slack = Config.readSlackConfig();
  public readonly rooms: Room[] = Config.readRooms();
  public readonly sessionSecret = process.env.SESSION_SECRET || uuid();
  public readonly cookieMaxAgeMs = parseInt(process.env.COOKIE_MAX_AGE_MS || `${DAYS_30_MS}`, 10);
  public readonly disableAuthOnApi = !!process.env.DISABLE_AUTH_ON_API;

  constructor() {}

  private static readSlackConfig(): SlackConfig {
    const secret = process.env.SLACK_SECRET;
    const clientId = process.env.SLACK_CLIENT_ID;
    const callbackURL = process.env.SLACK_CALLBACK_URL;
    if (!secret || !clientId) {
      throw new Error("Slack Config invalid: SLACK_SECRET and SLACK_CLIENT_ID must be set.");
    }

    return {
      clientId,
      secret,
      callbackURL,
    };
  }

  private static readRooms(): Room[] {
    if (process.env.ROOM_CONFIG) {
      return JSON.parse(process.env.ROOM_CONFIG);
    }
    return require(process.env.ROOMS_CONFIG_LOCATION || `${findRootDir()}/server/rooms_config.json`);
  }
}
