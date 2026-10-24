// Reguła widoczności reklam (bez zależności natywnych – testowalna w Node).
/** Gdzie wolno pokazać baner (czysta reguła, testowana). */
export function shouldShowAd({ tab, needStores, keyboard, consent, adFree = false }) {
  return !adFree && !!consent && !needStores && !keyboard && ['list', 'recipes', 'deals'].includes(tab);
}

/**
 * Bramka zgody: aplikacja działa po zgodzie na reklamy ALBO po wykupieniu wersji bez reklam.
 * status: 'loading' | 'ok' | 'needs' (brak zgody) | 'error' (nie udało się sprawdzić zgody i nie ma zapamiętanej).
 * Zwraca 'loading' | 'blocked' | 'open'.
 */
export function consentGate({ proReady, owned, status }) {
  if (!proReady) return 'loading';
  if (owned) return 'open';
  if (status === 'ok') return 'open';
  return status === 'loading' ? 'loading' : 'blocked';
}
