/**
 * Instant header search for static pages — uses SPEAKUR_SEARCH_INDEX (dataset.json).
 */
(function () {
  const index = window.SPEAKUR_SEARCH_INDEX || [];
  if (!index.length) return;

  function normalize(raw) {
    return String(raw || "")
      .trim()
      .toLowerCase()
      .replace(/\s+/g, " ");
  }

  function scoreEntry(query, entry) {
    if (!query) return 0;
    let score = 0;
    const label = entry.label.toLowerCase();
    if (label === query) score += 120;
    if (entry.id.endsWith(":" + query.replace(/\s+/g, "-"))) score += 110;
    for (const term of entry.terms || []) {
      if (term === query) score += 90;
      else if (term.startsWith(query)) score += 55;
      else if (query.startsWith(term) && term.length >= 3) score += 40;
      else if (term.includes(query)) score += 28;
    }
    const tokens = query.split(/\s+/).filter(function (t) {
      return t.length >= 2;
    });
    for (let i = 0; i < tokens.length; i++) {
      const token = tokens[i];
      if (label.indexOf(token) !== -1) score += 12;
      for (let j = 0; j < (entry.terms || []).length; j++) {
        if (entry.terms[j].indexOf(token) !== -1) score += 8;
      }
    }
    return score;
  }

  function search(query, limit) {
    const q = normalize(query);
    if (!q) return [];
    return index
      .map(function (entry) {
        return { entry: entry, score: scoreEntry(q, entry) };
      })
      .filter(function (row) {
        return row.score > 0;
      })
      .sort(function (a, b) {
        return b.score - a.score || a.entry.label.localeCompare(b.entry.label);
      })
      .slice(0, limit || 8)
      .map(function (row) {
        return row.entry;
      });
  }

  function guessCategory(word) {
    if (window.SpeakurOnDemand && SpeakurOnDemand.guessCategory) {
      return SpeakurOnDemand.guessCategory(word);
    }
    const w = word.toLowerCase();
    const rules = [
      ["medical", /osis$|itis$|ectomy$|ology$|emia$|pathy$|phobia$|therapy$/],
      ["food", /berry$|latte|espresso|sauce|cheese|bread|wine|fruit|meat/],
      ["tech", /algorithm|software|browser|server|database|javascript|python/],
      ["science", /ology$|metry$|particle|atom|cell|gene|quantum/],
    ];
    for (let i = 0; i < rules.length; i++) {
      if (rules[i][1].test(w)) return rules[i][0];
    }
    return "everyday";
  }

  function wordHit(query) {
    const q = normalize(query);
    if (!q) return null;
    if (window.SpeakurWordLookup && window.SpeakurWordLookup._rowsLoaded) {
      return SpeakurWordLookup.findPrefix(q);
    }
    const rows = window.SPEAKUR_WORD_INDEX || [];
    if (!rows.length) return null;
    const exact = rows.find(function (r) {
      return r.word === q;
    });
    if (exact) return exact;
    return (
      rows.find(function (r) {
        return r.word.indexOf(q) === 0;
      }) || null
    );
  }

  async function resolveAsync(query, picked) {
    if (picked) return picked.staticHref || picked.href;
    const q = normalize(query);
    if (!q) return "/index.html";

    const results = search(q, 12);
    const exact =
      results.find(function (r) {
        return r.label.toLowerCase() === q;
      }) ||
      results.find(function (r) {
        return r.id === "guide:" + q.replace(/\s+/g, "-");
      }) ||
      results.find(function (r) {
        return (r.terms || []).indexOf(q) !== -1;
      });

    if (exact) return exact.staticHref || exact.href;
    if (results.length) return results[0].staticHref || results[0].href;

    if (/^[a-z][a-z0-9'-]*$/i.test(q)) {
      if (window.SpeakurWordLookup) {
        try {
          await SpeakurWordLookup.ensureLoaded();
          SpeakurWordLookup._rowsLoaded = true;
          const hit = SpeakurWordLookup.findPrefix(q);
          if (hit && hit.path) {
            return hit.path.startsWith("/") ? hit.path : "/" + hit.path.replace(/^\.?\//, "");
          }
        } catch (_) {
          /* fall through */
        }
      } else {
        const hit = wordHit(q);
        if (hit && hit.path) {
          return hit.path.startsWith("/") ? hit.path : "/" + hit.path.replace(/^\.?\//, "");
        }
      }
      const cat = guessCategory(q);
      return "/" + cat + "/" + encodeURIComponent(q) + "/";
    }

    const catFallback = index.find(function (e) {
      return e.type === "category";
    });
    return catFallback ? catFallback.staticHref || catFallback.href : "/guides.html";
  }

  function resolve(query, picked) {
    return resolveAsync(query, picked);
  }

  function mount() {
    const input = document.getElementById("speakur-header-q");
    const list = document.getElementById("speakur-header-results");
    const form = document.getElementById("speakur-header-form");
    if (!input || !list || !form) return;

    let active = 0;
    let visible = [];

    function render() {
      visible = search(input.value, 8);
      active = 0;
      if (!visible.length || !input.value.trim()) {
        list.hidden = true;
        list.innerHTML = "";
        return;
      }
      list.hidden = false;
      list.innerHTML = visible
        .map(function (item, i) {
          return (
            '<li role="option" aria-selected="' +
            (i === active) +
            '"><button type="button" data-i="' +
            i +
            '" class="header-search-option' +
            (i === active ? " active" : "") +
            '"><span class="header-search-label">' +
            item.label +
            '</span><span class="header-search-hint">' +
            item.hint +
            "</span></button></li>"
          );
        })
        .join("");

      list.querySelectorAll("button").forEach(function (btn) {
        btn.addEventListener("click", function () {
          go(Number(btn.getAttribute("data-i")));
        });
      });
    }

    async function go(indexOrVisible) {
      const pick = typeof indexOrVisible === "number" ? visible[indexOrVisible] : null;
      const href = await resolveAsync(input.value, pick);
      list.hidden = true;
      if (/^https?:\/\//i.test(href)) window.location.href = href;
      else window.location.href = href;
    }

    input.addEventListener("input", render);
    input.addEventListener("focus", render);
    input.addEventListener("keydown", function (e) {
      if (!visible.length) return;
      if (e.key === "ArrowDown") {
        e.preventDefault();
        active = (active + 1) % visible.length;
        render();
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        active = (active - 1 + visible.length) % visible.length;
        render();
      } else if (e.key === "Escape") {
        list.hidden = true;
      }
    });

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      go(active);
    });

    document.addEventListener("mousedown", function (e) {
      if (!form.contains(e.target)) list.hidden = true;
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", mount);
  } else {
    mount();
  }
})();
