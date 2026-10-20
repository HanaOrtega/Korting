import { Alert, Modal, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Badge, Button, Card, EmptyState, IconButton } from '../components/ui.js';
import { space, type } from '../theme.js';

/** Historia listy: wpisy od najnowszego; można przywrócić całą listę albo tylko usunięte pozycje. */
export default function HistoryScreen({ visible, onClose, c, t, lang, history }) {
  const insets = useSafeAreaInsets();
  const { entries } = history;
  const when = (ms) => {
    const d = new Date(ms);
    const today = new Date().toDateString() === d.toDateString();
    const time = d.toLocaleTimeString(lang, { hour: '2-digit', minute: '2-digit' });
    return today ? time : `${d.toLocaleDateString(lang, { day: 'numeric', month: 'short' })} ${time}`;
  };
  const label = (e) => t(e.label.key, { n: e.label.n, name: e.label.name });
  const restore = (e, mode) => Alert.alert(t('hTitle'), t('hConfirm', { t: when(e.at) }), [
    { text: t('editCancel'), style: 'cancel' },
    { text: t('hRestore'), onPress: () => { history.restore(e, mode); onClose(); } },
  ]);

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: c.bg, paddingTop: insets.top }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.md, paddingHorizontal: space.lg, paddingVertical: space.md }}>
          <Text style={{ color: c.fg, ...type.title, flex: 1 }}>{t('hTitle')}</Text>
          {entries.length > 0 && <Button c={c} small variant="ghost" label={t('hClear')} onPress={() => Alert.alert(t('hClear'), t('hClearAsk'), [{ text: t('editCancel'), style: 'cancel' }, { text: t('hClear'), style: 'destructive', onPress: history.clear }])} />}
          <IconButton c={c} icon="x" label="✕" onPress={onClose} />
        </View>
        <ScrollView contentContainerStyle={{ paddingHorizontal: space.lg, paddingBottom: Math.max(insets.bottom, space.lg) + space.lg, gap: space.md }}>
          {entries.length === 0 ? <EmptyState c={c} icon="history" title={t('hEmpty')} hint={t('hEmptyHint')} /> : (
            <Text style={{ color: c.mut, ...type.small }}>{t('hHint')}</Text>
          )}
          {entries.map((e) => {
            const missing = history.missingCount(e);
            return (
              <Card key={e.id} c={c} style={{ gap: space.sm }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: space.sm }}>
                  <Text style={{ color: c.fg, ...type.strong, flex: 1 }} numberOfLines={2}>{label(e)}</Text>
                  <Badge c={c} icon="clock" label={when(e.at)} />
                </View>
                <Text style={{ color: c.mut, ...type.small }} numberOfLines={2}>
                  {t('hBefore', { n: e.items.length })}{e.items.length ? ` · ${e.items.slice(0, 4).map((i) => i.text).join(', ')}${e.items.length > 4 ? '…' : ''}` : ''}
                </Text>
                <View style={{ flexDirection: 'row', gap: space.sm, flexWrap: 'wrap' }}>
                  {missing > 0 && <Button c={c} small icon="undo" label={t('hBringBack', { n: missing })} onPress={() => restore(e, 'missing')} />}
                  <Button c={c} small variant={missing > 0 ? 'neutral' : 'primary'} icon="history" label={t('hRestoreAll')} onPress={() => restore(e, 'all')} />
                </View>
              </Card>
            );
          })}
        </ScrollView>
      </View>
    </Modal>
  );
}
