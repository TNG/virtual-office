import "reflect-metadata";

import { Container } from "typedi";
import { ConfigOptions } from "../types/ConfigOptions";
import { startTestServerWithConfig, TestServer } from "../../testUtils/startTestServerWithConfig";
import request from "supertest";

const config: ConfigOptions = {
  rooms: [
    {
      meetingId: "1",
      name: "Lobby",
      joinUrl: "https://zoom.us/j/1",
    },
  ],
  groups: [
    {
      id: "group1",
      name: "Group One",
    },
  ],
};

describe("ApiRoute", () => {
  let server: TestServer;

  beforeEach(async () => {
    server = await startTestServerWithConfig(config);
  });

  afterEach(() => {
    Container.reset();
  });

  it("should return clientConfig on GET /api/clientConfig", async () => {
    const response = await request(server.app).get("/api/clientConfig");

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("sessionStartMinutesOffset");
  });

  it("should return office on GET /api/office", async () => {
    const response = await request(server.app).get("/api/office");

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("rooms");
    expect(response.body).toHaveProperty("groups");
  });
});
