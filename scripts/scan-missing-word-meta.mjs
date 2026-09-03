/**
 * Scan catalog word pages for missing IPA / definitions.
 * Writes JSON summary to data/missing-meta-scan.json and prints counts.
 *
 * Usage: node scripts/scan-missing-word-meta.mjs [--category=food] [--sample=50]
 */
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs";
import { join } from "path";

const ROOT = process.cwd();
const catalog = JSON.parse(readFileSync(join(ROOT, "data/catalog.json"), "utf8"));
const args = Object.fromEntries(
  process.argv
    .slice(2)
    .filter((a) => a.startsWith("--"))
    .map((a) => {
      const [k, v] = a.replace(/^--/, "").split("=");
      return [k, v === undefined ? true : v];
    }),
);
const ONLY_CAT = args.category ? String(args.category) : null;
const SAMPLE = Number(args.sample || 40);

function analyze(html) {
  const ipaMatch = html.match(/<p class="ipa">([\s\S]*?)<\/p>/);
  const ipaText = ipaMatch ? ipaMatch[1].replace(/<[^>]+>/g, "").trim() : "";
  const missingIpa =
    !ipaText ||
    /phonetic spelling unavailable/i.test(ipaText) ||
    ipaText === "—" ||
    ipaText === "-";
  const missingDef =
    html.includes("Definition lookup was unavailable") ||
    !/<p class="def">/.test(html);
  return { missingIpa, missingDef, ipaText: ipaText.slice(0, 80) };
}

const stats = {
  scannedAt: new Date().toISOString(),
  total: 0,
  missingFile: 0,
  missingIpa: 0,
  missingDef: 0,
  missingEither: 0,
  missingBoth: 0,
  ok: 0,
  byCat: {},
  samples: { missingIpa: [], missingDef: [], missingBoth: [] },
};

for (const cat of catalog.categories) {
  if (ONLY_CAT && cat.slug !== ONLY_CAT) continue;
  const s = {
    total: 0,
    missingFile: 0,
    missingIpa: 0,
    missingDef: 0,
    missingEither: 0,
    missingBoth: 0,
    ok: 0,
  };
  for (const raw of cat.words) {
    const word = String(raw).toLowerCase();
    stats.total += 1;
    s.total += 1;
    const filePath = join(ROOT, cat.slug, word, "index.html");
    if (!existsSync(filePath)) {
      stats.missingFile += 1;
      s.missingFile += 1;
      continue;
    }
    const html = readFileSync(filePath, "utf8");
    const need = analyze(html);
    if (need.missingIpa) {
      stats.missingIpa += 1;
      s.missingIpa += 1;
      if (stats.samples.missingIpa.length < SAMPLE) {
        stats.samples.missingIpa.push(`${cat.slug}/${word}`);
      }
    }
    if (need.missingDef) {
      stats.missingDef += 1;
      s.missingDef += 1;
      if (stats.samples.missingDef.length < SAMPLE) {
        stats.samples.missingDef.push(`${cat.slug}/${word}`);
      }
    }
    if (need.missingIpa || need.missingDef) {
      stats.missingEither += 1;
      s.missingEither += 1;
    }
    if (need.missingIpa && need.missingDef) {
      stats.missingBoth += 1;
      s.missingBoth += 1;
      if (stats.samples.missingBoth.length < SAMPLE) {
        stats.samples.missingBoth.push(`${cat.slug}/${word}`);
      }
    }
    if (!need.missingIpa && !need.missingDef) {
      stats.ok += 1;
      s.ok += 1;
    }
  }
  stats.byCat[cat.slug] = s;
  process.stdout.write(
    `${cat.slug}: total=${s.total} ok=${s.ok} missIpa=${s.missingIpa} missDef=${s.missingDef} either=${s.missingEither}\n`,
  );
}

mkdirSync(join(ROOT, "data"), { recursive: true });
writeFileSync(join(ROOT, "data/missing-meta-scan.json"), JSON.stringify(stats, null, 2));
console.log("\nSUMMARY", {
  total: stats.total,
  ok: stats.ok,
  missingFile: stats.missingFile,
  missingIpa: stats.missingIpa,
  missingDef: stats.missingDef,
  missingEither: stats.missingEither,
  missingBoth: stats.missingBoth,
});
console.log("Wrote data/missing-meta-scan.json");
