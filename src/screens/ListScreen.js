import { useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import DealRow from '../components/DealRow.js';
import { dutchName, displayName, matchDeals, resolve, suggest } from '../match.js';
import { ACCENT } from '../theme.js';

const PREVIEW = 3;

function Chip({ label, onPress, selected, c }) {
  return (
    <Pressable
      onPress={onPress}
      style={{ paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, borderWidth: 1,
        borderColor: selected ? ACCENT : c.border, backgroundColor: selected ? ACCENT : c.chip }}>
      <Text style={{ color: selected ? '#fff' : c.fg }}>{label}</Text>
    </Pressable>
  );
}

export default function ListScreen({ c, t, lang, items, setItems, deals, vocab }) {
  const [text, setText] = useState('');
  const [open, setOpen] = useState({});

  const add = (raw) => {
    const parts = raw.split(/[,;\n]+/).map((s) => s.trim()).filter(Boolean);
    if (!parts.length) return;
    setItems((prev) => [
      ...parts.map((p, i) => ({ id: `${Date.now()}-${i}-${Math.random().toString(36).slice(2, 6)}`, text: p, done: false })),
      ...prev,
    ]);
    setText('');
  };
  const update = (id, patch) => setItems((prev) => prev.map((it) => (it.id === id ? { ...it, ...patch } : it)));
  const remove = (id) => setItems((prev) => prev.filter((it) => it.id !== id));

  const rows = useMemo(() => items.map((item) => {
    const r = resolve(item.text, vocab);
    return { item, r, hits: matchDeals(r.terms, deals) };
  }), [items, deals, vocab]);

  const lastPart = text.split(/[,;\n]/).pop();
  const suggestions = useMemo(() => suggest(lastPart, lang), [lastPart, lang]);
  const doneCount = items.filter((i) => i.done).length;

  return (
    <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ padding: 16, gap: 10 }}>
      <View style={{ flexDirection: 'row', gap: 8 }}>
        <TextInput
          value={text}
          onChangeText={setText}
          onSubmitEditing={() => add(text)}
          placeholder={t('addPh')}
          placeholderTextColor={c.mut}
          returnKeyType="done"
          autoCorrect={false}
          style={{ flex: 1, borderWidth: 1, borderColor: c.border, borderRadius: 12, padding: 12, color: c.fg, backgroundColor: c.card, fontSize: 16 }}
        />
        <Pressable onPress={() => add(text)} style={{ backgroundColor: ACCENT, borderRadius: 12, paddingHorizontal: 16, justifyContent: 'center' }}>
          <Text style={{ color: '#fff', fontSize: 22 }}>＋</Text>
        </Pressable>
      </View>

      {suggestions.length > 0 && (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          {suggestions.map((ci) => (
            <Chip key={ci} c={c} label={displayName(ci, lang)} onPress={() => add(displayName(ci, lang))} />
          ))}
        </View>
      )}

      {rows.length === 0 && (
        <View style={{ alignItems: 'center', paddingVertical: 40, gap: 6 }}>
          <Text style={{ color: c.fg, fontSize: 18, fontWeight: '600' }}>{t('emptyTitle')}</Text>
          <Text style={{ color: c.mut, textAlign: 'center' }}>{t('emptyHint')}</Text>
        </View>
      )}

      {rows.map(({ item, r, hits }) => {
        const expanded = !!open[item.id];
        const shown = expanded ? hits : hits.slice(0, PREVIEW);
        const choices = r.status === 'fuzzy' || r.status === 'ambiguous'
          ? [r.ci, ...r.alts].map((ci) => ({ key: ci, label: displayName(ci, lang), apply: displayName(ci, lang) }))
          : r.status === 'dutch-fuzzy' ? [{ key: r.word, label: r.word, apply: r.word }] : [];
        return (
          <View key={item.id} style={{ backgroundColor: c.card, borderRadius: 14, borderWidth: 1, borderColor: c.border, padding: 12 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <Pressable onPress={() => update(item.id, { done: !item.done })} hitSlop={8}>
                <Text style={{ fontSize: 24, color: item.done ? ACCENT : c.mut }}>{item.done ? '☑' : '☐'}</Text>
              </Pressable>
              <Text style={{ flex: 1, color: c.fg, fontSize: 17, fontWeight: '600', textDecorationLine: item.done ? 'line-through' : 'none', opacity: item.done ? 0.5 : 1 }}>
                {item.text}
              </Text>
              <Pressable onPress={() => remove(item.id)} hitSlop={10}><Text style={{ color: c.mut, fontSize: 20 }}>✕</Text></Pressable>
            </View>

            {choices.length > 0 && (
              <View style={{ marginTop: 8, gap: 6 }}>
                <Text style={{ color: c.mut, fontSize: 13 }}>{t('didYouMean')}</Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                  {choices.map((ch, i) => (
                    <Chip key={ch.key} c={c} label={ch.label} selected={i === 0} onPress={() => update(item.id, { text: ch.apply })} />
                  ))}
                </View>
              </View>
            )}
            {r.ci != null && (
              <Text style={{ color: c.mut, fontSize: 13, marginTop: 6 }}>
                {t('searchingFor')} {dutchName(r.ci)}
              </Text>
            )}
            {r.status === 'unknown' && <Text style={{ color: c.mut, fontSize: 13, marginTop: 6 }}>{t('unknownItem')}</Text>}

            {!item.done && (
              <View style={{ marginTop: 6 }}>
                {hits.length === 0 ? (
                  <Text style={{ color: c.mut, fontStyle: 'italic' }}>{t('noPromo')}</Text>
                ) : (
                  <>
                    <Text style={{ color: ACCENT, fontWeight: '600', fontSize: 13 }}>{t('promoCount', { n: hits.length })}</Text>
                    {shown.map((d) => <DealRow key={d.id} deal={d} c={c} t={t} lang={lang} />)}
                    {hits.length > PREVIEW && (
                      <Pressable onPress={() => setOpen((o) => ({ ...o, [item.id]: !expanded }))}>
                        <Text style={{ color: ACCENT, paddingVertical: 4 }}>
                          {expanded ? t('less') : t('more', { n: hits.length - PREVIEW })}
                        </Text>
                      </Pressable>
                    )}
                  </>
                )}
              </View>
            )}
          </View>
        );
      })}

      {doneCount > 0 && (
        <Pressable onPress={() => setItems((prev) => prev.filter((i) => !i.done))} style={{ alignItems: 'center', padding: 12 }}>
          <Text style={{ color: c.mut }}>{t('clearDone')} ({doneCount})</Text>
        </Pressable>
      )}
    </ScrollView>
  );
}
