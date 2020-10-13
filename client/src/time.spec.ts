import { Settings } from "luxon";
import { parseTime, printHoursMinutes } from "./time";

describe("time", () => {
  beforeEach(() => {
    Settings.defaultZoneName = "Europe/Berlin";
  });

  describe("parseTime", () => {
    it("should parse HH:mm", () => {
      const dateTime = parseTime("15:16");
      expect(dateTime.hour).toEqual(15);
      expect(dateTime.minute).toEqual(16);
    });

    it("should consider the timezone", () => {
      const dateTime = parseTime("15:16", "Asia/Samarkand");
      expect(dateTime.hour).toEqual(12);
      expect(dateTime.minute).toEqual(16);
    });
  });

  describe("printHoursMinutes", () => {
    it("should print a time zone", () => {
      const dateTime = parseTime("15:16");
      expect(printHoursMinutes(dateTime)).toEqual("3:16 PM");
    });

    it("should consider the timezone", () => {
      const dateTime = parseTime("15:16", "Asia/Samarkand");
      expect(printHoursMinutes(dateTime)).toEqual("12:16 PM");
    });
  });
});
