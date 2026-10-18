import AsyncStorage from '@react-native-async-storage/async-storage';
import { getLocales } from 'expo-localization';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, Modal, Platform, Pressable, StatusBar as RNStatusBar, Text, useColorScheme, View } from 'react-native';
import WebViewHost from './src/components/WebViewHost.js';
import { loadDeals, readCache } from './src/deals.js';
import { LANG_CODES, LANG_NAMES, makeT, pickLanguage } from './src/i18n.js';
import { buildVocab } from './src/match.js';
import { favoriteChains } from './src/stores.js';
import DealsScreen from './src/screens/DealsScreen.js';
import ListScreen from './src/screens/ListScreen.js';
import StoresScreen from './src/screens/StoresScreen.js';
import { ACCENT, dark, light } from './src/theme.js';

const store = {
  async get(key, fallback) {
    try { const v = await AsyncStorage.getItem(key); return v == null ? fallback : JSON.parse(v); } catch { return fallback; }
  },
  async set(key, value) { try { await AsyncStorage.setItem(key, JSON.stringify(value)); } catch {} },
};

export default function App() {
  const c = useColorScheme() === 'dark' ? dark : light;
  const [lang, setLang] = useState(() => pickLanguage(getLocales()[0]?.languageCode));
  const [items, setItems] = useState([]);
  const [ready, setReady] = useState(false);
  const [tab, setTab] = useState('list');
  const [view, setView] = useState('items'); // lista: 'items' | 'stores'
  const [favorites, setFavorites] = useState([]);
  const [confirmed, setConfirmed] = useState(false); // wybór sklepów zatwierdzony
  const [data, setData] = useState({ deals: [], errors: [], at: 0 });
  const [loading, setLoading] = useState(true);
  const [pickLang, setPickLang] = useState(false);
  const t = useMemo(() => makeT(lang), [lang]);

  useEffect(() => {
    (async () => {
      const savedLang = await store.get('korting.lang', null);
      if (savedLang && LANG_CODES.includes(savedLang)) setLang(savedLang);
      setItems(await store.get('korting.items', []));
      const favs = await store.get('korting.favorites', []);
      setFavorites(favs);
      // kto miał już wybrane sklepy (starsza wersja), nie musi wybierać drugi raz
      setConfirmed(await store.get('korting.confirmed', favs.length > 0));
      setView(await store.get('korting.view', 'items'));
      setReady(true);
    })();
  }, []);
  useEffect(() => { if (ready) store.set('korting.items', items); }, [items, ready]);
  useEffect(() => { if (ready) store.set('korting.favorites', favorites); }, [favorites, ready]);
  useEffect(() => { if (ready) store.set('korting.view', view); }, [view, ready]);
  useEffect(() => { if (ready) store.set('korting.confirmed', confirmed); }, [confirmed, ready]);

  // Promocje tylko z wybranych sklepów – pozostałych nawet nie pobieramy.
  const chains = useMemo(() => favoriteChains(favorites), [favorites]);
  const chainsKey = chains.join('|');
  const needStores = !confirmed || chains.length === 0;
  const deals = useMemo(() => data.deals.filter((d) => chains.includes(d.store)), [data.deals, chainsKey]);
  const errors = useMemo(() => data.errors.filter((e) => chains.includes(e.store)), [data.errors, chainsKey]);

  const refresh = useCallback(async (force = false) => {
    if (needStores) { setLoading(false); return; }
    setLoading(true);
    const cached = await readCache(chains); // pokaż od razu to, co mamy
    if (cached) setData(cached);
    try { setData(await loadDeals({ force, stores: chains })); } finally { setLoading(false); }
  }, [needStores, chainsKey]);
  useEffect(() => { if (ready) refresh(false); }, [ready, refresh]);

  const vocab = useMemo(() => buildVocab(deals), [deals]);
  const changeLang = (code) => { setLang(code); store.set('korting.lang', code); setPickLang(false); };
  const addFromDeal = (deal) => {
    setItems((prev) => [{ id: `${Date.now()}-${deal.id}`, text: deal.name, done: false }, ...prev]);
    setTab('list');
  };

  const top = Platform.OS === 'android' ? (RNStatusBar.currentHeight ?? 24) : 50;
  const tabBtn = (id, label) => (
    <Pressable key={id} onPress={() => setTab(id)} style={{ flex: 1, padding: 10, borderRadius: 12, alignItems: 'center',
      backgroundColor: tab === id ? ACCENT : c.chip }}>
      <Text style={{ color: tab === id ? '#fff' : c.fg, fontWeight: '600' }}>{label}</Text>
    </Pressable>
  );

  return (
    <View style={{ flex: 1, backgroundColor: c.bg, paddingTop: top }}>
      <StatusBar style={c === dark ? 'light' : 'dark'} />
      <View style={{ paddingHorizontal: 16, paddingBottom: 8, borderBottomWidth: 1, borderBottomColor: c.border, gap: 8 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <Text style={{ color: ACCENT, fontSize: 24, fontWeight: '800' }}>Korting</Text>
          <Pressable onPress={() => setPickLang(true)} style={{ paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, backgroundColor: c.chip }}>
            <Text style={{ color: c.fg }}>🌐 {lang.toUpperCase()}</Text>
          </Pressable>
        </View>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          {tabBtn('list', t('tabList'))}
          {tabBtn('deals', t('tabDeals'))}
          {tabBtn('stores', t('tabStores'))}
        </View>
        {loading && !needStores && <Text style={{ color: c.mut, fontSize: 13 }}>{t('loading')}</Text>}
        {!loading && errors.length > 0 && (
          <Pressable onPress={() => Alert.alert('Korting', errors.map((e) => `${e.store}: ${e.error}`).join('\n\n'))}>
            <Text style={{ backgroundColor: c.warn, color: c.warnFg, padding: 8, borderRadius: 10, fontSize: 13 }}>
              {t('failed', { stores: errors.map((e) => e.store).join(', ') })} · {t('details')}
            </Text>
          </Pressable>
        )}
      </View>

      {tab === 'stores' ? (
        <StoresScreen c={c} t={t} favorites={favorites} setFavorites={setFavorites} />
      ) : needStores ? (
        // najpierw wybór sklepów – dopiero potem lista i promocje
        <StoresScreen c={c} t={t} favorites={favorites} setFavorites={setFavorites} intro onContinue={() => setConfirmed(true)} />
      ) : tab === 'list' ? (
        <ListScreen c={c} t={t} lang={lang} items={items} setItems={setItems} deals={deals} vocab={vocab}
          view={view} setView={setView} favorites={favorites} />
      ) : (
        <DealsScreen c={c} t={t} lang={lang} deals={deals} onAdd={addFromDeal} refreshing={loading} onRefresh={() => refresh(true)} />
      )}

      <Modal visible={pickLang} transparent animationType="fade" onRequestClose={() => setPickLang(false)}>
        <Pressable onPress={() => setPickLang(false)} style={{ flex: 1, backgroundColor: '#0008', justifyContent: 'center', padding: 24 }}>
          <View style={{ backgroundColor: c.card, borderRadius: 16, padding: 8 }}>
            {LANG_CODES.map((code) => (
              <Pressable key={code} onPress={() => changeLang(code)} style={{ padding: 12 }}>
                <Text style={{ color: code === lang ? ACCENT : c.fg, fontSize: 17, fontWeight: code === lang ? '700' : '400' }}>
                  {LANG_NAMES[code]}
                </Text>
              </Pressable>
            ))}
          </View>
        </Pressable>
      </Modal>

      <WebViewHost />
    </View>
  );
}
