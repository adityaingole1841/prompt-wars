import {
  EmergencyAnalysisRequest,
  EmergencyAnalysisResponse,
  ApiResponseWrapper,
} from '../types/emergency';
import { validateEmergencyResponse } from '../utils/validation';
import { generateSafeFallbackResponse } from '../utils/fallback';

/**
 * Sends emergency incident data to the backend API.
 * Guarantees that even if network is completely severed or backend fails,
 * a strictly validated safety response is ALWAYS produced locally.
 */
export async function analyzeEmergency(
  payload: EmergencyAnalysisRequest
): Promise<ApiResponseWrapper> {
  try {
    const response = await fetch('/api/analyze-emergency', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`Server returned HTTP ${response.status}`);
    }

    const json = (await response.json()) as {
      data: unknown;
      source?: 'ai' | 'fallback' | 'server-rules';
      disclaimer?: string;
    };

    // Strict client-side validation
    const validation = validateEmergencyResponse(json.data);
    if (!validation.isValid) {
      console.warn(
        'Server data failed client-side validation. Switching to safe local fallback.',
        validation.errors
      );
      throw new Error(`Schema validation failed: ${validation.errors.join(', ')}`);
    }

    return {
      data: validation.data,
      source: json.source || 'server-rules',
      disclaimer:
        json.disclaimer ||
        'Emergency Helper guidance is assistive only. Dial 112 for official emergency dispatch.',
    };
  } catch (error: unknown) {
    console.warn(
      'Emergency API call failed or offline. Generating safe client-side emergency plan:',
      error
    );

    // Generate guaranteed offline fallback in requested language
    const fallbackData = generateSafeFallbackResponse(payload.description, payload.location, payload.language || 'en');
    const localValidation = validateEmergencyResponse(fallbackData);

    const safeData: EmergencyAnalysisResponse = localValidation.isValid
      ? localValidation.data
      : {
          situation_type: 'general safety issue',
          urgency: 'HIGH',
          short_summary: 'Offline safety guidance mode active. Emergency 112 calling remains available.',
          immediate_actions: [
            'Dial 112 immediately if you or anyone around you is in danger.',
            'Stay calm and move to a safe, visible location.',
            'Keep your phone battery conserved.',
          ],
          avoid_actions: ['Do not stay in danger while waiting for apps or messages.'],
          summary_for_call: 'I need emergency assistance at my location.',
          missing_information: ['Exact address and nature of incident'],
          recommended_buttons: ['call_emergency'],
          confidence: 0.5,
        };

    return {
      data: safeData,
      source: 'fallback',
      disclaimer:
        'Running in Offline / Emergency Fallback Mode. Information is assistive only—call 112 immediately for emergency services.',
    };
  }
}

/**
 * Checks backend connectivity and Gemini status
 */
export async function checkBackendHealth(): Promise<{
  isOnline: boolean;
  hasGeminiKey: boolean;
}> {
  try {
    const res = await fetch('/api/health');
    if (res.ok) {
      const data = (await res.json()) as { hasGeminiKey?: boolean };
      return { isOnline: true, hasGeminiKey: Boolean(data.hasGeminiKey) };
    }
  } catch {
    // Backend offline
  }
  return { isOnline: false, hasGeminiKey: false };
}
