import { SupportedLanguage } from '../types/emergency';
import { NOTIFICATION_TEMPLATES } from '../utils/translations';

// In-memory set to prevent duplicate alert notifications for the same event
const alertedEvents = new Set<string>();

/**
 * Check if the current browser environment supports the Notifications API
 */
export function isNotificationSupported(): boolean {
  if (typeof window === 'undefined') return false;
  return 'Notification' in window;
}

/**
 * Check if Service Worker is supported
 */
export function isServiceWorkerSupported(): boolean {
  if (typeof window === 'undefined') return false;
  return 'serviceWorker' in navigator;
}

/**
 * Get current browser notification permission
 */
export function getNotificationPermission(): NotificationPermission | 'unsupported' {
  if (!isNotificationSupported()) return 'unsupported';
  return Notification.permission;
}

/**
 * Request notification permission from user after explaining why
 */
export async function requestNotificationPermission(): Promise<NotificationPermission | 'unsupported'> {
  if (!isNotificationSupported()) return 'unsupported';

  try {
    const permission = await Notification.requestPermission();
    return permission;
  } catch (err) {
    console.warn('Error requesting notification permission:', err);
    return Notification.permission;
  }
}

/**
 * Register Service Worker for push notifications
 */
export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (!isServiceWorkerSupported()) return null;

  try {
    const registration = await navigator.serviceWorker.register('/service-worker.js', {
      scope: '/',
    });
    return registration;
  } catch (err) {
    console.warn('Service worker registration failed:', err);
    return null;
  }
}

/**
 * Play a gentle, clear audible safety chime using Web Audio API
 * Guaranteed to work offline with zero external audio assets or downloads!
 */
export function playAlertChime(): void {
  try {
    if (typeof window === 'undefined') return;
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;

    const ctx = new AudioCtx();
    const now = ctx.currentTime;

    // First tone (520Hz)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(520, now);
    gain1.gain.setValueAtTime(0.15, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.3);

    // Second tone (660Hz)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(660, now + 0.15);
    gain2.gain.setValueAtTime(0.2, now + 0.15);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.15);
    osc2.stop(now + 0.5);
  } catch (e) {
    // Audio context may be restricted by browser policy before user interaction
    console.warn('Could not play alert chime:', e);
  }
}

/**
 * Show a browser notification using either service worker or Notifications API
 */
export async function showBrowserNotification(
  title: string,
  body: string,
  url = '/'
): Promise<boolean> {
  if (!isNotificationSupported()) return false;
  if (Notification.permission !== 'granted') return false;

  try {
    // Try via service worker registration if active
    if (isServiceWorkerSupported()) {
      const reg = await navigator.serviceWorker.getRegistration();
      if (reg && 'showNotification' in reg) {
        await reg.showNotification(title, {
          body,
          icon: '/icon.svg',
          badge: '/icon.svg',
          data: { url },
          tag: 'emergency-safety-alert',
        });
        return true;
      }
    }

    // Direct Notification fallback
    new Notification(title, {
      body,
      icon: '/icon.svg',
    });
    return true;
  } catch (err) {
    console.warn('Failed to show browser notification:', err);
    return false;
  }
}

/**
 * Register push subscription with backend
 */
export async function subscribeToPush(
  language: SupportedLanguage
): Promise<{ success: boolean; message: string }> {
  try {
    const perm = await requestNotificationPermission();
    if (perm !== 'granted') {
      return {
        success: false,
        message: 'Notification permission was not granted.',
      };
    }

    const reg = await registerServiceWorker();
    let endpoint = 'local-browser-notification';

    if (reg && 'pushManager' in reg) {
      try {
        // Try getting existing or subscribing
        const sub = await reg.pushManager.getSubscription();
        if (sub) {
          endpoint = sub.endpoint;
        }
      } catch (subErr) {
        console.info('Web Push subscription fallback active:', subErr);
      }
    }

    // Register with backend endpoint
    await fetch('/api/notifications/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        endpoint,
        language,
        timestamp: Date.now(),
      }),
    });

    return {
      success: true,
      message: 'Emergency safety notifications enabled successfully.',
    };
  } catch (err) {
    console.error('Push subscribe error:', err);
    return {
      success: false,
      message: (err as Error).message || 'Failed to enable notifications.',
    };
  }
}

/**
 * Unsubscribe from push notifications
 */
export async function unsubscribeFromPush(): Promise<{ success: boolean }> {
  try {
    if (isServiceWorkerSupported()) {
      const reg = await navigator.serviceWorker.getRegistration();
      if (reg && 'pushManager' in reg) {
        const sub = await reg.pushManager.getSubscription();
        if (sub) {
          await sub.unsubscribe();
        }
      }
    }

    await fetch('/api/notifications/unsubscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ timestamp: Date.now() }),
    });

    return { success: true };
  } catch (err) {
    console.warn('Unsubscribe error:', err);
    return { success: false };
  }
}

/**
 * Trigger verified demo notification (both via browser push and backend test endpoint)
 */
export async function triggerDemoNotification(
  language: SupportedLanguage
): Promise<{ success: boolean; message: string }> {
  const template = NOTIFICATION_TEMPLATES[language] || NOTIFICATION_TEMPLATES.en;
  const title =
    language === 'hi'
      ? '🚨 आपातकालीन सुरक्षा अलर्ट (डेमो)'
      : language === 'mr'
      ? '🚨 आपत्कालीन सुरक्षा अलर्ट (डेमो)'
      : '🚨 Emergency Helper Alert (Demo)';

  // Send backend demo event
  try {
    await fetch('/api/notifications/demo-send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ language, title, message: template }),
    });
  } catch {
    // ignore backend network issue for demo
  }

  // Play audible chime if allowed
  playAlertChime();

  // Show browser notification if permission is granted
  if (isNotificationSupported() && Notification.permission === 'granted') {
    await showBrowserNotification(title, template);
  }

  return {
    success: true,
    message: template,
  };
}

/**
 * Deduplication helper to prevent repeating the exact same emergency alert multiple times
 */
export function hasEventBeenAlerted(eventId: string): boolean {
  return alertedEvents.has(eventId);
}

export function markEventAlerted(eventId: string): void {
  alertedEvents.add(eventId);
}
