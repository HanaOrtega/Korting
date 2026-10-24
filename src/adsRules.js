// Reguła widoczności reklam (bez zależności natywnych – testowalna w Node).
/** Gdzie wolno pokazać baner (czysta reguła, testowana). */
export function shouldShowAd({ tab, needStores, keyboard, consent, adFree = false }) {
  return !adFree && !!consent && !needStores && !keyboard && ['list', 'recipes', 'deals'].includes(tab);
}
