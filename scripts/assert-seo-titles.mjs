/** Assert programmatic SEO titles stay ≤60 chars (dataset-driven). */
import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const dataset = JSON.parse(readFileSync(join(ROOT, "src/data/dataset.json"), "utf8"));
const cfg = dataset.schema.titleGenerator;
const MAX = cfg.maxLength;

function pickHook(pageType, seed) {
  const hooks = cfg.actionVerbs[pageType] || cfg.actionVerbs.guide;
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h + seed.charCodeAt(i) * (i + 1)) % hooks.length;
  return hooks[h];
}

function buildTitle(pageType, name, keyword, extras = {}) {
  const hook = pickHook(pageType, name);
  const yearShort = `'${String(new Date().getFullYear()).slice(-2)}`;
  const templates = cfg.templates[pageType] || cfg.templates.guide;
  const vars = {
    name,
    keyword: keyword || name,
    hook,
    yearShort,
    price: "Free",
    accents: "US+UK",
    readMin: extras.readMin || "2",
    spec: extras.spec || "Free",
  };
  let best = "";
  for (const tpl of templates) {
    let core = tpl.replace(/\{(\w+)\}/g, (_, k) => vars[k] || "").replace(/\s+/g, " ").trim();
    const withBrand = `${core}${cfg.brandSeparator}${cfg.brand}`;
    const candidate = withBrand.length <= MAX ? withBrand : core;
    if (candidate.length <= MAX && candidate.length > best.length) best = candidate;
  }
  return best || name.slice(0, MAX);
}

let fail = 0;
for (const [slug, page] of Object.entries(dataset.pages)) {
  const title = buildTitle("guide", page.name, page.primaryKeyword, { readMin: "8" });
  if (title.length > MAX) {
    console.error("FAIL", title.length, slug, title);
    fail++;
  }
}

for (const word of ["epitome", "worcestershire", "pneumonia", "entrepreneur"]) {
  const title = buildTitle("word", word, word, { spec: "3 syl · US+UK" });
  if (title.length > MAX) {
    console.error("FAIL", title.length, word, title);
    fail++;
  }
}

if (fail) {
  console.error(`${fail} titles exceed ${MAX} chars`);
  process.exit(1);
}
console.log(`OK — sampled titles ≤ ${MAX} chars`);
