// Model współdzielonej listy: rekordy pozycji z czasem modyfikacji (ostatni zapis wygrywa dla każdej pozycji) i znaczniki
// usunięcia. Scalanie jest przemienne, łączne i idempotentne, więc urządzenia zbiegają się do tego samego stanu niezależnie
// od kolejności synchronizacji – nikt nie musi „wygrywać” całej listy.
const FIELDS = ['text', 'amounts', 'done', 'pick'];
export const TOMBSTONE_TTL = 30 * 24 * 3600 * 1000;

const content = (it) => JSON.stringify(FIELDS.map((f) => it?.[f] ?? null));
const createdOf = (id) => { const n = parseInt(String(id), 10); return Number.isFinite(n) ? n : 0; };

/** Ile zmieniło się lokalnie od poprzedniego zrzutu listy: nowe/zmienione pozycje dostają czas `now`, usunięte – znacznik. */
export function trackChanges(prevItems, nextItems, meta, now) {
  const out = { ...meta };
  const prev = new Map(prevItems.map((it) => [it.id, it]));
  const next = new Set(nextItems.map((it) => it.id));
  for (const it of nextItems) {
    const before = prev.get(it.id);
    if (!before || content(before) !== content(it) || out[it.id]?.d) out[it.id] = { u: Math.max(now, (out[it.id]?.u ?? 0) + 1) };
  }
  for (const it of prevItems) if (!next.has(it.id)) out[it.id] = { u: Math.max(now, (out[it.id]?.u ?? 0) + 1), d: 1 };
  return out;
}

/** Lista + metadane → dokument do wysłania. Pozycje bez metadanych (sprzed udostępniania) dostają czas `now`. */
export function toDoc(items, meta, now) {
  const recs = {};
  for (const [id, m] of Object.entries(meta)) if (m.d) recs[id] = { id, u: m.u, d: 1 };
  for (const it of items) {
    const rec = { id: it.id, u: meta[it.id]?.u ?? now };
    for (const f of FIELDS) if (it[f] !== undefined && it[f] !== null) rec[f] = it[f];
    recs[it.id] = rec;
  }
  return { v: 1, items: recs };
}

const wins = (a, b) => (a.u !== b.u ? a.u > b.u : JSON.stringify(a) >= JSON.stringify(b));

export function mergeDocs(a, b, now = Date.now()) {
  const items = {};
  for (const id of new Set([...Object.keys(a.items), ...Object.keys(b.items)])) {
    const x = a.items[id]; const y = b.items[id];
    const pick = !x ? y : !y ? x : (wins(x, y) ? x : y);
    if (pick.d && now - pick.u > TOMBSTONE_TTL) continue; // stare znaczniki usunięcia porządkujemy
    items[id] = pick;
  }
  return { v: 1, items };
}

export const docEqual = (a, b) => {
  const ka = Object.keys(a.items).sort(); const kb = Object.keys(b.items).sort();
  return ka.length === kb.length && ka.every((k, i) => k === kb[i] && JSON.stringify(a.items[k]) === JSON.stringify(b.items[k]));
};

/** Dokument → lista (najnowsze na górze, zgodnie z kolejnością dodawania) i metadane. */
export function fromDoc(doc) {
  const items = []; const meta = {};
  for (const rec of Object.values(doc.items)) {
    meta[rec.id] = rec.d ? { u: rec.u, d: 1 } : { u: rec.u };
    if (rec.d) continue;
    const { u, ...it } = rec;
    items.push({ ...it, done: !!it.done });
  }
  items.sort((a, b) => createdOf(b.id) - createdOf(a.id) || (a.id < b.id ? 1 : -1));
  return { items, meta };
}
