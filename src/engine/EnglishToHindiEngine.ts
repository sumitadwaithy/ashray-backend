// EnglishToHindiEngine.ts
// Hybrid Hindi Engine: Transliteration + Semantic + Self-Learning
// Offline-first | No API | Matra-aware syllable core

type MemoryMap = Record<string, string>;

const STORAGE_KEY = 'hindi_engine_memory_v2';

// ─── Self-Learning Memory ────────────────────────────────────────────────────

const loadMemory = (): MemoryMap => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : {};
  } catch {
    return {};
  }
};

const saveMemory = (memory: MemoryMap) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(memory));
  } catch { /* quota exceeded – silently ignore */ }
};

let memoryCache: MemoryMap = loadMemory();

const normalizeInput = (input?: any): string => {
  if (!input) return 'उपलब्ध नहीं है';

  // Handle multilingual object { en, hi }
  if (typeof input === 'object' && input !== null) {
    if (input.hi && String(input.hi).trim() !== '') {
      return input.hi;
    }

    if (input.en && String(input.en).trim() !== '') {
      return input.en;
    }

    return 'उपलब्ध नहीं है';
  }

  if (typeof input !== 'string') return 'उपलब्ध नहीं है';

  return input.trim();
};

const genderMap: Record<string, string> = {
  male: 'पुरुष',
  female: 'महिला',
  other: 'अन्य',
};

// ─── Semantic Map (high-value words → proper Hindi) ──────────────────────────
// These are words where phonetic transliteration would produce wrong/ugly output.

