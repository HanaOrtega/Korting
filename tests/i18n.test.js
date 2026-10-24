import test from 'node:test';
import assert from 'node:assert/strict';
import { LANG_CODES, T } from '../src/i18n.js';

const vars = (s) => [...String(s).matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort().join(',');

test('i18n: każdy język ma wszystkie klucze wspólnej listy, historii i komfortu, z tymi samymi zmiennymi', () => {
  const keys = Object.keys(T.en).filter((k) => /^(sh|h[A-Z]|cf|mn|aisle_|viewAisles|rc|tabRecipes|doneSection|adLabel|pro)/.test(k));
  assert.ok(keys.length > 120);
  const problems = [];
  for (const lang of LANG_CODES) {
    for (const k of keys) {
      if (!(k in T[lang])) problems.push(`${lang}:${k} brak`);
      else if (vars(T[lang][k]) !== vars(T.en[k])) problems.push(`${lang}:${k} zmienne`);
    }
  }
  assert.deepEqual(problems, []);
});
