import AsyncStorage from '@react-native-async-storage/async-storage';
import { getLocales } from 'expo-localization';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Alert, AppState, Modal, Pressable, Text, useColorScheme, View } from 'react-native';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Icon, Segmented, TabBar } from './src/components/ui.js';
import WebViewHost from './src/components/WebViewHost.js';
import { loadDeals, needsRefresh, readCache } from './src/deals.js';
import { LANG_CODES, LANG_NAMES, makeT, pickLanguage } from './src/i18n.js';
import { buildVocab } from './src/match.js';
import { favoriteChains } from './src/stores.js';
import DealsScreen from './src/screens/DealsScreen.js';
import ListScreen from './src/screens/ListScreen.js';
import StoresScreen from './src/screens/StoresScreen.js';
import VocabScreen from './src/screens/VocabScreen.js';
import { dark, elevation, light, radius, space, type } from './src/theme.js';

const store = {
  async get(key, fallback) {
    try { const v = await AsyncStorage.getItem(key); return v == null ? fallback : JSON.parse(v); } catch { return fallback; }
  },
  async set(key, value) { try { await AsyncStorage.setItem(key, JSON.stringify(value)); } catch {} },
};

export default function App() {
  return (
    <SafeAreaProvider>
      <Root />
    </SafeAreaProvider>
  );
}

