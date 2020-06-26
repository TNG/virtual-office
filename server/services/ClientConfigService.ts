import { Service } from "typedi";
import { Config } from "../Config";
import { ClientConfig } from "../express/types/ClientConfig";

@Service()
export class ClientConfigService {
  private readonly clientConfig: ClientConfig;

  constructor(config: Config) {
    this.clientConfig = config.configOptions.clientConfig ?? {
      viewMode: "grid",
    };
  }

  public getClientConfig(): ClientConfig {
    return this.clientConfig;
  }
}
