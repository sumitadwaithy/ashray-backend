import React from 'react';
import { PrintFooter } from '../../../../components/Printpreview';
import {
  convertNumberToHindi,
} from '../../../engine/EnglishToHindiEngine';

interface InvestorData {
  title?: string;
  name: string;
  fatherName?: string;
  age?: string | number;
  gender?: string;
  occupation?: string;
  phone: string;
  email?: string;
  aadhaar?: string;
  pan?: string;
  address: string;
  district?: string;
  state?: string;
  pincode?: string;
  clientId?: string;
  folderSerial?: string;
}

interface InvestmentData {
  projectName?: string;
  propertyType?: string;
  plotNumber?: string;
  area?: string;
  totalAmount?: string | number;
  tokenAmount?: string | number;
  bookingDate?: string;
  interestRate?: string | number;
  emiDuration?: string | number;
  paymentMode?: string;
  locality?: string;
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
  managerPhone?: string;
  managerCountryCode?: string;
}

interface NomineeData {
  name?: string;
  age?: string | number;
  relation?: string;
  aadhaar?: string;
}

interface AgreementData {
  client: InvestorData;
  property: InvestmentData;
  company: CompanyData;
  manager?: ManagerData;
  nominees?: NomineeData[];
}

const formatHindiDate = (dateStr?: string) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return convertNumberToHindi(dateStr);
  const monthsHindi = ['जनवरी', 'फरवरी', 'मार्च', 'अप्रैल', 'मई', 'जून', 'जुलाई', 'अगस्त', 'सितंबर', 'अक्टूबर', 'नवंबर', 'दिसंबर'];
  return `${convertNumberToHindi(date.getDate())} ${monthsHindi[date.getMonth()]} ${convertNumberToHindi(date.getFullYear())}`;
};

const safe = (v?: any) => (!v || v === '') ? '____________________' : String(v);

const formatAmount = (v?: string | number) => {
  if (!v) return '________';
  return convertNumberToHindi(Number(v).toLocaleString('en-IN'));
};

