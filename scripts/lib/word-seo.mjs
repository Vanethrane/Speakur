/**
 * HowTo + FAQ JSON-LD and How-to meta tags for static word / category pages.
 */
import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "../..");
const dataset = JSON.parse(readFileSync(join(ROOT, "src/data/dataset.json"), "utf8"));
const BASE = "https://www.speakur.com";

function escapeHtml(s = "") {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function interpolate(template, vars) {
  return String(template || "")
    .replace(/\{\{(\w+)\}\}/g, (_, key) => vars[key] ?? "")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * @param {{ word: string, categoryTitle?: string, categorySlug?: string, path: string, description?: string, phonetic?: string, syllables?: number|null }} input
 */
export function buildWordHowToJsonLd(input) {
  const howTo = dataset.schema?.howTo;
  const steps = howTo?.stepTemplates || [];
  const faqCfg = dataset.schema?.faqPage;
  const word = String(input.word || "").trim();
  const path = input.path.startsWith("/") ? input.path : `/${input.path}`;
  const url = `${BASE}${path}`;
  const description =
    input.description ||
    `Hear how to pronounce “${word}”. IPA, syllables, and free US/UK audio on Speakur.`;
  const phonetic = String(input.phonetic || "").trim();
  const year = String(new Date().getFullYear());
  const vars = {
    name: word,
    word,
    url,
    phonetic,
    path,
    category: input.categoryTitle || "",
    year,
    priceLabel: "free",
    accent: "US and UK",
    phoneticSuffix: phonetic ? ` (${phonetic})` : "",
    syllableSuffix:
      input.syllables && Number(input.syllables) > 0
        ? ` across ${input.syllables} syllables`
        : "",
  };

  const graph = [];

  if (steps.length) {
    graph.push({
      "@type": "HowTo",
      "@id": `${url}#howto`,
      name: `How to pronounce ${word}`,
      description,
      totalTime: howTo.totalTime || "PT2M",
      estimatedCost: {
        "@type": "MonetaryAmount",
        currency: howTo.estimatedCost?.currency || "USD",
        value: howTo.estimatedCost?.value || "0",
      },
      tool: [{ "@type": "HowToTool", name: howTo.tool || "Speakur pronunciation search" }],
      step: steps.map((tpl, index) => ({
        "@type": "HowToStep",
        position: index + 1,
        name: interpolate(tpl.name, vars),
        text: interpolate(tpl.text, vars),
        url: `${url}#step-${index + 1}`,
      })),
    });
  }

  const faqTpls = (faqCfg?.word || []).slice(0, faqCfg?.maxQuestions || 3);
  const faqItems = faqTpls
    .map((tpl) => ({
      "@type": "Question",
      name: interpolate(tpl.question, vars),
      acceptedAnswer: {
        "@type": "Answer",
        text: interpolate(tpl.answer, vars),
      },
    }))
    .filter((q) => q.name && q.acceptedAnswer.text.length > 20);

  if (faqItems.length >= (faqCfg?.minQuestions || 2)) {
    graph.push({
      "@type": "FAQPage",
      "@id": `${url}#faq`,
      url,
      mainEntity: faqItems,
    });
  }

  graph.push({
    "@type": "WebPage",
    "@id": `${url}#webpage`,
    url,
    name: `How to pronounce ${word}`,
    description,
    inLanguage: "en",
    isPartOf: { "@type": "WebSite", name: "Speakur", url: BASE },
    mainEntity: steps.length ? { "@id": `${url}#howto` } : undefined,
  });

  const webPage = graph[graph.length - 1];
  if (!webPage.mainEntity) delete webPage.mainEntity;

  return {
    "@context": "https://schema.org",
    "@graph": graph,
  };
}

export function renderWordSeoHeadTags({ word, path, description, phonetic }) {
  const title = `How to pronounce ${word}`;
  const desc =
    description ||
    `Learn how to pronounce “${word}” with free US and UK audio, IPA phonetic spelling, and clear steps on Speakur.`;
  const canonical = `${BASE}${path.startsWith("/") ? path : `/${path}`}`;
  const jsonLd = buildWordHowToJsonLd({ word, path, description: desc, phonetic });

  return `  <meta name="description" content="${escapeHtml(desc)}" />
  <link rel="canonical" href="${escapeHtml(canonical)}" />
  <meta property="og:type" content="article" />
  <meta property="og:site_name" content="Speakur" />
  <meta property="og:title" content="${escapeHtml(title)}" />
  <meta property="og:description" content="${escapeHtml(desc)}" />
  <meta property="og:url" content="${escapeHtml(canonical)}" />
  <meta name="twitter:card" content="summary" />
  <meta name="twitter:title" content="${escapeHtml(title)}" />
  <meta name="twitter:description" content="${escapeHtml(desc)}" />
  <meta name="keywords" content="${escapeHtml(`how to pronounce ${word}, ${word} pronunciation, ${word} IPA, say ${word}`)}" />
  <script type="application/ld+json">${JSON.stringify(jsonLd)}</script>
`;
}

export function renderHowToStepsHtml(word) {
  const steps = dataset.schema?.howTo?.stepTemplates || [];
  if (!steps.length) return "";
  const vars = { name: word, word, url: "", phonetic: "", path: "" };
  const items = steps
    .map(
      (tpl, i) =>
        `<li id="step-${i + 1}"><strong>${escapeHtml(interpolate(tpl.name, vars))}</strong> — ${escapeHtml(interpolate(tpl.text, vars))}</li>`,
    )
    .join("\n        ");
  return `<section class="howto" aria-labelledby="howto-heading">
        <h2 id="howto-heading">How to pronounce ${escapeHtml(word)}</h2>
        <ol>
        ${items}
        </ol>
      </section>`;
}
