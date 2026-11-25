import { mkdir, readdir, rename, writeFile } from "node:fs/promises";
import path from "node:path";

// Directory indexes preserve deep links on a plain static HTTP server.
async function directoryIndexes(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const file = path.join(dir, entry.name);
    if (entry.isDirectory()) await directoryIndexes(file);
    else if (entry.name.endsWith(".html") && entry.name !== "index.html") {
      const target = file.slice(0, -5);
      await mkdir(target, { recursive: true });
      await rename(file, path.join(target, "index.html"));
    }
  }
}
await directoryIndexes("dist/nofoody");
await writeFile("dist/nofoody/.nojekyll", "");
