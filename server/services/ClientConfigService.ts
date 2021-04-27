import { Service } from "typedi";
import { Config } from "../Config";
import { ClientConfigLegacy } from "../types/legacyTypes/ClientConfigLegacy";

const defaultClientConfig: ClientConfigLegacy = {
  viewMode: "grid",
  theme: "dark",
  sessionStartMinutesOffset: 10,
};

export type ClientConfigListener = (config: ClientConfigLegacy) => void;

@Service()
export class ClientConfigService {
  private clientConfig: ClientConfigLegacy = defaultClientConfig;
  private listeners: ClientConfigListener[] = [];

  constructor(config: Config) {
    this.updateClientConfig(config.clientConfig);
  }

  public getClientConfig(): ClientConfigLegacy {
    return this.clientConfig;
  }

  updateClientConfig(clientConfig: Partial<ClientConfigLegacy> = {}) {
    this.clientConfig = {
      ...this.clientConfig,
      ...clientConfig,
    };
    this.listeners.forEach((listener) => listener(this.clientConfig));
  }

  public listenClientConfig(listener: ClientConfigListener) {
    this.listeners.push(listener);
  }
}
