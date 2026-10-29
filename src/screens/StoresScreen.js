import * as Location from 'expo-location';
import { useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import Text from '../components/Text.js';
import { Badge, Button, Card, Icon, IconButton, SectionLabel, StoreTag } from '../components/ui.js';
import MapPicker from '../components/MapPicker.js';
import { CHAINS, chainFavoriteId, findNearbyStores, fmtDistance } from '../stores.js';
import { radius, space, storeColor, type } from '../theme.js';

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
  const chainOn = (id) => favorites.some((f) => f.chain === id);

  return (
    <ScrollView contentContainerStyle={{ paddingHorizontal: space.lg, paddingBottom: 32, gap: space.lg }} keyboardShouldPersistTaps="handled">
      {intro ? (
        <View style={{ gap: 6, paddingTop: space.sm }}>
          <Text style={{ color: c.fg, ...type.display }}>{t('pickTitle')}</Text>
          <Text style={{ color: c.ink2, ...type.body }}>{t('pickHint')}</Text>
        </View>
      ) : (
        <Text style={{ color: c.fg, ...type.title, marginTop: space.xs }}>{t('tabStores')}</Text>
      )}

      <View style={{ gap: space.md }}>
        <SectionLabel c={c} right={<Pressable onPress={selectAll} hitSlop={8}><Text style={{ color: c.primary, fontWeight: '700', fontSize: 13 }}>{t('selectAll')}</Text></Pressable>}>{t('favChains')}</SectionLabel>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.md }}>
          {CHAINS.map((ch) => {
            const on = chainOn(ch.id);
            const sc = storeColor(ch.id);
            return (
              <Pressable key={ch.id} onPress={() => toggleChain(ch.id)} accessibilityRole="checkbox" accessibilityState={{ checked: on }}
                style={({ pressed }) => ({ width: '47.5%', opacity: pressed ? 0.8 : 1, borderRadius: radius.lg, padding: space.md, gap: 10, backgroundColor: on ? c.primaryTint : c.surface,
                  borderWidth: 2, borderColor: on ? c.primary : c.line })}>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                  <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: sc.bg, alignItems: 'center', justifyContent: 'center' }}>
                    <Text style={{ color: sc.fg, fontWeight: '900', fontSize: sc.short.length > 3 ? 11 : 15 }} numberOfLines={1}>{sc.short}</Text>
                  </View>
                  <View style={{ width: 24, height: 24, borderRadius: 12, backgroundColor: on ? c.primary : 'transparent', borderWidth: on ? 0 : 2, borderColor: c.border, alignItems: 'center', justifyContent: 'center' }}>
                    {on ? <Icon name="check" size={14} color={c.primaryInk} stroke={3} /> : null}
                  </View>
                </View>
                <Text style={{ color: c.fg, ...type.strong }}>{ch.id}</Text>
              </Pressable>
            );
          })}
        </View>
        {favorites.length === 0 && <Text style={{ color: c.mut, ...type.small }}>{t('noFavs')}</Text>}
      </View>

      {specific.length > 0 && (
        <View style={{ gap: space.sm }}>
          <SectionLabel c={c}>{t('favStores')}</SectionLabel>
          <Card c={c} pad={0}>
            {specific.map((f, i) => (
              <View key={f.id} style={{ flexDirection: 'row', alignItems: 'center', padding: space.md, gap: space.md, borderTopWidth: i ? 1 : 0, borderTopColor: c.line }}>
                <StoreTag store={f.chain} />
                <View style={{ flex: 1 }}>
                  <Text style={{ color: c.fg, ...type.strong }}>{f.name}</Text>
                  {f.address ? <Text style={{ color: c.mut, ...type.small }}>{f.address}</Text> : null}
                </View>
                <IconButton c={c} icon="x" tone="ghost" size={34} iconSize={18} label="✕" onPress={() => toggleStore(f)} />
              </View>
            ))}
          </Card>
        </View>
      )}

      <View style={{ gap: space.sm }}>
        <SectionLabel c={c}>{t('storesFind')}</SectionLabel>
        <View style={{ flexDirection: 'row', gap: space.sm }}>
          <Button c={c} icon="map" label={t('pickOnMapShort')} onPress={() => setMapOpen(true)} style={{ flex: 1 }} />
          <Button c={c} icon="pin" variant="soft" label={t('findNearbyShort')} onPress={find} disabled={state.status === 'loading'} style={{ flex: 1 }} />
        </View>
        {state.status === 'loading' && <Text style={{ color: c.mut, textAlign: 'center' }}>{t('locating')}</Text>}
        {state.status === 'denied' && <Text style={{ color: c.mut }}>{t('locDenied')}</Text>}
        {state.status === 'error' && <Text style={{ color: c.mut }}>{t('storesError', { err: state.error })}</Text>}
        {state.status === 'done' && state.stores.length === 0 && <Text style={{ color: c.mut }}>{t('noStoresFound')}</Text>}
      </View>

      {state.stores.length > 0 && (
        <View style={{ gap: space.sm }}>
          <SectionLabel c={c}>{t('nearby')}</SectionLabel>
          <Card c={c} pad={0}>
            {state.stores.map((s, i) => (
              <Pressable key={s.id} onPress={() => toggleStore(s)} style={{ flexDirection: 'row', alignItems: 'center', padding: space.md, gap: space.md, borderTopWidth: i ? 1 : 0, borderTopColor: c.line }}>
                <StoreTag store={s.chain} />
                <View style={{ flex: 1 }}>
                  <Text style={{ color: c.fg, ...type.strong }}>{s.name}</Text>
                  <Text style={{ color: c.mut, ...type.small }}>{fmtDistance(s.distance)}{s.address ? ` · ${s.address}` : ''}</Text>
                </View>
                <Icon name="star" size={24} color={isFav(s.id) ? c.primary : c.mut} fill={isFav(s.id) ? c.primary : 'none'} />
              </Pressable>
            ))}
          </Card>
        </View>
      )}
      <MapPicker visible={mapOpen} onClose={() => setMapOpen(false)} c={c} t={t} favorites={favorites} setFavorites={setFavorites} />

      {intro && (
        <Button c={c} label={t('continueBtn')} icon="check" onPress={onContinue} disabled={favorites.length === 0} />
      )}
    </ScrollView>
  );
}
