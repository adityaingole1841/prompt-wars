import React, { useState } from 'react';
import {
  AlertOctagon,
  AlertTriangle,
  Info,
  CheckCircle,
  Copy,
  Check,
  Volume2,
  VolumeX,
  PhoneCall,
  Send,
  MapPin,
  ShieldAlert,
  HelpCircle,
} from 'lucide-react';
import { EmergencyAnalysisResponse, UserLocation, SupportedLanguage } from '../types/emergency';
import { TRANSLATIONS, SPEECH_LANG_MAP } from '../utils/translations';
import { DemoSimulationModal } from './DemoSimulationModal';

interface GuidanceViewProps {
  guidance: EmergencyAnalysisResponse;
  language: SupportedLanguage;
  source: 'ai' | 'fallback' | 'server-rules';
  disclaimer: string;
  userLocation: UserLocation | null;
}

export const GuidanceView: React.FC<GuidanceViewProps> = ({
  guidance,
  language,
  source,
  disclaimer,
  userLocation,
}) => {
  const [copied, setCopied] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [activeSimulation, setActiveSimulation] = useState<'family_alert' | 'location_share' | null>(null);

  const t = TRANSLATIONS[language]?.results || TRANSLATIONS.en.results;

  // Copy Summary to Clipboard
  const handleCopySummary = async () => {
    try {
      await navigator.clipboard.writeText(guidance.summary_for_call);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      alert('Unable to automatically copy. Please select and copy the text manually.');
    }
  };

  // Text-To-Speech for 112 Operator Summary with language support
  const handleSpeakSummary = () => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      alert('Speech synthesis is not supported on this browser.');
      return;
    }

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(guidance.summary_for_call);
    utterance.rate = 0.95;
    utterance.lang = SPEECH_LANG_MAP[language] || 'en-IN';

    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  // Icon corresponding to urgency
  const getUrgencyIcon = () => {
    switch (guidance.urgency) {
      case 'CRITICAL':
        return <AlertOctagon size={24} aria-hidden="true" />;
      case 'HIGH':
        return <AlertTriangle size={24} aria-hidden="true" />;
      case 'MEDIUM':
        return <Info size={24} aria-hidden="true" />;
      case 'LOW':
        return <CheckCircle size={24} aria-hidden="true" />;
    }
  };

  return (
    <section className="safety-card results-container" aria-live="polite">
      {/* 1. Urgency Level Bar (Color + Text Label + Icon for Accessibility) */}
      <div className={`urgency-badge-bar urgency-${guidance.urgency}`}>
        <div className="urgency-left">
          {getUrgencyIcon()}
          <div>
            <span>{t.urgencyTitle} </span>
            <strong className="urgency-tag">{guidance.urgency}</strong>
          </div>
        </div>
        <div style={{ fontSize: '0.8125rem', textTransform: 'capitalize' }}>
          {guidance.situation_type}
        </div>
      </div>

      {/* Prominent warning if CRITICAL / HIGH */}
      {(guidance.urgency === 'CRITICAL' || guidance.urgency === 'HIGH') && (
        <div
          style={{
            backgroundColor: '#fee2e2',
            border: '2px solid #ef4444',
            borderRadius: '8px',
            padding: '0.875rem 1rem',
            marginBottom: '1.25rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '0.75rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', color: '#991b1b', fontWeight: 700, fontSize: '0.9375rem' }}>
            <PhoneCall size={20} className="flex-shrink-0" />
            <span>{t.highRiskAlert}</span>
          </div>
          <a
            href="tel:112"
            style={{
              backgroundColor: '#dc2626',
              color: '#ffffff',
              padding: '0.4rem 0.875rem',
              borderRadius: '6px',
              textDecoration: 'none',
              fontWeight: 700,
              fontSize: '0.875rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
            }}
          >
            <PhoneCall size={14} />
            {t.dial112Now}
          </a>
        </div>
      )}

      {/* 2. Situation Summary */}
      <div style={{ marginBottom: '1.25rem' }}>
        <h3 className="card-title">
          <ShieldAlert size={20} color="#0f172a" />
          {t.safetyAssessment}
        </h3>
        <p style={{ fontSize: '1rem', color: '#334155', lineHeight: 1.6 }}>
          {guidance.short_summary}
        </p>
      </div>

      {/* 3. Summary to Read Aloud to 112 Operator */}
      <div className="operator-script-box">
        <div className="operator-script-header">
          <span className="operator-script-title">
            <PhoneCall size={18} color="#b91c1c" />
            {t.operatorScriptTitle}
          </span>
          <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
            {t.operatorScriptHint}
          </span>
        </div>

        <blockquote className="script-text">
          "{guidance.summary_for_call}"
        </blockquote>

        <div className="script-actions-row">
          <button
            type="button"
            className="btn-secondary"
            onClick={handleCopySummary}
            aria-label="Copy operator call script to clipboard"
          >
            {copied ? <Check size={16} color="#15803d" /> : <Copy size={16} />}
            <span>{copied ? t.copiedSummary : t.copySummary}</span>
          </button>

          <button
            type="button"
            className="btn-secondary"
            onClick={handleSpeakSummary}
            aria-label={isSpeaking ? 'Stop speaking summary' : 'Read operator script aloud'}
          >
            {isSpeaking ? <VolumeX size={16} color="#dc2626" /> : <Volume2 size={16} />}
            <span>{isSpeaking ? t.stopReading : t.readAloud}</span>
          </button>
        </div>
      </div>

      {/* 4. Immediate Practical Actions Checklist */}
      <div style={{ marginBottom: '1.25rem' }}>
        <h3 className="card-title" style={{ fontSize: '1.125rem', color: '#0f172a' }}>
          {t.immediateActionsTitle}
        </h3>
        <ol className="action-list">
          {guidance.immediate_actions.map((action, index) => (
            <li key={index} className="action-item">
              <span className="action-number" aria-hidden="true">
                {index + 1}
              </span>
              <span>{action}</span>
            </li>
          ))}
        </ol>
      </div>

      {/* 5. Things to Avoid (What NOT to do) */}
      {guidance.avoid_actions && guidance.avoid_actions.length > 0 && (
        <div className="avoid-box">
          <h4 className="avoid-title">
            <AlertTriangle size={18} />
            {t.avoidActionsTitle}
          </h4>
          <ul className="avoid-list">
            {guidance.avoid_actions.map((item, idx) => (
              <li key={idx} className="avoid-item">
                <span aria-hidden="true" style={{ fontWeight: 800 }}>✕</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* 6. Missing Information Notice */}
      {guidance.missing_information && guidance.missing_information.length > 0 && (
        <div className="missing-info-box">
          <div className="missing-info-title">
            <HelpCircle size={16} />
            <span>{t.missingInfoTitle}</span>
          </div>
          <div>
            {guidance.missing_information.map((info, idx) => (
              <div key={idx} className="missing-info-item">
                • {info}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 7. Clearly Labelled Demo Simulation Actions */}
      <div className="demo-buttons-section">
        <div className="demo-section-label">
          <span>{t.demoSimulationsTitle}</span>
        </div>
        <div className="demo-buttons-grid">
          <button
            type="button"
            className="btn-demo-action"
            onClick={() => setActiveSimulation('family_alert')}
          >
            <Send size={16} color="#ea580c" />
            <span>{t.simulateFamily}</span>
          </button>

          <button
            type="button"
            className="btn-demo-action"
            onClick={() => setActiveSimulation('location_share')}
          >
            <MapPin size={16} color="#2563eb" />
            <span>{t.simulateLocation}</span>
          </button>
        </div>
      </div>

      {/* Source and Safety Disclaimer */}
      <div
        style={{
          marginTop: '1.25rem',
          padding: '0.75rem',
          backgroundColor: '#f8fafc',
          borderRadius: '8px',
          fontSize: '0.75rem',
          color: '#64748b',
          border: '1px solid #e2e8f0',
        }}
      >
        <span style={{ fontWeight: 700, color: '#334155' }}>
          Safety Engine Source: {source === 'ai' ? 'Gemini 2.5 Flash AI' : source === 'server-rules' ? 'Server Safety Engine' : 'Offline Safety Fallback'}
        </span>
        <p style={{ marginTop: '0.25rem' }}>{disclaimer}</p>
      </div>

      {/* Simulation Modal */}
      <DemoSimulationModal
        type={activeSimulation}
        guidance={guidance}
        location={userLocation}
        onClose={() => setActiveSimulation(null)}
      />
    </section>
  );
};
