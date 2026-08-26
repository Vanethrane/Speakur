(function () {
  const VOWELS = [
    { ipa: "i", word: "fleece", tip: "Long “ee” as in see." },
    { ipa: "ɪ", word: "kit", tip: "Short “i” as in sit." },
    { ipa: "eɪ", word: "face", tip: "Diphthong: e → ɪ." },
    { ipa: "ɛ", word: "dress", tip: "Open mid front, as in bed." },
    { ipa: "æ", word: "trap", tip: "“A” as in cat (US)." },
    { ipa: "ɑ", word: "father", tip: "Open back, as in spa." },
    { ipa: "ɔ", word: "thought", tip: "Rounded, as in law (many US accents merge with ɑ)." },
    { ipa: "oʊ", word: "goat", tip: "Diphthong: o → ʊ." },
    { ipa: "ʊ", word: "foot", tip: "Short “oo” as in put." },
    { ipa: "u", word: "goose", tip: "Long “oo” as in food." },
    { ipa: "ʌ", word: "strut", tip: "Central, as in cup." },
    { ipa: "ə", word: "comma", tip: "Schwa — the unstressed default vowel." },
    { ipa: "ɝ", word: "nurse", tip: "R-colored vowel (US), as in bird." },
    { ipa: "aɪ", word: "price", tip: "Diphthong as in my." },
    { ipa: "aʊ", word: "mouth", tip: "Diphthong as in now." },
    { ipa: "ɔɪ", word: "choice", tip: "Diphthong as in boy." },
  ];

  const CONSONANTS = [
    { ipa: "p", word: "pie", tip: "Voiceless bilabial stop." },
    { ipa: "b", word: "buy", tip: "Voiced bilabial stop." },
    { ipa: "t", word: "tie", tip: "Voiceless alveolar stop." },
    { ipa: "d", word: "die", tip: "Voiced alveolar stop." },
    { ipa: "k", word: "key", tip: "Voiceless velar stop." },
    { ipa: "ɡ", word: "guy", tip: "Voiced velar stop." },
    { ipa: "tʃ", word: "chip", tip: "As in church." },
    { ipa: "dʒ", word: "judge", tip: "As in jump." },
    { ipa: "f", word: "fan", tip: "Voiceless labiodental fricative." },
    { ipa: "v", word: "van", tip: "Voiced labiodental fricative." },
    { ipa: "θ", word: "think", tip: "Voiceless “th”." },
    { ipa: "ð", word: "this", tip: "Voiced “th”." },
    { ipa: "s", word: "sip", tip: "Voiceless alveolar fricative." },
    { ipa: "z", word: "zip", tip: "Voiced alveolar fricative." },
    { ipa: "ʃ", word: "ship", tip: "“Sh” sound." },
    { ipa: "ʒ", word: "measure", tip: "“Zh” as in vision." },
    { ipa: "h", word: "hat", tip: "Glottal fricative." },
    { ipa: "m", word: "map", tip: "Bilabial nasal." },
    { ipa: "n", word: "nap", tip: "Alveolar nasal." },
    { ipa: "ŋ", word: "sing", tip: "Velar nasal — “ng”." },
    { ipa: "l", word: "light", tip: "Lateral approximant." },
    { ipa: "ɹ", word: "red", tip: "US “r” (often written /r/)." },
    { ipa: "w", word: "wet", tip: "Labio-velar approximant." },
    { ipa: "j", word: "yes", tip: "Palatal approximant (“y”)." },
  ];

  const detail = document.getElementById("ipa-detail");
  const vowelBox = document.getElementById("ipa-vowels");
  const consBox = document.getElementById("ipa-consonants");
  if (!detail || !vowelBox || !consBox) return;

  let activeBtn = null;

  function renderGroup(box, items) {
    box.innerHTML = "";
    items.forEach((item) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "ipa-key";
      btn.textContent = item.ipa;
      btn.setAttribute("aria-label", `IPA ${item.ipa}, example ${item.word}`);
      btn.addEventListener("click", () => select(item, btn));
      box.appendChild(btn);
    });
  }

  function select(item, btn) {
    if (activeBtn) activeBtn.setAttribute("aria-pressed", "false");
    activeBtn = btn;
    btn.setAttribute("aria-pressed", "true");
    detail.innerHTML = `
      <p style="margin:0;font-family:Fraunces,Georgia,serif;font-size:1.75rem;">/${item.ipa}/</p>
      <p style="margin:0.35rem 0 0;font-size:1.15rem;"><strong>${item.word}</strong></p>
      <p class="note" style="margin:0.35rem 0 0;">${item.tip}</p>
      <div class="tool-actions">
        <button type="button" class="play btn-voice" data-play data-word="${item.word}" data-lang="en-US"><span class="icon">▶</span> Play</button>
        <button type="button" class="play btn-voice" data-play data-word="${item.word}" data-lang="en-US" data-rate="0.72"><span class="icon">▶</span> Slow</button>
      </div>`;
  }

  renderGroup(vowelBox, VOWELS);
  renderGroup(consBox, CONSONANTS);
})();
