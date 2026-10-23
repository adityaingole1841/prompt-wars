import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { validateEmergencyResponse } from '../src/utils/validation.ts';
import { generateSafeFallbackResponse } from '../src/utils/fallback.ts';
import { generateEmergencyChatResponse } from '../src/utils/chatSafetyEngine.ts';
import {
  EmergencyAnalysisRequest,
  EmergencyAnalysisResponse,
  SupportedLanguage,
  PushSubscriptionData,
} from '../src/types/emergency.ts';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';

// Restrictive CORS settings
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow localhost and local IP development
      if (!origin || /^http:\/\/localhost(:\d+)?$/.test(origin) || /^http:\/\/127\.0\.0\.1(:\d+)?$/.test(origin) || /^http:\/\/192\.168\.\d+\.\d+(:\d+)?$/.test(origin)) {
        callback(null, true);
      } else {
        callback(null, true); // Dev prototype flexibility
      }
    },
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

app.use(express.json({ limit: '12mb' }));

// Simple in-memory sliding window rate limiter (30 requests / min per IP)
const ipRequestCounts = new Map<string, { count: number; resetTime: number }>();
function rateLimiter(req: Request, res: Response, next: NextFunction): void {
  const ip = req.ip || req.socket.remoteAddress || 'unknown';
  const now = Date.now();
  const windowMs = 60 * 1000;

  const entry = ipRequestCounts.get(ip) || { count: 0, resetTime: now + windowMs };
  if (now > entry.resetTime) {
    entry.count = 1;
    entry.resetTime = now + windowMs;
  } else {
    entry.count += 1;
  }
  ipRequestCounts.set(ip, entry);

  if (entry.count > 45) {
    res.status(429).json({ error: 'Too many requests. Please wait a moment before trying again.' });
    return;
  }
  next();
}

app.use(rateLimiter);

// In-memory store for push subscriptions
const pushSubscriptions = new Map<string, PushSubscriptionData>();

/**
 * Health check endpoint
 */
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    hasGeminiKey: Boolean(GEMINI_API_KEY && GEMINI_API_KEY.trim().length > 5),
    timestamp: new Date().toISOString(),
    service: 'Emergency Helper India API Server (Multilingual & Alerts Enabled)',
    languages: ['en', 'hi', 'mr', 'bn', 'te', 'ta', 'gu', 'kn', 'ml', 'pa', 'or', 'ur', 'as'],
  });
});

const ALL_INDIAN_LANGUAGES: SupportedLanguage[] = [
  'en', 'hi', 'mr', 'bn', 'te', 'ta', 'gu', 'kn', 'ml', 'pa', 'or', 'ur', 'as'
];

const LANG_NAMES_MAP: Record<SupportedLanguage, string> = {
  en: 'English',
  hi: 'Hindi (हिन्दी)',
  mr: 'Marathi (मराठी)',
  bn: 'Bengali (বাংলা)',
  te: 'Telugu (తెలుగు)',
  ta: 'Tamil (தமிழ்)',
  gu: 'Gujarati (ગુજરાતી)',
  kn: 'Kannada (ಕನ್ನಡ)',
  ml: 'Malayalam (മലയാളം)',
  pa: 'Punjabi (ਪੰਜਾਬੀ)',
  or: 'Odia (ଓଡ଼ିଆ)',
  ur: 'Urdu (اردو)',
  as: 'Assamese (অসমীয়া)',
};

/**
 * Gemini Prompt definition supporting all major Indian languages.
 */
