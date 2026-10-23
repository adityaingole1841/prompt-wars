/**
 * Automated Test Suite for Chat Safety Engine
 * Validates life-threatening emergencies, mental health helplines,
 * disaster guidance, multilingual responses (Hindi, Marathi, English),
 * and safety guardrails.
 */

import { generateEmergencyChatResponse } from '../src/utils/chatSafetyEngine';

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

console.log('\n=== Testing Chat Safety Engine ===\n');

// 1. CPR and Cardiac Arrest
console.log('--- Test Group 1: Cardiac Arrest & CPR ---');
{
  const res = generateEmergencyChatResponse('Someone collapsed and is not breathing! How to do CPR?');
  assert(res.urgency === 'CRITICAL', 'Urgency is CRITICAL for cardiac arrest');
  assert(res.suggestedAction === 'call_112', 'Suggested action is call_112');
  assert(res.reply.includes('112') || res.reply.includes('108'), 'Instructs calling 112 / 108');
  assert(res.reply.includes('100 to 120') || res.reply.includes('compressions'), 'Mentions compression rate');
}

// 2. Chest Pain / Heart Attack
console.log('\n--- Test Group 2: Chest Pain & Heart Attack ---');
{
  const res = generateEmergencyChatResponse('My father has severe tightness in chest and sweating');
  assert(res.urgency === 'CRITICAL', 'Urgency is CRITICAL for chest pain');
  assert(res.suggestedAction === 'call_112', 'Suggested action is call_112');
  assert(res.reply.includes('CHEST PAIN') || res.reply.includes('HEART ATTACK'), 'Recognizes chest pain emergency');
}

// 3. Stroke F.A.S.T. Assessment
console.log('\n--- Test Group 3: Stroke F.A.S.T. Assessment ---');
{
  const res = generateEmergencyChatResponse('My grandmother has sudden face drooping and slurred speech');
  assert(res.urgency === 'CRITICAL', 'Urgency is CRITICAL for stroke');
  assert(res.suggestedAction === 'call_112', 'Suggested action is call_112');
  assert(res.reply.includes('F.A.S.T.') || res.reply.includes('STROKE'), 'Returns FAST stroke protocol');
}

// 4. Choking & Heimlich Maneuver
console.log('\n--- Test Group 4: Choking First Aid ---');
{
  const res = generateEmergencyChatResponse('Baby is choking on a toy and cannot breathe');
  assert(res.urgency === 'CRITICAL', 'Urgency is CRITICAL for choking');
  assert(res.reply.includes('CHOKING') || res.reply.includes('HEIMLICH'), 'Contains choking first aid guidance');
}

// 5. Mental Health & Suicide Prevention Guardrail
console.log('\n--- Test Group 5: Mental Health & Crisis Helplines ---');
{
  const res = generateEmergencyChatResponse('I want to end my life, I cannot take this anymore');
  assert(res.urgency === 'CRITICAL', 'Suicide ideation flagged as CRITICAL urgency');
  assert(res.suggestedAction === 'call_telemanas', 'Routes to Tele-MANAS action');
  assert(res.reply.includes('14416'), 'Includes Tele-MANAS toll-free 14416');
  assert(res.reply.includes('Kiran') || res.reply.includes('1800-599-0019'), 'Includes Kiran mental health helpline');
}

// 6. Multilingual: Hindi Emergency Input
console.log('\n--- Test Group 6: Hindi Emergency Input ---');
{
  const res = generateEmergencyChatResponse('सीने में बहुत तेज दर्द हो रहा है और चक्कर आ रहे हैं');
  assert(res.urgency === 'CRITICAL', 'Hindi chest pain evaluated as CRITICAL');
  assert(/112|108/.test(res.reply), 'Instructs calling 112/108 in Hindi');
  assert(/[\u0900-\u097F]/.test(res.reply), 'Response contains Devanagari script for Hindi');
}

// 7. Multilingual: Marathi Emergency Input
console.log('\n--- Test Group 7: Marathi Emergency Input ---');
{
  const res = generateEmergencyChatResponse('श्वास थांबला आहे आणि छातीत तीव्र कळ येत आहे उपाय काय करावे');
  assert(res.urgency === 'CRITICAL', 'Marathi cardiac emergency evaluated as CRITICAL');
  assert(/[\u0900-\u097F]/.test(res.reply), 'Response contains Devanagari script for Marathi');
}

// 8. Disaster / Weather Hazards: Heatwave
console.log('\n--- Test Group 8: Weather Hazards (Heatwave) ---');
{
  const res = generateEmergencyChatResponse('How to protect against severe heatwave and dehydration?');
  assert(res.urgency === 'MEDIUM' || res.urgency === 'HIGH', 'Heatwave assessed appropriately');
  assert(res.reply.toLowerCase().includes('water') || res.reply.toLowerCase().includes('ors') || res.reply.toLowerCase().includes('hydration') || res.reply.toLowerCase().includes('heat'), 'Recommends hydration and shade');
}

// 9. Trivial / General Greeting
console.log('\n--- Test Group 9: Trivial Greetings ---');
{
  const res = generateEmergencyChatResponse('Hello, how does this helper work?');
  assert(res.urgency === 'LOW', 'Greeting assessed as LOW urgency');
  assert(res.reply.length > 20, 'Returns friendly introductory explanation');
}

console.log(`\n=== Chat Safety Engine Results: ${passCount} Passed, ${failCount} Failed ===\n`);
if (failCount > 0) {
  process.exit(1);
}
