import { enrichParticipant } from "./enrichUser";
import { MeetingParticipant } from "../types/MeetingParticipant";
import { User } from "../types/User";

describe("enrichParticipant", () => {
  const participant: MeetingParticipant = {
    id: "1",
    username: "testuser",
  };
  const user: User = {
    id: "1",
    name: "Test User",
    email: "test@example.com",
    imageUrl: "http://avatar.png",
  };

  it("should fill missing email from user", () => {
    const result = enrichParticipant(participant, user);
    expect(result.email).toBe("test@example.com");
  });

  it("should fill missing imageUrl from user", () => {
    const result = enrichParticipant(participant, user);
    expect(result.imageUrl).toBe("http://avatar.png");
  });

  it("should not overwrite existing email", () => {
    const withEmail = { ...participant, email: "existing@example.com" };
    const result = enrichParticipant(withEmail, user);
    expect(result.email).toBe("existing@example.com");
  });

  it("should not overwrite existing imageUrl", () => {
    const withImage = { ...participant, imageUrl: "http://existing.png" };
    const result = enrichParticipant(withImage, user);
    expect(result.imageUrl).toBe("http://existing.png");
  });

  it("should preserve other participant fields", () => {
    const result = enrichParticipant(participant, user);
    expect(result.id).toBe("1");
    expect(result.username).toBe("testuser");
  });
});
