import test from 'node:test';
import assert from 'node:assert/strict';
import { compareStores, priceInStore } from '../src/compare.js';
import { parseAhRegular } from '../src/providers/ah.js';

const d = (store, price, unit = '', extra = {}) => ({ id: `${store}${price}`, store, price, unit, name: 'x', ...extra });
const row = (id, hits, done = false) => ({ item: { id, text: id, done }, hits });

test('priceInStore: promocja vs zwykła cena – wygrywa niższa', () => {
  assert.equal(priceInStore('Lidl', [d('Lidl', 1.5)], [d('Lidl', 2)]).kind, 'promo');
  assert.equal(priceInStore('Lidl', [d('Lidl', 2.5)], [d('Lidl', 2)]).kind, 'regular');
  assert.equal(priceInStore('Jumbo', [d('Lidl', 1)], []), null);
  assert.equal(priceInStore('Jumbo', [d('Jumbo', null)], []), null); // oferta bez ceny nie jest ceną
});

test('compareStores: porównuje tylko wspólne produkty, różnica z sum', () => {
  const rows = [
    row('mleko', [d('Lidl', 0.8, '1 l'), d('Jumbo', 1, '1 l')]),
    row('chleb', [d('Lidl', 1.2, '500 g'), d('Jumbo', 1.5, '500 g')]),
    row('masło', [d('Lidl', 2)]), // tylko Lidl – nie wchodzi do porównania parami
    row('kupione', [d('Lidl', 9), d('Jumbo', 1)], true),
  ];
  const { summary, pairs } = compareStores(rows, {}, ['Lidl', 'Jumbo']);
  assert.deepEqual(summary.map((s) => [s.store, s.covered, s.of]), [['Lidl', 3, 3], ['Jumbo', 2, 3]]);
  assert.equal(pairs.length, 1);
  assert.deepEqual([pairs[0].cheaper, pairs[0].other, pairs[0].common], ['Lidl', 'Jumbo', 2]);
  assert.equal(pairs[0].pct, 20); // Lidl 0,8 + 1,2 = 2,0 vs Jumbo 1 + 1,5 = 2,5 → 20% taniej
});

test('compareStores: różne opakowania porównuje po cenie za kg/l', () => {
  const rows = [row('ser', [d('Lidl', 2, '500 g'), d('Jumbo', 3, '1 kg')])]; // 4 €/kg vs 3 €/kg
  const { pairs } = compareStores(rows, {}, ['Lidl', 'Jumbo']);
  assert.equal(pairs[0].cheaper, 'Jumbo');
  assert.equal(pairs[0].pct, 25);
});

test('compareStores: zwykłe ceny uzupełniają braki', () => {
  const rows = [row('mleko', [d('Jumbo', 1, '1 l')])];
  const { pairs, summary } = compareStores(rows, { mleko: [d('Lidl', 1.2, '1 l')] }, ['Lidl', 'Jumbo']);
  assert.equal(summary[0].covered, 1);
  assert.equal(pairs[0].cheaper, 'Jumbo');
});

test('AH: zwykła cena produktu w bonusie to cena sprzed bonusu', () => {
  const out = parseAhRegular({ products: [
    { webshopId: 1, title: 'Melk', currentPrice: 1.09, priceBeforeBonus: 1.29, isBonus: true },
    { webshopId: 2, title: 'Brood', currentPrice: 2 },
    { webshopId: 3, title: 'Bez ceny' },
  ] });
  assert.deepEqual(out.map((x) => [x.name, x.price]), [['Melk', 1.29], ['Brood', 2]]);
});

test('compareStores: 6 piw nie jest porównywane z 24 puszkami po cenie opakowania', () => {
  // Lidl: 6 × 0,5 l za 4,99 (≈1,66 €/l); Jumbo: 24 × 33 cl (7,92 l) za 17,99 (≈2,27 €/l)
  const rows = [row('piwo', [d('Lidl', 4.99, '6 x 0,5 l'), d('Jumbo', 17.99, '24 x 33 cl')])];
  const { pairs } = compareStores(rows, {}, ['Lidl', 'Jumbo']);
  assert.equal(pairs[0].cheaper, 'Lidl');
  assert.ok(Math.abs(pairs[0].sumB - 6.81) < 0.05, `sumB=${pairs[0].sumB}`); // 3 l w Jumbo ≈ €6,81
  assert.equal(pairs[0].pct, 27);
});

test('compareStores: wynik pary wynika z sum, a nie ze średniej procentów pojedynczych produktów', () => {
  // produkt a: Lidl 50% taniej, produkt b: Jumbo ~5% taniej – ale drogi produkt b przeważa: sumy są równe
  const rows = [row('a', [d('Lidl', 1), d('Jumbo', 2)]), row('b', [d('Lidl', 20), d('Jumbo', 19)])];
  const { pairs } = compareStores(rows, {}, ['Lidl', 'Jumbo']);
  assert.equal(pairs[0].sumA, 21);
  assert.equal(pairs[0].sumB, 21);
  assert.equal(pairs[0].pct, 0);
});
