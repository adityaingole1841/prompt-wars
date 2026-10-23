import React, { useState, useEffect, useCallback } from 'react';
import {
  Cloud,
  CloudRain,
  CloudSnow,
  CloudLightning,
  Sun,
  Wind,
  Droplets,
  Thermometer,
  Eye,
  AlertTriangle,
  RefreshCw,
  MapPin,
  CloudDrizzle,
  CloudFog,
} from 'lucide-react';
import { SupportedLanguage } from '../types/emergency';

/* ─────────────── Types ─────────────── */
interface WeatherData {
  temperature: number;       // °C
  feelsLike: number;         // °C
  humidity: number;          // %
  windSpeed: number;         // km/h
  windDirection: number;     // degrees
  uvIndex: number;
  visibility: number;        // km
  precipitationMm: number;   // mm/hr
  weatherCode: number;       // WMO code
  cityName: string;
  fetchedAt: Date;
}

interface WeatherWidgetProps {
  language: SupportedLanguage;
}

/* ─────────────── WMO Weather Interpretation ─────────────── */
// https://open-meteo.com/en/docs#weathervariables
function interpretWeatherCode(code: number): {
  label: { en: string; hi: string; mr: string };
  icon: React.ReactNode;
  severity: 'clear' | 'cloudy' | 'rain' | 'storm' | 'snow' | 'fog';
} {
  if (code === 0)
    return {
      label: { en: 'Clear Sky', hi: 'साफ आसमान', mr: 'स्वच्छ आकाश' },
      icon: <Sun size={32} className="weather-icon-sun" />,
      severity: 'clear',
    };
  if (code <= 2)
    return {
      label: { en: 'Partly Cloudy', hi: 'आंशिक बादल', mr: 'अंशतः ढगाळ' },
      icon: <Cloud size={32} className="weather-icon-cloud" />,
      severity: 'cloudy',
    };
  if (code === 3)
    return {
      label: { en: 'Overcast', hi: 'पूरी तरह बादल', mr: 'पूर्ण ढगाळ' },
      icon: <Cloud size={32} className="weather-icon-cloud" />,
      severity: 'cloudy',
    };
  if (code <= 49)
    return {
      label: { en: 'Fog / Haze', hi: 'कोहरा / धुंध', mr: 'धुके / धुंद' },
      icon: <CloudFog size={32} className="weather-icon-fog" />,
      severity: 'fog',
    };
  if (code <= 57)
    return {
      label: { en: 'Drizzle', hi: 'हल्की बूंदाबांदी', mr: 'हलका पाऊस' },
      icon: <CloudDrizzle size={32} className="weather-icon-rain" />,
      severity: 'rain',
    };
  if (code <= 67)
    return {
      label: { en: 'Rain', hi: 'बारिश', mr: 'पाऊस' },
      icon: <CloudRain size={32} className="weather-icon-rain" />,
      severity: 'rain',
    };
  if (code <= 77)
    return {
      label: { en: 'Snow / Sleet', hi: 'बर्फबारी / ओलावृष्टि', mr: 'बर्फ / गारपीट' },
      icon: <CloudSnow size={32} className="weather-icon-snow" />,
      severity: 'snow',
    };
  if (code <= 82)
    return {
      label: { en: 'Rain Showers', hi: 'तेज बौछारें', mr: 'जोरदार सरी' },
      icon: <CloudRain size={32} className="weather-icon-rain" />,
      severity: 'rain',
    };
  if (code <= 86)
    return {
      label: { en: 'Snow Showers', hi: 'हिमपात', mr: 'हिमवृष्टी' },
      icon: <CloudSnow size={32} className="weather-icon-snow" />,
      severity: 'snow',
    };
  // 95+: thunderstorm
  return {
    label: { en: 'Thunderstorm', hi: 'गरज के साथ बारिश', mr: 'वादळी पाऊस' },
    icon: <CloudLightning size={32} className="weather-icon-storm" />,
    severity: 'storm',
  };
}

/* ─────────────── Wind Direction Label ─────────────── */
function windDirLabel(deg: number): string {
  const dirs = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  return dirs[Math.round(deg / 45) % 8];
}

/* ─────────────── Emergency Safety Tips ─────────────── */
interface Tip {
  icon: React.ReactNode;
  text: string;
  level: 'warning' | 'critical';
}

