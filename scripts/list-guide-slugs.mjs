import { readFileSync } from "fs";

const files = [
  "src/content/guides-part-a.ts",
  "src/content/guides-part-b.ts",
  "src/content/guides-part-c.ts",
];
const slugs = [];
for (const f of files) {
  const a = readFileSync(f, "utf8");
  for (const m of a.matchAll(/slug:\s*"([^"]+)"/g)) slugs.push(m[1]);
}
console.log(slugs.length);
for (const s of slugs) console.log(s);
