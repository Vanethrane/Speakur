/**
 * Export Speakur guides → assets/guides-data.js (pure Node, no TS runtime).
 */
import { readFileSync, writeFileSync, mkdirSync, renameSync, unlinkSync, existsSync } from "fs";

function extractStringArray(src, fromIndex) {
  // fromIndex points at '['
  const out = [];
  let i = fromIndex + 1;
  while (i < src.length) {
    const ch = src[i];
    if (ch === "]") return { values: out, end: i + 1 };
    if (ch === '"') {
      let j = i + 1;
      let s = "";
      while (j < src.length) {
        if (src[j] === "\\" && j + 1 < src.length) {
          s += src[j + 1];
          j += 2;
          continue;
        }
        if (src[j] === '"') break;
        s += src[j];
        j += 1;
      }
      out.push(s);
      i = j + 1;
      continue;
    }
    i += 1;
  }
  return { values: out, end: src.length };
}

function extractSectionsArray(src, fromIndex) {
  // fromIndex at '[' of sections: [
  const sections = [];
  let i = fromIndex + 1;
  while (i < src.length) {
    if (src[i] === "]") return { sections, end: i + 1 };
    if (src.startsWith("heading:", i) || src.startsWith("heading :", i)) {
      const hm = /heading:\s*"([^"]+)"/.exec(src.slice(i));
      if (!hm) {
        i += 1;
        continue;
      }
      const heading = hm[1];
      const afterHeading = i + hm.index + hm[0].length;
      const pm = /paragraphs:\s*\[/.exec(src.slice(afterHeading));
      if (!pm) {
        i = afterHeading;
        continue;
      }
      const arrStart = afterHeading + pm.index + pm[0].length - 1;
      const { values, end } = extractStringArray(src, arrStart);
      sections.push({ heading, paragraphs: values });
      i = end;
      continue;
    }
    i += 1;
  }
  return { sections, end: src.length };
}

function extractGuidesFromParts(file) {
  const src = readFileSync(file, "utf8");
  const guides = [];
  const slugRe = /slug:\s*"([^"]+)"/g;
  let m;
  while ((m = slugRe.exec(src))) {
    const slug = m[1];
    const start = m.index;
    // Find matching guide object start before slug
    let objStart = start;
    while (objStart > 0 && src[objStart] !== "{") objStart -= 1;
    // Find end of this guide object via brace count from objStart
    let depth = 0;
    let objEnd = objStart;
    for (let i = objStart; i < src.length; i++) {
      if (src[i] === "{") depth += 1;
      else if (src[i] === "}") {
        depth -= 1;
        if (depth === 0) {
          objEnd = i + 1;
          break;
        }
      }
    }
    const block = src.slice(objStart, objEnd);
    const title = /title:\s*"([^"]+)"/.exec(block)?.[1];
    const description = /description:\s*"([^"]+)"/.exec(block)?.[1];
    const publishedAt = /publishedAt:\s*"([^"]+)"/.exec(block)?.[1];
    const readingMinutes = Number(/readingMinutes:\s*(\d+)/.exec(block)?.[1] || 8);
    if (!title) continue;

    const sections = [];
    const secMarker = /sections:\s*\[/.exec(block);
    if (secMarker) {
      const { sections: secs } = extractSectionsArray(block, secMarker.index + secMarker[0].length - 1);
      sections.push(...secs);
    }
    guides.push({ slug, title, description, publishedAt, readingMinutes, sections });
    // Advance regex past this object to avoid re-matching nested slugs (none expected)
    slugRe.lastIndex = Math.max(slugRe.lastIndex, objEnd);
  }
  return guides;
}