const semanticMap: Record<string, string> = {

 // Titles
    'mr': 'श्री', 'mrs': 'श्रीमती', 'ms': 'सुश्री', 'dr': 'डॉ',
    'shri': 'श्री', 'smt': 'श्रीमती', 'owner': 'मालिक',

    // Common Indian names
    'rahul': 'राहुल', 'rohit': 'रोहित', 'amit': 'अमित',
    'suresh': 'सुरेश', 'ramesh': 'रमेश', 'mahesh': 'महेश',
    'rajesh': 'राजेश', 'dinesh': 'दिनेश', 'naresh': 'नरेश',
    'priya': 'प्रिया', 'pooja': 'पूजा', 'anita': 'अनीता',
    'sunita': 'सुनीता', 'kavita': 'कविता', 'rekha': 'रेखा',
    'geeta': 'गीता', 'seeta': 'सीता', 'neha': 'नेहा',
    'anil': 'अनिल', 'sunil': 'सुनील', 'kapil': 'कपिल',
    'sachin': 'सचिन', 'sanjay': 'संजय', 'vijay': 'विजय',
    'ajay': 'अजय', 'ravi': 'रवि', 'kiran': 'किरण',
    'mohan': 'मोहन', 'sohan': 'सोहन', 'rohan': 'रोहन',
    'krishna': 'कृष्णा', 'ram': 'राम', 'shyam': 'श्याम',
    'gopal': 'गोपाल', 'laxmi': 'लक्ष्मी', 'durga': 'दुर्गा',
    'ganesh': 'गणेश', 'pramod': 'प्रमोद', 'pravin': 'प्रवीण',
    'praveen': 'प्रवीण', 'deepak': 'दीपक', 'vivek': 'विवेक',
    'ashok': 'अशोक', 'alok': 'आलोक', 'vinod': 'विनोद',
    'manoj': 'मनोज', 'arun': 'अरुण', 'varun': 'वरुण',
    'tarun': 'तरुण', 'nitin': 'नितिन', 'vipin': 'विपिन',
    'sumit': 'सुमित', 'lalit': 'ललित', 'adwaithy': 'अद्वैथि',
    'hemant': 'हेमंत', 'vikram': 'विक्रम', 'vishal': 'विशाल',
    'akash': 'आकाश', 'prakash': 'प्रकाश', 'subhash': 'सुभाष',
    'ramkumar': 'रामकुमार', 'rajkumar': 'राजकुमार',
    'sudhir': 'सुधीर', 'rakesh': 'राकेश', 'mukesh': 'मुकेश',
    'lokesh': 'लोकेश', 'yogesh': 'योगेश', 'umesh': 'उमेश',
    'girish': 'गिरीश', 'harish': 'हरीश', 'manish': 'मनीष',
    'satish': 'सतीश', 'rupesh': 'रूपेश', 'nilesh': 'नीलेश',
    'ritesh': 'रितेश', 'hitesh': 'हितेश', 'jitesh': 'जितेश',
    'pankaj': 'पंकज', 'saurabh': 'सौरभ', 'gaurav': 'गौरव',
    'anurag': 'अनुराग', 'dhiraj': 'धीरज', 'chirag': 'चिराग',
    'neeraj': 'नीरज', 'brijesh': 'बृजेश', 'bhavesh': 'भावेश',
    'shivam': 'शिवम', 'shiv': 'शिव', 'shiva': 'शिव',
    'anand': 'आनंद', 'prasad': 'प्रसाद', 'rajiv': 'राजीव',
    'sanjeev': 'संजीव', 'pradeep': 'प्रदीप', 'kuldeep': 'कुलदीप',
    'hardeep': 'हरदीप', 'pardeep': 'परदीप',
    'anjali': 'अंजली', 'swati': 'स्वाति', 'nisha': 'निशा',
    'usha': 'उषा', 'asha': 'आशा', 'disha': 'दिशा',
    'ritu': 'रितु', 'mitu': 'मितु', 'pintu': 'पिंटू',
    'rinku': 'रिंकू', 'tinku': 'टिंकू', 'bablu': 'बाबलू',
    'pappu': 'पप्पू', 'guddu': 'गुड्डू', 'munna': 'मुन्ना',

    // Common surnames
    'sharma': 'शर्मा', 'verma': 'वर्मा', 'gupta': 'गुप्ता',
    'singh': 'सिंह', 'yadav': 'यादव', 'tiwari': 'तिवारी',
    'mishra': 'मिश्रा', 'pandey': 'पांडेय', 'shukla': 'शुक्ला',
    'dwivedi': 'द्विवेदी', 'trivedi': 'त्रिवेदी', 'chaturvedi': 'चतुर्वेदी',
    'joshi': 'जोशी', 'patel': 'पटेल', 'shah': 'शाह',
    'mehta': 'मेहता', 'jain': 'जैन', 'agarwal': 'अग्रवाल',
    'aggarwal': 'अग्रवाल', 'bansal': 'बंसल', 'garg': 'गर्ग',
    'mittal': 'मित्तल', 'goyal': 'गोयल', 'jindal': 'जिंदल',
    'bajaj': 'बजाज', 'birla': 'बिड़ला', 'khanna': 'खन्ना',
    'kapoor': 'कपूर', 'malhotra': 'मल्होत्रा', 'chopra': 'चोपड़ा',
    'mehra': 'मेहरा', 'bhatia': 'भाटिया', 'soni': 'सोनी',
    'naik': 'नाईक', 'patil': 'पाटिल', 'desai': 'देसाई',
    'kulkarni': 'कुलकर्णी', 'deshpande': 'देशपांडे', 'jog': 'जोग',
    'thakur': 'ठाकुर', 'chauhan': 'चौहान', 'rawat': 'रावत',
    'rajput': 'राजपूत', 'rana': 'राणा', 'rathore': 'राठौर',
    'srivastava': 'श्रीवास्तव', 'saxena': 'सक्सेना', 'mathur': 'माथुर',
    'bose': 'बोस', 'das': 'दास', 'dey': 'डे',
    'mukherjee': 'मुखर्जी', 'chatterjee': 'चटर्जी', 'banerjee': 'बनर्जी',
    'sen': 'सेन', 'ghosh': 'घोष', 'roy': 'रॉय',
    'nair': 'नायर', 'pillai': 'पिल्लई', 'menon': 'मेनन',
    'iyer': 'अय्यर', 'iyengar': 'अयंगार', 'reddy': 'रेड्डी',
    'naidu': 'नायडू', 'rao': 'राव', 'murthy': 'मूर्ति',
    'kumar': 'कुमार', 'devi': 'देवी', 'bai': 'बाई',

    // Occupations
    'engineer': 'अभियंता', 'doctor': 'चिकित्सक', 'teacher': 'शिक्षक',
    'lawyer': 'अधिवक्ता', 'advocate': 'अधिवक्ता', 'professor': 'प्राध्यापक',
    'farmer': 'किसान', 'businessman': 'व्यवसायी', 'business': 'व्यवसाय',
    'service': 'नौकरी', 'retired': 'सेवानिवृत्त', 'student': 'विद्यार्थी',
    'shopkeeper': 'दुकानदार', 'driver': 'चालक', 'contractor': 'ठेकेदार',
    'accountant': 'लेखाकार', 'manager': 'प्रबंधक', 'director': 'निदेशक',
    'clerk': 'लिपिक', 'officer': 'अधिकारी', 'inspector': 'निरीक्षक',
    'constable': 'कांस्टेबल', 'police': 'पुलिस', 'nurse': 'नर्स',
    'housewife': 'गृहिणी', 'architect': 'वास्तुकार', 'builder': 'निर्माता',
    'journalist': 'पत्रकार', 'banker': 'बैंकर', 'writer': 'लेखक',
    'developer': 'विकासकर्ता', 'agent': 'एजेंट',

    // Places (Nagpur region)
    'nagpur': 'नागपुर', 'besa': 'बेसा', 'dabha': 'दाभा',
    'hingna': 'हिंगना', 'butibori': 'बुटीबोरी', 'kamptee': 'कामटी',
    'wardha': 'वर्धा', 'amravati': 'अमरावती', 'yavatmal': 'यवतमाल',
    'chandrapur': 'चंद्रपुर', 'gondia': 'गोंदिया', 'bhandara': 'भंदारा',
    'karjat': 'कर्जत', 'pune': 'पुणे', 'mumbai': 'मुंबई',
    'delhi': 'दिल्ली', 'maharashtra': 'महाराष्ट्र',

    // Address keywords
    'plot': 'प्लॉट', 'ward': 'वार्ड', 'colony': 'कॉलोनी',
    'nagar': 'नगर', 'layout': 'लेआउट', 'road': 'रोड',
    'street': 'स्ट्रीट', 'lane': 'लेन', 'near': 'पास',
    'behind': 'पीछे', 'opposite': 'सामने', 'beside': 'बगल में',
    'house': 'मकान', 'flat': 'फ्लैट', 'floor': 'मंजिल',
    'building': 'इमारत', 'complex': 'कॉम्प्लेक्स',
    'society': 'सोसायटी', 'apartment': 'अपार्टमेंट',
    'district': 'जिला', 'taluka': 'तालुका', 'tehsil': 'तहसील',
    'village': 'गांव', 'city': 'शहर', 'town': 'कस्बा',
    'state': 'राज्य', 'india': 'भारत',
    'no': 'नं', 'number': 'नंबर',  'Ashray Group': 'आश्रय ग्रुप',


  // Relations / Identity
  father:      'पिता',
  mother:      'माता',
  son:         'पुत्र',
  daughter:    'पुत्री',
  husband:     'पति',
  wife:        'पत्नी',
  brother:     'भाई',
  sister:      'बहन',
  grandfather: 'दादा',
  grandmother: 'दादी',

  // Common words in legal documents
  the:         'द',    // keep as transliteration marker; overridden below
  and:         'और',
  of:          'का',
  in:          'में',
  on:          'पर',
  to:          'को',
  for:         'के लिए',
  by:          'द्वारा',
  with:        'के साथ',
  from:        'से',
  at:          'पर',
  is:          'है',
  are:         'हैं',
  was:         'था',
  were:        'थे',
  this:        'यह',
  that:        'वह',
  sale:        'विक्रय',
  deed:        'विलेख',
  agreement:   'अनुबंध',
  property:    'संपत्ति',
  land:        'भूमि',
  area:        'क्षेत्रफल',
  price:       'मूल्य',
  amount:      'राशि',
  payment:     'भुगतान',
  date:        'तिथि',
  year:        'वर्ष',
  month:       'माह',
  day:         'दिन',
  rupees:      'रुपये',
  party:       'पक्षकार',
  seller:      'विक्रेता',
  buyer:       'क्रेता',
  witness:     'साक्षी',
  signature:   'हस्ताक्षर',
  address:     'पता',
  AshrayGroup: 'आश्रय ग्रुप',
  Group: 'ग्रुप',
};

