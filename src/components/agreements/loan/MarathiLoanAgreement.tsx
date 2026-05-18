import React from 'react';
import { PrintFooter } from '../../../../components/Printpreview';
import {
  convertNumberToMarathi,
} from '../../../engine/EnglishToMarathiEngine';

interface ClientData {
  title?: string;
  name: string;
  age?: string | number;
  occupation?: string;
  phone: string;
  email?: string;
  aadhaar?: string;
  pan?: string;
  address?: string;
  fatherHusbandName?: string;
  folderSerial?: string;
  clientId?: string;
}

interface CompanyData {
  companyName?: string;
  entityType?: string;
  companyEmail?: string;
  companyWebsite?: string;
  licenseRegistrationNumber?: string;
  companyAddress?: string;
  companyLocality?: string;
  companyDistrict?: string;
  companyState?: string;
  companyPincode?: string;
}

interface ManagerData {
  managerName?: string;
  managerPosition?: string;
  managerAddress?: string;
  managerPAN?: string;
  managerAadhaar?: string;
  managerPhone?: string;
  managerCountryCode?: string;
}

interface GuarantorData {
  name: string;
  phone: string;
  relation: string;
  address?: string;
  aadhaar?: string;
  pan?: string;
}

interface AgreementData {
  client: ClientData;
  company: CompanyData;
  manager?: ManagerData;
  guarantors?: GuarantorData[];
  loanAmount?: string | number;
  loanDuration?: string;
  loanDate?: string;
  loanPurpose?: string;
  repaymentMode?: string;
  interestRate?: string;
  interestType?: string;
  monthlyEMI?: string | number;
  collateral?: string;
  collateralType?: string;
  collateralValue?: string | number;
  collateralDetails?: string;
  loanId?: string;
}

const formatMarathiDate = (dateStr?: string) => {
  if (!dateStr) return '________';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return convertNumberToMarathi(dateStr);
  const monthsMarathi = ['जानेवारी', 'फेब्रुवारी', 'मार्च', 'एप्रिल', 'मे', 'जून', 'जुलै', 'ऑगस्ट', 'सप्टेंबर', 'ऑक्टोबर', 'नोव्हेंबर', 'डिसेंबर'];
  return `${convertNumberToMarathi(date.getDate())} ${monthsMarathi[date.getMonth()]} ${convertNumberToMarathi(date.getFullYear())}`;
};

const safe = (v?: any) => (!v || v === '') ? '____________________' : String(v);

const formatAmount = (v?: string | number) => {
  if (!v) return '________';
  return convertNumberToMarathi(Number(v).toLocaleString('en-IN'));
};

const numberToWordsMarathi = (num: number): string => {
  if (num === 0) return 'शून्य';
  const ones = ['', 'एक', 'दोन', 'तीन', 'चार', 'पाच', 'सहा', 'सात', 'आठ', 'नऊ', 'दहा', 'अकरा', 'बारा', 'तेरा', 'चौदा', 'पंधरा', 'सोळा', 'सतरा', 'अठरा', 'एकोणीस'];
  const tens = ['', '', 'वीस', 'तीस', 'चाळीस', 'पन्नास', 'साठ', 'सत्तर', 'ऐंशी', 'नव्वद'];
  const convertBelowHundred = (n: number): string => {
    if (n === 0) return '';
    if (n < 20) return ones[n];
    return tens[Math.floor(n / 10)] + (n % 10 ? ' ' + ones[n % 10] : '');
  };
  const convert = (n: number): string => {
    if (n === 0) return '';
    const crore = Math.floor(n / 10000000);
    const lakh = Math.floor((n % 10000000) / 100000);
    const thousand = Math.floor((n % 100000) / 1000);
    const hundred = Math.floor((n % 1000) / 100);
    const remainder = n % 100;
    let result = '';
    if (crore) result += convertBelowHundred(crore) + ' कोटी ';
    if (lakh) result += convertBelowHundred(lakh) + ' लाख ';
    if (thousand) result += convertBelowHundred(thousand) + ' हजार ';
    if (hundred) result += convertBelowHundred(hundred) + ' शे ';
    if (remainder) result += convertBelowHundred(remainder);
    return result.trim();
  };
  return convert(Math.floor(num)) + ' फक्त';
};

