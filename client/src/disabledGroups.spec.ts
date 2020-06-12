import fakeTimers, { InstalledClock } from "@sinonjs/fake-timers";
import { Group } from "../../server/express/types/Group";
import { v4 as uuid } from "uuid";
import { DateTime } from "luxon";
import { PotentiallyDisabledGroup, mapPotentiallyDisabledGroups } from "./disabledGroups";

describe("disabledRooms", () => {
  let clock: InstalledClock;
  const now = 10000;

  afterEach(() => {
    clock.uninstall();
  });

  beforeEach(() => {
    clock = fakeTimers.install({ now: now });
  });

  function groupFor(config: {
    disabledBefore?: number;
    disabledAfter?: number;
    joinableFrom?: number;
    name: string;
  }): Group {
    function toIsoString(millis?: number): string | undefined {
      if (!millis) {
        return undefined;
      }
      return DateTime.fromMillis(millis).toISO();
    }

    const id = uuid();
    return {
      id,
      name: config.name,
      disabledBefore: toIsoString(config.disabledBefore),
      disabledAfter: toIsoString(config.disabledAfter),
      joinableFrom: toIsoString(config.joinableFrom),
    };
  }

  it("should calculate disabled groups", () => {
    const disabledBefore = groupFor({ disabledBefore: now + 1, name: "disabledBefore" });
    const disabledAfter = groupFor({ disabledAfter: now - 1, name: "disabledAfter" });
    const disabledBeforeAndAfter = groupFor({
      disabledBefore: now + 1,
      disabledAfter: now - 1,
      name: "disabledBeforeAndAfter",
    });
    const joinableFrom = groupFor({ joinableFrom: now - 1, name: "joinableFrom" });
    const joinableFromAndDisabledAfter = groupFor({ disabledAfter: now -1, joinableFrom: now - 2, name: "joinableFrom" });
    const notDisabledBefore = groupFor({ disabledBefore: now - 1, name: "notDisabledBefore" });
    const notDisabledAfter = groupFor({ disabledAfter: now + 1, name: "notDisabledAfter" });
    const notDisabledBeforeAndAfter = groupFor({
      disabledBefore: now - 1,
      disabledAfter: now + 1,
      name: "notDisabledBeforeAndAfter",
    });
    const notJoinableFrom = groupFor({ joinableFrom: now + 1, name: "notJoinableFrom" });

    const groups = [
      disabledBefore,
      disabledAfter,
      disabledBeforeAndAfter,
      joinableFrom,
      joinableFromAndDisabledAfter,
      notDisabledBefore,
      notDisabledAfter,
      notDisabledBeforeAndAfter,
      notJoinableFrom,
    ];

    const result = mapPotentiallyDisabledGroups(groups);

    expect(result).toEqual([
      { group: disabledBefore, isUpcoming: true, isExpired: false, isJoinable: false },
      { group: disabledAfter, isUpcoming: false, isExpired: true, isJoinable: false },
      { group: disabledBeforeAndAfter, isUpcoming: true, isExpired: true, isJoinable: false },
      { group: joinableFrom, isUpcoming: false, isExpired: false, isJoinable: true },
      { group: joinableFromAndDisabledAfter, isUpcoming: false, isExpired: true, isJoinable: false },
      { group: notDisabledBefore, isUpcoming: false, isExpired: false, isJoinable: true },
      { group: notDisabledAfter, isUpcoming: false, isExpired: false, isJoinable: true },
      { group: notDisabledBeforeAndAfter, isUpcoming: false, isExpired: false, isJoinable: true },
      { group: notJoinableFrom, isUpcoming: false, isExpired: false, isJoinable: false },
    ] as PotentiallyDisabledGroup[]);
  });
});
