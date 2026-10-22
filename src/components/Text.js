import { useContext } from 'react';
import { StyleSheet, Text as RNText } from 'react-native';
import { ComfortContext } from '../comfortContext.js';

/** Text z globalnym skalowaniem rozmiaru czcionki (opcja „Większy tekst”). */
export default function Text({ style, ...props }) {
  const { scale } = useContext(ComfortContext);
  if (scale === 1) return <RNText style={style} {...props} />;
  const f = StyleSheet.flatten(style) ?? {};
  return <RNText {...props} style={{ ...f, fontSize: (f.fontSize ?? 14) * scale, ...(f.lineHeight ? { lineHeight: f.lineHeight * scale } : {}) }} />;
}
