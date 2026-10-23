/**
 * Automated Test Suite for Weather & Geocoding Service
 * Tests deduplication of in-flight requests, 10-minute caching,
 * coordinate rounding, and error resiliency.
 */

import { fetchUnifiedWeather, reverseGeocode, clearWeatherCache } from '../src/services/weatherService';

let passCount = 0;
let failCount = 0;

function assert(condition: boolean, testName: string, detail?: string) {
  if (condition) {
    console.log(`  ✓ PASS: ${testName}`);
    passCount++;
  } else {
    console.error(`  ✗ FAIL: ${testName}${detail ? ` - ${detail}` : ''}`);
    failCount++;
  }
}

async function runWeatherTests() {
  console.log('\n=== Testing Weather & Geocoding Service ===\n');

  // Test 1: Coordinate normalization & Weather fetch for Mumbai coordinates
  console.log('--- Test Group 1: Live Unified Weather Fetch & Schema ---');
  try {
    const mumbaiLat = 18.922;
    const mumbaiLon = 72.8346;
    const weather = await fetchUnifiedWeather(mumbaiLat, mumbaiLon);

    assert(weather !== null && typeof weather === 'object', 'Weather data returned as valid object');
    assert(typeof weather.current.temperature === 'number', 'Current temperature is a valid number');
    assert(typeof weather.current.humidity === 'number', 'Current humidity is a valid number');
    assert(typeof weather.current.windSpeed === 'number', 'Current wind speed is a valid number');
    assert(Array.isArray(weather.daily), 'Daily forecast is an array');
    assert(weather.daily.length >= 7, '7-day daily forecast is populated');
    assert(typeof weather.current.cityName === 'string', 'City name is populated');
  } catch (err) {
    assert(false, 'Live weather fetch succeeded', String(err));
  }

  // Test 2: In-Memory Cache Hit (Instant response, same reference or data)
  console.log('\n--- Test Group 2: Cache Hit Performance ---');
  try {
    const lat = 18.922;
    const lon = 72.8346;
    const start = Date.now();
    const cachedWeather = await fetchUnifiedWeather(lat, lon);
    const duration = Date.now() - start;

    assert(duration < 25, `Cache hit returned instantly (${duration}ms < 25ms)`);
    assert(typeof cachedWeather.current.temperature === 'number', 'Cached weather data is intact');
  } catch (err) {
    assert(false, 'Cache hit succeeded', String(err));
  }

  // Test 3: Request Deduplication
  console.log('\n--- Test Group 3: Request Deduplication for Concurrent Calls ---');
  try {
    // Clear cache first to test in-flight deduplication
    clearWeatherCache();
    const delhiLat = 28.6139;
    const delhiLon = 77.2090;

    // Launch two parallel calls simultaneously
    const p1 = fetchUnifiedWeather(delhiLat, delhiLon);
    const p2 = fetchUnifiedWeather(delhiLat, delhiLon);

    const [r1, r2] = await Promise.all([p1, p2]);

    assert(r1 === r2, 'Concurrent requests returned identical shared Promise result');
    assert(r1.current.temperature !== undefined, 'Deduplicated result contains temperature');
  } catch (err) {
    assert(false, 'Deduplication test succeeded', String(err));
  }

  // Test 4: Clear Cache API
  console.log('\n--- Test Group 4: Cache Clearance ---');
  try {
    clearWeatherCache();
    assert(true, 'clearWeatherCache executed without error');
  } catch (err) {
    assert(false, 'clearWeatherCache failed', String(err));
  }

  // Test 5: Reverse Geocoding
  console.log('\n--- Test Group 5: Reverse Geocoding with Caching ---');
  try {
    const cityName1 = await reverseGeocode(19.0760, 72.8777); // Mumbai
    assert(typeof cityName1 === 'string', 'reverseGeocode returns a string');

    const start = Date.now();
    const cityName2 = await reverseGeocode(19.0760, 72.8777);
    const cachedDuration = Date.now() - start;

    assert(cityName1 === cityName2, 'Cached reverse geocode matches original');
    assert(cachedDuration < 10, `Cached reverse geocode responded in ${cachedDuration}ms (< 10ms)`);
  } catch (err) {
    assert(false, 'Reverse geocode test succeeded', String(err));
  }

  console.log(`\n=== Weather Service Results: ${passCount} Passed, ${failCount} Failed ===\n`);
  if (failCount > 0) {
    process.exit(1);
  }
}

runWeatherTests().catch((err) => {
  console.error('Fatal error running weather tests:', err);
  process.exit(1);
});
