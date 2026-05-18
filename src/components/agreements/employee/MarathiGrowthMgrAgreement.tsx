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

const MarathiDigitalGrowthManagerAgreement = ({ data, companyLogo, companyWatermark }: TemplateProps) => {

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

  // Default duties in Marathi for Digital Growth Manager
  const defaultDuties = [
    "कंपनीची ऑनलाइन दृश्यता, लीड जनरेशन आणि ब्रँड जागरूकता वाढविण्यासाठी सर्वसमावेशक डिजिटल मार्केटिंग धोरणे तयार करणे व त्यांची अंमलबजावणी करणे.",
    "कंपनीची वेबसाइट, गूगल बिझनेस प्रोफाइल, सोशल मीडिया (Instagram, Facebook, LinkedIn, YouTube) तसेच रिअल इस्टेट लिस्टिंग पोर्टलवरील उपस्थितीचे व्यवस्थापन व अनुकूलन करणे.",
    "रील्स, प्रॉपर्टी शोकेस व्हिडिओ, ब्लॉग पोस्ट, ई-मेलर आणि पेड जाहिरात क्रिएटिव्हसह कंपनीच्या ब्रँड ओळखीनुसार आकर्षक डिजिटल कंटेंटचे नियोजन, निर्मिती व प्रकाशन करणे.",
    "परफॉर्मन्स मार्केटिंग मोहिमा (Google Ads, Meta Ads, YouTube Ads) राबविणे व व्यवस्थापित करणे, KPI चे निरीक्षण करणे आणि गुंतवणुकीवरील कमाल परतावा (ROI) सुनिश्चित करण्यासाठी मोहिमांचे अनुकूलन करणे.",
    "कंपनीच्या डिजिटल मालमत्तांवर सेंद्रिय ट्रॅफिक व पात्र अभ्यागत वाढविण्यासाठी सर्च इंजिन ऑप्टिमायझेशन (SEO) आणि सर्च इंजिन मार्केटिंग (SEM) उपक्रम राबविणे.",
    "Google Analytics, Meta Business Suite आणि इतर संबंधित प्लॅटफॉर्मद्वारे डिजिटल मोहिमांच्या कार्यक्षमतेचे निरीक्षण, विश्लेषण व मासिक अहवाल व्यवस्थापनास सादर करणे.",
    "ऑनलाइन चौकशींचे वेळेत अनुसरण व रूपांतरण सुनिश्चित करण्यासाठी CRM एकत्रीकरण, लीड नर्चरिंग वर्कफ्लो आणि डिजिटल सेल्स फनेलचे व्यवस्थापन करणे.",
    "डिजिटल प्रयत्नांना विक्री उद्दिष्टे आणि प्रकल्प लॉन्च योजनांशी सुसंगत ठेवण्यासाठी विक्री संघ, चॅनेल पार्टनर्स आणि बाह्य एजन्सींशी समन्वय साधणे.",
    "रिअल इस्टेट क्षेत्रातील उदयोन्मुख डिजिटल मार्केटिंग ट्रेंड्स, स्पर्धकांच्या हालचाली आणि उद्योगातील सर्वोत्तम पद्धतींबाबत अद्ययावत राहणे व योग्य नावीन्यपूर्ण उपायांची शिफारस करणे.",
    "कंपनीच्या डिजिटल वाढीच्या उद्दिष्टांच्या पूर्ततेसाठी व्यवस्थापनाने वेळोवेळी सोपविलेल्या इतर कार्यांचे निर्वहन करणे.",
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
          <div className="agreement-title">रोजगार करार</div>
          <div className="agreement-subtitle">(डिजिटल ग्रोथ मॅनेजर)</div>

          {/* PREAMBLE */}
          <div className="body-text">
            हा रोजगार करार <strong>("करार")</strong> दिनांक{' '}
            <span className="underline-blank">{formatMarathiDate(data.employment?.joiningDate)}</span>{' '}
            रोजी खालील पक्षांमध्ये केला जातो:
          </div>

          {/* EMPLOYER */}
          <div className="party-block">
            <div className="party-name">{employerFullName}</div>
            <div><strong>पत्ता:</strong> {employerAddress}</div>
            <div><strong>CIN:</strong> {data.company?.cinNumber || ''}</div>
            <div><strong>PAN:</strong> {data.company?.companyPan || ''}</div>
            <div style={{ fontStyle: 'italic' }}>(यापुढे <strong>"नियोक्ता"</strong> अथवा <strong>"कंपनी"</strong> म्हणून संबोधण्यात येईल)</div>
          </div>

          <div className="and-divider">आणि</div>

          {/* EMPLOYEE */}
          <div className="party-block">
            <div className="party-name">{employeeFullName}</div>
            <div><strong>पत्ता:</strong> {employeeAddress}</div>
            <div><strong>जन्म दिनांक:</strong> {data.employee?.dob ? formatMarathiDate(data.employee.dob) : <span className="underline-blank" style={{ minWidth: '100px' }} />}</div>
            <div>
              <strong>आधार क्रमांक:</strong> {formatAadhaarMarathi(data.employee?.aadhaar) || <span className="underline-blank" style={{ minWidth: '120px' }} />}
              &emsp;
              <strong>PAN क्रमांक:</strong> {data.employee?.pan || <span className="underline-blank" style={{ minWidth: '100px' }} />}
            </div>
            <div style={{ fontStyle: 'italic' }}>(यापुढे <strong>"कर्मचारी"</strong> म्हणून संबोधण्यात येईल)</div>
          </div>

          {/* कलम १ — पद व कर्तव्ये */}
          <div className="section-heading">कलम १. पद व कर्तव्ये</div>
          <div className="body-text">
            नियोक्त्याद्वारे कर्मचाऱ्याची{' '}
            <strong>डिजिटल ग्रोथ मॅनेजर</strong>{' '}
            {data.employment?.department ? `(${data.employment.department} विभाग)` : '(डिजिटल मार्केटिंग व ग्रोथ विभाग)'}{' '}
            या पदावर नियुक्ती केली जाते. कर्मचारी{' '}
            <span className="underline-blank">{convertToMarathi(data.employment?.reportingTo || '')}</span>{' '}
            यांना अहवाल देईल आणि कंपनीची डिजिटल उपस्थिती, ऑनलाइन लीड जनरेशन व ब्रँड विकासासाठी जबाबदार असेल. कर्मचाऱ्याची कर्तव्ये व जबाबदाऱ्या खालीलप्रमाणे असतील, परंतु त्या केवळ यापुरत्याच मर्यादित राहणार नाहीत:
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

          {/* कलम २ — नियुक्तीचा प्रारंभ */}
          <div className="section-heading">कलम २. नियुक्तीचा प्रारंभ</div>
          <div className="body-text">
            कर्मचाऱ्याची नियुक्ती दिनांक{' '}
            <span className="underline-blank">{formatMarathiDate(data.employment?.joiningDate)}</span>{' '}
            पासून सुरू होईल. कर्मचाऱ्याला रुजू होण्याच्या तारखेपासून{' '}
            <strong>{data.employment?.probationPeriod || '३ (तीन) महिने'}</strong>{' '}
            परिवीक्षा कालावधीवर ठेवण्यात येईल, ज्या दरम्यान कोणताही पक्ष कारण अथवा पूर्वसूचनेशिवाय हा करार संपुष्टात आणू शकतो. परिवीक्षा कालावधी यशस्वीरीत्या पूर्ण झाल्यावर कंपनीच्या अधिकृत स्वाक्षरीकर्त्याद्वारे नियुक्तीची लेखी पुष्टी केली जाईल.
          </div>

          {/* कलम ३ — नियुक्तीचे ठिकाण */}
          <div className="section-heading">कलम ३. नियुक्तीचे ठिकाण</div>
          <div className="body-text">
            कर्मचाऱ्याच्या नियुक्तीचे प्राथमिक ठिकाण{' '}
            <span className="underline-blank" style={{ minWidth: '140px' }}>
              {data.employment?.placeOfPosting || data.company?.companyDistrict || ''}
            </span>{' '}
            असेल. नियोक्त्यास आवश्यकतेनुसार, पूर्वसूचना देऊन, कर्मचाऱ्याची कंपनीच्या कोणत्याही अन्य ठिकाणी, प्रकल्पस्थळी अथवा कार्यालयात बदली अथवा प्रतिनियुक्ती करण्याचा अधिकार राहील.
          </div>

          {/* कलम ४ — वेतन व परिलाभ */}
          <div className="section-heading">कलम ४. वेतन व परिलाभ</div>

          <div className="sub-heading">वेतन</div>
          <div className="body-text">
            नियोक्ता कर्मचाऱ्यास वार्षिक एकूण वेतन ₹{' '}
            <span className="underline-blank">{convertNumberToMarathi(data.employment?.grossAnnualSalary || '')}</span>/-{' '}
            (रुपये{' '}
            <span className="underline-blank" style={{ minWidth: '160px' }}>{convertToMarathi(data.employment?.grossAnnualSalaryWords || '')}</span>{' '}
            फक्त) अदा करेल, जे मासिक एकूण वेतन ₹{' '}
            <span className="underline-blank">{convertNumberToMarathi(data.employment?.grossMonthlySalary || '')}</span>/-{' '}
            (रुपये{' '}
            <span className="underline-blank" style={{ minWidth: '140px' }}>{convertToMarathi(data.employment?.grossMonthlySalaryWords || '')}</span>{' '}
            फक्त) एवढे होते. हे वेतन प्रत्येक महिन्याच्या ७ तारखेस अथवा त्यापूर्वी समान मासिक हप्त्यांमध्ये, आयकर अधिनियम, १९६१ आणि इतर लागू कायद्यांतर्गत विहित वजावटी व वैधानिक उद्ग्रहणांच्या अधीन राहून अदा केले जाईल.
          </div>

          <div className="sub-heading">कार्यप्रदर्शन-आधारित प्रोत्साहन</div>
          <div className="body-text">
            कर्मचारी व्यवस्थापनाने वेळोवेळी निर्धारित केलेल्या डिजिटल KPI चौकटीनुसार कार्यप्रदर्शन-आधारित प्रोत्साहनासाठी पात्र असेल. यामध्ये लीड जनरेशनचे प्रमाण, प्रति लीड खर्च, वेबसाइट ट्रॅफिक वाढ, सोशल मीडिया एंगेजमेंट आणि मोहीम ROI यांसारखे निकष समाविष्ट असू शकतात. असे प्रोत्साहन पूर्णपणे व्यवस्थापनाच्या विवेकावर अवलंबून असेल आणि ते निश्चित करारात्मक मानधनाचा भाग असणार नाही.
          </div>

          <div className="sub-heading">लाभ व सुविधा</div>
          <div className="body-text">
            कंपनी अधिनियम, २०१३ अंतर्गत नोंदणीकृत प्रायव्हेट लिमिटेड कंपनी म्हणून नियोक्ता खालील वैधानिक व ऐच्छिक लाभ प्रदान करेल:
          </div>

          <div style={{ fontWeight: 700, fontSize: '13px', marginTop: '5px', marginBottom: '2px' }}>
            अनिवार्य वैधानिक लाभ (भारतीय कायद्यानुसार लागू)
          </div>
          <ul className="benefits-list">
            <li><strong>कर्मचारी भविष्य निर्वाह निधी (EPF):</strong> EPF व MP अधिनियम, १९५२ नुसार, २० किंवा अधिक कर्मचारी असलेल्या आस्थापनांना लागू.</li>
            <li><strong>कर्मचारी राज्य विमा (ESI):</strong> कर्मचाऱ्याचे मासिक एकूण वेतन ₹२१,०००/- पेक्षा कमी असल्यास व आस्थापन निर्धारित मर्यादा पूर्ण करत असल्यास लागू.</li>
            <li><strong>उपदान (Gratuity):</strong> उपदान भुगतान अधिनियम, १९७२ नुसार, ५ वर्षे सलग सेवा पूर्ण केल्यावर देय.</li>
            <li><strong>व्यवसाय कर (Professional Tax):</strong> महाराष्ट्र राज्य व्यवसाय कर अधिनियम, १९७५ नुसार वजावटयोग्य.</li>
            <li>
              <strong>रजा पात्रता:</strong> वार्षिक/अर्जित रजा ({convertNumberToMarathi(data.employment?.annualLeaves || '12')} दिवस),
              आकस्मिक रजा ({convertNumberToMarathi(data.employment?.casualLeaves || '6')} दिवस) व आजारी/वैद्यकीय रजा ({convertNumberToMarathi(data.employment?.medicalLeaves || '6')} दिवस) प्रति दिनदर्शिका वर्ष.
            </li>
            <li><strong>मातृत्व लाभ:</strong> मातृत्व लाभ अधिनियम, १९६१ नुसार पात्र महिला कर्मचाऱ्यांना लागू.</li>
          </ul>

          <div style={{ fontWeight: 700, fontSize: '13px', marginTop: '5px', marginBottom: '2px' }}>
            भूमिका-विशिष्ट व ऐच्छिक लाभ
          </div>
          <ul className="benefits-list">
            <li><strong>डिजिटल साधने व सॉफ्टवेअर:</strong> भूमिका पार पाडण्यासाठी आवश्यक परवानाधारक डिजिटल मार्केटिंग टूल्स, अ‍ॅनालिटिक्स प्लॅटफॉर्म, डिझाइन सॉफ्टवेअर व CRM प्रणालींचा कंपनी-पुरस्कृत वापर.</li>
            <li><strong>सामूहिक आरोग्य विमा:</strong> कंपनी धोरणानुसार सर्वसमावेशक वैद्यकीय कव्हरेज.</li>
            <li><strong>व्यावसायिक विकास:</strong> भूमिकेशी संबंधित डिजिटल मार्केटिंग प्रमाणपत्रे (Google, Meta, HubSpot), कार्यशाळा व उद्योग परिषदांसाठी प्रायोजित प्रवेश.</li>
            <li><strong>कार्यप्रदर्शन बोनस:</strong> वैयक्तिक व कंपनीच्या कार्यप्रदर्शनावर आधारित विवेकाधीन वार्षिक बोनस.</li>
            <li><strong>लवचिक काम:</strong> व्यवस्थापनाच्या मंजुरीच्या व परिचालन आवश्यकतांच्या अधीन राहून हायब्रिड/दूरस्थ कामाचे पर्याय.</li>
            <li><strong>इंटरनेट व दळणवळण भत्ता:</strong> कंपनी धोरणानुसार कामाच्या प्रयोजनासाठी प्रत्यक्षात केलेल्या इंटरनेट व मोबाईल खर्चाची प्रतिपूर्ती.</li>
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

          {/* कलम ५ — कामाचे तास */}
          <div className="section-heading">कलम ५. कामाचे तास</div>
          <div className="body-text">
            कर्मचाऱ्याचे मानक कामाचे तास{' '}
            <span className="underline-blank">{data.employment?.workingHours || 'सकाळी ९:३० ते सायंकाळी ६:३०'}</span>,{' '}
            {data.employment?.workingDays || 'सोमवार ते शनिवार'} असतील आणि{' '}
            <span className="underline-blank">{data.employment?.lunchBreak || '१ (एक) तास'}</span>{' '}
            जेवणाची सुट्टी असेल. डिजिटल मार्केटिंग कामाच्या स्वरूपामुळे, कर्मचारी समजतो/समजते व मान्य करतो/करते की काही वेळा मोहीम देखरेख, सोशल मीडिया व्यवस्थापन आणि क्लायंट-संबंधित कामांसाठी मानक वेळेबाहेरही उपलब्ध राहणे आवश्यक असू शकते. लेखी अन्यथा सहमती नसल्यास कर्मचारी अतिरिक्त मानधनाशिवाय अशा आवश्यकतांसाठी योग्यरीत्या उपलब्ध राहील.
          </div>

          {/* कलम ६ — बौद्धिक संपदा हक्क */}
          <div className="section-heading">कलम ६. बौद्धिक संपदा हक्क</div>
          <div className="body-text">
            कर्मचाऱ्याने नोकरीच्या कालावधीत — एकट्याने अथवा सहकार्याने — निर्माण, विकसित अथवा उत्पादित केलेले सर्व सर्जनशील कार्य, डिजिटल कंटेंट, धोरणे, मोहिमा, डिझाइन, डेटाबेस, सोर्स कोड, स्क्रिप्ट, अहवाल व इतर सामग्री ही कंपनीची एकमेव व अनन्य बौद्धिक संपदा असेल. कर्मचारी अशा सर्व कार्यातील सर्व अधिकार, हक्क व हित कंपनीस हस्तांतरित करतो/करते आणि या हस्तांतरणास प्रभावी करण्यासाठी आवश्यक असलेल्या कोणत्याही दस्तऐवजावर स्वाक्षरी करण्यास सहमती देतो/देते. हे कलम कराराच्या समाप्तीनंतरही अंमलात राहील.
          </div>

          {/* कलम ७ — गोपनीयता */}
          <div className="section-heading">कलम ७. गोपनीयता</div>
          <div className="body-text">
            कर्मचारी मान्य करतो/करते की नोकरीदरम्यान त्याला/तिला कंपनीच्या गोपनीय व मालकीच्या माहितीचा वापर करण्याची संधी मिळेल, ज्यात डिजिटल मार्केटिंग धोरणे, जाहिरात खाते डेटा, प्रेक्षक लक्ष्यीकरण मापदंड, ग्राहक व लीड डेटाबेस, विक्रेता करार, आर्थिक कार्यप्रदर्शन डेटा, अप्रकाशित प्रकल्प माहिती व तंत्रज्ञान प्रणाली समाविष्ट आहेत. कर्मचारी सहमत आहे की अशी सर्व माहिती पूर्णपणे गोपनीय ठेवेल, कोणत्याही तृतीय पक्षास उघड करणार नाही आणि नोकरीदरम्यान व नंतरही ती केवळ कंपनीच्या हितासाठीच वापरेल. या कलमाचे उल्लंघन लागू कायद्यानुसार नुकसानभरपाईसाठी जबाबदारी निर्माण करेल.
          </div>

          {/* कलम ८ — स्पर्धा-प्रतिबंध व प्रलोभन-प्रतिबंध */}
          <div className="section-heading">कलम ८. स्पर्धा-प्रतिबंध व प्रलोभन-प्रतिबंध</div>
          <div className="body-text">
            नोकरीच्या कालावधीत आणि कोणत्याही कारणाने नोकरी संपल्यानंतर{' '}
            <span className="underline-blank">{convertToMarathi(data.employment?.nonCompetePeriod || '६ (सहा) महिने')}</span>{' '}
            कालावधीपर्यंत कर्मचारी खालील कार्ये करणार नाही:
          </div>
          <ul className="termination-list">
            <li>कंपनीच्या नोंदणीकृत कार्यालयाच्या{' '}
              <span className="underline-blank">{data.employment?.nonCompeteRadius || '२५ किमी'}</span>{' '}
              परिघात कोणत्याही स्पर्धात्मक रिअल इस्टेट उद्योगात प्रत्यक्ष वा अप्रत्यक्षरीत्या गुंतणे, सल्ला देणे अथवा कार्यरत होणे;
            </li>
            <li>वैयक्तिक लाभासाठी अथवा कोणत्याही स्पर्धात्मक संस्थेच्या फायद्यासाठी कंपनीच्या कोणत्याही ग्राहकास, व्यावसायिक लीडला, चॅनेल पार्टनरला अथवा विक्रेत्याशी संपर्क करणे, आकर्षित करणे अथवा विचलित करण्याचा प्रयत्न करणे; किंवा</li>
            <li>कंपनीच्या कोणत्याही कर्मचाऱ्याला त्याची/तिची नोकरी सोडण्यास प्रवृत्त करणे, भरती करणे अथवा प्रोत्साहित करणे.</li>
          </ul>
          <div className="body-text">
            कर्मचारी मान्य करतो/करते की हे निर्बंध वाजवी आहेत, कंपनीच्या कायदेशीर व्यावसायिक हितांच्या संरक्षणासाठी आवश्यक आहेत आणि भारतीय कायद्यानुसार प्रायव्हेट लिमिटेड कंपनीच्या कर्मचाऱ्यांना लागू असलेल्या मानकांशी सुसंगत आहेत.
          </div>

          {/* कलम ९ — नोकरीची समाप्ती */}
          <div className="section-heading">कलम ९. नोकरीची समाप्ती</div>

          <div className="sub-heading">नियोक्त्याद्वारे समाप्ती</div>
          <div className="body-text">नियोक्ता खालील परिस्थितींमध्ये हा करार संपुष्टात आणू शकतो:</div>
          <ul className="termination-list">
            <li>
              <strong>कारणासह (तत्काळ):</strong> घोर गैरवर्तन, जाणीवपूर्वक अवज्ञा, फसवणूक, डिजिटल मालमत्ता अथवा कंपनी डेटाचा दुरुपयोग, गोपनीय माहितीचे अनधिकृत प्रकटीकरण, गुन्हेगारी शिक्षा अथवा या कराराच्या कोणत्याही मुख्य तरतुदीचे उल्लंघन झाल्यास — पूर्वसूचना अथवा सूचनेऐवजी मोबदल्याशिवाय.
            </li>
            <li>
              <strong>कारणाशिवाय:</strong>{' '}
              <span className="underline-blank">{convertToMarathi(data.employment?.noticePeriodEmployer || '३० (तीस) दिवस')}</span>{' '}
              लेखी पूर्वसूचना देऊन अथवा समतुल्य वेतन अदा करून.
            </li>
          </ul>

          <div className="sub-heading">कर्मचाऱ्याद्वारे समाप्ती</div>
          <div className="body-text">
            कर्मचारी नियोक्त्यास{' '}
            <span className="underline-blank">{convertToMarathi(data.employment?.noticePeriodEmployee || '३० (तीस) दिवस')}</span>{' '}
            लेखी पूर्वसूचना देऊन राजीनामा देऊ शकतो/शकते. राजीनामा अथवा समाप्तीच्या प्रसंगी कर्मचारी: (अ) कंपनीची सर्व मालमत्ता, उपकरणे, प्रवेश क्रेडेन्शियल्स, सॉफ्टवेअर परवाने व दस्तऐवज तत्काळ परत करेल; (ब) सर्व डिजिटल खाती, जाहिरात खाती, सोशल मीडिया क्रेडेन्शियल्स व मोहीम मालमत्ता कंपनीस हस्तांतरित करेल; आणि (क) हस्तांतरण प्रक्रियेत संपूर्ण सहकार्य करेल.
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

          {/* कलम १० — आचार संहिता */}
          <div className="section-heading">कलम १०. आचार संहिता व व्यावसायिक मानके</div>
          <div className="body-text">
            कर्मचारी ऑनलाइन व ऑफलाइन दोन्ही ठिकाणी कंपनीचे प्रतिनिधित्व करताना सदैव व्यावसायिक व नैतिक आचरण ठेवण्यास सहमत आहे. कर्मचारी कोणतेही आशय — वैयक्तिक अथवा कंपनीच्या वाहिन्यांवर — प्रकाशित, पोस्ट अथवा प्रसारित करणार नाही जे कंपनीची प्रतिष्ठा धोक्यात आणेल, लागू जाहिरात मानकांचे (ASI मार्गदर्शक तत्त्वांसह) उल्लंघन करेल अथवा माहिती तंत्रज्ञान अधिनियम, २००० चे उल्लंघन करेल. ग्राहक अथवा लीड डेटा हाताळताना कर्मचारी डिजिटल वैयक्तिक डेटा संरक्षण अधिनियम, २०२३ अंतर्गत लागू असलेल्या सर्व डेटा संरक्षण बंधनांचे पालन करेल.
          </div>

          {/* कलम ११ — शासी कायदा व न्यायक्षेत्र */}
          <div className="section-heading">कलम ११. शासी कायदा व न्यायक्षेत्र</div>
          <div className="body-text">
            हा करार भारताच्या कायद्यांनुसार शासित व अर्थान्वित होईल, ज्यात कंपनी अधिनियम, २०१३, भारतीय करार अधिनियम, १८७२ आणि इतर लागू केंद्रीय व राज्य कायदे समाविष्ट आहेत. या कराराशी संबंधित कोणत्याही वादाबाबत{' '}
            <span className="underline-blank">{data.employment?.jurisdiction || data.company?.companyDistrict || ''}</span>{' '}
            येथील न्यायालयांचे अनन्य न्यायक्षेत्र असेल.
          </div>

          {/* कलम १२ — संपूर्ण करार */}
          <div className="section-heading">कलम १२. संपूर्ण करार</div>
          <div className="body-text">
            हा करार नियोक्ता व कर्मचारी यांच्यातील विषयाशी संबंधित संपूर्ण सहमतीचे प्रतिनिधित्व करतो आणि पूर्वीचे सर्व विचारविनिमय, वाटाघाटी, नियुक्ती पत्रे व करार — लेखी अथवा तोंडी — यांची जागा घेतो. या करारामध्ये कोणताही बदल अथवा सुधारणा लेखी स्वरूपात असणे व दोन्ही पक्षांच्या स्वाक्षरीने प्रमाणित असणे आवश्यक आहे. सक्षम न्यायालयाने या कराराची एखादी तरतूद अवैध अथवा अप्रवर्तनीय ठरविल्यास उर्वरित तरतुदी पूर्ण बल व प्रभावाने अंमलात राहतील.
          </div>

          {/* कलम १३ — स्वीकृती */}
          <div className="section-heading">कलम १३. स्वीकृती व पुष्टी</div>
          <div className="body-text">
            कर्मचारी पुष्टी करतो/करते की त्याने/तिने या करारातील सर्व अटी व शर्ती वाचल्या, समजल्या व त्यांना संमती दिली आहे, तसेच तो/ती स्वतंत्रपणे आणि कोणत्याही दबावाशिवाय या करारात प्रवेश करत आहे. कर्मचारी हे देखील पुष्टी करतो/करते की तो/ती कोणत्याही माजी नियोक्त्यासोबतच्या स्पर्धा-प्रतिबंध, गोपनीयता अथवा इतर करारात्मक बंधनाने बाधित नाही ज्यामुळे या करारांतर्गत त्याच्या/तिच्या कर्तव्यांच्या निर्वहनावर निर्बंध येईल.
          </div>

          {/* SIGNATURES */}
          <div className="sig-grid">

            {/* EMPLOYER SIGNATURE */}
            <div className="sig-block">
              <div className="sig-block-title">कंपनीच्या वतीने व तिच्यासाठी</div>
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
                  {data.manager?.managerPosition || data.company?.managerPosition || data.company?.hrDesignation || 'संचालक'}
                </span>
              </div>
              <div style={{ marginTop: '6px', fontSize: '12px', fontStyle: 'italic' }}>
                अधिकृत स्वाक्षरीकर्ता — {convertToMarathi(data.company?.companyName || '')}{data.company?.entityType ? ` (${data.company.entityType})` : ''}
              </div>
              <div style={{ marginTop: '4px', fontSize: '12px' }}>
                CIN: {data.company?.cinNumber || ''}
              </div>
            </div>

            {/* EMPLOYEE SIGNATURE */}
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

export default MarathiDigitalGrowthManagerAgreement;