// ─── Common Indian Names (dictionary-first for accuracy) ─────────────────────

const nameMap: Record<string, string> = {
  // Male names
  ram:       'राम',
  ramesh:    'रमेश',
  suresh:    'सुरेश',
  mahesh:    'महेश',
  ganesh:    'गणेश',
  dinesh:    'दिनेश',
  naresh:    'नरेश',
  mukesh:    'मुकेश',
  rakesh:    'राकेश',
  rajesh:    'राजेश',
  lokesh:    'लोकेश',
  ritesh:    'ऋतेश',
  nilesh:    'नीलेश',
  hitesh:    'हितेश',
  paresh:    'परेश',
  umesh:     'उमेश',
  devesh:    'देवेश',
  satish:    'सतीश',
  harish:    'हरीश',
  manish:    'मनीश',
  ashish:    'आशीष',
  girish:    'गिरीश',
  yogesh:    'योगेश',
  vikas:     'विकास',
  vivek:     'विवेक',
  rahul:     'राहुल',
  ravi:      'रवि',
  sanjay:    'संजय',
  vijay:     'विजय',
  ajay:      'अजय',
  manoj:     'मनोज',
  nikhil:    'निखिल',
  ankit:     'अंकित',
  amit:      'अमित',
  sumit:     'सुमित',
  rohit:     'रोहित',
  mohit:     'मोहित',
  lalit:     'ललित',
  shyam:     'श्याम',
  prem:      'प्रेम',
  krishna:   'कृष्ण',
  shiva:     'शिव',
  vishnu:    'विष्णु',
  arun:      'अरुण',
  varun:     'वरुण',
  tarun:     'तरुण',
  karun:     'करुण',
  pravin:    'प्रवीण',
  navin:     'नवीन',
  sachin:    'सचिन',
  prashant:  'प्रशांत',
  hemant:    'हेमंत',
  shashant:  'शाशांत',
  ravindra:  'रवींद्र',
  mahendra:  'महेंद्र',
  narendra:  'नरेंद्र',
  devendra:  'देवेंद्र',
  surendra:  'सुरेंद्र',
  rajendra:  'राजेंद्र',
  virendra:  'वीरेंद्र',
  ramprasad: 'रामप्रसाद',
  shivprasad:'शिवप्रसाद',
  ramnath:   'रामनाथ',
  shivnath:  'शिवनाथ',
  jagdish:   'जगदीश',
  harishchandra: 'हरिश्चंद्र',
  dilip:     'दिलीप',
  sandip:    'संदीप',
  pradeep:   'प्रदीप',
  kuldeep:   'कुलदीप',
  navdeep:   'नवदीप',

  // Female names
  kiran:     'किरण',
  suman:     'सुमन',
  rekha:     'रेखा',
  usha:      'उषा',
  asha:      'आशा',
  nisha:     'निशा',
  anita:     'अनिता',
  sunita:    'सुनीता',
  kavita:    'कविता',
  savita:    'सविता',
  mamta:     'ममता',
  geeta:     'गीता',
  seeta:     'सीता',
  radha:     'राधा',
  meena:     'मीना',
  reena:     'रीना',
  veena:     'वीणा',
  leena:     'लीना',
  priya:     'प्रिया',
  divya:     'दिव्या',
  pooja:     'पूजा',
  puja:      'पूजा',
  neha:      'नेहा',
  sneha:     'स्नेहा',
  reha:      'रेहा',
  preeti:    'प्रीति',
  jyoti:     'ज्योति',
  shanti:    'शांति',
  laxmi:     'लक्ष्मी',
  lakshmi:   'लक्ष्मी',
  saraswati: 'सरस्वती',
  durga:     'दुर्गा',
  parvati:   'पार्वती',
  pushpa:    'पुष्पा',
  madhuri:   'माधुरी',
  manjusha:  'मंजुषा',
  deepika:   'दीपिका',
  ruchika:   'रुचिका',
  archana:   'अर्चना',
  vandana:   'वंदना',
  sadhana:   'साधना',
  ranjana:   'रंजना',
  anjana:    'अंजना',
  sanjana:   'संजना',
  chanda:    'चंदा',
  champa:    'चंपा',
  indira:    'इंदिरा',
  kamla:     'कमला',
  vimla:     'विमला',
  nirmala:   'निर्मला',
  santosh:   'संतोष',
  pratibha:  'प्रतिभा',
  smita:     'स्मिता',
  shobha:    'शोभा',
  sudha:     'सुधा',
  radharani: 'राधारानी',

  // Surnames / family names common in Nagpur / Maharashtra
  sharma:    'शर्मा',
  verma:     'वर्मा',
  gupta:     'गुप्ता',
  joshi:     'जोशी',
  patil:     'पाटील',
  desai:     'देसाई',
  kulkarni:  'कुलकर्णी',
  deshpande: 'देशपांडे',
  bhosale:   'भोसले',
  salve:     'साळवे',
  shinde:    'शिंदे',
  pawar:     'पवार',
  jadhav:    'जाधव',
  gaikwad:   'गायकवाड',
  more:      'मोरे',
  kadam:     'कदम',
  mane:      'माने',
  rane:      'राणे',
  sawant:    'सावंत',
  naik:      'नाईक',
  thakre:    'ठाकरे',
  thakur:    'ठाकुर',
  singh:     'सिंह',
  pandey:    'पांडेय',
  mishra:    'मिश्रा',
  tiwari:    'तिवारी',
  dubey:     'दुबे',
  yadav:     'यादव',
  soni:      'सोनी',
  patel:     'पटेल',
  mehta:     'मेहता',
  shah:      'शाह',
  agarwal:   'अग्रवाल',
  bansal:    'बंसल',
  khatri:    'खत्री',
  malhotra:  'मल्होत्रा',
  chawla:    'चावला',
  arora:     'अरोरा',
  kapoor:    'कपूर',
  bhatia:    'भाटिया',
  choudhary: 'चौधरी',
  sinha:     'सिन्हा',
  rastogi:   'रस्तोगी',
  saxena:    'सक्सेना',
  tripathi:  'त्रिपाठी',
  upadhyay:  'उपाध्याय',
  dwivedi:   'द्विवेदी',
  trivedi:   'त्रिवेदी',
  chaturvedi:'चतुर्वेदी',
  shrivastava:'श्रीवास्तव',
  srivastava: 'श्रीवास्तव',
  khare:     'खरे',
  gore:      'गोरे',
  jain:      'जैन',

  // Nagpur / Vidarbha place names
  wardha:    'वर्धा',
  amravati:  'अमरावती',
  yavatmal:  'यवतमाल',
  akola:     'अकोला',
  washim:    'वाशिम',
  bhandara:  'भंडारा',
  gondia:    'गोंदिया',
  chandrapur:'चंद्रपुर',
  gadchiroli:'गडचिरोली',
  butibori:  'बुटीबोरी',
  hingna:    'हिंगना',
  kamptee:   'कामठी',
  katol:     'कटोल',
  saoner:    'सावनेर',
  narkhed:   'नरखेड',
  parseoni:  'पारशिवनी',
  umred:     'उमरेड',
  ramtek:    'रामटेक',
  mauda:     'मौदा',
  bhiwapur:  'भिवापूर',
  kuhi:      'कुही',
  kalmeshwar:'कळमेश्वर',
};

