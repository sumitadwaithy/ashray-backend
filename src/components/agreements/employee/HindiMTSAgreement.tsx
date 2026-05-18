import React from 'react';
import { convertToHindi, convertNumberToHindi, formatAadhaarHindi, } from '../../../engine/EnglishToHindiEngine';
import { PrintFooter } from '../../../../components/Printpreview';

// =========================
// EMPLOYEE DATA
// =========================
interface EmployeeData {
  title?: string;
  name: string;
  age?: string;
  gender?: string;
  fatherName?: string;
  phone?: string;
  email?: string;
  aadhaar?: string;
  pan?: string;
  dob?: string;
  address: string;
  locality?: string;
  district?: string;
  state?: string;
  pincode?: string;
  qualification?: string;
  employeeId?: string;
  staffId?: string;
  folderSerial?: string;
}

// =========================
// EMPLOYMENT TERMS
// =========================
interface EmploymentData {
  joiningDate?: string;
  probationPeriod?: string;
  workingHours?: string;
  lunchBreak?: string;
  workingDays?: string;
  department?: string;
  reportingTo?: string;
  placeOfPosting?: string;

  grossAnnualSalary?: string | number;
  grossAnnualSalaryWords?: string;
  salaryPaymentFrequency?: string;
  grossMonthlySalary?: string | number;
  grossMonthlySalaryWords?: string;

  noticePeriodEmployer?: string;
  noticePeriodEmployee?: string;
  nonCompetePeriod?: string;
  nonCompeteRadius?: string;

  annualLeaves?: string;
  casualLeaves?: string;
  medicalLeaves?: string;

  additionalDuties?: string[];
  jurisdiction?: string;
}

// =========================
// COMPANY (EMPLOYER)
// =========================
interface CompanyData {
  companyName?: string;
  entityType?: string;
  cinNumber?: string;
  companyPan?: string;
  companyEmail?: string;
  companyWebsite?: string;
  licenseRegistrationNumber?: string;
  managerName?: string;
  managerPosition?: string;
  managerAddress?: string;
  managerPAN?: string;
  managerAadhaar?: string;
  managerPhone?: string;
  managerCountryCode?: string;
  hrName?: string;
  hrDesignation?: string;
  companyAddress?: string;
  companyLocality?: string;
  companyDistrict?: string;
  companyState?: string;
  companyPincode?: string;
}

// =========================
// MANAGER (AUTHORISED SIGNATORY)
// =========================
interface ManagerData {
  managerName?: string;
  managerPosition?: string;
  managerAddress?: string;
  managerPAN?: string;
  managerAadhaar?: string;
  managerPhone?: string;
  managerCountryCode?: string;
}

// =========================
// FINAL AGREEMENT DATA
// =========================
interface AgreementData {
  employee: EmployeeData;
  employment: EmploymentData;
  company: CompanyData;
  manager?: ManagerData;
}

interface TemplateProps {
  data: AgreementData;
  language: 'hi' | 'en' | 'mr' | 'hindi' | 'english' | 'marathi';
  type: 'agreement' | 'token';
  onClose: () => void;
  companyLogo?: string;
  companyWatermark?: string;
}

