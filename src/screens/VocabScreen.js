import { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, Share, Text, View } from 'react-native';
import { listStats, vocabHealth } from '../health.js';
import { displayName, resolve } from '../match.js';
import { clearTranslations, listTranslations } from '../translate.js';
import { ACCENT } from '../theme.js';
import { clearLog, readLog } from '../vocabLog.js';

const PREVIEW = 12;

/** Zakładka „Słownik”: kondycja słownika względem Twoich słów i dzisiejszych ofert (poza główną stroną). */
export default function VocabScreen({ c, t, lang, items, deals, vocab }) {
  const [open, setOpen] = useState({});
  const [learned, setLearned] = useState([]);
  const [log, setLog] = useState([]);
  const [ready, setReady] = useState(false);
  const reload = async () => { setLearned(await listTranslations()); setLog(await readLog()); };
  useEffect(() => { reload(); }, []);
  useEffect(() => { const id = setTimeout(() => setReady(true), 50); return () => clearTimeout(id); }, []); // najpierw rysujemy ekran, potem liczymy

  const health = useMemo(() => (ready ? vocabHealth(deals, lang) : null), [ready, deals, lang]);
  const tr = useMemo(() => Object.fromEntries(learned.map((x) => [`${x.lang}|${x.from}`, x.to])), [learned]);
  const rows = useMemo(() => items.map((it) => ({
    it, r: resolve(it.text, vocab, tr[`${lang}|${it.text.trim().toLowerCase()}`] ?? null, lang),
  })), [items, vocab, tr, lang]);
  const stats = listStats(rows.map((x) => x.r.status));
  const problems = rows.filter((x) => ['unknown', 'translated', 'fuzzy', 'dutch-fuzzy'].includes(x.r.status));

  const card = { backgroundColor: c.card, borderRadius: 14, borderWidth: 1, borderColor: c.border, padding: 12 };
  const mut = { color: c.mut, fontSize: 13 };

  const Section = ({ id, title, count, children, action }) => (
    <View style={card}>
      <Pressable onPress={() => setOpen((o) => ({ ...o, [id]: !o[id] }))} style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <Text style={{ color: c.fg, fontWeight: '700', flex: 1 }}>{title}</Text>
        <Text style={{ color: ACCENT, fontWeight: '700' }}>{count === 0 ? '✓' : open[id] ? '▾' : '▸'}</Text>
      </Pressable>
      {open[id] && count !== 0 && <View style={{ marginTop: 8, gap: 4 }}>{children}{action}</View>}
    </View>
  );
  const pills = (arr, render, id) => {
    const more = open[`${id}+`] ? arr : arr.slice(0, PREVIEW);
    return (
      <>
        {more.map(render)}
        {arr.length > PREVIEW && (
          <Pressable onPress={() => setOpen((o) => ({ ...o, [`${id}+`]: !o[`${id}+`] }))}>
            <Text style={{ color: ACCENT }}>{open[`${id}+`] ? t('less') : t('more', { n: arr.length - PREVIEW })}</Text>
          </Pressable>
        )}
      </>
    );
  };

  const shareWords = () => {
    const lines = [...problems.map((x) => `${lang}: ${x.it.text} [${x.r.status}]`), ...log.map((x) => `${x.lang}: ${x.word} [${x.kind} ×${x.count}]`)];
    Share.share({ message: `Korting – słowa do poprawy:\n${[...new Set(lines)].join('\n')}` });
  };

  return (
    <ScrollView contentContainerStyle={{ padding: 16, gap: 10 }}>
      <Text style={mut}>{t('vHint')}</Text>
      {health && <Text style={{ color: c.fg, fontWeight: '600' }}>{t('vSummary', { n: health.products, t: health.terms, l: health.languages })}</Text>}

      <View style={card}>
        <Text style={{ color: c.fg, fontWeight: '700', marginBottom: 6 }}>{t('vYourList')} ({items.length})</Text>
        <Text style={mut}>{t('vRecognized', { n: stats.recognized })}</Text>
        <Text style={mut}>{t('vFuzzy', { n: stats.fuzzy })}</Text>
        <Text style={mut}>{t('vTranslated', { n: stats.translated })}</Text>
        <Text style={{ color: stats.unknown ? c.danger : c.mut, fontSize: 13, fontWeight: stats.unknown ? '700' : '400' }}>{t('vUnknown', { n: stats.unknown })}</Text>
        {problems.map(({ it, r }) => (
          <Text key={it.id} style={{ color: c.fg, marginTop: 4 }}>• {it.text} <Text style={mut}>[{r.status}{r.word ? ` → ${r.word}` : ''}]</Text></Text>
        ))}
      </View>

      <Section id="log" title={t('vLog')} count={log.length}
        action={<Pressable onPress={shareWords} style={{ marginTop: 6 }}><Text style={{ color: ACCENT, fontWeight: '600' }}>{t('vShare')}</Text></Pressable>}>
        {pills(log, (x) => <Text key={`${x.lang}|${x.word}`} style={{ color: c.fg }}>{x.word} <Text style={mut}>[{x.lang} · {x.kind} · ×{x.count}]</Text></Text>, 'log')}
        <Pressable onPress={async () => { await clearLog(); reload(); }}><Text style={{ color: c.mut, marginTop: 6 }}>{t('vClear')}</Text></Pressable>
      </Section>

      {health && (
        <>
          <Section id="amb" title={t('vAmbiguous', { n: health.ambiguous.length })} count={health.ambiguous.length}>
            {pills(health.ambiguous, (x) => <Text key={x.term} style={{ color: c.fg }}>{x.display} <Text style={mut}>→ {x.names.join(' / ')}</Text></Text>, 'amb')}
          </Section>
          <Section id="many" title={t('vTooMany', { n: health.tooMany.length })} count={health.tooMany.length}>
            {pills(health.tooMany, (x) => <Text key={x.ci} style={{ color: c.fg }}>{displayName(x.ci, lang)} <Text style={mut}>→ {x.name} · {x.n}</Text></Text>, 'many')}
          </Section>
          <Section id="none" title={t('vNoDeals', { n: health.noDeals.length })} count={health.noDeals.length}>
            {pills(health.noDeals, (x) => <Text key={x.ci} style={{ color: c.fg }}>{displayName(x.ci, lang)} <Text style={mut}>→ {x.name}</Text></Text>, 'none')}
          </Section>
          <Section id="shared" title={t('vShared', { n: health.shared.length })} count={health.shared.length}>
            {pills(health.shared, (x) => <Text key={x.term} style={{ color: c.fg }}>{x.display} <Text style={mut}>→ {x.names.join(' / ')}</Text></Text>, 'shared')}
          </Section>
        </>
      )}

      <Section id="learned" title={t('vLearned', { n: learned.length })} count={learned.length}
        action={<Pressable onPress={async () => { await clearTranslations(); reload(); }}><Text style={{ color: c.mut, marginTop: 6 }}>{t('vClear')}</Text></Pressable>}>
        {pills(learned, (x) => <Text key={`${x.lang}|${x.from}`} style={{ color: c.fg }}>{x.from} <Text style={mut}>[{x.lang}] → {x.to}</Text></Text>, 'learned')}
      </Section>
    </ScrollView>
  );
}