// ─── Matra (vowel sign) Map ───────────────────────────────────────────────────
// When a vowel follows a consonant, use the matra form instead of standalone.

const matraMap: Record<string, string> = {
  'aa': 'ा',   // आ  → ा
  'a':  '',    // अ  → inherent (silent, already in consonant)
  'ee': 'ी',   // ई  → ी
  'ii': 'ी',
  'i':  'ि',   // इ  → ि
  'oo': 'ू',   // ऊ  → ू
  'uu': 'ू',
  'u':  'ु',   // उ  → ु
  'ai': 'ै',   // ऐ  → ै
  'au': 'ौ',   // औ  → ौ
  'e':  'े',   // ए  → े
  'o':  'ो',   // ओ  → ो
  'ri': 'ृ',   // ऋ  → ृ (as in Krishna → कृष्ण)
  'an': 'ं',   // anusvara in context like 'an' before consonant
};

const standaloneVowelMap: Record<string, string> = {
  'aa': 'आ',
  'a':  'अ',
  'ee': 'ई',
  'ii': 'ई',
  'i':  'इ',
  'oo': 'ऊ',
  'uu': 'ऊ',
  'u':  'उ',
  'ai': 'ऐ',
  'au': 'औ',
  'e':  'ए',
  'o':  'ओ',
  'ri': 'ऋ',
};

