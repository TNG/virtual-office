import { Service } from "typedi";
import { findRootDir } from "./express/utils/findRootDir";
import { v4 as uuid } from "uuid";
import { ConfigOptions } from "./express/types/ConfigOptions";
import { ClientConfig } from "./express/types/ClientConfig";
import { logger } from "./log";

export interface SlackConfig {
  clientId: string;
  secret: string;
  callbackURL?: string;
  botOAuthAccessToken?: string;
}

export interface ZoomConfig {
  clientId: string;
  secret: string;
  callbackURL?: string;
}

export interface Credentials {
  username: string;
  password: string;
}

const DAYS_30_MS = 1000 * 60 * 60 * 24 * 30;

@Service()
export class Config {
  public readonly port = process.env.PORT || 8080;
  public readonly slack = Config.readSlackConfig();
  public readonly zoom = Config.readZoomConfig();
  public readonly configOptions: ConfigOptions = Config.readConfigFromFile();
  public readonly sessionSecret = process.env.SESSION_SECRET || uuid();
  public readonly cookieMaxAgeMs = parseInt(process.env.COOKIE_MAX_AGE_MS || `${DAYS_30_MS}`, 10);
  public readonly disableAuth = !!process.env.DISABLE_AUTH;
  public readonly enableParticipantLogging = process.env.ENABLE_PARTICIPANT_LOGGING === "true";
  public readonly adminEndpointsCredentials?: Credentials = Config.readAdminEndpointsCredentials();
  public readonly anonymousParticipants = process.env.ANONYMOUS_PARTICIPANTS === "true";
  public readonly clientConfig: ClientConfig = Config.readClientConfig();
  public readonly writeOfficeUpdatesToFileSystem = process.env.WRITE_OFFICE_UPDATES_TO_FILE_SYSTEM === "true";
  public readonly eventWebhook = process.env.EVENT_WEBHOOK;

  constructor() {}

  private static readClientConfig(): ClientConfig {
    const backgroundUrl = process.env.BACKGROUND_URL;
    const theme = process.env.THEME;
    const viewMode = process.env.VIEW_MODE;

    return { backgroundUrl, theme: theme as any, viewMode: viewMode as any };
  }

  private static readSlackConfig(): SlackConfig | undefined {
    const secret = process.env.SLACK_SECRET;
    const clientId = process.env.SLACK_CLIENT_ID;
    const callbackURL = process.env.SLACK_CALLBACK_URL;
    const botOAuthAccessToken = process.env.SLACK_BOT_OAUTH_ACCESS_TOKEN;
    if (!secret || !clientId) {
      logger.info("Zoom authentication disabled, ZOOM_SECRET and ZOOM_CLIENT_ID must be set.");
      return undefined;
    }

    logger.info("Slack authentication enabled");

    return {
      clientId,
      secret,
      callbackURL,
      botOAuthAccessToken,
    };
  }

  private static readZoomConfig(): ZoomConfig | undefined {
    const secret = process.env.ZOOM_SECRET;
    const clientId = process.env.ZOOM_CLIENT_ID;
    const callbackURL = process.env.ZOOM_CALLBACK_URL;
    if (!secret || !clientId) {
      logger.info("Zoom authentication disabled, ZOOM_SECRET and ZOOM_CLIENT_ID must be set.");
      return undefined;
    }

    logger.info("Zoom authentication enabled");

    return {
      clientId,
      secret,
      callbackURL,
    };
  }

  public static getConfigFile(): string {
    return process.env.CONFIG_LOCATION || `${findRootDir()}/server/office.json`;
  }

  private static readConfigFromFile(): ConfigOptions {
    if (process.env.CONFIG) {
      return JSON.parse(process.env.CONFIG);
    }
    return require(Config.getConfigFile());
  }

  private static readAdminEndpointsCredentials(): Credentials | undefined {
    if (process.env.ADMIN_USERNAME && process.env.ADMIN_PASSWORD) {
      return {
        username: process.env.ADMIN_USERNAME,
        password: process.env.ADMIN_PASSWORD,
      };
    }
    return undefined;
  }
}
