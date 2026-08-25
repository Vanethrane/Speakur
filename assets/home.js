(function () {
  const state = {
    word: "",
    phonetic: "",
    phonetics: [],
    active: 0,
    suggestions: [],
  };

  const $ = (sel) => document.querySelector(sel);
  const statusEl = $("#status");
  const suggestionsEl = $("#suggestions");
  const resultEl = $("#result");
  if (!statusEl || !suggestionsEl || !resultEl) return;

  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  function pathForWord(word) {
    const q = word.toLowerCase().trim();
    const aliases = { apendectomy: "appendectomy" };
    const key = aliases[q] || q;
    const hit = (window.SPEAKUR_WORD_INDEX || []).find((row) => row.word === key);
    return hit ? `.${hit.path}` : null;
  }

  function setStatus(msg) {
    statusEl.textContent = msg || "";
  }

  function accentFromAudio(audio) {
    const lower = (audio || "").toLowerCase();
    if (lower.includes("-us") || lower.includes("_us") || lower.includes("/us/")) return "us";
    if (lower.includes("-uk") || lower.includes("_uk") || lower.includes("/uk/")) return "uk";
    return "other";
  }

  function speak(word, lang = "en-US", rate = 1) {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(word);
    u.lang = lang;
    u.rate = rate;
    const voices = window.speechSynthesis.getVoices();
    const match = voices.find((v) =>
      v.lang.toLowerCase().startsWith(lang.toLowerCase().slice(0, 2)),
    );
    if (match) u.voice = match;
    window.speechSynthesis.speak(u);
  }

  async function playAudio(url, word, lang, rate = 1) {
    if (url) {
      try {
        const audio = new Audio(url);
        audio.playbackRate = rate;
        await audio.play();
        return;
      } catch (_) {
        /* fall through */
      }
    }
    speak(word, lang, rate);
  }

  function phoneticFor(accent) {
    return (
      state.phonetics.find((p) => p.accent === accent && p.audio) ||
      state.phonetics.find((p) => p.audio) ||
      null
    );
  }

  function bindPlays() {
    const playMain = $("#play-main");
    const playSlow = $("#play-slow");
    if (playMain) {
      playMain.onclick = () => {
        const p = phoneticFor("us") || phoneticFor("uk") || phoneticFor("other");
        playAudio(p?.audio, state.word, p?.accent === "uk" ? "en-GB" : "en-US");
      };
    }
    if (playSlow) {
      playSlow.onclick = () => {
        const p = phoneticFor("us") || phoneticFor("uk") || phoneticFor("other");
        playAudio(p?.audio, state.word, p?.accent === "uk" ? "en-GB" : "en-US", 0.72);
      };
    }
    document.querySelectorAll(".play[data-accent]").forEach((btn) => {
      btn.onclick = () => {
        const accent = btn.getAttribute("data-accent");
        const p = phoneticFor(accent);
        playAudio(p?.audio, state.word, accent === "uk" ? "en-GB" : "en-US");
      };
    });
  }

  function renderResult(entry, syllables) {
    state.word = entry.word;
    state.phonetic =
      entry.phonetic || (entry.phonetics || []).find((p) => p.text)?.text || "";
    state.phonetics = (entry.phonetics || [])
      .map((p) => ({
        accent: p.audio ? accentFromAudio(p.audio) : "other",
        text: p.text || null,
        audio: p.audio || null,
      }))
      .filter((p) => p.text || p.audio);

    $("#word-title").textContent = entry.word;
    $("#ipa").textContent = state.phonetic || "Phonetic spelling unavailable";

    const sylWrap = $("#syllables-wrap");
    if (syllables) {
      sylWrap.hidden = false;
      $("#syllables").textContent = syllables;
    } else {
      sylWrap.hidden = true;
    }

    const ipas = [...new Set(state.phonetics.map((p) => p.text).filter(Boolean))];
    const ipaMetaWrap = $("#ipa-meta-wrap");
    if (ipas.length) {
      ipaMetaWrap.hidden = false;
      $("#ipa-meta").textContent = ipas.join("  ·  ");
    } else {
      ipaMetaWrap.hidden = true;
    }

    const meanings = $("#meanings");
    meanings.innerHTML = "";
    const senses = [];
    for (const meaning of entry.meanings || []) {
      for (const def of meaning.definitions || []) {
        if (!def.definition) continue;
        senses.push({
          pos: meaning.partOfSpeech || "unknown",
          def: def.definition,
          ex: def.example || null,
        });
        if (senses.length >= 5) break;
      }
      if (senses.length >= 5) break;
    }
    if (senses.length) {
      const h2 = document.createElement("h2");
      h2.textContent = "Meaning";
      meanings.appendChild(h2);
      senses.forEach((s) => {
        const div = document.createElement("div");
        div.className = "sense";
        div.innerHTML = `<p class="pos">${s.pos}</p><p class="def">${s.def}</p>${
          s.ex ? `<p class="ex">“${s.ex}”</p>` : ""
        }`;
        meanings.appendChild(div);
      });
    }

    bindPlays();
    resultEl.classList.add("visible");
    resultEl.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }

  async function lookup(raw) {
    const word = (raw || "").trim().toLowerCase();
    if (!word) return;
    $("#q").value = word;
    suggestionsEl.style.display = "none";
    resultEl.classList.remove("visible");

    const dedicated = pathForWord(word);
    if (dedicated) {
      location.href = dedicated;
      return;
    }

    const category =
      (window.SpeakurOnDemand && SpeakurOnDemand.guessCategory(word)) || "everyday";
    setStatus(`Building a page for “${word}”…`);
    location.href = `./${category}/${encodeURIComponent(word)}/`;
  }

  // Expose for rare inline debug; keeps renderResult reachable if needed later
  window.SpeakurHome = { lookup, renderResult };

  let suggestTimer = null;
  $("#q").addEventListener("input", (e) => {
    const q = e.target.value.trim();
    clearTimeout(suggestTimer);
    if (q.length < 2) {
      suggestionsEl.style.display = "none";
      state.suggestions = [];
      return;
    }
    suggestTimer = setTimeout(async () => {
      try {
        const res = await fetch(
          `https://api.datamuse.com/sug?s=${encodeURIComponent(q)}&max=8`,
        );
        if (!res.ok) return;
        const data = await res.json();
        state.suggestions = data.filter((d) => /^[a-z][a-z'-]*$/i.test(d.word));
        state.active = 0;
        if (!state.suggestions.length) {
          suggestionsEl.style.display = "none";
          return;
        }
        suggestionsEl.innerHTML = state.suggestions
          .map(
            (s, i) =>
              `<li><button type="button" role="option" class="${
                i === 0 ? "active" : ""
              }" data-i="${i}"><span>${s.word}</span><span class="hint">pronounce</span></button></li>`,
          )
          .join("");
        suggestionsEl.style.display = "block";
        suggestionsEl.querySelectorAll("button").forEach((btn) => {
          btn.addEventListener("click", () =>
            lookup(state.suggestions[Number(btn.dataset.i)].word),
          );
        });
      } catch (_) {
        /* ignore */
      }
    }, 160);
  });

  $("#q").addEventListener("keydown", (e) => {
    if (!state.suggestions.length || suggestionsEl.style.display === "none") return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      state.active = (state.active + 1) % state.suggestions.length;
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      state.active =
        (state.active - 1 + state.suggestions.length) % state.suggestions.length;
    } else {
      return;
    }
    [...suggestionsEl.querySelectorAll("button")].forEach((btn, i) => {
      btn.classList.toggle("active", i === state.active);
    });
  });

  $("#search-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const chosen = state.suggestions[state.active]?.word || $("#q").value;
    lookup(chosen);
  });

  document.addEventListener("mousedown", (e) => {
    if (!e.target.closest(".search-wrap")) suggestionsEl.style.display = "none";
  });

  const params = new URLSearchParams(location.search);
  const initial = params.get("q");
  if (initial) lookup(initial);

  const homeGuides = document.getElementById("home-guides");
  if (homeGuides && window.SPEAKUR_GUIDES) {
    const latest = window.SPEAKUR_GUIDES.slice()
      .sort((a, b) => (a.publishedAt < b.publishedAt ? 1 : -1))
      .slice(0, 3);
    homeGuides.innerHTML = latest
      .map(
        (g) =>
          `<a class="chip" style="border-radius:0.85rem;display:block;width:100%;margin-bottom:0.5rem;text-align:left;" href="./guide.html?slug=${encodeURIComponent(
            g.slug,
          )}"><strong>${g.title}</strong><br/><span style="color:var(--ink-muted);font-size:0.85rem;">${g.description}</span></a>`,
      )
      .join("");
  }
})();
