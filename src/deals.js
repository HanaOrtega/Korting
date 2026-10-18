import AsyncStorage from '@react-native-async-storage/async-storage';
import { providers } from './providers/index.js';

const KEY = 'korting.deals.v1';
const TTL = 6 * 3600 * 1000; // dane z sieci odświeżamy najwyżej co 6 godzin (oszczędność transferu)
const PROVIDER_TIMEOUT = 60000;

export async function readCache() {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

const withTimeout = (promise, ms) => new Promise((resolve, reject) => {
  const timer = setTimeout(() => reject(new Error('przekroczono czas oczekiwania')), ms);
  promise.then((v) => { clearTimeout(timer); resolve(v); }, (e) => { clearTimeout(timer); reject(e); });
});

const stillValid = (d, now) => !d.validUntil || Date.parse(d.validUntil) >= now;

/**
 * Zwraca { deals, errors, at }. Gdy dane w pamięci są świeże, nie dotyka sieci.
 * Sklep, który zawiódł, zachowuje poprzednie (jeszcze ważne) promocje z pamięci.
 */
export async function loadDeals({ force = false } = {}) {
  const cached = await readCache();
  if (!force && cached && Date.now() - cached.at < TTL) return { ...cached, errors: [] };

  const results = await Promise.allSettled(providers.map((p) => withTimeout(p.fetch(), PROVIDER_TIMEOUT)));
  const now = Date.now();
  const deals = [];
  const errors = [];
  results.forEach((r, i) => {
    const name = providers[i].name;
    if (r.status === 'fulfilled') deals.push(...r.value);
    else {
      errors.push({ store: name, error: String(r.reason?.message ?? r.reason) });
      deals.push(...(cached?.deals ?? []).filter((d) => d.store === name));
    }
  });
  const data = { at: now, deals: deals.filter((d) => stillValid(d, now)), errors };
  if (data.deals.length) {
    try { await AsyncStorage.setItem(KEY, JSON.stringify({ at: now, deals: data.deals })); } catch {}
  }
  return data;
}
