import { useMemo, useState } from 'react';
import { Modal, ScrollView, TextInput, View } from 'react-native';
import Text from './Text.js';
import { useContext } from 'react';
import { ComfortContext } from '../comfortContext.js';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { REGIONS, REGION_IDS, buildGroups, fmtAmounts, keyOfItem, resolveRegion } from '../recipe.js';
import { elevation, radius, space, type } from '../theme.js';
import { Badge, Button, Card, Chip, Icon, IconButton, SectionLabel } from './ui.js';

const STEP = 0.5;

/** Wklej składniki przepisu → podgląd listy zakupów (zsumowane, bez duplikatów) → dodaj do listy. */
export default function RecipeModal({ visible, onClose, c, t, lang, vocab, items, onAdd }) {
  const insets = useSafeAreaInsets();
  const { animated } = useContext(ComfortContext);
  const [text, setText] = useState('');
  const [mult, setMult] = useState(1);
  const [regionChoice, setRegionChoice] = useState('auto');
  const region = resolveRegion(regionChoice, text);
  const { groups, lines, skipped } = useMemo(() => buildGroups(text, { lang, vocab, multiplier: mult, region }), [text, lang, vocab, mult, region]);
  const sizes = REGIONS[region];
  const regionName = (id) => (id === 'auto' ? t('regAuto') : id === 'metric' ? t('regMetric') : id === 'us' ? 'USA' : id === 'uk' ? 'UK' : 'AU');
  const onList = useMemo(() => new Set(items.map((it) => keyOfItem(it, { lang, vocab }))), [items, lang, vocab]);

  const add = () => { onAdd(groups); setText(''); setMult(1); setRegionChoice('auto'); onClose(); };

  return (
    <Modal visible={visible} animationType={animated ? 'slide' : 'none'} onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: c.bg, paddingTop: insets.top }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.md, paddingHorizontal: space.lg, paddingVertical: space.md }}>
          <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: c.primaryTint, alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="clip" size={20} color={c.primary} />
          </View>
          <Text style={{ color: c.fg, ...type.title, flex: 1 }}>{t('recipeTitle')}</Text>
          <IconButton c={c} icon="x" label="✕" onPress={onClose} />
        </View>

        <ScrollView contentContainerStyle={{ paddingHorizontal: space.lg, paddingBottom: space.xl, gap: space.md }} keyboardShouldPersistTaps="handled">
          <Card c={c} pad={space.md} level={2} style={{ gap: space.sm }}>
            <TextInput value={text} onChangeText={setText} multiline placeholder={t('recipePh')} placeholderTextColor={c.mut}
              autoCorrect={false} textAlignVertical="top"
              style={{ minHeight: 140, maxHeight: 240, color: c.fg, fontSize: 15, lineHeight: 22 }} />
            <Text style={{ color: c.mut, ...type.caption }}>{t('recipeHint')}</Text>
          </Card>

          <Card c={c} style={{ gap: space.md }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <Text style={{ color: c.fg, ...type.strong }}>{t('recipeMult', { n: String(mult).replace('.', ',') })}</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.sm }}>
                <Button c={c} variant="neutral" small label="−" onPress={() => setMult((m) => Math.max(STEP, m - STEP))} />
                <Button c={c} variant="neutral" small label="＋" onPress={() => setMult((m) => m + STEP)} />
              </View>
            </View>
            <View style={{ gap: space.sm }}>
              <Text style={{ color: c.mut, ...type.overline }}>{t('regionLabel')}</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.sm }}>
                {['auto', ...REGION_IDS].map((id) => <Chip key={id} c={c} label={regionName(id)} selected={regionChoice === id} onPress={() => setRegionChoice(id)} />)}
              </View>
              <Text style={{ color: c.mut, ...type.small }}>{regionName(region)}: {t('regInfo', { tbsp: sizes.tbsp, tsp: sizes.tsp, cup: sizes.cup })}</Text>
            </View>
          </Card>

          {groups.length === 0 ? (
            <Text style={{ color: c.mut, textAlign: 'center', paddingVertical: space.xl }}>{t('recipeEmpty')}</Text>
          ) : (
            <>
              <SectionLabel c={c}>{t('recipeLines', { n: lines, m: groups.length })}</SectionLabel>
              <Card c={c} pad={0}>
                {groups.map((g, i) => (
                  <View key={g.key} style={{ paddingVertical: space.md, paddingHorizontal: space.lg, borderTopWidth: i ? 1 : 0, borderTopColor: c.line, gap: 6 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.sm }}>
                      <Text style={{ color: c.fg, ...type.strong, flexShrink: 1 }}>{g.text}</Text>
                      {g.count > 1 ? <Text style={{ color: c.mut, fontSize: 13 }}>×{g.count}</Text> : null}
                    </View>
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
                      {g.amounts.length ? <Badge c={c} tone="brand" label={fmtAmounts(g.amounts, t)} /> : null}
                      {!g.amounts.length && g.toTaste ? <Badge c={c} label={t('toTaste')} /> : null}
                      {onList.has(g.key) ? <Badge c={c} tone="success" icon="check" label={t('recipeOnList')} /> : null}
                    </View>
                  </View>
                ))}
              </Card>
            </>
          )}

          {skipped.length > 0 && (
            <View style={{ backgroundColor: c.warnTint, borderRadius: radius.md, padding: space.md, gap: 2 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Icon name="alert" size={16} color={c.warnFg} />
                <Text style={{ color: c.warnFg, fontWeight: '700', fontSize: 13, flex: 1 }}>{t('recipeSkipped', { n: skipped.length })}</Text>
              </View>
              {skipped.slice(0, 8).map((l, i) => <Text key={i} style={{ color: c.warnFg, fontSize: 13 }}>• {l}</Text>)}
            </View>
          )}
        </ScrollView>

        <View style={{ padding: space.lg, paddingBottom: Math.max(insets.bottom, space.lg), backgroundColor: c.surface, borderTopWidth: 1, borderTopColor: c.line, ...elevation(c, 2) }}>
          <Button c={c} icon="plus" label={t('recipeAdd', { n: groups.length })} onPress={add} disabled={groups.length === 0} />
        </View>
      </View>
    </Modal>
  );
}
