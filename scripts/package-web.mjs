import { createHash } from "node:crypto";
import { mkdir, readFile, readdir, rename, writeFile } from "node:fs/promises";
import path from "node:path";

function contentPolicy(html) {
  // Expo emits a small inline hydration flag. Authorize its exact bytes for
  // this build while limiting downloaded scripts to the site's own origin.
  const hashes = new Set();
  for (const [, attributes, body] of html.matchAll(
    /<script\b([^>]*)>([\s\S]*?)<\/script>/gi,
  )) {
    if (!/\bsrc\s*=/i.test(attributes) && body) {
      const digest = createHash("sha256").update(body).digest("base64");
      hashes.add("'sha256-" + digest + "'");
    }
  }
  const policy = [
    "default-src 'self'",
    ["script-src 'self'", ...hashes].join(" "),
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob:",
    "font-src 'self' data:",
    "connect-src 'self'",
    "object-src 'none'",
    "form-action 'none'",
    "base-uri 'self'",
  ].join("; ");
  // Place the policy before resource links and scripts, including any that
  // a hosting proxy may append to the HTML response.
  return html.replace(
    /(<meta\s+charSet="utf-8"\s*\/?>)/i,
    '$1<meta http-equiv="Content-Security-Policy" content="' + policy + '"/>',
  );
}

async function packageRoutes(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const file = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      await packageRoutes(file);
    } else if (entry.name.endsWith(".html")) {
      const html = await readFile(file, "utf8");
      const packaged = contentPolicy(html);
      if (packaged === html) throw new Error("Missing HTML charset in " + file);
      await writeFile(file, packaged);
      // Directory indexes preserve deep links on a plain static HTTP server.
      if (entry.name !== "index.html") {
        const route = file.slice(0, -5);
        await mkdir(route, { recursive: true });
        await rename(file, path.join(route, "index.html"));
      }
    }
  }
}
await packageRoutes("dist/nofoody");
await writeFile("dist/nofoody/.nojekyll", "");
