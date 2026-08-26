/**
 * Build Speakur IA hubs (v1):
 * - Category subsection hubs (collision-safe paths)
 * - Words curated hubs under /words/{slug}/
 * - Tools + Research landing pages
 * - Patch category hubs + words hub + key static nav links
 *
 * Usage: node scripts/build-ia-hubs.mjs
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "fs";
import { join } from "path";
import {
  IA_TREE,
  LEGACY_HUBS,
  SUBSECTION_DEFS,
  TOOL_PAGES,
  RESEARCH_GUIDES,
} from "../data/ia-tree.mjs";
import {
  escapeHtml,
  renderWordsHub,
  renderSubsectionHub,
  renderSimpleLanding,
  renderExploreMoreHtml,
} from "./lib/word-html.mjs";

const ROOT = process.cwd();
const catalog = JSON.parse(readFileSync(join(ROOT, "data/catalog.json"), "utf8"));

/** word -> { slug, title } */
const wordIndex = new Map();
/** categorySlug -> Set(words) */
const catWords = new Map();

for (const cat of catalog.categories) {
  const set = new Set(cat.words.map((w) => String(w).toLowerCase()));
  catWords.set(cat.slug, set);
  for (const w of set) {
    if (!wordIndex.has(w)) wordIndex.set(w, { slug: cat.slug, title: cat.title });
  }
}

function resolveHubPath(parentSlug, childSlug) {
  const preferred = `/${parentSlug}/${childSlug}/`;
  const words = catWords.get(parentSlug);
  if (words && words.has(childSlug)) {
    return {
      path: `/${parentSlug}/topic/${childSlug}/`,
      fsDir: join(ROOT, parentSlug, "topic", childSlug),
      depth: 3,
      collision: true,
      pathLabel: `/${parentSlug}/topic/${childSlug}/`,
    };
  }
  return {
    path: preferred,
    fsDir: join(ROOT, parentSlug, childSlug),
    depth: 2,
    collision: false,
    pathLabel: preferred,
  };
}

function matchWordsForDef(defKey, def) {
  const found = new Map(); // word -> { slug, title }
  const parent = def.parent;
  const scope =
    parent === "words"
      ? null
      : catWords.get(parent) || new Set();

  const consider = (word) => {
    const w = String(word).toLowerCase().trim();
    if (!w || found.has(w)) return;
    if (parent === "words" || def.crossCategory) {
      const hit = wordIndex.get(w);
      if (hit) found.set(w, hit);
      return;
    }
    if (scope.has(w)) {
      const cat = catalog.categories.find((c) => c.slug === parent);
      found.set(w, { slug: parent, title: cat?.title || parent });
    }
  };

  for (const seed of def.seeds || []) consider(seed);

  if (def.patterns?.length) {
    const pool =
      parent === "words"
        ? [...wordIndex.keys()]
        : [...(catWords.get(parent) || [])];
    for (const w of pool) {
      if (found.size >= 180) break;
      if (def.patterns.some((re) => re.test(w))) consider(w);
    }
  }

  return [...found.entries()]
    .map(([word, meta]) => ({
      word,
      href:
        parent === "words" || meta.slug !== parent
          ? `/${meta.slug}/${encodeURIComponent(word)}/`
          : `../${encodeURIComponent(word)}/`,
      absHref: `/${meta.slug}/${encodeURIComponent(word)}/`,
      hint: `/${meta.slug}/${word}/`,
      categoryTitle: meta.title,
    }))
    .sort((a, b) => a.word.localeCompare(b.word));
}

function writePage(filePath, html) {
  mkdirSync(join(filePath, ".."), { recursive: true });
  // When filePath is .../index.html, mkdir parent; when given a dir, we join index
  writeFileSync(filePath, html);
}

function hubIndexPath(fsDir) {
  mkdirSync(fsDir, { recursive: true });
  return join(fsDir, "index.html");
}

const builtPaths = [];
const subsectionMeta = new Map(); // parentSlug -> [{title, href, count, description, pathLabel}]

