import { NextRequest, NextResponse } from "next/server";
import { readLocalAudio } from "@/lib/audio-cache";

type RouteContext = {
  params: Promise<{ key: string }>;
};

/** Serves locally cached MP3s when R2 is not configured (dev / zero-infra fallback). */
export async function GET(_request: NextRequest, context: RouteContext) {
  const { key: raw } = await context.params;
  const key = decodeURIComponent(raw);
  const buffer = await readLocalAudio(key);

  if (!buffer) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "audio/mpeg",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
