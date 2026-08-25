/** Remove duplicate consecutive ad-config.js script tags. */
import { readFileSync, writeFileSync, readdirSync, statSync } from "fs";
import { join } from "path";
import { fileURLToPath } from "url";

const ROOT = join(fileURLToPath(import.meta.url), "../..");
const SKIP = new Set(["node_modules", ".git", ".next", "out", "public", "src", "data", "scripts"]);

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    if (SKIP.has(name)) continue;
    const p = join(dir, name);
    try {
      if (statSync(p).isDirectory()) walk(p, out);
      else if (name.endsWith(".html")) out.push(p);
    } catch {
      /* skip */
    }
  }
  return out;
}

const DUP =
  /(<script defer src="[^"]*ad-config\.js"><\/script>\s*)+<script defer src="[^"]*ad-config\.js"><\/script>/g;

let fixed = 0;
for (const file of walk(ROOT)) {
  try {
    const html = readFileSync(file, "utf8");
    const next = html.replace(
      DUP,
      (block) => block.match(/<script defer src="[^"]*ad-config\.js"><\/script>/)?.[0] ?? block,
    );
    if (next !== html) {
      writeFileSync(file, next);
      fixed++;
    }
  } catch {
    /* skip locked files */
  }
}
console.log(`Deduped ad-config.js in ${fixed} files`);
