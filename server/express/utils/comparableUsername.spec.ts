import { comparableUsername } from "./compareableUsername";

describe("comparableUsername", () => {
  it("should lowercase the username", () => {
    expect(comparableUsername("JohnDoe")).toBe("johndoe");
  });

  it("should remove whitespace", () => {
    expect(comparableUsername("John Doe")).toBe("johndoe");
  });

  it("should normalize unicode", () => {
    expect(comparableUsername("café")).toBe("café");
  });

  it("should replace ß with ss", () => {
    expect(comparableUsername("Straße")).toBe("strasse");
  });

  it("should replace ä with ae", () => {
    expect(comparableUsername("Bär")).toBe("baer");
  });

  it("should replace ö with oe", () => {
    expect(comparableUsername("Schön")).toBe("schoen");
  });

  it("should replace ü with ue", () => {
    expect(comparableUsername("Grün")).toBe("gruen");
  });

  it("should handle empty string", () => {
    expect(comparableUsername("")).toBe("");
  });

  it("should handle combined umlauts", () => {
    expect(comparableUsername("Müller Öhmäß")).toBe("muelleroehmaess");
  });
});
