import "reflect-metadata";
import request from "supertest";

import { Express } from "express";
import { startTestServerWithConfig } from "../../testUtils/startTestServerWithConfig";
import { Container } from "typedi";
import { ConfigOptions } from "../types/ConfigOptions";

const groupId = "1";

const room1 = {
  id: "1",
  name: "Lobby",
  group: groupId,
  joinUrl: `https://zoom.us/j/1`,
};
const room2 = {
  id: "2",
  group: groupId,
  name: "Lobby",
  joinUrl: `https://zoom.us/j/2`,
};
const rooms = [room1, room2];
const config: ConfigOptions = {
  rooms,
  groups: [
    {
      id: groupId,
      name: "dummy",
      groupJoin: {
        minimumParticipantCount: 2,
      },
    },
  ],
};

describe("ApiRoute", () => {
  let appInstance: Express;
  beforeEach(async () => {
    appInstance = await startTestServerWithConfig(config);
  });

  afterEach(() => {
    Container.reset();
  });

  describe("/groups/:groupId/join", () => {
    it("should redirect to a room", async () => {
      await request(appInstance)
        .get(`/api/groups/${groupId}/join`)
        .expect(302)
        .expect("Location", /https:\/\/zoom.us\/j\/[1,2]/g);
    });

    it("should return a 404 if the room cannot be found", async () => {
      await request(appInstance).get(`/api/groups/bla/join`).expect(404);
    });
  });
});
