/**
 * Refresh ads.txt from Ezoic Ads.txt Manager (keeps seller list current).
 * Source: https://docs.ezoic.com/docs/ezoicads/adstxt/
 *
 * Usage: node scripts/fetch-ads-txt.mjs
 */
import { writeFileSync, mkdirSync, copyFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const DOMAIN = "speakur.com";
const URL = `https://srv.adstxtmanager.com/19390/${DOMAIN}`;

async function main() {
  console.log(`Fetching ${URL}…`);
  const res = await fetch(URL);
  if (!res.ok) throw new Error(`HTTP ${res.status} fetching ads.txt`);
  const text = await res.text();
  if (!text.includes("ezoic") && !text.includes("ownerdomain=")) {
    throw new Error("Response does not look like an Ezoic ads.txt file");
  }
  const out = join(ROOT, "ads.txt");
  writeFileSync(out, text.endsWith("\n") ? text : text + "\n");
  mkdirSync(join(ROOT, "public"), { recursive: true });
  copyFileSync(out, join(ROOT, "public/ads.txt"));
  const lines = text.split(/\r?\n/).filter(Boolean).length;
  console.log(`Wrote ads.txt + public/ads.txt (${lines} lines, ${Buffer.byteLength(text)} bytes)`);
}

main().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});
