import { mkdir, readFile, writeFile, access } from "fs/promises";
import path from "path";
import { r2Head, r2Put, isR2Configured } from "./r2";

const LOCAL_AUDIO_DIR = path.join(process.cwd(), ".cache", "audio");

function audioKey(slug: string, voice: string): string {
  return `pronounce/${slug}/${voice}.mp3`;
}

function flatKey(key: string): string {
  return key.replace(/\//g, "_");
}

async function localFilePath(key: string): Promise<string> {
  return path.join(LOCAL_AUDIO_DIR, flatKey(key));
}

export async function getCachedAudioUrl(
  slug: string,
  voice: string,
): Promise<string | null> {
  const key = audioKey(slug, voice);

  if (isR2Configured()) {
    const remote = await r2Head(key);
    if (remote) return remote;
  }

  try {
    const filePath = await localFilePath(key);
    await access(filePath);
    return `/api/audio/${encodeURIComponent(flatKey(key))}`;
  } catch {
    return null;
  }
}

export async function saveAudio(
  slug: string,
  voice: string,
  buffer: Buffer,
): Promise<string> {
  const key = audioKey(slug, voice);

  if (isR2Configured()) {
    const remote = await r2Put(key, buffer);
    if (remote) return remote;
  }

  await mkdir(LOCAL_AUDIO_DIR, { recursive: true });
  const filePath = await localFilePath(key);
  await writeFile(filePath, buffer);
  return `/api/audio/${encodeURIComponent(flatKey(key))}`;
}

export async function readLocalAudio(flat: string): Promise<Buffer | null> {
  try {
    const safe = flat.replace(/[^a-zA-Z0-9._-]/g, "");
    if (!safe.startsWith("pronounce_") || !safe.endsWith(".mp3")) {
      return null;
    }
    return await readFile(path.join(LOCAL_AUDIO_DIR, safe));
  } catch {
    return null;
  }
}
