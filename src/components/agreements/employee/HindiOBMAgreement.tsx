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

const HindiOnlineBusinessManagerAgreement = ({ data, companyLogo, companyWatermark }: TemplateProps) => {

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

  // ── हिंदी डिफ़ॉल्ट कर्तव्य ──
  const defaultDuties = [
    "कंपनी की संपूर्ण ऑनलाइन व्यावसायिक उपस्थिति का प्रबंधन एवं निरीक्षण करना, जिसमें आधिकारिक वेबसाइट, सोशल मीडिया चैनल (Instagram, Facebook, YouTube, LinkedIn, WhatsApp Business), रियल एस्टेट लिस्टिंग पोर्टल (MagicBricks, 99acres, Housing.com, NoBroker) एवं Google Business Profile सम्मिलित हैं।",
    "नई परियोजना लॉन्च, भूखण्ड एवं संपत्ति विक्रय, त्योहारी ऑफर एवं ब्रांड-निर्माण पहलों के लिए समस्त डिजिटल मार्केटिंग अभियानों की योजना बनाना, क्रियान्वयन करना, समन्वय करना एवं निगरानी करना, यह सुनिश्चित करते हुए कि अभियान के उद्देश्य स्वीकृत बजट एवं समय-सीमा के भीतर पूर्ण हों।",
    "कंपनी की CRM (ग्राहक संबंध प्रबंधन) प्रणाली का प्रबंधन एवं निरीक्षण करना — जिसमें लीड एंट्री, लीड आवंटन, फॉलो-अप ट्रैकिंग, पाइपलाइन प्रबंधन एवं समय पर रूपांतरण सुनिश्चित करने हेतु बिक्री दल के साथ समन्वय सम्मिलित है।",
    "डिजिटल ऑपरेशन्स कार्यकारी एवं अन्य डिजिटल अथवा मार्केटिंग टीम के सदस्यों का निर्देशन एवं पर्यवेक्षण करना — कार्य आवंटित करना, उत्पादन की समीक्षा करना, साप्ताहिक एवं मासिक लक्ष्य निर्धारित करना तथा वरिष्ठ प्रबंधन को प्रदर्शन रिपोर्ट प्रस्तुत करना।",
    "समस्त सशुल्क डिजिटल विज्ञापन खातों (Meta Business Manager, Google Ads, YouTube Ads) का प्रबंधन करना, जिसमें अभियान निर्माण, बजट आवंटन, A/B परीक्षण, ऑडियंस टार्गेटिंग, प्रदर्शन निगरानी, ROAS ट्रैकिंग एवं अधिकतम लीड जनरेशन के लिए अनुकूलन सम्मिलित है।",
    "समस्त डिजिटल कंटेंट — जिसमें प्रॉपर्टी वॉकथ्रू, प्रोजेक्ट लॉन्च वीडियो, Reels, प्रशंसापत्र, प्रचार ग्राफिक्स, ईमेल अभियान एवं WhatsApp ब्रॉडकास्ट कंटेंट सम्मिलित हैं — के निर्माण, शेड्यूलिंग एवं प्रकाशन की निगरानी करना, सदैव ब्रांड की एकरूपता बनाए रखना।",
    "रीच, इंप्रेशन, CPL (प्रति लीड लागत), रूपांतरण दर, अभियान ROI, वेबसाइट ट्रैफिक एवं सोशल मीडिया एंगेजमेंट सहित समस्त डिजिटल प्रदर्शन मेट्रिक्स की निगरानी, विश्लेषण एवं रिपोर्टिंग करना तथा प्रबंधन को साप्ताहिक एवं मासिक MIS रिपोर्ट प्रस्तुत करना।",
    "डिजिटल सेवाओं के लिए विक्रेता संबंधों का प्रबंधन करना — जिसमें कंटेंट क्रिएटर, वीडियोग्राफर, ग्राफिक डिज़ाइनर, मीडिया एजेंसियाँ, SEO/SEM सलाहकार एवं वेबसाइट डेवलपर सम्मिलित हैं — जिसमें अनुबंध वार्ता, चालान अनुमोदन एवं गुणवत्ता सुनिश्चित करना भी शामिल है।",
    "यह सुनिश्चित करना कि सभी डिजिटल परिचालन लागू विधियों एवं विनियमों के अनुरूप हों, जिनमें सूचना प्रौद्योगिकी अधिनियम, 2000; डिजिटल व्यक्तिगत डेटा संरक्षण अधिनियम, 2023; एवं RERA (रियल एस्टेट विनियमन एवं विकास अधिनियम, 2016) के विज्ञापन दिशा-निर्देश सम्मिलित हैं।",
    "कंपनी की समस्त डिजिटल संपदाओं की सुरक्षा का स्वामित्व एवं रखरखाव करना — जिसमें सोशल मीडिया खाता क्रेडेंशियल्स, विज्ञापन खाता लॉगिन, वेबसाइट बैकएंड एक्सेस, डोमेन पंजीकरण, होस्टिंग खाते एवं CRM लॉगिन विवरण सम्मिलित हैं — किसी भी अनाधिकृत पहुँच अथवा डेटा उल्लंघन को रोकना।",
    "कंपनी की ऑनलाइन व्यावसायिक प्रदर्शन एवं प्रतिस्पर्धात्मक स्थिति में निरंतर सुधार हेतु उभरते डिजिटल प्लेटफॉर्म, उपकरण, मार्केटिंग प्रौद्योगिकियों एवं ऑटोमेशन समाधानों पर शोध करना एवं सिफारिश करना।",
    "समय-समय पर प्रबंधन द्वारा सौंपे गए अन्य ऑनलाइन व्यावसायिक प्रबंधन, डिजिटल मार्केटिंग अथवा परिचालन कर्तव्यों का निर्वहन करना।",
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
        .clause-list {
          margin: 3px 0 5px 20px;
          font-size: 13px;
          line-height: 2;
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

          {/* ── शीर्षक ── */}
          <div className="agreement-title">रोजगार अनुबंध</div>
          <div className="agreement-subtitle">(ऑनलाइन व्यवसाय प्रबंधक)</div>

          {/* ── प्रस्तावना ── */}
          <div className="body-text">
            यह रोजगार अनुबंध <strong>("अनुबंध")</strong> दिनांक{' '}
            <span className="underline-blank">{formatHindiDate(data.employment?.joiningDate)}</span>{' '}
            को निम्नलिखित पक्षों के बीच निष्पादित किया गया है:
          </div>

          {/* ── नियोक्ता ── */}
          <div className="party-block">
            <div className="party-name">{employerFullName}</div>
            <div><strong>पंजीकृत पता:</strong> {employerAddress}</div>
            <div><strong>सीआईएन:</strong> {data.company?.cinNumber || <span className="underline-blank" style={{ minWidth: '160px' }} />}</div>
            <div><strong>पैन:</strong> {data.company?.companyPan || <span className="underline-blank" style={{ minWidth: '120px' }} />}</div>
            <div style={{ fontStyle: 'italic' }}>
              (कंपनी अधिनियम, 2013 के अंतर्गत निगमित एक कंपनी, जिसे आगे <strong>"कंपनी"</strong> अथवा <strong>"नियोक्ता"</strong> कहा जाएगा)
            </div>
          </div>

          <div className="and-divider">और</div>

          {/* ── कर्मचारी ── */}
          <div className="party-block">
            <div className="party-name">{employeeFullName}</div>
            <div><strong>पता:</strong> {employeeAddress}</div>
            <div>
              <strong>योग्यता:</strong>{' '}
              {data.employee?.qualification || <span className="underline-blank" style={{ minWidth: '160px' }} />}
            </div>
            <div><strong>जन्म तिथि:</strong> {data.employee?.dob ? formatHindiDate(data.employee.dob) : <span className="underline-blank" style={{ minWidth: '100px' }} />}</div>
            <div>
              <strong>आधार क्र.:</strong>{' '}
              {data.employee?.aadhaar ? formatAadhaarHindi(data.employee.aadhaar) : <span className="underline-blank" style={{ minWidth: '120px' }} />}
              &emsp;
              <strong>पैन क्र.:</strong>{' '}
              {data.employee?.pan || <span className="underline-blank" style={{ minWidth: '100px' }} />}
            </div>
            <div style={{ fontStyle: 'italic' }}>(जिसे आगे <strong>"कर्मचारी"</strong> कहा जाएगा)</div>
          </div>

          {/* ══ १. पद और कर्तव्य ══ */}
          <div className="section-heading">१. पद और कर्तव्य</div>
          <div className="body-text">
            कंपनी एतद्द्वारा कर्मचारी को <strong>ऑनलाइन व्यवसाय प्रबंधक</strong> के पद पर
            {data.employment?.department ? ` ${convertToHindi(data.employment.department)} विभाग में` : ''} नियुक्त करती है। कर्मचारी{' '}
            <span className="underline-blank">{convertToHindi(data.employment?.reportingTo || '')}</span>{' '}
            को रिपोर्ट करेगा/करेगी तथा रियल एस्टेट क्षेत्र में कंपनी की संपूर्ण ऑनलाइन व्यावसायिक उपस्थिति, डिजिटल मार्केटिंग परिचालन, टीम पर्यवेक्षण एवं ऑनलाइन राजस्व सृजन गतिविधियों का परिश्रमपूर्वक प्रबंधन, निरीक्षण एवं विस्तार करेगा/करेगी, जिनमें निम्नलिखित सम्मिलित हैं किंतु इन्हीं तक सीमित नहीं:
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

        <div style={{
          position: "absolute", top: 0, left: 0, width: "100%", height: "100%",
          display: "flex", alignItems: "center", justifyContent: "center",
          opacity: 0.08, zIndex: 0, pointerEvents: "none",
        }}>
          <img src={companyWatermark || companyLogo || ''}
            style={{ width: "70%", maxWidth: "720px", height: "auto", objectFit: "contain" }} />
        </div>

        <div className="divider-page"></div>
        <div style={{ position: "relative", zIndex: 1 }}>

          {/* ══ २. नियोजन का प्रारंभ एवं परीविक्षा ══ */}
          <div className="section-heading">२. नियोजन का प्रारंभ एवं परीविक्षा</div>
          <div className="body-text">
            कर्मचारी का रोजगार{' '}
            <span className="underline-blank">{formatHindiDate(data.employment?.joiningDate)}</span>{' '}
            से प्रारंभ होगा। कर्मचारी सम्मिलित होने की तारीख से{' '}
            <strong>{data.employment?.probationPeriod || '3 (तीन) माह'}</strong>{' '}
            की परीविक्षा (प्रोबेशन) अवधि पर रहेगा/रहेगी, जिस दौरान कोई भी पक्ष बिना कारण या पूर्व सूचना के इस अनुबंध को समाप्त कर सकता है। परीविक्षा अवधि संतोषजनक रूप से पूर्ण होने पर कंपनी के HR नीति के अनुसार एक अधिकृत अधिकारी द्वारा लिखित रूप में रोजगार की पुष्टि की जाएगी। परीविक्षा अवधि के दौरान कर्मचारी के डिजिटल प्रदर्शन, टीम प्रबंधन क्षमता एवं अभियान परिणामों का सहमत KPI के विरुद्ध मूल्यांकन किया जाएगा।
          </div>

          {/* ══ ३. पारिश्रमिक ══ */}
          <div className="section-heading">३. पारिश्रमिक</div>

          <div className="sub-heading">वेतन</div>
          <div className="body-text">
            कंपनी कर्मचारी को ₹{' '}
            <span className="underline-blank">{convertNumberToHindi(data.employment?.grossAnnualSalary || '')}</span>
            /- (रुपये{' '}
            <span className="underline-blank" style={{ minWidth: '160px' }}>{convertToHindi(data.employment?.grossAnnualSalaryWords || '')}</span>{' '}
            मात्र) का सकल वार्षिक वेतन, जो ₹{' '}
            <span className="underline-blank">{convertNumberToHindi(data.employment?.grossMonthlySalary || '')}</span>
            /- (रुपये{' '}
            <span className="underline-blank" style={{ minWidth: '140px' }}>{convertToHindi(data.employment?.grossMonthlySalaryWords || '')}</span>{' '}
            मात्र) के सकल मासिक वेतन के समतुल्य है, अगले माह की 7 तारीख तक या उससे पहले समान मासिक किस्तों में भुगतान करेगी — लागू कटौतियों, आयकर अधिनियम, 1961 के अंतर्गत TDS एवं भारतीय कानून के तहत निर्धारित समस्त वैधानिक रोके के अधीन।
          </div>

          <div className="sub-heading">डिजिटल उपकरण एवं प्लेटफॉर्म बजट</div>
          <div className="body-text">
            उपरोक्त वेतन के अतिरिक्त, कंपनी ऑनलाइन व्यावसायिक प्रबंधन कर्तव्यों के निर्वहन हेतु आवश्यक स्वीकृत सदस्यताओं, उपकरणों एवं विज्ञापन बजट का व्यय वहन करेगी, जिनमें सम्मिलित हैं:
          </div>
          <ul className="benefits-list">
            <li><strong>विज्ञापन व्यय:</strong> Meta Ads, Google Ads एवं YouTube Ads का बजट पूर्णतः कंपनी द्वारा आवंटित एवं वहन किया जाएगा। कर्मचारी अधिकृत प्रबंधन प्रतिनिधि की पूर्व लिखित स्वीकृति के बिना कोई भी विज्ञापन व्यय नहीं करेगा/करेगी।</li>
            <li><strong>डिज़ाइन एवं कंटेंट उपकरण:</strong> कंपनी द्वारा अनुमोदित Canva Pro, Adobe Creative Suite, CapCut Pro अथवा समकक्ष उपकरण।</li>
            <li><strong>CRM एवं ऑटोमेशन:</strong> CRM सॉफ्टवेयर लाइसेंस, WhatsApp Business API, ईमेल मार्केटिंग प्लेटफॉर्म एवं अन्य अनुमोदित डिजिटल प्रबंधन उपकरण।</li>
            <li><strong>विश्लेषण एवं रिपोर्टिंग उपकरण:</strong> Meta Business Suite, Google Analytics, Google Search Console एवं अनुमोदित तृतीय-पक्ष विश्लेषण प्लेटफॉर्म।</li>
          </ul>

          <div className="sub-heading">वैधानिक लाभ</div>
          <div className="body-text">
            प्राइवेट लिमिटेड कंपनियों पर लागू भारतीय श्रम विधान के अनुसार कर्मचारी निम्नलिखित वैधानिक लाभों का पात्र होगा/होगी:
          </div>

          <div style={{ fontWeight: 700, fontSize: '13px', marginTop: '5px', marginBottom: '2px' }}>
            अनिवार्य वैधानिक लाभ
          </div>
          <ul className="benefits-list">
            <li><strong>कर्मचारी भविष्य निधि (EPF) — EPF एवं MP अधिनियम, 1952:</strong> नियोक्ता एवं कर्मचारी दोनों मूल वेतन का 12% अंशदान करेंगे। लागू जब कंपनी में 20 या अधिक व्यक्ति कार्यरत हों।</li>
            <li><strong>कर्मचारी राज्य बीमा (ESI) — ESI अधिनियम, 1948:</strong> लागू जहाँ सकल वेतन ₹21,000/- प्रतिमाह या उससे कम हो और प्रतिष्ठान में 10 या अधिक व्यक्ति कार्यरत हों।</li>
            <li><strong>उपदान — उपदान भुगतान अधिनियम, 1972:</strong> 5 वर्ष की निरंतर सेवा पूर्ण होने पर प्रत्येक पूर्ण सेवा वर्ष के लिए 15 दिन के वेतन की दर से देय।</li>
            <li>
              <strong>अवकाश — दुकान एवं प्रतिष्ठान अधिनियम (राज्य):</strong> सवैतनिक वार्षिक/अर्जित अवकाश ({convertNumberToHindi(data.employment?.annualLeaves || '12')} दिन),
              बीमारी/चिकित्सा अवकाश ({convertNumberToHindi(data.employment?.medicalLeaves || '6')} दिन) एवं आकस्मिक अवकाश ({convertNumberToHindi(data.employment?.casualLeaves || '6')} दिन) प्रति कैलेंडर वर्ष।
            </li>
            <li><strong>मातृत्व लाभ — मातृत्व लाभ अधिनियम, 1961:</strong> पात्र महिला कर्मचारियों को 26 सप्ताह का सवैतनिक मातृत्व अवकाश (अधिकतम 2 जीवित बच्चों तक); बाद की गर्भावस्था में 12 सप्ताह।</li>
            <li><strong>बोनस — बोनस भुगतान अधिनियम, 1965:</strong> कंपनी की वार्षिक टर्नओवर की अधिनियम के अंतर्गत योग्यता के अनुसार लागू।</li>
          </ul>

          <div style={{ fontWeight: 700, fontSize: '13px', marginTop: '5px', marginBottom: '2px' }}>
            स्वैच्छिक / प्रतिस्पर्धी लाभ
          </div>
          <ul className="benefits-list">
            <li><strong>समूह स्वास्थ्य बीमा:</strong> कंपनी नीति के अनुसार व्यापक चिकित्सा कवरेज।</li>
            <li><strong>प्रदर्शन प्रोत्साहन:</strong> लीड जनरेशन लक्ष्यों, अभियान ROI, ROAS बेंचमार्क एवं डिजिटल विकास KPI से जुड़े प्रदर्शन-आधारित बोनस, बोर्ड/प्रबंधन के विवेकाधिकार पर।</li>
            <li><strong>व्यावसायिक प्रमाणन:</strong> Meta Blueprint, Google Ads प्रमाणन, HubSpot Academy, डिजिटल मार्केटिंग पाठ्यक्रम एवं नेतृत्व विकास कार्यक्रमों हेतु कंपनी-प्रायोजित पहुँच।</li>
            <li><strong>लचीला कार्य:</strong> प्रबंधन की स्वीकृति एवं परिचालन आवश्यकताओं के अधीन हाइब्रिड/दूरस्थ कार्य विकल्प।</li>
            <li><strong>इंटरनेट एवं डिवाइस भत्ता:</strong> हाई-स्पीड इंटरनेट हेतु मासिक प्रतिपूर्ति तथा कार्य डिवाइस का प्रावधान अथवा प्रतिपूर्ति, स्वीकृति के अधीन।</li>
          </ul>

          <div style={{ fontWeight: 700, fontSize: '13px', marginTop: '5px', marginBottom: '2px' }}>
            वैकल्पिक सुविधाएं
          </div>
          <ul className="benefits-list">
            <li>कल्याण कार्यक्रम: मानसिक स्वास्थ्य सहायता, स्वास्थ्य जाँच।</li>
            <li>अतिरिक्त अवकाश: कंपनी नीति के अनुसार पितृत्व अवकाश, शोक अवकाश।</li>
            <li>भविष्य निधि अंशदान एवं कंपनी द्वारा समय-समय पर निर्धारित अन्य लाभ।</li>
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
          <img src={companyWatermark || companyLogo || ''}
            style={{ width: "70%", maxWidth: "720px", height: "auto", objectFit: "contain" }} />
        </div>

        <div style={{ position: "relative", zIndex: 1 }}>
          <div className="divider-page"></div>

          {/* ══ ४. कार्य के घंटे ══ */}
          <div className="section-heading">४. कार्य के घंटे</div>
          <div className="body-text">
            कर्मचारी के मानक कार्य घंटे{' '}
            <span className="underline-blank">{data.employment?.workingHours || 'प्रातः 9:00 से सायं 6:00 बजे'}</span>,{' '}
            {data.employment?.workingDays || 'सोमवार से शनिवार'} होंगे, जिसमें{' '}
            <span className="underline-blank">{data.employment?.lunchBreak || '1 (एक) घंटे'}</span>{' '}
            का दोपहर भोजन अवकाश होगा, लागू राज्य दुकान एवं प्रतिष्ठान अधिनियम के अनुसार। ऑनलाइन व्यवसाय प्रबंधन की प्रकृति को देखते हुए — जिसमें सोशल मीडिया शेड्यूलिंग, अभियान निगरानी, प्लेटफॉर्म अधिसूचनाएँ एवं टीम समन्वय सम्मिलित हैं — कर्मचारी स्वीकार करता/करती है कि लाइव अभियान लॉन्च, प्रोजेक्ट घोषणाओं अथवा प्रदर्शन आपातकाल के दौरान मानक घंटों के बाहर समय पर प्रतिक्रिया एवं कार्रवाई कभी-कभी आवश्यक हो सकती है। किसी भी ओवरटाइम मुआवजे पर लागू कानून एवं कंपनी नीति लागू होगी।
          </div>

          {/* ══ ५. डिजिटल संपदा एवं खाता स्वामित्व ══ */}
          <div className="section-heading">५. डिजिटल संपदा एवं खाता स्वामित्व</div>
          <div className="body-text">
            कर्मचारी स्पष्ट रूप से स्वीकार करता/करती है एवं सहमत होता/होती है कि रोजगार के दौरान निर्मित, प्रबंधित, विकसित अथवा संचालित समस्त डिजिटल संपदाएँ — जिनमें सोशल मीडिया खाते एवं फॉलोअर्स, विज्ञापन खाते एवं अभियान इतिहास, वेबसाइट कंटेंट एवं बैकएंड एक्सेस, CRM डेटा एवं लीड डेटाबेस, ग्राफिक डिज़ाइन एवं वीडियो कंटेंट, ईमेल सूचियाँ एवं सब्सक्राइबर डेटाबेस, WhatsApp ब्रॉडकास्ट सूचियाँ, डोमेन पंजीकरण एवं समस्त संबद्ध लॉगिन क्रेडेंशियल सम्मिलित हैं किंतु इन्हीं तक सीमित नहीं — <strong>कंपनी की अनन्य संपत्ति</strong> हैं एवं सदैव रहेंगी।
          </div>
          <div className="body-text">
            कर्मचारी किसी भी परिस्थिति में कंपनी की किसी भी डिजिटल संपदा, डेटा, ऑडियंस अथवा क्रेडेंशियल का उपयोग रोजगार के दौरान अथवा पश्चात किसी भी व्यक्तिगत, फ्रीलांस अथवा तृतीय-पक्षीय उद्देश्य के लिए नहीं करेगा/करेगी। किसी भी कारण से रोजगार समाप्त होने पर कर्मचारी तत्काल एवं पूर्णतः समस्त खाता पहुँच, द्वि-कारक प्रमाणीकरण नियंत्रण, व्यवस्थापक अधिकार, पासवर्ड एवं डिजिटल क्रेडेंशियल कंपनी के नामित प्रतिनिधि को हस्तांतरित करेगा/करेगी तथा कंपनी द्वारा आवश्यक <strong>डिजिटल संपदा हस्तांतरण प्रमाणपत्र</strong> पर हस्ताक्षर करेगा/करेगी।
          </div>

          {/* ══ ६. गोपनीयता एवं डेटा संरक्षण ══ */}
          <div className="section-heading">६. गोपनीयता एवं डेटा संरक्षण</div>
          <div className="body-text">
            कर्मचारी को कंपनी एवं उसके ग्राहकों की अत्यंत संवेदनशील व्यावसायिक एवं व्यक्तिगत जानकारी तक पहुँच प्राप्त होगी — जिसमें विज्ञापन व्यय विवरण एवं अभियान रणनीतियाँ, ग्राहक लीड डेटाबेस एवं संपर्क जानकारी, संपत्ति मूल्य निर्धारण एवं परियोजना पाइपलाइन डेटा, विक्रेता अनुबंध एवं एजेंसी समझौते, CRM अभिलेख, आंतरिक प्रदर्शन रिपोर्ट एवं बोर्ड-स्तरीय व्यावसायिक निर्णय सम्मिलित हैं। कर्मचारी सहमत है कि:
          </div>
          <ul className="clause-list">
            <li>ऐसी समस्त जानकारी को रोजगार के दौरान एवं पश्चात पूर्णतः गोपनीय रखा जाएगा;</li>
            <li>व्यावसायिक डेटा, डिजिटल रणनीति अथवा ग्राहक जानकारी को व्यक्तिगत लाभ के लिए अथवा कंपनी की पूर्व लिखित अनुमति के बिना किसी तृतीय पक्ष को प्रकट, प्रतिलिपि, साझा, प्रेषित अथवा दुरुपयोग नहीं किया जाएगा;</li>
            <li>डिजिटल व्यक्तिगत डेटा संरक्षण अधिनियम, 2023 (DPDPA), सूचना प्रौद्योगिकी अधिनियम, 2000 एवं RERA विज्ञापन एवं ग्राहक डेटा दिशा-निर्देशों के तहत समस्त दायित्वों का अनुपालन किया जाएगा;</li>
            <li>रोजगार समाप्त होने पर कंपनी के डेटा, खाता क्रेडेंशियल, अभियान अभिलेख अथवा लीड डेटाबेस की कोई भी भौतिक अथवा डिजिटल प्रतिलिपि नहीं रखी जाएगी।</li>
          </ul>

          {/* ══ ७. गैर-प्रतिस्पर्धा एवं गैर-आग्रह ══ */}
          <div className="section-heading">७. गैर-प्रतिस्पर्धा एवं गैर-आग्रह</div>
          <div className="body-text">
            रोजगार की अवधि के दौरान तथा किसी भी कारण से रोजगार समाप्त होने के बाद{' '}
            <span className="underline-blank">{convertToHindi(data.employment?.nonCompetePeriod || '6 (छह) माह')}</span>{' '}
            की अवधि के लिए, कर्मचारी निम्नलिखित कार्य नहीं करेगा/करेगी:
          </div>
          <ul className="clause-list">
            <li>कंपनी की पूर्व लिखित सहमति के बिना, कंपनी के मुख्य व्यवसाय स्थान की{' '}
              <span className="underline-blank">{data.employment?.nonCompeteRadius || '50 कि.मी.'}</span>{' '}
              परिधि में रियल एस्टेट क्षेत्र में कार्यरत किसी भी व्यक्ति, संस्था अथवा प्रतिस्पर्धी को ऑनलाइन व्यवसाय प्रबंधन, डिजिटल मार्केटिंग, सोशल मीडिया प्रबंधन, लीड जनरेशन अथवा CRM प्रबंधन सेवाएँ प्रत्यक्ष अथवा अप्रत्यक्ष रूप से प्रदान नहीं की जाएंगी;</li>
            <li>कंपनी के किसी भी ग्राहक, लीड, विक्रेता, एजेंसी अथवा व्यावसायिक सहयोगी से किसी प्रतिस्पर्धी, व्यक्तिगत अथवा फ्रीलांस डिजिटल उद्देश्य के लिए संपर्क, आग्रह, अनुप्रेषण अथवा सलाह नहीं दी जाएगी;</li>
            <li>कंपनी के किसी भी ऑडियंस डेटा, लीड सूची, सोशल मीडिया फॉलोअर्स, CRM डेटाबेस अथवा विज्ञापन ऑडियंस का उपयोग कंपनी द्वारा अधिकृत किसी भी उद्देश्य के अलावा नहीं किया जाएगा;</li>
            <li>कंपनी के किसी भी कर्मचारी, ठेकेदार अथवा डिजिटल टीम के सदस्य को कंपनी के साथ उनका जुड़ाव छोड़ने के लिए प्रेरित अथवा प्रयास नहीं किया जाएगा।</li>
          </ul>

          {/* ══ ८. रोजगार की समाप्ति ══ */}
          <div className="section-heading">८. रोजगार की समाप्ति</div>

          <div className="sub-heading">कंपनी द्वारा समाप्ति</div>
          <div className="body-text">कंपनी निम्नलिखित परिस्थितियों में इस अनुबंध को समाप्त कर सकती है:</div>
          <ul className="termination-list">
            <li>
              <strong>कारण सहित (तत्काल बर्खास्तगी):</strong> कंपनी के विज्ञापन बजट का दुरुपयोग, कंपनी के डिजिटल खातों अथवा डेटा तक अनाधिकृत पहुँच अथवा हस्तांतरण, गोपनीयता भंग, अभियान प्रबंधन में जानबूझकर अकार्यकुशलता अथवा घोर लापरवाही, सकल कदाचार, अवज्ञा, अथवा इस अनुबंध अथवा कंपनी नीति का कोई भी सारभूत उल्लंघन।
            </li>
            <li>
              <strong>कारण रहित:</strong>{' '}
              <span className="underline-blank">{convertToHindi(data.employment?.noticePeriodEmployer || '30 (तीस) दिन')}</span>{' '}
              की लिखित सूचना या उसके स्थान पर वेतन का भुगतान, औद्योगिक विवाद अधिनियम, 1947 के लागू प्रावधानों के अधीन।
            </li>
          </ul>

          <div className="sub-heading">कर्मचारी द्वारा समाप्ति</div>
          <div className="body-text">
            कर्मचारी कंपनी को{' '}
            <span className="underline-blank">{convertToHindi(data.employment?.noticePeriodEmployee || '30 (तीस) दिन')}</span>{' '}
            की लिखित सूचना देकर त्यागपत्र दे सकता/सकती है। रोजगार समाप्त होने पर कर्मचारी निम्नलिखित कार्य करेगा/करेगी: (i) समस्त चालू अभियान पूर्ण करना एवं सभी सक्रिय अभियान ब्रीफ एवं प्रदर्शन रिपोर्ट सुपुर्द करना; (ii) समस्त डिजिटल खाता पहुँच, विज्ञापन खाता नियंत्रण, CRM व्यवस्थापक अधिकार एवं डोमेन क्रेडेंशियल सौंपना; (iii) नामित उत्तराधिकारी को औपचारिक डिजिटल ऑपरेशन्स हस्तांतरण पूर्ण करना; तथा (iv) अंतिम निपटारे से पहले <strong>शून्य-बकाया एवं डिजिटल संपदा हस्तांतरण प्रमाणपत्र</strong> पर हस्ताक्षर करना।
          </div>

          {/* ══ ९. शासक कानून एवं अधिकार क्षेत्र ══ */}
          <div className="section-heading">९. शासक कानून एवं अधिकार क्षेत्र</div>
          <div className="body-text">
            यह अनुबंध भारत के कानूनों के अनुसार शासित एवं निर्वचित किया जाएगा, जिसमें कंपनी अधिनियम, 2013; संविदा अधिनियम, 1872; सूचना प्रौद्योगिकी अधिनियम, 2000; डिजिटल व्यक्तिगत डेटा संरक्षण अधिनियम, 2023; RERA अधिनियम, 2016 एवं लागू श्रम विधान सम्मिलित हैं। इस अनुबंध से उत्पन्न अथवा इससे संबंधित किसी भी विवाद पर{' '}
            <span className="underline-blank">{data.employment?.jurisdiction || data.company?.companyDistrict || ''}</span>{' '}
            के न्यायालयों का अनन्य अधिकार क्षेत्र होगा।
          </div>

          {/* ══ १०. संपूर्ण अनुबंध ══ */}
          <div className="section-heading">१०. संपूर्ण अनुबंध</div>
          <div className="body-text">
            यह अनुबंध रोजगार की शर्तों के संबंध में कंपनी एवं कर्मचारी के बीच संपूर्ण अनुबंध का गठन करता है तथा सभी पूर्व चर्चाओं, वार्ताओं एवं अनुबंधों, चाहे लिखित हों या मौखिक, को अधिक्रमित करता है। इसमें उल्लिखित नहीं किए गए किसी भी प्रतिनिधित्व का कोई विधिक प्रभाव नहीं होगा।
          </div>

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
          <img src={companyWatermark || companyLogo || ''}
            style={{ width: "70%", maxWidth: "720px", height: "auto", objectFit: "contain" }} />
        </div>

        <div style={{ position: "relative", zIndex: 1 }}>
          <div className="divider-page"></div>

          {/* ══ ११. संशोधन ══ */}
          <div className="section-heading">११. संशोधन</div>
          <div className="body-text">
            इस अनुबंध में कोई भी संशोधन तभी मान्य होगा जब वह लिखित रूप में हो तथा कंपनी के अधिकृत प्रतिनिधि एवं कर्मचारी दोनों द्वारा विधिवत हस्ताक्षरित हो। किसी भी मौखिक संशोधन का कोई पक्ष पर बाध्यकारी प्रभाव नहीं होगा।
          </div>

          {/* ══ १२. पृथक्करणीयता ══ */}
          <div className="section-heading">१२. पृथक्करणीयता</div>
          <div className="body-text">
            यदि इस अनुबंध का कोई प्रावधान लागू कानून के तहत अवैध, शून्य अथवा अप्रवर्तनीय पाया जाता है, तो ऐसे प्रावधान को इस अनुबंध से पृथक माना जाएगा और शेष प्रावधान पूर्ण बल एवं प्रभाव के साथ जारी रहेंगे।
          </div>

          {/* ══ १३. वैधानिक अनुपालन घोषणा ══ */}
          <div className="section-heading">१३. वैधानिक अनुपालन घोषणा</div>
          <div className="body-text">
            दोनों पक्ष स्वीकार करते हैं कि यह अनुबंध समस्त लागू केंद्रीय एवं राज्य विधानों के अधीन है एवं उनके अनुरूप निर्वचित किया जाएगा, जिनमें निम्नलिखित सम्मिलित हैं किंतु इन्हीं तक सीमित नहीं:
          </div>
          <div className="compliance-box">
            <strong>लागू विधान:</strong> कंपनी अधिनियम, 2013 | संविदा अधिनियम, 1872 | सूचना प्रौद्योगिकी अधिनियम, 2000 | डिजिटल व्यक्तिगत डेटा संरक्षण अधिनियम, 2023 | RERA, 2016 | उपभोक्ता संरक्षण अधिनियम, 2019 | EPF एवं MP अधिनियम, 1952 | ESI अधिनियम, 1948 | उपदान भुगतान अधिनियम, 1972 | बोनस भुगतान अधिनियम, 1965 | मातृत्व लाभ अधिनियम, 1961 | न्यूनतम वेतन अधिनियम, 1948 | वेतन भुगतान अधिनियम, 1936 | औद्योगिक विवाद अधिनियम, 1947 | आयकर अधिनियम, 1961 | GST अधिनियम, 2017 | ASCI विज्ञापन मानक | राज्य दुकान एवं प्रतिष्ठान अधिनियम (महाराष्ट्र)
          </div>
          <div className="body-text" style={{ marginTop: '4px' }}>
            इस अनुबंध की शर्तों एवं किसी लागू क़ानून के प्रावधानों के बीच किसी भी विरोध की स्थिति में क़ानून प्रभावी होगा। कर्मचारी आगे स्वीकार करता/करती है कि ऑनलाइन व्यवसाय प्रबंधक की क्षमता में, किसी भी गैर-अनुपालित डिजिटल संचार, भ्रामक विज्ञापन अथवा ग्राहक के व्यक्तिगत डेटा के अनाधिकृत उपयोग के लिए लागू RERA विज्ञापन दिशा-निर्देशों, उपभोक्ता संरक्षण प्रावधानों एवं डेटा संरक्षण कानूनों के तहत व्यक्तिगत रूप से उत्तरदायी ठहराया जा सकता/सकती है।
          </div>

          {/* ══ हस्ताक्षर ══ */}
          <div className="sig-grid">

            {/* कंपनी हस्ताक्षर */}
            <div className="sig-block">
              <div className="sig-block-title">कंपनी की ओर से एवं उसके लिए</div>
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
                <strong>DIN / पैन:</strong>
                <span className="underline-blank" style={{ minWidth: '110px' }}>
                  {data.company?.managerPAN || data.manager?.managerPAN || ''}
                </span>
              </div>
              <div style={{ marginTop: '6px', fontSize: '12px', fontStyle: 'italic' }}>
                अधिकृत हस्ताक्षरकर्ता — {convertToHindi(data.company?.companyName || '')}{data.company?.entityType ? ` (${data.company.entityType})` : ''}
              </div>
            </div>

            {/* कर्मचारी हस्ताक्षर */}
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
                  {data.employee?.aadhaar ? formatAadhaarHindi(data.employee.aadhaar) : ''}
                </span>
              </div>
              <div style={{ marginTop: '14px', fontSize: '12.5px', fontWeight: 700 }}>
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

export default HindiOnlineBusinessManagerAgreement;