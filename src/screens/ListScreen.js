import { useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import ByStoreView from '../components/ByStoreView.js';
import CompareView from '../components/CompareView.js';
import DealRow from '../components/DealRow.js';
import { dutchName, displayName, forConcept, matchDeals, resolve, suggest } from '../match.js';
import { planShopping } from '../plan.js';
import { bestUnitId } from '../pricing.js';
import { lookupRegular, regularStores } from '../regular.js';
import { favoriteChains } from '../stores.js';
import { translateToDutch } from '../translate.js';
import { recordWord } from '../vocabLog.js';
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

export default function ListScreen({ c, t, lang, items, setItems, deals, vocab, view, setView, favorites }) {
  const [text, setText] = useState('');
  const [open, setOpen] = useState({});
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

  // zwykłe ceny (bez promocji) pobieramy dopiero po otwarciu porównania – to osobne zapytania do sklepów
  const [regular, setRegular] = useState({});
  const [regLoading, setRegLoading] = useState(false);
  const regKey = rows.filter((x) => !x.item.done).map((x) => x.r.terms[0]).join('|') + '#' + chains.join(',');
  useEffect(() => {
    if (view !== 'compare') return undefined;
    const sources = regularStores().filter((s) => chains.includes(s));
    if (!sources.length) return undefined;
    let cancelled = false;
    (async () => {
      setRegLoading(true);
      for (const { item, r } of rows.filter((x) => !x.item.done)) {
        const found = [];
        for (const store of sources) {
          try { found.push(...await lookupRegular(store, r.terms, r.ci)); } catch { /* brak danych z tego sklepu */ }
        }
        if (cancelled) return;
        setRegular((prev) => ({ ...prev, [item.id]: found }));
      }
      if (!cancelled) setRegLoading(false);
    })();
    return () => { cancelled = true; setRegLoading(false); };
  }, [view, regKey]);
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
      if (r.status !== 'unknown' || key in tr || asked.current.has(key)) continue;
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

      {rows.length > 0 && (
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <Chip c={c} label={t('viewItems')} selected={view === 'items'} onPress={() => setView('items')} />
          <Chip c={c} label={t('viewStores')} selected={view === 'stores'} onPress={() => setView('stores')} />
          <Chip c={c} label={t('viewCompare')} selected={view === 'compare'} onPress={() => setView('compare')} />
        </View>
      )}

      {rows.length === 0 && (
        <View style={{ alignItems: 'center', paddingVertical: 40, gap: 6 }}>
          <Text style={{ color: c.fg, fontSize: 18, fontWeight: '600' }}>{t('emptyTitle')}</Text>
          <Text style={{ color: c.mut, textAlign: 'center' }}>{t('emptyHint')}</Text>
        </View>
      )}

      {view === 'stores' && rows.length > 0 && (
        <ByStoreView plan={plan} c={c} t={t} lang={lang} favorites={favorites} onToggleDone={toggleDone} />
      )}

      {view === 'compare' && rows.length > 0 && (
        <CompareView c={c} t={t} rows={rows} regular={regular} stores={chains} loading={regLoading} />
      )}

      {view === 'items' && rows.map(({ item, r, r0, hits }) => {
        const expanded = !!open[item.id];
        const shown = expanded ? hits : hits.slice(0, PREVIEW);
        const bestId = bestUnitId(hits);
        const choices = r0.status === 'fuzzy' || r0.status === 'ambiguous'
          ? [r0.ci, ...r0.alts].map((ci) => ({ key: ci, label: `${displayName(ci, lang)} → ${dutchName(ci)}`, apply: displayName(ci, lang), pick: ci }))
          : r.status === 'dutch-fuzzy' ? [{ key: r.word, label: r.word, apply: r.word }] : [];
        const chosen = item.pick ?? r0.ci;
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
                    <Chip key={ch.key} c={c} label={ch.label} selected={ch.pick != null ? ch.pick === chosen : i === 0}
                      onPress={() => update(item.id, ch.pick != null
                        ? { pick: ch.pick, ...(r0.status === 'fuzzy' ? { text: ch.apply } : {}) } // literówkę poprawiamy w tekście
                        : { text: ch.apply })} />
                  ))}
                </View>
              </View>
            )}
            {r.status === 'translated' && (
              <Text style={{ color: c.mut, fontSize: 13, marginTop: 6 }}>{t('translated')} {r.word}</Text>
            )}
            {r.ci != null && r.status !== 'translated' && (
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
                    {shown.map((d) => <DealRow key={d.id} deal={d} c={c} t={t} lang={lang} best={d.id === bestId} />)}
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
