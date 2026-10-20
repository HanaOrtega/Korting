// Wspólne klocki interfejsu: ikony, karta, przyciski, chipy, przełącznik segmentowy, znaczki, dolny pasek zakładek.
import { Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle, Path, Rect } from 'react-native-svg';
import { elevation, radius, space, storeColor, type } from '../theme.js';

const P = {
  cart: ['M3 3h2l2.4 12.2a2 2 0 0 0 2 1.6h7.7a2 2 0 0 0 2-1.5L21 8H6', ['c', 9, 20, 1.2], ['c', 18, 20, 1.2]],
  tag: ['M20.6 13.4l-7.2 7.2a2 2 0 0 1-2.8 0L3 13V3h10l7.6 7.6a2 2 0 0 1 0 2.8z', ['c', 7.5, 7.5, 1.2]],
  pin: ['M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z', ['c', 12, 10, 3]],
  book: ['M4 19.5A2.5 2.5 0 0 1 6.5 17H20', 'M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z'],
  plus: ['M12 5v14M5 12h14'],
  check: ['M5 12.5l4.5 4.5L19 7.5'],
  x: ['M6 6l12 12M18 6L6 18'],
  edit: ['M12 20h9', 'M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z'],
  nav: ['M3 11l19-9-9 19-2-8-8-2z'],
  globe: [['c', 12, 12, 10], 'M2 12h20', 'M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z'],
  search: [['c', 11, 11, 7.5], 'M21 21l-4.3-4.3'],
  clip: ['M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2', ['r', 8, 2, 8, 4]],
  star: ['M12 2.5l3.1 6.3 6.9 1-5 4.9 1.2 6.8L12 18l-6.2 3.5L7 14.7l-5-4.9 6.9-1z'],
  refresh: ['M21 12a9 9 0 1 1-3-6.7L21 8', 'M21 3v5h-5'],
  list: ['M8 6h13M8 12h13M8 18h13', ['c', 3.5, 6, 0.6], ['c', 3.5, 12, 0.6], ['c', 3.5, 18, 0.6]],
  store: ['M3 9l1.2-5h15.6L21 9', 'M3 9h18v11H3z', 'M9.5 20v-6h5v6'],
  map: ['M9 4L3 6v14l6-2 6 2 6-2V4l-6 2z', 'M9 4v14M15 6v14'],
  alert: ['M12 3l10 18H2z', 'M12 10v5M12 18.2v.1'],
  chevron: ['M6 9l6 6 6-6'],
  users: ['M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2', ['c', 9, 7, 4], 'M23 21v-2a4 4 0 0 0-3-3.87', 'M16 3.13a4 4 0 0 1 0 7.75'],
  lock: [['r', 4, 11, 16, 10], 'M8 11V7a4 4 0 0 1 8 0v4'],
  copy: [['r', 9, 9, 11, 11], 'M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1'],
  send: ['M22 2L11 13', 'M22 2l-7 20-4-9-9-4z'],
  history: ['M3 12a9 9 0 1 0 3-6.7L3 8', 'M3 3v5h5', 'M12 7v5l4 2'],
  undo: ['M9 14L4 9l5-5', 'M4 9h10a6 6 0 0 1 0 12h-3'],
  clock: [['c', 12, 12, 9], 'M12 7v5l3 2'],
};

export function Icon({ name, size = 22, color = '#000', stroke = 2, fill = 'none' }) {
  const parts = P[name] ?? [];
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round">
      {parts.map((d, i) => {
        if (typeof d === 'string') return <Path key={i} d={d} fill={name === 'star' ? fill : 'none'} />;
        if (d[0] === 'c') return <Circle key={i} cx={d[1]} cy={d[2]} r={d[3]} />;
        return <Rect key={i} x={d[1]} y={d[2]} width={d[3]} height={d[4]} rx={1} />;
      })}
    </Svg>
  );
}

const press = ({ pressed }) => ({ opacity: pressed ? 0.72 : 1, transform: [{ scale: pressed ? 0.985 : 1 }] });

export function Card({ c, style, children, pad = space.lg, level = 1 }) {
  return <View style={[{ backgroundColor: c.surface, borderRadius: radius.lg, padding: pad }, elevation(c, level), style]}>{children}</View>;
}

export function Button({ c, label, onPress, icon, variant = 'primary', disabled, small, style }) {
  const v = {
    primary: { bg: c.primary, fg: c.primaryInk },
    soft: { bg: c.primaryTint, fg: c.primaryDeep },
    neutral: { bg: c.chip, fg: c.fg },
    ghost: { bg: 'transparent', fg: c.primary },
  }[variant];
  return (
    <Pressable onPress={onPress} disabled={disabled} accessibilityRole="button" accessibilityLabel={label}
      style={(s) => [press(s), { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: v.bg,
        borderRadius: radius.md, paddingHorizontal: small ? 14 : 18, paddingVertical: small ? 9 : 14, opacity: disabled ? 0.4 : 1 }, style]}>
      {icon ? <Icon name={icon} size={small ? 17 : 20} color={v.fg} /> : null}
      {label ? <Text style={{ color: v.fg, fontSize: small ? 14 : 16, fontWeight: '700' }}>{label}</Text> : null}
    </Pressable>
  );
}

export function IconButton({ c, icon, onPress, label, tone = 'neutral', size = 40, iconSize = 20 }) {
  const bg = tone === 'primary' ? c.primary : tone === 'ghost' ? 'transparent' : c.chip;
  const fg = tone === 'primary' ? c.primaryInk : c.ink2;
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={label} hitSlop={6}
      style={(s) => [press(s), { width: size, height: size, borderRadius: size / 2, backgroundColor: bg, alignItems: 'center', justifyContent: 'center' }]}>
      <Icon name={icon} size={iconSize} color={fg} />
    </Pressable>
  );
}

