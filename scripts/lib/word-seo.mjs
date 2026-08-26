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

export function renderWordSeoHeadTags({ word, path, description, phonetic, syllables }) {
  const title = `How to pronounce ${word}`;
  const desc =
    description ||
    `Learn how to pronounce “${word}” with free US and UK audio, IPA phonetic spelling, and clear steps on Speakur.`;
  const canonical = `${BASE}${path.startsWith("/") ? path : `/${path}`}`;
  const jsonLd = buildWordHowToJsonLd({ word, path, description: desc, phonetic, syllables });

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

/**
 * Visible “How to say it” micro-steps — pronunciation teaching, not page chrome.
 * @param {string} word
 * @param {{ phonetic?: string, syllables?: number|null }} [opts]
 */
export function renderHowToStepsHtml(word, opts = {}) {
  const phonetic = String(opts.phonetic || "").trim();
  const syllables = opts.syllables && Number(opts.syllables) > 0 ? Number(opts.syllables) : null;
  const ipaBit = phonetic ? ` (${phonetic})` : "";
  const sylBit = syllables
    ? ` Feel ${syllables} beat${syllables === 1 ? "" : "s"}${phonetic.includes("ˈ") ? " and put weight on the ˈ-marked syllable" : ""}.`
    : " Match the stress you hear.";

  const items = [
    {
      name: "See the sounds",
      text: `Read the IPA for “${word}”${ipaBit} before you speak — symbols show vowels and stress more reliably than English spelling.`,
    },
    {
      name: "Hear US and UK",
      text: `Play the labeled US and UK buttons. Notice where they differ (often vowels or r-sounds). Use Compare when both clips exist.`,
    },
    {
      name: "Slow it down",
      text: `Play Slow once, then shadow the word out loud.${sylBit}`,
    },
    {
      name: "Check yourself",
      text: `Say “${word}” from memory, then replay normal speed. If it still feels shaky, open Practice tools for minimal pairs.`,
    },
  ];

  const list = items
    .map(
      (step, i) =>
        `<li id="step-${i + 1}"><strong>${escapeHtml(step.name)}</strong> — ${escapeHtml(step.text)}</li>`,
    )
    .join("\n        ");

  return `<section class="howto say-it" aria-labelledby="howto-heading" data-say-it="1">
        <h2 id="howto-heading">How to say “${escapeHtml(word)}”</h2>
        <ol>
        ${list}
        </ol>
      </section>`;
}
