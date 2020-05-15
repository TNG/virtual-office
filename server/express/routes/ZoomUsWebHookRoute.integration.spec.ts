import "reflect-metadata";

import { Container } from "typedi";
import { ConfigOptions } from "../types/ConfigOptions";
import { startTestServerWithConfig, TestServer } from "../../testUtils/startTestServerWithConfig";
import { endMeetingEvent, joinRoomEvent, leaveRoomEvent } from "../../testUtils/meetingEvents";

const room1 = {
  id: "1",
  name: "Lobby",
  joinUrl: `https://zoom.us/j/1`,
};
const room2 = {
  id: "2",
  name: "Lobby",
  joinUrl: `https://zoom.us/j/2`,
};
const rooms = [room1, room2];
const config: ConfigOptions = {
  rooms,
  groups: [],
};

describe("Zoomus Webhooks", () => {
  let server: TestServer;
  beforeEach(async () => {
    server = await startTestServerWithConfig(config);
  });

  afterEach(() => {
    Container.reset();
  });

  it("should handle joining users", async () => {
    const userId = "abc";
    await server.sendMeetingEvent(joinRoomEvent(room1.id, userId, undefined));

    expect(await server.getParticipantIds(room1.id)).toEqual([`zoomus_${room1.id}_${userId}`]);
  });

  it("should handle leave room events", async () => {
    const user1 = "1";
    const user2 = "2";
    await server.sendMeetingEvent(joinRoomEvent(room1.id, user1, undefined));
    await server.sendMeetingEvent(joinRoomEvent(room1.id, user2, undefined));
    await server.sendMeetingEvent(leaveRoomEvent(room1.id, user1, undefined));

    expect(await server.getParticipantIds(room1.id)).toEqual([`zoomus_${room1.id}_${user2}`]);
  });

  it("should handle end meeting events", async () => {
    const user1 = "1";
    const user2 = "2";
    await server.sendMeetingEvent(joinRoomEvent(room1.id, user1, undefined));
    await server.sendMeetingEvent(joinRoomEvent(room1.id, user2, undefined));
    await server.sendMeetingEvent(endMeetingEvent(room1.id));

    expect(await server.getParticipantIds(room1.id)).toHaveLength(0);
  });
});
