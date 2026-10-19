import AsyncStorage from '@react-native-async-storage/async-storage';
import { providers } from './providers/index.js';

const KEY = 'korting.deals.v2'; // { [sklep]: { at, deals } } – każdy sklep odświeżany osobno
const TTL = 6 * 3600 * 1000; // dane z sieci odświeżamy najwyżej co 6 godzin (oszczędność transferu)
const PROVIDER_TIMEOUT = 60000;

async function readAll() {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

const withTimeout = (promise, ms) => new Promise((resolve, reject) => {
  const timer = setTimeout(() => reject(new Error('przekroczono czas oczekiwania')), ms);
  promise.then((v) => { clearTimeout(timer); resolve(v); }, (e) => { clearTimeout(timer); reject(e); });
});

const stillValid = (d, now) => !d.validUntil || Date.parse(d.validUntil) >= now;
const collect = (all, stores, now) =>
  stores.flatMap((s) => (all[s]?.deals ?? [])).filter((d) => stillValid(d, now));

/** Czy któryś z wybranych sklepów nie ma świeżych danych (wtedy odświeżamy automatycznie). */
export async function needsRefresh(stores) {
  const all = await readAll();
  const now = Date.now();
  return providers.filter((p) => !stores || stores.includes(p.name)).some((p) => !all[p.name] || now - all[p.name].at >= TTL);
}

/** Promocje z pamięci telefonu dla wybranych sklepów (do natychmiastowego pokazania). */
export async function readCache(stores) {
  const all = await readAll();
  const deals = collect(all, stores, Date.now());
  return deals.length ? { deals, errors: [], at: Math.max(...stores.map((s) => all[s]?.at ?? 0)) } : null;
}

/**
 * Pobiera promocje tylko dla wybranych sklepów (`stores` – nazwy sieci). Sklep ze świeżymi danymi
 * w pamięci nie dotyka sieci; ten, który zawiedzie, zachowuje poprzednie (jeszcze ważne) promocje.
 */
export async function loadDeals({ force = false, stores } = {}) {
  const wanted = providers.filter((p) => !stores || stores.includes(p.name));
  const all = await readAll();
  const now = Date.now();
  const stale = wanted.filter((p) => force || !all[p.name] || now - all[p.name].at >= TTL);

  const results = await Promise.allSettled(stale.map((p) => withTimeout(p.fetch(), PROVIDER_TIMEOUT)));
  const errors = [];
  results.forEach((r, i) => {
    const name = stale[i].name;
    if (r.status === 'fulfilled') all[name] = { at: now, deals: r.value };
    else errors.push({ store: name, error: String(r.reason?.message ?? r.reason) });
  });
  if (stale.length) { try { await AsyncStorage.setItem(KEY, JSON.stringify(all)); } catch {} }
  return { deals: collect(all, wanted.map((p) => p.name), now), errors, at: now };
}