const HindiMTSAgreement = ({ data, companyLogo, companyWatermark }: TemplateProps) => {

  const formatHindiDate = (dateStr?: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return convertNumberToHindi(dateStr);
    const day = convertNumberToHindi(date.getDate());
    const month = convertNumberToHindi(date.getMonth() + 1);
    const year = convertNumberToHindi(date.getFullYear());
    return `${day}/${month}/${year}`;
  };

  const employerFullName = convertToHindi(`${convertToHindi(data.company?.companyName || '')} ${data.company?.entityType ? `(${data.company.entityType})` : ''}`.trim());


  const employerAddress = convertToHindi([
    data.company?.companyAddress,
    data.company?.companyLocality,
    data.company?.companyDistrict,
    data.company?.companyState,
  ].filter(Boolean).join(', ') + (data.company?.companyPincode ? ` - ${data.company.companyPincode}` : ''));

  const employeeFullName = convertToHindi([data.employee?.title, data.employee?.name].filter(Boolean).join(' '));


  const employeeAddress = convertToHindi([
    data.employee?.address,
    data.employee?.locality,
    data.employee?.district,
    data.employee?.state,
  ].filter(Boolean).join(', ') + (data.employee?.pincode ? ` - ${data.employee.pincode}` : ''));

  const defaultDuties = [
    "निर्देशानुसार संबंधित विभागों, कर्मचारियों या बाहरी पक्षों को फाइलें, पत्र, दस्तावेज़ और संचार भेजने सहित सामान्य कार्यालय सहायता कार्य करना।",
    "कार्यालय परिसर, बैठक कक्ष, स्वागत क्षेत्र, साइट कार्यालयों और सभी सामान्य क्षेत्रों की सफाई और व्यवस्था सदैव बनाए रखना।",
    "फोटोकॉपी मशीन, प्रिंटर, स्कैनर, श्रेडर और बाइंडिंग मशीन जैसे बुनियादी कार्यालय उपकरणों का संचालन करना और किसी भी खराबी की तुरंत सूचना देना।",
    "कार्यालय स्थानांतरण या साइट विज़िट के दौरान कार्यालय फर्नीचर, फिटिंग, सामग्री और संपत्ति-संबंधी दस्तावेज़ों की आवाजाही, लोडिंग, अनलोडिंग और व्यवस्था में सहायता करना।",
    "आवश्यकतानुसार ग्राहकों, बैंकों, सरकारी कार्यालयों, पंजीकरण कार्यालयों (उप-पंजीयक) और अन्य स्थानों पर फाइलें, चेक, डिमांड ड्राफ्ट, कानूनी दस्तावेज़ और अन्य आधिकारिक पत्राचार पहुंचाना और प्राप्त करना।",
    "आवक और जावक डिस्पैच रजिस्टर प्रबंधित करना, कूरियर ट्रैकिंग और पावती रसीदों सहित प्राप्त और भेजे गए सभी दस्तावेज़ों का उचित रिकॉर्ड बनाए रखना।",
    "आगंतुकों का स्वागत, ग्राहकों का मार्गदर्शन, जलपान परोसना और विज़िटर रजिस्टर बनाए रखने सहित फ्रंट डेस्क / रिसेप्शन पर सहायता प्रदान करना।",
    "संपत्ति प्रदर्शनियों, साइट विज़िट और ग्राहक कार्यक्रमों के दौरान सेटअप, लॉजिस्टिक्स और सामग्री वितरण में सहायता करके बिक्री और विपणन टीम का समर्थन करना।",
    "निर्देशानुसार संपत्ति दस्तावेज़ों, विक्रय विलेखों, अनुबंधों, NOC और अन्य कानूनी कागजातों की फोटोकॉपी, स्कैनिंग, लेमिनेशन और फाइलिंग में सहायता करना।",
    "चेक जमा करना, डिमांड ड्राफ्ट संग्रह करना, दस्तावेज़ जमा करना और बैंक स्टाम्प / पावती प्राप्त करना जैसे बैंक-संबंधी कार्य करना।",
    "स्टाम्प संग्रह, फ्रैंकिंग, नोटरीकरण, सरकारी संपर्क और प्रबंधन द्वारा सौंपे गए किसी भी अन्य कार्य सहित आधिकारिक कार्यों को पूरा करना।",
    "समय-समय पर प्रबंधन द्वारा सौंपे गए अन्य बहु-कार्य, सहायक या हाउसकीपिंग कर्तव्य निभाना।",
  ];

  const allDuties = (data.employment?.additionalDuties?.length ?? 0) > 0
    ? data.employment!.additionalDuties!
    : defaultDuties;

  return (
    <div id="printable-document" className="flex flex-col items-center">
      <style>{`
        .a4-page {
          width: 210mm;
          min-height: 297mm;
          margin: 0 auto;
          background: white;
          padding: 14mm 16mm;
          box-sizing: border-box;
          page-break-after: always;
          box-shadow: 0 0 10px rgba(0,0,0,0.1);
          font-family: 'Noto Sans Devanagari', 'Mangal', 'Arial Unicode MS', sans-serif;
          font-size: 13px;
          color: #000;
        }
        @media print {
          @page { size: A4; margin: 0; }
          html, body { width: 210mm; margin: 0; padding: 0; background: white; }
          body * { visibility: hidden; }
          #printable-document, #printable-document * { visibility: visible; }
          #printable-document { position: absolute; left: 0; top: 0; width: 210mm; }
          .a4-page {
            width: 210mm;
            min-height: 297mm;
            padding: 14mm 16mm;
            margin: 0;
            box-shadow: none;
            page-break-after: always;
          }
          .a4-page:last-child { page-break-after: auto; }
          .no-print { display: none !important; }
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
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
        .agreement-title {
          text-align: center;
          font-size: 17px;
          font-weight: 900;
          text-decoration: underline;
          letter-spacing: 1px;
          text-transform: uppercase;
          margin: 14px 0 2px 0;
          font-family: 'Noto Sans Devanagari', 'Mangal', sans-serif;
        }
        .agreement-subtitle {
          text-align: center;
          font-size: 13.5px;
          font-weight: 700;
          margin-bottom: 10px;
          font-style: italic;
          color: #333;
        }
        .party-block {
          margin: 8px 0 8px 10px;
          font-size: 13px;
          line-height: 1.75;
        }
        .party-name {
          font-weight: 800;
          font-size: 13.5px;
          text-transform: uppercase;
          letter-spacing: 0.3px;
        }
        .and-divider {
          text-align: center;
          font-weight: 900;
          font-size: 13px;
          margin: 4px 0;
          letter-spacing: 3px;
        }
        .section-heading {
          font-size: 13.5px;
          font-weight: 900;
          text-transform: uppercase;
          text-decoration: underline;
          margin-top: 13px;
          margin-bottom: 4px;
          letter-spacing: 0.4px;
        }
        .body-text {
          font-size: 13px;
          line-height: 1.8;
          text-align: justify;
          margin-bottom: 5px;
        }
        .duty-list {
          margin: 3px 0 5px 20px;
          font-size: 13px;
          line-height: 1.8;
          list-style-type: decimal;
        }
        .duty-list li {
          margin-bottom: 2px;
        }
        .sub-heading {
          font-weight: 700;
          font-size: 13px;
          margin-top: 7px;
          margin-bottom: 2px;
          text-decoration: underline;
        }
        .benefits-list {
          margin: 2px 0 5px 20px;
          font-size: 12.5px;
          line-height: 1.75;
          list-style-type: disc;
        }
        .benefits-list li {
          margin-bottom: 2px;
        }
        .termination-list {
          margin: 3px 0 5px 20px;
          font-size: 13px;
          line-height: 1.8;
          list-style-type: disc;
        }
        .termination-list li {
          margin-bottom: 3px;
        }
        .clause-list {
          margin: 3px 0 5px 20px;
          font-size: 13px;
          line-height: 1.8;
          list-style-type: lower-alpha;
        }
        .clause-list li {
          margin-bottom: 3px;
        }
        .underline-blank {
          border-bottom: 1px solid #000;
          display: inline-block;
          min-width: 90px;
          min-height: 16px;
          text-align: center;
          padding: 0 4px;
          vertical-align: bottom;
        }
        .sig-grid {
          display: flex;
          justify-content: space-between;
          margin-top: 28px;
          gap: 32px;
        }
        .sig-block {
          flex: 1;
          font-size: 13px;
          line-height: 1.8;
          border-top: 2px solid #000;
          padding-top: 10px;
        }
        .sig-block-title {
          font-weight: 900;
          font-size: 13.5px;
          margin-bottom: 14px;
        }
        .sig-line {
          border-bottom: 1.5px solid #000;
          min-height: 48px;
          margin-bottom: 6px;
        }
        .sig-field-row {
          margin-top: 5px;
          font-size: 13px;
          display: flex;
          align-items: baseline;
          gap: 4px;
        }
        .divider-page {
          text-align: center;
          font-weight: 700;
          font-size: 12px;
          margin: 0 0 10px 0;
          letter-spacing: 2px;
        }
        .end-text {
          text-align: center;
          font-weight: 900;
          font-size: 14px;
          margin-top: 24px;
          letter-spacing: 3px;
        }
        .compliance-box {
          border: 1px solid #ccc;
          background: #fafafa;
          padding: 7px 10px;
          margin: 8px 0 4px 0;
          font-size: 12px;
          line-height: 1.7;
        }
        .conduct-box {
          border: 1px solid #000;
          padding: 8px 11px;
          margin: 8px 0 5px 0;
          font-size: 12.5px;
          line-height: 1.75;
        }
        .a4-gap {
          height: 40px;
        }
        @media print {
          .a4-gap { display: none; }
          .compliance-box { background: #f5f5f5 !important; }
          .conduct-box { background: white !important; }
        }
        .agreement-watermark,
        .agreement-watermark img {
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
        @media print {
          .agreement-watermark {
            display: flex !important;
            visibility: visible !important;
            opacity: 0.08 !important;
          }
          .agreement-watermark img {
            display: block !important;
            visibility: visible !important;
          }
        }
      `}</style>

      {/* ══════════════════════════════════════════
          PAGE 1
      ══════════════════════════════════════════ */}
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

          <div className="mt-6 bg-yellow-200 border border-yellow-300 text-[12.5px] font-semibold px-1 py-1 text-center">
            <div className="font-mono leading-tight break-words inline-block text-center max-w-full">
              {data.employee.folderSerial || '0000'}/{data.employee.staffId || data.employee.employeeId || 'TEMP-ID'}
            </div>
          </div>

          {/* शीर्षक */}
          <div className="agreement-title">रोजगार अनुबंध</div>
          <div className="agreement-subtitle">(बहु-कार्य कर्मचारी — MTS)</div>

          {/* प्रस्तावना */}
          <div className="body-text">
            यह रोजगार अनुबंध <strong>("अनुबंध")</strong> दिनांक{' '}
            <span className="underline-blank">{formatHindiDate(data.employment?.joiningDate)}</span>{' '}
            को निम्नलिखित पक्षों के बीच निष्पादित किया गया है:
          </div>

          {/* नियोक्ता */}
          <div className="party-block">
            <div className="party-name">{employerFullName}</div>
            <div><strong>पंजीकृत पता:</strong> {employerAddress}</div>
            <div><strong>सीआईएन:</strong> {data.company?.cinNumber || <span className="underline-blank" style={{ minWidth: '160px' }} />}</div>
            <div><strong>पैन:</strong> {data.company?.companyPan || <span className="underline-blank" style={{ minWidth: '120px' }} />}</div>
            <div style={{ fontStyle: 'italic' }}>
              (कंपनी अधिनियम, 2013 के अंतर्गत निगमित एक कंपनी, जिसे आगे <strong>"कंपनी"</strong> या <strong>"नियोक्ता"</strong> कहा जाएगा)
            </div>
          </div>

          <div className="and-divider">और</div>

          {/* कर्मचारी */}
          <div className="party-block">
            <div className="party-name">{employeeFullName}</div>
            <div><strong>पता:</strong> {employeeAddress}</div>
            <div><strong>जन्म तिथि:</strong> {data.employee?.dob ? formatHindiDate(data.employee.dob) : <span className="underline-blank" style={{ minWidth: '100px' }} />}</div>
            <div>
              <strong>आधार क्र.:</strong> {formatAadhaarHindi(data.employee?.aadhaar) || <span className="underline-blank" style={{ minWidth: '120px' }} />}
              &emsp;
              <strong>पैन क्र.:</strong> {data.employee?.pan || <span className="underline-blank" style={{ minWidth: '100px' }} />}
            </div>
            <div style={{ fontStyle: 'italic' }}>(जिसे आगे <strong>"कर्मचारी"</strong> कहा जाएगा)</div>
          </div>

          {/* १. पद और कर्तव्य */}
          <div className="section-heading">१. पद और कर्तव्य</div>
          <div className="body-text">
            कंपनी एतद्द्वारा कर्मचारी को <strong>बहु-कार्य कर्मचारी (MTS)</strong> के पद पर
            {data.employment?.department ? ` ${convertToHindi(data.employment.department)} विभाग में` : ''} नियुक्त करती है। कर्मचारी{' '}
            <span className="underline-blank">{convertToHindi(data.employment?.reportingTo || '')}</span>{' '}
            को रिपोर्ट करेगा और रियल एस्टेट प्राइवेट लिमिटेड कंपनी में आवश्यक सभी सहायक, परिचालन और हाउसकीपिंग कर्तव्यों का परिश्रमपूर्वक निर्वहन करेगा, जिनमें निम्नलिखित शामिल हैं, परंतु इन्हीं तक सीमित नहीं:
          </div>
          <ol className="duty-list">
            {allDuties.map((duty, idx) => (
              <li key={idx}>{duty}</li>
            ))}
          </ol>
          <div className="body-text">
            कर्मचारी स्वीकार करता है कि MTS भूमिका की प्रकृति के लिए विभागों और कार्यों में लचीलेपन की आवश्यकता होती है। पदस्थापना का स्थान{' '}
            <span className="underline-blank">{data.employment?.placeOfPosting || ''}</span>{' '}
            होगा। नियोक्ता अपने विवेकानुसार अपने किसी भी कार्यालय, परियोजना स्थलों या शाखा स्थानों पर कर्तव्य सौंपने का अधिकार सुरक्षित रखता है।
          </div>

        </div>
        <PrintFooter />
      </div>

      <div className="a4-gap" />

      {/* ══════════════════════════════════════════
          पृष्ठ २
      ══════════════════════════════════════════ */}
      <div className="a4-page" style={{ position: "relative" }}>
        {/* वॉटरमार्क */}
        <div style={{
          position: "absolute", top: 0, left: 0, width: "100%", height: "100%",
          display: "flex", alignItems: "center", justifyContent: "center",
          opacity: 0.08, zIndex: 0, pointerEvents: "none",
        }}>
          <img src={companyWatermark || companyLogo || ''}
            style={{ width: "70%", maxWidth: "720px", height: "auto", objectFit: "contain" }} />
        </div>

        <div className="divider-page"></div>

        {/* सामग्री */}
        <div style={{ position: "relative", zIndex: 1 }}>

          {/* २. नियोजन का प्रारंभ और परीविक्षा */}
          <div className="section-heading">२. नियोजन का प्रारंभ और परीविक्षा</div>
          <div className="body-text">
            कर्मचारी का रोजगार{' '}
            <span className="underline-blank">{formatHindiDate(data.employment?.joiningDate)}</span>{' '}
            से प्रारंभ होगा। कर्मचारी सम्मिलित होने की तारीख से{' '}
            <strong>{data.employment?.probationPeriod || '3 (तीन) माह'}</strong>{' '}
            की परीविक्षा (प्रोबेशन) पर रहेगा, जिस दौरान कोई भी पक्ष बिना कारण या पूर्व सूचना के इस अनुबंध को समाप्त कर सकता है। परीविक्षा संतोषजनक रूप से पूर्ण होने पर, कंपनी की HR नीति के अनुसार कंपनी के विधिवत अधिकृत अधिकारी द्वारा लिखित रूप में रोजगार की पुष्टि की जाएगी।
          </div>

          {/* ३. वेतन एवं मुआवजा */}
          <div className="section-heading">३. वेतन एवं मुआवजा</div>

          <div className="sub-heading">वेतन</div>
          <div className="body-text">
            कंपनी कर्मचारी को ₹{' '}
            <span className="underline-blank">{convertNumberToHindi(data.employment?.grossAnnualSalary || '')}</span>
            /- (रुपये{' '}
            <span className="underline-blank" style={{ minWidth: '160px' }}>
              {convertToHindi(data.employment?.grossAnnualSalaryWords || '')}
            </span>{' '}
            मात्र) का सकल वार्षिक वेतन देगी,
            जो ₹{' '}
            <span className="underline-blank">{convertNumberToHindi(data.employment?.grossMonthlySalary || '')}</span>
            /- (रुपये{' '}
            <span className="underline-blank" style={{ minWidth: '140px' }}>
              {convertToHindi(data.employment?.grossMonthlySalaryWords || '')}
            </span>{' '}
            मात्र) के सकल मासिक वेतन के समतुल्य है,
            जो अगले माह की 7 तारीख को या उससे पहले समान मासिक किस्तों में, आयकर अधिनियम, 1961 के अंतर्गत लागू TDS कटौतियों और भारतीय कानून के अनुसार वैधानिक रोके के अधीन देय होगा। वेतन किसी भी समय लागू श्रेणी और राज्य के लिए न्यूनतम वेतन अधिनियम, 1948 के अंतर्गत अधिसूचित न्यूनतम वेतन से कम नहीं होगा।
          </div>

          <div className="sub-heading">वैधानिक लाभ</div>
          <div className="body-text">
            प्राइवेट लिमिटेड कंपनियों पर लागू भारतीय श्रम विधान के अनुसार, कर्मचारी निम्नलिखित वैधानिक लाभों का हकदार होगा:
          </div>

          <div style={{ fontWeight: 700, fontSize: '13px', marginTop: '5px', marginBottom: '2px' }}>
            अनिवार्य वैधानिक लाभ
          </div>
          <ul className="benefits-list">
            <li><strong>कर्मचारी भविष्य निधि (ईपीएफ) — ईपीएफ एवं एमपी अधिनियम, 1952:</strong> नियोक्ता और कर्मचारी दोनों मूल वेतन का 12% योगदान देंगे। 20 या अधिक व्यक्तियों को नियोजित करने पर लागू।</li>
            <li><strong>कर्मचारी राज्य बीमा (ईएसआई) — ईएसआई अधिनियम, 1948:</strong> लागू जहाँ कर्मचारी का सकल वेतन ₹21,000/- प्रति माह या उससे कम हो और प्रतिष्ठान 10 (कुछ राज्यों में 20) या अधिक व्यक्तियों को नियोजित करे। ईएसआई कवरेज में चिकित्सा, बीमारी, मातृत्व और विकलांगता लाभ शामिल हैं।</li>
            <li><strong>ग्रेच्युटी — ग्रेच्युटी भुगतान अधिनियम, 1972:</strong> 5 (पाँच) वर्ष की निरंतर सेवा पूर्ण होने पर प्रत्येक पूर्ण सेवा वर्ष के लिए 15 दिन के वेतन की दर से देय।</li>
            <li>
              <strong>अवकाश पात्रता — दुकान एवं प्रतिष्ठान अधिनियम (राज्य):</strong> सवैतनिक वार्षिक / अर्जित अवकाश ({convertNumberToHindi(data.employment?.annualLeaves || '12')} दिन),
              बीमारी / चिकित्सा अवकाश ({convertNumberToHindi(data.employment?.medicalLeaves || '6')} दिन) और आकस्मिक अवकाश ({convertNumberToHindi(data.employment?.casualLeaves || '6')} दिन) प्रति कैलेंडर वर्ष।
            </li>
            <li><strong>मातृत्व लाभ — मातृत्व लाभ अधिनियम, 1961:</strong> पात्र महिला कर्मचारियों के लिए 26 सप्ताह का सवैतनिक मातृत्व अवकाश (2 जीवित बच्चों तक); अगली गर्भावस्था के लिए 12 सप्ताह।</li>
            <li><strong>बोनस — बोनस भुगतान अधिनियम, 1965:</strong> लागू यदि कंपनी का वार्षिक कारोबार अधिनियम के अंतर्गत अर्हता प्राप्त करे; वार्षिक वेतन का न्यूनतम 8.33% या ₹100/- प्रति माह, जो भी अधिक हो।</li>
            <li><strong>न्यूनतम वेतन — न्यूनतम वेतन अधिनियम, 1948:</strong> कर्मचारी का कुल पारिश्रमिक किसी भी समय राज्य सरकार द्वारा लागू अनुसूचित रोजगार श्रेणी के लिए अधिसूचित न्यूनतम वेतन से कम नहीं होगा।</li>
          </ul>

          <div style={{ fontWeight: 700, fontSize: '13px', marginTop: '5px', marginBottom: '2px' }}>
            स्वैच्छिक / अतिरिक्त लाभ
          </div>
          <ul className="benefits-list">
            <li><strong>समूह स्वास्थ्य बीमा:</strong> कंपनी नीति के अनुसार चिकित्सा कवरेज।</li>
            <li><strong>प्रदर्शन प्रोत्साहन:</strong> समयनिष्ठता, विश्वसनीयता और असाधारण सेवा के लिए विवेकाधीन प्रोत्साहन।</li>
            <li><strong>वर्दी / ड्रेस कोड भत्ता:</strong> जहाँ लागू हो, कंपनी नीति के अनुसार कंपनी वर्दी या ड्रेस कोड भत्ता प्रदान कर सकती है।</li>
            <li><strong>यात्रा भत्ता:</strong> कंपनी की प्रतिपूर्ति नीति के अनुसार आधिकारिक यात्रा और कार्यों के लिए प्रतिपूर्ति।</li>
          </ul>

          <div style={{ fontWeight: 700, fontSize: '13px', marginTop: '5px', marginBottom: '2px' }}>
            वैकल्पिक सुविधाएं
          </div>
          <ul className="benefits-list">
            <li>अतिरिक्त अवकाश: कंपनी नीति के अनुसार पितृत्व अवकाश, शोक अवकाश।</li>
            <li>भविष्य निधि अंशदान और कंपनी द्वारा समय-समय पर निर्धारित अन्य लाभ।</li>
          </ul>

        </div>
        <PrintFooter />
      </div>

      <div className="a4-gap" />

      {/* ══════════════════════════════════════════
          पृष्ठ ३
      ══════════════════════════════════════════ */}
      <div className="a4-page" style={{ position: "relative" }}>
        {/* वॉटरमार्क */}
        <div style={{
          position: "absolute", top: 0, left: 0, width: "100%", height: "100%",
          display: "flex", alignItems: "center", justifyContent: "center",
          opacity: 0.08, zIndex: 0, pointerEvents: "none",
        }}>
          <img src={companyWatermark || companyLogo || ''}
            style={{ width: "70%", maxWidth: "720px", height: "auto", objectFit: "contain" }} />
        </div>

        {/* सामग्री */}
        <div style={{ position: "relative", zIndex: 1 }}>

          <div className="divider-page"></div>

          {/* ४. कार्य के घंटे */}
          <div className="section-heading">४. कार्य के घंटे</div>
          <div className="body-text">
            कर्मचारी के मानक कार्य घंटे{' '}
            <span className="underline-blank">{data.employment?.workingHours || 'प्रातः 9:00 से सायं 6:00 बजे'}</span>,{' '}
            {data.employment?.workingDays || 'सोमवार से शनिवार'} होंगे, जिसमें{' '}
            <span className="underline-blank">{data.employment?.lunchBreak || '1 (एक) घंटे'}</span>{' '}
            का दोपहर भोजन अवकाश होगा, जो लागू राज्य दुकान एवं प्रतिष्ठान अधिनियम के अनुसार होगा। MTS भूमिका की परिचालन प्रकृति को देखते हुए, कर्मचारी को परियोजना स्थलों, ग्राहक स्थानों या बाहरी कार्यालयों पर काम के लिए जल्दी रिपोर्ट करना, देर तक रुकना या जाना आवश्यक हो सकता है। किसी भी अतिरिक्त कार्य का मुआवजा लागू कानून के अनुसार होगा।
          </div>

          {/* ५. आचार संहिता और व्यावहारिक मानक */}
          <div className="section-heading">५. आचार संहिता और व्यावहारिक मानक</div>
          <div className="body-text">
            कार्यालयों, परियोजना स्थलों और बाहरी स्थानों पर कंपनी का प्रतिनिधित्व करने वाले MTS कर्मचारी के रूप में, कर्मचारी सदैव:
          </div>
          <div className="conduct-box">
            <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '12.5px', lineHeight: 1.8 }}>
              <li>साफ, स्वच्छ और प्रस्तुत करने योग्य उपस्थिति बनाए रखेगा और कंपनी के ड्रेस कोड या वर्दी आवश्यकताओं का पालन करेगा;</li>
              <li>ग्राहकों, आगंतुकों, सहकर्मियों और आम जनता के प्रति सदैव विनम्र और सम्मानपूर्ण व्यवहार करेगा;</li>
              <li>कार्यालय या परियोजना स्थल परिसर में शराब, तम्बाकू या किसी भी नशीले पदार्थ का सेवन नहीं करेगा;</li>
              <li>उसे सौंपे गए सभी दस्तावेज़ों, चेक, डिमांड ड्राफ्ट और आधिकारिक सामग्रियों को अत्यंत सावधानी, ईमानदारी और जिम्मेदारी के साथ संभालेगा;</li>
              <li>अपनी अभिरक्षा में कंपनी की संपत्ति या दस्तावेज़ों के खोने, चोरी, क्षति या गुम होने की तुरंत पर्यवेक्षी प्राधिकारी को सूचना देगा;</li>
              <li>किसी भी बाहरी व्यक्ति को ग्राहकों, संपत्तियों, मूल्य निर्धारण, आंतरिक संचालन या व्यावसायिक लेन-देन के बारे में कोई जानकारी नहीं देगा;</li>
              <li>कंपनी की संपत्ति, वाहन या उपकरण का उपयोग केवल आधिकारिक उद्देश्यों के लिए करेगा।</li>
            </ul>
          </div>
          <div className="body-text">
            आचार संहिता के किसी भी उल्लंघन पर कंपनी के विवेकानुसार निलंबन या समाप्ति सहित अनुशासनात्मक कार्रवाई हो सकती है।
          </div>

          {/* ६. गोपनीयता */}
          <div className="section-heading">६. गोपनीयता</div>
          <div className="body-text">
            कर्मचारी स्वीकार करता है कि अपने कर्तव्यों के दौरान, वह कंपनी की गोपनीय जानकारी को संभाल सकता है, ले जा सकता है या अनजाने में उससे अवगत हो सकता है, जिसमें ग्राहक विवरण, संपत्ति लेन-देन दस्तावेज़, वित्तीय लिखत, आंतरिक पत्राचार और व्यावसायिक रणनीतियाँ शामिल हैं, परंतु इन्हीं तक सीमित नहीं। कर्मचारी सहमत है कि वह:
          </div>
          <ul className="clause-list">
            <li>रोजगार की अवधि के दौरान और बाद में ऐसी सभी जानकारी को पूर्णतः गोपनीय रखेगा;</li>
            <li>किसी भी कंपनी दस्तावेज़, रिकॉर्ड या जानकारी को किसी अनधिकृत व्यक्ति को प्रकट, कॉपी, फोटोग्राफ या साझा नहीं करेगा;</li>
            <li>रोजगार समाप्ति पर तुरंत सभी दस्तावेज़, सामग्री, चाबियाँ, एक्सेस कार्ड, वर्दी और कंपनी संपत्ति वापस करेगा।</li>
          </ul>

          {/* ७. गैर-प्रतिस्पर्धा */}
          <div className="section-heading">७. गैर-प्रतिस्पर्धा</div>
          <div className="body-text">
            रोजगार की अवधि के दौरान और किसी भी कारण से रोजगार समाप्त होने के बाद{' '}
            <span className="underline-blank">{data.employment?.nonCompetePeriod || '3 (तीन) माह'}</span>{' '}
            की अवधि के लिए, कर्मचारी कंपनी के प्राथमिक व्यवसाय स्थान की{' '}
            <span className="underline-blank">{data.employment?.nonCompeteRadius || '10 कि.मी.'}</span>{' '}
            परिधि में किसी भी प्रतिस्पर्धी रियल एस्टेट व्यवसाय के लिए प्रत्यक्ष या अप्रत्यक्ष रूप से काम नहीं करेगा, सहायता नहीं करेगा या सेवाएं नहीं देगा।
          </div>

          {/* ८. रोजगार की समाप्ति */}
          <div className="section-heading">८. रोजगार की समाप्ति</div>

          <div className="sub-heading">कंपनी द्वारा समाप्ति</div>
          <div className="body-text">कंपनी निम्नलिखित परिस्थितियों में इस अनुबंध को समाप्त कर सकती है:</div>
          <ul className="termination-list">
            <li>
              <strong>कारण सहित (तत्काल बर्खास्तगी):</strong> चोरी, कंपनी की संपत्ति या दस्तावेज़ों के दुर्विनियोजन, सकल कदाचार, अवज्ञा, बेईमानी, आदतन अनुपस्थिति, कार्यस्थल पर नशे की हालत में पाए जाने, या इस अनुबंध या कंपनी नीतियों के महत्वपूर्ण उल्लंघन के कारण बिना सूचना के तत्काल।
            </li>
            <li>
              <strong>कारण रहित:</strong>{' '}
              <span className="underline-blank">{data.employment?.noticePeriodEmployer || '15 (पंद्रह) दिन'}</span>{' '}
              की लिखित सूचना या सूचना के स्थान पर वेतन भुगतान प्रदान करके, लागू होने पर औद्योगिक विवाद अधिनियम, 1947 और राज्य दुकान एवं प्रतिष्ठान अधिनियम के प्रावधानों के अधीन।
            </li>
          </ul>

          <div className="sub-heading">कर्मचारी द्वारा समाप्ति</div>
          <div className="body-text">
            कर्मचारी कंपनी को{' '}
            <span className="underline-blank">{data.employment?.noticePeriodEmployee || '15 (पंद्रह) दिन'}</span>{' '}
            की लिखित सूचना देकर इस्तीफा दे सकता है। रोजगार समाप्ति पर, कर्मचारी: (i) अपने कब्जे में मौजूद सभी कंपनी संपत्ति, दस्तावेज़, चाबियाँ, एक्सेस कार्ड, वर्दी और सामग्री तुरंत वापस करेगा; (ii) लंबित कार्यों का औपचारिक हस्तांतरण पूरा करेगा; और (iii) अंतिम निपटान से पहले नो-ड्यूज प्रमाण पत्र पर हस्ताक्षर करेगा।
          </div>

          {/* ९. शासक कानून और अधिकार क्षेत्र */}
          <div className="section-heading">९. शासक कानून और अधिकार क्षेत्र</div>
          <div className="body-text">
            यह अनुबंध कंपनी अधिनियम, 2013, अनुबंध अधिनियम, 1872, न्यूनतम वेतन अधिनियम, 1948 और लागू श्रम विधान सहित भारत के कानूनों के अनुसार शासित और निर्वचित किया जाएगा। इस अनुबंध से उत्पन्न या संबंधित किसी भी विवाद पर{' '}
            <span className="underline-blank">{data.employment?.jurisdiction || data.company?.companyDistrict || ''}</span>{' '}
            के न्यायालयों का अनन्य अधिकार क्षेत्र होगा।
          </div>

          {/* १०. संपूर्ण अनुबंध */}
          <div className="section-heading">१०. संपूर्ण अनुबंध</div>
          <div className="body-text">
            यह अनुबंध रोजगार की शर्तों के संबंध में कंपनी और कर्मचारी के बीच संपूर्ण अनुबंध का गठन करता है और सभी पूर्व चर्चाओं, वार्ताओं और अनुबंधों, चाहे लिखित हों या मौखिक, को अधिक्रमित करता है। इसमें निहित नहीं किए गए किसी भी प्रतिनिधित्व का कोई कानूनी प्रभाव नहीं होगा।
          </div>

        </div>
        <PrintFooter />
      </div>

      <div className="a4-gap" />

      {/* ══════════════════════════════════════════
          पृष्ठ ४
      ══════════════════════════════════════════ */}
      <div className="a4-page" style={{ position: "relative" }}>
        {/* वॉटरमार्क */}
        <div style={{
          position: "absolute", top: 0, left: 0, width: "100%", height: "100%",
          display: "flex", alignItems: "center", justifyContent: "center",
          opacity: 0.08, zIndex: 0, pointerEvents: "none",
        }}>
          <img src={companyWatermark || companyLogo || ''}
            style={{ width: "70%", maxWidth: "720px", height: "auto", objectFit: "contain" }} />
        </div>

        {/* सामग्री */}
        <div style={{ position: "relative", zIndex: 1 }}>

          <div className="divider-page"></div>

          {/* ११. संशोधन */}
          <div className="section-heading">११. संशोधन</div>
          <div className="body-text">
            इस अनुबंध में कोई भी संशोधन या परिवर्तन केवल तभी वैध होगा जब वह लिखित रूप में हो और कंपनी के अधिकृत प्रतिनिधि तथा कर्मचारी दोनों द्वारा विधिवत हस्ताक्षरित हो। कोई भी मौखिक संशोधन किसी भी पक्ष पर बाध्यकारी नहीं होगा।
          </div>

          {/* १२. पृथक्करणीयता */}
          <div className="section-heading">१२. पृथक्करणीयता</div>
          <div className="body-text">
            यदि इस अनुबंध का कोई प्रावधान लागू कानून के अंतर्गत अवैध, शून्य या अप्रवर्तनीय पाया जाता है, तो ऐसे प्रावधान को इस अनुबंध से अलग माना जाएगा और शेष प्रावधान पूर्ण बल और प्रभाव के साथ जारी रहेंगे।
          </div>

          {/* १३. वैधानिक अनुपालन घोषणा */}
          <div className="section-heading">१३. वैधानिक अनुपालन घोषणा</div>
          <div className="body-text">
            दोनों पक्ष स्वीकार करते हैं कि यह अनुबंध सभी लागू केंद्रीय और राज्य विधान के अधीन है और उसके अनुरूप निर्वचित किया जाएगा, जिनमें निम्नलिखित शामिल हैं, परंतु इन्हीं तक सीमित नहीं:
          </div>
          <div className="compliance-box">
            <strong>लागू विधान:</strong> कंपनी अधिनियम, 2013 &nbsp;|&nbsp; अनुबंध अधिनियम, 1872 &nbsp;|&nbsp; न्यूनतम वेतन अधिनियम, 1948 &nbsp;|&nbsp; वेतन भुगतान अधिनियम, 1936 &nbsp;|&nbsp; EPF एवं MP अधिनियम, 1952 &nbsp;|&nbsp; ESI अधिनियम, 1948 &nbsp;|&nbsp; ग्रेच्युटी भुगतान अधिनियम, 1972 &nbsp;|&nbsp; बोनस भुगतान अधिनियम, 1965 &nbsp;|&nbsp; मातृत्व लाभ अधिनियम, 1961 &nbsp;|&nbsp; औद्योगिक विवाद अधिनियम, 1947 &nbsp;|&nbsp; ठेका श्रम (विनियमन एवं उन्मूलन) अधिनियम, 1970 &nbsp;|&nbsp; अंतर-राज्यीय प्रवासी कामगार अधिनियम, 1979 (यदि लागू हो) &nbsp;|&nbsp; कार्यस्थल पर महिलाओं का यौन उत्पीड़न (रोकथाम, निषेध और निवारण) अधिनियम, 2013 (POSH) &nbsp;|&nbsp; राज्य दुकान एवं प्रतिष्ठान अधिनियम (महाराष्ट्र)
          </div>
          <div className="body-text" style={{ marginTop: '4px' }}>
            इस अनुबंध की शर्तों और किसी भी लागू अधिनियम के प्रावधानों के बीच किसी भी विरोध की स्थिति में, अधिनियम की शर्तें प्रभावी होंगी। कंपनी पुष्टि करती है कि वह कर्मचारी के संबंध में सभी लागू न्यूनतम वेतन अधिसूचनाओं और श्रम कल्याण दायित्वों का पालन करेगी।
          </div>

          {/* हस्ताक्षर */}
          <div className="sig-grid">

            {/* कंपनी के हस्ताक्षर */}
            <div className="sig-block">
              <div className="sig-block-title">कंपनी की ओर से और उसके लिए</div>
              <div className="sig-line" />
              <div className="sig-field-row">
                <strong>दिनांक:</strong>
                <span className="underline-blank" style={{ minWidth: '110px' }}>
                  {formatHindiDate(data.employment?.joiningDate)}
                </span>
              </div>
              <div className="sig-field-row">
                <strong>नाम:</strong>
                <span className="underline-blank" style={{ minWidth: '130px' }}>
                  {data.manager?.managerName || data.company?.managerName || data.company?.hrName || ''}
                </span>
              </div>
              <div className="sig-field-row">
                <strong>पदनाम:</strong>
                <span className="underline-blank" style={{ minWidth: '110px' }}>
                  {data.manager?.managerPosition || data.company?.managerPosition || data.company?.hrDesignation}
                </span>
              </div>
              <div className="sig-field-row">
                <strong>DIN / PAN:</strong>
                <span className="underline-blank" style={{ minWidth: '110px' }}>
                  {data.company?.managerPAN || data.manager?.managerPAN || ''}
                </span>
              </div>
              <div style={{ marginTop: '6px', fontSize: '12px', fontStyle: 'italic' }}>
                अधिकृत हस्ताक्षरकर्ता — {convertToHindi(data.company?.companyName || '')}{data.company?.entityType ? ` (${data.company.entityType})` : ''}
              </div>
            </div>

            {/* कर्मचारी के हस्ताक्षर */}
            <div className="sig-block">
              <div className="sig-block-title">कर्मचारी की स्वीकृति</div>
              <div className="sig-line" />
              <div className="sig-field-row">
                <strong>दिनांक:</strong>
                <span className="underline-blank" style={{ minWidth: '110px' }}>
                  {formatHindiDate(data.employment?.joiningDate)}
                </span>
              </div>
              <div className="sig-field-row">
                <strong>नाम:</strong>
                <span className="underline-blank" style={{ minWidth: '130px' }}>
                  {employeeFullName}
                </span>
              </div>
              <div className="sig-field-row">
                <strong>आधार क्र.:</strong>
                <span className="underline-blank" style={{ minWidth: '110px' }}>
                  {formatAadhaarHindi(data.employee?.aadhaar) || ''}
                </span>
              </div>
              <div style={{ marginTop: '14px', fontSize: '12.5px', fontWeight: 700 }}>
                बायां अंगूठा निशान:-
              </div>
              <div style={{
                border: '1px solid #000',
                minHeight: '77px',
                marginTop: '4px',
                width: '130px',
              }} />
            </div>

          </div>

          {/* साक्षी */}
          <div style={{ marginTop: '24px', borderTop: '1.5px solid #000', paddingTop: '10px' }}>
            <div style={{ fontWeight: 700, fontSize: '13px', marginBottom: '8px' }}>साक्षी</div>
            <div style={{ display: 'flex', gap: '40px' }}>
              <div style={{ flex: 1, fontSize: '13px', lineHeight: 1.8 }}>
                <div><strong>१.</strong> नाम: <span className="underline-blank" style={{ minWidth: '140px' }} /></div>
                <div style={{ marginTop: '4px' }}>हस्ताक्षर: <span className="underline-blank" style={{ minWidth: '120px' }} /></div>
              </div>
              <div style={{ flex: 1, fontSize: '13px', lineHeight: 1.8 }}>
                <div><strong>२.</strong> नाम: <span className="underline-blank" style={{ minWidth: '140px' }} /></div>
                <div style={{ marginTop: '4px' }}>हस्ताक्षर: <span className="underline-blank" style={{ minWidth: '120px' }} /></div>
              </div>
            </div>
          </div>

          <div className="end-text">* * * समाप्त * * *</div>

        </div>
        <PrintFooter />
      </div>

    </div>
  );
};

export default HindiMTSAgreement;
