import React, { useState, useEffect, useRef } from 'react';
import {
  Activity,
  CheckCircle2,
  XCircle,
  Play,
  Volume2,
  VolumeX,
  RefreshCw,
  Smartphone,
  ShieldCheck,
  Wifi,
  WifiOff,
  Send,
  Terminal,
  Copy,
  Check,
  FlaskConical,
} from 'lucide-react';
import { SupportedLanguage, UserLocation } from '../types/emergency';
import { generateSafeFallbackResponse } from '../utils/fallback';
import { validateEmergencyResponse } from '../utils/validation';
import { fetchUnifiedWeather } from '../services/weatherService';

interface DiagnosticResult {
  id: string;
  name: string;
  category: 'core' | 'ai' | 'audio' | 'network' | 'storage';
  status: 'idle' | 'running' | 'passed' | 'failed';
  latencyMs?: number;
  details?: string;
}

interface TestingHubProps {
  currentLanguage?: SupportedLanguage;
  onSimulateScenario?: (scenario: {
    description: string;
    location: UserLocation;
    urgency: 'HIGH' | 'CRITICAL';
  }) => void;
  onTriggerAlert?: (urgency: 'HIGH' | 'CRITICAL') => void;
}

export const TestingHub: React.FC<TestingHubProps> = ({
  currentLanguage: _currentLanguage,
  onSimulateScenario,
  onTriggerAlert,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'diagnostics' | 'scenarios' | 'classifier' | 'cli'>('diagnostics');

  // Diagnostics State
  const [isRunningAll, setIsRunningAll] = useState(false);
  const [diagnostics, setDiagnostics] = useState<DiagnosticResult[]>([
    { id: 'backend_api', name: 'Backend API Server (/api/health)', category: 'network', status: 'idle' },
    { id: 'weather_service', name: 'Live Weather & Geocoding Service', category: 'core', status: 'idle' },
    { id: 'ai_engine', name: 'Emergency Rule Engine & Fallback', category: 'ai', status: 'idle' },
    { id: 'audio_siren', name: 'Emergency Siren Web Audio Synthesizer', category: 'audio', status: 'idle' },
    { id: 'browser_notif', name: 'Browser Push Notification Capability', category: 'core', status: 'idle' },
    { id: 'geolocation', name: 'Browser Geolocation Sensor', category: 'core', status: 'idle' },
    { id: 'local_storage', name: 'Offline Storage & Cache Integrity', category: 'storage', status: 'idle' },
  ]);

  // Audio Siren State
  const [isPlayingSiren, setIsPlayingSiren] = useState(false);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const sirenOscRef = useRef<OscillatorNode | null>(null);
  const sirenIntervalRef = useRef<number | null>(null);

  // Multilingual Classifier Playground State
  const [testPrompt, setTestPrompt] = useState('Severe chest pain and sudden shortness of breath');
  const [testLang, setTestLang] = useState<SupportedLanguage>('en');
  const [classifierResult, setClassifierResult] = useState<any>(null);
  const [isClassifying, setIsClassifying] = useState(false);

  // Offline Simulation State
  const [simulatedOffline, setSimulatedOffline] = useState(false);

  // Copied CLI command state
  const [copiedCmd, setCopiedCmd] = useState<string | null>(null);

  // Stop siren on unmount
  useEffect(() => {
    return () => {
      stopSiren();
    };
  }, []);

  const handleCopy = (text: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedCmd(text);
    setTimeout(() => setCopiedCmd(null), 2000);
  };

  /* ─────────────────────────────────────────────────────────────
     AUDIO SYNTHESIZER (880Hz / 660Hz Alternating European/Indian Siren)
  ───────────────────────────────────────────────────────────── */
  const startSiren = () => {
    try {
      stopSiren();
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) {
        alert('Web Audio API not supported on this browser.');
        return;
      }

      const ctx = new AudioCtx();
      audioCtxRef.current = ctx;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      gain.gain.setValueAtTime(0.12, ctx.currentTime); // Safe pleasant volume

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      sirenOscRef.current = osc;

      let highTone = true;
      const interval = window.setInterval(() => {
        if (!audioCtxRef.current || !sirenOscRef.current) return;
        highTone = !highTone;
        sirenOscRef.current.frequency.setValueAtTime(highTone ? 880 : 660, audioCtxRef.current.currentTime);
      }, 350);

      sirenIntervalRef.current = interval;
      setIsPlayingSiren(true);
    } catch (err) {
      console.error('Audio synthesizer error:', err);
    }
  };

  const stopSiren = () => {
    if (sirenIntervalRef.current) {
      clearInterval(sirenIntervalRef.current);
      sirenIntervalRef.current = null;
    }
    if (sirenOscRef.current) {
      try {
        sirenOscRef.current.stop();
        sirenOscRef.current.disconnect();
      } catch {
        // ignore
      }
      sirenOscRef.current = null;
    }
    if (audioCtxRef.current) {
      try {
        audioCtxRef.current.close();
      } catch {
        // ignore
      }
      audioCtxRef.current = null;
    }
    setIsPlayingSiren(false);
  };

  /* ─────────────────────────────────────────────────────────────
     DIAGNOSTICS SUITE RUNNER
  ───────────────────────────────────────────────────────────── */
  const runDiagnostic = async (id: string): Promise<void> => {
    const updateItem = (status: DiagnosticResult['status'], latency?: number, details?: string) => {
      setDiagnostics((prev) =>
        prev.map((d) => (d.id === id ? { ...d, status, latencyMs: latency, details } : d))
      );
    };

    updateItem('running');
    const start = Date.now();

    try {
      if (id === 'backend_api') {
        const res = await fetch('http://localhost:3001/api/health', { signal: AbortSignal.timeout(3000) });
        const latency = Date.now() - start;
        if (res.ok) {
          const json = await res.json();
          updateItem('passed', latency, `HTTP 200 OK — ${json.languages?.length || 13} Languages Active, Gemini: ${json.hasGeminiKey ? 'Active' : 'Fallback'}`);
        } else {
          updateItem('failed', latency, `HTTP ${res.status}`);
        }
      } else if (id === 'weather_service') {
        const weather = await fetchUnifiedWeather(19.076, 72.8777); // Mumbai
        const latency = Date.now() - start;
        if (weather && weather.current) {
          updateItem('passed', latency, `Fetched ${weather.current.cityName}: ${weather.current.temperature}°C, ${weather.current.humidity}% humidity`);
        } else {
          updateItem('failed', latency, 'Empty response from weather service');
        }
      } else if (id === 'ai_engine') {
        const res = generateSafeFallbackResponse('Heart attack with chest pain and sweating', null, 'en');
        const validation = validateEmergencyResponse(res);
        const latency = Date.now() - start;
        if (validation.isValid && res.urgency === 'CRITICAL') {
          updateItem('passed', latency, `Validated strict RFC schema in ${latency}ms (Urgency: ${res.urgency}, Type: ${res.situation_type})`);
        } else {
          const errMsg = !validation.isValid && 'errors' in validation ? (validation as any).errors?.join(', ') : 'Urgency mismatch';
          updateItem('failed', latency, `Schema validation failed: ${errMsg}`);
        }
      } else if (id === 'audio_siren') {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        const latency = Date.now() - start;
        if (AudioCtx) {
          updateItem('passed', latency, 'Web Audio API supported and ready for emergency alarm');
        } else {
          updateItem('failed', latency, 'Web Audio API not supported on this browser');
        }
      } else if (id === 'browser_notif') {
        const latency = Date.now() - start;
        if (!('Notification' in window)) {
          updateItem('failed', latency, 'Notification API unsupported in this browser');
        } else {
          updateItem('passed', latency, `Notification API available (Permission: ${Notification.permission})`);
        }
      } else if (id === 'geolocation') {
        const latency = Date.now() - start;
        if (!('geolocation' in navigator)) {
          updateItem('failed', latency, 'Geolocation API unsupported');
        } else {
          updateItem('passed', latency, 'HTML5 Geolocation sensor interface available');
        }
      } else if (id === 'local_storage') {
        const testKey = '__eh_diag_test__';
        localStorage.setItem(testKey, 'valid_payload');
        const retrieved = localStorage.getItem(testKey);
        localStorage.removeItem(testKey);
        const latency = Date.now() - start;
        if (retrieved === 'valid_payload') {
          updateItem('passed', latency, `Read/write verified in ${latency}ms`);
        } else {
          updateItem('failed', latency, 'Storage read/write mismatch');
        }
      }
    } catch (err: any) {
      updateItem('failed', Date.now() - start, err?.message || 'Network / runtime exception');
    }
  };

  const runAllDiagnostics = async () => {
    setIsRunningAll(true);
    for (const d of diagnostics) {
      await runDiagnostic(d.id);
    }
    setIsRunningAll(false);
  };

  /* ─────────────────────────────────────────────────────────────
     CLASSIFIER PLAYGROUND
  ───────────────────────────────────────────────────────────── */
  const handleTestClassifier = () => {
    setIsClassifying(true);
    const start = performance.now();
    try {
      const res = generateSafeFallbackResponse(testPrompt, null, testLang);
      const validation = validateEmergencyResponse(res);
      const durationMs = Math.round(performance.now() - start);
      setClassifierResult({
        ...res,
        _validation: validation,
        _durationMs: durationMs,
      });
    } catch (err: any) {
      setClassifierResult({
        error: err?.message || 'Failed to classify emergency',
      });
    } finally {
      setIsClassifying(false);
    }
  };

  // Pre-configured Indian emergency test scenarios
  const PRESET_SCENARIOS = [
    {
      title: '🌊 Mumbai Coastal Cloudburst & Severe Flooding',
      category: 'flood',
      urgency: 'HIGH' as const,
      city: 'Mumbai, Maharashtra',
      coords: { latitude: 18.922, longitude: 72.8346, formattedText: 'Dadar, Mumbai', timestamp: Date.now() },
      description: 'Severe cloudburst with waterlogging exceeding 4 feet. Railway lines submerged, water entering ground-floor residential buildings.',
    },
    {
      title: '🔥 Delhi Industrial Complex Chemical Fire',
      category: 'fire',
      urgency: 'CRITICAL' as const,
      city: 'Bawana, Delhi',
      coords: { latitude: 28.7963, longitude: 77.0543, formattedText: 'Bawana Industrial Area, Delhi', timestamp: Date.now() },
      description: 'Massive chemical warehouse fire with thick black toxic fumes spreading toward residential quarters. Multiple workers trapped inside.',
    },
    {
      title: '🌀 Odisha Coastal Super Cyclone Evacuation',
      category: 'natural disaster',
      urgency: 'CRITICAL' as const,
      city: 'Puri, Odisha',
      coords: { latitude: 19.8135, longitude: 85.8312, formattedText: 'Puri Coast, Odisha', timestamp: Date.now() },
      description: 'Gale winds exceeding 110 km/h with 3-meter storm surge approaching coast. Power grid collapsed, immediate shelter evacuation required.',
    },
    {
      title: '🫀 Rural Pune Acute Cardiac Arrest & Unconsciousness',
      category: 'medical emergency',
      urgency: 'CRITICAL' as const,
      city: 'Khed, Pune',
      coords: { latitude: 18.8475, longitude: 73.9079, formattedText: 'Khed, Pune District', timestamp: Date.now() },
      description: 'Senior citizen collapsed suddenly while working in field, unresponsive, no pulse felt. Seeking immediate CPR instructions while awaiting ambulance.',
    },
    {
      title: '🚗 Bengaluru Peripheral Ring Road Multi-Car Crash',
      category: 'accident',
      urgency: 'CRITICAL' as const,
      city: 'Electronic City, Bengaluru',
      coords: { latitude: 12.8452, longitude: 77.6602, formattedText: 'Electronic City Flyover, Bengaluru', timestamp: Date.now() },
      description: 'High-speed 4-vehicle collision on highway. Two passengers trapped inside damaged vehicle with heavy bleeding. Fuel leaking on tarmac.',
    },
    {
      title: '⛰️ Kedarnath Himalayan Landslide & Flash Flood',
      category: 'natural disaster',
      urgency: 'CRITICAL' as const,
      city: 'Rudraprayag, Uttarakhand',
      coords: { latitude: 30.7346, longitude: 79.0669, formattedText: 'Kedarnath Valley, Uttarakhand', timestamp: Date.now() },
      description: 'Sudden cloudburst triggered debris flow and landslide blocking main pilgrim route. Pilgrims stranded on steep ridge without shelter.',
    },
  ];

  return (
    <div className="testing-hub-container" style={{ maxWidth: '1100px', margin: '0 auto', padding: '1rem 0 3rem' }}>
      {/* Top Banner */}
      <div
        style={{
          background: 'linear-gradient(135deg, rgba(37, 99, 235, 0.08), rgba(99, 102, 241, 0.12))',
          border: '1px solid rgba(99, 102, 241, 0.25)',
          borderRadius: '16px',
          padding: '1.5rem',
          marginBottom: '1.5rem',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              backgroundColor: '#3b82f6',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              boxShadow: '0 4px 14px rgba(59, 130, 246, 0.4)',
            }}
          >
            <FlaskConical size={26} />
          </div>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.35rem', fontWeight: 800, color: 'var(--color-primary-text, #0f172a)' }}>
              Emergency System Diagnostics & Test Hub
            </h2>
            <p style={{ margin: '0.2rem 0 0', fontSize: '0.875rem', color: '#64748b' }}>
              Real-time interactive diagnostics, audio siren simulation, emergency scenario stress testing, and CLI test verification.
            </p>
          </div>
        </div>

        {/* Offline Mode Simulator Toggle */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            backgroundColor: simulatedOffline ? '#fee2e2' : 'var(--color-surface, #ffffff)',
            border: `1px solid ${simulatedOffline ? '#ef4444' : '#cbd5e1'}`,
            padding: '0.5rem 0.85rem',
            borderRadius: '10px',
          }}
        >
          {simulatedOffline ? <WifiOff size={18} color="#dc2626" /> : <Wifi size={18} color="#16a34a" />}
          <span style={{ fontSize: '0.825rem', fontWeight: 600, color: simulatedOffline ? '#991b1b' : '#334155' }}>
            {simulatedOffline ? 'Simulated Offline Mode Active' : 'Network Online'}
          </span>
          <button
            type="button"
            onClick={() => setSimulatedOffline(!simulatedOffline)}
            style={{
              padding: '0.3rem 0.65rem',
              fontSize: '0.75rem',
              fontWeight: 700,
              borderRadius: '6px',
              border: 'none',
              backgroundColor: simulatedOffline ? '#dc2626' : '#2563eb',
              color: '#ffffff',
              cursor: 'pointer',
            }}
          >
            {simulatedOffline ? 'Restore Online' : 'Simulate Offline'}
          </button>
        </div>
      </div>

      {/* Sub Tab Navigation */}
      <div
        style={{
          display: 'flex',
          gap: '0.5rem',
          borderBottom: '2px solid #e2e8f0',
          marginBottom: '1.5rem',
          overflowX: 'auto',
          paddingBottom: '0.25rem',
        }}
      >
        <button
          type="button"
          onClick={() => setActiveSubTab('diagnostics')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.45rem',
            padding: '0.65rem 1.15rem',
            borderRadius: '8px 8px 0 0',
            border: 'none',
            background: activeSubTab === 'diagnostics' ? '#2563eb' : 'transparent',
            color: activeSubTab === 'diagnostics' ? '#ffffff' : '#64748b',
            fontWeight: 700,
            fontSize: '0.9rem',
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
        >
          <Activity size={17} />
          <span>Live Diagnostics</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('scenarios')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.45rem',
            padding: '0.65rem 1.15rem',
            borderRadius: '8px 8px 0 0',
            border: 'none',
            background: activeSubTab === 'scenarios' ? '#2563eb' : 'transparent',
            color: activeSubTab === 'scenarios' ? '#ffffff' : '#64748b',
            fontWeight: 700,
            fontSize: '0.9rem',
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
        >
          <Smartphone size={17} />
          <span>Scenario Simulator</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('classifier')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.45rem',
            padding: '0.65rem 1.15rem',
            borderRadius: '8px 8px 0 0',
            border: 'none',
            background: activeSubTab === 'classifier' ? '#2563eb' : 'transparent',
            color: activeSubTab === 'classifier' ? '#ffffff' : '#64748b',
            fontWeight: 700,
            fontSize: '0.9rem',
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
        >
          <ShieldCheck size={17} />
          <span>Multilingual Classifier Playground</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('cli')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.45rem',
            padding: '0.65rem 1.15rem',
            borderRadius: '8px 8px 0 0',
            border: 'none',
            background: activeSubTab === 'cli' ? '#2563eb' : 'transparent',
            color: activeSubTab === 'cli' ? '#ffffff' : '#64748b',
            fontWeight: 700,
            fontSize: '0.9rem',
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
        >
          <Terminal size={17} />
          <span>CLI Test Suites</span>
        </button>
      </div>

      {/* ─────────────────────────────────────────────────────────────
         TAB 1: LIVE DIAGNOSTICS & HARDWARE TESTER
      ───────────────────────────────────────────────────────────── */}
      {activeSubTab === 'diagnostics' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Action Row */}
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'space-between',
              alignItems: 'center',
              backgroundColor: 'var(--color-surface, #ffffff)',
              padding: '1rem 1.25rem',
              borderRadius: '12px',
              border: '1px solid #e2e8f0',
              boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
            }}
          >
            <div>
              <div style={{ fontWeight: 800, fontSize: '1rem', color: '#0f172a' }}>
                System Readiness Checklist
              </div>
              <div style={{ fontSize: '0.825rem', color: '#64748b' }}>
                Probes all essential subsystem APIs, audio context, geocoding cache, and storage layers.
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
              {/* Siren Test Button */}
              <button
                type="button"
                onClick={isPlayingSiren ? stopSiren : startSiren}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  padding: '0.55rem 1rem',
                  borderRadius: '8px',
                  border: isPlayingSiren ? '2px solid #ef4444' : '1px solid #cbd5e1',
                  backgroundColor: isPlayingSiren ? '#fee2e2' : '#f8fafc',
                  color: isPlayingSiren ? '#dc2626' : '#334155',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                }}
              >
                {isPlayingSiren ? <VolumeX size={17} /> : <Volume2 size={17} />}
                <span>{isPlayingSiren ? 'Stop Siren Test' : 'Test Emergency Siren'}</span>
              </button>

              {/* Run All Button */}
              <button
                type="button"
                onClick={runAllDiagnostics}
                disabled={isRunningAll}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.55rem 1.25rem',
                  borderRadius: '8px',
                  border: 'none',
                  backgroundColor: '#2563eb',
                  color: '#ffffff',
                  fontWeight: 700,
                  fontSize: '0.875rem',
                  cursor: isRunningAll ? 'not-allowed' : 'pointer',
                  opacity: isRunningAll ? 0.7 : 1,
                  boxShadow: '0 2px 8px rgba(37, 99, 235, 0.3)',
                }}
              >
                <RefreshCw size={16} className={isRunningAll ? 'animate-spin' : ''} />
                <span>{isRunningAll ? 'Running Tests…' : 'Run All Diagnostics'}</span>
              </button>
            </div>
          </div>

          {/* Diagnostics Items Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1rem' }}>
            {diagnostics.map((d) => (
              <div
                key={d.id}
                style={{
                  backgroundColor: 'var(--color-surface, #ffffff)',
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  padding: '1rem 1.15rem',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.02)',
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                    <span style={{ fontWeight: 700, fontSize: '0.9rem', color: '#0f172a' }}>{d.name}</span>
                    {d.status === 'idle' && (
                      <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8', background: '#f1f5f9', padding: '2px 8px', borderRadius: '12px' }}>Ready</span>
                    )}
                    {d.status === 'running' && (
                      <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#2563eb', background: '#dbeafe', padding: '2px 8px', borderRadius: '12px' }}>Testing…</span>
                    )}
                    {d.status === 'passed' && (
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem', fontWeight: 700, color: '#16a34a', background: '#dcfce7', padding: '2px 8px', borderRadius: '12px' }}>
                        <CheckCircle2 size={13} />
                        Pass
                      </span>
                    )}
                    {d.status === 'failed' && (
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem', fontWeight: 700, color: '#dc2626', background: '#fee2e2', padding: '2px 8px', borderRadius: '12px' }}>
                        <XCircle size={13} />
                        Fail
                      </span>
                    )}
                  </div>

                  <div style={{ fontSize: '0.8rem', color: '#64748b', minHeight: '36px', lineHeight: 1.4 }}>
                    {d.details || 'Click "Test" to check this subsystem status.'}
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.75rem', paddingTop: '0.5rem', borderTop: '1px solid #f1f5f9' }}>
                  <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontFamily: 'monospace' }}>
                    {d.latencyMs !== undefined ? `${d.latencyMs}ms` : '—'}
                  </span>
                  <button
                    type="button"
                    onClick={() => runDiagnostic(d.id)}
                    style={{
                      background: 'none',
                      border: '1px solid #cbd5e1',
                      borderRadius: '6px',
                      padding: '0.25rem 0.65rem',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      color: '#2563eb',
                      cursor: 'pointer',
                    }}
                  >
                    Test Item
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
         TAB 2: SCENARIO SIMULATOR
      ───────────────────────────────────────────────────────────── */}
      {activeSubTab === 'scenarios' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '10px', padding: '0.85rem 1rem', fontSize: '0.85rem', color: '#1e40af' }}>
            💡 <strong>Interactive Emergency Simulation:</strong> Select any real-world emergency scenario across India. You can simulate the incident in the citizen form or test triggering the high-urgency siren alert banner.
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1rem' }}>
            {PRESET_SCENARIOS.map((sc, idx) => (
              <div
                key={idx}
                style={{
                  backgroundColor: 'var(--color-surface, #ffffff)',
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  padding: '1.15rem',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                    <span style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0f172a' }}>{sc.title}</span>
                    <span
                      style={{
                        fontSize: '0.7rem',
                        fontWeight: 800,
                        padding: '2px 7px',
                        borderRadius: '12px',
                        backgroundColor: sc.urgency === 'CRITICAL' ? '#fee2e2' : '#fef3c7',
                        color: sc.urgency === 'CRITICAL' ? '#991b1b' : '#92400e',
                      }}
                    >
                      {sc.urgency}
                    </span>
                  </div>

                  <div style={{ fontSize: '0.78rem', color: '#2563eb', fontWeight: 600, marginBottom: '0.4rem' }}>
                    📍 {sc.city}
                  </div>

                  <p style={{ fontSize: '0.825rem', color: '#475569', lineHeight: 1.5, margin: '0 0 1rem' }}>
                    {sc.description}
                  </p>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  {onTriggerAlert && (
                    <button
                      type="button"
                      onClick={() => onTriggerAlert(sc.urgency)}
                      style={{
                        flex: 1,
                        padding: '0.5rem',
                        fontSize: '0.78rem',
                        fontWeight: 700,
                        backgroundColor: '#ef4444',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.35rem',
                      }}
                    >
                      <Volume2 size={14} />
                      <span>Trigger Siren Alert</span>
                    </button>
                  )}

                  {onSimulateScenario && (
                    <button
                      type="button"
                      onClick={() =>
                        onSimulateScenario({
                          description: sc.description,
                          location: sc.coords,
                          urgency: sc.urgency,
                        })
                      }
                      style={{
                        flex: 1,
                        padding: '0.5rem',
                        fontSize: '0.78rem',
                        fontWeight: 700,
                        backgroundColor: '#2563eb',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.35rem',
                      }}
                    >
                      <Send size={14} />
                      <span>Load Scenario</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
         TAB 3: MULTILINGUAL CLASSIFIER PLAYGROUND
      ───────────────────────────────────────────────────────────── */}
      {activeSubTab === 'classifier' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
          {/* Left: Input Playground */}
          <div
            style={{
              backgroundColor: 'var(--color-surface, #ffffff)',
              border: '1px solid #e2e8f0',
              borderRadius: '12px',
              padding: '1.25rem',
            }}
          >
            <h3 style={{ fontSize: '1rem', fontWeight: 800, margin: '0 0 0.75rem', color: '#0f172a' }}>
              Input Emergency Prompt
            </h3>

            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem' }}>
              <select
                value={testLang}
                onChange={(e) => setTestLang(e.target.value as SupportedLanguage)}
                style={{
                  padding: '0.45rem 0.75rem',
                  fontSize: '0.85rem',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  fontWeight: 600,
                }}
              >
                <option value="en">English</option>
                <option value="hi">Hindi (हिन्दी)</option>
                <option value="mr">Marathi (मराठी)</option>
                <option value="bn">Bengali (বাংলা)</option>
                <option value="te">Telugu (తెలుగు)</option>
                <option value="ta">Tamil (தமிழ்)</option>
                <option value="gu">Gujarati (ગુજરાતી)</option>
              </select>

              {/* Sample phrases */}
              <button
                type="button"
                onClick={() => setTestPrompt('सीने में बहुत तेज दर्द हो रहा है और बहुत पसीना आ रहा है')}
                style={{ fontSize: '0.75rem', padding: '0.35rem 0.6rem', borderRadius: '6px', border: '1px solid #cbd5e1', cursor: 'pointer' }}
              >
                Hindi Cardiac
              </button>
              <button
                type="button"
                onClick={() => setTestPrompt('श्वास थांबला आहे आणि छातीत तीव्र कळ येत आहे तातडीने मदत हवी')}
                style={{ fontSize: '0.75rem', padding: '0.35rem 0.6rem', borderRadius: '6px', border: '1px solid #cbd5e1', cursor: 'pointer' }}
              >
                Marathi CPR
              </button>
            </div>

            <textarea
              value={testPrompt}
              onChange={(e) => setTestPrompt(e.target.value)}
              rows={5}
              style={{
                width: '100%',
                padding: '0.75rem',
                fontSize: '0.9rem',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                fontFamily: 'inherit',
                boxSizing: 'border-box',
                marginBottom: '1rem',
              }}
              placeholder="Type any emergency description in any Indian language…"
            />

            <button
              type="button"
              onClick={handleTestClassifier}
              disabled={isClassifying || !testPrompt.trim()}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.45rem',
                padding: '0.65rem 1.25rem',
                backgroundColor: '#2563eb',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                fontWeight: 700,
                fontSize: '0.875rem',
                cursor: 'pointer',
              }}
            >
              <Play size={15} />
              <span>{isClassifying ? 'Analyzing…' : 'Classify Emergency'}</span>
            </button>
          </div>

          {/* Right: Output Inspection */}
          <div
            style={{
              backgroundColor: 'var(--color-surface, #ffffff)',
              border: '1px solid #e2e8f0',
              borderRadius: '12px',
              padding: '1.25rem',
            }}
          >
            <h3 style={{ fontSize: '1rem', fontWeight: 800, margin: '0 0 0.75rem', color: '#0f172a' }}>
              Safety Engine Output & RFC Schema
            </h3>

            {classifierResult ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span
                      style={{
                        padding: '4px 10px',
                        borderRadius: '20px',
                        fontSize: '0.8rem',
                        fontWeight: 800,
                        backgroundColor:
                          classifierResult.urgency === 'CRITICAL'
                            ? '#fee2e2'
                            : classifierResult.urgency === 'HIGH'
                            ? '#ffedd5'
                            : '#dcfce7',
                        color:
                          classifierResult.urgency === 'CRITICAL'
                            ? '#991b1b'
                            : classifierResult.urgency === 'HIGH'
                            ? '#c2410c'
                            : '#15803d',
                      }}
                    >
                      {classifierResult.urgency}
                    </span>
                    <span style={{ fontSize: '0.825rem', fontWeight: 700, color: '#334155' }}>
                      {classifierResult.situation_type}
                    </span>
                  </div>

                  <span style={{ fontSize: '0.75rem', color: '#64748b', fontFamily: 'monospace' }}>
                    {classifierResult._durationMs}ms latency
                  </span>
                </div>

                <div style={{ fontSize: '0.85rem', color: '#1e293b', background: '#f8fafc', padding: '0.75rem', borderRadius: '8px' }}>
                  <strong>Summary:</strong> {classifierResult.short_summary}
                </div>

                {classifierResult.summary_for_call && (
                  <div style={{ fontSize: '0.85rem', color: '#0369a1', background: '#f0f9ff', border: '1px solid #bae6fd', padding: '0.75rem', borderRadius: '8px' }}>
                    <strong>112 Operator Script:</strong> "{classifierResult.summary_for_call}"
                  </div>
                )}

                {classifierResult._validation && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.78rem', color: classifierResult._validation.isValid ? '#16a34a' : '#dc2626' }}>
                    {classifierResult._validation.isValid ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
                    <span>{classifierResult._validation.isValid ? 'Strict RFC schema validated successfully' : 'Schema validation failed'}</span>
                  </div>
                )}
              </div>
            ) : (
              <div style={{ color: '#94a3b8', fontSize: '0.85rem', textAlign: 'center', padding: '2rem' }}>
                Enter text and click "Classify Emergency" to test the AI safety classification.
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
         TAB 4: CLI TEST SUITES & AUTOMATION
      ───────────────────────────────────────────────────────────── */}
      {activeSubTab === 'cli' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div
            style={{
              backgroundColor: '#0f172a',
              color: '#f8fafc',
              borderRadius: '12px',
              padding: '1.25rem',
              fontFamily: 'monospace',
              fontSize: '0.85rem',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', borderBottom: '1px solid #334155', paddingBottom: '0.5rem' }}>
              <span style={{ color: '#38bdf8', fontWeight: 700 }}>Run All Automated Tests:</span>
              <button
                type="button"
                onClick={() => handleCopy('npm test')}
                style={{
                  background: '#1e293b',
                  color: '#f1f5f9',
                  border: '1px solid #475569',
                  borderRadius: '6px',
                  padding: '3px 9px',
                  cursor: 'pointer',
                  fontSize: '0.75rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                }}
              >
                {copiedCmd === 'npm test' ? <Check size={13} color="#22c55e" /> : <Copy size={13} />}
                <span>{copiedCmd === 'npm test' ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
            <div style={{ color: '#4ade80' }}>$ npm test</div>
            <div style={{ color: '#94a3b8', marginTop: '0.35rem' }}>
              Runs all 5 test suites sequentially (Multilingual rules, Chat safety, Weather caching, Server API, and Image optimizer).
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
            {[
              {
                title: 'Multilingual & Safety Rules',
                cmd: 'npm run test:safety',
                desc: '25 tests validating Hindi, Marathi, Hinglish, strict RFC schema, and Section 4 alert templates.',
              },
              {
                title: 'Chat Safety Engine',
                cmd: 'npm run test:chat',
                desc: '25 tests validating CPR protocols, stroke F.A.S.T., Tele-MANAS 14416 routing, and greetings.',
              },
              {
                title: 'Weather & Geocoding Service',
                cmd: 'npm run test:weather',
                desc: '15 tests validating in-flight deduplication, 10-minute caching, and 3.5s timeout resilience.',
              },
              {
                title: 'Server API Endpoints',
                cmd: 'npm run test:api',
                desc: '26 tests validating /api/health, /api/chat, /api/analyze-emergency, and notifications.',
              },
              {
                title: 'Client-Side Image Optimizer',
                cmd: 'npm run test:image',
                desc: '7 tests validating non-image rejection, 1200px dimension bounding, and EXIF stripping math.',
              },
            ].map((suite, idx) => (
              <div
                key={idx}
                style={{
                  backgroundColor: 'var(--color-surface, #ffffff)',
                  border: '1px solid #e2e8f0',
                  borderRadius: '10px',
                  padding: '1rem',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                }}
              >
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#0f172a', marginBottom: '0.35rem' }}>
                    {suite.title}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#64748b', lineHeight: 1.4, marginBottom: '0.75rem' }}>
                    {suite.desc}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#f8fafc', padding: '0.4rem 0.6rem', borderRadius: '6px' }}>
                  <code style={{ fontSize: '0.75rem', color: '#2563eb' }}>{suite.cmd}</code>
                  <button
                    type="button"
                    onClick={() => handleCopy(suite.cmd)}
                    style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', padding: '2px' }}
                    title="Copy command"
                  >
                    {copiedCmd === suite.cmd ? <Check size={14} color="#16a34a" /> : <Copy size={14} />}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
