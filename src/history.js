// Historia listy zakupów: migawki stanu SPRZED zmian (łączone, gdy zmiany następują szybko po sobie), żeby można było
// cofnąć przypadkowe kliknięcie albo przywrócić usunięte pozycje.
export const MAX_ENTRIES = 40;
export const COALESCE_MS = 10000;

const sig = (it) => JSON.stringify([it.text, it.amounts ?? null, !!it.done, it.pick ?? null]);

/** Różnica między stanem sprzed (`before`) a obecnym (`now`): usunięte, dodane, zmienione pozycje. */
export function diffItems(before, now) {
  const b = new Map(before.map((it) => [it.id, it]));
  const n = new Map(now.map((it) => [it.id, it]));
  return {
    removed: before.filter((it) => !n.has(it.id)),
    added: now.filter((it) => !b.has(it.id)),
    changed: now.filter((it) => b.has(it.id) && sig(b.get(it.id)) !== sig(it)),
  };
}

/** Opis wpisu: { key, n, name } – tłumaczony w UI kluczem `h…`. */
export function describe(before, now) {
  const d = diffItems(before, now);
  const first = (d.removed[0] ?? d.added[0] ?? d.changed[0])?.text ?? '';
  if (d.removed.length && !d.added.length && !d.changed.length) return d.removed.length === 1 ? { key: 'hRemovedOne', n: 1, name: first } : { key: 'hRemoved', n: d.removed.length, name: first };
  if (d.added.length && !d.removed.length && !d.changed.length) return d.added.length === 1 ? { key: 'hAddedOne', n: 1, name: first } : { key: 'hAdded', n: d.added.length, name: first };
  if (d.changed.length && !d.removed.length && !d.added.length) return { key: 'hChanged', n: d.changed.length, name: first };
  return { key: 'hMixed', n: d.removed.length + d.added.length + d.changed.length, name: first };
}

/**
 * Rejestruje zmianę listy `before` → `now`. Zmiany w ciągu 10 s od poprzedniej łączymy w jeden wpis (zachowujemy
 * najstarszy stan „sprzed”), więc jedno dłuższe sprzątanie to jedna pozycja historii. Zwraca nową historię.
 */
export function record(history, before, now, at, { force = false } = {}) {
  if (JSON.stringify(before.map(sig)) === JSON.stringify(now.map(sig)) && before.length === now.length) return history;
  const last = history[0];
  if (!force && last && at - last.touched < COALESCE_MS) {
    const label = describe(last.items, now);
    if (!diffItems(last.items, now).removed.length && !diffItems(last.items, now).added.length && !diffItems(last.items, now).changed.length) return history.slice(1); // wróciło do stanu sprzed – nic do cofania
    return [{ ...last, touched: at, label }, ...history.slice(1)];
  }
  return [{ id: `${at}-${history.length}`, at, touched: at, items: before, label: describe(before, now) }, ...history].slice(0, MAX_ENTRIES);
}

/** Przywrócenie: cała lista ze zrzutu albo tylko brakujące pozycje (zachowuje nowsze zmiany). */
export function restoreAll(entry) { return entry.items; }
export function restoreMissing(entry, current) {
  const have = new Set(current.map((it) => it.id));
  const missing = entry.items.filter((it) => !have.has(it.id));
  return { items: [...missing, ...current], count: missing.length };
}
