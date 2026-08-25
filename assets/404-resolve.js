(async function () {
  const path = location.pathname.replace(/\/+$/, "") || "/";
  const m = path.match(
    /^\/(medical|food|everyday|science|business|places|names|brands|animals|arts|sports|tech|nature|law|mythology)\/([a-z][a-z'-]*)$/i,
  );
  if (!m) return;

  const category = m[1].toLowerCase();
  const word = m[2].toLowerCase();
  const main = document.getElementById("main");
  if (!main || !window.SpeakurOnDemand) return;

  document.title = `How to pronounce ${word} · Speakur`;
  main.innerHTML = `
    <p class="eyebrow">Building page</p>
    <h1>${word}</h1>
    <p class="lede" id="status">Building a pronunciation page for “${word}”…</p>
    <div id="mount" class="stable-slot" style="min-height:12rem"></div>
  `;
  const statusEl = document.getElementById("status");
  const mountEl = document.getElementById("mount");

  const result = await SpeakurOnDemand.resolveAndShow({
    rawWord: word,
    preferredCategory: category,
    mount: mountEl,
    statusEl,
    depth: 2,
  });

  if (!result.ok && !result.redirected) {
    document.title = "Not found · Speakur";
    statusEl.insertAdjacentHTML(
      "afterend",
      `<p style="margin-top:1.5rem;"><a class="btn" href="/index.html">Back to home</a></p>`,
    );
  }
})();