function getWeatherTips(data: WeatherData, lang: SupportedLanguage): Tip[] {
  const tips: Tip[] = [];

  // Heatwave
  if (data.temperature >= 40) {
    tips.push({
      icon: <Thermometer size={16} />,
      level: 'critical',
      text:
        lang === 'hi'
          ? `🔴 गंभीर लू चेतावनी (${data.temperature}°C): धूप में बाहर न निकलें, खूब पानी पिएं, बुजुर्ग और बच्चों पर ध्यान दें। हीट स्ट्रोक होने पर 108 कॉल करें।`
          : lang === 'mr'
          ? `🔴 तीव्र उष्णतेची इशारा (${data.temperature}°C): उन्हात बाहेर पडू नका, भरपूर पाणी प्या, वृद्ध व मुलांची काळजी घ्या. उष्माघात झाल्यास 108 वर कॉल करा.`
          : `🔴 Severe Heatwave (${data.temperature}°C): Avoid going outside in direct sunlight. Stay hydrated, check on elderly and children. Call 108 for heatstroke symptoms.`,
    });
  } else if (data.temperature >= 35) {
    tips.push({
      icon: <Thermometer size={16} />,
      level: 'warning',
      text:
        lang === 'hi'
          ? `⚠️ बहुत गर्म मौसम (${data.temperature}°C): पानी पीते रहें, छाया में रहें और गर्मी से बचाव करें।`
          : lang === 'mr'
          ? `⚠️ खूप उकाडा (${data.temperature}°C): पाणी पित राहा, सावलीत थांबा, उन्हापासून बचाव करा.`
          : `⚠️ Very Hot Weather (${data.temperature}°C): Stay hydrated, seek shade, and avoid strenuous outdoor activity.`,
    });
  }

  // Thunderstorm
  if (data.weatherCode >= 95) {
    tips.push({
      icon: <CloudLightning size={16} />,
      level: 'critical',
      text:
        lang === 'hi'
          ? `⛈️ गरज-चमक के साथ तूफान: खुले स्थान, पेड़ों और बिजली के खंभों से दूर रहें। घर के अंदर सुरक्षित रहें।`
          : lang === 'mr'
          ? `⛈️ वादळी हवामान: उघड्या जागी, झाडाखाली व विजेच्या खांबाजवळ उभे राहू नका. घरातच सुरक्षित राहा.`
          : `⛈️ Active Thunderstorm: Stay indoors. Avoid open fields, tall trees, and electric poles. Disconnect appliances.`,
    });
  }

  // Heavy rain / flood risk
  if (data.precipitationMm >= 7.5) {
    tips.push({
      icon: <CloudRain size={16} />,
      level: 'critical',
      text:
        lang === 'hi'
          ? `🌧️ भारी बारिश (${data.precipitationMm} mm/hr): बाढ़ का खतरा हो सकता है। निचले इलाकों से दूर रहें और सुरक्षित स्थान पर जाएं।`
          : lang === 'mr'
          ? `🌧️ मुसळधार पाऊस (${data.precipitationMm} mm/hr): पूर येण्याचा धोका. सखल भागातून बाहेर पडा, सुरक्षित ठिकाणी जा.`
          : `🌧️ Heavy Rainfall (${data.precipitationMm} mm/hr): Flood risk possible. Avoid low-lying areas, move to higher ground if needed.`,
    });
  } else if (data.precipitationMm >= 2.5) {
    tips.push({
      icon: <CloudDrizzle size={16} />,
      level: 'warning',
      text:
        lang === 'hi'
          ? `🌦️ मध्यम बारिश: फिसलन भरी सड़कों पर धीरे चलाएं और जलभराव से बचें।`
          : lang === 'mr'
          ? `🌦️ मध्यम पाऊस: निसरड्या रस्त्यावर सावकाश चालवा, साचलेल्या पाण्यात शिरू नका.`
          : `🌦️ Moderate Rain: Drive slowly on slippery roads. Avoid waterlogged streets.`,
    });
  }

  // High wind
  if (data.windSpeed >= 62) {
    tips.push({
      icon: <Wind size={16} />,
      level: 'critical',
      text:
        lang === 'hi'
          ? `💨 तेज आंधी (${data.windSpeed} km/h): बाहर न निकलें। ढीली वस्तुएं सुरक्षित करें। पेड़ों और बिजली के तारों से दूर रहें।`
          : lang === 'mr'
          ? `💨 जोरदार वारा (${data.windSpeed} km/h): बाहर जाऊ नका. सुटे सामान बांधून ठेवा. झाडे व विजेच्या तारांपासून दूर राहा.`
          : `💨 Strong Winds (${data.windSpeed} km/h): Stay indoors. Secure loose objects. Keep away from trees and power lines.`,
    });
  } else if (data.windSpeed >= 40) {
    tips.push({
      icon: <Wind size={16} />,
      level: 'warning',
      text:
        lang === 'hi'
          ? `💨 मध्यम आंधी (${data.windSpeed} km/h): दोपहिया वाहन सावधानी से चलाएं। ढीली छत या बोर्ड से दूर रहें।`
          : lang === 'mr'
          ? `💨 मध्यम वारा (${data.windSpeed} km/h): दुचाकी सावधानीने चालवा. सुट्या पत्रे व फलकांपासून दूर राहा.`
          : `💨 Moderate Wind (${data.windSpeed} km/h): Exercise caution on two-wheelers. Watch for loose signboards or debris.`,
    });
  }

  // High UV
  if (data.uvIndex >= 8) {
    tips.push({
      icon: <Sun size={16} />,
      level: 'warning',
      text:
        lang === 'hi'
          ? `☀️ उच्च UV सूचकांक (${data.uvIndex}): धूप में निकलने पर सनस्क्रीन लगाएं, टोपी और कपड़े से त्वचा ढकें।`
          : lang === 'mr'
          ? `☀️ जास्त UV निर्देशांक (${data.uvIndex}): उन्हात जाताना सनस्क्रीन लावा, टोपी घाला व त्वचा झाका.`
          : `☀️ High UV Index (${data.uvIndex}): Apply sunscreen, wear a hat, and cover skin if going outdoors.`,
    });
  }

  // Low visibility (fog)
  if (data.visibility < 1) {
    tips.push({
      icon: <Eye size={16} />,
      level: 'critical',
      text:
        lang === 'hi'
          ? `🌫️ बहुत कम दृश्यता (${data.visibility} km): वाहन न चलाएं या बहुत धीरे चलाएं। फॉग लाइट्स चालू रखें।`
          : lang === 'mr'
          ? `🌫️ खूप कमी दृश्यमानता (${data.visibility} km): वाहन चालवू नका किंवा अतिसंथ चालवा. फॉग लाईट सुरू ठेवा.`
          : `🌫️ Very Low Visibility (${data.visibility} km): Avoid driving if possible or drive very slowly with fog lights on.`,
    });
  } else if (data.visibility < 3) {
    tips.push({
      icon: <Eye size={16} />,
      level: 'warning',
      text:
        lang === 'hi'
          ? `🌫️ कम दृश्यता / कोहरा: सड़क पर अतिरिक्त सावधानी बरतें।`
          : lang === 'mr'
          ? `🌫️ कमी दृश्यमानता / धुके: रस्त्यावर अतिरिक्त सावधानी बाळगा.`
          : `🌫️ Reduced Visibility / Fog: Exercise extra caution on roads.`,
    });
  }

  return tips;
}

