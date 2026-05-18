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

const HindiOfficeAccountantAgreement = ({ data, companyLogo, companyWatermark }: TemplateProps) => {

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
    "कंपनी द्वारा निर्धारित Tally ERP / Tally Prime या किसी अन्य लेखा सॉफ्टवेयर में प्राइवेट लिमिटेड कंपनियों पर लागू लेखा मानकों के अनुपालन में सटीक खाता-बही बनाए रखना।",
    "संपत्ति बुकिंग, टोकन राशि, किस्त संग्रह, रद्दीकरण, दलाली भुगतान और विक्रेता भुगतान सहित सभी वित्तीय लेन-देन की रिकॉर्डिंग और समाधान करना।",
    "कंपनी के रियल एस्टेट परिचालन के लिए GST अधिनियम, 2017 के अंतर्गत मासिक, त्रैमासिक और वार्षिक जीएसटी रिटर्न (GSTR-1, GSTR-3B, GSTR-9) तैयार करना और दाखिल करना।",
    "आयकर अधिनियम, 1961 के अंतर्गत लागू TDS की कटौती और जमा करना तथा निर्धारित देय तिथियों के भीतर TDS रिटर्न (फॉर्म 24Q, 26Q, 27Q) दाखिल करना।",
    "कंपनी अधिनियम, 2013 और लागू लेखा मानकों (AS / Ind AS) के अनुसार वार्षिक वित्तीय विवरण — तुलन पत्र, लाभ-हानि खाता और नकद प्रवाह विवरण — तैयार करने में सहायता करना।",
    "देय और प्राप्य खातों का प्रबंधन करना, जिसमें संपत्ति खरीदारों से बकाया राशि की ट्रैकिंग, अतिदेय भुगतान का अनुसरण और विक्रेता बिलों की प्रक्रिया शामिल है।",
    "प्रबंधन समीक्षा के लिए MIS रिपोर्ट, बजट बनाम वास्तविक रिपोर्ट, परियोजना-वार लागत विवरण और नकद प्रवाह अनुमान तैयार और बनाए रखना।",
    "कंपनी अधिनियम, 2013 के अंतर्गत आवश्यक वार्षिक लेखापरीक्षा, बोर्ड प्रस्तावों और ROC फाइलिंग के लिए वैधानिक लेखापरीक्षकों, आंतरिक लेखापरीक्षकों और कंपनी सचिव के साथ समन्वय करना।",
    "लागू श्रम कानूनों के अनुपालन में कंपनी कर्मचारियों के लिए वेतन प्रसंस्करण, EPF, ESI, व्यावसायिक कर और अन्य वैधानिक कटौतियों की गणना का प्रबंधन करना।",
    "वैधानिक प्रतिधारण आवश्यकताओं के अनुसार सभी वित्तीय अभिलेखों, वाउचर, रसीदों, चालानों और बैंक विवरणों का उचित दस्तावेज़ीकरण बनाए रखना।",
    "RERA (रियल एस्टेट विनियमन और विकास अधिनियम, 2016) की वित्तीय रिपोर्टिंग आवश्यकताओं का अनुपालन सुनिश्चित करना जिसमें प्रत्येक परियोजना के लिए अलग एस्क्रो खाते का रखरखाव शामिल है।",
    "समय-समय पर प्रबंधन द्वारा सौंपे गए अन्य लेखांकन, वित्तीय या प्रशासनिक कार्य करना।",
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
          <div className="agreement-subtitle">(कार्यालय लेखाकार)</div>

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
            <div>
              <strong>शैक्षणिक योग्यता:</strong>{' '}
              {data.employee?.qualification || <span className="underline-blank" style={{ minWidth: '160px' }} />}
            </div>
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
            कंपनी एतद्द्वारा कर्मचारी को <strong>कार्यालय लेखाकार</strong> के पद पर
            {data.employment?.department ? ` ${convertToHindi(data.employment.department)} विभाग में` : ''} नियुक्त करती है। कर्मचारी{' '}
            <span className="underline-blank">{convertToHindi(data.employment?.reportingTo || '')}</span>{' '}
            को रिपोर्ट करेगा और रियल एस्टेट प्राइवेट लिमिटेड कंपनी में आवश्यक सभी लेखांकन, वित्तीय और अनुपालन कर्तव्यों का परिश्रमपूर्वक निर्वहन करेगा, जिनमें निम्नलिखित शामिल हैं, परंतु इन्हीं तक सीमित नहीं:
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
            जो अगले माह की 7 तारीख को या उससे पहले समान मासिक किस्तों में, आयकर अधिनियम, 1961 के अंतर्गत लागू कटौतियों, TDS और भारतीय कानून के अनुसार वैधानिक रोके के अधीन देय होगा।
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
            <li><strong>कर्मचारी राज्य बीमा (ईएसआई) — ईएसआई अधिनियम, 1948:</strong> लागू जहाँ कर्मचारी का सकल वेतन ₹21,000/- प्रति माह या उससे कम हो और प्रतिष्ठान 10 (कुछ राज्यों में 20) या अधिक व्यक्तियों को नियोजित करे।</li>
            <li><strong>ग्रेच्युटी — ग्रेच्युटी भुगतान अधिनियम, 1972:</strong> 5 (पाँच) वर्ष की निरंतर सेवा पूर्ण होने पर प्रत्येक पूर्ण सेवा वर्ष के लिए 15 दिन के वेतन की दर से देय।</li>
            <li>
              <strong>अवकाश पात्रता — दुकान एवं प्रतिष्ठान अधिनियम (राज्य):</strong> सवैतनिक वार्षिक / अर्जित अवकाश ({convertNumberToHindi(data.employment?.annualLeaves || '12')} दिन),
              बीमारी / चिकित्सा अवकाश ({convertNumberToHindi(data.employment?.medicalLeaves || '6')} दिन) और आकस्मिक अवकाश ({convertNumberToHindi(data.employment?.casualLeaves || '6')} दिन) प्रति कैलेंडर वर्ष।
            </li>
            <li><strong>मातृत्व लाभ — मातृत्व लाभ अधिनियम, 1961:</strong> पात्र महिला कर्मचारियों के लिए 26 सप्ताह का सवैतनिक मातृत्व अवकाश (2 जीवित बच्चों तक); अगली गर्भावस्था के लिए 12 सप्ताह।</li>
            <li><strong>बोनस — बोनस भुगतान अधिनियम, 1965:</strong> लागू यदि कंपनी का वार्षिक कारोबार अधिनियम के अंतर्गत अर्हता प्राप्त करे; वार्षिक वेतन का न्यूनतम 8.33% या ₹100/- प्रति माह, जो भी अधिक हो।</li>
          </ul>

          <div style={{ fontWeight: 700, fontSize: '13px', marginTop: '5px', marginBottom: '2px' }}>
            स्वैच्छिक / प्रतिस्पर्धी लाभ
          </div>
          <ul className="benefits-list">
            <li><strong>समूह स्वास्थ्य बीमा:</strong> कंपनी नीति के अनुसार व्यापक चिकित्सा कवरेज।</li>
            <li><strong>प्रदर्शन प्रोत्साहन:</strong> लेखापरीक्षा परिणामों और अनुपालन प्रदर्शन से जुड़े बोर्ड / प्रबंधन के विवेकानुसार प्रदर्शन-आधारित बोनस और वार्षिक वेतन वृद्धि।</li>
            <li><strong>व्यावसायिक विकास:</strong> CA Inter / CMA / ACCA अध्ययन, Tally प्रमाणपत्र, GST व्यवसायी पाठ्यक्रमों और संबंधित कौशल उन्नयन कार्यक्रमों के लिए सहायता।</li>
            <li><strong>लचीला कार्य:</strong> प्रबंधन की स्वीकृति और वैधानिक फाइलिंग की समय-सीमाओं के अधीन।</li>
          </ul>

          <div style={{ fontWeight: 700, fontSize: '13px', marginTop: '5px', marginBottom: '2px' }}>
            वैकल्पिक सुविधाएं
          </div>
          <ul className="benefits-list">
            <li>कल्याण कार्यक्रम: जिम सदस्यता, मानसिक स्वास्थ्य सहायता।</li>
            <li>अतिरिक्त अवकाश: कंपनी नीति के अनुसार पितृत्व अवकाश, शोक अवकाश।</li>
            <li>सहायता: बाल देखभाल सहायता, स्थानांतरण सहायता यदि लागू हो।</li>
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
            का दोपहर भोजन अवकाश होगा, जो लागू राज्य दुकान एवं प्रतिष्ठान अधिनियम के अनुसार होगा। लेखांकन और वैधानिक फाइलिंग दायित्वों की प्रकृति को देखते हुए, कर्मचारी स्वीकार करता है कि GST रिटर्न तिथियों, TDS देय तिथियों, अग्रिम कर तिथियों और वित्तीय वर्ष-अंत समापन के दौरान विशेष रूप से अतिरिक्त घंटे काम करना आवश्यक हो सकता है। किसी भी अतिरिक्त कार्य का मुआवजा लागू कानून के अनुसार होगा।
          </div>

          {/* ५. प्रत्ययी कर्तव्य और वित्तीय ईमानदारी */}
          <div className="section-heading">५. प्रत्ययी कर्तव्य और वित्तीय ईमानदारी</div>
          <div className="body-text">
            कर्मचारी को सौंपी गई संवेदनशील वित्तीय भूमिका को ध्यान में रखते हुए, कर्मचारी स्पष्ट रूप से सहमत है कि वह:
          </div>
          <ul className="clause-list">
            <li>सदैव वित्तीय ईमानदारी और व्यावसायिक नैतिकता के उच्चतम मानकों को बनाए रखेगा;</li>
            <li>कंपनी की आंतरिक प्राधिकरण मैट्रिक्स के अनुसार उचित अनुमोदन के बिना कोई भी भुगतान, लेन-देन या वित्तीय प्रविष्टि नहीं करेगा, अधिकृत नहीं करेगा या सुगम नहीं बनाएगा;</li>
            <li>कोई भी वित्तीय अनियमितता, धोखाधड़ी, संदिग्ध दुर्विनियोजन या खातों में त्रुटि की सूचना लिखित रूप में तुरंत रिपोर्टिंग प्राधिकारी को देगा;</li>
            <li>बोर्ड ऑफ डायरेक्टर्स द्वारा लिखित रूप में स्पष्ट रूप से अधिकृत किए जाने के अलावा किसी भी कंपनी बैंक खाते का संचालन, उपयोग या हस्ताक्षर अधिकार नहीं रखेगा;</li>
            <li>कंपनी के व्यवसाय से जुड़े किसी भी विक्रेता, ठेकेदार या तीसरे पक्ष से कोई उपहार, कमीशन या लाभ स्वीकार नहीं करेगा।</li>
          </ul>
          <div className="body-text">
            प्रत्ययी कर्तव्य के किसी भी उल्लंघन पर कर्मचारी तत्काल समाप्ति, वित्तीय हानियों की वसूली और भारतीय दंड संहिता, 1860 और भ्रष्टाचार निवारण अधिनियम, 1988 के लागू प्रावधानों के अंतर्गत आपराधिक अभियोजन के लिए उत्तरदायी होगा।
          </div>

          {/* ६. गोपनीयता और डेटा संरक्षण */}
          <div className="section-heading">६. गोपनीयता और डेटा संरक्षण</div>
          <div className="body-text">
            कर्मचारी को कंपनी और उसके ग्राहकों की अत्यंत संवेदनशील वित्तीय और व्यक्तिगत जानकारी तक पहुंच होगी, जिसमें बैंक खाता विवरण, संपत्ति लेन-देन मूल्यांकन, ग्राहक पैन और आधार डेटा, लेखापरीक्षा रिपोर्ट, कर फाइलिंग और बोर्ड प्रस्ताव शामिल हैं, परंतु इन्हीं तक सीमित नहीं। कर्मचारी सहमत है कि वह:
          </div>
          <ul className="clause-list">
            <li>रोजगार की अवधि के दौरान और बाद में ऐसी सभी जानकारी को पूर्णतः गोपनीय रखेगा;</li>
            <li>पूर्व लिखित प्राधिकरण के बिना किसी भी वित्तीय डेटा या ग्राहक जानकारी को किसी तीसरे पक्ष को प्रकट, कॉपी, प्रेषित या दुरुपयोग नहीं करेगा;</li>
            <li>डिजिटल व्यक्तिगत डेटा संरक्षण अधिनियम, 2023 (DPDPA) और लागू IT और वित्तीय विनियमों के अंतर्गत सभी दायित्वों का पालन करेगा;</li>
            <li>रोजगार समाप्ति पर वित्तीय अभिलेखों, पासवर्ड या क्रेडेंशियल की कोई भी भौतिक या डिजिटल प्रति अपने पास नहीं रखेगा।</li>
          </ul>

          {/* ७. गैर-प्रतिस्पर्धा और गैर-आकर्षण */}
          <div className="section-heading">७. गैर-प्रतिस्पर्धा और गैर-आकर्षण</div>
          <div className="body-text">
            रोजगार की अवधि के दौरान और किसी भी कारण से रोजगार समाप्त होने के बाद{' '}
            <span className="underline-blank">{convertToHindi(data.employment?.nonCompetePeriod || '6 (छह) माह')}</span>{' '}
            की अवधि के लिए, कर्मचारी निम्नलिखित कार्य नहीं करेगा:
          </div>
          <ul className="clause-list">
            <li>कंपनी के प्राथमिक व्यवसाय स्थान की{' '}
              <span className="underline-blank">{convertToHindi(data.employment?.nonCompeteRadius || '25 कि.मी.')}</span>{' '}
              परिधि में कंपनी के रियल एस्टेट परिचालन के साथ प्रतिस्पर्धा करने वाले किसी व्यवसाय में प्रत्यक्ष या अप्रत्यक्ष रूप से संलग्न नहीं होगा, नियोजित नहीं होगा या लेखांकन / वित्तीय सेवाएं प्रदान नहीं करेगा;</li>
            <li>किसी भी प्रतिस्पर्धी या व्यक्तिगत वित्तीय उद्देश्य के लिए कंपनी के किसी ग्राहक, विक्रेता या व्यावसायिक सहयोगी से संपर्क, आग्रह या सलाह नहीं देगा;</li>
            <li>कंपनी के किसी कर्मचारी को उनका रोजगार छोड़ने के लिए प्रेरित या प्रयास नहीं करेगा।</li>
          </ul>

          {/* ८. रोजगार की समाप्ति */}
          <div className="section-heading">८. रोजगार की समाप्ति</div>

          <div className="sub-heading">कंपनी द्वारा समाप्ति</div>
          <div className="body-text">कंपनी निम्नलिखित परिस्थितियों में इस अनुबंध को समाप्त कर सकती है:</div>
          <ul className="termination-list">
            <li>
              <strong>कारण सहित (तत्काल बर्खास्तगी):</strong> वित्तीय धोखाधड़ी, गबन, खातों की जालसाजी, कंपनी को जुर्माना लगाने वाली वैधानिक फाइलिंग में जानबूझकर चूक, सकल कदाचार, या इस अनुबंध या कंपनी नीतियों के महत्वपूर्ण उल्लंघन के कारण बिना सूचना के तत्काल।
            </li>
            <li>
              <strong>कारण रहित:</strong>{' '}
              <span className="underline-blank">{convertToHindi(data.employment?.noticePeriodEmployer || '30 (तीस) दिन')}</span>{' '}
              की लिखित सूचना या सूचना के स्थान पर वेतन भुगतान प्रदान करके, लागू होने पर औद्योगिक विवाद अधिनियम, 1947 के लागू प्रावधानों के अधीन।
            </li>
          </ul>

          <div className="sub-heading">कर्मचारी द्वारा समाप्ति</div>
          <div className="body-text">
            कर्मचारी कंपनी को{' '}
            <span className="underline-blank">{convertToHindi(data.employment?.noticePeriodEmployee || '30 (तीस) दिन')}</span>{' '}
            की लिखित सूचना देकर इस्तीफा दे सकता है। रोजगार समाप्ति पर, कर्मचारी: (i) सभी लंबित वैधानिक फाइलिंग और खाता समाधान पूर्ण करेगा; (ii) सभी कंपनी संपत्ति, उपकरण, लॉगिन क्रेडेंशियल, डिजिटल हस्ताक्षर प्रमाणपत्र (DSC) और वित्तीय दस्तावेज़ सौंपेगा; (iii) नामित उत्तराधिकारी को औपचारिक खाता हस्तांतरण पूरा करेगा; और (iv) अंतिम निपटान से पहले नो-ड्यूज प्रमाण पत्र पर हस्ताक्षर करेगा।
          </div>

          {/* ९. शासक कानून और अधिकार क्षेत्र */}
          <div className="section-heading">९. शासक कानून और अधिकार क्षेत्र</div>
          <div className="body-text">
            यह अनुबंध कंपनी अधिनियम, 2013, अनुबंध अधिनियम, 1872, आयकर अधिनियम, 1961, GST अधिनियम, 2017 और लागू श्रम विधान सहित भारत के कानूनों के अनुसार शासित और निर्वचित किया जाएगा। इस अनुबंध से उत्पन्न या संबंधित किसी भी विवाद पर{' '}
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
            दोनों पक्ष स्वीकार करते हैं कि यह अनुबंध सभी लागू केंद्रीय और राज्य विधान के अधीन है और उसके अनुरूप निर्वचित किया जाएगा, जिसमें निम्नलिखित शामिल हैं, परंतु इन्हीं तक सीमित नहीं:
          </div>
          <div className="compliance-box">
            <strong>लागू विधान:</strong> कंपनी अधिनियम, 2013 &nbsp;|&nbsp; अनुबंध अधिनियम, 1872 &nbsp;|&nbsp; आयकर अधिनियम, 1961 &nbsp;|&nbsp; GST अधिनियम, 2017 &nbsp;|&nbsp; RERA, 2016 &nbsp;|&nbsp; EPF एवं MP अधिनियम, 1952 &nbsp;|&nbsp; ESI अधिनियम, 1948 &nbsp;|&nbsp; ग्रेच्युटी भुगतान अधिनियम, 1972 &nbsp;|&nbsp; बोनस भुगतान अधिनियम, 1965 &nbsp;|&nbsp; मातृत्व लाभ अधिनियम, 1961 &nbsp;|&nbsp; न्यूनतम वेतन अधिनियम, 1948 &nbsp;|&nbsp; वेतन भुगतान अधिनियम, 1936 &nbsp;|&nbsp; औद्योगिक विवाद अधिनियम, 1947 &nbsp;|&nbsp; धन शोधन निवारण अधिनियम, 2002 &nbsp;|&nbsp; IT अधिनियम, 2000 &nbsp;|&nbsp; डिजिटल व्यक्तिगत डेटा संरक्षण अधिनियम, 2023 &nbsp;|&nbsp; राज्य दुकान एवं प्रतिष्ठान अधिनियम (महाराष्ट्र)
          </div>
          <div className="body-text" style={{ marginTop: '4px' }}>
            इस अनुबंध की शर्तों और किसी भी लागू अधिनियम के प्रावधानों के बीच किसी भी विरोध की स्थिति में, अधिनियम की शर्तें प्रभावी होंगी। कर्मचारी आगे स्वीकार करता है कि एक वित्तीय अधिकारी के रूप में, वह वैधानिक अनुपालन में जानबूझकर की गई चूक या लापरवाही के लिए आयकर अधिनियम, 1961 और GST अधिनियम, 2017 के कुछ प्रावधानों के अंतर्गत व्यक्तिगत रूप से उत्तरदायी हो सकता है।
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

export default HindiOfficeAccountantAgreement;