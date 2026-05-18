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

const MarathiOnlineBusinessManagerAgreement = ({ data, companyLogo, companyWatermark }: TemplateProps) => {

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

  // ── मराठी डिफॉल्ट कर्तव्ये ──
  const defaultDuties = [
    "कंपनीची संपूर्ण ऑनलाइन व्यावसायिक उपस्थिती व्यवस्थापित करणे व देखरेख करणे — ज्यात अधिकृत वेबसाइट, सोशल मीडिया चॅनेल (Instagram, Facebook, YouTube, LinkedIn, WhatsApp Business), रिअल इस्टेट लिस्टिंग पोर्टल्स (MagicBricks, 99acres, Housing.com, NoBroker) व Google Business Profile यांचा समावेश आहे.",
    "नवीन प्रकल्प लॉन्च, भूखंड व मालमत्ता विक्री, सणासुदीच्या ऑफर्स व ब्रँड-बांधणी उपक्रमांसाठी सर्व डिजिटल मार्केटिंग मोहिमांचे नियोजन, अंमलबजावणी, समन्वय व देखरेख करणे — मंजूर बजेट व वेळापत्रकात उद्दिष्टे साध्य होतील याची खात्री करणे.",
    "कंपनीच्या CRM (ग्राहक संबंध व्यवस्थापन) प्रणालीचे व्यवस्थापन व देखरेख करणे — ज्यात लीड नोंद, लीड वाटप, फॉलो-अप ट्रॅकिंग, पाइपलाइन व्यवस्थापन व वेळेवर रूपांतरण सुनिश्चित करण्यासाठी विक्री पथकाशी समन्वय यांचा समावेश आहे.",
    "डिजिटल ऑपरेशन्स कार्यकारी व इतर डिजिटल किंवा मार्केटिंग पथक सदस्यांचे दिशानिर्देशन व पर्यवेक्षण करणे — कामे सोपवणे, उत्पादन तपासणे, साप्ताहिक व मासिक लक्ष्ये निश्चित करणे आणि वरिष्ठ व्यवस्थापनाला कार्यप्रदर्शन अहवाल सादर करणे.",
    "सर्व सशुल्क डिजिटल जाहिरात खाती (Meta Business Manager, Google Ads, YouTube Ads) व्यवस्थापित करणे — ज्यात मोहीम निर्मिती, बजेट वाटप, A/B चाचणी, प्रेक्षक लक्ष्यीकरण, कार्यप्रदर्शन निरीक्षण, ROAS ट्रॅकिंग व जास्तीत जास्त लीड जनरेशनसाठी ऑप्टिमायझेशन यांचा समावेश आहे.",
    "सर्व डिजिटल कंटेंटच्या निर्मिती, शेड्युलिंग व प्रकाशनावर देखरेख करणे — ज्यात मालमत्ता वॉकथ्रू, प्रकल्प लॉन्च व्हिडिओ, Reels, प्रशंसापत्रे, प्रचार ग्राफिक्स, ईमेल मोहिमा व WhatsApp ब्रॉडकास्ट कंटेंट समाविष्ट आहे — सर्वत्र ब्रँडची एकसंधता राखणे.",
    "रीच, इंप्रेशन, CPL (प्रति लीड खर्च), रूपांतरण दर, मोहीम ROI, वेबसाइट ट्रॅफिक व सोशल मीडिया एंगेजमेंटसह सर्व डिजिटल कार्यप्रदर्शन मेट्रिक्सचे निरीक्षण, विश्लेषण व अहवाल तयार करणे आणि व्यवस्थापनाला साप्ताहिक व मासिक MIS अहवाल सादर करणे.",
    "डिजिटल सेवांसाठी विक्रेता संबंध व्यवस्थापित करणे — ज्यात कंटेंट क्रिएटर, व्हिडिओग्राफर, ग्राफिक डिझायनर, मीडिया एजन्सी, SEO/SEM सल्लागार व वेबसाइट डेव्हलपर यांचा समावेश आहे — करार वाटाघाटी, बीजक मंजुरी व दर्जेदार कामाची खात्री यांसह.",
    "सर्व डिजिटल ऑपरेशन्स लागू कायदे व नियमांचे पालन करतात याची खात्री करणे — ज्यात माहिती तंत्रज्ञान कायदा, २०००; डिजिटल वैयक्तिक डेटा संरक्षण कायदा, २०२३; व RERA (रिअल इस्टेट नियमन व विकास कायदा, २०१६) जाहिरात मार्गदर्शक तत्त्वे यांचा समावेश आहे.",
    "कंपनीच्या सर्व डिजिटल मालमत्तांची सुरक्षितता व मालकी राखणे — ज्यात सोशल मीडिया खाते क्रेडेन्शियल्स, जाहिरात खाते लॉगिन, वेबसाइट बॅकएंड प्रवेश, डोमेन नोंदणी, होस्टिंग खाती व CRM लॉगिन तपशील यांचा समावेश आहे — कोणत्याही अनधिकृत प्रवेश किंवा डेटा भंग होणार नाही याची खात्री करणे.",
    "कंपनीची ऑनलाइन व्यावसायिक कामगिरी व स्पर्धात्मक स्थान सुधारण्यासाठी नवोदित डिजिटल प्लॅटफॉर्म, साधने, मार्केटिंग तंत्रज्ञान व ऑटोमेशन उपायांवर संशोधन करणे आणि शिफारस करणे.",
    "वेळोवेळी व्यवस्थापनाने सोपवलेली इतर ऑनलाइन व्यवसाय व्यवस्थापन, डिजिटल मार्केटिंग किंवा परिचालन कर्तव्ये पार पाडणे.",
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
          line-height: 1.85;
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
          <div className="agreement-title">रोजगार करार</div>
          <div className="agreement-subtitle">(ऑनलाइन व्यवसाय व्यवस्थापक)</div>

          {/* ── प्रस्तावना ── */}
          <div className="body-text">
            हा रोजगार करार <strong>("करार")</strong> दिनांक{' '}
            <span className="underline-blank">{formatMarathiDate(data.employment?.joiningDate)}</span>{' '}
            रोजी खालील पक्षांमध्ये केला गेला आहे व अंमलात आला आहे:
          </div>

          {/* ── नियोक्ता ── */}
          <div className="party-block">
            <div className="party-name">{employerFullName}</div>
            <div><strong>नोंदणीकृत पत्ता:</strong> {employerAddress}</div>
            <div><strong>CIN:</strong> {data.company?.cinNumber || <span className="underline-blank" style={{ minWidth: '160px' }} />}</div>
            <div><strong>पॅन:</strong> {data.company?.companyPan || <span className="underline-blank" style={{ minWidth: '120px' }} />}</div>
            <div style={{ fontStyle: 'italic' }}>
              (कंपनी कायदा, २०१३ अंतर्गत स्थापित एक कंपनी, यापुढे <strong>"कंपनी"</strong> किंवा <strong>"नियोक्ता"</strong> म्हणून संदर्भित)
            </div>
          </div>

          <div className="and-divider">व</div>

          {/* ── कर्मचारी ── */}
          <div className="party-block">
            <div className="party-name">{employeeFullName}</div>
            <div><strong>पत्ता:</strong> {employeeAddress}</div>
            <div>
              <strong>शैक्षणिक पात्रता:</strong>{' '}
              {data.employee?.qualification || <span className="underline-blank" style={{ minWidth: '160px' }} />}
            </div>
            <div><strong>जन्म दिनांक:</strong> {data.employee?.dob ? formatMarathiDate(data.employee.dob) : <span className="underline-blank" style={{ minWidth: '100px' }} />}</div>
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
            कंपनी एतदर्थ कर्मचाऱ्यास <strong>ऑनलाइन व्यवसाय व्यवस्थापक</strong> या पदावर नियुक्त करते
            {data.employment?.department ? `, ${data.employment.department} विभागात` : ''}. कर्मचारी{' '}
            <span className="underline-blank">{convertToMarathi(data.employment?.reportingTo || '')}</span>{' '}
            यांना अहवाल देईल आणि रिअल इस्टेट क्षेत्रातील कंपनीची संपूर्ण ऑनलाइन व्यावसायिक उपस्थिती, डिजिटल मार्केटिंग ऑपरेशन्स, पथक पर्यवेक्षण व ऑनलाइन महसूल निर्मिती उपक्रमांचे परिश्रमपूर्वक व्यवस्थापन, देखरेख व वाढ करेल — ज्यात खालील गोष्टींचा समावेश आहे परंतु त्यापुरतेच मर्यादित नाही:
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

          {/* ══ २. रोजगाराची सुरुवात व परिवीक्षा ══ */}
          <div className="section-heading">२. रोजगाराची सुरुवात व परिवीक्षा</div>
          <div className="body-text">
            कर्मचाऱ्याचा रोजगार{' '}
            <span className="underline-blank">{formatMarathiDate(data.employment?.joiningDate)}</span>{' '}
            पासून सुरू होईल. कर्मचारी रुजू होण्याच्या दिनांकापासून{' '}
            <strong>{data.employment?.probationPeriod || '३ (तीन) महिने'}</strong>{' '}
            च्या कालावधीसाठी परिवीक्षाधीन राहील, या काळात कोणताही पक्ष कारण किंवा पूर्वसूचनेशिवाय हा करार संपुष्टात आणू शकतो. परिवीक्षा कालावधी समाधानकारकरीत्या पूर्ण झाल्यावर कंपनीच्या HR धोरणानुसार एका अधिकृत अधिकाऱ्याकडून लेखी स्वरूपात नियुक्तीची पुष्टी केली जाईल. परिवीक्षा कालावधीत कर्मचाऱ्याची डिजिटल कामगिरी, पथक व्यवस्थापन क्षमता व मोहीम परिणामांचे मान्य KPI नुसार मूल्यमापन केले जाईल.
          </div>

          {/* ══ ३. मोबदला ══ */}
          <div className="section-heading">३. मोबदला</div>

          <div className="sub-heading">वेतन</div>
          <div className="body-text">
            कंपनी कर्मचाऱ्यास ₹{' '}
            <span className="underline-blank">{convertNumberToMarathi(data.employment?.grossAnnualSalary || '')}</span>
            /- (रुपये{' '}
            <span className="underline-blank" style={{ minWidth: '160px' }}>{convertToMarathi(data.employment?.grossAnnualSalaryWords || '')}</span>{' '}
            मात्र) एवढे वार्षिक एकूण वेतन देईल, जे ₹{' '}
            <span className="underline-blank">{convertNumberToMarathi(data.employment?.grossMonthlySalary || '')}</span>
            /- (रुपये{' '}
            <span className="underline-blank" style={{ minWidth: '140px' }}>{convertToMarathi(data.employment?.grossMonthlySalaryWords || '')}</span>{' '}
            मात्र) एवढ्या मासिक एकूण वेतनाच्या समतुल्य असेल — पुढील महिन्याच्या ७ तारखेपर्यंत किंवा त्यापूर्वी समान मासिक हप्त्यांमध्ये, लागू कपाती, आयकर कायदा, १९६१ अंतर्गत TDS व भारतीय कायद्यानुसार सर्व वैधानिक कपातींच्या अधीन राहून देय.
          </div>

          <div className="sub-heading">डिजिटल साधने व प्लॅटफॉर्म बजेट</div>
          <div className="body-text">
            वरील वेतनाव्यतिरिक्त, ऑनलाइन व्यवसाय व्यवस्थापन कर्तव्यांसाठी आवश्यक मंजूर सदस्यत्वे, साधने व जाहिरात बजेटचा खर्च कंपनी वहन करेल — ज्यात समाविष्ट आहे:
          </div>
          <ul className="benefits-list">
            <li><strong>जाहिरात खर्च:</strong> Meta Ads, Google Ads व YouTube Ads चे बजेट पूर्णपणे कंपनीकडून वाटप व वहन केले जाईल. अधिकृत व्यवस्थापन प्रतिनिधीच्या पूर्व लेखी मंजुरीशिवाय कर्मचारी कोणताही जाहिरात खर्च करणार नाही.</li>
            <li><strong>डिझाइन व कंटेंट साधने:</strong> कंपनीने मंजूर केलेले Canva Pro, Adobe Creative Suite, CapCut Pro किंवा समकक्ष साधने.</li>
            <li><strong>CRM व ऑटोमेशन:</strong> CRM सॉफ्टवेअर परवाने, WhatsApp Business API, ईमेल मार्केटिंग प्लॅटफॉर्म व इतर मंजूर डिजिटल व्यवस्थापन साधने.</li>
            <li><strong>विश्लेषण व अहवाल साधने:</strong> Meta Business Suite, Google Analytics, Google Search Console व मंजूर तृतीय-पक्ष विश्लेषण प्लॅटफॉर्म.</li>
          </ul>

          <div className="sub-heading">वैधानिक लाभ</div>
          <div className="body-text">
            खाजगी मर्यादित कंपन्यांना लागू भारतीय कामगार कायद्यानुसार कर्मचारी खालील वैधानिक लाभांसाठी पात्र असेल:
          </div>

          <div style={{ fontWeight: 700, fontSize: '13px', marginTop: '5px', marginBottom: '2px' }}>
            अनिवार्य वैधानिक लाभ
          </div>
          <ul className="benefits-list">
            <li><strong>कर्मचारी भविष्य निर्वाह निधी (EPF) — EPF व MP कायदा, १९५२:</strong> नियोक्ता व कर्मचारी प्रत्येकी मूळ वेतनाच्या १२% योगदान देतील. कंपनीत २० किंवा अधिक व्यक्ती कार्यरत असल्यास लागू.</li>
            <li><strong>कर्मचारी राज्य विमा (ESI) — ESI कायदा, १९४८:</strong> एकूण वेतन ₹२१,०००/- प्रतिमाह किंवा त्यापेक्षा कमी असल्यास व संस्थेत १० किंवा अधिक व्यक्ती असल्यास लागू.</li>
            <li><strong>उपदान — उपदान देयक कायदा, १९७२:</strong> ५ वर्षे सतत सेवेनंतर प्रत्येक पूर्ण सेवा वर्षासाठी १५ दिवसांच्या वेतनाच्या दराने देय.</li>
            <li>
              <strong>रजा — दुकाने व आस्थापना कायदा (राज्य):</strong> वार्षिक / अर्जित रजा ({convertNumberToMarathi(data.employment?.annualLeaves || '12')} दिवस),
              वैद्यकीय रजा ({convertNumberToMarathi(data.employment?.medicalLeaves || '6')} दिवस) व आकस्मिक रजा ({convertNumberToMarathi(data.employment?.casualLeaves || '6')} दिवस) दर वर्षी.
            </li>
            <li><strong>मातृत्व लाभ — मातृत्व लाभ कायदा, १९६१:</strong> पात्र महिला कर्मचाऱ्यांसाठी २६ आठवड्यांची सवेतन मातृत्व रजा (२ जिवंत मुलांपर्यंत); त्यानंतरच्या गर्भधारणेसाठी १२ आठवडे.</li>
            <li><strong>बोनस — बोनस देयक कायदा, १९६५:</strong> कायद्यांतर्गत कंपनीच्या वार्षिक उलाढालीच्या पात्रतेनुसार लागू.</li>
          </ul>

          <div style={{ fontWeight: 700, fontSize: '13px', marginTop: '5px', marginBottom: '2px' }}>
            ऐच्छिक / स्पर्धात्मक लाभ
          </div>
          <ul className="benefits-list">
            <li><strong>सामूहिक आरोग्य विमा:</strong> कंपनी धोरणानुसार सर्वसमावेशक वैद्यकीय संरक्षण.</li>
            <li><strong>कार्यप्रदर्शन प्रोत्साहन:</strong> लीड जनरेशन लक्ष्ये, मोहीम ROI, ROAS बेंचमार्क व डिजिटल वाढीच्या KPI शी जोडलेले कार्यप्रदर्शन-आधारित बोनस — संचालक मंडळ/व्यवस्थापनाच्या विवेकाधिकारानुसार.</li>
            <li><strong>व्यावसायिक प्रमाणपत्रे:</strong> Meta Blueprint, Google Ads प्रमाणपत्रे, HubSpot Academy, डिजिटल मार्केटिंग अभ्यासक्रम व नेतृत्व विकास कार्यक्रमांसाठी कंपनी-प्रायोजित प्रवेश.</li>
            <li><strong>लवचिक काम:</strong> व्यवस्थापनाची मंजुरी व परिचालन गरजांच्या अधीन राहून हायब्रिड/रिमोट कामाचे पर्याय.</li>
            <li><strong>इंटरनेट व डिव्हाइस भत्ता:</strong> हाय-स्पीड इंटरनेटसाठी मासिक प्रतिपूर्ती व कामाच्या डिव्हाइसची तरतूद किंवा प्रतिपूर्ती — मंजुरीच्या अधीन.</li>
          </ul>

          <div style={{ fontWeight: 700, fontSize: '13px', marginTop: '5px', marginBottom: '2px' }}>
            पर्यायी सोयी-सुविधा
          </div>
          <ul className="benefits-list">
            <li>कल्याण कार्यक्रम: मानसिक आरोग्य सहाय्य, आरोग्य तपासणी.</li>
            <li>अतिरिक्त रजा: कंपनी धोरणानुसार पितृत्व रजा, शोक रजा.</li>
            <li>भविष्य निर्वाह निधी योगदान व कंपनीने वेळोवेळी ठरवलेले इतर लाभ.</li>
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

          {/* ══ ४. कामाचे तास ══ */}
          <div className="section-heading">४. कामाचे तास</div>
          <div className="body-text">
            कर्मचाऱ्याचे प्रमाणित कामाचे तास{' '}
            <span className="underline-blank">{data.employment?.workingHours || 'सकाळी ९:०० ते सायंकाळी ६:००'}</span>,{' '}
            {data.employment?.workingDays || 'सोमवार ते शनिवार'}, ज्यात{' '}
            <span className="underline-blank">{data.employment?.lunchBreak || '१ (एक) तास'}</span>{' '}
            दुपारच्या जेवणाची सुट्टी समाविष्ट आहे — लागू राज्य दुकाने व आस्थापना कायद्यानुसार. ऑनलाइन व्यवसाय व्यवस्थापनाच्या स्वरूपामुळे — ज्यात सोशल मीडिया शेड्युलिंग, मोहीम निरीक्षण, प्लॅटफॉर्म सूचना व पथक समन्वय यांचा समावेश आहे — कर्मचारी मान्य करतो की थेट मोहीम लॉन्च, प्रकल्प घोषणा किंवा कार्यप्रदर्शन आणीबाणी दरम्यान प्रमाणित वेळेबाहेर वेळेवर प्रतिसाद व कारवाई अधूनमधून आवश्यक असू शकते. कोणत्याही ओव्हरटाइम मोबदल्यावर लागू कायदा व कंपनी धोरण लागू होईल.
          </div>

          {/* ══ ५. डिजिटल मालमत्ता व खाते मालकी ══ */}
          <div className="section-heading">५. डिजिटल मालमत्ता व खाते मालकी</div>
          <div className="body-text">
            कर्मचारी स्पष्टपणे मान्य करतो व सहमत होतो की रोजगाराच्या काळात निर्माण, व्यवस्थापित, वाढवलेल्या किंवा संचालित केलेल्या सर्व डिजिटल मालमत्ता — ज्यात सर्व सोशल मीडिया खाती व फॉलोअर्स, जाहिरात खाती व मोहीम इतिहास, वेबसाइट कंटेंट व बॅकएंड प्रवेश, CRM डेटा व लीड डेटाबेस, ग्राफिक डिझाइन व व्हिडिओ कंटेंट, ईमेल याद्या व सब्सक्राइबर डेटाबेस, WhatsApp ब्रॉडकास्ट याद्या, डोमेन नोंदणी व सर्व संबंधित लॉगिन क्रेडेन्शियल्स यांचा समावेश आहे परंतु त्यापुरतेच मर्यादित नाही — या <strong>कंपनीची अनन्य मालमत्ता</strong> आहेत व सर्वदा राहतील.
          </div>
          <div className="body-text">
            कर्मचारी कोणत्याही परिस्थितीत कंपनीच्या कोणत्याही डिजिटल मालमत्तेचा, डेटाचा, प्रेक्षकांचा किंवा क्रेडेन्शियल्सचा वापर रोजगाराच्या काळात किंवा नंतर कोणत्याही वैयक्तिक, फ्रीलान्स किंवा तृतीय-पक्षाच्या उद्देशाने करणार नाही. कोणत्याही कारणाने रोजगार संपुष्टात आल्यावर कर्मचारी त्वरित व पूर्णपणे सर्व खाते प्रवेश, द्वि-घटक प्रमाणीकरण नियंत्रणे, प्रशासक अधिकार, पासवर्ड व डिजिटल क्रेडेन्शियल्स कंपनीच्या नियुक्त प्रतिनिधीकडे हस्तांतरित करेल आणि कंपनीने आवश्यक केल्यानुसार <strong>डिजिटल मालमत्ता हस्तांतरण प्रमाणपत्रावर</strong> स्वाक्षरी करेल.
          </div>

          {/* ══ ६. गोपनीयता व डेटा संरक्षण ══ */}
          <div className="section-heading">६. गोपनीयता व डेटा संरक्षण</div>
          <div className="body-text">
            कर्मचाऱ्यास कंपनी व तिच्या ग्राहकांची अत्यंत संवेदनशील व्यावसायिक व वैयक्तिक माहितीचा प्रवेश मिळेल — ज्यात जाहिरात खर्चाचे तपशील व मोहीम धोरणे, ग्राहक लीड डेटाबेस व संपर्क माहिती, मालमत्तेचे मूल्यनिर्धारण व प्रकल्प पाइपलाइन डेटा, विक्रेता करार व एजन्सी करारनामे, CRM नोंदी, अंतर्गत कार्यप्रदर्शन अहवाल व संचालक मंडळ-स्तरीय व्यावसायिक निर्णय यांचा समावेश आहे. कर्मचारी खालील गोष्टींना सहमत आहे:
          </div>
          <ul className="clause-list">
            <li>अशा सर्व माहितीची रोजगाराच्या काळात व नंतरही कडक गोपनीयता राखणे;</li>
            <li>कंपनीच्या पूर्व लेखी परवानगीशिवाय कोणत्याही व्यावसायिक डेटा, डिजिटल धोरण किंवा ग्राहक माहितीचे वैयक्तिक फायद्यासाठी किंवा कोणत्याही तृतीय पक्षाला प्रकटीकरण, प्रत, सामायिकरण, प्रेषण किंवा गैरवापर न करणे;</li>
            <li>डिजिटल वैयक्तिक डेटा संरक्षण कायदा, २०२३ (DPDPA), माहिती तंत्रज्ञान कायदा, २००० व RERA जाहिरात व ग्राहक डेटा मार्गदर्शक तत्त्वांतर्गत सर्व बंधनांचे पालन करणे;</li>
            <li>रोजगार संपुष्टात आल्यावर कंपनीच्या डेटाची, खाते क्रेडेन्शियल्सची, मोहीम नोंदींची किंवा लीड डेटाबेसची कोणतीही भौतिक किंवा डिजिटल प्रत न ठेवणे.</li>
          </ul>

          {/* ══ ७. अ-स्पर्धा व अ-आग्रह ══ */}
          <div className="section-heading">७. अ-स्पर्धा व अ-आग्रह</div>
          <div className="body-text">
            रोजगाराच्या कालावधीत व कोणत्याही कारणाने रोजगार संपुष्टात आल्यानंतर{' '}
            <span className="underline-blank">{convertToMarathi(data.employment?.nonCompetePeriod || '६ (सहा) महिने')}</span>{' '}
            च्या कालावधीपर्यंत, कर्मचारी खालील गोष्टी करणार नाही:
          </div>
          <ul className="clause-list">
            <li>कंपनीच्या पूर्व लेखी संमतीशिवाय, कंपनीच्या मुख्य व्यवसाय स्थळाच्या{' '}
              <span className="underline-blank">{data.employment?.nonCompeteRadius || '५० किमी'}</span>{' '}
              परिघात रिअल इस्टेट क्षेत्रात कार्यरत कोणत्याही व्यक्ती, संस्था किंवा स्पर्धकास ऑनलाइन व्यवसाय व्यवस्थापन, डिजिटल मार्केटिंग, सोशल मीडिया व्यवस्थापन, लीड जनरेशन किंवा CRM व्यवस्थापन सेवा प्रत्यक्ष किंवा अप्रत्यक्षपणे पुरवणे;</li>
            <li>कंपनीच्या कोणत्याही ग्राहकास, लीडला, विक्रेत्याला, एजन्सीला किंवा व्यावसायिक सहकाऱ्याशी कोणत्याही स्पर्धक, वैयक्तिक किंवा फ्रीलान्स डिजिटल उद्देशासाठी संपर्क, आग्रह, पुनर्निर्देशन किंवा सल्ला देणे;</li>
            <li>कंपनीच्या कोणत्याही प्रेक्षक डेटाचा, लीड यादीचा, सोशल मीडिया फॉलोअर्सचा, CRM डेटाबेसचा किंवा जाहिरात प्रेक्षकांचा कंपनीने परवानगी न दिलेल्या कोणत्याही उद्देशासाठी वापर करणे;</li>
            <li>कंपनीच्या कोणत्याही कर्मचाऱ्याला, कंत्राटदाराला किंवा डिजिटल पथक सदस्याला कंपनीशी असलेले त्यांचे नाते सोडण्यास प्रवृत्त करण्याचा प्रयत्न करणे.</li>
          </ul>

          {/* ══ ८. रोजगाराची समाप्ती ══ */}
          <div className="section-heading">८. रोजगाराची समाप्ती</div>

          <div className="sub-heading">कंपनीकडून समाप्ती</div>
          <div className="body-text">कंपनी खालील परिस्थितींमध्ये हा करार संपुष्टात आणू शकते:</div>
          <ul className="termination-list">
            <li>
              <strong>कारणासह (तत्काळ बडतर्फी):</strong> कंपनीच्या जाहिरात बजेटचा दुरुपयोग; कंपनीच्या डिजिटल खाती किंवा डेटाचा अनधिकृत प्रवेश किंवा हस्तांतरण; गोपनीयतेचा भंग; मोहीम व्यवस्थापनात जाणीवपूर्वक बेकारी किंवा घोर निष्काळजीपणा; घोर गैरवर्तन; अनाज्ञाधारकपणा; किंवा या करार किंवा कंपनी धोरणाचे कोणतेही सारभूत उल्लंघन.
            </li>
            <li>
              <strong>कारणाशिवाय:</strong>{' '}
              <span className="underline-blank">{convertToMarathi(data.employment?.noticePeriodEmployer || '३० (तीस) दिवस')}</span>{' '}
              चे लेखी नोटीस किंवा नोटिसाऐवजी वेतन देयक — औद्योगिक विवाद कायदा, १९४७ च्या लागू तरतुदींच्या अधीन.
            </li>
          </ul>

          <div className="sub-heading">कर्मचाऱ्याकडून समाप्ती</div>
          <div className="body-text">
            कर्मचारी कंपनीला{' '}
            <span className="underline-blank">{convertToMarathi(data.employment?.noticePeriodEmployee || '३० (तीस) दिवस')}</span>{' '}
            चे लेखी नोटीस देऊन राजीनामा देऊ शकतो. रोजगार संपुष्टात आल्यावर कर्मचारी खालील गोष्टी करेल: (i) सर्व चालू मोहिमा पूर्ण करणे व सर्व सक्रिय मोहीम ब्रीफ व कार्यप्रदर्शन अहवाल सुपूर्द करणे; (ii) सर्व डिजिटल खाते प्रवेश, जाहिरात खाते नियंत्रणे, CRM प्रशासक अधिकार व डोमेन क्रेडेन्शियल्स सोपवणे; (iii) नियुक्त उत्तराधिकाऱ्याकडे औपचारिक डिजिटल ऑपरेशन्स हस्तांतरण पूर्ण करणे; (iv) अंतिम निपटारा होण्यापूर्वी <strong>शून्य-थकबाकी व डिजिटल मालमत्ता हस्तांतरण प्रमाणपत्रावर</strong> स्वाक्षरी करणे.
          </div>

          {/* ══ ९. शासी कायदा व क्षेत्राधिकार ══ */}
          <div className="section-heading">९. शासी कायदा व क्षेत्राधिकार</div>
          <div className="body-text">
            हा करार भारताच्या कायद्यांनुसार शासित व त्यांच्यानुसार अर्थ लावला जाईल — ज्यात कंपनी कायदा, २०१३; करार कायदा, १८७२; माहिती तंत्रज्ञान कायदा, २०००; डिजिटल वैयक्तिक डेटा संरक्षण कायदा, २०२३; RERA कायदा, २०१६ व लागू कामगार कायदे यांचा समावेश आहे. या करारातून उद्भवणारे किंवा त्याच्याशी संबंधित कोणतेही वाद{' '}
            <span className="underline-blank">{data.employment?.jurisdiction || data.company?.companyDistrict || ''}</span>{' '}
            येथील न्यायालयांच्या अनन्य अधिकारक्षेत्राच्या अधीन असतील.
          </div>

          {/* ══ १०. संपूर्ण करार ══ */}
          <div className="section-heading">१०. संपूर्ण करार</div>
          <div className="body-text">
            हा करार रोजगाराच्या अटींबाबत कंपनी व कर्मचारी यांच्यातील संपूर्ण करार बनवतो आणि पूर्वीच्या सर्व चर्चा, वाटाघाटी व करार — मग ते लेखी असोत किंवा तोंडी — यांची जागा घेतो. यात नमूद न केलेल्या कोणत्याही प्रतिनिधित्वाचा कायदेशीर परिणाम होणार नाही.
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

          {/* ══ ११. दुरुस्त्या ══ */}
          <div className="section-heading">११. दुरुस्त्या</div>
          <div className="body-text">
            या करारातील कोणतीही दुरुस्ती किंवा बदल केवळ लेखी स्वरूपात असेल तेव्हाच वैध असेल आणि कंपनीच्या अधिकृत प्रतिनिधीने व कर्मचाऱ्याने योग्यरीत्या स्वाक्षरी केलेली असेल. कोणत्याही तोंडी दुरुस्त्या कोणत्याही पक्षावर बंधनकारक असणार नाहीत.
          </div>

          {/* ══ १२. विभाज्यता ══ */}
          <div className="section-heading">१२. विभाज्यता</div>
          <div className="body-text">
            या करारातील कोणतीही तरतूद लागू कायद्यानुसार अवैध, शून्य किंवा अप्रवर्तनीय असल्याचे आढळल्यास, अशी तरतूद या करारातून वेगळी मानली जाईल आणि उर्वरित तरतुदी पूर्ण बळ व परिणामासह लागू राहतील.
          </div>

          {/* ══ १३. वैधानिक अनुपालन घोषणा ══ */}
          <div className="section-heading">१३. वैधानिक अनुपालन घोषणा</div>
          <div className="body-text">
            दोन्ही पक्ष मान्य करतात की हा करार सर्व लागू केंद्रीय व राज्य कायद्यांच्या अधीन आहे व त्यांच्यानुसार अर्थ लावला जाईल — ज्यात खालील गोष्टींचा समावेश आहे परंतु त्यापुरतेच मर्यादित नाही:
          </div>
          <div className="compliance-box">
            <strong>लागू कायदे:</strong> कंपनी कायदा, २०१३ | करार कायदा, १८७२ | माहिती तंत्रज्ञान कायदा, २००० | डिजिटल वैयक्तिक डेटा संरक्षण कायदा, २०२३ | RERA, २०१६ | ग्राहक संरक्षण कायदा, २०१९ | EPF व MP कायदा, १९५२ | ESI कायदा, १९४८ | उपदान देयक कायदा, १९७२ | बोनस देयक कायदा, १९६५ | मातृत्व लाभ कायदा, १९६१ | किमान वेतन कायदा, १९४८ | वेतन देयक कायदा, १९३६ | औद्योगिक विवाद कायदा, १९४७ | आयकर कायदा, १९६१ | GST कायदा, २०१७ | ASCI जाहिरात मानके | राज्य दुकाने व आस्थापना कायदा (महाराष्ट्र)
          </div>
          <div className="body-text" style={{ marginTop: '4px' }}>
            या करारातील अटी व कोणत्याही लागू कायद्याच्या तरतुदींमध्ये विरोध असल्यास कायदा प्रभावी ठरेल. कर्मचारी पुढे मान्य करतो की ऑनलाइन व्यवसाय व्यवस्थापकाच्या भूमिकेत, कोणत्याही नियम-उल्लंघक डिजिटल संवादासाठी, दिशाभूल करणाऱ्या जाहिरातींसाठी किंवा ग्राहकाच्या वैयक्तिक डेटाच्या अनधिकृत वापरासाठी लागू RERA जाहिरात मार्गदर्शक तत्त्वे, ग्राहक संरक्षण तरतुदी व डेटा संरक्षण कायद्यांतर्गत वैयक्तिकरीत्या जबाबदार धरले जाऊ शकते.
          </div>

          {/* ══ स्वाक्षऱ्या ══ */}
          <div className="sig-grid">

            {/* कंपनी स्वाक्षरी */}
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
                <span className="underline-blank" style={{ minWidth: '110px' }}>
                  {data.manager?.managerPosition || data.company?.managerPosition || data.company?.hrDesignation}
                </span>
              </div>
              <div className="sig-field-row">
                <strong>DIN / पॅन:</strong>
                <span className="underline-blank" style={{ minWidth: '110px' }}>
                  {data.company?.managerPAN || data.manager?.managerPAN || ''}
                </span>
              </div>
              <div style={{ marginTop: '6px', fontSize: '12px', fontStyle: 'italic' }}>
                अधिकृत स्वाक्षरकर्ता — {convertToMarathi(data.company?.companyName || '')}{data.company?.entityType ? ` (${data.company.entityType})` : ''}
              </div>
            </div>

            {/* कर्मचारी स्वाक्षरी */}
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

          {/* साक्षीदार */}
          <div style={{ marginTop: '24px', borderTop: '1.5px solid #000', paddingTop: '10px' }}>
            <div style={{ fontWeight: 700, fontSize: '13px', marginBottom: '8px' }}>साक्षीदार</div>
            <div style={{ display: 'flex', gap: '40px' }}>
              <div style={{ flex: 1, fontSize: '13px', lineHeight: 1.8 }}>
                <div><strong>१.</strong> नाव: <span className="underline-blank" style={{ minWidth: '140px' }} /></div>
                <div style={{ marginTop: '4px' }}>स्वाक्षरी: <span className="underline-blank" style={{ minWidth: '120px' }} /></div>
              </div>
              <div style={{ flex: 1, fontSize: '13px', lineHeight: 1.8 }}>
                <div><strong>२.</strong> नाव: <span className="underline-blank" style={{ minWidth: '140px' }} /></div>
                <div style={{ marginTop: '4px' }}>स्वाक्षरी: <span className="underline-blank" style={{ minWidth: '120px' }} /></div>
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

export default MarathiOnlineBusinessManagerAgreement;