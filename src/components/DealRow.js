import { useState } from 'react';
import { Image, Linking, Pressable, Text, View } from 'react-native';
import { ACCENT } from '../theme.js';
import { daysLeft, fmtDate, fmtPrice } from '../format.js';

const THUMB = 60;

function Thumb({ uri }) {
  const [failed, setFailed] = useState(false);
  return (
    <View style={{ width: THUMB, height: THUMB, borderRadius: 8, backgroundColor: '#fff', overflow: 'hidden', alignItems: 'center', justifyContent: 'center' }}>
      {uri && !failed
        ? <Image source={{ uri }} style={{ width: THUMB, height: THUMB }} resizeMode="contain" onError={() => setFailed(true)} />
        : <Text style={{ fontSize: 24 }}>🛒</Text>}
    </View>
  );
}

export default function DealRow({ deal, c, t, lang, onAdd }) {
  const n = deal.validUntil ? daysLeft(deal.validUntil) : null;
  const urgent = n !== null && n <= 1;
  const until = deal.validUntil
    ? `${t('until')} ${fmtDate(deal.validUntil, lang)}${urgent ? ` · ${t('lastDay')}` : ''}`
    : '';
  const note = [deal.unit, deal.price != null ? deal.promoText : '', deal.description].filter(Boolean).join(' · ');
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 8, gap: 10 }}>
      <Thumb uri={deal.image} />
      <View style={{ flex: 1 }}>
        <Pressable disabled={!deal.url} onPress={() => deal.url && Linking.openURL(deal.url)}>
          <Text style={{ color: c.fg, fontWeight: '600' }} numberOfLines={2}>{deal.name}</Text>
        </Pressable>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 }}>
          <Text style={{ backgroundColor: ACCENT, color: '#fff', fontSize: 12, paddingHorizontal: 6, borderRadius: 6, overflow: 'hidden' }}>
            {deal.store}
          </Text>
          <Text style={{ color: urgent ? c.danger : c.mut, fontSize: 13 }}>{until}</Text>
        </View>
        {note ? <Text style={{ color: c.mut, fontSize: 12 }} numberOfLines={2}>{note}</Text> : null}
      </View>
      <Text style={{ color: ACCENT, fontWeight: '700', fontSize: deal.price != null ? 18 : 14, maxWidth: 110, textAlign: 'right' }}>
        {deal.price != null ? fmtPrice(deal.price) : deal.promoText || '%'}
      </Text>
      {onAdd ? (
        <Pressable onPress={() => onAdd(deal)} hitSlop={10} accessibilityLabel="+">
          <Text style={{ color: ACCENT, fontSize: 26 }}>＋</Text>
        </Pressable>
      ) : null}
    </View>
  );
}
