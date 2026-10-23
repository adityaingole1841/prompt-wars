import React, { useState } from 'react';
import { PhoneCall, ListFilter, AlertCircle } from 'lucide-react';
import { EmergencyHelplinesModal } from './EmergencyHelplinesModal';

export const Call112Banner: React.FC = () => {
  const [showHelplines, setShowHelplines] = useState(false);
  const [hasClickedCall, setHasClickedCall] = useState(false);

  const handleCallClick = () => {
    setHasClickedCall(true);
  };

  return (
    <section className="call-112-container" aria-label="Direct Emergency Calling">
      <div className="call-112-top">
        <h2 className="call-112-heading">
          <PhoneCall size={22} aria-hidden="true" />
          Immediate Emergency Services
        </h2>
        <button
          type="button"
          className="helplines-link-btn"
          onClick={() => setShowHelplines(true)}
          aria-haspopup="dialog"
        >
          <ListFilter size={14} aria-hidden="true" />
          All India Helplines (100, 108...)
        </button>
      </div>

      <div className="call-112-button-wrapper">
        <span className="call-112-radar-wave wave-1" aria-hidden="true" />
        <span className="call-112-radar-wave wave-2" aria-hidden="true" />
        <a
          href="tel:112"
          className="call-112-button"
          onClick={handleCallClick}
          aria-label="Call Emergency Services on 112"
        >
          <PhoneCall size={26} className="call-112-icon-vibrate" aria-hidden="true" />
          <span>Call Emergency Services — 112</span>
        </a>
      </div>

      <p className="call-disclaimer-text">
        <strong>Direct Dialer:</strong> Tapping opens your phone's dialer to place a voice call.
        Actual connection depends on cellular signal and device capabilities. Clicking does not
        automatically notify responders or track your location.
      </p>

      {hasClickedCall && (
        <div
          style={{
            marginTop: '0.75rem',
            padding: '0.5rem 0.75rem',
            background: 'rgba(0, 0, 0, 0.25)',
            borderRadius: '6px',
            fontSize: '0.8125rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
          role="status"
        >
          <AlertCircle size={16} />
          <span>
            If the call did not open in your phone dialer, manually dial <strong>112</strong> on your keypad right now.
          </span>
        </div>
      )}

      <EmergencyHelplinesModal
        isOpen={showHelplines}
        onClose={() => setShowHelplines(false)}
      />
    </section>
  );
};
