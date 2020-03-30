import fs from "fs";

async function listAsync(dir: string): Promise<string[]> {
  return new Promise((resolve, reject) => {
    fs.readdir(dir, (err, files) => {
      if (err) {
        reject(err);
      } else {
        resolve(files);
      }
    });
  });
}

export async function findRootDir(): Promise<string> {
  let dir = __dirname;
  while (true) {
    const contents = await listAsync(dir);
    if (contents.includes("client")) {
      return dir;
    }
    dir = `${dir}/..`;
  }
}
