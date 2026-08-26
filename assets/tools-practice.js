(function () {
  const play = window.SpeakurPlay;

  function speakPair(a, b) {
    if (!play?.playClip) return;
    return play
      .playClip({ word: a, lang: "en-US", rate: 1 })
      .then(() => new Promise((r) => setTimeout(r, 300)))
      .then(() => play.playClip({ word: b, lang: "en-US", rate: 1 }));
  }

  document.addEventListener("click", (e) => {
    const btn = e.target.closest && e.target.closest("[data-pair-compare]");
    if (!btn) return;
    e.preventDefault();
    const a = btn.getAttribute("data-a") || "";
    const b = btn.getAttribute("data-b") || "";
    if (!a || !b) return;
    btn.disabled = true;
    void speakPair(a, b).finally(() => {
      btn.disabled = false;
    });
  });

  const form = document.getElementById("us-uk-form");
  if (!form) return;

  const status = document.getElementById("us-uk-status");
  const result = document.getElementById("us-uk-result");
  const ipaEl = document.getElementById("us-uk-ipa");
  const pageLink = document.getElementById("us-uk-page-link");
  const playUs = document.getElementById("us-uk-play-us");
  const playUk = document.getElementById("us-uk-play-uk");
  const compare = document.getElementById("us-uk-compare");
  const slow = document.getElementById("us-uk-slow");

  function accentFromAudio(audio) {
    const lower = (audio || "").toLowerCase();
    if (lower.includes("-us") || lower.includes("_us") || lower.includes("/us/")) return "us";
    if (lower.includes("-uk") || lower.includes("_uk") || lower.includes("/uk/")) return "uk";
    return "other";
  }

  async function pathForWord(word) {
    const key = word.toLowerCase().trim();
    if (window.SpeakurWordLookup) {
      await SpeakurWordLookup.ensureLoaded();
      const hit = SpeakurWordLookup.find(key);
      if (hit && hit.path) {
        const m = hit.path.match(/^\/([^/]+)\/([^/]+)\/?$/);
        if (m) return `../../${m[1]}/${encodeURIComponent(m[2])}/`;
      }
    }
    const hit = (window.SPEAKUR_WORD_INDEX || []).find((row) => row.word === key);
    return hit ? `../../${hit.category}/${encodeURIComponent(hit.word)}/` : null;
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const raw = document.getElementById("us-uk-q")?.value || "";
    const word = raw.trim().toLowerCase();
    if (!word) return;

    status.textContent = `Looking up “${word}”…`;
    result.hidden = true;

    try {
      const res = await fetch(
        `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`,
      );
      if (!res.ok) {
        status.textContent = `No dictionary entry for “${word}”. Try the main search.`;
        return;
      }
      const entries = await res.json();
      const entry = entries[0];
      const phonetics = (entry.phonetics || [])
        .map((p) => ({
          accent: p.audio ? accentFromAudio(p.audio) : "other",
          text: p.text || "",
          audio: p.audio || "",
        }))
        .filter((p) => p.text || p.audio);

      const us = phonetics.find((p) => p.accent === "us" && p.audio)?.audio || "";
      const uk = phonetics.find((p) => p.accent === "uk" && p.audio)?.audio || "";
      const any = us || uk || phonetics.find((p) => p.audio)?.audio || "";
      const ipa =
        entry.phonetic ||
        phonetics.find((p) => p.text)?.text ||
        "IPA unavailable";

      ipaEl.textContent = ipa;
      playUs.setAttribute("data-word", word);
      playUs.setAttribute("data-audio", us || any);
      playUk.setAttribute("data-word", word);
      playUk.setAttribute("data-audio", uk || any);
      slow.setAttribute("data-word", word);
      slow.setAttribute("data-audio", us || uk || any);
      compare.setAttribute("data-word", word);
      compare.setAttribute("data-audio-us", us || any);
      compare.setAttribute("data-audio-uk", uk || any);

      const dedicated = await pathForWord(word);
      pageLink.innerHTML = dedicated
        ? `<a href="${dedicated}">Open the full Speakur page for “${word}”</a> — IPA, syllables, Slow, and practice cues.`
        : `<a href="../../index.html?q=${encodeURIComponent(word)}">Search “${word}” on Speakur</a> to open or build a dedicated page.`;

      if (us && uk) {
        status.textContent = `Both US and UK clips found for “${word}”.`;
      } else if (any) {
        status.textContent = `Only one accent clip found — Compare will use speech fallback where needed.`;
      } else {
        status.textContent = `No dictionary clips — buttons use browser speech after you click.`;
      }
      result.hidden = false;
    } catch (_) {
      status.textContent = "Lookup failed. Check your connection and try again.";
    }
  });
}