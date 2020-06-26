import { Service } from "typedi";
import { Config } from "../Config";
import { ClientConfig } from "../express/types/ClientConfig";

const defaultClientConfig = {
  viewMode: "grid",
  theme: "yellow",
};

@Service()
export class ClientConfigService {
  private readonly clientConfig: ClientConfig;

  constructor(config: Config) {
    this.clientConfig = {
      ...defaultClientConfig,
      ...config.configOptions.clientConfig,
    };
  }

  public getClientConfig(): ClientConfig {
    return this.clientConfig;
  }
}
