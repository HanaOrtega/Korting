// Hak historii: zapisuje migawki przy każdej zmianie listy zrobionej przez użytkownika (zmiany z synchronizacji grupy
// pomija – patrz markExternal) i daje „Cofnij” oraz przywracanie z historii.
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useRef, useState } from 'react';
import { diffItems, record, restoreAll, restoreMissing } from './history.js';

const KEY = 'korting.history.v1';
const TOAST_MS = 7000;

export function useHistory({ items, setItems, ready }) {
  const [entries, setEntries] = useState([]);
  const [toast, setToast] = useState(null); // { entryId, label }
  const prev = useRef(null);
  const loaded = useRef(false);
  const timer = useRef(null);

  useEffect(() => {
    if (!ready) return;
    (async () => {
      try { setEntries(JSON.parse((await AsyncStorage.getItem(KEY)) ?? '[]')); } catch { /* pusta historia */ }
      prev.current = items; loaded.current = true;
    })();
  }, [ready]);

  useEffect(() => {
    if (!loaded.current || prev.current === items) return;
    const before = prev.current; prev.current = items;
    setEntries((h) => {
      const next = record(h, before, items, Date.now());
      if (next !== h) {
        AsyncStorage.setItem(KEY, JSON.stringify(next)).catch(() => {});
        const d = diffItems(next[0]?.items ?? before, items);
        const big = d.removed.length > 0 || d.added.length >= 3; // „Cofnij” po usunięciu i po wklejeniu przepisu
        if (next[0] && big) {
          clearTimeout(timer.current);
          setToast({ entryId: next[0].id, label: next[0].label });
          timer.current = setTimeout(() => setToast(null), TOAST_MS);
        }
      }
      return next;
    });
  }, [items]);

  const apply = useCallback((nextItems) => {
    setItems(nextItems); // przywrócenie też zapisze się w historii, więc można je cofnąć
    setToast(null);
  }, [setItems]);

  const markExternal = useCallback((next) => { prev.current = next; }, []);

  return {
    entries, toast,
    dismissToast: () => { clearTimeout(timer.current); setToast(null); },
    /** Zmiana pochodząca z synchronizacji grupy – nie jest „błędnym kliknięciem” tego użytkownika. */
    markExternal,
    undo: () => { const e = entries.find((x) => x.id === toast?.entryId) ?? entries[0]; if (e) apply(restoreAll(e)); },
    restore: (entry, mode) => (mode === 'missing' ? apply(restoreMissing(entry, items).items) : apply(restoreAll(entry))),
    missingCount: (entry) => restoreMissing(entry, items).count,
    clear: () => { setEntries([]); AsyncStorage.removeItem(KEY).catch(() => {}); },
  };
}
