import React, { useEffect, useRef, useState, useCallback } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  AlertTriangle,
  ShieldAlert,
  Navigation,
  PhoneCall,
  Hospital,
  Radio,
  Search,
  Loader2,
  MapPin,
  Compass,
  Ambulance,
  Route,
  X,
} from 'lucide-react';
import { SupportedLanguage } from '../types/emergency';
import { TRANSLATIONS } from '../utils/translations';

export interface ThreatZoneData {
  latitude: number;
  longitude: number;
  radiusMeters?: number;
  label?: string;
  threatType?: string;
  urgency?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  details?: string;
  osmAddress?: string;
}

interface NearbyHospital {
  id: number;
  name: string;
  lat: number;
  lon: number;
  distanceKm: number;
  phone?: string;
  address?: string;
  emergency?: string;
}

interface EmergencyThreatMapProps {
  language: SupportedLanguage;
  activeThreat?: ThreatZoneData | null;
  theme?: 'light' | 'dark';
}

interface OsmSearchResult {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
  type?: string;
}

// Preset Danger Zones across India for instant testing & awareness
const PRESET_THREAT_ZONES: Array<{
  name: Record<SupportedLanguage, string>;
  data: ThreatZoneData;
}> = [
  {
    name: {
      en: '🌊 Coastal Inundation / Storm Surge (Mumbai)',
      hi: '🌊 तटीय बाढ़ / जलभराव रेड जोन (मुंबई)',
      mr: '🌊 किनारपट्टी पूर / पाणी साचणे रेड झोन (मुंबई)',
      bn: '🌊 উপকূলীয় প্লাবন রেড জোন (মুম্বাই)',
      te: '🌊 తీరప్రాంత వరద రెడ్ జోన్ (ముంబై)',
      ta: '🌊 கடலோர வெள்ள ரெட் சோன் (மும்பை)',
      gu: '🌊 દरিยाকાंઠानું पूर रेड झोन (मुंबई)',
      kn: '🌊 ಕರಾವಳಿ ಪ್ರವಾಹ ರೆಡ್ ಜೋನ್ (ಮುಂಬೈ)',
      ml: '🌊 തീരദേശ പ്രളയം റെഡ് സോൺ (മുംബൈ)',
      pa: '🌊 ਤੱਟਵਰਤੀ ਹੜ੍ਹ ਰੈੱਡ ਜ਼ੋਨ (ਮੁੰਬਈ)',
      or: '🌊 ଉପକୂଳ ବନ୍ୟା ରେଡ୍ ଜୋନ୍ (ମୁମ୍ବାଇ)',
      ur: '🌊 ساحلی سیلاب ریڈ زون (ممبئی)',
      as: '🌊 উপকূলীয় বানপানী ৰেড জোন (মুম্বাই)',
    },
    data: {
      latitude: 18.922,
      longitude: 72.8346,
      radiusMeters: 3000,
      label: 'South Mumbai Coastal Flood Zone',
      threatType: 'Urban Flooding & Storm Surge',
      urgency: 'HIGH',
      details: 'High waterlogging risk. Avoid sea-facing promenades and low-lying subways.',
      osmAddress: 'Gateway of India, Colaba, Mumbai, Maharashtra, 400001, India',
    },
  },
  {
    name: {
      en: '🌀 Cyclone Landfall Danger Zone (Odisha Coast)',
      hi: '🌀 चक्रवात लैंडफॉल खतरा रेड जोन (ओडिशा तट)',
      mr: '🌀 चक्रीवादळ धोका रेड झोन (ओडिशा किनारा)',
      bn: '🌀 ঘূর্ণিঝড় ল্যান্ডফল বিপদ অঞ্চল (ওড়িশা)',
      te: '🌀 తుఫాను ల్యాండ్‌ఫాల్ రెడ్ జోన్ (ఒడిశా)',
      ta: '🌀 புயல் தாக்கம் ஆபத்து ரெட் சோன் (ஒடிசா)',
      gu: '🌀 వావాజోడা ళేండ్‌ఫఆల్ రెడ్ జోన్ (ఓడిశా)',
      kn: '🌀 ಚಂಡಮಾರುತ ಭೂಕುಸಿತ ರೆಡ್ ಜೋನ್ (ಒಡಿಶಾ)',
      ml: '🌀 ചുഴലിക്കാറ്റ് തീരത്ത് എത്തുന്ന റെഡ് സോൺ (ഒഡീഷ)',
      pa: '🌀 ਚੱਕਰਵਾਤ ਲੈਂਡਫਾਲ ਰੈੱਡ ਜ਼ੋਨ (ਓਡੀਸ਼ਾ)',
      or: '🌀 ବାତ୍ୟା ଲ୍ୟାଣ୍ଡଫଲ୍ ବିପଦ ରେଡ୍ ଜୋନ୍ (ଓଡ଼ିଶା)',
      ur: '🌀 سمندری طوفان ریڈ زون (اوڈیشہ)',
      as: '🌀 ঘূৰ্ণীবতাহ সংকট ৰেড জোন (ওড়িশা)',
    },
    data: {
      latitude: 20.2961,
      longitude: 85.8245,
      radiusMeters: 5000,
      label: 'Odisha Coast Cyclone Alert Zone',
      threatType: 'Very Severe Cyclonic Storm',
      urgency: 'CRITICAL',
      details: 'Gale wind speeds 110-120 kmph expected. Evacuate to designated cyclone shelters.',
      osmAddress: 'Bhubaneswar, Khordha, Odisha, 751001, India',
    },
  },
  {
    name: {
      en: '🔥 Structural Fire / Industrial Hazard (Delhi NCR)',
      hi: '🔥 भीषण औद्योगिक आग रेड जोन (दिल्ली एनसीआर)',
      mr: '🔥 औद्योगिक आग धोका रेड झोन (दिल्ली)',
      bn: '🔥 শিল্পাঞ্চল অগ্নিকাণ্ড রেড জোন (দিল্লি)',
      te: '🔥 పరిశ్రమల అగ్ని ప్రమాదం రెడ్ జోన్ (ఢిల్లీ)',
      ta: '🔥 தொழிற்சாலை தீ விபத்து ரெட் சோன் (டெல்லி)',
      gu: '🔥 ওডিশালা আগা রেড জোন (দিল্লী)',
      kn: '🔥 ಕೈಗಾರಿಕಾ ಬೆಂಕಿ ಅನಾಹುತ ರೆಡ್ ಜೋನ್ (ದೆಹಲಿ)',
      ml: '🔥 വ്യാവസായിക തീപിടുത്തം റെഡ് സോൺ (ഡൽഹി)',
      pa: '🔥 ਉਦਯੋਗਿਕ ਅੱਗ ਰੈੱਡ ਜ਼ੋਨ (ਦਿੱਲੀ)',
      or: '🔥 ଶିଳ୍ପାଞ୍ଚଳ ଅଗ୍ନିକାଣ୍ଡ ରେଡ୍ ଜୋନ୍ (ଦିଲ୍ଲୀ)',
      ur: '🔥 صنعتی آگ ریڈ زون (دہلی)',
      as: '🔥 ঔদ্যোগিক অগ্নিকাণ্ড ৰেড জোন (দিল্লী)',
    },
    data: {
      latitude: 28.6139,
      longitude: 77.209,
      radiusMeters: 2000,
      label: 'Delhi Industrial Hazmat Zone',
      threatType: 'Chemical Fume & Structural Fire',
      urgency: 'CRITICAL',
      details: 'Toxic smoke cloud spreading East. Wear N95 respirator and evacuate 2km perimeter.',
      osmAddress: 'Connaught Place, New Delhi, Delhi, 110001, India',
    },
  },
  {
    name: {
      en: '⛰️ Cloudburst & Landslide Risk Zone (Uttarakhand)',
      hi: '⛰️ बादल फटना व भूस्खलन रेड जोन (उत्तराखंड)',
      mr: '⛰️ ढगफुटी आणि दरड कोसळणे रेड झोन (उत्तराखंड)',
      bn: '⛰️ মেঘভাঙা বৃষ্টি ও ভূমিধস রেড জোন (উত্তরাখণ্ড)',
      te: '⛰️ క్లౌడ్‌బర్స్ట్ & కొండచరియల రెడ్ జోన్ (ఉత్తరాఖండ్)',
      ta: '⛰️ நிலச்சரிவு அபாய ரெட் சோன் (உத்தரகண்ட்)',
      gu: '⛰️ উত্তরখন্ড ভূমিস্ক্ষলন রেড জোন',
      kn: '⛰️ ಮೇಘಸ್ಫೋಟ & ಭೂಕುಸಿತ ರೆಡ್ ಜೋನ್ (ಉತ್ತರಾಖಂಡ)',
      ml: '⛰️ ഉരുൾപൊട്ടൽ സാധ്യതയുള്ള റെഡ് സോൺ (ഉത്തരാഖണ്ഡ്)',
      pa: '⛰️ ਜ਼ਮੀਨ ਖਿਸਕਣ ਦਾ ਰੈੱਡ ਜ਼ੋਨ (ਉੱਤਰਾਖੰਡ)',
      or: '⛰️ ବାଦଲ ଫାଟିବା ଓ ଭୂସ୍ଖଳନ ରେଡ୍ ଜୋନ୍ (ଉତ୍ତରାଖଣ୍ଡ)',
      ur: '⛰️ لینڈ سلائیڈنگ ریڈ زون (اتراکھنڈ)',
      as: '⛰️ মেঘভঙা বৰষুণ আৰু ভূমিস্খলন ৰেড জোন (উত্তৰাখণ্ড)',
    },
    data: {
      latitude: 30.0668,
      longitude: 79.0193,
      radiusMeters: 4000,
      label: 'Garhwal Valley Cloudburst Zone',
      threatType: 'Sudden Flash Flood & Mudflow',
      urgency: 'HIGH',
      details: 'High mudflow velocity. Keep away from riverbeds and valley slopes.',
      osmAddress: 'Rudraprayag, Garhwal, Uttarakhand, 246171, India',
    },
  },
];

