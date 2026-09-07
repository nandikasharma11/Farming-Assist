export type SupportedLanguage = 'en' | 'hi' | 'mr' | 'te' | 'pa' | 'gu';

export interface LanguageOption {
  code: SupportedLanguage;
  name: string;
  nativeName: string;
}

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी' },
  { code: 'mr', name: 'Marathi', nativeName: 'मराठी' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు' },
  { code: 'pa', name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ' },
  { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી' },
];

export const translations: Record<SupportedLanguage, Record<string, string>> = {
  en: {
    // Brand
    brand_name: 'Krishi-Khata 2.0',
    brand_subtitle: 'Next-Gen Agritech OS',
    initializing: 'Initializing Krishi-Khata 2.0 Operating System...',

    // Nav
    nav_dashboard: 'Dashboard',
    nav_drone: 'Drone Studio',
    nav_khata: 'Farm Khata',
    nav_market: 'Mandi & Weather',
    logout: 'Logout',

    // Dashboard
    dash_title: 'Agro Operating Command Center',
    dash_desc: 'Real-time crop thermal accumulation, drone health scans, and double-entry farm financial summary.',
    sync_live: 'Sync Live Data',
    launch_drone: 'Launch Drone Studio',
    stat_crop: 'Cultivated Crop',
    stat_acres: 'Total Farm Acreage',
    stat_gdd: 'Cumulative Thermal GDD',
    stat_profit: 'Ledger Net Profit',
    growth_meter: 'Physiological Growth Meter (GDD)',
    growth_sub: 'Open-Meteo temperature integration from sowing date',
    update_gdd: 'Update GDD',
    weather_title: 'Agricultural Weather & Spray Conditions',
    weather_sub: 'Hyper-local agrochemical drift and wash-off risk assessment',
    view_7day: 'View 7-Day Forecast & APMC Mandi Rates',

    // Spray status
    spray_optimal: 'Optimal Spray Window',
    spray_wind: 'Caution: Wind Drift',
    spray_rain: 'No Spray: Wash-off Risk',
    spray_evening: 'Evening Spray Recommended',

    // Drone Studio
    drone_title: 'Autonomous Drone Studio & Multimodal AI Doctor',
    drone_desc: 'Aerial leaf lesion detection, severity quantification, and organic/chemical prescription generator.',
    start_flight: 'Initiate Drone Flight Mission',
    end_flight: 'End Mission',
    flight_active: 'Flight Active',
    target_crop: 'Target Crop',
    radar_title: 'Aerial Radar & Frame Capture',
    load_samples: 'Load Sample Aerial Drone Captures:',
    sample_blight: 'Foliar Blight',
    sample_mildew: 'Powdery Mildew',
    sample_healthy: 'Healthy Leaf',
    upload_frame: 'Upload aerial drone photo or drag & drop',
    upload_sub: 'JPEG, PNG up to 25MB • Automated Telemetry Extraction',
    analyze_btn: 'Analyze Frame with Vision AI Doctor',
    analyzing_btn: 'Ingesting & Analyzing Lesions with AI...',
    diag_title: 'Plant Pathology Diagnosis',
    organic_tab: '🌿 Organic / Bio-Remedy',
    chemical_tab: '🧪 Agrochemical Formulation',
    protocol_7day: '7-Day Preventive Protocol',
    flight_logs: 'Aerial Telemetry & Pathology Flight Logs',

    // Khata
    khata_title: 'Smart Farm Ledger (Khata) & Labor Payroll',
    khata_desc: 'Double-entry agricultural bookkeeping, labor wage settlement, and Kisan Credit Card compliance.',
    record_entry: 'Record Entry',
    log_labor: 'Log Labor',
    kcc_appraisal: 'KCC Bank Appraisal',
    total_rev: 'Total Revenue / Income',
    op_expenses: 'Operational Expenses',
    net_surplus: 'Net Farm Surplus',
    tx_log: 'Financial Transactions Log',
    labor_ledger: 'Labor Sub-Ledger & Daily Wage Settlements',
    settle_bal: 'Settle Balance',

    // Mandi & Weather
    mandi_title: 'Mandi Market Intelligence & Spray Weather Hub',
    mandi_desc: 'Live APMC commodity price discovery, MSP comparisons, and 7-day agricultural weather forecast.',
    spray_7day: '7-Day Agricultural Spray Feasibility Forecast',
    mandi_benchmarks: 'Live APMC Mandi Price Benchmarks',
    search_placeholder: 'Search Cotton, Wheat...',

    // Theme & Lang
    theme_light: 'Light Mode',
    theme_dark: 'Dark Mode',
    select_language: 'Language',
  },

  hi: {
    // Brand
    brand_name: 'कृषि-खाता 2.0',
    brand_subtitle: 'नेक्स्ट-जेन कृषि ऑपरेटिंग सिस्टम',
    initializing: 'कृषि-खाता 2.0 ऑपरेटिंग सिस्टम लोड हो रहा है...',

    // Nav
    nav_dashboard: 'डैशबोर्ड',
    nav_drone: 'ड्रोन स्टूडियो',
    nav_khata: 'कृषि खाता',
    nav_market: 'मंडी व मौसम',
    logout: 'लॉगआउट',

    // Dashboard
    dash_title: 'कृषि परिचालन कमान केंद्र',
    dash_desc: 'वास्तविक समय में फसल थर्मल वृद्धि (GDD), ड्रोन स्वास्थ्य जांच और वित्तीय बही-खाता सारांश।',
    sync_live: 'डेटा रिफ्रेश करें',
    launch_drone: 'ड्रोन स्टूडियो खोलें',
    stat_crop: 'मुख्य फसल',
    stat_acres: 'कुल रकबा (एकड़)',
    stat_gdd: 'संचयी थर्मल GDD',
    stat_profit: 'खाता शुद्ध लाभ',
    growth_meter: 'फसल विकास मीटर (GDD)',
    growth_sub: 'बुवाई तिथि से ओपन-मेटियो तापमान गणना',
    update_gdd: 'GDD अपडेट करें',
    weather_title: 'कृषि मौसम एवं छिड़काव स्थिति',
    weather_sub: 'कीटनाशक व खाद छिड़काव हेतु हवा की गति व बारिश का पूर्वानुमान',
    view_7day: '7-दिवसीय मौसम व मंडी भाव देखें',

    // Spray status
    spray_optimal: 'छिड़काव के लिए उत्तम समय',
    spray_wind: 'सावधानी: तेज हवा से बहाव',
    spray_rain: 'छिड़काव न करें: बारिश का खतरा',
    spray_evening: 'शाम को छिड़काव करें',

    // Drone Studio
    drone_title: 'स्वायत्त ड्रोन स्टूडियो एवं मल्टीमॉडल एआई डॉक्टर',
    drone_desc: 'पत्तियों के रोगों की पहचान, गंभीरता का आकलन और जैविक/रासायनिक उपचार नुस्खा।',
    start_flight: 'ड्रोन उड़ान मिशन शुरू करें',
    end_flight: 'मिशन समाप्त करें',
    flight_active: 'उड़ान सक्रिय',
    target_crop: 'लक्षित फसल',
    radar_title: 'हवाई रडार एवं छवि ग्रहण',
    load_samples: 'नमूना ड्रोन तस्वीरें लोड करें:',
    sample_blight: 'पत्ती झुलसा रोग',
    sample_mildew: 'पाउडरी फफूंद',
    sample_healthy: 'स्वस्थ पत्ती',
    upload_frame: 'ड्रोन की तस्वीर अपलोड करें या खींचें',
    upload_sub: 'JPEG, PNG 25MB तक • स्वचालित टेलीमेट्री निष्कर्षण',
    analyze_btn: 'एआई फसल डॉक्टर से जांच करें',
    analyzing_btn: 'एआई द्वारा रोग का विश्लेषण जारी है...',
    diag_title: 'पादप रोग निदान परिणाम',
    organic_tab: '🌿 जैविक उपचार',
    chemical_tab: '🧪 रासायनिक उपचार',
    protocol_7day: '7-दिवसीय रोकथाम प्रोटोकॉल',
    flight_logs: 'ड्रोन उड़ान एवं रोग निदान रिकॉर्ड',

    // Khata
    khata_title: 'स्मार्ट कृषि खाता एवं मजदूरी बही',
    khata_desc: 'दोहरी प्रविष्टि बहीखाता, मजदूर दैनिक मजदूरी हिसाब और किसान क्रेडिट कार्ड (KCC) रिपोर्ट।',
    record_entry: 'प्रविष्टि जोड़ें',
    log_labor: 'मजदूर जोड़ें',
    kcc_appraisal: 'केसीसी बैंक मूल्यांकन',
    total_rev: 'कुल आमदनी',
    op_expenses: 'खेती खर्च',
    net_surplus: 'शुद्ध मुनाफा',
    tx_log: 'वित्तीय लेन-देन बहीखाता',
    labor_ledger: 'मजदूर दैनिक मजदूरी हिसाब',
    settle_bal: 'हिसाब चुकता करें',

    // Mandi & Weather
    mandi_title: 'मंडी भाव सूचना एवं छिड़काव मौसम केंद्र',
    mandi_desc: 'लाइव एपीएमसी मंडी भाव, एमएसपी तुलना और 7-दिवसीय कृषि मौसम पूर्वानुमान।',
    spray_7day: '7-दिवसीय कृषि छिड़काव मौसम पूर्वानुमान',
    mandi_benchmarks: 'लाइव एपीएमसी मंडी भाव',
    search_placeholder: 'कपास, गेहूं खोजें...',

    // Theme & Lang
    theme_light: 'लाइट मोड',
    theme_dark: 'डार्क मोड',
    select_language: 'भाषा',
  },

  mr: {
    // Brand
    brand_name: 'कृषी-खाते 2.0',
    brand_subtitle: 'पुढील पिढीचे कृषी ऑपरेटिंग सिस्टीम',
    initializing: 'कृषी-खाते 2.0 सिस्टीम सुरू होत आहे...',

    // Nav
    nav_dashboard: 'डॅशबोर्ड',
    nav_drone: 'ड्रोन स्टुडिओ',
    nav_khata: 'शेत खाते',
    nav_market: 'बाजार व हवामान',
    logout: 'बाहेर पडा',

    // Dashboard
    dash_title: 'शेत व्यवस्थापन नियंत्रण केंद्र',
    dash_desc: 'पिकांची वाढ (GDD), ड्रोन तपासणी आणि दुहेरी नोंद आर्थिक नफा-तोटा तपशील.',
    sync_live: 'डेटा अपडेट करा',
    launch_drone: 'ड्रोन स्टुडिओ उघडा',
    stat_crop: 'लागवड केलेले पीक',
    stat_acres: 'एकूण शेत जमीन (एकर)',
    stat_gdd: 'एकूण संचित GDD',
    stat_profit: 'खाते निव्वळ नफा',
    growth_meter: 'पीक वाढ मोजमाप मीटर (GDD)',
    growth_sub: 'पेरणीच्या तारखेपासून तापमान विश्लेषण',
    update_gdd: 'GDD अपडेट करा',
    weather_title: 'कृषी हवामान व फवारणी सल्ला',
    weather_sub: 'कीटकनाशक फवारणीसाठी योग्य वारा आणि पावसाचा अंदाज',
    view_7day: '7 दिवसांचा अंदाज व बाजारभाव पहा',

    // Spray status
    spray_optimal: 'फवारणीसाठी उत्तम वेळ',
    spray_wind: 'सावधान: जास्त वाऱ्याचा धोका',
    spray_rain: 'फवारणी करू नका: पावसाचा धोका',
    spray_evening: 'संध्याकाळी फवारणी करा',

    // Drone Studio
    drone_title: 'ड्रोन स्टुडिओ आणि एआय पीक डॉक्टर',
    drone_desc: 'पानांवरील रोगांची अचूक ओळख आणि सेंद्रिय/रासायनिक उपाययोजना.',
    start_flight: 'ड्रोन मोहीम सुरू करा',
    end_flight: 'मोहीम समाप्त करा',
    flight_active: 'मोहीम सुरू आहे',
    target_crop: 'निवडलेले पीक',
    radar_title: 'हवाई रडार व फोटो तपासणी',
    load_samples: 'नमुना ड्रोन फोटो पहा:',
    sample_blight: 'करपा रोग',
    sample_mildew: 'भुरी रोग',
    sample_healthy: 'निरोगी पान',
    upload_frame: 'ड्रोन फोटो अपलोड करा',
    upload_sub: 'JPEG, PNG कमाल 25MB',
    analyze_btn: 'एआय डॉक्टरद्वारे तपासणी करा',
    analyzing_btn: 'तपासणी सुरू आहे...',
    diag_title: 'रोग निदान व उपाय',
    organic_tab: '🌿 सेंद्रिय उपाय',
    chemical_tab: '🧪 रासायनिक उपाय',
    protocol_7day: '७ दिवसांचे प्रतिबंधात्मक नियोजन',
    flight_logs: 'ड्रोन तपासणी नोंदी',

    // Khata
    khata_title: 'स्मार्ट शेत खाते व मजुरी नोंदवही',
    khata_desc: 'शेती जमा-खर्च हिशोब, मजुरी वाटप आणि केसीसी बँक मूल्यांकन.',
    record_entry: 'खर्च/जमा नोंदवा',
    log_labor: 'मजूर नोंदवा',
    kcc_appraisal: 'केसीसी बँक मूल्यांकन',
    total_rev: 'एकूण उत्पन्न',
    op_expenses: 'एकूण खर्च',
    net_surplus: 'निव्वळ नफा',
    tx_log: 'आर्थिक व्यवहारांची नोंदवही',
    labor_ledger: 'मजुरी हिशोब वही',
    settle_bal: 'हिशोब पूर्ण करा',

    // Mandi & Weather
    mandi_title: 'बाजारभाव माहिती व फवारणी केंद्र',
    mandi_desc: 'थेट बाजारभाव, हमीभाव तुलना आणि ७ दिवसांचा हवामान अंदाज.',
    spray_7day: '७ दिवसांचा कृषी फवारणी अंदाज',
    mandi_benchmarks: 'थेट कृषी उत्पन्न बाजारभाव',
    search_placeholder: 'कापूस, सोयाबीन शोधा...',

    // Theme & Lang
    theme_light: 'लाइट मोड',
    theme_dark: 'डार्क मोड',
    select_language: 'भाषा',
  },

  te: {
    // Brand
    brand_name: 'కృషి-ఖాతా 2.0',
    brand_subtitle: 'తదుపరి తరం వ్యవసాయ నిర్వహణ వ్యవస్థ',
    initializing: 'కృషి-ఖాతా 2.0 ప్రారంభమవుతోంది...',

    // Nav
    nav_dashboard: 'డాష్‌బోర్డ్',
    nav_drone: 'డ్రోన్ స్టూడియో',
    nav_khata: 'వ్యవసాయ ఖాతా',
    nav_market: 'మార్కెట్ & వాతావరణం',
    logout: 'లాగౌట్',

    // Dashboard
    dash_title: 'వ్యవసాయ కమాండ్ సెంటర్',
    dash_desc: 'నిజ-సమయ పంట ఉష్ణోగ్రత పెరుగుదల (GDD), డ్రోన్ పరీక్ష మరియు ఆర్థిక లాభనష్టాలు.',
    sync_live: 'డేటా రిఫ్రెష్ చేయండి',
    launch_drone: 'డ్రోన్ స్టూడియో ప్రారంభించండి',
    stat_crop: 'సాగు పంట',
    stat_acres: 'మొత్తం ఎకరాలు',
    stat_gdd: 'థర్మల్ GDD',
    stat_profit: 'ఖాతా నికర లాభం',
    growth_meter: 'పంట పెరుగుదల మీటర్ (GDD)',
    growth_sub: 'విత్తిన తేదీ నుండి ఉష్ణోగ్రత విశ్లేషణ',
    update_gdd: 'GDD నవీకరించండి',
    weather_title: 'వ్యవసాయ వాతావరణం & స్ప్రే సలహా',
    weather_sub: 'పురుగుమందుల స్ప్రే కోసం అనుకూల సమయం',
    view_7day: '7 రోజుల వాతావరణం & ధరలు చూడండి',

    // Spray status
    spray_optimal: 'స్ప్రేకి అనుకూలమైన సమయం',
    spray_wind: 'హెచ్చరిక: గాలి వేగం ఎక్కువ',
    spray_rain: 'స్ప్రే చేయవద్దు: వర్షం ప్రమాదం',
    spray_evening: 'సాయంత్రం స్ప్రే చేయండి',

    // Drone Studio
    drone_title: 'డ్రోన్ స్టూడియో & ఏఐ క్రాప్ డాక్టర్',
    drone_desc: 'ఆకులపై తెగుళ్ల గుర్తింపు మరియు సేంద్రీయ/రసాయన నివారణలు.',
    start_flight: 'డ్రోన్ ఫ్లైట్ ప్రారంభించండి',
    end_flight: 'మిషన్ ముగించండి',
    flight_active: 'ఫ్లైట్ యాక్టివ్',
    target_crop: 'లక్ష్య పంట',
    radar_title: 'ఏరియల్ రాడార్ & ఇమేజ్ క్యాప్చర్',
    load_samples: 'నమూనా చిత్రాలు:',
    sample_blight: 'ఆకు మచ్చ తెగులు',
    sample_mildew: 'బూడిద తెగులు',
    sample_healthy: 'ఆరోగ్యకరమైన ఆకు',
    upload_frame: 'డ్రోన్ ఫోటో అప్‌లోడ్ చేయండి',
    upload_sub: 'గరిష్టంగా 25MB వరకు JPEG, PNG',
    analyze_btn: 'ఏఐ డాక్టర్‌తో పరీక్షించండి',
    analyzing_btn: 'విశ్లేషిస్తోంది...',
    diag_title: 'వ్యాధి నిర్ధారణ & చికిత్స',
    organic_tab: '🌿 సేంద్రీయ నివారణ',
    chemical_tab: '🧪 రసాయన మందులు',
    protocol_7day: '7 రోజుల నివారణ ప్రణాళిక',
    flight_logs: 'డ్రోన్ ఫ్లైట్ లాగ్‌లు',

    // Khata
    khata_title: 'స్మార్ట్ ఫార్మ్ లెడ్జర్ & కూలీల ఖర్చులు',
    khata_desc: 'ఖర్చులు, ఆదాయాలు మరియు కిసాన్ క్రెడిట్ కార్డ్ (KCC) నివేదిక.',
    record_entry: 'ఎంట్రీ నమోదు చేయండి',
    log_labor: 'కూలీలను నమోదు చేయండి',
    kcc_appraisal: 'కేసీసీ బ్యాంక్ రిపోర్ట్',
    total_rev: 'మొత్తం ఆదాయం',
    op_expenses: 'మొత్తం ఖర్చులు',
    net_surplus: 'నికర లాభం',
    tx_log: 'ఆర్థిక లావాదేవీల చిట్టా',
    labor_ledger: 'కూలీల చెల్లింపుల ఖాతా',
    settle_bal: 'పూర్తి చెల్లింపు',

    // Mandi & Weather
    mandi_title: 'మార్కెట్ ధరలు & వాతావరణం',
    mandi_desc: 'ప్రత్యక్ష మార్కెట్ ధరలు మరియు 7 రోజుల వాతావరణ సమాచారం.',
    spray_7day: '7 రోజుల స్ప్రే సాధ్యత అంచనా',
    mandi_benchmarks: 'లైవ్ మార్కెట్ ధరలు',
    search_placeholder: 'పత్తి, వరి శోధించండి...',

    // Theme & Lang
    theme_light: 'లైట్ మోడ్',
    theme_dark: 'డార్క్ మోడ్',
    select_language: 'భాష',
  },

  pa: {
    // Brand
    brand_name: 'ਕ੍ਰਿਸ਼ੀ-ਖਾਤਾ 2.0',
    brand_subtitle: 'ਅਗਲੀ ਪੀੜ੍ਹੀ ਦਾ ਖੇਤੀਬਾੜੀ ਸਿਸਟਮ',
    initializing: 'ਕ੍ਰਿਸ਼ੀ-ਖਾਤਾ 2.0 ਲੋਡ ਹੋ ਰਿਹਾ ਹੈ...',

    // Nav
    nav_dashboard: 'ਡੈਸ਼ਬੋਰਡ',
    nav_drone: 'ਡਰੋਨ ਸਟੂਡੀਓ',
    nav_khata: 'ਖੇਤੀ ਖਾਤਾ',
    nav_market: 'ਮੰਡੀ ਤੇ ਮੌਸਮ',
    logout: 'ਲਾਗਆਉਟ',

    // Dashboard
    dash_title: 'ਖੇਤੀ ਕਮਾਂਡ ਸੈਂਟਰ',
    dash_desc: 'ਰੀਅਲ-ਟਾਈਮ ਫਸਲ ਵਾਧਾ (GDD), ਡਰੋਨ ਜਾਂਚ ਅਤੇ ਵਿੱਤੀ ਖਾਤਾ-ਬਹੀ।',
    sync_live: 'ਡਾਟਾ ਰਿਫ੍ਰੈਸ਼ ਕਰੋ',
    launch_drone: 'ਡਰੋਨ ਸਟੂਡੀਓ ਸ਼ੁਰੂ ਕਰੋ',
    stat_crop: 'ਮੁੱਖ ਫਸਲ',
    stat_acres: 'ਕੁੱਲ ਰਕਬਾ (ਏਕੜ)',
    stat_gdd: 'ਕੁੱਲ ਥਰਮਲ GDD',
    stat_profit: 'ਖਾਤਾ ਸ਼ੁੱਧ ਮੁਨਾਫ਼ਾ',
    growth_meter: 'ਫਸਲ ਵਿਕਾਸ ਮੀਟਰ (GDD)',
    growth_sub: 'ਬਿਜਾਈ ਦੀ ਮਿਤੀ ਤੋਂ ਤਾਪਮਾਨ ਗਣਨਾ',
    update_gdd: 'GDD ਅੱਪਡੇਟ ਕਰੋ',
    weather_title: 'ਖੇਤੀ ਮੌਸਮ ਤੇ ਸਪਰੇਅ ਸਲਾਹ',
    weather_sub: 'ਸਪਰੇਅ ਲਈ ਹਵਾ ਦੀ ਗਤੀ ਅਤੇ ਮੀਂਹ ਦੀ ਸੰਭਾਵਨਾ',
    view_7day: '7 ਦਿਨਾਂ ਦਾ ਮੌਸਮ ਤੇ ਮੰਡੀ ਭਾਅ ਦੇਖੋ',

    // Spray status
    spray_optimal: 'ਸਪਰੇਅ ਲਈ ਵਧੀਆ ਸਮਾਂ',
    spray_wind: 'ਸਾਵਧਾਨ: ਤੇਜ਼ ਹਵਾ ਦਾ ਖਤਰਾ',
    spray_rain: 'ਸਪਰੇਅ ਨਾ ਕਰੋ: ਮੀਂਹ ਦਾ ਖਤਰਾ',
    spray_evening: 'ਸ਼ਾਮ ਵੇਲੇ ਸਪਰੇਅ ਕਰੋ',

    // Drone Studio
    drone_title: 'ਡਰੋਨ ਸਟੂਡੀਓ ਅਤੇ ਏਆਈ ਪਲਾਂਟ ਡਾਕਟਰ',
    drone_desc: 'ਪੱਤਿਆਂ ਦੀਆਂ ਬਿਮਾਰੀਆਂ ਦੀ ਪਛਾਣ ਅਤੇ ਕੁਦਰਤੀ/ਰਸਾਇਣਕ ਇਲਾਜ।',
    start_flight: 'ਡਰੋਨ ਉਡਾਣ ਸ਼ੁਰੂ ਕਰੋ',
    end_flight: 'ਮਿਸ਼ਨ ਸਮਾਪਤ ਕਰੋ',
    flight_active: 'ਉਡਾਣ ਸਰਗਰਮ',
    target_crop: 'ਚੁਣੀ ਗਈ ਫਸਲ',
    radar_title: 'ਹਵਾਈ ਰਡਾਰ ਅਤੇ ਤਸਵੀਰ ਜਾਂਚ',
    load_samples: 'ਨਮੂਨਾ ਤਸਵੀਰਾਂ:',
    sample_blight: 'ਝੁਲਸਾ ਰੋਗ',
    sample_mildew: 'ਚਿੱਟਾ ਉੱਲੀ ਰੋਗ',
    sample_healthy: 'ਤੰਦਰੁਸਤ ਪੱਤਾ',
    upload_frame: 'ਡਰੋਨ ਤਸਵੀਰ ਅੱਪਲੋਡ ਕਰੋ',
    upload_sub: 'JPEG, PNG ਵੱਧ ਤੋਂ ਵੱਧ 25MB',
    analyze_btn: 'ਏਆਈ ਡਾਕਟਰ ਨਾਲ ਜਾਂਚ ਕਰੋ',
    analyzing_btn: 'ਜਾਂਚ ਜਾਰੀ ਹੈ...',
    diag_title: 'ਬਿਮਾਰੀ ਦਾ ਨਿਦਾਨ ਤੇ ਇਲਾਜ',
    organic_tab: '🌿 ਜੈਵਿਕ ਉਪਚਾਰ',
    chemical_tab: '🧪 ਰਸਾਇਣਕ ਦਵਾਈ',
    protocol_7day: '7 ਦਿਨਾਂ ਦੀ ਰੋਕਥਾਮ ਯੋਜਨਾ',
    flight_logs: 'ਡਰੋਨ ਉਡਾਣ ਰਿਕਾਰਡ',

    // Khata
    khata_title: 'ਸਮਾਰਟ ਫਾਰਮ ਖਾਤਾ ਅਤੇ ਮਜ਼ਦੂਰੀ ਬਹੀ',
    khata_desc: 'ਦੋਹਰੀ ਐਂਟਰੀ ਹਿਸਾਬ-ਕਿਤਾਬ, ਮਜ਼ਦੂਰੀ ਅਦਾਇਗੀ ਅਤੇ ਕੇਸੀਸੀ ਰਿਪੋਰਟ।',
    record_entry: 'ਐਂਟਰੀ ਦਰਜ ਕਰੋ',
    log_labor: 'ਮਜ਼ਦੂਰ ਦਰਜ ਕਰੋ',
    kcc_appraisal: 'ਕੇਸੀਸੀ ਬੈਂਕ ਰਿਪੋਰਟ',
    total_rev: 'ਕੁੱਲ ਆਮਦਨ',
    op_expenses: 'ਕੁੱਲ ਖਰਚਾ',
    net_surplus: 'ਸ਼ੁੱਧ ਬੱਚਤ',
    tx_log: 'ਵਿੱਤੀ ਲੈਣ-ਦੇਣ ਖਾਤਾ',
    labor_ledger: 'ਮਜ਼ਦੂਰੀ ਹਿਸਾਬ ਕਿਤਾਬ',
    settle_bal: 'ਹਿਸਾਬ ਚੁਕਤਾ ਕਰੋ',

    // Mandi & Weather
    mandi_title: 'ਮੰਡੀ ਭਾਅ ਅਤੇ ਮੌਸਮ ਜਾਣਕਾਰੀ',
    mandi_desc: 'ਤਾਜ਼ਾ ਮੰਡੀ ਭਾਅ ਅਤੇ 7 ਦਿਨਾਂ ਦਾ ਖੇਤੀਬਾੜੀ ਮੌਸਮ ਅਨੁਮਾਨ।',
    spray_7day: '7 ਦਿਨਾਂ ਦੀ ਸਪਰੇਅ ਯੋਗਤਾ',
    mandi_benchmarks: 'ਲਾਈਵ ਮੰਡੀ ਭਾਅ',
    search_placeholder: 'ਕਪਾਹ, ਕਣਕ ਖੋਜੋ...',

    // Theme & Lang
    theme_light: 'ਲਾਈਟ ਮੋਡ',
    theme_dark: 'ਡਾਰਕ ਮੋਡ',
    select_language: 'ਭਾਸ਼ਾ',
  },

  gu: {
    // Brand
    brand_name: 'કૃષિ-ખાતું 2.0',
    brand_subtitle: 'નેક્સ્ટ-જનરેશન એગ્રીટેક ઓપરેટિંગ સિસ્ટમ',
    initializing: 'કૃષિ-ખાતું 2.0 શરૂ થઈ રહ્યું છે...',

    // Nav
    nav_dashboard: 'ડેશબોર્ડ',
    nav_drone: 'ડ્રોન સ્ટુડિયો',
    nav_khata: 'ખેતી ખાતું',
    nav_market: 'માર્કેટ અને હવામાન',
    logout: 'લૉગઆઉટ',

    // Dashboard
    dash_title: 'ખેતી કમાન્ડ સેન્ટર',
    dash_desc: 'પાક વૃદ્ધિ (GDD), ડ્રોન તપાસણી અને નાણાકીય નફા-નુકસાન વિગતો.',
    sync_live: 'ડેટા અપડેટ કરો',
    launch_drone: 'ડ્રોન સ્ટુડિયો શરૂ કરો',
    stat_crop: 'વાવેતર પાક',
    stat_acres: 'કુલ જમીન (એકર)',
    stat_gdd: 'કુલ થર્મલ GDD',
    stat_profit: 'ખાતાનો ચોખ્ખો નફો',
    growth_meter: 'પાક વિકાસ મીટર (GDD)',
    growth_sub: 'વાવણીની તારીખથી તાપમાન ગણતરી',
    update_gdd: 'GDD અપડેટ કરો',
    weather_title: 'કૃષિ હવામાન અને છંટકાવ સલાહ',
    weather_sub: 'દવા છંટકાવ માટે પવનની ગતિ અને વરસાદની આગાહી',
    view_7day: '7 દિવસની આગાહી અને બજાર ભાવ જુઓ',

    // Spray status
    spray_optimal: 'છંટકાવ માટે ઉત્તમ સમય',
    spray_wind: 'સાવધાન: વધુ પવનનું જોખમ',
    spray_rain: 'છંટકાવ કરશો નહીં: વરસાદનું જોખમ',
    spray_evening: 'સાંજે છંટકાવ કરો',

    // Drone Studio
    drone_title: 'ડ્રોન સ્ટુડિયો અને એઆઈ ક્રોપ ડૉક્ટર',
    drone_desc: 'પાંદડાના રોગોની ચોક્કસ ઓળખ અને જૈવિક/રાસાયણિક ઉપાયો.',
    start_flight: 'ડ્રોન મિશન શરૂ કરો',
    end_flight: 'મિશન પૂર્ણ કરો',
    flight_active: 'ઉડાન ચાલુ છે',
    target_crop: 'પસંદ કરેલ પાક',
    radar_title: 'હવાઈ રડાર અને ફોટો ચકાસણી',
    load_samples: 'નમૂના ફોટા:',
    sample_blight: 'સુકારો રોગ',
    sample_mildew: 'છારો રોગ',
    sample_healthy: 'તંદુરસ્ત પાન',
    upload_frame: 'ડ્રોન ફોટો અપલોડ કરો',
    upload_sub: 'મહત્તમ 25MB સુધી JPEG, PNG',
    analyze_btn: 'એઆઈ ડૉક્ટર દ્વારા તપાસો',
    analyzing_btn: 'તપાસણી ચાલુ છે...',
    diag_title: 'રોગ નિદાન અને ઉપચાર',
    organic_tab: '🌿 જૈવિક ઉપચાર',
    chemical_tab: '🧪 રાસાયણિક દવા',
    protocol_7day: '7 દિવસની નિવારક યોજના',
    flight_logs: 'ડ્રોન ઉડાન હિસ્ટ્રી',

    // Khata
    khata_title: 'સ્માર્ટ ખેતી ખાતું અને મજૂરી હિસાબ',
    khata_desc: 'દ્વિનોંધી ખાતાવહી, મજૂરી ચૂકવણી અને કેસીસી બેંક રિપોર્ટ.',
    record_entry: 'એન્ટ્રી નોંધો',
    log_labor: 'મજૂર નોંધો',
    kcc_appraisal: 'કેસીસી બેંક મૂલ્યાંકન',
    total_rev: 'કુલ આવક',
    op_expenses: 'કુલ ખર્ચ',
    net_surplus: 'ચોખ્ખો નફો',
    tx_log: 'નાણાકીય વ્યવહાર ખાતાવહી',
    labor_ledger: 'મજૂરી હિસાબ વહી',
    settle_bal: 'હિસાબ પૂર્ણ કરો',

    // Mandi & Weather
    mandi_title: 'બજાર ભાવ અને હવામાન માહિતી',
    mandi_desc: 'લાઈવ માર્કેટ યાર્ડ ભાવ અને 7 દિવસની હવામાન આગાહી.',
    spray_7day: '7 દિવસની છંટકાવ શક્યતા',
    mandi_benchmarks: 'લાઈવ એપીએમસી બજાર ભાવ',
    search_placeholder: 'કપાસ, ઘઉં શોધો...',

    // Theme & Lang
    theme_light: 'લાઇટ મોડ',
    theme_dark: 'ડાર્ક મોડ',
    select_language: 'ભાષા',
  }
};
