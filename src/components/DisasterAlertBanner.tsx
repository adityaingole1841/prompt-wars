import React, { useState, useEffect, useCallback, memo } from 'react';
import { fetchUnifiedWeather } from '../services/weatherService';
import {
  AlertTriangle,
  CloudRain,
  Thermometer,
  Wind,
  CloudSnow,
  CloudFog,
  ShieldAlert,
  RefreshCw,
  MapPin,
  ChevronDown,
  ChevronUp,
  Siren,
} from 'lucide-react';
import { SupportedLanguage } from '../types/emergency';

/* ─────────────── Types ─────────────── */
type AlertLevel = 'RED' | 'ORANGE' | 'YELLOW' | 'GREEN';
type DisasterType =
  | 'FLOOD'
  | 'HEATWAVE'
  | 'COLDWAVE'
  | 'CYCLONE_STORM'
  | 'HEAVY_RAIN'
  | 'DENSE_FOG'
  | 'THUNDERSTORM'
  | 'SNOWFALL';

interface DayAlert {
  date: Date;
  level: AlertLevel;
  type: DisasterType;
  label: Partial<Record<SupportedLanguage, string>> & { en: string };
  advice: Partial<Record<SupportedLanguage, string>> & { en: string };
  icon: React.ReactNode;
  stats: string; // e.g. "98mm, 65km/h wind"
}

interface ForecastDay {
  date: string;
  precipSum: number;
  tempMax: number;
  tempMin: number;
  windMax: number;
  weatherCode: number;
  uvMax: number;
  snowfallSum: number;
  visibilityMin: number; // not available in daily — derived
}

interface DisasterAlertBannerProps {
  language: SupportedLanguage;
}

/* ─────────────── Day label helpers ─────────────── */
const DAY_LABELS: Record<string, (d: Date) => string> = {
  en: (d) => {
    const today = new Date();
    const diff = Math.round((d.setHours(0,0,0,0) - today.setHours(0,0,0,0)) / 86400000);
    if (diff === 0) return 'Today';
    if (diff === 1) return 'Tomorrow';
    return d.toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' });
  },
  hi: (d) => {
    const today = new Date();
    const diff = Math.round((d.setHours(0,0,0,0) - today.setHours(0,0,0,0)) / 86400000);
    if (diff === 0) return 'आज';
    if (diff === 1) return 'कल';
    return d.toLocaleDateString('hi-IN', { weekday: 'short', month: 'short', day: 'numeric' });
  },
  mr: (d) => {
    const today = new Date();
    const diff = Math.round((d.setHours(0,0,0,0) - today.setHours(0,0,0,0)) / 86400000);
    if (diff === 0) return 'आज';
    if (diff === 1) return 'उद्या';
    return d.toLocaleDateString('mr-IN', { weekday: 'short', month: 'short', day: 'numeric' });
  },
};

/* ─────────────── Alert Level color/label ─────────────── */
const LEVEL_META: Record<AlertLevel, {
  color: string;
  bg: string;
  border: string;
  badge: Partial<Record<SupportedLanguage, string>> & { en: string };
}> = {
  RED: {
    color: '#7f1d1d',
    bg: '#fef2f2',
    border: '#f87171',
    badge: { en: 'RED ALERT', hi: 'लाल चेतावनी', mr: 'लाल सतर्कता' },
  },
  ORANGE: {
    color: '#7c2d12',
    bg: '#fff7ed',
    border: '#fb923c',
    badge: { en: 'ORANGE WARNING', hi: 'नारंगी चेतावनी', mr: 'केशरी इशारा' },
  },
  YELLOW: {
    color: '#713f12',
    bg: '#fefce8',
    border: '#facc15',
    badge: { en: 'YELLOW WATCH', hi: 'पीली सतर्कता', mr: 'पिवळी नजर' },
  },
  GREEN: {
    color: '#14532d',
    bg: '#f0fdf4',
    border: '#86efac',
    badge: { en: 'ALL CLEAR', hi: 'सब ठीक', mr: 'सुरक्षित' },
  },
};

