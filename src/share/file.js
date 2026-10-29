// Format pliku na Dysku: JSON { korting: 1, kid, wrap, data }. `data` = zaszyfrowany dokument listy.
// `wrap` przechowuje NOWY klucz zaszyfrowany STARYM po rotacji (usunięcie osoby z grupy) – pozostali członkowie
// przechodzą na nowy klucz sami, a usunięta osoba nie ma już dostępu do pliku.
import { kidOf, open, seal } from './crypto.js';

export function sealFile(doc, key, wrap = {}) {
  return JSON.stringify({ korting: 1, kid: kidOf(key), wrap, data: seal(key, doc) });
}

/** Odczyt z listą znanych kluczy: zwraca { doc, key (aktualny), wrap }; BAD_KEY, gdy nie mamy ani klucza, ani łańcucha. */
export function openFile(text, keys) {
  let file;
  try { file = JSON.parse(text); } catch { const e = new Error('BAD_FILE'); e.code = 'BAD_FILE'; throw e; }
  if (file?.korting !== 1) { const e = new Error('BAD_FILE'); e.code = 'BAD_FILE'; throw e; }
  const known = [...keys];
  for (let hop = 0; hop < 12; hop++) {
    const key = known.find((k) => kidOf(k) === file.kid);
    if (key) return { doc: open(key, file.data), key, wrap: file.wrap ?? {} };
    const via = known.find((k) => file.wrap?.[kidOf(k)]);
    if (!via) break;
    known.push(open(via, file.wrap[kidOf(via)])); // nowy klucz odszyfrowany starym
  }
  const e = new Error('BAD_KEY'); e.code = 'BAD_KEY'; throw e;
}
