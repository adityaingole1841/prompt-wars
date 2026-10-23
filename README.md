# 🚨 Emergency Helper India

[![Tests](https://img.shields.io/badge/automated%20tests-98%2F98%20passing-brightgreen.svg)](https://github.com/adityaingole1841/prompt-wars)
[![Developer](https://img.shields.io/badge/Author-adityaingole1841-blue.svg)](https://github.com/adityaingole1841)
[![Repository](https://img.shields.io/badge/GitHub-prompt--wars-181717.svg?logo=github)](https://github.com/adityaingole1841/prompt-wars)
[![Tech Stack](https://img.shields.io/badge/Built%20With-React%2018%20%7C%20TypeScript%20%7C%20Express-61dafb.svg)](https://github.com/adityaingole1841/prompt-wars)

An accessible, mobile-responsive emergency safety guidance web application built with **React**, **TypeScript**, and **Vite**, supported by a dedicated **Express backend API server**.

> ⚠️ **Important Safety Disclaimer**: This application is an educational prototype and citizen safety guidance tool. It provides structured guidance and helps prepare what to say during an emergency call. **It is NOT an emergency dispatcher and does NOT replace dialing 112.** In any life-threatening situation, always contact official emergency responders directly by calling **112**.

---

## 🌟 Key Features

1. **One-Touch Emergency 112 Calling**:
   - Prominent `tel:112` dialer button at the top of the screen.
   - Available immediately without login, onboarding, forms, or permissions.
   - Explains that tapping opens your phone dialer, without falsely claiming responders were contacted.
   - Includes quick-access directory to all Indian national emergency numbers (**112**, **100** Police, **108** Ambulance, **101** Fire, **1091** Women Helpline, **1098** Childline, **1070** Disaster Management, **14416** Tele-MANAS).

2. **Emergency Description & Quick Scenarios**:
   - Free-form text input with live character counter.
   - 5 Quick Scenario buttons for rapid testing (*Road Accident, Fire/Smoke, Medical/Chest Pain, Personal Safety Threat, Flood/Stranded*).

3. **Voice Input with Editable Speech Transcription**:
   - Uses browser Web Speech API (`webkitSpeechRecognition`) for hands-free speech-to-text.
   - Transcription is inserted directly into the editable text box so the user can easily review or correct it.
   - Graceful fallback for browsers or devices without speech recognition.

4. **Optional Photo Upload**:
   - Allows attaching an incident photo for visual hazard assessment.
   - Client-side image preview with a single-click remove button.
   - File size check (< 4MB) to prevent device freezing in critical situations.
   - Explicit privacy notice: uploaded photos are converted to temporary base64 data for analysis and are never permanently stored.

5. **Optional Geolocation**:
   - Explicit permission button: browser GPS is **never** requested without user interaction.
   - Displays latitude, longitude, and accuracy margin (± meters).
   - Graceful error messaging if location access is denied or unavailable.
   - Privacy transparency: coordinates are only used to populate your 112 operator script.

6. **Mental Health Support, Tele-MANAS & Nearby Psychologists**:
   - **Tele-MANAS Primary Helpline**: Quick dial buttons for national short-code **`14416`** and toll-free **`1800-891-4416`** (free, 24/7, confidential, in 20+ Indian languages).
   - **Find Psychologists Near You**: Dynamic button opening Google Maps centered on the user's coordinates or city to find verified registered clinical psychologists, psychiatric hospital OPDs, and counseling clinics.
   - **City Filter & Search**: Browse verified mental health centers across Delhi NCR, Bengaluru, Mumbai, Chennai, Hyderabad, Kolkata, Pune, etc., with contact details, consultation hours, and fee indicators (*Free/Subsidized* vs *Standard*).
   - **24/7 Crisis Helplines Directory**: Verified numbers for KIRAN (`1800-599-0019`), Vandrevala Foundation (`9999 666 555`), AASRA (`9820466726`), and TISS iCall (`9152987821`).
   - **Interactive 4-4-4-4 Box Breathing Grounding Tool**: Visual breathing exercise to help individuals regulate panic attacks, severe anxiety, and sensory overload in real time.

7. **Interactive Emergency & First Aid AI Chatbot**:
   - Multi-turn conversational assistant for immediate first aid, hands-only CPR, burn relief, snakebite protocols, and disaster preparedness.
   - Built with safety guardrails that detect life-threatening queries and display immediate one-tap 112 dialing buttons.
   - Pre-configured suggestion chips (*"How do I do hands-only CPR?"*, *"First aid for severe bleeding"*, etc.).
   - Text-to-Speech audio readout for each message with single-click copy support.

8. **Acoustic & Transcription Anti-Echo Engine**:
   - **Eliminates Text Repetition / Echo**: Anchors the transcription baseline so interim Web Speech events never duplicate or loop words.
   - **Eliminates Speaker Feedback / Acoustic Echo**: Automatically cancels and silences browser speech synthesis before the microphone activates, preventing the speaker audio from looping back into the microphone.

9. **Structured Safety Guidance & Strict Schema Validation**:
   - Strict runtime validator verifies that all server and AI responses match the required schema:
     - `situation_type`
     - `urgency` (`LOW`, `MEDIUM`, `HIGH`, `CRITICAL`)
     - `short_summary`
     - `immediate_actions` (ordered actionable checklist)
     - `avoid_actions` (what NOT to do)
     - `summary_for_call` (script to read aloud to 112 operator)
     - `missing_information`
     - `recommended_buttons`
     - `confidence`
   - **Color + Text Labels for Urgency**: Always communicates urgency through both text labels and distinct colors for accessibility.

10. **112 Operator Call Script with Audio Read-Aloud**:

   - Pre-formats an exact verbal script tailored for the emergency operator.
   - 1-click **Copy Summary** button to paste into SMS or messaging apps.
   - **Read Aloud** button using browser Speech Synthesis (`window.speechSynthesis`).

8. **Clearly Labeled Prototype Simulations**:
   - Interactive **Simulate Family Alert (Demo)** and **Simulate Location Sharing (Demo)** buttons.
   - Explicitly marked as prototype simulations: no real SMS or private data is ever transmitted.

9. **Zero-Key Offline / Fallback Safety Engine**:
   - If no Gemini API key is configured or if network connection fails, the app uses a built-in deterministic safety engine.
   - **Precautionary principle**: Ambiguous or unclear inputs are **never** defaulted to LOW urgency.

---

## 📁 Project Structure & File Guide

```text
├── .env.example                     # Sample configuration template (safe to commit)
├── .env                             # Local environment variables (contains PORT and GEMINI_API_KEY)
├── index.html                       # Accessible HTML5 template with Google Fonts (Outfit & Plus Jakarta Sans)
├── package.json                     # Project dependencies and npm scripts
├── tsconfig.json                    # Strict TypeScript configuration for React
├── tsconfig.node.json               # TypeScript configuration for Vite
├── vite.config.ts                   # Vite bundler config with backend proxy (/api -> localhost:3001)
├── server/
│   └── server.ts                    # Express backend API server with Gemini AI and rule-based safety engine
└── src/
    ├── main.tsx                     # React application entry point
    ├── App.tsx                      # Main application orchestrator and layout
    ├── index.css                    # Accessible design system (high-contrast, 48px touch targets, badges)
    ├── types/
    │   └── emergency.ts             # Strict TypeScript definitions for emergency payloads and responses
    ├── utils/
    │   ├── validation.ts            # Strict runtime JSON schema validator
    │   ├── fallback.ts              # Deterministic rule-based emergency safety engine
    │   └── speechRecognition.ts     # Cross-browser Web Speech API helper
    ├── services/
    │   └── api.ts                   # Frontend API client with offline resiliency
    └── components/
        ├── Header.tsx               # App title, Indian flag badge, and non-dispatcher safety warning
        ├── Call112Banner.tsx        # High-visibility tel:112 calling button and dialer disclaimer
        ├── EmergencyHelplinesModal.tsx # Directory of all Indian emergency helplines
        ├── IncidentForm.tsx         # Incident description form (voice input, photo picker, GPS detector)
        ├── GuidanceView.tsx         # Actionable emergency results screen (urgency badge, call script, actions)
        ├── DemoSimulationModal.tsx  # Interactive prototype simulation preview modal
        └── Footer.tsx               # Legal, medical, and privacy disclaimers
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: Version 18.0 or later (Tested on Node.js v24)
- **npm**: Version 9.0 or later

### 1. Installation
Clone or navigate to the project directory:
```bash
cd /Users/aditya/aditya.html
npm install
```

### 2. Environment Configuration
The project includes a `.env.example` file. Copy it to `.env`:
```bash
cp .env.example .env
```
Inside `.env`:
```env
PORT=3001

# Optional: Google Gemini API Key
# If left blank, the app will run seamlessly using its built-in,
# safety-first deterministic emergency engine!
GEMINI_API_KEY=
```
> **Note**: To use Google Gemini 2.5 Flash for AI analysis, create a free API key at [Google AI Studio](https://aistudio.google.com/) and paste it into `GEMINI_API_KEY=`. If you leave it blank, the app works out of the box with the built-in safety engine.

### 3. Running the Application
Start both the backend server and frontend development server simultaneously:
```bash
npm run dev
```

You will see output similar to:
```text
[SERVER] [Emergency Helper India] Backend API running at http://localhost:3001
[CLIENT] VITE v6.1.0  ready in 200 ms
[CLIENT] ➜  Local:   http://localhost:5173/
```

Open your browser and navigate to:
**`http://localhost:5173`**

---

## 🧪 Testing the Features Locally

### Test 1: Emergency 112 Button
1. At the top of the page, click **Call Emergency Services — 112**.
2. Notice that on mobile devices, this opens your telephone dialer with `112`.
3. Click **All India Helplines (100, 108...)** to view the helpline directory.

### Test 2: Quick Scenarios & Safety Analysis
1. In the **Quick Scenarios** row, click **Road Accident** or **Fire / Smoke**.
2. Notice how the description text box is immediately populated.
3. Click **Get Safety Guidance**.
4. The system validates the response and displays:
   - **Assessed Urgency**: `CRITICAL` or `HIGH` with color and icon indicators.
   - **112 Operator Script**: Pre-formatted call summary.
   - Click **Copy Summary** to test clipboard copying.
   - Click **Read Aloud** to listen to speech synthesis.
   - **Immediate Actions**: Numbered emergency checklist.
   - **What NOT to Do**: Prohibited hazardous actions.

### Test 3: Voice Input
1. Click **Voice Input**.
2. If your browser supports the Web Speech API and microphone access is granted, the button will glow red and display **Listening...**.
3. Speak clearly into your microphone: *"Someone has fallen from a motorcycle and is unconscious."*
4. Notice how the transcription appears in the text box for you to edit.

### Test 4: Photo Upload & Removal
1. Click **Add Photo** and select any small image (JPEG, PNG).
2. Observe the preview thumbnail, filename, and file size indicator.
3. Click **Remove** to delete the photo.

### Test 5: Geolocation
1. Click **Add Location**.
2. Approve the browser prompt for location.
3. Observe your latitude, longitude, and accuracy margin appear.
4. When you generate guidance, notice how your coordinates are automatically integrated into the 112 operator call script.

### Test 6: Demo Simulations
1. In the results view, scroll to **Prototype Simulations**.
2. Click **Simulate Family Alert (Demo)**.
3. Observe the alert preview modal clearly stating that it is a prototype demonstration and no real SMS was transmitted.

---

## 🛡️ Built-in Safety Principles

1. **Precautionary Urgency**: Unclear or ambiguous inputs (e.g. *"Help me please hurry"*) are **never** classified as `LOW` urgency.
2. **Never Invent Facts**: The system never invents fake landmarks, injuries, or diagnoses.
3. **Strict Validation**: All outputs from AI or server are verified with runtime schema checks before rendering.
4. **Offline Resilience**: If the internet or AI service is unavailable, the application gracefully falls back to local safety guidance so users are never left stranded.

---

---

## 🧪 Automated Testing Suite

The repository includes 5 comprehensive automated test suites covering unit, integration, multilingual parsing, and safety validation:

```bash
# Run all automated test suites sequentially
npm test

# Run individual test suites
npm run test:safety   # Multilingual & Safety Rules (25 tests)
npm run test:chat     # Chat Safety Engine (25 tests)
npm run test:weather  # Weather & Reverse Geocoding Service (15 tests)
npm run test:api      # Server API Endpoints & Health Check (26 tests)
npm run test:image    # Client-Side Image Optimizer (7 tests)
```

| Suite | File | Tests | Coverage |
|-------|------|-------|----------|
| **Multilingual & Safety Rules** | `tests/multilingual_and_safety.test.ts` | 25 | Hindi, Marathi, Hinglish, strict RFC schema, Section 4 alert templates |
| **Chat Safety Engine** | `tests/chat_safety_engine.test.ts` | 25 | Cardiac arrest CPR, stroke F.A.S.T., choking, Tele-MANAS 14416 routing |
| **Weather & Geocoding** | `tests/weather_service.test.ts` | 15 | In-flight deduplication, 10-minute caching, 3.5s timeout resilience |
| **Server API Endpoints** | `tests/server_api.test.ts` | 26 | `/api/health`, `/api/chat`, `/api/analyze-emergency`, demo push notifications |
| **Image Optimizer** | `tests/image_optimizer.test.ts` | 7 | Non-image rejection, 1200px bounding, EXIF stripping payload math |

---

## 👤 Author & Profile

- **Developer**: **Aditya Ingole**
- **GitHub Profile**: [@adityaingole1841](https://github.com/adityaingole1841)
- **Project Repository**: [adityaingole1841/prompt-wars](https://github.com/adityaingole1841/prompt-wars)

---

## 📜 License

MIT License — Developed as an educational and citizen safety guidance technology prototype for India.
