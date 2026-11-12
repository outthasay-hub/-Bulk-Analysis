/**
 * Service for browser-based Notification API and reminder scheduling
 * for Liquid Oxygen (LOX) bulk tank inspections.
 */

export interface ReminderSettings {
  enabled: boolean;
  scheduledTimes: string[]; // e.g. ['08:00', '16:00']
  soundEnabled: boolean;
  repeatDaily: boolean;
  lastNotifiedSlots: Record<string, string>; // { '08:00': '2026-11-12' }
  // Gas Level Percentage Alert
  gasLevelAlertEnabled: boolean;
  gasLevelAlertThresholdPercent: number; // default: 20%
  criticalLevelThresholdPercent: number; // default: 10%
  lastGasAlertDate?: string;
}

const STORAGE_KEY = 'o2_bulk_reminder_settings';

export const DEFAULT_REMINDER_SETTINGS: ReminderSettings = {
  enabled: true,
  scheduledTimes: ['08:00', '16:00'],
  soundEnabled: true,
  repeatDaily: true,
  lastNotifiedSlots: {},
  gasLevelAlertEnabled: true,
  gasLevelAlertThresholdPercent: 20,
  criticalLevelThresholdPercent: 10
};

/**
 * Retrieve saved reminder settings or fallback to defaults
 */
export function getStoredReminderSettings(): ReminderSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_REMINDER_SETTINGS;
    return { ...DEFAULT_REMINDER_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_REMINDER_SETTINGS;
  }
}

/**
 * Persist reminder settings to localStorage
 */
export function saveReminderSettings(settings: ReminderSettings): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch (err) {
    console.error('Failed to save reminder settings:', err);
  }
}

/**
 * Check if the browser supports the Notification API
 */
export function isNotificationSupported(): boolean {
  return typeof window !== 'undefined' && 'Notification' in window;
}

/**
 * Get current browser notification permission
 */
export function getNotificationPermission(): NotificationPermission {
  if (!isNotificationSupported()) return 'denied';
  return Notification.permission;
}

/**
 * Request notification permission from user
 */
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!isNotificationSupported()) return 'denied';
  try {
    const permission = await Notification.requestPermission();
    return permission;
  } catch (err) {
    console.warn('Error requesting notification permission:', err);
    return Notification.permission || 'denied';
  }
}

/**
 * Synthesize a clean, pleasant dual-tone chime using Web Audio API
 * No external mp3/audio files needed; reliable and instant.
 */
export function playNotificationChime(): void {
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;

    const ctx = new AudioContextClass();

    // First chime note: 587.33 Hz (D5)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(587.33, ctx.currentTime);
    gain1.gain.setValueAtTime(0, ctx.currentTime);
    gain1.gain.linearRampToValueAtTime(0.2, ctx.currentTime + 0.05);
    gain1.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);

    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(ctx.currentTime);
    osc1.stop(ctx.currentTime + 0.35);

    // Second chime note: 880 Hz (A5)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(880, ctx.currentTime + 0.15);
    gain2.gain.setValueAtTime(0, ctx.currentTime + 0.15);
    gain2.gain.linearRampToValueAtTime(0.25, ctx.currentTime + 0.2);
    gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);

    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(ctx.currentTime + 0.15);
    osc2.stop(ctx.currentTime + 0.6);
  } catch (e) {
    console.warn('Web Audio chime could not play:', e);
  }
}

/**
 * Dispatches an inspection notification
 */
export function sendInspectionNotification(
  title: string,
  body: string,
  onClickHandler?: () => void
): boolean {
  const settings = getStoredReminderSettings();
  if (settings.soundEnabled) {
    playNotificationChime();
  }

  if (!isNotificationSupported() || Notification.permission !== 'granted') {
    return false;
  }

  try {
    const notification = new Notification(title, {
      body,
      icon: '/public/assets/aistudio/Logo_SDG_41023427.jpg',
      badge: '/public/assets/aistudio/Logo_SDG_41023427.jpg',
      tag: 'lox-inspection-reminder',
      requireInteraction: true
    });

    notification.onclick = () => {
      window.focus();
      notification.close();
      if (onClickHandler) {
        onClickHandler();
      }
    };

    return true;
  } catch (err) {
    console.warn('Notification instantiation failed:', err);
    return false;
  }
}

/**
 * Synthesizes an alert warning chime (urgent stepped tone)
 */
export function playAlertWarningChime(): void {
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;

    const ctx = new AudioContextClass();
    const playNote = (freq: number, start: number, dur: number) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + start);
      gain.gain.setValueAtTime(0, ctx.currentTime + start);
      gain.gain.linearRampToValueAtTime(0.25, ctx.currentTime + start + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + start + dur);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime + start);
      osc.stop(ctx.currentTime + start + dur);
    };

    // Staccato alert cadence: G5 (784Hz) -> E5 (659Hz) -> C5 (523Hz)
    playNote(784, 0, 0.16);
    playNote(659, 0.18, 0.16);
    playNote(523, 0.36, 0.3);
  } catch (e) {
    console.warn('Alert chime error:', e);
  }
}

/**
 * Dispatches a high-priority gas low-level alert notification
 */
export function sendGasLevelAlertNotification(
  title: string,
  body: string,
  onClickHandler?: () => void
): boolean {
  const settings = getStoredReminderSettings();
  if (settings.soundEnabled) {
    playAlertWarningChime();
  }

  if (!isNotificationSupported() || Notification.permission !== 'granted') {
    return false;
  }

  try {
    const notification = new Notification(title, {
      body,
      icon: '/public/assets/aistudio/Logo_SDG_41023427.jpg',
      badge: '/public/assets/aistudio/Logo_SDG_41023427.jpg',
      tag: 'lox-gas-level-alert',
      requireInteraction: true
    });

    notification.onclick = () => {
      window.focus();
      notification.close();
      if (onClickHandler) {
        onClickHandler();
      }
    };

    return true;
  } catch (err) {
    console.warn('Gas alert notification failed:', err);
    return false;
  }
}

/**
 * Check if any scheduled reminder should fire right now
 * Returns the time slot string if triggered, or null otherwise.
 */
export function evaluateScheduledReminders(
  now: Date = new Date()
): string | null {
  const settings = getStoredReminderSettings();
  if (!settings.enabled || !settings.scheduledTimes || settings.scheduledTimes.length === 0) {
    return null;
  }

  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const currentTimeSlot = `${hours}:${minutes}`;
  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

  for (const slot of settings.scheduledTimes) {
    if (slot === currentTimeSlot) {
      // Check if already notified for this slot today
      const lastNotified = settings.lastNotifiedSlots?.[slot];
      if (lastNotified !== todayStr) {
        // Mark as notified today
        const updatedSlots = {
          ...(settings.lastNotifiedSlots || {}),
          [slot]: todayStr
        };
        saveReminderSettings({
          ...settings,
          lastNotifiedSlots: updatedSlots
        });
        return slot;
      }
    }
  }

  return null;
}
