import { Pressable, View } from 'react-native';
import Text from './Text.js';
import { groupByAisle } from '../aisles.js';
import { fmtAmounts } from '../recipe.js';
import { space, type } from '../theme.js';
import { Badge, Card, Icon } from './ui.js';

/** Lista wg działów sklepu, w kolejności „po drodze”: warzywa → pieczywo → mięso → nabiał → … */
export default function AisleView({ rows, c, t, onToggleDone }) {
  const groups = groupByAisle(rows, (r) => r.r.ci);
  return (
    <View style={{ gap: space.lg }}>
      {groups.map((g, gi) => (
        <Card key={g.aisle} c={c} pad={0}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.md, padding: space.lg, paddingBottom: space.sm }}>
            <View style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: c.primaryTint, alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ color: c.primaryDeep, fontWeight: '800', fontSize: 13 }}>{gi + 1}</Text>
            </View>
            <Text style={{ color: c.fg, ...type.h2, flex: 1 }}>{t(`aisle_${g.aisle}`)}</Text>
            <Badge c={c} label={String(g.entries.length)} />
          </View>
          {g.entries.map(({ item }) => (
            <Pressable key={item.id} onPress={() => onToggleDone(item.id)} accessibilityRole="checkbox" accessibilityState={{ checked: item.done }}
              style={{ flexDirection: 'row', alignItems: 'center', gap: space.md, padding: space.lg, borderTopWidth: 1, borderTopColor: c.line, opacity: item.done ? 0.5 : 1 }}>
              <View style={{ width: 28, height: 28, borderRadius: 14, borderWidth: 2, borderColor: item.done ? c.primary : c.border, backgroundColor: item.done ? c.primary : 'transparent', alignItems: 'center', justifyContent: 'center' }}>
                {item.done ? <Icon name="check" size={16} color={c.primaryInk} stroke={3} /> : null}
              </View>
              <Text style={{ flex: 1, color: c.fg, ...type.strong, textDecorationLine: item.done ? 'line-through' : 'none' }}>
                {item.text}{item.amounts?.length ? <Text style={{ color: c.primary, fontWeight: '800' }}>  {fmtAmounts(item.amounts, t)}</Text> : null}
              </Text>
            </Pressable>
          ))}
        </Card>
      ))}
    </View>
  );
}
