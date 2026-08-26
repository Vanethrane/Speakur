(function () {
  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function formatRich(text) {
    var parts = [];
    var re = /\[([^\]]+)\]\((\/[^)]+)\)/g;
    var last = 0;
    var m;
    while ((m = re.exec(text))) {
      if (m.index > last) parts.push(escapeHtml(text.slice(last, m.index)));
      parts.push('<a href="' + escapeHtml(m[2]) + '">' + escapeHtml(m[1]) + "</a>");
      last = m.index + m[0].length;
    }
    if (last < text.length) parts.push(escapeHtml(text.slice(last)));
    return parts.join("") || escapeHtml(text);
  }

  var slug = new URLSearchParams(location.search).get("slug");
  var guide = (window.SPEAKUR_GUIDES || []).find(function (g) {
    return g.slug === slug;
  });
  if (!guide) {
    var titleEl = document.getElementById("title");
    var descEl = document.getElementById("desc");
    if (titleEl) titleEl.textContent = "Guide not found";
    if (descEl) descEl.textContent = "That article is missing or the link is incomplete.";
    return;
  }
  document.title = guide.title + " · Speakur";
  var metaDesc = document.querySelector('meta[name="description"]');
  if (metaDesc) metaDesc.setAttribute("content", guide.description);
  document.getElementById("title").textContent = guide.title;
  document.getElementById("desc").textContent = guide.description;
  document.getElementById("meta").textContent =
    "Published " + guide.publishedAt + " · " + guide.readingMinutes + " min read";

  var html = "";
  if (guide.synopsis && guide.synopsis.length) {
    html +=
      '<aside class="guide-synopsis"><p class="guide-callout-label">Synopsis</p>' +
      guide.synopsis
        .map(function (p) {
          return "<p>" + formatRich(p) + "</p>";
        })
        .join("") +
      "</aside>";
  }
  html += (guide.sections || [])
    .map(function (s) {
      return (
        "<h2>" +
        escapeHtml(s.heading) +
        "</h2>" +
        (s.paragraphs || [])
          .map(function (p) {
            return "<p>" + formatRich(p) + "</p>";
          })
          .join("")
      );
    })
    .join("");
  if (guide.tldr && guide.tldr.length) {
    html +=
      '<aside class="guide-tldr"><p class="guide-callout-label">TL;DR</p><ul>' +
      guide.tldr
        .map(function (item) {
          return "<li>" + formatRich(item) + "</li>";
        })
        .join("") +
      "</ul></aside>";
  }
  document.getElementById("body").innerHTML = html;
})();
