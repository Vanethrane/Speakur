(function () {
  const list = document.getElementById("list");
  if (!list) return;
  const guides = (window.SPEAKUR_GUIDES || [])
    .slice()
    .sort((a, b) => (a.publishedAt < b.publishedAt ? 1 : -1));
  list.innerHTML = guides
    .map(
      (g) => `
      <a class="card" href="./guide.html?slug=${encodeURIComponent(g.slug)}">
        <div class="meta">${g.publishedAt} · ${g.readingMinutes} min</div>
        <h2>${g.title}</h2>
        <p>${g.description}</p>
      </a>
    `,
    )
    .join("");
})();
