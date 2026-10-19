// Składniki przepisu → pozycje listy zakupów: ilości, jednostki, sumowanie i usuwanie duplikatów.
import { densityOf } from './density.js';
import { dutchName, displayName, norm, resolve } from './match.js';

// ---- jednostki (słowa w 12 językach); masa → g, objętość → ml ----
// Łyżki, łyżeczki, szklanki, pinty itd. zamieniamy od razu na ml, a rozmiar zależy od REGIONU miar
// (łyżka: USA 14,8 ml, Europa/UK 15 ml, Australia 20 ml; „cup”: USA 237 ml, Europa/Australia 250 ml, UK 284 ml).
// Słowa nieangielskie mają stały rozmiar (polska łyżka = 15 ml, szklanka = 250 ml).
export const REGIONS = {
  metric: { tbsp: 15, tsp: 5, cup: 250, pint: 500, quart: 1000, gallon: 4000, floz: 30 },
  us: { tbsp: 14.79, tsp: 4.93, cup: 236.59, pint: 473.18, quart: 946.35, gallon: 3785.41, floz: 29.57 },
  uk: { tbsp: 15, tsp: 5, cup: 284.13, pint: 568.26, quart: 1136.52, gallon: 4546.09, floz: 28.41 },
  au: { tbsp: 20, tsp: 5, cup: 250, pint: 568.26, quart: 1136.52, gallon: 4546.09, floz: 28.41 },
};
export const REGION_IDS = Object.keys(REGIONS);

const G = (f) => ({ dim: 'g', f });
const ML = (f) => ({ dim: 'ml', f });
const REG = (reg) => ({ dim: 'ml', reg, approx: ['tbsp', 'tsp', 'cup'].includes(reg) }); // rozmiar zależy od regionu
const FIXED = (f) => ({ dim: 'ml', f, approx: true }); // łyżka/szklanka w danym języku (przybliżenie)
const COUNT = (dim) => ({ dim, f: 1 });

