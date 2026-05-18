import React from 'react';
import { PrintFooter } from '../../../../components/Printpreview';
import {
  convertNumberToMarathi,
} from '../../../engine/EnglishToMarathiEngine';

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

const formatMarathiDate = (dateStr?: string) => {
  if (!dateStr) return '';
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

const MarathiInvestorAgreement: React.FC<{ data: AgreementData; companyLogo?: string; companyWatermark?: string }> = ({ data, companyLogo, companyWatermark }) => {
  const investorName = [data.client.title, data.client.name].filter(Boolean).join(' ');
  const companyDisplay = `${data.company.companyName || ''}${data.company.entityType ? ` (${data.company.entityType})` : ''}`;
  const investorAddress = [data.client.address, data.client.district, data.client.state].filter(Boolean).join(', ') + (data.client.pincode ? ` - ${data.client.pincode}` : '');
  const companyFullAddress = [data.company.companyAddress, data.company.companyLocality, data.company.companyDistrict, data.company.companyState].filter(Boolean).join(', ') + (data.company.companyPincode ? ` - ${data.company.companyPincode}` : '');
  const agreementDate = formatMarathiDate(data.property?.bookingDate);
  const amountNum = Number(data.property?.totalAmount) || 0;
  const amountWords = numberToWordsMarathi(amountNum);
  const tokenNum = Number(data.property?.tokenAmount) || 0;
  const tokenWords = numberToWordsMarathi(tokenNum);
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

          <div className="doc-title">गुंतवणूक करार</div>
          <div className="sub-title">(गुंतवणूकदार आणि कंपनी यांच्यातील गुंतवणूक व नफा-वाटप करार)</div>

          <div className="clause" style={{ marginBottom: '18px' }}>
            हा गुंतवणूक करार (ज्याला यापुढे <strong>"करार"</strong> म्हणून संबोधले जाईल) दिनांक <strong>{agreementDate}</strong> रोजी <strong>{data.company.companyDistrict || '________'}</strong> येथे करण्यात आला आहे.
          </div>

          <div className="clause" style={{ marginBottom: '6px' }}>
            <strong>पक्षकार :</strong>
          </div>
          <div className="clause">
            <strong>{companyDisplay}</strong>, ज्यांचे नोंदणीकृत कार्यालय {companyFullAddress} येथे आहे (ज्यांना यापुढे <strong>"कंपनी"</strong> म्हणून संबोधले जाईल, ज्यामध्ये त्यांचे उत्तराधिकारी आणि नियुक्तीधारक यांचा समावेश आहे) — <strong>प्रथम पक्ष</strong>.
          </div>

          <div className="clause" style={{ marginTop: '10px' }}>
            <strong>{investorName}</strong>{data.client.fatherName ? `, पुत्र/पती ${data.client.fatherName}` : ''}, वय: {safe(data.client.age)} वर्षे, व्यवसाय: {safe(data.client.occupation)}, आधार: {safe(data.client.aadhaar)}, पॅन: {safe(data.client.pan)}, पत्ता: {investorAddress} (ज्यांना यापुढे <strong>"गुंतवणूकदार"</strong> म्हणून संबोधले जाईल, ज्यामध्ये त्यांचे वारस, कायदेशीर प्रतिनिधी, उत्तराधिकारी आणि नियुक्तीधारक यांचा समावेश आहे) — <strong>द्वितीय पक्ष</strong>.
          </div>

          <div style={{ marginTop: '20px', textAlign: 'center', fontWeight: 800, fontSize: '16px', textDecoration: 'underline', textUnderlineOffset: '4px', marginBottom: '16px' }}>
            हा करार खालीलप्रमाणे साक्षीत आहे :
          </div>

          <table className="investor-table">
            <tbody>
              <tr><td>गुंतवणूकदाराचे नाव</td><td>{investorName}</td></tr>
              <tr><td>प्रकल्प / मालमत्ता</td><td>{safe(data.property?.projectName)}</td></tr>
              {data.property?.plotNumber && <tr><td>प्लॉट / युनिट क्रमांक</td><td>{data.property.plotNumber}</td></tr>}
              {data.property?.area && <tr><td>क्षेत्रफळ</td><td>{data.property.area} चौरस फूट</td></tr>}
              <tr><td>एकूण गुंतवणूक रक्कम</td><td>₹ {formatAmount(data.property?.totalAmount)} /- ({amountWords})</td></tr>
              <tr><td>भरलेली रक्कम (टोकन)</td><td>₹ {formatAmount(data.property?.tokenAmount)} /- ({tokenWords})</td></tr>
              <tr><td>गुंतवणुकीची तारीख</td><td>{agreementDate}</td></tr>
              <tr><td>परतावा दर (आरओआय)</td><td>{safe(interestRate)}% प्रति वर्ष</td></tr>
              <tr><td>भरणा पद्धत</td><td>{safe(data.property?.paymentMode)}</td></tr>
            </tbody>
          </table>

          <div className="clause">
            <span className="clause-num">१. </span>
            <strong>गुंतवणूक रक्कम :</strong> गुंतवणूकदाराने कंपनीमध्ये ₹ {formatAmount(data.property?.totalAmount)}/- (रुपये {amountWords}) इतकी रक्कम (ज्याला यापुढे <strong>"गुंतवणूक रक्कम"</strong> म्हणून संबोधले जाईल) <strong>{safe(data.property?.projectName)}</strong> या प्रकल्पात/मालमत्तेत गुंतवली आहे. गुंतवणूकदार मान्य करतो की गुंतवणूक रक्कम या कराराच्या तारखेला कंपनीला भरली गेली आहे.
          </div>

          <div className="clause">
            <span className="clause-num">२. </span>
            <strong>परतावा व नफा वाटप :</strong> कंपनी गुंतवणूकदाराला गुंतवणूक रकमेवर {safe(interestRate)}% प्रति वर्ष दराने परतावा देण्यास सहमत आहे. परताव्याची गणना वार्षिक आधारावर केली जाईल आणि कंपनीच्या धोरणानुसार गुंतवणूकदाराच्या खात्यात जमा केली जाईल. गुंतवणूकदार परिपक्वता वेळी किंवा परस्पर संमतीने मूळ रक्कम आणि उपार्जित परतावा प्राप्त करण्यास पात्र असेल.
          </div>

          <div className="clause">
            <span className="clause-num">३. </span>
            <strong>मुदत व परिपक्वता :</strong> गुंतवणूक या कराराच्या तारखेपासून किमान {safe(data.property?.emiDuration)} महिन्यांसाठी कंपनीकडे राहील, जोपर्यंत अन्यथा परस्पर संमती नसते. मुदत पूर्ण झाल्यावर, गुंतवणूकदार कंपनीने निर्धारित केलेल्या सूचना कालावधीच्या अधीन राहून, गुंतवणूक रक्कम सर्व उपार्जित परताव्यासह परत घेऊ शकतो.
          </div>

          <div className="clause">
            <span className="clause-num">४. </span>
            <strong>गुंतवणुकीचा वापर :</strong> गुंतवणूकदार मान्य करतो आणि सहमत आहे की गुंतवणूक रकमेचा वापर कंपनीद्वारे तिच्या व्यावसायिक कार्यासाठी केला जाईल, ज्यामध्ये प्रकल्प विकास, जमीन संपादन, बांधकाम आणि कार्यरत भांडवल आवश्यकता यांचा समावेश आहे. या गुंतवणुकीमुळे गुंतवणूकदारास कंपनीच्या कोणत्याही विशिष्ट मालमत्तेत किंवा संपत्तीमध्ये कोणताही अधिकार, मालकी किंवा हक्क मिळणार नाही.
          </div>

          <div className="clause">
            <span className="clause-num">५. </span>
            <strong>प्रतिनिधित्व व हमी :</strong> गुंतवणूकदार प्रतिनिधित्व व हमी देतो की त्याने प्रदान केलेली सर्व माहिती, ज्यामध्ये वैयक्तिक तपशील, ओळख दस्तऐवज, आर्थिक माहिती आणि बँक तपशील यांचा समावेश आहे, ती सत्य, पूर्ण आणि अचूक आहे. गुंतवणूकदार संपर्क तपशील, पत्ता किंवा बँक खात्याच्या माहितीमध्ये कोणताही बदल झाल्यास त्वरित कंपनीला सूचित करण्यास सहमत आहे.
          </div>

          <div className="clause">
            <span className="clause-num">६. </span>
            <strong>नामनिर्देशन :</strong> गुंतवणूकदाराने खालील नामनिर्देशित व्यक्ती(ं)ना नामांकित केले आहे जे गुंतवणूकदाराच्या मृत्यूच्या स्थितीत गुंतवणूक रक्कम आणि उपार्जित परतावा प्राप्त करण्यास पात्र असतील:
          </div>

          {nominees.length > 0 ? (
            <table className="nominee-table">
              <thead>
                <tr style={{ background: '#f9f9f9', fontWeight: 700 }}>
                  <td>क्र.</td>
                  <td>नाव</td>
                  <td>संबंध</td>
                  <td>वय</td>
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
              गुंतवणूकदाराने कोणतीही नामनिर्देशित व्यक्ती नियुक्त केलेली नाही. गुंतवणूकदाराच्या मृत्यूच्या स्थितीत, वारसा प्रमाणपत्र किंवा इतर वैध कायदेशीर दस्तऐवज सादर केल्यावर गुंतवणूक रक्कम गुंतवणूकदाराच्या कायदेशीर वारसांना दिली जाईल.
            </div>
          )}

          <div className="clause">
            <span className="clause-num">{nominees.length > 0 ? '७' : '७'}. </span>
            <strong>परत घेणे व अकाली निर्गम :</strong> गुंतवणूकदार किमान मुदत पूर्ण होण्यापूर्वी गुंतवणूक रक्कम केवळ कंपनीच्या पूर्व लेखी संमतीनेच परत घेऊ शकतो. अकाली निर्गमाच्या स्थितीत, कंपनी त्या वेळी लागू असलेल्या धोरणानुसार परतावा कमी दराने समायोजित करण्याचा किंवा लवकर निर्गम शुल्क लादण्याचा अधिकार राखून ठेवते.
          </div>

          <div className="clause">
            <span className="clause-num">{nominees.length > 0 ? '८' : '८'}. </span>
            <strong>अनिवार्य घटना :</strong> कंपनी या कराराअंतर्गत आपल्या जबाबदाऱ्या पार पाडण्यात कोणत्याही विलंब किंवा अपयशासाठी जबाबदार राहणार नाही जर असा विलंब किंवा अपयश कंपनीच्या वाजवी नियंत्रणाबाहेरच्या कारणांमुळे उद्भवला असेल, ज्यामध्ये दैवी आपत्ती, सरकारी कारवाया, बाजार दुर्घटना, नैसर्गिक आपत्ती किंवा इतर कोणत्याही अनपेक्षित परिस्थितींचा समावेश आहे.
          </div>

          <div className="clause">
            <span className="clause-num">{nominees.length > 0 ? '९' : '९'}. </span>
            <strong>सूचना :</strong> या कराराअंतर्गत द्यावयाची कोणतीही सूचना किंवा संवाद ईमेल, नोंदणीकृत टपालाद्वारे किंवा वैयक्तिकरित्या पक्षकाराच्या पत्त्यावर पाठवल्यास ती योग्यरित्या देण्यात आली आहे असे मानले जाईल.
          </div>

          <div className="clause">
            <span className="clause-num">{nominees.length > 0 ? '१०' : '१०'}. </span>
            <strong>प्रशासकीय कायदा व अधिकारक्षेत्र :</strong> या करारावर भारताच्या कायद्यांद्वारे शासन आणि व्याख्या केली जाईल. {data.company.companyDistrict || data.company.companyState || '________'} येथील न्यायालयांना या करारातून उद्भवणाऱ्या किंवा संबंधित कोणत्याही बाबींवर अनन्य अधिकारक्षेत्र असेल.
          </div>

          <div className="clause">
            <span className="clause-num">{nominees.length > 0 ? '११' : '११'}. </span>
            <strong>संपूर्ण करार :</strong> हा करार त्याच्या विषय सामग्रीच्या संदर्भात पक्षकारांमधील संपूर्ण करार आहे आणि सर्व पूर्व वाटाघाटी, प्रस्तुतीकरण आणि करार, मग ते तोंडी असोत किंवा लेखी, रद्द करतो. या करारातील कोणताही बदल किंवा सुधारणा तोपर्यंत बंधनकारक राहणार नाही जोपर्यंत तो लेखी स्वरूपात नसेल आणि दोन्ही पक्षकारांनी स्वाक्षरी केलेला नसेल.
          </div>

          <div style={{ marginTop: '24px', fontSize: '13px', fontStyle: 'italic', textAlign: 'center' }}>
            त्याप्रमाणे पक्षकारांनी या करारावर वर नमूद केलेल्या पहिल्या तारखेला स्वाक्षऱ्या केल्या आहेत.
          </div>

          <div className="sig-section">
            <div className="sig-block">
              <div className="sig-label">गुंतवणूकदार (INVESTOR)</div>
              <div className="sig-line" />
              <div>नाव: {investorName}</div>
              <div>आधार: {safe(data.client.aadhaar)}</div>
              <div>दिनांक: {agreementDate}</div>
            </div>
            <div className="sig-block" style={{ textAlign: 'center' }}>
              <div className="sig-label">कंपनी / कार्यालय शिक्का</div>
              <div className="sig-line" />
              <div>{companyDisplay} तर्फे</div>
            </div>
            <div className="sig-block" style={{ textAlign: 'right' }}>
              <div className="sig-label">अधिकृत स्वाक्षरीकर्ता (कंपनी)</div>
              <div className="sig-line" />
              <div>(M H Vicky / Vikrant Rana)</div>
              <div>मालक व लेखा / प्रशासन प्रमुख</div>
              <div>{companyDisplay}</div>
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

          <div className="end-text">* * * करार समाप्त * * *</div>
        </div>
        <PrintFooter />
      </div>
    </div>
  );
};

export default MarathiInvestorAgreement;