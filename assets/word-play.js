(function () {
  function speak(word, lang, rate) {
    return new Promise((resolve) => {
      if (!window.speechSynthesis || !word) {
        resolve();
        return;
      }
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(word);
      u.lang = lang || "en-US";
      u.rate = rate || 1;
      const voices = window.speechSynthesis.getVoices();
      const match = voices.find((v) =>
        v.lang.toLowerCase().startsWith((lang || "en").toLowerCase().slice(0, 2)),
      );
      if (match) u.voice = match;
      u.onend = () => resolve();
      u.onerror = () => resolve();
      window.speechSynthesis.speak(u);
    });
  }

  function playUrl(url, rate) {
    return new Promise((resolve, reject) => {
      const audio = new Audio(url);
      audio.playbackRate = rate || 1;
      audio.onended = () => resolve();
      audio.onerror = () => reject(new Error("audio error"));
      audio.play().catch(reject);
    });
  }

  async function playClip({ audioUrl, word, lang, rate }) {
    if (audioUrl) {
      try {
        await playUrl(audioUrl, rate);
        return;
      } catch (_) {
        /* fall through */
      }
    }
    await speak(word, lang, rate);
  }

  function wordFrom(btn) {
    return (
      btn.getAttribute("data-word") ||
      btn.closest("[data-word]")?.getAttribute("data-word") ||
      document.querySelector("h1")?.textContent?.trim() ||
      ""
    );
  }

  async function playFromButton(btn) {
    await playClip({
      audioUrl: btn.getAttribute("data-audio") || "",
      word: wordFrom(btn),
      lang: btn.getAttribute("data-lang") || "en-US",
      rate: Number(btn.getAttribute("data-rate") || "1"),
    });
  }

  async function compareFromButton(btn) {
    const word = wordFrom(btn);
    const us = btn.getAttribute("data-audio-us") || "";
    const uk = btn.getAttribute("data-audio-uk") || "";
    btn.disabled = true;
    try {
      await playClip({ audioUrl: us, word, lang: "en-US", rate: 1 });
      await new Promise((r) => setTimeout(r, 280));
      await playClip({ audioUrl: uk, word, lang: "en-GB", rate: 1 });
    } finally {
      btn.disabled = false;
    }
  }

  let mediaRecorder = null;
  let chunks = [];
  let recordedUrl = "";

  function bindRecord() {
    const start = document.querySelector("[data-record-start]");
    const stop = document.querySelector("[data-record-stop]");
    const play = document.querySelector("[data-record-play]");
    const status = document.querySelector("[data-record-status]");
    if (!start || !stop || !play) return;

    const setStatus = (msg) => {
      if (status) status.textContent = msg || "";
    };

    start.addEventListener("click", async () => {
      if (!navigator.mediaDevices?.getUserMedia) {
        setStatus("Recording needs a browser with microphone support.");
        return;
      }
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        chunks = [];
        mediaRecorder = new MediaRecorder(stream);
        mediaRecorder.ondataavailable = (e) => {
          if (e.data.size) chunks.push(e.data);
        };
        mediaRecorder.onstop = () => {
          stream.getTracks().forEach((t) => t.stop());
          if (recordedUrl) URL.revokeObjectURL(recordedUrl);
          recordedUrl = URL.createObjectURL(new Blob(chunks, { type: "audio/webm" }));
          play.hidden = false;
          setStatus("Recording ready — play it back and compare to US/UK/Slow.");
        };
        mediaRecorder.start();
        start.hidden = true;
        stop.hidden = false;
        play.hidden = true;
        setStatus("Recording… speak the word clearly.");
      } catch (_) {
        setStatus("Microphone permission was denied or unavailable.");
      }
    });

    stop.addEventListener("click", () => {
      if (mediaRecorder && mediaRecorder.state !== "inactive") mediaRecorder.stop();
      start.hidden = false;
      stop.hidden = true;
    });

    play.addEventListener("click", async () => {
      if (!recordedUrl) return;
      try {
        await playUrl(recordedUrl, 1);
      } catch (_) {
        setStatus("Could not play the recording.");
      }
    });
  }

  document.addEventListener("click", (e) => {
    const playBtn = e.target.closest && e.target.closest("[data-play]");
    if (playBtn) {
      e.preventDefault();
      void playFromButton(playBtn);
      return;
    }
    const compareBtn = e.target.closest && e.target.closest("[data-compare]");
    if (compareBtn) {
      e.preventDefault();
      void compareFromButton(compareBtn);
    }
  });

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", bindRecord);
  } else {
    bindRecord();
  }

  window.SpeakurPlay = { playFromButton, compareFromButton, playClip, speak, speakWord: speak };
})();
