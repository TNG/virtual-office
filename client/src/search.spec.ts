import { search } from "./search";
import { RoomWithParticipants } from "../../server/express/types/RoomWithParticipants";
import { Office } from "../../server/express/types/Office";

const room1: RoomWithParticipants = {
  id: "1",
  participants: [],
  joinUrl: "http://bla.blub",
  name: "my room name",
  group: "grouP",
};
const room2: RoomWithParticipants = {
  id: "2",
  participants: [
    {
      id: "participant_1",
      username: "max",
      email: "max.mustermann@example.com",
      imageUrl: "http://bla.com/image.png",
    },
    {
      id: "participant_2_minimal",
      username: "moritz",
    },
  ],
  joinUrl: "http://bla.blub",
  name: "my second room name",
};
const office: Office = { groups: [], rooms: [room1, room2] };

describe("search", () => {
  it("should do nothing when no search text was entered", () => {
    const result = search("", office);

    expect(result).toEqual(office);
  });

  describe("filter for room names", () => {
    it("should filter for parts of a room", () => {
      expect(search("second", office).rooms).toEqual([room2]);
    });

    it("should filter for common words", () => {
      expect(search("my", office).rooms).toEqual([room1, room2]);
    });

    it("should filter case insensitive", () => {
      expect(search("SECOND", office).rooms).toEqual([room2]);
    });
  });

  describe("filter for groups", () => {
    it("should filter for parts of a group", () => {
      expect(search("group", office).rooms).toEqual([room1]);
    });

    it("should filter case insensitive", () => {
      expect(search("GROUP", office).rooms).toEqual([room1]);
    });
  });

  describe("filter for participants", () => {
    it("should filter for the name", () => {
      expect(search("max", office).rooms).toEqual([room2]);
    });

    it("should filter for the email address", () => {
      expect(search("example.com", office).rooms).toEqual([room2]);
    });

    it("should filter for the id", () => {
      expect(search("participant_1", office).rooms).toEqual([room2]);
    });

    it("should not filter for id parts", () => {
      expect(search("_1", office).rooms).toEqual([]);
    });

    it("should not filter for the image URL", () => {
      expect(search("image.png", office).rooms).toEqual([]);
    });
  });
});
