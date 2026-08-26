import type { GuideSection } from "./types";

export type GuideRewrite = {
  synopsis: string[];
  sections: GuideSection[];
  tldr: string[];
};

/**
 * Unique synopsis / deep sections / TL;DR per guide.
 * Replaces the old shared "week of practice" expansion template.
 */
export const GUIDE_REWRITES: Record<string, GuideRewrite> = {
  "how-ai-speech-synthesis-works": {
    synopsis: [
      "Neural text-to-speech turns characters into waveforms through normalization, linguistic analysis, acoustic modeling, and a vocoder. For a pronunciation product, the hard problem is not demos—it is keeping audio quality high while never billing crawlers for speech.",
      "This guide explains the pipeline in plain language, then shows how [Speakur’s search](/) separates readable IPA from click-gated synthesis so pages stay cheap, crawlable, and useful.",
    ],
    sections: [
      {
        heading: "What actually happens between “Play” and sound",
        paragraphs: [
          "Before a model “speaks,” text is normalized: “Dr.” becomes “doctor,” numerals expand into words, and punctuation becomes pause hints. A front-end then estimates phonemes and stress. Only after that does an acoustic model predict a compact speech representation—often related to a mel spectrogram—while a vocoder expands it into MP3 or WAV bytes.",
          "Single-word lookups are kinder to models than long scripts because there is little discourse context to misread. That is why Speakur optimizes for dictionary-scale utterances rather than full narrations. If a free dictionary clip already exists for a word like [croissant](/food/croissant/), prefer that clip; reserve synthesis for gaps.",
          "Prosody is still the weak link. Listen for primary stress, cluster clarity, and vowel stability across accents. Pair any generated file with visible IPA from the [IPA reading guide](/guides/how-to-read-ipa-phonetic-symbols) so learners can catch mismatches instead of trusting timbre alone.",
        ],
      },
      {
        heading: "Product invariants that outlast model fashion",
        paragraphs: [
          "Publish definitions and phonetics in HTML. Generate paid audio only after a real click. Cache the file forever under a stable key. Those three rules matter more than which vendor leads this quarter’s leaderboard.",
          "Keep a fixed evaluation set of brutal words—names, numbers, medical terms like [appendectomy](/medical/appendectomy/)—in version control. When you change voices, re-listen to the set before flipping production. Quality is a regression suite, not a marketing waveform.",
          "If you need the architecture pattern in more detail, read [on-demand TTS and click-gating](/guides/on-demand-tts-and-click-gating) and [caching audio for cost-efficient TTS](/guides/caching-audio-for-cost-efficient-tts).",
        ],
      },
    ],
    tldr: [
      "TTS is normalize → phonemes → acoustics → vocoder. Speakur keeps text public and audio intentional: click, generate once, cache forever. Evaluate on a fixed hard-word list, not demos.",
    ],
  },

  "linguistic-accents-in-global-marketing": {
    synopsis: [
      "Accent choice is a brand signal as fast as logo color. Customers infer origin, class, and belonging before they finish the first sentence of your ad.",
      "Use this guide to pick US, UK, or local voices on purpose, document the decision, and keep every vendor on the same cached pronunciation for product names.",
    ],
    sections: [
      {
        heading: "Segment assets, do not remix accents at random",
        paragraphs: [
          "A common failure: global product video in General American, TikTok ads in a UK TTS voice, and a sales deck with a third invented reading of the same product name. Memory fragments. Segment by asset type instead—global demo in one locked voice, local testimonials left authentic, IVR matching the phone number’s market.",
          "Build an accent decision record: market, chosen accent, rejected options, evidence, legal notes, and owner. Link each protected term to IPA and a canonical MP3. Without that record, freelancers reinvent pronunciation weekly.",
          "Pressure-test invented names with native listeners before mass synthesis. A sleek packaging spelling can be awkward on radio. Teach awkward names early with pages in the [word directories](/words/) and cached audio in creator kits.",
        ],
      },
      {
        heading: "Avoid caricature while staying local",
        paragraphs: [
          "Exaggerated dialect performances read as stereotype. Prefer contemporary natural speech from the target market and validate with residents—not only bilingual HQ staff. For AI voices, run a small listening test before locking a voice id.",
          "Compare reference reads using [US vs UK pronunciation differences](/guides/us-vs-uk-pronunciation-differences). Words like [schedule](/everyday/schedule/) advertise your accent choice immediately.",
          "Disclose synthetic speech where required, and never clone employees or celebrities without consent. Accent strategy intersects hiring and law as much as creative.",
        ],
      },
    ],
    tldr: [
      "Pick accents per market and asset type, write the decision down, and ship one canonical audio file per protected term. Local authenticity beats costume dialect.",
    ],
  },

  "guide-to-audio-localization": {
    synopsis: [
      "Audio localization is not “translate then TTS.” Picture lock, glossary, review authority, and versioned object keys decide whether a launch sounds intentional or patched.",
      "This walkthrough covers a lean kickoff checklist, tooling for small teams, and how Speakur pages become the pronunciation source of truth during dubbing.",
    ],
    sections: [
      {
        heading: "Freeze the source before any model runs",
        paragraphs: [
          "Lock the picture edit, export a clean dialogue stem, and approve an English transcript with speaker labels. Build a glossary of product terms with IPA plus reference audio from [Speakur search](/). Decide subtitle-only versus dub markets with traffic data, not gut feel alone.",
          "Assign reviewers in each locale who can block a release. Soft opinions after launch are not QA. Every script change must bump a version id that flows into the audio object key so editors never confuse draft machine audio with approved cache.",
          "After launch, harvest comments that mention “voice,” “accent,” or “hard to understand.” Those notes are localization telemetry—feed them back into the glossary and into lookups for confused terms.",
        ],
      },
      {
        heading: "A lean stack that does not fight itself",
        paragraphs: [
          "Example small-team stack: masters in object storage, a spreadsheet glossary linked to Speakur pages, draft STT, human-edited translation, one synthesis path per language, and durable finals. Add TMS software only when coordination pain is real.",
          "Avoid five overlapping AI tools that each regenerate audio differently. Hero videos can still use boutique talent; long-tail help center clips should share one voice pipeline. Document the stack beside the glossary so localization survives staff turnover.",
          "For deeper accent strategy see [linguistic accents in global marketing](/guides/linguistic-accents-in-global-marketing); for caption trade-offs see [subtitles, captions, and dubbing](/guides/subtitles-captions-and-dubbing-compared).",
        ],
      },
    ],
    tldr: [
      "Lock source media, glossary, and blockers first. One synthesis path per language, versioned keys, and Speakur-linked reference audio keep localization repeatable.",
    ],
  },

  "how-to-read-ipa-phonetic-symbols": {
    synopsis: [
      "IPA is a map of speech sounds, not a rival alphabet. Fluency comes from anchoring symbols to audio and recognizing stress patterns, not from memorizing the entire pulmonic chart on day one.",
      "Learn a high-leverage symbol set, practice with Speakur pages, and treat audio as the territory when dictionaries disagree.",
    ],
    sections: [
      {
        heading: "A practical on-ramp instead of chart overwhelm",
        paragraphs: [
          "Start with a dozen symbols that unlock English trouble spots: schwa /ə/, the two “th” sounds, /ʃ/ vs /tʃ/, and primary stress marks. Add vowels only after consonants feel stable. Teachers who dump the full chart create drop-off; confidence compounds faster than coverage.",
          "Alternate careful decoding with timed glances. First, read IPA slowly while playing audio for [worcestershire](/food/worcestershire/) or [qatar](/places/qatar/). Later, speak before pressing Play, then check. That second mode builds classroom-speed automaticity.",
          "Build a personal deck: IPA on one side, two words from your own job or hobby on the other. Textbook classics alone do not stick.",
        ],
      },
      {
        heading: "When sources conflict",
        paragraphs: [
          "Broad transcriptions omit predictable detail. US and UK charts also differ on vowel symbols—keep one accent chart on your desk. If two trusted dictionaries still disagree on a brand name, pick one for your glossary, document it, and keep the cached audio as arbiter.",
          "Cross-check accent labels using [US vs UK differences](/guides/us-vs-uk-pronunciation-differences) and browse more examples in [commonly mispronounced words](/guides/commonly-mispronounced-english-words).",
          "Ignore stress marks at your peril. Circle /ˈ/ in red if you must; misplaced stress makes fluent vowels still sound “wrong” to listeners.",
        ],
      },
    ],
    tldr: [
      "Learn a small IPA set, always pair symbols with audio, and prioritize stress. When charts disagree, document a choice and trust the canonical clip.",
    ],
  },

  "us-vs-uk-pronunciation-differences": {
    synopsis: [
      "“US” and “UK” are umbrella labels, but the high-frequency differences—rhoticity, bath vowels, t-flapping, and stress shifts—explain most learner surprises.",
      "Train your ear with deliberate contrast, then decide which accent your classroom or brand will treat as primary.",
    ],
    sections: [
      {
        heading: "High-yield contrasts to practice on purpose",
        paragraphs: [
          "Rhoticity: General American usually pronounces post-vocalic /r/; many southern British accents do not. Bath vowels: “dance,” “class,” and “path” often diverge. T-flapping makes US “butter” sound like “budder” to UK ears. Stress shifts appear in words like “advertise” derivatives and some Romance borrowings.",
          "Take a short paragraph and listen once in a US news voice and once in a UK news voice. Note only three differences, then shadow each version. Narrow focus beats overwhelm. Rotate features weekly so coverage accumulates.",
          "Use Speakur’s US/UK play buttons on words like [schedule](/everyday/schedule/) and browse the [food directory](/food/) for more accent pairs. Read IPA with the [IPA guide](/guides/how-to-read-ipa-phonetic-symbols).",
        ],
      },
      {
        heading: "Teaching and branding without mockery",
        paragraphs: [
          "Neither accent is more correct. Choose a target for production, then schedule occasional listening in the non-target accent for comprehension flexibility. Marketers selling into both markets need calibrated ears before approving vendors.",
          "Remember internal diversity: Scottish, Southern US, Multicultural London English, and many other varieties deserve respect. Broad labels are training wheels, not the whole map.",
          "For campaign decisions that hinge on accent, continue with [accents in global marketing](/guides/linguistic-accents-in-global-marketing).",
        ],
      },
    ],
    tldr: [
      "Master a few high-yield US/UK contrasts with deliberate shadowing. Pick a production target, stay respectful of variety, and verify with labeled audio plus IPA.",
    ],
  },

  "why-pronunciation-matters-for-learners": {
    synopsis: [
      "Pronunciation is not vanity—it controls whether listeners ask you to repeat yourself, whether interviews feel fair, and whether learners keep speaking after mistakes.",
      "Tie practice to real upcoming events, reduce shame with private replay, and use Speakur as a companion to authentic content rather than a separate chore.",
    ],
    sections: [
      {
        heading: "Map drills to outcomes people care about",
        paragraphs: [
          "Ask for one upcoming speaking event: a viva, customer call, wedding toast, or stand-up. Pull vocabulary from that event and make those words the week’s targets. Abstract minimal-pair lists die of fatigue; event-linked lists survive.",
          "If a learner loves cooking videos, practice culinary terms like [charcuterie](/food/charcuterie/). If they live in tech meetings, practice product names from the [tech directory](/tech/). [Speakur search](/) then supports authentic input instead of replacing it.",
          "Institutions evaluating tools should ask whether willingness to speak rises. Private replay, slow audio, and clear IPA often outperform gamified points.",
        ],
      },
      {
        heading: "Intelligibility over accent erasure",
        paragraphs: [
          "The ethical goal is being understood and feeling confident—not erasing identity. Teach priority features that block intelligibility (stress, certain consonants) before polishing prestige vowels.",
          "Parents and teachers can track progress with dated recordings of the same paragraph monthly. Growth hides in comparison, not in how “native” someone sounds on a bad day.",
          "Pair this mindset with a sustainable plan in [building a pronunciation practice routine](/guides/building-a-pronunciation-practice-routine).",
        ],
      },
    ],
    tldr: [
      "Pronunciation work sticks when it serves a real speaking event, protects dignity, and targets intelligibility first. Tools should make speaking safer, not flashier.",
    ],
  },

  "building-a-pronunciation-practice-routine": {
    synopsis: [
      "Routines fail from friction and perfectionism, not from lack of apps. A durable practice is short, specific, and revisable monthly.",
      "Use this guide to design a five-to-twelve-minute loop around a living danger list, with Speakur lookups only where audio confirmation is needed.",
    ],
    sections: [
      {
        heading: "Design for the day you are tired",
        paragraphs: [
          "Cap sessions at five minutes on low-energy days: three danger-list words, IPA glance, one slow play, one normal play, one recorded attempt. On stronger days, expand to twelve minutes with a short shadowing paragraph.",
          "One tool stack beats five. Keep Speakur open for lookups, a notes file for the danger list, and your phone’s voice memos. Complexity is how streaks die.",
          "If privacy blocks speaking aloud, schedule silent IPA days interleaved with speaking days rather than quitting. Consistency of attention beats purity of modality.",
        ],
      },
      {
        heading: "Keep a living danger list",
        paragraphs: [
          "Words that terrified you in March may be automatic in May—replace them. Pull new items from meetings, [commonly mispronounced words](/guides/commonly-mispronounced-english-words), or category hubs like [medical](/medical/) and [names](/names/).",
          "Force a dated archive of recordings. Deleting clips you dislike erases evidence of growth. Teachers can require portfolio clips for the same reason.",
          "When motivation dips, reread [why pronunciation matters](/guides/why-pronunciation-matters-for-learners) and shrink the session instead of abandoning the habit.",
        ],
      },
    ],
    tldr: [
      "Short sessions, one tool stack, a monthly-updated danger list, and saved recordings beat ambitious plans that collapse by Wednesday.",
    ],
  },

  "speech-to-text-vs-text-to-speech": {
    synopsis: [
      "STT and TTS are inverse problems with different failure modes, cost curves, and privacy footprints. Shipping both without service boundaries creates vendor lock-in and unreadable invoices.",
      "Separate modules, persist artifacts, and measure cost per successful user action—not per internal retry.",
    ],
    sections: [
      {
        heading: "Boundaries that make vendors swappable",
        paragraphs: [
          "Create small modules: audio-in/text-out for STT, text-in/audio-URL-out for TTS. Upstream features should never hold raw vendor payloads as their only truth. Persist transcripts and audio with stable ids.",
          "STT errors look like wrong words; TTS errors look like wrong stress or voice. Do not debug them with the same dashboard. Track STT duration and language mix; track TTS cache hit ratio as a first-class metric.",
          "Pronunciation sites mostly need TTS. STT appears in practice tools (“did I say it?”) and in localization draft pipelines—see [audio localization](/guides/guide-to-audio-localization).",
        ],
      },
      {
        heading: "Privacy and bot economics",
        paragraphs: [
          "STT may upload user voice. That demands consent, retention limits, and clear UI. TTS can leak if you synthesize private text into public buckets—scope cache keys carefully.",
          "Bots love HTML; they should not love your STT endpoint. Rate-limit uploads. For TTS, keep generation behind a click as in [on-demand TTS](/guides/on-demand-tts-and-click-gating).",
          "If you only need word audio, prefer free dictionary clips from [word pages](/words/) before either paid API.",
        ],
      },
    ],
    tldr: [
      "Wrap STT and TTS behind clean interfaces, persist outputs, and meter real user success. Pronunciation products should default to cached TTS—not always-on speech APIs.",
    ],
  },

  "caching-audio-for-cost-efficient-tts": {
    synopsis: [
      "Permanent audio caching is the difference between a pronunciation site that scales and one that dies after a traffic spike. The cache key is a product decision.",
      "Learn how to design keys, measure hit ratio, and isolate crawlers from generation paths.",
    ],
    sections: [
      {
        heading: "Keys, immutability, and voice changes",
        paragraphs: [
          "A good key includes normalized text, voice id, model version, and speaking-rate settings. Change any of those → new object, not a silent overwrite. Immutability lets you roll back a bad voice by flipping pointers instead of regenerating the world.",
          "Store finals in zero-egress object storage when possible. Return permanent public URLs after the first successful generation. Monitor cache hit ratio next to latency—hits are profit.",
          "Warm popular entries intentionally: words from [food](/food/), [places](/places/), and homepage chips deserve pre-generation after human approval, not after a surprise frontpage.",
        ],
      },
      {
        heading: "What never belongs in the hot path",
        paragraphs: [
          "HTML GET requests must not synthesize. Neither should prefetch bots. Generation belongs on authenticated or clearly intentional POST/click flows described in [click-gating](/guides/on-demand-tts-and-click-gating).",
          "When a voice vendor improves, migrate gradually: dual-write new keys for top traffic, compare with your evaluation set from [how AI speech synthesis works](/guides/how-ai-speech-synthesis-works), then switch.",
          "Cost reviews should show dollars per successful play and hit ratio, not vanity “minutes generated.”",
        ],
      },
    ],
    tldr: [
      "Immutable, versioned cache keys plus click-only generation keep TTS affordable. Measure hit ratio like revenue.",
    ],
  },

  "choosing-voices-for-brand-consistency": {
    synopsis: [
      "A brand voice is a casting decision with technical follow-through. Timbre, accent, pacing, and stability across devices matter as much as “pleasant.”",
      "Lock a short voice bible, sample against hard words, and cache approved reads so every channel matches.",
    ],
    sections: [
      {
        heading: "Cast with constraints, then listen on hard words",
        paragraphs: [
          "Define constraints before browsing voice libraries: accent market, gender presentation policy, warmth vs authority, maximum pace, and whether multilingual coverage is required. Constraints prevent endless demo shopping.",
          "Run candidates through the same brutal word list—names, numbers, medical terms like [appendectomy](/medical/appendectomy/), food words like [worcestershire](/food/worcestershire/). Pretty vowels on easy sentences hide failures.",
          "Document the winner in a one-page voice bible linked from your accent record ([marketing accents](/guides/linguistic-accents-in-global-marketing)).",
        ],
      },
      {
        heading: "Consistency across humans and machines",
        paragraphs: [
          "Human narrators and TTS will never match perfectly. Decide which assets must be human, which may be synthetic, and how you disclose. Keep product-name audio identical everywhere via cached files.",
          "Re-audition yearly or when the vendor changes models. Voices drift. Treat drift like a brand font change—intentional or forbidden.",
          "Support the [Speakur project](/donate.html) if free reference audio helps your team stay consistent without licensing friction.",
        ],
      },
    ],
    tldr: [
      "Choose voices against constraints and hard words, write a voice bible, and cache product-name audio so channels stop inventing new readings.",
    ],
  },

  "subtitles-captions-and-dubbing-compared": {
    synopsis: [
      "Subtitles, captions, and dubs solve different access and market problems. Mixing them casually creates mismatched spelling, timing, and pronunciation expectations.",
      "Pick the right layer per locale, then keep spoken names aligned with on-screen text using a shared glossary.",
    ],
    sections: [
      {
        heading: "Know which problem you are solving",
        paragraphs: [
          "Subtitles usually translate dialogue for viewers who hear the original. Captions include sound cues for Deaf and hard-of-hearing audiences. Dubs replace the voice track. Soft-subs are flexible; burned-in text is not.",
          "Muted social playback makes captions non-optional for marketing. Accessibility law may require captions even when your team “feels” audio is enough.",
          "When names appear on screen, match the accent’s spelling conventions where relevant and verify pronunciation via [Speakur](/) so dubbers and captioners share one reading.",
        ],
      },
      {
        heading: "Dubbing without pronunciation drift",
        paragraphs: [
          "Dubbing multiplies accent decisions. Lock product-name audio before talent records. Feed glossary links—e.g. [porsche](/brands/porsche/)—into the briefing packet.",
          "Compare cost and reach: subtitle-only markets can ship faster; dub markets need lip-sync budget and stronger review. Use traffic and revenue, not prestige, to choose.",
          "Localization process detail lives in [audio localization](/guides/guide-to-audio-localization); accessibility angles continue in [accessible audio](/guides/accessibility-audio-for-dyslexia-and-esl).",
        ],
      },
    ],
    tldr: [
      "Captions for access, subtitles for translation, dubs for full voice replacement—choose explicitly, and keep names consistent with a shared pronunciation glossary.",
    ],
  },

  "teaching-pronunciation-in-the-classroom": {
    synopsis: [
      "Classroom pronunciation succeeds when goals are audible, feedback is kind, and practice fits the timetable—not when every phoneme is covered equally.",
      "Use high-leverage targets, peer protocols, and Speakur lookups as homework anchors instead of surprise pop quizzes on obscure symbols.",
    ],
    sections: [
      {
        heading: "Plan weeks around intelligibility bottlenecks",
        paragraphs: [
          "Survey the class: which sounds or stress patterns trigger misunderstanding? Prioritize those. A week on word stress may outperform a month of random minimal pairs.",
          "Model, notice, practice, perform. Keep teacher talk short. Students need mouth time. Use choral repetition before cold calling so anxiety drops.",
          "Assign three personal words weekly from authentic materials—labs, kitchens, sports—and have learners confirm them on Speakur pages such as [dachshund](/animals/dachshund/) or [entrepreneur](/business/entrepreneur/).",
        ],
      },
      {
        heading: "Feedback that does not shut mouths",
        paragraphs: [
          "Correct selectively. Recast, then let the student retry once. Public pile-ons destroy willingness to speak—the outcome you actually need.",
          "Portfolios beat one-off tests: the same thirty-second prompt recorded at week 1 and week 8. Pair with the [practice routine](/guides/building-a-pronunciation-practice-routine) guide for homework structure.",
          "For symbol literacy, teach IPA gradually with the [IPA guide](/guides/how-to-read-ipa-phonetic-symbols) rather than as a gatekeeping exam.",
        ],
      },
    ],
    tldr: [
      "Prioritize intelligibility bottlenecks, protect student willingness to speak, and use short recurring recordings plus Speakur homework words.",
    ],
  },

  "commonly-mispronounced-english-words": {
    synopsis: [
      "Mispronunciations cluster: silent letters, borrowed stress, reading pronunciations, and US/UK splits. Learning the clusters is faster than memorizing isolated shame words.",
      "Build a personal list from your domain, verify with audio, and keep the canonical clip handy.",
    ],
    sections: [
      {
        heading: "Clusters worth teaching as patterns",
        paragraphs: [
          "Silent-letter classics: [worcestershire](/food/worcestershire/), island, debt. Borrowed stress: many French and Latinate items shift stress in English. Reading pronunciations invent sounds from spelling—epitome is a frequent victim.",
          "US/UK splits deserve labeled practice: [schedule](/everyday/schedule/), vitamin, tomato. Brand and place names—[porsche](/brands/porsche/), [qatar](/places/qatar/)—need glossary treatment because “logic” fails.",
          "Browse [food](/food/), [names](/names/), and [places](/places/) directories for high-traffic traps, then save your own top twenty.",
        ],
      },
      {
        heading: "Replace shame with a lookup reflex",
        paragraphs: [
          "The social cost of guessing wrong can be high in meetings. Normalize “let me confirm the audio” the way people confirm spelling. Speakur exists for that reflex.",
          "Teachers can run a weekly “three traps” warm-up without mocking accents. Focus on stress and segments that block understanding.",
          "Deeper symbol decoding: [how to read IPA](/guides/how-to-read-ipa-phonetic-symbols). Accent framing: [US vs UK](/guides/us-vs-uk-pronunciation-differences).",
        ],
      },
    ],
    tldr: [
      "Treat mispronunciations as patterns, keep a personal verified list, and make audio lookup a professional habit instead of a last resort.",
    ],
  },

  "science-of-syllables-and-stress": {
    synopsis: [
      "English listeners hang meaning on stress as much as on segmental sounds. Syllable counts help timing; stress mistakes make fluent vowels still sound foreign.",
      "Learn how syllables are counted, why schwa dominates unstressed vowels, and how to practice stress with Speakur’s syllable cues.",
    ],
    sections: [
      {
        heading: "Counting syllables without getting philosophical",
        paragraphs: [
          "A practical classroom definition: a syllable is a beat with a vowel nucleus. Clapping or chin-drop methods work for many words; clusters and syllabic consonants create edge cases teachers should preview.",
          "Speakur pages surface syllable estimates beside IPA so learners can plan timing before pressing Play. Compare a short word against a long medical term like [appendectomy](/medical/appendectomy/) to feel the beat difference.",
          "Dictionaries sometimes disagree on counts for words with optional syllables (family → fam-ly). Document the variant you teach.",
        ],
      },
      {
        heading: "Stress is the English volume knob",
        paragraphs: [
          "Primary stress lengthens and clarifies a vowel; unstressed syllables often collapse toward schwa. Teaching only “clear vowels everywhere” fights the language.",
          "Practice with noun/verb pairs (record/record) and compound stress. Have learners mark stress before listening, then check against audio and the [IPA guide](/guides/how-to-read-ipa-phonetic-symbols).",
          "For routine building that includes stress drills, see [practice routines](/guides/building-a-pronunciation-practice-routine).",
        ],
      },
    ],
    tldr: [
      "Use syllable beats for timing and treat stress as core intelligibility. Expect schwa in weak syllables, and verify counts on real Speakur entries.",
    ],
  },

  "accessibility-audio-for-dyslexia-and-esl": {
    synopsis: [
      "Accessible pronunciation design helps dyslexic readers, ESL learners, and anyone listening under cognitive load. Clear text, predictable audio, and low-shame controls matter more than novelty voices.",
      "Build pages that work without autoplay, with readable IPA, and with slow playback options.",
    ],
    sections: [
      {
        heading: "Design defaults that reduce load",
        paragraphs: [
          "Never autoplay. Unexpected speech startles users and breaks screen-reader flows. Click-to-play is an accessibility feature as well as a cost feature—see [click-gating](/guides/on-demand-tts-and-click-gating).",
          "Keep definitions in HTML, not only inside canvases or images. Large type, strong contrast, and short paragraphs help dyslexic readers. IPA should be copyable text.",
          "Offer slow playback and repeat without penalty. Learners practicing [everyday](/everyday/) vocabulary need private repetition more than public streaks.",
        ],
      },
      {
        heading: "ESL and dyslexia overlaps",
        paragraphs: [
          "Both groups benefit from multimodal reinforcement: see the word, see IPA, hear audio, speak once. Avoid timed public read-alouds that punish processing speed.",
          "Caption marketing videos even when pronunciation pages exist; many users meet your brand muted. Align caption spellings with your glossary.",
          "Teachers can assign Speakur lookups as prep before reading tasks so decoding effort is spent on meaning, not on guessing sound.",
        ],
      },
    ],
    tldr: [
      "No autoplay, readable HTML, copyable IPA, and shame-free replay make pronunciation tools accessible for dyslexia and ESL alike.",
    ],
  },

  "on-demand-tts-and-click-gating": {
    synopsis: [
      "Click-gating means audio bytes are created or fetched only after a deliberate user gesture. It protects budget, privacy expectations, and accessibility.",
      "Implement the gate cleanly: HTML first, cache second, synthesize third—never the reverse.",
    ],
    sections: [
      {
        heading: "The decision tree on every Play click",
        paragraphs: [
          "1) Look up a cache key. 2) If hit, return the permanent URL. 3) If miss and the request is a real user gesture, synthesize, store, return. 4) If the client is a bot or a plain document GET, serve text only.",
          "Prefetch and hover tricks that trigger synthesis recreate the cost bomb click-gating was meant to solve. Be strict.",
          "Show a short loading state. Users tolerate a second after clicking; they do not tolerate silent failure. Fall back to browser speech only when labeled as such.",
        ],
      },
      {
        heading: "Why publishers and learners both win",
        paragraphs: [
          "Publishers avoid paying for crawler traffic. Learners avoid surprise audio. Search engines still receive IPA and definitions in HTML—critical for [programmatic SEO](/guides/programmatic-seo-for-dictionary-sites).",
          "Combine with [caching strategy](/guides/caching-audio-for-cost-efficient-tts) so the second click in a cohort is free forever.",
          "Speakur’s word pages follow this contract; browse any entry under [words](/words/) to see text-first delivery.",
        ],
      },
    ],
    tldr: [
      "Click → cache check → maybe synthesize → permanent store. Never generate audio for mere page views.",
    ],
  },

  "programmatic-seo-for-dictionary-sites": {
    synopsis: [
      "Programmatic dictionary SEO only works when each URL earns its existence with unique, helpful content—not thin templates spinning the same paragraph around a keyword.",
      "Ship real definitions, IPA, internal links, and editorial guides so the site behaves like a reference, not a doorway.",
    ],
    sections: [
      {
        heading: "Templates need substance modules",
        paragraphs: [
          "Every word page should include unique dictionary text, phonetics, syllable cues when available, and related links to hubs like [medical](/medical/) or [food](/food/). Empty “definition unavailable” shells are liabilities—run fill jobs until they shrink.",
          "Editorial guides (this library) prove human expertise. Keep them linked from footers and from relevant word pages. Google’s quality rater mindset rewards helpfulness over raw URL count.",
          "Sitemaps must be accurate and healthy. Broken indexes and redirect chains waste crawl budget—fix trailing-slash targets like [/words/](/words/).",
        ],
      },
      {
        heading: "Internal links and intent matching",
        paragraphs: [
          "Hub pages, alphabetical or topical, help crawlers and humans. Cross-link guides such as [commonly mispronounced words](/guides/commonly-mispronounced-english-words) to concrete entries.",
          "Avoid doorway patterns: near-duplicate pages with swapped keywords and no audio/definition value. Merge or enrich instead.",
          "Measure impressions and engagement on guides and hubs, not only raw indexed URL totals. Quality compounds; spam collapses.",
        ],
      },
    ],
    tldr: [
      "Programmatic pages must carry real linguistic value, trustworthy sitemaps, and editorial proof. Volume without substance is a ranking trap.",
    ],
  },

  "privacy-cookies-and-responsible-ad-tech": {
    synopsis: [
      "A free pronunciation resource can host ads without becoming hostile. Consent, data minimization, and honest disclosures are part of product quality.",
      "This guide outlines practical defaults for cookies, vendors, and user trust on Speakur-like sites.",
    ],
    sections: [
      {
        heading: "Separate learning UX from ad machinery",
        paragraphs: [
          "Core lookup—type a word, read IPA, click Play—must work even when advertising fails. Do not block definitions behind ad scripts. Reserved ad slots should not shove content around (CLS).",
          "Prefer consent CMPs that actually gate non-essential cookies. Document vendors in a privacy policy people can read, and keep a working contact email.",
          "Voice features that upload audio need explicit consent beyond generic cookie banners. STT is not “just another analytics pixel.”",
        ],
      },
      {
        heading: "Sustain the free resource without dark patterns",
        paragraphs: [
          "If ads fund free audio, say so plainly. Offer a [donate](/donate.html) path for supporters who prefer to fund the project directly.",
          "Avoid infinite interstitial traps that punish mobile learners mid-lookup. Accessibility and trust beat short-term RPM spikes.",
          "Review vendors quarterly. Remove dead scripts. Broken ad tech harms Core Web Vitals and credibility together.",
        ],
      },
    ],
    tldr: [
      "Keep lookups usable without ads, gate non-essential cookies honestly, and offer donate as a clean alternative. Trust is a growth feature.",
    ],
  },
};
