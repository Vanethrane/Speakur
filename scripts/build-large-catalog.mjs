/**
 * Build a large word catalog prioritized by Google search frequency
 * ("how to pronounce" demand + Trillion Word Corpus lists), then category fillers.
 *
 * Usage:
 *   node scripts/build-large-catalog.mjs
 *   node scripts/build-large-catalog.mjs --target=60000
 */
import { readFileSync, writeFileSync, existsSync, renameSync, unlinkSync } from "fs";
import { join } from "path";
import { PRIORITY_SEEDS } from "../data/seeds/priority-seeds.mjs";

const ROOT = process.cwd();
const targetArg = process.argv.find((a) => a.startsWith("--target="));
const TARGET = targetArg ? Number(targetArg.split("=")[1]) : 70000;
const SCALE = TARGET / 10000;

function sleepSync(ms) {
  const end = Date.now() + ms;
  while (Date.now() < end) {
    /* busy wait for sync retry */
  }
}

function writeJsonAtomic(path, value) {
  const body = JSON.stringify(value, null, 2) + "\n";
  const tmp = `${path}.tmp`;
  for (let i = 1; i <= 10; i++) {
    try {
      writeFileSync(tmp, body);
      if (existsSync(path)) {
        try {
          unlinkSync(path);
        } catch {
          /* locked — try rename over it */
        }
      }
      try {
        renameSync(tmp, path);
      } catch {
        writeFileSync(path, body);
        if (existsSync(tmp)) unlinkSync(tmp);
      }
      return;
    } catch (err) {
      if (i === 10) throw err;
      console.warn(`Retry ${i}/10 writing ${path}: ${err.code || err.message}`);
      sleepSync(1000 * i);
    }
  }
}

const CATEGORY_META = [
  { slug: "food", title: "Food & drink", description: "Menu, spice, and dish pronunciations people search most.", target: Math.round(1200 * SCALE) },
  { slug: "places", title: "Places", description: "Cities, countries, and regions that trip people up.", target: Math.round(1100 * SCALE) },
  { slug: "names", title: "Names", description: "Given names, surnames, and public figures often looked up.", target: Math.round(900 * SCALE) },
  { slug: "brands", title: "Brands", description: "Fashion, cars, tech, and consumer brands.", target: Math.round(700 * SCALE) },
  { slug: "medical", title: "Medical", description: "Clinical and health terms with clear audio pages.", target: Math.round(1100 * SCALE) },
  { slug: "animals", title: "Animals", description: "Breeds and species that are easy to mispronounce.", target: Math.round(600 * SCALE) },
  { slug: "science", title: "Science", description: "Science and nature vocabulary.", target: Math.round(800 * SCALE) },
  { slug: "business", title: "Business", description: "Workplace, finance, and marketing terms.", target: Math.round(500 * SCALE) },
  { slug: "everyday", title: "Everyday English", description: "Common words people second-guess out loud.", target: Math.round(1800 * SCALE) },
  { slug: "arts", title: "Arts & culture", description: "Music, dance, literature, and art terms.", target: Math.round(450 * SCALE) },
  { slug: "sports", title: "Sports", description: "Sports, fitness, and competition vocabulary.", target: Math.round(400 * SCALE) },
  { slug: "tech", title: "Tech", description: "Software, internet, and computing words.", target: Math.round(500 * SCALE) },
  { slug: "nature", title: "Nature", description: "Weather, geography, and outdoors terms.", target: Math.round(400 * SCALE) },
  { slug: "law", title: "Law", description: "Legal and courtroom vocabulary.", target: Math.round(300 * SCALE) },
  { slug: "mythology", title: "Mythology", description: "Gods, legends, and mythic creatures.", target: Math.round(250 * SCALE) },
];

const BLOCK = new Set([
  "ass", "shit", "damn", "hell", "crap", "piss", "slut", "whore", "fuck", "fucking",
  "bastard", "bitch", "dick", "cock", "pussy", "sex", "sexy", "porn", "nude", "naked",
]);

