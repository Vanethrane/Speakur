(function () {
  const SETS = [
    {
      title: "their / there / they’re",
      items: [
        { word: "their", cue: "Possessive — their idea." },
        { word: "there", cue: "Place or existence — over there; there is." },
        { word: "they're", cue: "Contraction — they are." },
      ],
    },
    {
      title: "your / you’re",
      items: [
        { word: "your", cue: "Possessive — your turn." },
        { word: "you're", cue: "Contraction — you are." },
      ],
    },
    {
      title: "to / too / two",
      items: [
        { word: "to", cue: "Preposition / infinitive — go to school; to see." },
        { word: "too", cue: "Also or excessively — me too; too loud." },
        { word: "two", cue: "The number 2." },
      ],
    },
    {
      title: "its / it’s",
      items: [
        { word: "its", cue: "Possessive — its color." },
        { word: "it's", cue: "Contraction — it is / it has." },
      ],
    },
    {
      title: "affect / effect",
      items: [
        { word: "affect", cue: "Usually a verb — how it affects you." },
        { word: "effect", cue: "Usually a noun — the effect." },
      ],
    },
    {
      title: "weather / whether",
      items: [
        { word: "weather", cue: "Climate — rainy weather." },
        { word: "whether", cue: "Choice — whether or not." },
      ],
    },
    {
      title: "peace / piece",
      items: [
        { word: "peace", cue: "Calm — world peace." },
        { word: "piece", cue: "Part — a piece of cake." },
      ],
    },
    {
      title: "right / write / rite",
      items: [
        { word: "right", cue: "Correct / direction / entitlement." },
        { word: "write", cue: "Put words on a page." },
        { word: "rite", cue: "Ceremony — a rite of passage." },
      ],
    },
  ];

  const root = document.getElementById("homo-app");
  if (!root) return;

  root.innerHTML = SETS.map((set) => {
    const words = set.items
      .map(
        (item) => `<div class="homo-set" style="flex:1;min-width:9rem;margin:0;">
          <p style="margin:0;font-family:Fraunces,Georgia,serif;font-size:1.2rem;">${item.word}</p>
          <p class="note" style="margin:0.4rem 0 0;">${item.cue}</p>
          <div class="tool-actions">
            <button type="button" class="play btn-voice" data-play data-word="${item.word}" data-lang="en-US"><span class="icon">▶</span> Play</button>
          </div>
        </div>`,
      )
      .join("");
    return `<section class="homo-set" aria-label="${set.title}">
      <h3>${set.title}</h3>
      <div class="homo-words">${words}</div>
    </section>`;
  }).join("");
})();
