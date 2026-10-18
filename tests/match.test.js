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

test('odmiana: końcówki fleksyjne nie psują rozpoznania', () => {
  for (const [input, nl] of [['pomidorów', 'tomaten'], ['masła', 'boter'], ['chleba', 'brood'], ['jabłek', 'appels'],
    ['ziemniaków', 'aardappelen'], ['kurczaka', 'kipfilet'], ['sera', 'kaas'], ['jajek', 'eieren']]) {
    assert.equal(dutchName(resolve(input).ci), nl, input);
  }
});

test('z kilku słów wygrywa właściwe: „piersi z kurczaka” to kurczak, a „mleko kokosowe” to kokosmelk', () => {
  assert.equal(dutchName(resolve('piersi z kurczaka').ci), 'kipfilet');
  assert.equal(dutchName(resolve('mleko kokosowe').ci), 'kokosmelk');
});

test('dokładne holenderskie słowo z promocji wygrywa z domysłem literówki', () => {
  const vocab = buildVocab([{ name: 'Tompouce' }, { name: 'Roomboter' }]);
  assert.equal(resolve('tompouce', vocab).status, 'dutch');
});

test('tłumaczenie: nierozpoznane słowo jest rozpoznawane po przetłumaczeniu', () => {
  const vocab = buildVocab([{ name: 'Tuinkers bakje' }]);
  assert.equal(resolve('rzeżucha', vocab).status, 'unknown');
  const r = resolve('rzeżucha', vocab, 'tuinkers');
  assert.equal(r.status, 'translated');
  assert.deepEqual(r.terms, ['tuinkers']);
  assert.equal(matchDeals(r.terms, [{ name: 'Tuinkers bakje', price: 1 }]).length, 1);
  // tłumaczenie na słowo ze słownika → pojęcie
  assert.equal(dutchName(resolve('rzeżucha', vocab, 'melk').ci), 'melk');
});

test('ziemniak (aardappel) nie jest jabłkiem (appel)', () => {
  const d = [{ name: 'Aardappel Anders', price: 1 }, { name: 'Elstar appels', price: 2 }];
  assert.deepEqual(matchDeals(resolve('jabłka').terms, d).map((x) => x.name), ['Elstar appels']);
});

const nm = (input, list) => { const r = resolve(input); return matchDeals(r.terms, list, r.ci).map((d) => d.name); };

test('masło: bez croissantów z masłem i innych produktów, w których masło to tylko dodatek', () => {
  const list = [
    { name: 'Campina roomboter', price: 2 },
    { name: 'Roomboter croissants', price: 1 },
    { name: 'Croissants met roomboter', price: 1 },
    { name: 'Boterkoek met amandel', price: 3 },
    { name: 'Pizza met kaas en boter', price: 3 },
    { name: 'Blue Band boter', price: 2.5 },
  ];
  assert.deepEqual(nm('masło', list).sort(), ['Blue Band boter', 'Campina roomboter']);
});

test('dodatki po „met / in / voor” nie liczą się jako produkt', () => {
  const list = [{ name: 'Tonijn in olie', price: 1 }, { name: 'Olijfolie extra vierge', price: 5 }, { name: 'Hondenvoer met kip', price: 1 }];
  assert.deepEqual(nm('olej', list), ['Olijfolie extra vierge']);
  assert.deepEqual(nm('tuńczyk', list), ['Tonijn in olie']);
  assert.deepEqual(nm('kurczak', list), []);
});

test('osobne produkty ze słownika nie podszywają się pod siebie (mleko ≠ czekoladowe mleko, kawa ≠ kawa mrożona jest OK)', () => {
  const list = [{ name: 'Halfvolle melk', price: 1 }, { name: 'Chocolademelk', price: 1 }, { name: 'Alle Douwe Egberts ijskoffie', price: 1 }];
  assert.deepEqual(nm('mleko', list), ['Halfvolle melk']);
  assert.deepEqual(nm('kawa', list), ['Alle Douwe Egberts ijskoffie']);
});

test('ilości na końcu nazwy nie zaburzają rozpoznania produktu', () => {
  const list = [{ name: 'Verse kipfilet 500 g', price: 3 }, { name: 'Pils 6 pack', price: 4 }];
  assert.deepEqual(nm('kurczak', list), ['Verse kipfilet 500 g']);
  assert.deepEqual(nm('piwo', list), ['Pils 6 pack']);
});

test('fałszywe złożenia: granat to nie jabłko, folia to nie olej', () => {
  const list = [{ name: 'Granaatappel', price: 1 }, { name: 'Rasterfolie 3 x 4 m', price: 2 }, { name: 'Elstar appels', price: 2 }, { name: 'Olijfolie', price: 5 }];
  assert.deepEqual(nm('jabłka', list), ['Elstar appels']);
  assert.deepEqual(nm('olej', list), ['Olijfolie']);
});