function buildSubsectionHubs() {
  for (const [key, def] of Object.entries(SUBSECTION_DEFS)) {
    const linksRaw = matchWordsForDef(key, def);
    if (def.parent === "words") {
      const fsDir = join(ROOT, "words", def.slug);
      const depth = 2;
      const links = linksRaw.map((l) => ({
        ...l,
        href: `../../${l.hint.slice(1)}`,
      }));
      const html = renderSubsectionHub({
        title: def.title,
        description: def.description,
        depth,
        pathLabel: `/words/${def.slug}/`,
        parentHref: "../",
        parentTitle: "directories",
        guideLinks: def.guideLinks || [],
        crumbs: [
          { label: "Home", href: "../../index.html" },
          { label: "Words", href: "../" },
          { label: def.title },
        ],
        links,
      });
      writeFileSync(hubIndexPath(fsDir), html);
      builtPaths.push(`/words/${def.slug}/`);
      console.log(`  /words/${def.slug}/ → ${links.length} words`);
      continue;
    }

    const resolved = resolveHubPath(def.parent, def.slug);
    const links = linksRaw.map((l) => {
      // Prefer relative link into the real catalog category from this hub
      const abs = `/${l.hint.replace(/^\//, "")}`;
      const toRoot = "../".repeat(resolved.depth);
      return {
        ...l,
        href: `${toRoot}${l.hint.replace(/^\//, "")}`,
        hint: abs,
      };
    });

    const parentCat = catalog.categories.find((c) => c.slug === def.parent);
    const homePrefix = "../".repeat(resolved.depth);
    const html = renderSubsectionHub({
      title: def.title,
      description: def.description,
      depth: resolved.depth,
      pathLabel: resolved.pathLabel,
      parentHref: resolved.depth === 2 ? "../" : "../../",
      parentTitle: parentCat?.title || def.parent,
      guideLinks: def.guideLinks || [
        ["commonly-mispronounced-english-words", "Commonly mispronounced words"],
        ["how-to-read-ipa-phonetic-symbols", "How to read IPA"],
      ],
      crumbs: [
        { label: "Home", href: `${homePrefix}index.html` },
        { label: "Words", href: `${homePrefix}words/` },
        {
          label: parentCat?.title || def.parent,
          href: resolved.depth === 2 ? "../" : "../../",
        },
        { label: def.title },
      ],
      links,
    });
    writeFileSync(hubIndexPath(resolved.fsDir), html);
    builtPaths.push(resolved.path);
    if (!subsectionMeta.has(def.parent)) subsectionMeta.set(def.parent, []);
    subsectionMeta.get(def.parent).push({
      title: def.title,
      href: resolved.collision ? `./topic/${def.slug}/` : `./${def.slug}/`,
      count: links.length,
      description: def.description,
      pathLabel: resolved.pathLabel,
    });
    console.log(
      `  ${resolved.pathLabel} → ${links.length} words${resolved.collision ? " (topic/ — word collision)" : ""}`,
    );
  }
}

function patchCategoryHubs() {
  for (const [slug, subs] of subsectionMeta.entries()) {
    const file = join(ROOT, slug, "index.html");
    if (!existsSync(file)) continue;
    let html = readFileSync(file, "utf8");
    if (html.includes('data-ia-subsections="1"')) {
      // Replace existing block
      html = html.replace(
        /<section class="ia-subsections"[\s\S]*?<\/section>/,
        buildSubsectionBlock(slug, subs),
      );
    } else {
      const block = buildSubsectionBlock(slug, subs);
      if (html.includes('<ul class="word-index">')) {
        html = html.replace('<ul class="word-index">', `${block}\n      <ul class="word-index">`);
      } else if (html.includes("</main>")) {
        html = html.replace("</main>", `${block}\n    </main>`);
      }
    }
    writeFileSync(file, html);
    console.log(`  patched /${slug}/ with ${subs.length} subsection links`);
  }
}

function buildSubsectionBlock(slug, subs) {
  const cards = subs
    .map(
      (s) => `          <a class="card" href="${escapeHtml(s.href)}">
            <div class="meta">${s.count} words</div>
            <h2>${escapeHtml(s.title)}</h2>
            <p>${escapeHtml(s.description || "")}</p>
            <p class="note">${escapeHtml(s.pathLabel)}</p>
          </a>`,
    )
    .join("\n");
  return `<section class="ia-subsections" data-ia-subsections="1">
        <h2>Browse by topic</h2>
        <p class="note">Curated hubs within this directory. Existing word URLs are unchanged.</p>
        <div class="card-stack">
${cards}
        </div>
      </section>`;
}

