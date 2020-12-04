import { expect } from "chai";
import { search } from "./search";
import { Room, RoomWithMeetingId } from "../../server/express/types/Room";
import { Office } from "../../server/express/types/Office";
import { Group } from "../../server/express/types/Group";
import { Meeting } from "../../server/express/types/Meeting";
import { keyBy } from "lodash";

const groupLordRings: Group = {
  id: "a",
  name: "Lord of the Rings",
};
const groupStarWars: Group = {
  id: "b",
  name: "Star Wars",
};

const roomMordor: RoomWithMeetingId = {
  meetingId: "1",
  roomId: "room1",
  name: "Mordor",
  groupId: groupLordRings.id,
  joinUrl: "http://mordor.join",
};
const roomBree: RoomWithMeetingId = {
  meetingId: "2",
  roomId: "room2",
  name: "Bree City",
  groupId: groupLordRings.id,
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
    participants: [
      {
        id: "frodo",
        username: "Bodo Freutlin",
        email: "chosen1@hob.biz",
        imageUrl: "http://hobbit.png",
      },
    ],
  },
  {
    meetingId: roomCloud.meetingId,
    participants: [
      {
        id: "lando",
        username: "Lando Calrissian",
      },
    ],
  },
  {
    meetingId: roomOutback.meetingId,
    participants: [
      {
        id: "shady",
        username: "Shady Guy",
      },
    ],
  },
];
const meetingsIndexed = keyBy(meetings, (meeting) => meeting.meetingId);

const office: Office = {
  groups: [groupLordRings, groupStarWars],
  rooms: [roomBree, roomMordor, roomCloud, roomOutback],
};

describe("search", () => {
  it("should do nothing when no search text was entered", () => {
    const result = search("", office, meetingsIndexed);

    expect(result).to.deep.equal(office);
  });

  describe("filter for room names", () => {
    it("should filter for parts of a room", () => {
      expect(search("Mor", office, meetingsIndexed)).to.deep.equal({
        groups: [groupLordRings],
        rooms: [roomMordor],
      });
    });

    it("should filter for common words", () => {
      expect(search("city", office, meetingsIndexed)).to.deep.equal({
        groups: [groupLordRings, groupStarWars],
        rooms: [roomBree, roomCloud],
      });
    });

    it("should filter case insensitive", () => {
      expect(search("BREE", office, meetingsIndexed)).to.deep.equal({
        groups: [groupLordRings],
        rooms: [roomBree],
      });
    });

    it("should find rooms without groups", () => {
      expect(search("outback", office, meetingsIndexed)).to.deep.equal({
        groups: [],
        rooms: [roomOutback],
      });
    });
  });

  describe("filter for groups", () => {
    it("should filter for parts of a group", () => {
      expect(search("Lord", office, meetingsIndexed)).to.deep.equal({
        groups: [groupLordRings],
        rooms: [roomBree, roomMordor],
      });
    });

    it("should filter case insensitive", () => {
      expect(search("RING", office, meetingsIndexed)).to.deep.equal({
        groups: [groupLordRings],
        rooms: [roomBree, roomMordor],
      });
    });
  });

  describe("filter for participants", () => {
    it("should filter for the name", () => {
      expect(search("Calrissian", office, meetingsIndexed)).to.deep.equal({
        groups: [groupStarWars],
        rooms: [roomCloud],
      });
    });

    it("should filter for the email address", () => {
      expect(search("hob.biz", office, meetingsIndexed)).to.deep.equal({
        groups: [groupLordRings],
        rooms: [roomBree],
      });
    });

    it("should find rooms without groups", () => {
      expect(search("shady", office, meetingsIndexed)).to.deep.equal({
        groups: [],
        rooms: [roomOutback],
      });
    });

    it("should not filter for the id", () => {
      expect(search("frodo", office, meetingsIndexed)).to.deep.equal({
        groups: [],
        rooms: [],
      });
    });

    it("should not filter for the image URL", () => {
      expect(search("hobbit.png", office, meetingsIndexed)).to.deep.equal({
        groups: [],
        rooms: [],
      });
    });
  });
});
