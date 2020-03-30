import { User } from "../express/types/User";
import { Service } from "typedi";
import { comparableUsername } from "../express/utils/compareableUsername";

export type UserUpdateListener = (user: User) => void;

@Service({ multiple: false })
export class KnownUsersService {
  private knownUsers: User[] = [];
  private userUpdateListeners: UserUpdateListener[] = [];

  constructor() {}

  remove(toRemove: User) {
    this.knownUsers = this.knownUsers.filter((user) => user.name !== toRemove.name);
  }

  add(user: User) {
    this.remove(user);
    this.knownUsers.push(user);
    this.notify(user);
  }

  find(username: string): User | undefined {
    return this.knownUsers.find((user) => comparableUsername(user.name) === comparableUsername(username));
  }

  public listen(listener: UserUpdateListener) {
    this.userUpdateListeners.push(listener);
  }

  private notify(user: User) {
    this.userUpdateListeners.forEach((listener) => listener(user));
  }
}
