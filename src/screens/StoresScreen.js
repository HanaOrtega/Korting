import * as Location from 'expo-location';
import { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import MapPicker from '../components/MapPicker.js';
import { CHAINS, chainFavoriteId, findNearbyStores, fmtDistance } from '../stores.js';
import { ACCENT } from '../theme.js';

const withTimeout = (p, ms) => Promise.race([p, new Promise((_, rej) => setTimeout(() => rej(new Error('timeout')), ms))]);

export default function StoresScreen({ c, t, favorites, setFavorites, intro = false, onContinue }) {
  const [state, setState] = useState({ status: 'idle', stores: [], error: '' });
  const [mapOpen, setMapOpen] = useState(false);
  const isFav = (id) => favorites.some((f) => f.id === id);
  const toggleStore = (s) => setFavorites((prev) => (prev.some((f) => f.id === s.id)
    ? prev.filter((f) => f.id !== s.id)
    : [...prev, { id: s.id, chain: s.chain, name: s.name, address: s.address, lat: s.lat, lon: s.lon }]));
  // cała sieć: jedno dotknięcie dodaje/usuwa wszystkie ulubione tej sieci
  const toggleChain = (chain) => setFavorites((prev) => (prev.some((f) => f.chain === chain)
    ? prev.filter((f) => f.chain !== chain)
    : [...prev, { id: chainFavoriteId(chain), chain, name: chain }]));

  const selectAll = () => setFavorites((prev) => [
    ...prev, ...CHAINS.filter((ch) => !prev.some((f) => f.chain === ch.id)).map((ch) => ({ id: chainFavoriteId(ch.id), chain: ch.id, name: ch.id })),
  ]);

  const find = async () => {
    setState({ status: 'loading', stores: [], error: '' });
    try {
      const perm = await Location.requestForegroundPermissionsAsync();
      if (perm.status !== 'granted') return setState({ status: 'denied', stores: [], error: '' });
      let pos;
      try {
        pos = await withTimeout(Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced }), 15000);
      } catch {
        pos = await Location.getLastKnownPositionAsync(); // bez GPS: ostatnia znana pozycja
      }
      if (!pos) throw new Error('brak pozycji');
      const stores = await findNearbyStores(pos.coords.latitude, pos.coords.longitude);
      setState({ status: 'done', stores: stores.slice(0, 40), error: '' });
    } catch (e) {
      setState({ status: 'error', stores: [], error: e.message });
    }
  };

  const specific = favorites.filter((f) => f.lat != null);
  const card = { backgroundColor: c.card, borderRadius: 14, borderWidth: 1, borderColor: c.border, padding: 12 };
  const h = { color: c.fg, fontSize: 16, fontWeight: '700', marginBottom: 8 };

  return (
    <ScrollView contentContainerStyle={{ padding: 16, gap: 12 }} keyboardShouldPersistTaps="handled">
      {intro && (
        <View style={{ gap: 6 }}>
          <Text style={{ color: c.fg, fontSize: 22, fontWeight: '800' }}>{t('pickTitle')}</Text>
          <Text style={{ color: c.mut }}>{t('pickHint')}</Text>
        </View>
      )}
      <View style={card}>
        <Text style={h}>{t('favChains')}</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          {CHAINS.map((ch) => {
            const on = favorites.some((f) => f.chain === ch.id);
            return (
              <Pressable key={ch.id} onPress={() => toggleChain(ch.id)} style={{ paddingHorizontal: 14, paddingVertical: 8, borderRadius: 18,
                borderWidth: 1, borderColor: on ? ACCENT : c.border, backgroundColor: on ? ACCENT : c.chip }}>
                <Text style={{ color: on ? '#fff' : c.fg }}>{on ? '★ ' : '☆ '}{ch.id}</Text>
              </Pressable>
            );
          })}
        </View>
        <Pressable onPress={selectAll} style={{ marginTop: 10 }}>
          <Text style={{ color: ACCENT, fontWeight: '600' }}>{t('selectAll')}</Text>
        </Pressable>
        {favorites.length === 0 && <Text style={{ color: c.mut, marginTop: 8 }}>{t('noFavs')}</Text>}
      </View>

      {specific.length > 0 && (
        <View style={card}>
          <Text style={h}>{t('favStores')}</Text>
          {specific.map((f) => (
            <View key={f.id} style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 6, gap: 8 }}>
              <View style={{ flex: 1 }}>
                <Text style={{ color: c.fg, fontWeight: '600' }}>{f.name}</Text>
                {f.address ? <Text style={{ color: c.mut, fontSize: 13 }}>{f.address}</Text> : null}
              </View>
              <Pressable onPress={() => toggleStore(f)} hitSlop={10}><Text style={{ color: c.mut, fontSize: 20 }}>✕</Text></Pressable>
            </View>
          ))}
        </View>
      )}

      <Pressable onPress={() => setMapOpen(true)}
        style={{ backgroundColor: ACCENT, borderRadius: 14, padding: 14, alignItems: 'center' }}>
        <Text style={{ color: '#fff', fontWeight: '700', fontSize: 16 }}>🗺 {t('pickOnMap')}</Text>
      </Pressable>

      <Pressable onPress={find} disabled={state.status === 'loading'}
        style={{ backgroundColor: ACCENT, borderRadius: 14, padding: 14, alignItems: 'center', opacity: state.status === 'loading' ? 0.6 : 1 }}>
        <Text style={{ color: '#fff', fontWeight: '700', fontSize: 16 }}>📍 {t('findNearby')}</Text>
      </Pressable>

      {state.status === 'loading' && <Text style={{ color: c.mut, textAlign: 'center' }}>{t('locating')}</Text>}
      {state.status === 'denied' && <Text style={{ color: c.mut }}>{t('locDenied')}</Text>}
      {state.status === 'error' && <Text style={{ color: c.mut }}>{t('storesError', { err: state.error })}</Text>}
      {state.status === 'done' && state.stores.length === 0 && <Text style={{ color: c.mut }}>{t('noStoresFound')}</Text>}

      {state.stores.length > 0 && (
        <View style={card}>
          <Text style={h}>{t('nearby')}</Text>
          {state.stores.map((s) => (
            <View key={s.id} style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 8, gap: 10 }}>
              <View style={{ flex: 1 }}>
                <Text style={{ color: c.fg, fontWeight: '600' }}>{s.name}</Text>
                <Text style={{ color: c.mut, fontSize: 13 }}>{fmtDistance(s.distance)}{s.address ? ` · ${s.address}` : ''}</Text>
              </View>
              <Pressable onPress={() => toggleStore(s)} hitSlop={10}>
                <Text style={{ color: ACCENT, fontSize: 26 }}>{isFav(s.id) ? '★' : '☆'}</Text>
              </Pressable>
            </View>
          ))}
        </View>
      )}
      <MapPicker visible={mapOpen} onClose={() => setMapOpen(false)} c={c} t={t} favorites={favorites} setFavorites={setFavorites} />

      {intro && (
        <Pressable onPress={onContinue} disabled={favorites.length === 0}
          style={{ backgroundColor: ACCENT, borderRadius: 14, padding: 14, alignItems: 'center', opacity: favorites.length === 0 ? 0.4 : 1 }}>
          <Text style={{ color: '#fff', fontWeight: '700', fontSize: 16 }}>{t('continueBtn')}</Text>
        </Pressable>
      )}
    </ScrollView>
  );
}