function Root() {
  const insets = useSafeAreaInsets();
  const system = useColorScheme(); // kolor ustawiony w telefonie (jasny/ciemny), reaguje na bieżąco
  const [themePref, setThemePref] = useState('auto'); // auto | light | dark
  const c = (themePref === 'auto' ? system : themePref) === 'dark' ? dark : light;
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
      const v = await store.get('korting.view', 'items');
      const tp = await store.get('korting.theme', 'auto');
      if (['auto', 'light', 'dark'].includes(tp)) setThemePref(tp);
      setView(v === 'stores' ? 'stores' : 'items'); // widok porównania został usunięty
      setReady(true);
    })();
  }, []);
  useEffect(() => { if (ready) store.set('korting.items', items); }, [items, ready]);
  useEffect(() => { if (ready) store.set('korting.favorites', favorites); }, [favorites, ready]);
  useEffect(() => { if (ready) store.set('korting.view', view); }, [view, ready]);
  useEffect(() => { if (ready) store.set('korting.theme', themePref); }, [themePref, ready]);
  useEffect(() => { if (ready) store.set('korting.confirmed', confirmed); }, [confirmed, ready]);

  // Promocje tylko z wybranych sklepów – pozostałych nawet nie pobieramy.
  const chains = useMemo(() => favoriteChains(favorites), [favorites]);
  const chainsKey = chains.join('|');
  const needStores = !confirmed || chains.length === 0;
  const deals = useMemo(() => data.deals.filter((d) => chains.includes(d.store)), [data.deals, chainsKey]);
  const errors = useMemo(() => data.errors.filter((e) => chains.includes(e.store)), [data.errors, chainsKey]);

  const busy = useRef(false);
  const refresh = useCallback(async (force = false) => {
    if (needStores) { setLoading(false); return; }
    if (busy.current) return;
    busy.current = true;
    try {
      const cached = await readCache(chains); // pokaż od razu to, co mamy
      if (cached) setData(cached);
      if (!force && !(await needsRefresh(chains))) return; // dane są świeże – bez zbędnego pobierania
      setLoading(true);
      setData(await loadDeals({ force, stores: chains }));
    } finally { busy.current = false; setLoading(false); }
  }, [needStores, chainsKey]);
  useEffect(() => { if (ready) refresh(false); }, [ready, refresh]);

  // automatyczne odświeżanie: po powrocie do aplikacji i co 15 minut, gdy jest otwarta (pobiera tylko przeterminowane dane)
  useEffect(() => {
    if (!ready) return undefined;
    const sub = AppState.addEventListener('change', (st) => { if (st === 'active') refresh(false); });
    const id = setInterval(() => { if (AppState.currentState === 'active') refresh(false); }, 15 * 60 * 1000);
    return () => { sub.remove(); clearInterval(id); };
  }, [ready, refresh]);

  const vocab = useMemo(() => buildVocab(deals), [deals]);
  const changeLang = (code) => { setLang(code); store.set('korting.lang', code); setPickLang(false); };
  const addFromDeal = (deal) => {
    setItems((prev) => [{ id: `${Date.now()}-${deal.id}`, text: deal.name, done: false }, ...prev]);
    setTab('list');
  };

  const onList = items.filter((i) => !i.done).length;
  const fmtTime = (ms) => new Date(ms).toLocaleTimeString(lang, { hour: '2-digit', minute: '2-digit' });
  const subtitle = chains.length ? chains.join(' · ') + (data.at ? ` · ${t('updated', { t: fmtTime(data.at) })}` : '') : '';

  return (
    <View style={{ flex: 1, backgroundColor: c.bg, paddingTop: insets.top }}>
      <StatusBar style={c === dark ? 'light' : 'dark'} />
      <View style={{ paddingHorizontal: space.lg, paddingTop: space.sm, paddingBottom: space.md, gap: space.sm }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.md }}>
          <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: c.primary, alignItems: 'center', justifyContent: 'center', ...elevation(c, 1) }}>
            <Icon name="cart" size={22} color={c.primaryInk} stroke={2.2} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ color: c.fg, ...type.title }}>Korting</Text>
            {subtitle ? <Text numberOfLines={1} style={{ color: c.mut, ...type.caption }}>{subtitle}</Text> : null}
          </View>
          <Pressable onPress={() => setPickLang(true)} accessibilityRole="button" accessibilityLabel="language"
            style={{ flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, height: 40, borderRadius: 20, backgroundColor: c.chip }}>
            <Icon name="globe" size={16} color={c.ink2} />
            <Text style={{ color: c.fg, fontWeight: '700', fontSize: 13 }}>{lang.toUpperCase()}</Text>
          </Pressable>
        </View>
        {loading && !needStores && (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <ActivityIndicator size="small" color={c.primary} />
            <Text style={{ color: c.mut, ...type.small }}>{t('loading')}</Text>
          </View>
        )}
        {!loading && errors.length > 0 && (
          <Pressable onPress={() => Alert.alert('Korting', errors.map((e) => `${e.store}: ${e.error}`).join('\n\n'))}
            style={{ flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: c.warnTint, borderRadius: radius.md, padding: space.md }}>
            <Icon name="alert" size={18} color={c.warnFg} />
            <Text style={{ color: c.warnFg, ...type.small, flex: 1 }}>{t('failed', { stores: errors.map((e) => e.store).join(', ') })} · {t('details')}</Text>
          </Pressable>
        )}
      </View>

      <View style={{ flex: 1, paddingBottom: needStores ? insets.bottom : 0 }}>
        {needStores ? (
          // najpierw wybór sklepów – dopiero potem lista i promocje
          <StoresScreen c={c} t={t} favorites={favorites} setFavorites={setFavorites} intro onContinue={() => setConfirmed(true)} />
        ) : tab === 'vocab' ? (
          <VocabScreen c={c} t={t} lang={lang} items={items} deals={deals} vocab={vocab} />
        ) : tab === 'stores' ? (
          <StoresScreen c={c} t={t} favorites={favorites} setFavorites={setFavorites} />
        ) : tab === 'list' ? (
          <ListScreen c={c} t={t} lang={lang} items={items} setItems={setItems} deals={deals} vocab={vocab}
            view={view} setView={setView} favorites={favorites} />
        ) : (
          <DealsScreen c={c} t={t} lang={lang} deals={deals} onAdd={addFromDeal} refreshing={loading} onRefresh={() => refresh(true)} />
        )}
      </View>

      {!needStores && <TabBar c={c} t={t} tab={tab} setTab={setTab} badge={{ list: onList || 0 }} />}

      <Modal visible={pickLang} transparent animationType="fade" onRequestClose={() => setPickLang(false)}>
        <Pressable onPress={() => setPickLang(false)} style={{ flex: 1, backgroundColor: c.overlay, justifyContent: 'center', padding: 24 }}>
          <View style={{ backgroundColor: c.surface, borderRadius: radius.lg, padding: space.sm, ...elevation(c, 2) }}>
            <View style={{ padding: space.sm, gap: 6 }}>
              <Text style={{ color: c.mut, ...type.overline }}>{t('themeLabel')}</Text>
              <Segmented c={c} value={themePref} onChange={setThemePref}
                options={[{ id: 'auto', label: t('themeAuto') }, { id: 'light', label: t('themeLight') }, { id: 'dark', label: t('themeDark') }]} />
            </View>
            {LANG_CODES.map((code) => (
              <Pressable key={code} onPress={() => changeLang(code)} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 12, paddingHorizontal: space.md, borderRadius: radius.sm, backgroundColor: code === lang ? c.primaryTint : 'transparent' }}>
                <Text style={{ color: code === lang ? c.primaryDeep : c.fg, fontSize: 17, fontWeight: code === lang ? '800' : '500' }}>{LANG_NAMES[code]}</Text>
                {code === lang && <Icon name="check" size={18} color={c.primary} stroke={2.6} />}
              </Pressable>
            ))}
          </View>
        </Pressable>
      </Modal>

      <WebViewHost />
    </View>
  );
}
