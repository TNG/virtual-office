import "reflect-metadata";

import { Container } from "typedi";
import { ConfigOptionsLegacy } from "../types/ConfigOptionsLegacy";
import { startTestServerWithConfig, TestServer } from "../../testUtils/startTestServerWithConfig";
import { endMeetingEvent, joinRoomEvent, leaveRoomEvent } from "../../testUtils/meetingEvents";

const room1 = {
  meetingId: "1",
  name: "Lobby",
  joinUrl: `https://zoom.us/j/1`,
};
const room2 = {
  meetingId: "2",
  name: "Lobby",
  joinUrl: `https://zoom.us/j/2`,
};
const rooms = [room1, room2];
const config: ConfigOptionsLegacy = {
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
    await server.sendMeetingEvent(joinRoomEvent(room1.meetingId, userId, undefined));

    expect(await server.getParticipantIds(room1.meetingId)).toEqual([`zoomus_${room1.meetingId}_${userId}`]);
  });

  it("should handle leave room events", async () => {
    const user1 = "1";
    const user2 = "2";
    await server.sendMeetingEvent(joinRoomEvent(room1.meetingId, user1, undefined));
    await server.sendMeetingEvent(joinRoomEvent(room1.meetingId, user2, undefined));
    await server.sendMeetingEvent(leaveRoomEvent(room1.meetingId, user1, undefined));

    expect(await server.getParticipantIds(room1.meetingId)).toEqual([`zoomus_${room1.meetingId}_${user2}`]);
  });

  it("should handle end meeting events", async () => {
    const user1 = "1";
    const user2 = "2";
    await server.sendMeetingEvent(joinRoomEvent(room1.meetingId, user1, undefined));
    await server.sendMeetingEvent(joinRoomEvent(room1.meetingId, user2, undefined));
    await server.sendMeetingEvent(endMeetingEvent(room1.meetingId));

    expect(await server.getParticipantIds(room1.meetingId)).toHaveLength(0);
  });
});
