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
  // ── Role ──────────────────────────────────────────────────
  designation?: string;
  employmentType?: string;        // "पूर्णकालिक स्थायी" | "अंशकालिक" | "निश्चित अवधि अनुबंध" | "परिवीक्षाधीन"
  contractEndDate?: string;
  department?: string;
  reportingTo?: string;
  placeOfPosting?: string;

  // ── Schedule ──────────────────────────────────────────────
  joiningDate?: string;
  probationPeriod?: string;
  workingHours?: string;
  lunchBreak?: string;
  workingDays?: string;

  // ── Compensation ──────────────────────────────────────────
  grossAnnualSalary?: string | number;
  grossAnnualSalaryWords?: string;
  grossMonthlySalary?: string | number;
  grossMonthlySalaryWords?: string;
  salaryPaymentFrequency?: string;

  // ── Leave ─────────────────────────────────────────────────
  annualLeaves?: string;
  casualLeaves?: string;
  medicalLeaves?: string;

  // ── Terms ─────────────────────────────────────────────────
  noticePeriodEmployer?: string;
  noticePeriodEmployee?: string;
  nonCompetePeriod?: string;
  nonCompeteRadius?: string;
  jurisdiction?: string;

  // ── Duties ────────────────────────────────────────────────
  duties?: string[];

  // ── Additional custom clauses ─────────────────────────────
  additionalClauses?: string[];
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
// MANAGER / AUTHORISED SIGNATORY
// =========================
interface ManagerData {
  managerName?: string;
  managerPosition?: string;
  managerPhone?: string;
}

// =========================
// ROOT AGREEMENT DATA
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

// ─────────────────────────────────────────────────────────────
//  HELPERS
// ─────────────────────────────────────────────────────────────

const Blank = ({ width = 90 }: { width?: number }) => (
  <span
    style={{
      borderBottom: '1px solid #000',
      display: 'inline-block',
      minWidth: `${width}px`,
      minHeight: '16px',
      textAlign: 'center',
      padding: '0 4px',
      verticalAlign: 'bottom',
    }}
  />
);

// ─────────────────────────────────────────────────────────────
//  COMPONENT
// ─────────────────────────────────────────────────────────────

