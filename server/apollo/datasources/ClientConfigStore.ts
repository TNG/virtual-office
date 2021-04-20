import { Service } from "typedi";
import { DataSource } from "apollo-datasource";
import { Config } from "../../Config";
import { v4 as uuid } from "uuid";
import { ClientConfigApollo, ClientConfigApolloConfig, ClientConfigApolloDb } from "../TypesApollo";

export const defaultClientConfig: ClientConfigApolloDb = {
  id: uuid(),
  viewMode: "grid",
  theme: "dark",
  sessionStartMinutesOffset: 10,
};

@Service()
export class ClientConfigStore extends DataSource {
  private clientConfig: ClientConfigApolloDb = defaultClientConfig;

  constructor(config: Config) {
    super();
    this.updateClientConfig(config.clientConfig);
  }

  initialize() {
    //this.context = config.context;
  }

  updateClientConfig(clientConfig: Partial<ClientConfigApolloConfig> = {}) {
    this.clientConfig = {
      ...this.clientConfig,
      ...clientConfig,
    };
  }

  public getClientConfig(): ClientConfigApollo {
    return this.clientConfig;
  }
}
