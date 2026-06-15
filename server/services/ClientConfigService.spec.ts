import { ClientConfigService } from "./ClientConfigService.js";
import { Config } from "../Config.js";
describe("ClientConfigService", () => {
  let clientConfigService: ClientConfigService;
  let listener: jest.Mock;

  const mockConfig = {
    clientConfig: {},
  } as Pick<Config, "clientConfig"> as Config;

  beforeEach(() => {
    clientConfigService = new ClientConfigService(mockConfig);
    listener = jest.fn();
  });

  it("returns default config when no clientConfig overrides", () => {
    const config = clientConfigService.getClientConfig();

    expect(config.viewMode).toBe("grid");
    expect(config.theme).toBe("dark");
    expect(config.sessionStartMinutesOffset).toBe(10);
  });

  it("merges partial overrides via updateClientConfig", () => {
    clientConfigService.updateClientConfig({ theme: "light" });

    const config = clientConfigService.getClientConfig();
    expect(config.theme).toBe("light");
    expect(config.viewMode).toBe("grid");
    expect(config.sessionStartMinutesOffset).toBe(10);
  });

  it("notifies listeners on config change", () => {
    clientConfigService.listenClientConfig(listener);

    clientConfigService.updateClientConfig({ theme: "light" });

    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener).toHaveBeenCalledWith(
      expect.objectContaining({ theme: "light" })
    );
  });

  it("supports multiple listeners", () => {
    const listener2 = jest.fn();
    clientConfigService.listenClientConfig(listener);
    clientConfigService.listenClientConfig(listener2);

    clientConfigService.updateClientConfig({ viewMode: "list" });

    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener2).toHaveBeenCalledTimes(1);
  });

  it("accumulates updates", () => {
    clientConfigService.updateClientConfig({ theme: "light" });
    clientConfigService.updateClientConfig({ viewMode: "list" });

    const config = clientConfigService.getClientConfig();
    expect(config.theme).toBe("light");
    expect(config.viewMode).toBe("list");
  });
});
