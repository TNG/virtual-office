import { User } from "../express/types/User";
import { Service } from "typedi";

@Service({ multiple: false })
export class KnownUsersService {
  private knownUsers: User[] = [];

  constructor() {}

  remove(toRemove: User) {
    this.knownUsers = this.knownUsers.filter((user) => user.name !== toRemove.name);
  }

  add(user: User) {
    this.remove(user);
    this.knownUsers.push(user);
  }

  find(username: string): User | undefined {
    const toComparable = (username) => username.toLowerCase().replace(/\s/g, "").normalize().replace("ß", "ss");
    return this.knownUsers.find((user) => toComparable(user.name) === toComparable(username));
  }
}
