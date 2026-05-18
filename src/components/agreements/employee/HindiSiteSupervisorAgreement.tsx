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

const HindiSiteSupervisorAgreement = ({ data, companyLogo, companyWatermark }: TemplateProps) => {

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

  // ── Hindi Site Supervisor Default Duties ──
  const defaultDuties = [
    "निर्धारित परियोजना स्थलों पर समस्त निर्माण, विकास एवं लेआउट गतिविधियों की देखरेख एवं समन्वय करना।",
    "साइट पर सुरक्षा विनियमों, साइट प्रोटोकॉल तथा लागू भवन निर्माण संहिताओं एवं वैधानिक आवश्यकताओं के अनुपालन की निगरानी एवं प्रवर्तन करना।",
    "साइट कार्य के समयबद्ध निष्पादन हेतु ठेकेदारों, उप-ठेकेदारों, श्रम दल एवं विक्रेताओं के साथ संपर्क एवं समन्वय करना।",
    "प्रतिदिन साइट निरीक्षण करना तथा प्रबंधन समीक्षा हेतु प्रगति रिपोर्ट, साइट डायरी एवं फोटोग्राफिक अभिलेख तैयार करना।",
    "साइट पर सामग्री, मशीनरी एवं उपकरणों का उचित लेखा-जोखा, उपयोग एवं सुरक्षा सुनिश्चित करना।",
    "साइट स्तरीय तकनीकी समस्याओं एवं विचलनों के समाधान हेतु डिज़ाइन, योजना एवं अभियांत्रिकी दलों के साथ समन्वय करना।",
    "साइट उपस्थिति, श्रम तैनाती, सामग्री खपत एवं पूर्ण कार्य का सटीक अभिलेख बनाए रखना।",
    "क्रेताओं एवं ग्राहकों की साइट विज़िट की सुविधा प्रदान करना तथा उन्हें भूखण्ड सीमाओं, सीमांकन एवं परियोजना की स्थिति से अवगत कराना।",
    "परियोजना भूमि पर या उसके निकट किसी भी अतिक्रमण, विवाद अथवा अनाधिकृत गतिविधि की तत्काल रिपोर्ट प्रबंधन को करना।",
    "समय-समय पर प्रबंधन द्वारा सौंपे गए अन्य कार्य करना।",
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
            यह रोजगार करार <strong>("करार")</strong>{' '}
            <span className="underline-blank">{formatHindiDate(data.employment?.joiningDate)}</span>{' '}
            को निम्नलिखित पक्षों के मध्य किया गया है एवं प्रभावी हुआ है:
          </div>

          {/* ── EMPLOYER ── */}
          <div className="party-block">
            <div className="party-name">{employerFullName}</div>
            <div><strong>पता:</strong> {employerAddress}</div>
            <div><strong>CIN / पंजी. क्र.:</strong> {data.company?.cinNumber || data.company?.licenseRegistrationNumber || ''}</div>
            <div style={{ fontStyle: 'italic' }}>(इसके पश्चात <strong>"नियोक्ता"</strong> के रूप में संदर्भित)</div>
          </div>

          <div className="and-divider">एवं</div>

          {/* ── EMPLOYEE ── */}
          <div className="party-block">
            <div className="party-name">{employeeFullName}</div>
            <div><strong>पता:</strong> {employeeAddress}</div>
            <div><strong>जन्म तिथि:</strong>{' '}
              {data.employee?.dob
                ? formatHindiDate(data.employee.dob)
                : <span className="underline-blank" style={{ minWidth: '100px' }} />}
            </div>
            <div>
              <strong>आधार क्र.:</strong>{' '}
              {formatAadhaarHindi(data.employee?.aadhaar) || <span className="underline-blank" style={{ minWidth: '120px' }} />}
              &emsp;
              <strong>पैन क्र.:</strong>{' '}
              {data.employee?.pan || <span className="underline-blank" style={{ minWidth: '100px' }} />}
            </div>
            <div style={{ fontStyle: 'italic' }}>(इसके पश्चात <strong>"कर्मचारी"</strong> के रूप में संदर्भित)</div>
          </div>

          {/* ══ १. पद एवं कर्तव्य ══ */}
          <div className="section-heading">१. पद एवं कर्तव्य</div>
          <div className="body-text">
            नियोक्ता एतद्द्वारा कर्मचारी को <strong>साइट पर्यवेक्षक</strong> के पद पर नियुक्त करते हैं
            {data.employment?.department ? `, ${data.employment.department} विभाग में` : ''}।
            कर्मचारी की तैनाती{' '}
            <span className="underline-blank">{data.employment?.placeOfPosting || ''}</span>{' '}
            पर होगी एवं वे{' '}
            <span className="underline-blank">{convertToHindi(data.employment?.reportingTo || '')}</span>{' '}
            को रिपोर्ट करेंगे। कर्मचारी एक रियल एस्टेट विकास एवं निर्माण व्यवसाय में इस पद से सामान्यतः संबद्ध समस्त कर्तव्यों एवं दायित्वों का निर्वहन करेंगे, जिनमें निम्नलिखित शामिल हैं किंतु इन्हीं तक सीमित नहीं हैं:
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

          {/* ══ २. रोजगार प्रारंभ ══ */}
          <div className="section-heading">२. रोजगार का प्रारंभ</div>
          <div className="body-text">
            नियोक्ता के यहाँ कर्मचारी का रोजगार{' '}
            <span className="underline-blank">{formatHindiDate(data.employment?.joiningDate)}</span>{' '}
            से प्रारंभ होगा। कर्मचारी की तैनाती{' '}
            <span className="underline-blank">{data.employment?.placeOfPosting || ''}</span>{' '}
            अथवा नियोक्ता द्वारा समय-समय पर निर्धारित किसी अन्य परियोजना स्थल पर होगी।
            कर्मचारी सम्मिलन की तिथि से{' '}
            <strong>{data.employment?.probationPeriod || '३ (तीन) माह'}</strong>{' '}
            की अवधि के लिए परिवीक्षा पर रहेंगे, जिस दौरान कोई भी पक्ष बिना कारण अथवा पूर्व सूचना के इस करार को समाप्त कर सकता है। परिवीक्षा की सफल पूर्णता के पश्चात रोजगार की पुष्टि लिखित में की जाएगी।
          </div>

          {/* ══ ३. पारिश्रमिक ══ */}
          <div className="section-heading">३. पारिश्रमिक</div>

          <div className="sub-heading">वेतन</div>
          <div className="body-text">
            नियोक्ता कर्मचारी को ₹{' '}
            <span className="underline-blank">{convertNumberToHindi(data.employment?.grossAnnualSalary || '')}</span>
            /- (रुपये{' '}
            <span className="underline-blank" style={{ minWidth: '160px' }}>
              {convertToHindi(data.employment?.grossAnnualSalaryWords || '')}
            </span>{' '}
            मात्र) का वार्षिक सकल वेतन, अर्थात् ₹{' '}
            <span className="underline-blank">{convertNumberToHindi(data.employment?.grossMonthlySalary || '')}</span>
            /- (रुपये{' '}
            <span className="underline-blank" style={{ minWidth: '140px' }}>
              {convertToHindi(data.employment?.grossMonthlySalaryWords || '')}
            </span>{' '}
            मात्र) के समतुल्य मासिक सकल वेतन का भुगतान करेंगे, जो समान मासिक किश्तों में, लागू कटौतियों एवं वैधानिक स्रोत कर के अधीन, देय होगा।
          </div>

          <div className="sub-heading">साइट भत्ते</div>
          <div className="body-text">
            उपरोक्त वेतन के अतिरिक्त, कर्मचारी नियोक्ता की प्रचलित नीति के अनुसार निम्नलिखित साइट-संबंधी भत्तों के पात्र होंगे:
          </div>
          <ul className="benefits-list">
            <li><strong>यात्रा / वाहन भत्ता:</strong> परियोजना स्थलों एवं मुख्य कार्यालय के बीच यात्रा के लिए वास्तविक व्यय अथवा लागू स्लैब के अनुसार प्रतिपूर्ति।</li>
            <li><strong>साइट कठिनाई भत्ता:</strong> दूरस्थ अथवा विकासशील परियोजना स्थलों पर किए गए क्षेत्र कार्य के लिए नियोक्ता के विवेकाधिकार पर देय निश्चित मासिक भत्ता।</li>
            <li><strong>मोबाइल / संचार भत्ता:</strong> साइट कर्तव्यों के निर्वहन में हुए संचार व्यय की मासिक प्रतिपूर्ति।</li>
          </ul>

          <div className="sub-heading">लाभ</div>
          <div className="body-text">
            कर्मचारी नियोक्ता की मानक नीतियों के अनुसार निम्नलिखित लाभों के पात्र होंगे:
          </div>

          <div style={{ fontWeight: 700, fontSize: '13px', marginTop: '5px', marginBottom: '2px' }}>
            अनिवार्य वैधानिक लाभ
          </div>
          <ul className="benefits-list">
            <li><strong>कर्मचारी भविष्य निधि (EPF):</strong> 20 या अधिक कर्मचारियों वाली कंपनियों के लिए अनिवार्य।</li>
            <li><strong>कर्मचारी राज्य बीमा (ESI):</strong> 10 से अधिक कर्मचारियों (कुछ राज्यों में 20) वाली कंपनियों के लिए अनिवार्य, जहाँ कर्मचारी का वेतन ₹21,000 प्रतिमाह से कम हो।</li>
            <li><strong>उपदान (Gratuity):</strong> 5 वर्ष की सतत सेवा पूर्ण करने पर देय।</li>
            <li>
              <strong>अवकाश नीति:</strong> वार्षिक / अर्जित अवकाश ({convertNumberToHindi(data.employment?.annualLeaves || '12')} दिन),
              चिकित्सा अवकाश ({convertNumberToHindi(data.employment?.medicalLeaves || '6')} दिन) एवं आकस्मिक अवकाश ({convertNumberToHindi(data.employment?.casualLeaves || '6')} दिन) सम्मिलित।
            </li>
            <li><strong>मातृत्व लाभ:</strong> मातृत्व लाभ अधिनियम, 1961 के अंतर्गत पात्र महिला कर्मचारियों को सवेतन अवकाश।</li>
          </ul>

          <div style={{ fontWeight: 700, fontSize: '13px', marginTop: '5px', marginBottom: '2px' }}>
            स्वैच्छिक / प्रतिस्पर्धी लाभ
          </div>
          <ul className="benefits-list">
            <li><strong>समूह स्वास्थ्य बीमा:</strong> कंपनी नीति के अनुसार व्यापक चिकित्सा कवरेज।</li>
            <li><strong>प्रदर्शन प्रोत्साहन:</strong> प्रबंधन के विवेकाधिकार पर प्रदर्शन आधारित बोनस एवं वेतन वृद्धि।</li>
            <li><strong>व्यावसायिक विकास:</strong> निर्माण एवं परियोजना प्रबंधन में साइट प्रशिक्षण, सुरक्षा प्रमाणन एवं कौशल उन्नयन के अवसर।</li>
            <li><strong>कर्मचारी शेयर स्वामित्व योजना (ESOPs):</strong> यदि लागू हो तो शीर्ष प्रतिभाओं को प्रेरित एवं बनाए रखने हेतु इक्विटी प्रस्ताव।</li>
          </ul>

          <div style={{ fontWeight: 700, fontSize: '13px', marginTop: '5px', marginBottom: '2px' }}>
            वैकल्पिक सुविधाएँ
          </div>
          <ul className="benefits-list">
            <li>कल्याण कार्यक्रम: स्वास्थ्य जाँच, सुरक्षा उपकरण एवं साइट कल्याण सहायता।</li>
            <li>अतिरिक्त अवकाश: कंपनी नीति के अनुसार पितृत्व अवकाश, शोक अवकाश।</li>
            <li>भविष्य निधि अंशदान एवं नियोक्ता द्वारा समय-समय पर निर्धारित अन्य लाभ।</li>
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

          {/* ══ ४. कार्य समय एवं साइट उपस्थिति ══ */}
          <div className="section-heading">४. कार्य समय एवं साइट उपस्थिति</div>
          <div className="body-text">
            कर्मचारी का मानक कार्य समय{' '}
            <span className="underline-blank">{data.employment?.workingHours || 'प्रातः 8:00 बजे से सायं 5:00 बजे'}</span>{' '}
            तक,{' '}
            {data.employment?.workingDays || 'सोमवार से शनिवार'} रहेगा, जिसमें{' '}
            <span className="underline-blank">{data.employment?.lunchBreak || '30 (तीस) मिनट'}</span>{' '}
            का मध्याह्न भोजन अवकाश सम्मिलित है। कर्मचारी को कार्य समय के दौरान निर्धारित परियोजना स्थल पर शारीरिक रूप से उपस्थित रहना अनिवार्य है, जब तक प्रबंधन द्वारा अन्यथा निर्देशित न किया जाए। निर्माण कार्य अथवा परियोजना सुपुर्दगी के महत्वपूर्ण चरणों के दौरान कर्मचारी को रविवार, सार्वजनिक अवकाश अथवा अतिरिक्त घंटे कार्य करने की आवश्यकता हो सकती है, जिसके लिए प्रतिपूरक अवकाश अथवा ओवरटाइम नियोक्ता की लागू नीति द्वारा शासित होगा।
          </div>

          {/* ══ ५. साइट सुरक्षा एवं वैधानिक अनुपालन ══ */}
          <div className="section-heading">५. साइट सुरक्षा एवं वैधानिक अनुपालन</div>
          <div className="body-text">
            कर्मचारी सदैव भवन एवं अन्य निर्माण कामगार (रोजगार नियमन एवं सेवा शर्तें) अधिनियम, 1996 तथा किसी भी अन्य लागू श्रम अथवा निर्माण कानूनों के अंतर्गत निर्धारित समस्त साइट सुरक्षा मानदंडों, मानकों एवं विनियमों का पालन एवं प्रवर्तन करेंगे। कर्मचारी यह सुनिश्चित करेंगे कि उनकी देखरेख में कार्यरत समस्त श्रमिक निर्धारित व्यक्तिगत सुरक्षा उपकरण (PPE) पहनें, सुरक्षित कार्य प्रथाओं का पालन करें तथा साइट पर किसी भी असुरक्षित स्थिति को बने रहने की अनुमति न दी जाए। किसी भी दुर्घटना, निकट-चूक (near-miss) अथवा सुरक्षा उल्लंघन की तत्काल रिपोर्ट प्रबंधन को की जानी चाहिए।
          </div>

          {/* ══ ६. गोपनीयता ══ */}
          <div className="section-heading">६. गोपनीयता</div>
          <div className="body-text">
            कर्मचारी स्वीकार करते हैं कि रोजगार के दौरान उन्हें नियोक्ता की गोपनीय एवं स्वामित्व संबंधी जानकारी तक पहुँच प्राप्त होगी, जिसमें परियोजना लेआउट, भूमि अधिग्रहण विवरण, ग्राहक डेटा, ठेकेदार अनुबंध, निर्माण लागत एवं व्यावसायिक रणनीतियाँ सम्मिलित हैं किंतु इन्हीं तक सीमित नहीं हैं। कर्मचारी इस समस्त जानकारी को पूर्णतः गोपनीय रखने तथा इसे किसी तृतीय पक्ष को प्रकट न करने अथवा नियोक्ता के लाभ के अतिरिक्त किसी अन्य उद्देश्य के लिए उपयोग न करने के लिए सहमत हैं, चाहे रोजगार के दौरान हो अथवा पश्चात।
          </div>

          {/* ══ ७. गैर-प्रतिस्पर्धा ══ */}
          <div className="section-heading">७. गैर-प्रतिस्पर्धा</div>
          <div className="body-text">
            रोजगार की अवधि के दौरान तथा किसी भी कारण से रोजगार समाप्त होने के पश्चात{' '}
            <span className="underline-blank">{data.employment?.nonCompetePeriod || '६ (छह) माह'}</span>{' '}
            की अवधि तक, कर्मचारी प्रत्यक्ष अथवा अप्रत्यक्ष रूप से नियोक्ता के किसी भी सक्रिय परियोजना स्थल की{' '}
            <span className="underline-blank">{data.employment?.nonCompeteRadius || '25 किमी'}</span>{' '}
            परिधि के भीतर नियोक्ता के रियल एस्टेट विकास एवं निर्माण व्यवसाय से प्रतिस्पर्धा करने वाले किसी भी व्यवसाय अथवा गतिविधि में संलग्न नहीं होंगे।
          </div>

          {/* ══ ८. रोजगार समाप्ति ══ */}
          <div className="section-heading">८. रोजगार की समाप्ति</div>

          <div className="sub-heading">नियोक्ता द्वारा समाप्ति</div>
          <div className="body-text">नियोक्ता निम्नलिखित कारणों से कर्मचारी का रोजगार समाप्त कर सकते हैं:</div>
          <ul className="termination-list">
            <li>
              <strong>कारण सहित:</strong> तत्काल प्रभाव से, उन कारणों के लिए जिनमें सम्मिलित हैं किंतु इन्हीं तक सीमित नहीं: घोर कदाचार, अवज्ञा, साइट का परित्याग, सुरक्षा मानदंडों का उल्लंघन, धोखाधड़ी, गोपनीयता का उल्लंघन अथवा इस करार का सारभूत उल्लंघन।
            </li>
            <li>
              <strong>बिना कारण के:</strong>{' '}
              <span className="underline-blank">{convertToHindi(data.employment?.noticePeriodEmployer || '30 (तीस) दिन')}</span>{' '}
              की लिखित सूचना अथवा सूचना के बदले भुगतान देकर।
            </li>
          </ul>

          <div className="sub-heading">कर्मचारी द्वारा समाप्ति</div>
          <div className="body-text">
            कर्मचारी नियोक्ता को{' '}
            <span className="underline-blank">{convertToHindi(data.employment?.noticePeriodEmployee || '30 (तीस) दिन')}</span>{' '}
            की लिखित सूचना देकर अपना रोजगार समाप्त कर सकते हैं। समाप्ति पर कर्मचारी तत्काल समस्त साइट अभिलेख, दैनिक डायरी, सामग्री रजिस्टर, चाबियाँ, प्रवेश कार्ड, कंपनी के स्वामित्व वाले उपकरण एवं अन्य समस्त संपत्ति जो नियोक्ता की हो अथवा परियोजना स्थल पर स्थित हो, वापस सुपुर्द करेंगे।
          </div>

          {/* ══ ९. शासी विधि एवं क्षेत्राधिकार ══ */}
          <div className="section-heading">९. शासी विधि एवं क्षेत्राधिकार</div>
          <div className="body-text">
            यह करार भारत के विधियों के अनुसार शासित एवं उनके अनुरूप व्याख्यायित होगा।
            इस करार से उत्पन्न अथवा इससे संबंधित किसी भी विवाद को{' '}
            <span className="underline-blank">{data.employment?.jurisdiction || data.company?.companyDistrict || ''}</span>{' '}
            के न्यायालयों के अनन्य क्षेत्राधिकार के अधीन रखा जाएगा।
          </div>

          {/* ══ १०. संपूर्ण करार ══ */}
          <div className="section-heading">१०. संपूर्ण करार</div>
          <div className="body-text">
            यह करार रोजगार की शर्तों के संबंध में नियोक्ता एवं कर्मचारी के मध्य संपूर्ण करार का गठन करता है तथा पूर्व की समस्त चर्चाओं, वार्ताओं एवं करारों को, चाहे लिखित हों अथवा मौखिक, अधिक्रमित करता है।
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

          {/* ══ ११. संशोधन ══ */}
          <div className="section-heading">११. संशोधन</div>
          <div className="body-text">
            इस करार में कोई भी संशोधन अथवा परिवर्तन लिखित रूप में तथा नियोक्ता एवं कर्मचारी दोनों के हस्ताक्षर से किया जाना अनिवार्य है।
          </div>

          {/* ══ १२. विभाज्यता ══ */}
          <div className="section-heading">१२. विभाज्यता</div>
          <div className="body-text">
            यदि इस करार का कोई प्रावधान अमान्य अथवा अप्रवर्तनीय पाया जाता है, तो शेष प्रावधान विधि द्वारा अनुमत अधिकतम सीमा तक वैध एवं प्रवर्तनीय बने रहेंगे।
          </div>

          {/* ══ हस्ताक्षर ══ */}
          <div className="sig-grid">

            {/* नियोक्ता हस्ताक्षर */}
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
                <strong>पद:</strong>
                <span className="underline-blank" style={{ minWidth: '120px' }}>
                  {data.manager?.managerPosition || data.company?.managerPosition || data.company?.hrDesignation}
                </span>
              </div>
              <div style={{ marginTop: '6px', fontSize: '12px', fontStyle: 'italic' }}>
                {convertToHindi(data.company?.companyName || '')}{data.company?.entityType ? ` (${data.company.entityType})` : ''} की ओर से
              </div>
            </div>

            {/* कर्मचारी हस्ताक्षर */}
            <div className="sig-block">
              <div className="sig-block-title">कर्मचारी के हस्ताक्षर</div>
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
                बायें अंगूठे का निशान:-
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

export default HindiSiteSupervisorAgreement;