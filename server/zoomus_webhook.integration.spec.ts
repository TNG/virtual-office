import "reflect-metadata";

import request from "supertest";
import { Container } from "typedi";
import { ExpressApp } from "./express/ExpressApp";
import { Express } from "express";
import { Room } from "./express/types/Room";
import { RoomWithParticipants } from "./express/types/RoomWithParticipants";

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

function participantFor(userId: string, id?: string) {
  return {
    user_id: userId,
    user_name: "shree",
    id: id,
    join_time: "2019-07-16T17:13:13Z",
  };
}

function eventFor(room: Room, event: string, participant: any) {
  return {
    event: event,
    payload: {
      account_id: "abc",
      object: {
        uuid: "uuid",
        id: room.id,
        host_id: "abc",
        topic: "My Meeting",
        type: 2,
        start_time: "2019-07-09T17:00:00Z",
        duration: 60,
        timezone: "America/Los_Angeles",
        participant: participant,
      },
    },
  };
}

function joinRoomEvent(room: Room, userId: string, id?: string) {
  return eventFor(room, "meeting.participant_joined", participantFor(userId, id));
}

function leaveRoomEvent(room: Room, userId: string, id?: string) {
  return eventFor(room, "meeting.participant_left", participantFor(userId, id));
}

function endMeetingEvent(room: Room) {
  return eventFor(room, "meeting.ended", undefined);
}

describe("Zoomus Webhooks", () => {
  let appInstance: Express;
  beforeEach(async () => {
    process.env.SLACK_SECRET = "abc";
    process.env.SLACK_CLIENT_ID = "abc";
    process.env.SLACK_CALLBACK_URL = "http://localhost";
    process.env.DISABLE_AUTH_ON_API = "true";
    process.env.ROOM_CONFIG = JSON.stringify(rooms);

    const expressApp = Container.get(ExpressApp);
    appInstance = await expressApp.create();
  });

  afterEach(() => {
    Container.reset();
  });

  async function getParticipantIds(room: Room) {
    const response = await request(appInstance).get("/api/rooms").expect(200);
    const body = response.body as RoomWithParticipants[];
    const foundRoom = body.find((foundRoom) => foundRoom.id === room.id)!!;

    return foundRoom.participants.map((participant) => participant.id);
  }

  it("should handle anonymously joining users", async () => {
    const userId = "abc";
    await request(appInstance).post("/api/zoomus/webhook").send(joinRoomEvent(room1, userId, undefined)).expect(200);

    expect(await getParticipantIds(room1)).toEqual([`zoomus_${room1.id}_${userId}`]);
  });

  it("should handle logged in joining users", async () => {
    const id = "def";
    await request(appInstance).post("/api/zoomus/webhook").send(joinRoomEvent(room1, "abc", id)).expect(200);

    expect(await getParticipantIds(room1)).toEqual([`zoomus_${id}`]);
  });

  it("should leave any room when joining a new room", async () => {
    const id = "def";
    await request(appInstance).post("/api/zoomus/webhook").send(joinRoomEvent(room1, "abc", id)).expect(200);
    await request(appInstance).post("/api/zoomus/webhook").send(joinRoomEvent(room2, "abc", id)).expect(200);

    expect(await getParticipantIds(room1)).toHaveLength(0);
    expect(await getParticipantIds(room2)).toHaveLength(1);
  });

  it("should handle leave room events", async () => {
    const user1 = "1";
    const user2 = "2";
    await request(appInstance).post("/api/zoomus/webhook").send(joinRoomEvent(room1, user1, undefined)).expect(200);
    await request(appInstance).post("/api/zoomus/webhook").send(joinRoomEvent(room1, user2, undefined)).expect(200);
    await request(appInstance).post("/api/zoomus/webhook").send(leaveRoomEvent(room1, user1, undefined)).expect(200);

    expect(await getParticipantIds(room1)).toEqual([`zoomus_${room1.id}_${user2}`]);
  });

  it("should handle end meeting events", async () => {
    const user1 = "1";
    const user2 = "2";
    await request(appInstance).post("/api/zoomus/webhook").send(joinRoomEvent(room1, user1, undefined)).expect(200);
    await request(appInstance).post("/api/zoomus/webhook").send(joinRoomEvent(room1, user2, undefined)).expect(200);
    await request(appInstance).post("/api/zoomus/webhook").send(endMeetingEvent(room1)).expect(200);

    expect(await getParticipantIds(room1)).toHaveLength(0);
  });
});
