// Ile trzeba kupić: ilości z przepisu (g, ml) vs gramatura opakowania z promocji.
import { parseSize } from './pricing.js';

const SMALL_KG = 0.1; // poniżej 100 g / 100 ml (łyżki, szczypty, ząbki) nie kupuje się osobnego opakowania

/** Z ilości pozycji: { amount, per:'kg'|'l' } do kupienia albo null; small = tylko mała ilość (łyżka, szczypta…). */
export function neededAmount(amounts) {
  if (!amounts?.length) return null;
  let g = 0; let ml = 0;
  for (const a of amounts) { if (a.dim === 'g') g += a.value; else if (a.dim === 'ml') ml += a.value; }
  const kg = g / 1000; const l = ml / 1000;
  const main = kg >= l ? { amount: kg, per: 'kg' } : { amount: l, per: 'l' };
  if (main.amount <= 0) return null;
  return { ...main, small: main.amount < SMALL_KG };
}

/** Ile opakowań z promocji pokryje potrzebę: { n, total, size } (null, gdy nie da się porównać). */
export function packPlan(need, deal) {
  if (!need || need.small || deal.price == null) return null;
  const size = parseSize(deal.unit) ?? parseSize(deal.name) ?? parseSize(deal.description);
  if (!size || size.per !== need.per) return null;
  const n = Math.max(1, Math.ceil(need.amount / size.amount - 1e-9));
  return { n, total: n * deal.price, size: size.amount, per: size.per, covers: n * size.amount };
}

/** Promocje od najtańszej *za potrzebną ilość* (a nie za sztukę); bez gramatury – na końcu wg ceny. */
export function sortByNeed(hits, need) {
  if (!need || need.small) return hits;
  const cost = (d) => packPlan(need, d)?.total ?? Infinity;
  return [...hits].sort((a, b) => cost(a) - cost(b) || (a.price ?? Infinity) - (b.price ?? Infinity));
}

export const fmtQty = (amount, per) => (per === 'kg'
  ? (amount < 1 ? `${Math.round(amount * 1000)} g` : `${String(Math.round(amount * 100) / 100).replace('.', ',')} kg`)
  : (amount < 1 ? `${Math.round(amount * 1000)} ml` : `${String(Math.round(amount * 100) / 100).replace('.', ',')} l`));
