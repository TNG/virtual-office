import { Service } from "typedi";

export interface SlackConfig {
  clientId: string;
  secret: string;
}

@Service()
export class Config {
  public readonly port = process.env.port || 8080;
  public readonly slack = Config.readSlackConfig();

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
}
