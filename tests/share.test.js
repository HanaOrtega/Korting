import test from 'node:test';
import assert from 'node:assert/strict';
import { b64u, newKey, open, seal, unb64u } from '../src/share/crypto.js';
import { fromDoc, mergeDocs, toDoc, trackChanges } from '../src/share/doc.js';
import { createGroup, rotateKey, syncOnce } from '../src/share/engine.js';
import { openFile, sealFile } from '../src/share/file.js';
import { decodeInvite, encodeInvite } from '../src/share/invite.js';

class FakeDrive {
  constructor() { this.files = {}; this.n = 0; }
  async meta(id) { return { version: this.files[id].version }; }
  async download(id) { return this.files[id].text; }
  async upload(id, text) { this.files[id] = { text, version: String(Number(this.files[id].version) + 1) }; return this.files[id].version; }
  async create(name, text) { const fileId = `f${++this.n}`; this.files[fileId] = { text, version: '1' }; return { fileId, version: '1' }; }
}

// jedno urządzenie: lista + metadane + wersja
class Device {
  constructor(drive, fileId, keys, clock) { Object.assign(this, { drive, fileId, keys, clock, items: [], meta: {}, version: null, dirty: false }); }
  edit(fn) { const next = fn(this.items); this.meta = trackChanges(this.items, next, this.meta, ++this.clock.t); this.items = next; this.dirty = true; }
  async sync() {
    const r = await syncOnce({ drive: this.drive, fileId: this.fileId, keys: this.keys, items: this.items, meta: this.meta, version: this.version, dirty: this.dirty, now: ++this.clock.t });
    if (r.changed) this.items = r.items;
    Object.assign(this, { meta: r.meta, version: r.version, keys: r.keys, dirty: false });
    return r;
  }
  texts() { return this.items.map((i) => i.text + (i.done ? '✓' : '')).sort(); }
}

test('szyfrowanie: odczyt tym samym kluczem, inny klucz i naruszone dane są odrzucane', () => {
  const k = newKey();
  const s = seal(k, { a: [1, 'zażółć'] });
  assert.deepEqual(open(k, s), { a: [1, 'zażółć'] });
  assert.throws(() => open(newKey(), s), { code: 'BAD_KEY' });
  const tampered = s.slice(0, -2) + (s.endsWith('AA') ? 'BB' : 'AA');
  assert.throws(() => open(k, tampered), { code: 'BAD_KEY' });
  assert.notEqual(seal(k, 1), seal(k, 1)); // inny nonce za każdym razem
  const bytes = Uint8Array.from({ length: 37 }, (_, i) => i * 7);
  assert.deepEqual(unb64u(b64u(bytes)), bytes);
});

test('zaproszenie: kod ↔ dane, odporność na dopiski i błędne kody', () => {
  const inv = { fileId: 'abc123', key: newKey(), clientId: 'x.apps.googleusercontent.com', name: 'Rodzina' };
  const code = encodeInvite(inv);
  assert.deepEqual(decodeInvite(code), inv);
  assert.deepEqual(decodeInvite(`Dołącz: ${code}\n`), inv);
  assert.equal(decodeInvite('korting://join/xxx'), null);
  assert.equal(decodeInvite('cokolwiek'), null);
});

test('scalanie: ostatni zapis pozycji wygrywa, usunięcie jest znacznikiem, scalanie jest przemienne i idempotentne', () => {
  const a = toDoc([{ id: '1', text: 'mleko', done: false }], { 1: { u: 10 } }, 0);
  const b = toDoc([{ id: '1', text: 'mleko', done: true }, { id: '2', text: 'chleb', done: false }], { 1: { u: 20 }, 2: { u: 5 } }, 0);
  const ab = mergeDocs(a, b, 100); const ba = mergeDocs(b, a, 100);
  assert.deepEqual(ab, ba);
  assert.deepEqual(mergeDocs(ab, ab, 100), ab);
  assert.equal(ab.items[1].done, true);
  const del = toDoc([], { 1: { u: 30, d: 1 } }, 0);
  const m = mergeDocs(ab, del, 100);
  assert.ok(m.items[1].d);
  assert.deepEqual(fromDoc(m).items.map((i) => i.id), ['2']);
  assert.equal(mergeDocs(m, toDoc([], {}, 0), 100 + 31 * 24 * 3600 * 1000).items[1], undefined); // stary znacznik sprzątany
});

test('dwa telefony: zmiany z obu stron trafiają do obu, także przy równoczesnym zapisie', async () => {
  const drive = new FakeDrive(); const clock = { t: 1000 };
  const A = new Device(drive, null, [], clock);
  A.edit(() => [{ id: '1', text: 'mleko', done: false }, { id: '2', text: 'chleb', done: false }]);
  const g = await createGroup({ drive, name: 'Rodzina', items: A.items, meta: A.meta, now: ++clock.t });
  A.fileId = g.fileId; A.keys = [g.key]; A.meta = g.meta; A.version = g.version; A.dirty = false;
  const B = new Device(drive, g.fileId, [g.key], clock);
  await B.sync();
  assert.deepEqual(B.texts(), ['chleb', 'mleko']);

  // równoczesne zmiany: A odhacza mleko, B dodaje masło i usuwa chleb – zanim którykolwiek się zsynchronizuje
  A.edit((it) => it.map((x) => (x.id === '1' ? { ...x, done: true } : x)));
  B.edit((it) => [{ id: '3', text: 'masło', done: false }, ...it.filter((x) => x.id !== '2')]);
  await A.sync(); await B.sync(); await A.sync(); await B.sync();
  assert.deepEqual(A.texts(), ['masło', 'mleko✓']);
  assert.deepEqual(B.texts(), A.texts());

  // zapis „na ślepo” przez B po cudzym zapisie A nie gubi zmian A (A podtrzymuje swój stan)
  A.edit((it) => it.map((x) => (x.id === '3' ? { ...x, text: 'masło extra' } : x)));
  B.edit((it) => it.map((x) => (x.id === '1' ? { ...x, text: 'mleko 3,2%' } : x)));
  await B.sync(); await A.sync(); await B.sync(); await A.sync();
  assert.deepEqual(A.texts(), B.texts());
  assert.deepEqual(A.texts(), ['masło extra', 'mleko 3,2%✓']);
});

