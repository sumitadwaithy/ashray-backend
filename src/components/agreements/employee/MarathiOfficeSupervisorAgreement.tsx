import React from 'react';
import { PrintFooter } from '../../../../components/Printpreview';
import { convertToMarathi, convertNumberToMarathi, formatAadhaarMarathi, } from '../../../engine/EnglishToMarathiEngine';

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

const MarathiOfficeSupervisorAgreement = ({ data, companyLogo, companyWatermark }: TemplateProps) => {

  // 🔥 DATE
  const formatMarathiDate = (dateStr?: string) => {
    if (!dateStr) return '';
  
    const date = new Date(dateStr);
  
    if (isNaN(date.getTime())) {
      return convertNumberToMarathi(dateStr);
    }
  
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

  const defaultDuties = [
    "दैनंदिन कार्यालय कामकाज आणि प्रशासकीय कर्मचाऱ्यांवर देखरेख करणे.",
    "कार्यालयीन साहित्य, उपकरणे आणि यादी व्यवस्थापन करणे.",
    "बैठका, भेटी आणि साइट/मालमत्ता भेटींचे समन्वय करणे.",
    "ग्राहकांचे नोंदी, फाइल्स आणि प्रकल्प दस्तऐवज राखणे.",
    "विपणन आणि प्रचार उपक्रमांमध्ये सहाय्य करणे.",
    "कंपनीच्या धोरणे व प्रक्रियांचे पालन सुनिश्चित करणे.",
    "ग्राहक, विक्रेते आणि एजंट यांच्या चौकशींना उत्तर देणे.",
    "वेळोवेळी व्यवस्थापनाने नेमून दिलेली इतर कामे पार पाडणे.",
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

          {/* ── शीर्षक ── */}
          <div className="agreement-title">रोजगार करार</div>
          <div className="agreement-subtitle">(कार्यालय पर्यवेक्षक)</div>

          {/* ── प्रस्तावना ── */}
          <div className="body-text">
            हा रोजगार करार <strong>("करार")</strong> दिनांक{' '}
            <span className="underline-blank">{formatMarathiDate(data.employment?.joiningDate)}</span>{' '}
            रोजी खालील पक्षांमध्ये केला गेला आहे:
          </div>

          {/* ── नियोक्ता ── */}
          <div className="party-block">
            <div className="party-name">{employerFullName}</div>
            <div><strong>पत्ता:</strong> {employerAddress}</div>
            <div><strong>सीआयएन / नोंदणी क्र.:</strong> {data.company?.cinNumber || data.company?.licenseRegistrationNumber || ''}</div>
            <div style={{ fontStyle: 'italic' }}>(यापुढे <strong>"नियोक्ता"</strong> असे संबोधण्यात येईल)</div>
          </div>

          <div className="and-divider">आणि</div>

          {/* ── कर्मचारी ── */}
          <div className="party-block">
            <div className="party-name">{employeeFullName}</div>
            <div><strong>पत्ता:</strong> {employeeAddress}</div>
            <div><strong>जन्मतारीख:</strong> {data.employee?.dob ? formatMarathiDate(data.employee.dob) : <span className="underline-blank" style={{ minWidth: '100px' }} />}</div>
            <div>
              <strong>आधार क्र.:</strong> {formatAadhaarMarathi(data.employee?.aadhaar) || <span className="underline-blank" style={{ minWidth: '120px' }} />}
              &emsp;
              <strong>पॅन क्र.:</strong> {data.employee?.pan || <span className="underline-blank" style={{ minWidth: '100px' }} />}
            </div>
            <div style={{ fontStyle: 'italic' }}>(यापुढे <strong>"कर्मचारी"</strong> असे संबोधण्यात येईल)</div>
          </div>

          {/* ══ १. पद आणि कर्तव्ये ══ */}
          <div className="section-heading">१. पद आणि कर्तव्ये</div>
          <div className="body-text">
            नियोक्ता एतद्द्वारे कर्मचाऱ्याला <strong>कार्यालय पर्यवेक्षक</strong> या पदावर
            {data.employment?.department ? ` ${convertToMarathi(data.employment.department)} विभागात` : ''} नियुक्त करतो. कर्मचारी{' '}
            <span className="underline-blank">{convertToMarathi(data.employment?.reportingTo || '')}</span>{' '}
            यांना अहवाल देईल आणि स्थावर मालमत्ता व्यवसायातील अशा पदाशी सामान्यतः संबंधित सर्व कर्तव्ये व जबाबदाऱ्या पार पाडेल, ज्यात खालील गोष्टींचा समावेश आहे परंतु त्या इतक्याच मर्यादित नाहीत:
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

        {/* मजकूर */}
        <div style={{ position: "relative", zIndex: 1 }}>

          {/* ══ २. रोजगाराची सुरुवात ══ */}
          <div className="section-heading">२. रोजगाराची सुरुवात</div>
          <div className="body-text">
            नियोक्त्याकडे कर्मचाऱ्याचा रोजगार{' '}
            <span className="underline-blank">{formatMarathiDate(data.employment?.joiningDate)}</span>{' '}
            पासून सुरू होईल. कर्मचारी रुजू होण्याच्या तारखेपासून{' '}
            <strong>{data.employment?.probationPeriod || '३ (तीन) महिने'}</strong>{' '}
            परिवीक्षा (प्रोबेशन) कालावधीत असेल, ज्या दरम्यान कोणताही पक्ष कारण किंवा पूर्वसूचनेशिवाय हा करार समाप्त करू शकतो. परिवीक्षा यशस्वीरीत्या पूर्ण झाल्यावर, रोजगाराची लेखी पुष्टी केली जाईल.
          </div>

          {/* ══ ३. मोबदला ══ */}
          <div className="section-heading">३. मोबदला</div>

          <div className="sub-heading">वेतन</div>
          <div className="body-text">
            नियोक्ता कर्मचाऱ्यास ₹{' '}
            <span className="underline-blank">
              {convertNumberToMarathi(data.employment?.grossAnnualSalary || '')}
            </span>
            /- (रुपये{' '}
            <span className="underline-blank" style={{ minWidth: '160px' }}>
              {convertToMarathi(data.employment?.grossAnnualSalaryWords || '')}
            </span>{' '}
            फक्त) एवढे एकूण वार्षिक वेतन देईल,

            जे ₹{' '}
            <span className="underline-blank">
              {convertNumberToMarathi(data.employment?.grossMonthlySalary || '')}
            </span>
            /- (रुपये{' '}
            <span className="underline-blank" style={{ minWidth: '140px' }}>
              {convertToMarathi(data.employment?.grossMonthlySalaryWords || '')}
            </span>{' '}
            फक्त) एवढ्या एकूण मासिक वेतनाशी समतुल्य आहे,

            जे लागू कपाती व वैधानिक रोख्यांच्या अधीन राहून समान मासिक हप्त्यांमध्ये देय असेल.
          </div>

          <div className="sub-heading">लाभ</div>
          <div className="body-text">
            कर्मचारी नियोक्त्याच्या मानक धोरणांनुसार लाभांसाठी पात्र असेल, ज्यात खालील गोष्टींचा समावेश असू शकतो:
          </div>

          <div style={{ fontWeight: 700, fontSize: '13px', marginTop: '5px', marginBottom: '2px' }}>
            अनिवार्य वैधानिक लाभ
          </div>
          <ul className="benefits-list">
            <li><strong>कर्मचारी भविष्य निर्वाह निधी (ईपीएफ):</strong> २० किंवा अधिक कर्मचारी असलेल्या कंपन्यांसाठी अनिवार्य.</li>
            <li><strong>कर्मचारी राज्य विमा (ईएसआय):</strong> आवश्यक जर कंपनीचा आकार १० कर्मचाऱ्यांपेक्षा (काही राज्यांत २०) अधिक असेल आणि कर्मचारी दरमहा ₹२१,०००/- पेक्षा कमी कमवत असतील.</li>
            <li><strong>उपदान (ग्रॅच्युइटी):</strong> कर्मचाऱ्याने ५ वर्षांची सलग सेवा पूर्ण केल्यास देय.</li>
            <li>
              <strong>रजा धोरण:</strong> सवेतन वार्षिक / अर्जित रजा ({convertNumberToMarathi(data.employment?.annualLeaves || '12')} दिवस),
              आजारपण / वैद्यकीय रजा ({convertNumberToMarathi(data.employment?.medicalLeaves || '6')} दिवस) आणि नैमित्तिक रजा ({convertNumberToMarathi(data.employment?.casualLeaves || '6')} दिवस) समाविष्ट आहे.
            </li>
            <li><strong>मातृत्व लाभ:</strong> मातृत्व लाभ कायदा, १९६१ नुसार पात्र महिला कर्मचाऱ्यांसाठी सवेतन रजा.</li>
          </ul>

          <div style={{ fontWeight: 700, fontSize: '13px', marginTop: '5px', marginBottom: '2px' }}>
            ऐच्छिक / स्पर्धात्मक लाभ
          </div>
          <ul className="benefits-list">
            <li><strong>सामूहिक आरोग्य विमा:</strong> कंपनी धोरणानुसार सर्वसमावेशक वैद्यकीय संरक्षण.</li>
            <li><strong>कार्यक्षमता प्रोत्साहन:</strong> व्यवस्थापनाच्या विवेकाधीन कार्यक्षमता-आधारित बोनस आणि वेतनवाढ.</li>
            <li><strong>लवचिक काम:</strong> व्यवस्थापनाच्या मान्यतेच्या अधीन हायब्रिड/दूरस्थ काम पर्याय आणि लवचिक तास.</li>
            <li><strong>व्यावसायिक विकास:</strong> प्रशिक्षण कार्यशाळा, प्रमाणपत्रे आणि कौशल्य उन्नतीच्या संधी.</li>
            <li><strong>कर्मचारी स्टॉक मालकी योजना (ईएसओपी):</strong> लागू असल्यास, उत्कृष्ट प्रतिभांना प्रेरित करण्यासाठी व टिकवून ठेवण्यासाठी इक्विटी प्रदान करणे.</li>
          </ul>

          <div style={{ fontWeight: 700, fontSize: '13px', marginTop: '5px', marginBottom: '2px' }}>
            पर्यायी सुविधा
          </div>
          <ul className="benefits-list">
            <li>कल्याण कार्यक्रम: जिम सदस्यत्व, मानसिक आरोग्य सहाय्य.</li>
            <li>अतिरिक्त रजा: कंपनी धोरणानुसार पितृत्व रजा, शोक रजा.</li>
            <li>सहाय्य: बाल संगोपन सहाय्य, स्थलांतर सहाय्य लागू असल्यास.</li>
            <li>आरोग्य विमा, सवेतन रजा (सुट्टी, आजारपण रजा, सार्वजनिक सुट्ट्या).</li>
            <li>भविष्य निर्वाह निधी अंशदान आणि नियोक्त्याने वेळोवेळी ठरविलेले इतर लाभ.</li>
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

        {/* मजकूर */}
        <div style={{ position: "relative", zIndex: 1 }}>

          <div className="divider-page"></div>

          {/* ══ ४. कामाचे तास ══ */}
          <div className="section-heading">४. कामाचे तास</div>
          <div className="body-text">
            कर्मचाऱ्याचे मानक कामाचे तास{' '}
            <span className="underline-blank">{data.employment?.workingHours || 'सकाळी ९:०० ते सायंकाळी ६:०० वा.'}</span>,{' '}
            {data.employment?.workingDays || 'सोमवार ते शुक्रवार'} असतील, ज्यात{' '}
            <span className="underline-blank">{data.employment?.lunchBreak || '१ (एक) तास'}</span>{' '}
            दुपारच्या जेवणाची सुट्टी असेल. पदाची कर्तव्ये पार पाडण्यासाठी आवश्यकतेनुसार कर्मचाऱ्याला अतिरिक्त तास काम करावे लागू शकते.
          </div>

          {/* ══ ५. गोपनीयता ══ */}
          <div className="section-heading">५. गोपनीयता</div>
          <div className="body-text">
            कर्मचारी मान्य करतो की रोजगाराच्या कालावधीत, त्याला नियोक्त्याच्या गोपनीय व मालकीच्या माहितीचा प्रवेश असेल, ज्यात ग्राहक यादी, मालमत्ता सूची, आर्थिक डेटा, विपणन धोरणे आणि व्यवसाय योजनांचा समावेश आहे परंतु त्यात मर्यादित नाही. कर्मचारी अशी सर्व माहिती पूर्णपणे गोपनीय ठेवण्यास आणि रोजगाराच्या कालावधीत व नंतर नियोक्त्याच्या लाभाशिवाय इतर कोणत्याही उद्देशासाठी तिसऱ्या पक्षाला उघड न करण्यास किंवा वापर न करण्यास सहमत आहे.
          </div>

          {/* ══ ६. अ-स्पर्धा ══ */}
          <div className="section-heading">६. अ-स्पर्धा</div>
          <div className="body-text">
            रोजगाराच्या कालावधीत आणि कोणत्याही कारणास्तव रोजगार संपुष्टात आल्यानंतर{' '}
            <span className="underline-blank">{convertToMarathi(data.employment?.nonCompetePeriod || '६ (सहा) महिने')}</span>{' '}
            कालावधीसाठी, कर्मचारी नियोक्त्याच्या प्राथमिक व्यवसाय स्थानाच्या{' '}
            <span className="underline-blank">{convertToMarathi(data.employment?.nonCompeteRadius || '२५ कि.मी.')}</span>{' '}
            त्रिज्येत नियोक्त्याच्या स्थावर मालमत्ता व्यवसायाशी स्पर्धा करणाऱ्या कोणत्याही व्यवसायात किंवा उपक्रमात प्रत्यक्ष किंवा अप्रत्यक्षपणे सहभागी होणार नाही.
          </div>

          {/* ══ ७. रोजगार समाप्ती ══ */}
          <div className="section-heading">७. रोजगार समाप्ती</div>

          <div className="sub-heading">नियोक्त्याद्वारे समाप्ती</div>
          <div className="body-text">नियोक्ता खालीलपैकी कोणत्याही कारणासाठी कर्मचाऱ्याचा रोजगार संपुष्टात आणू शकतो:</div>
          <ul className="termination-list">
            <li>
              <strong>कारणासह:</strong> तत्काळ, कारणांमध्ये सकल गैरवर्तन, अवज्ञा, गोपनीयतेचे उल्लंघन, फसवणूक किंवा या कराराचा महत्त्वपूर्ण भंग यांचा समावेश आहे परंतु मर्यादित नाही.
            </li>
            <li>
              <strong>कारणाशिवाय:</strong>{' '}
              <span className="underline-blank">{convertToMarathi(data.employment?.noticePeriodEmployer || '३० (तीस) दिवस')}</span>{' '}
              लेखी नोटीस किंवा नोटीसऐवजी देय रक्कम देऊन.
            </li>
          </ul>

          <div className="sub-heading">कर्मचाऱ्याद्वारे समाप्ती</div>
          <div className="body-text">
            कर्मचारी नियोक्त्याला{' '}
            <span className="underline-blank">{convertToMarathi(data.employment?.noticePeriodEmployee || '३० (तीस) दिवस')}</span>{' '}
            लेखी नोटीस देऊन आपला रोजगार संपुष्टात आणू शकतो. समाप्तीवर, कर्मचारी तत्काळ सर्व कंपनी मालमत्ता, दस्तऐवज, नोंदी, प्रवेश क्रेडेन्शियल आणि नियोक्त्याशी संबंधित इतर कोणतीही मालमत्ता परत करेल.
          </div>

          {/* ══ ८. शासक कायदा आणि न्यायक्षेत्र ══ */}
          <div className="section-heading">८. शासक कायदा आणि न्यायक्षेत्र</div>
          <div className="body-text">
            हा करार भारताच्या कायद्यांनुसार शासित व अर्थान्वित केला जाईल.
            या करारातून उद्भवणाऱ्या किंवा संबंधित कोणत्याही वादावर{' '}
            <span className="underline-blank">{data.employment?.jurisdiction || data.company?.companyDistrict || ''}</span>{' '}
            येथील न्यायालयांचे अनन्य न्यायक्षेत्र असेल.
          </div>

          {/* ══ ९. संपूर्ण करार ══ */}
          <div className="section-heading">९. संपूर्ण करार</div>
          <div className="body-text">
            हा करार रोजगाराच्या अटींच्या संदर्भात नियोक्ता आणि कर्मचारी यांच्यातील संपूर्ण करार घटित करतो आणि सर्व पूर्वीच्या चर्चा, वाटाघाटी व करार, लेखी असोत वा तोंडी, यांना अधिक्रमित करतो.
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

        {/* मजकूर */}
        <div style={{ position: "relative", zIndex: 1 }}>

          <div className="divider-page"></div>

          {/* ══ १०. दुरुस्त्या ══ */}
          <div className="section-heading">१०. दुरुस्त्या</div>
          <div className="body-text">
            या करारात कोणतीही दुरुस्ती किंवा बदल लेखी स्वरूपात असणे आवश्यक आहे आणि नियोक्ता तसेच कर्मचारी दोघांनीही त्यावर सही केलेली असणे आवश्यक आहे.
          </div>

          {/* ══ ११. विभाज्यता ══ */}
          <div className="section-heading">११. विभाज्यता</div>
          <div className="body-text">
            या कराराची कोणतीही तरतूद अवैध किंवा अप्रवर्तनीय ठरविली गेल्यास, उर्वरित तरतुदी कायद्याने परवानगी दिलेल्या कमाल मर्यादेपर्यंत वैध व प्रवर्तनीय राहतील.
          </div>

          {/* ══ सह्या ══ */}
          <div className="sig-grid">

            {/* नियोक्त्याची सही */}
            <div className="sig-block">
              <div className="sig-block-title">नियोक्त्याची सही</div>
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
                {convertToMarathi(data.company?.companyName || '')}{data.company?.entityType ? ` (${data.company.entityType})` : ''} वतीने
              </div>
            </div>

            {/* कर्मचाऱ्याची सही */}
            <div className="sig-block">
              <div className="sig-block-title">कर्मचाऱ्याची सही</div>
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

export default MarathiOfficeSupervisorAgreement;