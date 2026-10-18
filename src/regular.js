// Zwykłe ceny (bez promocji) wybranych produktów – tylko ze sklepów, które to wspierają (Lidl, AH).
import AsyncStorage from '@react-native-async-storage/async-storage';
import { matchDeals } from './match.js';
import { providers } from './providers/index.js';

const KEY = 'korting.regular.v1'; // { "sklep|hasło": { at, items } }
const TTL = 24 * 3600 * 1000;
let cache = null;

async function load() {
  if (cache) return cache;
  try { cache = JSON.parse((await AsyncStorage.getItem(KEY)) ?? '{}'); } catch { cache = {}; }
  return cache;
}

/** Sklepy, dla których umiemy pobrać zwykłe ceny. */
export const regularStores = () => providers.filter((p) => p.regular).map((p) => p.name);

/**
 * Zwykłe ceny produktu w jednym sklepie: szukamy po holenderskich hasłach i zostawiamy tylko pasujące
 * nazwy (ta sama reguła co dla promocji), od najtańszej. Wynik jest pamiętany przez 24 h.
 */
export async function lookupRegular(store, terms, ci) {
  const provider = providers.find((p) => p.name === store && p.regular);
  if (!provider) return [];
  const all = await load();
  const key = `${store}|${terms[0]}`;
  let entry = all[key];
  if (!entry || Date.now() - entry.at > TTL) {
    entry = { at: Date.now(), items: await provider.regular(terms[0]) };
    all[key] = entry;
    try { await AsyncStorage.setItem(KEY, JSON.stringify(all)); } catch {}
  }
  return matchDeals(terms, entry.items, ci).slice(0, 8);
}
