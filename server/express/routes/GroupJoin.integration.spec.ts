import "reflect-metadata";

import { Container } from "typedi";
import { ConfigOptions } from "../types/ConfigOptions";
import { range } from "lodash";

import { startTestServerWithConfig, TestServer } from "../../testUtils/startTestServerWithConfig";
import { joinRoomEvent } from "../../testUtils/meetingEvents";
import { sleep } from "../../testUtils/sleep";

const groupId = "myGroupId";
const room1 = {
  id: "1",
  name: "Lobby",
  joinUrl: `https://zoom.us/j/1`,
  groupId,
};
const room2 = {
  id: "2",
  name: "Lobby",
  joinUrl: `https://zoom.us/j/2`,
  groupId,
};
const rooms = [room1, room2];
const config: ConfigOptions = {
  rooms,
  groups: [
    {
      id: groupId,
      name: "someName",
      groupJoin: {
        description: "",
        minimumParticipantCount: 2,
      },
    },
  ],
};

describe("GroupJoin", () => {
  let server: TestServer;
  beforeEach(async () => {
    server = await startTestServerWithConfig(config);
  });

  afterEach(() => {
    Container.reset();
  });

  async function joinGroupRoom(user: any) {
    const timeToWaitInTheBeginning = Math.random() * 300;
    await sleep(timeToWaitInTheBeginning);

    const roomId = await server.joinGroup(groupId);

    const timeToClick = Math.random() * 2000;
    await sleep(timeToClick);

    await server.sendMeetingEvent(joinRoomEvent(roomId, `user_${user}`, undefined));
  }

  it("should handle one joining user", async () => {
    const userId = "abc";

    const roomId = await server.joinGroup(groupId);
    await server.sendMeetingEvent(joinRoomEvent(roomId, userId, undefined));

    expect(await server.getParticipantIds(roomId)).toEqual([`zoomus_${roomId}_${userId}`]);
  });

  it("should distribute more users equally", async () => {
    const count = 50;
    await Promise.all(range(count).map(async (_, index) => await joinGroupRoom(index)));

    expect(await server.getParticipantIds(room1.id)).toHaveLength(count / 2);
    expect(await server.getParticipantIds(room2.id)).toHaveLength(count / 2);
  });
});