const UNITS = [
  [G(1), 'g gr gram gramy gramow gramm grammes gramos grammi gramas грам грамів грамм граммов грамы'],
  [G(1000), 'kg kilo kilogram kilogramy kilogramow kilogramm kilogrammes kilogramos kilogrammi quilograma кг кілограм килограмм'],
  [G(28.35), 'oz ounce ounces uncja uncje'],
  [G(453.6), 'lb lbs pound pounds funt funty'],
  [G(113.4), 'stick sticks'], // amerykańska kostka masła
  [ML(1), 'ml milliliter mililitr mililitry millilitres mililitros millilitri mililitro mililitri мл мілілітр миллилитр'],
  [ML(10), 'cl centiliter centylitr centylitry centilitres centilitros centilitri'],
  [ML(100), 'dl deciliter decylitr decylitry decilitres decilitros decilitri decilitro'],
  [ML(1000), 'l lt ltr liter litr litry litrow litre litres litro litros litri л літр литр'],
  [REG('tbsp'), 'tbsp tbs tablespoon tablespoons'],
  [REG('tsp'), 'tsp teaspoon teaspoons'],
  [REG('cup'), 'cup cups'],
  [REG('pint'), 'pint pints pt'],
  [REG('quart'), 'quart quarts qt'],
  [REG('gallon'), 'gallon gallons gal'],
  [FIXED(15), 'lyzka lyzki lyzek el eetlepel eetlepels essloffel cs cucharada cucharadas cda cucchiaio cucchiai lingura linguri'],
  [FIXED(5), 'lyzeczka lyzeczki lyzeczek tl theelepel theelepels teeloffel cc cucharadita cucharaditas cdta cucchiaino cucchiaini lingurita lingurite'],
  [FIXED(250), 'szklanka szklanki szklanek tasse tassen taza tazas tazza tazze chavena chavenas стакан стакана склянка склянки ceasca cesti'],
  [FIXED(150), 'kopje kopjes'],
  [FIXED(200), 'bardagi'],
  [COUNT('piece'), 'szt sztuka sztuki sztuk pcs pc piece pieces stuk stuks st stk stuck pièce pièces uds ud unidad unidades pz pezzo pezzi un unidade unidades adet шт штук штуки buc bucata bucati'],
  [COUNT('clove'), 'zabek zabka zabki zabkow clove cloves teentje teentjes zehe zehen gousse gousses diente dientes spicchio spicchi dente dentes dis зубчик зубчики зубок catel catei зубчика'],
  [COUNT('can'), 'puszka puszki puszke puszek can cans tin tins blik blikje blikken blikjes dose dosen boite boites lata latas lattina lattine scatola konserve банка банки conserva cutie'],
  [COUNT('bunch'), 'peczek peczka peczki peczkow bunch bunches bos bosje bund botte bottes manojo manojos mazzo mazzi molho molhos demet пучок пучки legatura manunchi'],
  [COUNT('pack'), 'opakowanie opakowania opakowan opak pack packs package pak pakje pakket packung packungen pkg paquet paquets paquete paquetes confezione confezioni pacote pacotes paket пачка пачки упаковка упаковки pachet pachete'],
  [COUNT('pinch'), 'szczypta szczypty szczypte szczypt pinch pinches dash dashes snufje snufjes mespunt prise pincee pincees pizca pizzico pitada tutam щіпка щепотка щепотки varf'],
  [COUNT('slice'), 'plaster plastra plasterek plastry plasterki slice slices plak plakje plakjes scheibe scheiben tranche tranches loncha lonchas rebanada fetta fette fatia fatias dilim скибка ломтик ломтики felie felii'],
  [COUNT('handful'), 'garsc garsci handful handfuls handvol handvoll poignee poignees punado punados manciata manciate punhado avuc жменя горсть pumn maini'],
];
const UNIT_MAP = new Map(); // znormalizowane słowo/fraza -> specyfikacja jednostki
for (const [spec, words] of UNITS) for (const w of words.split(' ')) UNIT_MAP.set(norm(w), spec);
// jednostki wielowyrazowe – osobno, żeby ich części („de”, „soupe”, „л”) nie zostały jednostkami
for (const [phrase, spec] of [
  ['łyżka stołowa', FIXED(15)], ['łyżki stołowe', FIXED(15)], ['cuillère à soupe', FIXED(15)], ['cuillères à soupe', FIXED(15)],
  ['colher de sopa', FIXED(15)], ['colheres de sopa', FIXED(15)], ['yemek kaşığı', FIXED(15)], ['столова ложка', FIXED(15)],
  ['столові ложки', FIXED(15)], ['столовая ложка', FIXED(15)], ['столовые ложки', FIXED(15)], ['ст. л.', FIXED(15)], ['ст.л.', FIXED(15)],
  ['cuillère à café', FIXED(5)], ['cuillères à café', FIXED(5)], ['colher de chá', FIXED(5)], ['colheres de chá', FIXED(5)],
  ['çay kaşığı', FIXED(5)], ['чайна ложка', FIXED(5)], ['чайні ложки', FIXED(5)], ['чайная ложка', FIXED(5)], ['чайные ложки', FIXED(5)],
  ['ч. л.', FIXED(5)], ['ч.л.', FIXED(5)], ['su bardağı', FIXED(200)],
  ['fl oz', REG('floz')], ['fl. oz', REG('floz')], ['fluid ounce', REG('floz')], ['fluid ounces', REG('floz')], ['fluid oz', REG('floz')],
]) UNIT_MAP.set(norm(phrase), spec);

/** Region miar: 'us' gdy w tekście są jednostki amerykańskie (cups, oz, lb, stick, °F), inaczej 'metric'. */
export function detectRegion(text) {
  return /\b(cups?|sticks?|oz|ounces?|lbs?|pounds?|pints?|quarts?|gallons?|fahrenheit)\b|°\s*f\b/i.test(String(text)) ? 'us' : 'metric';
}
export const resolveRegion = (choice, text) => (choice && choice !== 'auto' && REGIONS[choice] ? choice : detectRegion(text));

const HALF = new Set(['pol', 'polowa', 'half', 'halve', 'halb', 'halbe', 'demi', 'medio', 'media', 'mezzo', 'mezza', 'meio', 'meia', 'yarim', 'пів', 'половина', 'jumatate', 'пол'].map(norm));
const TO_TASTE = ['do smaku', 'to taste', 'naar smaak', 'nach geschmack', 'au gout', 'al gusto', 'a gusto', 'al gusto', 'to tadina gore', 'по вкусу', 'за смаком', 'dupa gust', 'ao gosto', 'a gosto'].map(norm);
const CONNECTORS = new Set(['of', 'z', 'ze', 'de', 'di', 'd', 'van', 'von', 'aus', 'du', 'des', 'del', 'della', 'dello', 'dei', 'da', 'do', 'из']);
const FRAC = { '½': 0.5, '¼': 0.25, '¾': 0.75, '⅓': 1 / 3, '⅔': 2 / 3, '⅛': 0.125 };

const num = (s) => Number(String(s).replace(',', '.'));
const round = (n) => Math.round(n * 100) / 100;

