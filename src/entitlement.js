// Prawo do wersji bez reklam: czysta logika (testowana w Node), bez zależności od biblioteki płatności.
export const REMOVE_ADS_SKU = process.env.EXPO_PUBLIC_REMOVE_ADS_SKU || 'remove_ads';

/** Czy któryś z zakupów to opłacona wersja bez reklam (oczekujące płatności nie liczą się jeszcze). */
export function ownsRemoveAds(purchases, sku = REMOVE_ADS_SKU) {
  return (purchases ?? []).some((p) => (p.productId === sku || p.id === sku || (p.ids ?? []).includes(sku)) && p.purchaseState === 'purchased');
}

export const hasPending = (purchases, sku = REMOVE_ADS_SKU) =>
  (purchases ?? []).some((p) => (p.productId === sku || (p.ids ?? []).includes(sku)) && p.purchaseState === 'pending');

/** Wynik zapytania do Google Play ma pierwszeństwo (zwrot środków odbiera prawo); gdy sklep nieosiągalny (null) – ostatni znany stan. */
export const reconcile = (cached, queried) => (queried === null || queried === undefined ? !!cached : !!queried);
