import React from 'react';
import { Phone, X, ShieldAlert, HeartPulse, Flame, Users, LifeBuoy } from 'lucide-react';

interface HelplinesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const HELPLINES = [
  { number: '112', title: 'National Unified Emergency', desc: 'Police, Fire, Medical, Disaster (All India)', icon: ShieldAlert },
  { number: '100', title: 'Police Control Room', desc: 'Immediate police intervention & crime reporting', icon: ShieldAlert },
  { number: '108', title: 'Emergency Ambulance', desc: 'Free emergency medical transport & trauma care', icon: HeartPulse },
  { number: '101', title: 'Fire Services', desc: 'Fire rescue, industrial hazards & building fires', icon: Flame },
  { number: '1091', title: 'Women Helpline', desc: '24x7 support for women in distress or danger', icon: Users },
  { number: '1098', title: 'Childline', desc: 'Emergency care and protection for children', icon: LifeBuoy },
  { number: '14416', title: 'Tele-MANAS', desc: 'Government 24/7 mental health crisis support', icon: HeartPulse },
  { number: '1070', title: 'Disaster Helpline', desc: 'National/State Disaster Management Authority', icon: ShieldAlert },
];

export const EmergencyHelplinesModal: React.FC<HelplinesModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div
      className="modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="helplines-modal-title"
      onClick={onClose}
    >
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 id="helplines-modal-title" className="modal-title">
            Emergency Numbers in India
          </h2>
          <button
            type="button"
            className="btn-modal-close"
            onClick={onClose}
            aria-label="Close emergency numbers dialog"
          >
            <X size={22} />
          </button>
        </div>

        <p style={{ fontSize: '0.875rem', color: '#475569', marginBottom: '1rem' }}>
          Tapping any number opens your device dialer. In all Indian states, <strong>112</strong> serves as the unified emergency number.
        </p>

        <div className="helplines-grid">
          {HELPLINES.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.number} className="helpline-item">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <Icon size={20} color="#dc2626" aria-hidden="true" />
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.9375rem', color: '#0f172a' }}>
                      {item.title}
                    </div>
                    <div style={{ fontSize: '0.8125rem', color: '#64748b' }}>{item.desc}</div>
                  </div>
                </div>
                <a
                  href={`tel:${item.number}`}
                  className="helpline-number-btn"
                  aria-label={`Call ${item.title} on ${item.number}`}
                >
                  <Phone size={14} aria-hidden="true" />
                  {item.number}
                </a>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
