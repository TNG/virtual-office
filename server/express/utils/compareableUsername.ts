export function comparableUsername(username: string) {
  return username
    .toLowerCase()
    .replace(/\s/g, "")
    .normalize()
    .replace("ß", "ss")
    .replace("ä", "ae")
    .replace("ö", "oe")
    .replace("ü", "ue");
}
