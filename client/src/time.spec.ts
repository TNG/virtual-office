import { expect } from "chai";
import { Settings } from "luxon";
import { parseTime, printHoursMinutes } from "./time";

describe("time", () => {
  beforeEach(() => {
    Settings.defaultZoneName = "UTC";
  });

  describe("parseTime", () => {
    it("should parse HH:mm", () => {
      const dateTime = parseTime("15:16");
      expect(dateTime.hour).to.equal(15);
      expect(dateTime.minute).to.equal(16);
    });

    it("should consider the timezone", () => {
      const dateTime = parseTime("15:16", "Asia/Samarkand");
      expect(dateTime.hour).to.equal(10);
      expect(dateTime.minute).to.equal(16);
    });
  });

  describe("printHoursMinutes", () => {
    it("should print a time zone", () => {
      const dateTime = parseTime("15:16");
      expect(printHoursMinutes(dateTime)).to.equal("3:16 PM");
    });

    it("should consider the timezone", () => {
      const dateTime = parseTime("15:16", "Asia/Samarkand");
      expect(printHoursMinutes(dateTime)).to.equal("10:16 AM");
    });
  });
});
