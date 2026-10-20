// Hak łączący silnik synchronizacji z aplikacją: trzyma grupę, kluczem opiekuje się Android Keystore, a zmiany lokalne i
// zdalne spływają do listy `items` bez ingerencji reszty UI (UI dalej używa zwykłych setItems).
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState } from 'react-native';
import { account, getAccessToken, keyStore, signIn, signOut } from './auth.js';
import { trackChanges } from './doc.js';
import { GOOGLE_CLIENT_ID } from './client.js';
import { createDrive } from './drive.js';
import { createGroup, rotateKey, syncOnce } from './engine.js';
import { openFile } from './file.js';
import { decodeInvite, encodeInvite } from './invite.js';

const KEY = 'korting.share.v1';
const POLL_MS = 8000;
const EDIT_DEBOUNCE_MS = 1200;
const drive = createDrive(getAccessToken);

const readGroup = async () => { try { return JSON.parse((await AsyncStorage.getItem(KEY)) ?? 'null'); } catch { return null; } };
const writeGroup = (g) => (g ? AsyncStorage.setItem(KEY, JSON.stringify(g)) : AsyncStorage.removeItem(KEY));

export function useShare({ items, setItems, ready }) {
  const [group, setGroup] = useState(null); // { fileId, name, role, clientId, me:{email,name} } albo null
  const [status, setStatus] = useState('off'); // off | idle | syncing | ok | offline | error | auth
  const [lastSync, setLastSync] = useState(0);
  const [error, setError] = useState(null);
  const [members, setMembers] = useState(null);

  const st = useRef({ items, snap: items, meta: {}, version: null, dirty: false, keys: [], busy: false, primed: false, pauseUntil: 0, group: null });
  const timer = useRef(null);
  st.current.items = items;

  const persist = useCallback(async () => {
    const s = st.current;
    if (!s.group) return;
    await writeGroup({ ...s.group, meta: s.meta, version: s.version, dirty: s.dirty });
    await keyStore.set(s.keys);
  }, []);

  // wczytanie zapisanej grupy
  useEffect(() => {
    if (!ready) return;
    (async () => {
      const g = await readGroup();
      if (!g) return;
      const s = st.current;
      s.group = { fileId: g.fileId, name: g.name, role: g.role, clientId: g.clientId, me: g.me, open: g.open };
      s.meta = g.meta ?? {}; s.version = g.version ?? null; s.dirty = !!g.dirty; s.keys = await keyStore.get();
      s.snap = st.current.items; s.primed = true;
      setGroup(s.group); setStatus('idle');
      tick();
    })();
  }, [ready]);

  const tick = useCallback(async () => {
    const s = st.current;
    if (!s.group || s.busy || Date.now() < s.pauseUntil) return;
    s.busy = true;
    if (s.dirty) setStatus('syncing'); // zwykłe sprawdzanie zmian nie miga wskaźnikiem
    const sentItems = s.items;
    try {
      const r = await syncOnce({ drive, fileId: s.group.fileId, keys: s.keys, items: sentItems, meta: s.meta, version: s.version, dirty: s.dirty });
      if (st.current.items !== sentItems) { // użytkownik edytował w trakcie – nie nadpisujemy, zsynchronizujemy ponownie
        s.dirty = true; s.version = null;
        schedule(300);
      } else {
        s.meta = r.meta; s.version = r.version; s.keys = r.keys; s.dirty = false;
        if (r.changed) { s.snap = r.items; s.items = r.items; setItems(r.items); }
      }
      await persist();
      setStatus('ok'); setError(null); setLastSync(Date.now());
    } catch (e) {
      if (e.code === 'RATE') s.pauseUntil = Date.now() + 60000;
      setError(e.code ?? 'UNKNOWN');
      setStatus(e.code === 'NETWORK' ? 'offline' : e.code === 'AUTH_EXPIRED' || e.code === 'AUTH' ? 'auth' : 'error');
    } finally { s.busy = false; }
  }, [persist, setItems]);

  const schedule = useCallback((ms) => { clearTimeout(timer.current); timer.current = setTimeout(() => tick(), ms); }, [tick]);

  // zmiany lokalne → metadane (czas modyfikacji, znaczniki usunięć) i wysyłka z opóźnieniem
  useEffect(() => {
    const s = st.current;
    if (!s.group || !s.primed) return;
    if (s.snap === items) return; // to my zastosowaliśmy zdalne zmiany
    s.meta = trackChanges(s.snap, items, s.meta, Date.now());
    s.snap = items; s.dirty = true;
    persist();
    schedule(EDIT_DEBOUNCE_MS);
  }, [items, group]);

  // odpytywanie na bieżąco: co kilka sekund, gdy aplikacja jest na wierzchu (Dysk nie ma powiadomień push bez serwera)
  useEffect(() => {
    if (!group) return undefined;
    const id = setInterval(() => { if (AppState.currentState === 'active') tick(); }, POLL_MS);
    const sub = AppState.addEventListener('change', (a) => { if (a === 'active') tick(); });
    return () => { clearInterval(id); sub.remove(); clearTimeout(timer.current); };
  }, [group, tick]);

  const activate = useCallback(async (g, keys, meta, version, dirty) => {
    const s = st.current;
    s.group = g; s.keys = keys; s.meta = meta; s.version = version; s.dirty = dirty; s.snap = s.items; s.primed = true;
    setGroup(g); setStatus('ok'); setLastSync(Date.now()); setError(null);
    await persist();
  }, [persist]);

  const guard = async (fn) => { setError(null); try { return await fn(); } catch (e) { setError(e.code ?? 'UNKNOWN'); setStatus('error'); throw e; } };

  const actions = {
    /** Właściciel: logowanie do Google, utworzenie zaszyfrowanego pliku na jego Dysku. */
    create: ({ name, clientId }) => guard(async () => {
      clientId = (clientId || GOOGLE_CLIENT_ID).trim();
      if (!clientId) { const e = new Error('NO_CLIENT'); e.code = 'NO_CLIENT'; throw e; }
      const me = await signIn(clientId);
      const now = Date.now();
      const meta0 = trackChanges([], st.current.items, {}, now);
      const g = await createGroup({ drive, name, items: st.current.items, meta: meta0, now });
      await drive.shareAnyone(g.fileId); // domyślnie: zaproszenie samym kodem, bez wpisywania e-maili
      await activate({ fileId: g.fileId, name, role: 'owner', clientId, me, open: true }, [g.key], g.meta, g.version, false);
    }),
    /** Nowa osoba: kod zaproszenia → logowanie → pobranie i scalenie z jej listą. */
    join: (text, { signInFirst = true } = {}) => guard(async () => {
      const inv = decodeInvite(text);
      if (!inv) { const e = new Error('BAD_INVITE'); e.code = 'BAD_INVITE'; throw e; }
      const me = await signIn(inv.clientId);
      await drive.meta(inv.fileId); // NO_ACCESS, jeśli właściciel nie udostępnił pliku temu adresowi
      openFile(await drive.download(inv.fileId), [inv.key]); // sprawdza klucz, zanim cokolwiek zapiszemy
      const meta0 = trackChanges([], st.current.items, {}, Date.now());
      const r = await syncOnce({ drive, fileId: inv.fileId, keys: [inv.key], items: st.current.items, meta: meta0, version: null, dirty: true });
      st.current.snap = r.items; st.current.items = r.items; setItems(r.items);
      await activate({ fileId: inv.fileId, name: inv.name, role: 'member', clientId: inv.clientId, me }, r.keys, r.meta, r.version, false);
    }),
    hasBuiltInClient: !!GOOGLE_CLIENT_ID,
    syncNow: () => { st.current.pauseUntil = 0; return tick(); },
    inviteCode: () => encodeInvite({ fileId: st.current.group.fileId, key: st.current.keys[0], clientId: st.current.group.clientId, name: st.current.group.name }),
    /** Zwraca kod zaproszenia. W trybie „tylko wskazane osoby” wymaga e-maila i udostępnia plik tej osobie. */
    invite: (email, message) => guard(async () => {
      if (!st.current.group.open && !email?.trim()) { const e = new Error('BAD_EMAIL'); e.code = 'BAD_EMAIL'; throw e; }
      if (!st.current.group.open || email?.trim()) await drive.share(st.current.group.fileId, email.trim(), message);
      return actions.inviteCode();
    }),
    /** Przełącznik: każdy z kodem może dołączyć (łatwo) ↔ tylko osoby dodane e-mailem (zmiana klucza odcina dotychczasowe linki). */
    setOpen: (open) => guard(async () => {
      const s = st.current;
      if (open) await drive.shareAnyone(s.group.fileId);
      else {
        await drive.unshareAnyone(s.group.fileId);
        const r = await rotateKey({ drive, fileId: s.group.fileId, keys: s.keys, items: s.items, meta: s.meta });
        s.keys = r.keys; s.version = r.version; s.meta = r.meta; s.dirty = false;
      }
      s.group = { ...s.group, open }; setGroup(s.group);
      await persist(); await actions.loadMembers();
    }),
    loadMembers: async () => {
      try {
        const all = await drive.permissionsAll(st.current.group.fileId);
        setMembers(all.filter((p) => p.type === 'user'));
        const open = all.some((p) => p.type === 'anyone');
        if (open !== !!st.current.group.open) { st.current.group = { ...st.current.group, open }; setGroup(st.current.group); persist(); }
      } catch { setMembers([]); }
    },
    /** Właściciel: cofa dostęp do pliku i zmienia klucz szyfrujący (pozostali przechodzą na nowy automatycznie). */
    removeMember: (permissionId) => guard(async () => {
      await drive.unshare(st.current.group.fileId, permissionId);
      const s = st.current;
      const r = await rotateKey({ drive, fileId: s.group.fileId, keys: s.keys, items: s.items, meta: s.meta });
      s.keys = r.keys; s.version = r.version; s.meta = r.meta; s.dirty = false;
      await persist(); await actions.loadMembers();
    }),
    /** Odłącza ten telefon od grupy (lista zostaje lokalnie, plik na Dysku nietknięty). */
    leave: async () => {
      clearTimeout(timer.current);
      const s = st.current; s.group = null; s.primed = false; s.keys = []; s.meta = {}; s.version = null;
      await writeGroup(null); await keyStore.clear(); await signOut();
      setGroup(null); setStatus('off'); setMembers(null); setError(null);
    },
    /** Właściciel: usuwa plik z Dysku i rozwiązuje grupę dla wszystkich. */
    dissolve: () => guard(async () => { await drive.remove(st.current.group.fileId); await actions.leave(); }),
    reauth: () => guard(async () => { await signIn(st.current.group.clientId, st.current.group.me?.email); st.current.pauseUntil = 0; await tick(); }),
    account,
  };

  return { group, status, error, lastSync, members, actions };
}
