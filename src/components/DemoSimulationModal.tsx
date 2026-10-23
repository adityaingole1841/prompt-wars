import React from 'react';
import { X, Send, MapPin, AlertCircle, CheckCircle2 } from 'lucide-react';
import { EmergencyAnalysisResponse, UserLocation } from '../types/emergency';

interface DemoSimulationModalProps {
  type: 'family_alert' | 'location_share' | null;
  guidance: EmergencyAnalysisResponse | null;
  location: UserLocation | null;
  onClose: () => void;
}

export const DemoSimulationModal: React.FC<DemoSimulationModalProps> = ({
  type,
  guidance,
  location,
  onClose,
}) => {
  if (!type || !guidance) return null;

  const isFamily = type === 'family_alert';

  const locText = location
    ? location.formattedText || `Coordinates: ${location.latitude.toFixed(5)}, ${location.longitude.toFixed(5)}`
    : 'No GPS location added (User manual address recommended)';

  const simulatedMessage = isFamily
    ? `[EMERGENCY SIMULATION] Emergency Helper India Alert:\n` +
      `Situation: ${guidance.situation_type.toUpperCase()} (${guidance.urgency} Urgency)\n` +
      `Summary: ${guidance.short_summary}\n` +
      `Location: ${locText}\n` +
      `Official responders: 112.`
    : `[LOCATION SHARE SIMULATION]\n` +
      `Current Safety Coordinates: ${locText}\n` +
      `Status: Seeking guidance for ${guidance.situation_type}. Emergency dialer: 112.`;

  return (
    <div
      className="modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="simulation-title"
      onClick={onClose}
    >
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {isFamily ? (
              <Send size={22} color="#ea580c" aria-hidden="true" />
            ) : (
              <MapPin size={22} color="#2563eb" aria-hidden="true" />
            )}
            <h2 id="simulation-title" className="modal-title">
              {isFamily ? 'Simulate Family Emergency Alert' : 'Simulate Location Sharing'}
            </h2>
          </div>
          <button
            type="button"
            className="btn-modal-close"
            onClick={onClose}
            aria-label="Close simulation dialog"
          >
            <X size={22} />
          </button>
        </div>

        {/* Clear Notice: Not Real */}
        <div
          style={{
            backgroundColor: '#fef3c7',
            border: '1px solid #f59e0b',
            borderRadius: '8px',
            padding: '0.75rem 1rem',
            marginBottom: '1rem',
            fontSize: '0.875rem',
            color: '#92400e',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '0.5rem',
          }}
          role="note"
        >
          <AlertCircle size={20} className="flex-shrink-0" />
          <div>
            <strong>Interactive Prototype Simulation Only:</strong> No actual SMS, network message,
            or location is transmitted to any emergency contacts or third parties.
          </div>
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '0.35rem' }}>
            {isFamily ? 'Simulated Message Preview:' : 'Simulated Payload Preview:'}
          </label>
          <pre
            style={{
              backgroundColor: '#f8fafc',
              border: '1px solid #cbd5e1',
              borderRadius: '8px',
              padding: '0.875rem',
              fontSize: '0.875rem',
              fontFamily: 'monospace',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
              color: '#0f172a',
              lineHeight: 1.5,
            }}
          >
            {simulatedMessage}
          </pre>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#15803d', fontSize: '0.875rem', marginBottom: '1.25rem' }}>
          <CheckCircle2 size={18} />
          <span>Simulated preview generated successfully for safety demonstration.</span>
        </div>

        <button
          type="button"
          className="btn-submit-guidance"
          onClick={onClose}
          style={{ minHeight: '44px', fontSize: '1rem' }}
        >
          Done / Close Simulation
        </button>
      </div>
    </div>
  );
};
