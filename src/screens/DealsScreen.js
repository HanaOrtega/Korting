import { useMemo, useState } from 'react';
import { FlatList, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import DealRow from '../components/DealRow.js';
import { norm } from '../match.js';
import { ACCENT } from '../theme.js';

const SORTS = ['end', 'price', 'name'];
const SORT_KEY = { end: 'sortEnd', price: 'sortPrice', name: 'sortName' };

function Pill({ label, on, onPress, c }) {
  return (
    <Pressable onPress={onPress} style={{ paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, borderWidth: 1,
      borderColor: on ? ACCENT : c.border, backgroundColor: on ? ACCENT : c.chip }}>
      <Text style={{ color: on ? '#fff' : c.fg }}>{label}</Text>
    </Pressable>
  );
}

export default function DealsScreen({ c, t, lang, deals, onAdd, refreshing, onRefresh }) {
  const [q, setQ] = useState('');
  const [store, setStore] = useState('');
  const [sort, setSort] = useState('end');
  const stores = useMemo(() => [...new Set(deals.map((d) => d.store))].sort(), [deals]);

  const list = useMemo(() => {
    const nq = norm(q);
    const f = deals.filter((d) => (!store || d.store === store) && (!nq || norm(`${d.name} ${d.description}`).includes(nq)));
    return f.sort((a, b) => sort === 'price' ? (a.price ?? Infinity) - (b.price ?? Infinity)
      : sort === 'name' ? a.name.localeCompare(b.name)
      : (Date.parse(a.validUntil) || Infinity) - (Date.parse(b.validUntil) || Infinity));
  }, [deals, q, store, sort]);

  const header = (
    <View style={{ gap: 8, marginBottom: 8 }}>
      <TextInput value={q} onChangeText={setQ} placeholder={t('searchPh')} placeholderTextColor={c.mut}
        style={{ borderWidth: 1, borderColor: c.border, borderRadius: 12, padding: 12, color: c.fg, backgroundColor: c.card, fontSize: 16 }} />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
        <Pill c={c} label={t('allStores')} on={!store} onPress={() => setStore('')} />
        {stores.map((s) => <Pill key={s} c={c} label={s} on={store === s} onPress={() => setStore(s)} />)}
      </ScrollView>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
        {SORTS.map((s) => <Pill key={s} c={c} label={t(SORT_KEY[s])} on={sort === s} onPress={() => setSort(s)} />)}
      </ScrollView>
      <Text style={{ color: c.mut, fontSize: 13 }}>{t('products', { n: list.length })}</Text>
    </View>
  );

  return (
    <FlatList
      data={list}
      keyExtractor={(d) => d.id}
      ListHeaderComponent={header}
      ListEmptyComponent={<Text style={{ color: c.mut, textAlign: 'center', padding: 24 }}>{t('noResults')}</Text>}
      contentContainerStyle={{ padding: 16 }}
      keyboardShouldPersistTaps="handled"
      refreshing={refreshing}
      onRefresh={onRefresh}
      initialNumToRender={15}
      windowSize={7}
      renderItem={({ item }) => (
        <View style={{ backgroundColor: c.card, borderRadius: 14, borderWidth: 1, borderColor: c.border, paddingHorizontal: 12, marginBottom: 8 }}>
          <DealRow deal={item} c={c} t={t} lang={lang} onAdd={onAdd} />
        </View>
      )}
    />
  );
}
