// Rozpoznawanie produktów z listy zakupów (dowolny z 12 języków, z literówkami)
// i dopasowanie ich do holenderskich nazw promocji.
import { LANGS, ROWS } from './data/glossary.js';

const MARKS = /[̀-ͯ]/g;

// Małe litery, bez akcentów, tylko a-z / cyrylica / cyfry. Stosowane do słownika i do wpisu,
// więc „Käse”, „kase” i „KASE” to to samo.
export function norm(s) {
  return String(s)
    .toLowerCase()
    .replace(/ł/g, 'l').replace(/ß/g, 'ss').replace(/ı/g, 'i').replace(/đ/g, 'd')
    .replace(/ø/g, 'o').replace(/æ/g, 'ae').replace(/œ/g, 'oe')
    .normalize('NFD').replace(MARKS, '')
    .replace(/['’ʼ`´]/g, '')
    .replace(/[^a-z0-9Ѐ-ӿ]+/g, ' ')
    .trim();
}

// ---- słownik ----
export const concepts = ROWS.map((row, id) => {
  const cols = row.split(';');
  const names = {};
  LANGS.forEach((l, k) => { names[l] = cols[k].split('|').map((x) => x.trim()).filter(Boolean); });
  return { id, names };
});

const termIndex = new Map(); // znormalizowany termin -> [id pojęcia] (w kolejności słownika)
const termLangs = new Map(); // „termin|id” -> języki, w których to słowo opisuje to pojęcie
const allTerms = []; // { t, ci, lang }
concepts.forEach((c) => {
  for (const lang of LANGS) {
    for (const name of c.names[lang]) {
      const t = norm(name);
      if (!t) continue;
      allTerms.push({ t, ci: c.id, lang });
      const list = termIndex.get(t) ?? [];
      if (!list.includes(c.id)) list.push(c.id);
      termIndex.set(t, list);
      const key = `${t}|${c.id}`;
      termLangs.set(key, (termLangs.get(key) ?? '') + `,${lang}`);
    }
  }
});

export const displayName = (ci, lang) => concepts[ci].names[lang]?.[0] ?? concepts[ci].names.en[0];
export const dutchName = (ci) => concepts[ci].names.nl[0];
export const nlTerms = (ci) => [...new Set(concepts[ci].names.nl.map(norm).filter(Boolean))];

// ---- odległość edycyjna (Damerau-Levenshtein, wariant OSA) ----
export function distance(a, b, limit = 3) {
  if (a === b) return 0;
  if (Math.abs(a.length - b.length) > limit) return limit + 1;
  const prev2 = [];
  let prev = Array.from({ length: b.length + 1 }, (_, j) => j);
  for (let i = 1; i <= a.length; i++) {
    const cur = [i];
    let rowMin = i;
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      let v = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + cost);
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) v = Math.min(v, prev2[j - 2] + 1);
      cur[j] = v;
      if (v < rowMin) rowMin = v;
    }
    if (rowMin > limit) return limit + 1;
    prev2.length = 0; prev2.push(...prev);
    prev = cur;
  }
  return prev[b.length];
}

// Ile literówek tolerujemy: krótkie słowa muszą być dokładne.
const maxDist = (len) => (len <= 3 ? 0 : len <= 7 ? 1 : 2);

const UNITS = new Set(['kg', 'g', 'gr', 'l', 'ml', 'szt', 'sztuk', 'st', 'stuks', 'pcs', 'x', 'pak',
  'pack', 'paczka', 'opakowanie', 'litr', 'litry', 'litrow', 'gram', 'kilo']);
const isQty = (t) => /^\d+[a-z]*$/.test(t) || UNITS.has(t);

// Odmiana: „pomidorów”/„pomidory”, „jabłek”/„jabłka”, „masła”/„masło” – wspólny początek, różni się końcówka.
function stemConcepts(token) {
  if (token.length < 3) return [];
  const best = new Map();
  for (const { t, ci } of allTerms) {
    if (t.length < 3 || t.includes(' ')) continue;
    let cp = 0;
    while (cp < token.length && cp < t.length && token[cp] === t[cp]) cp++;
    const shorter = Math.min(token.length, t.length);
    const rest = Math.max(token.length, t.length) - cp;
    // krótkie terminy („ser”) tylko z krótką końcówką („sera”, „serem”) – inaczej łapałyby przypadkowe słowa
    const ok = t.length === 3 ? cp === 3 && token.length <= 5 : cp >= 4 && cp >= shorter - 2 && rest <= 3;
    if (ok && (!best.has(ci) || rest < best.get(ci))) best.set(ci, rest);
  }
  return [...best].sort((a, b) => a[1] - b[1]).map(([ci, rest]) => ({ ci, rest }));
}

function fuzzyConcepts(str) {
  const limit = maxDist(str.length);
  if (!limit) return [];
  const best = new Map();
  for (const { t, ci } of allTerms) {
    if (Math.abs(t.length - str.length) > limit) continue;
    const d = distance(str, t, limit);
    if (d <= limit && (!best.has(ci) || d < best.get(ci))) best.set(ci, d);
  }
  return [...best].map(([ci, dist]) => ({ ci, dist })).sort((a, b) => a.dist - b.dist);
}