/* ─────────────── Reverse Geocode via Open-Meteo ─────────────── */
async function reverseGeocode(lat: number, lon: number): Promise<string> {
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=10&accept-language=en`;
    const res = await fetch(url, {
      headers: { 'User-Agent': 'EmergencyHelperIndia/1.0' },
    });
    if (!res.ok) return 'Your Location';
    const data = await res.json();
    const addr = data?.address;
    return (
      addr?.city || addr?.town || addr?.village || addr?.county || addr?.state || 'Your Location'
    );
  } catch {
    return 'Your Location';
  }
}

/* ─────────────── Fetch Weather from Open-Meteo ─────────────── */
async function fetchWeather(lat: number, lon: number): Promise<WeatherData> {
  const params = new URLSearchParams({
    latitude: lat.toFixed(4),
    longitude: lon.toFixed(4),
    current: [
      'temperature_2m',
      'apparent_temperature',
      'relative_humidity_2m',
      'wind_speed_10m',
      'wind_direction_10m',
      'uv_index',
      'visibility',
      'precipitation',
      'weather_code',
    ].join(','),
    wind_speed_unit: 'kmh',
    timezone: 'auto',
  });

  const res = await fetch(`https://api.open-meteo.com/v1/forecast?${params}`);
  if (!res.ok) throw new Error(`Weather API error: ${res.status}`);
  const json = await res.json();
  const c = json.current;

  const cityName = await reverseGeocode(lat, lon);

  return {
    temperature: Math.round(c.temperature_2m),
    feelsLike: Math.round(c.apparent_temperature),
    humidity: c.relative_humidity_2m,
    windSpeed: Math.round(c.wind_speed_10m),
    windDirection: c.wind_direction_10m,
    uvIndex: Math.round(c.uv_index ?? 0),
    visibility: Math.round((c.visibility ?? 10000) / 1000),
    precipitationMm: c.precipitation ?? 0,
    weatherCode: c.weather_code,
    cityName,
    fetchedAt: new Date(),
  };
}

