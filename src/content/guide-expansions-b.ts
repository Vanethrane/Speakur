import type { GuideSection } from "./types";

/** Second-pass expansions so every guide clears 800+ words of article body. */
export const GUIDE_EXPANSIONS_B: Record<string, GuideSection[]> = {
  "how-ai-speech-synthesis-works": [
    {
      heading: "What to tell stakeholders who only see the demo",
      paragraphs: [
        "Demos hide the boring virtues: cache hit ratios, crawler isolation, and evaluation harnesses. When you present Speakur-like architecture to executives, lead with user value—faster confidence on hard words—then show the cost curve with and without caching. Bring a spreadsheet, not only a waveform. Stakeholders who understand the decision tree become allies when someone proposes autoplaying audio on every landing page “for engagement.”",
        "Also educate support teams. They should know that missing audio usually means a first-time generation, not an outage, and that browser fallback may sound different from studio voice. Clear internal FAQs prevent panic tickets during launches.",
        "Synthesis will keep changing. Your invariants should not: text in HTML, audio on intent, bytes in durable storage, quality measured on a fixed word list. Hold those invariants and the rest of the stack can evolve safely.",
      ],
    },
  ],
  "linguistic-accents-in-global-marketing": [
    {
      heading: "Case patterns worth studying",
      paragraphs: [
        "Consider a B2B SaaS expanding from the US to the UK and Ireland. Keeping General American for global product videos may be fine, but local case studies and event emcees often perform better with local hosts. The mistake is mixing accents randomly inside a single campaign flight. Segment by asset type: global demo in one voice, local testimonials authentic to speakers, on-hold audio matching the market of the phone number.",
        "Consumer brands launching invented product names should pressure-test those names with native listeners before mass TTS. A name that looks sleek on packaging can be awkward to say on radio. If the awkwardness is unavoidable, teach it early with IPA and cached audio in creator kits.",
        "Accent strategy also intersects with hiring. If your support team answers calls with a different accent than your ads, set expectations in onboarding rather than forcing unnatural speech. Consistency of pronunciation for names matters more than forcing every employee into the ad voice.",
      ],
    },
  ],
  "guide-to-audio-localization": [
    {
      heading: "Tooling stack examples for small teams",
      paragraphs: [
        "A lean stack might look like: storage for masters, a spreadsheet glossary linked to Speakur pages, Whisper or Deepgram for drafts, a translation vendor or LLM-assisted draft with human edit, OpenAI tts-1 or a premium voice for target audio, and R2 for finals. Larger teams add TMS software, linguistic QA portals, and automated loudness checks. Start lean; add tools when coordination pain is real.",
        "Avoid buying five overlapping AI subscriptions that each regenerate audio differently. Consolidate on one synthesis path per language for long-tail content. Hero videos can still use boutique talent.",
        "Document your stack in the same place as your glossary. When someone leaves the company, localization should not collapse. Process continuity is a competitive advantage disguised as paperwork.",
      ],
    },
  ],
  "how-to-read-ipa-phonetic-symbols": [
    {
      heading: "Common learner mistakes with IPA",
      paragraphs: [
        "Learners often treat IPA as a new alphabet to pronounce letter-by-letter in their L1 values. The fix is always audio anchoring. Another mistake is ignoring stress marks because they look decorative. Circle them in red if you must. A third mistake is mixing American and British charts without noticing vowel symbol differences—keep one chart per accent on your desk.",
        "Teachers sometimes overwhelm beginners with the full pulmonic consonant chart. Resist. Teach a dozen high-leverage symbols, then expand. Confidence compounds faster than coverage.",
        "If you build software, tooltips on hover for each symbol help, but do not hide the transcription behind a click wall that crawlers cannot see. Visible IPA in HTML serves learners and search engines together.",
      ],
    },
  ],
  "us-vs-uk-pronunciation-differences": [
    {
      heading: "Content ops tips for dual-accent libraries",
      paragraphs: [
        "Store US and UK clips as siblings, not overwrites. Name files with locale codes. In CMS fields, require an accent enum. For pages that show both, present buttons labeled clearly—never “Option A.” In analytics, track which accent is played more by geography to validate assumptions.",
        "When only one free dictionary clip exists, say so. Honesty beats fake symmetry. Offer studio generation for the missing accent on click if your budget allows.",
        "Train creators with a one-page “transatlantic traps” sheet: herb, schedule, tomato, privacy, advertisement, mobile, vitamin. Update the sheet as your glossary grows. Small rituals keep large catalogs clean.",
      ],
    },
  ],
  "why-pronunciation-matters-for-learners": [
    {
      heading: "For product managers building learner tools",
      paragraphs: [
        "If you manage a language app, fund pronunciation even when vocabulary growth metrics look healthier. Learners who cannot say words stop using them, which eventually hurts retention. Instrument “played pronunciation” events next to “saved word” events and correlate with week-four retention.",
        "Beware dark patterns that autoplay every example sentence. Respect attention. Offer slow audio and waveform only if they reduce time-to-clarity.",
        "Partner with teachers for content packs. Classroom-ready word lists with audio and IPA outperform generic frequency lists for many segments. Speakur’s editorial guides exist to support that teacher-aware positioning, not only consumer SEO.",
      ],
    },
  ],
  "building-a-pronunciation-practice-routine": [
    {
      heading: "Routine templates for different lifestyles",
      paragraphs: [
        "The commuting professional: five minutes of shadowing on a walk with earbuds, danger-list review on the train via IPA only, weekend recording at home. The student: integrate with homework readings, ask teachers for stress feedback, keep a shared doc with classmates. The parent-learner: practice during chores with a loudspeaker playlist of target words, laugh with kids about funny mouth shapes, keep shame out of the house.",
        "Match the template to energy levels. After a hard day, do listening-only. On strong days, record. Flexibility keeps identity as “someone who practices” intact.",
        "Review the template every month the way you would review a workout plan. If adherence falls below fifty percent, shrink the plan, do not invent a harsher one. Sustainable beats impressive.",
      ],
    },
  ],
  "speech-to-text-vs-text-to-speech": [
    {
      heading: "Pronunciation scoring: a careful STT cousin",
      paragraphs: [
        "Some products attempt to score user pronunciation by comparing learner audio to a model. That feature uses STT-like and alignment technologies and raises fairness questions across accents. If you build it, be transparent that scores are approximate, avoid punishing legitimate dialect features, and never shame users publicly.",
        "For Speakur’s MVP focus—reference audio and teaching guides—are lower risk and still high value. Add scoring later with linguist review. Many learners primarily need a trustworthy model to imitate, not a numeric verdict.",
        "Whatever you ship, keep the conceptual map clear in docs: this feature listens (STT family), that feature speaks (TTS family), this glossary stores truth. Clear maps make safer roadmaps.",
      ],
    },
  ],
  "caching-audio-for-cost-efficient-tts": [
    {
      heading: "Finops questions to ask monthly",
      paragraphs: [
        "How many unique synthesize requests did we pay for? What was the cache hit rate? Which words burned cash repeatedly because of key collisions or version thrash? Are bots still somehow POSTing? Which locales or voices are unused and can be deprecated?",
        "Put these questions on a calendar. Audio FinOps is light work if metrics exist and impossible if everything is a black box. Export vendor invoices into the same dashboard as hit rates.",
        "Celebrate boring months where traffic rose and TTS spend did not. That is the chart that proves the architecture. Share it in company all-hands so growth teams do not accidentally propose uncached autoplay later.",
      ],
    },
  ],
  "choosing-voices-for-brand-consistency": [
    {
      heading: "Legal and creative review together",
      paragraphs: [
        "Legal teams care about likeness rights, disclosure of synthetic speech, and music beds under voiceovers. Creative teams care about warmth and clarity. Force a joint review before locking a voice. Surprises after a shoot are expensive.",
        "If you use employee voices, get written consent for each usage category: ads, e-learning, IVR, and AI cloning. Consent is not transferable by vibes.",
        "Archive the approved samples with contracts in the same vault. Future you will thank present you when a campaign is questioned two years later.",
      ],
    },
  ],
  "subtitles-captions-and-dubbing-compared": [
    {
      heading: "Platform-specific gotchas",
      paragraphs: [
        "Social platforms burn-in captions differently; some reflow text aggressively. Always check on a phone. Streaming platforms may require specific caption formats and language codes. Podcasts need show-notes spellings that match spoken names—another glossary job.",
        "Auto-captions on upload are drafts, not deliverables. Budget human pass time even when AI is “good enough” in demos. Your brand is on the line when a caption swears incorrectly or mislabels a person.",
        "Pick a pilot video, run subtitle, caption, and dub variants, and measure completion and comprehension surveys. Evidence beats tribal preference inside companies that argue endlessly about immersion versus speed.",
      ],
    },
  ],
  "teaching-pronunciation-in-the-classroom": [
    {
      heading: "Working with mixed-level and large classes",
      paragraphs: [
        "Large classes cannot get individual oral feedback every day. Use choral repetition, small-group roles, and rotating focus students. Technology can collect voice notes asynchronously so the teacher reviews a sample. Speakur links in the LMS reduce “how do you say this?” interruptions during reading time.",
        "Mixed levels benefit from tiered word lists: core, stretch, challenge. Everyone practices stress; advanced students add linking and reductions. Keep the social goal shared so lower-level students are not spectators.",
        "Advocate for pronunciation minutes in curriculum meetings with data: fewer clarification requests in presentations, higher peer comprehensibility ratings. Teachers need institutional cover to protect those minutes from being eaten by test prep.",
      ],
    },
  ],
  "commonly-mispronounced-english-words": [
    {
      heading: "A starter pack of high-frequency traps",
      paragraphs: [
        "Work through this starter pack with audio: epitome, hyperbole, Worcestershire, quinoa, anemone, mischievous, espresso, nuclear, librarian forms of library, often, almond, salmon, colonel, bouquet, genre, niche, utensil variants, and your CEO’s surname. Add local place names near your office.",
        "For each, write one sentence you would actually say at work. Practice that sentence, not the isolated citation form only. Isolation builds awareness; sentences build transfer.",
        "Publish your team’s starter pack internally and refresh quarterly. The list becomes culture. New hires receive it on day one with links to Speakur pages, and embarrassment drops while professionalism rises.",
      ],
    },
  ],
  "science-of-syllables-and-stress": [
    {
      heading: "Stress in compound words and phrases",
      paragraphs: [
        "English compounds often stress the first element (“greenhouse” the building vs “green house” the house that is green). Phrasal verbs and numbers have their own patterns. Teaching a few high-frequency compound patterns prevents a class of errors that segments alone cannot fix.",
        "Have students build two-column lists: noun compounds they use at work, and adjective+noun phrases. Say both aloud. The contrast teaches more than a lecture on morphology.",
        "Product UI names that are compounds should be checked by a native listener before you freeze TTS. Stress errors on homepage hero words are unusually costly because they repeat thousands of times.",
      ],
    },
  ],
  "accessibility-audio-for-dyslexia-and-esl": [
    {
      heading: "Content writing choices that reduce load",
      paragraphs: [
        "Short paragraphs, descriptive headings, and familiar words help ESL and dyslexic readers alike. Avoid walls of italic IPA without spacing. Place the plain headword first, then phonetics, then audio controls, then definitions. Predictable order lowers anxiety.",
        "Provide examples in everyday contexts. A definition without an example sentence is harder to encode. Speakur’s template already emphasizes examples when dictionaries supply them—keep that priority as you customize content.",
        "When translating the UI chrome, do not forget button labels. “Play” should be clear in every locale. Accessibility is linguistic as well as technical.",
      ],
    },
  ],
  "on-demand-tts-and-click-gating": [
    {
      heading: "Red-team your own endpoints",
      paragraphs: [
        "Before launch, pretend you are an abuser. Call GET synthesize, POST from scripts, send 10k character payloads, replay the same word rapidly, and forge browser headers. Fix whatever works that should not. Add tests so regressions fail CI.",
        "Invite a colleague from security or FinOps to the review. Fresh eyes catch eager generation hidden in preview cards and Open Graph scrapers.",
        "Document the red-team results in your compliance folder next to Privacy and Terms screenshots. When a partner asks how you prevent waste and abuse, you will have receipts.",
      ],
    },
  ],
  "programmatic-seo-for-dictionary-sites": [
    {
      heading: "Signals of quality reviewers look for",
      paragraphs: [
        "Working About, Contact, Privacy, and Terms links in the footer. Original articles with depth. Clear authorship or organizational identity. Pages that render text without JavaScript. Sensible ads (if any) that do not hijack navigation. A domain that has begun to earn real search impressions. Supportive social proofs such as teacher testimonials help but cannot replace fundamentals.",
        "Thin spun paragraphs under every word will not save a doorway site. Invest in the template’s unique value—audio strategy, IPA clarity, teaching links—and in the editorial library that frames the tool.",
        "Speakur’s bet is that pronunciation utility plus honest education is enough substance to deserve traffic and partnerships. Keep shipping guides, keep tightening templates, and let indexing compound.",
      ],
    },
  ],
  "privacy-cookies-and-responsible-ad-tech": [
    {
      heading: "Talking to users about ads without cringe",
      paragraphs: [
        "If you show ads, say so on the About page in one clean sentence: free learning is supported by advertising, partners may use cookies, details live in the Privacy Policy. People handle honesty. They dislike surprise popovers that feel like malware.",
        "Offer a low-friction path to report bad ads. Act on reports. Your willingness to remove a category is part of trust.",
        "Remember that many Speakur users may be students on shared devices. Minimize cross-site tracking where you can, prefer contextual placements when possible, and never pretend education sites are exempt from privacy duty. They are exemplars—or they should be.",
      ],
    },
  ],
};
