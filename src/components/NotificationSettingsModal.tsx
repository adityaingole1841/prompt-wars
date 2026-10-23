import React, { useState, useEffect } from 'react';
import {
  Bell,
  BellOff,
  X,
  Volume2,
  VolumeX,
  Send,
  HelpCircle,
} from 'lucide-react';
import { SupportedLanguage } from '../types/emergency';
import { TRANSLATIONS } from '../utils/translations';
import {
  getNotificationPermission,
  subscribeToPush,
  unsubscribeFromPush,
  triggerDemoNotification,
} from '../services/notifications';

interface NotificationSettingsModalProps {
  isOpen: boolean;
  language: SupportedLanguage;
  soundEnabled: boolean;
  onToggleSound: (enabled: boolean) => void;
  onClose: () => void;
}

export const NotificationSettingsModal: React.FC<NotificationSettingsModalProps> = ({
  isOpen,
  language,
  soundEnabled,
  onToggleSound,
  onClose,
}) => {
  const [permission, setPermission] = useState<NotificationPermission | 'unsupported'>('default');
  const [isSubscribing, setIsSubscribing] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const t = TRANSLATIONS[language]?.notifications || TRANSLATIONS.en.notifications;

  useEffect(() => {
    if (isOpen) {
      setPermission(getNotificationPermission());
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleEnableNotifications = async () => {
    setIsSubscribing(true);
    setStatusMessage(null);

    const res = await subscribeToPush(language);
    setPermission(getNotificationPermission());
    setIsSubscribing(false);

    if (res.success) {
      setStatusMessage('✓ Browser notifications enabled successfully.');
    } else {
      setStatusMessage(`Notice: ${res.message}`);
    }
  };

  const handleDisableNotifications = async () => {
    await unsubscribeFromPush();
    setPermission(getNotificationPermission());
    setStatusMessage('Notifications have been disabled.');
  };

  const handleDemoSend = async () => {
    setStatusMessage('Sending demo notification...');
    const res = await triggerDemoNotification(language);
    setStatusMessage(`✓ Demo alert sent: "${res.message}"`);
  };

  return (
    <div
      className="modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="notification-modal-title"
      onClick={onClose}
    >
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Bell size={22} color="#dc2626" />
            <h2 id="notification-modal-title" className="modal-title">
              {t.title}
            </h2>
          </div>
          <button
            type="button"
            className="btn-modal-close"
            onClick={onClose}
            aria-label="Close notification settings"
          >
            <X size={22} />
          </button>
        </div>

        {/* Permission Status Pill */}
        <div style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#475569' }}>
            Current Browser Status:
          </span>
          <span
            className={`notif-status-pill status-${permission}`}
            style={{
              fontSize: '0.75rem',
              fontWeight: 700,
              padding: '0.2rem 0.6rem',
              borderRadius: '999px',
              textTransform: 'uppercase',
              backgroundColor: permission === 'granted' ? '#dcfce7' : permission === 'denied' ? '#fee2e2' : '#f1f5f9',
              color: permission === 'granted' ? '#15803d' : permission === 'denied' ? '#991b1b' : '#475569',
            }}
          >
            {permission === 'granted' ? 'Granted' : permission === 'denied' ? 'Denied / Blocked' : permission === 'unsupported' ? 'Unsupported' : 'Not Requested'}
          </span>
        </div>

        {/* Clear Explanation Prior to Consent */}
        <div className="notif-explanation-box">
          <p>{t.explanation}</p>
        </div>

        {/* Controls Section */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.25rem' }}>
          {permission !== 'granted' ? (
            <button
              type="button"
              className="btn-enable-notif"
              onClick={handleEnableNotifications}
              disabled={isSubscribing || permission === 'unsupported'}
              aria-label="Enable browser push notifications"
            >
              <Bell size={18} />
              <span>{isSubscribing ? 'Requesting Permission...' : 'Enable Browser Notifications'}</span>
            </button>
          ) : (
            <button
              type="button"
              className="btn-secondary"
              onClick={handleDisableNotifications}
              style={{ justifyContent: 'center', minHeight: '44px' }}
            >
              <BellOff size={18} />
              <span>{t.disableBtn}</span>
            </button>
          )}

          {/* Sound Alert Toggle */}
          <label className="sound-toggle-row">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              {soundEnabled ? <Volume2 size={18} color="#0f766e" /> : <VolumeX size={18} color="#94a3b8" />}
              <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#1e293b' }}>
                {t.soundToggle}
              </span>
            </div>
            <input
              type="checkbox"
              checked={soundEnabled}
              onChange={(e) => onToggleSound(e.target.checked)}
              style={{ width: '18px', height: '18px', cursor: 'pointer' }}
            />
          </label>

          {/* Clearly Labelled DEMO Test Notification Button */}
          <div className="demo-notif-box">
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '0.4rem' }}>
              Prototype Demonstration (Demo Mode):
            </div>
            <button
              type="button"
              className="btn-demo-test-notif"
              onClick={handleDemoSend}
              aria-label="Send test emergency notification in current language"
            >
              <Send size={16} />
              <span>{t.demoTestBtn}</span>
            </button>
          </div>
        </div>

        {/* Status Feedback Message */}
        {statusMessage && (
          <div
            style={{
              padding: '0.65rem 0.875rem',
              backgroundColor: '#f8fafc',
              border: '1px solid #cbd5e1',
              borderRadius: '6px',
              fontSize: '0.8125rem',
              color: '#1e293b',
              marginBottom: '1rem',
            }}
          >
            {statusMessage}
          </div>
        )}

        {/* Browser & OS Limitations Disclaimer */}
        <div className="notif-limitations-box">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontWeight: 700, marginBottom: '0.25rem' }}>
            <HelpCircle size={15} />
            <span>Browser & OS Limitations:</span>
          </div>
          <ul style={{ paddingLeft: '1.25rem', margin: 0, fontSize: '0.75rem', color: '#475569', lineHeight: 1.5 }}>
            <li>Web Push requires your explicit device consent and an active browser session.</li>
            <li>On iOS (iPhone/iPad), Web Push requires adding the website to your Home Screen.</li>
            <li>This prototype does not claim to detect danger when your device is switched off or disconnected.</li>
            <li>{t.aiWarningNotice}</li>
          </ul>
        </div>

        <button
          type="button"
          className="btn-submit-guidance"
          onClick={onClose}
          style={{ minHeight: '44px', fontSize: '0.9375rem', marginTop: '1rem' }}
        >
          Close Settings
        </button>
      </div>
    </div>
  );
};