function getSystemPrompt(targetLang: SupportedLanguage): string {
  const langName = LANG_NAMES_MAP[targetLang] || 'English';

  return `You are "Emergency Helper", an AI assistant that helps people in India during urgent real-world situations.
Your job is to understand the situation and return ONE clear, safe, actionable emergency plan.

Language Instructions:
- The user may write in English or ANY Indian language (Hindi, Marathi, Bengali, Telugu, Tamil, Gujarati, Kannada, Malayalam, Punjabi, Odia, Urdu, Assamese) or mixed romanized dialects (Hinglish, Tanglish, etc.). Understand all of them with high accuracy.
- You MUST return the JSON values (short_summary, immediate_actions, avoid_actions, summary_for_call, missing_information) translated naturally and accurately into: ${langName}.
- Keep emergency details faithful without altering vital meaning.
- Use simple, direct, reassuring phrasing suitable for high-stress situations.

Rules:
1. Identify the most likely type of situation: medical emergency, accident, fire, flood, crime, missing person, natural disaster, mental-health crisis, or general safety issue.
2. Assess urgency as one of: LOW, MEDIUM, HIGH, CRITICAL.
3. Give only short, practical, immediate actions.
4. Clearly state what the person should NOT do if relevant.
5. If the situation may be life-threatening, always tell the user to contact local emergency services immediately (India: 112).
6. Create a short "summary_for_call" in ${langName} that the user can read aloud to an emergency 112 operator.
7. Do not diagnose medical conditions.
8. Do not provide dangerous, unverified, or overly technical instructions.
9. If important information is missing, include it in "missing_information".
10. If the input is unclear or ambiguous, do NOT default to LOW if danger is plausible (use MEDIUM or HIGH). If completely trivial/greeting, return urgency "LOW".
11. Never invent facts, locations, or names. If unsure, say the confidence is low.
12. Return ONLY valid JSON matching this schema:
{
  "situation_type": "string",
  "urgency": "LOW" | "MEDIUM" | "HIGH" | "CRITICAL",
  "short_summary": "string",
  "immediate_actions": ["string"],
  "avoid_actions": ["string"],
  "summary_for_call": "string",
  "missing_information": ["string"],
  "recommended_buttons": ["call_emergency" | "share_location" | "alert_family" | "find_nearby_help" | "none"],
  "confidence": number between 0.0 and 1.0,
  "response_language": "${targetLang}"
}`;
}

/**
 * Call Gemini 2.5 Flash API with timeout and language targeting.
 */
async function callGemini(
  description: string,
  targetLang: SupportedLanguage = 'en',
  locationText?: string,
  image?: { mimeType: string; base64Data: string } | null
): Promise<EmergencyAnalysisResponse> {
  const model = 'gemini-2.5-flash';
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`;

  const userParts: Array<{ text?: string; inlineData?: { mimeType: string; data: string } }> = [];

  let promptText = `User Emergency Report (in English, Hindi, Marathi, or mixed):\n${description || '[No written description provided]'}`;
  promptText += `\nTarget Response Language: ${targetLang}`;
  if (locationText) {
    promptText += `\nReported Location: ${locationText}`;
  }
  userParts.push({ text: promptText });

  if (image && image.base64Data) {
    userParts.push({
      inlineData: {
        mimeType: image.mimeType || 'image/jpeg',
        data: image.base64Data,
      },
    });
  }

  // 15-second timeout abort controller
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000);

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
      body: JSON.stringify({
        contents: [{ role: 'user', parts: userParts }],
        systemInstruction: {
          parts: [{ text: getSystemPrompt(targetLang) }],
        },
        generationConfig: {
          responseMimeType: 'application/json',
          temperature: 0.1,
        },
      }),
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Gemini API error [${response.status}]: ${errorText}`);
    }

    const responseData = (await response.json()) as {
      candidates?: Array<{
        content?: {
          parts?: Array<{ text?: string }>;
        };
      }>;
    };

    const rawJsonText = responseData?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!rawJsonText) {
      throw new Error('No text generated by Gemini model.');
    }

    const parsed = JSON.parse(rawJsonText);
    const validation = validateEmergencyResponse(parsed);
    if (!validation.isValid) {
      throw new Error(`Gemini response failed strict schema validation: ${validation.errors.join('; ')}`);
    }

    validation.data.response_language = targetLang;
    return validation.data;
  } catch (err) {
    clearTimeout(timeoutId);
    throw err;
  }
}

/**
 * Primary Multilingual Emergency Analysis API Endpoint
 */
app.post('/api/analyze-emergency', async (req: Request, res: Response): Promise<void> => {
  const body = req.body as EmergencyAnalysisRequest;

  const description = typeof body?.description === 'string' ? body.description.trim() : '';
  const language: SupportedLanguage = ALL_INDIAN_LANGUAGES.includes(body?.language) ? body.language : 'en';
  const location = body?.location || null;
  const image = body?.image || null;

  let locationText = '';
  if (location) {
    locationText = location.formattedText || `Lat ${location.latitude.toFixed(5)}, Lng ${location.longitude.toFixed(5)}`;
  }

  // 1. Try Gemini AI if API key is present
  if (GEMINI_API_KEY && GEMINI_API_KEY.trim().length > 5) {
    try {
      const aiResponse = await callGemini(
        description,
        language,
        locationText,
        image
          ? {
              mimeType: image.mimeType,
              base64Data: image.base64Data,
            }
          : null
      );

      res.json({
        data: aiResponse,
        source: 'ai',
        disclaimer: 'AI-generated emergency guidance is assistive and NOT verified medical or dispatch advice. In life-threatening emergencies, dial 112 immediately.',
      });
      return;
    } catch (err: unknown) {
      console.warn('Gemini AI call failed, transitioning safely to server fallback engine:', (err as Error).message);
    }
  }

  // 2. Server Rule-Based Safety Engine (Deterministic fallback & zero-key mode with full language support)
  try {
    const fallbackResponse = generateSafeFallbackResponse(description, location, language);
    const validation = validateEmergencyResponse(fallbackResponse);

    if (!validation.isValid) {
      res.status(500).json({
        error: 'Safety fallback validation failure.',
        details: validation.errors,
      });
      return;
    }

    res.json({
      data: validation.data,
      source: GEMINI_API_KEY ? 'fallback' : 'server-rules',
      disclaimer: 'Generated by Emergency Helper India safety engine. Not a replacement for official 112 emergency dispatchers.',
    });
  } catch (serverErr: unknown) {
    res.status(500).json({
      error: 'Unexpected server safety error',
      message: (serverErr as Error).message,
    });
  }
});

