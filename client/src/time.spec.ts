import { parseTime, printHoursMinutes } from "./time";

describe("time", () => {
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
      expect(printHoursMinutes(dateTime)).toEqual("15:16");
    });

    it("should consider the timezone", () => {
      const dateTime = parseTime("15:16", "Asia/Samarkand");
      expect(printHoursMinutes(dateTime)).toEqual("12:16");
    });
  });
});
