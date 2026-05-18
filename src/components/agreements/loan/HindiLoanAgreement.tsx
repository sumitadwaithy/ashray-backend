import React from 'react';
import { PrintFooter } from '../../../../components/Printpreview';
import {
  convertNumberToHindi,
} from '../../../engine/EnglishToHindiEngine';

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

const formatHindiDate = (dateStr?: string) => {
  if (!dateStr) return '________';
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

const HindiLoanAgreement: React.FC<{ data: AgreementData }> = ({ data, companyLogo, companyWatermark }) => {
  const borrowerName = [data.client.title, data.client.name].filter(Boolean).join(' ');
  const lenderDisplay = `${data.company.companyName || ''}${data.company.entityType ? ` (${data.company.entityType})` : ''}`;
  const borrowerAddress = data.client.address || '';
  const companyFullAddress = [data.company.companyAddress, data.company.companyLocality, data.company.companyDistrict, data.company.companyState].filter(Boolean).join(', ') + (data.company.companyPincode ? ` - ${data.company.companyPincode}` : '');
  const agreementDate = formatHindiDate(data.loanDate);
  const amountNum = Number(data.loanAmount) || 0;
  const amountWords = numberToWordsHindi(amountNum);

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

          <div className="agreement-title">ऋण समझौता</div>
          <div className="sub-title">(ऋणदाता और ऋणी के मध्य सामान्य निजी ऋण समझौता)</div>

          <div className="clause" style={{ marginBottom: '18px' }}>
            यह ऋण समझौता (जिसे आगे <strong>"समझौता"</strong> कहा जाएगा) दिनांक <strong>{agreementDate}</strong> को <strong>{data.company.companyDistrict || '________'}</strong> में किया गया है।
          </div>

          <div className="clause" style={{ marginBottom: '6px' }}>
            <strong>पक्षकार :</strong>
          </div>
          <div className="clause">
            <strong>{lenderDisplay}</strong>, जिसका पंजीकृत कार्यालय {companyFullAddress} पर स्थित है (जिसे आगे <strong>"ऋणदाता"</strong> कहा जाएगा, जिसमें इसके उत्तराधिकारी एवं समनुदेशिती शामिल हैं) — <strong>प्रथम पक्ष</strong>।
          </div>

          <div className="clause" style={{ marginTop: '10px' }}>
            <strong>{borrowerName}</strong>{data.client.fatherHusbandName ? `, पुत्र/पति ${data.client.fatherHusbandName}` : ''}, आयु: {safe(data.client.age)} वर्ष, व्यवसाय: {safe(data.client.occupation)}, आधार: {safe(data.client.aadhaar)}, पैन: {safe(data.client.pan)}, पता: {borrowerAddress} (जिसे आगे <strong>"ऋणी"</strong> कहा जाएगा, जिसमें उसके उत्तराधिकारी, कानूनी प्रतिनिधि, उत्तराधिकारी एवं समनुदेशिती शामिल हैं) — <strong>द्वितीय पक्ष</strong>।
          </div>

          <div style={{ marginTop: '20px', textAlign: 'center', fontWeight: 800, fontSize: '16px', textDecoration: 'underline', textUnderlineOffset: '4px', marginBottom: '16px' }}>
            यह समझौता निम्नलिखित प्रकार से साक्षी है :
          </div>

          <table className="loan-terms-table">
            <tbody>
              <tr><td>ऋण राशि (मूलधन)</td><td>₹ {formatAmount(data.loanAmount)} /- ({amountWords})</td></tr>
              <tr><td>ऋण का उद्देश्य</td><td>{safe(data.loanPurpose)}</td></tr>
              <tr><td>वितरण की तिथि</td><td>{agreementDate}</td></tr>
              <tr><td>ऋण अवधि</td><td>{safe(data.loanDuration)}</td></tr>
              <tr><td>ब्याज दर</td><td>{safe(data.interestRate)}</td></tr>
              <tr><td>ब्याज का प्रकार</td><td>{safe(data.interestType)}</td></tr>
              <tr><td>पुनर्भुगतान का तरीका</td><td>{safe(data.repaymentMode)}</td></tr>
              <tr><td>मासिक किस्त (ईएमआई)</td><td>₹ {formatAmount(data.monthlyEMI)} /-</td></tr>
            </tbody>
          </table>

          <div className="clause">
            <span className="clause-num">१. </span>
            <strong>ऋण स्वीकृति :</strong> ऋणदाता ने ऋणी को ₹ {formatAmount(data.loanAmount)}/- (रुपये {amountWords}) का ऋण {safe(data.loanPurpose)} के उद्देश्य के लिए प्रदान किया है तथा ऋणी ने इसे स्वीकार किया है। ऋणी इस समझौते की तिथि पर पूर्ण ऋण राशि प्राप्त होने की स्वीकार करता है।
          </div>

          <div className="clause">
            <span className="clause-num">२. </span>
            <strong>पुनर्भुगतान की शर्तें :</strong> ऋणी ऋण राशि को {safe(data.interestRate)} की ब्याज दर ({safe(data.interestType)} ब्याज आधार पर) सहित ऋणदाता को निर्धारित पुनर्भुगतान अनुसूची के अनुसार वापस करने का वचन देता है। ऋणी प्रति माह ₹ {formatAmount(data.monthlyEMI)}/- या आपसी सहमति से निर्धारित अन्य राशि का भुगतान करेगा जब तक कि संपूर्ण ऋण राशि और उपार्जित ब्याज का पूर्ण भुगतान न हो जाए। ऋणी किसी भी समय बिना किसी पूर्व भुगतान शुल्क के आंशिक या पूर्ण रूप से ऋण का अग्रिम भुगतान कर सकता है।
          </div>

          <div className="clause">
            <span className="clause-num">३. </span>
            <strong>ब्याज :</strong> ब्याज की गणना बकाया मूल राशि पर {safe(data.interestRate)} प्रति वर्ष की दर से {safe(data.interestType)} ब्याज आधार पर की जाएगी। ब्याज वितरण की तिथि से पूर्ण भुगतान की तिथि तक उपार्जित होगा। किसी किश्त के भुगतान में चूक होने पर, ऋणदाता अपने द्वारा निर्धारित दर पर अतिरिक्त ब्याज लगाने का अधिकार रखता है, जो {safe(data.interestRate)} प्रति वर्ष से अधिक नहीं होगा।
          </div>

          <div className="clause">
            <span className="clause-num">४. </span>
            <strong>ऋण का उद्देश्य :</strong> ऋणी प्रतिनिधित्व और आश्वासन देता है कि ऋण राशि का उपयोग केवल {safe(data.loanPurpose)} के उद्देश्य के लिए किया जाएगा। ऋणी ऋण राशि का उपयोग किसी अवैध, सट्टेबाजी या निषिद्ध उद्देश्य के लिए नहीं करेगा। ऋणदाता को किसी भी उचित समय पर ऋण राशि के उपयोग की जांच करने का अधिकार होगा।
          </div>

          {data.collateralType && data.collateralType !== 'NON_COLLATERAL' ? (
            <div className="clause">
              <span className="clause-num">५. </span>
              <strong>संपार्श्विक सुरक्षा :</strong> ऋणी ने {safe(data.collateralType)} के रूप में लगभग ₹ {formatAmount(data.collateralValue)}/- मूल्य की संपार्श्विक सुरक्षा प्रदान की है। विवरण: {safe(data.collateralDetails)}। ऋणी सहमत है कि ऋणदाता ऋण राशि और सभी उपार्जित ब्याज के पूर्ण भुगतान तक संपार्श्विक को सुरक्षा के रूप में रखेगा। चूक की स्थिति में, ऋणदाता को संपार्श्विक को नकदीकृत करने और बकाया राशि वसूल करने का अधिकार होगा।
            </div>
          ) : (
            <div className="clause">
              <span className="clause-num">५. </span>
              <strong>सुरक्षा :</strong> यह ऋण ऋणी के विश्वास और साख के आधार पर दिया गया एक असुरक्षित व्यक्तिगत ऋण है। ऋणी सहमत है कि यह समझौता ऋण का पर्याप्त प्रमाण होगा और ऋणी पर बाध्यकारी होगा।
            </div>
          )}

          <div className="clause">
            <span className="clause-num">६. </span>
            <strong>चूक और परिणाम :</strong> यदि ऋणी निर्धारित समय में कोई किश्त नहीं देता है, तो ऋणी चूककर्ता माना जाएगा। चूक होने पर, ऋणदाता संपूर्ण बकाया ऋण राशि को उपार्जित ब्याज सहित तुरंत वापस मांग सकता है। ऋणी बकाया राशि की वसूली के लिए ऋणदाता द्वारा किए गए सभी खर्चों, जिसमें कानूनी लागत शामिल है, के लिए उत्तरदायी होगा।
          </div>

          <div className="clause">
            <span className="clause-num">७. </span>
            <strong>प्रतिनिधित्व और आश्वासन :</strong> ऋणी प्रतिनिधित्व और आश्वासन देता है कि ऋणदाता को प्रदान की गई सभी जानकारी, जिसमें व्यक्तिगत विवरण, पहचान दस्तावेज, वित्तीय जानकारी और अन्य कोई भी जानकारी सत्य, पूर्ण और सटीक है। ऋणी अपने संपर्क विवरण, पते या अन्य प्रासंगिक जानकारी में किसी भी परिवर्तन की तुरंत ऋणदाता को सूचित करने के लिए सहमत है।
          </div>

          {data.guarantors && data.guarantors.length > 0 && data.guarantors.some(g => g.name) && (
            <>
              <div className="clause">
                <span className="clause-num">८. </span>
                <strong>गारंटर की प्रतिबद्धता :</strong> निम्नलिखित व्यक्ति ऋण राशि के लिए गारंटर के रूप में खड़े हुए हैं और इसके पुनर्भुगतान की गारंटी देते हैं:
                <table className="loan-terms-table" style={{ marginTop: '10px' }}>
                  <tbody>
                    {data.guarantors.filter(g => g.name).map((g, i) => (
                      <tr key={i}><td>गारंटर {i + 1}</td><td>{g.name} | संबंध: {g.relation} | फोन: {g.phone}{g.aadhaar ? ` | आधार: ${g.aadhaar}` : ''}{g.pan ? ` | पैन: ${g.pan}` : ''}</td></tr>
                    ))}
                  </tbody>
                </table>
                प्रत्येक गारंटर ऋणदाता को अपरिवर्तनीय और बिना शर्त गारंटी देता है कि ऋण राशि और सभी ब्याज तथा अन्य देय राशियों का पूर्ण और समय पर भुगतान किया जाएगा। गारंटर सहमत हैं कि उनकी देयता ऋणी के साथ संयुक्त और पृथक होगी तथा ऋणदाता द्वारा ऋणी को दी गई किसी भी छूट या रियायत से प्रभावित नहीं होगी।
              </div>
              <div className="clause">
                <span className="clause-num">९. </span>
                <strong>गारंटर के दायित्व :</strong> गारंटर वचन देते हैं कि ऋणी द्वारा चूक की स्थिति में, ऋणदाता को पहले ऋणी या किसी अन्य सुरक्षा के विरुद्ध कार्रवाई किए बिना गारंटरों से संपूर्ण बकाया राशि मांगने और वसूल करने का अधिकार होगा। गारंटर इस गारंटी को लागू करने से पहले ऋणदाता को ऋणी के विरुद्ध कार्रवाई करने की आवश्यकता के किसी भी अधिकार का त्याग करते हैं।
              </div>
            </>
          )}

          <div className="clause">
            <span className="clause-num">{data.guarantors && data.guarantors.some(g => g.name) ? '१०' : '८'}. </span>
            <strong>सूचना :</strong> इस समझौते के तहत दी जाने वाली कोई भी सूचना या संचार ईमेल, पंजीकृत डाक द्वारा या व्यक्तिगत रूप से पक्षकार के पते पर भेजे जाने पर विधिवत प्रदान की गई मानी जाएगी।
          </div>

          <div className="clause">
            <span className="clause-num">{data.guarantors && data.guarantors.some(g => g.name) ? '११' : '९'}. </span>
            <strong>शासकीय कानून और क्षेत्राधिकार :</strong> यह समझौता भारत के कानूनों द्वारा शासित और व्याख्यायित होगा। {data.company.companyDistrict || data.company.companyState || '________'} के न्यायालयों को इस समझौते से उत्पन्न या संबंधित किसी भी मामले पर अनन्य क्षेत्राधिकार होगा।
          </div>

          <div className="clause">
            <span className="clause-num">{data.guarantors && data.guarantors.some(g => g.name) ? '१२' : '१०'}. </span>
            <strong>क्षतिपूर्ति :</strong> ऋणी ऋणदाता को इस समझौते के तहत ऋणी के प्रतिनिधित्व, आश्वासन या दायित्वों के किसी भी उल्लंघन से उत्पन्न या संबंधित सभी नुकसानों, दावों, क्षतियों, देनदारियों, लागतों और खर्चों से मुक्त रखने और क्षतिपूर्ति करने के लिए सहमत है।
          </div>

          <div className="clause">
            <span className="clause-num">{data.guarantors && data.guarantors.some(g => g.name) ? '१३' : '११'}. </span>
            <strong>संपूर्ण समझौता :</strong> यह समझौता इसके विषय वस्तु के संबंध में पक्षकारों के बीच संपूर्ण समझौता है और सभी पूर्व वार्ताओं, प्रस्तुतियों और समझौतों को, चाहे वे मौखिक हों या लिखित, रद्द करता है। इस समझौते में कोई भी संशोधन या परिवर्तन तब तक बाध्यकारी नहीं होगा जब तक कि वह लिखित रूप में न हो और दोनों पक्षकारों द्वारा हस्ताक्षरित न हो।
          </div>

          <div className="clause">
            <span className="clause-num">{data.guarantors && data.guarantors.some(g => g.name) ? '१४' : '१२'}. </span>
            <strong>पृथक्करणीयता :</strong> यदि इस समझौते का कोई प्रावधान अमान्य, अवैध या अप्रवर्तनीय पाया जाता है, तो शेष प्रावधानों की वैधता, वैधता और प्रवर्तनीयता किसी भी प्रकार से प्रभावित या क्षीण नहीं होगी।
          </div>

          <div style={{ marginTop: '24px', fontSize: '13px', fontStyle: 'italic', textAlign: 'center' }}>
            तद्नुसार पक्षकारों ने इस समझौते पर ऊपर उल्लिखित प्रथम तिथि को हस्ताक्षर किए हैं।
          </div>

          <div className="sig-section">
            <div className="sig-block">
              <div className="sig-label">ऋणी (BORROWER)</div>
              <div className="sig-line" />
              <div>नाम: {borrowerName}</div>
              <div>आधार: {safe(data.client.aadhaar)}</div>
              <div>दिनांक: {agreementDate}</div>
            </div>
            <div className="sig-block" style={{ textAlign: 'center' }}>
              <div className="sig-label">ऋणदाता / कार्यालय मुहर</div>
              <div className="sig-line" />
              <div>{lenderDisplay} की ओर से</div>
            </div>
            <div className="sig-block" style={{ textAlign: 'right' }}>
              <div className="sig-label">अधिकृत हस्ताक्षरकर्ता (ऋणदाता)</div>
              <div className="sig-line" />
              <div>(M H Vicky / Vikrant Rana)</div>
              <div>स्वामी एवं लेखा / प्रशासन प्रमुख</div>
              <div>{lenderDisplay}</div>
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

          {data.guarantors && data.guarantors.filter(g => g.name).length > 0 && (
            <div className="sig-section" style={{ marginTop: '40px' }}>
              {data.guarantors.filter(g => g.name).map((g, i) => (
                <div key={i} className="sig-block">
                  <div className="sig-label">गारंटर {i + 1} — {g.name}</div>
                  <div className="sig-line" />
                  <div>संबंध: {g.relation}</div>
                  <div>फोन: {g.phone}</div>
                  <div>दिनांक: {agreementDate}</div>
                </div>
              ))}
            </div>
          )}

          <div className="end-text">* * * समझौता समाप्त * * *</div>
        </div>
        <PrintFooter />
      </div>
    </div>
  );
};

export default HindiLoanAgreement;