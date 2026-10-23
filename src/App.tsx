import React, { useState, useRef } from 'react';
import { Header } from './components/Header';
import { Call112Banner } from './components/Call112Banner';
import { IncidentForm } from './components/IncidentForm';
import { GuidanceView } from './components/GuidanceView';
import { ImmediateAlertBanner } from './components/ImmediateAlertBanner';
import { NotificationSettingsModal } from './components/NotificationSettingsModal';
import { MentalHealthSection } from './components/MentalHealthSection';
import { AIChatbot } from './components/AIChatbot';
import { WeatherWidget } from './components/WeatherWidget';
import { DisasterAlertBanner } from './components/DisasterAlertBanner';
import { EmergencyThreatMap } from './components/EmergencyThreatMap';
import { DisasterBulletinBoard } from './components/DisasterBulletinBoard';
import { AdminPortal } from './components/AdminPortal';
import { Footer } from './components/Footer';
import {
  EmergencyAnalysisResponse,
  UserLocation,
  UploadedImage,
  SupportedLanguage,
} from './types/emergency';
import { analyzeEmergency } from './services/api';
import { TRANSLATIONS } from './utils/translations';
import { hasEventBeenAlerted, markEventAlerted } from './services/notifications';
import { PhoneCall, HeartHandshake, Bot, MapPin, ShieldAlert } from 'lucide-react';

