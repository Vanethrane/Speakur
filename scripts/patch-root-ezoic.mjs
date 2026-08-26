/** Patch root-level *.html only — gated Ezoic head. */
import { readFileSync, writeFileSync, readdirSync } from "fs";
import { EZOIC_HEAD_SCRIPTS } from "./lib/ezoic-head.mjs";

function stripLegacyEzoic(html) {
  let out = html;
  const patterns = [
    /\s*<script data-cfasync="false" src="https:\/\/cmp\.gatekeeperconsent\.com\/min\.js"><\/script>\s*/gi,
    /\s*<script data-cfasync="false" src="https:\/\/the\.gatekeeperconsent\.com\/cmp\.min\.js"><\/script>\s*/gi,
    /\s*<script async src="https:\/\/www\.ezojs\.com\/ezoic\/sa\.min\.js"><\/script>\s*/gi,
    /\s*<script src="https:\/\/ezoicanalytics\.com\/analytics\.js"><\/script>\s*/gi,
    /\s*<script>\s*window\.ezstandalone = window\.ezstandalone[\s\S]*?ezstandalone\.cmd = ezstandalone\.cmd[\s\S]*?<\/script>\s*/gi,
    /\s*<script>\s*\(function \(\) \{\s*function loadAnalytics\(\)[\s\S]*?\}\)\(\);\s*<\/script>\s*/gi,
  ];
  for (const re of patterns) out = out.replace(re, "\n");
  return out;
}

let updated = 0;
for (const file of readdirSync(".").filter((f) => f.endsWith(".html"))) {
  let html = readFileSync(file, "utf8");
  if (html.includes("SPEAKUR_AD_CONFIG")) continue;
  html = html.includes("gatekeeperconsent.com") ? stripLegacyEzoic(html) : html;
  writeFileSync(file, html.replace(/<head([^>]*)>/i, `<head$1>\n${EZOIC_HEAD_SCRIPTS}`));
  updated += 1;
}
console.log(`Patched ${updated} root HTML files`);
