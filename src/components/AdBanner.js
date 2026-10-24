import { useState } from 'react';
import { Pressable, View } from 'react-native';
import { BannerAd, BannerAdSize } from 'react-native-google-mobile-ads';
import { BANNER_ID } from '../ads.js';
import Text from './Text.js';

/** Baner adaptacyjny z podpisem „Reklama”; znika (bez pustego miejsca), gdy reklama się nie załaduje. */
export default function AdBanner({ c, t, onRemove }) {
  const [failed, setFailed] = useState(false);
  if (failed) return null;
  return (
    <View style={{ backgroundColor: c.surface, alignItems: 'center', paddingTop: 2, borderTopWidth: 1, borderTopColor: c.line }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, alignSelf: 'stretch', justifyContent: 'center' }}>
        <Text style={{ color: c.mut, fontSize: 10, fontWeight: '700', letterSpacing: 0.6, textTransform: 'uppercase' }}>{t('adLabel')}</Text>
        {onRemove ? <Pressable onPress={onRemove} hitSlop={8} accessibilityRole="button"><Text style={{ color: c.primary, fontSize: 11, fontWeight: '800' }}>{t('proRemove')}</Text></Pressable> : null}
      </View>
      <BannerAd unitId={BANNER_ID} size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER} onAdFailedToLoad={() => setFailed(true)} />
    </View>
  );
}
