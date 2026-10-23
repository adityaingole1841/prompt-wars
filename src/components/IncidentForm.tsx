import React, { useState, useRef, useEffect } from 'react';
import {
  Mic,
  MicOff,
  Camera,
  MapPin,
  Trash2,
  Send,
  Loader2,
  AlertCircle,
  HelpCircle,
  Check,
} from 'lucide-react';
import { UserLocation, UploadedImage, SupportedLanguage } from '../types/emergency';
import { TRANSLATIONS, SPEECH_LANG_MAP } from '../utils/translations';
import {
  isSpeechRecognitionSupported,
  createSpeechRecognizer,
  SpeechRecognitionController,
} from '../utils/speechRecognition';

interface IncidentFormProps {
  language: SupportedLanguage;
  onSubmit: (description: string, location: UserLocation | null, image: UploadedImage | null) => void;
  isLoading: boolean;
}

export const IncidentForm: React.FC<IncidentFormProps> = ({ language, onSubmit, isLoading }) => {
  const [description, setDescription] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [speechError, setSpeechError] = useState<string | null>(null);

  // Optional Location state
  const [location, setLocation] = useState<UserLocation | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  // Optional Photo state
  const [image, setImage] = useState<UploadedImage | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const speechRecognizerRef = useRef<SpeechRecognitionController | null>(null);
  const speechBaseTextRef = useRef<string>('');

  const t = TRANSLATIONS[language]?.form || TRANSLATIONS.en.form;
  const scenarios = TRANSLATIONS[language]?.scenarios || TRANSLATIONS.en.scenarios;

  // Clean up speech recognition on unmount
  useEffect(() => {
    return () => {
      speechRecognizerRef.current?.stop();
    };
  }, []);

  // Voice Input Toggle with Anti-Echo & Language-Aware Speech Recognition
  const toggleSpeechRecognition = () => {
    if (isRecording) {
      speechRecognizerRef.current?.stop();
      setIsRecording(false);
      return;
    }

    if (!isSpeechRecognitionSupported()) {
      setSpeechError('Speech recognition is not supported in this browser. Please type your message.');
      return;
    }

    // Capture starting text to prevent echo / repetition loops
    speechBaseTextRef.current = description.trim();
    setSpeechError(null);

    // Dynamic Indian Language speech recognition (13 languages)
    const speechLang = SPEECH_LANG_MAP[language] || 'en-IN';

    const recognizer = createSpeechRecognizer({
      lang: speechLang,
      onStart: () => {
        setIsRecording(true);
      },
      onResult: (sessionText, isFinal) => {
        const base = speechBaseTextRef.current;
        const separator = base.length > 0 ? ' ' : '';
        setDescription(base + separator + sessionText);
        if (isFinal) {
          setIsRecording(false);
        }
      },
      onError: (msg) => {
        setSpeechError(msg);
        setIsRecording(false);
      },
      onEnd: () => {
        setIsRecording(false);
      },
    });

    if (recognizer) {
      speechRecognizerRef.current = recognizer;
      recognizer.start();
    } else {
      setSpeechError('Could not start microphone on this device.');
    }
  };

  // Location Access Request with explicit consent
  const handleRequestLocation = () => {
    if (!('geolocation' in navigator)) {
      setLocationError('Geolocation is not supported by your browser.');
      return;
    }

    setIsLocating(true);
    setLocationError(null);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        let addressText = `Lat: ${pos.coords.latitude.toFixed(5)}, Long: ${pos.coords.longitude.toFixed(5)} (±${Math.round(pos.coords.accuracy)}m)`;
        
        // OpenStreetMap Nominatim Reverse Geocoding API
        try {
          const osmRes = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${pos.coords.latitude}&lon=${pos.coords.longitude}&zoom=18&addressdetails=1`
          );
          if (osmRes.ok) {
            const osmData = await osmRes.json();
            if (osmData?.display_name) {
              addressText = osmData.display_name;
            }
          }
        } catch (e) {
          console.warn('OpenStreetMap reverse geocode fallback to coords:', e);
        }

        setIsLocating(false);
        setLocation({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          accuracyMeters: Math.round(pos.coords.accuracy),
          formattedText: addressText,
          timestamp: pos.timestamp,
        });
      },
      (err) => {
        setIsLocating(false);
        if (err.code === err.PERMISSION_DENIED) {
          setLocationError('Location permission denied. You can manually type your landmark or street name.');
        } else if (err.code === err.POSITION_UNAVAILABLE) {
          setLocationError('Location information is currently unavailable.');
        } else {
          setLocationError('Location request timed out. Please type your location.');
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 30000,
      }
    );
  };

  // Photo Selection
  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    setImageError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setImageError('Please select a valid image file (JPEG, PNG, WebP).');
      return;
    }

    // Limit to 4MB for mobile safety
    if (file.size > 4 * 1024 * 1024) {
      setImageError('Photo size exceeds 4MB. Please select a smaller photo.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setImage({
        name: file.name,
        sizeBytes: file.size,
        mimeType: file.type,
        dataUrl: result,
      });
    };
    reader.onerror = () => {
      setImageError('Error reading selected image.');
    };
    reader.readAsDataURL(file);
  };

  // Submit Handler
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) {
      alert(language === 'hi' ? 'कृपया अपनी स्थिति का विवरण लिखें या बोलें।' : language === 'mr' ? 'कृपया परिस्थितीचे वर्णन लिहा किंवा बोला.' : 'Please describe what is happening, or tap one of the quick scenarios.');
      return;
    }
    onSubmit(description, location, image);
  };

  return (
    <section className="safety-card" aria-label="Emergency Description Form">
      <h2 className="card-title">
        <span>{t.title}</span>
      </h2>
      <p className="card-subtitle">
        {t.subtitle}
      </p>

      {/* Quick Scenario Buttons for Quick Testing in Selected Language */}
      <div style={{ marginBottom: '1rem' }}>
        <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#64748b' }}>
          {t.quickScenariosLabel}
        </span>
        <div className="scenario-chips-row">
          {scenarios.map((scenario) => (
            <button
              key={scenario.label}
              type="button"
              className="scenario-chip"
              onClick={() => setDescription(scenario.text)}
            >
              {scenario.label}
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="emergency-desc-input" className="form-label">
            <span>{t.inputLabel}</span>
            <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
              {description.length} {t.characters}
            </span>
          </label>
          <textarea
            id="emergency-desc-input"
            className="emergency-textarea"
            placeholder={t.placeholder}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            required
            aria-required="true"
          />
        </div>

        {/* Input Tools: Voice, Photo, Location */}
        <div className="input-tools-bar">
          {/* Voice Input */}
          <button
            type="button"
            className={`tool-button ${isRecording ? 'recording' : ''}`}
            onClick={toggleSpeechRecognition}
            aria-pressed={isRecording}
            aria-label={isRecording ? 'Stop speech recognition' : 'Start speech recognition'}
          >
            {isRecording ? <MicOff size={18} className="mic-recording-pulse" /> : <Mic size={18} />}
            <span>{isRecording ? t.voiceListening : t.voiceInput}</span>
            {isRecording && (
              <span className="soundwave-bars" aria-hidden="true">
                <span className="soundwave-bar bar-1" />
                <span className="soundwave-bar bar-2" />
                <span className="soundwave-bar bar-3" />
                <span className="soundwave-bar bar-4" />
              </span>
            )}
          </button>

          {/* Photo Upload Trigger */}
          <button
            type="button"
            className={`tool-button ${image ? 'active' : ''}`}
            onClick={() => fileInputRef.current?.click()}
            aria-label="Upload photo of incident"
          >
            <Camera size={18} />
            <span>{image ? t.changePhoto : t.addPhoto}</span>
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handlePhotoSelect}
            accept="image/*"
            style={{ display: 'none' }}
          />

          {/* Location Trigger */}
          <button
            type="button"
            className={`tool-button ${location ? 'active' : ''}`}
            onClick={handleRequestLocation}
            disabled={isLocating}
            aria-label="Add current GPS coordinates"
          >
            {isLocating ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <MapPin size={18} />
            )}
            <span>{location ? t.locationAdded : isLocating ? t.locating : t.addLocation}</span>
          </button>
        </div>

        {/* Voice Error notice */}
        {speechError && (
          <div
            style={{
              padding: '0.5rem 0.75rem',
              backgroundColor: '#fffbeb',
              borderRadius: '6px',
              fontSize: '0.8125rem',
              color: '#92400e',
              marginBottom: '0.75rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            <AlertCircle size={16} />
            <span>{speechError}</span>
          </div>
        )}

        {/* Photo Preview & Remove */}
        {image && (
          <div className="tool-detail-card">
            <div className="photo-preview-wrap">
              <img src={image.dataUrl} alt="Hazard preview" className="photo-thumbnail" />
              <div>
                <div style={{ fontWeight: 600, color: '#0f172a' }}>{image.name}</div>
                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                  {(image.sizeBytes / 1024).toFixed(0)} KB • Photo attached for visual hazard review
                </div>
              </div>
            </div>
            <button
              type="button"
              className="btn-remove-tool"
              onClick={() => {
                setImage(null);
                if (fileInputRef.current) fileInputRef.current.value = '';
              }}
              aria-label="Remove attached photo"
            >
              <Trash2 size={14} />
              <span>Remove</span>
            </button>
          </div>
        )}

        {/* Image error notice */}
        {imageError && (
          <div
            style={{
              padding: '0.5rem 0.75rem',
              backgroundColor: '#fee2e2',
              borderRadius: '6px',
              fontSize: '0.8125rem',
              color: '#991b1b',
              marginBottom: '0.75rem',
            }}
          >
            {imageError}
          </div>
        )}

        {/* Location Display & Privacy Notice */}
        {location && (
          <div className="tool-detail-card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
              <Check size={18} color="#15803d" />
              <div>
                <div style={{ fontWeight: 600, color: '#0f172a' }}>GPS Coordinates Attached</div>
                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                  {location.formattedText}
                </div>
              </div>
            </div>
            <button
              type="button"
              className="btn-remove-tool"
              onClick={() => setLocation(null)}
              aria-label="Remove GPS location"
            >
              <Trash2 size={14} />
              <span>Clear</span>
            </button>
          </div>
        )}

        {/* Location error notice */}
        {locationError && (
          <div
            style={{
              padding: '0.5rem 0.75rem',
              backgroundColor: '#fffbeb',
              borderRadius: '6px',
              fontSize: '0.8125rem',
              color: '#92400e',
              marginBottom: '0.75rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            <AlertCircle size={16} />
            <span>{locationError}</span>
          </div>
        )}

        {/* Privacy Transparency Notice */}
        <div
          style={{
            fontSize: '0.75rem',
            color: '#64748b',
            marginBottom: '1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem',
          }}
        >
          <HelpCircle size={14} />
          <span>{t.privacyNote}</span>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="btn-submit-guidance"
          disabled={isLoading || !description.trim()}
          aria-label={t.submitBtn}
        >
          {isLoading ? (
            <>
              <Loader2 size={20} className="animate-spin" />
              <span>{t.analyzingBtn}</span>
            </>
          ) : (
            <>
              <Send size={18} />
              <span>{t.submitBtn}</span>
            </>
          )}
        </button>
      </form>
    </section>
  );
};
