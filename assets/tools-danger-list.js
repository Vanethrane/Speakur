(function () {
  const KEY = "speakur-danger-list-v1";
  const listEl = document.getElementById("danger-list");
  const form = document.getElementById("danger-add");
  const input = document.getElementById("danger-q");
  const status = document.getElementById("danger-status");
  const startBtn = document.getElementById("danger-start");
  const clearBtn = document.getElementById("danger-clear");
  const session = document.getElementById("danger-session");
  const timerEl = document.getElementById("danger-timer");
  const currentEl = document.getElementById("danger-current");
  const playBtn = document.getElementById("danger-play");
  const slowBtn = document.getElementById("danger-slow");
  const nextBtn = document.getElementById("danger-next");
  if (!listEl || !form) return;

  let words = load();
  let timerId = null;
  let endsAt = 0;
  let cursor = 0;

  function load() {
    try {
      const raw = JSON.parse(localStorage.getItem(KEY) || "[]");
      return Array.isArray(raw) ? raw.map(String).filter(Boolean).slice(0, 100) : [];
    } catch {
      return [];
    }
  }

  function save() {
    localStorage.setItem(KEY, JSON.stringify(words));
  }

  function normalize(raw) {
    return String(raw || "")
      .trim()
      .toLowerCase()
      .replace(/[^a-z'-]/g, "");
  }

  function render() {
    if (!words.length) {
      listEl.innerHTML = `<li class="note">No words yet — add a few from search or memory.</li>`;
      return;
    }
    listEl.innerHTML = words
      .map(
        (w, i) => `<li data-word="${w}">
          <strong style="font-family:Fraunces,Georgia,serif;font-size:1.15rem;">${w}</strong>
          <span class="tool-actions" style="margin:0;">
            <button type="button" class="play btn-voice" data-play data-word="${w}" data-lang="en-US"><span class="icon">▶</span></button>
            <button type="button" class="choice-btn" data-remove="${i}" style="flex:0;min-height:2.25rem;padding:0.35rem 0.75rem;">Remove</button>
          </span>
        </li>`,
      )
      .join("");
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const w = normalize(input.value);
    if (!w) {
      status.textContent = "Type a word to save.";
      return;
    }
    if (words.includes(w)) {
      status.textContent = `“${w}” is already on your deck.`;
      input.value = "";
      return;
    }
    words.unshift(w);
    words = words.slice(0, 100);
    save();
    input.value = "";
    status.textContent = `Saved “${w}”.`;
    render();
  });

  listEl.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-remove]");
    if (!btn) return;
    const i = Number(btn.getAttribute("data-remove"));
    const removed = words.splice(i, 1)[0];
    save();
    status.textContent = removed ? `Removed “${removed}”.` : "";
    render();
  });

  clearBtn.addEventListener("click", () => {
    if (!words.length) return;
    if (!confirm("Clear your danger-list deck on this device?")) return;
    words = [];
    save();
    status.textContent = "Deck cleared.";
    stopSession();
    render();
  });

  function showCurrent() {
    if (!words.length) return;
    cursor = cursor % words.length;
    const w = words[cursor];
    currentEl.textContent = w;
    session.setAttribute("data-word", w);
    playBtn.setAttribute("data-word", w);
    slowBtn.setAttribute("data-word", w);
  }

  function tick() {
    const left = Math.max(0, endsAt - Date.now());
    const s = Math.ceil(left / 1000);
    const m = Math.floor(s / 60);
    const r = s % 60;
    timerEl.textContent = `${m}:${String(r).padStart(2, "0")}`;
    if (left <= 0) {
      stopSession();
      status.textContent = "Session done — nice work.";
    }
  }

  function stopSession() {
    if (timerId) clearInterval(timerId);
    timerId = null;
    session.style.display = "none";
  }

  startBtn.addEventListener("click", () => {
    if (!words.length) {
      status.textContent = "Add at least one word first.";
      return;
    }
    cursor = Math.floor(Math.random() * words.length);
    endsAt = Date.now() + 5 * 60 * 1000;
    session.style.display = "block";
    showCurrent();
    if (timerId) clearInterval(timerId);
    tick();
    timerId = setInterval(tick, 250);
    status.textContent = "Loop running — Play, then Next when ready.";
  });

  nextBtn.addEventListener("click", () => {
    if (!words.length) return;
    cursor = (cursor + 1) % words.length;
    showCurrent();
  });

  render();
})();
