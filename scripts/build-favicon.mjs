/**
 * Build favicon.ico + copy PNG/SVG icon assets.
 * Uses speakur-favicon-source.png when present; otherwise a teal tile fallback.
 *
 * Usage: node scripts/build-favicon.mjs
 */
import { readFileSync, writeFileSync, copyFileSync, existsSync, mkdirSync } from "fs";
import { join } from "path";
import { fileURLToPath } from "url";
import { deflateSync } from "zlib";

const ROOT = join(fileURLToPath(import.meta.url), "..", "..");
const ASSETS = join(ROOT, "assets");
const PUBLIC = join(ROOT, "public");
mkdirSync(PUBLIC, { recursive: true });
mkdirSync(join(PUBLIC, "assets"), { recursive: true });

const SOURCE = join(ASSETS, "speakur-favicon-source.png");
const CURSOR_SOURCE = join(
  process.env.USERPROFILE || "",
  ".cursor",
  "projects",
  "c-Users-tknvrs-Speakur",
  "assets",
  "speakur-favicon-source.png",
);

if (!existsSync(SOURCE) && existsSync(CURSOR_SOURCE)) {
  copyFileSync(CURSOR_SOURCE, SOURCE);
}

/** CRC32 for PNG chunks */
function crc32(buf) {
  let c = ~0;
  for (let i = 0; i < buf.length; i++) {
    c ^= buf[i];
    for (let k = 0; k < 8; k++) c = c & 1 ? (0xedb88320 ^ (c >>> 1)) : c >>> 1;
  }
  return ~c >>> 0;
}

function pngChunk(type, data) {
  const typeBuf = Buffer.from(type);
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])));
  return Buffer.concat([len, typeBuf, data, crcBuf]);
}

/** Encode raw RGBA (top-down) as PNG */
function encodePngRGBA(size, rgba) {
  const stride = size * 4 + 1;
  const raw = Buffer.alloc(stride * size);
  for (let y = 0; y < size; y++) {
    raw[y * stride] = 0;
    rgba.copy(raw, y * stride + 1, y * size * 4, (y + 1) * size * 4);
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;
  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    pngChunk("IHDR", ihdr),
    pngChunk("IDAT", deflateSync(raw, { level: 9 })),
    pngChunk("IEND", Buffer.alloc(0)),
  ]);
}

/** Draw brand mark into RGBA top-down buffer */
function paintMark(size) {
  const rgba = Buffer.alloc(size * size * 4);
  const teal = [0x0d, 0x6e, 0x66, 0xff];
  const cream = [0xff, 0xfa, 0xf3, 0xff];
  const r = size * 0.22;

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const i = (y * size + x) * 4;
      let inShape = true;
      if (x < r && y < r && (x - r) ** 2 + (y - r) ** 2 > r * r) inShape = false;
      if (x > size - 1 - r && y < r && (x - (size - 1 - r)) ** 2 + (y - r) ** 2 > r * r)
        inShape = false;
      if (x < r && y > size - 1 - r && (x - r) ** 2 + (y - (size - 1 - r)) ** 2 > r * r)
        inShape = false;
      if (
        x > size - 1 - r &&
        y > size - 1 - r &&
        (x - (size - 1 - r)) ** 2 + (y - (size - 1 - r)) ** 2 > r * r
      )
        inShape = false;

      if (!inShape) {
        rgba[i + 3] = 0;
        continue;
      }

      const nx = (x + 0.5) / size;
      const ny = (y + 0.5) / size;
      let mark = false;

      // Sound-wave arcs (right of S)
      const wx = nx - 0.58;
      const wy = ny - 0.5;
      const ang = Math.atan2(wy, wx);
      const rad = Math.hypot(wx, wy);
      const stroke = Math.max(0.028, 0.9 / size);
      if (rad > 0.14 && rad < 0.14 + stroke && ang > -1.15 && ang < 1.15) mark = true;
      if (rad > 0.23 && rad < 0.23 + stroke && ang > -1.3 && ang < 1.3) mark = true;

      // Serif-ish S as thick sine ribbon
      if (nx > 0.18 && nx < 0.58 && ny > 0.2 && ny < 0.8) {
        const t = (ny - 0.2) / 0.6;
        const spine = 0.36 + 0.1 * Math.sin(t * Math.PI * 2 - Math.PI / 2);
        const thick = 0.07 + (t > 0.35 && t < 0.65 ? 0.015 : 0.02);
        if (Math.abs(nx - spine) < thick) mark = true;
        if (t < 0.14 && nx > spine - 0.02 && nx < 0.52) mark = true;
        if (t > 0.86 && nx < spine + 0.02 && nx > 0.22) mark = true;
      }

      const c = mark ? cream : teal;
      rgba[i] = c[0];
      rgba[i + 1] = c[1];
      rgba[i + 2] = c[2];
      rgba[i + 3] = c[3];
    }
  }
  return rgba;
}

