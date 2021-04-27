import { Service } from "typedi";
import { DataSource } from "apollo-datasource";
import { Config } from "../../Config";
import { v4 as uuid } from "uuid";
import { ClientConfig, ClientConfigConfig, ClientConfigDb } from "../../types/ClientConfig";

export const defaultClientConfig: ClientConfigDb = {
  id: uuid(),
  viewMode: "grid",
  theme: "dark",
  sessionStartMinutesOffset: 10,
};

@Service()
export class ClientConfigStore extends DataSource {
  private clientConfig: ClientConfigDb = defaultClientConfig;

  constructor(config: Config) {
    super();
    this.updateClientConfig(config.clientConfig);
  }

  initialize() {
    //this.context = config.context;
  }

  updateClientConfig(clientConfig: Partial<ClientConfigConfig> = {}) {
    this.clientConfig = {
      ...this.clientConfig,
      ...clientConfig,
    };
  }

  public getClientConfig(): ClientConfig {
    return this.clientConfig;
  }
}
