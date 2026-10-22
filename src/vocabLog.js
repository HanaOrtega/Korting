// Dziennik słów, z którymi słownik miał problem (nierozpoznane, poprawione literówką, przetłumaczone online).
// Zostaje w telefonie i trafia do nikogo, dopóki sam nie wyślesz go z zakładki Słownik.
import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = 'korting.vocabLog.v1'; // { "język|słowo": { kind, count, last } }
const MAX = 200;

async function read() {
  try { return JSON.parse((await AsyncStorage.getItem(KEY)) ?? '{}'); } catch { return {}; }
}

/** kind: 'unknown' | 'translated' | 'fuzzy' */
export async function recordWord(lang, word, kind) {
  const w = String(word).trim().toLowerCase();
  if (!w) return;
  const log = await read();
  const key = `${lang}|${w}`;
  log[key] = { kind, count: (log[key]?.count ?? 0) + 1, last: Date.now() };
  const keys = Object.keys(log);
  if (keys.length > MAX) { // najstarsze wypadają
    keys.sort((a, b) => log[a].last - log[b].last).slice(0, keys.length - MAX).forEach((k) => delete log[k]);
  }
  try { await AsyncStorage.setItem(KEY, JSON.stringify(log)); } catch {}
}

/** [{ lang, word, kind, count, last }], najświeższe pierwsze. */
export async function readLog() {
  const log = await read();
  return Object.entries(log).map(([key, v]) => {
    const [lang, ...rest] = key.split('|');
    return { lang, word: rest.join('|'), ...v };
  }).sort((a, b) => b.last - a.last);
}

export async function clearLog() {
  try { await AsyncStorage.removeItem(KEY); } catch {}
}
