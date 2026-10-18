// Ceny: oszczędność względem zwykłej ceny i cena za kg / litr, żeby porównywać różne opakowania.

const AMOUNT = '(\\d+(?:[.,]\\d+)?)';
const UNIT = '(kg|kilo|gr|gram|g|liter|ltr|l|ml|cl|dl)\\b';
const MULTI = new RegExp(`(\\d+)\\s*[x×]\\s*${AMOUNT}\\s*${UNIT}`, 'i'); // „2 x 250 g”, „6x33 cl”
const SINGLE = new RegExp(`(?<![\\d.,-])${AMOUNT}\\s*${UNIT}`, 'i'); // „500 g”, „1,5 l” (nie zakres „500-1000 g”)

const FACTOR = { kg: [1, 'kg'], kilo: [1, 'kg'], g: [0.001, 'kg'], gr: [0.001, 'kg'], gram: [0.001, 'kg'],
  l: [1, 'l'], liter: [1, 'l'], ltr: [1, 'l'], ml: [0.001, 'l'], cl: [0.01, 'l'], dl: [0.1, 'l'] };
const num = (s) => Number(String(s).replace(',', '.'));

/** „2 x 250 g” → { amount: 0.5, per: 'kg' }; zakresy i teksty bez gramatury → null. */
export function parseSize(text) {
  if (!text) return null;
  const t = String(text).replace(/ /g, ' ');
  let count = 1;
  let value; let unit;
  const m = MULTI.exec(t);
  if (m) { count = Number(m[1]); value = num(m[2]); unit = m[3].toLowerCase(); }
  else {
    const s = SINGLE.exec(t);
    if (!s) return null;
    value = num(s[1]); unit = s[2].toLowerCase();
  }
  const [f, per] = FACTOR[unit];
  const amount = count * value * f;
  return amount > 0 ? { amount, per } : null;
}

/** Cena za kg lub litr z gramatury w polu unit, opisie albo nazwie. */
export function unitPrice(deal) {
  if (deal.price == null) return null;
  const size = parseSize(deal.unit) ?? parseSize(deal.name) ?? parseSize(deal.description);
  if (!size) return null;
  return { value: deal.price / size.amount, per: size.per, amount: size.amount };
}

/** Oszczędność względem zwykłej ceny: { pct, eur } albo null. */
export function saving(deal) {
  if (deal.price == null || deal.oldPrice == null || deal.oldPrice <= deal.price) return null;
  const eur = deal.oldPrice - deal.price;
  return { eur, pct: Math.round((eur / deal.oldPrice) * 100) };
}

/** Stara cena wyliczona z procentu („-33%”), gdy sklep nie podaje jej wprost (Aldi). */
export function oldPriceFromPercent(price, label) {
  const m = /-\s*(\d{1,2})\s*%/.exec(label ?? '');
  if (!m || price == null) return null;
  const pct = Number(m[1]);
  return pct > 0 && pct < 90 ? Math.round((price / (1 - pct / 100)) * 100) / 100 : null;
}

/** id oferty o najniższej cenie za kg/l wśród tych, które da się porównać (ta sama jednostka, min. 2 oferty). */
export function bestUnitId(deals) {
  const withUnit = deals.map((d) => ({ d, u: unitPrice(d) })).filter((x) => x.u);
  const byPer = new Map();
  for (const x of withUnit) byPer.set(x.u.per, [...(byPer.get(x.u.per) ?? []), x]);
  const group = [...byPer.values()].sort((a, b) => b.length - a.length)[0];
  if (!group || group.length < 2) return null;
  return group.reduce((best, x) => (x.u.value < best.u.value ? x : best)).d.id;
}

export const fmtUnit = (u) => `€${u.value.toFixed(2).replace('.', ',')}/${u.per}`;
