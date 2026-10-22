// Szyfrowanie listy: XChaCha20-Poly1305 (uwierzytelnione), klucz grupy 256 bit. Czysty JS (@noble/ciphers) – działa w Hermes
// i w Node (testy). Losowość dostarcza telefon (expo-crypto) przez setRandom().
import { xchacha20poly1305 } from '@noble/ciphers/chacha.js';

let rng = null;
export const setRandom = (fn) => { rng = fn; };
export function randomBytes(n) {
  if (rng) return Uint8Array.from(rng(n));
  if (globalThis.crypto?.getRandomValues) return globalThis.crypto.getRandomValues(new Uint8Array(n));
  throw new Error('Brak źródła losowości');
}

const ALPHA = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';
export function b64u(bytes) {
  let out = '';
  for (let i = 0; i < bytes.length; i += 3) {
    const n = (bytes[i] << 16) | ((bytes[i + 1] ?? 0) << 8) | (bytes[i + 2] ?? 0);
    out += ALPHA[(n >> 18) & 63] + ALPHA[(n >> 12) & 63];
    if (i + 1 < bytes.length) out += ALPHA[(n >> 6) & 63];
    if (i + 2 < bytes.length) out += ALPHA[n & 63];
  }
  return out;
}
export function unb64u(str) {
  const clean = String(str).replace(/[^A-Za-z0-9\-_]/g, '');
  const out = [];
  for (let i = 0; i < clean.length; i += 4) {
    const chunk = clean.slice(i, i + 4);
    const n = [...chunk].reduce((acc, ch, j) => acc | (ALPHA.indexOf(ch) << (18 - 6 * j)), 0);
    out.push((n >> 16) & 255);
    if (chunk.length > 2) out.push((n >> 8) & 255);
    if (chunk.length > 3) out.push(n & 255);
  }
  return Uint8Array.from(out);
}

const enc = new TextEncoder();
const dec = new TextDecoder();

/** Nowy klucz grupy: „kid.klucz” (kid = krótki identyfikator, żeby wiedzieć, którym kluczem zaszyfrowano plik). */
export const newKey = () => `${b64u(randomBytes(6))}.${b64u(randomBytes(32))}`;
export const kidOf = (key) => String(key).split('.')[0];
const raw = (key) => unb64u(String(key).split('.')[1] ?? '');

/** Szyfruje JSON → tekst base64url (nonce 24 B + szyfrogram z tagiem). */
export function seal(key, value) {
  const nonce = randomBytes(24);
  const ct = xchacha20poly1305(raw(key), nonce).encrypt(enc.encode(JSON.stringify(value)));
  const out = new Uint8Array(nonce.length + ct.length);
  out.set(nonce); out.set(ct, nonce.length);
  return b64u(out);
}

/** Odszyfrowuje; zły klucz albo naruszone dane → wyjątek BAD_KEY. */
export function open(key, sealed) {
  try {
    const all = unb64u(sealed);
    return JSON.parse(dec.decode(xchacha20poly1305(raw(key), all.slice(0, 24)).decrypt(all.slice(24))));
  } catch {
    const e = new Error('BAD_KEY');
    e.code = 'BAD_KEY';
    throw e;
  }
}
