import { search } from "./search";
import { RoomWithParticipants } from "./types/RoomWithParticipants";

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
const rooms: RoomWithParticipants[] = [room1, room2];

describe("search", () => {
  it("should do nothing when no search text was entered", () => {
    const result = search("", rooms);

    expect(result).toEqual(rooms);
  });

  describe("filter for room names", () => {
    it("should filter for parts of a room", () => {
      expect(search("second", rooms)).toEqual([room2]);
    });

    it("should filter for common words", () => {
      expect(search("my", rooms)).toEqual([room1, room2]);
    });

    it("should filter case insensitive", () => {
      expect(search("SECOND", rooms)).toEqual([room2]);
    });
  });

  describe("filter for groups", () => {
    it("should filter for parts of a group", () => {
      expect(search("group", rooms)).toEqual([room1]);
    });

    it("should filter case insensitive", () => {
      expect(search("GROUP", rooms)).toEqual([room1]);
    });
  });

  describe("filter for participants", () => {
    it("should filter for the name", () => {
      expect(search("max", rooms)).toEqual([room2]);
    });

    it("should filter for the email address", () => {
      expect(search("example.com", rooms)).toEqual([room2]);
    });

    it("should filter for the id", () => {
      expect(search("participant_1", rooms)).toEqual([room2]);
    });

    it("should not filter for id parts", () => {
      expect(search("_1", rooms)).toEqual([]);
    });

    it("should not filter for the image URL", () => {
      expect(search("image.png", rooms)).toEqual([]);
    });
  });
});
