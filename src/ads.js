// Reklamy (Google AdMob): jeden baner nad dolnym menu, bez reklam przy pisaniu, w trybie zakupów i w oknach.
// Zgoda (RODO / UMP) jest zbierana przed pierwszą reklamą; do czasu podania własnych identyfikatorów (README) wyświetlają się
// reklamy testowe Google.
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useRef, useState } from 'react';
import mobileAds, { AdsConsent, AdsConsentPrivacyOptionsRequirementStatus, MaxAdContentRating, TestIds } from 'react-native-google-mobile-ads';

export const BANNER_ID = process.env.EXPO_PUBLIC_ADMOB_BANNER_ID || TestIds.ADAPTIVE_BANNER;
export { consentGate, shouldShowAd } from './adsRules.js';
export const USING_TEST_ADS = !process.env.EXPO_PUBLIC_ADMOB_BANNER_ID;

/** Natywne wywołania zgody potrafią zawisnąć (brak Usług Google Play, sieć) – po czasie traktujemy to jak błąd. */
const withTimeout = (p, ms = 15000) => Promise.race([p, new Promise((_, rej) => setTimeout(() => rej(new Error('timeout')), ms))]);

const CACHE = 'korting.adsOk'; // zgoda była już udzielona – offline nie blokujemy aplikacji

/**
 * Zgoda UMP + inicjalizacja SDK. status: 'loading' | 'ok' | 'needs' | 'error' (patrz consentGate).
 * `consent` = można żądać reklam; `privacyOptions` = pokaż w menu „Prywatność reklam”.
 */
export function useAds({ disabled = false } = {}) {
  const [state, setState] = useState({ status: 'loading', consent: false, privacyOptions: false });
  const alive = useRef(true);

  const run = useCallback(async () => {
    setState((s) => (s.status === 'ok' ? s : { ...s, status: 'loading' }));
    try {
      await withTimeout(AdsConsent.gatherConsent(), 20000);
      const info = await withTimeout(AdsConsent.getConsentInfo());
      if (!alive.current) return;
      if (!info.canRequestAds) {
        AsyncStorage.setItem(CACHE, '0').catch(() => {});
        setState({ status: 'needs', consent: false, privacyOptions: info.privacyOptionsRequirementStatus === AdsConsentPrivacyOptionsRequirementStatus.REQUIRED });
        return;
      }
      await mobileAds().setRequestConfiguration({ maxAdContentRating: MaxAdContentRating.G, tagForChildDirectedTreatment: false, tagForUnderAgeOfConsent: false });
      await withTimeout(mobileAds().initialize());
      AsyncStorage.setItem(CACHE, '1').catch(() => {});
      if (alive.current) setState({ status: 'ok', consent: true, privacyOptions: info.privacyOptionsRequirementStatus === AdsConsentPrivacyOptionsRequirementStatus.REQUIRED });
    } catch {
      const cached = await AsyncStorage.getItem(CACHE).catch(() => null);
      if (alive.current) setState((s) => ({ ...s, status: cached === '1' ? 'ok' : 'error' }));
    }
  }, []);

  useEffect(() => {
    alive.current = true;
    if (!disabled) run(); // wersja bez reklam: bez zgody i bez inicjalizacji SDK
    return () => { alive.current = false; };
  }, [disabled, run]);

  /** Ponowne pokazanie formularza zgody (np. po odmowie), potem ponowna ocena. */
  const reopen = useCallback(async () => {
    try {
      const info = await AdsConsent.getConsentInfo();
      if (info.privacyOptionsRequirementStatus === AdsConsentPrivacyOptionsRequirementStatus.REQUIRED) await AdsConsent.showPrivacyOptionsForm();
      else await AdsConsent.showForm();
    } catch { /* brak formularza – sprawdzimy stan jeszcze raz */ }
    await run();
  }, [run]);
  const showPrivacyOptions = useCallback(async () => { try { await AdsConsent.showPrivacyOptionsForm(); } catch { /* brak formularza */ } await run(); }, [run]);
  return { ...state, retry: run, reopen, showPrivacyOptions };
}
