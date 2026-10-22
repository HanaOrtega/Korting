// Logowanie do Google bez serwera: OAuth 2.0 z PKCE przez przeglądarkę systemową. Tokeny trafiają do Android Keystore
// (expo-secure-store). Zakres `drive` jest potrzebny, by otworzyć plik udostępniony przez właściciela grupy; aplikacja dotyka
// wyłącznie pliku, którego id zna z zaproszenia.
import * as Crypto from 'expo-crypto';
import * as SecureStore from 'expo-secure-store';
import * as WebBrowser from 'expo-web-browser';
import { b64u, randomBytes, setRandom } from './crypto.js';

setRandom((n) => Crypto.getRandomBytes(n));

export const REDIRECT_URI = 'com.hanaortega.korting:/oauth2redirect';
const SCOPES = 'openid email profile https://www.googleapis.com/auth/drive';
const KEY = 'korting.google';
const TOKEN_URL = 'https://oauth2.googleapis.com/token';

const form = (o) => Object.entries(o).map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`).join('&');

async function load() { try { return JSON.parse((await SecureStore.getItemAsync(KEY)) ?? 'null'); } catch { return null; } }
const save = (v) => SecureStore.setItemAsync(KEY, JSON.stringify(v));

async function tokenRequest(params) {
  const res = await fetch(TOKEN_URL, { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: form(params) });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) { const e = new Error(json.error_description || json.error || `HTTP ${res.status}`); e.code = json.error === 'invalid_grant' ? 'AUTH_EXPIRED' : 'AUTH'; throw e; }
  return json;
}

/** Logowanie: otwiera Google w przeglądarce, wraca z kodem, wymienia go na tokeny. Zwraca { email, name }. */
export async function signIn(clientId, loginHint) {
  const verifier = b64u(randomBytes(48));
  const challenge = (await Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, verifier, { encoding: Crypto.CryptoEncoding.BASE64 }))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  const state = b64u(randomBytes(12));
  const url = `https://accounts.google.com/o/oauth2/v2/auth?${form({
    client_id: clientId, redirect_uri: REDIRECT_URI, response_type: 'code', scope: SCOPES, code_challenge: challenge,
    code_challenge_method: 'S256', state, access_type: 'offline', prompt: 'consent', ...(loginHint ? { login_hint: loginHint } : {}),
  })}`;
  const result = await WebBrowser.openAuthSessionAsync(url, REDIRECT_URI);
  if (result.type !== 'success') { const e = new Error('Anulowano logowanie'); e.code = 'CANCELLED'; throw e; }
  const q = new URLSearchParams(result.url.split('?')[1] ?? '');
  if (q.get('error')) throw new Error(q.get('error'));
  if (q.get('state') !== state) throw new Error('Niezgodny parametr state – logowanie przerwane');
  const t = await tokenRequest({ code: q.get('code'), client_id: clientId, code_verifier: verifier, redirect_uri: REDIRECT_URI, grant_type: 'authorization_code' });
  const info = await (await fetch('https://openidconnect.googleapis.com/v1/userinfo', { headers: { Authorization: `Bearer ${t.access_token}` } })).json();
  const prev = await load();
  await save({ clientId, access: t.access_token, exp: Date.now() + (t.expires_in - 60) * 1000, refresh: t.refresh_token ?? prev?.refresh, email: info.email, name: info.name });
  return { email: info.email, name: info.name };
}

export async function account() { const a = await load(); return a ? { email: a.email, name: a.name, clientId: a.clientId } : null; }

/** Ważny access token; odświeża go refresh tokenem. `force` = odśwież mimo ważności (po 401). */
export async function getAccessToken(force = false) {
  const a = await load();
  if (!a?.refresh) { const e = new Error('Zaloguj się do Google'); e.code = 'AUTH_EXPIRED'; throw e; }
  if (!force && a.access && a.exp > Date.now()) return a.access;
  try {
    const t = await tokenRequest({ client_id: a.clientId, refresh_token: a.refresh, grant_type: 'refresh_token' });
    await save({ ...a, access: t.access_token, exp: Date.now() + (t.expires_in - 60) * 1000 });
    return t.access_token;
  } catch (e) {
    if (e.code === 'AUTH_EXPIRED') await SecureStore.deleteItemAsync(KEY);
    throw e;
  }
}

export async function signOut() { await SecureStore.deleteItemAsync(KEY); }

/** Klucz grupy trzymamy w Android Keystore, nie w zwykłej pamięci aplikacji. */
export const keyStore = {
  async get() { try { return JSON.parse((await SecureStore.getItemAsync('korting.groupKeys')) ?? '[]'); } catch { return []; } },
  set: (keys) => SecureStore.setItemAsync('korting.groupKeys', JSON.stringify(keys)),
  clear: () => SecureStore.deleteItemAsync('korting.groupKeys'),
};
