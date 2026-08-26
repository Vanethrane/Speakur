/**
 * Add real English words missing from the catalog.
 * Only commits when we have a definition AND a syllable count.
 *
 * Usage:
 *   node scripts/add-real-words.mjs
 *   node scripts/add-real-words.mjs --limit=80 --delay=800 --resume
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "fs";
import { join } from "path";
import {
  guessCategory,
  lookupWord,
  renderCategoryPage,
  renderWordPage,
  renderWordsHub,
  syllableCount,
} from "./lib/word-html.mjs";

const ROOT = process.cwd();
const PROGRESS = join(ROOT, "data/add-real-words-progress.json");
const args = Object.fromEntries(
  process.argv
    .slice(2)
    .filter((a) => a.startsWith("--"))
    .map((a) => {
      const [k, v] = a.replace(/^--/, "").split("=");
      return [k, v === undefined ? true : v];
    }),
);
const LIMIT = Number(args.limit || 80);
const DELAY = Number(args.delay || 800);
const RESUME = Boolean(args.resume);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/** Curated real words learners/searchers often need — category hints optional. */
const CANDIDATES = [
  "askance","askew","awry","cacophony","calliope","despot","detritus","echelon","eschew",
  "heinous","ignominious","khaki","maelstrom","onomatopoeia","opulent","piquant","potpourri",
  "saccharine","sycophant","vehement","chimera","clique","conduit","draught","facade","foyer",
  "homage","larynx","lilac","naive","ominous","paradigm","picturesque","pneumonia","pseudonym",
  "rapport","rendezvous","respite","rhetoric","silhouette","subtle","suite","ubiquitous",
  "vignette","virulent","xenophobia","yacht","zealous","zucchini","asterisk","bureaucracy",
  "prerogative","supposedly","veterinary","itinerary","exquisite","hospitable","comparable",
  "applicable","irrevocable","controversial","aluminum","aluminium","lieutenant","athlete",
  "arctic","asthma","diphtheria","hierarchy","jewelry","mischievous","nuclear","library",
  "february","espresso","caramel","syrup","pecan","pistachio","macadamia","sherbet",
  "prescription","comfortable","vegetable","chocolate","diamond","temperature","secretary",
  "laboratory","formidable","preferable","chauffeur","bechamel","hollandaise","macaroon",
  "vinaigrette","barbiturate","anathema","antipathy","apocryphal","auspicious","belligerent",
  "benevolent","brevity","circumspect","clandestine","cogent","colloquial","complacent",
  "concise","conundrum","copious","corroborate","credulous","cursory","dearth","debacle",
  "demagogue","deride","didactic","diligent","disparage","docile","dogmatic","dubious",
  "eclectic","egregious","elucidate","eminent","emulate","enigma","ephemeral","erudite",
  "esoteric","exacerbate","exemplary","extol","fallacious","fastidious","fervent","flippant",
  "florid","fortuitous","fractious","furtive","galvanize","garrulous","grandiose","hackneyed",
  "harangue","haughty","hedonist","hypothetical","iconoclast","idiosyncrasy","immutable",
  "impetuous","implacable","inane","incisive","incongruous","incredulous","indolent",
  "ineffable","inexorable","ingenuous","innocuous","insipid","intrepid","inundate",
  "inveterate","irascible","laconic","lament","laud","lethargic","lucid","magnanimous",
  "malevolent","malleable","maudlin","meticulous","misanthrope","mitigate","mollify",
  "morose","mundane","munificent","myriad","nefarious","nonchalant","nostalgia","obdurate",
  "obfuscate","obsequious","obsolete","obstinate","officious","onerous","opaque",
  "ostentatious","panacea","paragon","partisan","paucity","pedantic","penchant","perfidious",
  "perfunctory","pernicious","petulant","philanthropy","pious","placate","platitude",
  "plethora","polemic","pragmatic","precarious","precipitate","precocious","predilection",
  "prevaricate","pristine","prodigal","prodigious","prolific","propensity","prosaic",
  "proximity","prudent","pugnacious","quell","querulous","quixotic","rancorous",
  "recalcitrant","recluse","recondite","refractory","refute","relegate","remiss","replete",
  "reprehensible","reticent","reverence","robust","ruminate","sagacious","salient",
  "sanctimonious","sanguine","satiate","scathing","secular","sedentary","servile",
  "solicitous","somber","soporific","spurious","staid","stolid","strident","stupefy",
  "subpoena","succinct","superfluous","surreptitious","tacit","taciturn","tangential",
  "tenuous","timorous","tirade","torpid","tractable","transient","trite","truncate",
  "umbrage","unctuous","upbraid","usurp","vacillate","vapid","venerable","veracity",
  "verbose","vex","vicarious","vilify","vindicate","viscous","vitriolic","vociferous",
  "volatile","wary","zealot","zenith","aberration","abhor","abstain","accolade","acquiesce",
  "acrimony","adept","adulation","adversity","aesthetic","affinity","affluent","alacrity",
  "alias","alleviate","aloof","altruistic","ambiguous","ambivalent","ameliorate","amiable",
  "amorphous","anachronistic","analogous","anecdote","anomaly","antagonist","antecedent",
  "anthology","antiquated","antithesis","apathy","apprehensive","arable","arbitrary",
  "arcane","archaic","ardent","arduous","artisan","ascendancy","ascertain","aspire",
  "assiduous","assuage","astute","atrophy","audacious","augment","austere","avarice",
  "aversion","banal","bane","bastion","belie","belittle","bellicose","benign","bequeath",
  "berate","bereft","blatant","blight","bolster","bombastic","boorish","bourgeois",
  "braggart","brawny","brittle","broach","bucolic","burgeon","burnish","buttress",
  "cajole","callous","calumny","candor","cantankerous","capacious","capitulate",
  "capricious","captious","caricature","castigate","catalyst","caustic","censure",
  "chagrin","charlatan","chary","chastise","chicanery","churlish","circuitous",
  "circumlocution","circumscribe","clairvoyant","clemency","coalesce","coda","coerce",
  "cognizant","commensurate","commiserate","commodious","compelling","compendium",
  "complaisant","complement","compliant","composure","compunction","concede",
  "conciliatory","concomitant","condone","conflagration","confluence","confound",
  "congenial","conjecture","connoisseur","consecrate","consensus","conspicuous",
  "consternation","constrain","construe","consummate","contend","contentious","contrite",
  "convene","convivial","convoluted","corollary","corpulent","cosmopolitan","countenance",
  "covert","cower","craven","credence","credible","crescendo","crestfallen","cryptic",
  "cull","culpable","cupidity","daunt","debilitate","debunk","decorum","deference",
  "defunct","deleterious","delineate","demur","denounce","depict","deplete","deplorable",
  "depose","depravity","deprecate","derivative","desiccate","despondent","desultory",
  "deterrent","detrimental","diaphanous","diatribe","dichotomy","diffident","diffuse",
  "digression","dilatory","dilettante","dirge","disabuse","discern","discordant",
  "discrepancy","discrete","discretion","discriminating","disdain","disingenuous",
  "disinterested","disjointed","dismiss","disparate","dispassionate","dispel","disperse",
  "disseminate","dissident","dissolution","dissonance","distend","distill","divergent",
  "divest","dormant","dour","dupe","duplicity","ebullient","edify","efface","effervescent",
  "effigy","effrontery","effulgent","elated","elegy","elicit","eloquent","emaciated",
  "embellish","enervate","engender","enhance","enmity","ennui","enthrall","epicure",
  "epilogue","equanimity","equivocate","eulogy","euphemism","euphony","evanescent",
  "exacting","exculpate","execrable","exhort","exigency","exonerate","exorbitant",
  "expedient","expiate","explicit","exploit","expunge","extant","extraneous","extrapolate",
  "exuberance","edinburgh","gloucester","leicester","worcester","yorkshire","greenwich",
  "thames","arkansas","illinois","nevada","oregon","hawaii","louisville","houston",
  "phoenix","boise","spokane","tucson","albuquerque","reykjavik","copenhagen","stockholm",
  "helsinki","munich","brussels","antwerp","lisbon","seville","valencia","istanbul",
  "ankara","dubai","doha","beirut","amman","nairobi","johannesburg","auckland",
  "wellington","melbourne","sydney","beijing","shanghai","kyoto","seoul","bangkok",
  "hanoi","jakarta","manila","mumbai","delhi","chennai","karachi","tehran","baghdad",
  "damascus","jerusalem","cairo","lagos","qatar",
];

