import "reflect-metadata";

import { Container } from "typedi";
import { ConfigOptions } from "../types/ConfigOptions";
import { startTestServerWithConfig, TestServer } from "../../testUtils/startTestServerWithConfig";
import request from "supertest";
import { joinRoomEvent } from "../../testUtils/meetingEvents";

const roomId = "room1";
const config: ConfigOptions = {
  rooms: [
    {
      meetingId: roomId,
      name: "Test Room",
      joinUrl: "https://zoom.us/j/1",
    },
  ],
  groups: [],
};

describe("AdminRoute", () => {
  let server: TestServer;

  beforeEach(async () => {
    delete process.env.ADMIN_USERNAME;
    delete process.env.ADMIN_PASSWORD;
    server = await startTestServerWithConfig(config);
  });

  afterEach(() => {
    Container.reset();
  });

  describe("DELETE /api/admin/rooms/:roomId", () => {
    it("should return 200 and end the room", async () => {
      await server.sendMeetingEvent(joinRoomEvent(roomId, "user1", undefined));
      expect(await server.getParticipantIds(roomId)).toHaveLength(1);

      const response = await request(server.app).delete(`/api/admin/rooms/${roomId}`);

      expect(response.status).toBe(200);
      expect(await server.getParticipantIds(roomId)).toHaveLength(0);
    });
  });

  describe("POST /api/admin/clearAllParticipants", () => {
    it("should return 200 and clear all participants", async () => {
      await server.sendMeetingEvent(joinRoomEvent(roomId, "user1", undefined));
      expect(await server.getParticipantIds(roomId)).toHaveLength(1);

      const response = await request(server.app).post("/api/admin/clearAllParticipants");

      expect(response.status).toBe(200);
      expect(await server.getParticipantIds(roomId)).toHaveLength(0);
    });
  });

  describe("with admin credentials configured", () => {
    beforeEach(async () => {
      Container.reset();
      process.env.ADMIN_USERNAME = "admin";
      process.env.ADMIN_PASSWORD = "secret";
      server = await startTestServerWithConfig(config);
    });

    it("should return 401 when no credentials provided", async () => {
      const response = await request(server.app).delete(`/api/admin/rooms/${roomId}`);

      expect(response.status).toBe(401);
    });

    it("should return 401 when wrong credentials provided", async () => {
      const response = await request(server.app)
        .delete(`/api/admin/rooms/${roomId}`)
        .set("Authorization", "Basic " + Buffer.from("admin:wrong").toString("base64"));

      expect(response.status).toBe(401);
    });

    it("should return 200 when correct credentials provided", async () => {
      await server.sendMeetingEvent(joinRoomEvent(roomId, "user1", undefined));

      const response = await request(server.app)
        .delete(`/api/admin/rooms/${roomId}`)
        .set("Authorization", "Basic " + Buffer.from("admin:secret").toString("base64"));

      expect(response.status).toBe(200);
    });
  });
});
