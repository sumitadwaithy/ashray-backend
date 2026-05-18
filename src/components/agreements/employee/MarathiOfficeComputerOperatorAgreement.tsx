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

const MarathiOfficeComputerOperatorAgreement = ({ data, companyLogo, companyWatermark }: TemplateProps) => {

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

  const defaultDuties = [
    "कार्यालय संगणक, प्रिंटर, स्कॅनर आणि सर्व परिघीय उपकरणांचे चालवणे आणि देखभाल.",
    "कंपनीच्या रिअल इस्टेट मॅनेजमेंट सॉफ्टवेअरमध्ये मालमत्ता डेटा, ग्राहक रेकॉर्ड आणि व्यवहार तपशील एंट्री करणे, अद्यतनित करणे आणि सत्यापित करणे.",
    "वर्ड प्रोसेसिंग आणि स्प्रेडशीट सॉफ्टवेअर वापरून कायदेशीर कागदपत्रे, विक्री पत्रके, करार, एनओसी आणि पत्रव्यवहार तयार करणे आणि फॉरमॅटिंग करणे.",
    "योग्य अनुक्रमणिका आणि आवृत्ती नियंत्रणासह डिजिटल फाइलिंग सिस्टीम, मालमत्ता डेटाबेस आणि कागदपत्र साठा व्यवस्थापित करणे आणि देखभाल करणे.",
    "आवश्यकतेनुसार एमआयएस अहवाल, मालमत्ता याद्या, इन्व्हेंट्री सारांश आणि मॅनेजमेंट डॅशबोर्ड तयार करणे आणि वितरित करणे.",
    "भौतिक कागदपत्रांचे कंपनीच्या कागदपत्र व्यवस्थापन प्रणालीत स्कॅनिंग, डिजिटायझेशन आणि संग्रहण.",
    "मालमत्ता लाँच आणि ग्राहक बैठकीसाठी सादरीकरणे, ब्रोशर्स आणि विपणन साहित्य तयार करण्यास सहाय्य करणे.",
    "डिजिटल सिस्टीमवर संग्रहित सर्व कंपनी आणि ग्राहक माहितीसाठी डेटा सुरक्षा, नियमित सिस्टीम बॅकअप आणि कठोर गुप्तता सुनिश्चित करणे.",
    "कार्यालय सिस्टीमच्या देखभाल, समस्या निवारण आणि श्रेणीवाढीसाठी सॉफ्टवेअर विक्रेते आणि आयटी सपोर्टसोबत समन्वय साधणे.",
    "वेळोवेळी व्यवस्थापनाद्वारे दिलेली इतर संगणक संबंधित आणि प्रशासकीय कर्तव्ये पार पाडणे.",
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
          font-family: 'Times New Roman', 'Georgia', 'Mangal', 'Kokila', 'Shree-Dev-0714', serif;
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
          font-family: 'Times New Roman', 'Mangal', 'Kokila', 'Shree-Dev-0714', serif;
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
        .a4-gap {
          height: 40px;
        }
        @media print {
          .a4-gap { display: none; }
          .compliance-box { background: #f5f5f5 !important; }
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

          {/* TITLE */}
          <div className="agreement-title">नोकरीचा करार</div>
          <div className="agreement-subtitle">(कार्यालय संगणक चालक)</div>

          {/* PREAMBLE */}
          <div className="body-text">
            हा नोकरीचा करार <strong>("करार")</strong> दिनांक{' '}
            <span className="underline-blank">{formatMarathiDate(data.employment?.joiningDate)}</span> रोजी खालील पक्षांमध्ये निष्पन्न झाला आहे:
          </div>

          {/* EMPLOYER */}
          <div className="party-block">
            <div className="party-name">{employerFullName}</div>
            <div><strong>नोंदणीकृत पत्ता:</strong> {employerAddress}</div>
            <div><strong>सीआयएन:</strong> {data.company?.cinNumber || <span className="underline-blank" style={{ minWidth: '160px' }} />}</div>
            <div><strong>पॅन:</strong> {data.company?.companyPan || <span className="underline-blank" style={{ minWidth: '120px' }} />}</div>
            <div style={{ fontStyle: 'italic' }}>
              (कंपन्यांच्या अधिनियम, 2013 अंतर्गत निगमित एक कंपनी, जिला येथे <strong>"कंपनी"</strong> किंवा <strong>"नियोक्ता"</strong> म्हणून संबोधले जाईल)
            </div>
          </div>

          <div className="and-divider">आणि</div>

          {/* EMPLOYEE */}
          <div className="party-block">
            <div className="party-name">{employeeFullName}</div>
            <div><strong>पत्ता:</strong> {employeeAddress}</div>
            <div><strong>जन्मतारीख:</strong> {data.employee?.dob ? formatMarathiDate(data.employee.dob) : <span className="underline-blank" style={{ minWidth: '100px' }} />}</div>
            <div>
              <strong>आधार क्र.:</strong> {formatAadhaarMarathi(data.employee?.aadhaar) || <span className="underline-blank" style={{ minWidth: '120px' }} />}
              &emsp;
              <strong>पॅन क्र.:</strong> {data.employee?.pan || <span className="underline-blank" style={{ minWidth: '100px' }} />}
            </div>
            <div style={{ fontStyle: 'italic' }}>(ज्याला येथे <strong>"कर्मचारी"</strong> म्हणून संबोधले जाईल)</div>
          </div>

          {/* 1. POSITION AND DUTIES */}
          <div className="section-heading">1. पद आणि कर्तव्ये</div>
          <div className="body-text">
            कंपनी या कराराद्वारे कर्मचाऱ्याला <strong>कार्यालय संगणक चालक</strong> या पदावर नियुक्त करते
            {data.employment?.department ? ` ${convertToMarathi(data.employment.department)} विभागात` : ''}. कर्मचारी{' '}
            <span className="underline-blank">{convertToMarathi(data.employment?.reportingTo || '')}</span>{' '}
            यांना रिपोर्ट करेल आणि रिअल इस्टेट प्रायव्हेट लिमिटेड कंपनीमध्ये या पदाशी संबंधित सर्व कर्तव्ये आणि जबाबदाऱ्या निष्ठेने पार पाडेल, ज्यामध्ये खालील गोष्टी समाविष्ट आहेत परंतु त्यापुरत्या मर्यादित नाहीत:
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
          PAGE 2
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
            alignItems: "center",
            justifyContent: "center",
            opacity: 0.08,
            zIndex: 0,
            pointerEvents: "none",
          }}
        >
          <img
            src={companyWatermark || companyLogo || ''}
            style={{ width: "70%", maxWidth: "720px", height: "auto", objectFit: "contain" }}
          />
        </div>

        <div className="divider-page"></div>

        {/* CONTENT */}
        <div style={{ position: "relative", zIndex: 1 }}>

          {/* 2. COMMENCEMENT & PROBATION */}
          <div className="section-heading">2. प्रारंभ आणि परिवीक्षा</div>
          <div className="body-text">
            कर्मचाऱ्याची नोकरी{' '}
            <span className="underline-blank">{formatMarathiDate(data.employment?.joiningDate)}</span> रोजी प्रारंभ होईल.
            कर्मचाऱ्याला रुजू होण्याच्या तारखेपासून{' '}
            <strong>{data.employment?.probationPeriod || '3 (तीन) महिने'}</strong> ची परिवीक्षा कालावधीवर ठेवले जाईल,
            ज्या दरम्यान कोणत्याही पक्षाला कोणत्याही कारणाशिवाय किंवा पूर्वसूचनेशिवाय हा करार समाप्त करता येईल.
            परिवीक्षा कालावधीच्या समाधानकारक पूर्णतेनंतर, कंपनीच्या मानव संसाधन धोरणानुसार कंपनीच्या कोणत्याही अधिकृत अधिकाऱ्याद्वारे नोकरीची लेखी पुष्टी केली जाईल.
          </div>

          {/* 3. COMPENSATION */}
          <div className="section-heading">3. मोबदला</div>

          <div className="sub-heading">वेतन</div>
          <div className="body-text">
            कंपनी कर्मचाऱ्याला ₹{' '}
            <span className="underline-blank">{convertNumberToMarathi(data.employment?.grossAnnualSalary || '')}</span>
            /- (रुपये{' '}
            <span className="underline-blank" style={{ minWidth: '160px' }}>
              {convertToMarathi(data.employment?.grossAnnualSalaryWords || '')}
            </span>{' '}
            फक्त) चे एकूण वार्षिक वेतन देईल,
            जे ₹{' '}
            <span className="underline-blank">{convertNumberToMarathi(data.employment?.grossMonthlySalary || '')}</span>
            /- (रुपये{' '}
            <span className="underline-blank" style={{ minWidth: '140px' }}>
              {convertToMarathi(data.employment?.grossMonthlySalaryWords || '')}
            </span>{' '}
            फक्त) च्या समान मासिक एकूण वेतनासाठी आहे,
            जे पुढील महिन्याच्या 7 तारखेपर्यंत किंवा त्यापूर्वी समान मासिक हप्त्यांमध्ये देय असेल, भारतीय कायद्यानुसार लागू कपाती, आयकर अधिनियम, 1961 नुसार टीडीएस आणि वैधानिक कपातींच्या अधीन राहील.
          </div>

          <div className="sub-heading">वैधानिक लाभ</div>
          <div className="body-text">
            भारतीय कामगार कायद्याने प्रायव्हेट लिमिटेड कंपन्यांवर लागू अनिवार्य आवश्यकतांनुसार, कर्मचाऱ्याला खालील वैधानिक लाभांचा हक्क असेल:
          </div>

          <div style={{ fontWeight: 700, fontSize: '13px', marginTop: '5px', marginBottom: '2px' }}>
            अनिवार्य वैधानिक लाभ
          </div>
          <ul className="benefits-list">
            <li><strong>कर्मचारी भविष्य निधी (ईपीएफ) — ईपीएफ आणि एमपी अधिनियम, 1952:</strong> नियोक्ता आणि कर्मचारी दोघांनीही मूळ वेतनाचे 12-12% योगदान करावे लागेल. कंपनीद्वारे 20 किंवा अधिक व्यक्ती नियोजित केल्यावर लागू.</li>
            <li><strong>कर्मचारी राज्य विमा (ईएसआय) — ईएसआय अधिनियम, 1948:</strong> कर्मचाऱ्याचे एकूण मजुरी ₹21,000/- प्रति महिना किंवा त्यापेक्षा कमी असल्यास आणि प्रतिष्ठानाद्वारे 10 किंवा अधिक व्यक्ती (काही राज्यांमध्ये 20) नियोजित केल्यास लागू.</li>
            <li><strong>उपकारी धन — उपकारी धन भुगतान अधिनियम, 1972:</strong> सलग सेवेचे 5 (पाच) वर्षे पूर्ण झाल्यावर प्रत्येक पूर्ण वर्षाच्या सेवेसाठी 15 दिवसांच्या वेतनाच्या दराने देय.</li>
            <li>
              <strong>रजा हक्क — दुकाने आणि प्रतिष्ठान अधिनियम (राज्य):</strong> वार्षिक / अर्जित रजा ({convertNumberToMarathi(data.employment?.annualLeaves || '12')} दिवस),
              आजारी / वैद्यकीय रजा ({convertNumberToMarathi(data.employment?.medicalLeaves || '6')} दिवस), आणि आकस्मिक रजा ({convertNumberToMarathi(data.employment?.casualLeaves || '6')} दिवस) प्रति कॅलेंडर वर्ष.
            </li>
            <li><strong>प्रसूती लाभ — प्रसूती लाभ अधिनियम, 1961:</strong> पात्र महिला कर्मचाऱ्यांना 26 आठवड्यांचा पगारयुक्त प्रसूती रजा (2 जिवंत मुलांपर्यंत); पुढील गर्भधारणांसाठी 12 आठवडे.</li>
            <li><strong>बोनस — बोनस भुगतान अधिनियम, 1965:</strong> जर कंपनीचे वार्षिक उलाळाले अधिनियमानुसार पात्र असेल तर; किमान बोनस वार्षिक मजुरीचा 8.33% किंवा ₹100/- प्रति महिना, जे जास्त असेल ते.</li>
          </ul>

          <div style={{ fontWeight: 700, fontSize: '13px', marginTop: '5px', marginBottom: '2px' }}>
            स्वैच्छिक / स्पर्धात्मक लाभ
          </div>
          <ul className="benefits-list">
            <li><strong>समूह आरोग्य विमा:</strong> कंपनी धोरणानुसार व्यापक वैद्यकीय कव्हरेज.</li>
            <li><strong>कामगिरी प्रोत्साहन:</strong> व्यवस्थापन / संचालक मंडळाच्या विवेकबुद्धीनुसार कामगिरी आधारित बोनस आणि वार्षिक वेतन वाढ.</li>
            <li><strong>व्यावसायिक विकास:</strong> रिअल इस्टेट सॉफ्टवेअर, एमएस ऑफिस, टॅली आणि कागदपत्र व्यवस्थापन प्रणालींमध्ये प्रशिक्षण.</li>
            <li><strong>लवचिक काम:</strong> व्यवस्थापनाच्या मान्यतेवर आणि परिचालन आवश्यकतांच्या अधीन.</li>
          </ul>

          <div style={{ fontWeight: 700, fontSize: '13px', marginTop: '5px', marginBottom: '2px' }}>
            पर्यायी लाभ
          </div>
          <ul className="benefits-list">
            <li>कल्याण कार्यक्रम: जिम सदस्यत्व, मानसिक कल्याण सहाय्य.</li>
            <li>अतिरिक्त रजा: पितृत्व रजा, शोक रजा कंपनी धोरणानुसार.</li>
            <li>सहाय्य: मुलांची देखभाल सहाय्य, स्थलांतरण सहाय्य जसे लागू असेल.</li>
            <li>भविष्य निधी योगदान आणि कंपनीद्वारे वेळोवेळी निश्चित केलेले इतर लाभ.</li>
          </ul>

        </div>
        <PrintFooter />
      </div>

      <div className="a4-gap" />

      {/* ══════════════════════════════════════════
          PAGE 3
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
            alignItems: "center",
            justifyContent: "center",
            opacity: 0.08,
            zIndex: 0,
            pointerEvents: "none",
          }}
        >
          <img
            src={companyWatermark || companyLogo || ''}
            style={{ width: "70%", maxWidth: "720px", height: "auto", objectFit: "contain" }}
          />
        </div>

        {/* CONTENT */}
        <div style={{ position: "relative", zIndex: 1 }}>

          <div className="divider-page"></div>

          {/* 4. WORKING HOURS */}
          <div className="section-heading">4. कामाचे तास</div>
          <div className="body-text">
            कर्मचाऱ्याचे मानक कामाचे तास{' '}
            <span className="underline-blank">{data.employment?.workingHours || 'सकाळी 9:00 ते संध्याकाळी 6:00'}</span>,{' '}
            {data.employment?.workingDays || 'सोमवार ते शनिवार'} असतील, ज्यामध्ये{' '}
            <span className="underline-blank">{data.employment?.lunchBreak || '1 (एक) तास'}</span>{' '}
            चा जेवणाचा ब्रेक समाविष्ट आहे, लागू राज्य दुकाने आणि प्रतिष्ठान अधिनियमानुसार. कर्मचाऱ्याला परिचालन मुदतीची पूर्तता करण्यासाठी अतिरिक्त तास काम करण्याची आवश्यकता असू शकते; कोणत्याही ओव्हरटाइम मोबदल्याचे नियमन लागू कायद्याने केले जाईल.
          </div>

          {/* 5. INTELLECTUAL PROPERTY & DATA OWNERSHIP */}
          <div className="section-heading">5. बौद्धिक संपदा आणि डेटा मालकी</div>
          <div className="body-text">
            नोकरीच्या कालावधीत कर्मचाऱ्याने तयार केलेले सर्व काम उत्पादन, डेटा एन्ट्रीज, डेटाबेस, सॉफ्टवेअर कॉन्फिगरेशन्स, डिजिटल फाइल्स, अहवाल आणि कागदपत्रे कंपनीची एकमेव आणि अनन्य बौद्धिक संपदा असतील. कर्मचाऱ्याचा अशा कोणत्याही काम उत्पादनावर कोणताही दावा, हक्क किंवा हित, वैयक्तिक, आर्थिक किंवा इतर, असणार नाही. नोकरी समाप्तीच्या वेळी, कर्मचारी तात्काळ सर्व कंपनीची उपकरणे, सॉफ्टवेअर लायसन्स, अ‍ॅक्सेस टोकन आणि कोणत्याही डेटा-वाहक माध्यम कोणतीही प्रत ठेवून न वापस करील.
          </div>

          {/* 6. CONFIDENTIALITY */}
          <div className="section-heading">6. गुप्तता आणि डेटा संरक्षण</div>
          <div className="body-text">
            कर्मचारी मान्य करतो/करते की नोकरीच्या कालावधीत, त्याला/तिला कंपनीच्या संवेदनशील आणि गुप्त माहितीची पहुंच असेल, ज्यामध्ये पण मर्यादित नाही ग्राहक वैयक्तिक डेटा, खरेदीदार/विक्रेत्यांचे आधार आणि पॅन तपशील, मालमत्ता व्यवहार रेकॉर्ड, किंमत निर्धारण धोरणे, आर्थिक डेटा, आंतरिक सॉफ्टवेअर सिस्टीम आणि व्यवसाय योजना. कर्मचारी खालील गोष्टींसाठी सहमत आहे:
          </div>
          <ul className="clause-list">
            <li>नोकरीच्या कालावधीत आणि नंतर सर्व अशा माहितीचे कठोर गुप्तता राखणे;</li>
            <li>कंपनीच्या पूर्व लिखित अनुमतीशिवाय कोणत्याही तिसऱ्या पक्षाला अशा कोणत्याही माहितीचे प्रकटीकरण, सामायिकरण, कॉपी किंवा संप्रेषण न करणे;</li>
            <li>डिजिटल वैयक्तिक डेटा संरक्षण अधिनियम, 2023 (डीपीडीपीए) आणि लागू आयटी नियमांसहित सर्व लागू डेटा संरक्षण दायित्वांचे पालन करणे;</li>
            <li>दिलेल्या कर्तव्यांच्या व्याप्तीपेक्षा अधिक कोणत्याही कंपनी डेटामध्ये प्रवेश, बदल किंवा हटवणे न करणे.</li>
          </ul>
          <div className="body-text">
            या कलमाच्या कोणत्याही उल्लंघनामुळे कर्मचारी अनुशासनात्मक कारवाई, समाप्ती आणि भारतीय कायद्यानुसार लागू असलेल्या नागरिक किंवा फौजदारी कारवाईसाठी जबाबदार ठरेल.
          </div>

          {/* 7. NON-COMPETITION */}
          <div className="section-heading">7. गैर-स्पर्धा आणि गैर-आकर्षण</div>
          <div className="body-text">
            नोकरीच्या कालावधीत आणि कोणत्याही कारणास्तव नोकरी समाप्तीच्या{' '}
            <span className="underline-blank">{convertToMarathi(data.employment?.nonCompetePeriod || '६ (सहा) महिने')}</span>{' '}
            नंतर, कर्मचारी खालील गोष्टी करणार नाही:
          </div>
          <ul className="clause-list">
            <li>कंपनीच्या प्राथमिक व्यवसाय स्थळापासून{' '}
              <span className="underline-blank">{data.employment?.nonCompeteRadius || '25 किमी'}</span>{' '}
              च्या त्रिज्येत कंपनीच्या रिअल इस्टेट परिचालनाशी स्पर्धा करणाऱ्या कोणत्याही व्यवसायात थेट किंवा अप्रत्यक्षपणे संलग्न, नियोजित किंवा सेवा देणे नाही;</li>
            <li>कोणत्याही स्पर्धात्मक उद्देशासाठी कंपनीच्या कोणत्याही ग्राहक, ग्राहक किंवा व्यवसाय सहयोगीला आकर्षित, संपर्क किंवा लुभवणे नाही;</li>
            <li>कंपनीच्या कोणत्याही कर्मचाऱ्याला त्यांच्या नोकरीतून बाहेर पडण्यास प्रोत्साहित किंवा प्रयत्न करणे नाही.</li>
          </ul>

          {/* 8. TERMINATION */}
          <div className="section-heading">8. नोकरीची समाप्ती</div>

          <div className="sub-heading">कंपनीद्वारे समाप्ती</div>
          <div className="body-text">कंपनी खालील परिस्थितींमध्ये हा करार समाप्त करू शकते:</div>
          <ul className="termination-list">
            <li>
              <strong>कारणासह (सारांश बडतर्फी):</strong> गंभीर दुर्वर्तन, बेईमानी, चोरी, कंपनी डेटा किंवा सिस्टीमचा अनधिकृत प्रवेश किंवा दुरुपयोग, आज्ञाधारकता नसणे, फसवणूक, किंवा या कराराचा किंवा कंपनी धोरणांचा भौतिक उल्लंघन यासह कारणांसाठी तात्काळ आणि सूचनेशिवाय.
            </li>
            <li>
              <strong>कारणाशिवाय:</strong>{' '}
              <span className="underline-blank">{data.employment?.noticePeriodEmployer || '30 (तीस) दिवसांची'}</span>{' '}
              लिखित सूचना किंवा अशा सूचनेच्या बदल्यात पगाराचे भुगतान करून, जर लागू असेल तर औद्योगिक विवाद अधिनियम, 1947 च्या लागू तरतुदींच्या अधीन.
            </li>
          </ul>

          <div className="sub-heading">कर्मचाऱ्याद्वारे समाप्ती</div>
          <div className="body-text">
            कर्मचारी{' '}
            <span className="underline-blank">{data.employment?.noticePeriodEmployee || '30 (तीस) दिवसांची'}</span>{' '}
            लिखित सूचना देऊन कंपनीला राजीनामा देऊ शकतो/शकते. नोकरी समाप्तीच्या वेळी, कर्मचारी: (i) तात्काळ सर्व कंपनी मालमत्ता, उपकरणे, सॉफ्टवेअर, अ‍ॅक्सेस क्रेडेंशियल्स आणि कागदपत्रे सोपवेल; (ii) सर्व प्रलंबित कामाचा औपचारिक हस्तांतरण पूर्ण करील; आणि (iii) अंतिम निपटारा प्रक्रिया होण्यापूर्वी एक नो-ड्यूज प्रमाणपत्रावर स्वाक्षरी करील.
          </div>

          {/* 9. GOVERNING LAW */}
          <div className="section-heading">9. शासकीय कायदा आणि क्षेत्राधिकार</div>
          <div className="body-text">
            या कराराचे निर्माण आणि व्याख्या भारताच्या कायद्यांनुसार केली जाईल, ज्यामध्ये कंपन्यांचा अधिनियम, 2013, करार अधिनियम, 1872 आणि लागू कामगार कायदे समाविष्ट आहेत. या करारातून उद्भवलेले किंवा संबंधित कोणतेही वाद{' '}
            <span className="underline-blank">{data.employment?.jurisdiction || data.company?.companyDistrict || ''}</span>{' '}
            च्या न्यायालयांच्या अनन्य क्षेत्राधिकाराच्या अधीन असतील.
          </div>

          {/* 9B. ENTIRE AGREEMENT */}
          <div className="section-heading">10. संपूर्ण करार</div>
          <div className="body-text">
            हा करार कंपनी आणि कर्मचाऱ्यांमध्ये नोकरीच्या अटींबद्दल संपूर्ण करार आहे आणि सर्व मागील चर्चा, बातचीत आणि करार, लेखी किंवा तोंडी, यांना प्रतिस्थापित करतो. यात समाविष्ट नसलेले कोणतेही प्रतिनिधित्व कायदेशीर परिणाम धरणार नाही.
          </div>

        </div>
        <PrintFooter />
      </div>

      <div className="a4-gap" />

      {/* ══════════════════════════════════════════
          PAGE 4
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
            alignItems: "center",
            justifyContent: "center",
            opacity: 0.08,
            zIndex: 0,
            pointerEvents: "none",
          }}
        >
          <img
            src={companyWatermark || companyLogo || ''}
            style={{ width: "70%", maxWidth: "720px", height: "auto", objectFit: "contain" }}
          />
        </div>

        {/* CONTENT */}
        <div style={{ position: "relative", zIndex: 1 }}>

          <div className="divider-page"></div>

          {/* 11. AMENDMENTS */}
          <div className="section-heading">11. सुधारणा</div>
          <div className="body-text">
            या करारातील कोणत्याही सुधारणा किंवा बदल केवळ लिखित स्वरूपात केल्यास आणि कंपनीच्या अधिकृत प्रतिनिधी आणि कर्मचाऱ्याद्वारे योग्यरित्या स्वाक्षरी केल्यास वैध ठरेल. कोणत्याही तोंडी सुधारणा कोणत्याही पक्षासाठी बाध्यकारक ठरणार नाहीत.
          </div>

          {/* 12. SEVERABILITY */}
          <div className="section-heading">12. पृथक्करण</div>
          <div className="body-text">
            जर या कराराचा कोणताही तरतुद लागू कायद्यानुसार अवैध, रद्द किंवा अंमलात आणता येण्याजोगा आढळला, तर अशी तरतुद या करारापासून वेगळी मानली जाईल, आणि उर्वरित तरतुदी पूर्ण बल आणि प्रभावात सुरू राहतील.
          </div>

          {/* 13. COMPLIANCE DECLARATION */}
          <div className="section-heading">13. वैधानिक अनुपालन घोषणा</div>
          <div className="body-text">
            दोन्ही पक्ष मान्य करतात की हा करार सर्व लागू केंद्रीय आणि राज्य कायद्यांच्या अधीन आहे आणि त्यांच्या अनुरूप व्याख्या केला जाईल, ज्यामध्ये खालील गोष्टी समाविष्ट आहेत पण त्यापुरत्या मर्यादित नाहीत:
          </div>
          <div className="compliance-box">
            <strong>लागू कायदे:</strong> कंपन्यांचा अधिनियम, 2013 &nbsp;|&nbsp; करार अधिनियम, 1872 &nbsp;|&nbsp; औद्योगिक विवाद अधिनियम, 1947 &nbsp;|&nbsp; ईपीएफ आणि एमपी अधिनियम, 1952 &nbsp;|&nbsp; ईएसआय अधिनियम, 1948 &nbsp;|&nbsp; उपकारी धन भुगतान अधिनियम, 1972 &nbsp;|&nbsp; बोनस भुगतान अधिनियम, 1965 &nbsp;|&nbsp; प्रसूती लाभ अधिनियम, 1961 &nbsp;|&nbsp; किमान मजुरी अधिनियम, 1948 &nbsp;|&nbsp; मजुरी भुगतान अधिनियम, 1936 &nbsp;|&nbsp; आयटी अधिनियम, 2000 &nbsp;|&nbsp; डिजिटल वैयक्तिक डेटा संरक्षण अधिनियम, 2023 &nbsp;|&nbsp; राज्य दुकाने आणि प्रतिष्ठान अधिनियम (महाराष्ट्र)
          </div>
          <div className="body-text" style={{ marginTop: '4px' }}>
            या कराराच्या अटी आणि कोणत्याही लागू अधिनियमाच्या तरतुदींमध्ये कोणताही विरोध असल्यास, अधिनियम प्रबळ राहील.
          </div>

          {/* SIGNATURES */}
          <div className="sig-grid">

            {/* COMPANY SIGNATURE */}
            <div className="sig-block">
              <div className="sig-block-title">कंपनीच्या वतीने आणि कंपनीसाठी</div>
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
                <strong>पदनाम:</strong>
                <span className="underline-blank" style={{ minWidth: '110px' }}>
                  {data.manager?.managerPosition || data.company?.managerPosition || data.company?.hrDesignation}
                </span>
              </div>
              <div className="sig-field-row">
                <strong>डीआयएन / पॅन:</strong>
                <span className="underline-blank" style={{ minWidth: '110px' }}>
                  {data.company?.managerPAN || data.manager?.managerPAN || ''}
                </span>
              </div>
              <div style={{ marginTop: '6px', fontSize: '12px', fontStyle: 'italic' }}>
                अधिकृत हस्ताक्षरकर्ता — {convertToMarathi(data.company?.companyName || '')}{data.company?.entityType ? ` (${data.company.entityType})` : ''}
              </div>
            </div>

            {/* EMPLOYEE SIGNATURE */}
            <div className="sig-block">
              <div className="sig-block-title">कर्मचाऱ्याची स्वीकृती</div>
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
              <div className="sig-field-row">
                <strong>आधार क्र.:</strong>
                <span className="underline-blank" style={{ minWidth: '110px' }}>
                  {formatAadhaarMarathi(data.employee?.aadhaar) || ''}
                </span>
              </div>
              <div style={{ marginTop: '14px', fontSize: '12.5px', fontWeight: 700 }}>
                डाव्या हाताचा अंगठा छाप:-
              </div>
              <div style={{
                border: '1px solid #000',
                minHeight: '77px',
                marginTop: '4px',
                width: '130px',
              }} />
            </div>

          </div>

          {/* WITNESS */}
          <div style={{ marginTop: '24px', borderTop: '1.5px solid #000', paddingTop: '10px' }}>
            <div style={{ fontWeight: 700, fontSize: '13px', marginBottom: '8px' }}>साक्षीदार</div>
            <div style={{ display: 'flex', gap: '40px' }}>
              <div style={{ flex: 1, fontSize: '13px', lineHeight: 1.8 }}>
                <div><strong>1.</strong> नाव: <span className="underline-blank" style={{ minWidth: '140px' }} /></div>
                <div style={{ marginTop: '4px' }}>साक्ष: <span className="underline-blank" style={{ minWidth: '120px' }} /></div>
              </div>
              <div style={{ flex: 1, fontSize: '13px', lineHeight: 1.8 }}>
                <div><strong>2.</strong> नाव: <span className="underline-blank" style={{ minWidth: '140px' }} /></div>
                <div style={{ marginTop: '4px' }}>साक्ष: <span className="underline-blank" style={{ minWidth: '120px' }} /></div>
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

export default MarathiOfficeComputerOperatorAgreement;