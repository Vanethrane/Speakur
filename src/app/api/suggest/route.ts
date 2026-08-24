import { NextRequest, NextResponse } from "next/server";
import { suggestWords } from "@/lib/pronounce";

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q")?.trim() ?? "";
  if (q.length < 1) {
    return NextResponse.json([]);
  }
  const suggestions = await suggestWords(q);
  return NextResponse.json(suggestions);
}
