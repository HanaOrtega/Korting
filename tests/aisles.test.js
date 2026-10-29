import test from 'node:test';
import assert from 'node:assert/strict';
import { aisleOf, AISLES, groupByAisle } from '../src/aisles.js';
import { resolve } from '../src/match.js';

const a = (w, lang = 'pl') => aisleOf(resolve(w, new Set(), null, lang).ci);

test('działy sklepu: typowe produkty trafiają do właściwego działu', () => {
  assert.equal(a('jabłka'), 'produce');
  assert.equal(a('cebula'), 'produce');
  assert.equal(a('chleb'), 'bakery');
  assert.equal(a('filet z piersi kurczaka'), 'meat');
  assert.equal(a('mleko'), 'dairy');
  assert.equal(a('mozzarella'), 'dairy');
  assert.equal(a('makaron'), 'pantry');
  assert.equal(a('olej rzepakowy'), 'pantry'); // dziedziczy po „olej”
  assert.equal(a('pizza mrożona'.split(' ')[0]), 'frozen');
  assert.equal(a('piwo'), 'drinks');
  assert.equal(a('płyn do mycia'), a('płyn do mycia'));
  assert.equal(a('papier toaletowy'), 'household');
  assert.equal(aisleOf(null), 'other');
  assert.ok(AISLES.includes(a('kefir')));
});

test('grupowanie po działach zachowuje kolejność trasy i pomija puste działy', () => {
  const items = ['mleko', 'chleb', 'jabłka', 'xyzqwerty'].map((text) => ({ text }));
  const g = groupByAisle(items, (it) => resolve(it.text, new Set(), null, 'pl').ci);
  assert.deepEqual(g.map((x) => x.aisle), ['produce', 'bakery', 'dairy', 'other']);
});
