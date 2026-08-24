/**
 * Static file server with on-demand word page generation.
 * Missing /{category}/{word}/ routes are built via add-word, then served.
 *
 * Usage: node scripts/serve.mjs [port]
 */
import http from "http";
import { readFileSync, existsSync, statSync } from "fs";
import { join, extname, normalize } from "path";
import { addWord } from "./add-word.mjs";

const ROOT = process.cwd();
const PORT = Number(process.argv[2] || 4173);
const CATEGORIES = new Set([
  "medical",
  "food",
  "everyday",
  "science",
  "business",
  "places",
  "names",
  "brands",
  "animals",
  "arts",
  "sports",
  "tech",
  "nature",
  "law",
  "mythology",
]);

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".xml": "application/xml; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".ico": "image/x-icon",
  ".woff2": "font/woff2",
};

function send(res, status, body, type = "text/plain; charset=utf-8") {
  res.writeHead(status, {
    "Content-Type": type,
    "Cache-Control": "no-store",
  });
  res.end(body);
}

function safePath(urlPath) {
  const decoded = decodeURIComponent(urlPath.split("?")[0]);
  const cleaned = normalize(decoded).replace(/^(\.\.[/\\])+/, "");
  const full = join(ROOT, cleaned);
  if (!full.startsWith(ROOT)) return null;
  return full;
}

function resolveFile(urlPath) {
  let path = urlPath.split("?")[0];
  if (path.endsWith("/")) path += "index.html";
  else if (!extname(path)) {
    const asDir = safePath(path + "/index.html");
    if (asDir && existsSync(asDir)) return asDir;
    const asHtml = safePath(path + ".html");
    if (asHtml && existsSync(asHtml)) return asHtml;
  }
  return safePath(path);
}

async function readJson(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  if (!chunks.length) return {};
  return JSON.parse(Buffer.concat(chunks).toString("utf8"));
}

async function handleAdd(req, res) {
  try {
    const body = req.method === "POST" ? await readJson(req) : {};
    const url = new URL(req.url, `http://127.0.0.1:${PORT}`);
    const word = body.word || url.searchParams.get("word");
    const category = body.category || url.searchParams.get("category") || undefined;
    const result = await addWord(word, category);
    send(res, result.ok ? 200 : 400, JSON.stringify(result), "application/json; charset=utf-8");
  } catch (err) {
    send(
      res,
      500,
      JSON.stringify({
        ok: false,
        error: "server",
        message: err.message || "Could not add word.",
      }),
      "application/json; charset=utf-8",
    );
  }
}

async function maybeGenerateWord(pathname) {
  const m = pathname.match(
    /^\/(medical|food|everyday|science|business|places|names|brands|animals|arts|sports|tech|nature|law|mythology)\/([a-z][a-z'-]*)\/?$/i,
  );
  if (!m) return null;
  const category = m[1].toLowerCase();
  const word = m[2].toLowerCase();
  const page = join(ROOT, category, word, "index.html");
  if (existsSync(page)) return page;
  const result = await addWord(word, category);
  if (result.ok && existsSync(join(ROOT, result.category, word, "index.html"))) {
    return join(ROOT, result.category, word, "index.html");
  }
  return { error: result };
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url || "/", `http://127.0.0.1:${PORT}`);
  const pathname = url.pathname;

  if (pathname === "/__speakur/add-word" || pathname === "/__speakur/add-word/") {
    if (req.method === "OPTIONS") {
      res.writeHead(204, {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      });
      return res.end();
    }
    return handleAdd(req, res);
  }

  if (req.method !== "GET" && req.method !== "HEAD") {
    return send(res, 405, "Method not allowed");
  }

  // On-demand static generation for missing word URLs
  if (CATEGORIES.has(pathname.split("/")[1])) {
    const generated = await maybeGenerateWord(pathname);
    if (generated && generated.error) {
      const msg = generated.error.message || "Could not build that word page.";
      return send(res, 404, msg);
    }
    if (typeof generated === "string" && existsSync(generated)) {
      const html = readFileSync(generated);
      return send(res, 200, html, MIME[".html"]);
    }
  }

  let file = resolveFile(pathname);
  if ((!file || !existsSync(file)) && pathname === "/") {
    file = join(ROOT, "index.html");
  }
  if (!file || !existsSync(file) || !statSync(file).isFile()) {
    const fallback = join(ROOT, "404.html");
    if (existsSync(fallback)) {
      return send(res, 404, readFileSync(fallback), MIME[".html"]);
    }
    return send(res, 404, "Not found");
  }

  const type = MIME[extname(file).toLowerCase()] || "application/octet-stream";
  send(res, 200, readFileSync(file), type);
});

server.listen(PORT, () => {
  console.log(`Speakur static server at http://127.0.0.1:${PORT}`);
  console.log("Missing word URLs are generated on demand into the repo.");
});
