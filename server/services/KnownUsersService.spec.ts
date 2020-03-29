import { KnownUsersService } from "./KnownUsersService";
import { User } from "../express/types/User";

describe("KnownUsersService", () => {
  let knownUsersService: KnownUsersService;
  const user: User = {
    name: "Max Mustermann",
    email: "max.mustermann@example.com",
    id: "1234",
    imageUrl: "http://example.com/myImage.png",
  };

  beforeEach(() => {
    knownUsersService = new KnownUsersService();
  });

  it("can add users", () => {
    knownUsersService.add(user);
    knownUsersService.add(user);
    knownUsersService.add(user);

    expect(knownUsersService.find(user.name)).toEqual(user);
  });

  it("can remove users", () => {
    knownUsersService.add(user);
    knownUsersService.remove(user);

    expect(knownUsersService.find(user.name)).toBeUndefined();
  });

  it("can find user by username", () => {
    knownUsersService.add(user);

    expect(knownUsersService.find(user.name)).toEqual(user);
    expect(knownUsersService.find("MaxMustermann")).toEqual(user);
    expect(knownUsersService.find("maxmustermann")).toEqual(user);
    expect(knownUsersService.find("maxmusterman")).toBeUndefined();
  });
});
