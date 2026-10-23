/**
 * Emergency Helper India - Type Definitions
 * Strict types matching the emergency analysis schema, multilingual settings, and notification system.
 */

export type SupportedLanguage =
  | 'en' // English (Default)
  | 'hi' // हिन्दी (Hindi)
  | 'mr' // मराठी (Marathi)
  | 'bn' // বাংলা (Bengali)
  | 'te' // తెలుగు (Telugu)
  | 'ta' // தமிழ் (Tamil)
  | 'gu' // ગુજરાતી (Gujarati)
  | 'kn' // ಕನ್ನಡ (Kannada)
  | 'ml' // മലയാളം (Malayalam)
  | 'pa' // ਪੰਜਾਬੀ (Punjabi)
  | 'or' // ଓଡ଼ିଆ (Odia)
  | 'ur' // اردو (Urdu)
  | 'as'; // অসমীয়া (Assamese)

export interface LanguageMeta {
  code: SupportedLanguage;
  name: string;
  nativeName: string;
  speechCode: string;
}

export type UrgencyLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type SituationType =
  | 'medical emergency'
  | 'accident'
  | 'fire'
  | 'flood'
  | 'crime'
  | 'missing person'
  | 'natural disaster'
  | 'mental-health crisis'
  | 'general safety issue'
  | 'unknown';

export type RecommendedButton =
  | 'call_emergency'
  | 'share_location'
  | 'alert_family'
  | 'find_nearby_help'
  | 'none';

/**
 * The strict structured response returned by the emergency analysis engine.
 */
export interface EmergencyAnalysisResponse {
  situation_type: string;
  urgency: UrgencyLevel;
  short_summary: string;
  immediate_actions: string[];
  avoid_actions: string[];
  summary_for_call: string;
  missing_information: string[];
  recommended_buttons: RecommendedButton[];
  confidence: number;
  response_language?: SupportedLanguage | string;
}

/**
 * Optional location metadata provided by the user with explicit consent.
 */
export interface UserLocation {
  latitude: number;
  longitude: number;
  accuracyMeters?: number;
  formattedText?: string;
  timestamp: number;
}

/**
 * Optional image uploaded by user for visual hazard assessment.
 */
export interface UploadedImage {
  name: string;
  sizeBytes: number;
  mimeType: string;
  dataUrl: string; // Base64 data URL for preview and API
}

/**
 * Payload sent from frontend to backend /api/analyze-emergency.
 */
export interface EmergencyAnalysisRequest {
  description: string;
  language?: SupportedLanguage;
  location?: UserLocation | null;
  image?: {
    mimeType: string;
    base64Data: string;
    fileName: string;
  } | null;
}

/**
 * API response envelope including metadata on whether fallback was activated.
 */
export interface ApiResponseWrapper {
  data: EmergencyAnalysisResponse;
  source: 'ai' | 'fallback' | 'server-rules';
  disclaimer: string;
}

/**
 * Push subscription payload stored on backend
 */
export interface PushSubscriptionData {
  endpoint: string;
  expirationTime?: number | null;
  keys: {
    p256dh: string;
    auth: string;
  };
  language?: SupportedLanguage;
}

/**
 * In-app high danger alert event
 */
export interface InAppAlert {
  id: string;
  urgency: 'HIGH' | 'CRITICAL';
  message: string;
  timestamp: string;
  language: SupportedLanguage;
  eventId?: string;
}

/**
 * Notification preferences
 */
export interface NotificationSettings {
  browserNotificationsEnabled: boolean;
  soundAlertsEnabled: boolean;
  permissionStatus: NotificationPermission | 'unsupported';
}

/**
 * Simulated action log item for prototype demonstration.
 */
export interface SimulationRecord {
  id: string;
  type: 'family_alert' | 'location_share';
  timestamp: string;
  message: string;
  recipientLabel: string;
}
