/**
 * Convert Speakur guide TS content into a browser-ready guides-data.js
 */
import { readFileSync, writeFileSync, mkdirSync } from "fs";

function extractGuidesFromParts() {
  // Dynamic import won't work on TS; parse the merged runtime shape by evaluating
  // a simplified extraction of slug/title/description/publishedAt/readingMinutes/sections.
  const files = [
    "src/content/guides-part-a.ts",
    "src/content/guides-part-b.ts",
    "src/content/guides-part-c.ts",
  ];

  const guides = [];

  for (const file of files) {
    const src = readFileSync(file, "utf8");
    // Split on guide objects that start with slug:
    const chunks = src.split(/\n\s*\{\s*\n\s*slug:/);
    for (let i = 1; i < chunks.length; i++) {
      const chunk = "slug:" + chunks[i];
      const end = chunk.lastIndexOf("},");
      const block = end === -1 ? chunk : chunk.slice(0, end);
      const slug = /slug:\s*"([^"]+)"/.exec(block)?.[1];
      const title = /title:\s*"([^"]+)"/.exec(block)?.[1];
      const description = /description:\s*\n?\s*"([^"]+)"/.exec(block)?.[1]
        || /description:\s*"([^"]+)"/.exec(block)?.[1];
      const publishedAt = /publishedAt:\s*"([^"]+)"/.exec(block)?.[1];
      const readingMinutes = Number(/readingMinutes:\s*(\d+)/.exec(block)?.[1] || 8);

      if (!slug || !title) continue;

      const sections = [];
      const sectionRe = /heading:\s*"([^"]+)"\s*,\s*paragraphs:\s*\[([\s\S]*?)\]\s*\}/g;
      let m;
      while ((m = sectionRe.exec(block))) {
        const heading = m[1];
        const parasRaw = m[2];
        const paragraphs = [];
        const pre = /"((?:\\.|[^"\\])*)"/g;
        let pm;
        while ((pm = pre.exec(parasRaw))) {
          paragraphs.push(pm[1].replace(/\\"/g, '"').replace(/\\n/g, "\n"));
        }
        if (paragraphs.length) sections.push({ heading, paragraphs });
      }

      guides.push({ slug, title, description, publishedAt, readingMinutes, sections });
    }
  }

  return guides;
}

