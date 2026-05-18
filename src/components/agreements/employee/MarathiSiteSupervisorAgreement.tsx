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
// MANAGER
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

const MarathiSiteSupervisorAgreement = ({ data, companyLogo, companyWatermark }: TemplateProps) => {

  const formatMarathiDate = (dateStr?: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return convertNumberToMarathi(dateStr);
    const day = convertNumberToMarathi(date.getDate());
    const month = convertNumberToMarathi(date.getMonth() + 1);
    const year = convertNumberToMarathi(date.getFullYear());
    return `${day}/${month}/${year}`;
  };

  const employerFullName = convertToMarathi(`${convertToMarathi(data.company?.companyName || '')} ${data.company?.entityType ? `(${data.company.entityType})` : ''}`.trim());

  const employerAddress = convertToMarathi([
    data.company?.companyAddress,
    data.company?.companyLocality,
    data.company?.companyDistrict,
    data.company?.companyState,
  ].filter(Boolean).join(', ') + (data.company?.companyPincode ? ` - ${data.company.companyPincode}` : ''));

  const employeeFullName = convertToMarathi([data.employee?.title, data.employee?.name].filter(Boolean).join(' '));

  const employeeAddress = convertToMarathi([
    data.employee?.address,
    data.employee?.locality,
    data.employee?.district,
    data.employee?.state,
  ].filter(Boolean).join(', ') + (data.employee?.pincode ? ` - ${data.employee.pincode}` : ''));

  // ── Marathi Site Supervisor Default Duties ──
  const defaultDuties = [
    "नियुक्त प्रकल्प स्थळांवर सर्व बांधकाम, विकास व लेआउट कामांवर देखरेख व समन्वय करणे.",
    "साइटवर सुरक्षा नियम, साइट प्रोटोकॉल तसेच लागू इमारत संहिता व वैधानिक आवश्यकतांचे पालन व अंमलबजावणी निरीक्षण करणे.",
    "साइट कामाच्या वेळेवर अंमलबजावणीसाठी कंत्राटदार, उपकंत्राटदार, मजूर पथके व विक्रेते यांच्याशी संपर्क व समन्वय साधणे.",
    "दररोज साइट तपासणी करणे आणि व्यवस्थापन पुनरावलोकनासाठी प्रगती अहवाल, साइट डायरी व छायाचित्र नोंदी तयार करणे.",
    "साइटवरील साहित्य, यंत्रसामग्री व उपकरणे यांचा योग्य हिशेब, वापर व सुरक्षितता सुनिश्चित करणे.",
    "साइट-स्तरीय तांत्रिक समस्या व विचलने सोडविण्यासाठी डिझाइन, नियोजन व अभियांत्रिकी पथकांशी समन्वय साधणे.",
    "साइट उपस्थिती, मजूर तैनाती, साहित्य वापर व पूर्ण झालेल्या कामाच्या अचूक नोंदी ठेवणे.",
    "खरेदीदार व ग्राहकांच्या साइट भेटींची सुविधा करणे आणि त्यांना भूखंडाच्या सीमा, सीमांकन व प्रकल्पाची सद्यस्थिती याबाबत मार्गदर्शन करणे.",
    "प्रकल्प जमिनीवर किंवा जवळ कोणतेही अतिक्रमण, वाद किंवा अनधिकृत कामकाज आढळल्यास त्वरित व्यवस्थापनास कळविणे.",
    "वेळोवेळी व्यवस्थापनाने सोपविलेली इतर कामे पार पाडणे.",
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
          font-family: 'Noto Sans Devanagari', 'Mangal', 'Arial Unicode MS', serif;
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
          margin: 14px 0 2px 0;
          font-family: 'Noto Sans Devanagari', serif;
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
          line-height: 1.9;
        }
        .party-name {
          font-weight: 800;
          font-size: 13.5px;
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
          text-decoration: underline;
          margin-top: 13px;
          margin-bottom: 4px;
          letter-spacing: 0.4px;
        }
        .body-text {
          font-size: 13px;
          line-height: 2;
          text-align: justify;
          margin-bottom: 5px;
        }
        .duty-list {
          margin: 3px 0 5px 20px;
          font-size: 13px;
          line-height: 2;
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
          line-height: 1.9;
          list-style-type: disc;
        }
        .benefits-list li {
          margin-bottom: 2px;
        }
        .termination-list {
          margin: 3px 0 5px 20px;
          font-size: 13px;
          line-height: 2;
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

          {/* ── TITLE ── */}
          <div className="agreement-title">रोजगार करार</div>
          <div className="agreement-subtitle">(साइट पर्यवेक्षक)</div>

          {/* ── PREAMBLE ── */}
          <div className="body-text">
            हा रोजगार करार <strong>("करार")</strong>{' '}
            <span className="underline-blank">{formatMarathiDate(data.employment?.joiningDate)}</span>{' '}
            रोजी खालील पक्षांमध्ये केला गेला आहे व अंमलात आला आहे:
          </div>

          {/* ── EMPLOYER ── */}
          <div className="party-block">
            <div className="party-name">{employerFullName}</div>
            <div><strong>पत्ता:</strong> {employerAddress}</div>
            <div><strong>CIN / नोंद क्र.:</strong> {data.company?.cinNumber || data.company?.licenseRegistrationNumber || ''}</div>
            <div style={{ fontStyle: 'italic' }}>(यापुढे <strong>"नियोक्ता"</strong> म्हणून संदर्भित)</div>
          </div>

          <div className="and-divider">व</div>

          {/* ── EMPLOYEE ── */}
          <div className="party-block">
            <div className="party-name">{employeeFullName}</div>
            <div><strong>पत्ता:</strong> {employeeAddress}</div>
            <div><strong>जन्म दिनांक:</strong>{' '}
              {data.employee?.dob
                ? formatMarathiDate(data.employee.dob)
                : <span className="underline-blank" style={{ minWidth: '100px' }} />}
            </div>
            <div>
              <strong>आधार क्र.:</strong>{' '}
              {formatAadhaarMarathi(data.employee?.aadhaar) || <span className="underline-blank" style={{ minWidth: '120px' }} />}
              &emsp;
              <strong>पॅन क्र.:</strong>{' '}
              {data.employee?.pan || <span className="underline-blank" style={{ minWidth: '100px' }} />}
            </div>
            <div style={{ fontStyle: 'italic' }}>(यापुढे <strong>"कर्मचारी"</strong> म्हणून संदर्भित)</div>
          </div>

          {/* ══ १. पद व कर्तव्ये ══ */}
          <div className="section-heading">१. पद व कर्तव्ये</div>
          <div className="body-text">
            नियोक्ता एतदर्थ कर्मचाऱ्यास <strong>साइट पर्यवेक्षक</strong> या पदावर नियुक्त करतात
            {data.employment?.department ? `, ${data.employment.department} विभागात` : ''}।
            कर्मचाऱ्याची नियुक्ती{' '}
            <span className="underline-blank">{data.employment?.placeOfPosting || ''}</span>{' '}
            येथे होईल व ते{' '}
            <span className="underline-blank">{convertToMarathi(data.employment?.reportingTo || '')}</span>{' '}
            यांना अहवाल देतील. कर्मचारी रिअल इस्टेट विकास व बांधकाम व्यवसायात या पदाशी सामान्यतः संबंधित असलेली सर्व कर्तव्ये व जबाबदाऱ्या पार पाडतील, ज्यात खालील गोष्टींचा समावेश आहे परंतु त्यापुरतेच मर्यादित नाही:
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

        {/* WATERMARK */}
        <div style={{
          position: "absolute", top: 0, left: 0, width: "100%", height: "100%",
          display: "flex", alignItems: "center", justifyContent: "center",
          opacity: 0.08, zIndex: 0, pointerEvents: "none",
        }}>
          <img
            src={companyWatermark || companyLogo || ''}
            style={{ width: "70%", maxWidth: "720px", height: "auto", objectFit: "contain" }}
          />
        </div>

        <div className="divider-page"></div>
        <div style={{ position: "relative", zIndex: 1 }}>

          {/* ══ २. रोजगाराची सुरुवात ══ */}
          <div className="section-heading">२. रोजगाराची सुरुवात</div>
          <div className="body-text">
            नियोक्त्याकडे कर्मचाऱ्याचा रोजगार{' '}
            <span className="underline-blank">{formatMarathiDate(data.employment?.joiningDate)}</span>{' '}
            पासून सुरू होईल. कर्मचाऱ्याची नियुक्ती{' '}
            <span className="underline-blank">{data.employment?.placeOfPosting || ''}</span>{' '}
            येथे किंवा नियोक्त्याने वेळोवेळी नियुक्त केलेल्या इतर कोणत्याही प्रकल्प स्थळी होईल.
            कर्मचारी रुजू होण्याच्या दिनांकापासून{' '}
            <strong>{data.employment?.probationPeriod || '३ (तीन) महिने'}</strong>{' '}
            च्या कालावधीसाठी परिवीक्षाधीन राहील, या काळात कोणताही पक्ष कारण किंवा पूर्वसूचनेशिवाय हा करार संपुष्टात आणू शकतो. परिवीक्षा यशस्वीरीत्या पूर्ण झाल्यावर नियुक्तीची पुष्टी लेखी स्वरूपात दिली जाईल.
          </div>

          {/* ══ ३. मोबदला ══ */}
          <div className="section-heading">३. मोबदला</div>

          <div className="sub-heading">वेतन</div>
          <div className="body-text">
            नियोक्ता कर्मचाऱ्यास ₹{' '}
            <span className="underline-blank">{convertNumberToMarathi(data.employment?.grossAnnualSalary || '')}</span>
            /- (रुपये{' '}
            <span className="underline-blank" style={{ minWidth: '160px' }}>
              {convertToMarathi(data.employment?.grossAnnualSalaryWords || '')}
            </span>{' '}
            मात्र) एवढे वार्षिक एकूण वेतन देतील, जे ₹{' '}
            <span className="underline-blank">{convertNumberToMarathi(data.employment?.grossMonthlySalary || '')}</span>
            /- (रुपये{' '}
            <span className="underline-blank" style={{ minWidth: '140px' }}>
              {convertToMarathi(data.employment?.grossMonthlySalaryWords || '')}
            </span>{' '}
            मात्र) एवढ्या मासिक एकूण वेतनाच्या समतुल्य असेल, जे समान मासिक हप्त्यांमध्ये, लागू कपाती व वैधानिक उद्गम करास अधीन राहून, देय असेल.
          </div>

          <div className="sub-heading">साइट भत्ते</div>
          <div className="body-text">
            वरील वेतनाव्यतिरिक्त, कर्मचारी नियोक्त्याच्या प्रचलित धोरणानुसार खालील साइट-संबंधित भत्त्यांसाठी पात्र असेल:
          </div>
          <ul className="benefits-list">
            <li><strong>प्रवास / वाहन भत्ता:</strong> प्रकल्प स्थळे व मुख्य कार्यालय यांच्यातील प्रवासासाठी प्रत्यक्ष खर्च किंवा लागू स्लॅबनुसार प्रतिपूर्ती.</li>
            <li><strong>साइट कठीण परिस्थिती भत्ता:</strong> दुर्गम किंवा विकसनशील प्रकल्प स्थळांवर केलेल्या क्षेत्र कामासाठी नियोक्त्याच्या विवेकबुद्धीनुसार देय निश्चित मासिक भत्ता.</li>
            <li><strong>मोबाइल / संदेशवहन भत्ता:</strong> साइट कर्तव्यांच्या अनुषंगाने झालेल्या संदेशवहन खर्चाची मासिक प्रतिपूर्ती.</li>
          </ul>

          <div className="sub-heading">लाभ</div>
          <div className="body-text">
            कर्मचारी नियोक्त्याच्या प्रमाणित धोरणांनुसार खालील लाभांसाठी पात्र असेल:
          </div>

          <div style={{ fontWeight: 700, fontSize: '13px', marginTop: '5px', marginBottom: '2px' }}>
            अनिवार्य वैधानिक लाभ
          </div>
          <ul className="benefits-list">
            <li><strong>कर्मचारी भविष्य निर्वाह निधी (EPF):</strong> २० किंवा अधिक कर्मचारी असलेल्या कंपन्यांसाठी अनिवार्य.</li>
            <li><strong>कर्मचारी राज्य विमा (ESI):</strong> १० पेक्षा जास्त कर्मचारी (काही राज्यांत २०) असलेल्या कंपन्यांसाठी आवश्यक, जेथे कर्मचाऱ्याचे वेतन ₹२१,०००/- प्रतिमाह पेक्षा कमी असेल.</li>
            <li><strong>उपदान (Gratuity):</strong> ५ वर्षे सतत सेवा पूर्ण केल्यावर देय.</li>
            <li>
              <strong>रजा धोरण:</strong> वार्षिक / अर्जित रजा ({convertNumberToMarathi(data.employment?.annualLeaves || '12')} दिवस),
              वैद्यकीय रजा ({convertNumberToMarathi(data.employment?.medicalLeaves || '6')} दिवस) व आकस्मिक रजा ({convertNumberToMarathi(data.employment?.casualLeaves || '6')} दिवस) समाविष्ट.
            </li>
            <li><strong>मातृत्व लाभ:</strong> मातृत्व लाभ कायदा, १९६१ नुसार पात्र महिला कर्मचाऱ्यांसाठी सवेतन रजा.</li>
          </ul>

          <div style={{ fontWeight: 700, fontSize: '13px', marginTop: '5px', marginBottom: '2px' }}>
            ऐच्छिक / स्पर्धात्मक लाभ
          </div>
          <ul className="benefits-list">
            <li><strong>सामूहिक आरोग्य विमा:</strong> कंपनी धोरणानुसार सर्वसमावेशक वैद्यकीय संरक्षण.</li>
            <li><strong>कार्यप्रदर्शन प्रोत्साहन:</strong> व्यवस्थापनाच्या विवेकाधिकारानुसार कार्यप्रदर्शन-आधारित बोनस व वेतनवाढ.</li>
            <li><strong>व्यावसायिक विकास:</strong> बांधकाम व प्रकल्प व्यवस्थापनातील साइट प्रशिक्षण, सुरक्षा प्रमाणपत्रे व कौशल्य वृद्धीच्या संधी.</li>
            <li><strong>कर्मचारी शेअर मालकी योजना (ESOPs):</strong> लागू असल्यास, प्रतिभावान कर्मचाऱ्यांना प्रेरित व टिकवून ठेवण्यासाठी इक्विटी ऑफर.</li>
          </ul>

          <div style={{ fontWeight: 700, fontSize: '13px', marginTop: '5px', marginBottom: '2px' }}>
            पर्यायी सोयी-सुविधा
          </div>
          <ul className="benefits-list">
            <li>कल्याण कार्यक्रम: आरोग्य तपासणी, सुरक्षा साधने व साइट कल्याण सहाय्य.</li>
            <li>अतिरिक्त रजा: कंपनी धोरणानुसार पितृत्व रजा, शोक रजा.</li>
            <li>भविष्य निर्वाह निधी योगदान व नियोक्त्याने वेळोवेळी ठरवलेले इतर लाभ.</li>
          </ul>

        </div>
        <PrintFooter />
      </div>

      <div className="a4-gap" />

      {/* ══════════════════════════════════════════
          पृष्ठ ३
      ══════════════════════════════════════════ */}
      <div className="a4-page" style={{ position: "relative" }}>

        {/* WATERMARK */}
        <div style={{
          position: "absolute", top: 0, left: 0, width: "100%", height: "100%",
          display: "flex", alignItems: "center", justifyContent: "center",
          opacity: 0.08, zIndex: 0, pointerEvents: "none",
        }}>
          <img
            src={companyWatermark || companyLogo || ''}
            style={{ width: "70%", maxWidth: "720px", height: "auto", objectFit: "contain" }}
          />
        </div>

        <div style={{ position: "relative", zIndex: 1 }}>

          <div className="divider-page"></div>

          {/* ══ ४. कामाचे तास व साइट उपस्थिती ══ */}
          <div className="section-heading">४. कामाचे तास व साइट उपस्थिती</div>
          <div className="body-text">
            कर्मचाऱ्याचे प्रमाणित कामाचे तास{' '}
            <span className="underline-blank">{data.employment?.workingHours || 'सकाळी ८:०० ते सायंकाळी ५:००'}</span>{' '}
            असतील,{' '}
            {data.employment?.workingDays || 'सोमवार ते शनिवार'}, ज्यात{' '}
            <span className="underline-blank">{data.employment?.lunchBreak || '३० (तीस) मिनिटे'}</span>{' '}
            दुपारच्या जेवणाची सुट्टी समाविष्ट आहे. व्यवस्थापनाने अन्यथा सूचित केले नाही तर कर्मचाऱ्यांना कामाच्या वेळेत नियुक्त प्रकल्प स्थळी प्रत्यक्ष उपस्थित राहणे अनिवार्य आहे. बांधकाम किंवा प्रकल्प सुपूर्दगीच्या महत्त्वाच्या टप्प्यांदरम्यान कर्मचाऱ्यास रविवार, सार्वजनिक सुट्ट्यांवर किंवा अतिरिक्त तास काम करावे लागू शकते, ज्यासाठी भरपाईची सुट्टी किंवा ओव्हरटाइम नियोक्त्याच्या लागू धोरणानुसार ठरवले जाईल.
          </div>

          {/* ══ ५. साइट सुरक्षा व वैधानिक अनुपालन ══ */}
          <div className="section-heading">५. साइट सुरक्षा व वैधानिक अनुपालन</div>
          <div className="body-text">
            कर्मचारी सर्व वेळी इमारत व इतर बांधकाम कामगार (रोजगार नियमन व सेवाशर्ती) कायदा, १९९६ आणि इतर कोणत्याही लागू कामगार किंवा बांधकाम कायद्यांतर्गत निर्धारित साइट सुरक्षा नियम, मानके व विनियमांचे पालन व अंमलबजावणी करतील. कर्मचारी हे सुनिश्चित करतील की त्यांच्या देखरेखीखाली काम करणारे सर्व मजूर विहित वैयक्तिक संरक्षण उपकरणे (PPE) घालतात, सुरक्षित कामाच्या पद्धतींचे पालन करतात व साइटवर कोणत्याही असुरक्षित परिस्थितीला राहू दिले जाणार नाही. कोणताही अपघात, जवळजवळ घडलेली दुर्घटना (near-miss) किंवा सुरक्षा उल्लंघन त्वरित व्यवस्थापनास कळवणे आवश्यक आहे.
          </div>

          {/* ══ ६. गोपनीयता ══ */}
          <div className="section-heading">६. गोपनीयता</div>
          <div className="body-text">
            कर्मचारी मान्य करतात की रोजगाराच्या काळात त्यांना नियोक्त्याच्या गोपनीय व मालकीच्या माहितीचा प्रवेश मिळेल, ज्यात प्रकल्प लेआउट, जमीन संपादन तपशील, ग्राहक डेटा, कंत्राटदार करार, बांधकाम खर्च व व्यवसाय धोरणे यांचा समावेश आहे परंतु त्यापुरतेच मर्यादित नाही. कर्मचारी या सर्व माहितीची कडक गोपनीयता राखण्यास व ती कोणत्याही तृतीय पक्षास न उघड करण्यास किंवा नियोक्त्याच्या फायद्याव्यतिरिक्त कोणत्याही उद्देशासाठी वापर न करण्यास सहमत आहेत, मग ते रोजगाराच्या काळात असो किंवा नंतर.
          </div>

          {/* ══ ७. अ-स्पर्धा ══ */}
          <div className="section-heading">७. अ-स्पर्धा</div>
          <div className="body-text">
            रोजगाराच्या कालावधीत व कोणत्याही कारणाने रोजगार संपुष्टात आल्यानंतर{' '}
            <span className="underline-blank">{convertToMarathi(data.employment?.nonCompetePeriod || '६ (सहा) महिने')}</span>{' '}
            च्या कालावधीपर्यंत, कर्मचारी प्रत्यक्ष किंवा अप्रत्यक्षपणे नियोक्त्याच्या कोणत्याही सक्रिय प्रकल्प स्थळाच्या{' '}
            <span className="underline-blank">{data.employment?.nonCompeteRadius || '२५ किमी'}</span>{' '}
            परिघात नियोक्त्याच्या रिअल इस्टेट विकास व बांधकाम व्यवसायाशी स्पर्धा करणाऱ्या कोणत्याही व्यवसायात किंवा उपक्रमात गुंततील नाहीत.
          </div>

          {/* ══ ८. रोजगार समाप्ती ══ */}
          <div className="section-heading">८. रोजगाराची समाप्ती</div>

          <div className="sub-heading">नियोक्त्याकडून समाप्ती</div>
          <div className="body-text">नियोक्ता खालील कारणांसाठी कर्मचाऱ्याचा रोजगार संपुष्टात आणू शकतात:</div>
          <ul className="termination-list">
            <li>
              <strong>कारणासह:</strong> तत्काळ, ज्यात समाविष्ट आहे परंतु त्यापुरतेच मर्यादित नाही: घोर गैरवर्तन, अनाज्ञाधारकपणा, साइटचा त्याग, सुरक्षा नियमांचे उल्लंघन, फसवणूक, गोपनीयतेचा भंग किंवा या करारांचे सारभूत उल्लंघन.
            </li>
            <li>
              <strong>कारणाशिवाय:</strong>{' '}
              <span className="underline-blank">{convertToMarathi(data.employment?.noticePeriodEmployer || '३० (तीस) दिवस')}</span>{' '}
              चे लेखी नोटीस किंवा नोटिसाऐवजी देयक देऊन.
            </li>
          </ul>

          <div className="sub-heading">कर्मचाऱ्याकडून समाप्ती</div>
          <div className="body-text">
            कर्मचारी नियोक्त्यास{' '}
            <span className="underline-blank">{convertToMarathi(data.employment?.noticePeriodEmployee || '३० (तीस) दिवस')}</span>{' '}
            चे लेखी नोटीस देऊन आपला रोजगार संपुष्टात आणू शकतात. समाप्तीनंतर कर्मचाऱ्याने त्वरित सर्व साइट नोंदी, दैनंदिन डायऱ्या, साहित्य नोंदवह्या, चाव्या, प्रवेश कार्ड, कंपनीच्या मालकीची साधने व उपकरणे आणि नियोक्त्याची किंवा प्रकल्प स्थळी असलेली इतर कोणतीही मालमत्ता परत करणे आवश्यक आहे.
          </div>

          {/* ══ ९. शासी कायदा व क्षेत्राधिकार ══ */}
          <div className="section-heading">९. शासी कायदा व क्षेत्राधिकार</div>
          <div className="body-text">
            हा करार भारताच्या कायद्यांनुसार शासित व त्यांच्यानुसार अर्थ लावला जाईल.
            या करारातून उद्भवणारे किंवा त्याच्याशी संबंधित कोणतेही वाद{' '}
            <span className="underline-blank">{data.employment?.jurisdiction || data.company?.companyDistrict || ''}</span>{' '}
            येथील न्यायालयांच्या अनन्य अधिकारक्षेत्राच्या अधीन असतील.
          </div>

          {/* ══ १०. संपूर्ण करार ══ */}
          <div className="section-heading">१०. संपूर्ण करार</div>
          <div className="body-text">
            हा करार रोजगाराच्या अटींबाबत नियोक्ता व कर्मचारी यांच्यातील संपूर्ण करार बनवतो आणि पूर्वीच्या सर्व चर्चा, वाटाघाटी व करार — मग ते लेखी असोत किंवा तोंडी — यांची जागा घेतो.
          </div>

        </div>
        <PrintFooter />
      </div>

      <div className="a4-gap" />

      {/* ══════════════════════════════════════════
          पृष्ठ ४
      ══════════════════════════════════════════ */}
      <div className="a4-page" style={{ position: "relative" }}>

        {/* WATERMARK */}
        <div style={{
          position: "absolute", top: 0, left: 0, width: "100%", height: "100%",
          display: "flex", alignItems: "center", justifyContent: "center",
          opacity: 0.08, zIndex: 0, pointerEvents: "none",
        }}>
          <img
            src={companyWatermark || companyLogo || ''}
            style={{ width: "70%", maxWidth: "720px", height: "auto", objectFit: "contain" }}
          />
        </div>

        <div style={{ position: "relative", zIndex: 1 }}>

          <div className="divider-page"></div>

          {/* ══ ११. दुरुस्त्या ══ */}
          <div className="section-heading">११. दुरुस्त्या</div>
          <div className="body-text">
            या करारातील कोणतीही दुरुस्ती किंवा बदल लेखी स्वरूपात असणे आणि नियोक्ता व कर्मचारी दोघांनीही स्वाक्षरी करणे अनिवार्य आहे.
          </div>

          {/* ══ १२. विभाज्यता ══ */}
          <div className="section-heading">१२. विभाज्यता</div>
          <div className="body-text">
            या करारातील कोणतीही तरतूद अवैध किंवा अप्रवर्तनीय असल्याचे आढळल्यास, उर्वरित तरतुदी कायद्याने परवानगी दिलेल्या कमाल मर्यादेपर्यंत वैध व प्रवर्तनीय राहतील.
          </div>

          {/* ══ स्वाक्षऱ्या ══ */}
          <div className="sig-grid">

            {/* नियोक्ता स्वाक्षरी */}
            <div className="sig-block">
              <div className="sig-block-title">नियोक्त्याची स्वाक्षरी</div>
              <div className="sig-line" />
              <div className="sig-field-row">
                <strong>दिनांक:</strong>
                <span className="underline-blank" style={{ minWidth: '110px' }}>
                  {formatMarathiDate(data.employment?.joiningDate)}
                </span>
              </div>
              <div className="sig-field-row">
                <strong>नाव:</strong>
                <span className="underline-blank" style={{ minWidth: '130px' }}>
                  {data.manager?.managerName || data.company?.managerName || data.company?.hrName || ''}
                </span>
              </div>
              <div className="sig-field-row">
                <strong>पद:</strong>
                <span className="underline-blank" style={{ minWidth: '120px' }}>
                  {data.manager?.managerPosition || data.company?.managerPosition || data.company?.hrDesignation}
                </span>
              </div>
              <div style={{ marginTop: '6px', fontSize: '12px', fontStyle: 'italic' }}>
                {convertToMarathi(data.company?.companyName || '')}{data.company?.entityType ? ` (${data.company.entityType})` : ''} यांच्यावतीने
              </div>
            </div>

            {/* कर्मचारी स्वाक्षरी */}
            <div className="sig-block">
              <div className="sig-block-title">कर्मचाऱ्याची स्वाक्षरी</div>
              <div className="sig-line" />
              <div className="sig-field-row">
                <strong>दिनांक:</strong>
                <span className="underline-blank" style={{ minWidth: '110px' }}>
                  {formatMarathiDate(data.employment?.joiningDate)}
                </span>
              </div>
              <div className="sig-field-row">
                <strong>नाव:</strong>
                <span className="underline-blank" style={{ minWidth: '130px' }}>
                  {employeeFullName}
                </span>
              </div>
              <div style={{ marginTop: '16px', fontSize: '12.5px', fontWeight: 700 }}>
                डाव्या अंगठ्याचा ठसा:-
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

export default MarathiSiteSupervisorAgreement;