/* ─────────────── UI Labels ─────────────── */
const LABELS = {
  en: {
    title: 'Live Weather',
    feelsLike: 'Feels like',
    humidity: 'Humidity',
    wind: 'Wind',
    uv: 'UV Index',
    visibility: 'Visibility',
    rain: 'Rainfall',
    lastUpdated: 'Updated',
    permissionNeeded: 'Allow location to see local weather',
    enableBtn: 'Get Weather',
    loading: 'Fetching weather…',
    error: 'Could not load weather data',
    retry: 'Retry',
    safetyTips: 'Weather Safety Tips',
    source: 'Data: Open-Meteo (free, no tracking)',
  },
  hi: {
    title: 'लाइव मौसम',
    feelsLike: 'महसूस होता है',
    humidity: 'आर्द्रता',
    wind: 'हवा',
    uv: 'UV सूचकांक',
    visibility: 'दृश्यता',
    rain: 'वर्षा',
    lastUpdated: 'अपडेट',
    permissionNeeded: 'स्थानीय मौसम देखने के लिए लोकेशन की अनुमति दें',
    enableBtn: 'मौसम देखें',
    loading: 'मौसम की जानकारी ला रहे हैं…',
    error: 'मौसम डेटा लोड नहीं हो सका',
    retry: 'पुनः प्रयास',
    safetyTips: 'मौसम सुरक्षा सुझाव',
    source: 'स्रोत: Open-Meteo (निःशुल्क, ट्रैकिंग-मुक्त)',
  },
  mr: {
    title: 'थेट हवामान',
    feelsLike: 'जाणवते',
    humidity: 'आर्द्रता',
    wind: 'वारा',
    uv: 'UV निर्देशांक',
    visibility: 'दृश्यमानता',
    rain: 'पर्जन्यमान',
    lastUpdated: 'अपडेट',
    permissionNeeded: 'स्थानिक हवामान पाहण्यासाठी स्थान परवानगी द्या',
    enableBtn: 'हवामान पाहा',
    loading: 'हवामान माहिती आणत आहे…',
    error: 'हवामान डेटा लोड होऊ शकला नाही',
    retry: 'पुन्हा प्रयत्न',
    safetyTips: 'हवामान सुरक्षा सूचना',
    source: 'स्रोत: Open-Meteo (मोफत, ट्रॅकिंग-मुक्त)',
  },
};

