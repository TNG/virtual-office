import { readdirSync } from "fs";

export function findRootDir(): string {
  let dir = __dirname;
  while (true) {
    const contents = readdirSync(dir);
    if (contents.includes("client")) {
      return dir;
    }
    dir = `${dir}/..`;
  }
}
