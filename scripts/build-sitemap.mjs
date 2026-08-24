import { readFileSync, writeFileSync } from "fs";

const js = readFileSync("assets/guides-data.js", "utf8");
const data = JSON.parse(
  js.replace(/^[\s\S]*?window\.SPEAKUR_GUIDES\s*=\s*/, "").replace(/;\s*$/, ""),
);
const base = "https://www.speakur.com";
const staticUrls = [
  ["/", "daily", "1.0"],
  ["/index.html", "daily", "1.0"],
  ["/guides.html", "weekly", "0.9"],
  ["/about.html", "monthly", "0.7"],
  ["/contact.html", "monthly", "0.7"],
  ["/privacy.html", "monthly", "0.6"],
  ["/terms.html", "monthly", "0.6"],
];

const urls = staticUrls.map(
  ([path, freq, priority]) =>
    `  <url><loc>${base}${path}</loc><changefreq>${freq}</changefreq><priority>${priority}</priority></url>`,
);

for (const g of data) {
  urls.push(
    `  <url><loc>${base}/guide.html?slug=${encodeURIComponent(g.slug)}</loc><changefreq>monthly</changefreq><priority>0.75</priority></url>`,
  );
}

writeFileSync(
  "sitemap.xml",
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join("\n")}\n</urlset>\n`,
);
console.log("sitemap urls", urls.length);