function buildWordsHub() {
  const treeHtml = `<section class="ia-tree" data-ia-tree="1">
        <h2>Site map</h2>
        <ul class="ia-tree-list">
          <li><a href="../index.html">Pronunciation Search</a></li>
          <li>Words
            <ul>
              <li><a href="../everyday/">Everyday</a></li>
              <li><a href="./difficult/">Difficult</a></li>
              <li><a href="./commonly-mispronounced/">Commonly Mispronounced</a></li>
              <li><a href="./academic/">Academic</a></li>
              <li><a href="./technical/">Technical</a></li>
            </ul>
          </li>
          <li><a href="../names/">Names</a> · Irish, Japanese, figures…</li>
          <li><a href="../places/">Places</a> · countries, cities, states…</li>
          <li><a href="../brands/">Brands</a> · tech, fashion, cars, food…</li>
          <li><a href="../food/">Food</a> · dishes, cheese, wine…</li>
          <li><a href="../medical/">Medical</a> · diseases, anatomy, drugs…</li>
          <li><a href="../science/">Science</a></li>
          <li><a href="../tech/">Technology</a></li>
          <li><a href="../sports/">Sports</a></li>
          <li><a href="../tools/">Tools</a></li>
          <li><a href="../guides.html">Guides</a></li>
          <li><a href="../research/">Research / Data</a></li>
        </ul>
        <p class="note">Also available: ${LEGACY_HUBS.map((h) => `<a href="..${h.href}">${escapeHtml(h.title)}</a>`).join(" · ")}</p>
      </section>`;

  const html = renderWordsHub(catalog.categories, { treeHtml });
  mkdirSync(join(ROOT, "words"), { recursive: true });
  writeFileSync(join(ROOT, "words/index.html"), html);
  builtPaths.push("/words/");
  console.log("  wrote /words/");
}

