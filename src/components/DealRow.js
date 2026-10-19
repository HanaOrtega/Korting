import { useState } from 'react';
import { Image, Linking, Pressable, Text, View } from 'react-native';
import { fmtUnit, saving, unitPrice } from '../pricing.js';
import { UA } from '../providers/util.js';
import { radius, space, type } from '../theme.js';
import { daysLeft, fmtDate, fmtPrice } from '../format.js';
import { Badge, Icon, IconButton, StoreTag } from './ui.js';

const THUMB = 72;

// Jumbo (Akamai) odrzuca żądania z domyślnym User-Agentem okhttp, którego używa Image w React Native.
function Thumb({ uri, c }) {
  const [failed, setFailed] = useState(false);
  return (
    <View style={{ width: THUMB, height: THUMB, borderRadius: radius.md, backgroundColor: '#fff', overflow: 'hidden', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: c.line }}>
      {uri && !failed
        ? <Image source={{ uri, headers: { 'User-Agent': UA } }} style={{ width: THUMB - 8, height: THUMB - 8 }} resizeMode="contain" onError={() => setFailed(true)} />
        : <Icon name="tag" size={26} color="#c9c3b8" stroke={1.6} />}
    </View>
  );
}

/** Jedna promocja: miniatura, nazwa, sieć, ważność z lewej; cena, stara cena i oszczędność z prawej. */
export default function DealRow({ deal, c, t, lang, onAdd, best = false, compact = false }) {
  const save = saving(deal);
  const unit = unitPrice(deal);
  const n = deal.validUntil ? daysLeft(deal.validUntil) : null;
  const urgent = n !== null && n <= 1;
  const until = deal.validUntil ? `${t('until')} ${fmtDate(deal.validUntil, lang)}` : '';
  const note = [deal.unit, deal.price != null ? deal.promoText : '', deal.description].filter(Boolean).join(' · ');
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: space.md, gap: space.md }}>
      <Thumb uri={deal.image} c={c} />
      <View style={{ flex: 1, gap: 4 }}>
        <Pressable disabled={!deal.url} onPress={() => deal.url && Linking.openURL(deal.url)}>
          <Text style={{ color: c.fg, fontSize: 15, fontWeight: '700', lineHeight: 20 }} numberOfLines={2}>{deal.name}</Text>
        </Pressable>
        <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 6 }}>
          <StoreTag store={deal.store} />
          {until ? <Badge c={c} tone={urgent ? 'danger' : 'neutral'} icon="clock" label={urgent ? t('lastDay') : until} /> : null}
        </View>
        {!compact && note ? <Text style={{ color: c.mut, ...type.small }} numberOfLines={2}>{note}</Text> : null}
        {unit ? <Text style={{ color: c.mut, ...type.small }}>{fmtUnit(unit)}</Text> : null}
        {best ? <Badge c={c} tone="brand" icon="star" label={t('bestUnit')} /> : null}
      </View>
      <View style={{ alignItems: 'flex-end', gap: 4, maxWidth: 110 }}>
        <Text style={{ color: c.fg, fontSize: deal.price != null ? 20 : 14, fontWeight: '800', letterSpacing: -0.4, textAlign: 'right' }}>
          {deal.price != null ? fmtPrice(deal.price) : deal.promoText || '%'}
        </Text>
        {deal.oldPrice != null && save ? <Text style={{ color: c.mut, fontSize: 12, textDecorationLine: 'line-through' }}>{fmtPrice(deal.oldPrice)}</Text> : null}
        {save ? <Badge c={c} tone="success" label={`−${save.pct}%`} /> : null}
        {onAdd ? <IconButton c={c} icon="plus" tone="primary" size={34} iconSize={18} label="+" onPress={() => onAdd(deal)} /> : null}
      </View>
    </View>
  );
}
