import { search } from "./search";
import { RoomWithParticipants } from "../../server/express/types/RoomWithParticipants";
import { Office } from "../../server/express/types/Office";
import { Group } from "../../server/express/types/Group";

const groupLordRings: Group = {
  id: "a",
  name: "Lord of the Rings",
};
const groupStarWars: Group = {
  id: "b",
  name: "Star Wars",
};

const roomMordor: RoomWithParticipants = {
  id: "1",
  name: "Mordor",
  groupId: groupLordRings.id,
  joinUrl: "http://mordor.join",
  participants: [],
};
const roomBree: RoomWithParticipants = {
  id: "2",
  name: "Bree City",
  groupId: groupLordRings.id,
  joinUrl: "http://bree.join",
  participants: [
    {
      id: "frodo",
      username: "Bodo Freutlin",
      email: "chosen1@hob.biz",
      imageUrl: "http://hobbit.png",
    },
  ],
};
const roomCloud: RoomWithParticipants = {
  id: "3",
  name: "Cloud City",
  groupId: groupStarWars.id,
  joinUrl: "http://cloud.join",
  participants: [
    {
      id: "lando",
      username: "Lando Calrissian",
    },
  ],
};
const roomOutback: RoomWithParticipants = {
  id: "3",
  name: "Outback",
  joinUrl: "http://outback.join",
  participants: [
    {
      id: "shady",
      username: "Shady Guy",
    },
  ],
};

const office: Office = {
  groups: [groupLordRings, groupStarWars],
  rooms: [roomBree, roomMordor, roomCloud, roomOutback],
};

describe("search", () => {
  it("should do nothing when no search text was entered", () => {
    const result = search("", office);

    expect(result).toEqual(office);
  });

  describe("filter for room names", () => {
    it("should filter for parts of a room", () => {
      expect(search("Mor", office)).toEqual({
        groups: [groupLordRings],
        rooms: [roomMordor],
      });
    });

    it("should filter for common words", () => {
      expect(search("city", office)).toEqual({
        groups: [groupLordRings, groupStarWars],
        rooms: [roomBree, roomCloud],
      });
    });

    it("should filter case insensitive", () => {
      expect(search("BREE", office)).toEqual({
        groups: [groupLordRings],
        rooms: [roomBree],
      });
    });

    it("should find rooms without groups", () => {
      expect(search("outback", office)).toEqual({
        groups: [],
        rooms: [roomOutback],
      });
    });
  });

  describe("filter for groups", () => {
    it("should filter for parts of a group", () => {
      expect(search("Lord", office)).toEqual({
        groups: [groupLordRings],
        rooms: [roomBree, roomMordor],
      });
    });

    it("should filter case insensitive", () => {
      expect(search("RING", office)).toEqual({
        groups: [groupLordRings],
        rooms: [roomBree, roomMordor],
      });
    });
  });

  describe("filter for participants", () => {
    it("should filter for the name", () => {
      expect(search("Calrissian", office)).toEqual({
        groups: [groupStarWars],
        rooms: [roomCloud],
      });
    });

    it("should filter for the email address", () => {
      expect(search("hob.biz", office)).toEqual({
        groups: [groupLordRings],
        rooms: [roomBree],
      });
    });

    it("should find rooms without groups", () => {
      expect(search("shady", office)).toEqual({
        groups: [],
        rooms: [roomOutback],
      });
    });

    it("should not filter for the id", () => {
      expect(search("frodo", office)).toEqual({
        groups: [],
        rooms: [],
      });
    });

    it("should not filter for the image URL", () => {
      expect(search("hobbit.png", office)).toEqual({
        groups: [],
        rooms: [],
      });
    });
  });
});
