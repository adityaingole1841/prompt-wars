/**
 * Automated Test Suite for Server Endpoints & API Handlers
 * Tests /api/health, /api/analyze-emergency, /api/chat,
 * /api/notifications/status, and payload validation.
 */

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

const SERVER_URL = process.env.TEST_SERVER_URL || 'http://localhost:3001';

async function runServerApiTests() {
  console.log('\n=== Testing Server API Endpoints ===\n');

  // Test 1: GET /api/health
  console.log('--- Test Group 1: Health Check Endpoint (/api/health) ---');
  try {
    const res = await fetch(`${SERVER_URL}/api/health`);
    assert(res.ok, 'Health check returns HTTP 200 OK');
    const data = await res.json();
    assert(data.status === 'ok', "Status is 'ok'");
    assert(Array.isArray(data.languages), 'Languages list is an array');
    assert(data.languages.includes('hi'), 'Includes Hindi in supported languages');
    assert(data.languages.includes('mr'), 'Includes Marathi in supported languages');
    assert(data.languages.includes('en'), 'Includes English in supported languages');
    assert(typeof data.timestamp === 'string', 'Timestamp is present');
  } catch (err) {
    assert(false, 'Health check request succeeded', String(err));
  }

  // Test 2: POST /api/chat
  console.log('\n--- Test Group 2: Safety Chat Endpoint (/api/chat) ---');
  try {
    const res = await fetch(`${SERVER_URL}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [{ role: 'user', content: 'Patient collapsed, unconscious and not breathing, how to do CPR?' }],
      }),
    });
    assert(res.ok, 'Chat endpoint returns HTTP 200 OK');
    const data = await res.json();
    assert(data.urgency === 'CRITICAL', 'Urgency is correctly evaluated as CRITICAL');
    assert(data.suggestedAction === 'call_112', 'Suggested action routes to call_112');
    assert(typeof data.reply === 'string' && data.reply.length > 50, 'Reply contains detailed guidance');
  } catch (err) {
    assert(false, 'Chat endpoint test succeeded', String(err));
  }

  // Test 3: POST /api/analyze-emergency
  console.log('\n--- Test Group 3: Emergency Analysis Endpoint (/api/analyze-emergency) ---');
  try {
    const res = await fetch(`${SERVER_URL}/api/analyze-emergency`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        description: 'Large chemical spill on expressway with toxic fumes spreading',
        language: 'en',
        location: {
          latitude: 19.076,
          longitude: 72.8777,
          formattedText: 'Mumbai Expressway',
        },
      }),
    });
    assert(res.ok, 'Emergency analysis returns HTTP 200 OK');
    const data = await res.json();
    assert(data.data !== null && typeof data.data === 'object', 'Response contains data object');
    assert(typeof data.data.urgency === 'string', 'Response contains valid urgency level');
    assert(Array.isArray(data.data.immediate_actions), 'Immediate actions is an array');
    assert(data.data.immediate_actions.length > 0, 'Contains immediate action steps');
    assert(typeof data.data.summary_for_call === 'string', 'Contains summary for emergency call');
  } catch (err) {
    assert(false, 'Emergency analysis endpoint test succeeded', String(err));
  }

  // Test 4: GET /api/notifications/status
  console.log('\n--- Test Group 4: Notification Status Endpoint ---');
  try {
    const res = await fetch(`${SERVER_URL}/api/notifications/status`);
    assert(res.ok, 'Notifications status returns HTTP 200 OK');
    const data = await res.json();
    assert(data.supported === true, 'Notification system is supported');
    assert(typeof data.activeSubscribers === 'number', 'Active subscriber count is a number');
    assert(typeof data.service === 'string', 'Service descriptor present');
  } catch (err) {
    assert(false, 'Notification status endpoint test succeeded', String(err));
  }

  // Test 5: POST /api/notifications/demo-send with valid payload
  console.log('\n--- Test Group 5: Demo Notification Dispatch ---');
  try {
    const res = await fetch(`${SERVER_URL}/api/notifications/demo-send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'Flash Flood Warning',
        message: 'Evacuate low lying areas near river bank.',
        language: 'en',
      }),
    });
    assert(res.ok, 'Demo send returns HTTP 200 OK');
    const data = await res.json();
    assert(data.success === true, 'Response indicates success: true');
    assert(typeof data.activeSubscribers === 'number', 'Active subscriber count returned');
    assert(data.deliveredPayload !== undefined, 'Delivered payload is present');
  } catch (err) {
    assert(false, 'Demo notification dispatch test succeeded', String(err));
  }

  // Test 6: Invalid / Malformed Request Rejection
  console.log('\n--- Test Group 6: Malformed Request Handling ---');
  try {
    const res = await fetch(`${SERVER_URL}/api/analyze-emergency`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ description: '' }), // Missing required valid description
    });
    assert(res.status === 400 || res.ok, 'Handled empty payload without 500 internal server error');
  } catch (err) {
    assert(false, 'Malformed request handled cleanly', String(err));
  }

  console.log(`\n=== Server API Results: ${passCount} Passed, ${failCount} Failed ===\n`);
  if (failCount > 0) {
    process.exit(1);
  }
}

runServerApiTests().catch((err) => {
  console.error('Fatal error running server API tests:', err);
  process.exit(1);
});