/**
 * Notification Push Subscription Endpoint
 */
app.post('/api/notifications/subscribe', (req: Request, res: Response): void => {
  const { endpoint, keys, language } = req.body;
  if (!endpoint || typeof endpoint !== 'string') {
    res.status(400).json({ error: 'Endpoint is required for push subscription.' });
    return;
  }

  pushSubscriptions.set(endpoint, {
    endpoint,
    keys: keys || { p256dh: '', auth: '' },
    language: language || 'en',
  });

  res.json({ success: true, message: 'Subscription stored successfully.' });
});

/**
 * Notification Push Unsubscribe Endpoint
 */
app.post('/api/notifications/unsubscribe', (req: Request, res: Response): void => {
  const { endpoint } = req.body;
  if (endpoint && typeof endpoint === 'string') {
    pushSubscriptions.delete(endpoint);
  }
  res.json({ success: true, message: 'Unsubscribed successfully.' });
});

/**
 * Notification Demo Send Endpoint (Verified prototype event)
 */
app.post('/api/notifications/demo-send', (req: Request, res: Response): void => {
  const { language, title, message } = req.body;
  const lang: SupportedLanguage = ALL_INDIAN_LANGUAGES.includes(language) ? language : 'en';

  const alertPayload = {
    title: title || (lang === 'hi' ? '🚨 आपातकालीन सुरक्षा अलर्ट' : lang === 'mr' ? '🚨 आपत्कालीन सुरक्षा अलर्ट' : '🚨 Emergency Helper Alert'),
    body: message || 'Potential danger detected. Review the safety guidance and contact emergency services if you are in immediate danger.',
    timestamp: new Date().toISOString(),
    language: lang,
    isDemo: true,
  };

  res.json({
    success: true,
    deliveredPayload: alertPayload,
    activeSubscribers: pushSubscriptions.size,
  });
});

/**
 * Notification Status Endpoint
 */
app.get('/api/notifications/status', (_req: Request, res: Response): void => {
  res.json({
    supported: true,
    activeSubscribers: pushSubscriptions.size,
    service: 'Emergency Helper Web Push',
  });
});

/**
 * Emergency & First Aid AI Chat Endpoint
 */
