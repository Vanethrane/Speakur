/**
 * Inject gated Ezoic head (disabled until SPEAKUR_AD_CONFIG.enabled) on static HTML.
 * Upgrades legacy always-on Gatekeeper/Ezoic heads when present.
 *
 * Usage: node scripts/patch-ezoic-head.mjs
 */
import { readFileSync, writeFileSync, readdirSync, statSync } from "fs";
import { join, extname } from "path";
import { EZOIC_HEAD_SCRIPTS } from "./lib/ezoic-head.mjs";

const ROOT = process.cwd();
const SKIP = new Set(["node_modules", ".git", ".next", "out", "public"]);

function walk(dir, out = []) {
  let entries;
  try {
    entries = readdirSync(dir, { withFileTypes: true });
  } catch {
    return out;
  }
  for (const ent of entries) {
    if (ent.name.startsWith(".") && ent.name !== ".nojekyll") continue;
    if (SKIP.has(ent.name)) continue;
    const p = join(dir, ent.name);
    if (ent.isDirectory()) walk(p, out);
    else if (extname(ent.name) === ".html") out.push(p);
  }
  return out;
}

function stripLegacyEzoic(html) {
  let out = html;
  const patterns = [
    /\s*<script data-cfasync="false" src="https:\/\/cmp\.gatekeeperconsent\.com\/min\.js"><\/script>\s*/gi,
    /\s*<script data-cfasync="false" src="https:\/\/the\.gatekeeperconsent\.com\/cmp\.min\.js"><\/script>\s*/gi,
    /\s*<script async src="https:\/\/www\.ezojs\.com\/ezoic\/sa\.min\.js"><\/script>\s*/gi,
    /\s*<script src="https:\/\/ezoicanalytics\.com\/analytics\.js"><\/script>\s*/gi,
    /\s*<script>\s*window\.ezstandalone = window\.ezstandalone[\s\S]*?ezstandalone\.cmd = ezstandalone\.cmd[\s\S]*?<\/script>\s*/gi,
    /\s*<script>\s*\(function \(\) \{\s*function loadAnalytics\(\)[\s\S]*?loadAnalytics[\s\S]*?\}\)\(\);\s*<\/script>\s*/gi,
  ];
  for (const re of patterns) {
    out = out.replace(re, "\n");
  }
  return out;
}

function patch(html) {
  if (html.includes("SPEAKUR_AD_CONFIG")) return null;
  if (!/<head[^>]*>/i.test(html)) return null;
  let next = html.includes("gatekeeperconsent.com") ? stripLegacyEzoic(html) : html;
  return next.replace(/<head([^>]*)>/i, `<head$1>\n${EZOIC_HEAD_SCRIPTS}`);
}

function main() {
  const files = walk(ROOT);
  let updated = 0;
  let skipped = 0;
  let failed = 0;

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    if (i > 0 && i % 2500 === 0) {
      console.log(`… ${i}/${files.length} (updated ${updated})`);
    }
    let html;
    try {
      html = readFileSync(file, "utf8");
    } catch {
      failed += 1;
      continue;
    }
    const next = patch(html);
    if (next == null) {
      skipped += 1;
      continue;
    }
    try {
      writeFileSync(file, next);
      updated += 1;
    } catch {
      failed += 1;
    }
  }

  console.log(
    `Ezoic head patch done. updated=${updated} skipped=${skipped} failed=${failed} total=${files.length}`,
  );
}

main();
