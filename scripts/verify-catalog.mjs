import { readFileSync, existsSync } from "fs";
const c = JSON.parse(readFileSync("data/catalog.json", "utf8"));
const n = c.categories.reduce((a, x) => a + x.words.length, 0);
console.log("words", n);
for (const x of c.categories) console.log(x.slug, x.words.length);
const map = Object.fromEntries(c.categories.flatMap((cat) => cat.words.map((w) => [w, cat.slug])));
for (const w of ["croissant", "acai", "worcestershire", "gyro", "qatar", "porsche", "aoife", "dachshund", "schedule", "niche"]) {
  console.log(w, map[w] || "MISSING");
}
console.log(
  "files",
  existsSync("food/croissant/index.html"),
  existsSync("places/qatar/index.html"),
  existsSync("brands/porsche/index.html"),
);
