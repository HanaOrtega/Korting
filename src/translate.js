// Zapasowe tłumaczenie na holenderski dla słów spoza słownika (np. „ciasto francuskie” → „bladerdeeg”).
// Używa darmowego API MyMemory (a gdy zawiedzie – nieoficjalnego endpointu Google). Wyniki są zapamiętywane
// w telefonie, więc każde słowo tłumaczymy raz, a offline działa to, co już znamy.
import AsyncStorage from '@react-native-async-storage/async-storage';
import { fetchWithTimeout } from './providers/util.js';

const KEY = 'korting.translations.v1';
let cache = null;
const pending = new Map();

async function load() {
  if (cache) return cache;
  try { cache = JSON.parse((await AsyncStorage.getItem(KEY)) ?? '{}'); } catch { cache = {}; }
  return cache;
}

async function myMemory(text, lang) {
  const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${lang}|nl`;
  const res = await fetchWithTimeout(url, {}, 8000);
  const json = await res.json();
  // 429 / komunikat o limicie przychodzi w polu responseData.translatedText – nie wolno go zapamiętać
  if (Number(json.responseStatus) !== 200) throw new Error(`MyMemory ${json.responseStatus}`);
  return json.responseData?.translatedText;
}

async function google(text, lang) {
  const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${lang}&tl=nl&dt=t&q=${encodeURIComponent(text)}`;
  const res = await fetchWithTimeout(url, {}, 8000);
  const json = await res.json();
  return json?.[0]?.map((p) => p[0]).join('');
}

/** Tłumaczy na holenderski albo zwraca null (brak sieci, limit, brak sensownego wyniku). */
export async function translateToDutch(text, lang) {
  const clean = String(text).trim().toLowerCase();
  if (!clean || lang === 'nl') return null;
  const key = `${lang}|${clean}`;
  const store = await load();
  if (key in store) return store[key];
  if (pending.has(key)) return pending.get(key);

  const job = (async () => {
    for (const engine of [myMemory, google]) {
      try {
        const out = (await engine(clean, lang))?.trim().toLowerCase();
        if (out && out !== clean) {
          store[key] = out;
          try { await AsyncStorage.setItem(KEY, JSON.stringify(store)); } catch {}
          return out;
        }
        if (out === clean) { store[key] = null; return null; } // słowo międzynarodowe – nie ma czego tłumaczyć
      } catch { /* następny silnik */ }
    }
    return null; // nie zapamiętujemy porażki – spróbujemy później
  })().finally(() => pending.delete(key));
  pending.set(key, job);
  return job;
}

/** Nauczone tłumaczenia (do zakładki Słownik): [{ lang, from, to }]. */
export async function listTranslations() {
  const store = await load();
  return Object.entries(store).filter(([, to]) => to).map(([key, to]) => {
    const [lang, ...rest] = key.split('|');
    return { lang, from: rest.join('|'), to };
  });
}

export async function clearTranslations() {
  cache = {};
  try { await AsyncStorage.removeItem(KEY); } catch {}
}
