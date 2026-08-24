/**
 * Patch existing generated pages to add Home in nav + breadcrumbs.
 */
import { readFileSync, writeFileSync, readdirSync, statSync } from "fs";
import { join } from "path";

const ROOT = process.cwd();
const dirs = ["medical", "food", "everyday", "science", "business", "words"];

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p, out);
    else if (name === "index.html") out.push(p);
  }
  return out;
}

let n = 0;
for (const d of dirs) {
  const base = join(ROOT, d);
  for (const file of walk(base)) {
    let html = readFileSync(file, "utf8");
    const before = html;

    // depth-2 word pages use ../../ ; category/words hubs use ../
    const isWordPage = /\/[a-z0-9-]+\/[a-z0-9-]+\/index\.html$/i.test(
      file.replace(/\\/g, "/"),
    );
    // words/index and category/index are depth 1
    const homeHref = isWordPage || file.includes(`${d}\\`) && file.match(new RegExp(`${d}\\\\[^\\\\]+\\\\index\\.html$`))
      ? null
      : null;

    // Simpler: detect from existing index.html link depth
    const depth2 = html.includes('href="../../index.html"');
    const home = depth2 ? "../../index.html" : "../index.html";
    const words = depth2 ? "../../words/" : "../words/";

    html = html.replace(
      /<nav aria-label="Primary">\s*<a href="(?:\.\.\/)+index\.html">Search<\/a>/,
      `<nav aria-label="Primary">\n        <a class="nav-home" href="${home}">Home</a>`,
    );

    // Breadcrumbs: prepend Home if missing
    if (html.includes('aria-label="Breadcrumb"') && !html.includes("crumb-home")) {
      html = html.replace(
        /<nav class="crumbs" aria-label="Breadcrumb">\s*<a href="[^"]*words\/?">Words<\/a>/,
        `<nav class="crumbs" aria-label="Breadcrumb">\n        <a class="crumb-home" href="${home}">Home</a>\n        <span>/</span>\n        <a href="${words}">Words</a>`,
      );
    }

    // Footer product first link + legal home
    html = html.replace(
      /<li><a href="(?:\.\.\/)+index\.html">Pronunciation search<\/a><\/li>/,
      `<li><a href="${home}">Home</a></li>`,
    );
    html = html.replace(
      /<p class="legal">© <span data-year><\/span> Speakur\.<\/p>/,
      `<p class="legal">© <span data-year></span> Speakur. <a href="${home}">Home</a></p>`,
    );

    if (html !== before) {
      writeFileSync(file, html);
      n += 1;
    }
  }
}
console.log(`Patched ${n} pages with Home links`);
