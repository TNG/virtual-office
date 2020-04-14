import { isEqual } from "lodash";

import { User } from "../../client/src/types/User";
import { Service } from "typedi";
import { comparableUsername } from "../express/utils/compareableUsername";

export type UserUpdateListener = (user: User) => void;

@Service({ multiple: false })
export class KnownUsersService {
  private userUpdateListeners: UserUpdateListener[] = [];
  private knownUsers: { [comparableUsername: string]: User } = {};

  remove(toRemove: User): User | undefined {
    const foundElement = this.find(toRemove.name);
    if (foundElement) {
      delete this.knownUsers[comparableUsername(toRemove.name)];
    }
    return foundElement;
  }

  add(user: User) {
    const removed = this.remove(user);
    this.knownUsers[comparableUsername(user.name)] = user;
    if (!isEqual(user, removed)) {
      this.notify(user);
    }
  }

  find(username: string): User | undefined {
    return this.knownUsers[comparableUsername(username)];
  }

  public listen(listener: UserUpdateListener) {
    this.userUpdateListeners.push(listener);
  }

  private notify(user: User) {
    this.userUpdateListeners.forEach((listener) => listener(user));
  }
}
