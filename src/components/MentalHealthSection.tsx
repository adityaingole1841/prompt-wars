import React, { useState, useEffect } from 'react';
import {
  HeartHandshake,
  PhoneCall,
  MapPin,
  Clock,
  Globe,
  Search,
  ExternalLink,
  Sparkles,
  Shield,
  AlertTriangle,
  Play,
  Pause,
  RotateCcw,
} from 'lucide-react';
import {
  TELE_MANAS_INFO,
  CRISIS_HELPLINES,
  REGIONAL_CENTERS,
  PsychologistCenter,
} from '../data/mentalHealthData';
import { UserLocation } from '../types/emergency';

interface MentalHealthSectionProps {
  userLocation: UserLocation | null;
}

export const MentalHealthSection: React.FC<MentalHealthSectionProps> = ({ userLocation }) => {
  const [selectedCity, setSelectedCity] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Box Breathing Exercise State
  const [isBreathingActive, setIsBreathingActive] = useState<boolean>(false);
  const [breathingStep, setBreathingStep] = useState<'Inhale' | 'Hold (In)' | 'Exhale' | 'Hold (Out)'>('Inhale');
  const [countdown, setCountdown] = useState<number>(4);

  // Box Breathing Timer logic (4-4-4-4 seconds)
  useEffect(() => {
    if (!isBreathingActive) return;

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev > 1) {
          return prev - 1;
        } else {
          // Switch to next breathing phase
          setBreathingStep((currentStep) => {
            if (currentStep === 'Inhale') return 'Hold (In)';
            if (currentStep === 'Hold (In)') return 'Exhale';
            if (currentStep === 'Exhale') return 'Hold (Out)';
            return 'Inhale';
          });
          return 4;
        }
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isBreathingActive, breathingStep]);

  const toggleBreathing = () => {
    if (isBreathingActive) {
      setIsBreathingActive(false);
    } else {
      setBreathingStep('Inhale');
      setCountdown(4);
      setIsBreathingActive(true);
    }
  };

  const resetBreathing = () => {
    setIsBreathingActive(false);
    setBreathingStep('Inhale');
    setCountdown(4);
  };

  // Filter Centers by city and search query
  const filteredCenters = REGIONAL_CENTERS.filter((center: PsychologistCenter) => {
    const matchesCity = selectedCity === 'All' || center.city === selectedCity;
    const matchesSearch =
      searchQuery.trim() === '' ||
      center.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      center.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      center.languages.some((l) => l.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCity && matchesSearch;
  });

  const cityOptions = ['All', 'Delhi NCR', 'Bengaluru', 'Mumbai', 'Chennai', 'Hyderabad', 'Kolkata', 'Pune'];

  // Google Maps Dynamic URL
  const mapsSearchUrl = userLocation
    ? `https://www.google.com/maps/search/psychologist+or+counselor/@${userLocation.latitude},${userLocation.longitude},14z`
    : `https://www.google.com/maps/search/psychologists+counselor+near+me`;

  return (
    <section className="mental-health-section" id="mental-health-section" aria-label="Mental Health Support">
      {/* Section Header */}
      <div className="section-intro">
        <div className="section-badge">
          <HeartHandshake size={18} aria-hidden="true" />
          <span>Compassionate Mental Health & Crisis Care</span>
        </div>
        <h2 className="section-title">Mental Health Support & Tele-MANAS</h2>
        <p className="section-subtitle">
          If you or someone near you is going through emotional distress, anxiety, depression, or a mental health crisis, free professional help is available 24/7 across India.
        </p>
      </div>

      {/* Primary Tele-MANAS Hero Call Card */}
      <div className="tele-manas-hero-card">
        <div className="tele-manas-content">
          <div className="tele-manas-badge">
            <Sparkles size={16} />
            <span>Official Govt. of India 24/7 Mental Health Helpline</span>
          </div>
          <h3 className="tele-manas-title">{TELE_MANAS_INFO.title}</h3>
          <p className="tele-manas-authority">{TELE_MANAS_INFO.authority}</p>
          <p className="tele-manas-desc">{TELE_MANAS_INFO.description}</p>

          <div className="tele-manas-features">
            <span className="feature-pill">✓ Always 100% Free & Toll-Free</span>
            <span className="feature-pill">✓ 24/7 Available Round-the-Clock</span>
            <span className="feature-pill">✓ 20+ Indian Languages</span>
            <span className="feature-pill">✓ Confidential & Anonymous</span>
          </div>

          <div className="tele-manas-call-row">
            <a
              href={`tel:${TELE_MANAS_INFO.shortCode}`}
              className="btn-call-telemanas"
              aria-label={`Call Tele-MANAS on short code ${TELE_MANAS_INFO.shortCode}`}
            >
              <PhoneCall size={22} aria-hidden="true" />
              <span>Call Tele-MANAS: {TELE_MANAS_INFO.shortCode}</span>
            </a>

            <a
              href={`tel:${TELE_MANAS_INFO.tollFree.replace(/[^0-9]/g, '')}`}
              className="btn-call-tollfree"
              aria-label={`Call Tele-MANAS toll-free on ${TELE_MANAS_INFO.tollFree}`}
            >
              <PhoneCall size={18} aria-hidden="true" />
              <span>Toll-Free: {TELE_MANAS_INFO.tollFree}</span>
            </a>
          </div>
        </div>
      </div>

      {/* Immediate Crisis Self-Harm Alert Notice */}
      <div className="crisis-warning-box" role="alert">
        <AlertTriangle size={20} className="flex-shrink-0" />
        <div>
          <strong>Immediate Safety Concern:</strong> If there is an imminent risk of self-harm or physical danger, please call <strong>112</strong> (Unified Emergency) or <strong>14416</strong> immediately. You do not have to carry this alone.
        </div>
      </div>

      {/* Interactive Box Breathing Grounding Tool */}
      <div className="breathing-card">
        <div className="breathing-header">
          <div>
            <h3 className="breathing-title">Grounding Exercise: 4-4-4-4 Box Breathing</h3>
            <p className="breathing-desc">
              Regulate your nervous system during panic attacks, racing thoughts, or overwhelming stress.
            </p>
          </div>
          <div className="breathing-controls">
            <button
              type="button"
              className="btn-breathing-toggle"
              onClick={toggleBreathing}
              aria-label={isBreathingActive ? 'Pause breathing exercise' : 'Start breathing exercise'}
            >
              {isBreathingActive ? <Pause size={16} /> : <Play size={16} />}
              <span>{isBreathingActive ? 'Pause' : 'Start Guided Breath'}</span>
            </button>
            {isBreathingActive && (
              <button
                type="button"
                className="btn-breathing-reset"
                onClick={resetBreathing}
                aria-label="Reset breathing exercise"
              >
                <RotateCcw size={16} />
              </button>
            )}
          </div>
        </div>

        <div className="breathing-visual-wrap">
          <div
            className={`breathing-circle ${isBreathingActive ? `phase-${breathingStep.toLowerCase().replace(/[^a-z]/g, '')}` : ''}`}
          >
            <div className="breathing-phase-text">{breathingStep}</div>
            <div className="breathing-timer-text">{countdown}s</div>
          </div>
          <div className="breathing-instructions">
            <span>Inhale (4s)</span> → <span>Hold (4s)</span> → <span>Exhale (4s)</span> → <span>Hold (4s)</span>
          </div>
        </div>
      </div>

      {/* Find Psychologists & Centers Near You */}
      <div className="centers-section">
        <div className="centers-header">
          <div>
            <h3 className="centers-title">Find Certified Psychologists & Clinics Near You</h3>
            <p className="centers-subtitle">
              Locate registered clinical psychologists, psychiatric hospital OPDs, and reputable counseling centers in your area.
            </p>
          </div>

          <a
            href={mapsSearchUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-maps-search"
            aria-label="Find psychologists near me on Google Maps"
          >
            <MapPin size={18} />
            <span>Find on Google Maps</span>
            <ExternalLink size={14} />
          </a>
        </div>

        {/* City Filter & Search Bar */}
        <div className="filters-row">
          <div className="city-pills-wrap">
            {cityOptions.map((city) => (
              <button
                key={city}
                type="button"
                className={`city-pill ${selectedCity === city ? 'active' : ''}`}
                onClick={() => setSelectedCity(city)}
              >
                {city}
              </button>
            ))}
          </div>

          <div className="search-input-wrap">
            <Search size={16} className="search-icon" aria-hidden="true" />
            <input
              type="text"
              placeholder="Search by center, city, or language..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
              aria-label="Search psychologists"
            />
          </div>
        </div>

        {/* Centers Cards Grid */}
        <div className="centers-grid">
          {filteredCenters.map((center) => (
            <div key={center.id} className="center-card">
              <div className="center-card-top">
                <span className={`type-badge type-${center.type.toLowerCase().replace(/[^a-z]/g, '')}`}>
                  {center.type}
                </span>
                <span className="fee-badge">{center.feeType}</span>
              </div>

              <h4 className="center-name">{center.name}</h4>
              <p className="center-city-state">{center.city}, {center.state}</p>

              <div className="center-details">
                <div className="center-detail-item">
                  <MapPin size={15} className="detail-icon" />
                  <span>{center.address}</span>
                </div>
                <div className="center-detail-item">
                  <Clock size={15} className="detail-icon" />
                  <span>{center.hours}</span>
                </div>
                <div className="center-detail-item">
                  <Globe size={15} className="detail-icon" />
                  <span>Languages: {center.languages.join(', ')}</span>
                </div>
              </div>

              <div className="center-actions">
                <a
                  href={`tel:${center.phone.replace(/[^0-9]/g, '')}`}
                  className="btn-card-call"
                  aria-label={`Call ${center.name} on ${center.phone}`}
                >
                  <PhoneCall size={15} />
                  <span>Call: {center.phone}</span>
                </a>
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(center.mapsQuery)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-card-map"
                  aria-label={`Open map directions for ${center.name}`}
                >
                  <MapPin size={15} />
                  <span>Directions</span>
                </a>
              </div>
            </div>
          ))}
        </div>

        {filteredCenters.length === 0 && (
          <div className="no-centers-found">
            <p>No centers matched your search query.</p>
            <a
              href={`https://www.google.com/maps/search/psychologist+or+counselor+in+${encodeURIComponent(searchQuery || selectedCity)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary"
              style={{ marginTop: '0.75rem' }}
            >
              Search for "{searchQuery || selectedCity}" on Google Maps
            </a>
          </div>
        )}
      </div>

      {/* All Indian 24/7 Mental Health Crisis Helplines Directory */}
      <div className="crisis-helplines-card">
        <h3 className="card-title" style={{ fontSize: '1.125rem', marginBottom: '0.5rem' }}>
          <Shield size={20} color="#0d9488" />
          Verified Indian Mental Health & Crisis Helplines
        </h3>
        <p style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '1rem' }}>
          Free, confidential telephone support provided by qualified counselors and government authorities.
        </p>

        <div className="helplines-table-wrap">
          {CRISIS_HELPLINES.map((item) => (
            <div key={item.id} className="crisis-row-item">
              <div className="crisis-row-info">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <strong style={{ fontSize: '0.9375rem', color: '#0f172a' }}>{item.name}</strong>
                  {item.isPrimary && (
                    <span style={{ fontSize: '0.7rem', padding: '0.15rem 0.5rem', borderRadius: '999px', backgroundColor: '#ccfbf1', color: '#0f766e', fontWeight: 700 }}>
                      Govt. Primary
                    </span>
                  )}
                </div>
                <p style={{ fontSize: '0.8125rem', color: '#475569', marginTop: '0.2rem' }}>
                  {item.description}
                </p>
                <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.25rem' }}>
                  <span>🕒 {item.availability}</span> • <span>🌐 {item.languages}</span>
                </div>
              </div>

              <a
                href={`tel:${item.rawPhone}`}
                className="btn-crisis-dial"
                aria-label={`Call ${item.name} at ${item.phone}`}
              >
                <PhoneCall size={15} />
                <span>{item.phone}</span>
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
