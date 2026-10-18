import { ScrollView, Text, View } from 'react-native';
import { compareStores } from '../compare.js';
import { fmtPrice } from '../format.js';
import { fmtUnit } from '../pricing.js';
import { regularStores } from '../regular.js';
import { ACCENT } from '../theme.js';

/** Ile taniej w jednym sklepie, a ile w drugim: tabela cen produktów z listy i zdania porównawcze. */
export default function CompareView({ c, t, rows, regular, stores, loading }) {
  const card = { backgroundColor: c.card, borderRadius: 14, borderWidth: 1, borderColor: c.border, padding: 12 };
  if (stores.length < 2) return <View style={card}><Text style={{ color: c.mut }}>{t('cmpNeed')}</Text></View>;

  const { table, summary, pairs } = compareStores(rows, regular, stores);
  const shown = summary.filter((s) => s.covered > 0).map((s) => s.store);
  const reg = regularStores().filter((s) => stores.includes(s));

  return (
    <View style={{ gap: 10 }}>
      <View style={card}>
        {summary.map((s) => (
          <View key={s.store} style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 }}>
            <View>
              <Text style={{ color: c.fg, fontWeight: '700' }}>{s.store}</Text>
              <Text style={{ color: c.mut, fontSize: 12 }}>{t('cmpCovered', { n: s.covered, m: s.of })}</Text>
            </View>
            <Text style={{ color: s.covered ? ACCENT : c.mut, fontWeight: '700', fontSize: 18 }}>{s.covered ? fmtPrice(s.total) : '–'}</Text>
          </View>
        ))}
        {pairs.slice(0, 6).map((p) => (
          <Text key={`${p.a}|${p.b}`} style={{ color: c.fg, marginTop: 8 }}>
            {p.pct >= 1
              ? t('cmpPair', { cheaper: p.cheaper, other: p.other, pct: p.pct, n: p.common })
              : t('cmpSimilar', { a: p.a, b: p.b, n: p.common })}
          </Text>
        ))}
        {loading && <Text style={{ color: c.mut, marginTop: 8 }}>{t('cmpLoading')}</Text>}
      </View>

      {shown.length > 0 && (
        <ScrollView horizontal style={card} showsHorizontalScrollIndicator={false}>
          <View>
            <View style={{ flexDirection: 'row' }}>
              <Text style={{ width: 110, color: c.mut }} />
              {shown.map((s) => <Text key={s} style={{ width: 96, color: c.fg, fontWeight: '700' }}>{s}</Text>)}
            </View>
            {table.map(({ item, prices }) => {
              const known = shown.map((s) => prices[s]).filter(Boolean);
              const min = known.length > 1 ? Math.min(...known.map((p) => p.price)) : null;
              return (
                <View key={item.id} style={{ flexDirection: 'row', paddingVertical: 6, borderTopWidth: 1, borderTopColor: c.border }}>
                  <Text style={{ width: 110, color: c.fg }} numberOfLines={2}>{item.text}</Text>
                  {shown.map((s) => {
                    const p = prices[s];
                    return (
                      <View key={s} style={{ width: 96, paddingRight: 4 }}>
                        {p ? (
                          <>
                            <Text style={{ color: p.price === min ? '#2b8a3e' : c.fg, fontWeight: p.price === min ? '700' : '400' }}>{fmtPrice(p.price)}</Text>
                            <Text style={{ color: c.mut, fontSize: 10 }} numberOfLines={1}>{p.deal.name}</Text>
                            <Text style={{ color: p.kind === 'promo' ? ACCENT : c.mut, fontSize: 11 }}>
                              {p.kind === 'promo' ? t('cmpPromoTag') : t('cmpRegularTag')}{p.unit ? ` · ${fmtUnit(p.unit)}` : ''}
                            </Text>
                          </>
                        ) : <Text style={{ color: c.mut }}>–</Text>}
                      </View>
                    );
                  })}
                </View>
              );
            })}
          </View>
        </ScrollView>
      )}
      <Text style={{ color: c.mut, fontSize: 12 }}>{t('cmpBase')}{reg.length ? ` ${t('cmpRegular', { stores: reg.join(', ') })}` : ''}</Text>
    </View>
  );
}
