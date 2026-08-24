export type FreeVoiceId = "us" | "uk";

const VOICE_LOCALE: Record<FreeVoiceId, string> = {
  us: "en-US",
  uk: "en-GB",
};

export function normalizeVoice(voice?: string): FreeVoiceId {
  if (voice === "uk" || voice === "en-GB" || voice === "en-gb") return "uk";
  return "us";
}

export function isPaidTtsConfigured(): boolean {
  return Boolean(process.env.OPENAI_API_KEY);
}

/**
 * Free TTS via Google Translate's public TTS endpoint (no API key).
 * Results should be cached forever after first user click.
 */
export async function synthesizeFreeMp3(
  text: string,
  voice: FreeVoiceId = "us",
): Promise<Buffer> {
  const tl = VOICE_LOCALE[voice];
  const url =
    "https://translate.google.com/translate_tts?" +
    new URLSearchParams({
      ie: "UTF-8",
      client: "tw-ob",
      tl,
      q: text.slice(0, 200),
    }).toString();

  const response = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
      Accept: "*/*",
      Referer: "https://translate.google.com/",
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Free TTS failed: ${response.status}`);
  }

  const contentType = response.headers.get("content-type") ?? "";
  if (contentType.includes("text/html")) {
    throw new Error("Free TTS returned HTML instead of audio");
  }

  return Buffer.from(await response.arrayBuffer());
}

/** Optional paid upgrade when OPENAI_API_KEY is set. */
export async function synthesizeOpenAiMp3(
  text: string,
  voice = "alloy",
): Promise<Buffer> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is not set");
  }

  const response = await fetch("https://api.openai.com/v1/audio/speech", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "tts-1",
      voice,
      input: text,
      response_format: "mp3",
    }),
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`OpenAI TTS failed: ${response.status} ${detail}`);
  }

  return Buffer.from(await response.arrayBuffer());
}

export async function synthesizeMp3(
  text: string,
  voice: string = "us",
): Promise<{ buffer: Buffer; provider: "free" | "openai" }> {
  if (isPaidTtsConfigured() && process.env.TTS_PROVIDER === "openai") {
    const buffer = await synthesizeOpenAiMp3(text, voice);
    return { buffer, provider: "openai" };
  }

  const freeVoice = normalizeVoice(voice);
  const buffer = await synthesizeFreeMp3(text, freeVoice);
  return { buffer, provider: "free" };
}
