import * as Location from 'expo-location';
import { useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Modal, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { WebView } from 'react-native-webview';
import { mapHtml } from '../mapHtml.js';
import { fmtDistance, findNearbyStores, geocode } from '../stores.js';
import { ACCENT } from '../theme.js';

const MAX_RADIUS = 6000; // m – większy obszar Overpass odrzuca albo zwraca za dużo

/** Pełnoekranowa mapa: przesuń do dowolnego miasta, wyszukaj sklepy i zaznacz konkretne pinezki. */
export default function MapPicker({ visible, onClose, c, t, favorites, setFavorites }) {
  const web = useRef(null);
  const ready = useRef(false);
  const [view, setView] = useState(null);
  const [stores, setStores] = useState([]);
  const [tapped, setTapped] = useState(null);
  const [busy, setBusy] = useState('');
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [places, setPlaces] = useState([]);
  const searchAfterMove = useRef(false);

  // zaczynamy tam, gdzie masz już wybrany sklep, a w przeciwnym razie na środku Holandii
  const start = useMemo(() => {
    const f = favorites.find((x) => x.lat != null);
    return f ? { lat: f.lat, lon: f.lon, zoom: 13 } : { lat: 52.2, lon: 5.3, zoom: 7 };
  }, []);
  const html = useMemo(() => mapHtml(start), [start]);

  // sklepy na mapie = wyniki wyszukiwania + wcześniej wybrane (żeby nie znikały po przesunięciu mapy)
  const shown = useMemo(() => {
    const byId = new Map(stores.map((s) => [s.id, s]));
    for (const f of favorites) if (f.lat != null && !byId.has(f.id)) byId.set(f.id, { ...f });
    return [...byId.values()];
  }, [stores, favorites]);
  const selectedIds = useMemo(() => favorites.filter((f) => f.lat != null).map((f) => f.id), [favorites]);

  const run = (js) => web.current?.injectJavaScript(`${js};true;`);
  useEffect(() => { if (ready.current) run(`window.setStores(${JSON.stringify(shown)})`); }, [shown]);
  useEffect(() => { if (ready.current) run(`window.setSelected(${JSON.stringify(selectedIds)})`); }, [selectedIds]);

  const searchStores = async (v = view) => {
    if (!v) return;
    setBusy('stores'); setError('');
    try {
      const found = await findNearbyStores(v.lat, v.lon, Math.min(MAX_RADIUS, Math.max(1500, v.radius)));
      setStores(found.slice(0, 250));
      if (!found.length) setError(t('noStoresFound'));
    } catch (e) {
      setError(t('storesError', { err: e.message }));
    } finally { setBusy(''); }
  };

  const onMessage = (e) => {
    let m;
    try { m = JSON.parse(e.nativeEvent.data); } catch { return; }
    if (m.type === 'ready') {
      ready.current = true;
      run(`window.setStores(${JSON.stringify(shown)})`);
      run(`window.setSelected(${JSON.stringify(selectedIds)})`);
    } else if (m.type === 'view') {
      setView(m);
      if (searchAfterMove.current) { searchAfterMove.current = false; searchStores(m); }
    } else if (m.type === 'tap') {
      setTapped(shown.find((s) => s.id === m.id) ?? null);
    }
  };

  const findPlace = async () => {
    if (!query.trim()) return;
    setBusy('place'); setError(''); setPlaces([]);
    try {
      const res = await geocode(query.trim());
      if (!res.length) setError(t('noPlace'));
      setPlaces(res);
    } catch (e) { setError(t('storesError', { err: e.message })); } finally { setBusy(''); }
  };
  const goTo = (p) => {
    setPlaces([]); setQuery(p.name.split(',')[0]);
    searchAfterMove.current = true; // po dojechaniu na miejsce od razu szukamy tam sklepów
    run(`window.flyTo(${p.lat}, ${p.lon}, 14)`);
  };
  const myLocation = async () => {
    try {
      const perm = await Location.requestForegroundPermissionsAsync();
      if (perm.status !== 'granted') return setError(t('locDenied'));
      const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      searchAfterMove.current = true;
      run(`window.flyTo(${pos.coords.latitude}, ${pos.coords.longitude}, 14)`);
    } catch (e) { setError(t('storesError', { err: e.message })); }
  };

  const toggle = (s) => setFavorites((prev) => (prev.some((f) => f.id === s.id)
    ? prev.filter((f) => f.id !== s.id)
    : [...prev, { id: s.id, chain: s.chain, name: s.name, address: s.address, lat: s.lat, lon: s.lon }]));
  const isSel = (s) => favorites.some((f) => f.id === s.id);
  const btn = { backgroundColor: ACCENT, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10, alignItems: 'center' };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: c.bg }}>
        <View style={{ paddingTop: 36, paddingHorizontal: 12, paddingBottom: 8, gap: 8, backgroundColor: c.bg, zIndex: 2 }}>
          <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
            <TextInput value={query} onChangeText={setQuery} onSubmitEditing={findPlace} placeholder={t('searchPlace')} placeholderTextColor={c.mut}
              returnKeyType="search" style={{ flex: 1, borderWidth: 1, borderColor: c.border, borderRadius: 12, padding: 10, color: c.fg, backgroundColor: c.card, fontSize: 16 }} />
            <Pressable onPress={findPlace} style={btn}><Text style={{ color: '#fff' }}>🔍</Text></Pressable>
            <Pressable onPress={onClose} style={[btn, { backgroundColor: c.chip }]}><Text style={{ color: c.fg, fontWeight: '600' }}>{t('closeBtn')}</Text></Pressable>
          </View>
          {places.length > 0 && (
            <ScrollView style={{ maxHeight: 190, backgroundColor: c.card, borderRadius: 12, borderWidth: 1, borderColor: c.border }} keyboardShouldPersistTaps="handled">
              {places.map((p, i) => (
                <Pressable key={i} onPress={() => goTo(p)} style={{ padding: 10 }}>
                  <Text style={{ color: c.fg }} numberOfLines={2}>{p.name}</Text>
                </Pressable>
              ))}
            </ScrollView>
          )}
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <Pressable onPress={myLocation} style={[btn, { backgroundColor: c.chip }]}><Text style={{ color: c.fg }}>📍 {t('myLocation')}</Text></Pressable>
            <Pressable onPress={() => searchStores()} disabled={!view || busy === 'stores'} style={[btn, { flex: 1, opacity: !view ? 0.5 : 1 }]}>
              {busy === 'stores' ? <ActivityIndicator color="#fff" /> : <Text style={{ color: '#fff', fontWeight: '700' }}>{t('searchHere')}</Text>}
            </Pressable>
          </View>
          <Text style={{ color: error ? c.danger : c.mut, fontSize: 12 }}>{error || t('mapHint')}</Text>
        </View>

        <View style={{ flex: 1 }}>
          <WebView ref={web} source={{ html, baseUrl: 'https://github.com/hanaortega/korting' }} onMessage={onMessage}
            originWhitelist={['*']} javaScriptEnabled domStorageEnabled style={{ flex: 1 }} />
        </View>

        <View style={{ padding: 12, gap: 8, backgroundColor: c.card, borderTopWidth: 1, borderTopColor: c.border }}>
          <Text style={{ color: c.mut, fontSize: 12 }}>{t('selectedCount', { n: favorites.filter((f) => f.lat != null).length })}</Text>
          {tapped ? (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <View style={{ flex: 1 }}>
                <Text style={{ color: c.fg, fontWeight: '700' }}>{tapped.name}</Text>
                <Text style={{ color: c.mut, fontSize: 13 }}>{[tapped.address, tapped.distance != null ? fmtDistance(tapped.distance) : ''].filter(Boolean).join(' · ') || tapped.chain}</Text>
              </View>
              <Pressable onPress={() => toggle(tapped)} style={[btn, isSel(tapped) && { backgroundColor: c.chip }]}>
                <Text style={{ color: isSel(tapped) ? c.fg : '#fff', fontWeight: '600' }}>{isSel(tapped) ? t('removeStore') : t('addStore')}</Text>
              </Pressable>
            </View>
          ) : null}
        </View>
      </View>
    </Modal>
  );
}
