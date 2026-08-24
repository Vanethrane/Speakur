import { NextRequest, NextResponse } from "next/server";
import { getCachedAudioUrl, saveAudio } from "@/lib/audio-cache";
import { normalizeVoice, synthesizeMp3 } from "@/lib/tts";

function slugify(text: string): string {
  return text
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9'-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

/**
 * On-demand TTS with permanent cache.
 * MUST be POST — crawlers that only GET never trigger synthesis.
 * Default provider is free Google TTS (no API key).
 */
export async function POST(request: NextRequest) {
  let body: { text?: string; slug?: string; voice?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const text = body.text?.trim() ?? "";
  if (!text || text.length > 200) {
    return NextResponse.json(
      { error: "text is required and must be ≤ 200 characters" },
      { status: 400 },
    );
  }

  const voice = normalizeVoice(body.voice);
  const slug = slugify(body.slug || text);
  if (!slug) {
    return NextResponse.json({ error: "Invalid slug" }, { status: 400 });
  }

  // 1. Cache hit → $0
  const cached = await getCachedAudioUrl(slug, voice);
  if (cached) {
    return NextResponse.json({ audioUrl: cached, cached: true, provider: "cache" });
  }

  // 2. Generate only after a real user click (POST)
  try {
    const { buffer, provider } = await synthesizeMp3(text, voice);
    const audioUrl = await saveAudio(slug, voice, buffer);
    return NextResponse.json({ audioUrl, cached: false, provider });
  } catch (error) {
    console.error("synthesize failed", error);
    // Client should fall back to browser SpeechSynthesis ($0)
    return NextResponse.json(
      {
        error: "Synthesis failed",
        fallback: "browser",
        message: "Use browser speech synthesis as a free fallback.",
      },
      { status: 503 },
    );
  }
}

/** GET intentionally does not synthesize — bots never mint audio. */
export async function GET() {
  return NextResponse.json(
    {
      error: "Method not allowed",
      hint: "Audio is generated only on user click via POST.",
    },
    { status: 405 },
  );
}
