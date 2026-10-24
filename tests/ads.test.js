import test from 'node:test';
import assert from 'node:assert/strict';

import { shouldShowAd } from '../src/adsRules.js';
import fs from 'node:fs';

test('reklama: tylko z zgodą, na Liście/Przepisach/Promocjach, bez klawiatury i bez ekranu wyboru sklepów', () => {
  const ok = { tab: 'list', needStores: false, keyboard: false, consent: true };
  assert.equal(shouldShowAd(ok), true);
  for (const tab of ['recipes', 'deals']) assert.equal(shouldShowAd({ ...ok, tab }), true);
  for (const tab of ['stores', 'vocab']) assert.equal(shouldShowAd({ ...ok, tab }), false);
  assert.equal(shouldShowAd({ ...ok, consent: false }), false);
  assert.equal(shouldShowAd({ ...ok, keyboard: true }), false);
  assert.equal(shouldShowAd({ ...ok, needStores: true }), false);
});

test('reklamy: żadnych identyfikatorów prywatnych w repozytorium (tylko testowe Google)', () => {
  const app = JSON.parse(fs.readFileSync(new URL('../app.json', import.meta.url), 'utf8'));
  assert.match(app['react-native-google-mobile-ads'].android_app_id, /^ca-app-pub-3940256099942544~/);
});