const numberToWordsHindi = (num: number): string => {
  if (num === 0) return 'शून्य';
  const ones = ['', 'एक', 'दो', 'तीन', 'चार', 'पाँच', 'छह', 'सात', 'आठ', 'नौ', 'दस', 'ग्यारह', 'बारह', 'तेरह', 'चौदह', 'पंद्रह', 'सोलह', 'सत्रह', 'अठारह', 'उन्नीस'];
  const tens = ['', '', 'बीस', 'तीस', 'चालीस', 'पचास', 'साठ', 'सत्तर', 'अस्सी', 'नब्बे'];
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
    if (crore) result += convertBelowHundred(crore) + ' करोड़ ';
    if (lakh) result += convertBelowHundred(lakh) + ' लाख ';
    if (thousand) result += convertBelowHundred(thousand) + ' हजार ';
    if (hundred) result += convertBelowHundred(hundred) + ' सौ ';
    if (remainder) result += convertBelowHundred(remainder);
    return result.trim();
  };
  return convert(Math.floor(num)) + ' मात्र';
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
  .gradient-text {
    color: #D9001B;
  }
  @media screen {
    .gradient-text {
      background: linear-gradient(180deg, #FF3A3A 0%, #FF1E2D 60%, #D9001B 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
  }
  .doc-title {
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
  .investor-table {
    width: 100%;
    border-collapse: collapse;
    margin: 20px 0;
    font-size: 13px;
  }
  .investor-table td {
    padding: 6px 10px;
    border: 1px solid #ccc;
  }
  .investor-table td:first-child {
    font-weight: 700;
    width: 35%;
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
  .nominee-table {
    width: 100%;
    border-collapse: collapse;
    margin: 10px 0;
    font-size: 12.5px;
  }
  .nominee-table td {
    padding: 5px 8px;
    border: 1px solid #ccc;
  }
  .nominee-table td:first-child {
    font-weight: 700;
    width: 25%;
    background: #f9f9f9;
  }
`;

const HindiInvestorAgreement: React.FC<{ data: AgreementData; companyLogo?: string; companyWatermark?: string }> = ({ data, companyLogo, companyWatermark }) => {
  const investorName = [data.client.title, data.client.name].filter(Boolean).join(' ');
  const companyDisplay = `${data.company.companyName || ''}${data.company.entityType ? ` (${data.company.entityType})` : ''}`;
  const investorAddress = [data.client.address, data.client.district, data.client.state].filter(Boolean).join(', ') + (data.client.pincode ? ` - ${data.client.pincode}` : '');
  const companyFullAddress = [data.company.companyAddress, data.company.companyLocality, data.company.companyDistrict, data.company.companyState].filter(Boolean).join(', ') + (data.company.companyPincode ? ` - ${data.company.companyPincode}` : '');
  const agreementDate = formatHindiDate(data.property?.bookingDate);
  const amountNum = Number(data.property?.totalAmount) || 0;
  const amountWords = numberToWordsHindi(amountNum);
  const tokenNum = Number(data.property?.tokenAmount) || 0;
  const tokenWords = numberToWordsHindi(tokenNum);
  const nominees = data.nominees?.filter(n => n.name) || [];
  const interestRate = data.property?.interestRate || 0;

  return (
    <div id="printable-document" className="flex flex-col items-center">
      <style>{sharedStyles}</style>
      <div className="a4-page" style={{ position: "relative" }}>
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

        <div style={{ position: "relative", zIndex: 1 }}>
          <div className="border-b-[3px] border-[#D9001B] pb-4 mb-6">
            <div className="flex justify-between items-center text-[12px] font-bold text-slate-700 tracking-wide mb-3">
              <div>REG NO: {data.company?.licenseRegistrationNumber?.toUpperCase()}</div>
              <div>EST. 2019</div>
            </div>
            <div className="flex justify-between items-start">
              <div className="flex flex-col text-left">
                <span className="text-[52px] font-extrabold font-serif leading-tight gradient-text">Ashray Group</span>
                <div className="text-[13px] text-slate-800 mt-3 font-medium max-w-[480px] leading-relaxed">
                  {companyFullAddress}.
                </div>
                <div className="flex flex-wrap gap-2 text-[12px] font-bold text-slate-600 mt-2">
                  <span>Mob: {(data.manager?.managerPhone || data.company?.managerPhone)}</span>
                  <span className="text-slate-300">|</span>
                  <span>Mail: {data.company?.companyEmail}</span>
                  <span className="text-slate-300">|</span>
                  <span>Web: {data.company?.companyWebsite}</span>
                </div>
              </div>
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
            <span className="font-mono">{`${data.client.folderSerial || ''}-${data.client.clientId || ''}-INV-AGR`}</span>
            <span><strong>दिनांक : </strong>{agreementDate}</span>
          </div>

          <div className="doc-title">निवेशक समझौता</div>
          <div className="sub-title">(निवेशक और कंपनी के बीच निवेश एवं लाभ-साझेदारी समझौता)</div>

          <div className="clause" style={{ marginBottom: '18px' }}>
            यह निवेशक समझौता (जिसे आगे <strong>"समझौता"</strong> कहा जाएगा) दिनांक <strong>{agreementDate}</strong> को <strong>{data.company.companyDistrict || '________'}</strong> में किया गया है।
          </div>

          <div className="clause" style={{ marginBottom: '6px' }}>
            <strong>पक्षकार :</strong>
          </div>
          <div className="clause">
            <strong>{companyDisplay}</strong>, जिसका पंजीकृत कार्यालय {companyFullAddress} पर स्थित है (जिसे आगे <strong>"कंपनी"</strong> कहा जाएगा, जिसमें इसके उत्तराधिकारी एवं समनुदेशिती शामिल हैं) — <strong>प्रथम पक्ष</strong>।
          </div>

          <div className="clause" style={{ marginTop: '10px' }}>
            <strong>{investorName}</strong>{data.client.fatherName ? `, पुत्र/पति ${data.client.fatherName}` : ''}, आयु: {safe(data.client.age)} वर्ष, व्यवसाय: {safe(data.client.occupation)}, आधार: {safe(data.client.aadhaar)}, पैन: {safe(data.client.pan)}, पता: {investorAddress} (जिसे आगे <strong>"निवेशक"</strong> कहा जाएगा, जिसमें उसके उत्तराधिकारी, कानूनी प्रतिनिधि, उत्तराधिकारी एवं समनुदेशिती शामिल हैं) — <strong>द्वितीय पक्ष</strong>।
          </div>

          <div style={{ marginTop: '20px', textAlign: 'center', fontWeight: 800, fontSize: '16px', textDecoration: 'underline', textUnderlineOffset: '4px', marginBottom: '16px' }}>
            यह समझौता निम्नलिखित प्रकार से साक्षी है :
          </div>

          <table className="investor-table">
            <tbody>
              <tr><td>निवेशक का नाम</td><td>{investorName}</td></tr>
              <tr><td>परियोजना / संपत्ति</td><td>{safe(data.property?.projectName)}</td></tr>
              {data.property?.plotNumber && <tr><td>प्लॉट / यूनिट संख्या</td><td>{data.property.plotNumber}</td></tr>}
              {data.property?.area && <tr><td>क्षेत्रफल</td><td>{data.property.area} वर्ग फुट</td></tr>}
              <tr><td>कुल निवेश राशि</td><td>₹ {formatAmount(data.property?.totalAmount)} /- ({amountWords})</td></tr>
              <tr><td>भुगतान राशि (टोकन)</td><td>₹ {formatAmount(data.property?.tokenAmount)} /- ({tokenWords})</td></tr>
              <tr><td>निवेश की तिथि</td><td>{agreementDate}</td></tr>
              <tr><td>प्रतिफल दर (आरओआई)</td><td>{safe(interestRate)}% प्रति वर्ष</td></tr>
              <tr><td>भुगतान का तरीका</td><td>{safe(data.property?.paymentMode)}</td></tr>
            </tbody>
          </table>

          <div className="clause">
            <span className="clause-num">१. </span>
            <strong>निवेश राशि :</strong> निवेशक ने कंपनी में ₹ {formatAmount(data.property?.totalAmount)}/- (रुपये {amountWords}) की राशि (जिसे आगे <strong>"निवेश राशि"</strong> कहा जाएगा) <strong>{safe(data.property?.projectName)}</strong> नामक परियोजना/संपत्ति में निवेश की है। निवेशक स्वीकार करता है कि निवेश राशि इस समझौते की तिथि पर कंपनी को भुगतान कर दी गई है।
          </div>

          <div className="clause">
            <span className="clause-num">२. </span>
            <strong>प्रतिफल एवं लाभ साझेदारी :</strong> कंपनी निवेशक को निवेश राशि पर {safe(interestRate)}% प्रति वर्ष की दर से प्रतिफल देने के लिए सहमत है। प्रतिफल की गणना वार्षिक आधार पर की जाएगी और कंपनी की नीति के अनुसार निवेशक के खाते में जमा की जाएगी। निवेशक परिपक्वता पर या आपसी सहमति से मूल राशि के साथ उपार्जित प्रतिफल प्राप्त करने का हकदार होगा।
          </div>

          <div className="clause">
            <span className="clause-num">३. </span>
            <strong>अवधि एवं परिपक्वता :</strong> निवेश इस समझौते की तिथि से न्यूनतम {safe(data.property?.emiDuration)} माह की अवधि के लिए कंपनी के पास रहेगा, जब तक कि अन्यथा आपसी सहमति न हो। अवधि पूरी होने पर, निवेशक कंपनी द्वारा निर्धारित सूचना अवधि के अधीन, निवेश राशि को सभी उपार्जित प्रतिफल सहित वापस ले सकता है।
          </div>

          <div className="clause">
            <span className="clause-num">४. </span>
            <strong>निवेश का उपयोग :</strong> निवेशक स्वीकार करता है और सहमत है कि निवेश राशि का उपयोग कंपनी द्वारा अपने व्यावसायिक संचालन के लिए किया जाएगा, जिसमें परियोजना विकास, भूमि अधिग्रहण, निर्माण और कार्यशील पूंजी आवश्यकताएं शामिल हैं। निवेशक को इस निवेश के आधार पर कंपनी की किसी विशिष्ट संपत्ति या संपदा में कोई अधिकार, स्वामित्व या हित नहीं होगा।
          </div>

          <div className="clause">
            <span className="clause-num">५. </span>
            <strong>प्रतिनिधित्व एवं आश्वासन :</strong> निवेशक प्रतिनिधित्व और आश्वासन देता है कि निवेशक द्वारा प्रदान की गई सभी जानकारी, जिसमें व्यक्तिगत विवरण, पहचान दस्तावेज, वित्तीय जानकारी और बैंक विवरण शामिल हैं, सत्य, पूर्ण और सटीक है। निवेशक संपर्क विवरण, पते या बैंक खाते की जानकारी में किसी भी परिवर्तन की तुरंत कंपनी को सूचित करने के लिए सहमत है।
          </div>

          <div className="clause">
            <span className="clause-num">६. </span>
            <strong>नामांकन :</strong> निवेशक ने निम्नलिखित नामांकित व्यक्ति(यों) को नामित किया है जो निवेशक की मृत्यु की स्थिति में निवेश राशि और उपार्जित प्रतिफल प्राप्त करने के हकदार होंगे:
          </div>

          {nominees.length > 0 ? (
            <table className="nominee-table">
              <thead>
                <tr style={{ background: '#f9f9f9', fontWeight: 700 }}>
                  <td>क्र.</td>
                  <td>नाम</td>
                  <td>संबंध</td>
                  <td>आयु</td>
                  <td>आधार</td>
                </tr>
              </thead>
              <tbody>
                {nominees.map((n, i) => (
                  <tr key={i}>
                    <td>{i + 1}</td>
                    <td>{n.name}</td>
                    <td>{safe(n.relation)}</td>
                    <td>{safe(n.age)}</td>
                    <td>{safe(n.aadhaar)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="clause" style={{ paddingLeft: '20px' }}>
              निवेशक द्वारा कोई नामांकित व्यक्ति नियुक्त नहीं किया गया है। निवेशक की मृत्यु की स्थिति में, निवेश राशि उत्तराधिकार प्रमाण पत्र या अन्य वैध कानूनी दस्तावेज प्रस्तुत करने पर निवेशक के कानूनी वारिसों को भुगतान की जाएगी।
            </div>
          )}

          <div className="clause">
            <span className="clause-num">{nominees.length > 0 ? '७' : '७'}. </span>
            <strong>निकासी एवं पूर्व निर्गम :</strong> निवेशक न्यूनतम अवधि पूरी होने से पहले निवेश राशि केवल कंपनी की पूर्व लिखित सहमति से ही वापस ले सकता है। पूर्व निकासी की स्थिति में, कंपनी उस समय लागू अपनी नीति के अनुसार प्रतिफल को कम दर पर समायोजित करने या शीघ्र निकासी शुल्क लगाने का अधिकार रखती है।
          </div>

          <div className="clause">
            <span className="clause-num">{nominees.length > 0 ? '८' : '८'}. </span>
            <strong>अप्रत्याशित घटना :</strong> कंपनी इस समझौते के तहत अपने दायित्वों के निष्पादन में किसी भी देरी या विफलता के लिए उत्तरदायी नहीं होगी यदि ऐसी देरी या विफलता कंपनी के उचित नियंत्रण से परे कारणों से उत्पन्न होती है, जिसमें दैवीय आपदा, सरकारी कार्रवाई, बाजार दुर्घटना, प्राकृतिक आपदाएं या कोई अन्य अप्रत्याशित परिस्थितियां शामिल हैं।
          </div>

          <div className="clause">
            <span className="clause-num">{nominees.length > 0 ? '९' : '९'}. </span>
            <strong>सूचना :</strong> इस समझौते के तहत दी जाने वाली कोई भी सूचना या संचार ईमेल, पंजीकृत डाक द्वारा या व्यक्तिगत रूप से पक्षकार के पते पर भेजे जाने पर विधिवत प्रदान की गई मानी जाएगी।
          </div>

          <div className="clause">
            <span className="clause-num">{nominees.length > 0 ? '१०' : '१०'}. </span>
            <strong>शासकीय कानून एवं क्षेत्राधिकार :</strong> यह समझौता भारत के कानूनों द्वारा शासित और व्याख्यायित होगा। {data.company.companyDistrict || data.company.companyState || '________'} के न्यायालयों को इस समझौते से उत्पन्न या संबंधित किसी भी मामले पर अनन्य क्षेत्राधिकार होगा।
          </div>

          <div className="clause">
            <span className="clause-num">{nominees.length > 0 ? '११' : '११'}. </span>
            <strong>संपूर्ण समझौता :</strong> यह समझौता इसके विषय वस्तु के संबंध में पक्षकारों के बीच संपूर्ण समझौता है और सभी पूर्व वार्ताओं, प्रस्तुतियों और समझौतों को, चाहे वे मौखिक हों या लिखित, रद्द करता है। इस समझौते में कोई भी संशोधन या परिवर्तन तब तक बाध्यकारी नहीं होगा जब तक कि वह लिखित रूप में न हो और दोनों पक्षकारों द्वारा हस्ताक्षरित न हो।
          </div>

          <div style={{ marginTop: '24px', fontSize: '13px', fontStyle: 'italic', textAlign: 'center' }}>
            तद्नुसार पक्षकारों ने इस समझौते पर ऊपर उल्लिखित प्रथम तिथि को हस्ताक्षर किए हैं।
          </div>

          <div className="sig-section">
            <div className="sig-block">
              <div className="sig-label">निवेशक (INVESTOR)</div>
              <div className="sig-line" />
              <div>नाम: {investorName}</div>
              <div>आधार: {safe(data.client.aadhaar)}</div>
              <div>दिनांक: {agreementDate}</div>
            </div>
            <div className="sig-block" style={{ textAlign: 'center' }}>
              <div className="sig-label">कंपनी / कार्यालय मुहर</div>
              <div className="sig-line" />
              <div>{companyDisplay} की ओर से</div>
            </div>
            <div className="sig-block" style={{ textAlign: 'right' }}>
              <div className="sig-label">अधिकृत हस्ताक्षरकर्ता (कंपनी)</div>
              <div className="sig-line" />
              <div>(M H Vicky / Vikrant Rana)</div>
              <div>स्वामी एवं लेखा / प्रशासन प्रमुख</div>
              <div>{companyDisplay}</div>
              <div>दिनांक: {agreementDate}</div>
            </div>
          </div>

          <div className="witness-section">
            <strong>साक्षीगण :</strong>
            <div style={{ display: 'flex', gap: '40px', marginTop: '10px' }}>
              <div style={{ flex: 1 }}>
                (अ) <span style={{ borderBottom: '1px solid #000', display: 'inline-block', minWidth: '160px' }} />
              </div>
              <div style={{ flex: 1 }}>
                (ब) <span style={{ borderBottom: '1px solid #000', display: 'inline-block', minWidth: '160px' }} />
              </div>
            </div>
          </div>

          <div className="end-text">* * * समझौता समाप्त * * *</div>
        </div>
        <PrintFooter />
      </div>
    </div>
  );
};

export default HindiInvestorAgreement;