function buildTools() {
  const landingBody = `
      <div class="card-stack">
        ${TOOL_PAGES.filter((p) => p.slug)
          .map(
            (p) => `<a class="card" href="./${escapeHtml(p.slug)}/">
          <h2>${escapeHtml(p.title)}</h2>
          <p>${escapeHtml(p.description)}</p>
          <p class="note">${escapeHtml(p.path)}</p>
        </a>`,
          )
          .join("\n")}
      </div>
      <p class="note"><a href="../words/">Word directories</a> · <a href="../guides.html">Guides</a> · <a href="../research/">Research / Data</a></p>`;

  const landing = renderSimpleLanding({
    title: "Tools",
    description: TOOL_PAGES[0].description,
    depth: 1,
    active: "tools",
    eyebrow: "Free tools",
    lede: TOOL_PAGES[0].description,
    crumbs: [
      { label: "Home", href: "../index.html" },
      { label: "Tools" },
    ],
    bodyHtml: landingBody,
  });
  writeFileSync(hubIndexPath(join(ROOT, "tools")), landing);
  builtPaths.push("/tools/");

  for (const page of TOOL_PAGES.filter((p) => p.slug)) {
    const moreGuides =
      page.slug === "audio"
        ? [
            ["on-demand-tts-and-click-gating", "On-demand TTS and click gating"],
            ["caching-audio-for-cost-efficient-tts", "Caching audio"],
            ["guide-to-audio-localization", "Audio localization"],
          ]
        : page.guideSlug
          ? [[page.guideSlug, page.primaryLabel]]
          : [];

    const body = `
      <p class="note interactive-slot" style="min-height:2.75rem">
        <a class="btn btn-voice" href="../${page.primaryHref.replace(/^\//, "")}">${escapeHtml(page.primaryLabel)}</a>
      </p>
      ${
        moreGuides.length
          ? `<section class="related"><h2>Related guides</h2><ul>${moreGuides
              .map(
                ([slug, label]) =>
                  `<li><a href="../guide.html?slug=${encodeURIComponent(slug)}">${escapeHtml(label)}</a></li>`,
              )
              .join("")}</ul></section>`
          : ""
      }
      <section class="related">
        <h2>More tools</h2>
        <div class="chip-row">
          ${TOOL_PAGES.filter((p) => p.slug && p.slug !== page.slug)
            .map((p) => `<a class="chip" href="../${p.slug}/">${escapeHtml(p.title)}</a>`)
            .join("")}
          <a class="chip" href="../">All tools</a>
          <a class="chip" href="../../index.html">Search</a>
        </div>
      </section>`;

    // Fix primary href for depth-2 tool pages
    const primaryHref =
      page.slug === "generator"
        ? "../../index.html"
        : page.primaryHref.startsWith("/guide")
          ? `../../guide.html?slug=${encodeURIComponent(page.guideSlug || page.primaryHref.split("slug=")[1] || "")}`
          : `../..${page.primaryHref}`;

    const bodyFixed = body.replace(
      /href="\.\.\/[^"]+"/,
      `href="${primaryHref}"`,
    );

    // Rebuild body more carefully
    const guideList =
      page.slug === "audio"
        ? [
            ["on-demand-tts-and-click-gating", "On-demand TTS and click gating"],
            ["caching-audio-for-cost-efficient-tts", "Caching audio"],
            ["guide-to-audio-localization", "Audio localization"],
            ["accessibility-audio-for-dyslexia-and-esl", "Accessibility audio"],
          ]
        : page.slug === "ipa"
          ? [
              ["how-to-read-ipa-phonetic-symbols", "How to read IPA"],
              ["science-of-syllables-and-stress", "Syllables and stress"],
              ["us-vs-uk-pronunciation-differences", "US vs UK"],
            ]
          : page.slug === "practice"
            ? [
                ["building-a-pronunciation-practice-routine", "Practice routine"],
                ["why-pronunciation-matters-for-learners", "Why pronunciation matters"],
                ["teaching-pronunciation-in-the-classroom", "Classroom teaching"],
                ["commonly-mispronounced-english-words", "Tricky words"],
              ]
            : page.slug === "generator"
              ? [
                  ["how-to-read-ipa-phonetic-symbols", "How to read IPA"],
                  ["commonly-mispronounced-english-words", "Tricky words"],
                ]
              : [];

    const toolBody = `
      <p style="margin:1.5rem 0 0;">
        <a class="chip" href="${primaryHref}" style="display:inline-block;padding:0.65rem 1.1rem;background:var(--voice);color:var(--paper-raised);border-color:var(--voice);">${escapeHtml(page.primaryLabel)}</a>
      </p>
      <section class="related" style="margin-top:2rem">
        <h2>Related guides</h2>
        <ul>${guideList
          .map(
            ([slug, label]) =>
              `<li><a href="../../guide.html?slug=${encodeURIComponent(slug)}">${escapeHtml(label)}</a></li>`,
          )
          .join("")}</ul>
      </section>
      <section class="related">
        <h2>More tools</h2>
        <div class="chip-row">
          ${TOOL_PAGES.filter((p) => p.slug && p.slug !== page.slug)
            .map((p) => `<a class="chip" href="../${p.slug}/">${escapeHtml(p.title)}</a>`)
            .join("")}
          <a class="chip" href="../">All tools</a>
        </div>
      </section>`;

    const html = renderSimpleLanding({
      title: page.title,
      description: page.description,
      depth: 2,
      active: "tools",
      eyebrow: "Tool",
      lede: page.description,
      crumbs: [
        { label: "Home", href: "../../index.html" },
        { label: "Tools", href: "../" },
        { label: page.title },
      ],
      bodyHtml: toolBody,
    });
    writeFileSync(hubIndexPath(join(ROOT, "tools", page.slug)), html);
    builtPaths.push(page.path);
    console.log(`  ${page.path}`);
  }

  // Back-compat stub: tools.html → redirect-style link page to /tools/
  const stub = renderSimpleLanding({
    title: "Tools",
    description: "Speakur pronunciation tools have moved to /tools/.",
    depth: 0,
    active: "tools",
    eyebrow: "Tools",
    lede: "Practice tools, IPA help, audio guides, and the pronunciation search live under /tools/.",
    crumbs: [{ label: "Home", href: "./index.html" }, { label: "Tools" }],
    bodyHtml: `<p class="note"><a href="./tools/">Go to /tools/</a> · <a href="./tools/generator/">Pronunciation generator</a> · <a href="./tools/ipa/">IPA</a> · <a href="./tools/practice/">Practice</a></p>`,
  });
  // depth 0 chrome uses assets/ at ./assets — good for root tools.html
  writeFileSync(join(ROOT, "tools.html"), stub);
  builtPaths.push("/tools.html");
}