// Consonant map — longest match first handled at runtime
const consonantMap: Record<string, string> = {
  'ksh': 'क्ष',
  'gn':  'ज्ञ',
  'tr':  'त्र',
  'shr': 'श्र',
  'shn': 'ष्ण',
  'str': 'स्त्र',
  'pr':  'प्र',
  'gr':  'ग्र',
  'kr':  'क्र',
  'dr':  'द्र',
  'br':  'ब्र',
  'vr':  'व्र',
  'shv': 'श्व',
  'shw': 'श्व',
  'chh': 'छ',
  'kh':  'ख',
  'gh':  'घ',
  'ch':  'च',
  'jh':  'झ',
  'th':  'थ',
  'dh':  'ध',
  'ph':  'फ',
  'bh':  'भ',
  'sh':  'श',
  'ng':  'ङ',
  'ny':  'ञ',
  'nn':  'ण',
  'tt':  'ट',
  'dd':  'ड',
  'nd':  'ण्ड',
  'nt':  'न्त',
  'k':   'क',
  'g':   'ग',
  'j':   'ज',
  't':   'त',
  'd':   'द',
  'p':   'प',
  'b':   'ब',
  'm':   'म',
  'n':   'न',
  'y':   'य',
  'r':   'र',
  'l':   'ल',
  'v':   'व',
  'w':   'व',
  's':   'स',
  'h':   'ह',
  'f':   'फ़',
  'z':   'ज़',
  'q':   'क़',
  'x':   'क्स',
  'c':   'क',
  'doctor': 'चिकित्सक',
  'dr.': 'डॉ',
// In semanticMap — add common English loanwords used in legal docs:
'testing':   'परीक्षण',
'cash':      'नकद',
'online':    'ऑनलाइन',
'cheque':    'चेक',
'check':     'चेक',
'owner': 'मालिक',
'Ashray Group': 'आश्रय ग्रुप',
'Group': 'ग्रुप',
'grp': 'ग्रुप',
'groups': 'ग्रुप',
};