// Słownik słów z nazw promocji – pozwala poprawiać też literówki w holenderskich słowach.
export function buildVocab(deals) {
  const v = new Set();
  for (const d of deals) for (const w of norm(d.name).split(' ')) if (w.length >= 4) v.add(w);
  return v;
}

/**
 * Zamienia wpis użytkownika na pojęcie ze słownika.
 * status: exact | ambiguous | fuzzy | dutch | dutch-fuzzy | unknown
 * ci – wybrane pojęcie, alts – inne możliwości („czy chodziło o…”), terms – szukane słowa po holendersku.
 */
/** Pojęcia opisywane danym słowem; te, które to słowo ma w języku użytkownika, są pierwsze („pasta” po turecku to ciasto). */
function candidates(term, lang) {
  const list = termIndex.get(term);
  if (!list || !lang) return list;
  const mine = list.filter((ci) => termLangs.get(`${term}|${ci}`).includes(`,${lang}`));
  return mine.length ? [...mine, ...list.filter((ci) => !mine.includes(ci))] : list;
}

/** Wynik dla ręcznie wybranego produktu (chip „czy chodziło o…”): bez zgadywania i bez zapętleń. */
export const forConcept = (ci, raw = '') => ({ raw, status: 'exact', ci, alts: [], terms: nlTerms(ci) });

export function resolve(raw, vocab = new Set(), translated = null, lang = null) {
  const tokens = norm(raw).split(' ').filter((t) => t && !isQty(t));
  const phrase = tokens.join(' ');
  const out = (status, ci, alts = [], extra = {}) =>
    ({ raw, status, ci, alts, terms: ci != null ? nlTerms(ci) : tokens, ...extra });
  if (!phrase) return out('unknown', null);

  // 1. dokładnie (cała fraza, potem pojedyncze słowa)
  const exact = candidates(phrase, lang) ?? tokens.map((t) => candidates(t, lang)).find(Boolean);
  if (exact) return out(exact.length > 1 ? 'ambiguous' : 'exact', exact[0], exact.slice(1));

  // 2. odmieniona forma (końcówka inna niż w słowniku)
  // (z kilku słów wygrywa najlepsze dopasowanie, a przy remisie dłuższe słowo: „piersi z kurczaka” → kurczak)
  const stems = tokens.flatMap((t) => stemConcepts(t).map((s) => ({ ...s, len: t.length })))
    .sort((a, b) => a.rest - b.rest || b.len - a.len);
  if (stems.length) {
    const ids = [...new Set(stems.map((s) => s.ci))];
    return out('stem', ids[0], ids.slice(1, 4));
  }

  // 3. dokładne holenderskie słowo z promocji (zanim zgadniemy literówkę)
  for (const t of tokens) if (vocab.has(t)) return out('dutch', null, [], { terms: [t] });

  // 4. literówki
  const cands = new Map();
  for (const s of new Set([phrase, ...tokens])) {
    if (s.length < 4) continue;
    for (const { ci, dist } of fuzzyConcepts(s)) if (!cands.has(ci) || dist < cands.get(ci)) cands.set(ci, dist);
  }
  if (cands.size) {
    const ranked = [...cands].sort((a, b) => a[1] - b[1]).map(([ci]) => ci);
    return out('fuzzy', ranked[0], ranked.slice(1, 5));
  }

  // 5. holenderskie słowo z promocji z literówką
  let bestWord = null;
  let bestD = 99;
  for (const t of tokens) {
    const limit = maxDist(t.length);
    if (!limit) continue;
    for (const w of vocab) {
      if (Math.abs(w.length - t.length) > limit) continue;
      const d = distance(t, w, limit);
      if (d <= limit && d < bestD) { bestD = d; bestWord = w; }
    }
  }
  if (bestWord) return out('dutch-fuzzy', null, [], { terms: [bestWord], word: bestWord });

  // 6. nic nie pasuje: jeśli mamy tłumaczenie na holenderski (translate.js), rozpoznajemy je
  if (translated) {
    const r = resolve(translated, vocab, null, 'nl');
    if (r.status !== 'unknown') return { ...r, raw, status: 'translated', word: norm(translated) };
    return { raw, status: 'translated', ci: null, alts: [], terms: norm(translated).split(' ').filter(Boolean), word: norm(translated) };
  }
  return out('unknown', null);
}

/** Podpowiedzi podczas pisania: początek słowa albo słowo z literówką. */
export function suggest(input, lang, n = 6) {
  const s = norm(input);
  if (s.length < 2) return [];
  const best = new Map();
  const consider = (ci, score) => { if (!best.has(ci) || score < best.get(ci)) best.set(ci, score); };
  const limit = maxDist(s.length);
  for (const { t, ci, lang: l } of allTerms) {
    const langBonus = l === lang ? 0 : 0.5;
    if (t.startsWith(s)) consider(ci, langBonus + (t.length - s.length) / 100);
    else if (limit && distance(s, t.slice(0, s.length), limit) <= limit) consider(ci, 1 + langBonus);
    else if (limit && Math.abs(t.length - s.length) <= limit && distance(s, t, limit) <= limit) consider(ci, 1.5 + langBonus);
  }
  return [...best].sort((a, b) => a[1] - b[1]).slice(0, n).map(([ci]) => ci);
}

