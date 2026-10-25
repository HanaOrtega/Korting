import { useMemo, useState } from 'react';
import { FlatList, ScrollView, View } from 'react-native';
import TextInput from '../components/TextInput.js';
import Text from '../components/Text.js';
import DealRow from '../components/DealRow.js';
import { Card, Chip, EmptyState, Icon } from '../components/ui.js';
import { norm } from '../match.js';
import { radius, space, type } from '../theme.js';

const SORTS = ['end', 'price', 'store', 'name'];
const SORT_KEY = { end: 'sortEnd', price: 'sortPrice', store: 'sortStore', name: 'sortName' };

export default function DealsScreen({ c, t, lang, deals, onAdd, refreshing, onRefresh }) {
  const [q, setQ] = useState('');
  const [store, setStore] = useState('');
  const [sort, setSort] = useState('end');
  const stores = useMemo(() => [...new Set(deals.map((d) => d.store))].sort(), [deals]);

  const list = useMemo(() => {
    const nq = norm(q);
    const f = deals.filter((d) => (!store || d.store === store) && (!nq || norm(`${d.name} ${d.description}`).includes(nq)));
    return f.sort((a, b) => sort === 'price' ? (a.price ?? Infinity) - (b.price ?? Infinity)
      : sort === 'store' ? a.store.localeCompare(b.store) || (a.price ?? Infinity) - (b.price ?? Infinity)
      : sort === 'name' ? a.name.localeCompare(b.name)
      : (Date.parse(a.validUntil) || Infinity) - (Date.parse(b.validUntil) || Infinity));
  }, [deals, q, store, sort]);

  const header = (
    <View style={{ gap: space.md, marginBottom: space.md }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: c.surface, borderRadius: radius.md, paddingLeft: space.md, borderWidth: 1, borderColor: c.border }}>
        <View style={{ flexShrink: 0 }}><Icon name="search" size={18} color={c.mut} /></View>
        <TextInput value={q} onChangeText={setQ} placeholder={t('searchPh')} placeholderTextColor={c.mut} autoCorrect={false}
          style={{ flex: 1, paddingVertical: 12, paddingRight: space.md, color: c.fg, fontSize: 16 }} />
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: space.sm }}>
        <Chip c={c} label={t('allStores')} selected={!store} onPress={() => setStore('')} />
        {stores.map((s) => <Chip key={s} c={c} label={s} selected={store === s} onPress={() => setStore(s)} />)}
      </ScrollView>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <Text style={{ color: c.mut, ...type.small }}>{t('products', { n: list.length })}</Text>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: space.sm }}>
        {SORTS.map((s) => <Chip key={s} c={c} label={t(SORT_KEY[s])} selected={sort === s} onPress={() => setSort(s)} />)}
      </ScrollView>
    </View>
  );

  return (
    <FlatList
      data={list}
      keyExtractor={(d) => d.id}
      ListHeaderComponent={header}
      ListEmptyComponent={<EmptyState c={c} icon="search" title={t('noResults')} />}
      contentContainerStyle={{ paddingHorizontal: space.lg, paddingBottom: 32 }}
      keyboardShouldPersistTaps="handled"
      refreshing={refreshing}
      onRefresh={onRefresh}
      initialNumToRender={12}
      windowSize={7}
      renderItem={({ item }) => (
        <Card c={c} pad={0} style={{ marginBottom: space.sm, paddingHorizontal: space.lg }}>
          <DealRow deal={item} c={c} t={t} lang={lang} onAdd={onAdd} />
        </Card>
      )}
    />
  );
}
