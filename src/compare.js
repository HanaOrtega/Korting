// Porównanie sklepów na liście zakupów: ile taniej w jednym a ile w drugim – tylko na produktach,
// dla których znamy cenę w obu (promocyjną albo zwykłą).
import { unitPrice } from './pricing.js';

/** Najtańsza znana cena produktu w sklepie: z promocji albo ze zwykłych cen. */
export function priceInStore(store, hits, regular) {
  const promo = hits.filter((d) => d.store === store && d.price != null).sort((a, b) => a.price - b.price)[0];
  const reg = (regular ?? []).filter((d) => d.store === store && d.price != null).sort((a, b) => a.price - b.price)[0];
  const best = promo && (!reg || promo.price <= reg.price) ? { deal: promo, kind: 'promo' } : reg ? { deal: reg, kind: 'regular' } : null;
  return best && { ...best, price: best.deal.price, unit: unitPrice(best.deal) };
}

/**
 * rows: [{ item, hits }]; regular: { [itemId]: [oferty zwykłe] }; stores: nazwy sieci.
 * Zwraca ceny per produkt/sklep, sumy i porównania parami: koszt tych samych produktów w dwóch sklepach
 * (przy znanej gramaturze – tej samej ilości, inaczej ceny opakowań), a różnica % jest liczona z sum.
 */
export function compareStores(rows, regular, stores) {
  const active = rows.filter((r) => !r.item.done);
  const table = active.map((r) => ({
    item: r.item,
    prices: Object.fromEntries(stores.map((s) => [s, priceInStore(s, r.hits, regular?.[r.item.id])])),
  }));
  const summary = stores.map((store) => {
    const priced = table.filter((t) => t.prices[store]);
    return { store, covered: priced.length, of: table.length, total: priced.reduce((a, t) => a + t.prices[store].price, 0) };
  });
  const pairs = [];
  for (let i = 0; i < stores.length; i++) {
    for (let j = i + 1; j < stores.length; j++) {
      const [a, b] = [stores[i], stores[j]];
      let sumA = 0; let sumB = 0; let common = 0;
      for (const t of table) {
        const pa = t.prices[a]; const pb = t.prices[b];
        if (!pa || !pb) continue;
        common++;
        sumA += pa.price;
        // ta sama ilość w obu sklepach: gdy znamy cenę za kg/l, przeliczamy drugą ofertę na gramaturę pierwszej
        sumB += pa.unit && pb.unit && pa.unit.per === pb.unit.per ? pb.unit.value * pa.unit.amount : pb.price;
      }
      if (!common) continue;
      const cheaper = sumA <= sumB ? a : b;
      pairs.push({ a, b, common, cheaper, other: cheaper === a ? b : a,
        pct: Math.round((1 - Math.min(sumA, sumB) / Math.max(sumA, sumB)) * 100), sumA, sumB });
    }
  }
  pairs.sort((x, y) => y.common - x.common || y.pct - x.pct);
  return { table, summary, pairs };
}
