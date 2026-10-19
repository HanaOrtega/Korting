import { Linking, Platform, Pressable, Text, View } from 'react-native';
import { fmtPrice } from '../format.js';
import { fmtAmounts } from '../recipe.js';
import { navigationUrl } from '../stores.js';
import { radius, space, storeColor, type } from '../theme.js';
import DealRow from './DealRow.js';
import { Badge, Button, Card, Icon, StoreTag } from './ui.js';

function Check({ item, onToggle, c }) {
  return (
    <Pressable onPress={() => onToggle(item.id)} hitSlop={8} accessibilityRole="checkbox" accessibilityState={{ checked: item.done }}
      style={{ width: 26, height: 26, borderRadius: 13, borderWidth: 2, borderColor: item.done ? c.primary : c.border, backgroundColor: item.done ? c.primary : 'transparent', alignItems: 'center', justifyContent: 'center' }}>
      {item.done ? <Icon name="check" size={15} color={c.primaryInk} stroke={3} /> : null}
    </Pressable>
  );
}

function openNavigation(store, favorites) {
  Linking.openURL(navigationUrl(store, favorites, Platform.OS))
    .catch(() => Linking.openURL(`https://www.google.com/maps/search/${encodeURIComponent(`${store} supermarkt`)}`));
}

function ItemLine({ item, c, t, onToggle }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.md }}>
      <Check item={item} onToggle={onToggle} c={c} />
      <Text style={{ flex: 1, color: c.fg, ...type.strong, textDecorationLine: item.done ? 'line-through' : 'none' }}>
        {item.text}
        {item.amounts?.length ? <Text style={{ color: c.primary, fontWeight: '800' }}>  {fmtAmounts(item.amounts, t)}</Text> : null}
      </Text>
    </View>
  );
}

/** Lista podzielona na sklepy: do którego pojechać i co tam kupić, plus produkty bez promocji. */
export default function ByStoreView({ plan, c, t, lang, favorites, onToggleDone }) {
  return (
    <View style={{ gap: space.lg }}>
      {plan.groups.map((g) => {
        const sc = storeColor(g.store);
        return (
          <Card key={g.store} c={c} pad={0} style={{ overflow: 'hidden' }}>
            <View style={{ height: 6, backgroundColor: sc.bg }} />
            <View style={{ padding: space.lg, gap: space.md }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.md }}>
                <View style={{ flex: 1, gap: 4 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <Text style={{ color: c.fg, ...type.h2 }}>{g.store}</Text>
                    {g.favorite ? <Icon name="star" size={16} color={c.primary} fill={c.primary} /> : null}
                  </View>
                  <Text style={{ color: c.mut, ...type.small }}>
                    {t('products', { n: g.entries.length })}{g.total > 0 ? ` · ${t('estTotal', { sum: fmtPrice(g.total) })}` : ''}
                  </Text>
                </View>
                <Button c={c} small variant="soft" icon="nav" label={t('navigate')} onPress={() => openNavigation(g.store, favorites)} />
              </View>
              {g.entries.map(({ item, deal, others }) => (
                <View key={item.id} style={{ borderTopWidth: 1, borderTopColor: c.line, paddingTop: space.md, opacity: item.done ? 0.45 : 1 }}>
                  <ItemLine item={item} c={c} t={t} onToggle={onToggleDone} />
                  <DealRow deal={deal} c={c} t={t} lang={lang} compact />
                  {others.length > 0 && <Text style={{ color: c.mut, ...type.small }}>{t('alsoAt')} {others.join(', ')}</Text>}
                </View>
              ))}
            </View>
          </Card>
        );
      })}

      {plan.none.length > 0 && (
        <Card c={c}>
          <View style={{ gap: 4, marginBottom: space.sm }}>
            <Text style={{ color: c.fg, ...type.h2 }}>{t('noPromoSection')}</Text>
            <Text style={{ color: c.mut, ...type.small }}>{t('products', { n: plan.none.length })} · {t('noPromoHint')}</Text>
          </View>
          {plan.none.map((item) => (
            <View key={item.id} style={{ paddingVertical: space.sm + 2, borderTopWidth: 1, borderTopColor: c.line, opacity: item.done ? 0.45 : 1 }}>
              <ItemLine item={item} c={c} t={t} onToggle={onToggleDone} />
            </View>
          ))}
        </Card>
      )}
    </View>
  );
}
