import { SupportedLanguage, LanguageMeta } from '../types/emergency';

export interface TranslationDictionary {
  appName: string;
  prototypeTag: string;
  notDispatcherWarning: string;
  emergencyCallBtn: string;
  emergencyCallDesc: string;
  helplinesBtn: string;
  allIndiaHelplinesTitle: string;
  callDialerAlert: string;
  tabs: {
    emergency: string;
    mentalHealth: string;
    aiChat: string;
    map: string;
  };
  form: {
    title: string;
    subtitle: string;
    quickScenariosLabel: string;
    placeholder: string;
    inputLabel: string;
    characters: string;
    voiceInput: string;
    voiceListening: string;
    addPhoto: string;
    changePhoto: string;
    addLocation: string;
    locating: string;
    locationAdded: string;
    privacyNote: string;
    submitBtn: string;
    analyzingBtn: string;
  };
  scenarios: Array<{ label: string; text: string }>;
  results: {
    urgencyTitle: string;
    highRiskAlert: string;
    dial112Now: string;
    safetyAssessment: string;
    operatorScriptTitle: string;
    operatorScriptHint: string;
    copySummary: string;
    copiedSummary: string;
    readAloud: string;
    stopReading: string;
    immediateActionsTitle: string;
    avoidActionsTitle: string;
    missingInfoTitle: string;
    demoSimulationsTitle: string;
    simulateFamily: string;
    simulateLocation: string;
  };
  notifications: {
    enableBtn: string;
    disableBtn: string;
    title: string;
    explanation: string;
    soundToggle: string;
    demoTestBtn: string;
    unsupportedBrowser: string;
    permissionDenied: string;
    dangerAlertTitle: string;
    dangerAlertBody: string;
    aiWarningNotice: string;
    closeAlert: string;
  };
}

