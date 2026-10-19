import { useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import ByStoreView from '../components/ByStoreView.js';
import DealRow from '../components/DealRow.js';
import RecipeModal from '../components/RecipeModal.js';
import { dutchName, displayName, forConcept, matchDeals, resolve, suggest } from '../match.js';
import { planShopping } from '../plan.js';
import { amountsToText, fmtAmounts, mergeIntoItems, parseAmounts } from '../recipe.js';
import { bestUnitId } from '../pricing.js';
import { favoriteChains } from '../stores.js';
import { translateToDutch } from '../translate.js';
import { recordWord } from '../vocabLog.js';
import { radius, space, type } from '../theme.js';
import { Badge, Button, Card, Chip, EmptyState, Icon, IconButton, Segmented } from '../components/ui.js';

const PREVIEW = 3;

export default function ListScreen({ c, t, lang, items, setItems, deals, vocab, view, setView, favorites }) {
  const [text, setText] = useState('');
  const [open, setOpen] = useState({});
  const [recipeOpen, setRecipeOpen] = useState(false);
  const [edit, setEdit] = useState(null); // { id, name, qty, bad }
  const startEdit = (item) => setEdit({ id: item.id, name: item.text, qty: amountsToText(item.amounts), bad: false });
  const saveEdit = () => {
    const name = edit.name.trim();
    const amounts = parseAmounts(edit.qty);
    if (!name) return;
    if (amounts === null) { setEdit({ ...edit, bad: true }); return; }
    setItems((prev) => prev.map((it) => {
      if (it.id !== edit.id) return it;
      const { pick, ...rest } = it;
      return { ...rest, text: name, amounts: amounts.length ? amounts : undefined, ...(name === it.text && pick != null ? { pick } : {}) }; // inna nazwa = nowe rozpoznanie
    }));
    setEdit(null);
  };
  const [tr, setTr] = useState({}); // „język|tekst” -> tłumaczenie na holenderski (albo null)
  const asked = useRef(new Set());
  const trKey = (text) => `${lang}|${text.trim().toLowerCase()}`;

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
    const r0 = resolve(item.text, vocab, tr[trKey(item.text)] ?? null, lang);
    const r = item.pick != null ? forConcept(item.pick, item.text) : r0; // r0 zostaje źródłem listy „czy chodziło o…”
    return { item, r, r0, hits: matchDeals(r.terms, deals, r.ci) };
  }), [items, deals, vocab, tr, lang]);

  const chains = useMemo(() => favoriteChains(favorites), [favorites]);
  const plan = useMemo(() => planShopping(rows, chains), [rows, chains]);

  const toggleDone = (id) => setItems((prev) => prev.map((it) => (it.id === id ? { ...it, done: !it.done } : it)));

  // słowa, z którymi słownik miał problem, trafiają do dziennika (widać je w zakładce Słownik – nie na tej stronie)
  const logged = useRef(new Set());
  useEffect(() => {
    for (const { item, r0 } of rows) {
      const kind = r0.status === 'unknown' ? 'unknown' : r0.status === 'translated' ? 'translated'
        : r0.status === 'fuzzy' || r0.status === 'dutch-fuzzy' ? 'fuzzy' : null;
      const key = `${lang}|${item.text.trim().toLowerCase()}|${kind}`;
      if (!kind || logged.current.has(key)) continue;
      logged.current.add(key);
      recordWord(lang, item.text, kind);
    }
  }, [rows]);

  // słowa spoza słownika tłumaczymy w tle na holenderski (raz na słowo; wynik zapamiętany w telefonie)
  useEffect(() => {
    for (const { item, r } of rows) {
      const key = trKey(item.text);
      if ((r.status !== 'unknown' && !r.partial) || key in tr || asked.current.has(key)) continue;
      asked.current.add(key);
      translateToDutch(item.text, lang).then((out) => {
        if (out) setTr((prev) => ({ ...prev, [key]: out }));
        else asked.current.delete(key); // brak sieci/limit – spróbujemy przy następnej zmianie listy
      });
    }
  }, [rows]);

  const lastPart = text.split(/[,;\n]/).pop();
  const suggestions = useMemo(() => suggest(lastPart, lang), [lastPart, lang]);
  const doneCount = items.filter((i) => i.done).length;
  const remaining = items.length - doneCount;
  const withPromo = rows.filter((x) => !x.item.done && x.hits.length > 0).length;
  const input = { borderWidth: 1, borderColor: c.border, borderRadius: radius.md, paddingHorizontal: space.md, paddingVertical: 11, color: c.fg, backgroundColor: c.bg, fontSize: 16 };

  return (
    <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingHorizontal: space.lg, paddingTop: space.xs, paddingBottom: 32, gap: space.md }}>
      <Card c={c} pad={space.md} level={2} style={{ gap: space.sm }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.sm }}>
          <View style={{ flex: 1, minWidth: 0, overflow: 'hidden', flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: c.bg, borderRadius: radius.md, paddingLeft: space.md, borderWidth: 1, borderColor: c.border }}>
            <View style={{ flexShrink: 0 }}><Icon name="search" size={18} color={c.mut} /></View>
            <TextInput
              value={text}
              onChangeText={setText}
              onSubmitEditing={() => add(text)}
              placeholder={t('addPh')}
              placeholderTextColor={c.mut}
              returnKeyType="done"
              autoCorrect={false}
              style={{ flex: 1, minWidth: 0, paddingVertical: 12, paddingRight: space.md, color: c.fg, fontSize: 16 }}
            />
          </View>
          <IconButton c={c} icon="plus" tone="primary" size={48} iconSize={24} label="+" onPress={() => add(text)} />
        </View>
        {suggestions.length > 0 && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} keyboardShouldPersistTaps="handled" contentContainerStyle={{ gap: space.sm }}>
            {suggestions.map((ci) => <Chip key={ci} c={c} label={displayName(ci, lang)} onPress={() => add(displayName(ci, lang))} />)}
          </ScrollView>
        )}
      </Card>

      <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.sm }}>
        {rows.length > 0 && (
          <View style={{ flex: 1 }}>
            <Segmented c={c} value={view} onChange={setView}
              options={[{ id: 'items', label: t('viewItems'), icon: 'list' }, { id: 'stores', label: t('viewStores'), icon: 'store' }]} />
          </View>
        )}
        <Button c={c} small variant="soft" icon="clip" label={t('recipeBtn')} onPress={() => setRecipeOpen(true)} />
      </View>

      <RecipeModal visible={recipeOpen} onClose={() => setRecipeOpen(false)} c={c} t={t} lang={lang} vocab={vocab} items={items}
        onAdd={(groups) => setItems((prev) => mergeIntoItems(prev, groups, { lang, vocab, makeId: () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}` }).items)} />

      {rows.length === 0 && (
        <EmptyState c={c} icon="cart" title={t('emptyTitle')} hint={t('emptyHint')}
          action={<Button c={c} variant="soft" icon="clip" label={t('recipeBtn')} onPress={() => setRecipeOpen(true)} style={{ marginTop: space.sm }} />} />
      )}

      {rows.length > 0 && (
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: space.xs }}>
          <Text style={{ color: c.ink2, ...type.small }}>
            {t('products', { n: remaining })}{withPromo ? ` · ` : ''}{withPromo ? <Text style={{ color: c.success, fontWeight: '800' }}>{t('promoCount', { n: withPromo })}</Text> : null}
          </Text>
          {doneCount > 0 && (
            <Pressable onPress={() => setItems((prev) => prev.filter((i) => !i.done))} hitSlop={8}>
              <Text style={{ color: c.primary, fontWeight: '700', fontSize: 13 }}>{t('clearDone')} ({doneCount})</Text>
            </Pressable>
          )}
        </View>
      )}

      {view === 'stores' && rows.length > 0 && (
        <ByStoreView plan={plan} c={c} t={t} lang={lang} favorites={favorites} onToggleDone={toggleDone} />
      )}

      {view !== 'stores' && rows.map(({ item, r, r0, hits }) => {
        const expanded = !!open[item.id];
        const shown = expanded ? hits : hits.slice(0, PREVIEW);
        const bestId = bestUnitId(hits);
        const amountText = item.amounts?.length ? fmtAmounts(item.amounts, t) : '';
        const choices = r0.status === 'fuzzy' || r0.status === 'ambiguous'
          ? [r0.ci, ...r0.alts].map((ci) => ({ key: ci, label: `${displayName(ci, lang)} → ${dutchName(ci)}`, apply: displayName(ci, lang), pick: ci }))
          : r.status === 'dutch-fuzzy' ? [{ key: r.word, label: r.word, apply: r.word }] : [];
        const chosen = item.pick ?? r0.ci;
        const searching = r.status === 'translated' ? `${t('translated')} ${r.word}` : r.ci != null ? `${t('searchingFor')} ${dutchName(r.ci)}` : '';
        return (
          <Card key={item.id} c={c} pad={0} style={{ opacity: item.done ? 0.55 : 1 }}>
            <View style={{ padding: space.lg, gap: space.sm }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.md }}>
                <Pressable onPress={() => update(item.id, { done: !item.done })} hitSlop={8} accessibilityRole="checkbox" accessibilityState={{ checked: item.done }}
                  style={{ width: 28, height: 28, borderRadius: 14, borderWidth: 2, borderColor: item.done ? c.primary : c.border, backgroundColor: item.done ? c.primary : 'transparent', alignItems: 'center', justifyContent: 'center' }}>
                  {item.done ? <Icon name="check" size={16} color={c.primaryInk} stroke={3} /> : null}
                </Pressable>
                <View style={{ flex: 1, gap: 6 }}>
                  <Text style={{ color: c.fg, fontSize: 17, fontWeight: '700', textDecorationLine: item.done ? 'line-through' : 'none' }}>{item.text}</Text>
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
                    {amountText ? <Badge c={c} tone="brand" label={amountText} /> : null}
                    {!item.done && hits.length > 0 ? <Badge c={c} tone="success" icon="tag" label={t('promoCount', { n: hits.length })} /> : null}
                  </View>
                </View>
                <IconButton c={c} icon="edit" tone="ghost" size={36} iconSize={18} label={t('editItem')} onPress={() => startEdit(item)} />
                <IconButton c={c} icon="x" tone="ghost" size={36} iconSize={18} label="✕" onPress={() => remove(item.id)} />
              </View>

              {edit?.id === item.id && (
                <View style={{ gap: space.sm, backgroundColor: c.surfaceAlt, borderRadius: radius.md, padding: space.md }}>
                  <TextInput value={edit.name} onChangeText={(v) => setEdit({ ...edit, name: v })} autoCorrect={false} autoFocus
                    placeholder={t('editName')} placeholderTextColor={c.mut} style={input} />
                  <TextInput value={edit.qty} onChangeText={(v) => setEdit({ ...edit, qty: v, bad: false })} autoCorrect={false}
                    placeholder={t('editQty')} placeholderTextColor={c.mut} style={[input, edit.bad && { borderColor: c.danger }]} />
                  {edit.bad && <Text style={{ color: c.danger, ...type.small }}>{t('editQtyBad')}</Text>}
                  <View style={{ flexDirection: 'row', gap: space.sm, justifyContent: 'flex-end' }}>
                    <Button c={c} small variant="neutral" label={t('editCancel')} onPress={() => setEdit(null)} />
                    <Button c={c} small label={t('editSave')} onPress={saveEdit} />
                  </View>
                </View>
              )}

              {choices.length > 0 && (
                <View style={{ gap: 6 }}>
                  <Text style={{ color: c.mut, ...type.small }}>{t('didYouMean')}</Text>
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.sm }}>
                    {choices.map((ch, i) => (
                      <Chip key={ch.key} c={c} label={ch.label} selected={ch.pick != null ? ch.pick === chosen : i === 0}
                        onPress={() => update(item.id, ch.pick != null
                          ? { pick: ch.pick, ...(r0.status === 'fuzzy' ? { text: ch.apply } : {}) } // literówkę poprawiamy w tekście
                          : { text: ch.apply })} />
                    ))}
                  </View>
                </View>
              )}

              {searching ? <Text style={{ color: c.mut, ...type.small }}>{searching}</Text> : null}
              {r.partial && <Text style={{ color: c.warnFg, ...type.small }}>{t('partialHint', { w: r.extra.join(' ') })}</Text>}
              {r.status === 'unknown' && <Text style={{ color: c.mut, ...type.small }}>{t('unknownItem')}</Text>}
            </View>

            {!item.done && (
              <View style={{ borderTopWidth: 1, borderTopColor: c.line, paddingHorizontal: space.lg }}>
                {hits.length === 0 ? (
                  <Text style={{ color: c.mut, fontStyle: 'italic', paddingVertical: space.md }}>{t('noPromo')}</Text>
                ) : (
                  <>
                    {shown.map((d, i) => (
                      <View key={d.id} style={i > 0 ? { borderTopWidth: 1, borderTopColor: c.line } : null}>
                        <DealRow deal={d} c={c} t={t} lang={lang} best={d.id === bestId} />
                      </View>
                    ))}
                    {hits.length > PREVIEW && (
                      <Pressable onPress={() => setOpen((o) => ({ ...o, [item.id]: !expanded }))} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: space.md, borderTopWidth: 1, borderTopColor: c.line }}>
                        <Text style={{ color: c.primary, fontWeight: '700' }}>{expanded ? t('less') : t('more', { n: hits.length - PREVIEW })}</Text>
                        <View style={{ transform: [{ rotate: expanded ? '180deg' : '0deg' }] }}><Icon name="chevron" size={16} color={c.primary} /></View>
                      </Pressable>
                    )}
                  </>
                )}
              </View>
            )}
          </Card>
        );
      })}
    </ScrollView>
  );
}
