import { ActivityIndicator, Image, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Text from './Text.js';
import { Button } from './ui.js';
import { space, type } from '../theme.js';

/** Ekran, gdy brak zgody na reklamy: wybór „Zaakceptuj” albo „Usuń reklamy” (jednorazowa płatność). */
export default function ConsentGate({ c, t, loading, status, pro, ads, onBuy }) {
  const insets = useSafeAreaInsets();
  if (loading) {
    return <View style={{ flex: 1, backgroundColor: c.bg, alignItems: 'center', justifyContent: 'center' }}><ActivityIndicator color={c.primary} /></View>;
  }
  return (
    <View style={{ flex: 1, backgroundColor: c.bg, paddingTop: insets.top, paddingBottom: Math.max(insets.bottom, space.lg) }}>
      <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: space.xl, gap: space.lg }}>
        <Image source={require('../../assets/logo-circle.png')} style={{ width: 84, height: 84, alignSelf: 'center' }} accessibilityLabel="Kortinglijst" />
        <Text style={{ color: c.fg, ...type.title, textAlign: 'center' }}>{t('gateTitle')}</Text>
        <Text style={{ color: c.ink2, ...type.body, textAlign: 'center' }}>{status === 'error' ? t('gateOffline') : t('gateBody')}</Text>
        {status === 'error'
          ? <Button c={c} icon="refresh" label={t('gateRetry')} onPress={ads.retry} />
          : <Button c={c} icon="check" label={t('gateAccept')} onPress={ads.reopen} />}
        <Button c={c} variant="soft" icon="star" label={pro.price ? t('proBuy', { price: pro.price }) : t('proRemove')} onPress={onBuy} />
        <Button c={c} variant="ghost" label={t('proRestore')} onPress={pro.restore} />
      </ScrollView>
    </View>
  );
}