// ---- dopasowanie do promocji ----
// Po tych słowach zaczynają się dodatki, nie produkt: „Croissants MET roomboter”, „Tonijn IN olie”.
const CONNECTORS = new Set(['met', 'voor', 'zonder', 'in', 'op', 'bij', 'gevuld', 'smaak']);

const dealCache = new WeakMap();
function tokensOf(deal) {
  let c = dealCache.get(deal);
  if (!c) {
    const n = norm(deal.name);
    const tokens = n.split(' ');
    // nazwa produktu = słowa przed pierwszym łącznikiem, bez końcowych ilości („500 g”, „6 pack”)
    const cut = tokens.findIndex((t, i) => i > 0 && CONNECTORS.has(t));
    let head = (cut > 0 ? tokens.slice(0, cut) : tokens).filter((t, i, a) => !(isQty(t) && i > 0 && a.slice(i).every(isQty)));
    if (!head.length) head = tokens;
    c = { n: ` ${n} `, tokens, head, headText: ` ${head.join(' ')} ` };
    dealCache.set(deal, c);
  }
  return c;
}

// Jakie pojęcie ze słownika oznacza wyraz („croissants” → croissant, „ijskoffie” → koffie, „chocolademelk” → chocolademelk).
const headCache = new Map();
function conceptOfWord(word) {
  if (headCache.has(word)) return headCache.get(word);
  let ci = termIndex.get(word)?.[0] ?? null;
  if (ci == null) { // złożenie: najdłuższy znany termin na końcu wyrazu
    let bestLen = 0;
    for (const { t, ci: c } of allTerms) {
      if (t.length >= 4 && t.length > bestLen && !t.includes(' ') && word.endsWith(t)) { bestLen = t.length; ci = c; }
    }
  }
  if (ci == null) { // odmieniona forma znanego słowa: tomaatjes, appels (nie: „room” jako początek „roomijs”)
    for (const { t, ci: c } of allTerms) {
      if (t.length >= 4 && !t.includes(' ') && word.startsWith(t) && DUTCH_ENDING.test(word.slice(t.length))) { ci = c; break; }
    }
  }
  headCache.set(word, ci);
  return ci;
}

// Karma dla zwierząt często zawiera nazwę mięsa („kip”, „rund”) – pomijamy ją, chyba że o nią chodzi.
const PET = /^(honden|katten)/;
const DUTCH_ENDING = /^(s|n|e|en|es|je|jes|tje|tjes|etje|etjes|pje|pjes|kes)$/;

// Holenderskie złożenia kończące się tak samo jak szukane słowo, ale znaczące co innego.
const FALSE_COMPOUND = { appel: /aardappel|granaatappel|dennenappel/, appels: /aardappel|granaatappel|dennenappel/, olie: /folie$/ };

function scoreDeal(deal, terms, ci) {
  const { tokens, head, headText } = tokensOf(deal);
  if (tokens.some((t) => PET.test(t)) && !terms.some((t) => PET.test(t))) return 0;
  let best = 0;
  for (const term of terms) {
    if (term.includes(' ')) { if (headText.includes(` ${term} `)) best = Math.max(best, 3); continue; }
    for (const tok of head) {
      if (FALSE_COMPOUND[term]?.test(tok)) continue;
      if (tok === term) best = Math.max(best, 3);
      else if (term.length >= 4 && tok.endsWith(term)) best = Math.max(best, 2); // złożenia: „halfvolle”+„melk”
      // liczba mnoga / zdrobnienie (tomaat → tomaatjes), ale nie „boter” → „boterham”, „melk” → „melkchocolade”
      else if (term.length >= 4 && tok.startsWith(term) && DUTCH_ENDING.test(tok.slice(term.length))) best = Math.max(best, 2);
    }
  }
  // Ostatni wyraz nazwy mówi, czym produkt jest. Jeśli to inny produkt ze słownika
  // („roomboter CROISSANTS”, „CHOCOLADEMELK”), szukane słowo to tylko dodatek – pomijamy.
  if (best && ci != null) {
    const hc = conceptOfWord(head[head.length - 1]);
    if (hc != null && hc !== ci) return 0;
  }
  return best;
}

/** Promocje pasujące do szukanych słów (tylko pewne trafienia), od najtańszej. */
export function matchDeals(terms, deals, ci = null) {
  const scored = [];
  for (const d of deals) { const s = scoreDeal(d, terms, ci); if (s) scored.push([d, s]); }
  return scored
    .map(([d]) => d)
    .sort((a, b) => (a.price ?? Infinity) - (b.price ?? Infinity)
      || (Date.parse(a.validUntil) || Infinity) - (Date.parse(b.validUntil) || Infinity));
}