const CATEGORY_HINTS = {
  bechamel: "food", hollandaise: "food", macaroon: "food", vinaigrette: "food",
  zucchini: "food", espresso: "food", caramel: "food", syrup: "food", pecan: "food",
  pistachio: "food", macadamia: "food", sherbet: "food", vegetable: "food", chocolate: "food",
  piquant: "food", larynx: "medical", pneumonia: "medical", asthma: "medical",
  diphtheria: "medical", veterinary: "medical", prescription: "medical", barbiturate: "medical",
  virulent: "medical", athlete: "sports", rhetoric: "arts", onomatopoeia: "arts",
  silhouette: "arts", vignette: "arts", homage: "arts", calliope: "arts", paradigm: "business",
  bureaucracy: "business", hierarchy: "business", echelon: "business", rapport: "business",
  subpoena: "law", irrevocable: "law", prerogative: "law", detritus: "science",
  aluminum: "science", aluminium: "science", nuclear: "science", laboratory: "science",
  temperature: "science", arctic: "nature", lilac: "nature", chimera: "mythology",
  edinburgh: "places", gloucester: "places", leicester: "places", worcester: "places",
  yorkshire: "places", greenwich: "places", thames: "places", arkansas: "places",
  illinois: "places", nevada: "places", oregon: "places", hawaii: "places",
  louisville: "places", houston: "places", phoenix: "places", boise: "places",
  spokane: "places", tucson: "places", albuquerque: "places", reykjavik: "places",
  copenhagen: "places", stockholm: "places", helsinki: "places", munich: "places",
  brussels: "places", antwerp: "places", lisbon: "places", seville: "places",
  valencia: "places", istanbul: "places", ankara: "places", dubai: "places",
  doha: "places", beirut: "places", amman: "places", nairobi: "places",
  johannesburg: "places", auckland: "places", wellington: "places", melbourne: "places",
  sydney: "places", beijing: "places", shanghai: "places", kyoto: "places",
  seoul: "places", bangkok: "places", hanoi: "places", jakarta: "places",
  manila: "places", mumbai: "places", delhi: "places", chennai: "places",
  karachi: "places", tehran: "places", baghdad: "places", damascus: "places",
  jerusalem: "places", cairo: "places", lagos: "places", qatar: "places",
};

