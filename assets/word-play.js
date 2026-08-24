(function () {
  function speak(word, lang, rate) {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(word);
    u.lang = lang || "en-US";
    u.rate = rate || 1;
    const voices = window.speechSynthesis.getVoices();
    const match = voices.find((v) =>
      v.lang.toLowerCase().startsWith((lang || "en").toLowerCase().slice(0, 2)),
    );
    if (match) u.voice = match;
    window.speechSynthesis.speak(u);
  }

  async function playFromButton(btn) {
    const word =
      btn.closest("[data-word]")?.getAttribute("data-word") ||
      document.querySelector("h1")?.textContent?.trim() ||
      "";
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
    speak(word, lang, rate);
  }

  document.querySelectorAll("[data-play]").forEach((btn) => {
    btn.addEventListener("click", () => {
      void playFromButton(btn);
    });
  });
})();