/* ─────────────── Disaster type → label & advice ─────────────── */
const DISASTER_META: Record<DisasterType, {
  label: Partial<Record<SupportedLanguage, string>> & { en: string };
  advice: Partial<Record<SupportedLanguage, string>> & { en: string };
  icon: React.ReactNode;
}> = {
  FLOOD: {
    label: { en: 'Flood Risk', hi: 'बाढ़ का खतरा', mr: 'पूर येण्याचा धोका' },
    advice: {
      en: 'Avoid low-lying areas. Do not drive through waterlogged roads. Move valuables to higher floors. Keep 112 and NDRF helpline (1078) ready.',
      hi: 'निचले इलाकों से दूर रहें। जलभराव वाली सड़कों पर गाड़ी न चलाएं। कीमती सामान ऊपरी मंजिल पर ले जाएं। 112 और NDRF (1078) तैयार रखें।',
      mr: 'सखल भागात जाऊ नका. पाणी साचलेल्या रस्त्यावर वाहन चालवू नका. मौल्यवान वस्तू वरच्या मजल्यावर हलवा. 112 व NDRF (1078) तयार ठेवा.',
    },
    icon: <CloudRain size={18} />,
  },
  HEATWAVE: {
    label: { en: 'Heatwave Warning', hi: 'लू चेतावनी', mr: 'उष्णलाट इशारा' },
    advice: {
      en: 'Avoid outdoor activity 12pm–4pm. Drink water every 30 min. Never leave children or elderly in parked cars. Call 108 for heat stroke.',
      hi: 'दोपहर 12 से 4 बजे बाहर न निकलें। हर 30 मिनट में पानी पिएं। गाड़ी में बच्चों या बुजुर्गों को अकेला न छोड़ें। हीट स्ट्रोक पर 108 कॉल करें।',
      mr: 'दुपारी 12 ते 4 बाहेर जाऊ नका. दर 30 मिनिटांनी पाणी प्या. गाडीत मुले/वृद्ध एकटे ठेवू नका. उष्माघातासाठी 108 वर कॉल करा.',
    },
    icon: <Thermometer size={18} />,
  },
  COLDWAVE: {
    label: { en: 'Cold Wave Alert', hi: 'शीत लहर चेतावनी', mr: 'थंडीची लाट इशारा' },
    advice: {
      en: 'Wear multiple layers. Protect infants, elderly, and homeless. Watch for hypothermia signs. Avoid alcohol in cold — it increases heat loss.',
      hi: 'कई परतों में कपड़े पहनें। शिशुओं, बुजुर्गों और बेघर लोगों का ख्याल रखें। हाइपोथर्मिया के लक्षणों पर ध्यान दें।',
      mr: 'अनेक थरांचे कपडे घाला. लहान मुले, वृद्ध व बेघरांची काळजी घ्या. हायपोथर्मियाची लक्षणे ओळखा.',
    },
    icon: <CloudSnow size={18} />,
  },
  CYCLONE_STORM: {
    label: { en: 'Storm / Cyclone Risk', hi: 'तूफान / चक्रवात खतरा', mr: 'वादळ / चक्रीवादळ धोका' },
    advice: {
      en: 'Stay indoors. Secure loose items and vehicles. Stay away from windows. Keep emergency kit ready. Follow official cyclone updates.',
      hi: 'घर के अंदर रहें। ढीली वस्तुएं और वाहन सुरक्षित करें। खिड़कियों से दूर रहें। आपात किट तैयार रखें।',
      mr: 'घरातच राहा. सुटे सामान व वाहने बांधून ठेवा. खिडक्यांपासून दूर राहा. आपत्कालीन किट तयार ठेवा.',
    },
    icon: <Wind size={18} />,
  },
  HEAVY_RAIN: {
    label: { en: 'Heavy Rain Warning', hi: 'भारी वर्षा चेतावनी', mr: 'मुसळधार पावसाचा इशारा' },
    advice: {
      en: 'Carry raincoat/umbrella. Avoid streams and rivers. Watch for landslides in hilly areas. Keep drains unclogged.',
      hi: 'रेनकोट/छाता साथ रखें। नाले और नदियों से दूर रहें। पहाड़ी इलाकों में भूस्खलन का ध्यान रखें।',
      mr: 'रेनकोट/छत्री सोबत ठेवा. नाले व नद्यांपासून दूर राहा. डोंगरी भागात दरडीचा धोका लक्षात घ्या.',
    },
    icon: <CloudRain size={18} />,
  },
  DENSE_FOG: {
    label: { en: 'Dense Fog Advisory', hi: 'घना कोहरा चेतावनी', mr: 'दाट धुक्याचा इशारा' },
    advice: {
      en: 'Drive slowly with fog lights ON. Maintain large gaps between vehicles. Avoid highways in early morning. Keep hazard lights on.',
      hi: 'फॉग लाइट्स जलाकर धीरे चलाएं। गाड़ियों के बीच दूरी बनाए रखें। सुबह हाईवे से बचें। हेजार्ड लाइट्स चालू रखें।',
      mr: 'फॉग लाईट लावून हळू चालवा. वाहनांमध्ये मोठे अंतर ठेवा. सकाळी महामार्ग टाळा. धोक्याचे दिवे सुरू ठेवा.',
    },
    icon: <CloudFog size={18} />,
  },
  THUNDERSTORM: {
    label: { en: 'Thunderstorm Warning', hi: 'गरज-चमक का तूफान', mr: 'विजेच्या कडकडाटाचा इशारा' },
    advice: {
      en: 'Stay indoors. Unplug electronics. Avoid tall trees, open fields, and water bodies. Do not use landline phones during lightning.',
      hi: 'घर के अंदर रहें। इलेक्ट्रॉनिक्स अनप्लग करें। पेड़ों, खुले मैदानों और पानी के पास न जाएं।',
      mr: 'घरातच राहा. इलेक्ट्रॉनिक्स अनप्लग करा. झाडे, मैदाने व पाण्याजवळ जाऊ नका.',
    },
    icon: <ShieldAlert size={18} />,
  },
  SNOWFALL: {
    label: { en: 'Snowfall Warning', hi: 'हिमपात की चेतावनी', mr: 'हिमवृष्टीचा इशारा' },
    advice: {
      en: 'Avoid mountain roads. Stock essential supplies for 2–3 days. Protect crops and livestock. Keep warm.',
      hi: 'पहाड़ी सड़कों से बचें। 2–3 दिन का जरूरी सामान रख लें। फसलों और पशुओं को सुरक्षित करें।',
      mr: 'पर्वतीय रस्ते टाळा. 2-3 दिवसांचा आवश्यक साठा करा. शेती व जनावरे सुरक्षित करा.',
    },
    icon: <CloudSnow size={18} />,
  },
};

