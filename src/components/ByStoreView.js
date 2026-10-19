import { Linking, Platform, Pressable, Text, View } from 'react-native';
import { fmtPrice } from '../format.js';
import { fmtAmounts } from '../recipe.js';
import { navigationUrl } from '../stores.js';
import { ACCENT } from '../theme.js';
import DealRow from './DealRow.js';

function Check({ item, onToggle, c }) {
  return (
    <Pressable onPress={() => onToggle(item.id)} hitSlop={8}>
      <Text style={{ fontSize: 22, color: item.done ? ACCENT : c.mut }}>{item.done ? '☑' : '☐'}</Text>
    </Pressable>
  );
}

function openNavigation(store, favorites) {
  Linking.openURL(navigationUrl(store, favorites, Platform.OS))
    .catch(() => Linking.openURL(`https://www.google.com/maps/search/${encodeURIComponent(`${store} supermarkt`)}`));
}

/** Lista podzielona na sklepy: do którego pojechać i co tam kupić, plus produkty bez promocji. */
export default function ByStoreView({ plan, c, t, lang, favorites, onToggleDone }) {
  const card = { backgroundColor: c.card, borderRadius: 14, borderWidth: 1, borderColor: c.border, padding: 12 };
  return (
    <View style={{ gap: 10 }}>
      {plan.groups.map((g) => (
        <View key={g.store} style={card}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
            <View style={{ flex: 1 }}>
              <Text style={{ color: c.fg, fontSize: 18, fontWeight: '700' }}>{g.favorite ? '★ ' : ''}{g.store}</Text>
              <Text style={{ color: c.mut, fontSize: 13 }}>
                {t('products', { n: g.entries.length })}{g.total > 0 ? ` · ${t('estTotal', { sum: fmtPrice(g.total) })}` : ''}
              </Text>
            </View>
            <Pressable onPress={() => openNavigation(g.store, favorites)}
              style={{ backgroundColor: ACCENT, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 8 }}>
              <Text style={{ color: '#fff', fontWeight: '600' }}>➤ {t('navigate')}</Text>
            </Pressable>
          </View>
          {g.entries.map(({ item, deal, others }) => (
            <View key={item.id} style={{ marginTop: 8, opacity: item.done ? 0.45 : 1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Check item={item} onToggle={onToggleDone} c={c} />
                <Text style={{ color: c.fg, fontWeight: '600', textDecorationLine: item.done ? 'line-through' : 'none' }}>{item.text}{item.amounts?.length ? <Text style={{ color: c.mut, fontWeight: '400' }}>  {fmtAmounts(item.amounts, t)}</Text> : null}</Text>
              </View>
              <DealRow deal={deal} c={c} t={t} lang={lang} />
              {others.length > 0 && <Text style={{ color: c.mut, fontSize: 12 }}>{t('alsoAt')} {others.join(', ')}</Text>}
            </View>
          ))}
        </View>
      ))}

      {plan.none.length > 0 && (
        <View style={card}>
          <Text style={{ color: c.fg, fontSize: 18, fontWeight: '700' }}>{t('noPromoSection')}</Text>
          <Text style={{ color: c.mut, fontSize: 13 }}>{t('products', { n: plan.none.length })} · {t('noPromoHint')}</Text>
          {plan.none.map((item) => (
            <View key={item.id} style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 8, opacity: item.done ? 0.45 : 1 }}>
              <Check item={item} onToggle={onToggleDone} c={c} />
              <Text style={{ color: c.fg, fontSize: 16, textDecorationLine: item.done ? 'line-through' : 'none' }}>{item.text}{item.amounts?.length ? <Text style={{ color: c.mut }}>  {fmtAmounts(item.amounts, t)}</Text> : null}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}
