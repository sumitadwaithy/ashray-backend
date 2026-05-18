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

const HindiOfficeComputerOperatorAgreement = ({ data, companyLogo, companyWatermark }: TemplateProps) => {

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
    "कार्यालय कंप्यूटर, प्रिंटर, स्कैनर और सभी परिधीय उपकरणों का संचालन और रखरखाव।",
    "कंपनी के रियल एस्टेट मैनेजमेंट सॉफ्टवेयर में संपत्ति डेटा, ग्राहक रिकॉर्ड और लेन-देन विवरण दर्ज करना, अपडेट करना और सत्यापित करना।",
    "वर्ड प्रोसेसिंग और स्प्रेडशीट सॉफ्टवेयर का उपयोग करके कानूनी दस्तावेज़, बिक्री पत्र, समझौते, एनओसी और पत्राचार तैयार करना और फॉर्मेट करना।",
    "उचित इंडेक्सिंग और संस्करण नियंत्रण के साथ डिजिटल फाइलिंग सिस्टम, संपत्ति डेटाबेस और दस्तावेज़ भंडार का प्रबंधन और रखरखाव।",
    "आवश्यकतानुसार एमआईएस रिपोर्ट, संपत्ति सूचियां, इन्वेंट्री सारांश और मैनेजमेंट डैशबोर्ड तैयार करना और वितरित करना।",
    "भौतिक दस्तावेज़ों को कंपनी के दस्तावेज़ प्रबंधन प्रणाली में स्कैन करना, डिजिटाइज़ करना और संग्रहीत करना।",
    "संपत्ति लॉन्च और ग्राहक बैठकों के लिए प्रस्तुति, ब्रोशर और विपणन सामग्री तैयार करने में सहायता करना।",
    "डिजिटल सिस्टम पर संग्रहीत सभी कंपनी और ग्राहक जानकारी के लिए डेटा सुरक्षा, नियमित सिस्टम बैकअप और कड़ी गोपनीयता सुनिश्चित करना।",
    "कार्यालय सिस्टम के रखरखाव, समस्या निवारण और उन्नयन के लिए सॉफ्टवेयर विक्रेताओं और आईटी सहायता के साथ समन्वय करना।",
    "समय-समय पर प्रबंधन द्वारा सौंपे गए अन्य कंप्यूटर संबंधित और प्रशासनिक कर्तव्यों का निष्पादन।",
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
          font-family: 'Times New Roman', 'Georgia', 'Mangal', 'Kokila', serif;
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
          font-family: 'Times New Roman', 'Mangal', 'Kokila', serif;
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
          <div className="agreement-title">रोजगार अनुबंध</div>
          <div className="agreement-subtitle">(कार्यालय कंप्यूटर ऑपरेटर)</div>

          {/* PREAMBLE */}
          <div className="body-text">
            यह रोजगार अनुबंध <strong>("अनुबंध")</strong> दिनांक{' '}
            <span className="underline-blank">{formatHindiDate(data.employment?.joiningDate)}</span> को निम्नलिखित पक्षों के बीच निष्पादित किया गया है:
          </div>

          {/* EMPLOYER */}
          <div className="party-block">
            <div className="party-name">{employerFullName}</div>
            <div><strong>पंजीकृत पता:</strong> {employerAddress}</div>
            <div><strong>सीआईएन:</strong> {data.company?.cinNumber || <span className="underline-blank" style={{ minWidth: '160px' }} />}</div>
            <div><strong>पैन:</strong> {data.company?.companyPan || <span className="underline-blank" style={{ minWidth: '120px' }} />}</div>
            <div style={{ fontStyle: 'italic' }}>
              (कंपनियों अधिनियम, 2013 के अंतर्गत निगमित एक कंपनी, जिसे यहाँ <strong>"कंपनी"</strong> या <strong>"नियोक्ता"</strong> कहा जाएगा)
            </div>
          </div>

          <div className="and-divider">और</div>

          {/* EMPLOYEE */}
          <div className="party-block">
            <div className="party-name">{employeeFullName}</div>
            <div><strong>पता:</strong> {employeeAddress}</div>
            <div><strong>जन्म तिथि:</strong> {data.employee?.dob ? formatHindiDate(data.employee.dob) : <span className="underline-blank" style={{ minWidth: '100px' }} />}</div>
            <div>
              <strong>आधार संख्या:</strong> {formatAadhaarHindi(data.employee?.aadhaar) || <span className="underline-blank" style={{ minWidth: '120px' }} />}
              &emsp;
              <strong>पैन संख्या:</strong> {data.employee?.pan || <span className="underline-blank" style={{ minWidth: '100px' }} />}
            </div>
            <div style={{ fontStyle: 'italic' }}>(जिसे यहाँ <strong>"कर्मचारी"</strong> कहा जाएगा)</div>
          </div>

          {/* 1. POSITION AND DUTIES */}
          <div className="section-heading">1. पद और कर्तव्य</div>
          <div className="body-text">
            कंपनी इसके द्वारा कर्मचारी को <strong>कार्यालय कंप्यूटर ऑपरेटर</strong> के पद पर नियुक्त करती है
            {data.employment?.department ? ` ${convertToHindi(data.employment.department)} विभाग में` : ''}। कर्मचारी{' '}
            <span className="underline-blank">{convertToHindi(data.employment?.reportingTo || '')}</span>{' '}
            को रिपोर्ट करेगा/करेगी और रियल एस्टेट प्राइवेट लिमिटेड कंपनी में इस पद से जुड़े सभी कर्तव्यों और जिम्मेदारियों का निष्ठापूर्वक निर्वहन करेगा/करेगी, जिसमें निम्नलिखित शामिल हैं लेकिन इन्हीं तक सीमित नहीं है:
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
          <div className="section-heading">2. प्रारंभ और परिवीक्षा</div>
          <div className="body-text">
            कर्मचारी का रोजगार{' '}
            <span className="underline-blank">{formatHindiDate(data.employment?.joiningDate)}</span> से प्रारंभ होगा।
            कर्मचारी को ज्वाइनिंग की तारीख से{' '}
            <strong>{data.employment?.probationPeriod || '3 (तीन) महीने'}</strong> की परिवीक्षा अवधि पर रखा जाएगा,
            जिसके दौरान कोई भी पक्ष बिना किसी कारण या पूर्व सूचना के इस अनुबंध को समाप्त कर सकता है।
            परिवीक्षा अवधि के संतोषजनक पूरा होने पर, कंपनी के मानव संसाधन नीति के अनुसार कंपनी के किसी उचित अधिकृत अधिकारी द्वारा रोजगार की पुष्टि लिखित रूप में की जाएगी।
          </div>

          {/* 3. COMPENSATION */}
          <div className="section-heading">3. मुआवजा</div>

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
            मात्र) के समान मासिक सकल वेतन के बराबर है,
            जो अगले महीने की 7 तारीख तक या उससे पहले समान मासिक किश्तों में भुगतान योग्य होगा, भारतीय कानून के अंतर्गत लागू कटौतियों, आयकर अधिनियम, 1961 के अनुसार टीडीएस और वैधानिक रोकथामों के अधीन रहेगा।
          </div>

          <div className="sub-heading">वैधानिक लाभ</div>
          <div className="body-text">
            भारतीय श्रम कानून द्वारा प्राइवेट लिमिटेड कंपनियों पर लागू अनिवार्य आवश्यकताओं के अनुसार, कर्मचारी को निम्नलिखित वैधानिक लाभों का हकदार होगा:
          </div>

          <div style={{ fontWeight: 700, fontSize: '13px', marginTop: '5px', marginBottom: '2px' }}>
            अनिवार्य वैधानिक लाभ
          </div>
          <ul className="benefits-list">
            <li><strong>कर्मचारी भविष्य निधि (ईपीएफ) — ईपीएफ और एमपी अधिनियम, 1952:</strong> नियोक्ता और कर्मचारी दोनों को मूल वेतन का 12-12% योगदान करना होगा। कंपनी द्वारा 20 या अधिक व्यक्तियों को नियोजित करने पर लागू।</li>
            <li><strong>कर्मचारी राज्य बीमा (ईएसआई) — ईएसआई अधिनियम, 1948:</strong> कर्मचारी की सकल मजदूरी ₹21,000/- प्रति माह या उससे कम होने और प्रतिष्ठान द्वारा 10 या अधिक व्यक्तियों (कुछ राज्यों में 20) को नियोजित करने पर लागू।</li>
            <li><strong>ग्रैच्युटी — ग्रैच्युटी भुगतान अधिनियम, 1972:</strong> निरंतर सेवा के 5 (पांच) वर्ष पूरा होने पर प्रत्येक पूरे वर्ष की सेवा के लिए 15 दिनों के वेतन की दर से भुगतान योग्य।</li>
            <li>
              <strong>अवकाश अधिकार — दुकान और प्रतिष्ठान अधिनियम (राज्य):</strong> वार्षिक / अर्जित अवकाश ({convertNumberToHindi(data.employment?.annualLeaves || '12')} दिन),
              बीमार / चिकित्सा अवकाश ({convertNumberToHindi(data.employment?.medicalLeaves || '6')} दिन), और आकस्मिक अवकाश ({convertNumberToHindi(data.employment?.casualLeaves || '6')} दिन) प्रति कैलेंडर वर्ष।
            </li>
            <li><strong>प्रसूति लाभ — प्रसूति लाभ अधिनियम, 1961:</strong> पात्र महिला कर्मचारियों को 26 सप्ताह का भुगतान युक्त प्रसूति अवकाश (2 जीवित बच्चों तक); बाद की गर्भावस्थाओं के लिए 12 सप्ताह।</li>
            <li><strong>बोनस — बोनस भुगतान अधिनियम, 1965:</strong> यदि कंपनी का वार्षिक कारोबार अधिनियम के अंतर्गत योग्य हो; न्यूनतम बोनस वार्षिक मजदूरी का 8.33% या ₹100/- प्रति माह, जो भी अधिक हो।</li>
          </ul>

          <div style={{ fontWeight: 700, fontSize: '13px', marginTop: '5px', marginBottom: '2px' }}>
            स्वैच्छिक / प्रतिस्पर्धात्मक लाभ
          </div>
          <ul className="benefits-list">
            <li><strong>समूह स्वास्थ्य बीमा:</strong> कंपनी नीति के अनुसार व्यापक चिकित्सा कवरेज।</li>
            <li><strong>प्रदर्शन प्रोत्साहन:</strong> प्रबंधन / बोर्ड के विवेक पर प्रदर्शन आधारित बोनस और वार्षिक वेतन वृद्धि।</li>
            <li><strong>पेशेवर विकास:</strong> रियल एस्टेट सॉफ्टवेयर, एमएस ऑफिस, टैली और दस्तावेज़ प्रबंधन प्रणालियों में प्रशिक्षण।</li>
            <li><strong>लचीला कार्य:</strong> प्रबंधन की स्वीकृति और परिचालन आवश्यकताओं के अधीन।</li>
          </ul>

          <div style={{ fontWeight: 700, fontSize: '13px', marginTop: '5px', marginBottom: '2px' }}>
            वैकल्पिक लाभ
          </div>
          <ul className="benefits-list">
            <li>कल्याण कार्यक्रम: जिम सदस्यता, मानसिक कल्याण सहायता।</li>
            <li>अतिरिक्त अवकाश: पितृत्व अवकाश, शोक अवकाश कंपनी नीति के अनुसार।</li>
            <li>सहायता: बच्चे की देखभाल सहायता, स्थानांतरण सहायता जैसा लागू हो।</li>
            <li>भविष्य निधि योगदान और कंपनी द्वारा समय-समय पर निर्धारित अन्य लाभ।</li>
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
          <div className="section-heading">4. कार्य अवधि</div>
          <div className="body-text">
            कर्मचारी की मानक कार्य अवधि{' '}
            <span className="underline-blank">{data.employment?.workingHours || 'सुबह 9:00 बजे से शाम 6:00 बजे तक'}</span>,{' '}
            {data.employment?.workingDays || 'सोमवार से शनिवार'} रहेगी, जिसमें{' '}
            <span className="underline-blank">{data.employment?.lunchBreak || '1 (एक) घंटे'}</span>{' '}
            का भोजन अवकाश शामिल है, लागू राज्य दुकान और प्रतिष्ठान अधिनियम के अनुसार। कर्मचारी को परिचालन समय-सीमा को पूरा करने के लिए अतिरिक्त घंटे काम करने की आवश्यकता हो सकती है; किसी भी ओवरटाइम मुआवजे का निर्धारण लागू कानून द्वारा किया जाएगा।
          </div>

          {/* 5. INTELLECTUAL PROPERTY & DATA OWNERSHIP */}
          <div className="section-heading">5. बौद्धिक संपदा और डेटा स्वामित्व</div>
          <div className="body-text">
            रोजगार के दौरान कर्मचारी द्वारा बनाया गया सभी कार्य उत्पाद, डेटा प्रविष्टियां, डेटाबेस, सॉफ्टवेयर कॉन्फ़िगरेशन, डिजिटल फाइलें, रिपोर्ट और दस्तावेज़ कंपनी की एकमात्र और विशिष्ट बौद्धिक संपदा होंगे। कर्मचारी का इस तरह के किसी भी कार्य उत्पाद में कोई दावा, अधिकार या हित, चाहे व्यक्तिगत, वित्तीय या अन्यथा, नहीं होगा। रोजगार समाप्ति पर, कर्मचारी तुरंत सभी कंपनी के उपकरण, सॉफ्टवेयर लाइसेंस, एक्सेस टोकन और किसी भी डेटा-वाहक माध्यम को बिना किसी प्रतिलिपि रखे वापस कर देगा/देगी।
          </div>

          {/* 6. CONFIDENTIALITY */}
          <div className="section-heading">6. गोपनीयता और डेटा संरक्षण</div>
          <div className="body-text">
            कर्मचारी स्वीकार करता/करती है कि रोजगार के दौरान, उनकी पहुंच कंपनी की संवेदनशील और गोपनीय जानकारी तक होगी, जिसमें लेकिन सीमित नहीं है ग्राहक व्यक्तिगत डेटा, खरीदार/विक्रेता के आधार और पैन विवरण, संपत्ति लेन-देन रिकॉर्ड, मूल्य निर्धारण रणनीतियां, वित्तीय डेटा, आंतरिक सॉफ्टवेयर सिस्टम और व्यापार योजनाएं। कर्मचारी निम्नलिखित के लिए सहमत है:
          </div>
          <ul className="clause-list">
            <li>रोजगार की अवधि के दौरान और बाद में सभी ऐसी जानकारी को कड़ी गोपनीयता में रखना;</li>
            <li>कंपनी की पूर्व लिखित अनुमति के बिना किसी भी तीसरे पक्ष को कोई भी ऐसी जानकारी प्रकट, साझा, कॉपी या संचारित नहीं करना;</li>
            <li>डिजिटल व्यक्तिगत डेटा संरक्षण अधिनियम, 2023 (डीपीडीपीए) और लागू आईटी विनियमों सहित सभी लागू डेटा संरक्षण दायित्वों का पालन करना;</li>
            <li>सौंपे गए कर्तव्यों के दायरे से परे किसी भी कंपनी डेटा तक पहुंच, परिवर्तन या हटाना नहीं करना।</li>
          </ul>
          <div className="body-text">
            इस खंड के किसी भी उल्लंघन से कर्मचारी अनुशासनात्मक कार्रवाई, समाप्ति और भारतीय कानून के अंतर्गत लागू नागरिक या आपराधिक कार्यवाही के लिए उत्तरदायी होगा/होगी।
          </div>

          {/* 7. NON-COMPETITION */}
          <div className="section-heading">7. गैर-प्रतिस्पर्धा और गैर-आकर्षण</div>
          <div className="body-text">
            रोजगार की अवधि के दौरान और किसी भी कारण से रोजगार समाप्ति के{' '}
            <span className="underline-blank">{data.employment?.nonCompetePeriod || '6 (छह) महीने'}</span>{' '}
            बाद तक, कर्मचारी निम्नलिखित नहीं करेगा/करेगी:
          </div>
          <ul className="clause-list">
            <li>कंपनी के प्राथमिक व्यापार स्थल से{' '}
              <span className="underline-blank">{data.employment?.nonCompeteRadius || '25 किमी'}</span>{' '}
              की त्रिज्या के भीतर कंपनी की रियल एस्टेट परिचालन से प्रतिस्पर्धा करने वाले किसी भी व्यवसाय में सीधे या अप्रत्यक्ष रूप से संलग्न, नियोजित या सेवाएं प्रदान नहीं करना;</li>
            <li>किसी भी प्रतिस्पर्धी उद्देश्य के लिए कंपनी के किसी भी ग्राहक, ग्राहक या व्यापार सहयोगी को आकर्षित, संपर्क या लुभाना नहीं;</li>
            <li>कंपनी के किसी भी कर्मचारी को अपने रोजगार से हटाने के लिए प्रोत्साहित या प्रयास नहीं करना।</li>
          </ul>

          {/* 8. TERMINATION */}
          <div className="section-heading">8. रोजगार समाप्ति</div>

          <div className="sub-heading">कंपनी द्वारा समाप्ति</div>
          <div className="body-text">कंपनी निम्नलिखित परिस्थितियों में इस अनुबंध को समाप्त कर सकती है:</div>
          <ul className="termination-list">
            <li>
              <strong>कारण सहित (सारांश बर्खास्तगी):</strong> गंभीर दुर्व्यवहार, बेईमानी, चोरी, कंपनी डेटा या सिस्टम के अनधिकृत पहुंच या दुरुपयोग, अवज्ञा, धोखाधड़ी, या इस अनुबंध या कंपनी नीतियों के भौतिक उल्लंघन सहित कारणों के लिए तुरंत और बिना सूचना के।
            </li>
            <li>
              <strong>बिना कारण:</strong>{' '}
              <span className="underline-blank">{data.employment?.noticePeriodEmployer || '30 (तीस) दिनों'}</span>{' '}
              की लिखित सूचना या इस तरह की सूचना के बदले वेतन का भुगतान करके, यदि लागू हो तो औद्योगिक विवाद अधिनियम, 1947 के लागू प्रावधानों के अधीन।
            </li>
          </ul>

          <div className="sub-heading">कर्मचारी द्वारा समाप्ति</div>
          <div className="body-text">
            कर्मचारी{' '}
            <span className="underline-blank">{data.employment?.noticePeriodEmployee || '30 (तीस) दिनों'}</span>{' '}
            की लिखित सूचना देकर कंपनी से इस्तीफा दे सकता/सकती है। रोजगार समाप्ति पर, कर्मचारी: (i) तुरंत सभी कंपनी संपत्ति, उपकरण, सॉफ्टवेयर, एक्सेस क्रेडेंशियल और दस्तावेज़ सौंप देगा/देगी; (ii) सभी लंबित कार्य का औपचारिक हैंडओवर पूरा करेगा/करेगी; और (iii) अंतिम निपटान से पहले एक नो-ड्यूज सर्टिफिकेट पर हस्ताक्षर करेगा/करेगी।
          </div>

          {/* 9. GOVERNING LAW */}
          <div className="section-heading">9. शासी कानून और क्षेत्राधिकार</div>
          <div className="body-text">
            इस अनुबंध का निर्माण और व्याख्या भारत के कानूनों, जिसमें कंपनियों अधिनियम, 2013, संविदा अधिनियम, 1872 और लागू श्रम कानून शामिल हैं, के अनुसार की जाएगी। इस अनुबंध से उत्पन्न या संबंधित किसी भी विवाद{' '}
            <span className="underline-blank">{data.employment?.jurisdiction || data.company?.companyDistrict || ''}</span>{' '}
            की अदालतों के विशिष्ट क्षेत्राधिकार के अधीन होगा।
          </div>

          {/* 9B. ENTIRE AGREEMENT */}
          <div className="section-heading">10. संपूर्ण अनुबंध</div>
          <div className="body-text">
            यह अनुबंध कंपनी और कर्मचारी के बीच रोजगार की शर्तों के संबंध में संपूर्ण अनुबंध है और सभी पूर्व चर्चाओं, बातचीत और समझौतों, चाहे लिखित या मौखिक, को प्रतिस्थापित करता है। इसमें निहित कोई भी प्रतिनिधित्व कानूनी प्रभाव नहीं रखेगा।
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
          <div className="section-heading">11. संशोधन</div>
          <div className="body-text">
            इस अनुबंध में कोई भी संशोधन या परिवर्तन केवल तभी वैध होगा जब यह लिखित रूप में किया गया हो और कंपनी के अधिकृत प्रतिनिधि और कर्मचारी द्वारा उचित रूप से हस्ताक्षरित हो। कोई भी मौखिक संशोधन किसी भी पक्ष के लिए बाध्यकारी नहीं होगा।
          </div>

          {/* 12. SEVERABILITY */}
          <div className="section-heading">12. पृथक्करण</div>
          <div className="body-text">
            यदि इस अनुबंध का कोई प्रावधान लागू कानून के अंतर्गत अमान्य, शून्य या अप्रवर्तनीय पाया जाता है, तो ऐसा प्रावधान इस अनुबंध से अलग माना जाएगा, और शेष प्रावधान पूर्ण बल और प्रभाव में जारी रहेंगे।
          </div>

          {/* 13. COMPLIANCE DECLARATION */}
          <div className="section-heading">13. वैधानिक अनुपालन घोषणा</div>
          <div className="body-text">
            दोनों पक्ष स्वीकार करते हैं कि यह अनुबंध सभी लागू केंद्रीय और राज्य कानूनों के अधीन है और उनके अनुरूप व्याख्या किया जाएगा, जिसमें निम्नलिखित शामिल हैं लेकिन इन्हीं तक सीमित नहीं है:
          </div>
          <div className="compliance-box">
            <strong>लागू कानून:</strong> कंपनियों अधिनियम, 2013 &nbsp;|&nbsp; संविदा अधिनियम, 1872 &nbsp;|&nbsp; औद्योगिक विवाद अधिनियम, 1947 &nbsp;|&nbsp; ईपीफ और एमपी अधिनियम, 1952 &nbsp;|&nbsp; ईएसआई अधिनियम, 1948 &nbsp;|&nbsp; ग्रैच्युटी भुगतान अधिनियम, 1972 &nbsp;|&nbsp; बोनस भुगतान अधिनियम, 1965 &nbsp;|&nbsp; प्रसूति लाभ अधिनियम, 1961 &nbsp;|&nbsp; न्यूनतम मजदूरी अधिनियम, 1948 &nbsp;|&nbsp; मजदूरी भुगतान अधिनियम, 1936 &nbsp;|&nbsp; आईटी अधिनियम, 2000 &nbsp;|&nbsp; डिजिटल व्यक्तिगत डेटा संरक्षण अधिनियम, 2023 &nbsp;|&nbsp; राज्य दुकान और प्रतिष्ठान अधिनियम (महाराष्ट्र)
          </div>
          <div className="body-text" style={{ marginTop: '4px' }}>
            यदि इस अनुबंध की शर्तों और किसी भी लागू अधिनियम के प्रावधानों के बीच कोई विरोध हो, तो अधिनियम प्रबल रहेगा।
          </div>

          {/* SIGNATURES */}
          <div className="sig-grid">

            {/* COMPANY SIGNATURE */}
            <div className="sig-block">
              <div className="sig-block-title">कंपनी की ओर से और कंपनी के लिए</div>
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
                <strong>डीआईएन / पैन:</strong>
                <span className="underline-blank" style={{ minWidth: '110px' }}>
                  {data.company?.managerPAN || data.manager?.managerPAN || ''}
                </span>
              </div>
              <div style={{ marginTop: '6px', fontSize: '12px', fontStyle: 'italic' }}>
                अधिकृत हस्ताक्षरकर्ता — {convertToHindi(data.company?.companyName || '')}{data.company?.entityType ? ` (${data.company.entityType})` : ''}
              </div>
            </div>

            {/* EMPLOYEE SIGNATURE */}
            <div className="sig-block">
              <div className="sig-block-title">कर्मचारी स्वीकृति</div>
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
                <strong>आधार संख्या:</strong>
                <span className="underline-blank" style={{ minWidth: '110px' }}>
                  {formatAadhaarHindi(data.employee?.aadhaar) || ''}
                </span>
              </div>
              <div style={{ marginTop: '14px', fontSize: '12.5px', fontWeight: 700 }}>
                बाएं हाथ का अंगूठा छाप:-
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
            <div style={{ fontWeight: 700, fontSize: '13px', marginBottom: '8px' }}>गवाह</div>
            <div style={{ display: 'flex', gap: '40px' }}>
              <div style={{ flex: 1, fontSize: '13px', lineHeight: 1.8 }}>
                <div><strong>1.</strong> नाम: <span className="underline-blank" style={{ minWidth: '140px' }} /></div>
                <div style={{ marginTop: '4px' }}>हस्ताक्षर: <span className="underline-blank" style={{ minWidth: '120px' }} /></div>
              </div>
              <div style={{ flex: 1, fontSize: '13px', lineHeight: 1.8 }}>
                <div><strong>2.</strong> नाम: <span className="underline-blank" style={{ minWidth: '140px' }} /></div>
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

export default HindiOfficeComputerOperatorAgreement;