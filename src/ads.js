// Reklamy (Google AdMob): jeden baner nad dolnym menu, bez reklam przy pisaniu, w trybie zakupów i w oknach.
// Zgoda (RODO / UMP) jest zbierana przed pierwszą reklamą; do czasu podania własnych identyfikatorów (README) wyświetlają się
// reklamy testowe Google.
import { useCallback, useEffect, useState } from 'react';
import mobileAds, { AdsConsent, AdsConsentPrivacyOptionsRequirementStatus, MaxAdContentRating, TestIds } from 'react-native-google-mobile-ads';

export const BANNER_ID = process.env.EXPO_PUBLIC_ADMOB_BANNER_ID || TestIds.ADAPTIVE_BANNER;
export { shouldShowAd } from './adsRules.js';
export const USING_TEST_ADS = !process.env.EXPO_PUBLIC_ADMOB_BANNER_ID;

/** Zgoda UMP + inicjalizacja SDK. `consent` = można żądać reklam; `privacyOptions` = pokaż w menu „Prywatność reklam”. */
export function useAds({ disabled = false } = {}) {
  const [state, setState] = useState({ consent: false, privacyOptions: false });
  useEffect(() => {
    if (disabled) return undefined; // wersja bez reklam: bez zgody i bez inicjalizacji SDK
    let alive = true;
    (async () => {
      try {
        await AdsConsent.gatherConsent();
        const info = await AdsConsent.getConsentInfo();
        if (!alive || !info.canRequestAds) return;
        await mobileAds().setRequestConfiguration({ maxAdContentRating: MaxAdContentRating.G, tagForChildDirectedTreatment: false, tagForUnderAgeOfConsent: false });
        await mobileAds().initialize();
        if (alive) setState({ consent: true, privacyOptions: info.privacyOptionsRequirementStatus === AdsConsentPrivacyOptionsRequirementStatus.REQUIRED });
      } catch { /* bez reklam: aplikacja działa normalnie */ }
    })();
    return () => { alive = false; };
  }, [disabled]);
  const showPrivacyOptions = useCallback(async () => { try { await AdsConsent.showPrivacyOptionsForm(); } catch { /* brak formularza */ } }, []);
  return { ...state, showPrivacyOptions };
}
