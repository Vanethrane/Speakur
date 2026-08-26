/**
 * Lazy word path lookup — fetches compact word-paths.json on first use.
 * Avoids parsing 6MB+ word-index.js during initial page load.
 */
(function (global) {
  /** @type {[string, string][] | null} */
  let rows = null;
  /** @type {Promise<[string, string][]> | null} */
  let loadPromise = null;

  function assetBase() {
    const scripts = document.getElementsByTagName("script");
    for (let i = scripts.length - 1; i >= 0; i--) {
      const src = scripts[i].src || "";
      const idx = src.indexOf("/assets/");
      if (idx !== -1) return src.slice(0, idx + 1);
    }
    return "/";
  }

  function loadRows() {
    if (rows) return Promise.resolve(rows);
    if (loadPromise) return loadPromise;

    const base = assetBase();
    loadPromise = fetch(base + "assets/word-paths.json", { credentials: "same-origin" })
      .then(function (res) {
        if (!res.ok) throw new Error("word-paths fetch failed");
        return res.json();
      })
      .then(function (data) {
        rows = data.w || [];
        return rows;
      });

    return loadPromise;
  }

  function binaryExact(q) {
    if (!rows || !rows.length) return null;
    let lo = 0;
    let hi = rows.length - 1;
    while (lo <= hi) {
      const mid = (lo + hi) >> 1;
      const word = rows[mid][0];
      if (word === q) return { word: rows[mid][0], path: rows[mid][1] };
      if (word < q) lo = mid + 1;
      else hi = mid - 1;
    }
    return null;
  }

  function binaryPrefix(q) {
    if (!rows || !rows.length || !q) return null;
    let lo = 0;
    let hi = rows.length;
    while (lo < hi) {
      const mid = (lo + hi) >> 1;
      if (rows[mid][0] < q) lo = mid + 1;
      else hi = mid;
    }
    const hit = rows[lo];
    if (hit && hit[0].indexOf(q) === 0) return { word: hit[0], path: hit[1] };
    return null;
  }

  function normalize(raw) {
    const aliases = { apendectomy: "appendectomy" };
    const key = String(raw || "")
      .trim()
      .toLowerCase();
    return aliases[key] || key;
  }

  global.SpeakurWordLookup = {
    ensureLoaded: loadRows,
    find: function (raw) {
      const q = normalize(raw);
      if (!q) return null;
      return binaryExact(q);
    },
    findPrefix: function (raw) {
      const q = normalize(raw);
      if (!q) return null;
      const exact = binaryExact(q);
      if (exact) return exact;
      return binaryPrefix(q);
    },
    pathFor: function (raw) {
      const hit = this.find(raw);
      return hit ? hit.path : null;
    },
  };
})(window);
