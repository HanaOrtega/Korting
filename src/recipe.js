// Składniki przepisu → pozycje listy zakupów: ilości, jednostki, sumowanie i usuwanie duplikatów.
import { displayName, norm, resolve } from './match.js';

// ---- jednostki (słowa w 12 językach); masa → g, objętość → ml, reszta zostaje własną „wymiarową” jednostką ----
// dim: g | ml | piece | clove | can | bunch | pack | pinch | slice | tbsp | tsp | cup | handful
const UNITS = [
  { dim: 'g', f: 1, w: 'g gr gram gramy gramow gramm grammes gramos grammi gramas грам грамів грамм граммов грамы' },
  { dim: 'g', f: 1000, w: 'kg kilo kilogram kilogramy kilogramow kilogramm kilogrammes kilogramos kilogrammi quilograma кг кілограм килограмм' },
  { dim: 'g', f: 28.35, w: 'oz ounce ounces uncja uncje' },
  { dim: 'g', f: 453.6, w: 'lb lbs pound pounds funt funty' },
  { dim: 'ml', f: 1, w: 'ml milliliter mililitr mililitry millilitres mililitros millilitri mililitro mililitri мл мілілітр миллилитр' },
  { dim: 'ml', f: 10, w: 'cl centiliter centylitr centylitry centilitres centilitros centilitri' },
  { dim: 'ml', f: 100, w: 'dl deciliter decylitr decylitry decilitres decilitros decilitri decilitro' },
  { dim: 'ml', f: 1000, w: 'l lt ltr liter litr litry litrow litre litres litro litros litri л літр литр' },
  { dim: 'piece', f: 1, w: 'szt sztuka sztuki sztuk pcs pc piece pieces stuk stuks st stk stuck stuck pièce pièces piece uds ud unidad unidades pz pezzo pezzi un unidade unidades adet шт штук штуки buc bucata bucati' },
  { dim: 'clove', f: 1, w: 'zabek zabka zabki zabkow clove cloves teentje teentjes zehe zehen gousse gousses diente dientes spicchio spicchi dente dentes dis зубчик зубчики зубок catel catei зубчика' },
  { dim: 'can', f: 1, w: 'puszka puszki puszke puszek can cans tin tins blik blikje blikken blikjes dose dosen boite boites lata latas lattina lattine scatola konserve банка банки conserva cutie' },
  { dim: 'bunch', f: 1, w: 'peczek peczka peczki peczkow bunch bunches bos bosje bund botte bottes manojo manojos mazzo mazzi molho molhos demet пучок пучки legatura manunchi' },
  { dim: 'pack', f: 1, w: 'opakowanie opakowania opakowan opak pack packs package pak pakje pakket packung packungen pkg paquet paquets paquete paquetes confezione confezioni pacote pacotes paket пачка пачки упаковка упаковки pachet pachete' },
  { dim: 'pinch', f: 1, w: 'szczypta szczypty szczypte szczypt pinch pinches snufje snufjes mespunt prise pincee pincees pizca pizzico pitada tutam щіпка щепотка щепотки varf' },
  { dim: 'slice', f: 1, w: 'plaster plastra plasterek plastry plasterki slice slices plak plakje plakjes scheibe scheiben tranche tranches loncha lonchas rebanada fetta fette fatia fatias dilim скибка ломтик ломтики felie felii' },
  { dim: 'tbsp', f: 1, w: 'lyzka lyzki lyzek tbsp tbs tablespoon tablespoons el eetlepel eetlepels essloffel cs cucharada cucharadas cda cucchiaio cucchiai lingura linguri' },
  { dim: 'tsp', f: 1, w: 'lyzeczka lyzeczki lyzeczek tsp teaspoon teaspoons tl theelepel theelepels teeloffel cc cucharadita cucharaditas cdta cucchiaino cucchiaini lingurita lingurite' },
  { dim: 'cup', f: 1, w: 'szklanka szklanki szklanek cup cups kopje kopjes tasse tassen taza tazas tazza tazze chavena chavenas copo su bardagi склянка склянки стакан стакана ceasca cesti' },
  { dim: 'handful', f: 1, w: 'garsc garsci handful handfuls handvol handvoll poignee poignees punado punados manciata manciate punhado avuc жменя горсть pumn maini' },
];
const UNIT_MAP = new Map(); // znormalizowane słowo/fraza -> { dim, f } (pojedyncze słowa; frazy poniżej)
for (const u of UNITS) for (const w of u.w.split(' ')) UNIT_MAP.set(norm(w), u);
// jednostki wielowyrazowe – osobno, żeby ich części („de”, „soupe”, „л”) nie zostały jednostkami
const PHRASES = {
  'łyżka stołowa': 'tbsp', 'łyżki stołowe': 'tbsp', 'cuillère à soupe': 'tbsp', 'cuillères à soupe': 'tbsp', 'colher de sopa': 'tbsp',
  'colheres de sopa': 'tbsp', 'yemek kaşığı': 'tbsp', 'столова ложка': 'tbsp', 'столові ложки': 'tbsp', 'столовая ложка': 'tbsp',
  'столовые ложки': 'tbsp', 'ст. л.': 'tbsp', 'ст.л.': 'tbsp',
  'cuillère à café': 'tsp', 'cuillères à café': 'tsp', 'colher de chá': 'tsp', 'colheres de chá': 'tsp', 'çay kaşığı': 'tsp',
  'чайна ложка': 'tsp', 'чайні ложки': 'tsp', 'чайная ложка': 'tsp', 'чайные ложки': 'tsp', 'ч. л.': 'tsp', 'ч.л.': 'tsp',
};
for (const [phrase, dim] of Object.entries(PHRASES)) if (dim) UNIT_MAP.set(norm(phrase), UNITS.find((u) => u.dim === dim));

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