// Vowel token list (sorted longest-first for greedy matching)
const vowelTokens = Object.keys(matraMap).sort((a, b) => b.length - a.length);
// Consonant token list (sorted longest-first)
const consonantTokens = Object.keys(consonantMap).sort((a, b) => b.length - a.length);

// ─── Core Phonetic Engine ─────────────────────────────────────────────────────

/**
 * Check if character at position i in `str` is a vowel pattern start.
 * Returns the matched vowel token or null.
 */
function matchVowel(str: string, i: number): string | null {
  for (const vt of vowelTokens) {
    if (str.startsWith(vt, i)) return vt;
  }
  return null;
}

/**
 * Check if character at position i in `str` is a consonant pattern start.
 * Returns the matched consonant token or null.
 */
function matchConsonant(str: string, i: number): string | null {
  for (const ct of consonantTokens) {
    if (str.startsWith(ct, i)) return ct;
  }
  return null;
}

/**
 * Transliterates a single cleaned (lowercase) word using a matra-aware syllable engine.
 *
 * Algorithm:
 *   State machine with two modes: INIT (start of word or after a vowel)
 *   and AFTER_CONSONANT.
 *
 *   INIT:
 *     - vowel → standalone vowel character
 *     - consonant → emit consonant, move to AFTER_CONSONANT
 *
 *   AFTER_CONSONANT:
 *     - vowel 'a' (inherent) → emit nothing (inherent a), back to INIT
 *     - other vowel → emit matra, back to INIT
 *     - consonant → emit halant + consonant (consonant cluster), stay in AFTER_CONSONANT
 *       BUT: if next char is a vowel, instead use virama and let the vowel attach
 *       Actually: emit halant ् between two consonants only when truly a cluster.
 *     - end of word → add nothing (inherent a is natural)
 */