/* ─────────────── Forecast → Alerts logic ─────────────── */
function analyzeDay(day: ForecastDay): DayAlert | null {
  const date = new Date(day.date);

  // CRITICAL: Extreme rainfall → Flood RED
  if (day.precipSum >= 115.6) {
    return { date, level: 'RED', type: 'FLOOD', stats: `${day.precipSum}mm rain`, ...DISASTER_META.FLOOD, label: DISASTER_META.FLOOD.label, advice: DISASTER_META.FLOOD.advice, icon: DISASTER_META.FLOOD.icon };
  }
  // Severe cyclone-level winds
  if (day.windMax >= 90) {
    return { date, level: 'RED', type: 'CYCLONE_STORM', stats: `${day.windMax}km/h wind`, ...DISASTER_META.CYCLONE_STORM };
  }
  // Extreme heat
  if (day.tempMax >= 45) {
    return { date, level: 'RED', type: 'HEATWAVE', stats: `${day.tempMax}°C max`, ...DISASTER_META.HEATWAVE };
  }
  // Thunderstorm (WMO 95–99)
  if (day.weatherCode >= 95) {
    const level: AlertLevel = day.windMax >= 60 ? 'RED' : 'ORANGE';
    return { date, level, type: 'THUNDERSTORM', stats: `Code ${day.weatherCode}, ${day.windMax}km/h wind`, ...DISASTER_META.THUNDERSTORM };
  }
  // Heavy rain → Flood ORANGE
  if (day.precipSum >= 64.5) {
    return { date, level: 'ORANGE', type: 'FLOOD', stats: `${day.precipSum}mm rain`, ...DISASTER_META.FLOOD };
  }
  // Storm winds
  if (day.windMax >= 62) {
    return { date, level: 'ORANGE', type: 'CYCLONE_STORM', stats: `${day.windMax}km/h wind`, ...DISASTER_META.CYCLONE_STORM };
  }
  // Severe heatwave
  if (day.tempMax >= 42) {
    return { date, level: 'ORANGE', type: 'HEATWAVE', stats: `${day.tempMax}°C max`, ...DISASTER_META.HEATWAVE };
  }
  // Snowfall
  if (day.snowfallSum >= 10) {
    return { date, level: 'ORANGE', type: 'SNOWFALL', stats: `${day.snowfallSum}cm snow`, ...DISASTER_META.SNOWFALL };
  }
  // Cold wave
  if (day.tempMin <= 4) {
    return { date, level: 'ORANGE', type: 'COLDWAVE', stats: `${day.tempMin}°C min`, ...DISASTER_META.COLDWAVE };
  }
  // Moderate rain warning
  if (day.precipSum >= 35.5) {
    return { date, level: 'YELLOW', type: 'HEAVY_RAIN', stats: `${day.precipSum}mm rain`, ...DISASTER_META.HEAVY_RAIN };
  }
  // Moderate winds
  if (day.windMax >= 40) {
    return { date, level: 'YELLOW', type: 'CYCLONE_STORM', stats: `${day.windMax}km/h wind`, ...DISASTER_META.CYCLONE_STORM };
  }
  // Moderate heat
  if (day.tempMax >= 38) {
    return { date, level: 'YELLOW', type: 'HEATWAVE', stats: `${day.tempMax}°C max`, ...DISASTER_META.HEATWAVE };
  }
  // Dense fog (low visibility likely in winter — we detect fog WMO codes 45–49)
  if (day.weatherCode >= 45 && day.weatherCode <= 49) {
    return { date, level: 'YELLOW', type: 'DENSE_FOG', stats: `WMO Code ${day.weatherCode}`, ...DISASTER_META.DENSE_FOG };
  }
  // Cold watch
  if (day.tempMin <= 8) {
    return { date, level: 'YELLOW', type: 'COLDWAVE', stats: `${day.tempMin}°C min`, ...DISASTER_META.COLDWAVE };
  }
  // Light snow
  if (day.snowfallSum >= 2) {
    return { date, level: 'YELLOW', type: 'SNOWFALL', stats: `${day.snowfallSum}cm snow`, ...DISASTER_META.SNOWFALL };
  }

  return null; // All clear
}