export const INDIAN_LANGUAGES: LanguageMeta[] = [
  { code: 'en', name: 'English', nativeName: 'English', speechCode: 'en-IN' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', speechCode: 'hi-IN' },
  { code: 'mr', name: 'Marathi', nativeName: 'मराठी', speechCode: 'mr-IN' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা', speechCode: 'bn-IN' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు', speechCode: 'te-IN' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்', speechCode: 'ta-IN' },
  { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી', speechCode: 'gu-IN' },
  { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ', speechCode: 'kn-IN' },
  { code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം', speechCode: 'ml-IN' },
  { code: 'pa', name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ', speechCode: 'pa-IN' },
  { code: 'or', name: 'Odia', nativeName: 'ଓଡ଼ିଆ', speechCode: 'or-IN' },
  { code: 'ur', name: 'Urdu', nativeName: 'اردو', speechCode: 'ur-IN' },
  { code: 'as', name: 'Assamese', nativeName: 'অসমীয়া', speechCode: 'as-IN' },
];

export const SPEECH_LANG_MAP: Record<SupportedLanguage, string> = {
  en: 'en-IN',
  hi: 'hi-IN',
  mr: 'mr-IN',
  bn: 'bn-IN',
  te: 'te-IN',
  ta: 'ta-IN',
  gu: 'gu-IN',
  kn: 'kn-IN',
  ml: 'ml-IN',
  pa: 'pa-IN',
  or: 'or-IN',
  ur: 'ur-IN',
  as: 'as-IN',
};

export const NOTIFICATION_TEMPLATES: Record<SupportedLanguage, string> = {
  en: 'Potential danger detected. Review the safety guidance and contact emergency services if you are in immediate danger.',
  hi: 'संभावित खतरे का संकेत मिला है। सुरक्षा संबंधी निर्देश देखें और तत्काल खतरा होने पर आपातकालीन सेवाओं से संपर्क करें।',
  mr: 'संभाव्य धोक्याचे संकेत आढळले आहेत. सुरक्षिततेसाठी दिलेल्या सूचना पाहा आणि तातडीचा धोका असल्यास आपत्कालीन सेवांशी संपर्क साधा.',
  bn: 'সম্ভাব্য বিপদের সংকেত পাওয়া গেছে। নিরাপত্তা নির্দেশাবলী দেখুন এবং অবিলম্বে জরুরি পরিষেবায় যোগাযোগ করুন।',
  te: 'ప్రమాద సూచన గుర్తించబడింది. భద్రతా సూచనలను సమీక్షించండి మరియు అత్యవసర సేవలను సంప్రదించండి.',
  ta: 'ஆபத்து கண்டறியப்பட்டது. பாதுகாப்பு வழிகாட்டுதலைப் பார்த்து அவசர சேவைகளை உடனடியாகத் தொடர்பு கொள்ளவும்.',
  gu: 'સંભવિત જોખમ જણાયું છે. સુરક્ષા માર્ગદર્શિકા જુઓ અને તાત્કાલિક જોખમ હોય તો ઇમરજન્સી સેવાનો સંપર્ક કરો.',
  kn: 'ಸಂಭಾವ್ಯ ಅಪಾಯ ಪತ್ತೆಯಾಗಿದೆ. ಸುರಕ್ಷತಾ ಮಾರ್ಗದರ್ಶನ ಪರಿಶೀಲಿಸಿ ಮತ್ತು ತುರ್ತು ಸೇವೆಗಳನ್ನು ಸಂಪರ್ಕಿಸಿ.',
  ml: 'അപകട മുന്നറിയിപ്പ് കണ്ടെത്തി. സുരക്ഷാ നിർദ്ദേശങ്ങൾ പരിശോധിക്കുക, അടിയന്തര സേവനങ്ങളുമായി ബന്ധപ്പെടുക.',
  pa: 'ਸੰਭਾਵੀ ਖਤਰੇ ਦਾ ਸੰਕੇਤ ਮਿਲਿਆ ਹੈ। ਸੁਰੱਖਿਆ ਨਿਰਦੇਸ਼ ਵੇਖੋ ਅਤੇ ਤੁਰੰਤ ਐਮਰਜੈਂਸੀ ਸੇਵਾਵਾਂ ਨਾਲ ਸੰਪਰਕ ਕਰੋ।',
  or: 'ବିପଦର ସୂଚନା ମିଳିଛି। ସୁରକ୍ଷା ନିର୍ଦ୍ଦେଶାବଳୀ ଦେଖନ୍ତୁ ଏବଂ ତୁରନ୍ତ ଜରୁରୀକାଳୀନ ସେବା ସହିତ ଯୋଗାଯୋଗ କରନ୍ତୁ।',
  ur: 'ممکنہ خطرہ کا اشارہ ملا ہے۔ حفاظتی ہدایات کا جائزہ لیں اور ایمرجنسی سروسز سے رابطہ کریں۔',
  as: 'সম্ভাব্য বিপদৰ সংকেত পোৱা গৈছে। সুৰক্ষা নিৰ্দেশনাৱলী চাওক আৰু জৰুৰীকালীন সেৱাৰ লগত যোগাযোগ কৰক।',
};

// Base English Dictionary
const enDict: TranslationDictionary = {
  appName: 'Emergency Helper India',
  prototypeTag: 'Safety Prototype',
  notDispatcherWarning:
    'Important Safety Notice: This application provides immediate, step-by-step safety guidance and 112 call preparation. It is NOT an emergency dispatcher. Responders are not automatically notified. If life is at risk, call 112 immediately.',
  emergencyCallBtn: 'Call Emergency Services — 112',
  emergencyCallDesc:
    'Direct Dialer: Tapping opens your phone dialer. Actual connection depends on cellular signal and device capabilities. Clicking does not automatically notify responders.',
  helplinesBtn: 'All India Helplines (100, 108...)',
  allIndiaHelplinesTitle: 'Emergency Numbers in India',
  callDialerAlert: 'If the call did not open in your dialer, manually dial 112 on your phone keypad right now.',
  tabs: {
    emergency: 'General Emergency (112)',
    mentalHealth: 'Mental Health (Tele-MANAS)',
    aiChat: 'AI Assistant',
    map: 'Threat & Safe Zone Map',
  },
  form: {
    title: 'Describe What Is Happening',
    subtitle: 'Type or speak in any Indian language, or tap a sample scenario below.',
    quickScenariosLabel: 'Quick Scenarios (Tap to test):',
    placeholder: 'e.g. Road accident at MG Road signal, two people hurt, fire in building, person having trouble breathing...',
    inputLabel: 'What is happening? (Include location & injuries if known)',
    characters: 'characters',
    voiceInput: 'Voice Input',
    voiceListening: 'Listening... (Speak now)',
    addPhoto: 'Add Photo of Scene',
    changePhoto: 'Change Photo',
    addLocation: 'Add GPS Location',
    locating: 'Acquiring GPS...',
    locationAdded: 'Location Attached',
    privacyNote: 'Privacy Notice: Data processed temporarily for safety guidance.',
    submitBtn: 'Assess Situation & Get Immediate Guidance',
    analyzingBtn: 'Evaluating Safety Hazards...',
  },
  scenarios: [
    { label: 'Road Accident', text: 'Car and bike collision at intersection, one rider unconscious with bleeding leg.' },
    { label: 'Chest Pain', text: 'Elderly person clutching chest, sweating heavily, having difficulty breathing.' },
    { label: 'Severe Burn', text: 'Person spilled boiling oil on their arm, skin is blistering and peeling.' },
    { label: 'Flood / Waterlogging', text: 'Rapidly rising water entering ground floor house, electricity is still on.' },
  ],
  results: {
    urgencyTitle: 'Assessed Urgency Level',
    highRiskAlert: 'CRITICAL EMERGENCY: Dial 112 immediately. Follow steps below while waiting.',
    dial112Now: 'Dial 112 Now',
    safetyAssessment: 'Situation Assessment',
    operatorScriptTitle: 'What to Say to 112 Operator (Script)',
    operatorScriptHint: 'Read this summary aloud when emergency operator answers:',
    copySummary: 'Copy Script',
    copiedSummary: 'Copied!',
    readAloud: 'Read Aloud',
    stopReading: 'Stop Reading',
    immediateActionsTitle: 'Immediate Actions — DO THESE NOW',
    avoidActionsTitle: 'Dangerous Mistakes — DO NOT DO THESE',
    missingInfoTitle: 'Information to Gather for Responders',
    demoSimulationsTitle: 'Safety Action Simulations',
    simulateFamily: 'Simulate Family SMS Alert',
    simulateLocation: 'Simulate Location Broadcast',
  },
  notifications: {
    enableBtn: 'Alerts',
    disableBtn: 'Alerts Active',
    title: 'Emergency Safety Alert Notifications',
    explanation: 'Receive high-priority sound and visual alerts when danger or high-urgency conditions are detected.',
    soundToggle: 'Alarm Siren Sound',
    demoTestBtn: 'Send Demo Threat Alert',
    unsupportedBrowser: 'Push notifications are not supported in this browser.',
    permissionDenied: 'Notification permission was denied in browser settings.',
    dangerAlertTitle: '🚨 High Hazard Detected',
    dangerAlertBody: 'Potential danger detected. Review the safety guidance and contact emergency services if you are in immediate danger.',
    aiWarningNotice: 'AI guidance is for informational aid only. Always verify with emergency personnel.',
    closeAlert: 'Dismiss',
  },
};

// Hindi Dictionary
const hiDict: TranslationDictionary = {
  ...enDict,
  appName: 'इमरजेंसी हेल्पर इंडिया',
  prototypeTag: 'सुरक्षा प्रोटोटाइप',
  notDispatcherWarning:
    'महत्वपूर्ण सुरक्षा सूचना: यह ऐप आपातकालीन मार्गदर्शन और 112 कॉल तैयारी प्रदान करता है। यह सरकारी डिस्पैचर नहीं है। जीवन संकट में तुरंत 112 डायल करें।',
  emergencyCallBtn: 'आपातकालीन सेवा कॉल करें — 112',
  emergencyCallDesc: 'डायरेक्ट डायलर: बटन दबाने पर फ़ोन डायलर खुलेगा। उत्तरदाताओं को स्वचालित सूचना नहीं जाती।',
  helplinesBtn: 'अखिल भारतीय हेल्पलाइन (100, 108...)',
  allIndiaHelplinesTitle: 'भारत में आपातकालीन नंबर',
  callDialerAlert: 'यदि डायलर नहीं खुला, तो फ़ोन कीपैड पर 112 डायल करें।',
  tabs: {
    emergency: 'सामान्य आपातकाल (112)',
    mentalHealth: 'मानसिक स्वास्थ्य (टेली-मानस)',
    aiChat: 'एआई सहायक',
    map: 'खतरा व सुरक्षित क्षेत्र मानचित्र',
  },
  form: {
    ...enDict.form,
    title: 'बताएं क्या हुआ है',
    subtitle: 'किसी भी भारतीय भाषा में बोलें या लिखें, या नीचे दिए उदाहरण चुनें।',
    quickScenariosLabel: 'त्वरित परिदृश्य (परीक्षण हेतु टैप करें):',
    placeholder: 'उदा. सड़क दुर्घटना, दो लोग घायल, आग लगी है, सांस लेने में तकलीफ...',
    inputLabel: 'क्या घटना हुई है? (स्थान और चोटें यदि ज्ञात हों)',
    voiceInput: 'बोलकर इनपुट दें',
    voiceListening: 'सुन रहा है... (अब बोलें)',
    addPhoto: 'घटनास्थल की फोटो जोड़ें',
    changePhoto: 'फोटो बदलें',
    addLocation: 'जीपीएस लोकेशन जोड़ें',
    locating: 'लोकेशन खोज रहे हैं...',
    locationAdded: 'लोकेशन जोड़ी गई',
    submitBtn: 'स्थिति का आकलन करें और निर्देश पाएं',
    analyzingBtn: 'सुरक्षा खतरों का मूल्यांकन हो रहा है...',
  },
  scenarios: [
    { label: 'सड़क दुर्घटना', text: 'चौराहे पर कार और बाइक की टक्कर, एक सवार बेहोश और पैर से खून बह रहा है।' },
    { label: 'सीने में दर्द', text: 'बुजुर्ग व्यक्ति को सीने में तेज दर्द, पसीना आ रहा है और सांस लेने में कठिनाई।' },
    { label: 'गंभीर रूप से जलना', text: 'हाथ पर खौलता तेल गिर गया, छाले पड़ गए हैं और त्वचा उतर रही है।' },
    { label: 'बाढ़ / जलभराव', text: 'घर के भूतल में तेजी से पानी घुस रहा है, बिजली अभी भी चालू है।' },
  ],
  results: {
    ...enDict.results,
    urgencyTitle: 'आकलित आपातकालीन स्तर',
    highRiskAlert: 'गंभीर आपातकाल: तुरंत 112 डायल करें। मदद आने तक नीचे दिए निर्देश अपनाएं।',
    dial112Now: 'अभी 112 डायल करें',
    safetyAssessment: 'स्थिति का सुरक्षा आकलन',
    operatorScriptTitle: '112 ऑपरेटर से क्या कहें (स्क्रिप्ट)',
    operatorScriptHint: 'जब ऑपरेटर कॉल उठाए, तो यह पढ़कर बताएं:',
    copySummary: 'स्क्रिप्ट कॉपी करें',
    copiedSummary: 'कॉपी हो गया!',
    readAloud: 'बोलकर सुनाएं',
    stopReading: 'रोकें',
    immediateActionsTitle: 'तत्काल जरूरी कदम — अभी करें',
    avoidActionsTitle: 'खतरनाक गलतियां — यह भूलकर भी न करें',
    missingInfoTitle: 'बचावकर्मियों के लिए जरूरी जानकारी',
  },
  notifications: {
    ...enDict.notifications,
    enableBtn: 'अलर्ट',
    disableBtn: 'अलर्ट सक्रिय',
    title: 'आपातकालीन सुरक्षा अलर्ट',
    dangerAlertTitle: '🚨 गंभीर खतरा पाया गया',
    dangerAlertBody: 'संभावित खतरे का संकेत मिला है। सुरक्षा निर्देश देखें और आपातकालीन सेवाओं से संपर्क करें।',
  },
};

// Marathi Dictionary
const mrDict: TranslationDictionary = {
  ...hiDict,
  appName: 'इमर्जन्सी हेल्पर इंडिया',
  tabs: {
    emergency: 'सामान्य आपत्काल (112)',
    mentalHealth: 'मानसिक आरोग्य (टेली-मानस)',
    aiChat: 'एआय सहाय्यक',
    map: 'धोका व सुरक्षित क्षेत्र नकाशा',
  },
  form: {
    ...hiDict.form,
    title: 'नेमके काय घडले आहे सांगा',
    subtitle: 'कोणत्याही भारतीय भाषेत बोला किंवा लिहा, किंवा खालील उदाहरणे निवडा.',
    placeholder: 'उदा. रस्त्यावर अपघात, दोन जखमी, इमारतीला आग, श्वास घेण्यास त्रास...',
    inputLabel: 'काय घडले आहे? (स्थान आणि दुखापती नमूद करा)',
    voiceInput: 'आवाजाद्वारे सांगा',
    voiceListening: 'ऐकत आहे... (आता बोला)',
    addPhoto: 'घटनास्थळाचा फोटो जोडा',
    addLocation: 'जीपीएस स्थान जोडा',
    submitBtn: 'परिस्थितीचे मूल्यांकन करा आणि मदत मिळवा',
    analyzingBtn: 'धोक्यांचे विश्लेषण सुरू आहे...',
  },
  results: {
    ...hiDict.results,
    urgencyTitle: 'मूल्यांकन केलेली तीव्रता',
    highRiskAlert: 'गंभीर आपत्कालीन स्थिती: ताबडतोब 112 डायल करा.',
    dial112Now: 'आता 112 डायल करा',
    immediateActionsTitle: 'तात्काळ करावयाच्या कृती',
    avoidActionsTitle: 'धोकादायक चुका — हे करू नका',
  },
  notifications: {
    ...hiDict.notifications,
    title: 'आपत्कालीन सुरक्षा सूचना',
    dangerAlertTitle: '🚨 तीव्र धोका आढळला',
    dangerAlertBody: 'संभाव्य धोक्याचे संकेत आढळले आहेत. सूचना पाहा आणि तातडीने 112 डायल करा.',
  },
};

// Bengali Dictionary
const bnDict: TranslationDictionary = {
  ...enDict,
  appName: 'ইমার্জেন্সি হেল্পার ইন্ডিয়া',
  tabs: {
    emergency: 'জরুরি সেবা (১১২)',
    mentalHealth: 'মানসিক স্বাস্থ্য (টেলি-মানস)',
    aiChat: 'এআই সহায়ক',
    map: 'বিপদ ও নিরাপদ অঞ্চল মানচিত্র',
  },
  form: {
    ...enDict.form,
    title: 'কী ঘটেছে বর্ণনা করুন',
    subtitle: 'যেকোনো ভারতীয় ভাষায় বলুন বা লিখুন, অথবা নমুনা পরিস্থিতি নির্বাচন করুন।',
    placeholder: 'যেমন: রাস্তায় দুর্ঘটনা, আহত ব্যক্তি, ভবনে আগুন, শ্বাসকষ্ট...',
    voiceInput: 'ভয়েস ইনপুট',
    voiceListening: 'শুনছি... (এখন বলুন)',
    submitBtn: 'পরিস্থিতি মূল্যায়ন ও তাৎক্ষণিক নির্দেশনা পান',
  },
  results: {
    ...enDict.results,
    urgencyTitle: 'জরুরি মাত্রার মূল্যায়ন',
    highRiskAlert: 'সংকটজনক পরিস্থিতি: অবিলম্বে ১১২ নম্বরে কল করুন।',
    dial112Now: 'এখনই ১১২ ডায়াল করুন',
    immediateActionsTitle: 'তাৎক্ষণিক করণীয় পদক্ষেপ',
    avoidActionsTitle: 'যেসব কাজ একদম করবেন না',
  },
};

// Tamil Dictionary
const taDict: TranslationDictionary = {
  ...enDict,
  appName: 'எமர்ஜென்சி ஹெல்பர் இந்தியா',
  tabs: {
    emergency: 'அவசர உதவி (112)',
    mentalHealth: 'மனநலம் (டெலி-மானஸ்)',
    aiChat: 'AI உதவியாளர்',
    map: 'ஆபத்து மற்றும் பாதுகாப்பு மண்டல வரைபடம்',
  },
  form: {
    ...enDict.form,
    title: 'என்ன நடந்தது என்பதை விவரிக்கவும்',
    subtitle: 'எந்த இந்திய மொழியிலும் பேசலாம் அல்லது எழுதலாம்.',
    placeholder: 'எ.கா: சாலை விபத்து, காயம், கட்டிடத்தில் தீ, மூச்சுத்திணறல்...',
    voiceInput: 'குரல் உள்ளீடு',
    voiceListening: 'கேட்கிறது... (இப்போது பேசுங்கள்)',
    submitBtn: 'மதிப்பீடு செய்து வழிகாட்டுதலைப் பெறுக',
  },
  results: {
    ...enDict.results,
    urgencyTitle: 'அவசர நிலை மதிப்பீடு',
    highRiskAlert: 'அவசர நிலை: உடனடியாக 112 ஐ டயல் செய்யவும்.',
    dial112Now: 'இப்போதே 112 ஐ டயல் செய்யுங்கள்',
    immediateActionsTitle: 'உடனடி நடவடிக்கைகள் — இப்போது செய்யுங்கள்',
    avoidActionsTitle: 'செய்யக்கூடாத தவறுகள்',
  },
};

// Telugu Dictionary
const teDict: TranslationDictionary = {
  ...enDict,
  appName: 'ఎమర్జెన్సీ హెల్పర్ ఇండియా',
  tabs: {
    emergency: 'అత్యవసర సేవలు (112)',
    mentalHealth: 'మానసిక ఆరోగ్యం (టెలీ-మానస్)',
    aiChat: 'AI సహాయకుడు',
    map: 'ప్రమాద & సురక్షిత ప్రాంతాల మ్యాప్',
  },
  form: {
    ...enDict.form,
    title: 'ఏమి జరిగిందో వివరించండి',
    subtitle: 'ఏదైనా భారతీయ భాషలో మాట్లాడండి లేదా టైప్ చేయండి.',
    placeholder: 'ఉదా: రోడ్డు ప్రమాదం, గాయాలు, అగ్నిప్రమాదం, శ్వాస తీసుకోవడంలో ఇబ్బంది...',
    voiceInput: 'వాయిస్ ఇన్‌పుట్',
    voiceListening: 'వింటోంది... (ఇప్పుడు మాట్లాడండి)',
    submitBtn: 'పరిస్థితిని అంచనా వేసి మార్గదర్శకత్వం పొందండి',
  },
  results: {
    ...enDict.results,
    urgencyTitle: 'అత్యవసర స్థాయి అంచనా',
    highRiskAlert: 'తీవ్రమైన ప్రమాదం: వెంటనే 112 కు డయల్ చేయండి.',
    dial112Now: 'ఇప్పుడే 112 కి డయల్ చేయండి',
    immediateActionsTitle: 'వెంటనే చేయవలసిన చర్యలు',
    avoidActionsTitle: 'చేయకూడని ప్రమాదకరమైన పనులు',
  },
};

// Gujarati Dictionary
const guDict: TranslationDictionary = {
  ...enDict,
  appName: 'ઇમરજન્સી હેલ્પર ઇન્ડિયા',
  tabs: {
    emergency: 'સામાન્ય ઇમરજન્સી (112)',
    mentalHealth: 'માનસિક સ્વાસ્થ્ય (ટેલિ-માનસ)',
    aiChat: 'AI સહાયક',
    map: 'જોખમ અને સુરક્ષિત ક્ષેત્ર નકશો',
  },
  form: {
    ...enDict.form,
    title: 'શું બન્યું છે તે જણાવો',
    subtitle: 'કોઈપણ ભારતીય ભાષામાં બોલો અથવા ટાઈપ કરો.',
    placeholder: 'દા.ત. માર્ગ અકસ્માત, આગ, શ્વાસ લેવામાં તકલીફ...',
    voiceInput: 'અવાજ દ્વારા ઇનપુટ',
    voiceListening: 'સાંભળી રહ્યું છે... (હવે બોલો)',
    submitBtn: 'સ્થિતિનું મૂલ્યાંકન કરો અને માર્ગદર્શન મેળવો',
  },
  results: {
    ...enDict.results,
    urgencyTitle: 'ઇમરજન્સી સ્તર મૂલ્યાંકન',
    highRiskAlert: 'ગંભીર ઇમરજન્સી: તરત જ 112 ડાયલ કરો.',
    dial112Now: 'હમણાં જ 112 ડાયલ કરો',
    immediateActionsTitle: 'તાત્કાલિક લેવાના પગલાં',
    avoidActionsTitle: 'આ ભૂલો ક્યારેય ન કરો',
  },
};

// Kannada Dictionary
const knDict: TranslationDictionary = {
  ...enDict,
  appName: 'ಎಮರ್ಜೆನ್ಸಿ ಹೆಲ್ಪರ್ ಇಂಡಿಯಾ',
  tabs: {
    emergency: 'ತುರ್ತು ಸೇವೆ (112)',
    mentalHealth: 'ಮಾನಸಿಕ ಆರೋಗ್ಯ (ಟೆಲಿ-ಮಾನಸ್)',
    aiChat: 'AI ಸಹಾಯಕ',
    map: 'ಅಪಾಯ ಮತ್ತು ಸುರಕ್ಷಿತ ವಲಯ ನಕ್ಷೆ',
  },
  form: {
    ...enDict.form,
    title: 'ಏನು ಸಂಭವಿಸಿದೆ ಎಂದು ವಿವರಿಸಿ',
    subtitle: 'ಯಾವುದೇ ಭಾರತೀಯ ಭಾಷೆಯಲ್ಲಿ ಮಾತನಾಡಿ ಅಥವಾ ಬರೆಯಿರಿ.',
    placeholder: 'ಉದಾ: ರಸ್ತೆ ಅಪಘಾತ, ಬೆಂಕಿ ಅವಘಡ, ಉಸಿರಾಟದ ತೊಂದರೆ...',
    voiceInput: 'ಧ್ವನಿ ಇನ್‌ಪುಟ್',
    voiceListening: 'ಕೇಳುತ್ತಿದೆ... (ಈಗ ಮಾತನಾಡಿ)',
    submitBtn: 'ಪರಿಸ್ಥಿತಿ ಮೌಲ್ಯಮಾಪನ ಮಾಡಿ ಮತ್ತು ಮಾರ್ಗದರ್ಶನ ಪಡೆಯಿರಿ',
  },
  results: {
    ...enDict.results,
    urgencyTitle: 'ತುರ್ತು ಮಟ್ಟದ ಮೌಲ್ಯಮಾಪನ',
    highRiskAlert: 'ತೀವ್ರ ತುರ್ತು ಪರಿಸ್ಥಿತಿ: ತಕ್ಷಣ 112 ಗೆ ಡಯಲ್ ಮಾಡಿ.',
    dial112Now: 'ಈಗಲೇ 112 ಡಯಲ್ ಮಾಡಿ',
  },
};

// Malayalam Dictionary
const mlDict: TranslationDictionary = {
  ...enDict,
  appName: 'എമർജൻസി ഹെൽപ്പർ ഇന്ത്യ',
  tabs: {
    emergency: 'അടിയന്തര സഹായം (112)',
    mentalHealth: 'മാനസികാരോഗ്യം (ടെലി-മാനസ്)',
    aiChat: 'AI സഹായി',
    map: 'അപകട മേഖല & സുരക്ഷിത മാപ്പ്',
  },
  form: {
    ...enDict.form,
    title: 'എന്താണ് സംഭവിച്ചതെന്ന് വിവരിക്കുക',
    subtitle: 'ഏത് ഇന്ത്യൻ ഭാഷയിലും സംസാരിക്കുകയോ ടൈപ്പ് ചെയ്യുകയോ ചെയ്യാം.',
    placeholder: 'ഉദാ: റോഡപകടം, തീപിടുത്തം, ശ്വാസതടസ്സം...',
    voiceInput: 'വോയ്‌സ് ഇൻപുട്ട്',
    voiceListening: 'കേൾക്കുന്നു... (ഇപ്പോൾ സംസാരിക്കുക)',
    submitBtn: 'സ്ഥിതിഗതികൾ വിലയിരുത്തി മാർഗ്ഗനിർദ്ദേശം നേടുക',
  },
  results: {
    ...enDict.results,
    urgencyTitle: 'അടിയന്തര നിലയുടെ വിലയിരുത്തൽ',
    highRiskAlert: 'ഗുരുതരമായ അടിയന്തരാവസ്ഥ: ഉടൻ 112 ഡയൽ ചെയ്യുക.',
    dial112Now: 'ഇപ്പോൾ 112 ഡയൽ ചെയ്യുക',
  },
};

// Punjabi Dictionary
const paDict: TranslationDictionary = {
  ...enDict,
  appName: 'ਐਮਰਜੈਂਸੀ ਹੈਲਪਰ ਇੰਡੀਆ',
  tabs: {
    emergency: 'ਐਮਰਜੈਂਸੀ ਸੇਵਾ (112)',
    mentalHealth: 'ਮਾਨਸਿਕ ਸਿਹਤ (ਟੈਲੀ-ਮਾਨਸ)',
    aiChat: 'AI ਸਹਾਇਕ',
    map: 'ਖ਼ਤਰਾ ਅਤੇ ਸੁਰੱਖਿਅਤ ਜ਼ੋਨ ਨਕਸ਼ਾ',
  },
  form: {
    ...enDict.form,
    title: 'ਦੱਸੋ ਕੀ ਹੋਇਆ ਹੈ',
    subtitle: 'ਕਿਸੇ ਵੀ ਭਾਰਤੀ ਭਾਸ਼ਾ ਵਿੱਚ ਬੋਲੋ ਜਾਂ ਲਿਖੋ।',
    placeholder: 'ਜਿਵੇਂ ਸੜਕ ਹਾਦਸਾ, ਅੱਗ ਲੱਗਣਾ, ਸਾਹ ਲੈਣ ਵਿੱਚ ਤਕਲੀਫ...',
    voiceInput: 'ਆਵਾਜ਼ ਰਾਹੀਂ ਇਨਪੁਟ',
    voiceListening: 'ਸੁਣ ਰਿਹਾ ਹੈ... (ਹੁਣ ਬੋਲੋ)',
    submitBtn: 'ਸਥਿਤੀ ਦਾ ਜਾਇਜ਼ਾ ਲਓ ਅਤੇ ਮਦਦ ਪਾਓ',
  },
  results: {
    ...enDict.results,
    urgencyTitle: 'ਐਮਰਜੈਂਸੀ ਪੱਧਰ ਦਾ ਮੁਲਾਂਕਣ',
    highRiskAlert: 'ਗੰਭੀਰ ਖਤਰਾ: ਤੁਰੰਤ 112 ਡਾਇਲ ਕਰੋ।',
    dial112Now: 'ਹੁਣੇ 112 ਡਾਇਲ ਕਰੋ',
  },
};

// Odia Dictionary
const orDict: TranslationDictionary = {
  ...enDict,
  appName: 'ଇମରଜେନ୍ସି ହେଲ୍ପର ଇଣ୍ଡିଆ',
  tabs: {
    emergency: 'ଜରୁରୀକାଳୀନ ସେବା (୧୧୨)',
    mentalHealth: 'ମାନସିକ ସ୍ୱାସ୍ଥ୍ୟ (ଟେଲି-ମାନସ)',
    aiChat: 'AI ସହାୟକ',
    map: 'ବିପଦ ଓ ସୁରକ୍ଷିତ କ୍ଷେତ୍ର ମାନଚିତ୍ର',
  },
  form: {
    ...enDict.form,
    title: 'କ’ଣ ଘଟିଛି ବର୍ଣ୍ଣନା କରନ୍ତୁ',
    subtitle: 'ଯେକୌଣସି ଭାରତୀୟ ଭାଷାରେ କୁହନ୍ତୁ କିମ୍ବା ଲେଖନ୍ତୁ।',
    placeholder: 'ଯଥା: ଦୁର୍ଘଟଣା, ନିଆଁ ଲାଗିବା, ଶ୍ୱାସକ୍ରିୟାରେ କଷ୍ଟ...',
    voiceInput: 'ଭଏସ୍ ଇନପୁଟ୍',
    voiceListening: 'ଶୁଣୁଛି... (ବର୍ତ୍ତମାନ କୁହନ୍ତୁ)',
    submitBtn: 'ସ୍ଥିତି ଆକଳନ କରନ୍ତୁ ଓ ନିର୍ଦ୍ଦେଶ ପାଆନ୍ତୁ',
  },
  results: {
    ...enDict.results,
    urgencyTitle: 'ଜରୁରୀକାଳୀନ ସ୍ଥିତି ଆକଳନ',
    highRiskAlert: 'ଗୁରୁତର ଜରୁରୀକାଳୀନ: ତୁରନ୍ତ ୧୧୨ ଡାଏଲ କରନ୍ତୁ।',
    dial112Now: 'ଏବେ ୧୧୨ ଡାଏଲ କରନ୍ତୁ',
  },
};

// Urdu Dictionary
const urDict: TranslationDictionary = {
  ...enDict,
  appName: 'ایمرجنسی ہیلپر انڈیا',
  tabs: {
    emergency: 'ایمرجنسی سروسز (112)',
    mentalHealth: 'ذہنی صحت (ٹیلی مانس)',
    aiChat: 'AI معاون',
    map: 'خطرہ اور محفوظ زون نقشہ',
  },
  form: {
    ...enDict.form,
    title: 'بتائیں کیا ہوا ہے',
    subtitle: 'کسی بھی ہندوستانی زبان میں بولیں یا لکھیں۔',
    placeholder: 'مثلاً: سڑک حادثہ، آگ لگنا، سانس لینے میں دشواری...',
    voiceInput: 'آواز سے ان پٹ',
    voiceListening: 'سن رہا ہے... (اب بولیں)',
    submitBtn: 'صورتحال کا جائزہ لیں اور رہنمائی حاصل کریں',
  },
  results: {
    ...enDict.results,
    urgencyTitle: 'ایمرجنسی سطح کا اندازہ',
    highRiskAlert: 'انتہائی سنگین ایمرجنسی: فوراً 112 پر کال کریں۔',
    dial112Now: 'ابھی 112 ڈائل کریں',
  },
};

// Assamese Dictionary
const asDict: TranslationDictionary = {
  ...enDict,
  appName: 'ইমাৰ্জেন্সি হেল্পাৰ ইণ্ডিয়া',
  tabs: {
    emergency: 'জৰুৰীকালীন সেৱা (১১২)',
    mentalHealth: 'মানসিক স্বাস্থ্য (টেলি-মানস)',
    aiChat: 'AI সহায়ক',
    map: 'বিপদ আৰু সুৰক্ষিত অঞ্চল মেপ',
  },
  form: {
    ...enDict.form,
    title: 'কি হৈছে বৰ্ণনা কৰক',
    subtitle: 'যিকোনো ভাৰতীয় ভাষাত কওক বা লিখক।',
    placeholder: 'যেনে: দুৰ্ঘটনা, জুই লগা, উশাহ-নিশাহৰ সমস্যা...',
    voiceInput: 'ভইচ ইনপুট',
    voiceListening: 'শুনি আছো... (এতিয়া কওক)',
    submitBtn: 'পৰিস্থিতি মূল্যাংকন কৰক আৰু নিৰ্দেশনা পাওক',
  },
  results: {
    ...enDict.results,
    urgencyTitle: 'জৰুৰীকালীন মূল্যাংকন',
    highRiskAlert: 'গুৰুতৰ বিপদ: তৎকালীনভাৱে ১১২ ত কল কৰক।',
    dial112Now: 'এতিয়াই ১১২ ডায়েল কৰক',
  },
};

export const TRANSLATIONS: Record<SupportedLanguage, TranslationDictionary> = {
  en: enDict,
  hi: hiDict,
  mr: mrDict,
  bn: bnDict,
  te: teDict,
  ta: taDict,
  gu: guDict,
  kn: knDict,
  ml: mlDict,
  pa: paDict,
  or: orDict,
  ur: urDict,
  as: asDict,
};
