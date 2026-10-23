import React, { useState, useRef, useEffect, useCallback, memo } from 'react';
import {
  Mic,
  MicOff,
  MapPin,
  Trash2,
  Send,
  Loader2,
  AlertCircle,
  HelpCircle,
  Check,
  ImagePlus,
} from 'lucide-react';
import { UserLocation, UploadedImage, SupportedLanguage } from '../types/emergency';
import { TRANSLATIONS, SPEECH_LANG_MAP } from '../utils/translations';
import {
  isSpeechRecognitionSupported,
  createSpeechRecognizer,
  SpeechRecognitionController,
} from '../utils/speechRecognition';
import { optimizeIncidentImage } from '../utils/imageOptimizer';
import { reverseGeocode } from '../services/weatherService';

interface IncidentFormProps {
  language: SupportedLanguage;
  onSubmit: (description: string, location: UserLocation | null, image: UploadedImage | null) => void;
  isLoading: boolean;
}

// ─── Localised validation messages (no alert()) ───────────────────────────
function getValidationMsg(lang: SupportedLanguage): string {
  if (lang === 'hi') return 'कृपया अपनी आपातकालीन स्थिति का संक्षिप्त विवरण लिखें या बोलें (कम से कम 3 अक्षर)।';
  if (lang === 'mr') return 'कृपया आपल्या आपत्कालीन परिस्थितीचे थोडक्यात वर्णन लिहा किंवा बोला (किमान ३ अक्षरे).';
  return 'Please describe the emergency (at least 3 characters) or tap a quick scenario.';
}

function getLocationDeniedMsg(lang: SupportedLanguage): string {
  if (lang === 'hi') return 'स्थान की अनुमति अस्वीकार कर दी गई। आप अपना लैंडमार्क या सड़क का नाम टाइप कर सकते हैं।';
  if (lang === 'mr') return 'स्थान परवानगी नाकारली. आपण आपला पत्ता किंवा लँडमार्क स्वतः टाइप करू शकता.';
  return 'Location permission denied. You can manually type your landmark or street name.';
}

