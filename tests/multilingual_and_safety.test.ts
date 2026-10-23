/**
 * Automated Test Suite for Multilingual AI Support & Emergency Safety System
 * Tests English, Hindi, Marathi, Hinglish, Ambiguous inputs, Schema Validation, and Notifications.
 */

import { generateSafeFallbackResponse } from '../src/utils/fallback';
import { validateEmergencyResponse } from '../src/utils/validation';
import { NOTIFICATION_TEMPLATES } from '../src/utils/translations';

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

console.log('\n=== Starting Emergency Helper India Test Suite ===\n');

// 1. English Input Test
console.log('--- Test Group 1: English Emergency Input ---');
{
  const res = generateSafeFallbackResponse('Severe chest pain and sudden shortness of breath', null, 'en');
  const val = validateEmergencyResponse(res);
  assert(val.isValid, 'Response passes strict schema validation');
  assert(res.urgency === 'CRITICAL', 'Urgency is correctly assessed as CRITICAL');
  assert(res.situation_type === 'medical emergency', 'Situation correctly mapped to medical emergency');
  assert(res.response_language === 'en', 'Response language is English');
  assert(res.immediate_actions.some((a) => a.includes('112')), 'Immediate actions mandate calling 112');
}

// 2. Hindi (हिन्दी) Input Test
console.log('\n--- Test Group 2: Hindi (हिन्दी) Emergency Input ---');
{
  const res = generateSafeFallbackResponse('कमरे में भीषण आग लग गई है और चारों तरफ धुआं भर गया है', null, 'hi');
  const val = validateEmergencyResponse(res);
  assert(val.isValid, 'Hindi response passes strict schema validation');
  assert(res.urgency === 'CRITICAL', 'Fire urgency assessed as CRITICAL in Hindi');
  assert(res.situation_type === 'fire', 'Situation correctly identified as fire');
  assert(res.response_language === 'hi', 'Response language is Hindi');
  assert(res.short_summary.includes('आग'), 'Short summary is localized in Hindi');
}

// 3. Marathi (मराठी) Input Test
console.log('\n--- Test Group 3: Marathi (मराठी) Emergency Input ---');
{
  const res = generateSafeFallbackResponse('महामार्गावर भीषण अपघात झाला आहे आणि खूप रक्तस्त्राव होतोय', null, 'mr');
  const val = validateEmergencyResponse(res);
  assert(val.isValid, 'Marathi response passes strict schema validation');
  assert(res.urgency === 'HIGH' || res.urgency === 'CRITICAL', 'Accident assessed as HIGH/CRITICAL in Marathi');
  assert(res.response_language === 'mr', 'Response language is Marathi');
  assert(res.short_summary.includes('अपघात') || res.short_summary.includes('धोका'), 'Summary is localized in Marathi');
}

// 4. Mixed-Language / Hinglish Test
console.log('\n--- Test Group 4: Mixed-Language / Hinglish Input ---');
{
  const res = generateSafeFallbackResponse('Bhai accident ho gaya road pe bohot khoon nikal raha hai jaldi help karo', null, 'hi');
  const val = validateEmergencyResponse(res);
  assert(val.isValid, 'Hinglish response passes validation');
  assert(res.urgency === 'HIGH' || res.urgency === 'CRITICAL', 'Urgency correctly recognized despite mixed phrasing');
  assert(res.immediate_actions.length > 0, 'Contains immediate action steps');
}

// 5. Ambiguous / Unclear Input Test (Crucial Safety Rule)
console.log('\n--- Test Group 5: Ambiguous / Unclear Safety Rule ---');
{
  const res = generateSafeFallbackResponse('Kuch toh gadbad hai please help me hurry', null, 'en');
  assert(res.urgency !== 'LOW', 'SAFETY RULE: Unclear input is NEVER automatically classified as LOW urgency');
  assert(res.urgency === 'HIGH' || res.urgency === 'MEDIUM', 'Precautionary urgency is HIGH or MEDIUM');
}

// 6. Trivial / Greeting Input Test
console.log('\n--- Test Group 6: Trivial / Greeting Input ---');
{
  const res = generateSafeFallbackResponse('namaste', null, 'hi');
  assert(res.urgency === 'LOW', 'Trivial greeting is LOW urgency');
  assert(res.recommended_buttons.includes('none'), 'Buttons default to none for greetings');
}

// 7. Schema Validation Rejection Test
console.log('\n--- Test Group 7: Strict Schema Rejection Test ---');
{
  const malformedObj = {
    situation_type: 'medical',
    urgency: 'VERY_DANGEROUS', // Invalid enum
    short_summary: '', // Empty
    immediate_actions: [], // Empty
  };
  const val = validateEmergencyResponse(malformedObj);
  assert(!val.isValid, 'Strict validator rejects invalid urgency enum and empty fields');
}

// 8. Notification Message Templates Exact Match Test (Section 4)
console.log('\n--- Test Group 8: Notification Templates Match Section 4 ---');
{
  assert(
    NOTIFICATION_TEMPLATES.en ===
      'Potential danger detected. Review the safety guidance and contact emergency services if you are in immediate danger.',
    'English template matches specification exactly'
  );

  assert(
    NOTIFICATION_TEMPLATES.hi ===
      'संभावित खतरे का संकेत मिला है। सुरक्षा संबंधी निर्देश देखें और तत्काल खतरा होने पर आपातकालीन सेवाओं से संपर्क करें।',
    'Hindi template matches specification exactly'
  );

  assert(
    NOTIFICATION_TEMPLATES.mr ===
      'संभाव्य धोक्याचे संकेत आढळले आहेत. सुरक्षिततेसाठी दिलेल्या सूचना पाहा आणि तातडीचा धोका असल्यास आपत्कालीन सेवांशी संपर्क साधा.',
    'Marathi template matches specification exactly'
  );
}

console.log(`\n=== Test Results: ${passCount} Passed, ${failCount} Failed ===\n`);
if (failCount > 0) {
  process.exit(1);
} else {
  console.log('All tests passed successfully!\n');
}
