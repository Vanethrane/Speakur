/**
 * Static sitemap builder.
 * - Collects all public URLs (catalog word pages + hubs + guides + trust pages)
 * - If URLs > 10,000, splits into sitemap-1.xml, sitemap-2.xml, …
 * - Always writes sitemap-index.xml as the master index
 * - Syncs robots.txt → sitemap-index.xml
 *
 * Usage: node scripts/build-sitemap.mjs
 */
import {
  readFileSync,
  writeFileSync,
  readdirSync,
  unlinkSync,
  mkdirSync,
  existsSync,
  copyFileSync,
} from "fs";
import { join } from "path";

const ROOT = process.cwd();
const BASE = "https://www.speakur.com";
const CHUNK_SIZE = 10_000;
const OUT_DIR = ROOT;

const catalog = JSON.parse(readFileSync(join(ROOT, "data/catalog.json"), "utf8"));

let guides = [];
try {
  const guideJs = readFileSync(join(ROOT, "assets/guides-data.js"), "utf8");
  guides = JSON.parse(
    guideJs.replace(/^[\s\S]*?window\.SPEAKUR_GUIDES\s*=\s*/, "").replace(/;\s*$/, ""),
  );
} catch {
  guides = [];
}

/** @type {Array<{ path: string, changefreq: string, priority: string }>} */
const entries = [
  { path: "/", changefreq: "daily", priority: "1.0" },
  { path: "/words/", changefreq: "daily", priority: "0.95" },
  { path: "/guides.html", changefreq: "weekly", priority: "0.85" },
  { path: "/about.html", changefreq: "monthly", priority: "0.7" },
  { path: "/contact.html", changefreq: "monthly", priority: "0.7" },
  { path: "/privacy.html", changefreq: "monthly", priority: "0.6" },
  { path: "/terms.html", changefreq: "monthly", priority: "0.6" },
  { path: "/build/", changefreq: "weekly", priority: "0.5" },
];

for (const cat of catalog.categories) {
  entries.push({ path: `/${cat.slug}/`, changefreq: "weekly", priority: "0.85" });
  for (const word of cat.words) {
    entries.push({
      path: `/${cat.slug}/${String(word).toLowerCase()}/`,
      changefreq: "monthly",
      priority: "0.8",
    });
  }
}

for (const g of guides) {
  entries.push({
    path: `/guide.html?slug=${encodeURIComponent(g.slug)}`,
    changefreq: "monthly",
    priority: "0.7",
  });
  // Next/App Router guide URLs when deployed alongside static
  entries.push({
    path: `/guides/${encodeURIComponent(g.slug)}`,
    changefreq: "monthly",
    priority: "0.7",
  });
}

// Dedupe by path
const seen = new Set();
const urls = [];
for (const row of entries) {
  if (seen.has(row.path)) continue;
  seen.add(row.path);
  urls.push(row);
}

function escapeXml(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function urlsetXml(chunk) {
  const body = chunk
    .map(
      (u) =>
        `  <url><loc>${escapeXml(BASE + u.path)}</loc><changefreq>${u.changefreq}</changefreq><priority>${u.priority}</priority></url>`,
    )
    .join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>\n`;
}

function indexXml(files) {
  const lastmod = new Date().toISOString().slice(0, 10);
  const body = files
    .map(
      (file) =>
        `  <sitemap><loc>${escapeXml(`${BASE}/${file}`)}</loc><lastmod>${lastmod}</lastmod></sitemap>`,
    )
    .join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</sitemapindex>\n`;
}

// Remove previous chunk files
for (const name of readdirSync(OUT_DIR)) {
  if (/^sitemap-\d+\.xml$/.test(name) || name === "sitemap-index.xml") {
    unlinkSync(join(OUT_DIR, name));
  }
}

const needsSplit = urls.length > CHUNK_SIZE;
const chunkCount = Math.max(1, Math.ceil(urls.length / CHUNK_SIZE));
const chunkFiles = [];

for (let i = 0; i < chunkCount; i += 1) {
  const slice = urls.slice(i * CHUNK_SIZE, (i + 1) * CHUNK_SIZE);
  const file = `sitemap-${i + 1}.xml`;
  writeFileSync(join(OUT_DIR, file), urlsetXml(slice));
  chunkFiles.push(file);
}

writeFileSync(join(OUT_DIR, "sitemap-index.xml"), indexXml(chunkFiles));

// Back-compat: sitemap.xml mirrors the index so old Sitemap: lines still work
writeFileSync(join(OUT_DIR, "sitemap.xml"), indexXml(chunkFiles));

const robots = `# Speakur - https://www.speakur.com
# Allow all crawlers. Sitemaps list every public URL.

User-agent: *
Allow: /

User-agent: Googlebot
Allow: /

User-agent: Googlebot-Image
Allow: /

User-agent: Bingbot
Allow: /

# Primary index (split into sitemap-1.xml ... when over ${CHUNK_SIZE} URLs)
Sitemap: ${BASE}/sitemap-index.xml
# Same index under the classic name
Sitemap: ${BASE}/sitemap.xml
`;

writeFileSync(join(OUT_DIR, "robots.txt"), robots);

const publicDir = join(ROOT, "public");
mkdirSync(publicDir, { recursive: true });
copyFileSync(join(OUT_DIR, "robots.txt"), join(publicDir, "robots.txt"));
copyFileSync(join(OUT_DIR, "sitemap-index.xml"), join(publicDir, "sitemap-index.xml"));
for (const file of chunkFiles) {
  copyFileSync(join(OUT_DIR, file), join(publicDir, file));
}
copyFileSync(join(OUT_DIR, "sitemap.xml"), join(publicDir, "sitemap.xml"));

console.log(
  `Sitemap build complete: ${urls.length} URLs → ${chunkCount} chunk(s)` +
    (needsSplit ? " (split >10k)" : " (single chunk)") +
    `\n  index: sitemap-index.xml` +
    `\n  files: ${chunkFiles.join(", ")}` +
    `\n  robots: robots.txt + public/robots.txt`,
);
