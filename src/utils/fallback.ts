import { EmergencyAnalysisResponse, UserLocation, SupportedLanguage } from '../types/emergency';

/**
 * Generates a safe, deterministic emergency guidance response in English, Hindi, or Marathi
 * when offline, network disconnected, or backend AI encounters errors.
 *
 * Adheres strictly to safety constraints:
 * - Urgency is NEVER defaulted to LOW if the situation is unclear.
 * - Life-threatening cues trigger CRITICAL / HIGH urgency.
 * - Understands English, Devanagari (Hindi/Marathi), and transliterated Romanized phrases (Hinglish).
 */
export function generateSafeFallbackResponse(
  description: string,
  location?: UserLocation | null,
  language: SupportedLanguage = 'en'
): EmergencyAnalysisResponse {
  const text = (description || '').trim().toLowerCase();

  const locPlaceholder =
    language === 'hi'
      ? '[सटीक पता या निकटतम लैंडमार्क बताएं]'
      : language === 'mr'
      ? '[अचूक पत्ता किंवा जवळची खूण सांगा]'
      : '[State exact address or nearby landmark]';

  const locStr = location?.formattedText
    ? location.formattedText
    : location?.latitude && location?.longitude
    ? `Coordinates: ${location.latitude.toFixed(5)}, ${location.longitude.toFixed(5)}`
    : locPlaceholder;

  // 1. Life-threatening / Critical Medical
  if (
    /unconscious|fainted|not breathing|stopped breathing|chest pain|heart attack|stroke|seizure|severe bleeding|heavy blood|choking|cardiac|head injury|poison|बेहोश|सांस नहीं|छाती में दर्द|रक्तस्राव|खून बह रहा|श्वास नाही|हार्ट अटॅक|छातीत दुखणे|behoshi|chhati me dard|saans nahi|raktasrav/i.test(
      text
    )
  ) {
    if (language === 'hi') {
      return {
        situation_type: 'medical emergency',
        urgency: 'CRITICAL',
        short_summary: 'संभावित रूप से जानलेवा चिकित्सा आपातकाल का पता चला है। तत्काल सहायता आवश्यक है।',
        immediate_actions: [
          'तुरंत 112 (राष्ट्रीय आपातकालीन हेल्पलाइन) या 108 (एम्बुलेंस) पर कॉल करें।',
          'जांचें कि क्या व्यक्ति होश में है और सामान्य रूप से सांस ले रहा है।',
          'यदि सांस नहीं चल रही है और आप प्रशिक्षित हैं, तो छाती के बीच में सीपीआर (छाती दबाना) शुरू करें।',
          'यदि अत्यधिक रक्त बह रहा है, तो साफ कपड़े से लगातार मजबूती से दबाव बनाएं।',
          'रोगी को शांत और गर्म रखें; उन्हें अकेला न छोड़ें।'
        ],
        avoid_actions: [
          'बेहोश या अचेत व्यक्ति को कोई भोजन, पानी या दवाई न दें।',
          'गर्दन या रीढ़ की हड्डी में चोट की आशंका होने पर मरीज को न हिलाएं।',
          'अत्यंत आवश्यक न होने तक मरीज को अकेला छोड़कर न जाएं।'
        ],
        summary_for_call: `${locStr} पर आपातकाल। व्यक्ति गंभीर चिकित्सीय संकट में है (${description.slice(0, 80)})। तत्काल एम्बुलेंस की आवश्यकता है।`,
        missing_information: ['मरीज की उम्र और चेतना की स्थिति', 'एम्बुलेंस के लिए सटीक लैंडमार्क व रास्ता', 'पूर्व चिकित्सा इतिहास'],
        recommended_buttons: ['call_emergency', 'share_location'],
        confidence: 0.95,
        response_language: 'hi'
      };
    }

    if (language === 'mr') {
      return {
        situation_type: 'medical emergency',
        urgency: 'CRITICAL',
        short_summary: 'संभाव्यतः जीवितास धोका असलेली वैद्यकीय आणीबाणी आढळली आहे. त्वरित मदतीची आवश्यकता आहे.',
        immediate_actions: [
          'तातडीने 112 (राष्ट्रीय आपत्कालीन हेल्पलाइन) किंवा 108 (रुग्णवाहिका) वर कॉल करा.',
          'व्यक्ती शुद्धीवर आहे का आणि सामान्य श्वास घेत आहे का ते तपासा.',
          'श्वास सुरू नसल्यास आणि प्रशिक्षण असल्यास छातीच्या मध्यभागी सीपीआर (छाती दाबणे) सुरू करा.',
          'जास्त रक्तस्त्राव होत असल्यास स्वच्छ कापडाने घट्ट दाबून धरा.',
          'रुग्णाला स्थिर व उबदार ठेवा; एकटे सोडू नका.'
        ],
        avoid_actions: [
          'बेशुद्ध किंवा अर्धवट शुद्धीवर असलेल्या व्यक्तीला खाणे, पाणी किंवा औषध देऊ नका.',
          'मान किंवा पाठीच्या कण्याला इजा झाल्याचा संशय असल्यास रुग्णाला हलवू नका.',
          'खूप गरज असल्याशिवाय रुग्णाला सोडून दूर जाऊ नका.'
        ],
        summary_for_call: `${locStr} येथे आपत्कालीन स्थिती. व्यक्तीला गंभीर वैद्यकीय त्रास होत आहे (${description.slice(0, 80)}). त्वरित रुग्णवाहिका पाठवा.`,
        missing_information: ['रुग्णाचे वय आणि शुद्धीची पातळी', 'रुग्णवाहिकेसाठी जवळची खूण व रस्ता', 'मागील आजार किंवा औषधे'],
        recommended_buttons: ['call_emergency', 'share_location'],
        confidence: 0.95,
        response_language: 'mr'
      };
    }

    return {
      situation_type: 'medical emergency',
      urgency: 'CRITICAL',
      short_summary: 'Potentially life-threatening medical emergency detected. Immediate intervention required.',
      immediate_actions: [
        'Call 112 (National Emergency Helpline) or 108/102 (Ambulance) immediately.',
        'Check if the person is responsive and breathing normally.',
        'If not breathing and trained, begin hands-only CPR (push hard and fast in center of chest).',
        'If bleeding heavily, apply firm, continuous pressure with a clean cloth.',
        'Keep the patient warm and still; do not leave them unattended.'
      ],
      avoid_actions: [
        'Do NOT give food, water, or oral medications to an unconscious or drowsy person.',
        'Do NOT move someone with suspected neck, spine, or head injury unless in immediate danger.',
        'Do NOT leave the patient alone to seek assistance unless absolutely necessary.'
      ],
      summary_for_call: `Emergency at ${locStr}. A person is experiencing severe medical distress (${description.slice(0, 80)}). Requesting urgent ambulance and paramedics.`,
      missing_information: [
        'Patient age and responsiveness level',
        'Exact landmark and access directions for the ambulance',
        'Existing medical conditions or medications taken'
      ],
      recommended_buttons: ['call_emergency', 'share_location'],
      confidence: 0.95,
      response_language: 'en'
    };
  }

  // 2. Fire or Explosion or Gas Leak
  if (/fire|smoke|burning|explosion|flames|gas leak|cylinder|आग|धुआं|विस्फोट|सिलेंडर|ज्वाला|धूर|आगीचा भडका|aag|dhua|aag lag gayi/i.test(text)) {
    if (language === 'hi') {
      return {
        situation_type: 'fire',
        urgency: 'CRITICAL',
        short_summary: 'सक्रिय आग, धुआं या खतरनाक गैस रिसाव की स्थिति।',
        immediate_actions: [
          'इमारत से तुरंत बाहर निकलें और सुरक्षित खुली जगह पर जाएं।',
          'सुरक्षित स्थान पर पहुंचते ही 112 या 101 (अग्निशमन सेवा) को कॉल करें।',
          'धुआं होने पर जमीन के करीब झुककर चलें और नाक-मुंह को गीले कपड़े से ढकें।',
          'पड़ोसियों को सतर्क करें और यदि अलार्म हो तो उसे बजाएं।'
        ],
        avoid_actions: [
          'किसी भी हाल में लिफ्ट (एलिवेटर) का उपयोग न करें।',
          'सामान लेने के लिए जलती हुई इमारत में वापस न जाएं।',
          'बिजली या तेल की आग पर पानी न डालें।'
        ],
        summary_for_call: `${locStr} पर आग की आपात स्थिति। विवरण: ${description.slice(0, 80)}। तुरंत फायर ब्रिगेड (101/112) भेजें।`,
        missing_information: ['क्या कोई व्यक्ति अंदर फंसा हुआ है', 'आग लगने का विशिष्ट तल या कमरा', 'ज्वलनशील पदार्थ या गैस सिलेंडर की उपस्थिति'],
        recommended_buttons: ['call_emergency', 'share_location', 'alert_family'],
        confidence: 0.95,
        response_language: 'hi'
      };
    }

    if (language === 'mr') {
      return {
        situation_type: 'fire',
        urgency: 'CRITICAL',
        short_summary: 'सक्रिय आग, धूर किंवा घातक गॅस गळतीची परिस्थिती.',
        immediate_actions: [
          'इमारतीबाहेर मोकळ्या व सुरक्षित जागेवर त्वरित बाहेर पडा.',
          'सुरक्षित ठिकाणी पोहोचल्यावर त्वरित 112 किंवा 101 (अग्निशामक दल) ला कॉल करा.',
          'धूर असल्यास जमिनीलगत वाकून चाला आणि नाका-तोंडावर ओले कापड धरा.',
          'इतरांना सतर्क करा आणि जवळील फायर अलार्म वाजवा.'
        ],
        avoid_actions: [
          'कोणत्याही परिस्थितीत लिफ्टचा वापर करू नका.',
          'वस्तू आणण्यासाठी जळत्या इमारतीत पुन्हा जाऊ नका.',
          'विजेच्या किंवा तेलाच्या आगीवर पाणी टाकू नका.'
        ],
        summary_for_call: `${locStr} येथे आगीची दुर्घटना. स्वरूप: ${description.slice(0, 80)}. त्वरित अग्निशामक दल पाठवा.`,
        missing_information: ['आत कोणी अडकले आहे का', 'आग नेमकी कोणत्या मजल्यावर आहे', 'सिलेंडर किंवा ज्वालाग्राही वस्तू आहेत का'],
        recommended_buttons: ['call_emergency', 'share_location', 'alert_family'],
        confidence: 0.95,
        response_language: 'mr'
      };
    }

    return {
      situation_type: 'fire',
      urgency: 'CRITICAL',
      short_summary: 'Active fire, smoke, or hazardous explosion hazard.',
      immediate_actions: [
        'Evacuate everyone immediately to an open, safe area outside the building.',
        'Call 112 or 101 (Fire Services) immediately once at a safe distance.',
        'Stay low to the floor if there is smoke, covering nose and mouth with a damp cloth if available.',
        'Alert neighbors and pull the nearest manual fire alarm if present.'
      ],
      avoid_actions: [
        'Do NOT use elevators under any circumstances.',
        'Do NOT re-enter the building for personal belongings.',
        'Do NOT use water on electrical or grease fires.'
      ],
      summary_for_call: `Fire emergency at ${locStr}. Structure or hazard: ${description.slice(0, 80)}. Need immediate Fire Brigade (101/112).`,
      missing_information: [
        'Whether any individuals are trapped inside',
        'Specific floor or origin of fire/smoke',
        'Presence of flammable materials or gas cylinders'
      ],
      recommended_buttons: ['call_emergency', 'share_location', 'alert_family'],
      confidence: 0.95,
      response_language: 'en'
    };
  }

  // 3. Road / Traffic Accident
  if (/accident|collision|crash|hit and run|car crash|bike crash|overturned|pinned|दुर्घटना|टक्कर|गाड़ी भिड़ंत|अपघात|धडक|गाडी पलटी|thok di|takkar/i.test(text)) {
    if (language === 'hi') {
      return {
        situation_type: 'accident',
        urgency: 'HIGH',
        short_summary: 'सड़क दुर्घटना की सूचना। चोट या यातायात खतरे की संभावना।',
        immediate_actions: [
          'पहले अपनी सुरक्षा सुनिश्चित करें—सक्रिय यातायात से दूर खड़े हों और वाहनों की हेजार्ड लाइट चालू करें।',
          'एम्बुलेंस और ट्रैफिक पुलिस के लिए 112 या 108 पर कॉल करें।',
          'सुरक्षित दूरी से घायलों की चेतना और खून बहने की जांच करें।',
          'गंभीर रक्तस्राव पर साफ कपड़े से सीधा दबाव बनाएं।'
        ],
        avoid_actions: [
          'जब तक आग लगने या डूबने का सीधा खतरा न हो, घायलों को वाहन से न खींचें।',
          'गर्दन या रीढ़ की हड्डी में चोट की आशंका हो तो हेलमेट न उतारें।',
          'तेज गति से आ रहे वाहनों के रास्ते में खड़े न हों।'
        ],
        summary_for_call: `${locStr} पर सड़क दुर्घटना। विवरण: ${description.slice(0, 80)}। घटनास्थल पर एम्बुलेंस व पुलिस की आवश्यकता है।`,
        missing_information: ['वाहनों और घायल व्यक्तियों की संख्या', 'सटीक सड़क/हाईवे का माइलस्टोन या चौराहा', 'क्या कोई वाहन में फंसा है'],
        recommended_buttons: ['call_emergency', 'share_location', 'alert_family'],
        confidence: 0.9,
        response_language: 'hi'
      };
    }

    if (language === 'mr') {
      return {
        situation_type: 'accident',
        urgency: 'HIGH',
        short_summary: 'रस्ता अपघात घडला आहे. दुखापत किंवा वाहतूक अडथळ्याची शक्यता.',
        immediate_actions: [
          'आधी स्वतःची सुरक्षितता पाहा—वाहतुकीपासून दूर थांबा आणि वाहनांचे इंडिकेटर सुरू करा.',
          'रुग्णवाहिका व पोलिसांसाठी 112 किंवा 108 वर कॉल करा.',
          'जखमी व्यक्ती शुद्धीवर आहेत का आणि रक्तस्त्राव होतोय का ते पाहा.',
          'रक्तस्त्राव होत असल्यास स्वच्छ कपड्याने दाबून ठेवा.'
        ],
        avoid_actions: [
          'आग लागण्याचा धोका नसल्यास जखमी व्यक्तीला वाहनातून ओढून काढू नका.',
          'पाठीच्या कण्याला इजा होण्याची शक्यता असल्यास हेल्मेट काढू नका.',
          'वेगाने येणाऱ्या वाहनांच्या रस्त्यात उभे राहू नका.'
        ],
        summary_for_call: `${locStr} येथे रस्ता अपघात. तपशील: ${description.slice(0, 80)}. रुग्णवाहिका व पोलिस तातडीने पाठवा.`,
        missing_information: ['वाहने आणि जखमी व्यक्तींची संख्या', 'रस्त्याचा नेमका चौक किंवा किलोमीटर खूण', 'कोणी वाहनात अडकले आहे का'],
        recommended_buttons: ['call_emergency', 'share_location', 'alert_family'],
        confidence: 0.9,
        response_language: 'mr'
      };
    }

    return {
      situation_type: 'accident',
      urgency: 'HIGH',
      short_summary: 'Traffic accident reported with potential injuries or roadway hazard.',
      immediate_actions: [
        'Ensure your own safety first—stand away from active traffic and turn on vehicle hazard lights.',
        'Call 112 or 108 for ambulance and traffic police.',
        'Check victims for responsiveness and heavy bleeding from a safe vantage point.',
        'Apply direct pressure to severe bleeding using clean fabric.'
      ],
      avoid_actions: [
        'Do NOT move injured victims from vehicles unless there is immediate risk of fire or submersion.',
        'Do NOT remove motorcycle helmets if neck or spinal injury is suspected.',
        'Do NOT stand in blind spots or lanes of approaching high-speed traffic.'
      ],
      summary_for_call: `Road accident at ${locStr}. Incident details: ${description.slice(0, 80)}. Requesting ambulance and police at scene.`,
      missing_information: [
        'Number of vehicles and injured persons',
        'Exact highway / road kilometer marker or junction',
        'Whether victims are trapped inside vehicles'
      ],
      recommended_buttons: ['call_emergency', 'share_location', 'alert_family'],
      confidence: 0.9,
      response_language: 'en'
    };
  }

  // 4. Crime, Violence, Harassment, Break-in
  if (/thief|robbery|attack|knife|gun|assault|harass|stalker|violence|burglar|molest|weapon|चोरी|डकैती|हमला|चाकू|हथियार|छेड़छाड़|मारपीट|चोर|हल्ला|पाठलाग|धमकी|chori|hamla/i.test(text)) {
    if (language === 'hi') {
      return {
        situation_type: 'crime',
        urgency: 'CRITICAL',
        short_summary: 'अपराध या व्यक्तिगत सुरक्षा पर सीधा खतरा।',
        immediate_actions: [
          'अपनी सुरक्षा को प्राथमिकता दें: किसी सुरक्षित, रोशनी वाली या भीड़-भाड़ वाली जगह पर जाएं।',
          'यदि अंदर फंसे हैं तो दरवाजा बंद करें और फोन को साइलेंट कर लें।',
          'तुरंत 112 (राष्ट्रीय हेल्पलाइन) या 100 (पुलिस) या 1091 (महिला हेल्पलाइन) पर कॉल करें।',
          'सुरक्षित होने पर संदिग्धों का हुलिया या वाहन नंबर नोट करें।'
        ],
        avoid_actions: [
          'सशस्त्र या हिंसक व्यक्तियों से उलझने का प्रयास न करें।',
          'घटनास्थल पर किसी भी वस्तु को न छुएं।',
          'पुलिस के आने से पहले अपनी छिपने की जगह उजागर न करें।'
        ],
        summary_for_call: `${locStr} पर पुलिस सहायता चाहिए। सुरक्षा खतरा: ${description.slice(0, 80)}। तत्काल पुलिस पेट्रोल यूनिट भेजें।`,
        missing_information: ['संदिग्ध का वर्तमान स्थान', 'संदिग्धों का विवरण और हथियार', 'क्या कोई घायल या बंधक है'],
        recommended_buttons: ['call_emergency', 'share_location', 'alert_family'],
        confidence: 0.95,
        response_language: 'hi'
      };
    }

    if (language === 'mr') {
      return {
        situation_type: 'crime',
        urgency: 'CRITICAL',
        short_summary: 'गुन्हा किंवा वैयक्तिक सुरक्षिततेला थेट धोका.',
        immediate_actions: [
          'स्वतःच्या सुरक्षिततेला प्राधान्य द्या: सुरक्षित, उजेड असलेल्या किंवा गर्दीच्या ठिकाणी जा.',
          'घरात किंवा खोलीत अडकल्यास दरवाजे बंद करा आणि फोन सायलेंट करा.',
          'तातडीने 112 (राष्ट्रीय हेल्पलाइन), 100 (पोलिस) किंवा 1091 (महिला हेल्पलाइन) वर कॉल करा.',
          'सुरक्षित असल्यास संशयित व्यक्ती किंवा वाहनाचा क्रमांक लक्षात ठेवा.'
        ],
        avoid_actions: [
          'शस्त्रधारी व्यक्तींशी वाद घालू नका किंवा प्रतिकार करू नका.',
          'गुन्ह्याच्या ठिकाणच्या वस्तूंना हात लावू नका.',
          'पोलिस येईपर्यंत स्वतःचे लपण्याचे ठिकाण उघड करू नका.'
        ],
        summary_for_call: `${locStr} येथे पोलिसांची तातडीची मदत हवी आहे. धोका: ${description.slice(0, 80)}. गस्त पथक पाठवा.`,
        missing_information: ['संशयितांचे सध्याचे ठिकाण', 'शस्त्रांचा प्रकार आणि वर्णन', 'कोणी जखमी किंवा ओलिस आहे का'],
        recommended_buttons: ['call_emergency', 'share_location', 'alert_family'],
        confidence: 0.95,
        response_language: 'mr'
      };
    }

    return {
      situation_type: 'crime',
      urgency: 'CRITICAL',
      short_summary: 'Crime in progress or immediate personal safety threat.',
      immediate_actions: [
        'Prioritize personal escape: reach a secure, well-lit, populated area if possible.',
        'Lock and barricade doors if trapped indoors; silence your phone ringtone.',
        'Dial 112 (National Helpline) or 100 (Police) or 1091 (Women Helpline).',
        'Take note of suspect descriptions, vehicle numbers, and direction of travel if safe to observe.'
      ],
      avoid_actions: [
        'Do NOT confront or provoke armed or violent individuals.',
        'Do NOT touch or tamper with anything at the crime scene.',
        'Do NOT reveal your hiding position until certified police arrive.'
      ],
      summary_for_call: `Police assistance requested at ${locStr}. Personal safety threat: ${description.slice(0, 80)}. Requesting urgent patrol unit.`,
      missing_information: [
        'Current location of perpetrator',
        'Description of suspects and any visible weapons',
        'Whether anyone is held hostage or injured'
      ],
      recommended_buttons: ['call_emergency', 'share_location', 'alert_family'],
      confidence: 0.95,
      response_language: 'en'
    };
  }

  // 5. Flood or Natural Disaster
  if (/flood|water rising|earthquake|building collapse|landslide|cyclone|submerged|बाढ़|पानी भर गया|भूकंप|इमारत गिरी|भूस्खलन|चक्रीवादळ|घर खचले|baadh|pani bhar gaya|bhookamp/i.test(text)) {
    if (language === 'hi') {
      return {
        situation_type: 'natural disaster',
        urgency: 'HIGH',
        short_summary: 'गंभीर प्राकृतिक आपदा या संरचनात्मक खतरा।',
        immediate_actions: [
          'तुरंत किसी ऊंचे या मजबूत स्थान पर जाएं।',
          'बिजली के खंभों, लटके तारों और जलमग्न ट्रांसफार्मरों से दूर रहें।',
          '112 या आपदा प्रबंधन हेल्पलाइन (1070) पर कॉल करें।',
          'फोन की बैटरी बचाएं और आधिकारिक चेतावनियों पर ध्यान दें।'
        ],
        avoid_actions: [
          'बहते बाढ़ के पानी में पैदल या गाड़ी से जाने का प्रयास न करें।',
          'पानी में खड़े होकर बिजली के उपकरणों को न छुएं।',
          'क्षतिग्रस्त या कमजोर इमारतों के अंदर न जाएं।'
        ],
        summary_for_call: `${locStr} पर आपदा सहायता चाहिए। स्थिति: ${description.slice(0, 80)}। फंसे हुए लोगों को बचाव की आवश्यकता है।`,
        missing_information: ['फंसे हुए लोगों की संख्या (बच्चे/बुजुर्ग)', 'पानी की गहराई व स्थिति', 'बचाव नौकाओं के लिए सुरक्षित रास्ता'],
        recommended_buttons: ['call_emergency', 'share_location', 'alert_family'],
        confidence: 0.9,
        response_language: 'hi'
      };
    }

    if (language === 'mr') {
      return {
        situation_type: 'natural disaster',
        urgency: 'HIGH',
        short_summary: 'नैसर्गिक आपत्ती किंवा इमारतीला धोका निर्माण झाला आहे.',
        immediate_actions: [
          'त्वरित उंच किंवा सुरक्षित ठिकाणी हलवा.',
          'विजेचे खांब, तुटलेल्या तारा आणि पाण्याखालील ट्रान्सफॉर्मरपासून दूर राहा.',
          '112 किंवा आपत्ती व्यवस्थापन हेल्पलाइन (1070) वर कॉल करा.',
          'फोनची बॅटरी सांभाळा आणि अधिकृत सूचना ऐका.'
        ],
        avoid_actions: [
          'वेगाने वाहणाऱ्या पाण्यातून चालण्याचा किंवा वाहन चालवण्याचा प्रयत्न करू नका.',
          'पाण्यात उभे असताना विजेच्या उपकरणांना हात लावू नका.',
          'धोकादायक किंवा तडे गेलेल्या इमारतीत प्रवेश करू नका.'
        ],
        summary_for_call: `${locStr} येथे आपत्ती मदतीची गरज आहे. परिस्थिती: ${description.slice(0, 80)}. अडकलेल्या व्यक्तींना वाचवा.`,
        missing_information: ['अडकलेल्या लोकांची संख्या', 'पाण्याची पातळी', 'बचाव पथकासाठी सुरक्षित रस्ता'],
        recommended_buttons: ['call_emergency', 'share_location', 'alert_family'],
        confidence: 0.9,
        response_language: 'mr'
      };
    }

    return {
      situation_type: 'natural disaster',
      urgency: 'HIGH',
      short_summary: 'Severe environmental or structural hazard reported.',
      immediate_actions: [
        'Move immediately to higher ground or a structurally sound shelter.',
        'Stay clear of electrical poles, sagging power cables, and flooded substations.',
        'Dial 112 or Disaster Management Helpline (1070/1077).',
        'Conserve mobile phone battery and monitor official emergency broadcasts.'
      ],
      avoid_actions: [
        'Do NOT walk or drive through moving flood waters or submerged roads.',
        'Do NOT touch electrical appliances while standing in water.',
        'Do NOT enter damaged buildings or under unstable structures.'
      ],
      summary_for_call: `Disaster assistance requested at ${locStr}. Situation: ${description.slice(0, 80)}. Stranded or at risk.`,
      missing_information: [
        'Number of stranded individuals (including children/elderly)',
        'Water depth or structural stability level',
        'Safe access routes for emergency rescue boats or teams'
      ],
      recommended_buttons: ['call_emergency', 'share_location', 'alert_family'],
      confidence: 0.9,
      response_language: 'en'
    };
  }

  // 6. Minor, non-urgent situations — MEDIUM urgency
  // These are situations that may need attention but are NOT immediately life-threatening.
  const minorSituations =
    /headache|stomachache|stomach ache|vomit|nausea|mild fever|fever|cold|cough|sprain|bruise|scratch|minor cut|minor burn|small injury|lost wallet|lost phone|lost keys|lost bag|lost id|lost document|minor accident|fender bender|flat tyre|flat tire|car broke down|vehicle broke|dog bite|insect bite|bee sting|allergic reaction|rash|skin irritation|dizzy|dizziness|fell down|slipped|twisted ankle|small fall|locked out|locked myself|सिरदर्द|पेट दर्द|उल्टी|हल्का बुखार|खरोंच|छोटी चोट|हल्की चोट|बटुआ खो गया|फोन खो गया|चाबी खो गई|मोच|छोटी जलन|किडा चावला|मधमाशी चावली|पोट दुखणे|डोके दुखणे|उलटी|सौम्य ताप|ओरखाडा|किरकोळ जखम|पाकीट हरवले|चावी हरवली/.test(
      text
    );

  if (minorSituations) {
    if (language === 'hi') {
      return {
        situation_type: 'general safety issue',
        urgency: 'MEDIUM',
        short_summary: 'मामूली स्वास्थ्य समस्या या असुविधा। तत्काल जानलेवा खतरा नहीं लगता।',
        immediate_actions: [
          'शांत रहें और स्थिति का आकलन करें।',
          'यदि लक्षण बिगड़ें या गंभीर दर्द हो तो तुरंत 112 या 108 पर कॉल करें।',
          'उचित प्राथमिक उपचार लें और यदि आवश्यक हो तो निकट के डॉक्टर से मिलें।',
        ],
        avoid_actions: [
          'बिना डॉक्टर की सलाह के अत्यधिक दवाएं न लें।',
          'स्थिति गंभीर होने पर 112 पर कॉल करने में देरी न करें।',
        ],
        summary_for_call: `${locStr} से कॉल। मामूली स्वास्थ्य समस्या या असुविधा की सूचना: ${description.slice(0, 80)}।`,
        missing_information: ['लक्षणों का पूरा विवरण', 'मरीज की आयु', 'कोई पूर्व बीमारी'],
        recommended_buttons: ['find_nearby_help'],
        confidence: 0.65,
        response_language: 'hi',
      };
    }
    if (language === 'mr') {
      return {
        situation_type: 'general safety issue',
        urgency: 'MEDIUM',
        short_summary: 'किरकोळ आरोग्य समस्या किंवा अडचण. सध्या जीवाला थेट धोका दिसत नाही.',
        immediate_actions: [
          'शांत राहा आणि परिस्थितीचे मूल्यांकन करा.',
          'लक्षणे वाढल्यास किंवा तीव्र वेदना होत असल्यास तातडीने 112 किंवा 108 वर कॉल करा.',
          'योग्य प्राथमिक उपचार घ्या आणि आवश्यक असल्यास जवळच्या डॉक्टरकडे जा.',
        ],
        avoid_actions: [
          'डॉक्टरांच्या सल्ल्याशिवाय अधिक औषधे घेऊ नका.',
          'स्थिती बिघडल्यास 112 वर कॉल करण्यास उशीर करू नका.',
        ],
        summary_for_call: `${locStr} येथून कॉल. किरकोळ आरोग्य समस्या: ${description.slice(0, 80)}.`,
        missing_information: ['लक्षणांचा संपूर्ण तपशील', 'रुग्णाचे वय', 'मागील आजार'],
        recommended_buttons: ['find_nearby_help'],
        confidence: 0.65,
        response_language: 'mr',
      };
    }
    return {
      situation_type: 'general safety issue',
      urgency: 'MEDIUM',
      short_summary: 'Minor health issue or non-critical situation reported. No immediate life threat detected.',
      immediate_actions: [
        'Stay calm and assess the situation carefully.',
        'If symptoms worsen or pain becomes severe, call 112 or 108 immediately.',
        'Seek appropriate first aid and visit a nearby clinic or doctor if needed.',
      ],
      avoid_actions: [
        'Do NOT take excessive medication without medical advice.',
        'Do NOT delay calling 112 if the situation worsens significantly.',
      ],
      summary_for_call: `Calling from ${locStr}. Reporting a minor health issue: ${description.slice(0, 80)}.`,
      missing_information: ['Full description of symptoms', 'Age of affected person', 'Any existing medical conditions'],
      recommended_buttons: ['find_nearby_help'],
      confidence: 0.65,
      response_language: 'en',
    };
  }

  // 7. Completely empty, trivial greetings, or irrelevant queries
  if (
    !text ||
    /^(hi|hello|hey|test|who are you|what are you|good morning|good evening|good night|thanks|thank you|okay|ok|namaste|नमस्ते|नमस्कार|काय चालू आहे|धन्यवाद|ठीक है|शुक्रिया|ठीक आहे)\.?$/i.test(text)
  ) {
    if (language === 'hi') {
      return {
        situation_type: 'general safety issue',
        urgency: 'LOW',
        short_summary: 'इमरजेंसी हेल्पर तैयार है। कृपया अपनी स्थिति बताएं ताकि हम आपको सही सुरक्षा निर्देश दे सकें।',
        immediate_actions: [
          'लिखें या बोलें कि क्या हुआ है, आप कहां हैं और क्या किसी को तत्काल मदद चाहिए।',
          'यदि आप या आपके आसपास कोई खतरे में है, तो अभी सीधे 112 डायल करें।'
        ],
        avoid_actions: [
          'सक्रिय आपातकाल होने पर 112 पर कॉल करने में देरी न करें।'
        ],
        summary_for_call: `${locStr} से कॉल। सहायता व मार्गदर्शन की आवश्यकता है।`,
        missing_information: ['आपातकाल का विवरण', 'सटीक स्थान या लैंडमार्क', 'क्या कोई घायल है'],
        recommended_buttons: ['none'],
        confidence: 0.2,
        response_language: 'hi'
      };
    }

    if (language === 'mr') {
      return {
        situation_type: 'general safety issue',
        urgency: 'LOW',
        short_summary: 'इमर्जन्सी हेल्पर मदतीसाठी तयार आहे. कृपया काय घडले आहे ते सांगा जेणेकरून आम्ही योग्य मार्गदर्शन करू शकू.',
        immediate_actions: [
          'नेमके काय घडले आहे, तुमचे ठिकाण काय आहे आणि कोणाला मदतीची गरज आहे का ते सांगा.',
          'तुम्ही किंवा इतर कोणी तातडीच्या धोक्यात असल्यास थेट 112 डायल करा.'
        ],
        avoid_actions: [
          'आपत्कालीन परिस्थिती असल्यास 112 वर कॉल करण्यास विलंब करू नका.'
        ],
        summary_for_call: `${locStr} येथून कॉल. मदतीची आवश्यकता आहे.`,
        missing_information: ['परिस्थितीचे स्वरूप', 'नेमके ठिकाण', 'कोणी जखमी आहे का'],
        recommended_buttons: ['none'],
        confidence: 0.2,
        response_language: 'mr'
      };
    }

    return {
      situation_type: 'general safety issue',
      urgency: 'LOW',
      short_summary: 'Emergency Helper India is ready. Please describe your situation so we can guide you.',
      immediate_actions: [
        'Type or speak what is happening, where you are, and whether anyone needs immediate help.',
        'If you or someone around you is in immediate danger, dial 112 right now.'
      ],
      avoid_actions: [
        'Do NOT delay calling 112 if you are facing an active emergency.'
      ],
      summary_for_call: `Calling from ${locStr}. Requesting guidance or emergency support.`,
      missing_information: [
        'Description of the emergency',
        'Current location or landmark',
        'Injuries or safety hazards present'
      ],
      recommended_buttons: ['none'],
      confidence: 0.2,
      response_language: 'en'
    };
  }

  // 8. Unclear or ambiguous situation:
  // Only escalate to HIGH if there are genuine distress signals in the text.
  // Otherwise use MEDIUM — never default to LOW for ambiguous input.
  const hasDistressSignal =
    /help|emergency|danger|urgent|scared|afraid|dying|bleeding|injured|hurt|trapped|stuck|missing|please|sos|save me|मदद|खतरा|बचाओ|डर|आपातकाल|डरा हुआ|घायल|फंसा|कृपया|मदत|धोका|वाचवा|भीती|आपत्कालीन|जखमी|अडकलो|कृपया/i.test(
      text
    );

  const ambiguousUrgency = hasDistressSignal ? 'HIGH' : 'MEDIUM';

  if (language === 'hi') {
    return {
      situation_type: 'general safety issue',
      urgency: ambiguousUrgency,
      short_summary:
        ambiguousUrgency === 'HIGH'
          ? 'आपातकालीन स्थिति की सूचना मिली है। विवरण अस्पष्ट होने के कारण सुरक्षा-सर्वोपरि नियम लागू है।'
          : 'स्थिति का विवरण अस्पष्ट है। सहायता के लिए अपनी परिस्थिति को स्पष्ट बताएं।',
      immediate_actions: [
        'यदि आप किसी खतरे में हैं, तो बिना रुके तुरंत 112 डायल करें।',
        'यदि वर्तमान स्थान असुरक्षित लगे, तो तुरंत किसी रोशनी वाली व सुरक्षित जगह पर जाएं।',
        'जांचें कि क्या किसी को तत्काल प्राथमिक उपचार की आवश्यकता है।',
        'कृपया अपनी स्थिति के बारे में अधिक जानकारी दें ताकि सही मार्गदर्शन मिल सके।',
      ],
      avoid_actions: [
        'असुरक्षित या संदिग्ध स्थान पर न रुकें।',
        'आपातकालीन सहायता आने से पहले कोई जोखिम भरा काम न करें।',
      ],
      summary_for_call: `${locStr} पर सहायता चाहिए। विवरण: "${description.slice(0, 100)}"`,
      missing_information: ['खतरे या आपातकाल का सटीक विवरण', 'सटीक पता या प्रमुख लैंडमार्क', 'क्या कोई घायल है'],
      recommended_buttons: ambiguousUrgency === 'HIGH' ? ['call_emergency', 'share_location', 'alert_family'] : ['find_nearby_help'],
      confidence: 0.35,
      response_language: 'hi',
    };
  }

  if (language === 'mr') {
    return {
      situation_type: 'general safety issue',
      urgency: ambiguousUrgency,
      short_summary:
        ambiguousUrgency === 'HIGH'
          ? 'आपत्कालीन परिस्थितीचा संदेश मिळाला आहे. माहिती अपूर्ण असल्याने सुरक्षिततेचा नियम लागू आहे.'
          : 'परिस्थितीचा तपशील अपुरा आहे. योग्य मार्गदर्शनासाठी अधिक माहिती द्या.',
      immediate_actions: [
        'धोका वाटत असल्यास कोणतीही वाट न पाहता त्वरित 112 डायल करा.',
        'सध्याचे ठिकाण असुरक्षित वाटल्यास गर्दीच्या व उजेड असलेल्या जागी जा.',
        'कोणाला प्राथमिक उपचारांची गरज आहे का ते तपासा.',
        'कृपया तुमची परिस्थिती अधिक स्पष्टपणे सांगा जेणेकरून योग्य मदत मिळेल.',
      ],
      avoid_actions: [
        'असुरक्षित किंवा धोकादायक जागी थांबू नका.',
        'मदत येण्यापूर्वी स्वतः कोणताही धोका पत्करू नका.',
      ],
      summary_for_call: `${locStr} येथे मदतीची गरज आहे. तपशील: "${description.slice(0, 100)}"`,
      missing_information: ['धोक्याचे नेमके स्वरूप', 'अचूक पत्ता किंवा खूण', 'जखमींची संख्या'],
      recommended_buttons: ambiguousUrgency === 'HIGH' ? ['call_emergency', 'share_location', 'alert_family'] : ['find_nearby_help'],
      confidence: 0.35,
      response_language: 'mr',
    };
  }

  return {
    situation_type: 'general safety issue',
    urgency: ambiguousUrgency,
    short_summary:
      ambiguousUrgency === 'HIGH'
        ? 'Possible urgent situation reported. Details are limited — safety-first precautions apply.'
        : 'Situation details are unclear. Please describe what is happening so we can guide you better.',
    immediate_actions: [
      'If you feel in any immediate danger, call 112 now without waiting.',
      'Move to a safe, well-lit, or populated space if your current location feels hazardous.',
      'Check if anyone near you needs immediate medical attention or first aid.',
      'Please provide more details about what is happening so we can give accurate guidance.',
    ],
    avoid_actions: [
      'Do NOT remain in an unverified or potentially hostile location.',
      'Do NOT attempt dangerous actions before emergency responders are alerted.',
    ],
    summary_for_call: `Assistance needed at ${locStr}. Description: "${description.slice(0, 100)}".`,
    missing_information: [
      'Exact nature of the situation or emergency',
      'Specific location or nearby prominent landmark',
      'Whether anyone is injured or in immediate danger',
    ],
    recommended_buttons: ambiguousUrgency === 'HIGH' ? ['call_emergency', 'share_location', 'alert_family'] : ['find_nearby_help'],
    confidence: 0.35,
    response_language: 'en',
  };
}
