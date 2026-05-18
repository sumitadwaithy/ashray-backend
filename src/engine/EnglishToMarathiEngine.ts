// EnglishToMarathiEngine.ts
// Hybrid Marathi Engine: Transliteration + Semantic + Self-Learning
// Offline-first | No API | Matra-aware syllable core

type MemoryMap = Record<string, string>;

const STORAGE_KEY = 'marathi_engine_memory_v1';

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
  if (!input) return 'उपलब्ध नाही';

  // Handle multilingual object { en, mr }
  if (typeof input === 'object' && input !== null) {
    if (input.mr && String(input.mr).trim() !== '') {
      return input.mr;
    }
    if (input.hi && String(input.hi).trim() !== '') {
      return input.hi; // fallback to Hindi if Marathi not available
    }
    if (input.en && String(input.en).trim() !== '') {
      return input.en;
    }
    return 'उपलब्ध नाही';
  }

  if (typeof input !== 'string') return 'उपलब्ध नाही';

  return input.trim();
};

const genderMap: Record<string, string> = {
  male: 'पुरुष',
  female: 'स्त्री',
  other: 'इतर',
};

// ─── Semantic Map (high-value words → proper Marathi) ────────────────────────
// These are words where phonetic transliteration would produce wrong/ugly output.

const semanticMap: Record<string, string> = {

  // Titles
  'mr': 'श्री', 'mrs': 'श्रीमती', 'ms': 'सौ', 'dr': 'डॉ',
  'shri': 'श्री', 'smt': 'श्रीमती', 'sau': 'सौ', 'ku': 'कु',

  // Common Indian names (Marathi preferred spellings)
  'rahul': 'राहुल', 'rohit': 'रोहित', 'amit': 'अमित',
  'suresh': 'सुरेश', 'ramesh': 'रमेश', 'mahesh': 'महेश',
  'rajesh': 'राजेश', 'dinesh': 'दिनेश', 'naresh': 'नरेश',
  'priya': 'प्रिया', 'pooja': 'पूजा', 'anita': 'अनिता',
  'sunita': 'सुनीता', 'kavita': 'कविता', 'rekha': 'रेखा',
  'geeta': 'गीता', 'seeta': 'सीता', 'neha': 'नेहा',
  'anil': 'अनिल', 'sunil': 'सुनील', 'kapil': 'कपिल',
  'sachin': 'सचिन', 'sanjay': 'संजय', 'vijay': 'विजय',
  'ajay': 'अजय', 'ravi': 'रवि', 'kiran': 'किरण',
  'mohan': 'मोहन', 'sohan': 'सोहन', 'rohan': 'रोहन',
  'krishna': 'कृष्ण', 'ram': 'राम', 'shyam': 'श्याम',
  'gopal': 'गोपाल', 'laxmi': 'लक्ष्मी', 'durga': 'दुर्गा',
  'ganesh': 'गणेश', 'pramod': 'प्रमोद', 'pravin': 'प्रवीण',
  'praveen': 'प्रवीण', 'deepak': 'दीपक', 'vivek': 'विवेक',
  'ashok': 'अशोक', 'alok': 'आलोक', 'vinod': 'विनोद',
  'manoj': 'मनोज', 'arun': 'अरुण', 'varun': 'वरुण',
  'tarun': 'तरुण', 'nitin': 'नितीन', 'vipin': 'विपिन',
  'sumit': 'सुमित', 'lalit': 'ललित',
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
  'anjali': 'अंजली', 'swati': 'स्वाती', 'nisha': 'निशा',
  'usha': 'उषा', 'asha': 'आशा', 'disha': 'दिशा',
  'ritu': 'ऋतु', 'mitu': 'मितू', 'pintu': 'पिंटू',
  'rinku': 'रिंकू', 'tinku': 'टिंकू', 'bablu': 'बाबलू',
  'pappu': 'पप्पू', 'guddu': 'गुड्डू', 'munna': 'मुन्ना',

  // Common Maharashtrian surnames
  'sharma': 'शर्मा', 'verma': 'वर्मा', 'gupta': 'गुप्ता',
  'singh': 'सिंह', 'yadav': 'यादव', 'tiwari': 'तिवारी',
  'mishra': 'मिश्रा', 'pandey': 'पांडे', 'shukla': 'शुक्ला',
  'dwivedi': 'द्विवेदी', 'trivedi': 'त्रिवेदी', 'chaturvedi': 'चतुर्वेदी',
  'joshi': 'जोशी', 'patel': 'पटेल', 'shah': 'शहा',
  'mehta': 'मेहता', 'jain': 'जैन', 'agarwal': 'अग्रवाल',
  'aggarwal': 'अग्रवाल', 'bansal': 'बंसल', 'garg': 'गर्ग',
  'mittal': 'मित्तल', 'goyal': 'गोयल', 'jindal': 'जिंदल',
  'bajaj': 'बजाज', 'birla': 'बिर्ला', 'khanna': 'खन्ना',
  'kapoor': 'कपूर', 'malhotra': 'मल्होत्रा', 'chopra': 'चोप्रा',
  'mehra': 'मेहरा', 'bhatia': 'भाटिया', 'soni': 'सोनी',
  'naik': 'नाईक', 'patil': 'पाटील', 'desai': 'देसाई',
  'kulkarni': 'कुलकर्णी', 'deshpande': 'देशपांडे', 'jog': 'जोग',
  'thakur': 'ठाकूर', 'chauhan': 'चव्हाण', 'rawat': 'रावत',
  'rajput': 'राजपूत', 'rana': 'राणा', 'rathore': 'राठोड',
  'srivastava': 'श्रीवास्तव', 'saxena': 'सक्सेना', 'mathur': 'माथुर',
  'bose': 'बोस', 'das': 'दास', 'dey': 'डे',
  'mukherjee': 'मुखर्जी', 'chatterjee': 'चटर्जी', 'banerjee': 'बनर्जी',
  'sen': 'सेन', 'ghosh': 'घोष', 'roy': 'रॉय',
  'nair': 'नायर', 'pillai': 'पिल्लई', 'menon': 'मेनन',
  'iyer': 'अय्यर', 'iyengar': 'अयंगार', 'reddy': 'रेड्डी',
  'naidu': 'नायडू', 'rao': 'राव', 'murthy': 'मूर्ती',
  'kumar': 'कुमार', 'devi': 'देवी', 'bai': 'बाई',
  // Maharashtra-specific surnames
  'bhosale': 'भोसले', 'salve': 'साळवे',
  'pawar': 'पवार', 'jadhav': 'जाधव', 'gaikwad': 'गायकवाड',
  'more': 'मोरे', 'kadam': 'कदम', 'mane': 'माने',
  'rane': 'राणे', 'sawant': 'सावंत', 'thakre': 'ठाकरे',
  'shinde': 'शिंदे', 'waghmare': 'वाघमारे', 'kamble': 'कांबळे',
  'gavhane': 'गव्हाणे', 'suryawanshi': 'सूर्यवंशी', 'wagh': 'वाघ',
  'chavan': 'चव्हाण', 'kale': 'काळे', 'khaire': 'खैरे',
  'gore': 'गोरे', 'khare': 'खरे', 'dube': 'दुबे',
  'bendre': 'बेंद्रे', 'gadge': 'गाडगे', 'tupe': 'तुपे',
  'munde': 'मुंडे', 'zende': 'झेंडे', 'bondre': 'बोंद्रे',
  'dongre': 'डोंग्रे', 'ingole': 'इंगोले', 'nagpure': 'नागपुरे',

  // Occupations (Marathi)
  'engineer': 'अभियंता', 'doctor': 'डॉक्टर', 'teacher': 'शिक्षक',
  'lawyer': 'वकील', 'advocate': 'वकील', 'professor': 'प्राध्यापक',
  'farmer': 'शेतकरी', 'businessman': 'व्यापारी', 'business': 'व्यवसाय',
  'service': 'नोकरी', 'retired': 'निवृत्त', 'student': 'विद्यार्थी',
  'shopkeeper': 'दुकानदार', 'driver': 'चालक', 'contractor': 'कंत्राटदार',
  'accountant': 'लेखापाल', 'manager': 'व्यवस्थापक', 'director': 'संचालक',
  'clerk': 'लिपिक', 'officer': 'अधिकारी', 'inspector': 'निरीक्षक',
  'constable': 'शिपाई', 'police': 'पोलीस', 'nurse': 'परिचारिका',
  'housewife': 'गृहिणी', 'architect': 'वास्तुविशारद', 'builder': 'बांधकाम व्यावसायिक',
  'journalist': 'पत्रकार', 'banker': 'बँकर', 'writer': 'लेखक',
  'developer': 'विकसक', 'agent': 'एजंट',

  // Places (Nagpur / Maharashtra region - Marathi spellings)
  'nagpur': 'नागपूर', 'besa': 'बेसा', 'dabha': 'दाभा',
  'hingna': 'हिंगणा', 'butibori': 'बुटीबोरी', 'kamptee': 'कामठी',
  'wardha': 'वर्धा', 'amravati': 'अमरावती', 'yavatmal': 'यवतमाळ',
  'chandrapur': 'चंद्रपूर', 'gondia': 'गोंदिया', 'bhandara': 'भंडारा',
  'akola': 'अकोला', 'washim': 'वाशीम', 'gadchiroli': 'गडचिरोली',
  'karjat': 'कर्जत', 'pune': 'पुणे', 'mumbai': 'मुंबई',
  'delhi': 'दिल्ली', 'maharashtra': 'महाराष्ट्र',
  'nashik': 'नाशिक', 'aurangabad': 'औरंगाबाद', 'solapur': 'सोलापूर',
  'kolhapur': 'कोल्हापूर', 'sangli': 'सांगली', 'satara': 'सातारा',
  'ratnagiri': 'रत्नागिरी', 'sindhudurg': 'सिंधुदुर्ग', 'thane': 'ठाणे',
  'raigad': 'रायगड', 'palghar': 'पालघर', 'jalgaon': 'जळगाव',
  'dhule': 'धुळे', 'nandurbar': 'नंदुरबार', 'ahmednagar': 'अहमदनगर',
  'bid': 'बीड', 'latur': 'लातूर', 'osmanabad': 'उस्मानाबाद',
  'nanded': 'नांदेड', 'hingoli': 'हिंगोली', 'parbhani': 'परभणी',
  'jalna': 'जालना', 'buldhana': 'बुलढाणा', 'katol': 'काटोल',
  'saoner': 'सावनेर', 'narkhed': 'नरखेड', 'parseoni': 'पारशिवनी',
  'umred': 'उमरेड', 'ramtek': 'रामटेक', 'mauda': 'मौदा',
  'bhiwapur': 'भिवापूर', 'kuhi': 'कुही', 'kalmeshwar': 'कळमेश्वर',

  // Address keywords (Marathi)
  'plot': 'भूखंड', 'ward': 'प्रभाग', 'colony': 'वसाहत',
  'nagar': 'नगर', 'layout': 'लेआउट', 'road': 'रस्ता',
  'street': 'रस्ता', 'lane': 'गल्ली', 'near': 'जवळ',
  'behind': 'मागे', 'opposite': 'समोर', 'beside': 'बाजूला',
  'house': 'घर', 'flat': 'सदनिका', 'floor': 'मजला',
  'building': 'इमारत', 'complex': 'संकुल',
  'society': 'सोसायटी', 'apartment': 'अपार्टमेंट',
  'district': 'जिल्हा', 'taluka': 'तालुका', 'tehsil': 'तहसील',
  'village': 'गाव', 'city': 'शहर', 'town': 'नगर',
  'state': 'राज्य', 'india': 'भारत',
  'no': 'क्र', 'number': 'क्रमांक',

  // Relations / Identity (Marathi)
  father: 'वडील',
  mother: 'आई',
  son: 'मुलगा',
  daughter: 'मुलगी',
  husband: 'पती',
  wife: 'पत्नी',
  brother: 'भाऊ',
  sister: 'बहीण',
  grandfather: 'आजोबा',
  grandmother: 'आजी',

  // Common words in legal documents (Marathi)
  the: 'द',
  and: 'आणि',
  of: 'चे',
  in: 'मध्ये',
  on: 'वर',
  to: 'ला',
  for: 'साठी',
  by: 'द्वारे',
  with: 'सह',
  from: 'पासून',
  at: 'येथे',
  is: 'आहे',
  are: 'आहेत',
  was: 'होते',
  were: 'होते',
  this: 'हे',
  that: 'ते',
  sale: 'विक्री',
  deed: 'दस्तऐवज',
  agreement: 'करार',
  property: 'मालमत्ता',
  land: 'जमीन',
  area: 'क्षेत्रफळ',
  price: 'किंमत',
  amount: 'रक्कम',
  payment: 'भरणा',
  date: 'दिनांक',
  year: 'वर्ष',
  month: 'महिना',
  day: 'दिवस',
  rupees: 'रुपये',
  party: 'पक्षकार',
  seller: 'विक्रेता',
  buyer: 'खरेदीदार',
  witness: 'साक्षीदार',
  signature: 'सही',
  address: 'पत्ता',

  // Loanwords used in legal/office Marathi
  'testing': 'चाचणी',
  'cash': 'रोख',
  'online': 'ऑनलाइन',
  'cheque': 'धनादेश',
  'check': 'धनादेश',
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
  ritesh:    'रितेश',
  nilesh:    'नीलेश',
  hitesh:    'हितेश',
  paresh:    'परेश',
  umesh:     'उमेश',
  devesh:    'देवेश',
  satish:    'सतीश',
  harish:    'हरीश',
  manish:    'मनीष',
  ashish:    'आशीष',
  girish:    'गिरीश',
  yogesh:    'योगेश',
  vikas:     'विकास',
  vivek:     'विवेक',
  rahul:     'राहुल',
  ravi:      'रवी',
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
  vishnu:    'विष्णू',
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
  santosh:   'संतोष',
  dnyaneshwar: 'ज्ञानेश्वर',
  tukaram:   'तुकाराम',
  eknath:    'एकनाथ',
  namdev:    'नामदेव',
  vitthal:   'विठ्ठल',
  pandurang: 'पांडुरंग',
  balaji:    'बालाजी',
  dattatray: 'दत्तात्रय',
  vishwas:   'विश्वास',
  prasanna:  'प्रसन्न',
  shreeram:  'श्रीराम',
  shreepad:  'श्रीपाद',
  omkar:     'ओंकार',
  onkar:     'ओंकार',
  kedarnath: 'केदारनाथ',
  balwant:   'बळवंत',
  trimbak:   'त्र्यंबक',
  gowind:    'गोविंद',
  govind:    'गोविंद',
  ramchandra:'रामचंद्र',
  krishnaji: 'कृष्णाजी',
  narayan:   'नारायण',
  sadashiv:  'सदाशिव',
  shankar:   'शंकर',
  dadasaheb: 'दादासाहेब',
  annasaheb: 'अण्णासाहेब',
  appasaheb: 'अप्पासाहेब',
  babasaheb: 'बाबासाहेब',
  tatya:     'तात्या',
  nana:      'नाना',
  dada:      'दादा',
  baba:      'बाबा',

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
  preeti:    'प्रीती',
  jyoti:     'ज्योती',
  shanti:    'शांती',
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
  pratibha:  'प्रतिभा',
  smita:     'स्मिता',
  shobha:    'शोभा',
  sudha:     'सुधा',
  radharani: 'राधाराणी',
  vaishnavi: 'वैष्णवी',
  gauri:     'गौरी',
  rupali:    'रूपाली',
  mangal:    'मंगल',
  suvarna:   'सुवर्णा',
  sharada:   'शारदा',
  malati:    'मालती',
  sulabha:   'सुलभा',
  vrinda:    'वृंदा',
  revati:    'रेवती',
  meenakshi: 'मीनाक्षी',
  lalita:    'ललिता',
  suhasini:  'सुहासिनी',
  vaishali:  'वैशाली',
  kalyani:   'कल्याणी',
  shraddha:  'श्रद्धा',
  shradha:   'श्रद्धा',
  pranali:   'प्रणाली',
  pranita:   'प्रणिता',
  pallavi:   'पल्लवी',
  aparna:    'अपर्णा',
  manasi:    'मानसी',
  mugdha:    'मुग्धा',
  tejaswini: 'तेजस्विनी',

  // Surnames common in Nagpur / Maharashtra
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
  thakur:    'ठाकूर',
  singh:     'सिंह',
  pandey:    'पांडे',
  mishra:    'मिश्रा',
  tiwari:    'तिवारी',
  dubey:     'दुबे',
  yadav:     'यादव',
  soni:      'सोनी',
  patel:     'पटेल',
  mehta:     'मेहता',
  shah:      'शहा',
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
  chavan:    'चव्हाण',
  waghmare:  'वाघमारे',
  kamble:    'कांबळे',
  wagh:      'वाघ',
  kale:      'काळे',
  munde:     'मुंडे',
  bendre:    'बेंद्रे',
  ingole:    'इंगोले',
  nagpure:   'नागपुरे',
  dongre:    'डोंग्रे',
  suryawanshi: 'सूर्यवंशी',

  // Nagpur / Vidarbha place names (Marathi spellings)
  wardha:    'वर्धा',
  amravati:  'अमरावती',
  yavatmal:  'यवतमाळ',
  akola:     'अकोला',
  washim:    'वाशीम',
  bhandara:  'भंडारा',
  gondia:    'गोंदिया',
  chandrapur:'चंद्रपूर',
  gadchiroli:'गडचिरोली',
  butibori:  'बुटीबोरी',
  hingna:    'हिंगणा',
  kamptee:   'कामठी',
  katol:     'काटोल',
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
// Marathi uses the same Devanagari script as Hindi — matra forms are identical.

const matraMap: Record<string, string> = {
  'aa': 'ा',
  'a':  '',
  'ee': 'ी',
  'ii': 'ी',
  'i':  'ि',
  'oo': 'ू',
  'uu': 'ू',
  'u':  'ु',
  'ai': 'ै',
  'au': 'ौ',
  'e':  'े',
  'o':  'ो',
  'ri': 'ृ',
  'an': 'ं',
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

// Consonant map — Marathi uses same Devanagari consonants as Hindi
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
  'ng':  'ं',
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
};

// Vowel token list (sorted longest-first for greedy matching)
const vowelTokens = Object.keys(matraMap).sort((a, b) => b.length - a.length);
// Consonant token list (sorted longest-first)
const consonantTokens = Object.keys(consonantMap).sort((a, b) => b.length - a.length);

// ─── Core Phonetic Engine ─────────────────────────────────────────────────────

function matchVowel(str: string, i: number): string | null {
  for (const vt of vowelTokens) {
    if (str.startsWith(vt, i)) return vt;
  }
  return null;
}

function matchConsonant(str: string, i: number): string | null {
  for (const ct of consonantTokens) {
    if (str.startsWith(ct, i)) return ct;
  }
  return null;
}

function phoneticTransliterate(word: string): string {
  const s = word.toLowerCase();
  let result = '';
  let i = 0;
  let afterConsonant = false;

  while (i < s.length) {
    const cToken = matchConsonant(s, i);
    if (cToken) {
      if (afterConsonant) {
        const nextI = i + cToken.length;
        const nextVowel = matchVowel(s, nextI);
        const nextCons = !nextVowel ? matchConsonant(s, nextI) : null;

        if (nextCons && !nextVowel) {
          result += '्' + consonantMap[cToken];
        } else {
          result += '्' + consonantMap[cToken];
        }
      } else {
        result += consonantMap[cToken];
        afterConsonant = true;
      }
      i += cToken.length;
      continue;
    }

    const vToken = matchVowel(s, i);
    if (vToken) {
      if (afterConsonant) {
        result += matraMap[vToken] ?? '';
      } else {
        result += standaloneVowelMap[vToken] ?? vToken;
      }
      afterConsonant = false;
      i += vToken.length;
      continue;
    }

    if (/[0-9]/.test(s[i])) {
      result += '०१२३४५६७८९'[Number(s[i])];
      afterConsonant = false;
      i++;
      continue;
    }

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
    .replace(/[^\w]/g, '');

  // eslint-disable-next-line no-useless-escape
  const trailMatch = clean.match(/^(.*?)([.,;:!?()\-\/\\]+)$/);
  const core = trailMatch ? trailMatch[1] : clean;
  const trail = trailMatch ? trailMatch[2] : '';

  if (!core) return word;

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

export const convertNumberToMarathi = (value?: number | string): string => {
  if (value === undefined || value === null || value === '') return '';
  const str = String(value);
  if (!isNaN(Number(str))) {
    return Number(str)
      .toLocaleString('en-IN')
      .replace(/[0-9]/g, d => '०१२३४५६७८९'[Number(d)]);
  }
  return str.replace(/[0-9]/g, d => '०१२३४५६७८९'[Number(d)]);
};

export const convertToMarathi = (input: any): string => {
  let normalized = normalizeInput(input);

  if (normalized === 'उपलब्ध नाही') return normalized;

  // ✅ PHRASE MATCH (LONGEST FIRST + SAFE)
  Object.keys(phraseMapMarathi)
    .sort((a, b) => b.length - a.length)
    .forEach(key => {
      normalized = normalized.replace(
        new RegExp(`\\b${key}\\b`, 'gi'),
        phraseMapMarathi[key]
      );
    });

  // ✅ BRAND LOCK (CRITICAL)
  normalized = normalized.replace(/ashray\s+group/gi, 'आश्रय ग्रुप');

  return normalized
    .split(/(\s+)/)
    .map(token =>
      /^\s+$/.test(token)
        ? token
        : /^[\u0900-\u097F]+$/.test(token) // already Marathi/Hindi → keep
        ? token
        : transliterateWord(token)
    )
    .join('');
};

/**
 * Teach the engine a new word. Persists across sessions.
 */
export const learnWord = (english: string, marathi: string): void => {
  if (!english || !marathi) return;
  const key = english.toLowerCase().trim();
  memoryCache[key] = marathi.trim();
  saveMemory(memoryCache);
};

/**
 * Batch-teach multiple word pairs at once.
 */
export const learnWords = (pairs: Array<[string, string]>): void => {
  for (const [en, mr] of pairs) learnWord(en, mr);
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
export const resetMarathiEngine = (): void => {
  memoryCache = {};
  saveMemory(memoryCache);
};

export const convertNameWithTitle = (
  name?: string,
  title?: string
): string => {
  if (!name) return '';

  const safeName = convertToMarathi(name.trim());

  if (!title || title.trim() === '') {
    return safeName;
  }

  const titleKey = title
    .toLowerCase()
    .replace('.', '')
    .trim();

  const titleMap: Record<string, string> = {
    mr:   'श्री',
    mrs:  'श्रीमती',
    miss: 'कु',
    ms:   'सौ',
    sau:  'सौ',
    ku:   'कु',
  };

  const marathiTitle = titleMap[titleKey] || convertToMarathi(title);

  return `${marathiTitle} ${safeName}`.trim();
};

const phraseMapMarathi: Record<string, string> = {

  // --- SOLE PROPRIETORSHIP ---
  'sole proprietorship': 'एकल मालकी',
  'sole proprietor': 'एकल मालक',
  'proprietorship': 'एकल मालकी',

  // SHORT FORMS
  's.p.': 'सो. प्रो.',
  'sp': 'सो. प्रो.',
  'sole prop': 'सो. प्रो.',
  'proprietor': 'मालक',

  // --- PRIVATE LIMITED ---
  'private limited company': 'खाजगी मर्यादित कंपनी',
  'private limited': 'खाजगी मर्यादित कंपनी',
  'pvt ltd company': 'खाजगी मर्यादित कंपनी',
  'pvt ltd': 'खाजगी मर्यादित कंपनी',

  // SHORT FORM (LEGAL STANDARD)
  'pvt. ltd.': 'प्रा. लि.',
  'pvt. ltd': 'प्रा. लि.',
  'pvt ltd.': 'प्रा. लि.',

  // --- PUBLIC LIMITED ---
  'public limited company': 'सार्वजनिक मर्यादित कंपनी',
  'public limited': 'सार्वजनिक मर्यादित कंपनी',
  'ltd company': 'सार्वजनिक मर्यादित कंपनी',

  'ltd.': 'लिमिटेड',
  'ltd': 'लिमिटेड',

  // --- PARTNERSHIP ---
  'partnership firm': 'भागीदारी फर्म',
  'partnership': 'भागीदारी फर्म',
  'firm': 'फर्म',

  'p.f.': 'पी.एफ.',
  'pf': 'पी.एफ.',

  // --- LLP ---
  'limited liability partnership': 'मर्यादित दायित्व भागीदारी',
  'llp': 'एलएलपी',
  'l.l.p.': 'एलएलपी',

  // --- OTHER ---
  'other': 'इतर',
  'others': 'इतर',
};

export const convertGender = (gender?: string): string => {
  if (!gender) return '';
  const key = gender.toLowerCase().trim();
  return genderMap[key] || convertToMarathi(gender);
};

export const formatMarathiDate = (dateStr?: string): string => {
  if (!dateStr) return '';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    const months = ['जानेवारी','फेब्रुवारी','मार्च','एप्रिल','मे','जून','जुलै','ऑगस्ट','सप्टेंबर','ऑक्टोबर','नोव्हेंबर','डिसेंबर'];
    return `${convertNumberToMarathi(String(d.getDate()))} ${months[d.getMonth()]} ${convertNumberToMarathi(String(d.getFullYear()))}`;
  } catch { return dateStr; }
};

export const formatAadhaarMarathi = (aadhaar?: string): string => {
  if (!aadhaar) return '';

  const clean = String(aadhaar).replace(/\D/g, '');

  const formatted = clean
    .replace(/(\d{4})(?=\d)/g, '$1 ')
    .trim();

  return convertNumberToMarathi(formatted);
};