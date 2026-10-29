import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useRef, useState } from 'react';
import { newRecipe, updateRecipe } from './recipes.js';

const KEY = 'korting.recipes.v1';

/** Książka przepisów zapisana w telefonie (AsyncStorage). */
export function useRecipes() {
  const [recipes, setRecipes] = useState([]);
  const [ready, setReady] = useState(false);
  const last = useRef(null);

  useEffect(() => {
    (async () => {
      try { setRecipes(JSON.parse((await AsyncStorage.getItem(KEY)) ?? '[]')); } catch { /* pusta książka */ }
      setReady(true);
    })();
  }, []);
  useEffect(() => { if (ready) AsyncStorage.setItem(KEY, JSON.stringify(recipes)).catch(() => {}); }, [recipes, ready]);

  const add = useCallback((fields) => { const r = newRecipe(fields); setRecipes((p) => [r, ...p]); return r; }, []);
  const update = useCallback((id, patch) => setRecipes((p) => p.map((r) => (r.id === id ? updateRecipe(r, patch) : r))), []);
  const remove = useCallback((id) => setRecipes((p) => { last.current = p.find((r) => r.id === id) ?? null; return p.filter((r) => r.id !== id); }), []);
  const restore = useCallback(() => { const r = last.current; if (r) { setRecipes((p) => (p.some((x) => x.id === r.id) ? p : [r, ...p])); last.current = null; } }, []);
  const duplicate = useCallback((id, suffix) => setRecipes((p) => {
    const r = p.find((x) => x.id === id);
    return r ? [newRecipe({ ...r, title: `${r.title} ${suffix}` }), ...p] : p;
  }), []);
  return { recipes, add, update, remove, restore, duplicate };
}
