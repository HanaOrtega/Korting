import test from 'node:test';
import assert from 'node:assert/strict';
import { describe as desc, diffItems, MAX_ENTRIES, record, restoreAll, restoreMissing } from '../src/history.js';

const L = (...names) => names.map((n, i) => ({ id: String(i + 1), text: n, done: false }));

test('opis zmiany: usunięcie, dodanie, zmiana, mieszane', () => {
  assert.deepEqual(desc(L('mleko', 'chleb'), L('mleko', 'chleb').slice(1)), { key: 'hRemovedOne', n: 1, name: 'mleko' });
  assert.equal(desc(L('a', 'b', 'c'), []).key, 'hRemoved');
  assert.equal(desc(L('a'), [...L('a'), { id: '9', text: 'x' }]).key, 'hAddedOne');
  assert.equal(desc(L('a'), [{ id: '1', text: 'a', done: true }]).key, 'hChanged');
  assert.equal(desc(L('a', 'b'), [{ id: '1', text: 'a', done: true }]).key, 'hMixed');
});

test('historia: zmiany w krótkim czasie łączą się w jeden wpis, zachowując najstarszy stan', () => {
  let h = [];
  const s0 = L('mleko', 'chleb', 'masło');
  const s1 = s0.filter((x) => x.id !== '1');
  const s2 = s1.filter((x) => x.id !== '2');
  h = record(h, s0, s1, 1000);
  h = record(h, s1, s2, 4000);
  assert.equal(h.length, 1);
  assert.deepEqual(h[0].items, s0);
  assert.equal(h[0].label.key, 'hRemoved');
  h = record(h, s2, [], 60000);
  assert.equal(h.length, 2);
  assert.deepEqual(h[0].items, s2);
});

test('historia: powrót do stanu sprzed usuwa wpis, brak zmiany nic nie zapisuje, limit wpisów', () => {
  const s0 = L('a', 'b');
  let h = record([], s0, L('a'), 1000);
  h = record(h, L('a'), s0, 2000); // „cofnięte” ręcznie w ciągu 10 s
  assert.equal(h.length, 0);
  assert.deepEqual(record([], s0, s0, 5), []);
  let many = [];
  for (let i = 0; i < MAX_ENTRIES + 10; i++) many = record(many, L('a'), L('a', `x${i}`), i * 100000);
  assert.equal(many.length, MAX_ENTRIES);
});

test('przywracanie: cała lista albo tylko usunięte pozycje (nowsze zmiany zostają)', () => {
  const before = L('mleko', 'chleb', 'masło');
  const entry = record([], before, before.slice(1), 1)[0];
  const current = [...before.slice(1), { id: '77', text: 'nowe', done: false }];
  assert.deepEqual(restoreAll(entry), before);
  const r = restoreMissing(entry, current);
  assert.equal(r.count, 1);
  assert.deepEqual(r.items.map((i) => i.text), ['mleko', 'chleb', 'masło', 'nowe']);
  assert.equal(restoreMissing(entry, before).count, 0);
  assert.deepEqual(diffItems(before, before), { removed: [], added: [], changed: [] });
});