function loadCatalog() {
  return JSON.parse(readFileSync(join(ROOT, "data/catalog.json"), "utf8"));
}

function sleepSync(ms) {
  const end = Date.now() + ms;
  while (Date.now() < end) {
    /* spin — only used for rare Windows file-lock retries */
  }
}

function saveCatalog(catalog) {
  const target = join(ROOT, "data/catalog.json");
  const body = JSON.stringify(catalog, null, 2) + "\n";
  let lastErr = null;
  for (let i = 0; i < 10; i++) {
    try {
      writeFileSync(target, body);
      return;
    } catch (err) {
      lastErr = err;
      sleepSync(200 * (i + 1));
    }
  }
  throw lastErr || new Error("catalog save failed");
}

function loadProgress() {
  if (!RESUME || !existsSync(PROGRESS)) return { done: {}, added: 0, skipped: 0 };
  try {
    return JSON.parse(readFileSync(PROGRESS, "utf8"));
  } catch {
    return { done: {}, added: 0, skipped: 0 };
  }
}

function saveProgress(p) {
  mkdirSync(join(ROOT, "data"), { recursive: true });
  p.updatedAt = new Date().toISOString();
  writeFileSync(PROGRESS, JSON.stringify(p, null, 2));
}

function existingSet(catalog) {
  const set = new Set();
  for (const cat of catalog.categories) {
    for (const w of cat.words) set.add(String(w).toLowerCase());
  }
  return set;
}

function hasDefinition(entry) {
  for (const meaning of entry?.meanings || []) {
    for (const def of meaning.definitions || []) {
      if (def?.definition && String(def.definition).trim().length > 8) return true;
    }
  }
  return false;
}

