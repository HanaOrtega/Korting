// Lokalne przypomnienia (expo-notifications): cotygodniowe „czas na zakupy” i „jutro kończy się promocja”.
// Działają bez serwera i bez internetu – system sam wyświetla je o zadanej godzinie, także przy zamkniętej aplikacji.
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { expiryReminder, weeklyTrigger } from './comfort.js';

const WEEKLY = 'korting-weekly';
const EXPIRY = 'korting-expiry';
const CHANNEL = 'reminders';

Notifications.setNotificationHandler({
  handleNotification: async () => ({ shouldShowBanner: true, shouldShowList: true, shouldPlaySound: false, shouldSetBadge: false }),
});

export async function ensurePermission() {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync(CHANNEL, { name: 'Przypomnienia', importance: Notifications.AndroidImportance.DEFAULT, sound: null, vibrationPattern: [0] });
  }
  const cur = await Notifications.getPermissionsAsync();
  if (cur.granted) return true;
  return (await Notifications.requestPermissionsAsync()).granted;
}

const cancel = (id) => Notifications.cancelScheduledNotificationAsync(id).catch(() => {});

/** Ustawia (albo kasuje) oba przypomnienia zgodnie z ustawieniami i bieżącą listą. Bezpieczne do wielokrotnego wołania. */
export async function syncReminders({ comfort, t, items, rows, lang }) {
  try {
    await cancel(WEEKLY); await cancel(EXPIRY);
    if (!comfort.weekly.on && !comfort.expiry.on) return;
    if (!(await Notifications.getPermissionsAsync()).granted) return;
    const open = items.filter((i) => !i.done).length;
    if (comfort.weekly.on) {
      await Notifications.scheduleNotificationAsync({
        identifier: WEEKLY,
        content: { title: t('cfNotWeeklyTitle'), body: open ? t('cfNotWeeklyBody', { n: open }) : t('cfNotWeeklyEmpty') },
        trigger: { type: Notifications.SchedulableTriggerInputTypes.WEEKLY, ...weeklyTrigger(comfort.weekly), channelId: CHANNEL },
      });
    }
    if (comfort.expiry.on) {
      const r = expiryReminder(rows, new Date(), comfort.expiry.hour);
      if (r) {
        const first = r.entries[0];
        await Notifications.scheduleNotificationAsync({
          identifier: EXPIRY,
          content: { title: t('cfNotExpiryTitle'), body: t('cfNotExpiryBody', { name: first.text, store: first.store, more: r.entries.length > 1 ? t('cfNotMore', { n: r.entries.length - 1 }) : '' }) },
          trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: r.at, channelId: CHANNEL },
        });
      }
    }
  } catch { /* przypomnienia są dodatkiem – błąd systemu nie może psuć aplikacji */ }
}
