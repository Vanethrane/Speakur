/**
 * Cmd+K global search modal for static Speakur pages (vanilla JS).
 * Requires assets/global-search-index.json (build-global-search-index.mjs).
 */
(function () {
  var index = null;
  var loadPromise = null;
  var open = false;
  var overlay = null;
  var input = null;
  var listEl = null;
  var metaEl = null;
  var fallbackEl = null;
  var active = 0;
  var visible = [];
  var indexUrl = "";

  function normalize(raw) {
    return String(raw || "")
      .trim()
      .toLowerCase()
      .replace(/\s+/g, " ");
  }

  function lowerBound(words, query) {
    var lo = 0;
    var hi = words.length;
    while (lo < hi) {
      var mid = (lo + hi) >> 1;
      if (words[mid][0] < query) lo = mid + 1;
      else hi = mid;
    }
    return lo;
  }

  function scoreMeta(query, entry) {
    var score = 0;
    var label = entry.label.toLowerCase();
    if (label === query) score += 120;
    if (entry.id.indexOf(":" + query.replace(/\s+/g, "-")) !== -1) score += 110;
    var terms = entry.terms || [];
    for (var i = 0; i < terms.length; i++) {
      var term = terms[i];
      if (term === query) score += 90;
      else if (term.indexOf(query) === 0) score += 55;
      else if (query.indexOf(term) === 0 && term.length >= 3) score += 40;
      else if (term.indexOf(query) !== -1) score += 28;
    }
    return score;
  }

  function scoreWord(query, word) {
    if (word === query) return 120;
    if (word.indexOf(query) === 0) return 85 + Math.min(query.length, 10);
    if (query.length >= 3 && word.indexOf(query) !== -1) return 45;
    return 0;
  }

  function levenshtein(a, b) {
    if (a === b) return 0;
    if (!a.length) return b.length;
    if (!b.length) return a.length;
    var prev = new Array(b.length + 1);
    var curr = new Array(b.length + 1);
    for (var j = 0; j <= b.length; j++) prev[j] = j;
    for (var i = 1; i <= a.length; i++) {
      curr[0] = i;
      for (j = 1; j <= b.length; j++) {
        var cost = a.charAt(i - 1) === b.charAt(j - 1) ? 0 : 1;
        curr[j] = Math.min(curr[j - 1] + 1, prev[j] + 1, prev[j - 1] + cost);
      }
      for (j = 0; j <= b.length; j++) prev[j] = curr[j];
    }
    return prev[b.length];
  }

  function wordResult(tuple, score, staticSite) {
    return {
      id: "word:" + tuple[0],
      label: tuple[0],
      hint: tuple[1] + " · pronounce",
      href: staticSite ? tuple[3] : tuple[2],
      score: score,
    };
  }

  function metaResult(entry, score, staticSite) {
    return {
      id: entry.id,
      label: entry.label,
      hint: entry.hint,
      href: staticSite ? entry.staticHref || entry.href : entry.href,
      score: score,
    };
  }

  function search(query, limit, staticSite) {
    var started = performance.now();
    var q = normalize(query);
    if (!q || !index) return { results: [], isFallback: false, elapsedMs: 0 };

    var merged = [];
    var i;

    for (i = 0; i < index.meta.length; i++) {
      var ms = scoreMeta(q, index.meta[i]);
      if (ms > 0) merged.push(metaResult(index.meta[i], ms, staticSite));
    }

    var start = lowerBound(index.words, q);
    for (i = start; i < index.words.length && merged.length < limit + 20; i++) {
      var tuple = index.words[i];
      if (tuple[0].indexOf(q) !== 0 && (q.length < 3 || tuple[0].indexOf(q) === -1)) {
        if (i > start && tuple[0][0] > q[0]) break;
        if (tuple[0].indexOf(q) === -1) continue;
      }
      var ws = scoreWord(q, tuple[0]);
      if (ws > 0) merged.push(wordResult(tuple, ws, staticSite));
    }

    merged.sort(function (a, b) {
      return b.score - a.score || a.label.localeCompare(b.label);
    });

    var seen = {};
    var results = [];
    for (i = 0; i < merged.length; i++) {
      if (seen[merged[i].id]) continue;
      seen[merged[i].id] = true;
      results.push(merged[i]);
      if (results.length >= limit) break;
    }

    var isFallback = false;
    if (!results.length) {
      isFallback = true;
      var scored = [];
      var first = q[0] || "";
      var maxDist = Math.max(3, Math.ceil(q.length * 0.45));
      for (i = 0; i < index.meta.length; i++) {
        var entry = index.meta[i];
        scored.push(metaResult(entry, 500 - levenshtein(q, entry.label.toLowerCase()), staticSite));
      }
      for (i = 0; i < index.words.length; i++) {
        tuple = index.words[i];
        if (first && tuple[0][0] !== first && Math.abs(tuple[0].length - q.length) > 3) continue;
        var dist = levenshtein(q, tuple[0]);
        if (dist <= maxDist) scored.push(wordResult(tuple, 500 - dist, staticSite));
      }
      scored.sort(function (a, b) {
        return b.score - a.score || a.label.localeCompare(b.label);
      });
      var tools = scored.filter(function (r) {
        return r.id.indexOf("tool:") === 0;
      });
      results = tools.slice(0, 3);
      if (results.length < 3) {
        var ids = {};
        for (i = 0; i < results.length; i++) ids[results[i].id] = true;
        for (i = 0; i < scored.length && results.length < 3; i++) {
          if (!ids[scored[i].id]) results.push(scored[i]);
        }
      }
    }

    return {
      results: results,
      isFallback: isFallback,
      elapsedMs: performance.now() - started,
    };
  }

  function loadIndex() {
    if (index) return Promise.resolve(index);
    if (loadPromise) return loadPromise;
    loadPromise = fetch(indexUrl, { cache: "force-cache" })
      .then(function (res) {
        if (!res.ok) throw new Error("index " + res.status);
        return res.json();
      })
      .then(function (data) {
        index = data;
        return index;
      });
    return loadPromise;
  }

  function render() {
    if (!input || !listEl) return;
    var staticSite = document.body.getAttribute("data-static-site") === "1";
    var state = search(input.value, 12, staticSite);
    visible = state.results;
    active = 0;

    if (fallbackEl) {
      fallbackEl.hidden = !state.isFallback;
    }

    if (!visible.length) {
      listEl.innerHTML = input.value.trim()
        ? '<li class="gs-empty">No results — try another spelling.</li>'
        : "";
      if (metaEl) {
        metaEl.textContent = index
          ? index.words.length.toLocaleString() + " words · " + index.meta.length + " guides & tools"
          : "";
      }
      return;
    }

    listEl.innerHTML = visible
      .map(function (item, idx) {
        return (
          '<li role="option" aria-selected="' +
          (idx === active) +
          '"><button type="button" data-i="' +
          idx +
          '" class="gs-result' +
          (idx === active ? " active" : "") +
          '"><span class="gs-label">' +
          item.label +
          '</span><span class="gs-hint">' +
          item.hint +
          "</span></button></li>"
        );
      })
      .join("");

    listEl.querySelectorAll("button").forEach(function (btn) {
      btn.addEventListener("click", function () {
        go(Number(btn.getAttribute("data-i")));
      });
    });

    if (metaEl) {
      metaEl.textContent =
        (state.elapsedMs < 1 ? "<1" : state.elapsedMs.toFixed(1)) + " ms";
    }
  }

  function go(idx) {
    var pick = typeof idx === "number" ? visible[idx] : null;
    if (!pick) return;
    closeModal();
    if (/^https?:\/\//i.test(pick.href)) window.location.href = pick.href;
    else window.location.href = pick.href;
  }

  function openModal() {
    if (open) return;
    open = true;
    document.body.classList.add("gs-modal-open");
    overlay.hidden = false;
    loadIndex().then(function () {
      render();
      input.value = "";
      input.focus();
    });
  }

  function closeModal() {
    open = false;
    document.body.classList.remove("gs-modal-open");
    overlay.hidden = true;
  }

  function buildModal() {
    overlay = document.createElement("div");
    overlay.id = "speakur-global-search";
    overlay.className = "gs-overlay";
    overlay.hidden = true;
    overlay.innerHTML =
      '<div class="gs-backdrop" data-close="1" aria-label="Close search"></div>' +
      '<div class="gs-dialog" role="dialog" aria-modal="true" aria-labelledby="gs-title">' +
      '<div class="gs-input-row">' +
      '<span class="gs-icon" aria-hidden="true">⌕</span>' +
      '<label id="gs-title" class="sr-only" for="speakur-global-search-input">Search Speakur</label>' +
      '<input id="speakur-global-search-input" type="search" placeholder="Search 60,000 words, guides, and tools…" autocomplete="off" spellcheck="false" />' +
      '<kbd class="gs-kbd">esc</kbd>' +
      "</div>" +
      '<p class="gs-fallback" hidden>No exact matches — showing the 3 closest tools</p>' +
      '<ul class="gs-results" role="listbox" aria-label="Search results"></ul>' +
      '<div class="gs-footer"><span class="gs-stats"></span><span class="gs-timing"></span></div>' +
      "</div>";

    document.body.appendChild(overlay);
    input = overlay.querySelector("#speakur-global-search-input");
    listEl = overlay.querySelector(".gs-results");
    metaEl = overlay.querySelector(".gs-timing");
    fallbackEl = overlay.querySelector(".gs-fallback");
    var statsEl = overlay.querySelector(".gs-stats");

    loadIndex().then(function (data) {
      if (statsEl) {
        statsEl.textContent =
          data.words.length.toLocaleString() + " words · " + data.meta.length + " guides & tools";
      }
    });

    overlay.querySelector(".gs-backdrop").addEventListener("click", closeModal);
    input.addEventListener("input", render);
    input.addEventListener("keydown", function (e) {
      if (e.key === "Escape") {
        e.preventDefault();
        closeModal();
        return;
      }
      if (!visible.length) return;
      if (e.key === "ArrowDown") {
        e.preventDefault();
        active = (active + 1) % visible.length;
        render();
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        active = (active - 1 + visible.length) % visible.length;
        render();
      } else if (e.key === "Enter") {
        e.preventDefault();
        go(active);
      }
    });
  }

  function mount() {
    var trigger = document.getElementById("speakur-global-search-trigger");
    if (!trigger) return;

    indexUrl = trigger.getAttribute("data-index-url") || "assets/global-search-index.json";
    buildModal();

    trigger.addEventListener("click", function () {
      openModal();
    });

    document.addEventListener("keydown", function (e) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        if (open) closeModal();
        else openModal();
      }
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", mount);
  } else {
    mount();
  }
})();
