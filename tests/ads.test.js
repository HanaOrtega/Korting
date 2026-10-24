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

import { hasPending, ownsRemoveAds, reconcile } from '../src/entitlement.js';

test('zakup „Usuń reklamy”: tylko opłacony zakup daje prawo, oczekujący nie, zwrot odbiera, brak sklepu zachowuje stan', () => {
  assert.equal(ownsRemoveAds([{ productId: 'remove_ads', purchaseState: 'purchased' }]), true);
  assert.equal(ownsRemoveAds([{ productId: 'remove_ads', purchaseState: 'pending' }]), false);
  assert.equal(ownsRemoveAds([{ productId: 'other', purchaseState: 'purchased' }]), false);
  assert.equal(ownsRemoveAds([{ ids: ['remove_ads'], purchaseState: 'purchased' }]), true);
  assert.equal(ownsRemoveAds([]), false);
  assert.equal(hasPending([{ productId: 'remove_ads', purchaseState: 'pending' }]), true);
  assert.equal(reconcile(true, false), false); // sklep mówi „nie” (zwrot) → odbieramy
  assert.equal(reconcile(true, null), true); // sklep niedostępny → ostatni znany stan
  assert.equal(reconcile(false, true), true);
});