export const IncidentForm: React.FC<IncidentFormProps> = memo(({ language, onSubmit, isLoading }) => {
  const [description, setDescription] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [speechError, setSpeechError] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Optional Location state
  const [location, setLocation] = useState<UserLocation | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  // Optional Photo state
  const [image, setImage] = useState<UploadedImage | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);
  const [isOptimizingImage, setIsOptimizingImage] = useState(false);
  const [imageCompressionNote, setImageCompressionNote] = useState<string | null>(null);

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

  // Voice Input Toggle — memoised to prevent child re-renders
  const toggleSpeechRecognition = useCallback(() => {
    if (isRecording) {
      speechRecognizerRef.current?.stop();
      setIsRecording(false);
      return;
    }

    if (!isSpeechRecognitionSupported()) {
      setSpeechError('Speech recognition is not supported in this browser. Please type your message.');
      return;
    }

    speechBaseTextRef.current = description.trim();
    setSpeechError(null);

    const speechLang = SPEECH_LANG_MAP[language] || 'en-IN';

    const recognizer = createSpeechRecognizer({
      lang: speechLang,
      onStart: () => setIsRecording(true),
      onResult: (sessionText, isFinal) => {
        const base = speechBaseTextRef.current;
        setDescription(base + (base.length > 0 ? ' ' : '') + sessionText);
        if (isFinal) setIsRecording(false);
      },
      onError: (msg) => { setSpeechError(msg); setIsRecording(false); },
      onEnd: () => setIsRecording(false),
    });

    if (recognizer) {
      speechRecognizerRef.current = recognizer;
      recognizer.start();
    } else {
      setSpeechError('Could not start microphone on this device.');
    }
  }, [isRecording, description, language]);

  // Location with shared cached geocoding (weatherService) — no duplicate Nominatim requests
  const handleRequestLocation = useCallback(() => {
    if (!('geolocation' in navigator)) {
      setLocationError('Geolocation is not supported by your browser.');
      return;
    }
    setIsLocating(true);
    setLocationError(null);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude, accuracy } = pos.coords;
        let addressText = `Lat: ${latitude.toFixed(5)}, Long: ${longitude.toFixed(5)} (±${Math.round(accuracy)}m)`;
        try {
          const city = await reverseGeocode(latitude, longitude);
          if (city) addressText = city;
        } catch (e) {
          console.warn('Geocoding fallback to coordinates:', e);
        }
        setIsLocating(false);
        setLocation({ latitude, longitude, accuracyMeters: Math.round(accuracy), formattedText: addressText, timestamp: pos.timestamp });
      },
      (err) => {
        setIsLocating(false);
        if (err.code === err.PERMISSION_DENIED) setLocationError(getLocationDeniedMsg(language));
        else if (err.code === err.POSITION_UNAVAILABLE) setLocationError('Location information is currently unavailable.');
        else setLocationError('Location request timed out. Please type your location.');
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 30000 }
    );
  }, [language]);

  // Photo Selection with client-side canvas compression (85–95% size reduction, GPS metadata stripped)
  const handlePhotoSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    setImageError(null);
    setImageCompressionNote(null);
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setImageError('Please select a valid image file (JPEG, PNG, WebP).');
      return;
    }
    if (file.size > 12 * 1024 * 1024) {
      setImageError('Photo size exceeds 12MB. Please select a smaller photo.');
      return;
    }

    setIsOptimizingImage(true);
    try {
      const opt = await optimizeIncidentImage(file);
      setImage({ name: opt.name, sizeBytes: opt.optimizedSizeBytes, mimeType: opt.mimeType, dataUrl: opt.dataUrl });
      const savedPct = Math.round((1 - opt.optimizedSizeBytes / opt.originalSizeBytes) * 100);
      if (savedPct > 10) {
        setImageCompressionNote(
          `✓ Optimized: ${(opt.originalSizeBytes / 1024).toFixed(0)} KB → ${(opt.optimizedSizeBytes / 1024).toFixed(0)} KB (${savedPct}% smaller — faster emergency sending)`
        );
      }
    } catch (err) {
      console.warn('Image optimization fallback:', err);
      setImageError('Failed to process image. Try a different photo or describe in text.');
    } finally {
      setIsOptimizingImage(false);
    }
  }, []);

  // Submit with accessible inline validation — no browser alert()
  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = description.trim();
    if (!trimmed || trimmed.length < 3) {
      setValidationError(getValidationMsg(language));
      return;
    }
    setValidationError(null);
    onSubmit(description, location, image);
  }, [description, language, location, image, onSubmit]);

  return (
    <section className="safety-card" aria-label="Emergency Description Form">
      <h2 className="card-title">
        <span>{t.title}</span>
      </h2>
      <p className="card-subtitle">{t.subtitle}</p>

      {/* Quick Scenario Buttons */}
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
              onClick={() => { setDescription(scenario.text); setValidationError(null); }}
            >
              {scenario.label}
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit} noValidate>
        <div className="form-group">
          <label htmlFor="emergency-desc-input" className="form-label">
            <span>{t.inputLabel}</span>
            <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
              {description.length} {t.characters}
            </span>
          </label>
          <textarea
            id="emergency-desc-input"
            className={`emergency-textarea${validationError ? ' input-error' : ''}`}
            placeholder={t.placeholder}
            value={description}
            onChange={(e) => {
              setDescription(e.target.value);
              if (validationError && e.target.value.trim().length >= 3) setValidationError(null);
            }}
            rows={4}
            aria-required="true"
            aria-describedby={validationError ? 'desc-validation-error' : undefined}
            aria-invalid={!!validationError}
          />
          {validationError && (
            <div
              id="desc-validation-error"
              role="alert"
              style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.375rem', fontSize: '0.8125rem', color: '#dc2626', fontWeight: 500 }}
            >
              <AlertCircle size={14} aria-hidden="true" />
              <span>{validationError}</span>
            </div>
          )}
        </div>

        {/* Input Tools: Voice, Photo, Location */}
        <div className="input-tools-bar">
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

          <button
            type="button"
            className={`tool-button ${image ? 'active' : ''}`}
            onClick={() => fileInputRef.current?.click()}
            disabled={isOptimizingImage}
            aria-label={isOptimizingImage ? 'Processing image…' : 'Upload photo of incident'}
          >
            {isOptimizingImage
              ? <Loader2 size={18} className="animate-spin" />
              : <ImagePlus size={18} />
            }
            <span>{isOptimizingImage ? 'Optimizing…' : image ? t.changePhoto : t.addPhoto}</span>
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handlePhotoSelect}
            accept="image/*"
            style={{ display: 'none' }}
            aria-hidden="true"
          />

          <button
            type="button"
            className={`tool-button ${location ? 'active' : ''}`}
            onClick={handleRequestLocation}
            disabled={isLocating}
            aria-label="Add current GPS coordinates"
          >
            {isLocating ? <Loader2 size={18} className="animate-spin" /> : <MapPin size={18} />}
            <span>{location ? t.locationAdded : isLocating ? t.locating : t.addLocation}</span>
          </button>
        </div>

        {/* Voice Error */}
        {speechError && (
          <div role="alert" style={{ padding: '0.5rem 0.75rem', backgroundColor: '#fffbeb', borderRadius: '6px', fontSize: '0.8125rem', color: '#92400e', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <AlertCircle size={16} aria-hidden="true" />
            <span>{speechError}</span>
          </div>
        )}

        {/* Photo Preview */}
        {image && (
          <div className="tool-detail-card">
            <div className="photo-preview-wrap">
              <img src={image.dataUrl} alt="Hazard preview" className="photo-thumbnail" />
              <div>
                <div style={{ fontWeight: 600, color: '#0f172a' }}>{image.name}</div>
                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                  {(image.sizeBytes / 1024).toFixed(0)} KB · Photo attached for visual hazard review
                </div>
                {imageCompressionNote && (
                  <div style={{ fontSize: '0.7rem', color: '#15803d', marginTop: '2px' }}>
                    {imageCompressionNote}
                  </div>
                )}
              </div>
            </div>
            <button
              type="button"
              className="btn-remove-tool"
              onClick={() => { setImage(null); setImageCompressionNote(null); if (fileInputRef.current) fileInputRef.current.value = ''; }}
              aria-label="Remove attached photo"
            >
              <Trash2 size={14} />
              <span>Remove</span>
            </button>
          </div>
        )}

        {/* Image error */}
        {imageError && (
          <div role="alert" style={{ padding: '0.5rem 0.75rem', backgroundColor: '#fee2e2', borderRadius: '6px', fontSize: '0.8125rem', color: '#991b1b', marginBottom: '0.75rem' }}>
            {imageError}
          </div>
        )}

        {/* Location Display */}
        {location && (
          <div className="tool-detail-card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
              <Check size={18} color="#15803d" aria-hidden="true" />
              <div>
                <div style={{ fontWeight: 600, color: '#0f172a' }}>GPS Coordinates Attached</div>
                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{location.formattedText}</div>
              </div>
            </div>
            <button type="button" className="btn-remove-tool" onClick={() => setLocation(null)} aria-label="Remove GPS location">
              <Trash2 size={14} />
              <span>Clear</span>
            </button>
          </div>
        )}

        {/* Location error */}
        {locationError && (
          <div role="alert" style={{ padding: '0.5rem 0.75rem', backgroundColor: '#fffbeb', borderRadius: '6px', fontSize: '0.8125rem', color: '#92400e', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <AlertCircle size={16} aria-hidden="true" />
            <span>{locationError}</span>
          </div>
        )}

        {/* Privacy Note */}
        <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          <HelpCircle size={14} aria-hidden="true" />
          <span>{t.privacyNote}</span>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="btn-submit-guidance"
          disabled={isLoading || isOptimizingImage || !description.trim()}
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
});

IncidentForm.displayName = 'IncidentForm';
