import { useContext, useEffect, useMemo, useState } from 'react';
import { Modal, ScrollView, View } from 'react-native';
import TextInput from '../components/TextInput.js';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Text from '../components/Text.js';
import { Badge, Button, Card, IconButton, SectionLabel } from '../components/ui.js';
import { ComfortContext } from '../comfortContext.js';
import { buildGroups, resolveRegion } from '../recipe.js';
import { DEFAULT_SERVINGS, guessTitle } from '../recipes.js';
import { radius, space, type } from '../theme.js';

/** Dodawanie i edycja przepisu. `recipe` = edycja, `prefill` = nowy z gotowym tekstem składników. */
export default function RecipeEditor({ visible, onClose, c, t, lang, vocab, recipe, prefill, onSave }) {
  const insets = useSafeAreaInsets();
  const { animated } = useContext(ComfortContext);
  const [title, setTitle] = useState('');
  const [servings, setServings] = useState(DEFAULT_SERVINGS);
  const [ingredients, setIngredients] = useState('');
  const [steps, setSteps] = useState('');
  const [source, setSource] = useState('');

  useEffect(() => {
    if (!visible) return;
    const r = recipe ?? { title: '', servings: DEFAULT_SERVINGS, ingredients: prefill ?? '', steps: '', source: '' };
    let ing = r.ingredients; let ttl = r.title;
    if (!recipe && prefill) { const g = guessTitle(prefill); if (g) { ttl = g; ing = prefill.split(/\r?\n/).slice(prefill.split(/\r?\n/).findIndex((l) => l.trim()) + 1).join('\n').trim(); } }
    setTitle(ttl); setServings(r.servings); setIngredients(ing); setSteps(r.steps); setSource(r.source);
  }, [visible, recipe, prefill]);

  const found = useMemo(() => buildGroups(ingredients, { lang, vocab, region: resolveRegion('auto', ingredients) }), [ingredients, lang, vocab]);
  const onIngredients = (v) => {
    // wklejony cały przepis z tytułem w pierwszej linii: tytuł trafia do pola tytułu
    if (!title.trim() && !ingredients && /\n/.test(v)) {
      const g = guessTitle(v);
      if (g) { setTitle(g); setIngredients(v.split(/\r?\n/).slice(v.split(/\r?\n/).findIndex((l) => l.trim()) + 1).join('\n').trim()); return; }
    }
    setIngredients(v);
  };
  const canSave = title.trim() && ingredients.trim();
  const input = { borderWidth: 1, borderColor: c.border, borderRadius: radius.md, paddingHorizontal: space.md, paddingVertical: 11, color: c.fg, backgroundColor: c.bg, fontSize: 16 };

  return (
    <Modal visible={visible} animationType={animated ? 'slide' : 'none'} onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: c.bg, paddingTop: insets.top }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.md, paddingHorizontal: space.lg, paddingVertical: space.md }}>
          <Text style={{ color: c.fg, ...type.title, flex: 1 }}>{recipe ? t('rcEditTitle') : t('rcNew')}</Text>
          <IconButton c={c} icon="x" label="✕" onPress={onClose} />
        </View>
        <ScrollView contentContainerStyle={{ paddingHorizontal: space.lg, paddingBottom: space.xl, gap: space.md }} keyboardShouldPersistTaps="handled">
          <TextInput value={title} onChangeText={setTitle} placeholder={t('rcTitlePh')} placeholderTextColor={c.mut} style={[input, { fontSize: 18, fontWeight: '700' }]} />
          <Card c={c} pad={space.lg} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <Text style={{ color: c.fg, ...type.strong }}>{t('rcServingsLabel')}</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.md }}>
              <Button c={c} small variant="neutral" label="−" onPress={() => setServings((n) => Math.max(1, n - 1))} />
              <Text style={{ color: c.fg, ...type.title, minWidth: 36, textAlign: 'center' }}>{servings}</Text>
              <Button c={c} small variant="neutral" label="＋" onPress={() => setServings((n) => n + 1)} />
            </View>
          </Card>
          <SectionLabel c={c}>{t('rcIngredients')}</SectionLabel>
          <TextInput value={ingredients} onChangeText={onIngredients} multiline placeholder={t('recipePh')} placeholderTextColor={c.mut} autoCorrect={false}
            style={[input, { minHeight: 150, textAlignVertical: 'top' }]} />
          {found.groups.length > 0 && <Badge c={c} tone="success" icon="check" label={t('rcRecognized', { n: found.groups.length })} />}
          <SectionLabel c={c}>{t('rcSteps')}</SectionLabel>
          <TextInput value={steps} onChangeText={setSteps} multiline placeholder={t('rcStepsPh')} placeholderTextColor={c.mut} style={[input, { minHeight: 110, textAlignVertical: 'top' }]} />
          <TextInput value={source} onChangeText={setSource} autoCapitalize="none" autoCorrect={false} keyboardType="url" placeholder={t('rcSourcePh')} placeholderTextColor={c.mut} style={input} />
        </ScrollView>
        <View style={{ padding: space.lg, paddingBottom: Math.max(insets.bottom, space.lg), backgroundColor: c.surface, borderTopWidth: 1, borderTopColor: c.line }}>
          <Button c={c} icon="check" label={t('rcSave')} disabled={!canSave} onPress={() => { onSave({ title, servings, ingredients, steps, source }); onClose(); }} />
        </View>
      </View>
    </Modal>
  );
}
