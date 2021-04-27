import { parseTime } from "./time";
import { DateTime } from "luxon";
import { ClientConfig } from "../../server/types/ClientConfig";
import { Session } from "../../server/types/Session";

export function sessionHasEnded({ end }: Session, { timezone }: ClientConfig): boolean {
  const zone = timezone;
  const endTime = parseTime(end, zone);
  const now = DateTime.local();
  return now >= endTime;
}

export function sessionIsActive(
  { start, end }: Session,
  { timezone, sessionStartMinutesOffset }: ClientConfig
): boolean {
  const zone = timezone;
  const startTime = parseTime(start, zone).minus({ minute: sessionStartMinutesOffset ?? 0 });
  const endTime = parseTime(end, zone);
  const now = DateTime.local();

  return startTime < now && endTime > now;
}
