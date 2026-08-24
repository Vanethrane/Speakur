import type { Guide } from "./types";

/**
 * Editorial support articles for Google publisher compliance.
 * Each guide targets 800+ words of original long-form text, SSR'd into HTML.
 */
export const GUIDES: Guide[] = [
  {
    slug: "how-ai-speech-synthesis-works",
    title: "How AI Speech Synthesis Works",
    description:
      "A plain-language tour of text-to-speech models, spectrograms, vocoders, and why on-demand caching keeps pronunciation sites affordable.",
    publishedAt: "2026-03-01",
    readingMinutes: 9,
    sections: [
      {
        heading: "From typed letters to spoken sound",
        paragraphs: [
          "Speech synthesis is the process of turning written language into audible speech. Early systems chained phoneme rules and concatenative clips recorded by voice actors. Modern AI systems learn statistical patterns from hundreds of hours of speech so they can produce natural rhythm, pitch, and emphasis without stitching tiny audio fragments together by hand. When you type a word into Speakur and hear it spoken, you are usually hearing either a carefully licensed dictionary recording or a neural text-to-speech model that predicted a waveform from characters and punctuation.",
          "At a high level, a neural TTS pipeline has three conceptual stages. First, the text is normalized: numbers become spoken forms, abbreviations expand, and punctuation is interpreted as pauses. Second, a linguistic front-end estimates phonemes, stress, and phrasing. Third, an acoustic model predicts spectral features or a latent representation of speech, and a vocoder converts that representation into an MP3 or WAV file. Different vendors hide these stages behind a single API call, but the economics and quality trade-offs still map back to how much compute those stages consume.",
          "Understanding that pipeline matters for product builders. If every page view called a paid TTS API, a dictionary site with tens of thousands of pages would burn margin before Google ever ranked the content. The durable pattern is to render phonetic text in HTML for crawlers and humans, then generate audio only when a real visitor clicks Play, and permanently cache the resulting file.",
        ],
      },
      {
        heading: "Spectrograms, latent spaces, and vocoders",
        paragraphs: [
          "Many modern models do not invent raw samples one by one in an obvious way. Instead they predict a compact representation—often related to a mel spectrogram—that describes how energy is distributed across frequencies over time. A vocoder such as a generative adversarial network or a diffusion decoder then expands that representation into a waveform. The quality of the vocoder heavily influences how “studio-like” the voice sounds, which is why the same script can feel robotic on one provider and warm on another even when both claim to use neural TTS.",
          "Prosody—the melody of speech—is where models still struggle. Humans lengthen vowels for emphasis, raise pitch for questions, and compress unstressed syllables. Short pronunciations of single words are easier because there is less discourse context to get wrong. Long marketing scripts demand careful punctuation and sometimes SSML-like hints so the model does not flatten emotional arcs. For a pronunciation product, single-word and short-phrase synthesis is the sweet spot: high utility, low character cost, and forgiving latency.",
          "Cloned voices add another layer. Voice cloning captures speaker embeddings from a short sample so the model can speak new text “in your voice.” That capability is powerful for dubbing, but it raises consent and abuse concerns. Speakur’s pronunciation engine focuses on clear reference pronunciations rather than impersonation, which keeps the editorial product aligned with learner and marketer use cases instead of deepfake risks.",
        ],
      },
      {
        heading: "APIs, latency, and the click-to-generate contract",
        paragraphs: [
          "Commercial APIs such as OpenAI’s tts-1 or ElevenLabs Flash turn the research stack into a metered HTTP request. You send text and a voice id; you receive audio bytes. Latency is typically under a couple of seconds for short inputs, which is acceptable after a button click but unacceptable if you try to pre-render audio for every crawl of a 50,000-page site. Search bots should receive rich text—definitions, IPA, syllable counts—without ever triggering synthesis.",
          "That is why Speakur’s architecture checks object storage first. If an MP3 already exists for a slug and voice, the API returns a permanent public URL at essentially zero marginal cost. Only a missing cache entry after a user-initiated POST leads to a paid generation. Crawlers that merely GET HTML never open that path. The result is a site that can scale editorial and programmatic pages while keeping audio spend proportional to engaged humans.",
          "Open-source models hosted on Modal or Replicate can drive costs even lower for bulk pronunciation. The trade-off is operational complexity: cold starts, GPUs, and quality variance. Many teams start with a low-cost commercial TTS for reliability, then move high-volume words to self-hosted models once they know which entries earn traffic. Either way, permanent caching in Cloudflare R2—or an equivalent zero-egress store—remains the non-negotiable cost shield.",
        ],
      },
      {
        heading: "What learners and marketers should listen for",
        paragraphs: [
          "Good synthesis is not only about pleasant timbre. Listen for correct primary stress, clear consonants in clusters, and consistent vowel quality across accents. A US voice that says “schedule” with a soft “sh” and a UK voice that uses a hard “sk” are both “correct” within their dialects; labeling the accent is part of honest UX. Speakur surfaces IPA and free dictionary clips alongside studio generation so users can cross-check.",
          "For global marketing teams, synthesis quality becomes a brand decision. A mismatched accent can undermine trust in a local market even if the translation is perfect. Pair pronunciation tools with localization playbooks: decide which accent represents your brand, keep a glossary of product names with approved IPA, and cache approved audio so every landing page and ad uses the same clip.",
          "AI speech synthesis will keep improving, but the product lesson is already clear. Publish text that search engines can read. Generate audio thoughtfully. Cache forever. That combination lets a pronunciation platform stay useful for people and compliant for indexing without turning every bot hit into an invoice.",
        ],
      },
    ],
  },
  {
    slug: "linguistic-accents-in-global-marketing",
    title: "Linguistic Accents in Global Marketing",
    description:
      "How accent choice shapes brand trust, conversion, and localization strategy across English-speaking and multilingual markets.",
    publishedAt: "2026-03-04",
    readingMinutes: 10,
    sections: [
      {
        heading: "Accent is a brand signal, not a detail",
        paragraphs: [
          "When customers hear your product name, campaign tagline, or explainer video, they do not merely decode meaning—they infer origin, professionalism, and belonging. Accent is one of the fastest social cues humans process. A fintech startup narrating ads in a carefully neutral General American accent may feel “global tech,” while the same script in Received Pronunciation may feel “heritage luxury,” and a clearly regional voice may feel “local and authentic.” None of these outcomes is automatically better; they are strategic choices.",
          "Global marketing teams often obsess over translation accuracy and forget pronunciation. Yet a correctly translated slogan delivered with the wrong stress pattern can sound foreign or comic. Product names invented in one language may violate phonotactic patterns in another, forcing awkward approximations. Documenting approved pronunciations—and making them easy to hear—reduces chaos across agencies, freelancers, and AI voiceovers.",
          "Speakur’s mission overlaps this need: give creators a fast way to hear how a word is said, compare accents where available, and keep a stable audio artifact once the team agrees. That stability matters as much for internal enablement as for public SEO pages.",
        ],
      },
      {
        heading: "US, UK, and “international” English in campaigns",
        paragraphs: [
          "English-language campaigns frequently choose between US and UK voice talent even when the audience is neither. International schools, aviation, and some corporate training contexts prefer a mid-Atlantic or intentionally clear “international English.” Consumer brands selling into the United States usually default to US pronunciation for words like “herb,” “vitamin,” and “advertisement,” while UK and Commonwealth markets expect different norms.",
          "Inconsistency is costly. If your YouTube channel uses a UK narrator, your TikTok ads use a US TTS voice, and your sales deck has a third variant invented by an intern, brand memory fragments. Create a pronunciation style guide: list hero product terms, preferred IPA, preferred accent for each market, and a link to the canonical audio file. Store that file in durable object storage so every vendor pulls the same MP3.",
          "Multilingual campaigns multiply the problem. Spanish has major regional variation; Portuguese differs sharply between Brazil and Portugal; Arabic dialect choice can be politically sensitive. Even if Speakur begins with English pronunciation search, the same editorial discipline—text first, on-demand audio, permanent cache—transfers to other languages as you expand.",
        ],
      },
      {
        heading: "Localization without caricature",
        paragraphs: [
          "Marketers sometimes overcorrect by hiring exaggerated dialect performances that stereotype a region. Audiences notice. Prefer natural, contemporary speech from the target market, and validate with native reviewers—not only bilingual headquarters staff. For AI voices, sample multiple speakers and run a small listening test with target customers before locking a voice id into production.",
          "Legal and platform policies also matter. Voice cloning of celebrities or employees without consent can create liability. Disclose synthetic voice where required by local advertising rules. Keep human review in the loop for high-spend campaigns even when TTS drafts are cheap.",
          "Finally, pair accent strategy with subtitle and caption strategy. Many users watch muted. On-screen text should match the spoken accent’s spelling conventions where relevant (organise vs organize) so the experience feels coherent. Pronunciation pages that show IPA help translators and captioners align on how names should be said when audio is later dubbed.",
        ],
      },
      {
        heading: "Operational checklist for marketing teams",
        paragraphs: [
          "Start by inventorying every coined term, founder name, and feature name that appears in audio. Look each up, record preferred pronunciation, and store cached audio. Train customer support and sales on the same list. When you launch in a new English-speaking market, revisit the list rather than assuming US defaults travel.",
          "Measure qualitative feedback: comments that mock pronunciation are a ranking signal of sorts for brand health. A/B tests can compare accents on conversion, but keep creative quality constant so you isolate the voice variable. Over time, your glossary becomes a compounding asset—exactly the kind of durable content Google’s reviewers also like to see alongside thin programmatic templates.",
          "Accents will not replace product-market fit, but they can amplify or undermine trust at the exact moment a prospect leans in. Treat pronunciation as part of brand design, not as an afterthought left to whichever TTS voice an editor clicked first.",
        ],
      },
    ],
  },
  {
    slug: "guide-to-audio-localization",
    title: "A Practical Guide to Audio Localization",
    description:
      "How to plan, budget, and ship dubbed and voiced content across languages without destroying margins or quality.",
    publishedAt: "2026-03-08",
    readingMinutes: 11,
    sections: [
      {
        heading: "What audio localization actually includes",
        paragraphs: [
          "Audio localization is more than translating a script. It includes transcription of the source, cultural adaptation of jokes and idioms, timing to picture for video, voice casting or synthesis, mixing to match loudness standards, and quality assurance by native speakers. Subtitles and closed captions often ship in parallel, but they are not substitutes for dubbed audio when the audience expects to listen.",
          "Teams usually choose among three delivery modes. Subtitles keep original audio and overlay text—fast and cheap. Voice-over narration can sit above lowered original audio—common in documentaries. Full dubbing replaces the original performance—highest immersion and highest cost. AI tooling compresses each mode, but human review remains essential for brand-sensitive launches.",
          "A pronunciation-aware workflow helps at every stage. Before translating, lock how proper nouns and product terms should sound in the target language. Publish those references so freelancers and models do not invent conflicting versions across episodes.",
        ],
      },
      {
        heading: "A pipeline that protects margin",
        paragraphs: [
          "A resilient pipeline looks like this: extract or upload audio, transcribe with a speech-to-text model, translate with a specialist engine or LLM plus human edit, synthesize or record target audio, align timing, then export MP3/MP4 plus SRT. Critically, do not regenerate TTS for every preview. Cache intermediate artifacts, especially final audio, in object storage with zero egress fees when possible.",
          "Budget with unit economics. If synthesis costs fractions of a cent per word but you regenerate on every page view, costs scale with bots and curiosity clicks. If you generate once per approved script version and reuse the file, costs scale with creative output—the thing you already pay editors for. Speakur’s click-gated synthesis pattern for dictionary audio is the same idea applied to short utterances.",
          "Choose models by job. Short pronunciations can use inexpensive TTS. Emotional long-form ads may justify premium voices. Never pre-generate tens of thousands of speculative files “just in case.” Generate when a human (or a scheduled publish job for a known episode) needs the asset.",
        ],
      },
      {
        heading: "Quality assurance that catches real failures",
        paragraphs: [
          "Automated checks catch clipping, silence, and language mismatch. Humans catch wrong formality, accidental taboo words, and mispronounced brands. Build a QA checklist: verify numbers and units, confirm names against the pronunciation glossary, listen at 1.5x for pacing issues, and compare loudness to your platform targets.",
          "For video, watch with eyes away from the script. Lip-sync will rarely be perfect with AI dubbing; decide whether your market tolerates approximate sync or needs timed re-edits. Educational content often prioritizes clarity over perfect mouth match. Drama and comedy are less forgiving.",
          "Version everything. When legal changes a line, bump the script version and regenerate only the affected segment if your tooling allows. Store the script hash beside the audio object key so you can detect stale media.",
        ],
      },
      {
        heading: "People, process, and platforms",
        paragraphs: [
          "Even AI-heavy teams need clear ownership: a localization lead, a glossary owner, and market reviewers. Agencies should receive the glossary and cached reference audio on day one. Internal creators should have a self-serve pronunciation search so they stop pinging linguists for every surname.",
          "Platform choice depends on volume. A startup might stitch Whisper, DeepL or GPT, and OpenAI TTS behind a simple web app. An enterprise might add translation memory, TMS integrations, and vendor portals. Either way, publish educational material on your own site—guides like this one—so partners understand your standards and so search engines see substantial helpful content beyond database templates.",
          "Audio localization is a craft being accelerated by models, not replaced by them. The winners will be teams who invent less process debt, cache aggressively, and treat pronunciation as a first-class localization artifact.",
        ],
      },
    ],
  },
];