/** Jedna linia składnika → { raw, name, amounts: [{dim, value}], toTaste } albo null (nagłówek / pusta). */
export function parseLine(line) {
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

  const amounts = value === null ? [] : [{ dim: unit ? unit.dim : 'piece', value: round(value * (unit ? unit.f : 1)) }];
  return { raw: String(line).trim(), name, amounts, toTaste };
}

/** Dodaje ilość do listy ilości (sumuje tę samą jednostkę). */
export function addAmount(list, a) {
  const out = list.map((x) => ({ ...x }));
  const hit = out.find((x) => x.dim === a.dim);
  if (hit) hit.value = round(hit.value + a.value); else out.push({ ...a });
  return out;
}

export const scaleAmounts = (amounts, k) => amounts.map((a) => ({ ...a, value: round(a.value * k) }));

const DIM_ORDER = ['g', 'ml', 'piece', 'tbsp', 'tsp', 'cup', 'handful', 'clove', 'pinch', 'slice', 'can', 'bunch', 'pack'];
const fmtNum = (v) => String(round(v)).replace('.', ',');
const UNIT_KEY = { piece: 'uPiece', clove: 'uClove', can: 'uCan', bunch: 'uBunch', pack: 'uPack', pinch: 'uPinch', slice: 'uSlice', tbsp: 'uTbsp', tsp: 'uTsp', cup: 'uCup', handful: 'uHandful' };

/** [{dim, value}] → „450 g + 2 szt. + 3 × łyżka”; g i ml przeliczane na kg i l od 1000. */
export function fmtAmounts(amounts, t) {
  return [...amounts].sort((a, b) => DIM_ORDER.indexOf(a.dim) - DIM_ORDER.indexOf(b.dim)).map((a) => {
    if (a.dim === 'g') return a.value >= 1000 ? `${fmtNum(a.value / 1000)} kg` : `${fmtNum(a.value)} g`;
    if (a.dim === 'ml') return a.value >= 1000 ? `${fmtNum(a.value / 1000)} l` : `${fmtNum(a.value)} ml`;
    if (a.dim === 'piece') return `${fmtNum(a.value)} ${t('uPiece')}`;
    return `${fmtNum(a.value)} × ${t(UNIT_KEY[a.dim])}`;
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
export function buildGroups(text, { lang, vocab, multiplier = 1 }) {
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
    const parsed = block.map(parseLine).filter(Boolean);
    // pierwsza linia bez ilości, a reszta bloku ma ilości = tytuł przepisu
    if (parsed.length > 2 && !parsed[0].amounts.length && !parsed[0].toTaste
      && parsed.slice(1).filter((p) => p.amounts.length).length * 2 >= parsed.length - 1) parsed.shift();
    for (const p of parsed) {
      lines++;
      const r = resolve(p.name, vocab, null, lang);
      const sure = ['exact', 'stem', 'fuzzy'].includes(r.status) && r.alts.length === 0; // niejednoznaczne zostawiamy z wyborem (fuzzy bez konkurentów to zwykle odmiana: „mąki”)
      const key = r.ci != null ? `c:${r.ci}` : `t:${looseKey(p.name)}`;
      const g = groups.get(key) ?? { key, ci: r.ci, text: sure ? displayName(r.ci, lang) : p.name, amounts: [], count: 0, toTaste: false };
      for (const a of scaleAmounts(p.amounts, multiplier)) g.amounts = addAmount(g.amounts, a);
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