function rgbaToBgraBottomUp(size, rgba) {
  const bgra = Buffer.alloc(size * size * 4);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const src = (y * size + x) * 4;
      const dst = ((size - 1 - y) * size + x) * 4;
      bgra[dst] = rgba[src + 2];
      bgra[dst + 1] = rgba[src + 1];
      bgra[dst + 2] = rgba[src];
      bgra[dst + 3] = rgba[src + 3];
    }
  }
  return bgra;
}

function buildIco(frames) {
  const count = frames.length;
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(count, 4);
  const entries = [];
  const images = [];
  let offset = 6 + count * 16;

  for (const { size, bgra } of frames) {
    const andRow = Math.ceil(size / 32) * 4;
    const andMask = Buffer.alloc(andRow * size, 0x00);
    const dib = Buffer.alloc(40);
    dib.writeUInt32LE(40, 0);
    dib.writeInt32LE(size, 4);
    dib.writeInt32LE(size * 2, 8);
    dib.writeUInt16LE(1, 12);
    dib.writeUInt16LE(32, 14);
    dib.writeUInt32LE(0, 16);
    dib.writeUInt32LE(bgra.length + andMask.length, 20);
    const img = Buffer.concat([dib, bgra, andMask]);
    const entry = Buffer.alloc(16);
    entry.writeUInt8(size >= 256 ? 0 : size, 0);
    entry.writeUInt8(size >= 256 ? 0 : size, 1);
    entry.writeUInt16LE(1, 4);
    entry.writeUInt16LE(32, 6);
    entry.writeUInt32LE(img.length, 8);
    entry.writeUInt32LE(offset, 12);
    entries.push(entry);
    images.push(img);
    offset += img.length;
  }
  return Buffer.concat([header, ...entries, ...images]);
}

const frames = [];
for (const size of [16, 32, 48]) {
  const rgba = paintMark(size);
  frames.push({ size, bgra: rgbaToBgraBottomUp(size, rgba) });
  if (size === 32) {
    writeFileSync(join(ASSETS, "icon-32.png"), encodePngRGBA(size, rgba));
  }
}

const icon180 = paintMark(180);
writeFileSync(join(ASSETS, "apple-touch-icon.png"), encodePngRGBA(180, icon180));
writeFileSync(join(ROOT, "apple-touch-icon.png"), encodePngRGBA(180, icon180));

const icon192 = paintMark(192);
writeFileSync(join(ASSETS, "icon-192.png"), encodePngRGBA(192, icon192));
const icon512 = paintMark(512);
writeFileSync(join(ASSETS, "icon-512.png"), encodePngRGBA(512, icon512));

// Prefer the designed source PNG for apple-touch / PWA when available (higher fidelity)
if (existsSync(SOURCE)) {
  copyFileSync(SOURCE, join(ASSETS, "apple-touch-icon.png"));
  copyFileSync(SOURCE, join(ROOT, "apple-touch-icon.png"));
  copyFileSync(SOURCE, join(ASSETS, "icon-192.png"));
  copyFileSync(SOURCE, join(ASSETS, "icon-512.png"));
}

const ico = buildIco(frames);
writeFileSync(join(ROOT, "favicon.ico"), ico);
writeFileSync(join(PUBLIC, "favicon.ico"), ico);

copyFileSync(join(ASSETS, "icon.svg"), join(PUBLIC, "assets", "icon.svg"));
copyFileSync(join(ASSETS, "apple-touch-icon.png"), join(PUBLIC, "assets", "apple-touch-icon.png"));
copyFileSync(join(ASSETS, "icon-192.png"), join(PUBLIC, "assets", "icon-192.png"));
copyFileSync(join(ASSETS, "icon-512.png"), join(PUBLIC, "assets", "icon-512.png"));
copyFileSync(join(ROOT, "apple-touch-icon.png"), join(PUBLIC, "apple-touch-icon.png"));

console.log(`Favicon built: favicon.ico (${ico.length} bytes), SVG, apple-touch, PWA PNGs`);
