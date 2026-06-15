import "reflect-metadata";

import { Container } from "typedi";
import { ConfigOptions } from "../types/ConfigOptions.js";
import { startTestServerWithConfig, TestServer } from "../../testUtils/startTestServerWithConfig.js";
import request from "supertest";

const config: ConfigOptions = {
  rooms: [],
  groups: [],
};

describe("MonitoringRoute", () => {
  let server: TestServer;

  beforeEach(async () => {
    server = await startTestServerWithConfig(config);
  });

  afterEach(() => {
    Container.reset();
  });

  it("should return 200 and OK on GET /api/monitoring/health", async () => {
    const response = await request(server.app).get("/api/monitoring/health");

    expect(response.status).toBe(200);
    expect(response.text).toBe("OK");
  });
});
