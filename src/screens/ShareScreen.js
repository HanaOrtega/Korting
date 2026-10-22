import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Modal, Pressable, ScrollView, Share, Switch, TextInput, View } from 'react-native';
import Text from '../components/Text.js';
import { useContext } from 'react';
import { ComfortContext } from '../comfortContext.js';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Badge, Button, Card, Icon, IconButton, SectionLabel } from '../components/ui.js';
import { decodeInvite } from '../share/invite.js';
import { radius, space, type } from '../theme.js';

const initials = (p) => (p.displayName || p.emailAddress || '?').trim().slice(0, 1).toUpperCase();

/** Okno „Wspólna lista”: tworzenie grupy, dołączanie z kodu, członkowie, zaproszenia, status synchronizacji. */
export default function ShareScreen({ visible, onClose, c, t, share, pendingInvite, lang }) {
  const insets = useSafeAreaInsets();
  const { animated } = useContext(ComfortContext);
  const { group, status, error, lastSync, members, actions } = share;
  const [mode, setMode] = useState('menu'); // menu | create | join
  const [name, setName] = useState('');
  const [clientId, setClientId] = useState('');
  const [code, setCode] = useState('');
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);
  const [shownCode, setShownCode] = useState('');
  const [msg, setMsg] = useState('');
  const [advanced, setAdvanced] = useState(false);

  useEffect(() => { if (visible && pendingInvite) { setMode('join'); setCode(pendingInvite); } }, [visible, pendingInvite]);
  useEffect(() => { if (visible && group) actions.loadMembers(); }, [visible, group?.fileId]);
  useEffect(() => { if (visible) setMsg(''); }, [visible]);

  const errText = (e) => t(`shErr_${e?.code ?? 'UNKNOWN'}`) === `shErr_${e?.code ?? 'UNKNOWN'}` ? `${t('shErr_UNKNOWN')} (${e?.message ?? ''})` : t(`shErr_${e.code}`);
  const run = async (fn) => { setBusy(true); setMsg(''); try { return await fn(); } catch (e) { if (e?.code !== 'CANCELLED') setMsg(errText(e)); } finally { setBusy(false); } };
  const fmtTime = (ms) => new Date(ms).toLocaleTimeString(lang, { hour: '2-digit', minute: '2-digit' });
  const input = { borderWidth: 1, borderColor: c.border, borderRadius: radius.md, paddingHorizontal: space.md, paddingVertical: 11, color: c.fg, backgroundColor: c.bg, fontSize: 16 };

  const statusInfo = {
    syncing: ['clock', 'warn', t('shSyncing')], ok: ['check', 'success', t('shStatusOk', { t: lastSync ? fmtTime(lastSync) : '' })],
    idle: ['clock', 'neutral', t('shSyncing')], offline: ['alert', 'warn', t('shOffline')],
    auth: ['alert', 'danger', t('shAuth')], error: ['alert', 'danger', t(`shErr_${error ?? 'UNKNOWN'}`)],
  }[status] ?? ['clock', 'neutral', ''];

  const sendInvite = () => run(async () => {
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) { setMsg(t('shErr_BAD_EMAIL')); return; }
    const codeText = await actions.invite(email, t('shMailMsg', { name: group.name }));
    setShownCode(codeText); setEmail('');
    await Share.share({ message: t('shShareMsg', { name: group.name, code: codeText }) });
    actions.loadMembers();
  });

  const confirm = (title, body, ok, fn) => Alert.alert(title, body, [{ text: t('editCancel'), style: 'cancel' }, { text: ok, style: 'destructive', onPress: () => run(fn) }]);

  const body = !group ? (
    <>
      <Card c={c} style={{ gap: space.sm }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.md }}>
          <View style={{ width: 44, height: 44, borderRadius: 14, backgroundColor: c.primaryTint, alignItems: 'center', justifyContent: 'center' }}><Icon name="lock" size={22} color={c.primary} /></View>
          <Text style={{ color: c.fg, ...type.h2, flex: 1 }}>{t('shSecTitle')}</Text>
        </View>
        <Text style={{ color: c.ink2, ...type.body }}>{t('shIntro')}</Text>
      </Card>

      {mode === 'menu' && (
        <View style={{ gap: space.md }}>
          <Button c={c} icon="plus" label={t('shCreate')} onPress={() => setMode('create')} />
          <Text style={{ color: c.mut, ...type.small, marginTop: -6 }}>{t('shCreateHint')}</Text>
          <Button c={c} variant="soft" icon="users" label={t('shJoin')} onPress={() => setMode('join')} />
          <Text style={{ color: c.mut, ...type.small, marginTop: -6 }}>{t('shJoinHint')}</Text>
        </View>
      )}

      {mode === 'create' && (
        <Card c={c} style={{ gap: space.md }}>
          <TextInput value={name} onChangeText={setName} placeholder={t('shGroupName')} placeholderTextColor={c.mut} style={input} />
          {(!actions.hasBuiltInClient || advanced) && (
            <>
              <TextInput value={clientId} onChangeText={setClientId} autoCapitalize="none" autoCorrect={false} placeholder="Client ID: ….apps.googleusercontent.com" placeholderTextColor={c.mut} style={input} />
              <Text style={{ color: c.mut, ...type.small }}>{actions.hasBuiltInClient ? '' : `${t('shNoClient')} `}{t('shClientHelp')}</Text>
            </>
          )}
          <Button c={c} icon="lock" label={t('shSignGoogle')} disabled={busy || !name.trim() || (!actions.hasBuiltInClient && !/\.apps\.googleusercontent\.com$/.test(clientId.trim()))}
            onPress={() => run(async () => { await actions.create({ name: name.trim(), clientId }); setMode('menu'); })} />
          <Text style={{ color: c.mut, ...type.small }}>{t('shCreateStep')}</Text>
          {actions.hasBuiltInClient && !advanced && <Pressable onPress={() => setAdvanced(true)}><Text style={{ color: c.mut, ...type.small, textDecorationLine: 'underline' }}>{t('shAdvanced')}</Text></Pressable>}
          <Button c={c} variant="ghost" label={t('editCancel')} onPress={() => setMode('menu')} />
        </Card>
      )}

      {mode === 'join' && (
        <Card c={c} style={{ gap: space.md }}>
          <TextInput value={code} onChangeText={setCode} multiline autoCapitalize="none" autoCorrect={false} placeholder={t('shCodePh')} placeholderTextColor={c.mut} style={[input, { minHeight: 90, textAlignVertical: 'top' }]} />
          {code && decodeInvite(code) ? <Badge c={c} tone="success" icon="check" label={decodeInvite(code).name || t('shTitle')} /> : null}
          <Text style={{ color: c.mut, ...type.small }}>{t('shJoinMerge')}</Text>
          <Button c={c} icon="lock" label={t('shJoinSign')} disabled={busy || !decodeInvite(code)}
            onPress={() => run(async () => { await actions.join(code); setMode('menu'); setCode(''); })} />
          <Button c={c} variant="ghost" label={t('editCancel')} onPress={() => setMode('menu')} />
        </Card>
      )}
    </>
  ) : (
    <>
      <Card c={c} level={2} style={{ gap: space.md }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.md }}>
          <View style={{ width: 44, height: 44, borderRadius: 14, backgroundColor: c.primaryTint, alignItems: 'center', justifyContent: 'center' }}><Icon name="users" size={22} color={c.primary} /></View>
          <View style={{ flex: 1 }}>
            <Text style={{ color: c.fg, ...type.h2 }}>{group.name || t('shTitle')}</Text>
            <Text style={{ color: c.mut, ...type.small }}>{group.me?.email}</Text>
          </View>
          <Badge c={c} tone={group.role === 'owner' ? 'brand' : 'neutral'} label={group.role === 'owner' ? t('shOwner') : t('shMember')} />
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.sm, flexWrap: 'wrap' }}>
          <Badge c={c} tone={statusInfo[1]} icon={statusInfo[0]} label={statusInfo[2]} />
          {status === 'syncing' && <ActivityIndicator size="small" color={c.primary} />}
        </View>
        {status === 'auth' ? <Button c={c} label={t('shReauth')} onPress={() => run(actions.reauth)} />
          : <Button c={c} small variant="soft" icon="refresh" label={t('shSyncNow')} onPress={actions.syncNow} />}
      </Card>

      <SectionLabel c={c}>{t('shMembers')}</SectionLabel>
      <Card c={c} pad={0}>
        {(members ?? []).length === 0 ? <Text style={{ color: c.mut, padding: space.lg }}>{members ? t('shNoMembers') : '…'}</Text> : members.map((p, i) => {
          const me = p.emailAddress && p.emailAddress === group.me?.email;
          return (
            <View key={p.id} style={{ flexDirection: 'row', alignItems: 'center', gap: space.md, padding: space.md, borderTopWidth: i ? 1 : 0, borderTopColor: c.line }}>
              <View style={{ width: 38, height: 38, borderRadius: 19, backgroundColor: c.primaryTint, alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ color: c.primaryDeep, fontWeight: '800' }}>{initials(p)}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ color: c.fg, ...type.strong }} numberOfLines={1}>{p.displayName || p.emailAddress}{me ? ` (${t('shYou')})` : ''}</Text>
                <Text style={{ color: c.mut, ...type.small }} numberOfLines={1}>{p.emailAddress}</Text>
              </View>
              {p.role === 'owner' ? <Badge c={c} tone="brand" label={t('shOwner')} /> : group.role === 'owner' && !me ? (
                <IconButton c={c} icon="x" tone="ghost" size={34} iconSize={18} label={t('shRemove')}
                  onPress={() => confirm(t('shRemove'), t('shRemoveAsk', { n: p.displayName || p.emailAddress }), t('shRemove'), () => actions.removeMember(p.id))} />
              ) : null}
            </View>
          );
        })}
      </Card>

      <SectionLabel c={c}>{t('shInvite')}</SectionLabel>
      <Card c={c} style={{ gap: space.md }}>
        {group.open && <Button c={c} icon="send" label={t('shSendInvite')} disabled={busy} onPress={() => run(async () => {
          const codeText = await actions.invite('', t('shMailMsg', { name: group.name }));
          await Share.share({ message: t('shShareMsg', { name: group.name, code: codeText }) });
        })} />}
        {!group.open && (
          <>
            <TextInput value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" autoCorrect={false} placeholder={t('shInviteEmail')} placeholderTextColor={c.mut} style={input} />
            <Button c={c} icon="send" label={t('shInviteBtn')} disabled={busy || !email.trim()} onPress={sendInvite} />
          </>
        )}
        <Text style={{ color: c.mut, ...type.small }}>{group.open ? t('shOpenOn') : t('shInviteNote')}</Text>
        {group.role === 'owner' && (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.md, borderTopWidth: 1, borderTopColor: c.line, paddingTop: space.md }}>
            <View style={{ flex: 1 }}>
              <Text style={{ color: c.fg, ...type.strong }}>{t('shOpenToggle')}</Text>
              {!group.open && <Text style={{ color: c.mut, ...type.small }}>{t('shOpenOff')}</Text>}
            </View>
            <Switch value={!!group.open} disabled={busy} trackColor={{ true: c.primary }}
              onValueChange={(v) => (v ? run(() => actions.setOpen(true)) : confirm(t('shOpenToggle'), t('shOpenOff'), t('shRemove'), () => actions.setOpen(false)))} />
          </View>
        )}
        <Button c={c} small variant="neutral" icon="copy" label={t('shShowCode')} onPress={() => setShownCode(actions.inviteCode())} />
        {shownCode ? <Text selectable style={{ color: c.ink2, fontSize: 12, backgroundColor: c.surfaceAlt, borderRadius: radius.sm, padding: space.sm }}>{shownCode}</Text> : null}
      </Card>

      <Card c={c} style={{ gap: 6 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}><Icon name="lock" size={16} color={c.success} /><Text style={{ color: c.fg, ...type.strong }}>{t('shSecTitle')}</Text></View>
        <Text style={{ color: c.mut, ...type.small }}>{t('shSecBody')}</Text>
      </Card>

      <View style={{ gap: space.sm }}>
        <Button c={c} variant="neutral" label={t('shLeave')} onPress={() => confirm(t('shLeave'), t('shLeaveAsk'), t('shLeave'), actions.leave)} />
        {group.role === 'owner' && <Button c={c} variant="ghost" label={t('shDissolve')} style={{ opacity: 0.9 }} onPress={() => confirm(t('shDissolve'), t('shDissolveAsk'), t('shDissolve'), actions.dissolve)} />}
      </View>
    </>
  );

  return (
    <Modal visible={visible} animationType={animated ? 'slide' : 'none'} onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: c.bg, paddingTop: insets.top }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.md, paddingHorizontal: space.lg, paddingVertical: space.md }}>
          <Text style={{ color: c.fg, ...type.title, flex: 1 }}>{t('shTitle')}</Text>
          <IconButton c={c} icon="x" label="✕" onPress={onClose} />
        </View>
        <ScrollView contentContainerStyle={{ paddingHorizontal: space.lg, paddingBottom: Math.max(insets.bottom, space.lg) + space.lg, gap: space.md }} keyboardShouldPersistTaps="handled">
          {body}
          {busy && <ActivityIndicator color={c.primary} />}
          {msg ? (
            <View style={{ backgroundColor: c.dangerTint, borderRadius: radius.md, padding: space.md }}>
              <Text style={{ color: c.danger, ...type.small }}>{msg}</Text>
            </View>
          ) : null}
        </ScrollView>
      </View>
    </Modal>
  );
}