function extractExpansionMap(file) {
  const src = readFileSync(file, "utf8");
  const map = new Map();
  const keyRe = /"([a-z0-9-]+)":\s*\[/g;
  let m;
  while ((m = keyRe.exec(src))) {
    const slug = m[1];
    const arrStart = m.index + m[0].length - 1;
    const { sections } = extractSectionsArray(src, arrStart);
    map.set(slug, [...(map.get(slug) || []), ...sections]);
  }
  return map;
}

function extractRewrites(file) {
  const src = readFileSync(file, "utf8");
  const map = new Map();
  const keyRe = /"([a-z0-9-]+)":\s*\{/g;
  let m;
  while ((m = keyRe.exec(src))) {
    const slug = m[1];
    const objStart = m.index + m[0].length - 1;
    let depth = 0;
    let objEnd = objStart;
    for (let i = objStart; i < src.length; i++) {
      if (src[i] === "{") depth += 1;
      else if (src[i] === "}") {
        depth -= 1;
        if (depth === 0) {
          objEnd = i + 1;
          break;
        }
      }
    }
    const block = src.slice(objStart, objEnd);
    const synMark = /synopsis:\s*\[/.exec(block);
    const tldrMark = /tldr:\s*\[/.exec(block);
    const secMark = /sections:\s*\[/.exec(block);
    const synopsis = synMark
      ? extractStringArray(block, synMark.index + synMark[0].length - 1).values
      : [];
    const tldr = tldrMark
      ? extractStringArray(block, tldrMark.index + tldrMark[0].length - 1).values
      : [];
    const sections = secMark
      ? extractSectionsArray(block, secMark.index + secMark[0].length - 1).sections
      : [];
    map.set(slug, { synopsis, sections, tldr });
    keyRe.lastIndex = Math.max(keyRe.lastIndex, m.index + (objEnd - objStart));
  }
  return map;
}

function wordCount(guide) {
  return [guide.title, guide.description, ...(guide.synopsis || []), ...(guide.tldr || []), ...guide.sections.flatMap((s) => [s.heading, ...s.paragraphs])]
    .join(" ")
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
}

const guides = [
  ...extractGuidesFromParts("src/content/guides-part-a.ts"),
  ...extractGuidesFromParts("src/content/guides-part-b.ts"),
  ...extractGuidesFromParts("src/content/guides-part-c.ts"),
];

const expansions = new Map();
for (const file of ["src/content/guide-expansions.ts", "src/content/guide-expansions-b.ts"]) {
  for (const [slug, secs] of extractExpansionMap(file)) {
    expansions.set(slug, [...(expansions.get(slug) || []), ...secs]);
  }
}
const rewrites = extractRewrites("src/content/guide-rewrites.ts");

for (const g of guides) {
  const rewrite = rewrites.get(g.slug);
  g.sections = [
    ...g.sections.filter((s) => !/^Extended notes:/i.test(s.heading)),
    ...(expansions.get(g.slug) || []),
    ...(rewrite?.sections || []),
  ];
  g.synopsis = rewrite?.synopsis || [];
  g.tldr = rewrite?.tldr || [];
  const words = wordCount(g);
  g.readingMinutes = Math.max(g.readingMinutes || 1, Math.round(words / 220) || 1);
}

mkdirSync("assets", { recursive: true });
const outPath = "assets/guides-data.js";
const tmpPath = "assets/guides-data.js.tmp";
const body = `/* Auto-generated guide catalog for static Speakur pages */\nwindow.SPEAKUR_GUIDES = ${JSON.stringify(guides, null, 2)};\n`;
writeFileSync(tmpPath, body);
try {
  if (existsSync(outPath)) unlinkSync(outPath);
  renameSync(tmpPath, outPath);
} catch {
  writeFileSync(outPath, body);
  try {
    unlinkSync(tmpPath);
  } catch {
    /* ignore */
  }
}
console.log("Wrote assets/guides-data.js with", guides.length, "guides");
for (const g of guides) {
  const words = wordCount(g);
  console.log(
    words,
    g.slug,
    `secs=${g.sections.length}`,
    g.synopsis.length ? "synopsis" : "NO-SYNOPSIS",
    g.tldr.length ? "tldr" : "NO-TLDR",
    JSON.stringify(g).includes("Consider a concrete week") ? "HAS-TEMPLATE" : "ok",
  );
}
