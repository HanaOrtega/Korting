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

const termIndex = new Map(); // znormalizowany termin -> [id pojęcia]
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
    }
  }
});

export const displayName = (ci, lang) => concepts[ci].names[lang]?.[0] ?? concepts[ci].names.en[0];
export const dutchName = (ci) => concepts[ci].names.nl[0];
const nlTerms = (ci) => [...new Set(concepts[ci].names.nl.map(norm).filter(Boolean))];

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
export function resolve(raw, vocab = new Set()) {
  const tokens = norm(raw).split(' ').filter((t) => t && !isQty(t));
  const phrase = tokens.join(' ');
  const out = (status, ci, alts = [], extra = {}) =>
    ({ raw, status, ci, alts, terms: ci != null ? nlTerms(ci) : tokens, ...extra });
  if (!phrase) return out('unknown', null);

  // 1. dokładnie (cała fraza, potem pojedyncze słowa)
  const exact = termIndex.get(phrase) ?? tokens.map((t) => termIndex.get(t)).find(Boolean);
  if (exact) return out(exact.length > 1 ? 'ambiguous' : 'exact', exact[0], exact.slice(1));

  // 2. literówki
  const cands = new Map();
  for (const s of new Set([phrase, ...tokens])) {
    if (s.length < 4) continue;
    for (const { ci, dist } of fuzzyConcepts(s)) if (!cands.has(ci) || dist < cands.get(ci)) cands.set(ci, dist);
  }
  if (cands.size) {
    const ranked = [...cands].sort((a, b) => a[1] - b[1]).map(([ci]) => ci);
    return out('fuzzy', ranked[0], ranked.slice(1, 5));
  }

  // 3. holenderskie słowo z promocji (dokładnie lub z literówką)
  for (const t of tokens) if (vocab.has(t)) return out('dutch', null, [], { terms: [t] });
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
const dealCache = new WeakMap();
function tokensOf(deal) {
  let c = dealCache.get(deal);
  if (!c) { const n = norm(deal.name); c = { n: ` ${n} `, tokens: n.split(' ') }; dealCache.set(deal, c); }
  return c;
}

// Karma dla zwierząt często zawiera nazwę mięsa („kip”, „rund”) – pomijamy ją, chyba że o nią chodzi.
const PET = /^(honden|katten)/;

function scoreDeal(deal, terms) {
  const { n, tokens } = tokensOf(deal);
  if (tokens.some((t) => PET.test(t)) && !terms.some((t) => PET.test(t))) return 0;
  let best = 0;
  for (const term of terms) {
    if (term.includes(' ')) { if (n.includes(` ${term} `) || n.endsWith(` ${term} `)) best = Math.max(best, 3); continue; }
    for (const tok of tokens) {
      if (tok === term) best = Math.max(best, 3);
      else if (term.length >= 4 && tok.endsWith(term)) best = Math.max(best, 2); // złożenia: „halfvolle”+„melk”
      else if (term.length >= 4 && tok.startsWith(term)) best = Math.max(best, 1);
    }
  }
  return best;
}

/** Promocje pasujące do szukanych słów, od najtańszej. Słabe trafienia tylko gdy brak mocnych. */
export function matchDeals(terms, deals) {
  const scored = [];
  for (const d of deals) { const s = scoreDeal(d, terms); if (s) scored.push([d, s]); }
  const strong = scored.filter(([, s]) => s >= 2);
  return (strong.length ? strong : scored)
    .map(([d]) => d)
    .sort((a, b) => (a.price ?? Infinity) - (b.price ?? Infinity)
      || (Date.parse(a.validUntil) || Infinity) - (Date.parse(b.validUntil) || Infinity));
}
