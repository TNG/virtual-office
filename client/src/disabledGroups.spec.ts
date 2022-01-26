import { expect } from "chai";
import { install, InstalledClock } from "@sinonjs/fake-timers";
import { Group } from "../../server/express/types/Group";
import { v4 as uuid } from "uuid";
import { DateTime } from "luxon";
import { mapPotentiallyDisabledGroups, PotentiallyDisabledGroup } from "./disabledGroups";

describe("disabledRooms", () => {
  let clock: InstalledClock;
  const now = 10000;

  afterEach(() => {
    clock.uninstall();
  });

  beforeEach(() => {
    clock = install({ now: now });
  });

  function groupFor(config: {
    disabledBefore?: number;
    disabledAfter?: number;
    joinableAfter?: number;
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
      joinableAfter: toIsoString(config.joinableAfter),
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
    const joinableAfter = groupFor({ joinableAfter: now - 1, name: "joinableAfter" });
    const joinableAfterAndDisabledAfter = groupFor({
      disabledAfter: now - 1,
      joinableAfter: now - 2,
      name: "joinableAfterAndDisabledAfter",
    });
    const notDisabledBefore = groupFor({ disabledBefore: now - 1, name: "notDisabledBefore" });
    const notDisabledAfter = groupFor({ disabledAfter: now + 1, name: "notDisabledAfter" });
    const notDisabledBeforeAndAfter = groupFor({
      disabledBefore: now - 1,
      disabledAfter: now + 1,
      name: "notDisabledBeforeAndAfter",
    });
    const notJoinableAfter = groupFor({ joinableAfter: now + 1, name: "notJoinableAfter" });

    const groups = [
      disabledBefore,
      disabledAfter,
      disabledBeforeAndAfter,
      joinableAfter,
      joinableAfterAndDisabledAfter,
      notDisabledBefore,
      notDisabledAfter,
      notDisabledBeforeAndAfter,
      notJoinableAfter,
    ];

    const result = mapPotentiallyDisabledGroups(groups, undefined);

    expect(result).to.deep.equal([
      { group: disabledBefore, isUpcoming: true, isExpired: false, isJoinable: false },
      { group: disabledAfter, isUpcoming: false, isExpired: true, isJoinable: false },
      { group: disabledBeforeAndAfter, isUpcoming: true, isExpired: true, isJoinable: false },
      { group: joinableAfter, isUpcoming: false, isExpired: false, isJoinable: true },
      { group: joinableAfterAndDisabledAfter, isUpcoming: false, isExpired: true, isJoinable: false },
      { group: notDisabledBefore, isUpcoming: false, isExpired: false, isJoinable: true },
      { group: notDisabledAfter, isUpcoming: false, isExpired: false, isJoinable: true },
      { group: notDisabledBeforeAndAfter, isUpcoming: false, isExpired: false, isJoinable: true },
      { group: notJoinableAfter, isUpcoming: false, isExpired: false, isJoinable: false },
    ] as PotentiallyDisabledGroup[]);
  });
});
