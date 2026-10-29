import { useContext } from 'react';
import { StyleSheet, TextInput as RNTextInput, useWindowDimensions } from 'react-native';
import { ComfortContext } from '../comfortContext.js';
import { effectiveScale } from '../textScale.js';

/** TextInput skalowany tak samo jak Text (system × opcja w aplikacji, z limitem). */
export default function TextInput({ style, ...props }) {
  const { scale } = useContext(ComfortContext);
  const { fontScale } = useWindowDimensions();
  const k = effectiveScale(fontScale, scale);
  const f = StyleSheet.flatten(style) ?? {};
  return <RNTextInput {...props} allowFontScaling={false} style={{ ...f, fontSize: (f.fontSize ?? 14) * k, ...(f.lineHeight ? { lineHeight: f.lineHeight * k } : {}) }} />;
}
