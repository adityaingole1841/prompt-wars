/**
 * Comprehensive Safety-First Emergency, Health, Mental Health, Disaster & Weather AI Engine
 *
 * Provides intelligent, structured, multilingual guidance (English, Hindi, Marathi)
 * for open-ended queries across:
 * 1. Health & Medical First Aid
 * 2. Mental Health & Crisis Support (Tele-MANAS 14416)
 * 3. Disaster Preparedness & Survival (NDMA / SDRF protocols)
 * 4. Weather Hazards & Safety (Heatwave, Cold wave, Rain, Lightning, AQI)
 */

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  urgency?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  suggestedAction?: 'call_112' | 'call_telemanas' | 'first_aid';
}

export function generateEmergencyChatResponse(userMessage: string): {
  reply: string;
  urgency: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  suggestedAction?: 'call_112' | 'call_telemanas' | 'first_aid';
} {
  const q = userMessage.toLowerCase().trim();

  // Detect language hint
  const isHindi = /[\u0900-\u097F]/.test(userMessage) && !/आहे|नाही|करावे|होते|माहिती|लक्ष्ण|थंडी/.test(userMessage);
  const isMarathi = /[\u0900-\u097F]/.test(userMessage) && /आहे|नाही|करावे|होते|माहिती|लक्ष्ण|थंडी|उपाय|काळजी/.test(userMessage);

  /* ─────────────────────────────────────────────────────────────
     1. CRITICAL LIFE-THREATENING EMERGENCIES (CPR, HEART, STROKE, CHOKING)
  ───────────────────────────────────────────────────────────── */

  // 1.1 CPR & Cardiac Arrest
  if (/cpr|not breathing|heart stopped|cardiac arrest|chest compression|हृदय गति रुकना|श्वास थांबला/i.test(q)) {
    if (isHindi) {
      return {
        urgency: 'CRITICAL',
        suggestedAction: 'call_112',
        reply: `🚨 **तत्काल सीपीआर (CPR) निर्देश — तुरंत कार्रवाई करें:**\n\n1. **तुरंत 112 (या 108 एम्बुलेंस) पर कॉल करें** या किसी को कॉल करने को कहें। फ़ोन स्पीकर पर रखें।\n2. **प्रतिक्रिया जांचें:** व्यक्ति के कंधों को थपथपाएं और पूछें *"क्या आप ठीक हैं?"* यदि कोई जवाब नहीं है और सांस नहीं चल रही:\n3. **स्थिति:** व्यक्ति को किसी सख्त, समतल फर्श पर पीठ के बल लिटाएं।\n4. **हाथ की स्थिति:** अपनी एक हथेली छाती के ठीक केंद्र (ब्रेस्टबोन) पर रखें, दूसरी हथेली उसके ऊपर रखकर उंगलियां फंसाएं।\n5. **तेज और गहरा दबाएं:**\n   - छाती को कम से कम **2 इंच (5 सेमी)** नीचे दबाएं।\n   - गति: **100 से 120 बार प्रति मिनट**।\n   - हर दबाव के बाद छाती को पूरी तरह वापस ऊपर आने दें।\n6. **रुकें नहीं** जब तक कि एम्बुलेंस न आ जाए या व्यक्ति खुद होश में न आ जाए।`,
      };
    }
    return {
      urgency: 'CRITICAL',
      suggestedAction: 'call_112',
      reply: `🚨 **IMMEDIATE CPR INSTRUCTIONS — ACT FAST:**\n\n1. **Call 112 (or 108 Ambulance) immediately** or shout for someone nearby to call. Put phone on speaker.\n2. **Check for response:** Tap collarbones firmly and shout *"Are you okay?"* If no response and not breathing normally:\n3. **Position:** Place person flat on their back on a firm, flat surface. Kneel beside their chest.\n4. **Hand Placement:** Place the heel of one hand in the **exact center of the chest** (breastbone). Place your other hand on top and interlock fingers.\n5. **Push Hard & Fast:**\n   - Push down at least **2 inches (5 cm)** deep.\n   - Rate: **100 to 120 compressions per minute** (to the beat of *"Stayin' Alive"*).\n   - Allow chest to recoil completely between each compression.\n6. **Do NOT stop** until medical help arrives or the person starts breathing normally.`,
    };
  }

  // 1.2 Chest Pain / Heart Attack Warning
  if (/chest pain|heart attack|angina|tightness in chest|सीने में दर्द|छातीत दुखणे|हार्ट अटैक/i.test(q)) {
    return {
      urgency: 'CRITICAL',
      suggestedAction: 'call_112',
      reply: `🚨 **CRITICAL: CHEST PAIN / POSSIBLE HEART ATTACK:**\n\n1. **Call 112 or 108 immediately.** Every minute matters.\n2. **Rest Position:** Have the person sit down on the floor, leaning back against a wall with knees bent (W-position). Loosen tight collars, ties, or belts.\n3. **Keep Calm:** Reassure them and keep them quiet; do NOT let them walk or exert effort.\n4. **Aspirin (if eligible):** If conscious, not allergic, and doctor approved, chew one 300mg Soluble Aspirin slowly.\n5. **If unconscious & not breathing:** Start chest compressions (CPR) immediately at 100-120/min.\n6. 🚫 *Do not drive yourself to hospital — wait for the ambulance equipped with oxygen and ECG.*`,
    };
  }

  // 1.3 Stroke Warning (F.A.S.T.)
  if (/stroke|paralysis|face drooping|slurred speech|लकवा|पक्षाघात|चेहरा टेढ़ा/i.test(q)) {
    return {
      urgency: 'CRITICAL',
      suggestedAction: 'call_112',
      reply: `🚨 **STROKE EMERGENCY — ACT F.A.S.T.:**\n\n• **F (Face):** Ask them to smile. Does one side of the face droop?\n• **A (Arms):** Ask them to raise both arms. Does one arm drift downward?\n• **S (Speech):** Ask them to repeat a simple phrase. Is speech slurred or strange?\n• **T (Time):** If ANY of these signs are present, **call 112 / 108 IMMEDIATELY**.\n\n⚠️ *Do NOT give food, water, or aspirin (stroke might be hemorrhagic bleeding in brain). Note the exact time symptoms started.*`,
    };
  }

  // 1.4 Choking
  if (/chok|can't breathe|airway blocked|गले में अटक|श्वास कोंडला/i.test(q)) {
    return {
      urgency: 'CRITICAL',
      suggestedAction: 'call_112',
      reply: `⚠️ **CHOKING FIRST AID (HEIMLICH MANEUVER):**\n\n1. **Can they cough or speak?** If yes, encourage them to cough hard. Do not slap their back yet.\n2. **If they CANNOT breathe, speak, or make sound:**\n   - **5 Back Blows:** Lean them forward, deliver 5 firm blows between shoulder blades with the heel of your hand.\n   - **5 Abdominal Thrusts (Heimlich):** Stand behind them, make a fist above their navel, grasp with your other hand, pull sharply **inward and upward**.\n   - Alternate 5 back blows and 5 abdominal thrusts.\n3. **If person falls unconscious:** Lower them to floor, call **112**, and begin CPR chest compressions.`,
    };
  }

  // 1.5 Severe Bleeding & Hemorrhage
  if (/bleed|blood|hemorrhage|deep cut|खून बहना|रक्तस्राव|कापले/i.test(q)) {
    return {
      urgency: 'HIGH',
      suggestedAction: 'first_aid',
      reply: `🩸 **FIRST AID FOR SEVERE BLEEDING:**\n\n1. **Direct Pressure:** Press a clean cloth or sterile gauze firmly onto the wound.\n2. **Do Not Remove Cloth:** If blood soaks through, add another cloth on top without lifting the first.\n3. **Elevate:** If on arm/leg and no fracture suspected, raise above heart level.\n4. **If Impaled Object:** **DO NOT remove it!** Pack cloth around it to stabilize and bandage in place.\n5. **Prevent Shock:** Lay victim flat, elevate feet 12 inches if no head/spinal injury, keep warm.\n6. If bleeding does not slow down within 5 minutes, call **112** immediately.`,
    };
  }

  // 1.6 Snake Bite
  if (/snake|snake bite|सर्पदंश|सांप ने काटा|साप चावला/i.test(q)) {
    return {
      urgency: 'CRITICAL',
      suggestedAction: 'call_112',
      reply: `🐍 **CRITICAL SNAKE BITE FIRST AID (INDIA PROTOCOL):**\n\n1. **Call 112 immediately** and transport victim to nearest Government / District Hospital with Anti-Snake Venom (ASV).\n2. **Keep the victim completely STILL:** Any physical movement accelerates venom circulation.\n3. **Immobilize the limb:** Keep it at or slightly below heart level using a rigid splint or cloth sling.\n4. **Remove rings, jewelry, and shoes** from the bitten limb before swelling occurs.\n5. 🚫 **NEVER DO THESE DANGEROUS PRACTICES:**\n   - DO NOT cut, slash, or burn the wound.\n   - DO NOT attempt to suck venom by mouth or device.\n   - DO NOT tie tight tourniquets (causes limb loss/gangrene).\n   - DO NOT waste time visiting traditional faith healers; only ASV cures venomous bites.`,
    };
  }

  // 1.7 Electric Shock
  if (/electric|shock|electrocution|बिजली का झटका|विजेचा धक्का/i.test(q)) {
    return {
      urgency: 'CRITICAL',
      suggestedAction: 'call_112',
      reply: `⚡ **ELECTRIC SHOCK SAFETY PROTOCOL:**\n\n1. ⚠️ **DO NOT TOUCH THE VICTIM** with bare hands while they are still touching the electrical current.\n2. **Cut Power:** Turn off main breaker or unplug appliance immediately.\n3. **If power cannot be cut:** Stand on dry rubber mat, wood, or folded newspaper, and use a dry wooden stick or broom handle to push the wire/person away.\n4. **Check Breathing:** Once safe, call **112 / 108**. If not breathing, start **CPR** immediately.\n5. Cool electrical burns under running water; keep the person warm and lying down.`,
    };
  }

  // 1.8 Dog Bite / Animal Bite / Rabies
  if (/dog bite|cat bite|animal bite|rabies|कुत्ते ने काटा|कुत्रा चावला/i.test(q)) {
    return {
      urgency: 'HIGH',
      suggestedAction: 'first_aid',
      reply: `🐕 **DOG / ANIMAL BITE FIRST AID & RABIES PREVENTION:**\n\n1. **Wash Thoroughly for 15 Minutes:** Immediately flush the wound under **running tap water with soap** for a full 15 minutes. Soap dissolves the virus envelope.\n2. **Disinfect:** Apply povidone-iodine (Betadine) or alcohol antiseptic if available.\n3. **Do NOT stitch or tightly bandage:** Animal bite wounds should remain open unless severe hemorrhage.\n4. **Rush to Clinic/Hospital within 24 Hours:** Receive **Anti-Rabies Vaccine (ARV)** and Tetanus injection.\n5. **Category III Bites (punctures/scratches with blood):** Rabies Immunoglobulin (RIG) is mandatory at the wound site.\n6. ⚠️ *Rabies has a 100% fatality rate once symptoms start, but is 100% preventable with timely vaccination!*`,
    };
  }

  // 1.9 Burns & Scalds
  if (/burn|scalding|hot water burn|fire burn|जलना|भाजणे/i.test(q)) {
    return {
      urgency: 'HIGH',
      suggestedAction: 'first_aid',
      reply: `🔥 **FIRST AID FOR BURNS & SCALDS:**\n\n1. **Cool Water Immediately:** Run cool (not icy) tap water over the burn for **10 to 20 minutes**.\n2. **Remove Constrictive Items:** Gently take off rings, watches, and tight clothing before swelling starts.\n3. **Cover Loosely:** Cover with sterile non-stick dressing or clean food cling wrap.\n4. 🚫 **NEVER APPLY:** Ice, butter, toothpaste, turmeric, mustard oil, or raw eggs. Do not burst blisters.\n5. **Seek Emergency Care (112):** If burn is on face, hands, genitals, or larger than a palm.`,
    };
  }

  // 1.10 Fractures & Sprains
  if (/fracture|broken bone|sprain|हड्डी टूटना|हाड मोडणे|मचकोड़/i.test(q)) {
    return {
      urgency: 'MEDIUM',
      suggestedAction: 'first_aid',
      reply: `🦴 **FIRST AID FOR FRACTURES & SPRAINS:**\n\n1. **Immobilize:** Do not move the injured area. Support it in the position found using a rolled magazine, cardboard splint, or folded towel.\n2. **R.I.C.E. for Sprains:**\n   - **Rest:** Stop moving the injured joint.\n   - **Ice:** Apply cold pack wrapped in a towel for 15-20 min (never ice directly on skin).\n   - **Compress:** Wrap with an elastic crepe bandage comfortably (not too tight).\n   - **Elevate:** Prop up limb above heart level.\n3. **If Open Bone Fracture (bone through skin):** Do not push bone back! Cover with clean cloth and call **112 / 108**.`,
    };
  }

  /* ─────────────────────────────────────────────────────────────
     2. COMMON HEALTH ISSUES & SYMPTOMS
  ───────────────────────────────────────────────────────────── */

  // 2.1 Fever & Headache
  if (/fever|headache|high temp|temperature|body ache|बुखार|सिरदर्द|ताप|डोकेदुखी/i.test(q)) {
    if (isHindi) {
      return {
        urgency: 'MEDIUM',
        suggestedAction: 'first_aid',
        reply: `🌡️ **तेज बुखार और सिरदर्द के लिए प्राथमिक देखभाल:**\n\n1. **हाइड्रेशन:** भरपूर पानी, ओआरएस (ORS), नारियल पानी या नींबू पानी पिएं।\n2. **शरीर ठंडा करें:** माथे और गर्दन पर सामान्य नल के पानी की गीली पट्टी रखें। बर्फ का प्रयोग न करें।\n3. **आराम:** हल्के सूती कपड़े पहनें और हवादार कमरे में पर्याप्त आराम करें।\n4. **दवा सावधानी:** यदि आवश्यक हो तो डॉक्टर/फार्मासिस्ट की सलाह से पैरासिटामोल लें। बिना डॉक्टर के एंटीबायोटिक या एस्पिरिन न लें।\n5. ⚠️ **तुरंत डॉक्टर से मिलें यदि:**\n   - बुखार 102°F (39°C) से अधिक हो या 3 दिन से न उतरे।\n   - गर्दन में अकड़न, सांस लेने में तकलीफ, भ्रम या त्वचा पर चकत्ते हों।`,
      };
    }
    if (isMarathi) {
      return {
        urgency: 'MEDIUM',
        suggestedAction: 'first_aid',
        reply: `🌡️ **तीव्र ताप आणि डोकेदुखीसाठी प्रथमोपचार:**\n\n1. **हायड्रेशन:** भरपूर पाणी, ओआरएस (ORS), नारळ पाणी किंवा लिंबू पाणी प्या. तापात शरीरातील द्रव वेगाने कमी होते.\n2. **शरीर थंड करा:** कपाळावर आणि मानेवर सामान्य तापमानाच्या पाटीची ओले कापड ठेवा. बर्फ वापरू नका.\n3. **विश्रांती:** सैल सुती कपडे घाला आणि हवेशीर खोलीत आराम करा.\n4. **औषध काळजी:** डॉक्टरांच्या सल्ल्याने पॅरासिटामॉल घेऊ शकता. डॉक्टरांच्या सल्ल्याशिवाय अँटीबायोटिक्स घेऊ नका.\n5. ⚠️ **तातडीने डॉक्टरांकडे जा जर:**\n   - ताप 102°F पेक्षा जास्त असेल किंवा 3 दिवसांपेक्षा जास्त टिकला.\n   - मान ताठ होणे, श्वास घेण्यास त्रास किंवा शरीरावर पुरळ आल्यास.`,
      };
    }
    return {
      urgency: 'MEDIUM',
      suggestedAction: 'first_aid',
      reply: `🌡️ **HOME CARE FOR HIGH FEVER & HEADACHE:**\n\n1. **Hydrate Continuously:** Drink plenty of fluids (boiled-cooled water, ORS, coconut water, thin soups). Fever causes rapid fluid loss.\n2. **Lukewarm Sponge:** Place a cloth dipped in normal room-temperature tap water on forehead, neck, and armpits. Never use ice or alcohol.\n3. **Rest & Clothing:** Wear loose, light cotton clothing. Do not wrap yourself in heavy blankets.\n4. **Medication Note:** Paracetamol (acetaminophen) can help reduce fever under standard dosage, but avoid taking aspirin or heavy pain medications without a doctor's advice.\n5. ⚠️ **Red Flag Warning — Seek Medical Care Immediately If:**\n   - Fever exceeds 103°F (39.5°C) or lasts over 3 days.\n   - Accompanied by stiff neck, intense light sensitivity, confusion, persistent vomiting, or rash (possible dengue/meningitis).`,
    };
  }

  // 2.2 Stomach Ache, Vomiting, Diarrhea, Food Poisoning & Dehydration
  if (/stomach pain|vomit|diarrhea|loose motion|food poisoning|dehydration|ors|पेट दर्द|उल्टी|दस्त|जुलाब|अतिसार|पोटदुखी/i.test(q)) {
    return {
      urgency: 'MEDIUM',
      suggestedAction: 'first_aid',
      reply: `💧 **FIRST AID FOR VOMITING, DIARRHEA & FOOD POISONING:**\n\n1. **Prevent Dehydration (Crucial Step):** Sip **ORS (Oral Rehydration Salts)** solution frequently. If packet unavailable: mix 6 level teaspoons sugar + 1/2 teaspoon salt in 1 litre clean drinking water.\n2. **Small Sips:** Drink small sips every 5 minutes rather than large gulps, which can trigger more vomiting.\n3. **Dietary Guidance:** Once vomiting pauses for 4 hours, take light bland food (khichdi, curd rice, banana, boiled potatoes, toast). Avoid milk, spicy, oily, or caffeinated items.\n4. 🚫 **Avoid Over-The-Counter Anti-Diarrheal Drugs** (like loperamide) if you have blood in stool or high fever, as it traps toxins.\n5. ⚠️ **Seek Hospital Care / Call 108 If:**\n   - Inability to retain liquids for over 12 hours.\n   - Blood in vomit or stool.\n   - Signs of severe dehydration: sunken eyes, extreme dry mouth, dark/no urine for 8 hours, confusion.`,
    };
  }

  // 2.3 Cold, Cough, Sore Throat & Flu
  if (/cold|cough|sore throat|flu|runny nose|congestion|सर्दी|खांसी|कफ|गले में खराश|खोकला/i.test(q)) {
    return {
      urgency: 'LOW',
      suggestedAction: 'first_aid',
      reply: `🍵 **FIRST AID FOR COLD, COUGH & SORE THROAT:**\n\n1. **Warm Saline Gargle:** Gargle with warm water mixed with 1/2 teaspoon salt 3 times a day to relieve throat inflammation.\n2. **Steam Inhalation:** Inhale plain warm steam for 5-10 minutes to clear nasal congestion.\n3. **Hydration & Honey:** Drink warm water, herbal tea (tulsi/ginger), and 1 teaspoon honey with warm water for throat soothing (never give honey to infants under 1 year).\n4. **Rest:** Adequate sleep supports immune response.\n5. ⚠️ **See a Doctor If:** Cough lasts over 2 weeks, produces rust-colored or bloody phlegm, or is accompanied by difficulty breathing or high fever.`,
    };
  }

  // 2.4 Asthma & Shortness of Breath
  if (/asthma|short of breath|difficulty breathing|wheezing|दमा|सांस फूलना|श्वास घेण्यास त्रास/i.test(q)) {
    return {
      urgency: 'HIGH',
      suggestedAction: 'call_112',
      reply: `🫁 **FIRST AID FOR ASTHMA ATTACK & BREATHING DIFFICULTY:**\n\n1. **Sit Upright Immediately:** Lean slightly forward with elbows on knees. Do not lie down.\n2. **Use Reliever Inhaler (usually Blue / Salbutamol):**\n   - Shake inhaler, take 1 puff through spacer, breathe gently for 4 breaths.\n   - Wait 1 minute. Take another puff (up to 4 to 10 puffs if severe).\n3. **Stay Calm & Loosen Clothing:** Anxiety worsens airway constriction.\n4. 🚨 **Call 112 / 108 IMMEDIATELY If:**\n   - Inhaler gives no relief after 5 minutes.\n   - Lips, gums, or fingernails turn blue/gray.\n   - Difficulty speaking full sentences between breaths.`,
    };
  }

  // 2.5 Diabetic Emergency (Low Blood Sugar / Hypoglycemia)
  if (/diabetes|low sugar|hypoglycemia|shaking sugar|शुगर लो|मधुमेह/i.test(q)) {
    return {
      urgency: 'HIGH',
      suggestedAction: 'first_aid',
      reply: `🍬 **LOW BLOOD SUGAR (HYPOGLYCEMIA) — RULE OF 15:**\n\nSymptoms: Shaking, sweating, dizziness, confusion, rapid heartbeat, extreme hunger.\n\n1. **Check:** If conscious, give **15 grams of fast-acting sugar immediately**:\n   - 3-4 teaspoons glucose powder or sugar dissolved in water, OR\n   - Half glass fruit juice or regular non-diet soda, OR\n   - 3 pieces of hard candy or 1 tablespoon honey.\n2. **Wait 15 Minutes:** Let them sit quietly. Check sugar or symptom relief.\n3. **Repeat:** If still feeling shaky or sugar < 70 mg/dL, give another 15g sugar.\n4. **Follow-up Snack:** Once recovered, eat a small carbohydrate meal (chapati, biscuit, or bread).\n5. ⚠️ **If Unconscious:** **DO NOT put anything in their mouth (choking hazard).** Roll on side and call **112 / 108** immediately.`,
    };
  }

  /* ─────────────────────────────────────────────────────────────
     3. MENTAL HEALTH & PSYCHOLOGICAL SUPPORT
  ───────────────────────────────────────────────────────────── */

  // 3.1 Suicide Prevention & Acute Crisis
  if (/suicide|kill myself|want to die|end my life|self harm|आत्महत्या|जीव संपवावा|मरना चाहता/i.test(q)) {
    return {
      urgency: 'CRITICAL',
      suggestedAction: 'call_telemanas',
      reply: `🆘 **PLEASE STAY WITH US. YOUR LIFE HAS DEEP VALUE, AND HELP IS RIGHT HERE:**\n\nYou do not have to carry this immense weight all alone. There are compassionate counselors available right now 24/7 to listen without any judgment:\n\n📞 **TELE-MANAS (Govt of India 24/7 Toll-Free):** **14416** or **1800-891-4416**\n📞 **KIRAN Mental Health Helpline:** **1800-599-0019**\n📞 **National Emergency:** **112**\n\n• You are going through a painful moment, but feelings change and support is available.\n• Please reach out to someone you trust, or dial **14416** right now. A trained counselor is ready to speak with you in Hindi, English, Marathi, or your regional language for free.`,
    };
  }

  // 3.2 Panic Attack & Severe Anxiety
  if (/panic attack|anxiety|scared|hyperventilat|overwhelm|heart racing|feel like dying|घबराहट|चिंता|पैनिक/i.test(q)) {
    return {
      urgency: 'MEDIUM',
      suggestedAction: 'call_telemanas',
      reply: `🌸 **YOU ARE SAFE RIGHT NOW. TAKE A BREATH WITH ME:**\n\nPanic attacks are physically intense, but they are temporary and harmless to your heart. You are not losing control.\n\n**Try the 5-4-3-2-1 Grounding Method:**\n• **5 things you can SEE** around you (e.g. wall, shoes, fan).\n• **4 things you can TOUCH** (e.g. your clothes, table surface, cold water).\n• **3 things you can HEAR** (e.g. vehicles, clock, your breath).\n• **2 things you can SMELL** (e.g. soap, air).\n• **1 thing you can TASTE** (or take a slow sip of water).\n\n**Box Breathing (4-4-4-4):**\nInhale slowly through nose (4s) → Hold (4s) → Exhale gently through mouth (4s) → Hold (4s).\n\n💡 *Would you like to speak to a supportive counselor right now? Call **Tele-MANAS on 14416** (24/7 Free).*`,
    };
  }

  // 3.3 Depression, Sadness, Loneliness & Grief
  if (/depress|sad|hopeless|lonely|crying|unhappy|stress|burnout|उदासी|तनाव|डिप्रेशन|एकटेपणा/i.test(q)) {
    return {
      urgency: 'LOW',
      suggestedAction: 'call_telemanas',
      reply: `🤍 **I HEAR YOU. IT IS OKAY TO NOT BE OKAY:**\n\nWhat you are feeling is valid. Going through stress, loneliness, or emotional burnout can drain your energy and make everything feel heavy.\n\n**Gentle Steps For Today:**\n1. **Take One Tiny Step:** You don't have to fix everything today. Just drink a glass of water, wash your face, or step into natural light for 5 minutes.\n2. **Break The Loop:** Reach out to a close friend, family member, or trusted mentor. Sharing a burden reduces its weight.\n3. **Gentle Routine:** Aim for regular sleep hours and avoid doom-scrolling late at night.\n4. **Talk to a Professional:** India's national psychological support service is available 24/7:\n   - **Tele-MANAS:** Dial **14416** (Free confidential counseling in 20+ languages).\n   - **Vandrevala Foundation:** +91 9999 666 555.`,
    };
  }

  /* ─────────────────────────────────────────────────────────────
     4. DISASTER PREPAREDNESS & RESPONSE (NDMA PROTOCOLS)
  ───────────────────────────────────────────────────────────── */

  // 4.1 Earthquake
  if (/earthquake|tremor|building shaking|seismic|भूकंप|धरतीकंप/i.test(q)) {
    return {
      urgency: 'HIGH',
      suggestedAction: 'first_aid',
      reply: `🏢 **EARTHQUAKE SAFETY — DROP, COVER, HOLD ON:**\n\n1. **If Indoors:**\n   - **DROP** to your hands and knees so tremors don't knock you down.\n   - **COVER** your head and neck under a sturdy table, desk, or bed.\n   - **HOLD ON** to your shelter until shaking stops.\n   - Stay away from glass windows, heavy mirrors, and overhead cabinets.\n   - 🚫 **NEVER USE ELEVATORS (LIFTS).**\n2. **If Outdoors:**\n   - Move to an open area away from buildings, electrical poles, hoardings, and flyovers.\n3. **After Shaking Stops:**\n   - Check for gas leaks (do NOT light matches or candles).\n   - Expect aftershocks. Call **112** or Disaster Control **1070** if trapped.`,
    };
  }

  // 4.2 Flood & Waterlogging
  if (/flood|waterlogging|submerged|deluge|बाढ़|जलभराव|पूर|पाणी साचले/i.test(q)) {
    return {
      urgency: 'HIGH',
      suggestedAction: 'call_112',
      reply: `🌊 **FLOOD & WATERLOGGING SAFETY PROTOCOL (NDMA):**\n\n1. **Move to Higher Ground:** If water enters your home, move to upper floors or designated community evacuation shelters.\n2. **Cut Main Utilities:** Turn off the main electrical breaker and LPG gas cylinder valve before water reaches sockets.\n3. 🚫 **NEVER WALK OR DRIVE THROUGH FLOODWATER:**\n   - Just 6 inches of moving water can knock you down.\n   - 12 inches can sweep away small cars.\n   - Submerged open manholes and electrocution from fallen wires are severe hidden risks.\n4. **Drinking Water Caution:** Only drink boiled water, bottled water, or water treated with chlorine tablets. Water-borne epidemics (leptospirosis, cholera) spread fast during floods.\n5. **Emergency Contact:** National Disaster Management: **1070**, Local District Disaster: **1077**, Emergency: **112**.`,
    };
  }

  // 4.3 Cyclone & Severe Windstorm
  if (/cyclone|hurricane|typhoon|storm surge|चक्रवात|तूफान|वादळ/i.test(q)) {
    return {
      urgency: 'HIGH',
      suggestedAction: 'first_aid',
      reply: `🌀 **CYCLONE & SEVERE WINDSTORM SAFETY (IMD GUIDELINES):**\n\n1. **Stay Indoors:** Stay in the safest, central room of the house away from windows.\n2. **Secure Outdoor Objects:** Fasten loose tin sheets, empty pots, and outdoor furniture that can turn into lethal flying projectiles.\n3. **Power Down:** Disconnect non-essential electrical appliances. Keep mobile phones and power banks 100% charged.\n4. **Beware The 'Eye of the Storm':** If wind suddenly goes quiet, do NOT go outside! The storm's calm eye is passing, and fierce winds will return from the opposite direction soon.\n5. Keep an emergency radio or phone on to track IMD Cyclone bulletins. Call **112** for rescue.`,
    };
  }

  // 4.4 Fire & Smoke Inhalation
  if (/fire|smoke|burning building|house fire|आग लगना|धुआं|आग लागली/i.test(q)) {
    return {
      urgency: 'CRITICAL',
      suggestedAction: 'call_112',
      reply: `🔥 **STRUCTURAL FIRE SAFETY — CRAWL LOW & ESCAPE:**\n\n1. **Call 101 or 112 immediately.** Shout to alert neighbors.\n2. **Crawl Under Smoke:** Smoke rises and toxic gases kill faster than flames. Stay close to the floor where air is cooler and cleaner.\n3. **Test Doors Before Opening:** Feel the door handle with the back of your hand. If HOT, do not open — find another escape route.\n4. **If Clothes Catch Fire:** **STOP, DROP & ROLL** immediately until flames are smothered. Never run!\n5. 🚫 **NEVER USE LIFTS:** Use stairs only.\n6. **Once Outside, STAY OUT:** Never re-enter a burning building for pets or belongings.`,
    };
  }

  // 4.5 Landslide & Cloudburst
  if (/landslide|mudslide|cloudburst|भूस्खलन|ढिगारा|माती खचणे/i.test(q)) {
    return {
      urgency: 'HIGH',
      suggestedAction: 'call_112',
      reply: `⛰️ **LANDSLIDE & CLOUDBURST SURVIVAL:**\n\n1. **Warning Signs:** Sudden muddy water flow, rumbling sounds, tilted trees, or new cracks in walls/slopes.\n2. **Evacuate Perpendicular to Flow:** Move quickly away from the path of mud/debris toward stable, higher ground.\n3. **If Trapped Indoors:** Curl into a tight ball under sturdy furniture and protect your head.\n4. Stay away from riverbanks, drains, and steep hillside roads during heavy cloudbursts. Call **112 / 1070**.`,
    };
  }

  // 4.6 Emergency Go-Bag Checklist
  if (/go bag|emergency kit|disaster kit|checklist|आपदा किट|इमर्जन्सी किट/i.test(q)) {
    return {
      urgency: 'LOW',
      suggestedAction: 'first_aid',
      reply: `🎒 **ESSENTIAL EMERGENCY 'GO-BAG' CHECKLIST (FOR 72 HOURS):**\n\n1. **Water & Food:** 3-4 litres packaged water per person, high-energy dry rations (chana, energy bars, biscuits).\n2. **First Aid & Medicines:** Prescribed chronic medications, Band-Aids, ORS, antiseptic ointment, paracetamol.\n3. **Lighting & Power:** Bright LED torch, extra batteries, fully charged power bank, USB cables.\n4. **Documents & Cash:** Waterproof pouch with Aadhaar, insurance policies, medical cards, and loose cash (ATMs fail in disasters).\n5. **Tools & Hygiene:** Whistle (to alert search & rescue), Swiss knife/scissors, N95 masks, sanitizer, dry matches/lighter in zip bag.\n6. Keep this backpack in an easily accessible spot near your main exit door.`,
    };
  }

  /* ─────────────────────────────────────────────────────────────
     5. WEATHER HAZARDS & SAFETY PRECAUTIONS
  ───────────────────────────────────────────────────────────── */

  // 5.1 Heatwave & Loo
  if (/heatwave|heat stroke|loo|hot weather|sunstroke|लू लगना|उष्णतेची लाट|उष्माघात/i.test(q)) {
    if (isHindi) {
      return {
        urgency: 'MEDIUM',
        suggestedAction: 'first_aid',
        reply: `☀️ **भीषण लू (Heatwave) और हीट स्ट्रोक से बचाव:**\n\n1. **दोपहर में बाहर जाने से बचें:** दोपहर 12 से 4 बजे के बीच सीधी धूप में न निकलें।\n2. **हाइड्रेशन:** प्यास न होने पर भी बार-बार पानी, ओआरएस, छाछ, नींबू पानी और नारियल पानी पिएं।\n3. **पहनावा:** ढीले, हल्के रंग के सूती कपड़े पहनें। सिर को गमछे, टोपी या छाते से ढकें।\n4. 🚨 **हीट स्ट्रोक के लक्षण:** यदि व्यक्ति को पसीना आना बंद हो जाए, त्वचा लाल व गर्म हो, सिर चकराए या बेहोशी आए:\n   - तुरंत छांव/ठंडे कमरे में ले जाएं।\n   - गीले कपड़े से पूरे शरीर को पोंछें और पंखा चलाएं।\n   - तुरंत 112 / 108 पर कॉल करें।`,
      };
    }
    return {
      urgency: 'MEDIUM',
      suggestedAction: 'first_aid',
      reply: `☀️ **EXTREME HEATWAVE & HEATSTROKE SAFETY (IMD ADVISORY):**\n\n1. **Avoid Peak Sun Hours:** Stay indoors between **12:00 PM and 4:00 PM** when solar radiation is highest.\n2. **Intense Hydration:** Drink plenty of fluids even if not feeling thirsty. Opt for water, ORS, lemon water (nimbu pani), buttermilk (chaas), and coconut water. Avoid alcohol and heavy sugary drinks.\n3. **Proper Clothing:** Wear loose, light-colored, breathable cotton clothing. Use umbrellas, wide-brim hats, and sunglasses.\n4. 🚨 **Emergency: Heatstroke Signs:**\n   - High body temp (>104°F/40°C), **no sweating** (hot dry skin), confusion, fainting.\n   - **First Aid:** Move to cool shade, strip extra clothing, sponge with cool water, fan vigorously, and call **112 / 108** immediately!`,
    };
  }

  // 5.2 Thunderstorm & Lightning Safety
  if (/lightning|thunderstorm|thunder|bijli|आसमानी बिजली|बिजली गिरना|वीज पडणे|वादळी पाऊस/i.test(q)) {
    return {
      urgency: 'HIGH',
      suggestedAction: 'first_aid',
      reply: `⚡ **LIGHTNING & THUNDERSTORM SAFETY (30-30 RULE):**\n\n1. **30-30 Rule:** If the time between flash and thunder is under 30 seconds, lightning is dangerously close — take shelter immediately. Stay inside until 30 minutes after the last thunderclap.\n2. **Where to Shelter:** A substantial building or enclosed metal-roof vehicle. Open sheds, tents, and bus stops are NOT safe.\n3. 🚫 **STRICT DANGERS OUTDOORS:**\n   - NEVER stand under tall, isolated trees.\n   - Avoid open fields, hilltops, and metal fences.\n   - Immediately get out of ponds, lakes, and swimming pools.\n4. **If Caught in an Open Field with No Shelter:** Crouch low on the balls of your feet with heels touching, head tucked down, hands over ears (Lightning Crouch). Do NOT lie flat on the ground.\n5. **Indoors:** Unplug electronic equipment, avoid corded phones, and avoid plumbing/baths during severe lightning.`,
    };
  }

  // 5.3 Heavy Rain & Monsoon Safety
  if (/heavy rain|monsoon alert|rainfall|storm alert|भारी बारिश|मुसळधार पाऊस/i.test(q)) {
    return {
      urgency: 'MEDIUM',
      suggestedAction: 'first_aid',
      reply: `🌧️ **HEAVY RAINFALL & MONSOON SAFETY TIPS:**\n\n1. **Track Weather Alerts:** Check IMD Red/Orange warnings before leaving home.\n2. **Avoid Flooded Roads:** Never cross bridges or underpasses where water depth is unknown.\n3. **Electrical Hazard:** Keep away from electric poles, streetlights, and transformers in waterlogged streets.\n4. **Vehicle Safety:** If water rises around your car and it stalls, abandon it immediately and seek higher ground.\n5. Keep torches, basic first aid, and mobile battery banks charged. Dial **112** for emergency assistance.`,
    };
  }

  // 5.4 Air Pollution, AQI & Smog Safety
  if (/aqi|air quality|pollution|smog|toxic air|stubble|वायु प्रदूषण|हवा प्रदूषण|धुंध/i.test(q)) {
    return {
      urgency: 'MEDIUM',
      suggestedAction: 'first_aid',
      reply: `😷 **HAZARDOUS AIR QUALITY (AQI > 300) & SMOG PRECAUTIONS:**\n\n1. **Mask Up Outdoors:** Wear a certified **N95 or FFP2 respirator mask** snugly fitted over nose and mouth. Regular cloth masks do not filter fine PM2.5 particles.\n2. **Avoid Morning Outdoor Workouts:** Do not jog, run, or cycle during early morning and late evening when smog inversion concentrates toxins near ground level.\n3. **Indoor Protection:** Keep doors and windows closed during peak smog. Use HEPA air purifiers if accessible, or place air-purifying indoor plants (Snake plant, Areca palm).\n4. **Eye & Throat Relief:** Wash eyes with clean cold water, drink warm liquids, and do salt-water gargles.\n5. **Vulnerable Groups:** Asthmatic patients, children, and elderly should stay indoors and keep prescribed rescue inhalers handy.`,
    };
  }

  // 5.5 Extreme Cold Wave & Hypothermia
  if (/cold wave|extreme cold|hypothermia|frostbite|शीत लहर|कड़ाके की ठंड|थंडीची लाट/i.test(q)) {
    return {
      urgency: 'MEDIUM',
      suggestedAction: 'first_aid',
      reply: `❄️ **EXTREME COLD WAVE & HYPOTHERMIA SAFETY:**\n\n1. **Dress in Multiple Layers:** Several loose, warm layers trap warm air better than a single heavy coat. Always cover head, ears, hands, and feet (where maximum heat loss occurs).\n2. **Room Heating Caution:** If using charcoal (angithi) or gas heaters, ensure proper room ventilation to prevent deadly **Carbon Monoxide poisoning**.\n3. **Warm Drinks & Nourishment:** Consume warm water, soups, and hot meals to maintain body core temperature.\n4. 🚨 **Hypothermia Warning Signs:** Uncontrollable shivering, slurred speech, clumsy fingers, or extreme drowsiness. Warm the core gently with dry blankets and call **112 / 108**.`,
    };
  }

  /* ─────────────────────────────────────────────────────────────
     6. EMERGENCY NUMBERS IN INDIA
  ───────────────────────────────────────────────────────────── */
  if (/number|helpline|112|108|100|101|1091|1098|14416|1070|help line/i.test(q)) {
    return {
      urgency: 'LOW',
      suggestedAction: 'call_112',
      reply: `📞 **KEY EMERGENCY HELPLINE NUMBERS IN INDIA:**\n\n• **112 (National Unified Emergency):** Single toll-free emergency number across India (Police, Fire, Ambulance, Disaster). Works from any phone even without SIM / locked screen.\n• **108:** Free Emergency Medical Ambulance & Trauma rescue across most Indian states.\n• **100:** Police Control Room.\n• **101:** Fire Brigade.\n• **14416 / 1800-891-4416:** Tele-MANAS (24/7 Free Mental Health & Psychiatric Support).\n• **1091:** Women Helpline (Domestic violence / Harassment).\n• **1098:** Childline (Children in distress).\n• **1070:** National Disaster Management Authority (NDMA).\n• **1077:** District Disaster Control Room.`,
    };
  }

  /* ─────────────────────────────────────────────────────────────
     7. DEFAULT INTELLIGENT COMPREHENSIVE FALLBACK
  ───────────────────────────────────────────────────────────── */
  if (isHindi) {
    return {
      urgency: 'MEDIUM',
      suggestedAction: 'first_aid',
      reply: `नमस्ते! मैं आपका **आपातकालीन, स्वास्थ्य, मानसिक स्वास्थ्य, आपदा और मौसम सुरक्षा AI सहायक** हूँ।\n\nआप मुझसे इन विषयों पर कोई भी सवाल पूछ सकते हैं:\n• **स्वास्थ्य व प्राथमिक उपचार:** तेज बुखार, सिरदर्द, उल्टी-दस्त, जलना, सांप का काटना, सीपीआर (CPR), फ्रैक्चर\n• **मानसिक स्वास्थ्य व संबल:** घबराहट, पैनिक अटैक, अवसाद, चिंता, टेली-मानस 14416 सहायता\n• **आपदा प्रबंधन:** भूकंप, बाढ़, चक्रवात, इमारत में आग, लैंडस्लाइड, 72 घंटे की गो-बैग किट\n• **मौसम सुरक्षा:** लू (Heatwave), शीतलहर, भारी बारिश, आसमानी बिजली, वायु प्रदूषण (AQI)\n\n🚨 *यदि कोई गंभीर जीवन का खतरा है, तो कृपया तुरंत **112** पर कॉल करें।* मैं आपकी क्या मदद कर सकता हूँ?`,
    };
  }

  if (isMarathi) {
    return {
      urgency: 'MEDIUM',
      suggestedAction: 'first_aid',
      reply: `नमस्कार! मी तुमचा **आपत्कालीन, आरोग्य, मानसिक आरोग्य, आपत्ती आणि हवामान सुरक्षा AI सहाय्यक** आहे.\n\nतुम्ही मला खालील विषयांवर कोणताही प्रश्न विचारू शकता:\n• **आरोग्य आणि प्रथमोपचार:** तीव्र ताप, डोकेदुखी, पोटदुखी, जळणे, सर्पदंश, सीपीआर (CPR), श्वास कोंडणे\n• **मानसिक आरोग्य:** पॅनिक अटॅक, अतिचिंता, उदासीनता, ताणतणाव, टेली-मानस 14416 हेल्पलाइन\n• **आपत्ती व्यवस्थापन:** भूकंप, पूर, चक्रीवादळ, आग, आपत्कालीन किट\n• **हवामान सुरक्षा:** उष्णतेची लाट (लू), मुसळधार पाऊस, वीज पडणे, हवेचे प्रदूषण\n\n🚨 *तातडीचा धोका असल्यास ताबडतोब **112** डायल करा.* मी तुम्हाला काय मदत करू शकतो?`,
    };
  }

  return {
    urgency: 'MEDIUM',
    suggestedAction: 'first_aid',
    reply: `Hello! I am your **Emergency, Health, Mental Health, Disaster & Weather AI Assistant** for India.\n\nI can help you understand and answer questions about:\n• **Health & First Aid:** High fever, severe headache, stomach pain/vomiting, burns, cuts/bleeding, fractures, dog/snake bites, CPR, choking, diabetic emergencies.\n• **Mental Health & Support:** Panic attack grounding (5-4-3-2-1), anxiety, deep stress, depression, insomnia, and 24/7 free counseling via Tele-MANAS (14416).\n• **Disasters & Preparedness:** Earthquake (Drop, Cover, Hold), floods, cyclones, building fires, landslides, and 72-hour emergency go-bag supplies.\n• **Weather Hazards:** Heatwave (loo) safety, thunderstorm/lightning 30-30 rule, monsoon precautions, hazardous air quality/AQI, cold waves.\n\n⚠️ *If this is an immediate, life-threatening crisis, dial **112** or **108** right away.* What question can I assist you with?`,
  };
}
