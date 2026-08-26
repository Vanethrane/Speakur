import { readFileSync, writeFileSync, existsSync, rmSync } from "fs";
import { join } from "path";

const ROOT = process.cwd();
const STOP = new Set(
  `a an the and or but if of to in on for at by is are was were be been am do does did
  i you he she it we they my your his her its our their this that these those with from as
  into about over after before between through during without within along across not no yes
  so than then when where who what which how why all any both each few more most other some
  such only own same too very can will just should now also back even still well`.split(/\s+/),
);

const catalogPath = join(ROOT, "data/catalog.json");
const catalog = JSON.parse(readFileSync(catalogPath, "utf8"));
let removed = 0;
for (const cat of catalog.categories) {
  const before = cat.words.length;
  cat.words = cat.words.filter((w) => !STOP.has(String(w).toLowerCase()));
  removed += before - cat.words.length;
}
writeFileSync(catalogPath, JSON.stringify(catalog, null, 2) + "\n");
console.log("removed stopwords from catalog:", removed);

for (const w of STOP) {
  for (const cat of catalog.categories) {
    const dir = join(ROOT, cat.slug, w);
    if (existsSync(join(dir, "index.html"))) {
      try {
        rmSync(dir, { recursive: true, force: true });
        console.log("removed page", cat.slug + "/" + w);
      } catch (e) {
        console.warn("could not remove", dir, e.message);
      }
    }
  }
}
