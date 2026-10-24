// Jednorazowy zakup „Usuń reklamy” (Google Play Billing przez expo-iap). Stan zakupu zapamiętujemy lokalnie, żeby przy
// starcie bez internetu nie mignęły reklamy; po połączeniu stan ze sklepu ma pierwszeństwo (zwrot środków odbiera prawo).
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useRef, useState } from 'react';
import { endConnection, fetchProducts, finishTransaction, getAvailablePurchases, initConnection, purchaseErrorListener, purchaseUpdatedListener, requestPurchase } from 'expo-iap';
import { hasPending, ownsRemoveAds, REMOVE_ADS_SKU } from './entitlement.js';

const KEY = 'korting.noads';

export function usePro() {
  const [owned, setOwned] = useState(false);
  const [ready, setReady] = useState(false); // zapamiętany stan zakupu wczytany (żeby właściciel nie zobaczył bramki)
  const [price, setPrice] = useState('');
  const [available, setAvailable] = useState(false); // sklep dostępny i produkt znaleziony
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState(null); // 'thanks' | 'restored' | 'nothing' | 'unavailable' | 'pending' | 'error'
  const alive = useRef(true);

  const setOwnedCached = useCallback((v) => { setOwned(v); AsyncStorage.setItem(KEY, v ? '1' : '0').catch(() => {}); }, []);

  const refresh = useCallback(async () => {
    try {
      const list = await getAvailablePurchases();
      if (!alive.current) return null;
      const own = ownsRemoveAds(list);
      setOwnedCached(own); setPending(hasPending(list));
      return own;
    } catch { return null; }
  }, [setOwnedCached]);

  useEffect(() => {
    alive.current = true;
    let subs = [];
    (async () => {
      try { const c = await AsyncStorage.getItem(KEY); if (alive.current) setOwned(c === '1'); } catch { /* brak pamięci */ }
      if (alive.current) setReady(true);
      try {
        await initConnection();
        const products = await fetchProducts({ skus: [REMOVE_ADS_SKU], type: 'in-app' });
        if (alive.current) { setAvailable(!!products?.length); setPrice(products?.[0]?.displayPrice ?? ''); }
        await refresh();
        subs = [
          purchaseUpdatedListener(async (purchase) => {
            if (!ownsRemoveAds([purchase])) { if (hasPending([purchase])) { setPending(true); setMessage('pending'); } return; }
            try { await finishTransaction({ purchase, isConsumable: false }); } catch { /* potwierdzenie ponowi się przy następnym starcie */ }
            if (alive.current) { setOwnedCached(true); setPending(false); setMessage('thanks'); }
          }),
          purchaseErrorListener((e) => { if (alive.current && e?.code !== 'user-cancelled') setMessage('error'); }),
        ];
      } catch { if (alive.current) setAvailable(false); }
    })();
    return () => { alive.current = false; subs.forEach((s) => s?.remove?.()); endConnection().catch(() => {}); };
  }, [refresh, setOwnedCached]);

  const buy = useCallback(async () => {
    if (!available) { setMessage('unavailable'); return; }
    try { await requestPurchase({ request: { google: { skus: [REMOVE_ADS_SKU] } }, type: 'in-app' }); } catch { setMessage('error'); }
  }, [available]);

  const restore = useCallback(async () => {
    const own = await refresh();
    setMessage(own === null ? 'unavailable' : own ? 'restored' : 'nothing');
  }, [refresh]);

  return { owned, ready, price, available, pending, message, clearMessage: () => setMessage(null), buy, restore };
}
