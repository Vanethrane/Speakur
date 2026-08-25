import { formatShortLink, shareCardFilename, type SharePayload } from "@/lib/share-url";

const CARD_W = 1200;
const CARD_H = 630;

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function drawWaveform(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
) {
  const bars = 28;
  const gap = width / bars;
  ctx.fillStyle = "rgba(255, 250, 243, 0.85)";
  for (let i = 0; i < bars; i++) {
    const t = i / bars;
    const bh = height * (0.25 + 0.75 * Math.abs(Math.sin(t * Math.PI * 3.2 + 0.4)));
    const bx = x + i * gap + gap * 0.15;
    const by = y + (height - bh) / 2;
    roundRect(ctx, bx, by, gap * 0.7, bh, 4);
    ctx.fill();
  }
}

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let line = "";
  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line);
      line = word;
    } else {
      line = test;
    }
  }
  if (line) lines.push(line);
  return lines;
}

/** Client-side branded share card — 1200×630 PNG for forums & social. */
export async function renderShareCardPng(payload: SharePayload): Promise<Blob> {
  const canvas = document.createElement("canvas");
  canvas.width = CARD_W;
  canvas.height = CARD_H;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas not supported");

  const gradient = ctx.createLinearGradient(0, 0, CARD_W, CARD_H);
  gradient.addColorStop(0, "#0d6e66");
  gradient.addColorStop(1, "#0a524c");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, CARD_W, CARD_H);

  ctx.fillStyle = "rgba(232, 244, 242, 0.12)";
  roundRect(ctx, 48, 48, CARD_W - 96, CARD_H - 96, 32);
  ctx.fill();

  ctx.fillStyle = "#e8f4f2";
  ctx.font = "600 36px Georgia, 'Times New Roman', serif";
  ctx.fillText("Speakur", 96, 118);

  ctx.fillStyle = "rgba(232, 244, 242, 0.75)";
  ctx.font = "500 22px system-ui, sans-serif";
  ctx.fillText(
    payload.kind === "guide" ? "Pronunciation guide" : "Pronunciation result",
    96,
    152,
  );

  const title = payload.title.trim();
  ctx.fillStyle = "#fffaf3";
  let titleSize = payload.kind === "pronunciation" ? 96 : 64;
  ctx.font = `600 ${titleSize}px Georgia, 'Times New Roman', serif`;
  while (titleSize > 40 && ctx.measureText(title).width > CARD_W - 192) {
    titleSize -= 4;
    ctx.font = `600 ${titleSize}px Georgia, 'Times New Roman', serif`;
  }
  ctx.fillText(title, 96, 248);

  let y = 300;
  if (payload.phonetic) {
    ctx.fillStyle = "#b7d4cf";
    ctx.font = "400 44px Georgia, 'Times New Roman', serif";
    ctx.fillText(payload.phonetic, 96, y);
    y += 56;
  }

  if (payload.detail) {
    ctx.fillStyle = "rgba(255, 250, 243, 0.82)";
    ctx.font = "400 28px system-ui, sans-serif";
    const lines = wrapText(ctx, payload.detail, CARD_W - 192);
    for (const line of lines.slice(0, 2)) {
      ctx.fillText(line, 96, y);
      y += 36;
    }
  }

  if (payload.kind === "pronunciation" || payload.audioPreview) {
    const waveY = Math.max(y + 24, 360);
    drawWaveform(ctx, 96, waveY, 420, 72);
    ctx.fillStyle = "#fffaf3";
    ctx.font = "600 24px system-ui, sans-serif";
    const preview = payload.audioPreview || "▶  US & UK audio preview";
    ctx.fillText(preview, 540, waveY + 46);
  }

  const shortLink = formatShortLink(payload.path);
  ctx.fillStyle = "rgba(255, 250, 243, 0.95)";
  ctx.font = "600 26px system-ui, sans-serif";
  ctx.fillText(shortLink, 96, CARD_H - 72);

  ctx.fillStyle = "rgba(232, 244, 242, 0.65)";
  ctx.font = "400 20px system-ui, sans-serif";
  ctx.fillText("Free IPA · click-to-play audio", 96, CARD_H - 38);

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error("PNG export failed"));
      },
      "image/png",
      1,
    );
  });
}

export async function downloadShareCard(payload: SharePayload): Promise<void> {
  const blob = await renderShareCardPng(payload);
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = shareCardFilename(payload);
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}
