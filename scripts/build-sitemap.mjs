/**
 * Rebuild sitemap.xml from catalog + guides + static trust pages.
 */
import { readFileSync, writeFileSync } from "fs";

const base = "https://www.speakur.com";
const catalog = JSON.parse(readFileSync("data/catalog.json", "utf8"));
const guideJs = readFileSync("assets/guides-data.js", "utf8");
const guides = JSON.parse(
  guideJs.replace(/^[\s\S]*?window\.SPEAKUR_GUIDES\s*=\s*/, "").replace(/;\s*$/, ""),
);

const urls = [
  ["/", "daily", "1.0"],
  ["/index.html", "daily", "1.0"],
  ["/words/", "daily", "0.95"],
  ["/guides.html", "weekly", "0.85"],
  ["/about.html", "monthly", "0.7"],
  ["/contact.html", "monthly", "0.7"],
  ["/privacy.html", "monthly", "0.6"],
  ["/terms.html", "monthly", "0.6"],
];

for (const cat of catalog.categories) {
  urls.push([`/${cat.slug}/`, "weekly", "0.85"]);
  for (const word of cat.words) {
    urls.push([`/${cat.slug}/${word.toLowerCase()}/`, "monthly", "0.8"]);
  }
}

for (const g of guides) {
  urls.push([`/guide.html?slug=${encodeURIComponent(g.slug)}`, "monthly", "0.7"]);
}

const body = urls
  .map(
    ([path, freq, priority]) =>
      `  <url><loc>${base}${path}</loc><changefreq>${freq}</changefreq><priority>${priority}</priority></url>`,
  )
  .join("\n");

writeFileSync(
  "sitemap.xml",
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>\n`,
);
console.log("sitemap urls", urls.length);
