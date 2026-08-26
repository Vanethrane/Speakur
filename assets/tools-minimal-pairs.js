(function () {
  const PAIRS = [
    { a: "ship", b: "sheep", focus: "vowel", prompt: "Which vowel did you hear — short ɪ or long i?" },
    { a: "bit", b: "beat", focus: "vowel", prompt: "ɪ vs iː — which word?" },
    { a: "full", b: "fool", focus: "vowel", prompt: "ʊ vs uː — which word?" },
    { a: "pen", b: "pan", focus: "vowel", prompt: "ɛ vs æ — which word?" },
    { a: "cot", b: "caught", focus: "vowel", prompt: "ɑ vs ɔ (if your accent distinguishes them)." },
    { a: "record", b: "record", focus: "stress", prompt: "Noun RE-cord vs verb re-CORD — which stress?", aHint: "ˈrɛkərd (noun)", bHint: "rɪˈkɔrd (verb)", aSay: "REH-cord", bSay: "re-CORD" },
    { a: "present", b: "present", focus: "stress", prompt: "PREsent (noun) vs preSENT (verb) — which stress?", aSay: "PREZ-ent", bSay: "pre-ZENT" },
    { a: "desert", b: "desert", focus: "stress", prompt: "DEsert (noun) vs deSERT (verb).", aSay: "DEZ-ert", bSay: "de-ZERT" },
    { a: "permit", b: "permit", focus: "stress", prompt: "PERmit (noun) vs perMIT (verb).", aSay: "PER-mit", bSay: "per-MIT" },
    { a: "live", b: "leave", focus: "vowel", prompt: "ɪ vs iː — which word?" },
    { a: "pull", b: "pool", focus: "vowel", prompt: "ʊ vs uː — which word?" },
    { a: "bad", b: "bed", focus: "vowel", prompt: "æ vs ɛ — which word?" },
  ];

  const app = document.getElementById("mp-app");
  if (!app) return;

  const promptEl = document.getElementById("mp-prompt");
  const pairEl = document.getElementById("mp-pair");
  const choicesEl = document.getElementById("mp-choices");
  const feedbackEl = document.getElementById("mp-feedback");
  const scoreEl = document.getElementById("mp-score");
  const playA = document.getElementById("mp-play-a");
  const playB = document.getElementById("mp-play-b");
  const playMystery = document.getElementById("mp-play-mystery");
  const nextBtn = document.getElementById("mp-next");

  let correct = 0;
  let total = 0;
  let current = null;
  let mystery = "a";
  let answered = false;

  function speak(text, rate) {
    if (window.SpeakurPlay) {
      window.SpeakurPlay.speakWord(text, "en-US", rate || 1);
      return;
    }
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "en-US";
    u.rate = rate || 1;
    window.speechSynthesis.speak(u);
  }

  function label(side) {
    if (!current) return "";
    if (current.focus === "stress") {
      return side === "a" ? current.aSay || `A · ${current.a}` : current.bSay || `B · ${current.b}`;
    }
    return side === "a" ? current.a : current.b;
  }

  function loadPair() {
    answered = false;
    current = PAIRS[Math.floor(Math.random() * PAIRS.length)];
    mystery = Math.random() < 0.5 ? "a" : "b";
    app.setAttribute("data-word", mystery === "a" ? current.a : current.b);
    promptEl.textContent = current.prompt;
    if (current.focus === "stress" && current.a === current.b) {
      pairEl.textContent = `${label("a")}  ·  ${label("b")}`;
    } else {
      pairEl.textContent = `${current.a}  ·  ${current.b}`;
    }
    feedbackEl.textContent = "";
    choicesEl.innerHTML = "";
    ["a", "b"].forEach((side) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "choice-btn";
      btn.textContent = label(side);
      btn.addEventListener("click", () => guess(side, btn));
      choicesEl.appendChild(btn);
    });
  }

  function guess(side, btn) {
    if (answered || !current) return;
    answered = true;
    total += 1;
    const ok = side === mystery;
    if (ok) correct += 1;
    btn.classList.add(ok ? "is-correct" : "is-wrong");
    Array.from(choicesEl.children).forEach((el, i) => {
      const s = i === 0 ? "a" : "b";
      if (s === mystery) el.classList.add("is-correct");
    });
    feedbackEl.textContent = ok
      ? "Nice — that matches the mystery clip."
      : `It was “${label(mystery)}”. Play A/B again, then mystery.`;
    scoreEl.textContent = `Score: ${correct} / ${total}`;
  }

  playA.addEventListener("click", () => speak(current?.aSay || current?.a || "", 1));
  playB.addEventListener("click", () => speak(current?.bSay || current?.b || "", 1));
  playMystery.addEventListener("click", () => {
    const text = mystery === "a" ? current?.aSay || current?.a : current?.bSay || current?.b;
    speak(text || "", 1);
  });
  nextBtn.addEventListener("click", loadPair);

  loadPair();
})();
