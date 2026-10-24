import { useContext, useState } from 'react';
import { Alert, Modal, ScrollView, Switch, TextInput, View } from 'react-native';
import Text from '../components/Text.js';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button, Card, Chip, IconButton, Segmented, SectionLabel, Icon } from '../components/ui.js';
import { ComfortContext } from '../comfortContext.js';
import { ensurePermission } from '../reminders.js';
import { radius, space, type } from '../theme.js';

const pad = (n) => String(n).padStart(2, '0');

function Row({ c, title, hint, value, onChange, disabled }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.md, paddingVertical: space.sm }}>
      <View style={{ flex: 1, gap: 2 }}>
        <Text style={{ color: c.fg, ...type.strong }}>{title}</Text>
        {hint ? <Text style={{ color: c.mut, ...type.small }}>{hint}</Text> : null}
      </View>
      <Switch value={!!value} onValueChange={onChange} disabled={disabled} trackColor={{ true: c.primary }} />
    </View>
  );
}

/** „Komfort i skupienie”: dodatkowe opcje ułatwiające zakupy. Wszystko opcjonalne, domyślnie wyłączone. */
export default function ComfortScreen({ visible, onClose, c, t, lang, comfort, setComfort }) {
  const insets = useSafeAreaInsets();
  const { animated } = useContext(ComfortContext);
  const [editRoutine, setEditRoutine] = useState(false);
  const set = (patch) => setComfort({ ...comfort, ...patch });
  const dayName = (iso) => new Date(2024, 0, iso).toLocaleDateString(lang, { weekday: 'short' }); // 2024-01-01 to poniedziałek
  const routine = comfort.routineItems ?? t('cfRoutineDefault').split('|');
  const time = (hour, minute = 0) => `${pad(hour)}:${pad(minute)}`;

  const turnOn = async (key, patch) => {
    if (!(await ensurePermission())) { Alert.alert(t('cfTitle'), t('cfPermDenied')); return; }
    set({ [key]: { ...comfort[key], ...patch, on: true } });
  };
  const step = (mins) => {
    const total = (comfort.weekly.hour * 60 + comfort.weekly.minute + mins + 1440) % 1440;
    set({ weekly: { ...comfort.weekly, hour: Math.floor(total / 60), minute: total % 60 } });
  };
  const input = { borderWidth: 1, borderColor: c.border, borderRadius: radius.md, paddingHorizontal: space.md, paddingVertical: 11, color: c.fg, backgroundColor: c.bg, fontSize: 16, minHeight: 110, textAlignVertical: 'top' };

  return (
    <Modal visible={visible} animationType={animated ? 'slide' : 'none'} onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: c.bg, paddingTop: insets.top }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.md, paddingHorizontal: space.lg, paddingVertical: space.md }}>
          <Text style={{ color: c.fg, ...type.title, flex: 1 }}>{t('cfTitle')}</Text>
          <IconButton c={c} icon="x" label="✕" onPress={onClose} />
        </View>
        <ScrollView contentContainerStyle={{ paddingHorizontal: space.lg, paddingBottom: Math.max(insets.bottom, space.lg) + space.lg, gap: space.md }}>
          <Text style={{ color: c.ink2, ...type.body }}>{t('cfIntro')}</Text>

          <SectionLabel c={c}>{t('cfSecView')}</SectionLabel>
          <Card c={c} pad={space.lg}>
            <Row c={c} title={t('cfShowSearch')} hint={lang === 'nl' ? t('cfShowSearchNl') : t('cfShowSearchD')} value={lang !== 'nl' && comfort.showSearch} disabled={lang === 'nl'} onChange={(v) => set({ showSearch: v })} />
          </Card>

          <SectionLabel c={c}>{t('cfSecFocus')}</SectionLabel>
          <Card c={c} pad={space.lg}>
            <Row c={c} title={t('cfFocus')} hint={t('cfFocusD')} value={comfort.focus} onChange={(v) => set({ focus: v })} />
            <Row c={c} title={t('cfRoutine')} hint={t('cfRoutineD')} value={comfort.routine} onChange={(v) => set({ routine: v })} />
            {comfort.routine && (
              <View style={{ gap: space.sm, paddingBottom: space.sm }}>
                {editRoutine ? (
                  <>
                    <TextInput multiline defaultValue={routine.join('\n')} onChangeText={(v) => set({ routineItems: v.split('\n').map((x) => x.trim()).filter(Boolean) })} style={input} placeholderTextColor={c.mut} />
                    <Button c={c} small variant="soft" label={t('editSave')} onPress={() => setEditRoutine(false)} />
                  </>
                ) : (
                  <>
                    <Text style={{ color: c.ink2, ...type.small }}>{routine.map((x) => `• ${x}`).join('\n')}</Text>
                    <Button c={c} small variant="neutral" icon="edit" label={t('cfRoutineEdit')} onPress={() => setEditRoutine(true)} />
                  </>
                )}
              </View>
            )}
            <Row c={c} title={t('cfAisles')} hint={t('cfAislesD')} value={comfort.aisles} onChange={(v) => set({ aisles: v })} />
            <Row c={c} title={t('cfSimple')} hint={t('cfSimpleD')} value={comfort.simple} onChange={(v) => set({ simple: v })} />
          </Card>

          <SectionLabel c={c}>{t('cfSecSense')}</SectionLabel>
          <Card c={c} pad={space.lg}>
            <Row c={c} title={t('cfCalm')} hint={t('cfCalmD')} value={comfort.calm} onChange={(v) => set({ calm: v })} />
            <Row c={c} title={t('cfStill')} hint={t('cfStillD')} value={comfort.still} onChange={(v) => set({ still: v })} />
            <View style={{ gap: space.sm, paddingTop: space.sm }}>
              <Text style={{ color: c.fg, ...type.strong }}>{t('cfText')}</Text>
              <Segmented c={c} value={comfort.scale} onChange={(v) => set({ scale: v })} options={[{ id: 0, label: t('cfText0') }, { id: 1, label: t('cfText1') }, { id: 2, label: t('cfText2') }]} />
            </View>
          </Card>

          <SectionLabel c={c}>{t('cfSecRem')}</SectionLabel>
          <Card c={c} pad={space.lg} style={{ gap: space.xs }}>
            <Row c={c} title={t('cfWeekly')} hint={t('cfWeeklyD')} value={comfort.weekly.on} onChange={(v) => (v ? turnOn('weekly', {}) : set({ weekly: { ...comfort.weekly, on: false } }))} />
            {comfort.weekly.on && (
              <View style={{ gap: space.md, paddingBottom: space.sm }}>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.sm }}>
                  {[1, 2, 3, 4, 5, 6, 7].map((d) => <Chip key={d} c={c} label={dayName(d)} selected={comfort.weekly.day === d} onPress={() => set({ weekly: { ...comfort.weekly, day: d } })} />)}
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.md }}>
                  <Button c={c} small variant="neutral" label="−" onPress={() => step(-30)} />
                  <Text style={{ color: c.fg, ...type.title, minWidth: 80, textAlign: 'center' }}>{time(comfort.weekly.hour, comfort.weekly.minute)}</Text>
                  <Button c={c} small variant="neutral" label="＋" onPress={() => step(30)} />
                </View>
              </View>
            )}
            <View style={{ height: 1, backgroundColor: c.line, marginVertical: space.sm }} />
            <Row c={c} title={t('cfExpiry')} hint={t('cfExpiryD')} value={comfort.expiry.on} onChange={(v) => (v ? turnOn('expiry', {}) : set({ expiry: { ...comfort.expiry, on: false } }))} />
            {comfort.expiry.on && (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.md, paddingBottom: space.sm }}>
                <Text style={{ color: c.ink2, ...type.small, flex: 1 }}>{t('cfAt', { t: time(comfort.expiry.hour) })}</Text>
                <Button c={c} small variant="neutral" label="−" onPress={() => set({ expiry: { ...comfort.expiry, hour: (comfort.expiry.hour + 23) % 24 } })} />
                <Button c={c} small variant="neutral" label="＋" onPress={() => set({ expiry: { ...comfort.expiry, hour: (comfort.expiry.hour + 1) % 24 } })} />
              </View>
            )}
          </Card>
        </ScrollView>
      </View>
    </Modal>
  );
}
