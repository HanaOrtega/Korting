// Podział listy zakupów na sklepy: do którego sklepu jechać i co tam kupić.
// rows: [{ item, hits }] – hits to promocje pasujące do produktu, od najtańszej.

/**
 * Każdy produkt z promocją trafia do jednego sklepu: najtańsza oferta; jeśli użytkownik ma ulubione
 * sieci i produkt jest w którejś z nich w promocji, wybieramy spośród nich (nawet jeśli gdzie indziej
 * jest odrobinę taniej – chodzi o to, żeby jechać do sklepów, które i tak lubi).
 * Produkty bez żadnej promocji trafiają do `none`.
 */
export function planShopping(rows, favoriteChains = []) {
  const favs = new Set(favoriteChains);
  const groups = new Map();
  const none = [];
  for (const { item, hits } of rows) {
    if (!hits.length) { none.push(item); continue; }
    const inFavs = favs.size ? hits.filter((d) => favs.has(d.store)) : [];
    const pool = inFavs.length ? inFavs : hits;
    const deal = pool.find((d) => d.price != null) ?? pool[0];
    const others = [...new Set(hits.filter((d) => d.store !== deal.store).map((d) => d.store))];
    const g = groups.get(deal.store) ?? { store: deal.store, favorite: favs.has(deal.store), entries: [], total: 0 };
    g.entries.push({ item, deal, others });
    if (!item.done && deal.price != null) g.total += deal.price;
    groups.set(deal.store, g);
  }
  const list = [...groups.values()].sort((a, b) =>
    Number(b.favorite) - Number(a.favorite) || b.entries.length - a.entries.length || a.store.localeCompare(b.store));
  return { groups: list, none };
}
