import { readdirSync, readFileSync, writeFileSync, statSync } from "fs";
import { join } from "path";

const cats = [
  "animals",
  "arts",
  "brands",
  "business",
  "everyday",
  "food",
  "law",
  "medical",
  "mythology",
  "names",
  "nature",
  "places",
  "science",
  "sports",
  "tech",
];

const triggerRe =
  /\s*<button[^>]*id="speakur-global-search-trigger"[\s\S]*?<\/button>/g;
const scriptRe =
  /\s*<script defer src="[^"]*global-search-modal\.js"><\/script>/g;

let files = 0;
let changed = 0;

for (const cat of cats) {
  for (const name of readdirSync(cat)) {
    const dir = join(cat, name);
    if (!statSync(dir).isDirectory()) continue;
    const f = join(dir, "index.html");
    let html;
    try {
      html = readFileSync(f, "utf8");
    } catch {
      continue;
    }
    files += 1;
    const next = html.replace(triggerRe, "").replace(scriptRe, "");
    if (next !== html) {
      writeFileSync(f, next);
      changed += 1;
    }
  }
}

console.log(`scanned ${files} changed ${changed}`);
