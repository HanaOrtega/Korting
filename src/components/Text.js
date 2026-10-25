import { createContext, useContext } from 'react';
import { StyleSheet, Text as RNText, useWindowDimensions } from 'react-native';
import { ComfortContext } from '../comfortContext.js';
import { effectiveScale } from '../textScale.js';

const Nested = createContext(false);

/** Text ze spójnym skalowaniem: czcionka systemowa × opcja „Rozmiar tekstu”, z limitem (patrz textScale.js). */
export default function Text({ style, children, fixed = false, ...props }) {
  const { scale } = useContext(ComfortContext);
  const nested = useContext(Nested);
  const { fontScale } = useWindowDimensions();
  const k = fixed ? 1 : effectiveScale(fontScale, scale); // fixed: logo/nagłówek nie rosną razem z tekstem
  const f = StyleSheet.flatten(style) ?? {};
  const size = f.fontSize ?? (nested ? undefined : 14); // zagnieżdżony Text bez rozmiaru dziedziczy po rodzicu
  const out = { ...f, ...(size != null ? { fontSize: size * k } : {}), ...(f.lineHeight ? { lineHeight: f.lineHeight * k } : {}) };
  return (
    <Nested.Provider value>
      <RNText {...props} allowFontScaling={false} style={out}>{children}</RNText>
    </Nested.Provider>
  );
}
