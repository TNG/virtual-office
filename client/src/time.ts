import { DateTime } from "luxon";

export function parseTime(time: string, zone?: string): DateTime {
  return DateTime.fromFormat(time, "HH:mm", { zone }).toLocal();
}

export function printHoursMinutes(dateTime: DateTime): string {
  return dateTime.toLocaleString(DateTime.TIME_SIMPLE);
}

export function browserTimeZone(): string {
  return DateTime.local().toFormat("ZZZZ");
}

export function browserTimeZone(): string {
  return DateTime.local().toFormat("ZZZZ");
}
