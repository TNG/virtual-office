import { Service } from "typedi";
import { Config } from "../Config";
import { ClientConfig } from "../express/types/ClientConfig";

const defaultClientConfig: ClientConfig = {
  viewMode: "grid",
  theme: "yellow",
};

export type ClientConfigListener = (config: ClientConfig) => void;

@Service()
export class ClientConfigService {
  private clientConfig: ClientConfig;
  private listeners: ClientConfigListener[] = [];

  constructor(config: Config) {
    this.updateClientConfig(config.configOptions.clientConfig);
  }

  public getClientConfig(): ClientConfig {
    return this.clientConfig;
  }

  updateClientConfig(clientConfig: Partial<ClientConfig> = {}) {
    this.clientConfig = {
      ...defaultClientConfig,
      ...clientConfig,
    };
    this.listeners.forEach((listener) => listener(this.clientConfig));
  }

  public listenClientConfig(listener: ClientConfigListener) {
    this.listeners.push(listener);
  }
}
