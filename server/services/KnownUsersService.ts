import { isEqual } from "lodash";

import { User } from "../express/types/User";
import { Service } from "typedi";
import { comparableUsername } from "../express/utils/compareableUsername";

export type UserUpdateListener = (user: User) => void;

@Service({ multiple: false })
export class KnownUsersService {
  private userUpdateListeners: UserUpdateListener[] = [];
  private knownUsers: { [comparableUsername: string]: User } = {};

  remove(toRemove: User): User | undefined {
    if (toRemove.email) {
      const userByEmail = this.find(toRemove.email);
      if (userByEmail) {
        delete this.knownUsers[comparableUsername(toRemove.email)];
      }
    }

    const userByName = this.find(toRemove.name);
    if (userByName) {
      delete this.knownUsers[comparableUsername(toRemove.name)];
    }
    return userByName;
  }

  add(user: User) {
    const removed = this.remove(user);
    this.knownUsers[comparableUsername(user.name)] = user;
    if (user.email) {
      this.knownUsers[comparableUsername(user.email)] = user;
    }

    if (!isEqual(user, removed)) {
      this.notify(user);
    }
  }

  find(usernameOrEmail: string): User | undefined {
    return this.knownUsers[comparableUsername(usernameOrEmail)];
  }

  public listen(listener: UserUpdateListener) {
    this.userUpdateListeners.push(listener);
  }

  private notify(user: User) {
    this.userUpdateListeners.forEach((listener) => listener(user));
  }
}
