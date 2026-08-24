/**
 * Client-side on-demand word lookup + optional local server static add.
 * Used by homepage, /build/, and smart 404.
 */
(function (global) {
  const CATEGORIES = [
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
  ];

  const TITLES = {
    medical: "Medical",
    food: "Food & drink",
    everyday: "Everyday English",
    science: "Science",
    business: "Business",
    places: "Places",
    names: "Names",
    brands: "Brands",
    animals: "Animals",
    arts: "Arts & culture",
    sports: "Sports",
    tech: "Tech",
    nature: "Nature",
    law: "Law",
    mythology: "Mythology",
  };

  function escapeHtml(s) {
    return String(s || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function accentFromAudio(audio) {
    const lower = (audio || "").toLowerCase();
    if (lower.includes("-us") || lower.includes("_us") || lower.includes("/us/")) return "us";
    if (lower.includes("-uk") || lower.includes("_uk") || lower.includes("/uk/")) return "uk";
    return "other";
  }

  function guessCategory(word) {
    const w = String(word || "").toLowerCase();
    if (/osis$|itis$|ectomy$|ology$|emia$|pathy$|phobia$|therapy$|clinic|patient|surgery|vaccine|symptom/.test(w))
      return "medical";
    if (/berry$|latte|espresso|sauce|cheese|bread|wine|spice|fruit|meat|soup|cake|tea$|coffee/.test(w))
      return "food";
    if (/ology$|metry$|scopy$|particle|atom|cell|gene|quantum|species|planet|chemical/.test(w))
      return "science";
    if (/market|finance|equity|revenue|vendor|client|strategy|portfolio|synergy|analytic/.test(w))
      return "business";
    return "everyday";
  }

  function normalizeWord(raw) {
    return String(raw || "")
      .trim()
      .toLowerCase()
      .replace(/[^a-z'-]/g, "");
  }

  async function lookupDictionary(word) {
    try {
      const res = await fetch(
        `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`,
      );
      if (res.status === 404) {
        return {
          ok: false,
          reason: "not_found",
          message: `“${word}” isn’t in the dictionary. Check the spelling and try again.`,
        };
      }
      if (!res.ok) {
        return {
          ok: false,
          reason: "upstream",
          message: "The pronunciation dictionary is temporarily unavailable. Try again in a moment.",
        };
      }
      const entries = await res.json();
      return { ok: true, entry: entries[0] || null };
    } catch (_) {
      return {
        ok: false,
        reason: "upstream",
        message: "The pronunciation dictionary is temporarily unavailable. Try again in a moment.",
      };
    }
  }

  async function syllableCount(word) {
    try {
      const res = await fetch(
        `https://api.datamuse.com/words?sp=${encodeURIComponent(word)}&qe=sp&md=s&max=1`,
      );
      if (!res.ok) return null;
      const data = await res.json();
      return data[0]?.numSyllables ?? null;
    } catch (_) {
      return null;
    }
  }

  /** Ask local Speakur server to write a static page (no-op on GitHub Pages). */
  async function tryServerAdd(word, category) {
    try {
      const res = await fetch("/__speakur/add-word", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ word, category }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        return { ok: false, ...(data || {}) };
      }
      return await res.json();
    } catch (_) {
      return { ok: false, error: "no_server" };
    }
  }

  function pathInIndex(word) {
    const key = word.toLowerCase();
    const aliases = { apendectomy: "appendectomy" };
    const resolved = aliases[key] || key;
    const hit = (global.SPEAKUR_WORD_INDEX || []).find((row) => row.word === resolved);
    return hit || null;
  }

  function assetPrefixFromDepth(depth) {
    return "../".repeat(depth);
  }

  function renderWordArticle(target, { word, category, entry, syllables, depth }) {
    const phonetic =
      entry?.phonetic ||
      (entry?.phonetics || []).find((p) => p.text)?.text ||
      "";
    const phonetics = (entry?.phonetics || [])
      .map((p) => ({
        accent: p.audio ? accentFromAudio(p.audio) : "other",
        text: p.text || null,
        audio: p.audio || null,
      }))
      .filter((p) => p.text || p.audio);
    const usAudio = phonetics.find((p) => p.accent === "us" && p.audio)?.audio || "";
    const ukAudio = phonetics.find((p) => p.accent === "uk" && p.audio)?.audio || "";
    const anyAudio = usAudio || ukAudio || phonetics.find((p) => p.audio)?.audio || "";
    const ipaList = [...new Set(phonetics.map((p) => p.text).filter(Boolean))];
    const meanings = [];
    for (const meaning of entry?.meanings || []) {
      for (const def of meaning.definitions || []) {
        if (!def.definition) continue;
        meanings.push({
          pos: meaning.partOfSpeech || "unknown",
          def: def.definition,
          ex: def.example || null,
        });
        if (meanings.length >= 5) break;
      }
      if (meanings.length >= 5) break;
    }

    const title = TITLES[category] || category;
    const root = assetPrefixFromDepth(depth);
    const meaningsHtml = meanings.length
      ? `<section class="meanings"><h2>Meaning</h2>${meanings
          .map(
            (m) => `<div class="sense"><p class="pos">${escapeHtml(m.pos)}</p><p class="def">${escapeHtml(m.def)}</p>${
              m.ex ? `<p class="ex">“${escapeHtml(m.ex)}”</p>` : ""
            }</div>`,
          )
          .join("")}</section>`
      : `<section class="meanings"><p class="note">No short definition was returned for this entry. You can still play the pronunciation.</p></section>`;

    target.innerHTML = `
      <nav class="crumbs" aria-label="Breadcrumb">
        <a class="crumb-home" href="${root}index.html">Home</a>
        <span>/</span>
        <a href="${root}words/">Words</a>
        <span>/</span>
        <a href="${root}${escapeHtml(category)}/">${escapeHtml(title)}</a>
        <span>/</span>
        <span>${escapeHtml(word)}</span>
      </nav>
      <p class="eyebrow">${escapeHtml(title)} pronunciation</p>
      <article class="word-card" data-word="${escapeHtml(word)}">
        <div class="word-head">
          <div>
            <h1>${escapeHtml(word)}</h1>
            <p class="ipa">${escapeHtml(phonetic || "Phonetic spelling unavailable")}</p>
          </div>
          <button type="button" class="play btn-voice" data-play data-audio="${escapeHtml(anyAudio)}" data-lang="en-US">
            <span class="icon">▶</span> Play
          </button>
        </div>
        <dl class="meta">
          ${syllables ? `<div><dt>Syllables</dt><dd>${syllables}</dd></div>` : ""}
          ${ipaList.length ? `<div><dt>IPA</dt><dd>${escapeHtml(ipaList.join(" · "))}</dd></div>` : ""}
          <div><dt>Path</dt><dd>/${escapeHtml(category)}/${escapeHtml(word)}/</dd></div>
        </dl>
        <div class="plays">
          <button type="button" class="play btn-voice" data-play data-audio="${escapeHtml(usAudio)}" data-lang="en-US"><span class="icon">▶</span> US (free)</button>
          <button type="button" class="play btn-voice" data-play data-audio="${escapeHtml(ukAudio)}" data-lang="en-GB"><span class="icon">▶</span> UK (free)</button>
          <button type="button" class="play btn-voice" data-play data-audio="${escapeHtml(anyAudio)}" data-lang="en-US" data-rate="0.72"><span class="icon">▶</span> Slow</button>
        </div>
        <p class="note" id="build-note">Dedicated page path: <strong>/${escapeHtml(category)}/${escapeHtml(word)}/</strong></p>
        ${meaningsHtml}
      </article>
    `;

    // Bind play without requiring word-play.js if already loaded
    if (!global.__speakurPlayBound) {
      target.querySelectorAll("[data-play]").forEach((btn) => {
        btn.addEventListener("click", async () => {
          const w =
            btn.closest("[data-word]")?.getAttribute("data-word") ||
            word;
          const audioUrl = btn.getAttribute("data-audio") || "";
          const lang = btn.getAttribute("data-lang") || "en-US";
          const rate = Number(btn.getAttribute("data-rate") || "1");
          if (audioUrl) {
            try {
              const audio = new Audio(audioUrl);
              audio.playbackRate = rate;
              await audio.play();
              return;
            } catch (_) {
              /* fall through */
            }
          }
          if (!global.speechSynthesis) return;
          global.speechSynthesis.cancel();
          const u = new SpeechSynthesisUtterance(w);
          u.lang = lang;
          u.rate = rate;
          global.speechSynthesis.speak(u);
        });
      });
    }
  }

  /**
   * Full flow: existing page → redirect; else try server add → redirect;
   * else dictionary lookup → render in place.
   */
  async function resolveAndShow(options) {
    const {
      rawWord,
      mount,
      statusEl,
      depth = 0,
      preferredCategory,
      onStatus,
    } = options;
    const word = normalizeWord(rawWord);
    const setStatus = (msg) => {
      if (statusEl) statusEl.textContent = msg || "";
      if (onStatus) onStatus(msg || "");
    };

    if (!word) {
      setStatus("Type a word to look up.");
      return { ok: false, reason: "empty" };
    }

    const indexed = pathInIndex(word);
    if (indexed) {
      setStatus(`Opening /${indexed.category}/${indexed.word}/…`);
      const prefix = assetPrefixFromDepth(depth);
      location.href = `${prefix}${indexed.category}/${indexed.word}/`;
      return { ok: true, redirected: true, path: indexed.path };
    }

    const category = preferredCategory || guessCategory(word);
    setStatus(`Building a page for “${word}”…`);

    const server = await tryServerAdd(word, category);
    if (server.ok && server.path) {
      setStatus(`Created ${server.path}`);
      const prefix = assetPrefixFromDepth(depth);
      location.href = `${prefix}${server.category}/${word}/`;
      return { ok: true, created: true, path: server.path, redirected: true };
    }

    if (server.error === "not_found" || server.message?.includes("isn’t in the free dictionary")) {
      setStatus(
        server.message ||
          `“${word}” isn’t in the dictionary. Check the spelling and try again.`,
      );
      return { ok: false, reason: "not_found" };
    }

    const looked = await lookupDictionary(word);
    if (!looked.ok) {
      setStatus(looked.message);
      return looked;
    }

    const syllables = await syllableCount(word);
    if (mount) {
      renderWordArticle(mount, {
        word,
        category,
        entry: looked.entry,
        syllables,
        depth,
      });
      const note = mount.querySelector("#build-note");
      if (note) {
        note.innerHTML = `Here’s your answer for <strong>/${escapeHtml(category)}/${escapeHtml(word)}/</strong>. This word wasn’t in the published directory yet, so we built this pronunciation on the spot.`;
      }
    }

    setStatus(`Here’s how to pronounce “${word}”.`);
    return { ok: true, created: false, preview: true, category, word };
  }

  global.SpeakurOnDemand = {
    CATEGORIES,
    TITLES,
    normalizeWord,
    guessCategory,
    lookupDictionary,
    syllableCount,
    tryServerAdd,
    pathInIndex,
    renderWordArticle,
    resolveAndShow,
  };
})(window);