function buildResearch() {
  const body = `
      <section class="related">
        <h2>Guides for builders &amp; researchers</h2>
        <ul>
          ${RESEARCH_GUIDES.map(
            ([slug, label]) =>
              `<li><a href="../guide.html?slug=${encodeURIComponent(slug)}">${escapeHtml(label)}</a></li>`,
          ).join("")}
        </ul>
      </section>
      <section class="related">
        <h2>Data &amp; directories</h2>
        <ul>
          <li><a href="../words/">Word directories (~70k pages)</a></li>
          <li><a href="../guides.html">All editorial guides</a></li>
          <li><a href="../privacy.html">Privacy policy</a></li>
          <li><a href="../tools/">Tools</a></li>
        </ul>
      </section>`;
  const html = renderSimpleLanding({
    title: "Research / Data",
    description:
      "Notes and guides on programmatic SEO, privacy, caching, and how Speakur builds pronunciation pages.",
    depth: 1,
    active: "",
    eyebrow: "Research",
    lede: "How Speakur approaches programmatic SEO, privacy-aware ads, audio caching, and on-demand speech.",
    crumbs: [
      { label: "Home", href: "../index.html" },
      { label: "Research / Data" },
    ],
    bodyHtml: body,
  });
  writeFileSync(hubIndexPath(join(ROOT, "research")), html);
  builtPaths.push("/research/");
  console.log("  /research/");
}

function patchStaticNav() {
  const files = [
    "index.html",
    "about.html",
    "contact.html",
    "donate.html",
    "guides.html",
    "guide.html",
    "privacy.html",
    "terms.html",
    "404.html",
  ];
  const navRe =
    /(<nav aria-label="Primary">)([\s\S]*?)(<\/nav>)/;

  for (const name of files) {
    const file = join(ROOT, name);
    if (!existsSync(file)) continue;
    let html = readFileSync(file, "utf8");
    if (!navRe.test(html)) continue;
    const prefix = name.includes("/") ? "../" : "./";
    // Root pages use ./
    const home = "./";
    const nextNav = `<nav aria-label="Primary">
          <a class="nav-home" href="${home}index.html">Home</a>
          <a href="${home}words/">Words</a>
          <a href="${home}tools/">Tools</a>
          <a href="${home}guides.html">Guides</a>
          <a href="${home}about.html">About</a>
        </nav>`;
    html = html.replace(navRe, nextNav);
    // Soft-add research + tools to explore blocks if present
    if (html.includes("Explore more") && !html.includes('href="./tools/"') && !html.includes('href="./research/"')) {
      html = html.replace(
        /<li><a href="\.\/words\/">Word directories<\/a><\/li>/,
        `<li><a href="./words/">Word directories</a></li>
              <li><a href="./tools/">Tools</a></li>
              <li><a href="./research/">Research / Data</a></li>`,
      );
    }
    writeFileSync(file, html);
    console.log(`  nav patched ${name}`);
  }

  // Home explore block: ensure tools/research links
  const home = join(ROOT, "index.html");
  if (existsSync(home)) {
    let html = readFileSync(home, "utf8");
    if (!html.includes('href="./tools/"')) {
      html = html.replace(
        '<li><a href="./words/">Word directories</a></li>',
        `<li><a href="./words/">Word directories</a></li>
              <li><a href="./tools/">Tools</a></li>
              <li><a href="./research/">Research / Data</a></li>`,
      );
      writeFileSync(home, html);
    }
  }
}

function writeManifest() {
  const out = {
    generatedAt: new Date().toISOString(),
    paths: [...new Set(builtPaths)].sort(),
    collisions: [...subsectionMeta.entries()].flatMap(([parent, subs]) =>
      subs
        .filter((s) => s.pathLabel.includes("/topic/"))
        .map((s) => ({ parent, ...s })),
    ),
  };
  writeFileSync(join(ROOT, "data/ia-hubs-manifest.json"), JSON.stringify(out, null, 2));
  console.log(`  manifest ${out.paths.length} paths`);
}

function main() {
  console.log("Building IA hubs…");
  console.log("Subsection hubs:");
  buildSubsectionHubs();
  console.log("Category patches:");
  patchCategoryHubs();
  console.log("Words hub:");
  buildWordsHub();
  console.log("Tools:");
  buildTools();
  console.log("Research:");
  buildResearch();
  console.log("Static nav:");
  patchStaticNav();
  writeManifest();
  console.log("Done.");
}

main();
