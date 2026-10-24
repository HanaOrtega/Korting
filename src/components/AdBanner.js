import { useState } from 'react';
import { View } from 'react-native';
import { BannerAd, BannerAdSize } from 'react-native-google-mobile-ads';
import { BANNER_ID } from '../ads.js';
import Text from './Text.js';

/** Baner adaptacyjny z podpisem „Reklama”; znika (bez pustego miejsca), gdy reklama się nie załaduje. */
export default function AdBanner({ c, t }) {
  const [failed, setFailed] = useState(false);
  if (failed) return null;
  return (
    <View style={{ backgroundColor: c.surface, alignItems: 'center', paddingTop: 2, borderTopWidth: 1, borderTopColor: c.line }}>
      <Text style={{ color: c.mut, fontSize: 10, fontWeight: '700', letterSpacing: 0.6, textTransform: 'uppercase' }}>{t('adLabel')}</Text>
      <BannerAd unitId={BANNER_ID} size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER} onAdFailedToLoad={() => setFailed(true)} />
    </View>
  );
}