/** Ilość z początku linii: „1 1/2”, „1,5”, „½”, „2-3” (bierzemy górną granicę), „2 x 200”, „pół”. Zwraca { value, rest } albo null. */
function takeQuantity(s) {
  let m;
  if ((m = /^(\d+)\s+(\d+)\/(\d+)\b\s*/.exec(s))) return { value: Number(m[1]) + Number(m[2]) / Number(m[3]), rest: s.slice(m[0].length) };
  if ((m = /^(\d+)\/(\d+)\b\s*/.exec(s))) return { value: Number(m[1]) / Number(m[2]), rest: s.slice(m[0].length) };
  if ((m = /^(\d+(?:[.,]\d+)?)\s*[x×]\s*(?=\d)/i.exec(s))) { // „2 x 200 g”
    const inner = takeQuantity(s.slice(m[0].length));
    return inner && { value: num(m[1]) * inner.value, rest: inner.rest };
  }
  if ((m = /^(\d+(?:[.,]\d+)?)\s*[-–—]\s*(\d+(?:[.,]\d+)?)\s*/.exec(s))) return { value: Math.max(num(m[1]), num(m[2])), rest: s.slice(m[0].length) };
  if ((m = /^(\d+(?:[.,]\d+)?)\s*/.exec(s))) return { value: num(m[1]), rest: s.slice(m[0].length) };
  const first = s.split(/\s+/)[0] ?? '';
  if (HALF.has(norm(first))) return { value: 0.5, rest: s.slice(first.length).trimStart() };
  return null;
}

