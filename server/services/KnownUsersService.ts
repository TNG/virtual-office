import { isEqual } from "lodash";

import { UserLegacy } from "../types/legacyTypes/UserLegacy";
import { Service } from "typedi";
import { comparableUsername } from "../express/utils/compareableUsername";

export type UserUpdateListener = (user: UserLegacy) => void;

@Service({ multiple: false })
export class KnownUsersService {
  private userUpdateListeners: UserUpdateListener[] = [];
  private knownUsers: { [comparableUsername: string]: UserLegacy } = {};

  remove(toRemove: UserLegacy): UserLegacy | undefined {
    const foundElement = this.find(toRemove.name);
    if (foundElement) {
      delete this.knownUsers[comparableUsername(toRemove.name)];
    }
    return foundElement;
  }

  add(user: UserLegacy) {
    const removed = this.remove(user);
    this.knownUsers[comparableUsername(user.name)] = user;
    if (!isEqual(user, removed)) {
      this.notify(user);
    }
  }

  find(username: string): UserLegacy | undefined {
    return this.knownUsers[comparableUsername(username)];
  }

  public listen(listener: UserUpdateListener) {
    this.userUpdateListeners.push(listener);
  }

  private notify(user: UserLegacy) {
    this.userUpdateListeners.forEach((listener) => listener(user));
  }
}