const STOP = new Set([
  "a", "an", "the", "and", "or", "but", "if", "of", "to", "in", "on", "for", "at", "by",
  "is", "are", "was", "were", "be", "been", "am", "do", "does", "did", "i", "you", "he",
  "she", "it", "we", "they", "my", "your", "his", "her", "its", "our", "their", "this",
  "that", "these", "those", "with", "from", "as", "into", "about", "over", "after",
]);

function normalize(raw) {
  return String(raw || "")
    .trim()
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/['']/g, "'")
    .replace(/[^a-z'-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function isValid(word) {
  if (!word || word.length < 2 || word.length > 40) return false;
  if (!/^[a-z][a-z'-]*$/.test(word)) return false;
  if (word.includes("--")) return false;
  if (BLOCK.has(word)) return false;
  if (STOP.has(word)) return false;
  if (/^\d/.test(word)) return false;
  // Windows reserved device names cannot be directory paths
  if (/^(con|prn|aux|nul|com[1-9]|lpt[1-9])$/i.test(word)) return false;
  return true;
}

function classify(word) {
  if (/osis$|itis$|ectomy$|ology$|emia$|pathy$|phobia$|therapy$|clinic|patient|surgery|vaccine|symptom|cardio|neuro|derm|gastro|hepat|nephro|pulmon|hemat|onco|pharma|anesthes|biopsy|tumor|cancer|virus|bacteria|antibio|disease|syndrome|diagnosis|prognosis|physician|hospital|medical|clinical|anatomy|artery|vein|blood|bone|muscle|organ|tissue|immune|infect|inflam/.test(word))
    return "medical";
  if (/berry$|latte|espresso|sauce|cheese|bread|wine|spice|fruit|meat|soup|cake|tea$|coffee|cuisine|recipe|menu|pastry|dessert|cocktail|whiskey|bourbon|sushi|ramen|taco|pizza|pasta|salad|grill|roast|bake|fry|boil|steam|ferment|pickle|chocolate|vanilla|cinnamon|garlic|onion|pepper|sugar|flour|butter|cream|yogurt|juice|soda|beer|vodka|rum|gin|brandy|liqueur|cuisine|gourmet|culinary|appetite|hungry|dinner|lunch|breakfast|snack|ingredient|seasoning|marinade|garnish/.test(word))
    return "food";
  if (/ology$|metry$|scopy$|particle|atom|cell|gene|quantum|species|planet|chemical|physics|biology|geology|astro|cosmo|thermo|electro|magnet|photon|neutron|proton|enzyme|protein|molecule|genome|nucleus|formula|element|compound|reaction|experiment|laboratory|hypothesis|theory|scientific|researcher|scientist/.test(word))
    return "science";
  if (/market|finance|equity|revenue|vendor|client|strategy|portfolio|synergy|analytic|invest|capital|dividend|merger|audit|brand|sales|profit|budget|invoice|payroll|shareholder|stakeholder|business|company|corporate|commerce|retail|wholesale|accounting|banking|loan|credit|debit|interest|mortgage|insurance|economy|economic|manager|executive|office|employee|employer|career|salary|wage|negotiate|contract|startup|entrepreneur/.test(word))
    return "business";
  if (/algorithm|software|hardware|browser|server|database|encrypt|cyber|pixel|router|javascript|python|docker|cloud|api|http|wifi|bluetooth|github|devops|frontend|backend|machine|neural|prompt|token|computer|digital|internet|website|online|email|password|download|upload|wireless|mobile|smartphone|laptop|desktop|processor|memory|storage|network|protocol|programming|developer|coding|application|technology|tech|silicon|semiconductor|robot|automation/.test(word))
    return "tech";
  if (/ball|sport|olympi|athlet|gym|swim|ski|skate|cycle|marathon|boxing|wrestl|tennis|golf|hockey|soccer|football|basket|volley|racing|triathlon|fencing|judo|karate|coach|player|team|stadium|tournament|championship|medal|score|goal|touchdown|homerun|pitcher|quarterback|referee|umpire|fitness|workout|exercise|training|compete|athlete|championship/.test(word))
    return "sports";
  if (/ballet|opera|symphony|orchestra|sonata|choir|chorus|novel|poem|poetry|theater|theatre|cinema|sculpt|paint|canvas|gallery|museum|genre|metaphor|sonnet|haiku|choreograph|piano|violin|guitar|flute|music|melody|harmony|rhythm|artist|painter|sculptor|author|writer|literature|drama|comedy|tragedy|actor|actress|director|film|movie|concert|festival|exhibition|creative|aesthetic|classical|jazz|blues|rock|folk/.test(word))
    return "arts";
  if (/mountain|river|ocean|forest|desert|glacier|volcano|earthquake|hurricane|tornado|climate|weather|cloud|rain|snow|tide|canyon|valley|prairie|tundra|reef|island|peninsula|nature|natural|environment|ecology|wildlife|wilderness|landscape|terrain|geography|geological|atmospheric|meteorolog|storm|thunder|lightning|flood|drought|wildfire|sunrise|sunset|horizon|meadow|grove|woodland|jungle|swamp|marsh|creek|stream|waterfall|coast|shore|beach|cliff/.test(word))
    return "nature";
  if (/court|judge|jury|lawyer|attorney|plaintiff|defendant|statute|felony|misdemeanor|subpoena|verdict|indictment|contract|tort|liability|jurisdiction|constitution|amendment|probation|parole|legal|lawful|illegal|justice|judicial|legislation|legislat|congress|senate|parliament|criminal|civil|lawsuit|litigation|prosecution|defense|witness|evidence|testimony|oath|appeal|sentence|prison|jail|bail|warrant|arrest|police|sheriff|magistrate/.test(word))
    return "law";
  if (/zeus|odin|thor|apollo|athena|hercules|merlin|dragon|phoenix|unicorn|titan|valkyrie|medusa|minotaur|anubis|osiris|vishnu|shiva|ganesha|mythology|legend|myth|goddess|deity|olympian|norse|egyptian|greek|roman|celtic|folklore|fairy|elf|dwarf|goblin|troll|demon|angel|spirit|oracle|prophecy|quest|hero|heroine|epic|saga|legend/.test(word))
    return "mythology";
  if (/dog|cat|bird|fish|horse|cow|sheep|goat|pig|bear|wolf|lion|tiger|elephant|whale|dolphin|snake|lizard|frog|insect|spider|butterfly|eagle|hawk|owl|deer|moose|bison|breed|puppy|kitten|animal|mammal|reptile|amphibian|rodent|canine|feline|avian|species|habitat|zoo|wildlife|fauna|pet|livestock|cattle|poultry|fowl|creature|beast|predator|prey/.test(word))
    return "animals";
  // Place-ish heuristics
  if (/ville$|town$|burg$|chester$|shire$|apolis$|opolis$|istan$|land$|stan$|esia$|ania$|oria$|city|county|province|district|capital|republic|kingdom|island|harbor|harbour|beach|springs|falls|heights|grove|hills|park|fort|mount|saint|san-|los-|las-|new-/.test(word))
    return "places";
  return null;
}

function loadLines(path) {
  if (!existsSync(path)) return [];
  return readFileSync(path, "utf8")
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
}

function addWord(buckets, used, word, preferred) {
  const w = normalize(word);
  if (!isValid(w) || used.has(w)) return false;
  let slug = preferred;
  if (!slug || !buckets[slug]) slug = classify(w) || "everyday";
  if (!buckets[slug]) slug = "everyday";
  buckets[slug].add(w);
  used.add(w);
  return true;
}

function targetOf(slug) {
  return CATEGORY_META.find((c) => c.slug === slug)?.target || 9999;
}

function main() {
  const buckets = Object.fromEntries(CATEGORY_META.map((c) => [c.slug, new Set()]));
  const used = new Set();

  const seedOrder = [
    "food", "places", "names", "brands", "medical", "everyday", "animals",
    "science", "business", "arts", "sports", "tech", "nature", "law", "mythology",
  ];
  for (const slug of seedOrder) {
    for (const word of PRIORITY_SEEDS[slug] || []) {
      addWord(buckets, used, word, slug);
    }
  }

  try {
    const existing = JSON.parse(readFileSync(join(ROOT, "data/catalog.json"), "utf8"));
    for (const cat of existing.categories || []) {
      for (const word of cat.words || []) {
        // Don't reassign across categories if already placed from seeds
        if (!used.has(normalize(word))) addWord(buckets, used, word, cat.slug);
      }
    }
  } catch {
    /* ignore */
  }

  console.log(`After seeds: ${used.size} unique words`);

  const freq = [
    ...loadLines(join(ROOT, "data/seeds/google-20k.txt")),
    ...loadLines(join(ROOT, "data/seeds/google-10000.txt")),
    ...loadLines(join(ROOT, "data/seeds/google-50k.txt")),
    ...loadLines(join(ROOT, "data/seeds/google-100k.txt")),
    ...loadLines(join(ROOT, "data/seeds/google-500k.txt")),
  ];
  const alpha = loadLines(join(ROOT, "data/seeds/words-alpha-sample.txt"))
    .filter((w) => w.length >= 4 && w.length <= 16);

  console.log(`Target catalog size: ${TARGET}`);

  // Pass A: fill topical categories toward targets only
  for (const pool of [freq, alpha]) {
    for (const word of pool) {
      if (used.size >= TARGET) break;
      const guessed = classify(word);
      if (!guessed || guessed === "everyday") continue;
      if (buckets[guessed].size >= targetOf(guessed)) continue;
      addWord(buckets, used, word, guessed);
    }
  }

  console.log(`After topical fill: ${used.size} unique words`);
  for (const c of CATEGORY_META) {
    if (c.slug === "everyday") continue;
    console.log(`  ${c.slug}: ${buckets[c.slug].size}/${c.target}`);
  }

  // Pass B: fill everyday toward its target from high-freq first
  for (const word of freq) {
    if (buckets.everyday.size >= targetOf("everyday")) break;
    addWord(buckets, used, word, "everyday");
  }

  // Pass C: grow to TARGET — prefer underfilled topical, else everyday
  for (const pool of [freq, alpha]) {
    for (const word of pool) {
      if (used.size >= TARGET) break;
      const guessed = classify(word);
      if (guessed && buckets[guessed].size < targetOf(guessed)) {
        addWord(buckets, used, word, guessed);
      } else {
        addWord(buckets, used, word, "everyday");
      }
    }
  }

  console.log(`After expansion: ${used.size} unique words`);

  // Trim overflow from everyday longest-first
  if (used.size > TARGET) {
    const everyday = [...buckets.everyday].sort((a, b) => b.length - a.length || a.localeCompare(b));
    while (used.size > TARGET && everyday.length) {
      const w = everyday.pop();
      buckets.everyday.delete(w);
      used.delete(w);
    }
  }

  const categories = CATEGORY_META.map((meta) => ({
    slug: meta.slug,
    title: meta.title,
    description: meta.description,
    words: [...buckets[meta.slug]].sort(),
  })).filter((c) => c.words.length > 0);

  const catalog = { categories };
  const count = categories.reduce((n, c) => n + c.words.length, 0);
  writeJsonAtomic(join(ROOT, "data/catalog.json"), catalog);

  console.log("\nCatalog written:");
  for (const c of categories) {
    console.log(`  ${c.slug.padEnd(12)} ${String(c.words.length).padStart(5)}`);
  }
  console.log(`  TOTAL        ${count}`);
}

main();