test('nic się nie zmieniło: synchronizacja nie wysyła pliku ani nie pobiera go ponownie', async () => {
  const drive = new FakeDrive(); const clock = { t: 1 };
  const A = new Device(drive, null, [], clock);
  A.edit(() => [{ id: '1', text: 'mleko', done: false }]);
  const g = await createGroup({ drive, name: 'x', items: A.items, meta: A.meta, now: 5 });
  Object.assign(A, { fileId: g.fileId, keys: [g.key], meta: g.meta, version: g.version, dirty: false });
  const before = drive.files[g.fileId].version;
  const r = await A.sync();
  assert.equal(r.uploaded, false);
  assert.equal(drive.files[g.fileId].version, before);
});

test('rotacja klucza: pozostali członkowie przechodzą na nowy klucz sami', async () => {
  const drive = new FakeDrive(); const clock = { t: 1 };
  const A = new Device(drive, null, [], clock);
  A.edit(() => [{ id: '1', text: 'mleko', done: false }]);
  const g = await createGroup({ drive, name: 'x', items: A.items, meta: A.meta, now: 5 });
  Object.assign(A, { fileId: g.fileId, keys: [g.key], meta: g.meta, version: g.version, dirty: false });
  const B = new Device(drive, g.fileId, [g.key], clock);
  await B.sync();
  const r = await rotateKey({ drive, fileId: g.fileId, keys: A.keys, items: A.items, meta: A.meta, now: 50 });
  A.keys = r.keys; A.version = r.version;
  assert.notEqual(r.keys[0], g.key);
  await B.sync(); // B ma tylko stary klucz, ale plik niesie opakowany nowy
  assert.equal(B.keys[0], r.keys[0]);
  assert.deepEqual(B.texts(), ['mleko']);
  // ktoś bez żadnego znanego klucza nie odczyta pliku
  assert.throws(() => openFile(drive.files[g.fileId].text, [newKey()]), { code: 'BAD_KEY' });
  assert.throws(() => openFile('nie json', [g.key]), { code: 'BAD_FILE' });
});

import { createDrive, DriveError } from '../src/share/drive.js';

test('klient Dysku: adresy, nagłówki, odświeżenie po 401 i mapowanie błędów', async () => {
  const calls = [];
  const queue = [];
  const doFetch = async (url, init) => { calls.push({ url, init }); return queue.shift(); };
  const res = (status, body, text) => ({ status, ok: status < 300, json: async () => body, text: async () => text ?? '' });
  let tokenCalls = 0;
  const drive = createDrive(async (force) => `tok${force ? 'F' : ''}${++tokenCalls}`, doFetch);

  queue.push(res(200, { version: '7', modifiedTime: 't' }));
  assert.deepEqual(await drive.meta('FID'), { version: '7', modifiedTime: 't' });
  assert.match(calls[0].url, /files\/FID\?fields=version/);
  assert.equal(calls[0].init.headers.Authorization, 'Bearer tok1');

  queue.push(res(401, {}), res(200, { version: '8' }));
  assert.equal(await drive.upload('FID', 'tekst'), '8');
  assert.equal(calls.at(-1).init.headers.Authorization.startsWith('Bearer tokF'), true); // ponowienie z wymuszonym odświeżeniem
  assert.equal(calls.at(-1).init.method, 'PATCH');
  assert.match(calls.at(-1).url, /upload\/drive\/v3\/files\/FID\?uploadType=media/);

  queue.push(res(200, { id: 'NEW', version: '1' }));
  assert.deepEqual(await drive.create('lista', 'x'), { fileId: 'NEW', version: '1' });
  assert.match(calls.at(-1).init.body, /"name":"lista"[\s\S]*\r\nx\r\n/);

  queue.push(res(404, {})); await assert.rejects(drive.download('X'), { code: 'NO_ACCESS' });
  queue.push(res(403, { error: { errors: [{ reason: 'userRateLimitExceeded' }] } })); await assert.rejects(drive.meta('X'), { code: 'RATE' });
  queue.push(res(200, { version: '1', trashed: true })); await assert.rejects(drive.meta('X'), { code: 'GONE' });
  queue.push(res(200, { id: 'p1', emailAddress: 'a@b.pl' }));
  await drive.share('FID', 'a@b.pl', 'Cześć');
  assert.match(calls.at(-1).url, /permissions\?sendNotificationEmail=true&emailMessage=Cze%C5%9B%C4%87/);
  assert.deepEqual(JSON.parse(calls.at(-1).init.body), { type: 'user', role: 'writer', emailAddress: 'a@b.pl' });
  const bad = createDrive(async () => 't', async () => { throw new Error('offline'); });
  await assert.rejects(bad.meta('X'), (e) => e instanceof DriveError && e.code === 'NETWORK');
});