/* ─────────────── Component ─────────────── */
export const WeatherWidget: React.FC<WeatherWidgetProps> = ({ language }) => {
  const L = (LABELS as any)[language] || LABELS.en;

  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [state, setState] = useState<'idle' | 'loading' | 'error' | 'denied'>('idle');

  const load = useCallback(() => {
    setState('loading');
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const data = await fetchWeather(pos.coords.latitude, pos.coords.longitude);
          setWeather(data);
          setState('idle');
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

  // Auto-refresh every 10 minutes when data is loaded
  useEffect(() => {
    if (!weather) return;
    const id = setInterval(load, 10 * 60 * 1000);
    return () => clearInterval(id);
  }, [weather, load]);

  const condition = weather ? interpretWeatherCode(weather.weatherCode) : null;
  const tips = weather ? getWeatherTips(weather, language) : [];

  /* ── Idle / not yet requested ── */
  if (state === 'idle' && !weather) {
    return (
      <div className="weather-widget weather-widget--idle">
        <div className="weather-idle-content">
          <Cloud size={28} className="weather-icon-cloud" />
          <div>
            <p className="weather-idle-label">{L.permissionNeeded}</p>
          </div>
          <button className="btn-weather-enable" onClick={load} type="button">
            <MapPin size={14} />
            {L.enableBtn}
          </button>
        </div>
      </div>
    );
  }

  /* ── Loading ── */
  if (state === 'loading') {
    return (
      <div className="weather-widget weather-widget--loading">
        <RefreshCw size={20} className="weather-spin" />
        <span>{L.loading}</span>
      </div>
    );
  }

  /* ── Permission denied ── */
  if (state === 'denied') {
    return (
      <div className="weather-widget weather-widget--idle">
        <div className="weather-idle-content">
          <AlertTriangle size={20} style={{ color: 'var(--color-warning-amber)' }} />
          <span style={{ fontSize: '0.85rem', color: 'var(--color-slate-600)' }}>
            {language === 'hi'
              ? 'लोकेशन अनुमति नहीं मिली। मैन्युअल रूप से मौसम जांचें।'
              : language === 'mr'
              ? 'स्थान परवानगी नाकारली. स्वतः हवामान तपासा.'
              : 'Location access denied. Please check weather manually.'}
          </span>
        </div>
      </div>
    );
  }

  /* ── Error ── */
  if (state === 'error') {
    return (
      <div className="weather-widget weather-widget--error">
        <AlertTriangle size={18} />
        <span>{L.error}</span>
        <button className="btn-weather-retry" onClick={load} type="button">
          <RefreshCw size={13} /> {L.retry}
        </button>
      </div>
    );
  }

  /* ── Loaded ── */
  if (!weather || !condition) return null;

  const severityClass = {
    clear: 'weather-bg--clear',
    cloudy: 'weather-bg--cloudy',
    rain: 'weather-bg--rain',
    storm: 'weather-bg--storm',
    snow: 'weather-bg--snow',
    fog: 'weather-bg--fog',
  }[condition.severity];

  return (
    <section className={`weather-widget weather-widget--loaded ${severityClass}`} aria-label={L.title}>
      {/* ── Header row ── */}
      <div className="weather-header-row">
        <div className="weather-location-badge">
          <MapPin size={13} />
          <span>{weather.cityName}</span>
        </div>
        <span className="weather-title">{L.title}</span>
        <button
          className="weather-refresh-btn"
          onClick={load}
          title={L.retry}
          type="button"
          aria-label="Refresh weather"
        >
          <RefreshCw size={13} />
        </button>
      </div>

      {/* ── Main condition row ── */}
      <div className="weather-main-row">
        <div className="weather-icon-wrap">{condition.icon}</div>
        <div className="weather-temp-block">
          <span className="weather-temp">{weather.temperature}°C</span>
          <span className="weather-condition-label">{(condition.label as any)[language] ?? condition.label.en}</span>
          <span className="weather-feels-like">
            {L.feelsLike} {weather.feelsLike}°C
          </span>
        </div>
      </div>

      {/* ── Stats grid ── */}
      <div className="weather-stats-grid">
        <div className="weather-stat">
          <Droplets size={14} className="weather-stat-icon" />
          <span className="weather-stat-label">{L.humidity}</span>
          <span className="weather-stat-val">{weather.humidity}%</span>
        </div>
        <div className="weather-stat">
          <Wind size={14} className="weather-stat-icon" />
          <span className="weather-stat-label">{L.wind}</span>
          <span className="weather-stat-val">
            {weather.windSpeed} km/h {windDirLabel(weather.windDirection)}
          </span>
        </div>
        <div className="weather-stat">
          <Sun size={14} className="weather-stat-icon" />
          <span className="weather-stat-label">{L.uv}</span>
          <span className="weather-stat-val">{weather.uvIndex}</span>
        </div>
        <div className="weather-stat">
          <Eye size={14} className="weather-stat-icon" />
          <span className="weather-stat-label">{L.visibility}</span>
          <span className="weather-stat-val">{weather.visibility} km</span>
        </div>
        {weather.precipitationMm > 0 && (
          <div className="weather-stat">
            <CloudRain size={14} className="weather-stat-icon" />
            <span className="weather-stat-label">{L.rain}</span>
            <span className="weather-stat-val">{weather.precipitationMm.toFixed(1)} mm/hr</span>
          </div>
        )}
        <div className="weather-stat">
          <RefreshCw size={14} className="weather-stat-icon" />
          <span className="weather-stat-label">{L.lastUpdated}</span>
          <span className="weather-stat-val">
            {weather.fetchedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
      </div>

      {/* ── Safety Tips ── */}
      {tips.length > 0 && (
        <div className="weather-tips-section">
          <p className="weather-tips-title">
            <AlertTriangle size={14} />
            {L.safetyTips}
          </p>
          <ul className="weather-tips-list">
            {tips.map((tip, i) => (
              <li key={i} className={`weather-tip weather-tip--${tip.level}`}>
                {tip.text}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* ── Attribution ── */}
      <p className="weather-source">{L.source}</p>
    </section>
  );
};
