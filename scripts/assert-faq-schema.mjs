/** Validate FAQPage JSON-LD inputs for every dataset guide + sample word routes. */
import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const dataset = JSON.parse(readFileSync(join(ROOT, "src/data/dataset.json"), "utf8"));
const faqCfg = dataset.schema.faqPage;

function interpolate(template, vars) {
  return template.replace(/\{\{(\w+)\}\}/g, (_, k) => vars[k] ?? "").trim();
}

function buildItems(pageType, slug, page, extras = {}) {
  const vars = {
    name: page?.name || extras.name || slug,
    primaryKeyword: page?.primaryKeyword || page?.name || slug,
    url: `https://www.speakur.com${page?.path || extras.path || "/"}`,
    year: String(new Date().getFullYear()),
    language: page?.language || "English Voiceover",
    parentCategoryLabel:
      faqCfg.categoryLabels[page?.parentCategory] ||
      (page?.parentCategory || "learning").replace(/-/g, " "),
    priceLabel: "free",
    phoneticSuffix: extras.phonetic ? ` (${extras.phonetic})` : "",
    syllableSuffix: extras.syllables ? ` across ${extras.syllables} syllables` : "",
    readMin: "8",
  };

  const source = page?.faq?.length
    ? page.faq
    : pageType === "word"
      ? faqCfg.word
      : faqCfg.guide;

  return source.slice(0, faqCfg.maxQuestions).map((tpl) => ({
    question: interpolate(tpl.question, vars),
    answer: interpolate(tpl.answer, vars),
  }));
}

let fail = 0;
for (const [slug, page] of Object.entries(dataset.pages)) {
  const items = buildItems("guide", slug, page);
  if (items.length < faqCfg.minQuestions) {
    console.error("FAIL count", slug, items.length);
    fail++;
  }
  for (const item of items) {
    if (!item.question.endsWith("?") && !item.question.includes("?")) {
      console.warn("WARN question lacks ?", slug, item.question.slice(0, 50));
    }
    if (item.answer.length < 40) {
      console.error("FAIL short answer", slug, item.answer.length);
      fail++;
    }
  }
}

const wordItems = buildItems("word", "epitome", null, {
  name: "epitome",
  path: "/w/epitome",
  phonetic: "/ˈɛpɪtiːm/",
  syllables: 3,
});
if (wordItems.length < faqCfg.minQuestions) {
  console.error("FAIL word FAQ count", wordItems.length);
  fail++;
}

if (fail) process.exit(1);
console.log(`OK — FAQ items validated for ${Object.keys(dataset.pages).length} guides + word sample`);
