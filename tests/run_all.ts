/**
 * Unified Test Suite Runner for Emergency Helper India
 * Runs all unit, integration, multilingual safety, weather,
 * server API, and image optimizer tests.
 */

import { execSync } from 'child_process';

interface SuiteResult {
  name: string;
  command: string;
  passed: boolean;
  durationMs: number;
  output: string;
}

const suites = [
  { name: '1. Multilingual & Safety Rules', file: 'tests/multilingual_and_safety.test.ts' },
  { name: '2. Chat Safety Engine (CPR, Crisis, Languages)', file: 'tests/chat_safety_engine.test.ts' },
  { name: '3. Weather & Reverse Geocoding Service', file: 'tests/weather_service.test.ts' },
  { name: '4. Server API Endpoints & Health Check', file: 'tests/server_api.test.ts' },
  { name: '5. Client-Side Image Optimizer', file: 'tests/image_optimizer.test.ts' },
];

console.log('====================================================');
console.log('   EMERGENCY HELPER INDIA — FULL AUTOMATED TEST SUITE');
console.log('====================================================\n');

const results: SuiteResult[] = [];
let totalPassed = 0;
let totalFailed = 0;
const overallStart = Date.now();

for (const suite of suites) {
  process.stdout.write(`⏳ Running [${suite.name}]... `);
  const start = Date.now();
  let passed = true;
  let output = '';

  try {
    output = execSync(`npx tsx ${suite.file}`, {
      encoding: 'utf-8',
      stdio: ['pipe', 'pipe', 'pipe'],
    });
    passed = true;
    totalPassed++;
    console.log(`\x1b[32mPASSED\x1b[0m (${Date.now() - start}ms)`);
  } catch (err: any) {
    passed = false;
    totalFailed++;
    output = (err.stdout || '') + '\n' + (err.stderr || '');
    console.log(`\x1b[31mFAILED\x1b[0m (${Date.now() - start}ms)`);
  }

  results.push({
    name: suite.name,
    command: suite.file,
    passed,
    durationMs: Date.now() - start,
    output,
  });
}

const totalDuration = Date.now() - overallStart;

console.log('\n====================================================');
console.log('                     TEST SUMMARY                   ');
console.log('====================================================');

for (const r of results) {
  const icon = r.passed ? '✓' : '✗';
  const color = r.passed ? '\x1b[32m' : '\x1b[31m';
  console.log(`  ${color}${icon}\x1b[0m ${r.name.padEnd(46)} [${r.durationMs}ms]`);
  if (!r.passed) {
    console.log('\n--- Output from failure ---');
    console.log(r.output.trim());
    console.log('---------------------------\n');
  }
}

console.log('----------------------------------------------------');
console.log(`Total Suites: ${suites.length} | Passed: \x1b[32m${totalPassed}\x1b[0m | Failed: \x1b[31m${totalFailed}\x1b[0m | Duration: ${totalDuration}ms`);
console.log('====================================================\n');

if (totalFailed > 0) {
  process.exit(1);
} else {
  console.log('🎉 All automated test suites passed successfully!\n');
}
