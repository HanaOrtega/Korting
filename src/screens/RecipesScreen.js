import { useMemo, useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import TextInput from '../components/TextInput.js';
import Text from '../components/Text.js';
import { Badge, Button, Card, Chip, EmptyState, Icon, IconButton } from '../components/ui.js';
import { filterRecipes } from '../recipes.js';
import { radius, space, type } from '../theme.js';

const count = (text) => String(text).split(/\r?\n/).filter((l) => l.trim()).length;

/** Zakładka „Przepisy”: książka z wyszukiwaniem i ulubionymi; dotknięcie otwiera przepis. */
export default function RecipesScreen({ c, t, recipes, onOpen, onNew, onFav, undo }) {
  const [q, setQ] = useState('');
  const [favOnly, setFavOnly] = useState(false);
  const list = useMemo(() => filterRecipes(recipes, q, favOnly), [recipes, q, favOnly]);

  return (
    <ScrollView contentContainerStyle={{ paddingHorizontal: space.lg, paddingBottom: 32, gap: space.md }} keyboardShouldPersistTaps="handled">
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <Text style={{ color: c.fg, ...type.title }}>{t('tabRecipes')}</Text>
        <Button c={c} small icon="plus" label={t('rcNew')} onPress={onNew} />
      </View>

      {undo && (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.md, backgroundColor: c.surfaceAlt, borderRadius: radius.md, padding: space.md }}>
          <Text style={{ flex: 1, color: c.ink2, ...type.small }}>{t('rcDeleted')}</Text>
          <Button c={c} small variant="soft" icon="undo" label={t('hUndo')} onPress={undo} />
        </View>
      )}

      {recipes.length > 0 && (
        <>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: c.surface, borderRadius: radius.md, paddingLeft: space.md, borderWidth: 1, borderColor: c.border }}>
            <View style={{ flexShrink: 0 }}><Icon name="search" size={18} color={c.mut} /></View>
            <TextInput value={q} onChangeText={setQ} placeholder={t('rcSearch')} placeholderTextColor={c.mut} autoCorrect={false}
              style={{ flex: 1, minWidth: 0, paddingVertical: 12, paddingRight: space.md, color: c.fg, fontSize: 16 }} />
          </View>
          <View style={{ flexDirection: 'row', gap: space.sm }}>
            <Chip c={c} label={t('rcAll')} selected={!favOnly} onPress={() => setFavOnly(false)} />
            <Chip c={c} icon="star" label={t('rcFavs')} selected={favOnly} onPress={() => setFavOnly(true)} />
          </View>
        </>
      )}

      {recipes.length === 0 && (
        <EmptyState c={c} icon="book" title={t('rcEmpty')} hint={t('rcEmptyHint')} action={<Button c={c} icon="plus" label={t('rcNew')} onPress={onNew} style={{ marginTop: space.sm }} />} />
      )}
      {recipes.length > 0 && list.length === 0 && <Text style={{ color: c.mut, textAlign: 'center', paddingVertical: space.xl }}>{t('noResults')}</Text>}

      {list.map((r) => (
        <Pressable key={r.id} onPress={() => onOpen(r)} accessibilityRole="button" style={({ pressed }) => ({ opacity: pressed ? 0.8 : 1 })}>
          <Card c={c} style={{ gap: space.sm }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.md }}>
              <Text style={{ color: c.fg, ...type.h2, flex: 1 }} numberOfLines={2}>{r.title}</Text>
              <IconButton c={c} icon="star" tone={r.fav ? 'primary' : 'ghost'} size={36} iconSize={18} label={t('rcFav')} onPress={() => onFav(r.id, !r.fav)} />
            </View>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
              <Badge c={c} icon="users" label={t('rcServings', { n: r.servings })} />
              <Badge c={c} label={t('rcPreview', { n: count(r.ingredients) })} />
            </View>
            <Text style={{ color: c.mut, ...type.small }} numberOfLines={2}>{r.ingredients.split(/\r?\n/).filter(Boolean).slice(0, 4).join(' · ')}</Text>
          </Card>
        </Pressable>
      ))}
    </ScrollView>
  );
}