export const App: React.FC = () => {
  const [currentLanguage, setCurrentLanguage] = useState<SupportedLanguage>('en');
  const [activeTab, setActiveTab] = useState<'emergency' | 'mental-health' | 'chat' | 'map' | 'admin'>('emergency');
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('app-theme') as 'light' | 'dark' | null;
      if (saved) return saved;
      return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light';
    }
    return 'light';
  });

  // Apply theme to document element
  React.useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    try {
      localStorage.setItem('app-theme', theme);
    } catch {
      // ignore
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const [guidance, setGuidance] = useState<EmergencyAnalysisResponse | null>(null);
  const [source, setSource] = useState<'ai' | 'fallback' | 'server-rules'>('server-rules');
  const [disclaimer, setDisclaimer] = useState<string>('');
  const [lastLocation, setLastLocation] = useState<UserLocation | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Notifications & In-app Alert state
  const [isNotifModalOpen, setIsNotifModalOpen] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [activeAlert, setActiveAlert] = useState<{ urgency: 'HIGH' | 'CRITICAL'; id: string } | null>(null);

  const resultsRef = useRef<HTMLDivElement>(null);
  const t = TRANSLATIONS[currentLanguage] || TRANSLATIONS.en;

  const handleIncidentSubmit = async (
    description: string,
    location: UserLocation | null,
    image: UploadedImage | null
  ) => {
    setIsLoading(true);
    setErrorMsg(null);
    setLastLocation(location);

    try {
      // Extract clean base64 data without prefix for API payload if image exists
      let imagePayload = null;
      if (image && image.dataUrl) {
        const parts = image.dataUrl.split(',');
        const base64Data = parts.length > 1 ? parts[1] : parts[0];
        imagePayload = {
          fileName: image.name,
          mimeType: image.mimeType,
          base64Data,
        };
      }

      const result = await analyzeEmergency({
        description,
        language: currentLanguage,
        location,
        image: imagePayload,
      });

      setGuidance(result.data);
      setSource(result.source);
      setDisclaimer(result.disclaimer);

      // Trigger immediate in-app alert for HIGH or CRITICAL urgency if not previously triggered for this event
      const eventKey = `${result.data.urgency}-${description.slice(0, 30)}`;
      if (
        (result.data.urgency === 'HIGH' || result.data.urgency === 'CRITICAL') &&
        !hasEventBeenAlerted(eventKey)
      ) {
        markEventAlerted(eventKey);
        setActiveAlert({
          urgency: result.data.urgency,
          id: eventKey,
        });
      }

      // Smooth scroll to guidance view for quick access
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    } catch (err: unknown) {
      console.error('Failed to analyze emergency:', err);
      setErrorMsg('An unexpected error occurred while analyzing the incident. Immediate 112 emergency calling is still available above.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="app-container">
      {/* Decorative ambient background glows */}
      <div className="ambient-background-glow glow-1" aria-hidden="true" />
      <div className="ambient-background-glow glow-2" aria-hidden="true" />

      {/* Accessibility Skip Link */}
      <a
        href="#main-content"
        style={{
          position: 'absolute',
          left: '-9999px',
          top: 'auto',
          width: '1px',
          height: '1px',
          overflow: 'hidden',
        }}
        onFocus={(e) => {
          e.currentTarget.style.position = 'static';
          e.currentTarget.style.width = 'auto';
          e.currentTarget.style.height = 'auto';
        }}
        onBlur={(e) => {
          e.currentTarget.style.position = 'absolute';
          e.currentTarget.style.left = '-9999px';
          e.currentTarget.style.width = '1px';
          e.currentTarget.style.height = '1px';
        }}
      >
        Skip to main emergency content
      </a>

      {/* Header with Title, Language Selector, Dark/Light Toggle, and Notification Modal Trigger */}
      <Header
        currentLanguage={currentLanguage}
        onLanguageChange={setCurrentLanguage}
        onOpenNotifications={() => setIsNotifModalOpen(true)}
        theme={theme}
        onToggleTheme={toggleTheme}
      />

      {/* Immediate In-App Warning Alert (displayed on HIGH or CRITICAL emergency) */}
      {activeAlert && (
        <ImmediateAlertBanner
          urgency={activeAlert.urgency}
          language={currentLanguage}
          soundEnabled={soundEnabled}
          onDismiss={() => setActiveAlert(null)}
        />
      )}

      {/* Top Tab Navigator between Unified Emergency (112), Mental Health (14416), AI Chatbot, and Live Threat Map */}
      <nav className="nav-tabs-bar" aria-label="Emergency Services Categories">
        <button
          type="button"
          className={`nav-tab-btn tab-emergency ${activeTab === 'emergency' ? 'active' : ''}`}
          onClick={() => setActiveTab('emergency')}
          aria-pressed={activeTab === 'emergency'}
        >
          <PhoneCall size={18} aria-hidden="true" />
          <span>{t.tabs.emergency}</span>
        </button>

        <button
          type="button"
          className={`nav-tab-btn tab-mental ${activeTab === 'mental-health' ? 'active' : ''}`}
          onClick={() => setActiveTab('mental-health')}
          aria-pressed={activeTab === 'mental-health'}
        >
          <HeartHandshake size={18} aria-hidden="true" />
          <span>{t.tabs.mentalHealth}</span>
        </button>

        <button
          type="button"
          className={`nav-tab-btn tab-chat ${activeTab === 'chat' ? 'active' : ''}`}
          onClick={() => setActiveTab('chat')}
          aria-pressed={activeTab === 'chat'}
        >
          <Bot size={18} aria-hidden="true" />
          <span>{t.tabs.aiChat}</span>
        </button>

        <button
          type="button"
          className={`nav-tab-btn tab-map ${activeTab === 'map' ? 'active' : ''}`}
          onClick={() => setActiveTab('map')}
          aria-pressed={activeTab === 'map'}
        >
          <MapPin size={18} aria-hidden="true" />
          <span>{t.tabs.map}</span>
        </button>

        <button
          type="button"
          className={`nav-tab-btn tab-admin ${activeTab === 'admin' ? 'active' : ''}`}
          onClick={() => setActiveTab('admin')}
          aria-pressed={activeTab === 'admin'}
        >
          <ShieldAlert size={18} aria-hidden="true" />
          <span>Admin</span>
        </button>
      </nav>

      <main id="main-content">
        <div key={activeTab} className="tab-pane-animated">
          {activeTab === 'emergency' && (
            <>
              {/* Unmissable, Always-Accessible 112 Calling Banner */}
              <Call112Banner />

              {/* Live Weather Widget — shows local weather + safety tips */}
              <WeatherWidget language={currentLanguage} />

              {/* Expected Disaster Alert Banner — 7-day severe weather & disaster detection */}
              <DisasterAlertBanner language={currentLanguage} />

              {/* Admin-Published Disaster Bulletins — public feed */}
              <DisasterBulletinBoard />

              {/* Incident Form (Text description in all Indian languages, speech recognition, photo, location) */}
              <IncidentForm
                language={currentLanguage}
                onSubmit={handleIncidentSubmit}
                isLoading={isLoading}
              />

              {/* Global Error Banner if any */}
              {errorMsg && (
                <div
                  style={{
                    padding: '1rem',
                    backgroundColor: '#fee2e2',
                    border: '2px solid #ef4444',
                    borderRadius: '12px',
                    color: '#991b1b',
                    marginBottom: '1.5rem',
                    fontWeight: 600,
                  }}
                  role="alert"
                >
                  {errorMsg}
                </div>
              )}

              {/* Actionable Guidance Results View */}
              <div ref={resultsRef}>
                {guidance && (
                  <GuidanceView
                    guidance={guidance}
                    language={currentLanguage}
                    source={source}
                    disclaimer={disclaimer}
                    userLocation={lastLocation}
                  />
                )}
              </div>
            </>
          )}

          {activeTab === 'mental-health' && (
            <MentalHealthSection userLocation={lastLocation} />
          )}

          {activeTab === 'chat' && (
            <AIChatbot language={currentLanguage} />
          )}

          {activeTab === 'map' && (
            <EmergencyThreatMap
              language={currentLanguage}
              theme={theme}
              activeThreat={
                lastLocation && guidance
                  ? {
                      latitude: lastLocation.latitude,
                      longitude: lastLocation.longitude,
                      label: `${guidance.situation_type} (${lastLocation.formattedText || 'Incident Location'})`,
                      threatType: guidance.situation_type,
                      urgency: guidance.urgency,
                      details: guidance.short_summary,
                    }
                  : null
              }
            />
          )}

          {activeTab === 'admin' && (
            <AdminPortal />
          )}
        </div>
      </main>

      {/* Notification Settings & Browser Push Modal */}
      <NotificationSettingsModal
        isOpen={isNotifModalOpen}
        language={currentLanguage}
        soundEnabled={soundEnabled}
        onToggleSound={setSoundEnabled}
        onClose={() => setIsNotifModalOpen(false)}
      />

      <Footer />
    </div>
  );
};

export default App;
