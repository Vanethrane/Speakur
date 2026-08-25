/**
 * QA: every dataset page must have ≥3 inbound sibling links.
 * Usage: node scripts/assert-inbound-links.mjs
 */
import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const data = JSON.parse(readFileSync(join(root, "src/data/dataset.json"), "utf8"));
const RELATED_LIMIT = data.schema?.internalLinks?.relatedLimit ?? 6;
const MIN_INBOUND = data.schema?.internalLinks?.minInbound ?? 3;
const pages = data.pages;

function score(a, b) {
  let s = 0;
  if (a.parentCategory && a.parentCategory === b.parentCategory) s += 10;
  const tagsA = new Set((a.tags || []).map((t) => t.toLowerCase()));
  for (const tag of b.tags || []) if (tagsA.has(tag.toLowerCase())) s += 3;
  if (a.language && a.language === b.language) s += 1;
  if (a.accent && a.accent === b.accent) s += 1;
  return s;
}

function ranked(slug) {
  const self = pages[slug];
  return Object.keys(pages)
    .filter((other) => other !== slug)
    .map((other) => ({ slug: other, score: score(self, pages[other]) }))
    .sort((a, b) => b.score - a.score || a.slug.localeCompare(b.slug));
}

function buildGraph() {
  const slugs = Object.keys(pages);
  const outbound = new Map();
  for (const slug of slugs) {
    outbound.set(
      slug,
      ranked(slug)
        .slice(0, RELATED_LIMIT)
        .map((r) => r.slug),
    );
  }
  const inboundCount = (target) => {
    let n = 0;
    for (const links of outbound.values()) if (links.includes(target)) n += 1;
    return n;
  };

  let guard = 0;
  while (guard++ < 500) {
    const needy = slugs
      .map((slug) => ({ slug, inbound: inboundCount(slug) }))
      .filter((r) => r.inbound < MIN_INBOUND)
      .sort((a, b) => a.inbound - b.inbound || a.slug.localeCompare(b.slug));
    if (!needy.length) break;
    const target = needy[0].slug;
    const donors = ranked(target)
      .map((r) => r.slug)
      .filter((d) => !(outbound.get(d) || []).includes(target));
    let linked = false;
    for (const donor of donors) {
      const links = [...(outbound.get(donor) || [])];
      if (links.length < RELATED_LIMIT) {
        links.push(target);
        outbound.set(donor, links);
        linked = true;
        break;
      }
      const self = pages[donor];
      const weakest = links
        .map((s) => ({ slug: s, score: score(self, pages[s]) }))
        .sort((a, b) => a.score - b.score || a.slug.localeCompare(b.slug))[0];
      const targetScore = score(self, pages[target]);
      if (weakest && targetScore >= weakest.score) {
        outbound.set(
          donor,
          links.map((s) => (s === weakest.slug ? target : s)),
        );
        linked = true;
        break;
      }
    }
    if (!linked) {
      const donor = donors[0] || slugs.find((s) => s !== target);
      if (!donor) break;
      const links = [...(outbound.get(donor) || [])];
      if (!links.includes(target)) {
        links.push(target);
        outbound.set(donor, links);
      } else break;
    }
  }
  return outbound;
}

const graph = buildGraph();
const failures = [];
console.log("Related Tools & Conversions — inbound link audit\n");
for (const slug of Object.keys(pages)) {
  const outbound = (graph.get(slug) || []).length;
  let inbound = 0;
  for (const links of graph.values()) if (links.includes(slug)) inbound += 1;
  const anchors = (graph.get(slug) || []).map((s) => pages[s].primaryKeyword || pages[s].name);
  console.log(`${slug}: out=${outbound} in=${inbound}`);
  console.log(`  anchors: ${anchors.join(" | ")}`);
  if (inbound < MIN_INBOUND) failures.push({ slug, inbound });
}

if (failures.length) {
  console.error("\nFAILED:");
  for (const f of failures) console.error(`  ${f.slug}: ${f.inbound}`);
  process.exit(1);
}
console.log(`\nOK — every page has ≥${MIN_INBOUND} inbound sibling links.`);