app.post('/api/chat', async (req: Request, res: Response): Promise<void> => {
  const { messages } = req.body as { messages?: Array<{ role: 'user' | 'assistant'; content: string }> };
  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    res.status(400).json({ error: 'Messages array is required.' });
    return;
  }

  const lastUserMsg = [...messages].reverse().find((m) => m.role === 'user')?.content || '';

  const activeApiKey = (process.env.GEMINI_API_KEY || GEMINI_API_KEY || '').trim();

  // 1. Try Gemini AI if configured
  if (activeApiKey && activeApiKey.length > 5) {
    // Try modern Gemini models with fallback
    const modelsToTry = ['gemini-2.0-flash', 'gemini-1.5-flash'];
    const geminiContents = messages.slice(-10).map((m) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));

    const systemPromptText = `You are an expert, compassionate Emergency, Health, Mental Health, Disaster, and Weather Safety AI Assistant for India (Emergency Helper India).
You understand English, Hindi (हिन्दी), Marathi (मराठी), and Hinglish fluently.
Always reply in the same language the user uses (English, Hindi, Marathi, or Hinglish).

You specialize in 4 core domains:
1. HEALTH & FIRST AID:
   - Common symptoms: fever, headache, body pain, nausea, vomiting, loose motion/diarrhea, food poisoning, sore throat, cough, cold, dizziness.
   - Medical emergencies: chest pain/heart attack, stroke (FAST protocol), asthma attacks, severe allergic reactions, diabetic emergencies (hypoglycemia).
   - First Aid: CPR (chest compressions), severe bleeding control, burns & scalds, fractures, choking (Heimlich), electric shock, dog & animal bites (15-min soapy wash + rabies vaccine), snake bites (immobilize, rush for ASV, no tourniquet/cutting).
   - Provide safe home hydration advice (ORS, fluids) and clear red-flag symptoms. Never diagnose or prescribe prescription drugs; advise consulting a registered doctor for serious symptoms.

2. MENTAL HEALTH & EMOTIONAL WELLBEING:
   - Panic attacks, acute anxiety, hyperventilation, overwhelming stress, grief, depression, insomnia, burnout.
   - Immediate calming techniques: 5-4-3-2-1 sensory grounding, 4-4-4-4 Box Breathing.
   - For severe crisis, hopelessness, or suicidal thoughts: Always warmly provide Tele-MANAS (14416 or 1800-891-4416 - 24/7 free Govt of India helpline) and KIRAN (1800-599-0019).

3. DISASTER PREPAREDNESS & RESPONSE:
   - Earthquakes: Drop, Cover, Hold On; avoid glass, stay out of elevators.
   - Floods & Waterlogging: Move to higher ground, switch off main power/gas, never walk/drive through floodwaters, drink boiled water.
   - Cyclones: Secure loose outdoor items, stay indoors away from windows, beware the eye of the storm.
   - Structural Fires: Crawl low under smoke, feel doors for heat, stop-drop-and-roll, use stairs, call 101/112.
   - Landslides, building collapses, and 72-hour Emergency Go-Bag checklist (documents, water, medicine, torch, whistle, cash).
   - National Disaster Management Helpline: 1070 / 1077.

4. WEATHER HAZARDS & SAFETY:
   - Extreme Heatwaves (Loo): Avoid 12-4 PM direct sun, hydration (ORS, chaas, nimbu pani), light cotton clothes, recognize heatstroke.
   - Thunderstorms & Lightning: 30-30 rule, avoid tall trees, open fields, water bodies; lightning crouch if exposed.
   - Heavy Rainfall & Monsoon: Check IMD color alerts (Yellow/Orange/Red), electrical hazard in flooded streets.
   - Hazardous Air Quality (AQI) & Smog: N95/FFP2 masks, avoid outdoor morning exercise, indoor air care.
   - Extreme Cold Waves: Multi-layering, hypothermia warnings, ventilation warning for room heaters.

Guidelines:
- Keep explanations structured with bullet points or numbered steps for rapid readability.
- If immediate life danger is detected, prominently remind the user to dial 112 immediately.`;

    for (const model of modelsToTry) {
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${activeApiKey}`;
        const aiRes = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: geminiContents,
            systemInstruction: {
              parts: [{ text: systemPromptText }],
            },
            generationConfig: {
              temperature: 0.3,
              maxOutputTokens: 1000,
            },
          }),
        });

        if (aiRes.ok) {
          const data = (await aiRes.json()) as any;
          const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (text) {
            const isCritical = /112|cpr|severe|unconscious|bleed|heart|chok|dying|suicide|बेहोश|रक्त|श्वास|आत्महत्या/i.test(lastUserMsg);
            res.json({
              reply: text.trim(),
              urgency: isCritical ? 'HIGH' : 'MEDIUM',
              source: 'ai',
            });
            return;
          }
        } else {
          const errBody = await aiRes.text();
          console.warn(`[Gemini Chat ${model}] Returned status ${aiRes.status}:`, errBody.slice(0, 200));
        }
      } catch (e) {
        console.warn(`[Gemini Chat ${model}] Request error:`, (e as Error).message);
      }
    }
  }

  // 2. Safe comprehensive rule-based engine fallback (covers health, mental health, disaster, weather)
  const fallback = generateEmergencyChatResponse(lastUserMsg);
  res.json({
    reply: fallback.reply,
    urgency: fallback.urgency,
    suggestedAction: fallback.suggestedAction,
    source: 'server-rules',
  });
});

app.listen(PORT, () => {
  console.log(`[Emergency Helper India] Backend API running at http://localhost:${PORT}`);
  console.log(`[Emergency Helper India] Multilingual & Notifications enabled for en, hi, mr`);
  console.log(`[Emergency Helper India] Gemini API Key configured: ${Boolean(GEMINI_API_KEY && GEMINI_API_KEY.length > 5)}`);
});
