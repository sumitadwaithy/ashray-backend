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

const HindiDigitalGrowthManagerAgreement = ({ data, companyLogo, companyWatermark }: TemplateProps) => {

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

  // Default duties in Hindi for Digital Growth Manager
  const defaultDuties = [
    "कंपनी की ऑनलाइन दृश्यता, लीड जनरेशन एवं ब्रांड जागरूकता बढ़ाने हेतु व्यापक डिजिटल मार्केटिंग रणनीतियों का निर्माण एवं क्रियान्वयन करना।",
    "कंपनी की वेबसाइट, गूगल बिज़नेस प्रोफ़ाइल, सोशल मीडिया (Instagram, Facebook, LinkedIn, YouTube) तथा रियल एस्टेट लिस्टिंग पोर्टल पर उपस्थिति का प्रबंधन एवं अनुकूलन करना।",
    "रील्स, प्रॉपर्टी शोकेस वीडियो, ब्लॉग पोस्ट, ई-मेलर एवं पेड विज्ञापन क्रिएटिव सहित कंपनी की ब्रांड पहचान के अनुरूप आकर्षक डिजिटल कंटेंट की योजना बनाना, तैयार करना एवं प्रकाशित करना।",
    "परफॉर्मेंस मार्केटिंग अभियानों (Google Ads, Meta Ads, YouTube Ads) का संचालन एवं प्रबंधन करना, KPI की निगरानी करना तथा निवेश पर अधिकतम रिटर्न (ROI) सुनिश्चित करने हेतु अभियानों का अनुकूलन करना।",
    "कंपनी की डिजिटल संपत्तियों पर जैविक ट्रैफ़िक एवं योग्य विज़िटर बढ़ाने हेतु सर्च इंजन ऑप्टिमाइज़ेशन (SEO) एवं सर्च इंजन मार्केटिंग (SEM) गतिविधियाँ संचालित करना।",
    "Google Analytics, Meta Business Suite एवं अन्य प्रासंगिक प्लेटफ़ॉर्म के माध्यम से डिजिटल अभियानों के प्रदर्शन की निगरानी, विश्लेषण एवं मासिक रिपोर्टिंग प्रबंधन को प्रस्तुत करना।",
    "CRM एकीकरण, लीड नर्चरिंग वर्कफ़्लो एवं डिजिटल सेल्स फ़नल का प्रबंधन करना ताकि ऑनलाइन पूछताछ का समयबद्ध अनुवर्ती कार्रवाई एवं रूपांतरण सुनिश्चित हो सके।",
    "डिजिटल प्रयासों को बिक्री लक्ष्यों एवं प्रोजेक्ट लॉन्च योजनाओं के अनुरूप बनाने हेतु बिक्री दल, चैनल पार्टनर एवं बाह्य एजेंसियों के साथ समन्वय करना।",
    "रियल एस्टेट क्षेत्र में उभरते डिजिटल मार्केटिंग रुझानों, प्रतिस्पर्धी गतिविधियों एवं उद्योग की सर्वोत्तम प्रथाओं से अद्यतन रहना तथा यथाउचित नवाचारों की अनुशंसा करना।",
    "कंपनी के डिजिटल विकास उद्देश्यों की पूर्ति हेतु प्रबंधन द्वारा समय-समय पर सौंपे गए अन्य कार्यों का निष्पादन करना।",
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
          font-family: 'Noto Sans Devanagari', 'Mangal', 'Kokila', 'Arial Unicode MS', serif;
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
          letter-spacing: 0.5px;
          margin: 14px 0 2px 0;
          font-family: 'Noto Sans Devanagari', 'Mangal', serif;
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
          line-height: 1.85;
        }
        .party-name {
          font-weight: 800;
          font-size: 13.5px;
          letter-spacing: 0.2px;
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
          text-decoration: underline;
          margin-top: 13px;
          margin-bottom: 4px;
          letter-spacing: 0.2px;
        }
        .body-text {
          font-size: 13px;
          line-height: 1.9;
          text-align: justify;
          margin-bottom: 5px;
        }
        .duty-list {
          margin: 3px 0 5px 20px;
          font-size: 12.5px;
          line-height: 1.9;
          list-style-type: decimal;
        }
        .duty-list li {
          margin-bottom: 3px;
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
          line-height: 1.85;
          list-style-type: disc;
        }
        .benefits-list li {
          margin-bottom: 2px;
        }
        .termination-list {
          margin: 3px 0 5px 20px;
          font-size: 13px;
          line-height: 1.85;
          list-style-type: disc;
        }
        .termination-list li {
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
          line-height: 1.85;
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
        .a4-gap {
          height: 40px;
        }
        @media print {
          .a4-gap { display: none; }
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

          {/* TITLE */}
          <div className="agreement-title">रोज़गार अनुबंध</div>
          <div className="agreement-subtitle">(डिजिटल ग्रोथ मैनेजर)</div>

          {/* PREAMBLE */}
          <div className="body-text">
            यह रोज़गार अनुबंध <strong>("अनुबंध")</strong> दिनांक{' '}
            <span className="underline-blank">{formatHindiDate(data.employment?.joiningDate)}</span>{' '}
            को निम्नलिखित पक्षों के मध्य निष्पादित किया जाता है:
          </div>

          {/* EMPLOYER */}
          <div className="party-block">
            <div className="party-name">{employerFullName}</div>
            <div><strong>पता:</strong> {employerAddress}</div>
            <div><strong>CIN:</strong> {data.company?.cinNumber || ''}</div>
            <div><strong>PAN:</strong> {data.company?.companyPan || ''}</div>
            <div style={{ fontStyle: 'italic' }}>(जिसे इस अनुबंध में <strong>"नियोक्ता"</strong> अथवा <strong>"कंपनी"</strong> कहा जाएगा)</div>
          </div>

          <div className="and-divider">एवं</div>

          {/* EMPLOYEE */}
          <div className="party-block">
            <div className="party-name">{employeeFullName}</div>
            <div><strong>पता:</strong> {employeeAddress}</div>
            <div><strong>जन्म तिथि:</strong> {data.employee?.dob ? formatHindiDate(data.employee.dob) : <span className="underline-blank" style={{ minWidth: '100px' }} />}</div>
            <div>
              <strong>आधार संख्या:</strong> {formatAadhaarHindi(data.employee?.aadhaar) || <span className="underline-blank" style={{ minWidth: '120px' }} />}
              &emsp;
              <strong>PAN संख्या:</strong> {data.employee?.pan || <span className="underline-blank" style={{ minWidth: '100px' }} />}
            </div>
            <div style={{ fontStyle: 'italic' }}>(जिसे इस अनुबंध में <strong>"कर्मचारी"</strong> कहा जाएगा)</div>
          </div>

          {/* धारा १ — पद एवं कर्तव्य */}
          <div className="section-heading">१. पद एवं कर्तव्य</div>
          <div className="body-text">
            नियोक्ता द्वारा कर्मचारी को{' '}
            <strong>डिजिटल ग्रोथ मैनेजर</strong>{' '}
            {data.employment?.department ? `(${data.employment.department} विभाग)` : '(डिजिटल मार्केटिंग एवं ग्रोथ विभाग)'}{' '}
            के पद पर नियुक्त किया जाता है। कर्मचारी{' '}
            <span className="underline-blank">{convertToHindi(data.employment?.reportingTo || '')}</span>{' '}
            को रिपोर्ट करेगा/करेगी तथा कंपनी की डिजिटल उपस्थिति, ऑनलाइन लीड जनरेशन एवं ब्रांड विकास के लिए उत्तरदायी होगा/होगी। कर्मचारी के कर्तव्यों एवं उत्तरदायित्वों में निम्नलिखित सम्मिलित होंगे, परंतु ये इन्हीं तक सीमित नहीं रहेंगे:
          </div>
          <ol className="duty-list">
            {allDuties.map((duty, idx) => (
              <li key={idx}>{duty}</li>
            ))}
          </ol>

        </div>
        <PrintFooter />
      </div>

      <div className="a4-gap" />

      {/* ══════════════════════════════════════════
          पृष्ठ २ — PAGE 2
      ══════════════════════════════════════════ */}
      <div className="a4-page" style={{ position: "relative" }}>

        {/* WATERMARK */}
        <div style={{
          position: "absolute", top: 0, left: 0, width: "100%", height: "100%",
          display: "flex", alignItems: "center", justifyContent: "center",
          opacity: 0.08, zIndex: 0, pointerEvents: "none",
        }}>
          <img src={companyWatermark || companyLogo || ''} style={{ width: "70%", maxWidth: "720px", height: "auto", objectFit: "contain" }} />
        </div>
        <div className="divider-page"></div>

        {/* CONTENT */}
        <div style={{ position: "relative", zIndex: 1 }}>

          {/* धारा २ — नियुक्ति का प्रारंभ */}
          <div className="section-heading">२. नियुक्ति का प्रारंभ</div>
          <div className="body-text">
            कर्मचारी की नियुक्ति दिनांक{' '}
            <span className="underline-blank">{formatHindiDate(data.employment?.joiningDate)}</span>{' '}
            से प्रारंभ होगी। कर्मचारी को योगदान की तिथि से{' '}
            <strong>{data.employment?.probationPeriod || '३ (तीन) माह'}</strong>{' '}
            की परिवीक्षा अवधि पर रखा जाएगा, जिस दौरान कोई भी पक्ष बिना कारण अथवा पूर्व सूचना के यह अनुबंध समाप्त कर सकता है। परिवीक्षा अवधि के सफल समापन के पश्चात कंपनी के अधिकृत हस्ताक्षरकर्ता द्वारा नियुक्ति की लिखित पुष्टि की जाएगी।
          </div>

          {/* धारा ३ — नियुक्ति का स्थान */}
          <div className="section-heading">३. नियुक्ति का स्थान</div>
          <div className="body-text">
            कर्मचारी की प्राथमिक नियुक्ति का स्थान{' '}
            <span className="underline-blank" style={{ minWidth: '140px' }}>
              {data.employment?.placeOfPosting || data.company?.companyDistrict || ''}
            </span>{' '}
            होगा। नियोक्ता को यह अधिकार होगा कि वह आवश्यकतानुसार, पूर्व सूचना देकर, कर्मचारी का किसी अन्य स्थान, परियोजना स्थल अथवा कंपनी के किसी अन्य कार्यालय में स्थानांतरण अथवा प्रतिनियुक्ति कर सके।
          </div>

          {/* धारा ४ — वेतन एवं परिलब्धियाँ */}
          <div className="section-heading">४. वेतन एवं परिलब्धियाँ</div>

          <div className="sub-heading">वेतन</div>
          <div className="body-text">
            नियोक्ता कर्मचारी को वार्षिक सकल वेतन ₹{' '}
            <span className="underline-blank">{convertNumberToHindi(data.employment?.grossAnnualSalary || '')}</span>/-{' '}
            (रुपये{' '}
            <span className="underline-blank" style={{ minWidth: '160px' }}>{convertToHindi(data.employment?.grossAnnualSalaryWords || '')}</span>{' '}
            मात्र) का भुगतान करेगा, जो मासिक सकल वेतन ₹{' '}
            <span className="underline-blank">{convertNumberToHindi(data.employment?.grossMonthlySalary || '')}</span>/-{' '}
            (रुपये{' '}
            <span className="underline-blank" style={{ minWidth: '140px' }}>{convertToHindi(data.employment?.grossMonthlySalaryWords || '')}</span>{' '}
            मात्र) के बराबर होगा। यह वेतन प्रत्येक माह की ७ तारीख को अथवा उससे पूर्व समान मासिक किश्तों में आयकर अधिनियम, १९६१ एवं अन्य लागू विधियों के अंतर्गत निर्धारित कटौतियों एवं वैधानिक उद्ग्रहणों के अधीन भुगतान किया जाएगा।
          </div>

          <div className="sub-heading">प्रदर्शन-आधारित प्रोत्साहन</div>
          <div className="body-text">
            कर्मचारी प्रबंधन द्वारा समय-समय पर निर्धारित डिजिटल KPI ढाँचे के अनुसार प्रदर्शन-आधारित प्रोत्साहन का पात्र/पात्रा होगा/होगी, जिसमें लीड जनरेशन मात्रा, प्रति लीड लागत, वेबसाइट ट्रैफ़िक वृद्धि, सोशल मीडिया एंगेजमेंट एवं अभियान ROI जैसे मापदंड सम्मिलित हो सकते हैं। ऐसे प्रोत्साहन पूर्णतः प्रबंधन के विवेकाधिकार पर निर्भर होंगे तथा ये निश्चित संविदात्मक पारिश्रमिक का भाग नहीं होंगे।
          </div>

          <div className="sub-heading">लाभ एवं सुविधाएँ</div>
          <div className="body-text">
            कंपनी अधिनियम, २०१३ के अंतर्गत पंजीकृत प्राइवेट लिमिटेड कंपनी होने के नाते नियोक्ता निम्नलिखित वैधानिक एवं ऐच्छिक लाभ प्रदान करेगा:
          </div>

          <div style={{ fontWeight: 700, fontSize: '13px', marginTop: '5px', marginBottom: '2px' }}>
            अनिवार्य वैधानिक लाभ (भारतीय विधि के अंतर्गत लागू)
          </div>
          <ul className="benefits-list">
            <li><strong>कर्मचारी भविष्य निधि (EPF):</strong> EPF एवं MP अधिनियम, १९५२ के अनुसार, २० या अधिक कर्मचारियों वाले प्रतिष्ठानों पर लागू।</li>
            <li><strong>कर्मचारी राज्य बीमा (ESI):</strong> यदि कर्मचारी का मासिक सकल वेतन ₹२१,०००/- से कम है तथा प्रतिष्ठान निर्धारित सीमा पूरी करता है।</li>
            <li><strong>उपदान (Gratuity):</strong> उपदान भुगतान अधिनियम, १९७२ के अनुसार, ५ वर्ष की निरंतर सेवा पूर्ण करने पर देय।</li>
            <li><strong>व्यवसाय कर (Professional Tax):</strong> महाराष्ट्र राज्य व्यवसाय कर अधिनियम, १९७५ के अनुसार कटौती योग्य।</li>
            <li>
              <strong>अवकाश पात्रता:</strong> वार्षिक/अर्जित अवकाश ({data.employment?.annualLeaves || '१२'} दिन),
              आकस्मिक अवकाश ({data.employment?.casualLeaves || '६'} दिन) एवं बीमारी/चिकित्सा अवकाश ({data.employment?.medicalLeaves || '६'} दिन) प्रति कैलेंडर वर्ष।
            </li>
            <li><strong>मातृत्व लाभ:</strong> मातृत्व लाभ अधिनियम, १९६१ के अनुसार पात्र महिला कर्मचारियों को लागू।</li>
          </ul>

          <div style={{ fontWeight: 700, fontSize: '13px', marginTop: '5px', marginBottom: '2px' }}>
            भूमिका-विशिष्ट एवं ऐच्छिक लाभ
          </div>
          <ul className="benefits-list">
            <li><strong>डिजिटल उपकरण एवं सॉफ्टवेयर:</strong> भूमिका निर्वहन हेतु आवश्यक लाइसेंस प्राप्त डिजिटल मार्केटिंग टूल्स, एनालिटिक्स प्लेटफ़ॉर्म, डिज़ाइन सॉफ्टवेयर एवं CRM सिस्टम तक कंपनी-प्रदत्त पहुँच।</li>
            <li><strong>समूह स्वास्थ्य बीमा:</strong> कंपनी नीति के अनुसार व्यापक चिकित्सा कवरेज।</li>
            <li><strong>व्यावसायिक विकास:</strong> भूमिका से संबंधित डिजिटल मार्केटिंग प्रमाणपत्र (Google, Meta, HubSpot), कार्यशालाओं एवं उद्योग सम्मेलनों के लिए प्रायोजित पहुँच।</li>
            <li><strong>प्रदर्शन बोनस:</strong> व्यक्तिगत एवं कंपनी के प्रदर्शन के आधार पर विवेकाधीन वार्षिक बोनस।</li>
            <li><strong>लचीला कार्य:</strong> प्रबंधन की अनुमति एवं परिचालन आवश्यकताओं के अधीन हाइब्रिड/दूरस्थ कार्य विकल्प।</li>
            <li><strong>इंटरनेट एवं संचार भत्ता:</strong> कंपनी नीति के अनुसार कार्य प्रयोजनों हेतु वास्तविक रूप से खर्च किए गए इंटरनेट एवं मोबाइल व्यय की प्रतिपूर्ति।</li>
          </ul>

        </div>
        <PrintFooter />
      </div>

      <div className="a4-gap" />

      {/* ══════════════════════════════════════════
          पृष्ठ ३ — PAGE 3
      ══════════════════════════════════════════ */}
      <div className="a4-page" style={{ position: "relative" }}>

        {/* WATERMARK */}
        <div style={{
          position: "absolute", top: 0, left: 0, width: "100%", height: "100%",
          display: "flex", alignItems: "center", justifyContent: "center",
          opacity: 0.08, zIndex: 0, pointerEvents: "none",
        }}>
          <img src={companyWatermark || companyLogo || ''} style={{ width: "70%", maxWidth: "720px", height: "auto", objectFit: "contain" }} />
        </div>

        {/* CONTENT */}
        <div style={{ position: "relative", zIndex: 1 }}>

          <div className="divider-page"></div>

          {/* धारा ५ — कार्य के घंटे */}
          <div className="section-heading">५. कार्य के घंटे</div>
          <div className="body-text">
            कर्मचारी के मानक कार्य-घंटे{' '}
            <span className="underline-blank">{data.employment?.workingHours || 'प्रातः ९:३० बजे से सायं ६:३० बजे तक'}</span>,{' '}
            {data.employment?.workingDays || 'सोमवार से शनिवार'} होंगे तथा{' '}
            <span className="underline-blank">{data.employment?.lunchBreak || '१ (एक) घंटे'}</span>{' '}
            का भोजनावकाश होगा। डिजिटल मार्केटिंग कार्य की प्रकृति को देखते हुए कर्मचारी यह समझता/समझती है एवं इससे सहमत है कि कभी-कभी अभियान निगरानी, सोशल मीडिया प्रबंधन एवं क्लाइंट-संबंधी गतिविधियों के लिए मानक समय के बाहर भी उपलब्ध रहना आवश्यक हो सकता है। कर्मचारी अतिरिक्त पारिश्रमिक के बिना ऐसी आवश्यकताओं के लिए उचित रूप से उपलब्ध रहेगा/रहेगी, जब तक कि अन्यथा लिखित में सहमति न हो।
          </div>

          {/* धारा ६ — बौद्धिक संपदा अधिकार */}
          <div className="section-heading">६. बौद्धिक संपदा अधिकार</div>
          <div className="body-text">
            कर्मचारी द्वारा नौकरी के दौरान — अकेले अथवा सहयोग में — निर्मित, विकसित अथवा उत्पादित समस्त रचनात्मक कार्य, डिजिटल कंटेंट, रणनीतियाँ, अभियान, डिज़ाइन, डेटाबेस, सोर्स कोड, स्क्रिप्ट, रिपोर्ट एवं अन्य सामग्री कंपनी की एकमात्र एवं अनन्य बौद्धिक संपदा होगी। कर्मचारी ऐसी समस्त कृतियों में सभी अधिकार, हक एवं हित कंपनी को हस्तांतरित करता/करती है तथा इस हस्तांतरण को प्रभावी करने हेतु आवश्यक किसी भी दस्तावेज़ पर हस्ताक्षर करने के लिए सहमत है। यह धारा अनुबंध की समाप्ति के पश्चात भी प्रभावी रहेगी।
          </div>

          {/* धारा ७ — गोपनीयता */}
          <div className="section-heading">७. गोपनीयता</div>
          <div className="body-text">
            कर्मचारी स्वीकार करता/करती है कि नौकरी के दौरान उसे कंपनी की गोपनीय एवं स्वामित्व संबंधी जानकारी तक पहुँच प्राप्त होगी, जिसमें डिजिटल मार्केटिंग रणनीतियाँ, विज्ञापन खाता डेटा, दर्शक लक्ष्यीकरण पैरामीटर, ग्राहक एवं लीड डेटाबेस, विक्रेता अनुबंध, वित्तीय प्रदर्शन डेटा, अप्रकाशित परियोजना सूचना एवं प्रौद्योगिकी प्रणालियाँ सम्मिलित हैं। कर्मचारी सहमत है कि वह ऐसी सभी जानकारी को पूर्णतः गोपनीय रखेगा/रखेगी, किसी भी तृतीय पक्ष को प्रकट नहीं करेगा/करेगी तथा नौकरी के दौरान एवं उसके पश्चात भी इसका उपयोग केवल कंपनी के हित में करेगा/करेगी। इस धारा का उल्लंघन लागू कानून के तहत हर्जाने के लिए उत्तरदायी बनाएगा।
          </div>

          {/* धारा ८ — प्रतिस्पर्धा-निषेध एवं अनुयाचन-निषेध */}
          <div className="section-heading">८. प्रतिस्पर्धा-निषेध एवं अनुयाचन-निषेध</div>
          <div className="body-text">
            नौकरी की अवधि के दौरान तथा किसी भी कारण से नौकरी समाप्त होने के पश्चात{' '}
            <span className="underline-blank">{data.employment?.nonCompetePeriod || '६ (छह) माह'}</span>{' '}
            की अवधि तक कर्मचारी निम्नलिखित कार्य नहीं करेगा/करेगी:
          </div>
          <ul className="termination-list">
            <li>कंपनी के पंजीकृत कार्यालय की{' '}
              <span className="underline-blank">{data.employment?.nonCompeteRadius || '२५ किमी'}</span>{' '}
              परिधि के भीतर किसी भी प्रतिस्पर्धी रियल एस्टेट उद्यम में प्रत्यक्ष या अप्रत्यक्ष रूप से संलग्न, परामर्श अथवा नियुक्त होना;
            </li>
            <li>व्यक्तिगत लाभ अथवा किसी प्रतिस्पर्धी संस्था के हित में कंपनी के किसी ग्राहक, व्यावसायिक लीड, चैनल पार्टनर अथवा विक्रेता से संपर्क करना, उन्हें आकर्षित करना अथवा विचलित करने का प्रयास करना; अथवा</li>
            <li>कंपनी के किसी कर्मचारी को उसकी नौकरी छोड़ने के लिए प्रेरित, भर्ती अथवा उकसाना।</li>
          </ul>
          <div className="body-text">
            कर्मचारी स्वीकार करता/करती है कि ये प्रतिबंध उचित हैं, कंपनी के वैध व्यावसायिक हितों की रक्षा के लिए आवश्यक हैं तथा भारतीय विधि के अंतर्गत प्राइवेट लिमिटेड कंपनी के कर्मचारियों पर लागू मानकों के अनुरूप हैं।
          </div>

          {/* धारा ९ — नौकरी की समाप्ति */}
          <div className="section-heading">९. नौकरी की समाप्ति</div>

          <div className="sub-heading">नियोक्ता द्वारा समाप्ति</div>
          <div className="body-text">नियोक्ता निम्नलिखित परिस्थितियों में यह अनुबंध समाप्त कर सकता है:</div>
          <ul className="termination-list">
            <li>
              <strong>कारण सहित (तत्काल):</strong> घोर कदाचार, जानबूझकर अवज्ञा, धोखाधड़ी, डिजिटल संपत्तियों या कंपनी डेटा का दुरुपयोग, गोपनीय जानकारी का अनधिकृत प्रकटीकरण, आपराधिक दोषसिद्धि अथवा इस अनुबंध के किसी प्रमुख प्रावधान के उल्लंघन की स्थिति में — बिना सूचना अथवा सूचना के बदले मुआवज़े के।
            </li>
            <li>
              <strong>बिना कारण:</strong>{' '}
              <span className="underline-blank">{data.employment?.noticePeriodEmployer || '३० (तीस) दिन'}</span>{' '}
              की लिखित सूचना देकर अथवा समतुल्य वेतन भुगतान करके।
            </li>
          </ul>

          <div className="sub-heading">कर्मचारी द्वारा समाप्ति</div>
          <div className="body-text">
            कर्मचारी नियोक्ता को{' '}
            <span className="underline-blank">{data.employment?.noticePeriodEmployee || '३० (तीस) दिन'}</span>{' '}
            की लिखित सूचना देकर त्याग-पत्र दे सकता/सकती है। त्याग-पत्र अथवा समाप्ति की स्थिति में कर्मचारी: (क) कंपनी की सभी संपत्तियाँ, डिवाइस, पहुँच क्रेडेंशियल, सॉफ्टवेयर लाइसेंस एवं दस्तावेज़ तत्काल लौटाएगा/लौटाएगी; (ख) सभी डिजिटल खाते, विज्ञापन खाते, सोशल मीडिया क्रेडेंशियल एवं अभियान संपत्तियाँ कंपनी को हस्तांतरित करेगा/करेगी; एवं (ग) हैंडओवर प्रक्रिया में पूर्ण सहयोग करेगा/करेगी।
          </div>

        </div>
        <PrintFooter />
      </div>

      <div className="a4-gap" />

      {/* ══════════════════════════════════════════
          पृष्ठ ४ — PAGE 4
      ══════════════════════════════════════════ */}
      <div className="a4-page" style={{ position: "relative" }}>

        {/* WATERMARK */}
        <div style={{
          position: "absolute", top: 0, left: 0, width: "100%", height: "100%",
          display: "flex", alignItems: "center", justifyContent: "center",
          opacity: 0.08, zIndex: 0, pointerEvents: "none",
        }}>
          <img src={companyWatermark || companyLogo || ''} style={{ width: "70%", maxWidth: "720px", height: "auto", objectFit: "contain" }} />
        </div>

        {/* CONTENT */}
        <div style={{ position: "relative", zIndex: 1 }}>

          <div className="divider-page"></div>

          {/* धारा १० — आचार संहिता */}
          <div className="section-heading">१०. आचार संहिता एवं व्यावसायिक मानक</div>
          <div className="body-text">
            कर्मचारी ऑनलाइन और ऑफलाइन दोनों जगह कंपनी का प्रतिनिधित्व करते समय सदैव व्यावसायिक एवं नैतिक आचरण करने के लिए सहमत है। कर्मचारी ऐसी कोई भी सामग्री — व्यक्तिगत अथवा कंपनी चैनलों पर — प्रकाशित, पोस्ट अथवा प्रसारित नहीं करेगा/करेगी जो कंपनी की प्रतिष्ठा को नुकसान पहुँचाए, लागू विज्ञापन मानकों (ASI दिशानिर्देशों सहित) का उल्लंघन करे अथवा सूचना प्रौद्योगिकी अधिनियम, २००० का उल्लंघन करे। कर्मचारी ग्राहक अथवा लीड डेटा संभालते समय डिजिटल व्यक्तिगत डेटा संरक्षण अधिनियम, २०२३ के तहत लागू सभी डेटा सुरक्षा दायित्वों का अनुपालन करेगा/करेगी।
          </div>

          {/* धारा ११ — शासी कानून एवं न्यायक्षेत्र */}
          <div className="section-heading">११. शासी कानून एवं न्यायक्षेत्र</div>
          <div className="body-text">
            यह अनुबंध भारत के कानूनों द्वारा शासित एवं व्याख्यायित होगा, जिसमें कंपनी अधिनियम, २०१३, भारतीय अनुबंध अधिनियम, १८७२ तथा अन्य लागू केंद्रीय एवं राज्य कानून सम्मिलित हैं। इस अनुबंध से उत्पन्न अथवा इससे संबंधित किसी भी विवाद पर{' '}
            <span className="underline-blank">{data.employment?.jurisdiction || data.company?.companyDistrict || ''}</span>{' '}
            के न्यायालयों का अनन्य क्षेत्राधिकार होगा।
          </div>

          {/* धारा १२ — संपूर्ण अनुबंध */}
          <div className="section-heading">१२. संपूर्ण अनुबंध</div>
          <div className="body-text">
            यह अनुबंध नियोक्ता एवं कर्मचारी के मध्य इस विषय से संबंधित संपूर्ण सहमति का प्रतिनिधित्व करता है तथा इससे पूर्व के सभी विचार-विमर्श, वार्ता, नियुक्ति पत्र एवं समझौतों — लिखित या मौखिक — का स्थान लेता है। इस अनुबंध में कोई भी संशोधन या परिवर्तन लिखित रूप में होना चाहिए तथा दोनों पक्षों के हस्ताक्षर से प्रमाणित होना चाहिए। यदि किसी सक्षम न्यायालय द्वारा इस अनुबंध का कोई प्रावधान अमान्य या अप्रवर्तनीय पाया जाता है, तो शेष प्रावधान पूर्ण बल एवं प्रभाव के साथ लागू रहेंगे।
          </div>

          {/* धारा १३ — स्वीकृति */}
          <div className="section-heading">१३. स्वीकृति एवं पुष्टि</div>
          <div className="body-text">
            कर्मचारी पुष्टि करता/करती है कि उसने इस अनुबंध में निर्धारित सभी नियमों एवं शर्तों को पढ़ा, समझा एवं उनसे सहमति प्रदान की है तथा वह स्वतंत्र रूप से और बिना किसी दबाव के इस अनुबंध में प्रवेश कर रहा/रही है। कर्मचारी यह भी पुष्टि करता/करती है कि वह किसी पूर्व नियोक्ता के साथ किसी ऐसे प्रतिस्पर्धा-निषेध, गोपनीयता अथवा अन्य संविदात्मक दायित्व से बाधित नहीं है जो इस अनुबंध के अंतर्गत उसके कर्तव्यों के निर्वहन को प्रतिबंधित करे।
          </div>

          {/* SIGNATURES */}
          <div className="sig-grid">

            {/* EMPLOYER SIGNATURE */}
            <div className="sig-block">
              <div className="sig-block-title">कंपनी की ओर से एवं उसके लिए</div>
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
                <strong>पद:</strong>
                <span className="underline-blank" style={{ minWidth: '120px' }}>
                  {data.manager?.managerPosition || data.company?.managerPosition || data.company?.hrDesignation || 'निदेशक'}
                </span>
              </div>
              <div style={{ marginTop: '6px', fontSize: '12px', fontStyle: 'italic' }}>
                अधिकृत हस्ताक्षरकर्ता — {convertToHindi(data.company?.companyName || '')}{data.company?.entityType ? ` (${data.company.entityType})` : ''}
              </div>
              <div style={{ marginTop: '4px', fontSize: '12px' }}>
                CIN: {data.company?.cinNumber || ''}
              </div>
            </div>

            {/* EMPLOYEE SIGNATURE */}
            <div className="sig-block">
              <div className="sig-block-title">कर्मचारी के हस्ताक्षर</div>
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
              <div style={{ marginTop: '16px', fontSize: '12.5px', fontWeight: 700 }}>
                बाएँ अँगूठे का निशान:-
              </div>
              <div style={{
                border: '1px solid #000',
                minHeight: '77px',
                marginTop: '4px',
                width: '130px',
              }} />
            </div>

          </div>

          <div className="end-text">* * * समाप्त * * *</div>

        </div>
        <PrintFooter />
      </div>
    </div>
  );
};

export default HindiDigitalGrowthManagerAgreement;