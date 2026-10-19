import test from 'node:test';
import assert from 'node:assert/strict';
import { neededAmount, packPlan, sortByNeed, fmtQty } from '../src/need.js';

test('potrzebna ilość: 500 g kurczaka vs opakowania', () => {
  const need = neededAmount([{ dim: 'g', value: 500 }]);
  assert.equal(need.small, false);
  const a = { name: 'Kipfilet 400 g', price: 3, id: 'a' };
  const b = { name: 'Kipfilet 1 kg', price: 7, id: 'b' };
  const c = { name: 'Kipfilet 250 g', price: 2, id: 'c' };
  assert.deepEqual(packPlan(need, a), { n: 2, total: 6, size: 0.4, per: 'kg', covers: 0.8 });
  assert.equal(packPlan(need, c).n, 2);
  assert.deepEqual(sortByNeed([b, a, c], need).map((d) => d.id), ['c', 'a', 'b']);
  assert.equal(fmtQty(0.5, 'kg'), '500 g');
});

test('łyżka czegoś to mała ilość – nie liczymy opakowań', () => {
  const need = neededAmount([{ dim: 'ml', value: 30, approx: true }]);
  assert.equal(need.small, true);
  assert.equal(packPlan(need, { name: 'Olie 1 l', price: 2 }), null);
  assert.equal(neededAmount([{ dim: 'clove', value: 3 }]), null);
  assert.equal(packPlan(neededAmount([{ dim: 'ml', value: 500 }]), { name: 'Kipfilet 500 g', price: 3 }), null); // ml ≠ kg
});