/* ─────────────── NOTE: fetch/geocode delegated to shared weatherService ─── */
// fetchUnifiedWeather from '../services/weatherService' provides both forecast
// and reverse-geocoding, deduplicating requests shared with WeatherWidget.

/* ─────────────── UI Labels ─────────────── */
const LABELS = {
  en: {
    title: 'Expected Disaster Alerts',
    subtitle: '7-day forecast risk assessment',
    noAlerts: 'No significant disaster risk detected in the next 7 days.',
    loading: 'Analyzing disaster risk forecast…',
    permMsg: 'Allow location to see disaster risk forecast for your area',
    enableBtn: 'Check Disaster Risk',
    error: 'Could not load forecast data',
    retry: 'Retry',
    source: 'Risk analysis based on Open-Meteo 7-day forecast | IMD thresholds applied',
    adviceLabel: 'What to do:',
  },
  hi: {
    title: 'आपदा पूर्व चेतावनियां',
    subtitle: '7 दिन का पूर्वानुमान जोखिम आकलन',
    noAlerts: 'अगले 7 दिनों में कोई बड़ा आपदा खतरा नहीं दिखता।',
    loading: 'आपदा जोखिम पूर्वानुमान विश्लेषण हो रहा है…',
    permMsg: 'अपने क्षेत्र की आपदा चेतावनी देखने के लिए स्थान की अनुमति दें',
    enableBtn: 'आपदा जोखिम जांचें',
    error: 'पूर्वानुमान डेटा लोड नहीं हो सका',
    retry: 'पुनः प्रयास',
    source: 'जोखिम विश्लेषण: Open-Meteo 7-दिवसीय पूर्वानुमान | IMD सीमाएं लागू',
    adviceLabel: 'क्या करें:',
  },
  mr: {
    title: 'अपेक्षित आपत्ती सतर्कता',
    subtitle: '७ दिवसांचे अंदाज धोका मूल्यांकन',
    noAlerts: 'पुढील ७ दिवसांत कोणताही मोठा आपत्ती धोका आढळला नाही.',
    loading: 'आपत्ती धोका अंदाज विश्लेषण सुरू आहे…',
    permMsg: 'तुमच्या परिसरातील आपत्ती सतर्कता पाहण्यासाठी स्थान परवानगी द्या',
    enableBtn: 'आपत्ती धोका तपासा',
    error: 'अंदाज डेटा लोड होऊ शकला नाही',
    retry: 'पुन्हा प्रयत्न',
    source: 'धोका विश्लेषण: Open-Meteo ७-दिवसीय अंदाज | IMD निकष लागू',
    adviceLabel: 'काय करावे:',
  },
};

