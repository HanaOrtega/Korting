import { useContext, useEffect, useMemo, useState } from 'react';
import { Alert, Linking, Modal, Pressable, ScrollView, Share, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Text from '../components/Text.js';
import { Badge, Button, Card, Icon, IconButton, SectionLabel } from '../components/ui.js';
import { ComfortContext } from '../comfortContext.js';
import { buildGroups, fmtAmounts, keyOfItem, resolveRegion } from '../recipe.js';
import { factor, shareText } from '../recipes.js';
import { space, type } from '../theme.js';

/** Przepis: porcje, składniki z odhaczaniem tego, co masz w domu, „Dodaj do listy zakupów”, kroki, akcje. */
export default function RecipeDetail({ recipe, visible, onClose, c, t, lang, vocab, items, onAddToList, onEdit, onDelete, onDuplicate, onFav }) {
  const insets = useSafeAreaInsets();
  const { animated } = useContext(ComfortContext);
  const [want, setWant] = useState(4);
  const [skip, setSkip] = useState({}); // klucz składnika → „mam w domu”

  useEffect(() => { if (recipe) { setWant(recipe.servings); setSkip({}); } }, [recipe?.id, visible]);

  const { groups } = useMemo(() => (recipe
    ? buildGroups(recipe.ingredients, { lang, vocab, multiplier: factor(recipe.servings, want), region: resolveRegion('auto', recipe.ingredients) })
    : { groups: [] }), [recipe, want, lang, vocab]);
  const onList = useMemo(() => new Set(items.map((it) => keyOfItem(it, { lang, vocab }))), [items, lang, vocab]);
  if (!recipe) return null;
  const chosen = groups.filter((g) => !skip[g.key]);

  const share = () => Share.share({ message: shareText(recipe, { servings: t('rcServingsLabel'), ingredients: t('rcIngredients'), steps: t('rcSteps') }) });
  const del = () => Alert.alert(t('rcDelete'), t('rcDeleteAsk', { name: recipe.title }), [{ text: t('editCancel'), style: 'cancel' }, { text: t('rcDelete'), style: 'destructive', onPress: () => { onDelete(recipe.id); onClose(); } }]);

  return (
    <Modal visible={visible} animationType={animated ? 'slide' : 'none'} onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: c.bg, paddingTop: insets.top }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.sm, paddingHorizontal: space.lg, paddingVertical: space.md }}>
          <Text style={{ color: c.fg, ...type.title, flex: 1 }} numberOfLines={2}>{recipe.title}</Text>
          <IconButton c={c} icon="star" label={t('rcFav')} tone={recipe.fav ? 'primary' : 'neutral'} onPress={() => onFav(recipe.id, !recipe.fav)} />
          <IconButton c={c} icon="x" label="✕" onPress={onClose} />
        </View>
        <ScrollView contentContainerStyle={{ paddingHorizontal: space.lg, paddingBottom: space.xl, gap: space.md }}>
          <Card c={c} pad={space.lg} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <View>
              <Text style={{ color: c.fg, ...type.strong }}>{t('rcServingsLabel')}</Text>
              {want !== recipe.servings ? <Text style={{ color: c.mut, ...type.small }}>{t('rcOriginal', { n: recipe.servings })}</Text> : null}
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.md }}>
              <Button c={c} small variant="neutral" label="−" onPress={() => setWant((n) => Math.max(1, n - 1))} />
              <Text style={{ color: c.fg, ...type.title, minWidth: 36, textAlign: 'center' }}>{want}</Text>
              <Button c={c} small variant="neutral" label="＋" onPress={() => setWant((n) => n + 1)} />
            </View>
          </Card>

          <SectionLabel c={c}>{t('rcIngredients')} · {t('rcTapHave')}</SectionLabel>
          <Card c={c} pad={0}>
            {groups.map((g, i) => {
              const off = !!skip[g.key];
              return (
                <Pressable key={g.key} onPress={() => setSkip({ ...skip, [g.key]: !off })} accessibilityRole="checkbox" accessibilityState={{ checked: !off }}
                  style={{ flexDirection: 'row', alignItems: 'center', gap: space.md, padding: space.lg, borderTopWidth: i ? 1 : 0, borderTopColor: c.line, opacity: off ? 0.45 : 1 }}>
                  <View style={{ width: 26, height: 26, borderRadius: 13, borderWidth: 2, borderColor: off ? c.border : c.primary, backgroundColor: off ? 'transparent' : c.primary, alignItems: 'center', justifyContent: 'center' }}>
                    {!off ? <Icon name="check" size={15} color={c.primaryInk} stroke={3} /> : null}
                  </View>
                  <View style={{ flex: 1, gap: 4 }}>
                    <Text style={{ color: c.fg, ...type.strong, textDecorationLine: off ? 'line-through' : 'none' }}>
                      {g.text}{g.amounts.length ? <Text style={{ color: c.primary, fontWeight: '800' }}>  {fmtAmounts(g.amounts, t)}</Text> : g.toTaste ? <Text style={{ color: c.mut, fontWeight: '400' }}>  {t('toTaste')}</Text> : null}
                    </Text>
                    {off ? <Badge c={c} label={t('rcHave')} /> : onList.has(g.key) ? <Badge c={c} tone="success" icon="check" label={t('recipeOnList')} /> : null}
                  </View>
                </Pressable>
              );
            })}
          </Card>

          {recipe.steps ? (<><SectionLabel c={c}>{t('rcSteps')}</SectionLabel><Card c={c}><Text style={{ color: c.fg, ...type.body, lineHeight: 24 }}>{recipe.steps}</Text></Card></>) : null}
          {recipe.source ? <Button c={c} small variant="ghost" icon="arrow" label={t('rcOpenSource')} onPress={() => Linking.openURL(/^https?:/i.test(recipe.source) ? recipe.source : `https://${recipe.source}`).catch(() => {})} /> : null}

          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.sm, marginTop: space.sm }}>
            <Button c={c} small variant="neutral" icon="edit" label={t('editItem')} onPress={() => onEdit(recipe)} />
            <Button c={c} small variant="neutral" icon="copy" label={t('rcDuplicate')} onPress={() => { onDuplicate(recipe.id); onClose(); }} />
            <Button c={c} small variant="neutral" icon="send" label={t('rcShare')} onPress={share} />
            <Button c={c} small variant="ghost" label={t('rcDelete')} onPress={del} />
          </View>
        </ScrollView>
        <View style={{ padding: space.lg, paddingBottom: Math.max(insets.bottom, space.lg), backgroundColor: c.surface, borderTopWidth: 1, borderTopColor: c.line }}>
          <Button c={c} icon="cart" label={t('rcAddN', { n: chosen.length })} disabled={!chosen.length} onPress={() => onAddToList(chosen, recipe.title)} />
        </View>
      </View>
    </Modal>
  );
}
