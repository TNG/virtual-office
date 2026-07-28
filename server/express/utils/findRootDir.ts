import { readdirSync } from "fs";
import { resolve } from "path";

export function findRootDir(): string {
  let dir = resolve(process.cwd());
  while (true) {
    const contents = readdirSync(dir);
    if (contents.includes("client")) {
      return dir;
    }
    const parent = resolve(dir, "..");
    if (parent === dir) {
      throw new Error("Could not find project root directory");
    }
    dir = parent;
  }
}
