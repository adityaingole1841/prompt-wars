/**
 * Weather & Geocoding Service with In-Memory Caching & Request Deduplication
 * 
 * Prevents redundant network requests between WeatherWidget, DisasterAlertBanner,
 * and IncidentForm by:
 * 1. Deduplicating in-flight requests (only 1 fetch occurs even if multiple components mount simultaneously)
 * 2. Caching weather and forecast results with a 10-minute TTL
 * 3. Caching reverse geocoded city/landmark names indefinitely
 * 4. Including proper User-Agent headers compliant with OpenStreetMap Nominatim policies
 */

export interface UnifiedWeatherData {
  current: {
    temperature: number;
    feelsLike: number;
    humidity: number;
    windSpeed: number;
    windDirection: number;
    uvIndex: number;
    visibility: number;
    precipitationMm: number;
    weatherCode: number;
    cityName: string;
    fetchedAt: Date;
  };
  daily: Array<{
    date: string;
    precipSum: number;
    tempMax: number;
    tempMin: number;
    windMax: number;
    weatherCode: number;
    uvMax: number;
    snowfallSum: number;
    visibilityMin: number;
  }>;
}

// In-memory caches
const weatherCache = new Map<string, { data: UnifiedWeatherData; timestamp: number }>();
const inFlightWeather = new Map<string, Promise<UnifiedWeatherData>>();
const geocodeCache = new Map<string, string>();
const inFlightGeocode = new Map<string, Promise<string>>();

const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes

/**
 * Rounds coordinate to ~1.1km precision to maximize cache hits
 */
function toCoordKey(lat: number, lon: number): string {
  return `${lat.toFixed(2)},${lon.toFixed(2)}`;
}

/**
 * Reverse geocodes coordinates to a localized city/area name using OpenStreetMap Nominatim.
 * Caches results to prevent hitting rate limits (1 req/sec max policy).
 */
export async function reverseGeocode(lat: number, lon: number): Promise<string> {
  const key = toCoordKey(lat, lon);

  if (geocodeCache.has(key)) {
    return geocodeCache.get(key)!;
  }

  if (inFlightGeocode.has(key)) {
    return inFlightGeocode.get(key)!;
  }

  const promise = (async () => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat.toFixed(4)}&lon=${lon.toFixed(4)}&zoom=10&accept-language=en`,
        {
          headers: {
            'User-Agent': 'EmergencyHelperIndia/2.0 (citizen-safety-portal)',
          },
        }
      );

      if (!res.ok) {
        return '';
      }

      const json = await res.json();
      const addr = json?.address;
      const name =
        addr?.city ||
        addr?.town ||
        addr?.village ||
        addr?.suburb ||
        addr?.county ||
        addr?.state ||
        '';

      geocodeCache.set(key, name);
      return name;
    } catch (err) {
      console.warn('Geocoding network error, using coordinates fallback:', err);
      return '';
    } finally {
      inFlightGeocode.delete(key);
    }
  })();

  inFlightGeocode.set(key, promise);
  return promise;
}

/**
 * Fetches combined current weather and 7-day forecast from Open-Meteo in a SINGLE network request.
 * Automatically deduplicates parallel requests and serves from cache if within TTL.
 */
export async function fetchUnifiedWeather(lat: number, lon: number): Promise<UnifiedWeatherData> {
  const key = toCoordKey(lat, lon);
  const now = Date.now();

  const cached = weatherCache.get(key);
  if (cached && now - cached.timestamp < CACHE_TTL_MS) {
    return cached.data;
  }

  if (inFlightWeather.has(key)) {
    return inFlightWeather.get(key)!;
  }

  const promise = (async () => {
    try {
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
        daily: [
          'weather_code',
          'temperature_2m_max',
          'temperature_2m_min',
          'precipitation_sum',
          'wind_speed_10m_max',
          'uv_index_max',
          'snowfall_sum',
        ].join(','),
        wind_speed_unit: 'kmh',
        timezone: 'auto',
        forecast_days: '7',
      });

      const [weatherRes, cityName] = await Promise.all([
        fetch(`https://api.open-meteo.com/v1/forecast?${params}`),
        reverseGeocode(lat, lon),
      ]);

      if (!weatherRes.ok) {
        throw new Error(`Weather API returned HTTP ${weatherRes.status}`);
      }

      const json = await weatherRes.json();
      const c = json.current;
      const d = json.daily;

      const result: UnifiedWeatherData = {
        current: {
          temperature: Math.round(c.temperature_2m),
          feelsLike: Math.round(c.apparent_temperature),
          humidity: c.relative_humidity_2m,
          windSpeed: Math.round(c.wind_speed_10m),
          windDirection: c.wind_direction_10m,
          uvIndex: Math.round(c.uv_index ?? 0),
          visibility: Math.round((c.visibility ?? 10000) / 1000),
          precipitationMm: c.precipitation ?? 0,
          weatherCode: c.weather_code,
          cityName: cityName || 'Your Area',
          fetchedAt: new Date(),
        },
        daily: (d.time as string[]).map((date: string, i: number) => ({
          date,
          precipSum: d.precipitation_sum?.[i] ?? 0,
          tempMax: d.temperature_2m_max?.[i] ?? 20,
          tempMin: d.temperature_2m_min?.[i] ?? 15,
          windMax: d.wind_speed_10m_max?.[i] ?? 0,
          weatherCode: d.weather_code?.[i] ?? 0,
          uvMax: d.uv_index_max?.[i] ?? 0,
          snowfallSum: d.snowfall_sum?.[i] ?? 0,
          visibilityMin: 10,
        })),
      };

      weatherCache.set(key, { data: result, timestamp: Date.now() });
      return result;
    } finally {
      inFlightWeather.delete(key);
    }
  })();

  inFlightWeather.set(key, promise);
  return promise;
}

/**
 * Clear weather caches (useful for manual refresh)
 */
export function clearWeatherCache(): void {
  weatherCache.clear();
}
