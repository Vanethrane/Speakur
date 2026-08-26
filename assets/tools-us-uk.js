(function () {
  const form = document.getElementById("usuk-form");
  const input = document.getElementById("usuk-q");
  const status = document.getElementById("usuk-status");
  const result = document.getElementById("usuk-result");
  const usIpa = document.getElementById("usuk-us-ipa");
  const ukIpa = document.getElementById("usuk-uk-ipa");
  const usPlay = document.getElementById("usuk-us-play");
  const ukPlay = document.getElementById("usuk-uk-play");
  if (!form) return;

  function accentFromAudio(audio) {
    const lower = (audio || "").toLowerCase();
    if (lower.includes("-us") || lower.includes("_us") || lower.includes("/us/")) return "us";
    if (lower.includes("-uk") || lower.includes("_uk") || lower.includes("/uk/")) return "uk";
    return "other";
  }

  function normalize(raw) {
    return String(raw || "")
      .trim()
      .toLowerCase()
      .replace(/[^a-z'-]/g, "");
  }

  async function lookup(word) {
    const res = await fetch(
      `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`,
    );
    if (res.status === 404) return { ok: false, reason: "not_found" };
    if (!res.ok) return { ok: false, reason: "upstream" };
    const entries = await res.json();
    return { ok: true, entry: entries[0] || null };
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const word = normalize(input.value);
    if (!word) {
      status.textContent = "Type a word to compare.";
      return;
    }
    status.textContent = "Looking up…";
    result.hidden = true;
    try {
      const data = await lookup(word);
      if (!data.ok) {
        status.textContent =
          data.reason === "not_found"
            ? `“${word}” wasn’t found. Check spelling.`
            : "Dictionary is temporarily unavailable. Try again.";
        return;
      }
      const phonetics = data.entry?.phonetics || [];
      let usAudio = "";
      let ukAudio = "";
      let usText = "";
      let ukText = "";
      for (const p of phonetics) {
        const accent = p.audio ? accentFromAudio(p.audio) : "other";
        if (accent === "us") {
          if (p.audio) usAudio = p.audio;
          if (p.text) usText = p.text;
        } else if (accent === "uk") {
          if (p.audio) ukAudio = p.audio;
          if (p.text) ukText = p.text;
        } else if (p.text && !usText) {
          usText = p.text;
        }
      }
      const fallback = data.entry?.phonetic || "";
      usIpa.textContent = usText || fallback || "IPA unavailable";
      ukIpa.textContent = ukText || fallback || "IPA unavailable";
      usPlay.setAttribute("data-word", word);
      ukPlay.setAttribute("data-word", word);
      usPlay.setAttribute("data-audio", usAudio);
      ukPlay.setAttribute("data-audio", ukAudio);
      result.querySelectorAll("[data-word]").forEach((el) => el.setAttribute("data-word", word));
      result.hidden = false;
      status.textContent = usAudio || ukAudio
        ? "Compare the clips — notice vowels and r-sounds."
        : "No free clips for this entry; Play uses browser speech.";
    } catch (_) {
      status.textContent = "Network error — try again in a moment.";
    }
  });
})();