const HindiGeneralEmploymentAgreement = ({
  data,
  companyLogo,
  companyWatermark,
}: TemplateProps) => {

  const formatHindiDate = (dateStr?: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return convertNumberToHindi(dateStr);
    const day = convertNumberToHindi(date.getDate());
    const month = convertNumberToHindi(date.getMonth() + 1);
    const year = convertNumberToHindi(date.getFullYear());
    return `${day}/${month}/${year}`;
  };

  const employerFullName =
    convertToHindi(`${convertToHindi(data.company?.companyName || '')} ${data.company?.entityType ? `(${data.company.entityType})` : ''}`.trim());


  const employerAddress = convertToHindi([
    data.company?.companyAddress,
    data.company?.companyLocality,
    data.company?.companyDistrict,
    data.company?.companyState,
  ].filter(Boolean).join(', ') +
    (data.company?.companyPincode ? ` - ${data.company.companyPincode}` : ''));

  const employeeFullName = convertToHindi([data.employee?.title, data.employee?.name]
    .filter(Boolean).join(' '));

  const employeeAddress = convertToHindi([
    data.employee?.address,
    data.employee?.locality,
    data.employee?.district,
    data.employee?.state,
  ].filter(Boolean).join(', ') +
    (data.employee?.pincode ? ` - ${data.employee.pincode}` : ''));

  const designation   = convertToHindi(data.employment?.designation || 'कर्मचारी');

  const empType       = convertToHindi(data.employment?.employmentType || 'पूर्णकालिक स्थायी');

  const isFixedTerm   = empType.toLowerCase().includes('निश्चित') || empType.toLowerCase().includes('fixed');
  const signatoryName = convertToHindi(data.manager?.managerName || data.company?.managerName || data.company?.hrName || '');

  const signatoryRole = convertToHindi(data.manager?.managerPosition || data.company?.managerPosition || data.company?.hrDesignation || 'निदेशक');


  // ── Default duties in Hindi (generic, role-agnostic) ──────
  const duties: string[] = (data.employment?.duties?.length ?? 0) > 0
    ? data.employment!.duties!
    : [
        `${designation} के पद से सामान्यतः संबंधित सभी कार्यों, उत्तरदायित्वों एवं कार्यों का प्रबंधन द्वारा निर्देशित अनुसार निष्पादन करना।`,
        'सभी सौंपे गए कार्यों में उच्च गुणवत्ता, सटीकता एवं व्यावसायिक आचरण के मानकों को बनाए रखना।',
        'कंपनी की नीतियों, स्थायी आदेशों, आचार संहिता एवं लागू वैधानिक आवश्यकताओं का सदैव पूर्ण अनुपालन करना।',
        'कंपनी द्वारा आवश्यक प्रशिक्षण, समीक्षाओं एवं कौशल विकास कार्यक्रमों में भाग लेना।',
        'कार्य प्रगति, चुनौतियों एवं वृद्धि की आवश्यकता वाले किसी भी मामले पर नियत पर्यवेक्षक/प्रबंधक को नियमित रूप से रिपोर्ट करना।',
        'व्यावसायिक-संवेदनशील जानकारी, ग्राहक डेटा एवं आंतरिक प्रक्रियाओं के संदर्भ में गोपनीयता बनाए रखना।',
        'सुचारू संचालन सुनिश्चित करने के लिए सहकर्मियों, विक्रेताओं, ग्राहकों एवं अन्य संबद्ध पक्षों के साथ प्रभावी समन्वय स्थापित करना।',
        'कंपनी के उद्देश्यों की पूर्ति हेतु प्रबंधन द्वारा समय-समय पर सौंपे गए अन्य कार्यों का निष्पादन करना।',
      ];

  // ── Watermark ─────────────────────────────────────────────
  const Watermark = () => (
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
  );

  // ── inline blank helper ───────────────────────────────────
  const IBlank = ({ w = 100, value = '' }: { w?: number; value?: string }) => (
    <span style={{
      borderBottom: '1px solid #000', display: 'inline-block',
      minWidth: `${w}px`, minHeight: '16px',
      textAlign: 'center', padding: '0 4px', verticalAlign: 'bottom',
    }}>
      {value}
    </span>
  );

  // ─────────────────────────────────────────────────────────
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
            width: 210mm; min-height: 297mm;
            padding: 14mm 16mm; margin: 0;
            box-shadow: none; page-break-after: always;
          }
          .a4-page:last-child { page-break-after: auto; }
          .no-print { display: none !important; }
          * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
        }
        .gradient-text { color: #D9001B; }
        @media screen {
          .gradient-text {
            background: linear-gradient(180deg,#FF3A3A 0%,#FF1E2D 60%,#D9001B 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
          }
        }
        .agreement-title {
          text-align: center; font-size: 17px; font-weight: 900;
          text-decoration: underline; letter-spacing: 0.5px;
          margin: 14px 0 2px 0;
          font-family: 'Noto Sans Devanagari', 'Mangal', serif;
        }
        .agreement-subtitle {
          text-align: center; font-size: 13.5px; font-weight: 700;
          margin-bottom: 10px; font-style: italic; color: #333;
        }
        .section-heading {
          font-size: 13.5px; font-weight: 900;
          text-decoration: underline; margin-top: 13px; margin-bottom: 4px;
          letter-spacing: 0.2px;
        }
        .body-text {
          font-size: 13px; line-height: 1.9; text-align: justify; margin-bottom: 5px;
        }
        .sub-heading {
          font-weight: 700; font-size: 13px;
          margin-top: 7px; margin-bottom: 2px; text-decoration: underline;
        }
        .party-block {
          margin: 8px 0 8px 10px; font-size: 13px; line-height: 1.85;
        }
        .party-name {
          font-weight: 800; font-size: 13.5px; letter-spacing: 0.2px;
        }
        .and-divider {
          text-align: center; font-weight: 900; font-size: 13px;
          margin: 4px 0; letter-spacing: 3px;
        }
        .duty-list {
          margin: 3px 0 5px 20px; font-size: 13px;
          line-height: 1.9; list-style-type: decimal;
        }
        .duty-list li { margin-bottom: 3px; }
        .bullet-list {
          margin: 2px 0 5px 20px; font-size: 12.5px;
          line-height: 1.85; list-style-type: disc;
        }
        .bullet-list li { margin-bottom: 2px; }
        .dash-list {
          margin: 3px 0 5px 20px; font-size: 13px;
          line-height: 1.85; list-style-type: disc;
        }
        .dash-list li { margin-bottom: 3px; }
        .sig-grid {
          display: flex; justify-content: space-between;
          margin-top: 28px; gap: 32px;
        }
        .sig-block {
          flex: 1; font-size: 13px; line-height: 1.85;
          border-top: 2px solid #000; padding-top: 10px;
        }
        .sig-block-title { font-weight: 900; font-size: 13.5px; margin-bottom: 14px; }
        .sig-line { border-bottom: 1.5px solid #000; min-height: 48px; margin-bottom: 6px; }
        .sig-field-row {
          margin-top: 5px; font-size: 13px;
          display: flex; align-items: baseline; gap: 4px;
        }
        .end-text {
          text-align: center; font-weight: 900;
          font-size: 14px; margin-top: 24px; letter-spacing: 3px;
        }
        .a4-gap { height: 40px; }
        @media print { .a4-gap { display: none; } }
        .divider-page {
          text-align: center; font-weight: 700;
          font-size: 12px; margin: 0 0 10px 0; letter-spacing: 2px;
        }
        @media print {
          .wm-layer { display: flex !important; visibility: visible !important; opacity: 0.08 !important; }
          .wm-layer img { display: block !important; visibility: visible !important; }
        }
      `}</style>

      {/* ══════════════════════════════════════════
          पृष्ठ १ — पक्ष + पद एवं कर्तव्य
      ══════════════════════════════════════════ */}
      <div className="a4-page" style={{ position: "relative" }}>
        <Watermark />
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

          {/* ── फ़ाइल सन्दर्भ ── */}
          <div className="mt-6 bg-yellow-200 border border-yellow-300 text-[12.5px] font-semibold px-1 py-1 text-center">
            <span className="font-mono">
              {data.employee.folderSerial || '0000'}/{data.employee.staffId || data.employee.employeeId || 'TEMP-ID'}
            </span>
          </div>

          {/* ── शीर्षक ── */}
          <div className="agreement-title">रोज़गार अनुबंध</div>
          <div className="agreement-subtitle">({designation})</div>

          {/* ── प्रस्तावना ── */}
          <div className="body-text">
            यह रोज़गार अनुबंध <strong>("अनुबंध")</strong> दिनांक{' '}
            <IBlank w={110} value={formatHindiDate(data.employment?.joiningDate)} />{' '}
            को निम्नलिखित पक्षों के मध्य निष्पादित किया जाता है:
          </div>

          {/* ── नियोक्ता ── */}
          <div className="party-block">
            <div className="party-name">{employerFullName}</div>
            <div><strong>पंजीकृत पता:</strong> {employerAddress}</div>
            <div>
              <strong>CIN:</strong> {data.company?.cinNumber || ''}
              &emsp;
              <strong>PAN:</strong> {data.company?.companyPan || ''}
            </div>
            <div style={{ fontStyle: 'italic' }}>
              (जिसे इस अनुबंध में <strong>"नियोक्ता"</strong> अथवा <strong>"कंपनी"</strong> कहा जाएगा)
            </div>
          </div>

          <div className="and-divider">एवं</div>

          {/* ── कर्मचारी ── */}
          <div className="party-block">
            <div className="party-name">{employeeFullName}</div>
            <div><strong>पता:</strong> {employeeAddress}</div>
            <div>
              <strong>जन्म तिथि:</strong>{' '}
              {data.employee?.dob ? formatHindiDate(data.employee.dob) : <Blank width={110} />}
              {data.employee?.gender
                ? <>&emsp;<strong>लिंग:</strong> {data.employee.gender}</>
                : null}
            </div>
            <div>
              <strong>आधार संख्या:</strong>{' '}
              {formatAadhaarHindi(data.employee?.aadhaar) || <Blank width={120} />}
              &emsp;
              <strong>PAN संख्या:</strong>{' '}
              {data.employee?.pan || <Blank width={100} />}
            </div>
            {data.employee?.qualification && (
              <div><strong>शैक्षणिक योग्यता:</strong> {data.employee.qualification}</div>
            )}
            <div style={{ fontStyle: 'italic' }}>
              (जिसे इस अनुबंध में <strong>"कर्मचारी"</strong> कहा जाएगा)
            </div>
          </div>

          {/* ── धारा १ — पद, विभाग एवं कर्तव्य ── */}
          <div className="section-heading">धारा १. पद, विभाग एवं कर्तव्य</div>
          <div className="body-text">
            नियोक्ता द्वारा कर्मचारी को{' '}
            <strong>{designation}</strong>
            {data.employment?.department ? `, ${data.employment.department} विभाग` : ''} के पद पर{' '}
            <strong>{empType}</strong> आधार पर नियुक्त किया जाता है
            {isFixedTerm && data.employment?.contractEndDate
              ? `, जो दिनांक ${formatHindiDate(data.employment.contractEndDate)} को समाप्त होने वाली निश्चित अवधि के लिए है`
              : ''}
            । कर्मचारी{' '}
            <IBlank w={110} value={convertToHindi(data.employment?.reportingTo || '')} />{' '}
            को रिपोर्ट करेगा/करेगी तथा निम्नलिखित कर्तव्यों एवं उत्तरदायित्वों का परिश्रमपूर्वक एवं निष्ठापूर्वक निर्वहन करेगा/करेगी, साथ ही प्रबंधन द्वारा समय-समय पर सौंपे गए अन्य कार्यों का भी निष्पादन करेगा/करेगी:
          </div>
          <ol className="duty-list">
            {duties.map((d, i) => <li key={i}>{d}</li>)}
          </ol>

        </div>
        <PrintFooter />
      </div>

      <div className="a4-gap" />

      {/* ══════════════════════════════════════════
          पृष्ठ २ — नियुक्ति · स्थान · कार्य-घंटे · वेतन · लाभ
      ══════════════════════════════════════════ */}
      <div className="a4-page" style={{ position: 'relative' }}>
        <Watermark />
        <div className="divider-page" />
        <div style={{ position: 'relative', zIndex: 1 }}>

          {/* ── धारा २ — नियुक्ति का प्रारंभ एवं परिवीक्षा ── */}
          <div className="section-heading">धारा २. नियुक्ति का प्रारंभ एवं परिवीक्षा अवधि</div>
          <div className="body-text">
            कर्मचारी की नियुक्ति दिनांक{' '}
            <IBlank w={100} value={formatHindiDate(data.employment?.joiningDate)} />{' '}
            से प्रारंभ होगी।{' '}
            {isFixedTerm
              ? <>यह नियुक्ति दिनांक <strong>{formatHindiDate(data.employment?.contractEndDate)}</strong> को समाप्त होने वाली निश्चित अवधि की है, जब तक कि इस अनुबंध की शर्तों के अनुसार पहले समाप्त न की जाए।</>
              : <>कर्मचारी को योगदान की तिथि से <strong>{data.employment?.probationPeriod || '३ (तीन) माह'}</strong> की परिवीक्षा अवधि पर रखा जाएगा, जिस दौरान कोई भी पक्ष बिना कारण अथवा पूर्व सूचना के यह अनुबंध समाप्त कर सकता है। परिवीक्षा अवधि के सफल समापन के पश्चात कंपनी के अधिकृत हस्ताक्षरकर्ता द्वारा नियुक्ति की लिखित पुष्टि की जाएगी।</>
            }
          </div>

          {/* ── धारा ३ — नियुक्ति का स्थान ── */}
          <div className="section-heading">धारा ३. नियुक्ति का स्थान</div>
          <div className="body-text">
            कर्मचारी की प्राथमिक नियुक्ति का स्थान{' '}
            <IBlank w={140} value={data.employment?.placeOfPosting || data.company?.companyDistrict || ''} />{' '}
            होगा। नियोक्ता को यह अधिकार होगा कि वह आवश्यकतानुसार उचित पूर्व सूचना देकर कर्मचारी का किसी अन्य स्थान, शाखा, परियोजना स्थल अथवा कंपनी के किसी अन्य कार्यालय में स्थानांतरण अथवा प्रतिनियुक्ति कर सके।
          </div>

          {/* ── धारा ४ — कार्य-घंटे एवं उपस्थिति ── */}
          <div className="section-heading">धारा ४. कार्य-घंटे एवं उपस्थिति</div>
          <div className="body-text">
            कर्मचारी के मानक कार्य-घंटे{' '}
            <IBlank w={130} value={data.employment?.workingHours || 'प्रातः ९:३० बजे से सायं ६:३० बजे तक'} />,{' '}
            {data.employment?.workingDays || 'सोमवार से शनिवार'} होंगे, तथा{' '}
            <IBlank w={100} value={data.employment?.lunchBreak || '१ (एक) घंटे'} />{' '}
            का भोजनावकाश होगा। परिचालन अथवा परियोजना संबंधी आवश्यकताओं की पूर्ति के लिए कर्मचारी को मानक समय से अधिक कार्य करने की आवश्यकता हो सकती है, जिसके लिए जब तक अलग से लिखित सहमति न हो, कोई अतिरिक्त पारिश्रमिक सामान्यतः देय नहीं होगा।
          </div>

          {/* ── धारा ५ — वेतन ── */}
          <div className="section-heading">धारा ५. वेतन एवं परिलब्धियाँ</div>

          <div className="sub-heading">सकल वेतन</div>
          <div className="body-text">
            नियोक्ता कर्मचारी को वार्षिक सकल वेतन ₹{' '}
            <IBlank w={80} value={convertNumberToHindi(data.employment?.grossAnnualSalary || '')} />/-{' '}
            (रुपये <IBlank w={160} value={convertToHindi(data.employment?.grossAnnualSalaryWords || '')} /> मात्र) का भुगतान करेगा,
            जो मासिक सकल वेतन ₹{' '}
            <IBlank w={80} value={convertNumberToHindi(data.employment?.grossMonthlySalary || '')} />/-{' '}
            (रुपये <IBlank w={140} value={convertToHindi(data.employment?.grossMonthlySalaryWords || '')} /> मात्र) के बराबर होगा।
            यह वेतन प्रत्येक माह की ७ तारीख को अथवा उससे पूर्व समान मासिक किश्तों में आयकर अधिनियम, १९६१ एवं अन्य लागू विधियों के अंतर्गत निर्धारित कटौतियों एवं वैधानिक उद्ग्रहणों के अधीन भुगतान किया जाएगा।
          </div>

          <div className="sub-heading">वेतन समीक्षा</div>
          <div className="body-text">
            कर्मचारी के वेतन की समय-समय पर प्रबंधन के विवेकाधिकार पर समीक्षा की जाएगी, जो व्यक्तिगत प्रदर्शन, कंपनी के प्रदर्शन एवं प्रचलित बाज़ार परिस्थितियों पर आधारित होगी। वेतन संशोधन, यदि कोई हो, लिखित रूप में सूचित किया जाएगा तथा जब तक स्पष्ट रूप से उल्लेख न हो, इसे इस अनुबंध का संशोधन नहीं माना जाएगा।
          </div>

          {/* ── धारा ६ — वैधानिक एवं अन्य लाभ ── */}
          <div className="section-heading">धारा ६. वैधानिक एवं अन्य लाभ</div>

          <div className="sub-heading">अनिवार्य वैधानिक लाभ</div>
          <ul className="bullet-list">
            <li>
              <strong>कर्मचारी भविष्य निधि (EPF):</strong> EPF एवं MP अधिनियम, १९५२ के अनुसार, २० या अधिक कर्मचारियों वाले प्रतिष्ठानों पर लागू।
            </li>
            <li>
              <strong>कर्मचारी राज्य बीमा (ESI):</strong> यदि कर्मचारी का मासिक सकल वेतन ₹२१,०००/- से कम है एवं प्रतिष्ठान निर्धारित सीमा पूरी करता है।
            </li>
            <li>
              <strong>उपदान (Gratuity):</strong> उपदान भुगतान अधिनियम, १९७२ के अनुसार ५ वर्ष की निरंतर सेवा पूर्ण करने पर देय।
            </li>
            <li>
              <strong>व्यवसाय कर (Professional Tax):</strong> महाराष्ट्र राज्य व्यवसाय कर अधिनियम, १९७५ के अनुसार कटौती योग्य।
            </li>
            <li>
              <strong>अवकाश पात्रता:</strong> वार्षिक/अर्जित अवकाश ({data.employment?.annualLeaves || '१२'} दिन),
              आकस्मिक अवकाश ({data.employment?.casualLeaves || '६'} दिन) एवं बीमारी/चिकित्सा अवकाश ({data.employment?.medicalLeaves || '६'} दिन) प्रति कैलेंडर वर्ष।
            </li>
            <li>
              <strong>मातृत्व लाभ:</strong> मातृत्व लाभ अधिनियम, १९६१ के अनुसार पात्र महिला कर्मचारियों को लागू।
            </li>
          </ul>

          <div className="sub-heading">विवेकाधीन लाभ</div>
          <ul className="bullet-list">
            <li><strong>समूह स्वास्थ्य बीमा:</strong> कंपनी नीति एवं पात्रता शर्तों के अनुसार चिकित्सा कवरेज।</li>
            <li><strong>प्रदर्शन बोनस:</strong> व्यक्तिगत एवं कंपनी के प्रदर्शन के आधार पर प्रबंधन द्वारा निर्धारित विवेकाधीन वार्षिक बोनस।</li>
            <li><strong>व्यावसायिक विकास:</strong> प्रबंधन की अनुमति के अधीन प्रासंगिक प्रशिक्षण, प्रमाणपत्रों एवं कौशल विकास कार्यक्रमों तक पहुँच।</li>
            <li><strong>अन्य सुविधाएँ:</strong> कंपनी द्वारा समय-समय पर लिखित रूप में सूचित कोई भी अतिरिक्त भत्ता, प्रतिपूर्ति अथवा सुविधाएँ।</li>
          </ul>

        </div>
        <PrintFooter />
      </div>

      <div className="a4-gap" />

      {/* ══════════════════════════════════════════
          पृष्ठ ३ — आचार संहिता · IP · गोपनीयता · प्रतिस्पर्धा-निषेध · समाप्ति
      ══════════════════════════════════════════ */}
      <div className="a4-page" style={{ position: 'relative' }}>
        <Watermark />
        <div className="divider-page" />
        <div style={{ position: 'relative', zIndex: 1 }}>

          {/* ── धारा ७ — आचार संहिता ── */}
          <div className="section-heading">धारा ७. आचार संहिता एवं व्यावसायिक मानक</div>
          <div className="body-text">
            कर्मचारी सहमत है कि वह: (क) सदैव व्यावसायिक, ईमानदारीपूर्ण एवं नैतिक आचरण करेगा/करेगी; (ख) कंपनी की नीतियों, स्थायी आदेशों एवं लागू कानूनों का पूर्णतः अनुपालन करेगा/करेगी; (ग) किसी भी बेईमानी, अवज्ञा, उत्पीड़न, भेदभाव अथवा कंपनी की प्रतिष्ठा या हितों को नुकसान पहुँचाने वाले आचरण में संलग्न नहीं होगा/होगी; तथा (घ) किसी भी वास्तविक या संभावित हितों के टकराव की तत्काल लिखित सूचना प्रबंधन को देगा/देगी।
          </div>

          {/* ── धारा ८ — बौद्धिक संपदा अधिकार ── */}
          <div className="section-heading">धारा ८. बौद्धिक संपदा अधिकार</div>
          <div className="body-text">
            कर्मचारी द्वारा नौकरी के दौरान — अकेले अथवा सहयोग में — निर्मित, विकसित अथवा उत्पादित समस्त आविष्कार, डिज़ाइन, रिपोर्ट, सॉफ्टवेयर, कंटेंट, प्रक्रियाएँ, पद्धतियाँ, डेटाबेस अथवा अन्य कार्य-उत्पाद कंपनी की एकमात्र एवं अनन्य बौद्धिक संपदा होंगे। कर्मचारी ऐसी समस्त कृतियों में सभी अधिकार, हक एवं हित कंपनी को हस्तांतरित करता/करती है तथा इस हस्तांतरण को प्रभावी करने हेतु आवश्यक किसी भी दस्तावेज़ पर हस्ताक्षर करने के लिए सहमत है। यह धारा अनुबंध की समाप्ति के पश्चात भी प्रभावी रहेगी।
          </div>

          {/* ── धारा ९ — गोपनीयता ── */}
          <div className="section-heading">धारा ९. गोपनीयता</div>
          <div className="body-text">
            कर्मचारी स्वीकार करता/करती है कि नौकरी के दौरान उसे कंपनी की गोपनीय एवं स्वामित्व संबंधी जानकारी तक पहुँच प्राप्त होगी, जिसमें व्यावसायिक रणनीतियाँ, ग्राहक एवं विक्रेता डेटा, वित्तीय जानकारी, मूल्य-निर्धारण, आंतरिक प्रक्रियाएँ एवं कोई भी अन्य सार्वजनिक रूप से अनुपलब्ध जानकारी सम्मिलित है। कर्मचारी सहमत है कि वह: (क) ऐसी सभी जानकारी को पूर्णतः गोपनीय रखेगा/रखेगी; (ख) पूर्व लिखित अनुमति के बिना इसे किसी तृतीय पक्ष को प्रकट नहीं करेगा/करेगी; तथा (ग) इसका उपयोग केवल नौकरी के प्रयोजन से करेगा/करेगी। ये दायित्व नौकरी समाप्त होने के पश्चात <strong>२ (दो) वर्ष</strong> की अवधि तक जारी रहेंगे। इस धारा का उल्लंघन कंपनी को लागू कानून के तहत व्यादेश राहत एवं/अथवा हर्जाने का अधिकार देगा।
          </div>

          {/* ── धारा १० — प्रतिस्पर्धा-निषेध ── */}
          <div className="section-heading">धारा १०. प्रतिस्पर्धा-निषेध एवं अनुयाचन-निषेध</div>
          <div className="body-text">
            नौकरी की अवधि के दौरान तथा किसी भी कारण से नौकरी समाप्त होने के पश्चात{' '}
            <IBlank w={100} value={data.employment?.nonCompetePeriod || '६ (छह) माह'} />{' '}
            की अवधि तक कर्मचारी निम्नलिखित कार्य नहीं करेगा/करेगी:
          </div>
          <ul className="dash-list">
            <li>
              कंपनी के पंजीकृत कार्यालय की{' '}
              <IBlank w={80} value={data.employment?.nonCompeteRadius || '२५ किमी'} />{' '}
              परिधि के भीतर किसी भी प्रतिस्पर्धी व्यवसाय के लिए प्रत्यक्ष या अप्रत्यक्ष रूप से कार्य करना, परामर्श देना अथवा कोई प्रतिस्पर्धी व्यवसाय स्थापित करना;
            </li>
            <li>व्यक्तिगत लाभ अथवा किसी प्रतिस्पर्धी संस्था के हित में कंपनी के किसी ग्राहक, व्यावसायिक लीड, चैनल पार्टनर अथवा विक्रेता को आकर्षित करना, विचलित करना अथवा उनसे संपर्क करना; अथवा</li>
            <li>कंपनी के किसी कर्मचारी को त्याग-पत्र देने अथवा किसी प्रतिस्पर्धी संस्था में सम्मिलित होने के लिए भर्ती करना, प्रेरित करना अथवा उकसाना।</li>
          </ul>
          <div className="body-text">
            कर्मचारी स्वीकार करता/करती है कि ये प्रतिबंध उचित हैं तथा कंपनी अधिनियम, २०१३ के अंतर्गत पंजीकृत प्राइवेट लिमिटेड कंपनी के वैध व्यावसायिक हितों की रक्षा के लिए आवश्यक हैं।
          </div>

          {/* ── धारा ११ — नौकरी की समाप्ति ── */}
          <div className="section-heading">धारा ११. नौकरी की समाप्ति</div>

          <div className="sub-heading">नियोक्ता द्वारा समाप्ति</div>
          <ul className="dash-list">
            <li>
              <strong>कारण सहित (तत्काल):</strong> घोर कदाचार, जानबूझकर अवज्ञा, धोखाधड़ी, कंपनी संपत्ति का दुरुपयोग, गोपनीयता का उल्लंघन, आपराधिक दोषसिद्धि अथवा इस अनुबंध के किसी प्रमुख प्रावधान के उल्लंघन की स्थिति में — बिना सूचना अथवा सूचना के बदले मुआवज़े के।
            </li>
            <li>
              <strong>बिना कारण:</strong>{' '}
              <IBlank w={110} value={data.employment?.noticePeriodEmployer || '३० (तीस) दिन'} />{' '}
              की लिखित सूचना देकर अथवा समतुल्य वेतन भुगतान करके।
            </li>
          </ul>

          <div className="sub-heading">कर्मचारी द्वारा समाप्ति</div>
          <div className="body-text">
            कर्मचारी नियोक्ता को{' '}
            <IBlank w={110} value={data.employment?.noticePeriodEmployee || '३० (तीस) दिन'} />{' '}
            की लिखित सूचना देकर त्याग-पत्र दे सकता/सकती है। त्याग-पत्र अथवा समाप्ति की स्थिति में कर्मचारी तत्काल: (क) कंपनी की सभी संपत्तियाँ, डिवाइस, दस्तावेज़ एवं पहुँच क्रेडेंशियल लौटाएगा/लौटाएगी; (ख) सभी लंबित कार्यों एवं ज्ञान का दस्तावेज़ीकरण सौंपेगा/सौंपेगी; तथा (ग) हस्तांतरण प्रक्रिया में पूर्ण सहयोग करेगा/करेगी।
          </div>

        </div>
        <PrintFooter />
      </div>

      <div className="a4-gap" />

      {/* ══════════════════════════════════════════
          पृष्ठ ४ — विवाद · शासी कानून · विशेष शर्तें · स्वीकृति · हस्ताक्षर
      ══════════════════════════════════════════ */}
      <div className="a4-page" style={{ position: 'relative' }}>
        <Watermark />
        <div className="divider-page" />
        <div style={{ position: 'relative', zIndex: 1 }}>

          {/* ── धारा १२ — विवाद समाधान ── */}
          <div className="section-heading">धारा १२. विवाद समाधान</div>
          <div className="body-text">
            इस अनुबंध से उत्पन्न अथवा इससे संबंधित किसी भी विवाद की स्थिति में दोनों पक्ष पहले सद्भावपूर्ण वार्ता के माध्यम से मामले को सौहार्दपूर्ण ढंग से सुलझाने का प्रयास करेंगे। यदि सूचना की तिथि से <strong>३० (तीस) दिनों</strong> के भीतर विवाद का समाधान न हो, तो कोई भी पक्ष मामले को मध्यस्थता एवं सुलह अधिनियम, १९९६ के अंतर्गत मध्यस्थता के लिए भेज सकता है, जिसमें दोनों पक्षों द्वारा पारस्परिक रूप से सहमत एकल मध्यस्थ होगा। मध्यस्थता का केंद्र{' '}
            <IBlank w={110} value={data.employment?.jurisdiction || data.company?.companyDistrict || ''} />{' '}
            होगा।
          </div>

          {/* ── धारा १३ — शासी कानून ── */}
          <div className="section-heading">धारा १३. शासी कानून एवं न्यायक्षेत्र</div>
          <div className="body-text">
            यह अनुबंध भारत के कानूनों द्वारा शासित एवं व्याख्यायित होगा, जिसमें कंपनी अधिनियम, २०१३, भारतीय अनुबंध अधिनियम, १८७२, औद्योगिक रोज़गार (स्थायी आदेश) अधिनियम, १९४६ एवं अन्य सभी लागू केंद्रीय एवं राज्य कानून सम्मिलित हैं।{' '}
            <IBlank w={110} value={data.employment?.jurisdiction || data.company?.companyDistrict || ''} />{' '}
            के न्यायालयों का इस अनुबंध से उत्पन्न किसी भी विवाद पर अनन्य क्षेत्राधिकार होगा।
          </div>

          {/* ── धारा १४ — संपूर्ण अनुबंध एवं पृथक्करणीयता ── */}
          <div className="section-heading">धारा १४. संपूर्ण अनुबंध, संशोधन एवं पृथक्करणीयता</div>
          <div className="body-text">
            यह अनुबंध कर्मचारी की नियुक्ति के संदर्भ में पक्षों के मध्य संपूर्ण सहमति का प्रतिनिधित्व करता है तथा इससे पूर्व के सभी विचार-विमर्श, नियुक्ति पत्र, वार्ता एवं समझौतों — लिखित या मौखिक — का स्थान लेता है। इस अनुबंध में कोई भी संशोधन लिखित रूप में होना चाहिए तथा दोनों पक्षों के हस्ताक्षर से प्रमाणित होना चाहिए। यदि किसी सक्षम न्यायालय द्वारा इस अनुबंध का कोई प्रावधान अमान्य या अप्रवर्तनीय पाया जाता है, तो शेष प्रावधान पूर्ण बल एवं प्रभाव के साथ लागू रहेंगे।
          </div>

          {/* ── धारा १५ — विशेष शर्तें (वैकल्पिक, डेटा-आधारित) ── */}
          {(data.employment?.additionalClauses?.length ?? 0) > 0 && (
            <>
              <div className="section-heading">धारा १५. विशेष शर्तें</div>
              {data.employment!.additionalClauses!.map((clause, i) => (
                <div className="body-text" key={i}>
                  <strong>१५.{i + 1}.</strong> {clause}
                </div>
              ))}
            </>
          )}

          {/* ── धारा १५/१६ — स्वीकृति ── */}
          <div className="section-heading">
            धारा {(data.employment?.additionalClauses?.length ?? 0) > 0 ? '१६' : '१५'}. स्वीकृति एवं पुष्टि
          </div>
          <div className="body-text">
            कर्मचारी पुष्टि करता/करती है कि उसने इस अनुबंध में निर्धारित सभी नियमों एवं शर्तों को पढ़ा, समझा एवं उनसे स्वतंत्रपूर्वक सहमति प्रदान की है। कर्मचारी यह भी पुष्टि करता/करती है कि वह किसी पूर्व नियोक्ता के साथ किसी ऐसे संविदात्मक दायित्व से बाधित नहीं है जो इस अनुबंध के अंतर्गत उसके कर्तव्यों के निर्वहन को प्रतिबंधित करे, तथा वह बिना किसी दबाव या अनुचित प्रभाव के इस अनुबंध में प्रवेश कर रहा/रही है।
          </div>

          {/* ── हस्ताक्षर ── */}
          <div className="sig-grid">

            {/* नियोक्ता */}
            <div className="sig-block">
              <div className="sig-block-title">कंपनी की ओर से एवं उसके लिए</div>
              <div className="sig-line" />
              <div className="sig-field-row">
                <strong>दिनांक:</strong>
                <IBlank w={110} value={formatHindiDate(data.employment?.joiningDate)} />
              </div>
              <div className="sig-field-row">
                <strong>नाम:</strong>
                <IBlank w={130} value={signatoryName} />
              </div>
              <div className="sig-field-row">
                <strong>पद:</strong>
                <IBlank w={120} value={signatoryRole} />
              </div>
              <div style={{ marginTop: '6px', fontSize: '12px', fontStyle: 'italic' }}>
                अधिकृत हस्ताक्षरकर्ता —{' '}
                {convertToHindi(data.company?.companyName || '')}
                {data.company?.entityType ? ` (${data.company.entityType})` : ''}
              </div>
              <div style={{ marginTop: '4px', fontSize: '12px' }}>
                CIN: {data.company?.cinNumber || ''}
              </div>
              <div style={{ fontSize: '12px' }}>
                PAN: {data.company?.companyPan || ''}
              </div>
            </div>

            {/* कर्मचारी */}
            <div className="sig-block">
              <div className="sig-block-title">कर्मचारी के हस्ताक्षर</div>
              <div className="sig-line" />
              <div className="sig-field-row">
                <strong>दिनांक:</strong>
                <IBlank w={110} value={formatHindiDate(data.employment?.joiningDate)} />
              </div>
              <div className="sig-field-row">
                <strong>नाम:</strong>
                <IBlank w={130} value={employeeFullName} />
              </div>
              <div className="sig-field-row">
                <strong>पद:</strong>
                <IBlank w={120} value={designation} />
              </div>
              <div className="sig-field-row">
                <strong>कर्मचारी ID:</strong>
                <IBlank w={100} value={data.employee?.staffId || data.employee?.employeeId || ''} />
              </div>
              <div style={{ marginTop: '12px', fontSize: '12.5px', fontWeight: 700 }}>
                बाएँ अँगूठे का निशान:-
              </div>
              <div style={{
                border: '1px solid #000', minHeight: '70px',
                marginTop: '4px', width: '130px',
              }} />
            </div>

          </div>

          {/* ── साक्षी ── */}
          <div style={{ marginTop: '32px', borderTop: '1px dashed #555', paddingTop: '12px' }}>
            <div style={{ fontSize: '12.5px', fontWeight: 700, marginBottom: '8px', letterSpacing: '0.5px' }}>
              साक्षी
            </div>
            <div style={{ display: 'flex', gap: '40px' }}>
              {[1, 2].map(n => (
                <div key={n} style={{ flex: 1, fontSize: '12.5px', lineHeight: 1.85 }}>
                  <div style={{ fontWeight: 700 }}>साक्षी {n === 1 ? '१' : '२'}</div>
                  <div>नाम: <span style={{ borderBottom: '1px solid #000', display: 'inline-block', minWidth: '110px', verticalAlign: 'bottom' }} /></div>
                  <div>हस्ताक्षर: <span style={{ borderBottom: '1px solid #000', display: 'inline-block', minWidth: '100px', verticalAlign: 'bottom' }} /></div>
                  <div>दिनांक: <span style={{ borderBottom: '1px solid #000', display: 'inline-block', minWidth: '90px', verticalAlign: 'bottom' }} /></div>
                </div>
              ))}
            </div>
          </div>

          <div className="end-text">* * * समाप्त * * *</div>

        </div>
        <PrintFooter />
      </div>
    </div>
  );
};

export default HindiGeneralEmploymentAgreement;