import test from 'node:test';
import assert from 'node:assert/strict';
import { ROWS, LANGS } from '../src/data/glossary.js';
import { resolve, suggest, matchDeals, buildVocab, dutchName, displayName, norm, distance } from '../src/match.js';

test('słownik: każdy wiersz ma kolumnę dla każdego języka', () => {
  const bad = ROWS.filter((r) => r.split(';').length !== LANGS.length);
  assert.deepEqual(bad, []);
});

test('norm usuwa akcenty i ujednolica pisownię', () => {
  assert.equal(norm('Käse'), 'kase');
  assert.equal(norm('Łosoś'), 'losos');
  assert.equal(norm('ÇILEK'), 'cilek');
  assert.equal(norm("м'ясо"), 'мясо');
});

test('distance obsługuje zamianę sąsiednich liter', () => {
  assert.equal(distance('mleko', 'melko'), 1);
  assert.equal(distance('kaas', 'kaas'), 0);
});

const cases = [
  ['mleko', 'melk'], ['Milch', 'melk'], ['lait', 'melk'], ['молоко', 'melk'], ['süt', 'melk'],
  ['chleb', 'brood'], ['kurczak', 'kipfilet'], ['ser', 'kaas'], ['jajka', 'eieren'],
  ['pomidory', 'tomaten'], ['κ', null],
];
for (const [input, nl] of cases) {
  test(`rozpoznaje „${input}”`, () => {
    const r = resolve(input);
    if (nl === null) return assert.equal(r.ci, null);
    assert.equal(dutchName(r.ci), nl);
  });
}

test('ilości i jednostki są ignorowane', () => {
  assert.equal(dutchName(resolve('2 x mleko 1,5 l').ci), 'melk');
  assert.equal(dutchName(resolve('chleb razowy').ci), 'brood');
});

test('literówki są poprawiane i oznaczane jako fuzzy', () => {
  for (const [typo, nl] of [['mlko', 'melk'], ['kurzcak', 'kipfilet'], ['pomidroy', 'tomaten'], ['bananny', 'bananen'], ['cebula', 'uien']]) {
    const r = resolve(typo);
    assert.equal(dutchName(r.ci), nl, typo);
  }
  assert.equal(resolve('mlko').status, 'fuzzy');
});

test('krótkie słowa nie są poprawiane na siłę', () => {
  assert.equal(resolve('xyz').status, 'unknown');
});

const deals = [
  { name: 'Halfvolle melk 1 L', price: 1.09, validUntil: '2026-10-20' },
  { name: 'Melkchocolade reep', price: 1.5, validUntil: '2026-10-20' },
  { name: 'Alle Kipfilet', price: 4.99, validUntil: '2026-10-20' },
  { name: 'Verse kipfilet 500 g', price: 3.99, validUntil: '2026-10-20' },
  { name: 'Hertog Jan pils', price: null, validUntil: '2026-10-19' },
];

test('dopasowanie: mocne trafienia wypierają słabe, sortowanie od najtańszej', () => {
  assert.deepEqual(matchDeals(resolve('mleko').terms, deals).map((d) => d.name), ['Halfvolle melk 1 L']);
  assert.deepEqual(matchDeals(resolve('kurczak').terms, deals).map((d) => d.price), [3.99, 4.99]);
});

test('słabe trafienie (początek słowa) pokazujemy, gdy nie ma mocnych', () => {
  assert.equal(matchDeals(['chocolade'], [deals[1]]).length, 1); // złożenie kończące się na „chocolade”
  assert.equal(matchDeals(['melk'], [deals[1]]).length, 1);
});

test('holenderskie słowa z promocji: dokładne i z literówką', () => {
  const vocab = buildVocab([{ name: 'Speculaas gevuld' }, { name: 'Pindakaas' }]);
  assert.equal(resolve('speculaas', vocab).status, 'dutch');
  const r = resolve('spekulaas', vocab);
  assert.equal(r.status, 'dutch-fuzzy');
  assert.deepEqual(r.terms, ['speculaas']);
});

test('podpowiedzi podczas pisania', () => {
  assert.ok(suggest('mle', 'pl').map((ci) => displayName(ci, 'pl')).includes('mleko'));
  assert.ok(suggest('mlko', 'pl').map((ci) => dutchName(ci)).includes('melk'));
  assert.deepEqual(suggest('m', 'pl'), []);
});

test('karma dla zwierząt nie jest pokazywana przy szukaniu mięsa', () => {
  const food = [{ name: 'Hondenvoer kuipje senior kip', price: 0.49 }, { name: 'Kipfilet', price: 2 }];
  assert.deepEqual(matchDeals(resolve('kurczak').terms, food).map((d) => d.name), ['Kipfilet']);
  assert.equal(matchDeals(resolve('karma dla psa').terms, food).length, 1);
});
