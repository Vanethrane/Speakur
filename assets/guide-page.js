(function () {
  const slug = new URLSearchParams(location.search).get("slug");
  const guide = (window.SPEAKUR_GUIDES || []).find((g) => g.slug === slug);
  if (!guide) {
    const title = document.getElementById("title");
    const desc = document.getElementById("desc");
    if (title) title.textContent = "Guide not found";
    if (desc) desc.textContent = "That article is missing or the link is incomplete.";
    return;
  }
  document.title = guide.title + " · Speakur";
  const metaDesc = document.querySelector('meta[name="description"]');
  if (metaDesc) metaDesc.setAttribute("content", guide.description);
  document.getElementById("title").textContent = guide.title;
  document.getElementById("desc").textContent = guide.description;
  document.getElementById("meta").textContent =
    `Published ${guide.publishedAt} · ${guide.readingMinutes} min read`;
  document.getElementById("body").innerHTML = guide.sections
    .map(
      (s) =>
        `<h2>${s.heading}</h2>${s.paragraphs.map((p) => `<p>${p}</p>`).join("")}`,
    )
    .join("");
})();
