import type { Guide } from "./types";

export const GUIDES_B: Guide[] = [
  {
    slug: "how-to-read-ipa-phonetic-symbols",
    title: "How to Read IPA Phonetic Symbols",
    description:
      "Learn the International Phonetic Alphabet basics so dictionary transcriptions stop looking like code and start sounding like speech.",
    publishedAt: "2026-03-12",
    readingMinutes: 10,
    sections: [
      {
        heading: "Why dictionaries use IPA",
        paragraphs: [
          "English spelling is famously unreliable as a guide to sound. The same letters produce different vowels in “tough,” “though,” and “through.” The International Phonetic Alphabet (IPA) solves this by assigning one symbol to one speech sound, independent of orthography. When Speakur shows a transcription beside a word, that string is a map of mouths and airflows—not a respelling invented for one textbook series.",
          "IPA is used by linguists, singers, actors, and language teachers worldwide. Once you learn a core set of English symbols, you can decode most learner dictionaries. You do not need the entire IPA chart on day one. Focus on the consonants that differ from English letters, the vowel trapezoid for your target accent, and the stress mark that tells you which syllable is strong.",
          "Different dictionaries may use slightly different conventions (slashes for phonemic vs brackets for phonetic detail, American vs British vowel sets). Prefer sources that label the accent. A transcription without an accent label is incomplete for English.",
        ],
      },
      {
        heading: "Consonants you already almost know",
        paragraphs: [
          "Many IPA consonants look like English letters and behave similarly: p, b, t, d, k, g, m, n, f, v, s, z, h, l, w. The unfamiliar ones are worth memorizing early. θ is the soft “th” in “think”; ð is the voiced “th” in “this.” ʃ is “sh,” ʒ is the middle sound of “measure,” tʃ is “ch,” and dʒ is “j” in “judge.” ŋ is the “ng” in “sing.” j is the “y” sound in “yes,” which surprises learners who expect j to mean the English letter J.",
          " aspirated vs unaspirated distinctions matter in some languages but are often left broad in English learner IPA. Likewise, American tap of t/d in “water” may appear as ɾ in narrower transcriptions. For pronunciation search users, broad phonemic IPA is usually enough to choose the right sound family before listening to audio.",
          "Practice by reading a word’s IPA aloud before pressing Play, then compare. That tight feedback loop trains your eye faster than passive listening alone.",
        ],
      },
      {
        heading: "Vowels, length, and the schwa",
        paragraphs: [
          "English vowels are the hard part. Symbols like iː and ɪ contrast the long vowel in “fleece” with the short vowel in “kit” (in accents that maintain that contrast). æ appears in “trap” for many US speakers. ɑː and ɒ distinctions show up differently across US and UK charts. Dipthongs such as aɪ (price), aʊ (mouth), and əʊ/oʊ (goat) glide between qualities.",
          "The most important symbol for English rhythm is ə, the schwa—the reduced vowel in unstressed syllables, as in the first sound of “about.” Learners who give every vowel full quality sound staccato. Native-like English depends on weakening unstressed syllables. When IPA shows ə, deliberately under-articulate.",
          "Length marks (ː) and stress marks (ˈ primary, ˌ secondary) change meaning and naturalness. Compare ˈrecord (noun) and rɪˈkɔːd/rɪˈkɔrd (verb). Audio still wins for nuance, but IPA tells you where to put energy before you hear the clip.",
        ],
      },
      {
        heading: "A simple study routine",
        paragraphs: [
          "Pick ten high-frequency words daily. Read the IPA, guess the stress, speak, then listen. Keep a notebook of symbol → example word pairs. After two weeks, most common English consonants will feel automatic and you can focus on vowels for your target accent.",
          "Use minimal pairs to isolate contrasts: ship/sheep, bat/bet, full/fool. Pair IPA study with Speakur’s slow playback when available. Avoid memorizing respelling systems that conflict with IPA if your long-term goal is dictionary literacy.",
          "IPA is a tool, not a performance. The goal is clearer listening and speaking, plus the ability to verify AI voices and human teachers against a shared notation. Once the symbols unlock, every dictionary page becomes more valuable—and that is exactly the kind of educational depth publisher reviewers look for beside utility tools.",
        ],
      },
    ],
  },
  {
    slug: "us-vs-uk-pronunciation-differences",
    title: "US vs UK Pronunciation Differences",
    description:
      "A practical map of rhoticity, vowel shifts, stress patterns, and vocabulary that change how English sounds across the Atlantic.",
    publishedAt: "2026-03-15",
    readingMinutes: 9,
    sections: [
      {
        heading: "Rhoticity and the letter R",
        paragraphs: [
          "One of the most audible splits between General American and many southern British accents is rhoticity: whether “r” is pronounced after vowels. In General American, “car,” “hard,” and “mother” usually keep an r-quality. In many UK accents, post-vocalic r is dropped or surfaces mainly when the next word begins with a vowel (linking r). Neither pattern is more correct; they are systems.",
          "Learners switching materials between US and UK dictionaries must recalibrate expectations. An IPA line that includes ɹ or ɚ may look “wrong” if you were trained on non-rhotic transcriptions. Speakur’s goal is to label accents clearly and, where free audio exists, let you hear both.",
          "Actors and customer-support teams should pick one primary accent for a market and stay consistent. Mixing rhotic and non-rhotic realizations inside a single brand voice without reason sounds unsettled.",
        ],
      },
      {
        heading: "Vowel inventories and famous splits",
        paragraphs: [
          "Lexical sets help compare accents without arguing about spelling. The bath vowel differs: many UK speakers use a longer vowel in “bath” and “path,” while most US speakers use the same vowel as in “cat.” The lot/cloth vowels, goat diphthongs, and the presence or absence of the cot–caught merger further separate regions inside each country—not only between them.",
          "Consonants differ too. UK “schedule” often begins with “sh,” US with “sk.” “Herb” typically drops h in US speech and keeps it in UK speech. “Tomato” and “vitamin” are cliché examples but still useful teaching moments because they show that shared spelling does not imply shared sound.",
          "Stress can move: “garage,” “ballet,” and some French loans differ. When localizing marketing audio, check stress on every borrowed word. A single misplaced stress can mark the speaker as out-group for attentive listeners.",
        ],
      },
      {
        heading: "Vocabulary and spelling side effects",
        paragraphs: [
          "Pronunciation differences travel with vocabulary differences (lorry/truck, queue/line) and spelling (colour/color). Voiceover scripts should be rewritten for the market, not only re-voiced. TTS engines follow the text they are given; US spelling may bias some models toward US pronunciations for ambiguous tokens.",
          "If you maintain a bilingual US/UK content set, store separate cached audio objects per accent rather than overwriting a single file. Your object key scheme should include voice or locale. That is how Speakur’s synthesize API is designed: slug plus voice identity.",
          "Editors should also watch for culturally loaded place names and demonyms. When unsure, look up the local preference and record it in the glossary.",
        ],
      },
      {
        heading: "Choosing for product and pedagogy",
        paragraphs: [
          "Language learners often ask which accent to learn. The honest answer is: the one you will practice with most and the one your target community uses. Intelligibility matters more than prestige. Exposure to both US and UK audio improves listening flexibility even if your speaking target stays singular.",
          "Product teams should default by market analytics: where do customers live, and which accent do competitors use without backlash? Run listening tests. Document the decision so contractors do not “improve” pronunciation inconsistently.",
          "US vs UK is only the beginning—English includes Indian, Nigerian, Australian, Irish, and many other standards. Start with clear US/UK labeling, then expand. Transparent accent metadata is part of trustworthy pronunciation UX and part of treating linguistic diversity with respect.",
        ],
      },
    ],
  },
  {
    slug: "why-pronunciation-matters-for-learners",
    title: "Why Pronunciation Matters for Language Learners",
    description:
      "Intelligibility, confidence, and listening skill: why sound practice deserves equal time with grammar and vocabulary.",
    publishedAt: "2026-03-18",
    readingMinutes: 9,
    sections: [
      {
        heading: "Intelligibility beats accent erasure",
        paragraphs: [
          "Modern pronunciation teaching emphasizes intelligibility: can listeners understand you with reasonable effort? The goal is not to erase identity or mimic a prestige accent perfectly. Learners who delay speaking until they sound “native” often stall. Learners who practice stress, rhythm, and high-functional sounds early unlock conversations that provide more input—the real engine of progress.",
          "Research in second-language acquisition repeatedly finds that comprehensibility correlates with features like correct nuclear stress and clear vowel contrasts that distinguish words, more than with every consonant matching a particular celebrity speaker. That is liberating. It means limited practice time should target functional contrasts and word stress on vocabulary you actually use.",
          "Tools like Speakur help because they shrink the friction between encountering a new word and hearing a reference. Instant feedback loops beat weekly classroom drills alone.",
        ],
      },
      {
        heading: "Listening and speaking are linked",
        paragraphs: [
          "If you cannot hear a contrast, you will struggle to produce it. Pronunciation practice is also ear training. Minimal pairs, slowed audio, and IPA reading build the perceptual categories your brain needs. Watching subtitled video helps vocabulary, but deliberate listening without text occasionally forces attention onto sound.",
          "Shadowing—speaking along with a model a fraction of a second behind—trains rhythm. Start with short phrases, not monologues. Record yourself weekly on the same paragraph to hear progress that daily practice hides.",
          "Teachers can assign “look up, listen, shadow, use in a sentence” cycles for weekly vocabulary lists. Because Speakur pages include definitions alongside audio entry points, the cycle stays on one screen.",
        ],
      },
      {
        heading: "Confidence, identity, and classroom culture",
        paragraphs: [
          "Fear of mispronunciation silences learners. Classrooms and products should normalize repair: ask for repetition, offer the IPA, play audio again. Mocking accents—whether human or AI—has no place in learning UX. Offer multiple accents as options, not as ranked hierarchies.",
          "Adult professionals often need accurate pronunciation of technical terms more than casual slang. Prioritize the lexicon of their job. A nurse, a engineer, and a marketer need different high-value word lists. Programmatic dictionaries become powerful when paired with editorial guides that teach strategy, not only entries.",
          "Pronunciation also affects reading aloud and presenting. Many learners can decode silently but stumble orally. Brief daily read-aloud sessions with lookup-on-demand for uncertain words close that gap.",
        ],
      },
      {
        heading: "A weekly practice template",
        paragraphs: [
          "Three days a week: ten new words—IPA, listen, slow listen, record. Two days a week: shadow a one-minute clip from a podcast in your target accent. One day a week: converse or record a voice note using those words. Review errors without judgment; add stubborn items back to the queue.",
          "Measure what matters: Were you understood in a real conversation? Did a presentation feel smoother? Vanity metrics like “perfect vowel match” matter less than communicative success.",
          "Pronunciation is not a finishing coat of paint on a finished grammar house. It is structural. Build it early, lightly, and often—and keep a fast reference tool nearby so curiosity never waits for the next class.",
        ],
      },
    ],
  },
  {
    slug: "building-a-pronunciation-practice-routine",
    title: "Building a Pronunciation Practice Routine",
    description:
      "A realistic daily and weekly system for busy adults who want clearer speech without living in a phonetics textbook.",
    publishedAt: "2026-03-22",
    readingMinutes: 8,
    sections: [
      {
        heading: "Design for consistency, not hero days",
        paragraphs: [
          "The best pronunciation routine is the one you repeat. Ten focused minutes daily outperform a monthly two-hour cram. Anchor practice to an existing habit: after morning coffee, after checking email, or on your commute if you can speak aloud privately with headphones.",
          "Keep materials to a minimum: a word list, a pronunciation search tool, a voice recorder (your phone is enough), and one model podcast or YouTube channel in your target accent. Too many apps create decision fatigue.",
          "Write your routine on a card. If it requires willpower to assemble tools each day, friction will win. Speakur’s search-first design aims to keep lookup under five seconds so practice stays about speaking, not navigating.",
        ],
      },
      {
        heading: "The micro-session structure",
        paragraphs: [
          "Minute 0–2: warm up with easy humming or a tongue twister you already know. Minute 2–6: three to five target words—read IPA, play audio, imitate, record once. Minute 6–10: drop those words into two original sentences and say them at conversation speed. Stop on time even if it feels incomplete; completion builds the habit loop.",
          "Twice a week, replace the word block with shadowing. Once a week, do a “stress clinic”: take a paragraph, mark stressed syllables, then speak it. Once a month, ask a teacher, language partner, or colleague for feedback on a recorded minute.",
          "Track streaks lightly. Missed days happen. Never “punish” with double sessions that burn you out; just resume.",
        ],
      },
      {
        heading: "Choosing targets with leverage",
        paragraphs: [
          "Prioritize: (1) sounds that change word meaning in your L1–L2 pair, (2) stress on vocabulary from your job, (3) endings that affect grammar (past -ed, plural -s). Deprioritize rare consonants you almost never need.",
          "Build a personal “danger list” of words you avoid saying. Those are high-value. Look them up, cache the sound in memory through repetition, and deliberately use them the same day in chat or email voice notes.",
          "If AI studio voices are available on click, use them as additional models—but also listen to human dictionary audio when present. Variety prevents overfitting to one synthetic timbre.",
        ],
      },
      {
        heading: "Environment and accountability",
        paragraphs: [
          "Privacy matters. If you cannot speak at work, whisper practice, use a car, or schedule home sessions. Visual IPA study still helps on silent days, but produce sound at least four days weekly.",
          "Accountability can be social (a weekly language exchange) or solo (a folder of dated recordings). Reviewing month-old audio is motivating because progress is easier to hear in contrasts than in daily self-judgment.",
          "Routines fail when goals are vague (“sound better”). Make them concrete (“clear stress on all product names in my demo”). Pronunciation is a skill of many small reps. Build the reps into life, and the accent clarity follows.",
        ],
      },
    ],
  },
  {
    slug: "speech-to-text-vs-text-to-speech",
    title: "Speech-to-Text vs Text-to-Speech Explained",
    description:
      "How STT and TTS differ, how they chain into localization pipelines, and where pronunciation tools fit.",
    publishedAt: "2026-03-25",
    readingMinutes: 9,
    sections: [
      {
        heading: "Two directions of the same bridge",
        paragraphs: [
          "Speech-to-text (STT) converts audio into written language. Text-to-speech (TTS) converts written language into audio. Together they form a bridge between modalities that powers captions, voice assistants, dubbing prep, and accessibility features. Confusing them leads to bad architecture diagrams and worse budgets.",
          "STT errors look like wrong words in a transcript. TTS errors look like wrong sounds, flat prosody, or misread numbers. Quality metrics differ: word error rate for STT, mean opinion score or side-by-side listening tests for TTS. A stack can be excellent at one and mediocre at the other.",
          "Pronunciation databases sit beside both. STT may mis-hear rare names; providing custom vocab helps. TTS may mis-speak those names; providing IPA hints or cached approved audio helps more.",
        ],
      },
      {
        heading: "Where each shines in product flows",
        paragraphs: [
          "Use STT to index podcasts, generate draft captions, power voice search, and feed translation. Use TTS to read articles aloud, voice training modules, and generate provisional dubs. For Speakur-like products, TTS (or licensed recordings) answers “how does this word sound?” while STT is optional for features like “grade my pronunciation.”",
          "Chaining STT → translate → TTS is the classic AI dubbing pipeline. Each hop can inject error. Human post-edit after translation remains the highest leverage QA step before paying for premium voice takes.",
          "Latency budgets differ. Live captions need streaming STT. Pronunciation playback can tolerate a short generation delay after a click, especially with caching on repeat visits.",
        ],
      },
      {
        heading: "Cost patterns and abuse risks",
        paragraphs: [
          "STT is often billed per audio minute; TTS per character. Bot traffic can attack either endpoint. Protect paid inference behind authentication, rate limits, and—for TTS—user gestures rather than automatic page-load synthesis. Speakur’s POST-only synthesize route is an example of aligning billing with intent.",
          "Privacy matters for STT: uploaded audio may contain sensitive conversations. Publish clear retention policies. For TTS, avoid cloning voices without consent. Editorial sites that explain these choices build trust with users and reviewers alike.",
          "Open-source and commercial options exist on both sides. Start with managed APIs to validate product value, then optimize cost on the hot paths you measure—not the ones you imagine.",
        ],
      },
      {
        heading: "Choosing vendors without regret",
        paragraphs: [
          "Run a bakeoff on your content domain: accents you need, proper nouns you own, and noise conditions you see. Store test sets. Re-run when vendors update models. Do not chase leaderboard demos that used different data.",
          "Abstract your code behind thin interfaces so you can swap STT or TTS providers. Keep audio and transcripts in durable storage with stable IDs. Your glossary of pronunciations should be provider-agnostic.",
          "STT and TTS are infrastructure. The product magic is the workflow around them—editing, caching, teaching, and trust. That is where Speakur focuses editorial energy while still offering fast pronunciation utility.",
        ],
      },
    ],
  },
  {
    slug: "caching-audio-for-cost-efficient-tts",
    title: "Caching Audio for Cost-Efficient TTS",
    description:
      "The three-tier model: serve from object storage when possible, synthesize only on real clicks, and never let crawlers mint MP3s.",
    publishedAt: "2026-03-28",
    readingMinutes: 10,
    sections: [
      {
        heading: "Why naive TTS pricing hurts",
        paragraphs: [
          "Text-to-speech billed per character looks cheap until you multiply by automatic page views, preview bots, and retry logic. A programmatic pronunciation site with tens of thousands of URLs can attract crawlers that would happily “listen” to every entry if audio were embedded as auto-generated files at request time. That pattern turns SEO success into a cost center.",
          "The fix is architectural, not merely negotiating a better vendor rate. Separate text delivery from audio delivery. Render definitions and IPA in static or ISR HTML so Google sees substance. Keep audio behind an explicit user action, then store the bytes forever in object storage with a public URL.",
          "Cloudflare R2 is popular for this because egress to the internet is priced differently from classic cloud object stores. Whatever vendor you choose, the invariant is permanent caching keyed by content identity.",
        ],
      },
      {
        heading: "The three-tier decision tree",
        paragraphs: [
          "Tier one: if the MP3 exists, return its URL. Cost approaches zero. Tier two: if the requester did not perform a deliberate client-side action (for Speakur, a POST from a Play click), do nothing paid—serve text only. Tier three: on a real click with a cache miss, call a low-cost TTS model, write the object, return the URL, and never pay for that utterance again unless the script or voice changes.",
          "Implementing tier two correctly means no generation in getServerSideProps-style render paths, no generation in ISR callbacks, and no generation in GET API routes that bots can hammer. Speakur’s synthesize endpoint answers GET with method-not-allowed for that reason.",
          "Version your keys. If you change voice or model, use a new key suffix rather than silently orphaning old objects. If you correct a pronunciation, bump a version so clients are not stuck with immutable wrong audio.",
        ],
      },
      {
        heading: "Operational details that save money",
        paragraphs: [
          "Normalize text before hashing or slugifying so “Hello” and “hello” share cache entries when appropriate. Cap input length on pronunciation endpoints. Rate-limit by IP and by session. Log cache hit ratio; celebrate high ratios as a product health metric.",
          "Prefer free licensed dictionary audio when it already exists—those clips are tier zero, even cheaper than your own cache. Fall back to studio TTS only when needed. Browser speech synthesis can be a last-resort offline fallback without touching your invoice, though quality varies by device.",
          "Do not pre-generate thousands of speculative MP3s before you have traffic. Let demand discover the head of the Zipf distribution, then optionally batch-generate the top N after you see Search Console queries.",
        ],
      },
      {
        heading: "How this supports compliance narratives",
        paragraphs: [
          "Publisher and ads reviews often ask whether a site is a thin doorway of auto-generated pages. Pairing programmatic entries with long-form guides, trust pages, and a clear technical story—“we do not burn APIs on crawlers; we invest in text”—shows thoughtful engineering and user focus.",
          "Caching also improves UX: second plays are instant, and global CDN delivery beats repeated origin synthesis. Users feel quality; finance feels calm.",
          "Cost-efficient TTS is not about starving the model vendors. It is about aligning spend with human value. Build that alignment early and your pronunciation corpus becomes an asset instead of a liability.",
        ],
      },
    ],
  },
];
