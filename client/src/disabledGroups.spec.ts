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

  function groupFor(config: { disabledBefore?: number; disabledAfter?: number; name: string }): Group {
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
    const notDisabledBefore = groupFor({ disabledBefore: now - 1, name: "notDisabledBefore" });
    const notDisabledAfter = groupFor({ disabledAfter: now + 1, name: "notDisabledAfter" });
    const notDisabledBeforeAndAfter = groupFor({
      disabledBefore: now - 1,
      disabledAfter: now + 1,
      name: "notDisabledBeforeAndAfter",
    });

    const groups = [
      disabledBefore,
      disabledAfter,
      disabledBeforeAndAfter,
      notDisabledBefore,
      notDisabledAfter,
      notDisabledBeforeAndAfter,
    ];

    const result = mapPotentiallyDisabledGroups(groups);

    expect(result).toEqual([
      { group: disabledBefore, isUpcoming: true, isExpired: false },
      { group: disabledAfter, isUpcoming: false, isExpired: true },
      { group: disabledBeforeAndAfter, isUpcoming: true, isExpired: true },
      { group: notDisabledBefore, isUpcoming: false, isExpired: false },
      { group: notDisabledAfter, isUpcoming: false, isExpired: false },
      { group: notDisabledBeforeAndAfter, isUpcoming: false, isExpired: false },
    ] as PotentiallyDisabledGroup[]);
  });
});
