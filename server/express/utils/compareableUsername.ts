export function comparableUsername(username: string) {
  return username.toLowerCase().replace(/\s/g, "").normalize().replace("ß", "ss");
}
