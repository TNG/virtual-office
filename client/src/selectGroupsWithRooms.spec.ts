import { expect } from "chai";
import { selectGroupsWithRooms, GroupWithRooms } from "./selectGroupsWithRooms";
import { Room, RoomWithMeetingId } from "../../server/express/types/Room";
import { Office } from "../../server/express/types/Office";
import { Group } from "../../server/express/types/Group";
import { Meeting } from "../../server/express/types/Meeting";
import { keyBy } from "lodash";

const groupLotr: Group = {
  id: "lotr",
  name: "Lord of the Rings",
};
const groupStarWars: Group = {
  id: "starwars",
  name: "Star Wars",
};

const roomMordor: RoomWithMeetingId = {
  meetingId: "1",
  roomId: "room1",
  name: "Mordor",
  groupId: groupLotr.id,
  joinUrl: "http://mordor.join",
};
const roomBree: RoomWithMeetingId = {
  meetingId: "2",
  roomId: "room2",
  name: "Bree City",
  groupId: groupLotr.id,
  joinUrl: "http://bree.join",
};
const roomCloud: RoomWithMeetingId = {
  meetingId: "3",
  roomId: "room3",
  name: "Cloud City",
  groupId: groupStarWars.id,
  joinUrl: "http://cloud.join",
};
const roomOutback: RoomWithMeetingId = {
  meetingId: "4",
  roomId: "room4",
  name: "Outback",
  joinUrl: "http://outback.join",
};

const meetings: Meeting[] = [
  {
    meetingId: roomMordor.meetingId,
    participants: [],
  },
  {
    meetingId: roomBree.meetingId,
    participants: [],
  },
  {
    meetingId: roomCloud.meetingId,
    participants: [],
  },
  {
    meetingId: roomOutback.meetingId,
    participants: [],
  },
];
const meetingsIndexed = keyBy(meetings, (m) => m.meetingId);

const office: Office = {
  groups: [groupLotr, groupStarWars],
  rooms: [roomBree, roomMordor, roomCloud, roomOutback],
};

describe("selectGroupsWithRooms", () => {
  it("should group rooms by their groupId", () => {
    const result = selectGroupsWithRooms(meetingsIndexed, "", office);

    const lotrEntry = result.find((e) => e.group.id === groupLotr.id);
    const starWarsEntry = result.find((e) => e.group.id === groupStarWars.id);

    expect(lotrEntry?.rooms).to.have.length(2);
    expect(starWarsEntry?.rooms).to.have.length(1);
  });

  it("should place rooms without a group under an empty group", () => {
    const result = selectGroupsWithRooms(meetingsIndexed, "", office);

    const noGroupEntry = result.find((e) => e.group.id === "" && e.group.name === "");

    expect(noGroupEntry).to.not.be.undefined;
    expect(noGroupEntry!.rooms).to.have.length(1);
    expect(noGroupEntry!.rooms[0].roomId).to.equal(roomOutback.roomId);
  });

  it("should filter rooms by search text", () => {
    const result = selectGroupsWithRooms(meetingsIndexed, "Mor", office);

    expect(result).to.have.length(1);
    expect(result[0].group.id).to.equal(groupLotr.id);
    expect(result[0].rooms).to.have.length(1);
    expect(result[0].rooms[0].roomId).to.equal(roomMordor.roomId);
  });

  it("should exclude groups with no matching rooms", () => {
    const result = selectGroupsWithRooms(meetingsIndexed, "Outback", office);

    const hasStarWars = result.some((e) => e.group.id === groupStarWars.id);
    const hasLotr = result.some((e) => e.group.id === groupLotr.id);

    expect(hasStarWars).to.be.false;
    expect(hasLotr).to.be.false;
  });

  it("should return all groups when no search text is entered", () => {
    const result = selectGroupsWithRooms(meetingsIndexed, "", office);

    expect(result).to.have.length(3);
  });

  it("should return empty array when no rooms match search", () => {
    const result = selectGroupsWithRooms(meetingsIndexed, "nonexistent", office);

    expect(result).to.deep.equal([]);
  });
});
