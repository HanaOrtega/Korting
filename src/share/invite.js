// Kod zaproszenia: korting://join/<base64url JSON>. Zawiera id pliku na Dysku, klucz szyfrujący i Client ID Google,
// więc nowa osoba nie musi niczego konfigurować. To sekret – wysyłaj go prywatnym kanałem.
import { b64u, unb64u } from './crypto.js';

const enc = new TextEncoder();
const dec = new TextDecoder();
export const INVITE_PREFIX = 'korting://join/';

export function encodeInvite({ fileId, key, clientId, name }) {
  return INVITE_PREFIX + b64u(enc.encode(JSON.stringify({ v: 1, f: fileId, k: key, c: clientId, n: name ?? '' })));
}

/** Przyjmuje cały link albo samą końcówkę (z dopiskami/białymi znakami); zwraca null przy błędnym kodzie. */
export function decodeInvite(text) {
  try {
    const m = /korting:\/\/join\/([A-Za-z0-9\-_]+)/.exec(String(text)) ?? /^\s*([A-Za-z0-9\-_]{40,})\s*$/.exec(String(text));
    if (!m) return null;
    const j = JSON.parse(dec.decode(unb64u(m[1])));
    if (j.v !== 1 || !j.f || !/^[\w-]+\.[\w-]+$/.test(j.k ?? '') || !j.c) return null;
    return { fileId: j.f, key: j.k, clientId: j.c, name: j.n ?? '' };
  } catch {
    return null;
  }
}
