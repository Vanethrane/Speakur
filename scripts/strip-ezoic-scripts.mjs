/**
 * Remove ungated Ezoic/CMP ad scripts from listed HTML files (keeps gtag).
 * Usage: node scripts/strip-ezoic-scripts.mjs [paths...]
 * Default: root *.html + research/index.html + trust pages
 */
import { readFileSync, writeFileSync, readdirSync } from "fs";
import { join } from "path";

const ROOT = process.cwd();
const DEFAULT = [
  ...readdirSync(ROOT)
    .filter((n) => n.endsWith(".html"))
    .map((n) => join(ROOT, n)),
  join(ROOT, "research/index.html"),
];
const files = process.argv.slice(2).length ? process.argv.slice(2) : DEFAULT;

const patterns = [
  /\s*<script[^>]*gatekeeperconsent[^>]*>\s*<\/script>\s*/gi,
  /\s*<script[^>]*ezojs\.com[^>]*>\s*<\/script>\s*/gi,
  /\s*<script[^>]*ezoicanalytics[^>]*>\s*<\/script>\s*/gi,
  /\s*<script>\s*window\.ezstandalone\s*=[\s\S]*?<\/script>\s*/gi,
  /\s*<script>\s*window\.SPEAKUR_AD_CONFIG[\s\S]*?<\/script>\s*/gi,
  /\s*<script>\s*\(function\s*\(\)\s*\{\s*var cfg = window\.SPEAKUR_AD_CONFIG[\s\S]*?<\/script>\s*/gi,
];

let changed = 0;
for (const file of files) {
  let html;
  try {
    html = readFileSync(file, "utf8");
  } catch {
    continue;
  }
  let next = html;
  for (const re of patterns) next = next.replace(re, "\n");
  if (next !== html) {
    writeFileSync(file, next);
    changed += 1;
    console.log("cleaned", file);
  }
}
console.log(`Done. cleaned ${changed}/${files.length}`);