function phoneticTransliterate(word: string): string {
  const s = word.toLowerCase();
  let result = '';
  let i = 0;
  let afterConsonant = false;

  while (i < s.length) {
    // Try consonant first (greedy)
    const cToken = matchConsonant(s, i);
    if (cToken) {
      if (afterConsonant) {
        // Consonant cluster: check if NEXT is also a consonant (true cluster needs halant)
        // Look ahead: is there a vowel right after this consonant?
        const nextI = i + cToken.length;
        const nextVowel = matchVowel(s, nextI);
        const nextCons = !nextVowel ? matchConsonant(s, nextI) : null;

        if (nextCons && !nextVowel) {
          // True cluster — emit halant then consonant
          result += '्' + consonantMap[cToken];
        } else {
          // This consonant will get a vowel after it — emit halant + consonant
          result += '्' + consonantMap[cToken];
        }
      } else {
        result += consonantMap[cToken];
        afterConsonant = true;
      }
      i += cToken.length;
      continue;
    }

    // Try vowel
    const vToken = matchVowel(s, i);
    if (vToken) {
      if (afterConsonant) {
        // Matra form
        result += matraMap[vToken] ?? '';
      } else {
        // Standalone vowel
        result += standaloneVowelMap[vToken] ?? vToken;
      }
      afterConsonant = false;
      i += vToken.length;
      continue;
    }

    // Numbers
    if (/[0-9]/.test(s[i])) {
      result += '०१२३४५६७८९'[Number(s[i])];
      afterConsonant = false;
      i++;
      continue;
    }

    // Punctuation / unknown — pass through
    result += s[i];
    afterConsonant = false;
    i++;
  }

  return result;
}

// ─── Main Word Converter ──────────────────────────────────────────────────────

