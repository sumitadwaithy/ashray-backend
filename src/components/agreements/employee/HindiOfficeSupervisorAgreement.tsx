import React from 'react';
import { PrintFooter } from '../../../../components/Printpreview';
import { convertToHindi, convertNumberToHindi, formatAadhaarHindi, } from './../../../engine/EnglishToHindiEngine';

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
// MANAGER (SELLER PERSON)
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

const HindiOfficeSupervisorAgreement = ({ data, companyLogo, companyWatermark }: TemplateProps) => {

    // 🔥 DATE
    const formatHindiDate = (dateStr?: string) => {
      if (!dateStr) return '';
    
      const date = new Date(dateStr);
    
      if (isNaN(date.getTime())) {
        return convertNumberToHindi(dateStr);
      }

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
    "दैनिक कार्यालय संचालन और प्रशासनिक कर्मचारियों की देखरेख करना।",
    "कार्यालय सामग्री, उपकरण और इन्वेंटरी का प्रबंधन करना।",
    "बैठकों, नियुक्तियों और साइट/संपत्ति भ्रमण का समन्वय करना।",
    "ग्राहक अभिलेख, फाइलें और परियोजना दस्तावेज़ीकरण बनाए रखना।",
    "विपणन और प्रचार गतिविधियों में सहायता करना।",
    "कंपनी की नीतियों और प्रक्रियाओं का अनुपालन सुनिश्चित करना।",
    "ग्राहकों, विक्रेताओं और एजेंटों की पूछताछ संभालना।",
    "समय-समय पर प्रबंधन द्वारा सौंपे गए अन्य कार्य करना।",
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
          color: #D9001B; /* fallback for print */
        }
        @media screen {
          .gradient-text {
            background: linear-gradient(180deg, #FF3A3A 0%, #FF1E2D 60%, #D9001B 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
          }
        }
        .header-box {
          border: 2.5px solid #000;
          padding: 8px 12px;
          margin-bottom: 10px;
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
        .a4-gap {
          height: 40px;
        }
        @media print {
          .a4-gap { display: none; }
        }
        .agreement-watermark,
        .agreement-watermark img {
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
        .agreement-watermark {
          top: var(--ashray-print-margin-top, 14mm) !important;
          right: var(--ashray-print-margin-right, 16mm) !important;
          bottom: var(--ashray-print-margin-bottom, 14mm) !important;
          left: var(--ashray-print-margin-left, 16mm) !important;
          width: auto !important;
          height: auto !important;
          box-sizing: border-box !important;
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

          {/* टोकन लाइन */}
          <div className="mt-6 bg-yellow-200 border border-yellow-300 text-[12.5px] font-semibold px-1 py-1 text-center">
            <div className="font-mono leading-tight break-words inline-block text-center max-w-full">
              {data.employee.folderSerial || '0000'}/{data.employee.staffId || data.employee.employeeId || 'TEMP-ID'}
            </div>
          </div>

          {/* ── शीर्षक ── */}
          <div className="agreement-title">रोजगार अनुबंध</div>
          <div className="agreement-subtitle">(कार्यालय पर्यवेक्षक)</div>

          {/* ── प्रस्तावना ── */}
          <div className="body-text">
            यह रोजगार अनुबंध <strong>("अनुबंध")</strong> दिनांक{' '}
            <span className="underline-blank">{formatHindiDate(data.employment?.joiningDate)}</span>{' '}
            को निम्नलिखित पक्षों के बीच निष्पादित किया गया है:
          </div>

          {/* ── नियोक्ता ── */}
          <div className="party-block">
            <div className="party-name">{employerFullName}</div>
            <div><strong>पता:</strong> {employerAddress}</div>
            <div><strong>सीआईएन / पंजी. क्र.:</strong> {data.company?.cinNumber || data.company?.licenseRegistrationNumber || ''}</div>
            <div style={{ fontStyle: 'italic' }}>(जिसे आगे <strong>"नियोक्ता"</strong> कहा जाएगा)</div>
          </div>

          <div className="and-divider">और</div>

          {/* ── कर्मचारी ── */}
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

          {/* ══ १. पद और कर्तव्य ══ */}
          <div className="section-heading">१. पद और कर्तव्य</div>
          <div className="body-text">
            नियोक्ता एतद्द्वारा कर्मचारी को <strong>कार्यालय पर्यवेक्षक</strong> के पद पर
            {data.employment?.department ? ` ${convertToHindi(data.employment.department)} विभाग में` : ''} नियुक्त करता है। कर्मचारी{' '}
            <span className="underline-blank">{convertToHindi(data.employment?.reportingTo || '')}</span>{' '}
            को रिपोर्ट करेगा और रियल एस्टेट व्यवसाय में ऐसे पद से सामान्यतः संबंधित सभी कर्तव्यों एवं जिम्मेदारियों का निर्वहन करेगा, जिनमें निम्नलिखित शामिल हैं, परंतु इन्हीं तक सीमित नहीं:
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
          पृष्ठ २
      ══════════════════════════════════════════ */}
      <div className="a4-page" style={{ position: "relative" }}>

        {/* वॉटरमार्क */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
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

        <div className="divider-page"></div>

        {/* सामग्री */}
        <div style={{ position: "relative", zIndex: 1 }}>

          {/* ══ २. नियोजन का प्रारंभ ══ */}
          <div className="section-heading">२. नियोजन का प्रारंभ</div>
          <div className="body-text">
            नियोक्ता के साथ कर्मचारी का रोजगार{' '}
            <span className="underline-blank">{formatHindiDate(data.employment?.joiningDate)}</span>{' '}
            से प्रारंभ होगा। कर्मचारी सम्मिलित होने की तारीख से{' '}
            <strong>{data.employment?.probationPeriod || '3 (तीन) माह'}</strong>{' '}
            की परीविक्षा (प्रोबेशन) पर रहेगा, जिस दौरान कोई भी पक्ष बिना कारण या पूर्व सूचना के इस अनुबंध को समाप्त कर सकता है। परीविक्षा सफलतापूर्वक पूर्ण होने पर, रोजगार की लिखित पुष्टि की जाएगी।
          </div>

          {/* ══ ३. वेतन एवं मुआवजा ══ */}
          <div className="section-heading">३. वेतन एवं मुआवजा</div>

          <div className="sub-heading">वेतन</div>
          <div className="body-text">
            नियोक्ता कर्मचारी को ₹{' '}
            <span className="underline-blank">
              {convertNumberToHindi(data.employment?.grossAnnualSalary || '')}
            </span>
            /- (रुपये{' '}
            <span className="underline-blank" style={{ minWidth: '160px' }}>
              {convertToHindi(data.employment?.grossAnnualSalaryWords || '')}
            </span>{' '}
            मात्र) का सकल वार्षिक वेतन का भुगतान करेगा,

            जो ₹{' '}
            <span className="underline-blank">
              {convertNumberToHindi(data.employment?.grossMonthlySalary || '')}
            </span>
            /- (रुपये{' '}
            <span className="underline-blank" style={{ minWidth: '140px' }}>
              {convertToHindi(data.employment?.grossMonthlySalaryWords || '')}
            </span>{' '}
            मात्र) के सकल मासिक वेतन के समतुल्य है,

            जो लागू कटौतियों और वैधानिक रोके के अधीन समान मासिक किस्तों में देय होगा।
          </div>

          <div className="sub-heading">लाभ</div>
          <div className="body-text">
            कर्मचारी नियोक्ता की मानक नीतियों के अनुसार लाभों के लिए पात्र होगा, जिनमें निम्नलिखित शामिल हो सकते हैं:
          </div>

          <div style={{ fontWeight: 700, fontSize: '13px', marginTop: '5px', marginBottom: '2px' }}>
            अनिवार्य वैधानिक लाभ
          </div>
          <ul className="benefits-list">
            <li><strong>कर्मचारी भविष्य निधि (ईपीएफ):</strong> 20 या अधिक कर्मचारियों वाली कंपनियों के लिए अनिवार्य।</li>
            <li><strong>कर्मचारी राज्य बीमा (ईएसआई):</strong> आवश्यक यदि कंपनी का आकार 10 कर्मचारियों (कुछ राज्यों में 20) से अधिक हो और कर्मचारी ₹21,000 प्रति माह से कम अर्जित करते हों।</li>
            <li><strong>ग्रेच्युटी:</strong> देय यदि कर्मचारी ने 5 वर्ष की निरंतर सेवा पूर्ण की हो।</li>
            <li>
              <strong>अवकाश नीति:</strong> सवैतनिक वार्षिक / अर्जित अवकाश ({convertNumberToHindi(data.employment?.annualLeaves || '12')} दिन),
              बीमारी / चिकित्सा अवकाश ({convertNumberToHindi(data.employment?.medicalLeaves || '6')} दिन) और आकस्मिक अवकाश ({convertNumberToHindi(data.employment?.casualLeaves || '6')} दिन) शामिल हैं।
            </li>
            <li><strong>मातृत्व लाभ:</strong> मातृत्व लाभ अधिनियम, 1961 के अनुसार पात्र महिला कर्मचारियों के लिए सवैतनिक अवकाश।</li>
          </ul>

          <div style={{ fontWeight: 700, fontSize: '13px', marginTop: '5px', marginBottom: '2px' }}>
            स्वैच्छिक / प्रतिस्पर्धी लाभ
          </div>
          <ul className="benefits-list">
            <li><strong>समूह स्वास्थ्य बीमा:</strong> कंपनी नीति के अनुसार व्यापक चिकित्सा कवरेज।</li>
            <li><strong>प्रदर्शन प्रोत्साहन:</strong> प्रबंधन के विवेकानुसार प्रदर्शन-आधारित बोनस और वेतन वृद्धि।</li>
            <li><strong>लचीला कार्य:</strong> प्रबंधन की स्वीकृति के अधीन हाइब्रिड/दूरस्थ कार्य विकल्प और लचीले घंटे।</li>
            <li><strong>व्यावसायिक विकास:</strong> प्रशिक्षण कार्यशालाएं, प्रमाणपत्र और कौशल उन्नयन के अवसर।</li>
            <li><strong>कर्मचारी स्टॉक स्वामित्व योजनाएं (ईएसओपी):</strong> यदि लागू हो, तो शीर्ष प्रतिभाओं को प्रेरित करने और बनाए रखने के लिए इक्विटी प्रदान करना।</li>
          </ul>

          <div style={{ fontWeight: 700, fontSize: '13px', marginTop: '5px', marginBottom: '2px' }}>
            वैकल्पिक सुविधाएं
          </div>
          <ul className="benefits-list">
            <li>कल्याण कार्यक्रम: जिम सदस्यता, मानसिक स्वास्थ्य सहायता।</li>
            <li>अतिरिक्त अवकाश: कंपनी नीति के अनुसार पितृत्व अवकाश, शोक अवकाश।</li>
            <li>सहायता: बाल देखभाल सहायता, स्थानांतरण सहायता यदि लागू हो।</li>
            <li>स्वास्थ्य बीमा, सवैतनिक अवकाश (छुट्टी, बीमारी अवकाश, सार्वजनिक अवकाश)।</li>
            <li>भविष्य निधि अंशदान और नियोक्ता द्वारा समय-समय पर निर्धारित अन्य लाभ।</li>
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
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
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

        {/* सामग्री */}
        <div style={{ position: "relative", zIndex: 1 }}>

          <div className="divider-page"></div>

          {/* ══ ४. कार्य के घंटे ══ */}
          <div className="section-heading">४. कार्य के घंटे</div>
          <div className="body-text">
            कर्मचारी के मानक कार्य घंटे{' '}
            <span className="underline-blank">{data.employment?.workingHours || 'प्रातः 9:00 से सायं 6:00 बजे'}</span>,{' '}
            {data.employment?.workingDays || 'सोमवार से शुक्रवार'} होंगे, जिसमें{' '}
            <span className="underline-blank">{data.employment?.lunchBreak || '1 (एक) घंटे'}</span>{' '}
            का दोपहर भोजन अवकाश होगा। पद के कर्तव्यों को पूरा करने के लिए आवश्यकतानुसार कर्मचारी को अतिरिक्त घंटे काम करने की आवश्यकता हो सकती है।
          </div>

          {/* ══ ५. गोपनीयता ══ */}
          <div className="section-heading">५. गोपनीयता</div>
          <div className="body-text">
            कर्मचारी स्वीकार करता है कि रोजगार के दौरान, उसे नियोक्ता की गोपनीय और स्वामित्व संबंधी जानकारी तक पहुंच होगी, जिसमें ग्राहक सूचियां, संपत्ति सूचियां, वित्तीय डेटा, विपणन रणनीतियां और व्यावसायिक योजनाएं शामिल हैं, परंतु इन्हीं तक सीमित नहीं। कर्मचारी ऐसी सभी जानकारी को पूर्णतः गोपनीय रखने और इसे किसी तीसरे पक्ष को प्रकट नहीं करने या रोजगार की अवधि के दौरान एवं बाद में नियोक्ता के लाभ के अलावा किसी अन्य उद्देश्य के लिए उपयोग नहीं करने के लिए सहमत है।
          </div>

          {/* ══ ६. गैर-प्रतिस्पर्धा ══ */}
          <div className="section-heading">६. गैर-प्रतिस्पर्धा</div>
          <div className="body-text">
            रोजगार की अवधि के दौरान और किसी भी कारण से रोजगार समाप्त होने के बाद{' '}
            <span className="underline-blank">{convertToHindi(data.employment?.nonCompetePeriod || '6 (छह) माह')}</span>{' '}
            की अवधि के लिए, कर्मचारी नियोक्ता के प्राथमिक व्यवसाय स्थान की{' '}
            <span className="underline-blank">{convertToHindi(data.employment?.nonCompeteRadius || '25 कि.मी.')}</span>{' '}
            परिधि में नियोक्ता के रियल एस्टेट व्यवसाय के साथ प्रतिस्पर्धा करने वाले किसी व्यवसाय या गतिविधि में प्रत्यक्ष या अप्रत्यक्ष रूप से संलग्न नहीं होगा।
          </div>

          {/* ══ ७. रोजगार की समाप्ति ══ */}
          <div className="section-heading">७. रोजगार की समाप्ति</div>

          <div className="sub-heading">नियोक्ता द्वारा समाप्ति</div>
          <div className="body-text">नियोक्ता निम्नलिखित में से किसी भी कारण से कर्मचारी का रोजगार समाप्त कर सकता है:</div>
          <ul className="termination-list">
            <li>
              <strong>कारण सहित:</strong> तत्काल, कारणों के लिए जिनमें सकल कदाचार, अवज्ञा, गोपनीयता का उल्लंघन, धोखाधड़ी, या इस अनुबंध का महत्वपूर्ण उल्लंघन शामिल है, परंतु इन्हीं तक सीमित नहीं।
            </li>
            <li>
              <strong>कारण रहित:</strong>{' '}
              <span className="underline-blank">{convertToHindi(data.employment?.noticePeriodEmployer || '30 (तीस) दिन')}</span>{' '}
              की लिखित सूचना या सूचना के स्थान पर भुगतान प्रदान करके।
            </li>
          </ul>

          <div className="sub-heading">कर्मचारी द्वारा समाप्ति</div>
          <div className="body-text">
            कर्मचारी नियोक्ता को{' '}
            <span className="underline-blank">{convertToHindi(data.employment?.noticePeriodEmployee || '30 (तीस) दिन')}</span>{' '}
            की लिखित सूचना देकर अपना रोजगार समाप्त कर सकता है। समाप्ति पर, कर्मचारी तुरंत सभी कंपनी संपत्ति, दस्तावेज़, अभिलेख, पहुंच क्रेडेंशियल और नियोक्ता से संबंधित किसी भी अन्य संपत्ति वापस करेगा।
          </div>

          {/* ══ ८. शासक कानून और अधिकार क्षेत्र ══ */}
          <div className="section-heading">८. शासक कानून और अधिकार क्षेत्र</div>
          <div className="body-text">
            यह अनुबंध भारत के कानूनों के अनुसार शासित और निर्वचित किया जाएगा।
            इस अनुबंध से उत्पन्न या संबंधित किसी भी विवाद पर{' '}
            <span className="underline-blank">{data.employment?.jurisdiction || data.company?.companyDistrict || ''}</span>{' '}
            के न्यायालयों का अनन्य अधिकार क्षेत्र होगा।
          </div>

          {/* ══ ९. संपूर्ण अनुबंध ══ */}
          <div className="section-heading">९. संपूर्ण अनुबंध</div>
          <div className="body-text">
            यह अनुबंध रोजगार की शर्तों के संबंध में नियोक्ता और कर्मचारी के बीच संपूर्ण अनुबंध का गठन करता है और सभी पूर्व चर्चाओं, वार्ताओं और अनुबंधों, चाहे लिखित हों या मौखिक, को अधिक्रमित करता है।
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
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
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

        {/* सामग्री */}
        <div style={{ position: "relative", zIndex: 1 }}>

          <div className="divider-page"></div>

          {/* ══ १०. संशोधन ══ */}
          <div className="section-heading">१०. संशोधन</div>
          <div className="body-text">
            इस अनुबंध में कोई भी संशोधन या परिवर्तन लिखित रूप में होना चाहिए और नियोक्ता तथा कर्मचारी दोनों द्वारा हस्ताक्षरित होना चाहिए।
          </div>

          {/* ══ ११. पृथक्करणीयता ══ */}
          <div className="section-heading">११. पृथक्करणीयता</div>
          <div className="body-text">
            यदि इस अनुबंध का कोई प्रावधान अवैध या अप्रवर्तनीय माना जाता है, तो शेष प्रावधान कानून द्वारा अनुमत अधिकतम सीमा तक वैध और प्रवर्तनीय बने रहेंगे।
          </div>

          {/* ══ हस्ताक्षर ══ */}
          <div className="sig-grid">

            {/* नियोक्ता के हस्ताक्षर */}
            <div className="sig-block">
              <div className="sig-block-title">नियोक्ता के हस्ताक्षर</div>
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
                <span className="underline-blank" style={{ minWidth: '120px' }}>
                  {data.manager?.managerPosition || data.company?.managerPosition || data.company?.hrDesignation}
                </span>
              </div>
              <div style={{ marginTop: '6px', fontSize: '12px', fontStyle: 'italic' }}>
                {convertToHindi(data.company?.companyName || '')}{data.company?.entityType ? ` (${data.company.entityType})` : ''} की ओर से
              </div>
            </div>

            {/* कर्मचारी के हस्ताक्षर */}
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

          <div className="end-text">* * * समाप्त * * *</div>

        </div>
        <PrintFooter />
      </div>

    </div>
  );
};

export default HindiOfficeSupervisorAgreement;