import test from 'node:test';
import assert from 'node:assert/strict';
import { factor, filterRecipes, guessTitle, newRecipe, shareText, updateRecipe } from '../src/recipes.js';
import { buildGroups, mergeIntoItems } from '../src/recipe.js';
import { buildVocab } from '../src/match.js';

test('przepis: tworzenie, aktualizacja, tytuł z pierwszej linii', () => {
  const r = newRecipe({ title: '  Spaghetti  ', servings: '2.6', ingredients: ' 400 g spaghetti ' }, 1000);
  assert.equal(r.title, 'Spaghetti'); assert.equal(r.servings, 3); assert.equal(r.ingredients, '400 g spaghetti'); assert.equal(r.fav, false);
  const u = updateRecipe(r, { fav: true }, 2000);
  assert.equal(u.fav, true); assert.equal(u.updated, 2000); assert.equal(u.created, 1000); assert.equal(u.title, 'Spaghetti');
  assert.equal(newRecipe({ title: 'x', servings: 0 }).servings, 4);
  assert.equal(guessTitle('Zapiekanka makaronowa\n200 g makaronu'), 'Zapiekanka makaronowa');
  assert.equal(guessTitle('200 g makaronu\n2 jajka'), '');
  assert.equal(guessTitle('Składniki:\n1 jajko'), '');
});

test('książka: wyszukiwanie ignoruje wielkość liter i polskie znaki, ulubione, najnowsze pierwsze', () => {
  const a = newRecipe({ title: 'Żurek', ingredients: '1 l żurku' }, 1000);
  const b = { ...newRecipe({ title: 'Naleśniki', ingredients: '2 jajka\n250 ml mleka' }, 2000), fav: true };
  const list = [a, b];
  assert.deepEqual(filterRecipes(list, '').map((r) => r.title), ['Naleśniki', 'Żurek']);
  assert.deepEqual(filterRecipes(list, 'zurek').map((r) => r.title), ['Żurek']);
  assert.deepEqual(filterRecipes(list, 'JAJKA').map((r) => r.title), ['Naleśniki']);
  assert.deepEqual(filterRecipes(list, '', true).map((r) => r.title), ['Naleśniki']);
});

test('przepis → lista zakupów: skalowanie porcji, pominięcie „mam w domu”, źródło przepisu, sumowanie z listą', () => {
  const r = newRecipe({ title: 'Naleśniki', servings: 4, ingredients: '250 g mąki\n2 jajka\n500 ml mleka\nsól' });
  const vocab = buildVocab([]);
  const { groups } = buildGroups(r.ingredients, { lang: 'pl', vocab, multiplier: factor(r.servings, 8) });
  assert.equal(groups.length, 4);
  assert.deepEqual(groups.find((g) => /mąk/.test(g.text)).amounts, [{ dim: 'g', value: 500 }]);
  const chosen = groups.filter((g) => !/sól|sol/i.test(g.text)); // „mam sól w domu”
  let n = 0;
  const base = [{ id: 'x1', text: 'mleko', done: false, amounts: [{ dim: 'ml', value: 1000 }] }];
  const out = mergeIntoItems(base, chosen, { lang: 'pl', vocab, makeId: () => `id${++n}`, recipe: r.title }).items;
  assert.equal(out.length, 3);
  const milk = out.find((i) => i.id === 'x1');
  assert.deepEqual(milk.amounts, [{ dim: 'ml', value: 2000 }]); // 1000 + 1000
  assert.deepEqual(milk.recipes, ['Naleśniki']);
  assert.ok(out.every((i) => i.recipes.includes('Naleśniki')));
  const again = mergeIntoItems(out, chosen, { lang: 'pl', vocab, makeId: () => `z${++n}`, recipe: 'Naleśniki' }).items;
  assert.deepEqual(again.find((i) => i.id === 'x1').recipes, ['Naleśniki']); // bez duplikatów nazwy
});

test('udostępnianie przepisu jako tekst', () => {
  const r = newRecipe({ title: 'Jajecznica', servings: 2, ingredients: '3 jajka', steps: 'Usmaż.', source: 'https://x.pl' });
  const t = shareText(r, { servings: 'Porcje', ingredients: 'Składniki', steps: 'Przygotowanie' });
  assert.match(t, /^Jajecznica\nPorcje: 2\n\nSkładniki:\n3 jajka\n\nPrzygotowanie:\nUsmaż\.\n\nhttps:\/\/x\.pl$/);
});
