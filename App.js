import AsyncStorage from '@react-native-async-storage/async-storage';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Alert, AppState, Image, Keyboard, Linking, Modal, Pressable, useColorScheme, View } from 'react-native';
import Text from './src/components/Text.js';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import AdBanner from './src/components/AdBanner.js';
import ErrorBoundary from './src/components/ErrorBoundary.js';
import ConsentGate from './src/components/ConsentGate.js';
import { consentGate, shouldShowAd, useAds } from './src/ads.js';
import { usePro } from './src/purchase.js';
import { Icon, IconButton, Segmented, TabBar } from './src/components/ui.js';
import WebViewHost from './src/components/WebViewHost.js';
import { loadDeals, needsRefresh, readCache } from './src/deals.js';
import { DEFAULT_LANG, LANG_CODES, LANG_NAMES, makeT } from './src/i18n.js';
import { buildVocab } from './src/match.js';
import { favoriteChains } from './src/stores.js';
import DealsScreen from './src/screens/DealsScreen.js';
import HistoryScreen from './src/screens/HistoryScreen.js';
import ShareScreen from './src/screens/ShareScreen.js';
import { useHistory } from './src/useHistory.js';
import { useShare } from './src/share/useShare.js';
import ListScreen from './src/screens/ListScreen.js';
import StoresScreen from './src/screens/StoresScreen.js';
import VocabScreen from './src/screens/VocabScreen.js';
import { calmPalette, mergeComfort, SCALES } from './src/comfort.js';
import { ComfortContext } from './src/comfortContext.js';
import { syncReminders } from './src/reminders.js';
import ComfortScreen from './src/screens/ComfortScreen.js';
import RecipeDetail from './src/screens/RecipeDetail.js';
import RecipeEditor from './src/screens/RecipeEditor.js';
import RecipesScreen from './src/screens/RecipesScreen.js';
import { useRecipes } from './src/useRecipes.js';
import { mergeIntoItems } from './src/recipe.js';
import { elevation, light, dark, radius, space, type } from './src/theme.js';
import { setStill } from './src/components/ui.js';
import { matchDeals, resolve, forConcept } from './src/match.js';

const store = {
  async get(key, fallback) {
    try { const v = await AsyncStorage.getItem(key); return v == null ? fallback : JSON.parse(v); } catch { return fallback; }
  },
  async set(key, value) { try { await AsyncStorage.setItem(key, JSON.stringify(value)); } catch {} },
};

export default function App() {
  return (
    <ErrorBoundary>
      <SafeAreaProvider>
        <Root />
      </SafeAreaProvider>
    </ErrorBoundary>
  );
}