const sharedStyles = `
  .a4-page {
    width: 210mm;
    min-height: 297mm;
    margin: 0 auto;
    background: white;
    padding: 15mm 18mm;
    box-sizing: border-box;
    page-break-after: always;
    box-shadow: 0 0 10px rgba(0,0,0,0.1);
    font-family: 'Noto Sans Devanagari', 'Mangal', 'Arial Unicode MS', serif;
    position: relative;
    line-height: 1.7;
  }
  @media print {
    @page { size: A4; margin: 0; }
    html, body { width: 210mm; margin: 0; padding: 0; background: white; }
    body * { visibility: hidden; }
    #printable-document, #printable-document * { visibility: visible; }
    #printable-document { position: absolute; left: 0; top: 0; width: 210mm; }
    .a4-page { width: 210mm; min-height: 297mm; padding: 15mm 18mm; margin: 0; box-shadow: none; page-break-after: always; }
    .a4-page:last-child { page-break-after: auto; }
    .no-print { display: none !important; }
    * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
  }
  .agreement-title {
    text-align: center;
    font-size: 22px;
    font-weight: 800;
    text-decoration: underline;
    text-underline-offset: 5px;
    margin: 30px 0 10px 0;
    letter-spacing: 1.5px;
  }
  .sub-title {
    text-align: center;
    font-size: 14px;
    font-weight: 600;
    color: #444;
    margin-bottom: 30px;
  }
  .clause {
    font-size: 13px;
    line-height: 2.0;
    text-align: justify;
    margin-bottom: 12px;
  }
  .clause-num {
    font-weight: 800;
  }
  .sig-section {
    display: flex;
    justify-content: space-between;
    margin-top: 40px;
    gap: 30px;
  }
  .sig-block {
    flex: 1;
    font-size: 13px;
  }
  .sig-line {
    border-bottom: 1px solid #000;
    min-height: 50px;
    margin: 8px 0;
  }
  .sig-label {
    font-weight: 700;
    font-size: 13px;
  }
  .end-text {
    text-align: center;
    font-weight: 800;
    font-size: 14px;
    margin-top: 30px;
    letter-spacing: 3px;
  }
  .loan-terms-table {
    width: 100%;
    border-collapse: collapse;
    margin: 20px 0;
    font-size: 13px;
  }
  .loan-terms-table td {
    padding: 6px 10px;
    border: 1px solid #ccc;
  }
  .loan-terms-table td:first-child {
    font-weight: 700;
    width: 40%;
    background: #f9f9f9;
  }
  .doc-id-bar {
    padding: 6px 10px;
    background: #fef9c3;
    border: 1px solid #fde047;
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 11px;
    font-weight: 600;
    font-family: monospace;
    margin-bottom: 6px;
  }
  .witness-section {
    margin-top: 30px;
    font-size: 13px;
  }
`;

