import React, { useEffect } from 'react';
import { AlertOctagon, PhoneCall, X, Volume2 } from 'lucide-react';
import { SupportedLanguage } from '../types/emergency';
import { NOTIFICATION_TEMPLATES } from '../utils/translations';
import { playAlertChime } from '../services/notifications';

interface ImmediateAlertBannerProps {
  urgency: 'HIGH' | 'CRITICAL';
  language: SupportedLanguage;
  soundEnabled?: boolean;
  onDismiss: () => void;
}

export const ImmediateAlertBanner: React.FC<ImmediateAlertBannerProps> = ({
  urgency,
  language,
  soundEnabled = true,
  onDismiss,
}) => {
  const alertText = NOTIFICATION_TEMPLATES[language] || NOTIFICATION_TEMPLATES.en;

  const headerTitle =
    language === 'hi'
      ? '🚨 तत्काल सुरक्षा चेतावनी (उच्च जोखिम)'
      : language === 'mr'
      ? '🚨 तातडीचा सुरक्षा इशारा (गंभीर धोका)'
      : '🚨 Immediate Safety Warning (High Risk)';

  const callBtnText =
    language === 'hi'
      ? '112 पर तुरंत कॉल करें'
      : language === 'mr'
      ? '112 वर त्वरित कॉल करा'
      : 'Call 112 Right Now';

  // Play audio chime once on mount if sound is enabled
  useEffect(() => {
    if (soundEnabled) {
      playAlertChime();
    }
  }, [soundEnabled]);

  return (
    <div
      className={`immediate-alert-banner urgency-${urgency}`}
      role="alert"
      aria-live="assertive"
    >
      <div className="alert-content-left">
        <div className="alert-icon-wrap">
          <AlertOctagon size={28} className="animate-pulse" aria-hidden="true" />
        </div>

        <div>
          <div className="alert-title-row">
            <h3 className="alert-header-text">{headerTitle}</h3>
            <span className="alert-ai-badge">AI Safety Alert</span>
          </div>
          <p className="alert-body-text">{alertText}</p>
        </div>
      </div>

      <div className="alert-actions-right">
        <a href="tel:112" className="btn-alert-call-112" aria-label={callBtnText}>
          <PhoneCall size={18} aria-hidden="true" />
          <span>{callBtnText}</span>
        </a>

        {soundEnabled && (
          <button
            type="button"
            className="btn-alert-sound"
            onClick={playAlertChime}
            title="Replay Alert Chime"
            aria-label="Replay Alert Chime"
          >
            <Volume2 size={18} />
          </button>
        )}

        <button
          type="button"
          className="btn-alert-dismiss"
          onClick={onDismiss}
          aria-label="Dismiss alert"
        >
          <X size={18} />
        </button>
      </div>
    </div>
  );
};