export function Chip({ c, label, selected, onPress, icon }) {
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityState={{ selected: !!selected }}
      style={(s) => [press(s), { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 8, borderRadius: radius.pill,
        backgroundColor: selected ? c.primary : c.chip }]}>
      {icon ? <Icon name={icon} size={16} color={selected ? c.primaryInk : c.ink2} /> : null}
      <Text style={{ color: selected ? c.primaryInk : c.fg, fontSize: 14, fontWeight: '600' }}>{label}</Text>
    </Pressable>
  );
}

export function Segmented({ c, options, value, onChange }) {
  return (
    <View style={{ flexDirection: 'row', backgroundColor: c.chip, borderRadius: radius.md, padding: 3 }}>
      {options.map((o) => {
        const on = o.id === value;
        return (
          <Pressable key={o.id} onPress={() => onChange(o.id)} accessibilityRole="button" accessibilityState={{ selected: on }}
            style={[{ flex: 1, flexDirection: 'row', gap: 6, alignItems: 'center', justifyContent: 'center', paddingVertical: 9, borderRadius: radius.md - 3 },
              on && { backgroundColor: c.surface, ...elevation(c, 1) }]}>
            {o.icon ? <Icon name={o.icon} size={16} color={on ? c.primary : c.mut} /> : null}
            <Text style={{ color: on ? c.fg : c.mut, fontSize: 14, fontWeight: on ? '700' : '600' }}>{o.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export function Badge({ c, label, tone = 'neutral', icon }) {
  const t = {
    neutral: [c.chip, c.ink2], brand: [c.primaryTint, c.primaryDeep], success: [c.successTint, c.success], warn: [c.warnTint, c.warnFg], danger: [c.dangerTint, c.danger],
  }[tone];
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, alignSelf: 'flex-start', backgroundColor: t[0], borderRadius: radius.pill, paddingHorizontal: 9, paddingVertical: 3 }}>
      {icon ? <Icon name={icon} size={12} color={t[1]} stroke={2.4} /> : null}
      <Text style={{ color: t[1], ...type.caption }}>{label}</Text>
    </View>
  );
}

export function StoreTag({ store, size = 'md' }) {
  const s = storeColor(store);
  return (
    <View style={{ alignSelf: 'flex-start', backgroundColor: s.bg, borderRadius: 6, paddingHorizontal: size === 'sm' ? 6 : 8, paddingVertical: size === 'sm' ? 1 : 2 }}>
      <Text style={{ color: s.fg, fontSize: size === 'sm' ? 11 : 12, fontWeight: '800', letterSpacing: 0.2 }}>{s.short}</Text>
    </View>
  );
}

export function SectionLabel({ c, children, right }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: space.sm }}>
      <Text style={{ color: c.mut, ...type.overline }}>{children}</Text>
      {right}
    </View>
  );
}

export function EmptyState({ c, icon, title, hint, action }) {
  return (
    <View style={{ alignItems: 'center', paddingVertical: 48, paddingHorizontal: 24, gap: 10 }}>
      <View style={{ width: 84, height: 84, borderRadius: 42, backgroundColor: c.primaryTint, alignItems: 'center', justifyContent: 'center' }}>
        <Icon name={icon} size={38} color={c.primary} stroke={1.8} />
      </View>
      <Text style={{ color: c.fg, ...type.h2, textAlign: 'center' }}>{title}</Text>
      {hint ? <Text style={{ color: c.mut, ...type.body, textAlign: 'center', maxWidth: 320 }}>{hint}</Text> : null}
      {action}
    </View>
  );
}

const TABS = [['list', 'cart', 'tabList'], ['deals', 'tag', 'tabDeals'], ['stores', 'pin', 'tabStores'], ['vocab', 'book', 'tabVocab']];

/** Dolny pasek zakładek z ikonami; uwzględnia pasek nawigacji systemu. */
export function TabBar({ c, t, tab, setTab, badge }) {
  const insets = useSafeAreaInsets();
  return (
    <View style={{ backgroundColor: c.surface, borderTopWidth: 1, borderTopColor: c.line, paddingBottom: Math.max(insets.bottom, 8), paddingTop: 6, flexDirection: 'row', ...elevation(c, 2) }}>
      {TABS.map(([id, icon, key]) => {
        const on = tab === id;
        return (
          <Pressable key={id} onPress={() => setTab(id)} accessibilityRole="tab" accessibilityState={{ selected: on }} style={{ flex: 1, alignItems: 'center', gap: 2, paddingVertical: 4 }}>
            <View style={{ width: 56, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center', backgroundColor: on ? c.primaryTint : 'transparent' }}>
              <Icon name={icon} size={22} color={on ? c.primary : c.mut} stroke={on ? 2.2 : 1.9} />
              {badge?.[id] ? (
                <View style={{ position: 'absolute', top: 0, right: 6, minWidth: 16, height: 16, borderRadius: 8, backgroundColor: c.primary, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 3 }}>
                  <Text style={{ color: c.primaryInk, fontSize: 10, fontWeight: '800' }}>{badge[id]}</Text>
                </View>
              ) : null}
            </View>
            <Text numberOfLines={1} style={{ color: on ? c.primary : c.mut, fontSize: 11.5, fontWeight: on ? '800' : '600' }}>{t(key)}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}
