import { EmergencyAnalysisResponse, UrgencyLevel, RecommendedButton } from '../types/emergency';

const VALID_URGENCIES: UrgencyLevel[] = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
const VALID_BUTTONS: RecommendedButton[] = [
  'call_emergency',
  'share_location',
  'alert_family',
  'find_nearby_help',
  'none',
];

export interface ValidationSuccess {
  isValid: true;
  data: EmergencyAnalysisResponse;
}

export interface ValidationFailure {
  isValid: false;
  errors: string[];
}

export type ValidationResult = ValidationSuccess | ValidationFailure;

/**
 * Strict runtime validator ensuring any AI or server output conforms exactly
 * to the EmergencyAnalysisResponse schema before the frontend can render it.
 */
export function validateEmergencyResponse(input: unknown): ValidationResult {
  const errors: string[] = [];

  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    return {
      isValid: false,
      errors: ['Response payload must be a non-null object.'],
    };
  }

  const record = input as Record<string, unknown>;

  // 1. situation_type
  if (typeof record.situation_type !== 'string' || record.situation_type.trim() === '') {
    errors.push('Field "situation_type" must be a non-empty string.');
  }

  // 2. urgency
  if (
    typeof record.urgency !== 'string' ||
    !VALID_URGENCIES.includes(record.urgency as UrgencyLevel)
  ) {
    errors.push(
      `Field "urgency" must be one of: ${VALID_URGENCIES.join(', ')}. Received: "${String(record.urgency)}"`
    );
  }

  // 3. short_summary
  if (typeof record.short_summary !== 'string' || record.short_summary.trim() === '') {
    errors.push('Field "short_summary" must be a non-empty string.');
  }

  // 4. immediate_actions
  if (!Array.isArray(record.immediate_actions) || record.immediate_actions.length === 0) {
    errors.push('Field "immediate_actions" must be an array with at least one action item.');
  } else {
    record.immediate_actions.forEach((item, idx) => {
      if (typeof item !== 'string' || item.trim() === '') {
        errors.push(`immediate_actions[${idx}] must be a non-empty string.`);
      }
    });
  }

  // 5. avoid_actions
  if (!Array.isArray(record.avoid_actions)) {
    errors.push('Field "avoid_actions" must be an array of strings.');
  } else {
    record.avoid_actions.forEach((item, idx) => {
      if (typeof item !== 'string') {
        errors.push(`avoid_actions[${idx}] must be a string.`);
      }
    });
  }

  // 6. summary_for_call
  if (typeof record.summary_for_call !== 'string' || record.summary_for_call.trim() === '') {
    errors.push('Field "summary_for_call" must be a non-empty string.');
  }

  // 7. missing_information
  if (!Array.isArray(record.missing_information)) {
    errors.push('Field "missing_information" must be an array of strings.');
  } else {
    record.missing_information.forEach((item, idx) => {
      if (typeof item !== 'string') {
        errors.push(`missing_information[${idx}] must be a string.`);
      }
    });
  }

  // 8. recommended_buttons
  if (!Array.isArray(record.recommended_buttons) || record.recommended_buttons.length === 0) {
    errors.push('Field "recommended_buttons" must be a non-empty array of valid action buttons.');
  } else {
    record.recommended_buttons.forEach((btn, idx) => {
      if (!VALID_BUTTONS.includes(btn as RecommendedButton)) {
        errors.push(
          `recommended_buttons[${idx}] must be one of: ${VALID_BUTTONS.join(', ')}. Received: "${String(btn)}"`
        );
      }
    });
  }

  // 9. confidence
  if (
    typeof record.confidence !== 'number' ||
    Number.isNaN(record.confidence) ||
    record.confidence < 0 ||
    record.confidence > 1
  ) {
    errors.push(
      `Field "confidence" must be a number between 0.0 and 1.0. Received: ${String(record.confidence)}`
    );
  }

  if (errors.length > 0) {
    return {
      isValid: false,
      errors,
    };
  }

  return {
    isValid: true,
    data: {
      situation_type: (record.situation_type as string).trim(),
      urgency: record.urgency as UrgencyLevel,
      short_summary: (record.short_summary as string).trim(),
      immediate_actions: (record.immediate_actions as string[]).map((s) => s.trim()),
      avoid_actions: (record.avoid_actions as string[]).map((s) => s.trim()),
      summary_for_call: (record.summary_for_call as string).trim(),
      missing_information: (record.missing_information as string[]).map((s) => s.trim()),
      recommended_buttons: record.recommended_buttons as RecommendedButton[],
      confidence: Number(record.confidence),
      response_language: typeof record.response_language === 'string' ? record.response_language.trim() : undefined,
    },
  };
}
