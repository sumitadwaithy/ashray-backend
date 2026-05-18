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
  licenseNumber?: string;
  licenseExpiry?: string;
  licenseType?: string;
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

const HindiDriverAgreement = ({ data, companyLogo, companyWatermark }: TemplateProps) => {

  // ── तारीख हिंदी में ──
  const formatHindiDate = (dateStr?: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return convertNumberToHindi(dateStr);
    const day = convertNumberToHindi(date.getDate());
    const month = convertNumberToHindi(date.getMonth() + 1);
    const year = convertNumberToHindi(date.getFullYear());
    return `${day}/${month}/${year}`;
  };

  const safe = (v?: any) => (!v || v === '') ? '________' : String(v);

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
          line-height: 1.85;
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
          margin-bottom: 5px;
          letter-spacing: 0.4px;
        }
        .body-text {
          font-size: 13px;
          line-height: 1.95;
          text-align: justify;
          margin-bottom: 5px;
        }
        .duty-list {
          margin: 3px 0 5px 16px;
          font-size: 13px;
          line-height: 1.95;
          list-style-type: none;
          padding: 0;
        }
        .duty-list li {
          margin-bottom: 4px;
          display: flex;
          gap: 8px;
        }
        .duty-num {
          font-weight: 800;
          min-width: 32px;
          flex-shrink: 0;
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
          line-height: 1.95;
          list-style-type: disc;
        }
        .termination-list li {
          margin-bottom: 4px;
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
        .notice-box {
          border: 1.5px solid #c0392b;
          border-left: 4px solid #c0392b;
          background: #fff8f7;
          padding: 8px 12px;
          margin: 8px 0;
          font-size: 12.5px;
          line-height: 1.85;
          border-radius: 2px;
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
          <div className="agreement-title">रोजगार अनुबंध</div>
          <div className="agreement-subtitle">(वाहन चालक — कर्तव्य, जिम्मेदारियाँ एवं सेवा शर्तें)</div>

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
            {data.employee?.fatherName && <div><strong>पिता का नाम:</strong> {data.employee.fatherName}</div>}
            <div><strong>पता:</strong> {employeeAddress}</div>
            <div>
              <strong>जन्म तिथि:</strong>{' '}
              {data.employee?.dob ? formatHindiDate(data.employee.dob) : <span className="underline-blank" style={{ minWidth: '100px' }} />}
            </div>
            <div>
              <strong>आधार क्र.:</strong>{' '}
              {data.employee?.aadhaar ? formatAadhaarHindi(data.employee.aadhaar) : <span className="underline-blank" style={{ minWidth: '130px' }} />}
              &emsp;
              <strong>पैन क्र.:</strong>{' '}
              {data.employee?.pan || <span className="underline-blank" style={{ minWidth: '100px' }} />}
            </div>
            <div>
              <strong>ड्राइविंग लाइसेंस क्र.:</strong>{' '}
              <span className="underline-blank" style={{ minWidth: '130px' }}>{safe((data.employee as any)?.licenseNumber)}</span>
              &emsp;
              <strong>वैधता:</strong>{' '}
              <span className="underline-blank" style={{ minWidth: '90px' }}>{safe((data.employee as any)?.licenseExpiry)}</span>
            </div>
            <div style={{ fontStyle: 'italic' }}>(जिसे आगे <strong>"चालक"</strong> कहा जाएगा)</div>
          </div>

          {/* ══ १. पद और कर्तव्य ══ */}
          <div className="section-heading">१. पद और कर्तव्य</div>
          <div className="body-text">
            नियोक्ता एतद्द्वारा चालक को <strong>वाहन चालक</strong> के पद पर
            {data.employment?.department ? ` ${convertToHindi(data.employment.department)} विभाग में` : ''} नियुक्त करता है। चालक की तैनाती{' '}
            <span className="underline-blank">{safe(data.employment?.placeOfPosting)}</span>{' '}
            पर होगी तथा वे{' '}
            <span className="underline-blank">{safe(data.employment?.reportingTo)}</span>{' '}
            को रिपोर्ट करेंगे। चालक का मुख्य उत्तरदायित्व होगा कि वे नियोक्ता के अधिकृत वाहनों को सुरक्षित, अनुशासित एवं कानूनी रूप से संचालित करें तथा कार्यालय के कर्मचारियों, अधिकारियों एवं अधिकृत व्यक्तियों को निर्धारित गंतव्यों तक समय पर एवं सुरक्षित रूप से पहुँचाएँ।
          </div>

        </div>
        <PrintFooter />
      </div>

      <div className="a4-gap" />

      {/* ══════════════════════════════════════════
          पृष्ठ २
      ══════════════════════════════════════════ */}
      <div className="a4-page" style={{ position: "relative" }}>

        <div style={{
          position: "absolute", top: 0, left: 0, width: "100%", height: "100%",
          display: "flex", alignItems: "center", justifyContent: "center",
          opacity: 0.08, zIndex: 0, pointerEvents: "none",
        }}>
          <img src={companyWatermark || companyLogo || ''} style={{ width: "70%", maxWidth: "720px", height: "auto", objectFit: "contain" }} />
        </div>

        <div className="divider-page"></div>
        <div style={{ position: "relative", zIndex: 1 }}>

          {/* ══ २. मुख्य जिम्मेदारियाँ ══ */}
          <div className="section-heading">२. मुख्य जिम्मेदारियाँ</div>
          <ul className="duty-list">
            <li><span className="duty-num">२.१</span><span>कार्यालय से संबंधित समस्त अधिकृत व्यक्तियों को निर्धारित स्थान पर सुरक्षित रूप से पहुँचाना।</span></li>
            <li><span className="duty-num">२.२</span><span>वाहन को दिए गए निश्चित समय से <strong>०५ मिनट पहले</strong> स्वच्छ एवं तैयार अवस्था में उपलब्ध कराना।</span></li>
            <li><span className="duty-num">२.३</span><span>वाहन चलाते समय सभी यातायात नियमों का पूर्ण रूप से पालन करना।</span></li>
            <li><span className="duty-num">२.४</span><span>यात्रा के दौरान वाहन में स्थित एवं अन्य सभी व्यक्तियों के साथ अनुशासन, शालीनता एवं सम्मान से व्यवहार करना।</span></li>
            <li><span className="duty-num">२.५</span><span>यात्रा की गोपनीयता पूर्ण रूप से गोपनीय रखना।</span></li>
            <li><span className="duty-num">२.६</span><span>वाहन को निश्चित पार्किंग में ही पार्क करना।</span></li>
            <li><span className="duty-num">२.७</span><span>बिना नियोक्ता की लिखित अनुमति के कंपनी के वाहन का व्यक्तिगत उपयोग किसी भी परिस्थिति में नहीं करना।</span></li>
            <li><span className="duty-num">२.८</span><span>यात्रा से पूर्व निर्धारित मार्ग की जानकारी प्राप्त करना तथा आवश्यकतानुसार वैकल्पिक मार्ग की पहले से जानकारी रखना।</span></li>
          </ul>

          {/* ══ ३. वाहन देखभाल ══ */}
          <div className="section-heading">३. वाहन देखभाल</div>
          <ul className="duty-list">
            <li><span className="duty-num">३.१</span><span>वाहन की दैनिक देखभाल अति आवश्यक है अतः किसी भी यात्रा पर प्रस्थान करने से पहले ईंधन, ब्रेक, टायर, पानी, कूलेंट, इंजन ऑयल इत्यादि समस्त अच्छे से चेक करना।</span></li>
            <li><span className="duty-num">३.२</span><span>वाहन को प्रतिदिन साधारण रूप से अंदर-बाहर से साफ करना और सप्ताह में <strong>२ बार</strong> पूरी गहराई से साफ करना; परंतु यदि आवश्यकता है तो गहराई वाली सफाई २ से अधिक बार भी की जाएगी।</span></li>
            <li><span className="duty-num">३.३</span><span>किसी भी तकनीकी खराबी की सूचना तुरंत प्रबंधन को देना।</span></li>
            <li><span className="duty-num">३.४</span><span>वाहन की सर्विस और मरम्मत निर्धारित समय पर कराना।</span></li>
            <li><span className="duty-num">३.५</span><span>वाहन में कोई भी संरचनात्मक परिवर्तन, स्टीकर, सजावट आदि प्रबंधन की लिखित अनुमति के बिना नहीं किया जाएगा।</span></li>
          </ul>

          {/* ══ ४. दस्तावेज़ प्रबंधन ══ */}
          <div className="section-heading">४. दस्तावेज़ प्रबंधन</div>
          <ul className="duty-list">
            <li><span className="duty-num">४.१</span><span>वाहन के और स्वयं के समस्त आवश्यक दस्तावेज़ यातायात नियमों के अनुसार निर्धारित हैं — जिनमें वाहन पंजीकरण (RC), बीमा, प्रदूषण प्रमाणपत्र (PUC), ड्राइविंग लाइसेंस एवं अन्य आवश्यक कागजात सम्मिलित हैं — सदैव साथ में रखना।</span></li>
            <li><span className="duty-num">४.२</span><span>दस्तावेजों की वैधता को निर्धारित समय से पहले ही अपडेट करवाना।</span></li>
            <li><span className="duty-num">४.३</span><span>यातायात पुलिस अथवा किसी प्राधिकरण द्वारा जाँच किए जाने पर सभी दस्तावेज़ विनम्रता से प्रस्तुत करना।</span></li>
          </ul>

          {/* ══ ५. समय पालन ══ */}
          <div className="section-heading">५. समय पालन</div>
          <ul className="duty-list">
            <li><span className="duty-num">५.१</span><span>सामान्यतः आपका कर्तव्य समय सुबह <strong>०९:३०</strong> से संध्या <strong>०७:३०</strong> तक है; परंतु यदि आवश्यकता है तो आपको अतिरिक्त समय में भी कार्य करना होगा, उसके लिए आपको अतिरिक्त आराम प्रदान किया जा सकता है। इमर्जेंसी में आपको <strong>२४ घंटे</strong> में कभी भी कार्य पर आना होगा; उस समय आप अपनी पारिवारिक समस्याएं नहीं बताएँगे, परंतु इसका प्रतिफल आपको कार्य के अनुसार दिया जाएगा।</span></li>
            <li><span className="duty-num">५.२</span><span>यह कि किसी भी स्थिति में आपका कर्तव्य प्रथम है; उसके बाद ही आप अपना स्वयं का हित सोचेंगे।</span></li>
          </ul>

        </div>
        <PrintFooter />
      </div>

      <div className="a4-gap" />

      {/* ══════════════════════════════════════════
          पृष्ठ ३
      ══════════════════════════════════════════ */}
      <div className="a4-page" style={{ position: "relative" }}>

        <div style={{
          position: "absolute", top: 0, left: 0, width: "100%", height: "100%",
          display: "flex", alignItems: "center", justifyContent: "center",
          opacity: 0.08, zIndex: 0, pointerEvents: "none",
        }}>
          <img src={companyWatermark || companyLogo || ''} style={{ width: "70%", maxWidth: "720px", height: "auto", objectFit: "contain" }} />
        </div>

        <div style={{ position: "relative", zIndex: 1 }}>
          <div className="divider-page"></div>

          {/* ══ ६. सुरक्षा एवं अनुशासन ══ */}
          <div className="section-heading">६. सुरक्षा एवं अनुशासन</div>
          <ul className="duty-list">
            <li><span className="duty-num">६.१</span><span>शराब या नशे की हालत में वाहन कभी भी नहीं चलाया जाएगा। ऐसा पाए जाने पर तत्काल बर्खास्तगी तथा विधिक कार्यवाही की जाएगी।</span></li>
            <li><span className="duty-num">६.२</span><span>वाहन चलाते समय मोबाइल फोन का प्रयोग किसी भी अवस्था में नहीं किया जाएगा।</span></li>
            <li><span className="duty-num">६.३</span><span>वाहन में उपस्थित समस्त यात्रियों की सुरक्षा और सामने वाले वाहन और अन्य लोगों की सुरक्षा का विशेष ध्यान रखा जाएगा।</span></li>
            <li><span className="duty-num">६.४</span><span>यातायात नियमों का उल्लंघन — जैसे ओवर-स्पीडिंग, रेड लाइट तोड़ना, सीट बेल्ट न पहनना — किसी भी परिस्थिति में नहीं किया जाएगा।</span></li>
            <li><span className="duty-num">६.५</span><span>वर्दी (यदि प्रदान की गई हो) सदैव स्वच्छ एवं सुव्यवस्थित रूप से पहनी जाएगी।</span></li>
            <li><span className="duty-num">६.६</span><span>कार्यालय के कर्मचारियों एवं यात्रियों से किसी भी प्रकार का अभद्र, असम्मानजनक अथवा विवादास्पद व्यवहार नहीं किया जाएगा।</span></li>
            <li><span className="duty-num">६.७</span><span>वाहन में अधिकृत यात्रियों के अतिरिक्त किसी भी अन्य व्यक्ति को बिना अनुमति के नहीं बैठाया जाएगा।</span></li>
          </ul>

          {/* ══ ७. छुट्टी, वेतन एवं अन्य ══ */}
          <div className="section-heading">७. छुट्टी, वेतन एवं अन्य</div>
          <ul className="duty-list">
            <li><span className="duty-num">७.१</span><span>माह में केवल <strong>०२ अवकाश</strong> आपको निर्धारित हैं; यह आप कम से कम <strong>०२ दिन पहले</strong> सूचित करके प्राप्त कर सकते हैं। परंतु यदि आप अचानक बताकर अवकाश लेते हैं तो आपका वेतन काटा जाएगा, क्योंकि उस कार्य हेतु दूसरा चालक बुलाया जाएगा और उसको जो भी भुगतान किया जाएगा वह आपकी मासिक भुगतान राशि से ही काटा जाएगा — यह आपके एक दिन के वेतन से अधिक भी हो सकता है।</span></li>
            <li><span className="duty-num">७.२</span><span>इमरजेंसी में आप तुरंत बताकर अवकाश प्राप्त कर सकते हैं; परंतु यह सत्य होना चाहिए — यदि असत्यता पाई जाती है तो आपका अवकाश से <strong>दो गुना वेतन</strong> काटा जाएगा।</span></li>
            <li><span className="duty-num">७.३</span><span>यदि आपको किसी दूसरी जगह इससे अधिक की नौकरी प्राप्त हो रही है, तो आप कम से कम <strong>९० दिन पहले लिखित में सूचना</strong> देंगे और ९१वें दिन से आप नौकरी छोड़कर जा सकते हैं। यदि आप अचानक छोड़कर जाते हैं तो आपका जितना भी बकाया भुगतान लेना है, किसी भी स्थिति में नहीं दिया जाएगा।</span></li>
            <li><span className="duty-num">७.४</span><span>यह कि आपको अपना स्वयं का एक <strong>व्यक्तिगत बीमा</strong> कराना आवश्यक है; परंतु यदि आप नहीं करते हैं तो किसी भी दुर्घटना की स्थिति में {employerFullName} अजिम्मेदार नहीं होगा।</span></li>
            <li><span className="duty-num">७.५</span><span>यदि आपको बिल्कुल छोटे समय के लिए अवकाश चाहिए तो आप कार्यालय के रजिस्टर में इंट्री करके जा सकते हैं; परंतु आने-जाने का समय लिखना अनिवार्य है।</span></li>
            <li><span className="duty-num">७.६</span><span>यह कि आपको कार्यालय कार्यालय में कार्यरत व्यक्ति के स्थान पर भी काम करना है यदि वह बंदा छुट्टी पर है; इसके लिए आप किसी भी प्रकार से यह नहीं बोलेंगे कि "यह मेरा कार्यक्षेत्र नहीं है" — आपको कार्यालय का कार्य भी कार्यालय कार्यकारी से सीखना है।</span></li>
          </ul>

          {/* ══ ८. वेतन एवं मुआवजा ══ */}
          <div className="section-heading">८. वेतन एवं मुआवजा</div>

          <div className="sub-heading">वेतन</div>
          <div className="body-text">
            नियोक्ता चालक को ₹{' '}
            <span className="underline-blank">{convertNumberToHindi(data.employment?.grossAnnualSalary || '')}</span>
            /- (रुपये{' '}
            <span className="underline-blank" style={{ minWidth: '160px' }}>{convertToHindi(data.employment?.grossAnnualSalaryWords || '')}</span>{' '}
            मात्र) का सकल वार्षिक वेतन का भुगतान करेगा, जो ₹{' '}
            <span className="underline-blank">{convertNumberToHindi(data.employment?.grossMonthlySalary || '')}</span>
            /- (रुपये{' '}
            <span className="underline-blank" style={{ minWidth: '140px' }}>{convertToHindi(data.employment?.grossMonthlySalaryWords || '')}</span>{' '}
            मात्र) के सकल मासिक वेतन के समतुल्य है, जो लागू कटौतियों और वैधानिक रोके के अधीन समान मासिक किस्तों में देय होगा।
          </div>

          <div className="sub-heading">लाभ</div>
          <div className="body-text">
            चालक नियोक्ता की मानक नीतियों के अनुसार लाभों के लिए पात्र होगा, जिनमें निम्नलिखित शामिल हो सकते हैं:
          </div>

          <div style={{ fontWeight: 700, fontSize: '13px', marginTop: '5px', marginBottom: '2px' }}>
            अनिवार्य वैधानिक लाभ
          </div>
          <ul className="benefits-list">
            <li><strong>कर्मचारी भविष्य निधि (ईपीएफ):</strong> 20 या अधिक कर्मचारियों वाली कंपनियों के लिए अनिवार्य।</li>
            <li><strong>कर्मचारी राज्य बीमा (ईएसआई):</strong> आवश्यक यदि कंपनी का आकार 10 कर्मचारियों (कुछ राज्यों में 20) से अधिक हो और कर्मचारी ₹21,000 प्रति माह से कम अर्जित करते हों।</li>
            <li><strong>ग्रेच्युटी:</strong> देय यदि चालक ने 5 वर्ष की निरंतर सेवा पूर्ण की हो।</li>
            <li><strong>अवकाश नीति:</strong> सवैतनिक वार्षिक / अर्जित अवकाश ({convertNumberToHindi(data.employment?.annualLeaves || '12')} दिन), बीमारी / चिकित्सा अवकाश ({convertNumberToHindi(data.employment?.medicalLeaves || '6')} दिन) और आकस्मिक अवकाश ({convertNumberToHindi(data.employment?.casualLeaves || '6')} दिन) शामिल हैं।</li>
            <li><strong>मातृत्व लाभ:</strong> मातृत्व लाभ अधिनियम, 1961 के अनुसार पात्र महिला कर्मचारियों के लिए सवैतनिक अवकाश।</li>
          </ul>

          <div style={{ fontWeight: 700, fontSize: '13px', marginTop: '5px', marginBottom: '2px' }}>
            अतिरिक्त परिचालन लाभ
          </div>
          <ul className="benefits-list">
            <li><strong>ईंधन एवं टोल:</strong> कार्यालय संबंधित यात्राओं का संपूर्ण ईंधन एवं टोल व्यय नियोक्ता द्वारा वहन किया जाएगा।</li>
            <li><strong>ओवरटाइम प्रतिफल:</strong> निर्धारित कार्य घंटों से अधिक ड्यूटी पर प्रबंधन की नीति अनुसार उचित प्रतिफल।</li>
            <li><strong>वर्दी:</strong> यदि नियोक्ता द्वारा वर्दी प्रदान की जाती है तो उसकी धुलाई एवं रखरखाव चालक की स्वयं की जिम्मेदारी होगी।</li>
          </ul>

        </div>
        <PrintFooter />
      </div>

      <div className="a4-gap" />

      {/* ══════════════════════════════════════════
          पृष्ठ ४
      ══════════════════════════════════════════ */}
      <div className="a4-page" style={{ position: "relative" }}>

        <div style={{
          position: "absolute", top: 0, left: 0, width: "100%", height: "100%",
          display: "flex", alignItems: "center", justifyContent: "center",
          opacity: 0.08, zIndex: 0, pointerEvents: "none",
        }}>
          <img src={companyWatermark || companyLogo || ''} style={{ width: "70%", maxWidth: "720px", height: "auto", objectFit: "contain" }} />
        </div>

        <div style={{ position: "relative", zIndex: 1 }}>
          <div className="divider-page"></div>

          {/* ══ ९. नियोजन का प्रारंभ ══ */}
          <div className="section-heading">९. नियोजन का प्रारंभ</div>
          <div className="body-text">
            नियोक्ता के साथ चालक का रोजगार{' '}
            <span className="underline-blank">{formatHindiDate(data.employment?.joiningDate)}</span>{' '}
            से प्रारंभ होगा। चालक सम्मिलित होने की तारीख से{' '}
            <strong>{data.employment?.probationPeriod || '3 (तीन) माह'}</strong>{' '}
            की परीविक्षा (प्रोबेशन) पर रहेगा, जिस दौरान कोई भी पक्ष बिना कारण या पूर्व सूचना के इस अनुबंध को समाप्त कर सकता है। परीविक्षा सफलतापूर्वक पूर्ण होने पर, रोजगार की लिखित पुष्टि की जाएगी।
          </div>

          {/* ══ १०. गोपनीयता ══ */}
          <div className="section-heading">१०. गोपनीयता</div>
          <div className="body-text">
            चालक स्वीकार करता है कि रोजगार के दौरान उसे नियोक्ता के कार्यालय, यात्रियों, व्यावसायिक गतिविधियों एवं आंतरिक सूचनाओं तक पहुँच प्राप्त होगी, जिसमें ग्राहक सूचियाँ, संपत्ति सूचियाँ, वित्तीय डेटा, विपणन रणनीतियाँ एवं व्यावसायिक योजनाएँ सम्मिलित हैं, परंतु इन्हीं तक सीमित नहीं। चालक ऐसी सभी जानकारी को पूर्णतः गोपनीय रखने और इसे किसी तीसरे पक्ष को प्रकट नहीं करने या रोजगार की अवधि के दौरान एवं बाद में नियोक्ता के लाभ के अलावा किसी अन्य उद्देश्य के लिए उपयोग नहीं करने के लिए सहमत है। यात्रियों की पहचान, गंतव्य एवं कंपनी की किसी भी आंतरिक जानकारी को सार्वजनिक करना इस अनुबंध का गंभीर उल्लंघन माना जाएगा।
          </div>

          {/* ══ ११. रोजगार की समाप्ति ══ */}
          <div className="section-heading">११. रोजगार की समाप्ति</div>

          <div className="sub-heading">नियोक्ता द्वारा समाप्ति</div>
          <div className="body-text">नियोक्ता निम्नलिखित में से किसी भी कारण से चालक का रोजगार समाप्त कर सकता है:</div>
          <ul className="termination-list">
            <li>
              <strong>कारण सहित:</strong> तत्काल, कारणों के लिए जिनमें नशे की हालत में ड्राइविंग, दुर्घटना जिसमें चालक की लापरवाही सिद्ध हो, वाहन का अनाधिकृत उपयोग, यात्री के साथ दुर्व्यवहार, गोपनीयता भंग, दस्तावेज़ जालसाजी, सकल कदाचार, अवज्ञा, धोखाधड़ी, या इस अनुबंध का महत्वपूर्ण उल्लंघन शामिल है, परंतु इन्हीं तक सीमित नहीं।
            </li>
            <li>
              <strong>कारण रहित:</strong>{' '}
              <span className="underline-blank">{convertToHindi(data.employment?.noticePeriodEmployer || '30 (तीस) दिन')}</span>{' '}
              की लिखित सूचना या सूचना के स्थान पर भुगतान प्रदान करके।
            </li>
          </ul>

          <div className="sub-heading">चालक द्वारा समाप्ति</div>
          <div className="body-text">
            चालक नियोक्ता को{' '}
            <span className="underline-blank">{data.employment?.noticePeriodEmployee || '90 (नब्बे) दिन'}</span>{' '}
            की लिखित सूचना देकर अपना रोजगार समाप्त कर सकता है। समाप्ति पर, चालक तुरंत वाहन की चाबियाँ, ईंधन कार्ड, पास, वर्दी, कंपनी संपत्ति, दस्तावेज़, अभिलेख और नियोक्ता से संबंधित किसी भी अन्य संपत्ति वापस करेगा।
          </div>

          {/* ══ १२. शासक कानून और अधिकार क्षेत्र ══ */}
          <div className="section-heading">१२. शासक कानून और अधिकार क्षेत्र</div>
          <div className="body-text">
            यह अनुबंध भारत के कानूनों के अनुसार शासित और निर्वचित किया जाएगा।
            इस अनुबंध से उत्पन्न या संबंधित किसी भी विवाद पर{' '}
            <span className="underline-blank">{data.employment?.jurisdiction || data.company?.companyDistrict || ''}</span>{' '}
            के न्यायालयों का अनन्य अधिकार क्षेत्र होगा।
          </div>

          {/* ══ १३. संपूर्ण अनुबंध ══ */}
          <div className="section-heading">१३. संपूर्ण अनुबंध</div>
          <div className="body-text">
            यह अनुबंध रोजगार की शर्तों के संबंध में नियोक्ता और चालक के बीच संपूर्ण अनुबंध का गठन करता है और सभी पूर्व चर्चाओं, वार्ताओं और अनुबंधों, चाहे लिखित हों या मौखिक, को अधिक्रमित करता है।
          </div>

          {/* ══ १४. संशोधन ══ */}
          <div className="section-heading">१४. संशोधन</div>
          <div className="body-text">
            इस अनुबंध में कोई भी संशोधन या परिवर्तन लिखित रूप में होना चाहिए और नियोक्ता तथा चालक दोनों द्वारा हस्ताक्षरित होना चाहिए।
          </div>

          {/* ══ १५. पृथक्करणीयता ══ */}
          <div className="section-heading">१५. पृथक्करणीयता</div>
          <div className="body-text">
            यदि इस अनुबंध का कोई प्रावधान अवैध या अप्रवर्तनीय माना जाता है, तो शेष प्रावधान कानून द्वारा अनुमत अधिकतम सीमा तक वैध और प्रवर्तनीय बने रहेंगे।
          </div>

          {/* ══ चालक की सहमति एवं हस्ताक्षर ══ */}
          <div className="notice-box">
            <div style={{ fontWeight: 800, fontSize: '13.5px', marginBottom: '6px', textDecoration: 'underline' }}>
              चालक की सहमति एवं हस्ताक्षर
            </div>
            <div className="body-text" style={{ marginBottom: 0 }}>
              यह कि मैं <span className="underline-blank" style={{ minWidth: '180px' }}>{employeeFullName}</span> ने उपरोक्त समस्त को बहुत अच्छे से पढ़ व समझ लिया है और मैं पूर्ण रूप से सहमत हूँ। यदि मैं उपरोक्त लिखित के विपरीत कार्यवाही करता हूँ, तो उसके अनुसार मुझ पर कार्यवाही की जाए — मुझे कोई आपत्ति नहीं है।
            </div>
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

            {/* चालक के हस्ताक्षर */}
            <div className="sig-block">
              <div className="sig-block-title">चालक के हस्ताक्षर</div>
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
                बायाँ अंगूठा निशान:-
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

export default HindiDriverAgreement;