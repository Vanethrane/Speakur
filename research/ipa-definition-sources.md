# IPA & definition source chart

Running log of how Speakur fills missing pronunciation (IPA) and definitions on existing word pages.

## Source ranking (prefer first)

| Rank | Source | What it gives | Reliability | Notes |
| --- | --- | --- | --- | --- |
| 1 | [Free Dictionary API](https://dictionaryapi.dev/) (`api.dictionaryapi.dev`) | IPA + definitions + audio URLs | High for common EN lemmas | Primary; may rate-limit (`upstream`) |
| 2 | [Wiktionary](https://en.wiktionary.org/) (REST defs + parse wikitext `{{IPA\|en\|...}}`) | IPA + glosses | High (community-reviewed) | Best for rare food/medical/loanwords; polite delay required |
| 3 | [Datamuse](https://www.datamuse.com/api/) | Definitions (WordNet-ish) | Medium | Weak/no IPA; last resort for sense text |
| 4 | Manual / editorial | Both | Highest | Showcase / disputed lemmas |

## Pipeline

| Artifact | Role |
| --- | --- |
| `data/catalog.json` | Word inventory by category (~70k lemmas) |
| `scripts/lib/word-lookup.mjs` | Ranked multi-source lookup |
| `scripts/lib/word-html.mjs` | HTML generator chrome + page render |
| `scripts/fill-missing-word-meta.mjs` | In-place fill of existing `/{cat}/{word}/index.html` |
| `scripts/scan-missing-word-meta.mjs` | Gap scan → `data/missing-meta-scan.json` |
| `research/ipa-definition-fill-log.jsonl` | Append-only machine log |

## Baseline scan (food, 2026-09-03)

From `node scripts/scan-missing-word-meta.mjs --category=food`:

| Metric | Count |
| --- | --- |
| Total catalog words (food) | 6798 |
| OK (IPA + definition present) | 264 |
| Missing IPA | 6210 |
| Missing definition | 5802 |
| Missing either | 6210 |
| Missing HTML file | 324 |

Full-catalog scan: run `node scripts/scan-missing-word-meta.mjs` (writes `data/missing-meta-scan.json`).

## Verified sample lookups (2026-09-03)

| Word | IPA found | Definition found | Source path |
| --- | --- | --- | --- |
| arepa | `/ɑˈɹɛpɑ/`, `/əˈɹɛpə/` | yes (cornbread / northern Andes) | dictionaryapi upstream → **wiktionary** |
| absinthe | (via fill) | yes | dictionaryapi upstream → **wiktionary** |
| aioli | (via fill) | yes | dictionaryapi upstream → **wiktionary** |
| quinoa | (via fill) | yes | dictionaryapi upstream → **wiktionary** |

## Still lacking after best-effort

Tracked in `data/fill-meta-progress.json` as `"no-data"` and in the session table below. Many catalog entries are non-lemma noise (Latin genitives, obscure compounds) that have no EN dictionary/Wiktionary entry.

## Session log

Append-only machine log: [`ipa-definition-fill-log.jsonl`](./ipa-definition-fill-log.jsonl)

| When (UTC) | Word path | IPA? | Def? | Source(s) | Notes |
| --- | --- | --- | --- | --- |