function refreshHubs(catalog) {
  mkdirSync(join(ROOT, "words"), { recursive: true });
  writeFileSync(join(ROOT, "words", "index.html"), renderWordsHub(catalog.categories));
  for (const category of catalog.categories) {
    const words = [...new Set(category.words.map((w) => w.toLowerCase()))].sort();
    mkdirSync(join(ROOT, category.slug), { recursive: true });
    writeFileSync(join(ROOT, category.slug, "index.html"), renderCategoryPage(category, words));
  }
}

function writeWordIndex(catalog) {
  const flat = [];
  for (const category of catalog.categories) {
    for (const word of category.words) {
      flat.push({
        word: word.toLowerCase(),
        category: category.slug,
        path: `/${category.slug}/${word.toLowerCase()}/`,
      });
    }
  }
  writeFileSync(
    join(ROOT, "assets/word-index.js"),
    `window.SPEAKUR_WORD_INDEX = ${JSON.stringify(flat)};\n`,
  );
}

async function main() {
  const catalog = loadCatalog();
  const have = existingSet(catalog);
  const progress = loadProgress();
  const queue = [];
  const seen = new Set();
  for (const raw of CANDIDATES) {
    const word = String(raw).trim().toLowerCase().replace(/[^a-z'-]/g, "");
    if (!word || word.length < 2 || have.has(word) || seen.has(word)) continue;
    if (progress.done[word]) continue;
    seen.add(word);
    queue.push(word);
  }

  console.log(`Missing candidates to try: ${queue.length} (limit=${LIMIT}, delay=${DELAY}ms)`);
  let added = 0;
  let skipped = 0;

  for (const word of queue) {
    if (added >= LIMIT) break;
    process.stdout.write(`? ${word} ... `);
    try {
      const looked = await lookupWord(word);
      if (!looked.ok || !looked.entry || !hasDefinition(looked.entry)) {
        console.log("skip (no definition)");
        progress.done[word] = "no-def";
        skipped += 1;
        saveProgress(progress);
        await sleep(DELAY);
        continue;
      }
      let syllables = await syllableCount(word);
      // If Datamuse already answered via lookup path, try once more combined
      if (!syllables) {
        await sleep(200);
        syllables = await syllableCount(word);
      }
      if (!syllables || Number(syllables) < 1) {
        console.log("skip (no syllables)");
        progress.done[word] = "no-syl";
        skipped += 1;
        saveProgress(progress);
        await sleep(DELAY);
        continue;
      }

      let categorySlug = CATEGORY_HINTS[word] || guessCategory(word, catalog);
      if (!catalog.categories.some((c) => c.slug === categorySlug)) {
        categorySlug = "everyday";
      }
      const category = catalog.categories.find((c) => c.slug === categorySlug);
      category.words.push(word);
      category.words = [...new Set(category.words.map((w) => w.toLowerCase()))].sort();
      have.add(word);

      const pageDir = join(ROOT, category.slug, word);
      mkdirSync(pageDir, { recursive: true });
      writeFileSync(
        join(pageDir, "index.html"),
        renderWordPage({
          category,
          word,
          entry: looked.entry,
          syllables,
          siblings: category.words,
        }),
      );

      added += 1;
      progress.added = (progress.added || 0) + 1;
      progress.done[word] = `added:${category.slug}`;
      console.log(`added /${category.slug}/${word}/ (${syllables} syl)`);
      // Persist catalog periodically (never fail the add on Windows file locks)
      if (added % 5 === 0) {
        try {
          saveCatalog(catalog);
        } catch (err) {
          console.warn(` (catalog save deferred: ${err.message})`);
        }
        saveProgress(progress);
      }
    } catch (err) {
      console.log(`error ${err.message}`);
      progress.done[word] = `error:${err.message}`;
      skipped += 1;
    }
    saveProgress(progress);
    await sleep(DELAY);
  }

  saveCatalog(catalog);
  refreshHubs(catalog);
  writeWordIndex(catalog);
  saveProgress(progress);
  console.log(`Done. added=${added} skipped=${skipped} totalAdded=${progress.added || added}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