const MarathiLoanAgreement: React.FC<{ data: AgreementData }> = ({ data, companyLogo, companyWatermark }) => {
  const borrowerName = [data.client.title, data.client.name].filter(Boolean).join(' ');
  const lenderDisplay = `${data.company.companyName || ''}${data.company.entityType ? ` (${data.company.entityType})` : ''}`;
  const borrowerAddress = data.client.address || '';
  const companyFullAddress = [data.company.companyAddress, data.company.companyLocality, data.company.companyDistrict, data.company.companyState].filter(Boolean).join(', ') + (data.company.companyPincode ? ` - ${data.company.companyPincode}` : '');
  const agreementDate = formatMarathiDate(data.loanDate);
  const amountNum = Number(data.loanAmount) || 0;
  const amountWords = numberToWordsMarathi(amountNum);

  return (
    <div id="printable-document" className="flex flex-col items-center">
      <style>{sharedStyles}</style>
      <div className="a4-page" style={{ position: "relative" }}>
  {/* WATERMARK */}
  <div
  style={{
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",

    display: "flex",
    alignItems: "flex-end",  
    justifyContent: "center",
    paddingBottom: "170px",  

    opacity: 0.08,
    zIndex: 0,
    pointerEvents: "none",
  }}
>
  <img
    src={companyWatermark || companyLogo || ''}
    style={{
      width: "70%",
      maxWidth: "720px",
      height: "auto",
      objectFit: "contain",
    }}
  />
</div>

  {/* CONTENT */}
  <div style={{ position: "relative", zIndex: 1 }}>

          {/* HEADER */}
          <div className="border-b-[3px] border-[#D9001B] pb-4 mb-6">
            {/* Top Row: Reg No & Est */}
            <div className="flex justify-between items-center text-[12px] font-bold text-slate-700 tracking-wide mb-3">
              <div>REG NO: {data.company?.licenseRegistrationNumber?.toUpperCase()}</div>
              <div>EST. 2019</div>
            </div>

            <div className="flex justify-between items-start">
              {/* Left Column: Brand & Details */}
              <div className="flex flex-col text-left">
                <span
  className="text-[52px] font-extrabold font-serif leading-tight gradient-text"
>
  Ashray Group
</span>

                <div className="text-[13px] text-slate-800 mt-3 font-medium max-w-[480px] leading-relaxed">
                  {[data.company.companyAddress, data.company.companyLocality, data.company.companyDistrict, data.company.companyState].filter(Boolean).join(', ')}{data.company.companyPincode ? ` - ${data.company.companyPincode}` : ''}.
                </div>

                <div className="flex flex-wrap gap-2 text-[12px] font-bold text-slate-600 mt-2">
                  <span>Mob: {(data.manager?.managerPhone || data.company?.managerPhone)}</span>
                  <span className="text-slate-300">|</span>
                  <span>Mail: {data.company?.companyEmail}</span>
                  <span className="text-slate-300">|</span>
                  <span>Web: {data.company?.companyWebsite}</span>
                </div>
              </div>

              {/* Right Column: Logo */}
              <div className="flex flex-col items-end text-right">
                {companyLogo && (
                  <img
                    src={companyLogo}
                    style={{
                      width: "95px",
                      height: "95px",
                      objectFit: "contain",
                    }}
                    alt="Company Logo"
                  />
                )}
	          </div>
	        </div>
		        </div>

          <div className="doc-id-bar">
            <span className="font-mono">{`${data.client.folderSerial || ''}-${data.client.clientId || data.loanId || ''}-LOAN-AGR`}</span>
            <span><strong>दिनांक : </strong>{agreementDate}</span>
          </div>

          <div className="agreement-title">कर्ज करार</div>
          <div className="sub-title">(कर्जदाता आणि कर्जदार यांच्यातील सर्वसाधारण खाजगी कर्ज करार)</div>

          <div className="clause" style={{ marginBottom: '18px' }}>
            हा कर्ज करार (ज्याला यापुढे <strong>"करार"</strong> म्हणून संबोधले जाईल) दिनांक <strong>{agreementDate}</strong> रोजी <strong>{data.company.companyDistrict || '________'}</strong> येथे करण्यात आला आहे.
          </div>

          <div className="clause" style={{ marginBottom: '6px' }}>
            <strong>पक्षकार :</strong>
          </div>
          <div className="clause">
            <strong>{lenderDisplay}</strong>, ज्यांचे नोंदणीकृत कार्यालय {companyFullAddress} येथे आहे (ज्यांना यापुढे <strong>"कर्जदाता"</strong> म्हणून संबोधले जाईल, ज्यामध्ये त्यांचे उत्तराधिकारी आणि नियुक्तीधारक यांचा समावेश आहे) — <strong>प्रथम पक्ष</strong>.
          </div>

          <div className="clause" style={{ marginTop: '10px' }}>
            <strong>{borrowerName}</strong>{data.client.fatherHusbandName ? `, पुत्र/पती ${data.client.fatherHusbandName}` : ''}, वय: {safe(data.client.age)} वर्षे, व्यवसाय: {safe(data.client.occupation)}, आधार: {safe(data.client.aadhaar)}, पॅन: {safe(data.client.pan)}, पत्ता: {borrowerAddress} (ज्यांना यापुढे <strong>"कर्जदार"</strong> म्हणून संबोधले जाईल, ज्यामध्ये त्यांचे वारस, कायदेशीर प्रतिनिधी, उत्तराधिकारी आणि नियुक्तीधारक यांचा समावेश आहे) — <strong>द्वितीय पक्ष</strong>.
          </div>

          <div style={{ marginTop: '20px', textAlign: 'center', fontWeight: 800, fontSize: '16px', textDecoration: 'underline', textUnderlineOffset: '4px', marginBottom: '16px' }}>
            हा करार खालीलप्रमाणे साक्षीत आहे :
          </div>

          <table className="loan-terms-table">
            <tbody>
              <tr><td>कर्जाची रक्कम (मुद्दल)</td><td>₹ {formatAmount(data.loanAmount)} /- ({amountWords})</td></tr>
              <tr><td>कर्जाचा उद्देश</td><td>{safe(data.loanPurpose)}</td></tr>
              <tr><td>वितरणाची तारीख</td><td>{agreementDate}</td></tr>
              <tr><td>कर्जाचा कालावधी</td><td>{safe(data.loanDuration)}</td></tr>
              <tr><td>व्याज दर</td><td>{safe(data.interestRate)}</td></tr>
              <tr><td>व्याजाचा प्रकार</td><td>{safe(data.interestType)}</td></tr>
              <tr><td>परतफेडीची पद्धत</td><td>{safe(data.repaymentMode)}</td></tr>
              <tr><td>मासिक हप्ता (ईएमआय)</td><td>₹ {formatAmount(data.monthlyEMI)} /-</td></tr>
            </tbody>
          </table>

          <div className="clause">
            <span className="clause-num">१. </span>
            <strong>कर्ज मंजूरी :</strong> कर्जदात्याने कर्जदाराला ₹ {formatAmount(data.loanAmount)}/- (रुपये {amountWords}) चे कर्ज {safe(data.loanPurpose)} या उद्देशासाठी दिले आहे आणि कर्जदाराने ते स्वीकारले आहे. कर्जदार या कराराच्या तारखेला पूर्ण कर्ज रक्कम मिळाल्याचे मान्य करतो.
          </div>

          <div className="clause">
            <span className="clause-num">२. </span>
            <strong>परतफेडीच्या अटी :</strong> कर्जदार कर्जाची रक्कम {safe(data.interestRate)} या व्याज दराने ({safe(data.interestType)} व्याज आधारावर) कर्जदात्याला निर्धारित परतफेड वेळापत्रकानुसार परत करण्याचे वचन देतो. कर्जदार दरमहा ₹ {formatAmount(data.monthlyEMI)}/- किंवा परस्पर सहमतीने ठरवलेली अन्य रक्कम भरेल जोपर्यंत संपूर्ण कर्ज रक्कम आणि उपार्जित व्याज पूर्ण भरले जात नाही. कर्जदार कोणत्याही वेळी आंशिक किंवा पूर्ण कर्जाची आगाऊ परतफेड कोणत्याही शुल्काशिवाय करू शकतो.
          </div>

          <div className="clause">
            <span className="clause-num">३. </span>
            <strong>व्याज :</strong> व्याजाची गणना थकबाकी मुद्दल रकमेवर {safe(data.interestRate)} दराने {safe(data.interestType)} व्याज आधारावर केली जाईल. व्याज वितरणाच्या तारखेपासून पूर्ण परतफेडीच्या तारखेपर्यंत उपार्जित होईल. कोणत्याही हप्त्याच्या भरणामध्ये चूक झाल्यास, कर्जदात्याला {safe(data.interestRate)} प्रति वर्षापेक्षा जास्त नसलेल्या दराने अतिरिक्त व्याज आकारण्याचा अधिकार राहील.
          </div>

          <div className="clause">
            <span className="clause-num">४. </span>
            <strong>कर्जाचा उद्देश :</strong> कर्जदार प्रतिनिधित्व आणि हमी देतो की कर्जाची रक्कम केवळ {safe(data.loanPurpose)} या उद्देशासाठी वापरली जाईल. कर्जदार कर्जाची रक्कम कोणत्याही बेकायदेशीर, सट्टेबाजी किंवा निषिद्ध उद्देशासाठी वळवणार नाही किंवा वापरणार नाही. कर्जदात्याला कोणत्याही योग्य वेळी कर्ज रकमेच्या वापराची पडताळणी करण्याचा अधिकार असेल.
          </div>

          {data.collateralType && data.collateralType !== 'NON_COLLATERAL' ? (
            <div className="clause">
              <span className="clause-num">५. </span>
              <strong>तारण सुरक्षा :</strong> कर्जदाराने {safe(data.collateralType)} या स्वरूपात अंदाजे ₹ {formatAmount(data.collateralValue)}/- किमतीची तारण सुरक्षा प्रदान केली आहे. तपशील: {safe(data.collateralDetails)}. कर्जदार सहमत आहे की कर्जदाता कर्ज रक्कम आणि सर्व उपार्जित व्याजाच्या पूर्ण परतफेडपर्यंत तारण सुरक्षा म्हणून ठेवेल. चूक झाल्यास, कर्जदात्याला तारण रोखीकृत करून थकबाकी वसूल करण्याचा अधिकार असेल.
            </div>
          ) : (
            <div className="clause">
              <span className="clause-num">५. </span>
              <strong>सुरक्षा :</strong> हे कर्ज कर्जदाराच्या विश्वासार्हता आणि पत यावर आधारित असुरक्षित वैयक्तिक कर्ज आहे. कर्जदार सहमत आहे की हा करार कर्जाचा पुरेसा पुरावा असेल आणि कर्जदारास बंधनकारक असेल.
            </div>
          )}

          <div className="clause">
            <span className="clause-num">६. </span>
            <strong>चूक आणि परिणाम :</strong> जर कर्जदार ठरलेल्या वेळेत कोणताही हप्ता भरला नाही तर कर्जदार चूककर्ता मानला जाईल. चूक झाल्यास, कर्जदाता संपूर्ण थकबाकी कर्ज रक्कम उपार्जित व्याजासह त्वरित परत मागू शकतो. कर्जदार थकबाकी वसुलीसाठी कर्जदात्याने केलेल्या सर्व खर्चांसाठी, ज्यामध्ये कायदेशीर खर्च समाविष्ट आहे, जबाबदार राहील.
          </div>

          <div className="clause">
            <span className="clause-num">७. </span>
            <strong>प्रतिनिधित्व आणि हमी :</strong> कर्जदार प्रतिनिधित्व आणि हमी देतो की कर्जदात्याला दिलेली सर्व माहिती, ज्यामध्ये वैयक्तिक तपशील, ओळख दस्तऐवज, आर्थिक माहिती आणि इतर कोणतीही माहिती सत्य, पूर्ण आणि अचूक आहे. कर्जदार त्याच्या संपर्क तपशील, पत्ता किंवा इतर संबंधित माहितीमध्ये कोणत्याही बदलाची त्वरित कर्जदात्याला सूचित करण्यास सहमत आहे.
          </div>

          {data.guarantors && data.guarantors.length > 0 && data.guarantors.some(g => g.name) && (
            <>
              <div className="clause">
                <span className="clause-num">८. </span>
                <strong>जामीनदाराची वचनबद्धता :</strong> खालील व्यक्ती कर्ज रकमेसाठी जामीनदार म्हणून उभ्या राहिल्या आहेत आणि त्याच्या परतफेडीची हमी देतात:
                <table className="loan-terms-table" style={{ marginTop: '10px' }}>
                  <tbody>
                    {data.guarantors.filter(g => g.name).map((g, i) => (
                      <tr key={i}><td>जामीनदार {i + 1}</td><td>{g.name} | संबंध: {g.relation} | फोन: {g.phone}{g.aadhaar ? ` | आधार: ${g.aadhaar}` : ''}{g.pan ? ` | पॅन: ${g.pan}` : ''}</td></tr>
                    ))}
                  </tbody>
                </table>
                प्रत्येक जामीनदार कर्जदात्याला अपरिवर्तनीय आणि बिनशर्त हमी देतो की कर्ज रक्कम आणि सर्व व्याज तसेच इतर देय रकमांचा पूर्ण आणि वेळेवर भरणा केला जाईल. जामीनदार सहमत आहेत की त्यांची देयता कर्जदारासह संयुक्त आणि पृथक असेल आणि कर्जदात्याने कर्जदाराला दिलेल्या कोणत्याही सूट किंवा सवलतीमुळे प्रभावित होणार नाही.
              </div>
              <div className="clause">
                <span className="clause-num">९. </span>
                <strong>जामीनदाराची जबाबदारी :</strong> जामीनदार वचन देतात की कर्जदाराने चूक केल्यास, कर्जदात्याला प्रथम कर्जदाराविरुद्ध कारवाई न करता किंवा इतर कोणतीही सुरक्षा न वापरता जामीनदारांकडून संपूर्ण थकबाकी रक्कम मागण्याचा आणि वसूल करण्याचा अधिकार असेल. जामीनदार ही हमी लागू करण्यापूर्वी कर्जदाराविरुद्ध कारवाई करण्याची आवश्यकता असलेल्या कोणत्याही अधिकाराचा त्याग करतात.
              </div>
            </>
          )}

          <div className="clause">
            <span className="clause-num">{data.guarantors && data.guarantors.some(g => g.name) ? '१०' : '८'}. </span>
            <strong>सूचना :</strong> या कराराअंतर्गत द्यावयाची कोणतीही सूचना किंवा संवाद ईमेल, नोंदणीकृत टपालाद्वारे किंवा वैयक्तिकरित्या पक्षकाराच्या पत्त्यावर पाठवल्यास ती योग्यरित्या देण्यात आली आहे असे मानले जाईल.
          </div>

          <div className="clause">
            <span className="clause-num">{data.guarantors && data.guarantors.some(g => g.name) ? '११' : '९'}. </span>
            <strong>प्रशासकीय कायदा आणि अधिकारक्षेत्र :</strong> या करारावर भारताच्या कायद्यांद्वारे शासन आणि व्याख्या केली जाईल. {data.company.companyDistrict || data.company.companyState || '________'} येथील न्यायालयांना या करारातून उद्भवणाऱ्या किंवा संबंधित कोणत्याही बाबींवर अनन्य अधिकारक्षेत्र असेल.
          </div>

          <div className="clause">
            <span className="clause-num">{data.guarantors && data.guarantors.some(g => g.name) ? '१२' : '१०'}. </span>
            <strong>नुकसानभरपाई :</strong> कर्जदार कर्जदात्याला या कराराअंतर्गत कर्जदाराच्या प्रतिनिधित्व, हमी किंवा जबाबदाऱ्यांच्या कोणत्याही उल्लंघनामुळे उद्भवणाऱ्या किंवा संबंधित सर्व नुकसान, दावे, हानी, देयता, खर्च आणि खर्चांपासून मुक्त ठेवण्यास आणि नुकसानभरपाई देण्यास सहमत आहे.
          </div>

          <div className="clause">
            <span className="clause-num">{data.guarantors && data.guarantors.some(g => g.name) ? '१३' : '११'}. </span>
            <strong>संपूर्ण करार :</strong> हा करार त्याच्या विषय सामग्रीच्या संदर्भात पक्षकारांमधील संपूर्ण करार आहे आणि सर्व पूर्व वाटाघाटी, प्रस्तुतीकरण आणि करार, मग ते तोंडी असोत किंवा लेखी, रद्द करतो. या करारातील कोणताही बदल किंवा सुधारणा तोपर्यंत बंधनकारक राहणार नाही जोपर्यंत तो लेखी स्वरूपात नसेल आणि दोन्ही पक्षकारांनी स्वाक्षरी केलेला नसेल.
          </div>

          <div className="clause">
            <span className="clause-num">{data.guarantors && data.guarantors.some(g => g.name) ? '१४' : '१२'}. </span>
            <strong>पृथक्करणीयता :</strong> जर या करारातील कोणतीही तरतूद अवैध, बेकायदेशीर किंवा अंमलात आणता येण्याजोगी नसल्यास, उर्वरित तरतुदींची वैधता, कायदेशीरता आणि अंमलबजावणीक्षमता कोणत्याही प्रकारे प्रभावित किंवा कमी होणार नाही.
          </div>

          <div style={{ marginTop: '24px', fontSize: '13px', fontStyle: 'italic', textAlign: 'center' }}>
            त्याप्रमाणे पक्षकारांनी या करारावर वर नमूद केलेल्या पहिल्या तारखेला स्वाक्षऱ्या केल्या आहेत.
          </div>

          <div className="sig-section">
            <div className="sig-block">
              <div className="sig-label">कर्जदार (BORROWER)</div>
              <div className="sig-line" />
              <div>नाव: {borrowerName}</div>
              <div>आधार: {safe(data.client.aadhaar)}</div>
              <div>दिनांक: {agreementDate}</div>
            </div>
            <div className="sig-block" style={{ textAlign: 'center' }}>
              <div className="sig-label">कर्जदाता / कार्यालय शिक्का</div>
              <div className="sig-line" />
              <div>{lenderDisplay} तर्फे</div>
            </div>
            <div className="sig-block" style={{ textAlign: 'right' }}>
              <div className="sig-label">अधिकृत स्वाक्षरीकर्ता (कर्जदाता)</div>
              <div className="sig-line" />
              <div>(M H Vicky / Vikrant Rana)</div>
              <div>मालक व लेखा / प्रशासन प्रमुख</div>
              <div>{lenderDisplay}</div>
              <div>दिनांक: {agreementDate}</div>
            </div>
          </div>

          <div className="witness-section">
            <strong>साक्षीदार :</strong>
            <div style={{ display: 'flex', gap: '40px', marginTop: '10px' }}>
              <div style={{ flex: 1 }}>
                (अ) <span style={{ borderBottom: '1px solid #000', display: 'inline-block', minWidth: '160px' }} />
              </div>
              <div style={{ flex: 1 }}>
                (ब) <span style={{ borderBottom: '1px solid #000', display: 'inline-block', minWidth: '160px' }} />
              </div>
            </div>
          </div>

          {data.guarantors && data.guarantors.filter(g => g.name).length > 0 && (
            <div className="sig-section" style={{ marginTop: '40px' }}>
              {data.guarantors.filter(g => g.name).map((g, i) => (
                <div key={i} className="sig-block">
                  <div className="sig-label">जामीनदार {i + 1} — {g.name}</div>
                  <div className="sig-line" />
                  <div>संबंध: {g.relation}</div>
                  <div>फोन: {g.phone}</div>
                  <div>दिनांक: {agreementDate}</div>
                </div>
              ))}
            </div>
          )}

          <div className="end-text">* * * करार समाप्त * * *</div>
        </div>
        <PrintFooter />
      </div>
    </div>
  );
};

export default MarathiLoanAgreement;