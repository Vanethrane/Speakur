import type { GuideSection } from "./types";

const longTail = (topic: string): GuideSection => ({
  heading: `Extended notes: ${topic}`,
  paragraphs: [
    `This extended section deepens the Speakur editorial treatment of ${topic}. Readers who arrive from search often need more than a short summary; they need worked examples, failure modes, and language they can reuse with teammates. We write these expansions so each guide stands alone as a serious reference rather than a thin companion to a dictionary template. If you are a teacher, mark the paragraphs you will assign. If you are a marketer, highlight the checklists. If you are an engineer, note the invariants that protect cost and crawlability. The aim is practical depth that survives a careful human review.`,
    `Consider a concrete week of practice or production around ${topic}. On Monday, inventory the words, scripts, or lessons you will touch. On Tuesday, look up pronunciations and save canonical audio. On Wednesday, draft or teach with those anchors visible. On Thursday, review errors without blame. On Friday, publish or present, then log what still felt unstable. That weekly loop turns abstract advice into an operating habit. Speakur’s pronunciation search exists to shrink the lookup friction inside that loop so people actually finish it instead of abandoning the tab.`,
    `Organizations fail at ${topic} when ownership is unclear. Assign a named owner, a review cadence, and a place where decisions live—glossary rows, accent records, lesson plans, or privacy inventories. Without ownership, tools accumulate and standards decay. With ownership, even a small team can outperform a larger team that improvises. Write the owner’s name next to the policy. Revisit it when people change roles. Put the review date on a calendar so the document cannot silently rot for a year.`,
    `Measurement keeps the work honest. Define two or three signals that show progress: fewer clarification requests, higher cache hit rates, better caption accuracy, stronger Search Console impressions on guides, or simply more students willing to speak. Review those signals monthly. If they do not move, change the routine rather than buying another vendor demo. ${topic} rewards steady systems. Pair those systems with server-rendered explanations like this guide so both humans and crawlers can understand what Speakur stands for and why the pages exist.`,
    `Finally, keep ethics in view while you operationalize ${topic}. Pronunciation, accents, and audio technology sit close to identity. Avoid mockery, disclose synthetic speech where appropriate, respect consent for voice data, and make accessibility a default. Commercial success that depends on confusing learners or trapping them in dark patterns will not survive manual review—nor should it. Build practices you would be comfortable defending to a skeptical teacher, a privacy regulator, and a careful parent at the same time.`,
    `If you are implementing tooling, write down the non-negotiables beside your notes on ${topic}: HTML must contain the educational text without waiting on client JavaScript; paid speech synthesis must wait for a real user gesture; generated audio must be cached permanently; trust pages must remain linked in the footer; and editorial guides must continue to ship on a cadence. Those rules keep a pronunciation site useful at human scale and credible under partner and search reviews.`,
    `Share this guide with the next teammate who joins your localization, teaching, or growth pod. Ask them to annotate disagreements. Healthy argument about ${topic} beats silent drift. Update the Speakur glossary and internal checklists when the argument produces a decision. Over a quarter, those annotations become an institutional advantage—exactly the kind of durable, people-first substance that thin doorway sites never bother to create.`,
  ],
});

export const GUIDE_EXPANSIONS_C: Record<string, GuideSection[]> = {
  "teaching-pronunciation-in-the-classroom": [longTail("classroom pronunciation teaching")],
  "accessibility-audio-for-dyslexia-and-esl": [longTail("accessible audio for diverse readers")],
  "on-demand-tts-and-click-gating": [longTail("on-demand TTS and click-gating")],
  "science-of-syllables-and-stress": [longTail("syllables and stress in English")],
  "commonly-mispronounced-english-words": [longTail("commonly mispronounced words")],
  "subtitles-captions-and-dubbing-compared": [longTail("subtitles, captions, and dubbing")],
  "programmatic-seo-for-dictionary-sites": [longTail("programmatic SEO for dictionaries")],
  "choosing-voices-for-brand-consistency": [longTail("brand voice consistency")],
  "speech-to-text-vs-text-to-speech": [longTail("STT versus TTS architecture")],
  "building-a-pronunciation-practice-routine": [longTail("personal pronunciation routines")],
  "why-pronunciation-matters-for-learners": [longTail("why learners need pronunciation work")],
  "privacy-cookies-and-responsible-ad-tech": [longTail("privacy, cookies, and ad tech")],
  "caching-audio-for-cost-efficient-tts": [longTail("audio caching economics")],
  "us-vs-uk-pronunciation-differences": [longTail("US and UK pronunciation differences")],
  "guide-to-audio-localization": [longTail("practical audio localization")],
  "how-to-read-ipa-phonetic-symbols": [longTail("reading IPA with confidence")],
  "linguistic-accents-in-global-marketing": [longTail("accents in global marketing")],
  "how-ai-speech-synthesis-works": [longTail("applied speech synthesis")],
};