function transliterateWord(word: string): string {
  if (!word) return '';

  const clean = word
  .toLowerCase()
  .trim()
  .replace(/[^\w]/g, ''); // 🔥 removes punctuation + hidden chars

  // Strip trailing punctuation for lookup, reattach after
  // eslint-disable-next-line no-useless-escape
  const trailMatch = clean.match(/^(.*?)([.,;:!?()\-\/\\]+)$/);
  const core = trailMatch ? trailMatch[1] : clean;
  const trail = trailMatch ? trailMatch[2] : '';

  if (!core) return word; // pure punctuation

  // 1. Memory override (user-taught)
  if (memoryCache[core]) return memoryCache[core] + trail;

  // 2. Name dictionary (most precise)
  if (nameMap[core]) return nameMap[core] + trail;

  // 3. Semantic / vocabulary map
  if (semanticMap[core]) return semanticMap[core] + trail;

  // 4. Numbers
  if (/^\d+$/.test(core)) {
    return core.replace(/[0-9]/g, d => '०१२३४५६७८९'[Number(d)]) + trail;
  }

  // 5. Phonetic engine (matra-aware)
  return phoneticTransliterate(core) + trail;
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Convert an English string to Hindi (transliteration + semantic substitution).
 * Preserves whitespace and punctuation structure.
 */
export const convertNumberToHindi = (value?: number | string): string => {
  if (value === undefined || value === null || value === '') return '';
  const str = String(value);
  if (!isNaN(Number(str))) {
    return Number(str)
      .toLocaleString('en-IN')
      .replace(/[0-9]/g, d => '०१२३४५६७८९'[Number(d)]);
  }
  // Mixed strings like "112/3"
  return str.replace(/[0-9]/g, d => '०१२३४५६७८९'[Number(d)]);
};


export const convertToHindi = (input: any): string => {
  let normalized = normalizeInput(input);

  if (normalized === 'उपलब्ध नहीं है') return normalized;

  const lower = normalized.toLowerCase();

  // ✅ PHRASE MATCH FIRST
  for (const key in phraseMapHindi) {
    if (lower.includes(key)) {
      normalized = normalized.replace(
        new RegExp(key, 'gi'),
        phraseMapHindi[key]
      );
    }
  }

  // ✅ brand fix
  normalized = normalized.replace(/ashray group/gi, 'आश्रय ग्रुप');

  return normalized
    .split(/(\s+)/)
    .map(token =>
      /^\s+$/.test(token) ? token : transliterateWord(token)
    )
    .join('');
};

/**
 * Teach the engine a new word. Persists across sessions.
 * @param english  The English word (case-insensitive)
 * @param hindi    The correct Hindi string
 */
export const learnWord = (english: string, hindi: string): void => {
  if (!english || !hindi) return;
  const key = english.toLowerCase().trim();
  memoryCache[key] = hindi.trim();
  saveMemory(memoryCache);
};

/**
 * Batch-teach multiple word pairs at once.
 */
export const learnWords = (pairs: Array<[string, string]>): void => {
  for (const [en, hi] of pairs) learnWord(en, hi);
};

/**
 * Export current learned memory (for backup / pre-seeding).
 */
export const exportMemory = (): MemoryMap => ({ ...memoryCache });

/**
 * Import a memory map (merge into existing).
 */
export const importMemory = (map: MemoryMap): void => {
  memoryCache = { ...memoryCache, ...map };
  saveMemory(memoryCache);
};

/**
 * Clear all learned memory (destructive).
 */
export const resetHindiEngine = (): void => {
  memoryCache = {};
  saveMemory(memoryCache);
};

export const convertNameWithTitle = (
  name?: string,
  title?: string
): string => {
  if (!name) return '';

  const safeName = convertToHindi(name.trim());

  // ✅ CRITICAL FIX — do NOT normalize title
  if (!title || title.trim() === '') {
    return safeName;
  }

  const titleKey = title
    .toLowerCase()
    .replace('.', '')
    .trim();

  const titleMap: Record<string, string> = {
    mr: 'श्री',
    mrs: 'श्रीमती',
    miss: 'कुमारी',
    ms: 'सुश्री',
  };

  const hindiTitle = titleMap[titleKey] || convertToHindi(title);

  return `${hindiTitle} ${safeName}`.trim();
};

const phraseMapHindi: Record<string, string> = {
  // --- SOLE PROPRIETORSHIP ---
  'sole proprietorship': 'एकल स्वामित्व',
  'sole proprietor': 'एकल स्वामित्व',
  'proprietorship': 'एकल स्वामित्व',
  // SOLE PROPRIETORSHIP SHORT FORMS
  's.p.': 'सो. प्रो.',
  'sp': 'सो. प्रो.',
  'sole prop': 'सो. प्रो.',
  'proprietor': 'मालिक',

  // --- PRIVATE LIMITED ---
  'private limited company': 'निजी लिमिटेड कंपनी',
  'private limited': 'निजी लिमिटेड कंपनी',
  'pvt ltd company': 'निजी लिमिटेड कंपनी',
  'pvt ltd': 'निजी लिमिटेड कंपनी',
  'pvt. ltd.': 'प्रा. लि.',
  'pvt. ltd': 'प्रा. लि.',
  'pvt ltd.': 'प्रा. लि.',

  // --- PUBLIC LIMITED ---
  'public limited company': 'सार्वजनिक लिमिटेड कंपनी',
  'public limited': 'सार्वजनिक लिमिटेड कंपनी',
  'ltd company': 'सार्वजनिक लिमिटेड कंपनी',
  'ltd.': 'लिमिटेड',
  'ltd': 'लिमिटेड',

  // --- PARTNERSHIP ---
  'partnership firm': 'साझेदारी फर्म',
  'partnership': 'साझेदारी फर्म',
  'firm': 'फर्म',
  'p.f.': 'पी.एफ.',
  'pf': 'पी.एफ.',

  // --- LLP ---
  'limited liability partnership': 'सीमित देयता भागीदारी',
  'llp': 'एलएलपी',
  'l.l.p.': 'एलएलपी',

  // --- OTHER ---
  'other': 'अन्य',
  'others': 'अन्य',
};

export const convertGender = (gender?: string) => {
  if (!gender) return '';

  const key = gender.toLowerCase().trim();

  return genderMap[key] || convertToHindi(gender);
};

export const formatHindiDate = (dateStr?: string): string => {
  if (!dateStr) return '';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    const months = ['जनवरी','फरवरी','मार्च','अप्रैल','मई','जून','जुलाई','अगस्त','सितंबर','अक्टूबर','नवंबर','दिसंबर'];
    return `${convertNumberToHindi(String(d.getDate()))} ${months[d.getMonth()]} ${convertNumberToHindi(String(d.getFullYear()))}`;
  } catch { return dateStr; }
};

export const formatAadhaarHindi = (aadhaar?: string) => {
  if (!aadhaar) return '';

  const clean = String(aadhaar).replace(/\D/g, '');

  const formatted = clean
    .replace(/(\d{4})(?=\d)/g, '$1 ')
    .trim();

  return convertNumberToHindi(formatted);
};