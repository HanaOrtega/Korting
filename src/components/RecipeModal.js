import { useMemo, useState } from 'react';
import { Modal, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { buildGroups, fmtAmounts, keyOfItem } from '../recipe.js';
import { ACCENT } from '../theme.js';

const STEP = 0.5;

/** Wklej składniki przepisu → podgląd listy zakupów (zsumowane, bez duplikatów) → dodaj do listy. */
export default function RecipeModal({ visible, onClose, c, t, lang, vocab, items, onAdd }) {
  const [text, setText] = useState('');
  const [mult, setMult] = useState(1);
  const { groups, lines } = useMemo(() => buildGroups(text, { lang, vocab, multiplier: mult }), [text, lang, vocab, mult]);
  const onList = useMemo(() => new Set(items.map((it) => keyOfItem(it, { lang, vocab }))), [items, lang, vocab]);
  const btn = { backgroundColor: ACCENT, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10, alignItems: 'center' };

  const add = () => { onAdd(groups); setText(''); setMult(1); onClose(); };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: c.bg, paddingTop: 36 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingBottom: 8 }}>
          <Text style={{ color: c.fg, fontSize: 18, fontWeight: '800', flex: 1 }}>{t('recipeTitle')}</Text>
          <Pressable onPress={onClose} style={[btn, { backgroundColor: c.chip }]}><Text style={{ color: c.fg, fontWeight: '600' }}>✕</Text></Pressable>
        </View>
        <ScrollView contentContainerStyle={{ padding: 16, gap: 10 }} keyboardShouldPersistTaps="handled">
          <TextInput value={text} onChangeText={setText} multiline placeholder={t('recipePh')} placeholderTextColor={c.mut}
            autoCorrect={false} textAlignVertical="top"
            style={{ minHeight: 150, borderWidth: 1, borderColor: c.border, borderRadius: 12, padding: 12, color: c.fg, backgroundColor: c.card, fontSize: 15 }} />
          <Text style={{ color: c.mut, fontSize: 12 }}>{t('recipeHint')}</Text>

          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <Pressable onPress={() => setMult((m) => Math.max(STEP, m - STEP))} style={[btn, { backgroundColor: c.chip }]}><Text style={{ color: c.fg, fontSize: 18 }}>−</Text></Pressable>
            <Text style={{ color: c.fg, fontWeight: '700', minWidth: 90, textAlign: 'center' }}>{t('recipeMult', { n: String(mult).replace('.', ',') })}</Text>
            <Pressable onPress={() => setMult((m) => m + STEP)} style={[btn, { backgroundColor: c.chip }]}><Text style={{ color: c.fg, fontSize: 18 }}>＋</Text></Pressable>
          </View>

          {groups.length === 0 ? (
            <Text style={{ color: c.mut, textAlign: 'center', paddingVertical: 20 }}>{t('recipeEmpty')}</Text>
          ) : (
            <View style={{ backgroundColor: c.card, borderRadius: 14, borderWidth: 1, borderColor: c.border, padding: 12, gap: 8 }}>
              <Text style={{ color: c.mut, fontSize: 12 }}>{t('recipeLines', { n: lines, m: groups.length })}</Text>
              {groups.map((g) => (
                <View key={g.key} style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: c.fg, fontWeight: '600' }}>{g.text}{g.count > 1 ? <Text style={{ color: c.mut, fontWeight: '400' }}>  ×{g.count}</Text> : null}</Text>
                    {onList.has(g.key) && <Text style={{ color: ACCENT, fontSize: 12 }}>{t('recipeOnList')}</Text>}
                  </View>
                  <Text style={{ color: g.amounts.length ? c.fg : c.mut }}>
                    {g.amounts.length ? fmtAmounts(g.amounts, t) : g.toTaste ? t('toTaste') : ''}
                  </Text>
                </View>
              ))}
            </View>
          )}
          <Pressable onPress={add} disabled={groups.length === 0} style={[btn, { padding: 14, opacity: groups.length === 0 ? 0.4 : 1 }]}>
            <Text style={{ color: '#fff', fontWeight: '700', fontSize: 16 }}>{t('recipeAdd', { n: groups.length })}</Text>
          </Pressable>
        </ScrollView>
      </View>
    </Modal>
  );
}
