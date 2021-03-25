import { Session } from "../../server/express/types/Session";
import { parseTime } from "./time";
import { DateTime } from "luxon";
import { ClientConfig } from "../../server/express/types/ClientConfig";

export function sessionIsOver({ end }: Session, { timezone }: ClientConfig): boolean {
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
