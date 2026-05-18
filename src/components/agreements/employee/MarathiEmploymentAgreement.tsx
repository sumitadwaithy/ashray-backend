import React from 'react';
import { convertToMarathi, convertNumberToMarathi, formatAadhaarMarathi, } from '../../../engine/EnglishToMarathiEngine';
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
  employmentType?: string;        // "पूर्णवेळ कायम" | "अर्धवेळ" | "निश्चित मुदत करार" | "परिवीक्षाधीन"
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

const MarathiGeneralEmploymentAgreement = ({
  data,
  companyLogo,
  companyWatermark,
}: TemplateProps) => {

  const formatMarathiDate = (dateStr?: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return convertNumberToMarathi(dateStr);
    const day = convertNumberToMarathi(date.getDate());
    const month = convertNumberToMarathi(date.getMonth() + 1);
    const year = convertNumberToMarathi(date.getFullYear());
    return `${day}/${month}/${year}`;
  };

  const employerFullName =
    convertToMarathi(`${convertToMarathi(data.company?.companyName || '')} ${data.company?.entityType ? `(${data.company.entityType})` : ''}`.trim());

  const employerAddress = convertToMarathi([
    data.company?.companyAddress,
    data.company?.companyLocality,
    data.company?.companyDistrict,
    data.company?.companyState,
  ].filter(Boolean).join(', ') +
    (data.company?.companyPincode ? ` - ${data.company.companyPincode}` : ''));

  const employeeFullName = convertToMarathi([data.employee?.title, data.employee?.name]
    .filter(Boolean).join(' '));

  const employeeAddress = convertToMarathi([
    data.employee?.address,
    data.employee?.locality,
    data.employee?.district,
    data.employee?.state,
  ].filter(Boolean).join(', ') +
    (data.employee?.pincode ? ` - ${data.employee.pincode}` : ''));

  const designation   = convertToMarathi(data.employment?.designation || 'कर्मचारी');

  const empType       = convertToMarathi(data.employment?.employmentType || 'पूर्णवेळ कायम');

  const isFixedTerm   = empType.toLowerCase().includes('निश्चित') || empType.toLowerCase().includes('fixed');
  const signatoryName = convertToMarathi(data.manager?.managerName || data.company?.managerName || data.company?.hrName || '');

  const signatoryRole = convertToMarathi(data.manager?.managerPosition || data.company?.managerPosition || data.company?.hrDesignation || 'संचालक');


  // ── Default duties in Marathi (generic, role-agnostic) ────
  const duties: string[] = (data.employment?.duties?.length ?? 0) > 0
    ? data.employment!.duties!
    : [
        `${designation} या पदाशी साधारणपणे संबंधित सर्व कार्ये, जबाबदाऱ्या व कर्तव्ये व्यवस्थापनाच्या निर्देशानुसार पार पाडणे.`,
        'सोपविण्यात आलेल्या सर्व कामांमध्ये उच्च दर्जाची गुणवत्ता, अचूकता व व्यावसायिक आचरण राखणे.',
        'कंपनीच्या धोरणे, स्थायी आदेश, आचार संहिता आणि लागू वैधानिक आवश्यकतांचे सर्व वेळी पूर्णपणे पालन करणे.',
        'कंपनीने आवश्यक केलेल्या प्रशिक्षण, आढावा व कौशल्य विकास कार्यक्रमांमध्ये सहभागी होणे.',
        'कामाची प्रगती, अडचणी आणि वरिष्ठांकडे पाठवणे आवश्यक असलेल्या बाबींबाबत नियुक्त पर्यवेक्षक/व्यवस्थापकांना नियमितपणे अहवाल देणे.',
        'व्यावसायिकदृष्ट्या संवेदनशील माहिती, ग्राहक डेटा व अंतर्गत प्रक्रियांबाबत गोपनीयता राखणे.',
        'सुरळीत कामकाज सुनिश्चित करण्यासाठी सहकारी, विक्रेते, ग्राहक व इतर संबंधित घटकांशी प्रभावी समन्वय साधणे.',
        'कंपनीच्या उद्दिष्टांच्या पूर्ततेसाठी व्यवस्थापनाने वेळोवेळी सोपविलेली इतर कोणतीही कर्तव्ये पार पाडणे.',
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
          पृष्ठ १ — पक्ष + पद व कर्तव्ये
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

          {/* ── फाइल संदर्भ ── */}
          <div className="mt-6 bg-yellow-200 border border-yellow-300 text-[12.5px] font-semibold px-1 py-1 text-center">
            <span className="font-mono">
              {data.employee.folderSerial || '0000'}/{data.employee.staffId || data.employee.employeeId || 'TEMP-ID'}
            </span>
          </div>

          {/* ── शीर्षक ── */}
          <div className="agreement-title">रोजगार करार</div>
          <div className="agreement-subtitle">({designation})</div>

          {/* ── प्रस्तावना ── */}
          <div className="body-text">
            हा रोजगार करार <strong>("करार")</strong> दिनांक{' '}
            <IBlank w={110} value={formatMarathiDate(data.employment?.joiningDate)} />{' '}
            रोजी खालील पक्षांमध्ये केला जातो:
          </div>

          {/* ── नियोक्ता ── */}
          <div className="party-block">
            <div className="party-name">{employerFullName}</div>
            <div><strong>नोंदणीकृत पत्ता:</strong> {employerAddress}</div>
            <div>
              <strong>CIN:</strong> {data.company?.cinNumber || ''}
              &emsp;
              <strong>PAN:</strong> {data.company?.companyPan || ''}
            </div>
            <div style={{ fontStyle: 'italic' }}>
              (यापुढे <strong>"नियोक्ता"</strong> अथवा <strong>"कंपनी"</strong> म्हणून संबोधण्यात येईल)
            </div>
          </div>

          <div className="and-divider">आणि</div>

          {/* ── कर्मचारी ── */}
          <div className="party-block">
            <div className="party-name">{employeeFullName}</div>
            <div><strong>पत्ता:</strong> {employeeAddress}</div>
            <div>
              <strong>जन्म दिनांक:</strong>{' '}
              {data.employee?.dob ? formatMarathiDate(data.employee.dob) : <Blank width={110} />}
              {data.employee?.gender
                ? <>&emsp;<strong>लिंग:</strong> {data.employee.gender}</>
                : null}
            </div>
            <div>
              <strong>आधार क्रमांक:</strong>{' '}
              {formatAadhaarMarathi(data.employee?.aadhaar) || <Blank width={120} />}
              &emsp;
              <strong>PAN क्रमांक:</strong>{' '}
              {data.employee?.pan || <Blank width={100} />}
            </div>
            {data.employee?.qualification && (
              <div><strong>शैक्षणिक पात्रता:</strong> {data.employee.qualification}</div>
            )}
            <div style={{ fontStyle: 'italic' }}>
              (यापुढे <strong>"कर्मचारी"</strong> म्हणून संबोधण्यात येईल)
            </div>
          </div>

          {/* ── कलम १ — पद, विभाग व कर्तव्ये ── */}
          <div className="section-heading">कलम १. पद, विभाग व कर्तव्ये</div>
          <div className="body-text">
            नियोक्त्याद्वारे कर्मचाऱ्याची{' '}
            <strong>{designation}</strong>
            {data.employment?.department ? `, ${data.employment.department} विभाग` : ''}{' '}
            या पदावर <strong>{empType}</strong> तत्त्वावर नियुक्ती केली जाते
            {isFixedTerm && data.employment?.contractEndDate
              ? `, जी दिनांक ${formatMarathiDate(data.employment.contractEndDate)} रोजी संपुष्टात येणाऱ्या निश्चित मुदतीसाठी आहे`
              : ''}
            . कर्मचारी{' '}
            <IBlank w={110} value={convertToMarathi(data.employment?.reportingTo || '')} />{' '}
            यांना अहवाल देईल आणि खालील कर्तव्ये व जबाबदाऱ्या परिश्रमाने व निष्ठेने पार पाडेल, तसेच व्यवस्थापनाने वेळोवेळी सोपविलेली इतर कर्तव्येही पार पाडेल:
          </div>
          <ol className="duty-list">
            {duties.map((d, i) => <li key={i}>{d}</li>)}
          </ol>

        </div>
        <PrintFooter />
      </div>

      <div className="a4-gap" />

      {/* ══════════════════════════════════════════
          पृष्ठ २ — नियुक्ती · स्थान · कामाचे तास · वेतन · लाभ
      ══════════════════════════════════════════ */}
      <div className="a4-page" style={{ position: 'relative' }}>
        <Watermark />
        <div className="divider-page" />
        <div style={{ position: 'relative', zIndex: 1 }}>

          {/* ── कलम २ — नियुक्तीचा प्रारंभ व परिवीक्षा ── */}
          <div className="section-heading">कलम २. नियुक्तीचा प्रारंभ व परिवीक्षा कालावधी</div>
          <div className="body-text">
            कर्मचाऱ्याची नियुक्ती दिनांक{' '}
            <IBlank w={100} value={formatMarathiDate(data.employment?.joiningDate)} />{' '}
            पासून सुरू होईल.{' '}
            {isFixedTerm
              ? <>ही नियुक्ती दिनांक <strong>{formatMarathiDate(data.employment?.contractEndDate)}</strong> रोजी संपुष्टात येणाऱ्या निश्चित मुदतीसाठी आहे, जोपर्यंत या कराराच्या अटींनुसार आधी संपुष्टात आणली जात नाही.</>
              : <>कर्मचाऱ्याला रुजू होण्याच्या तारखेपासून <strong>{data.employment?.probationPeriod || '३ (तीन) महिने'}</strong> परिवीक्षा कालावधीवर ठेवण्यात येईल, ज्या दरम्यान कोणताही पक्ष कारण अथवा पूर्वसूचनेशिवाय हा करार संपुष्टात आणू शकतो. परिवीक्षा कालावधी यशस्वीरीत्या पूर्ण झाल्यावर कंपनीच्या अधिकृत स्वाक्षरीकर्त्याद्वारे नियुक्तीची लेखी पुष्टी केली जाईल.</>
            }
          </div>

          {/* ── कलम ३ — नियुक्तीचे ठिकाण ── */}
          <div className="section-heading">कलम ३. नियुक्तीचे ठिकाण</div>
          <div className="body-text">
            कर्मचाऱ्याच्या नियुक्तीचे प्राथमिक ठिकाण{' '}
            <IBlank w={140} value={data.employment?.placeOfPosting || data.company?.companyDistrict || ''} />{' '}
            असेल. नियोक्त्यास योग्य पूर्वसूचना देऊन, आवश्यकतेनुसार कर्मचाऱ्याची कंपनीच्या कोणत्याही अन्य ठिकाणी, शाखेत, प्रकल्पस्थळी अथवा कार्यालयात बदली किंवा प्रतिनियुक्ती करण्याचा अधिकार राहील.
          </div>

          {/* ── कलम ४ — कामाचे तास व उपस्थिती ── */}
          <div className="section-heading">कलम ४. कामाचे तास व उपस्थिती</div>
          <div className="body-text">
            कर्मचाऱ्याचे मानक कामाचे तास{' '}
            <IBlank w={130} value={data.employment?.workingHours || 'सकाळी ९:३० ते सायंकाळी ६:३०'} />,{' '}
            {data.employment?.workingDays || 'सोमवार ते शनिवार'} असतील, तसेच{' '}
            <IBlank w={100} value={data.employment?.lunchBreak || '१ (एक) तास'} />{' '}
            जेवणाची सुट्टी असेल. परिचालन किंवा प्रकल्पाच्या आवश्यकता पूर्ण करण्यासाठी कर्मचाऱ्यास मानक वेळेपलीकडे काम करणे आवश्यक असू शकते, ज्यासाठी लेखी वेगळी सहमती नसल्यास सामान्यतः अतिरिक्त मानधन देय असणार नाही.
          </div>

          {/* ── कलम ५ — वेतन व परिलाभ ── */}
          <div className="section-heading">कलम ५. वेतन व परिलाभ</div>

          <div className="sub-heading">एकूण वेतन</div>
          <div className="body-text">
            नियोक्ता कर्मचाऱ्यास वार्षिक एकूण वेतन ₹{' '}
            <IBlank w={80} value={convertNumberToMarathi(data.employment?.grossAnnualSalary || '')} />/-{' '}
            (रुपये <IBlank w={160} value={convertToMarathi(data.employment?.grossAnnualSalaryWords || '')} /> फक्त),
            जे मासिक एकूण वेतन ₹{' '}
            <IBlank w={80} value={convertNumberToMarathi(data.employment?.grossMonthlySalary || '')} />/-{' '}
            (रुपये <IBlank w={140} value={convertToMarathi(data.employment?.grossMonthlySalaryWords || '')} /> फक्त)
            एवढे होते, ते प्रत्येक महिन्याच्या ७ तारखेस अथवा त्यापूर्वी समान मासिक हप्त्यांमध्ये आयकर अधिनियम, १९६१ आणि इतर लागू कायद्यांतर्गत विहित वजावटी व वैधानिक उद्ग्रहणांच्या अधीन राहून अदा करेल.
          </div>

          <div className="sub-heading">वेतन आढावा</div>
          <div className="body-text">
            कर्मचाऱ्याच्या वेतनाचा वेळोवेळी व्यवस्थापनाच्या विवेकाधिकाराने आढावा घेतला जाईल, जो वैयक्तिक कार्यप्रदर्शन, कंपनीचे कार्यप्रदर्शन व प्रचलित बाजारपेठेतील परिस्थितींवर आधारित असेल. वेतन सुधारणा, असल्यास, लेखी कळविली जाईल आणि स्पष्टपणे नमूद केल्याशिवाय तिला या कराराचा बदल मानले जाणार नाही.
          </div>

          {/* ── कलम ६ — वैधानिक व इतर लाभ ── */}
          <div className="section-heading">कलम ६. वैधानिक व इतर लाभ</div>

          <div className="sub-heading">अनिवार्य वैधानिक लाभ</div>
          <ul className="bullet-list">
            <li>
              <strong>कर्मचारी भविष्य निर्वाह निधी (EPF):</strong> EPF व MP अधिनियम, १९५२ नुसार, २० किंवा अधिक कर्मचारी असलेल्या आस्थापनांना लागू.
            </li>
            <li>
              <strong>कर्मचारी राज्य विमा (ESI):</strong> कर्मचाऱ्याचे मासिक एकूण वेतन ₹२१,०००/- पेक्षा कमी असल्यास व आस्थापन निर्धारित मर्यादा पूर्ण करत असल्यास लागू.
            </li>
            <li>
              <strong>उपदान (Gratuity):</strong> उपदान भुगतान अधिनियम, १९७२ नुसार ५ वर्षे सलग सेवा पूर्ण केल्यावर देय.
            </li>
            <li>
              <strong>व्यवसाय कर (Professional Tax):</strong> महाराष्ट्र राज्य व्यवसाय कर अधिनियम, १९७५ नुसार वजावटयोग्य.
            </li>
            <li>
              <strong>रजा पात्रता:</strong> वार्षिक/अर्जित रजा ({convertNumberToMarathi(data.employment?.annualLeaves || '12')} दिवस),
              आकस्मिक रजा ({convertNumberToMarathi(data.employment?.casualLeaves || '6')} दिवस) व आजारी/वैद्यकीय रजा ({convertNumberToMarathi(data.employment?.medicalLeaves || '6')} दिवस) प्रति दिनदर्शिका वर्ष.
            </li>
            <li>
              <strong>मातृत्व लाभ:</strong> मातृत्व लाभ अधिनियम, १९६१ नुसार पात्र महिला कर्मचाऱ्यांना लागू.
            </li>
          </ul>

          <div className="sub-heading">विवेकाधीन लाभ</div>
          <ul className="bullet-list">
            <li><strong>सामूहिक आरोग्य विमा:</strong> कंपनी धोरण व पात्रता अटींनुसार वैद्यकीय कव्हरेज.</li>
            <li><strong>कार्यप्रदर्शन बोनस:</strong> वैयक्तिक व कंपनीच्या कार्यप्रदर्शनावर आधारित व्यवस्थापनाने निर्धारित विवेकाधीन वार्षिक बोनस.</li>
            <li><strong>व्यावसायिक विकास:</strong> व्यवस्थापनाच्या मंजुरीच्या अधीन राहून संबंधित प्रशिक्षण, प्रमाणपत्रे व कौशल्य विकास कार्यक्रमांचा लाभ.</li>
            <li><strong>इतर सुविधा:</strong> कंपनीने वेळोवेळी लेखी कळविलेले कोणतेही अतिरिक्त भत्ते, प्रतिपूर्ती किंवा सुविधा.</li>
          </ul>

        </div>
        <PrintFooter />
      </div>

      <div className="a4-gap" />

      {/* ══════════════════════════════════════════
          पृष्ठ ३ — आचार संहिता · IP · गोपनीयता · स्पर्धा-प्रतिबंध · समाप्ती
      ══════════════════════════════════════════ */}
      <div className="a4-page" style={{ position: 'relative' }}>
        <Watermark />
        <div className="divider-page" />
        <div style={{ position: 'relative', zIndex: 1 }}>

          {/* ── कलम ७ — आचार संहिता ── */}
          <div className="section-heading">कलम ७. आचार संहिता व व्यावसायिक मानके</div>
          <div className="body-text">
            कर्मचारी सहमत आहे की तो/ती: (अ) सर्व वेळी व्यावसायिक, प्रामाणिक व नैतिक आचरण ठेवेल; (ब) कंपनीच्या धोरणे, स्थायी आदेश व लागू कायद्यांचे पूर्णपणे पालन करेल; (क) कंपनीच्या प्रतिष्ठेस किंवा हितांना हानी पोहोचवेल असे कोणतेही अप्रामाणिक, अवज्ञा, छळवणूक, भेदभाव किंवा इतर कोणतेही आचरण करणार नाही; आणि (ड) कोणत्याही वास्तविक किंवा संभाव्य हितसंघर्षाची त्वरित लेखी सूचना व्यवस्थापनास देईल.
          </div>

          {/* ── कलम ८ — बौद्धिक संपदा हक्क ── */}
          <div className="section-heading">कलम ८. बौद्धिक संपदा हक्क</div>
          <div className="body-text">
            कर्मचाऱ्याने नोकरीच्या कालावधीत — एकट्याने अथवा सहकार्याने — निर्माण, विकसित अथवा उत्पादित केलेले सर्व शोध, डिझाइन, अहवाल, सॉफ्टवेअर, कंटेंट, प्रक्रिया, पद्धती, डेटाबेस किंवा इतर कार्य-उत्पादन ही कंपनीची एकमेव व अनन्य बौद्धिक संपदा असेल. कर्मचारी अशा सर्व कार्यातील सर्व अधिकार, हक्क व हित कंपनीस हस्तांतरित करतो/करते आणि या हस्तांतरणास प्रभावी करण्यासाठी आवश्यक असलेल्या कोणत्याही दस्तऐवजावर स्वाक्षरी करण्यास सहमती देतो/देते. हे कलम कराराच्या समाप्तीनंतरही अंमलात राहील.
          </div>

          {/* ── कलम ९ — गोपनीयता ── */}
          <div className="section-heading">कलम ९. गोपनीयता</div>
          <div className="body-text">
            कर्मचारी मान्य करतो/करते की नोकरीदरम्यान त्याला/तिला कंपनीच्या गोपनीय व मालकीच्या माहितीचा वापर करण्याची संधी मिळेल, ज्यात व्यावसायिक धोरणे, ग्राहक व विक्रेता डेटा, आर्थिक माहिती, किंमत-निर्धारण, अंतर्गत प्रक्रिया आणि सार्वजनिकरीत्या उपलब्ध नसलेली इतर कोणतीही माहिती समाविष्ट आहे. कर्मचारी सहमत आहे की तो/ती: (अ) अशी सर्व माहिती पूर्णपणे गोपनीय ठेवेल; (ब) लेखी पूर्वपरवानगीशिवाय ती कोणत्याही तृतीय पक्षास उघड करणार नाही; आणि (क) ती केवळ रोजगाराच्या प्रयोजनासाठीच वापरेल. हे बंधन नोकरी संपल्यानंतर <strong>२ (दोन) वर्षे</strong> कायम राहील. या कलमाचे उल्लंघन केल्यास कंपनीला लागू कायद्यानुसार मनाई हुकूम व/किंवा नुकसानभरपाईचा अधिकार असेल.
          </div>

          {/* ── कलम १० — स्पर्धा-प्रतिबंध व प्रलोभन-प्रतिबंध ── */}
          <div className="section-heading">कलम १०. स्पर्धा-प्रतिबंध व प्रलोभन-प्रतिबंध</div>
          <div className="body-text">
            नोकरीच्या कालावधीत आणि कोणत्याही कारणाने नोकरी संपल्यानंतर{' '}
            <IBlank w={100} value={convertToMarathi(data.employment?.nonCompetePeriod || '६ (सहा) महिने')} />{' '}
            कालावधीपर्यंत कर्मचारी खालील कार्ये करणार नाही:
          </div>
          <ul className="dash-list">
            <li>
              कंपनीच्या नोंदणीकृत कार्यालयाच्या{' '}
              <IBlank w={80} value={data.employment?.nonCompeteRadius || '२५ किमी'} />{' '}
              परिघात कोणत्याही स्पर्धात्मक व्यवसायासाठी प्रत्यक्ष वा अप्रत्यक्षरीत्या काम करणे, सल्ला देणे अथवा स्पर्धात्मक व्यवसाय स्थापन करणे;
            </li>
            <li>वैयक्तिक लाभासाठी अथवा कोणत्याही स्पर्धात्मक संस्थेच्या फायद्यासाठी कंपनीच्या कोणत्याही ग्राहकाला, व्यावसायिक लीडला, चॅनेल पार्टनरला अथवा विक्रेत्याला आकर्षित करणे, विचलित करणे अथवा त्यांच्याशी संपर्क करणे; किंवा</li>
            <li>कंपनीच्या कोणत्याही कर्मचाऱ्याला राजीनामा देण्यास अथवा स्पर्धात्मक संस्थेत सामील होण्यास प्रवृत्त करणे, भरती करणे अथवा उकसावणे.</li>
          </ul>
          <div className="body-text">
            कर्मचारी मान्य करतो/करते की हे निर्बंध वाजवी आहेत आणि कंपनी अधिनियम, २०१३ अंतर्गत नोंदणीकृत प्रायव्हेट लिमिटेड कंपनीच्या कायदेशीर व्यावसायिक हितांच्या संरक्षणासाठी आवश्यक आहेत.
          </div>

          {/* ── कलम ११ — नोकरीची समाप्ती ── */}
          <div className="section-heading">कलम ११. नोकरीची समाप्ती</div>

          <div className="sub-heading">नियोक्त्याद्वारे समाप्ती</div>
          <ul className="dash-list">
            <li>
              <strong>कारणासह (तत्काळ):</strong> घोर गैरवर्तन, जाणीवपूर्वक अवज्ञा, फसवणूक, कंपनी मालमत्तेचा दुरुपयोग, गोपनीयतेचे उल्लंघन, गुन्हेगारी शिक्षा अथवा या कराराच्या कोणत्याही मुख्य तरतुदीचे उल्लंघन झाल्यास — पूर्वसूचना अथवा सूचनेऐवजी मोबदल्याशिवाय.
            </li>
            <li>
              <strong>कारणाशिवाय:</strong>{' '}
              <IBlank w={110} value={convertToMarathi(data.employment?.noticePeriodEmployer || '३० (तीस) दिवस')} />{' '}
              लेखी पूर्वसूचना देऊन अथवा समतुल्य वेतन अदा करून.
            </li>
          </ul>

          <div className="sub-heading">कर्मचाऱ्याद्वारे समाप्ती</div>
          <div className="body-text">
            कर्मचारी नियोक्त्यास{' '}
            <IBlank w={110} value={convertToMarathi(data.employment?.noticePeriodEmployee || '३० (तीस) दिवस')} />{' '}
            लेखी पूर्वसूचना देऊन राजीनामा देऊ शकतो/शकते. राजीनामा अथवा समाप्तीच्या प्रसंगी कर्मचारी तत्काळ: (अ) कंपनीची सर्व मालमत्ता, उपकरणे, दस्तऐवज व प्रवेश क्रेडेन्शियल्स परत करेल; (ब) सर्व प्रलंबित कामे व ज्ञान-दस्तऐवजीकरण सुपूर्द करेल; आणि (क) हस्तांतरण प्रक्रियेत संपूर्ण सहकार्य करेल.
          </div>

        </div>
        <PrintFooter />
      </div>

      <div className="a4-gap" />

      {/* ══════════════════════════════════════════
          पृष्ठ ४ — वाद · शासी कायदा · विशेष अटी · स्वीकृती · स्वाक्षऱ्या
      ══════════════════════════════════════════ */}
      <div className="a4-page" style={{ position: 'relative' }}>
        <Watermark />
        <div className="divider-page" />
        <div style={{ position: 'relative', zIndex: 1 }}>

          {/* ── कलम १२ — वाद निवारण ── */}
          <div className="section-heading">कलम १२. वाद निवारण</div>
          <div className="body-text">
            या कराराशी संबंधित कोणताही वाद उद्भवल्यास, दोन्ही पक्ष प्रथम सद्भावनापूर्ण चर्चेद्वारे तो सौहार्दाने सोडविण्याचा प्रयत्न करतील. सूचनेच्या तारखेपासून <strong>३० (तीस) दिवसांत</strong> वाद न सुटल्यास, कोणताही पक्ष लवाद व सलोखा अधिनियम, १९९६ अंतर्गत एकल लवादाकडे, जो दोन्ही पक्षांनी परस्पर सहमतीने नियुक्त करावयाचा आहे, तो प्रकरण सोपवू शकतो. लवादाचे केंद्र{' '}
            <IBlank w={110} value={data.employment?.jurisdiction || data.company?.companyDistrict || ''} />{' '}
            असेल.
          </div>

          {/* ── कलम १३ — शासी कायदा व न्यायक्षेत्र ── */}
          <div className="section-heading">कलम १३. शासी कायदा व न्यायक्षेत्र</div>
          <div className="body-text">
            हा करार भारताच्या कायद्यांनुसार शासित व अर्थान्वित होईल, ज्यात कंपनी अधिनियम, २०१३, भारतीय करार अधिनियम, १८७२, औद्योगिक रोजगार (स्थायी आदेश) अधिनियम, १९४६ आणि इतर सर्व लागू केंद्रीय व राज्य कायदे समाविष्ट आहेत.{' '}
            <IBlank w={110} value={data.employment?.jurisdiction || data.company?.companyDistrict || ''} />{' '}
            येथील न्यायालयांचे या करारातून उद्भवणाऱ्या कोणत्याही वादावर अनन्य न्यायक्षेत्र असेल.
          </div>

          {/* ── कलम १४ — संपूर्ण करार, दुरुस्ती व विच्छेद्यता ── */}
          <div className="section-heading">कलम १४. संपूर्ण करार, दुरुस्ती व विच्छेद्यता</div>
          <div className="body-text">
            हा करार कर्मचाऱ्याच्या नोकरीसंदर्भात पक्षांमधील संपूर्ण सहमतीचे प्रतिनिधित्व करतो आणि पूर्वीचे सर्व विचारविनिमय, नियुक्ती पत्रे, वाटाघाटी व करार — लेखी अथवा तोंडी — यांची जागा घेतो. या करारातील कोणतीही दुरुस्ती लेखी स्वरूपात असणे व दोन्ही पक्षांच्या स्वाक्षरीने प्रमाणित असणे आवश्यक आहे. सक्षम न्यायालयाने या कराराची एखादी तरतूद अवैध अथवा अप्रवर्तनीय ठरविल्यास, उर्वरित तरतुदी पूर्ण बल व प्रभावाने अंमलात राहतील.
          </div>

          {/* ── कलम १५ — विशेष अटी (वैकल्पिक, डेटा-आधारित) ── */}
          {(data.employment?.additionalClauses?.length ?? 0) > 0 && (
            <>
              <div className="section-heading">कलम १५. विशेष अटी</div>
              {data.employment!.additionalClauses!.map((clause, i) => (
                <div className="body-text" key={i}>
                  <strong>१५.{i + 1}.</strong> {clause}
                </div>
              ))}
            </>
          )}

          {/* ── कलम १५/१६ — स्वीकृती ── */}
          <div className="section-heading">
            कलम {(data.employment?.additionalClauses?.length ?? 0) > 0 ? '१६' : '१५'}. स्वीकृती व पुष्टी
          </div>
          <div className="body-text">
            कर्मचारी पुष्टी करतो/करते की त्याने/तिने या करारातील सर्व अटी व शर्ती वाचल्या, समजल्या व त्यांना स्वतंत्रपणे सहमती दिली आहे. कर्मचारी हे देखील पुष्टी करतो/करते की तो/ती कोणत्याही माजी नियोक्त्यासोबतच्या स्पर्धा-प्रतिबंध, गोपनीयता अथवा इतर करारात्मक बंधनाने बाधित नाही ज्यामुळे या करारांतर्गत त्याच्या/तिच्या कर्तव्यांच्या निर्वहनावर निर्बंध येईल, आणि तो/ती कोणत्याही दबावाशिवाय किंवा अनुचित प्रभावाशिवाय हा करार करत आहे.
          </div>

          {/* ── स्वाक्षऱ्या ── */}
          <div className="sig-grid">

            {/* नियोक्ता */}
            <div className="sig-block">
              <div className="sig-block-title">कंपनीच्या वतीने व तिच्यासाठी</div>
              <div className="sig-line" />
              <div className="sig-field-row">
                <strong>दिनांक:</strong>
                <IBlank w={110} value={formatMarathiDate(data.employment?.joiningDate)} />
              </div>
              <div className="sig-field-row">
                <strong>नाव:</strong>
                <IBlank w={130} value={signatoryName} />
              </div>
              <div className="sig-field-row">
                <strong>पद:</strong>
                <IBlank w={120} value={signatoryRole} />
              </div>
              <div style={{ marginTop: '6px', fontSize: '12px', fontStyle: 'italic' }}>
                अधिकृत स्वाक्षरीकर्ता —{' '}
                {convertToMarathi(data.company?.companyName || '')}
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
              <div className="sig-block-title">कर्मचाऱ्याची स्वाक्षरी</div>
              <div className="sig-line" />
              <div className="sig-field-row">
                <strong>दिनांक:</strong>
                <IBlank w={110} value={formatMarathiDate(data.employment?.joiningDate)} />
              </div>
              <div className="sig-field-row">
                <strong>नाव:</strong>
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
                डाव्या अंगठ्याचा ठसा:-
              </div>
              <div style={{
                border: '1px solid #000', minHeight: '70px',
                marginTop: '4px', width: '130px',
              }} />
            </div>

          </div>

          {/* ── साक्षीदार ── */}
          <div style={{ marginTop: '32px', borderTop: '1px dashed #555', paddingTop: '12px' }}>
            <div style={{ fontSize: '12.5px', fontWeight: 700, marginBottom: '8px', letterSpacing: '0.5px' }}>
              साक्षीदार
            </div>
            <div style={{ display: 'flex', gap: '40px' }}>
              {['१', '२'].map((n, idx) => (
                <div key={idx} style={{ flex: 1, fontSize: '12.5px', lineHeight: 1.85 }}>
                  <div style={{ fontWeight: 700 }}>साक्षीदार {n}</div>
                  <div>नाव: <span style={{ borderBottom: '1px solid #000', display: 'inline-block', minWidth: '110px', verticalAlign: 'bottom' }} /></div>
                  <div>स्वाक्षरी: <span style={{ borderBottom: '1px solid #000', display: 'inline-block', minWidth: '100px', verticalAlign: 'bottom' }} /></div>
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

export default MarathiGeneralEmploymentAgreement;