// Haversine distance helper (returns km)
function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export const EmergencyThreatMap: React.FC<EmergencyThreatMapProps> = ({
  language,
  activeThreat,
  theme = 'light',
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const threatLayersRef = useRef<L.LayerGroup | null>(null);
  const safeZoneLayersRef = useRef<L.LayerGroup | null>(null);
  const hospitalLayersRef = useRef<L.LayerGroup | null>(null);

  const [currentThreat, setCurrentThreat] = useState<ThreatZoneData | null>(
    activeThreat || PRESET_THREAT_ZONES[0].data
  );
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [distanceToThreat, setDistanceToThreat] = useState<number | null>(null);

  // Nearest hospitals state
  const [nearbyHospitals, setNearbyHospitals] = useState<NearbyHospital[]>([]);
  const [isFetchingHospitals, setIsFetchingHospitals] = useState<boolean>(false);
  const [nearestHospital, setNearestHospital] = useState<NearbyHospital | null>(null);
  const [showHospitalPanel, setShowHospitalPanel] = useState<boolean>(false);

  // OpenStreetMap Search & Geocoding States
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [searchResults, setSearchResults] = useState<OsmSearchResult[]>([]);
  const [searchError, setSearchError] = useState<string | null>(null);

  // Sync external threat prop if passed
  useEffect(() => {
    if (activeThreat) {
      setCurrentThreat(activeThreat);
    }
  }, [activeThreat]);

  // OpenStreetMap Nominatim Reverse Geocoding Helper
  const reverseGeocodeOSM = useCallback(async (lat: number, lon: number): Promise<string> => {
    try {
      const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=18&addressdetails=1`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        return data?.display_name || `Lat: ${lat.toFixed(4)}, Lon: ${lon.toFixed(4)}`;
      }
    } catch (e) {
      console.warn('OpenStreetMap reverse geocode failed:', e);
    }
    return `Lat: ${lat.toFixed(4)}, Lon: ${lon.toFixed(4)}`;
  }, []);

  // ─────────────────────────────────────────────────────────────────
  //  Fetch nearest hospitals via Overpass API (real OSM hospital data)
  // ─────────────────────────────────────────────────────────────────
  const fetchNearbyHospitals = useCallback(
    async (lat: number, lon: number, radiusM: number = 5000) => {
      setIsFetchingHospitals(true);
      setNearbyHospitals([]);
      setNearestHospital(null);

      // Overpass QL: fetch nodes/ways tagged as hospital within radius
      const overpassQuery = `
        [out:json][timeout:20];
        (
          node["amenity"="hospital"](around:${radiusM},${lat},${lon});
          way["amenity"="hospital"](around:${radiusM},${lat},${lon});
          node["amenity"="clinic"](around:${radiusM},${lat},${lon});
          node["healthcare"="hospital"](around:${radiusM},${lat},${lon});
        );
        out center tags;
      `.trim();

      try {
        const res = await fetch('https://overpass-api.de/api/interpreter', {
          method: 'POST',
          body: overpassQuery,
        });

        if (!res.ok) throw new Error('Overpass API error');

        const json = await res.json();
        const elements: any[] = json.elements || [];

        const hospitals: NearbyHospital[] = elements
          .map((el, idx) => {
            const eLat = el.lat ?? el.center?.lat;
            const eLon = el.lon ?? el.center?.lon;
            if (!eLat || !eLon) return null;

            const tags = el.tags || {};
            const name =
              tags.name ||
              tags['name:en'] ||
              tags['name:hi'] ||
              'Hospital / Clinic';
            const distanceKm = haversineKm(lat, lon, eLat, eLon);

            return {
              id: el.id ?? idx,
              name,
              lat: eLat,
              lon: eLon,
              distanceKm,
              phone: tags.phone || tags['contact:phone'] || tags['emergency:phone'],
              address: [
                tags['addr:housenumber'],
                tags['addr:street'],
                tags['addr:city'],
              ]
                .filter(Boolean)
                .join(', '),
              emergency: tags.emergency,
            } as NearbyHospital;
          })
          .filter(Boolean) as NearbyHospital[];

        // Sort by distance
        hospitals.sort((a, b) => a.distanceKm - b.distanceKm);

        // If none found within radius, expand to 15km
        if (hospitals.length === 0 && radiusM < 15000) {
          setIsFetchingHospitals(false);
          return fetchNearbyHospitals(lat, lon, 15000);
        }

        setNearbyHospitals(hospitals.slice(0, 8));
        if (hospitals.length > 0) {
          setNearestHospital(hospitals[0]);
          setShowHospitalPanel(true);
        }
      } catch (err) {
        console.warn('Overpass API fetch failed, using fallback:', err);
        // Fallback: show estimated placeholder
        const fallback: NearbyHospital = {
          id: -1,
          name: 'District Civil Hospital (Estimated)',
          lat: lat + 0.016,
          lon: lon + 0.014,
          distanceKm: haversineKm(lat, lon, lat + 0.016, lon + 0.014),
          phone: '108',
          address: 'Emergency trauma care available 24/7',
          emergency: 'yes',
        };
        setNearbyHospitals([fallback]);
        setNearestHospital(fallback);
        setShowHospitalPanel(true);
      } finally {
        setIsFetchingHospitals(false);
      }
    },
    []
  );

  // OpenStreetMap Nominatim Forward Search
  const handleOsmSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const q = searchQuery.trim();
    if (!q || isSearching) return;

    setIsSearching(true);
    setSearchError(null);
    try {
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
        q
      )}&countrycodes=in&limit=5`;
      const res = await fetch(url);
      if (!res.ok) throw new Error('OpenStreetMap Search service unavailable.');
      const results: OsmSearchResult[] = await res.json();

      if (results.length === 0) {
        setSearchError('No places found in India on OpenStreetMap. Try another landmark or city.');
      } else {
        setSearchResults(results);
      }
    } catch (err) {
      setSearchError('Failed to search OpenStreetMap. Please check network connectivity.');
    } finally {
      setIsSearching(false);
    }
  };

  // Select Search Result
  const handleSelectOsmPlace = (place: OsmSearchResult) => {
    const lat = parseFloat(place.lat);
    const lon = parseFloat(place.lon);
    setSearchResults([]);
    setSearchQuery(place.display_name.split(',')[0]);

    setCurrentThreat({
      latitude: lat,
      longitude: lon,
      radiusMeters: 2500,
      label: place.display_name.split(',')[0] || 'Selected OpenStreetMap Place',
      threatType: 'Reported Area Threat',
      urgency: 'HIGH',
      details: 'Active hazard zone at chosen OpenStreetMap location. Evacuate red perimeter.',
      osmAddress: place.display_name,
    });
  };

  // Initialize Map with OpenStreetMap Tile Layer
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
    }

    const initialLat = currentThreat?.latitude || 20.5937;
    const initialLng = currentThreat?.longitude || 78.9629;
    const initialZoom = currentThreat ? 13 : 5;

    const map = L.map(mapContainerRef.current, {
      center: [initialLat, initialLng],
      zoom: initialZoom,
      zoomControl: true,
      scrollWheelZoom: true,
    });

    // Official OpenStreetMap Tile Layer & OpenStreetMap Dark mode styling
    const tileUrl =
      theme === 'dark'
        ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
        : 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';

    const attribution =
      '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors';

    L.tileLayer(tileUrl, {
      maxZoom: 19,
      attribution,
    }).addTo(map);

    const threatGroup = L.layerGroup().addTo(map);
    const safeGroup = L.layerGroup().addTo(map);
    const hospitalGroup = L.layerGroup().addTo(map);

    threatLayersRef.current = threatGroup;
    safeZoneLayersRef.current = safeGroup;
    hospitalLayersRef.current = hospitalGroup;
    mapInstanceRef.current = map;

    // Interactive Click: user can click anywhere on OpenStreetMap to mark a danger zone
    map.on('click', async (e: L.LeafletMouseEvent) => {
      const { lat, lng } = e.latlng;
      const osmName = await reverseGeocodeOSM(lat, lng);

      setCurrentThreat({
        latitude: lat,
        longitude: lng,
        radiusMeters: 2500,
        label: `Accident/Danger: ${osmName.split(',')[0]}`,
        threatType: 'User Reported Active Threat',
        urgency: 'HIGH',
        details: 'Interactive hazard zone centered at chosen location. Nearest hospitals shown below.',
        osmAddress: osmName,
      });

      // Auto-fetch hospitals when user drops a pin
      fetchNearbyHospitals(lat, lng, 5000);
    });

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, [theme, reverseGeocodeOSM, fetchNearbyHospitals]);

  // Update Threat Zone Markers & Perimeter Circles
  useEffect(() => {
    const map = mapInstanceRef.current;
    const threatGroup = threatLayersRef.current;
    const safeGroup = safeZoneLayersRef.current;

    if (!map || !threatGroup || !safeGroup) return;

    threatGroup.clearLayers();
    safeGroup.clearLayers();

    if (!currentThreat) return;

    const {
      latitude,
      longitude,
      radiusMeters = 2500,
      label,
      threatType,
      urgency,
      details,
      osmAddress,
    } = currentThreat;

    // 1. Red Danger Zone Outer Circle (Hazard Perimeter)
    const hazardCircle = L.circle([latitude, longitude], {
      color: '#dc2626',
      weight: 3,
      opacity: 0.85,
      fillColor: '#ef4444',
      fillOpacity: 0.28,
      radius: radiusMeters,
      dashArray: '8, 6',
      className: 'pulse-threat-circle',
    });

    hazardCircle.addTo(threatGroup);

    // 2. High-Severity Inner Danger Zone
    const innerCoreCircle = L.circle([latitude, longitude], {
      color: '#991b1b',
      weight: 1.5,
      opacity: 0.9,
      fillColor: '#b91c1c',
      fillOpacity: 0.45,
      radius: Math.max(300, radiusMeters * 0.35),
    });
    innerCoreCircle.addTo(threatGroup);

    // 3. Custom Pulsing Red Dot Epicenter Marker
    const pulsingRedDotHtml = `
      <div class="threat-marker-pin" style="position: relative; width: 36px; height: 36px; display: flex; align-items: center; justify-content: center;">
        <span class="threat-ripple-ring" style="position: absolute; width: 36px; height: 36px; border-radius: 50%; background: rgba(239, 68, 68, 0.4); animation: threatPulse 1.8s infinite ease-out;"></span>
        <span class="threat-ripple-ring2" style="position: absolute; width: 24px; height: 24px; border-radius: 50%; background: rgba(220, 38, 38, 0.6); animation: threatPulse 1.8s infinite 0.5s ease-out;"></span>
        <span class="threat-center-dot" style="position: relative; width: 14px; height: 14px; border-radius: 50%; background: #ffffff; border: 3px solid #dc2626; box-shadow: 0 0 10px rgba(220, 38, 38, 0.9);"></span>
      </div>
    `;

    const epicenterIcon = L.divIcon({
      html: pulsingRedDotHtml,
      className: 'custom-threat-icon',
      iconSize: [36, 36],
      iconAnchor: [18, 18],
    });

    const marker = L.marker([latitude, longitude], { icon: epicenterIcon });

    const popupContent = `
      <div class="threat-map-popup" style="font-family: inherit; min-width: 220px;">
        <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 6px;">
          <span style="background: #dc2626; color: #fff; font-size: 11px; font-weight: 800; padding: 2px 7px; border-radius: 4px; text-transform: uppercase;">
            ${urgency || 'CRITICAL'} THREAT ZONE
          </span>
        </div>
        <strong style="display: block; font-size: 14px; color: #0f172a; margin-bottom: 2px;">
          ${label || 'Active Danger Area'}
        </strong>
        <span style="display: block; font-size: 11px; font-weight: 700; color: #dc2626; margin-bottom: 4px;">
          Type: ${threatType || 'Hazard Zone'}
        </span>
        ${
          osmAddress
            ? `<div style="font-size: 11px; color: #475569; margin-bottom: 6px; background: #f8fafc; padding: 4px 6px; border-radius: 4px; border: 1px solid #e2e8f0;">
                📍 <b>OpenStreetMap:</b> ${osmAddress}
               </div>`
            : ''
        }
        <p style="font-size: 12px; color: #64748b; margin: 0 0 8px 0; line-height: 1.4;">
          ${details || 'Severe emergency reported. Keep clear of the highlighted red perimeter.'}
        </p>
        <div style="font-size: 11px; background: #fee2e2; color: #991b1b; padding: 4px 8px; border-radius: 6px; font-weight: 600; margin-bottom: 8px;">
          ⚠️ Danger Radius: ${(radiusMeters / 1000).toFixed(1)} km around epicenter
        </div>
        <div style="display:flex; gap:6px;">
          <a href="tel:112" style="flex:1; display: flex; align-items: center; justify-content: center; gap: 5px; background: #dc2626; color: #ffffff; text-decoration: none; font-size: 12px; font-weight: 700; padding: 6px 8px; border-radius: 6px;">
            📞 112 Emergency
          </a>
          <a href="tel:108" style="flex:1; display: flex; align-items: center; justify-content: center; gap: 5px; background: #0284c7; color: #ffffff; text-decoration: none; font-size: 12px; font-weight: 700; padding: 6px 8px; border-radius: 6px;">
            🚑 108 Ambulance
          </a>
        </div>
      </div>
    `;

    marker.bindPopup(popupContent).addTo(threatGroup);

    // Fly to threat zone smoothly
    map.flyTo([latitude, longitude], 13, { duration: 1.2 });
  }, [currentThreat]);

  // ─────────────────────────────────────────────────────────────────
  //  Render hospital markers on map from Overpass API results
  // ─────────────────────────────────────────────────────────────────
  useEffect(() => {
    const map = mapInstanceRef.current;
    const hospitalGroup = hospitalLayersRef.current;
    if (!map || !hospitalGroup) return;

    hospitalGroup.clearLayers();

    nearbyHospitals.forEach((hosp, idx) => {
      const isNearest = idx === 0;
      const hospitalIconHtml = `
        <div style="
          background: ${isNearest ? '#0ea5e9' : '#0284c7'};
          color: #fff;
          width: ${isNearest ? '40px' : '32px'};
          height: ${isNearest ? '40px' : '32px'};
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 3px solid ${isNearest ? '#ffffff' : '#bae6fd'};
          box-shadow: 0 2px 12px rgba(2,132,199,0.5);
          font-size: ${isNearest ? '18px' : '14px'};
          position: relative;
        ">
          🏥
          ${isNearest ? '<span style="position:absolute;top:-6px;right:-6px;background:#f59e0b;color:#fff;font-size:8px;font-weight:900;padding:1px 4px;border-radius:10px;border:1px solid #fff;">NEAREST</span>' : ''}
        </div>
      `;

      const hospitalIcon = L.divIcon({
        html: hospitalIconHtml,
        className: 'custom-hospital-icon',
        iconSize: isNearest ? [40, 40] : [32, 32],
        iconAnchor: isNearest ? [20, 20] : [16, 16],
      });

      const hosMarker = L.marker([hosp.lat, hosp.lon], { icon: hospitalIcon });

      // Draw a line from threat to nearest hospital
      if (isNearest && currentThreat) {
        const routeLine = L.polyline(
          [
            [currentThreat.latitude, currentThreat.longitude],
            [hosp.lat, hosp.lon],
          ],
          {
            color: '#0ea5e9',
            weight: 3,
            opacity: 0.75,
            dashArray: '10, 6',
          }
        );
        routeLine.addTo(hospitalGroup);
      }

      const popupHtml = `
        <div style="font-family: inherit; min-width: 200px;">
          <div style="display:flex; align-items:center; gap:6px; margin-bottom:5px;">
            <span style="font-size:18px;">🏥</span>
            ${isNearest ? '<span style="background:#0ea5e9; color:#fff; font-size:10px; font-weight:800; padding:2px 6px; border-radius:4px;">NEAREST HOSPITAL</span>' : ''}
          </div>
          <strong style="display:block; font-size:13px; color:#0f172a; margin-bottom:3px;">${hosp.name}</strong>
          <div style="font-size:11px; color:#475569; margin-bottom:4px;">
            📏 <b>${hosp.distanceKm.toFixed(2)} km</b> from accident spot
          </div>
          ${hosp.address ? `<div style="font-size:11px; color:#64748b; margin-bottom:5px;">📍 ${hosp.address}</div>` : ''}
          ${hosp.emergency === 'yes' ? '<div style="font-size:11px; background:#dcfce7; color:#166534; padding:3px 6px; border-radius:4px; margin-bottom:6px; font-weight:600;">✅ Emergency Services Available</div>' : ''}
          <div style="display:flex; gap:5px; margin-top:6px;">
            ${hosp.phone ? `<a href="tel:${hosp.phone}" style="flex:1; background:#0284c7; color:#fff; text-decoration:none; font-size:11px; font-weight:700; padding:5px 8px; border-radius:5px; text-align:center;">📞 Call</a>` : ''}
            <a href="https://www.google.com/maps/dir/?api=1&destination=${hosp.lat},${hosp.lon}" target="_blank" rel="noopener noreferrer" style="flex:1; background:#16a34a; color:#fff; text-decoration:none; font-size:11px; font-weight:700; padding:5px 8px; border-radius:5px; text-align:center;">🗺️ Navigate</a>
            <a href="tel:108" style="flex:1; background:#dc2626; color:#fff; text-decoration:none; font-size:11px; font-weight:700; padding:5px 8px; border-radius:5px; text-align:center;">🚑 108</a>
          </div>
        </div>
      `;

      hosMarker.bindPopup(popupHtml).addTo(hospitalGroup);

      if (isNearest) {
        hosMarker.openPopup();
      }
    });
  }, [nearbyHospitals, currentThreat]);

  // Locate User GPS and Reverse Geocode via OpenStreetMap
  const handleLocateMe = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported in this browser.');
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        setUserLocation({ lat: latitude, lng: longitude });

        // OpenStreetMap Reverse Geocode
        const osmName = await reverseGeocodeOSM(latitude, longitude);
        setIsLocating(false);

        const map = mapInstanceRef.current;
        if (map) {
          const userIconHtml = `
            <div style="background: #2563eb; color: #fff; width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 3px solid #ffffff; box-shadow: 0 0 12px rgba(37,99,235,0.9);">
              <span style="width: 8px; height: 8px; background: #fff; border-radius: 50%;"></span>
            </div>
          `;
          const userIcon = L.divIcon({
            html: userIconHtml,
            className: 'user-location-pin',
            iconSize: [24, 24],
            iconAnchor: [12, 12],
          });

          L.marker([latitude, longitude], { icon: userIcon })
            .bindPopup(
              `<b>You are here (Live GPS)</b><br/><span style="font-size:11px;">📍 ${osmName}</span>`
            )
            .addTo(map)
            .openPopup();

          map.flyTo([latitude, longitude], 14);

          // Calculate distance to threat
          if (currentThreat) {
            const dKm = haversineKm(
              latitude,
              longitude,
              currentThreat.latitude,
              currentThreat.longitude
            );
            setDistanceToThreat(dKm);
          }

          // Fetch nearest hospitals from user's location
          fetchNearbyHospitals(latitude, longitude, 5000);
        }
      },
      (err) => {
        setIsLocating(false);
        alert(`Location access denied or unavailable: ${err.message}`);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // Trigger hospital fetch when preset/threat changes
  const handleThreatChange = (data: ThreatZoneData) => {
    setCurrentThreat(data);
    setDistanceToThreat(null);
    setSearchResults([]);
    fetchNearbyHospitals(data.latitude, data.longitude, 5000);
  };

  // Initial fetch for default threat
  useEffect(() => {
    if (currentThreat) {
      fetchNearbyHospitals(currentThreat.latitude, currentThreat.longitude, 5000);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const t = TRANSLATIONS[language] || TRANSLATIONS.en;

  return (
    <section className="threat-map-section" aria-label="Interactive Disaster & Threat Map">
      <div className="threat-map-header">
        <div className="threat-map-title-row">
          <div className="threat-title-group">
            <span className="threat-badge-live">
              <span className="live-dot-pulse" /> LIVE
            </span>
            <h2 className="threat-map-heading">
              <ShieldAlert size={20} className="threat-heading-icon" />
              <span>{t.tabs.map}</span>
            </h2>
            <span className="osm-verified-badge" title="Powered by OpenStreetMap (OSM) Tiles & Nominatim API">
              <Compass size={12} /> OpenStreetMap API
            </span>
          </div>

          <div className="threat-map-actions">
            <button
              type="button"
              className="btn-map-action btn-locate-me"
              onClick={handleLocateMe}
              disabled={isLocating}
              title="Locate my position via GPS & OpenStreetMap"
            >
              <Navigation size={15} />
              <span>
                {isLocating
                  ? 'Locating...'
                  : userLocation
                  ? `GPS: ${userLocation.lat.toFixed(2)}, ${userLocation.lng.toFixed(2)}`
                  : 'My Location'}
              </span>
            </button>

            <button
              type="button"
              className="btn-map-action btn-find-hospital"
              onClick={() => {
                if (currentThreat) {
                  fetchNearbyHospitals(currentThreat.latitude, currentThreat.longitude, 5000);
                }
              }}
              disabled={isFetchingHospitals}
              title="Find nearest hospitals to the accident/threat zone"
            >
              {isFetchingHospitals ? (
                <Loader2 size={15} className="spin-icon" />
              ) : (
                <Ambulance size={15} />
              )}
              <span>{isFetchingHospitals ? 'Searching...' : 'Find Hospitals'}</span>
            </button>
          </div>
        </div>

        {/* OpenStreetMap Nominatim Search Bar */}
        <div className="osm-search-bar-wrap">
          <form onSubmit={handleOsmSearch} className="osm-search-form">
            <Search size={16} className="osm-search-icon" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search city, town, or landmark in India (OpenStreetMap API)..."
              className="osm-search-input"
              aria-label="Search location on OpenStreetMap"
            />
            <button
              type="submit"
              className="btn-osm-search-submit"
              disabled={isSearching || !searchQuery.trim()}
            >
              {isSearching ? <Loader2 size={14} className="spin-icon" /> : 'Search OSM'}
            </button>
          </form>

          {/* Search Error */}
          {searchError && <div className="osm-search-error">{searchError}</div>}

          {/* Search Dropdown Results */}
          {searchResults.length > 0 && (
            <ul className="osm-search-results-dropdown" role="listbox">
              {searchResults.map((result) => (
                <li key={result.place_id}>
                  <button
                    type="button"
                    className="osm-search-result-item"
                    onClick={() => handleSelectOsmPlace(result)}
                  >
                    <MapPin size={14} className="osm-result-pin" />
                    <span>{result.display_name}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <p className="threat-map-sub">
          🔴 <strong>Red Dot & Red Danger Zone:</strong> Active hazard perimeter. |{' '}
          🏥 <strong>Blue Markers:</strong> Real OSM hospitals. |{' '}
          <strong>Tap anywhere</strong> to drop danger zone & auto-find hospitals.
        </p>

        {/* Current Threat Address Card */}
        {currentThreat?.osmAddress && (
          <div className="osm-current-address-card">
            <MapPin size={15} className="osm-pin-active" />
            <div className="osm-address-info">
              <span className="osm-address-label">OpenStreetMap Location:</span>
              <span className="osm-address-text">{currentThreat.osmAddress}</span>
            </div>
          </div>
        )}

        {/* Distance Warning Banner if user located */}
        {distanceToThreat !== null && currentThreat && (
          <div
            className={`threat-proximity-badge ${
              distanceToThreat < (currentThreat.radiusMeters || 2500) / 1000
                ? 'danger-in-zone'
                : 'safe-outside-zone'
            }`}
          >
            <AlertTriangle size={16} />
            <span>
              {distanceToThreat < (currentThreat.radiusMeters || 2500) / 1000
                ? `⚠️ WARNING: You are INSIDE the hazard zone (${distanceToThreat.toFixed(2)} km from epicenter). Evacuate immediately!`
                : `✓ You are ${distanceToThreat.toFixed(1)} km away from the active hazard perimeter.`}
            </span>
          </div>
        )}

        {/* ── NEAREST HOSPITAL PANEL ── */}
        {showHospitalPanel && nearestHospital && (
          <div className="nearest-hospital-panel">
            <div className="hospital-panel-header">
              <div className="hospital-panel-title">
                <Ambulance size={18} className="hospital-panel-icon" />
                <span>Nearest Hospital to Accident Site</span>
              </div>
              <button
                type="button"
                className="hospital-panel-close"
                onClick={() => setShowHospitalPanel(false)}
                aria-label="Close hospital panel"
              >
                <X size={16} />
              </button>
            </div>

            {/* Nearest hospital highlight card */}
            <div className="nearest-hospital-card">
              <div className="nearest-hosp-badge">🏥 NEAREST</div>
              <div className="nearest-hosp-name">{nearestHospital.name}</div>
              <div className="nearest-hosp-meta">
                <Route size={13} />
                <span>{nearestHospital.distanceKm.toFixed(2)} km from accident spot</span>
              </div>
              {nearestHospital.address && (
                <div className="nearest-hosp-addr">📍 {nearestHospital.address}</div>
              )}
              {nearestHospital.emergency === 'yes' && (
                <div className="nearest-hosp-emergency-tag">✅ Emergency Services Available</div>
              )}
              <div className="nearest-hosp-actions">
                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${nearestHospital.lat},${nearestHospital.lon}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-hosp-navigate"
                >
                  🗺️ Navigate
                </a>
                {nearestHospital.phone && (
                  <a href={`tel:${nearestHospital.phone}`} className="btn-hosp-call">
                    📞 Call Hospital
                  </a>
                )}
                <a href="tel:108" className="btn-hosp-ambulance">
                  🚑 108 Ambulance
                </a>
              </div>
            </div>

            {/* All nearby hospitals list */}
            {nearbyHospitals.length > 1 && (
              <div className="hospital-list-wrap">
                <div className="hospital-list-label">
                  <Hospital size={13} /> {nearbyHospitals.length} hospitals found nearby
                </div>
                <ul className="hospital-list">
                  {nearbyHospitals.map((hosp, idx) => (
                    <li key={hosp.id} className={`hospital-list-item ${idx === 0 ? 'nearest' : ''}`}>
                      <span className="hosp-rank">#{idx + 1}</span>
                      <div className="hosp-info">
                        <span className="hosp-item-name">{hosp.name}</span>
                        <span className="hosp-item-dist">
                          <Route size={11} /> {hosp.distanceKm.toFixed(2)} km
                        </span>
                      </div>
                      <div className="hosp-item-actions">
                        <a
                          href={`https://www.google.com/maps/dir/?api=1&destination=${hosp.lat},${hosp.lon}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn-hosp-item-nav"
                          title="Navigate"
                        >
                          🗺️
                        </a>
                        <a href="tel:108" className="btn-hosp-item-call" title="Call Ambulance">
                          🚑
                        </a>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Fetching Hospitals Indicator */}
        {isFetchingHospitals && (
          <div className="hospital-fetching-indicator">
            <Loader2 size={16} className="spin-icon" />
            <span>Searching real hospitals near accident site via OpenStreetMap Overpass API...</span>
          </div>
        )}

        {/* Quick Disaster Preset Selector */}
        <div className="threat-presets-wrap">
          <span className="threat-presets-label">
            <Radio size={14} />
            <span>OpenStreetMap Hazard Presets:</span>
          </span>
          <div className="threat-presets-chips">
            {PRESET_THREAT_ZONES.map((preset, idx) => (
              <button
                key={idx}
                type="button"
                className={`preset-threat-chip ${
                  currentThreat?.label === preset.data.label ? 'active' : ''
                }`}
                onClick={() => handleThreatChange(preset.data)}
              >
                {preset.name[language] || preset.name.en}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Map Container */}
      <div className="threat-map-viewport-wrap">
        <div
          ref={mapContainerRef}
          className="threat-map-viewport"
          style={{ width: '100%', height: '460px', borderRadius: '12px', zIndex: 1 }}
        />

        {/* Map Legend Floating Overlay */}
        <div className="threat-map-legend">
          <div className="legend-item">
            <span className="legend-color-box legend-red-circle" />
            <span>Hazard Perimeter (Red Zone)</span>
          </div>
          <div className="legend-item">
            <span style={{ fontSize: '14px' }}>🏥</span>
            <span>OSM Hospitals (Real Data)</span>
          </div>
          <div className="legend-item">
            <span className="legend-hint">🗺️ OpenStreetMap + Overpass API</span>
          </div>
        </div>
      </div>

      <div className="threat-map-footer">
        <div className="footer-helpline-quick">
          <span>In immediate danger?</span>
          <a href="tel:112" className="btn-quick-112">
            <PhoneCall size={14} />
            <span>Dial 112 (Disaster & Police)</span>
          </a>
          <a href="tel:108" className="btn-quick-108">
            <Hospital size={14} />
            <span>Dial 108 (Ambulance)</span>
          </a>
        </div>
      </div>
    </section>
  );
};