function Root() {
  const insets = useSafeAreaInsets();
  const system = useColorScheme(); // kolor ustawiony w telefonie (jasny/ciemny), reaguje na bieżąco
  const [themePref, setThemePref] = useState('auto'); // auto | light | dark
  const [comfort, setComfort] = useState(mergeComfort(null));
  const isDark = (themePref === 'auto' ? system : themePref) === 'dark';
  const c = comfort.calm ? calmPalette(isDark ? dark : light, isDark) : isDark ? dark : light;
  setStill(comfort.still);
  const ctx = useMemo(() => ({ comfort, scale: SCALES[comfort.scale] ?? 1, animated: !comfort.still }), [comfort]);
  const [lang, setLang] = useState(DEFAULT_LANG);
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
  const [shareOpen, setShareOpen] = useState(false);
  const [pendingInvite, setPendingInvite] = useState('');
  const [historyOpen, setHistoryOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [comfortOpen, setComfortOpen] = useState(false);
  const book = useRecipes();
  const pro0 = usePro();
  // Wersja do zrzutów sklepowych (./deploy/emulator.sh --zrzuty): bez reklam i bez bramki zgody.
  const pro = process.env.EXPO_PUBLIC_STORE_SHOTS === '1' ? { ...pro0, owned: true, ready: true } : pro0;
  const ads = useAds({ disabled: pro.owned });
  const askRemoveAds = () => Alert.alert(t('proRemove'), t('proWhy'), [
    { text: t('editCancel'), style: 'cancel' }, { text: t('proRestore'), onPress: pro.restore }, { text: pro.price ? t('proBuy', { price: pro.price }) : t('proRemove'), onPress: pro.buy },
  ]);
  useEffect(() => { if (pro.message) { Alert.alert(t('proRemove'), t(`pro_${pro.message}`)); pro.clearMessage(); } }, [pro.message]);
  const [kb, setKb] = useState(false);
  useEffect(() => {
    const a = Keyboard.addListener('keyboardDidShow', () => setKb(true));
    const b = Keyboard.addListener('keyboardDidHide', () => setKb(false));
    return () => { a.remove(); b.remove(); };
  }, []);
  const [openRecipe, setOpenRecipe] = useState(null); // przepis otwarty w podglądzie
  const [editor, setEditor] = useState(null); // { recipe? , prefill? } albo null
  const [undoDelete, setUndoDelete] = useState(false);
  const history = useHistory({ items, setItems, ready, sticky: comfort.still });
  const setItemsExternal = useCallback((next) => { history.markExternal(next); setItems(next); }, [history.markExternal]); // zmiany z grupy nie trafiają do „cofania”
  const share = useShare({ items, setItems: setItemsExternal, ready });

  // link zaproszenia (korting://join/…) otwiera okno dołączania
  useEffect(() => {
    const open = (url) => { if (url && url.startsWith('korting://join/')) { setPendingInvite(url); setShareOpen(true); } };
    Linking.getInitialURL().then(open).catch(() => {});
    const sub = Linking.addEventListener('url', ({ url }) => open(url));
    return () => sub.remove();
  }, []);

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
      setComfort(mergeComfort(await store.get('korting.comfort', null)));
      const tp = await store.get('korting.theme', 'auto');
      if (['auto', 'light', 'dark'].includes(tp)) setThemePref(tp);
      setView(['stores', 'aisles'].includes(v) ? v : 'items');
      setReady(true);
    })();
  }, []);
  useEffect(() => { if (ready) store.set('korting.items', items); }, [items, ready]);
  useEffect(() => { if (ready) store.set('korting.favorites', favorites); }, [favorites, ready]);
  useEffect(() => { if (ready) store.set('korting.view', view); }, [view, ready]);
  useEffect(() => { if (ready) store.set('korting.theme', themePref); }, [themePref, ready]);
  useEffect(() => { if (ready) store.set('korting.comfort', comfort); }, [comfort, ready]);
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

  // przypomnienia: tygodniowe i „jutro kończy się promocja” – ustawiane w tle po zmianie listy, promocji albo opcji
  useEffect(() => {
    if (!ready || needStores) return undefined;
    const id = setTimeout(() => {
      const rows = comfort.expiry.on ? items.map((item) => {
        const r = item.pick != null ? forConcept(item.pick, item.text) : resolve(item.text, vocab, null, lang);
        return { item, hits: matchDeals(r.terms, deals, r.ci) };
      }) : [];
      syncReminders({ comfort, t, items, rows, lang });
    }, 1500);
    return () => clearTimeout(id);
  }, [ready, needStores, comfort.weekly, comfort.expiry, items, deals, lang]);
  const changeLang = (code) => { setLang(code); store.set('korting.lang', code); setPickLang(false); };
  const addFromDeal = (deal) => {
    setItems((prev) => [{ id: `${Date.now()}-${deal.id}`, text: deal.name, done: false }, ...prev]);
    setTab('list');
  };

  const addRecipeToList = (groups, title) => {
    setItems((prev) => mergeIntoItems(prev, groups, { lang, vocab, makeId: () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, recipe: title }).items);
    setOpenRecipe(null); setTab('list');
  };
  const deleteRecipe = (id) => { book.remove(id); setUndoDelete(true); setTimeout(() => setUndoDelete(false), 8000); };
  const saveRecipe = (fields) => (editor?.recipe ? book.update(editor.recipe.id, fields) : book.add(fields));

  const onList = items.filter((i) => !i.done).length;
  const fmtTime = (ms) => new Date(ms).toLocaleTimeString(lang, { hour: '2-digit', minute: '2-digit' });
  const subtitle = chains.length ? chains.join(' · ') + (data.at ? ` · ${t('updated', { t: fmtTime(data.at) })}` : '') : '';

  const gate = consentGate({ proReady: pro.ready, owned: pro.owned, status: ads.status });
  if (gate !== 'open') {
    return (
      <ComfortContext.Provider value={ctx}>
        <StatusBar style={isDark ? 'light' : 'dark'} />
        <ConsentGate c={c} t={t} loading={gate === 'loading'} status={ads.status} pro={pro} ads={ads} onBuy={askRemoveAds} />
      </ComfortContext.Provider>
    );
  }

  return (
    <ComfortContext.Provider value={ctx}>
    <View style={{ flex: 1, backgroundColor: c.bg, paddingTop: insets.top }}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <View style={{ paddingHorizontal: space.lg, paddingTop: space.sm, paddingBottom: space.md, gap: space.sm }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.md }}>
          <Image source={require('./assets/logo-circle.png')} style={{ width: 42, height: 42 }} accessibilityLabel="Kortinglijst" />
          <View style={{ flex: 1 }}>
            <Text fixed numberOfLines={1} adjustsFontSizeToFit style={{ color: c.fg, ...type.title }}>Kortinglijst</Text>
            {subtitle ? <Text fixed numberOfLines={1} style={{ color: c.mut, ...type.caption }}>{subtitle}</Text> : null}
          </View>
          {!needStores && (
            <View>
              <IconButton c={c} icon="users" label={t('shTitle')} onPress={() => setShareOpen(true)} />
              {share.group ? <View style={{ position: 'absolute', top: 2, right: 2, width: 11, height: 11, borderRadius: 6, borderWidth: 2, borderColor: c.bg,
                backgroundColor: share.status === 'ok' || share.status === 'syncing' ? c.success : share.status === 'offline' || share.status === 'idle' ? c.mut : c.danger }} /> : null}
            </View>
          )}
          {!needStores && <IconButton c={c} icon="menu" label={t('mnTitle')} onPress={() => setMenuOpen(true)} />}
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
          <Pressable onPress={() => Alert.alert('Kortinglijst', errors.map((e) => `${e.store}: ${e.error}`).join('\n\n'))}
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
        ) : tab === 'recipes' ? (
          <RecipesScreen c={c} t={t} recipes={book.recipes} onOpen={setOpenRecipe} onNew={() => setEditor({})} onFav={(id, fav) => book.update(id, { fav })} undo={undoDelete ? () => { book.restore(); setUndoDelete(false); } : null} />
        ) : tab === 'list' ? (
          <ListScreen c={c} t={t} lang={lang} items={items} setItems={setItems} deals={deals} vocab={vocab}
            view={view} setView={setView} favorites={favorites} onSaveToBook={(text) => { setTab('recipes'); setEditor({ prefill: text }); }} />
        ) : (
          <DealsScreen c={c} t={t} lang={lang} deals={deals} onAdd={addFromDeal} refreshing={loading} onRefresh={() => refresh(true)} />
        )}
      </View>

      {history.toast && !needStores && (
        <View pointerEvents="box-none" style={{ position: 'absolute', left: 0, right: 0, bottom: 78 + insets.bottom, paddingHorizontal: space.lg, zIndex: 20 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.md, backgroundColor: isDark ? '#f5f2ea' : '#1d1b17', borderRadius: radius.md, paddingLeft: space.lg, paddingRight: space.sm, paddingVertical: space.sm, ...elevation(c, 2) }}>
            <Text style={{ color: isDark ? '#1d1b17' : '#f5f2ea', ...type.small, flex: 1 }} numberOfLines={2}>{t(history.toast.label.key, { n: history.toast.label.n, name: history.toast.label.name })}</Text>
            <Pressable onPress={history.undo} hitSlop={8} style={{ paddingHorizontal: space.md, paddingVertical: space.sm }}>
              <Text style={{ color: isDark ? '#b8430a' : '#ff9d66', fontWeight: '800', fontSize: 14 }}>{t('hUndo')}</Text>
            </Pressable>
            {comfort.still && <Pressable onPress={history.dismissToast} hitSlop={8} accessibilityLabel={t('cfClose')}><Icon name="x" size={18} color={isDark ? '#1d1b17' : '#f5f2ea'} /></Pressable>}
          </View>
        </View>
      )}

      <Modal visible={menuOpen} transparent animationType={comfort.still ? 'none' : 'fade'} onRequestClose={() => setMenuOpen(false)}>
        <Pressable onPress={() => setMenuOpen(false)} style={{ flex: 1, backgroundColor: c.overlay, justifyContent: 'flex-end' }}>
          <View style={{ backgroundColor: c.surface, borderTopLeftRadius: radius.lg, borderTopRightRadius: radius.lg, padding: space.md, paddingBottom: Math.max(insets.bottom, space.md) + space.sm, gap: 2 }}>
            {[['sliders', t('mnComfort'), t('mnComfortSub'), () => setComfortOpen(true)], ['history', t('hTitle'), '', () => setHistoryOpen(true)], ['users', t('shTitle'), '', () => setShareOpen(true)], [pro.owned ? 'check' : 'star', pro.owned ? t('proOwned') : t('proRemove'), pro.owned ? '' : (pro.price ? t('proBuy', { price: pro.price }) : t('proWhy')), pro.owned ? () => {} : askRemoveAds], ...(ads.privacyOptions && !pro.owned ? [['lock', t('mnAdPrivacy'), '', ads.showPrivacyOptions]] : [])].map(([icon, title, sub, fn]) => (
              <Pressable key={title} onPress={() => { setMenuOpen(false); fn(); }} accessibilityRole="button" style={({ pressed }) => ({ flexDirection: 'row', alignItems: 'center', gap: space.md, padding: space.md, borderRadius: radius.md, backgroundColor: pressed ? c.chip : 'transparent' })}>
                <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: c.primaryTint, alignItems: 'center', justifyContent: 'center' }}><Icon name={icon} size={20} color={c.primary} /></View>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: c.fg, ...type.strong }}>{title}</Text>
                  {sub ? <Text style={{ color: c.mut, ...type.small }}>{sub}</Text> : null}
                </View>
                <Icon name="arrow" size={18} color={c.mut} />
              </Pressable>
            ))}
            <Text style={{ color: c.mut, ...type.caption, textAlign: 'center', paddingTop: space.md }}>© GOKH Studio · Kortinglijst</Text>
          </View>
        </Pressable>
      </Modal>

      <RecipeDetail recipe={book.recipes.find((r) => r.id === openRecipe?.id) ?? null} visible={!!openRecipe} onClose={() => setOpenRecipe(null)} c={c} t={t} lang={lang} vocab={vocab} items={items}
        onAddToList={addRecipeToList} onFav={(id, fav) => book.update(id, { fav })} onDelete={deleteRecipe} onDuplicate={(id) => book.duplicate(id, t('rcCopy'))}
        onEdit={(r) => { setOpenRecipe(null); setEditor({ recipe: r }); }} />
      <RecipeEditor visible={!!editor} onClose={() => setEditor(null)} c={c} t={t} lang={lang} vocab={vocab} recipe={editor?.recipe} prefill={editor?.prefill} onSave={saveRecipe} />

      <ComfortScreen visible={comfortOpen} onClose={() => setComfortOpen(false)} c={c} t={t} lang={lang} comfort={comfort} setComfort={setComfort} />
      <HistoryScreen visible={historyOpen} onClose={() => setHistoryOpen(false)} c={c} t={t} lang={lang} history={history} />
      <ShareScreen visible={shareOpen} onClose={() => { setShareOpen(false); setPendingInvite(''); }} c={c} t={t} lang={lang} share={share} pendingInvite={pendingInvite} />

      {shouldShowAd({ tab, needStores, keyboard: kb, consent: ads.consent, adFree: pro.owned }) && <AdBanner c={c} t={t} onRemove={askRemoveAds} />}
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
    </ComfortContext.Provider>
  );
}