/** Jedna linia składnika → { raw, name, amounts: [{dim, value, approx?}], toTaste } albo null (nagłówek / pusta). `region` decyduje o rozmiarze łyżki i „cup”. */
export function parseLine(line, { region = 'metric' } = {}) {
  let s = String(line).replace(/ /g, ' ').trim();
  s = s.replace(/^[\s\-–—•*·▪●◦■□☐✓]+/, '').replace(/^\d+[.)]\s+/, '').trim(); // punktory i numeracja „1. ”
  s = s.replace(/(\d+)?\s*([½¼¾⅓⅔⅛])/g, (_, d, f) => ` ${(d ? Number(d) : 0) + FRAC[f]} `).replace(/\s+/g, ' ').trim();
  if (!s || /:\s*$/.test(s) || !/[a-zЀ-ӿ]/.test(norm(s))) return null; // „Składniki:”, „Na sos:”, same cyfry

  const n = norm(s);
  const toTaste = TO_TASTE.some((p) => n.includes(p));
  if (toTaste) for (const p of TO_TASTE) s = s.replace(new RegExp(p.split(' ').join('\\s+'), 'i'), ' ');
  s = s.replace(/\([^)]*\)/g, ' ').replace(/\s+/g, ' ').trim(); // (opcjonalnie), (ok. 200 g)

  let value = null;
  const q = takeQuantity(s);
  if (q) { value = q.value; s = q.rest; }
  // jednostka przyklejona do liczby: „200g”, „1,5kg”, „2tbsp”
  let tokens = s.split(/\s+/).filter(Boolean);
  let unit = null;
  const stuck = tokens[0] && UNIT_MAP.get(norm(tokens[0]));
  if (stuck) { unit = stuck; tokens = tokens.slice(1); }
  else {
    for (let k = Math.min(3, tokens.length); k >= 1 && !unit; k--) {
      const u = UNIT_MAP.get(norm(tokens.slice(0, k).join(' ')));
      if (u && k < tokens.length + 1) { unit = u; tokens = tokens.slice(k); }
    }
  }
  const m = /^(\d+(?:[.,]\d+)?)([a-zа-яёіїєґ]+)$/i.exec(s.split(/\s+/)[0] ?? '');
  if (value === null && m && UNIT_MAP.has(norm(m[2]))) { value = num(m[1]); unit = UNIT_MAP.get(norm(m[2])); tokens = s.split(/\s+/).slice(1); }
  if (value === null && unit) value = 1; // „szklanka mleka”, „pęczek pietruszki”

  while (tokens.length && CONNECTORS.has(norm(tokens[0]))) tokens = tokens.slice(1);
  if (tokens.length) tokens[0] = tokens[0].replace(/^(?:d|l)['’]/i, ''); // „d'ail”, „l'huile”
  let name = tokens.join(' ').split(/[,;]| - | – /)[0].replace(/^[\s.:]+|[\s.:]+$/g, '').trim();
  if (!name) return null;

  const factor = unit ? (unit.reg ? (REGIONS[region] ?? REGIONS.metric)[unit.reg] : unit.f) : 1;
  const amounts = value === null ? [] : [{ dim: unit ? unit.dim : 'piece', value: round(value * factor), ...(unit?.approx ? { approx: true } : {}) }];
  return { raw: String(line).trim(), name, amounts, toTaste };
}

/** Dodaje ilość do listy ilości (sumuje tę samą jednostkę). */
export function addAmount(list, a) {
  const out = list.map((x) => ({ ...x }));
  const hit = out.find((x) => x.dim === a.dim);
  if (hit) { hit.value = round(hit.value + a.value); if (hit.approx || a.approx) hit.approx = true; } else out.push({ ...a });
  return out;
}

/** Objętość ↔ masa dla znanych produktów: „2 cups flour” → g, „8 oz milk” → ml (wg tego, jak produkt się kupuje). */
export function applyDensity(amounts, nlName) {
  const dens = densityOf(nlName);
  if (!dens) return amounts;
  return amounts.map((a) => {
    if (a.dim === 'ml' && dens.prefer === 'g') return { dim: 'g', value: a.value * dens.d, approx: true };
    if (a.dim === 'g' && dens.prefer === 'ml') return { dim: 'ml', value: a.value / dens.d, approx: true };
    return a;
  });
}

export const scaleAmounts = (amounts, k) => amounts.map((a) => ({ ...a, value: a.approx ? a.value * k : round(a.value * k) }));

const DIM_ORDER = ['g', 'ml', 'piece', 'tbsp', 'tsp', 'cup', 'handful', 'clove', 'pinch', 'slice', 'can', 'bunch', 'pack'];
const fmtNum = (v) => String(round(v)).replace('.', ',');
const UNIT_KEY = { piece: 'uPiece', clove: 'uClove', can: 'uCan', bunch: 'uBunch', pack: 'uPack', pinch: 'uPinch', slice: 'uSlice', tbsp: 'uTbsp', tsp: 'uTsp', cup: 'uCup', handful: 'uHandful' };

// wartości przeliczone (łyżki, szklanki, gęstość) zaokrąglamy do sensownej dokładności i oznaczamy „≈”
const niceRound = (v) => (v < 10 ? Math.round(v * 2) / 2 : v < 50 ? Math.round(v) : v < 1000 ? Math.round(v / 5) * 5 : Math.round(v / 10) * 10);

/** [{dim, value}] → „450 g + 2 szt.”; g i ml przeliczane na kg i l od 1000; przeliczone wartości z „≈”. */
export function fmtAmounts(amounts, t) {
  return [...amounts].sort((a, b) => DIM_ORDER.indexOf(a.dim) - DIM_ORDER.indexOf(b.dim)).map((a) => {
    const v = a.approx ? niceRound(a.value) : a.value;
    const tilde = a.approx ? '≈ ' : '';
    if (a.dim === 'g') return tilde + (v >= 1000 ? `${fmtNum(v / 1000)} kg` : `${fmtNum(v)} g`);
    if (a.dim === 'ml') return tilde + (v >= 1000 ? `${fmtNum(v / 1000)} l` : `${fmtNum(v)} ml`);
    if (a.dim === 'piece') return `${fmtNum(v)} ${t('uPiece')}`;
    return `${fmtNum(v)} × ${t(UNIT_KEY[a.dim])}`; // także zapisane wcześniej łyżki/szklanki
  }).join(' + ');
}

/**
 * Wklejony tekst → grupy: ten sam produkt (to samo pojęcie ze słownika albo ten sam tekst) z zsumowanymi ilościami.
 * Zwraca [{ key, ci, text, amounts, count, toTaste }]. `multiplier` skaluje porcje.
 */
const HEADING = /^(skladniki|ingredients?|zutaten|ingredienten|ingredients|ingredientes|ingredienti|malzemeler|інгредієнти|ingrediente|ингредиенты)\b/;
const isHeading = (line) => HEADING.test(norm(line).replace(/^na\s+/, ''));

// nazwa „odporna na odmianę” dla nieznanych słów: pierwsze 6 liter każdego słowa (parmezan ≈ parmezanu)
const looseKey = (name) => norm(name).split(' ').map((w) => (w.length > 6 ? w.slice(0, 6) : w)).join(' ');

/** Linia „sól, pieprz, papryka do smaku” → trzy składniki; „cebula, drobno posiekana” zostaje jedną (druga część to nie produkt). */
function expandList(line, vocab, lang) {
  if (!line.includes(',') || /[\d½¼¾⅓⅔⅛]/.test(line)) return [line];
  const n = norm(line);
  const taste = TO_TASTE.find((p) => n.includes(p));
  const cleaned = taste ? line.replace(new RegExp(taste.split(' ').join('\\s+'), 'i'), '') : line;
  const parts = cleaned.split(',').map((x) => x.trim()).filter(Boolean);
  const known = (x) => { const r = resolve(x, vocab, null, lang); return r.status === 'exact' || r.status === 'stem' || r.status === 'ambiguous'; };
  return parts.length > 1 && parts.every(known) ? parts.map((x) => (taste ? `${x} ${taste}` : x)) : [line];
}

/**
 * Wklejony tekst → grupy: ten sam produkt (to samo pojęcie ze słownika albo podobny tekst) z zsumowanymi ilościami.
 * Zwraca { groups: [{ key, ci, text, amounts, count, toTaste }], lines }. `multiplier` skaluje porcje.
 * Tytuły przepisów („Zapiekanka makaronowa”) i nagłówki („Składniki:”) są pomijane.
 */
export function buildGroups(text, { lang, vocab, multiplier = 1, region = 'metric' }) {
  const blocks = [[]];
  for (const raw of String(text).split(/\r?\n/)) {
    if (isHeading(raw)) { // „Składniki:” – jedyna linia tuż przed nim (bez liczb) to tytuł przepisu
      const cur = blocks.at(-1);
      if (cur.length === 1 && !/\d/.test(cur[0].replace(/\([^)]*\)/g, ''))) cur.pop(); // „(4 porcje)” nie liczy się jako ilość
      if (cur.length) blocks.push([]);
      continue;
    }
    if (!raw.trim()) { if (blocks.at(-1).length) blocks.push([]); continue; }
    blocks.at(-1).push(...expandList(raw, vocab, lang));
  }
  const groups = new Map();
  let lines = 0;
  for (const block of blocks) {
    const parsed = block.map((l) => parseLine(l, { region })).filter(Boolean);
    // pierwsza linia bez ilości, a reszta bloku ma ilości = tytuł przepisu
    if (parsed.length > 2 && !parsed[0].amounts.length && !parsed[0].toTaste
      && parsed.slice(1).filter((p) => p.amounts.length).length * 2 >= parsed.length - 1) parsed.shift();
    for (const p of parsed) {
      lines++;
      const r = resolve(p.name, vocab, null, lang);
      const sure = ['exact', 'stem', 'fuzzy'].includes(r.status) && r.alts.length === 0; // niejednoznaczne zostawiamy z wyborem (fuzzy bez konkurentów to zwykle odmiana: „mąki”)
      const key = r.ci != null ? `c:${r.ci}` : `t:${looseKey(p.name)}`;
      const g = groups.get(key) ?? { key, ci: r.ci, text: sure ? displayName(r.ci, lang) : p.name, amounts: [], sources: [], count: 0, toTaste: false };
      const amounts = r.ci != null ? applyDensity(p.amounts, dutchName(r.ci)) : p.amounts;
      for (const a of scaleAmounts(amounts, multiplier)) g.amounts = addAmount(g.amounts, a);
      g.sources.push(p.raw);
      g.count++;
      g.toTaste = g.toTaste || p.toTaste;
      groups.set(key, g);
    }
  }
  return { groups: [...groups.values()], lines };
}

/** Klucz produktu na liście (to samo pojęcie albo podobny tekst) – do wykrywania, że coś już tam jest. */
export function keyOfItem(it, { lang, vocab }) {
  const r = resolve(it.text, vocab, null, lang);
  const ci = it.pick ?? r.ci;
  return ci != null ? `c:${ci}` : `t:${looseKey(it.text)}`;
}

/** Dodaje grupy do listy: ten sam produkt, który już jest na liście, dostaje zsumowane ilości zamiast duplikatu. */
export function mergeIntoItems(items, groups, { lang, vocab, makeId }) {
  const out = items.map((it) => ({ ...it }));
  const keyOf = (it) => keyOfItem(it, { lang, vocab });
  const index = new Map(out.map((it, i) => [keyOf(it), i]));
  let merged = 0;
  for (const g of groups) {
    const i = index.get(g.key);
    if (i !== undefined) {
      for (const a of g.amounts) out[i].amounts = addAmount(out[i].amounts ?? [], a);
      out[i].done = false;
      merged++;
    } else {
      out.unshift({ id: makeId(), text: g.text, done: false, amounts: g.amounts });
      index.clear(); out.forEach((it, j) => index.set(keyOf(it), j));
    }
  }
  return { items: out, merged };
}
