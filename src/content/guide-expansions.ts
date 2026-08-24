import type { GuideSection } from "./types";

/** Extra long-form sections merged into each guide to clear the 800+ word bar. */
export const GUIDE_EXPANSIONS: Record<string, GuideSection[]> = {
  "how-ai-speech-synthesis-works": [
    {
      heading: "Putting synthesis to work on a pronunciation site",
      paragraphs: [
        "A pronunciation product sits at an interesting intersection of linguistics and infrastructure. Visitors arrive with a narrow intent: they want to hear a word, confirm stress, and leave with confidence. That intent must be satisfied in a second or two, yet the business cannot afford to treat every HTML request as a billable synthesis event. The editorial lesson for builders is to separate the knowledge layer from the media layer. Knowledge—definitions, IPA, syllable estimates, related guides—belongs in HTML that any crawler can read. Media—MP3 bytes—belongs behind a deliberate gesture and a durable cache key.",
        "Teams that skip this separation often discover the problem only after a traffic spike. A feature article ranks, bots fan out across related word pages, and overnight TTS invoices climb. By then, product managers face an ugly choice between shutting off audio and eating cost. Designing click-gated, cache-first audio from day one avoids that trap and also creates a cleaner accessibility story: users who never click never receive unexpected sound, while users who do click get a predictable loading state and a permanent asset.",
        "Finally, synthesis quality should be evaluated the way teachers evaluate students—not with a single glamorous demo sentence, but with a fixed list of brutal words, names, and numbers. Keep that evaluation set in version control. When you change models or voices, re-run the set, listen, and only then flip production. Speakur’s long-term quality will come as much from that discipline as from whichever vendor currently leads a benchmark chart.",
      ],
    },
  ],
  "linguistic-accents-in-global-marketing": [
    {
      heading: "Building an accent decision record",
      paragraphs: [
        "Marketing organizations move quickly and forget why yesterday’s choices were made. An accent decision record is a short living document that captures the chosen accent per market, the rejected alternatives, the customer evidence reviewed, the legal constraints noted, and the owner who can update the decision. Without that record, new agencies reinvent the wheel and quietly ship conflicting reads of the same product name. With it, onboarding a freelancer becomes a fifteen-minute briefing instead of a week of Slack archaeology.",
        "The record should link to canonical audio files and IPA lines for every protected term. It should also state when exceptions are allowed—for example, a founder speaking naturally in an interview versus a paid media end card that must match brand voice. Separating “human spontaneous speech” from “controlled brand audio” prevents over-policing of authentic moments while still protecting polished assets.",
        "Review the decision record whenever you enter a new English-speaking market, launch a major rebrand, or switch TTS vendors. Accent strategy is not a one-time brand workshop deliverable; it is an operating system for sound. Companies that treat it that way sound intentional everywhere they speak.",
      ],
    },
  ],
  "guide-to-audio-localization": [
    {
      heading: "Kickoff checklist for your next localized launch",
      paragraphs: [
        "Before any model runs, freeze the source. Lock the picture edit, export a clean dialogue stem, and approve an English transcript with speaker labels. Build the glossary of product terms with IPA and reference audio. Decide subtitle-only versus dub markets using traffic and revenue data, not gut feel alone. Assign reviewers in each target locale who have authority to block a release—not only soft opinions after launch.",
        "During production, keep a single source of truth for script versions. Every change to a line should bump a version id that flows into the audio object key. Editors should know whether they are looking at draft machine audio or approved cache. Ambiguity here is how wrong pronunciations escape into ads that cannot be pulled quickly.",
        "After launch, collect qualitative comments that mention “voice,” “accent,” or “hard to understand.” Those comments are localization telemetry. Feed them back into the glossary and into Speakur lookups for terms that confused listeners. Localization is never finished; it is a loop that gets cheaper each time you reuse cached, approved sound.",
      ],
    },
  ],
  "how-to-read-ipa-phonetic-symbols": [
    {
      heading: "From recognition to fluent decoding",
      paragraphs: [
        "Early IPA study feels like decoding a cipher one symbol at a time. Fluency arrives when you stop translating symbol-by-symbol and start recognizing chunks: stressed syllable shapes, common endings, and frequent function-word reductions. To get there, alternate between careful reading and timed reading. First, decode slowly with audio confirmation. Later, glance at a transcription and speak before pressing Play, then check. The second mode builds the automaticity you need when a teacher writes IPA on a whiteboard in real time.",
        "Create a personal symbol deck. On one side, the IPA character; on the other, two example words from your own vocabulary—not only textbook classics. Including words from your job makes practice sticky. Revisit the deck while commuting as visual study even on days you cannot speak aloud.",
        "When dictionaries disagree, do not panic. Broad transcriptions omit predictable detail. Accent labels explain many mismatches. If two trusted sources still conflict on a brand name, pick one for your glossary, document it, and keep the audio file as the final arbiter. IPA is a map; audio is the territory. Learn to use both, and dictionary pages become empowering instead of intimidating.",
      ],
    },
  ],
  "us-vs-uk-pronunciation-differences": [
    {
      heading: "Training your ear across the Atlantic",
      paragraphs: [
        "Passive exposure helps, but deliberate contrast practice helps faster. Take a short paragraph and listen to it in a US news voice and a UK news voice. Note three differences only—perhaps rhoticity, one vowel, and one stress pattern—then shadow each version. Narrow focus prevents overwhelm. Rotate the features you monitor across weeks so coverage accumulates.",
        "Learners who consume mostly one accent often mis-hear the other even when they “understand” the words from context. Schedule one listening session per week in your non-target accent purely for comprehension flexibility. Marketers who sell into both markets should do the same so they can evaluate vendors with calibrated ears.",
        "Remember that “US” and “UK” are umbrella labels covering rich internal diversity. Scottish, Southern US, Multicultural London English, and many other varieties deserve respect. Start with the two broad references because materials are abundant, then widen. The point of comparison is clarity and choice, never ridicule.",
      ],
    },
  ],
  "why-pronunciation-matters-for-learners": [
    {
      heading: "Connecting pronunciation to real-world outcomes",
      paragraphs: [
        "Learners stay motivated when practice maps to outcomes they care about: passing a viva, clearing a customer call, interviewing for a job, or making friends without repeating every sentence. Ask students to name one upcoming speaking event and build the week’s pronunciation targets from that event’s vocabulary. Abstract drills disconnected from life lose to fatigue.",
        "Parents and self-studiers can apply the same principle. If a teenager loves cooking videos, practice culinary terms. If a professional lives in standups, practice status verbs and product names. Speakur’s lookup then becomes a companion to authentic content rather than a separate chore.",
        "Institutions evaluating software should ask whether a tool improves willingness to speak. Features that reduce shame—private replay, slow audio, clear IPA—often matter more than gamified points. Pronunciation matters because communication matters. Keep that human end in sight and the study plan writes itself.",
      ],
    },
  ],
  "building-a-pronunciation-practice-routine": [
    {
      heading: "Troubleshooting a stalled routine",
      paragraphs: [
        "When streaks die, diagnose the friction. Was the session too long? Was the tool stack too complex? Was the goal vague? Cut the session to five minutes, use one tool, and pick three words only. Momentum returns through easy wins. If privacy is the blocker, switch to silent IPA days interleaved with speaking days rather than quitting entirely.",
        "Another failure mode is perfectionism: learners delete recordings they dislike and never keep evidence of growth. Force a dated archive. Progress hides in comparisons. Teachers can require portfolio clips for the same reason.",
        "Revisit targets monthly. Words that terrified you in March may be automatic in May; replace them with new danger-list items. A living routine adapts. A rigid routine breaks. Build the former, and pronunciation practice becomes a durable part of how you learn—not a temporary New Year resolution.",
      ],
    },
  ],
  "speech-to-text-vs-text-to-speech": [
    {
      heading: "Architecture patterns for teams shipping both",
      paragraphs: [
        "Product teams often bury STT and TTS calls inside feature code, making vendor swaps painful. Instead, create small service modules with explicit inputs and outputs: audio in / text out for STT, text in / audio URL out for TTS. Persist artifacts with stable ids. Upstream features should never hold raw vendor payloads as their only source of truth.",
        "Observability should track error rates, latency, and cost per successful user action—not per internal retry. Correlate spikes with bot traffic. For TTS, track cache hit ratio as a first-class metric. For STT, track average audio duration and language distribution so you can forecast spend.",
        "Security reviews should ask where audio and text go, how long they are retained, and whether enterprise agreements cover training opt-outs. Pronunciation sites that mostly send short dictionary words have a simpler risk profile than meeting transcription products, but honesty in documentation still matters for user trust and for advertising program compliance.",
      ],
    },
  ],
  "caching-audio-for-cost-efficient-tts": [
    {
      heading: "A reference implementation mindset",
      paragraphs: [
        "Think of cached audio as a content delivery problem first and an AI problem second. Your users need low-latency bytes near the edge. Your finance team needs predictability. Your SEO team needs HTML that does not depend on those bytes. When those three stakeholders share one architecture diagram—the decision tree from cache hit to click to synthesize—you avoid shadow systems where marketing hosts MP3s in random drive folders.",
        "Automate integrity checks: periodically HEAD a sample of public audio URLs and alert on 404s. When migrating buckets, rewrite keys carefully and keep redirects if needed. Treat audio objects with the same care you treat images in a CMS.",
        "As open-source TTS improves, you may generate with different backends while keeping the same public URLs. That is the dividend of good key design. Cost efficiency is not a one-time vendor choice; it is a habit of never paying twice for the same utterance.",
      ],
    },
  ],
  "choosing-voices-for-brand-consistency": [
    {
      heading: "Rolling a voice out across the company",
      paragraphs: [
        "After you select a voice, plan the rollout like a design system release. Publish the audio style guide, host a short listening workshop for content owners, update templates in your video tool, and replace the top twenty customer-facing clips before announcing a hard cutover. Soft-launching prevents a chaotic week where half the funnel sounds new and half sounds legacy.",
        "Empower a single brand-ops owner to approve exceptions. Without an owner, every team claims urgency and consistency dies. With an owner, exceptions become documented learning rather than silent drift.",
        "Close the loop with customers. If support tickets mention that the “robot voice feels colder,” investigate before defending the choice on principle. Brand voice exists to serve relationships. Data and empathy beat vibes—and beat the temptation to change voices every time a new model demo goes viral on social media.",
      ],
    },
  ],
  "subtitles-captions-and-dubbing-compared": [
    {
      heading: "Quality bars you can actually enforce",
      paragraphs: [
        "Write numerical targets where possible: maximum reading speed for captions, loudness targets for mixes, turnaround times for each language, and a glossary compliance score on spot checks. Vague aspirations (“make it great”) cannot be enforced across vendors. Clear bars can.",
        "Run periodic accessibility audits on a sample of videos: Are captions available by default on social uploads? Do players expose a captions button? Is the transcript downloadable for guides that began as talks? These checks protect users and reduce legal risk.",
        "As AI tools accelerate drafts, keep humans on the acceptance gate for customer-facing launches. Machines draft; people accept. That division of labor, paired with pronunciation glossaries and cached audio, is how modern localization teams move faster without sounding careless.",
      ],
    },
  ],
  "teaching-pronunciation-in-the-classroom": [
    {
      heading: "Sample mini-lesson you can steal tomorrow",
      paragraphs: [
        "Open with a thirty-second story told twice—once with flat stress and once with clear nuclear stress—and ask students which is easier to follow. Reveal that both used the same words. This creates buy-in before metalanguage appears. Next, display five vocabulary items from the day’s reading. Students mark stress, check IPA on Speakur, listen once, then chorally repeat. Pair work follows: each student teaches two words to a partner without showing the screen, then they verify together.",
        "Close with a reflective prompt: Which word still feels unstable? Students add it to a personal danger list. Homework is a thirty-second voice note using at least three of the words. In the next class, spot-check two notes for stress only. The entire arc can fit in twelve minutes and still move intelligibility.",
        "Adapt the skeleton for different levels by changing the vocabulary source, not the pedagogy. Beginners may use classroom objects; advanced students may use abstract academic verbs. The constant is cycle speed: encounter, model, produce, feedback. Teachers who protect that cycle outperform teachers who lecture about phonetics without mouths moving.",
      ],
    },
  ],
  "commonly-mispronounced-english-words": [
    {
      heading: "Making hard words a team sport",
      paragraphs: [
        "Workplaces accumulate shared landmines: founder names, customer names, town names, acronyms pronounced as words, and product features coined by engineers at midnight. Host a monthly ten-minute “say it right” huddle. Look up three terms live, play audio, and update a shared glossary. The ritual normalizes not-knowing and prevents the same private Google searches from happening fifty times in parallel.",
        "For content teams, add a pre-publish checklist item: “Proper nouns verified.” That single checkbox catches a surprising amount of embarrassment before it reaches YouTube comments.",
        "Learners can gamify without cruelty: earn points for using a former danger word in conversation, not for mocking others. Curiosity is the culture you want. Lists of commonly mispronounced words are only useful when they lead to practice, documentation, and kinder communication—not to gotcha content that humiliates.",
      ],
    },
  ],
  "science-of-syllables-and-stress": [
    {
      heading: "Applying syllable science in product copy and UX",
      paragraphs: [
        "Product designers rarely think about syllables, yet microcopy read aloud by TTS engines will expose stress mistakes instantly. When naming features, say candidates out loud and mark stress. Avoid names that force awkward clusters across languages you will localize into. If a name is already chosen, lock pronunciation early and cache audio for support staff.",
        "For learner UX, showing a simple syllable break (for example, ep·i·to·me) gives an intuitive scaffold even before IPA confidence arrives. Pair that visual with a stress mark or bold on the primary syllable. Multimodal cues reduce cognitive load.",
        "Researchers will continue debating rhythm typology and measurement methods. Practitioners can borrow the durable insights now: English needs contrast between strong and weak syllables; learners need tools that make that contrast visible and audible; products that surface both will teach faster than products that only play a flat synthetic take.",
      ],
    },
  ],
  "accessibility-audio-for-dyslexia-and-esl": [
    {
      heading: "Testing with the people you claim to serve",
      paragraphs: [
        "Internal accessibility checklists catch missing alt text and low contrast, but they rarely catch whether a dyslexic university student can complete a pronunciation lookup while fatigued at midnight. Recruit participants. Pay them. Observe. Ask them to think aloud. You will learn that button labels, spacing, and the absence of autoplay matter as much as any AI model choice.",
        "ESL participants may surface different issues: unexplained accent labels, overcrowded pages, or definitions written at a higher reading level than the headword difficulty. Offer a “simpler English” definition tier if your editorial capacity allows, or link to learner-graded resources.",
        "Publish an accessibility statement that is honest about known gaps and timelines. Empty perfection claims erode trust. Concrete progress—“Play controls are keyboard reachable; captions available on all guide videos by Q3”—builds it. Inclusive pronunciation tools are not a nice-to-have skin on a dictionary; they are the dictionary working as intended for more humans.",
      ],
    },
  ],
  "on-demand-tts-and-click-gating": [
    {
      heading: "Policy language your engineering and ads teams can share",
      paragraphs: [
        "Write an internal policy in plain English: “We never call paid TTS during HTML render or ISR. We never expose a GET endpoint that synthesizes. We only synthesize after a user gesture, then we cache forever unless the voice or text version changes.” Pin that policy in the repo README for the audio service. When a well-meaning intern adds eager generation to “improve SEO,” the policy gives reviewers a clear reason to reject the PR.",
        "Share a shortened version with advertising and partner managers who must explain site behavior during reviews. Reviewers look for signals that a site is a real business with adult supervision. Technical restraint is one of those signals—especially alongside trust pages and long-form guides.",
        "Rehearse failure drills: what if the TTS vendor is down? What if the cache is empty on a launch day spike? Show browser fallback, queueing, or graceful messages. Click-gating is not only about cost. It is about controlled degradation under stress, which is how reliable platforms behave.",
      ],
    },
  ],
  "programmatic-seo-for-dictionary-sites": [
    {
      heading: "A ninety-day plan before monetization applications",
      paragraphs: [
        "Days 1–30: ship trust pages, footer links, analytics, Search Console verification, and at least fifteen long-form guides. Ensure word templates SSR correctly by viewing “display HTML source” on a phone browser with JavaScript considered. Days 31–60: expand the curated word set based on real queries, fix coverage errors, and earn initial organic clicks through guides and a handful of difficult-word pages. Days 61–90: improve internal linking, add comparison content, and only then assemble screenshots and notes for ads or partner applications that demand history.",
        "Resist the urge to explode from one hundred to fifty thousand URLs in week two. Reviewers and algorithms both notice empty forests. Grow the lexicon as a gardener, not as a spam cannon.",
        "Keep a public changelog of editorial improvements. It helps your team and demonstrates ongoing human investment. Programmatic SEO works best when it is obviously in service of learners—one clear page at a time, multiplied carefully.",
      ],
    },
  ],
  "privacy-cookies-and-responsible-ad-tech": [
    {
      heading: "A practical privacy checklist for Speakur-like sites",
      paragraphs: [
        "Before enabling ads, publish Privacy and Terms, add footer links sitewide, invent a consent path for regulated regions, inventory every script tag, and classify cookies as essential, analytics, or advertising. Before enabling TTS, disclose the vendor category and limit payloads to short text. Before collecting contact-form data, state how long you keep messages and who can read them.",
        "Run a quarterly review: delete unused pixels, rotate keys, re-check partner categories, and confirm that Play still does not fire on page load. Privacy is operational hygiene, not a single legal PDF.",
        "Tell users the truth in human language. People who come to learn a word will tolerate modest monetization if the site stays fast, respectful, and clear about cookies and third-party ad serving. They will not tolerate dark patterns. Responsible ad tech is how educational utilities fund themselves without betraying the learners who trusted them with their attention.",
      ],
    },
  ],
};
