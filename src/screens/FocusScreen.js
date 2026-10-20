import { useContext, useMemo, useState } from 'react';
import { Modal, ScrollView, View } from 'react-native';
import Text from '../components/Text.js';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import DealRow from '../components/DealRow.js';
import { Badge, Button, Card, Icon, IconButton, StoreTag } from '../components/ui.js';
import { aisleOf, groupByAisle } from '../aisles.js';
import { ComfortContext } from '../comfortContext.js';
import { fmtAmounts } from '../recipe.js';
import { radius, space, type } from '../theme.js';

/** Tryb zakupów: jeden produkt naraz, duży przycisk „Kupione”, widoczny postęp. Najpierw wybór sklepu i krótka lista „przed wyjściem”. */
export default function FocusScreen({ visible, onClose, c, t, lang, lang2, rows, plan, comfort, onToggleDone }) {
  const insets = useSafeAreaInsets();
  const { animated } = useContext(ComfortContext);
  const [step, setStep] = useState('store'); // store | routine | items
  const [store, setStore] = useState(null); // nazwa sieci albo '*' (gdziekolwiek)
  const [later, setLater] = useState([]); // id odłożonych na koniec
  const [ticked, setTicked] = useState({});

  const byId = useMemo(() => new Map(rows.map((r) => [r.item.id, r])), [rows]);
  const dealFor = useMemo(() => {
    const m = new Map();
    for (const g of plan.groups) for (const e of g.entries) m.set(`${g.store}|${e.item.id}`, e.deal);
    return m;
  }, [plan]);

  const queueIds = useMemo(() => {
    let ids;
    if (store && store !== '*') {
      const g = plan.groups.find((x) => x.store === store);
      ids = [...(g?.entries ?? []).map((e) => e.item.id), ...plan.none.map((i) => i.id)];
    } else ids = rows.map((r) => r.item.id);
    let list = ids.map((id) => byId.get(id)).filter(Boolean);
    if (comfort.aisles) list = groupByAisle(list, (r) => r.r.ci).flatMap((g) => g.entries);
    const base = list.map((r) => r.item.id);
    return [...base.filter((id) => !later.includes(id)), ...later.filter((id) => base.includes(id))];
  }, [store, plan, rows, byId, later, comfort.aisles]);

  const open = queueIds.map((id) => byId.get(id)).filter((r) => r && !r.item.done);
  const total = queueIds.filter((id) => byId.get(id)).length;
  const doneCount = total - open.length;
  const cur = open[0];
  const routine = comfort.routineItems ?? t('cfRoutineDefault').split('|');

  const reset = () => { setStep('store'); setStore(null); setLater([]); setTicked({}); };
  const close = () => { reset(); onClose(); };
  const start = (s) => { setStore(s); setStep(comfort.routine && routine.length ? 'routine' : 'items'); };

  const big = { color: c.fg, ...type.display, fontSize: 34, lineHeight: 40 };
  const header = (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.md, paddingHorizontal: space.lg, paddingVertical: space.md }}>
      <Text style={{ color: c.fg, ...type.title, flex: 1 }}>{t('cfStart')}</Text>
      <IconButton c={c} icon="x" label={t('cfClose')} onPress={close} />
    </View>
  );

  let body;
  if (step === 'store') {
    body = (
      <View style={{ gap: space.md }}>
        <Text style={{ color: c.ink2, ...type.body }}>{t('cfPickStore')}</Text>
        {plan.groups.map((g) => (
          <Button key={g.store} c={c} variant="neutral" label={`${g.store} · ${t('products', { n: g.entries.length + plan.none.length })}`} onPress={() => start(g.store)} />
        ))}
        <Button c={c} variant={plan.groups.length ? 'ghost' : 'primary'} label={`${t('cfAnywhere')} · ${t('products', { n: rows.filter((r) => !r.item.done).length })}`} onPress={() => start('*')} />
      </View>
    );
  } else if (step === 'routine') {
    body = (
      <View style={{ gap: space.md }}>
        <Text style={{ color: c.fg, ...type.h2 }}>{t('cfRoutineTitle')}</Text>
        <Card c={c} pad={0}>
          {routine.map((r, i) => (
            <View key={r + i} style={{ flexDirection: 'row', alignItems: 'center', gap: space.md, padding: space.lg, borderTopWidth: i ? 1 : 0, borderTopColor: c.line }}>
              <Button c={c} variant={ticked[r] ? 'primary' : 'neutral'} small icon={ticked[r] ? 'check' : undefined} label={ticked[r] ? '' : ' '} onPress={() => setTicked({ ...ticked, [r]: !ticked[r] })} style={{ width: 44, paddingHorizontal: 0 }} />
              <Text style={{ color: c.fg, ...type.strong, flex: 1, textDecorationLine: ticked[r] ? 'line-through' : 'none' }}>{r}</Text>
            </View>
          ))}
        </Card>
        <Button c={c} icon="arrow" label={t('cfRoutineGo')} onPress={() => setStep('items')} />
      </View>
    );
  } else if (!total) {
    body = <Text style={{ color: c.mut, ...type.body }}>{t('cfNothing')}</Text>;
  } else if (!cur) {
    body = (
      <View style={{ alignItems: 'center', gap: space.lg, paddingVertical: space.xxl }}>
        <View style={{ width: 84, height: 84, borderRadius: 42, backgroundColor: c.successTint, alignItems: 'center', justifyContent: 'center' }}><Icon name="check" size={42} color={c.success} stroke={2.6} /></View>
        <Text style={{ color: c.fg, ...type.h2, textAlign: 'center' }}>{t('cfAllDone')}</Text>
        <Button c={c} label={t('cfFinish')} onPress={close} style={{ alignSelf: 'stretch' }} />
      </View>
    );
  } else {
    const deal = store && store !== '*' ? dealFor.get(`${store}|${cur.item.id}`) : cur.hits?.[0];
    body = (
      <View style={{ gap: space.lg }}>
        <View style={{ gap: 8 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text style={{ color: c.mut, ...type.small }}>{t('cfStepOf', { a: doneCount + 1, b: total })}</Text>
            <Text style={{ color: c.mut, ...type.small }}>{t('cfLeft', { n: open.length })}</Text>
          </View>
          <View style={{ height: 10, borderRadius: 5, backgroundColor: c.chip, overflow: 'hidden' }}>
            <View style={{ width: `${Math.round((doneCount / total) * 100)}%`, height: 10, backgroundColor: c.primary }} />
          </View>
        </View>
        <Card c={c} level={2} pad={space.xl} style={{ gap: space.md }}>
          <Text style={big}>{cur.item.text}</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {cur.item.amounts?.length ? <Badge c={c} tone="brand" label={fmtAmounts(cur.item.amounts, t)} /> : null}
            {comfort.aisles ? <Badge c={c} label={t(`aisle_${aisleOf(cur.r.ci)}`)} /> : null}
          </View>
          {deal ? (
            <View style={{ borderTopWidth: 1, borderTopColor: c.line }}>
              <Text style={{ color: c.mut, ...type.overline, marginTop: space.md }}>{t('cfBestHere')}</Text>
              <DealRow deal={deal} c={c} t={t} lang={lang} compact />
            </View>
          ) : null}
        </Card>
        <Button c={c} icon="check" label={t('cfBought')} onPress={() => onToggleDone(cur.item.id)} style={{ paddingVertical: 20 }} />
        {open.length > 1 && <Button c={c} variant="neutral" label={t('cfLater')} onPress={() => setLater([...later.filter((x) => x !== cur.item.id), cur.item.id])} />}
        {open[1] ? <Text style={{ color: c.mut, ...type.small, textAlign: 'center' }}>{t('cfNext', { name: open[1].item.text })}</Text> : null}
      </View>
    );
  }

  return (
    <Modal visible={visible} animationType={animated ? 'slide' : 'none'} onRequestClose={close}>
      <View style={{ flex: 1, backgroundColor: c.bg, paddingTop: insets.top }}>
        {header}
        <ScrollView contentContainerStyle={{ paddingHorizontal: space.lg, paddingBottom: Math.max(insets.bottom, space.lg) + space.lg }}>{body}</ScrollView>
      </View>
    </Modal>
  );
}