/* ─────────────── Component ─────────────── */
export const DisasterAlertBanner: React.FC<DisasterAlertBannerProps> = memo(({ language }) => {
  const L = (LABELS as any)[language] || LABELS.en;

  const [alerts, setAlerts] = useState<DayAlert[]>([]);
  const [cityName, setCityName] = useState('');
  const [state, setState] = useState<'idle' | 'loading' | 'error' | 'denied' | 'done'>('idle');
  const [expandedIdx, setExpandedIdx] = useState<number | null>(0);

  const load = useCallback(() => {
    setState('loading');
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          // Uses shared weatherService — deduplicates requests with WeatherWidget & IncidentForm
          const unified = await fetchUnifiedWeather(pos.coords.latitude, pos.coords.longitude);
          const forecast: ForecastDay[] = unified.daily.map((d) => ({
            date: d.date,
            precipSum: d.precipSum,
            tempMax: d.tempMax,
            tempMin: d.tempMin,
            windMax: d.windMax,
            weatherCode: d.weatherCode,
            uvMax: d.uvMax,
            snowfallSum: d.snowfallSum,
            visibilityMin: d.visibilityMin,
          }));
          const city = unified.current.cityName;
          const found: DayAlert[] = [];
          for (const day of forecast) {
            const a = analyzeDay(day);
            if (a) found.push(a);
          }
          setAlerts(found);
          setCityName(city);
          setState('done');
          setExpandedIdx(found.length > 0 ? 0 : null);
        } catch {
          setState('error');
        }
      },
      (err) => {
        if (err.code === 1) setState('denied');
        else setState('error');
      },
      { timeout: 10000, maximumAge: 300000 }
    );
  }, []);

  // Auto-refresh every 30 minutes
  useEffect(() => {
    if (state !== 'done') return;
    const id = setInterval(load, 30 * 60 * 1000);
    return () => clearInterval(id);
  }, [state, load]);

  /* ── Idle ── */
  if (state === 'idle') {
    return (
      <div className="disaster-banner disaster-banner--idle">
        <ShieldAlert size={22} className="disaster-shield-icon" />
        <div className="disaster-idle-text">
          <strong>{L.title}</strong>
          <span>{L.permMsg}</span>
        </div>
        <button className="btn-disaster-enable" onClick={load} type="button">
          <Siren size={14} />
          {L.enableBtn}
        </button>
      </div>
    );
  }

  /* ── Loading ── */
  if (state === 'loading') {
    return (
      <div className="disaster-banner disaster-banner--loading">
        <RefreshCw size={18} className="disaster-spin" />
        <span>{L.loading}</span>
      </div>
    );
  }

  /* ── Permission denied ── */
  if (state === 'denied') {
    return (
      <div className="disaster-banner disaster-banner--idle">
        <AlertTriangle size={18} style={{ color: 'var(--color-warning-amber)', flexShrink: 0 }} />
        <span style={{ fontSize: '0.85rem', color: 'var(--color-slate-600)' }}>
          {language === 'hi'
            ? 'लोकेशन अनुमति नहीं दी। NDMA ndma.gov.in पर आपदा अलर्ट देखें।'
            : language === 'mr'
            ? 'स्थान परवानगी नाकारली. NDMA ndma.gov.in वर आपत्ती सतर्कता पाहा.'
            : 'Location access denied. Check disaster alerts at ndma.gov.in'}
        </span>
      </div>
    );
  }

  /* ── Error ── */
  if (state === 'error') {
    return (
      <div className="disaster-banner disaster-banner--error">
        <AlertTriangle size={18} />
        <span>{L.error}</span>
        <button className="btn-disaster-retry" onClick={load} type="button">
          <RefreshCw size={13} /> {L.retry}
        </button>
      </div>
    );
  }

  /* ── Done: no alerts ── */
  if (state === 'done' && alerts.length === 0) {
    return (
      <div className="disaster-banner disaster-banner--clear">
        <div className="disaster-clear-inner">
          <span className="disaster-clear-dot" />
          <div>
            <strong className="disaster-clear-title">
              {language === 'hi' ? '✅ सब ठीक' : language === 'mr' ? '✅ सुरक्षित' : '✅ All Clear'}
            </strong>
            <span className="disaster-clear-sub">{L.noAlerts}</span>
            {cityName && (
              <span className="disaster-city-label">
                <MapPin size={11} /> {cityName}
              </span>
            )}
          </div>
          <button className="btn-disaster-refresh" onClick={load} title={L.retry} type="button">
            <RefreshCw size={13} />
          </button>
        </div>
        <p className="disaster-source">{L.source}</p>
      </div>
    );
  }

  /* ── Done: with alerts ── */
  // Sort alerts: RED first, then ORANGE, YELLOW
  const levelOrder: Record<AlertLevel, number> = { RED: 0, ORANGE: 1, YELLOW: 2, GREEN: 3 };
  const sorted = [...alerts].sort((a, b) => levelOrder[a.level] - levelOrder[b.level]);

  // Determine overall header level
  const topLevel = sorted[0]?.level ?? 'GREEN';
  const headerMeta = LEVEL_META[topLevel];

  return (
    <section
      className="disaster-banner disaster-banner--alerts"
      style={{ borderColor: headerMeta.border }}
      aria-label={L.title}
    >
      {/* ── Section header ── */}
      <div className="disaster-header" style={{ backgroundColor: headerMeta.bg }}>
        <div className="disaster-header-left">
          <Siren size={18} style={{ color: headerMeta.color, flexShrink: 0 }} />
          <div>
            <p className="disaster-header-title" style={{ color: headerMeta.color }}>
              {L.title}
            </p>
            <p className="disaster-header-sub">
              {cityName && <><MapPin size={11} /> {cityName} · </>}
              {L.subtitle}
            </p>
          </div>
        </div>
        <button className="btn-disaster-refresh" onClick={load} title={L.retry} type="button">
          <RefreshCw size={13} />
        </button>
      </div>

      {/* ── Alert list ── */}
      <ul className="disaster-alerts-list">
        {sorted.map((alert, idx) => {
          const meta = LEVEL_META[alert.level];
          const isOpen = expandedIdx === idx;
          const dayLabel = ((DAY_LABELS as any)[language] || DAY_LABELS.en)(new Date(alert.date));

          return (
            <li
              key={idx}
              className="disaster-alert-item"
              style={{ borderLeftColor: meta.border }}
            >
              {/* Summary row — always visible, click to expand */}
              <button
                type="button"
                className="disaster-alert-summary"
                onClick={() => setExpandedIdx(isOpen ? null : idx)}
                aria-expanded={isOpen}
              >
                <span className="disaster-alert-icon" style={{ color: meta.color }}>
                  {alert.icon}
                </span>
                <span className="disaster-alert-info">
                  <span className="disaster-alert-day" style={{ color: meta.color }}>{dayLabel}</span>
                  <span className="disaster-alert-name">{alert.label[language] || alert.label.en}</span>
                  <span className="disaster-alert-stats">{alert.stats}</span>
                </span>
                <span
                  className={`disaster-level-badge`}
                  style={{ backgroundColor: meta.border, color: meta.color }}
                >
                  {meta.badge[language] || meta.badge.en}
                </span>
                <span className="disaster-chevron" style={{ color: meta.color }}>
                  {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </span>
              </button>

              {/* Expanded advice */}
              {isOpen && (
                <div className="disaster-alert-advice" style={{ backgroundColor: meta.bg }}>
                  <p className="disaster-advice-label">{L.adviceLabel}</p>
                  <p className="disaster-advice-text">{alert.advice[language] || alert.advice.en}</p>
                </div>
              )}
            </li>
          );
        })}
      </ul>

      <p className="disaster-source">{L.source}</p>
    </section>
  );
});

DisasterAlertBanner.displayName = 'DisasterAlertBanner';
