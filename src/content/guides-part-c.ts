import type { Guide } from "./types";

export const GUIDES_C: Guide[] = [
  {
    slug: "choosing-voices-for-brand-consistency",
    title: "Choosing Voices for Brand Consistency",
    description:
      "How to pick, document, and lock TTS or human voices so every touchpoint sounds like the same company.",
    publishedAt: "2026-04-01",
    readingMinutes: 9,
    sections: [
      {
        heading: "Voice is packaging for the ear",
        paragraphs: [
          "Visual brands police logo clear space and color hex codes. Audio brands need the same rigor. A voice that sounds warm in an onboarding video but clipped and nasal in help docs fractures recognition. Consistency compounds: customers who hear the same speaker traits across ads, product tours, and hold music form a faster emotional memory of your company.",
          "Start with attributes, not celebrity analogies. Decide on gender presentation (if any), age impression, energy, accent, and speaking rate. Translate those into casting notes for humans or a shortlist of TTS voice ids. Run blind listening tests with target customers whenever stakes are high.",
          "Document the winner in a one-page audio style guide linked from your brand portal. Include sample scripts, banned mannerisms, and a permanent URL to the reference MP3 stored in object storage.",
        ],
      },
      {
        heading: "Human talent vs synthetic voices",
        paragraphs: [
          "Human voice actors still win for hero campaigns and emotionally complex stories. Synthetic voices win for rapid iteration, personalization at scale, and long-tail help content. Many teams use both: humans for the brand anthem, TTS for thousands of UI microcopy reads—provided the TTS voice was chosen to sit in the same family as the human.",
          "If you clone an actor’s voice, contract for synthetic rights explicitly. If you use a vendor library voice, check exclusivity and competitor usage in your category. Popular default voices can make you sound interchangeable.",
          "Revisit the choice annually. Models improve; what sounded best last spring may sound dated. When you change, version your cache keys and migrate high-traffic clips deliberately rather than surprising users mid-funnel.",
        ],
      },
      {
        heading: "Governance across teams and vendors",
        paragraphs: [
          "Agencies, freelancers, and internal creators will invent new voices unless you make the approved path easiest. Provide a Speakur-like lookup for product terms, a folder of approved clips, and a Slack reminder in brand channels. Reject deliverables that ignore the guide—kindly but consistently.",
          "For multilingual brands, pick a voice strategy per locale, not a single global timbre forced through accents it cannot support. Keep the emotional attributes constant even when the language changes.",
          "Measure drift: periodically sample random customer-facing audio and score against the guide. Drift is normal in fast companies; catching it is the discipline.",
        ],
      },
      {
        heading: "Technical anchors",
        paragraphs: [
          "Store voice id, model name, speaking rate, and script hash beside each asset. Your CMS should not embed raw proprietary blobs without metadata. Pronunciation exceptions belong in a glossary that feeds both humans and APIs.",
          "Prefer on-demand generation with permanent cache for long-tail strings. Pre-render only the clips that appear above the fold on high-traffic templates.",
          "Brand consistency is a system. The voice you choose is the first decision; the system that prevents silent divergence is the lasting advantage.",
        ],
      },
    ],
  },
  {
    slug: "subtitles-captions-and-dubbing-compared",
    title: "Subtitles, Captions, and Dubbing Compared",
    description:
      "When to subtitle, caption, voice-over, or fully dub—and how pronunciation planning supports each path.",
    publishedAt: "2026-04-04",
    readingMinutes: 9,
    sections: [
      {
        heading: "Definitions that prevent meeting confusion",
        paragraphs: [
          "Subtitles typically translate speech for viewers who can hear the original audio. Closed captions also include non-speech cues (music, doorbells) and serve deaf and hard-of-hearing audiences in the same language or another. Dubbing replaces the spoken audio track. Voice-over often lays a narrator over lowered original sound. Teams that mix these terms ship the wrong deliverable.",
          "Accessibility regulations and platform policies may require captions even when marketing prefers subtitles only. Budget for captions as a baseline, then add translation and dubbing where ROI is clear.",
          "Pronunciation still matters for caption readers when names appear: inconsistent spellings of transliterated names confuse search and brand memory. Keep a glossary.",
        ],
      },
      {
        heading: "Cost, speed, and immersion trade-offs",
        paragraphs: [
          "Subtitles are fastest and cheapest, preserve original performances, and work well for educational content where hearing the source language is a feature. They demand literate viewers and attention to the visual channel. Dubbing maximizes immersion for audiences who prefer listening, especially for children or mobile viewers, but costs more and risks lip-sync and casting issues.",
          "AI reduces dubbing cost but does not remove QA. Use machine drafts, human editors, and cached final audio. Do not regenerate on every page view of a marketing site that embeds sample clips—serve stored files.",
          "Hybrid strategies are normal: English captions everywhere, Spanish subtitles for secondary markets, full dubs only for top markets. Revisit quarterly as traffic data arrives.",
        ],
      },
      {
        heading: "Workflow touchpoints",
        paragraphs: [
          "All paths benefit from a clean transcript. STT drafts, humans correct. Translators work from the approved transcript, not from messy auto-captions. For dubs, adapt lines for timing; literal translation often fails on screen.",
          "Name reads should be verified with IPA or reference audio before a voice actor records twenty episodes incorrectly. A five-minute Speakur lookup can save a five-thousand-dollar pickup session.",
          "Export consistently: SRT/VTT for captions, loudness-normalized stems for audio, and clear version numbers. Stale media is a silent brand bug.",
        ],
      },
      {
        heading: "Choosing for your next release",
        paragraphs: [
          "Ask: Who cannot enjoy this without captions? Who will bounce without local language audio? What is the lifetime value of the market? How often will the video change? Stable evergreen courses deserve more dubbing investment than weekly news-style clips.",
          "Publish an internal decision tree so creators stop reinventing policy. Link it next to your pronunciation glossary and trust center.",
          "Subtitles, captions, and dubbing are complementary tools. The winning localization program uses each deliberately—and keeps sound and spelling aligned through shared references.",
        ],
      },
    ],
  },
  {
    slug: "teaching-pronunciation-in-the-classroom",
    title: "Teaching Pronunciation in the Classroom",
    description:
      "Lesson patterns, feedback techniques, and tech tools that help teachers improve intelligibility without fear-based drills.",
    publishedAt: "2026-04-08",
    readingMinutes: 10,
    sections: [
      {
        heading: "Make pronunciation a habit, not a special unit",
        paragraphs: [
          "When pronunciation appears only in week three of a syllabus, students treat it as optional. Integrate short pronunciation bursts into every lesson: two minutes of stress marking on the warm-up dialogue, one minimal pair at the board, a closing choral read. Tiny repetitions beat rare marathons.",
          "Align targets with communicative goals. If students will present next week, practice presenting language. If they will call a clinic, practice phone numbers and polite repairs (“Could you repeat that?”).",
          "Technology should shorten the path to a model. Project a Speakur page, play audio, then turn screens off for production practice. Avoid letting tools become a spectator sport.",
        ],
      },
      {
        heading: "Feedback that students can use",
        paragraphs: [
          "Replace vague notes like “sound more natural” with actionable cues: “Move stress to the second syllable,” “Shorten the vowel,” “Voice the final consonant.” Teach students the IPA symbols you will use in feedback so comments transfer outside class.",
          "Peer feedback works when rubrics are narrow. Ask partners to listen only for word stress on a five-word list. Broad peer critique invites unhelpful accent shaming.",
          "Record progress. Students who hear their month-one and month-two clips believe improvement more than they believe teacher encouragement alone.",
        ],
      },
      {
        heading: "Inclusion and accent diversity",
        paragraphs: [
          "Model multiple proficient English accents when possible. Explain that intelligibility is the goal. Invite students to share pronunciation norms from their languages as linguistic expertise, not deficits.",
          "Be careful with public correction. Private or small-group feedback protects dignity. Celebrate successful communication in whole class.",
          "For multilingual classrooms, prioritize sounds that most affect shared intelligibility rather than chasing one prestige accent.",
        ],
      },
      {
        heading: "Assessment without cruelty",
        paragraphs: [
          "Assess features you taught. Use analytic rubrics: stress, specific segmentals, comprehensibility rating by a naive listener. Avoid grading “nativeness.”",
          "Homework can be a short voice note using new vocabulary with self-checked IPA. Teachers spot-check rather than scoring every second of audio.",
          "Classroom pronunciation teaching succeeds when students leave brave enough to speak. Tools, IPA, and routines are servants of that courage.",
        ],
      },
    ],
  },
  {
    slug: "commonly-mispronounced-english-words",
    title: "Commonly Mispronounced English Words",
    description:
      "Why epitome, Worcestershire, and their cousins trip people up—and how to practice them with IPA and audio.",
    publishedAt: "2026-04-11",
    readingMinutes: 8,
    sections: [
      {
        heading: "Spelling traps and prestige anxiety",
        paragraphs: [
          "English hides stress and silent letters with enthusiasm. Words like “epitome,” “hyperbole,” “worcestershire,” “quinoa,” and “anemone” become social landmines because people fear sounding uneducated. Humor helps, but a reliable reference helps more. Look up, listen, repeat, move on.",
          "Many “mispronunciations” are actually dialect differences. Before correcting someone, ask which accent they are targeting. “Schedule” is a classic example. Teaching should distinguish errors that block understanding from variants that merely signal region.",
          "Build a personal list of ten words you avoid saying. Those avoided words are exactly the ones to practice. Shame thrives in silence; confidence grows from reps.",
        ],
      },
      {
        heading: "Patterns behind the chaos",
        paragraphs: [
          "Greek loans often keep stress patterns that English spellers do not expect (epitome ends with a sounded “ee”). French loans may retain unexpected stress or silent consonants. Place names fossilize historical pronunciations that no longer match spelling. Once you recognize the category, new members feel less random.",
          "Schwa deletion and cluster simplification explain casual forms. Careful speech and casual speech both deserve models if you teach public presenting versus friendly conversation.",
          "AI voices can also misread rare words. Never trust a single uncached generation for a brand name; verify and store the approved clip.",
        ],
      },
      {
        heading: "A practice list that transfers",
        paragraphs: [
          "Work through: colonel's silent sounds, espresso vs expresso, nuclear’s common metathesis, library’s elided syllables, regularly’s adverb stress, and jewelry/jewellery differences across spelling standards. Add your industry’s jargon.",
          "For each item: read IPA, play US and UK audio if available, record yourself, compare. Use the word in a sentence about your real life the same day.",
          "Share the list with your team so everyone climbs the same curve. Collective glossaries beat scattered private anxieties.",
        ],
      },
      {
        heading: "From trivia to training",
        paragraphs: [
          "Internet lists of “words you’re saying wrong” often mock more than they teach. Reframe as training data. Pair every tricky entry on Speakur with a calm explanation in editorial content—the combination of utility page plus guide is stronger for learners and for search quality reviewers.",
          "Update lists as product names enter culture. Living languages add new traps yearly.",
          "Mispronunciation is universal. The skill is efficient repair. Keep a lookup tool open and treat each stumble as a two-minute lesson, not a character flaw.",
        ],
      },
    ],
  },
  {
    slug: "science-of-syllables-and-stress",
    title: "The Science of Syllables and Stress",
    description:
      "How syllable structure and stress patterns shape English rhythm—and how to use that science when you practice.",
    publishedAt: "2026-04-15",
    readingMinutes: 9,
    sections: [
      {
        heading: "Syllables as timing units",
        paragraphs: [
          "A syllable typically centers on a vowel peak, optionally surrounded by consonants. Languages differ in which clusters are legal. English allows complex codas (“texts”) that challenge speakers of languages with simpler syllables. When learners insert extra vowels (“e-texts”), they are repairing phonotactics. Teachers can acknowledge the repair, then gradually train cluster targets needed for intelligibility.",
          "Counting syllables helps with stress placement and with poetic meter, but automatic counters disagree at edges (fire, oil, realism). Treat counts as helpful approximations and verify with audio.",
          "Speakur surfaces syllable estimates beside IPA to give learners a scaffolding before they listen.",
        ],
      },
      {
        heading: "Stress, unstress, and meaning",
        paragraphs: [
          "English is often described as stress-timed: stressed syllables arrive with a rough rhythm while unstressed syllables compress. Whether or not the typology is perfect, the pedagogical point stands—give energy to stressed syllables and reduce the rest. Flat, evenly punched syllables are a common L2 giveaway.",
          "Lexical stress distinguishes nouns and verbs in pairs like ˈpermit / perˈmit. Sentence stress highlights new or contrasted information. Both layers matter in presentations.",
          "Mark stress visually when rehearsing speeches. Capitals or bold on stressed syllables beat unmarked scripts.",
        ],
      },
      {
        heading: "Acoustic correlates you can feel",
        paragraphs: [
          "Stressed syllables tend to be longer, louder, and higher in pitch, though not every cue appears every time. Learners can exaggerate length first—it is tangible—then refine pitch. Recording and viewing simple waveforms is optional; ears and muscles are enough.",
          "Schwa is the partner of stress. Without reduction, stress has nowhere to contrast. Practice saying “banana” with a strong middle and weak edges.",
          "TTS engines approximate these patterns statistically. When a model stresses the wrong syllable, fix the input (hyphenation hints, phonetic spelling where supported) or cache a corrected human take.",
        ],
      },
      {
        heading: "Practice drills that respect the science",
        paragraphs: [
          "Clap stress on vocabulary lists. Whisper unstressed syllables. Alternate slow exaggerated stress with conversation speed. Move from words to phrases to paragraphs.",
          "For teachers, diagnose whether an intelligibility issue is segmental (wrong sound) or prosodic (wrong stress). Prosodic fixes often unlock more comprehension per minute of class time.",
          "Syllable and stress literacy turns mysterious “sound native” advice into concrete moves. Pair the concepts with instant audio references and students progress with less superstition.",
        ],
      },
    ],
  },
  {
    slug: "accessibility-audio-for-dyslexia-and-esl",
    title: "Accessibility: Audio for Dyslexia and ESL Readers",
    description:
      "How pronunciation audio, clear typography, and captions make language tools work for more brains and more levels.",
    publishedAt: "2026-04-18",
    readingMinutes: 9,
    sections: [
      {
        heading: "Reading is not only visual",
        paragraphs: [
          "Many people understand spoken language more easily than dense text. Learners with dyslexia, ADHD, low vision, or limited literacy in English benefit when a site offers high-quality audio alongside written definitions. Pronunciation pages that only show respelling without sound exclude users who need multimodal input.",
          "ESL readers may decode slowly yet comprehend quickly when they hear a word. Offering Play without forcing autoplay respects user control and avoids surprising screen-reader users with overlapping audio.",
          "Accessibility is not a niche compliance checkbox for language products—it is core UX. The same features help skimming professionals on mobile.",
        ],
      },
      {
        heading: "Design patterns that help",
        paragraphs: [
          "Use readable fonts, generous line height, and strong color contrast. Keep IPA available but not as the only cue. Provide both free dictionary audio and optional studio voices. Label accents. Avoid play buttons that look decorative; name them clearly (“Play pronunciation”).",
          "Captions and transcripts on editorial videos help deaf users and anyone in a sound-sensitive environment. Guides on Speakur are delivered as HTML text first so they work without JavaScript execution—important for assistive tech and for crawlers.",
          "Do not rely on color alone to mark stress or errors. Combine icons, text, and sound.",
        ],
      },
      {
        heading: "Cognitive load and confidence",
        paragraphs: [
          "Too many ads, popovers, and autoplaying clips spike cognitive load. A calm layout helps dyslexic readers track lines. If you monetize with ads, keep them predictable and clearly disclosed in the privacy policy—never mimic system dialogs.",
          "Allow slowed playback. Chunk long guides with descriptive headings. Offer a table of contents on long articles.",
          "Invite feedback from users with disabilities and from ESL teachers. Paid testing with participants beats assumptions.",
        ],
      },
      {
        heading: "Policy and product alignment",
        paragraphs: [
          "Document accessibility aims on your About page. Provide a contact path for barriers. Remediating issues quickly is part of trust.",
          "Technically, ensure server-rendered text, semantic headings, and keyboard-operable Play controls. Cache audio so assistive technology users are not waiting on cold TTS with no feedback.",
          "When pronunciation tools become more accessible, they become more useful to everyone. That is the quiet power of inclusive design.",
        ],
      },
    ],
  },
  {
    slug: "on-demand-tts-and-click-gating",
    title: "On-Demand TTS and Why Click-Gating Matters",
    description:
      "How requiring a real user gesture before synthesis protects margins, privacy, and search-crawler hygiene.",
    publishedAt: "2026-04-22",
    readingMinutes: 8,
    sections: [
      {
        heading: "The hidden cost of eager generation",
        paragraphs: [
          "Auto-generating audio during HTML render feels magical in demos and disastrous in production. Crawlers, link unfurlers, and opportunistic bots will request pages without any intention to listen. If each request mints MP3s, you pay for curiosity you did not receive.",
          "Click-gating means the client initiates a POST (or equivalent authenticated action) after a human gesture. The server may then check cache and synthesize on miss. GET requests for documents return text only. This split is the heart of Speakur’s cost-shielding design.",
          "Click-gating also reduces accidental plays for users who land mid-scroll with screen readers or shared devices.",
        ],
      },
      {
        heading: "Implementing the gate without hurting UX",
        paragraphs: [
          "Show a clear Play button. On first click, display a short loading state. On success, play immediately and remember the URL client-side for the session. Subsequent visits hit CDN-cached audio and feel instant.",
          "If TTS is not configured, fall back to browser speechSynthesis still only after the click—never on load. Users understand progressive enhancement when you explain it lightly in UI copy.",
          "Rate-limit synthesize endpoints. Reject oversized inputs. Log hit ratios. Alert on sudden miss spikes that might indicate abuse.",
        ],
      },
      {
        heading: "SEO implications",
        paragraphs: [
          "Googlebot needs content in raw HTML. It does not need your MP3s to understand a pronunciation page. In fact, keeping audio out of the render path reduces time-to-first-byte work and keeps templates focused on text quality.",
          "Pair gated audio with strong titles, canonical tags, IPA in HTML, and related editorial guides. Reviewers evaluating site quality should see a library of helpful articles and transparent trust pages—not a blank shell waiting on JavaScript.",
          "Sitemaps should list text URLs. Do not sitemap temporary API synthesize routes.",
        ],
      },
      {
        heading: "Ethics and expectations",
        paragraphs: [
          "Tell users when audio is synthetic. Disclose vendors in privacy documentation when data is sent for generation. Do not collect speech uploads unless the product truly needs STT features and users consent.",
          "Click-gating is not only frugality—it is respect for the difference between publishing information and performing a paid computation.",
          "Build the gate once, test it with a crawler user-agent, and keep it as a permanent invariant of the platform.",
        ],
      },
    ],
  },
  {
    slug: "programmatic-seo-for-dictionary-sites",
    title: "Programmatic SEO for Dictionary Sites",
    description:
      "How to scale pronunciation pages without creating thin doorways—templates, internal links, sitemaps, and editorial balance.",
    publishedAt: "2026-04-25",
    readingMinutes: 11,
    sections: [
      {
        heading: "Programmatic pages need a purpose",
        paragraphs: [
          "Programmatic SEO generates many similar pages from structured data—word, IPA, definitions, related links. Done well, each page answers a real query like “how to pronounce epitome.” Done poorly, thousands of near-empty URLs chase keywords without helping users. Google’s manual reviewers and automated systems both look for helpfulness, originality, and site reputation.",
          "A healthy dictionary property combines scalable templates with unique editorial guides, clear authorship or organizational identity, and trust pages. Speakur’s strategy is intentionally hybrid: utility lookup plus long-form teaching content.",
          "Render primary text on the server. If a crawler disables JavaScript, definitions and IPA must still appear in the HTML response. Client components should enhance search boxes and audio buttons, not own the article body.",
        ],
      },
      {
        heading: "Template quality checklist",
        paragraphs: [
          "Each word page should include: the word as an H1, IPA, syllable info when available, definitions, internal links to related words or guides, and a visible path to Play that does not auto-fire paid APIs. Titles and meta descriptions should be unique and natural.",
          "Avoid doorway smells: pages with no content beyond an affiliate iframe, infinite soft-404s for nonsense strings, or cloaking. Return true 404s for unknown words. Curate sitemaps toward real lexicon entries.",
          "Paginate XML sitemaps in chunks of about 1,000 URLs. Submit the index in Google Search Console. Monitor coverage and fix errors before chasing new thousands of URLs.",
        ],
      },
      {
        heading: "Internal links and topical authority",
        paragraphs: [
          "Editorial guides should link to example word pages; word pages should link back to relevant guides (“Learn IPA”). This reciprocity helps users and clarifies topical focus for search engines.",
          "Build hubs: accents, IPA, localization, teaching. Do not orphan guides. Keep a guides index updated as you publish toward the 15–20 article baseline reviewers expect for some publisher programs.",
          "Earn modest organic traffic before applying to sensitive ad programs when possible. Brand-new domains with zero history face higher skepticism—another reason to ship substantive articles early.",
        ],
      },
      {
        heading: "Measurement and restraint",
        paragraphs: [
          "Watch Search Console for queries that reveal missing words worth adding. Expand the seed list based on demand, not vanity scale. A smaller set of excellent pages beats a swamp of thin ones.",
          "Use ISR or static generation so popular pages are cached at the CDN. Revalidate when definitions update, not on every request.",
          "Programmatic SEO is a multiplier on quality systems. Without editorial depth and technical honesty—SSR text, click-gated audio, trust pages—it multiplies junk. With those foundations, it becomes a durable learning library.",
        ],
      },
    ],
  },
  {
    slug: "privacy-cookies-and-responsible-ad-tech",
    title: "Privacy, Cookies, and Responsible Ad Tech on Language Sites",
    description:
      "What learners should expect from analytics, cookies, and third-party ad serving on educational and utility sites like Speakur.",
    publishedAt: "2026-04-28",
    readingMinutes: 10,
    sections: [
      {
        heading: "Education products still run on real infrastructure",
        paragraphs: [
          "Even a pronunciation site with a social mission needs hosting, observability, and sometimes advertising to fund free access. Users deserve plain explanations of what is collected and why. Regulators increasingly expect the same. A Privacy Policy is not boilerplate decoration; it is part of product ethics and part of advertising program compliance.",
          "Speakur’s architecture tries to minimize sensitive data in the audio path: we prefer not to upload user speech for basic pronunciation playback, and we generate studio audio only after a click. Still, standard web logs, analytics, and—if enabled—third-party ad serving introduce cookies and identifiers that must be disclosed.",
          "This guide explains the categories at a high level. The Privacy Policy page is the controlling legal text; if they ever differ, the policy wins.",
        ],
      },
      {
        heading: "Cookies, local storage, and similar technologies",
        paragraphs: [
          "Cookies are small bits of data stored on your device. First-party cookies may remember preferences or maintain security sessions. Third-party cookies may be set by embedded advertising, measurement, or social widgets. Browsers are restricting third-party cookies, but other identifiers and link decorations can play similar roles.",
          "Language sites should avoid surprising trackers on every keystroke of a search box. Prefer privacy-respecting analytics configurations, document retention periods, and offer regional consent where required by law.",
          "If we serve ads, ad partners may use cookies and similar technologies to measure impressions, detect fraud, and—depending on settings and region—personalize creatives. Users should be able to learn which partners are involved via the Privacy Policy and any consent manager we deploy.",
        ],
      },
      {
        heading: "Third-party ad serving without wrecking trust",
        paragraphs: [
          "Responsible ad tech on educational sites means: clear labeling of advertisements, no ads that impersonate site UI or system warnings, careful category blocking (especially around exploitatives content), and performance budgets so trackers do not destroy Core Web Vitals. Intrusive interstitials harm learners and invite policy strikes.",
          "Publisher application checklists often require working Privacy and Terms pages that explicitly mention third-party ad serving and cookies before approval. Speakur publishes those pages in the footer sitewide for that reason—and because users deserve them regardless of ads.",
          "Do not sell children’s data. If you knowingly operate experiences for children, apply stricter rules and parental requirements. Pronunciation tools used in schools should offer teacher-appropriate modes with minimized tracking.",
        ],
      },
      {
        heading: "Vendor subprocessors and audio APIs",
        paragraphs: [
          "When a user clicks to generate studio audio, text may be sent to a TTS provider such as OpenAI. That transmission should be limited to what is needed, logged carefully, and covered in the privacy notice. Cached MP3s on Cloudflare R2 are artifacts of that process; they should not silently include personal paragraphs users typed into unrelated tools.",
          "List categories of subprocessors: hosting, storage, analytics, advertising, AI APIs. Update the list when vendors change. Provide a contact address for privacy requests.",
          "Trust is a learning outcome too. A site that teaches clearly and discloses clearly is easier to recommend to classrooms and companies alike. Privacy, cookies, and ad tech are part of that clarity—not an afterthought buried in unlinked PDFs.",
        ],
      },
    ],
  },
];