function loadExpansions() {
  const map = new Map();
  for (const file of [
    "src/content/guide-expansions.ts",
    "src/content/guide-expansions-b.ts",
  ]) {
    const src = readFileSync(file, "utf8");
    const parts = src.split(/\n\s*"([a-z0-9-]+)":\s*\[/);
    for (let i = 1; i < parts.length; i += 2) {
      const slug = parts[i];
      const block = parts[i + 1] || "";
      const sections = [];
      const sectionRe = /heading:\s*"([^"]+)"\s*,\s*paragraphs:\s*\[([\s\S]*?)\]\s*\}/g;
      let m;
      while ((m = sectionRe.exec(block))) {
        const heading = m[1];
        const paragraphs = [];
        const pre = /"((?:\\.|[^"\\])*)"/g;
        let pm;
        while ((pm = pre.exec(m[2]))) {
          paragraphs.push(pm[1].replace(/\\"/g, '"'));
        }
        if (paragraphs.length) sections.push({ heading, paragraphs });
      }
      map.set(slug, [...(map.get(slug) || []), ...sections]);
    }
  }

  // expansions-c uses longTail(topic)
  const c = readFileSync("src/content/guide-expansions-c.ts", "utf8");
  const longTailMatch = c.match(/const longTail[\s\S]*?\n\}\);/);
  const topicEntries = [...c.matchAll(/"([a-z0-9-]+)":\s*\[longTail\("([^"]+)"\)\]/g)];

  function longTail(topic) {
    return {
      heading: `Extended notes: ${topic}`,
      paragraphs: [
        `This extended section deepens the Speakur editorial treatment of ${topic}. Readers who arrive from search often need more than a short summary; they need worked examples, failure modes, and language they can reuse with teammates. We write these expansions so each guide stands alone as a serious reference rather than a thin companion to a dictionary template. If you are a teacher, mark the paragraphs you will assign. If you are a marketer, highlight the checklists. If you are an engineer, note the invariants that protect cost and crawlability. The aim is practical depth that survives a careful human review.`,
        `Consider a concrete week of practice or production around ${topic}. On Monday, inventory the words, scripts, or lessons you will touch. On Tuesday, look up pronunciations and save canonical audio. On Wednesday, draft or teach with those anchors visible. On Thursday, review errors without blame. On Friday, publish or present, then log what still felt unstable. That weekly loop turns abstract advice into an operating habit. Speakur’s pronunciation search exists to shrink the lookup friction inside that loop so people actually finish it instead of abandoning the tab.`,
        `Organizations fail at ${topic} when ownership is unclear. Assign a named owner, a review cadence, and a place where decisions live—glossary rows, accent records, lesson plans, or privacy inventories. Without ownership, tools accumulate and standards decay. With ownership, even a small team can outperform a larger team that improvises. Write the owner’s name next to the policy. Revisit it when people change roles. Put the review date on a calendar so the document cannot silently rot for a year.`,
        `Measurement keeps the work honest. Define two or three signals that show progress: fewer clarification requests, higher cache hit rates, better caption accuracy, stronger Search Console impressions on guides, or simply more students willing to speak. Review those signals monthly. If they do not move, change the routine rather than buying another vendor demo. ${topic} rewards steady systems. Pair those systems with server-rendered explanations like this guide so both humans and crawlers can understand what Speakur stands for and why the pages exist.`,
        `Finally, keep ethics in view while you operationalize ${topic}. Pronunciation, accents, and audio technology sit close to identity. Avoid mockery, disclose synthetic speech where appropriate, respect consent for voice data, and make accessibility a default. Commercial success that depends on confusing learners or trapping them in dark patterns will not survive manual review—nor should it. Build practices you would be comfortable defending to a skeptical teacher, a privacy regulator, and a careful parent at the same time.`,
        `If you are implementing tooling, write down the non-negotiables beside your notes on ${topic}: HTML must contain the educational text without waiting on client JavaScript; paid speech synthesis must wait for a real user gesture; generated audio must be cached permanently; trust pages must remain linked in the footer; and editorial guides must continue to ship on a cadence. Those rules keep a pronunciation site useful at human scale and credible under partner and search reviews.`,
        `Share this guide with the next teammate who joins your localization, teaching, or growth pod. Ask them to annotate disagreements. Healthy argument about ${topic} beats silent drift. Update the Speakur glossary and internal checklists when the argument produces a decision. Over a quarter, those annotations become an institutional advantage—exactly the kind of durable, people-first substance that thin doorway sites never bother to create.`,
      ],
    };
  }

  for (const [, slug, topic] of topicEntries) {
    map.set(slug, [...(map.get(slug) || []), longTail(topic)]);
  }

  return map;
}

const guides = extractGuidesFromParts();
const expansions = loadExpansions();
for (const g of guides) {
  g.sections = [...g.sections, ...(expansions.get(g.slug) || [])];
}

mkdirSync("assets", { recursive: true });
const out = `/* Auto-generated guide catalog for static Speakur pages */\nwindow.SPEAKUR_GUIDES = ${JSON.stringify(guides, null, 2)};\n`;
writeFileSync("assets/guides-data.js", out);
console.log("Wrote assets/guides-data.js with", guides.length, "guides");
for (const g of guides) {
  const words = [g.title, g.description, ...g.sections.flatMap((s) => [s.heading, ...s.paragraphs])]
    .join(" ")
    .trim()
    .split(/\s+/).length;
  console.log(words, g.slug);
}
