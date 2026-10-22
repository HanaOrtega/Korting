// Silnik synchronizacji (czysta logika, bez UI): pobierz zdalny plik, jeśli się zmienił, scal z lokalnym stanem i wyślij,
// jeśli wynik różni się od zdalnego. Każde urządzenie zachowuje swój pełny stan i „podtrzymuje” swoje zmiany, więc nawet
// przy równoczesnych zapisach (Dysk nie ma blokad) wszystkie telefony zbiegają się do tej samej listy.
import { kidOf, newKey, seal } from './crypto.js';
import { docEqual, fromDoc, mergeDocs, toDoc } from './doc.js';
import { openFile, sealFile } from './file.js';

/**
 * drive: { meta(fileId) -> {version}, download(fileId) -> text, upload(fileId, text) -> version, create(name, text) -> {fileId, version} }
 * Zwraca { items, meta, version, keys, changed (czy lista lokalna się zmieniła), uploaded }.
 */
export async function syncOnce({ drive, fileId, keys, items, meta, version, dirty, now = Date.now() }) {
  const info = await drive.meta(fileId);
  let remote = null; let key = keys[0]; let wrap = {};
  if (info.version !== version) {
    const parsed = openFile(await drive.download(fileId), keys);
    remote = parsed.doc; key = parsed.key; wrap = parsed.wrap;
  }
  const local = toDoc(items, meta, now);
  const merged = remote ? mergeDocs(local, remote, now) : local;
  let v = info.version; let uploaded = false;
  if (remote ? !docEqual(merged, remote) : dirty) {
    v = await drive.upload(fileId, sealFile(merged, key, wrap));
    uploaded = true;
  }
  const next = fromDoc(merged);
  return {
    items: next.items, meta: next.meta, version: v, uploaded,
    keys: key === keys[0] ? keys : [key, ...keys],
    changed: remote ? !docEqual(local, merged) : false,
  };
}

/** Tworzy plik grupy na Dysku z bieżącą listą; zwraca { fileId, key, version, meta }. */
export async function createGroup({ drive, name, items, meta, now = Date.now() }) {
  const key = newKey();
  const doc = toDoc(items, meta, now);
  const { fileId, version } = await drive.create(name, sealFile(doc, key));
  return { fileId, key, version, meta: fromDoc(doc).meta };
}

/** Rotacja klucza (po usunięciu osoby): nowy klucz, stary „opakowany” w pliku, by pozostali członkowie przeszli sami. */
export async function rotateKey({ drive, fileId, keys, items, meta, now = Date.now() }) {
  const synced = await syncOnce({ drive, fileId, keys, items, meta, version: null, dirty: true, now });
  const oldKey = synced.keys[0];
  const fresh = newKey();
  const parsed = openFile(await drive.download(fileId), synced.keys);
  const wrap = { ...parsed.wrap, [kidOf(oldKey)]: seal(oldKey, fresh) };
  const version = await drive.upload(fileId, sealFile(toDoc(synced.items, synced.meta, now), fresh, wrap));
  return { ...synced, version, keys: [fresh, ...synced.keys] };
}
