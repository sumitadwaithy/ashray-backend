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

const MarathiDriverAgreement = ({ data, companyLogo, companyWatermark }: TemplateProps) => {

  const formatMarathiDate = (dateStr?: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return convertNumberToMarathi(dateStr);
    const day = convertNumberToMarathi(date.getDate());
    const month = convertNumberToMarathi(date.getMonth() + 1);
    const year = convertNumberToMarathi(date.getFullYear());
    return `${day}/${month}/${year}`;
  };

  const safe = (v?: any) => (!v || v === '') ? '________' : String(v);

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
          margin-bottom: 5px;
          letter-spacing: 0.4px;
        }
        .body-text {
          font-size: 13px;
          line-height: 2;
          text-align: justify;
          margin-bottom: 5px;
        }
        .duty-list {
          margin: 3px 0 5px 16px;
          font-size: 13px;
          line-height: 2;
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
          min-width: 36px;
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
        .consent-box {
          border: 1.5px solid #c0392b;
          border-left: 4px solid #c0392b;
          background: #fff8f7;
          padding: 10px 14px;
          margin: 12px 0 6px 0;
          font-size: 12.5px;
          line-height: 1.9;
          border-radius: 2px;
        }
        .consent-box-title {
          font-weight: 800;
          font-size: 13px;
          margin-bottom: 5px;
          text-decoration: underline;
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
          <div className="agreement-title">रोजगार करार</div>
          <div className="agreement-subtitle">(वाहन चालक — कर्तव्ये, जबाबदाऱ्या व सेवाशर्ती)</div>

          {/* ── प्रस्तावना ── */}
          <div className="body-text">
            हा रोजगार करार <strong>("करार")</strong> दिनांक{' '}
            <span className="underline-blank">{formatMarathiDate(data.employment?.joiningDate)}</span>{' '}
            रोजी खालील पक्षांमध्ये केला गेला आहे व अंमलात आला आहे:
          </div>

          {/* ── नियोक्ता ── */}
          <div className="party-block">
            <div className="party-name">{employerFullName}</div>
            <div><strong>पत्ता:</strong> {employerAddress}</div>
            <div><strong>CIN / नोंद क्र.:</strong> {data.company?.cinNumber || data.company?.licenseRegistrationNumber || ''}</div>
            <div style={{ fontStyle: 'italic' }}>(यापुढे <strong>"नियोक्ता"</strong> म्हणून संदर्भित)</div>
          </div>

          <div className="and-divider">व</div>

          {/* ── कर्मचारी ── */}
          <div className="party-block">
            <div className="party-name">{employeeFullName}</div>
            {data.employee?.fatherName && <div><strong>वडिलांचे नाव:</strong> {data.employee.fatherName}</div>}
            <div><strong>पत्ता:</strong> {employeeAddress}</div>
            <div>
              <strong>जन्म दिनांक:</strong>{' '}
              {data.employee?.dob ? formatMarathiDate(data.employee.dob) : <span className="underline-blank" style={{ minWidth: '100px' }} />}
            </div>
            <div>
              <strong>आधार क्र.:</strong>{' '}
              {formatAadhaarMarathi(data.employee?.aadhaar) || <span className="underline-blank" style={{ minWidth: '130px' }} />}
              &emsp;
              <strong>पॅन क्र.:</strong>{' '}
              {data.employee?.pan || <span className="underline-blank" style={{ minWidth: '100px' }} />}
            </div>
            <div>
              <strong>वाहन परवाना क्र.:</strong>{' '}
              <span className="underline-blank" style={{ minWidth: '130px' }}>{safe((data.employee as any)?.licenseNumber)}</span>
              &emsp;
              <strong>वैधता:</strong>{' '}
              <span className="underline-blank" style={{ minWidth: '90px' }}>{safe((data.employee as any)?.licenseExpiry)}</span>
            </div>
            <div style={{ fontStyle: 'italic' }}>(यापुढे <strong>"चालक"</strong> म्हणून संदर्भित)</div>
          </div>

          {/* ══ १. पद व कर्तव्ये ══ */}
          <div className="section-heading">१. पद व कर्तव्ये</div>
          <div className="body-text">
            नियोक्ता एतदर्थ चालकास <strong>वाहन चालक</strong> या पदावर नियुक्त करतात
            {data.employment?.department ? `, ${data.employment.department} विभागात` : ''}. चालकाची नियुक्ती{' '}
            <span className="underline-blank">{safe(data.employment?.placeOfPosting)}</span>{' '}
            येथे होईल व ते{' '}
            <span className="underline-blank">{safe(data.employment?.reportingTo)}</span>{' '}
            यांना अहवाल देतील. चालकाची प्राथमिक जबाबदारी असेल की नियोक्त्याच्या अधिकृत वाहनांचे सुरक्षित, शिस्तबद्ध व कायदेशीर पद्धतीने संचालन करावे आणि कार्यालयाचे कर्मचारी, अधिकारी व अधिकृत व्यक्तींना निर्धारित ठिकाणी वेळेवर व सुरक्षितपणे पोहोचवावे.
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

          {/* ══ २. मुख्य जबाबदाऱ्या ══ */}
          <div className="section-heading">२. मुख्य जबाबदाऱ्या</div>
          <ul className="duty-list">
            <li><span className="duty-num">२.१</span><span>कार्यालयाशी संबंधित सर्व अधिकृत व्यक्तींना निर्धारित ठिकाणी सुरक्षितपणे पोहोचवणे.</span></li>
            <li><span className="duty-num">२.२</span><span>प्रत्येक प्रवासासाठी नियोजित वेळेच्या <strong>कमीत कमी ०५ मिनिटे आधी</strong> वाहन स्वच्छ व तयार अवस्थेत उपलब्ध करणे.</span></li>
            <li><span className="duty-num">२.३</span><span>वाहन चालवताना सर्व वाहतूक नियम व रस्त्याचे नियम कसोशीने पाळणे.</span></li>
            <li><span className="duty-num">२.४</span><span>प्रवासादरम्यान वाहनातील व इतर सर्व व्यक्तींशी शिस्त, सभ्यता व आदराने वागणे.</span></li>
            <li><span className="duty-num">२.५</span><span>प्रवासाशी संबंधित सर्व माहिती व प्रवाशांची ओळख याची <strong>पूर्ण गोपनीयता</strong> राखणे.</span></li>
            <li><span className="duty-num">२.६</span><span>वाहन केवळ नियोक्त्याने निर्धारित केलेल्या अधिकृत पार्किंग ठिकाणीच लावणे.</span></li>
            <li><span className="duty-num">२.७</span><span>नियोक्त्याच्या पूर्व लेखी परवानगीशिवाय कंपनीच्या वाहनाचा कोणत्याही परिस्थितीत वैयक्तिक वापर न करणे.</span></li>
            <li><span className="duty-num">२.८</span><span>प्रत्येक प्रवासापूर्वी निर्धारित मार्गाची माहिती घेणे तथा आवश्यकतेनुसार पर्यायी मार्गाची आधीच माहिती ठेवणे.</span></li>
          </ul>

          {/* ══ ३. वाहन देखभाल व देखरेख ══ */}
          <div className="section-heading">३. वाहन देखभाल व देखरेख</div>
          <ul className="duty-list">
            <li><span className="duty-num">३.१</span><span>प्रत्येक प्रवासापूर्वी इंधन, ब्रेक, टायर, पाणी, कूलंट, इंजिन ऑइल, बॅटरी, इंडिकेटर इत्यादी सर्व घटकांची सखोल तपासणी करणे.</span></li>
            <li><span className="duty-num">३.२</span><span>वाहन रोज आतून व बाहेरून साधारणपणे स्वच्छ ठेवणे तथा आठवड्यातून <strong>किमान २ वेळा</strong> सखोल स्वच्छता करणे; आवश्यकता असल्यास ही संख्या अधिक असेल.</span></li>
            <li><span className="duty-num">३.३</span><span>कोणताही तांत्रिक बिघाड, अपघात किंवा असामान्य आवाजाची माहिती त्वरित व्यवस्थापनाला देणे.</span></li>
            <li><span className="duty-num">३.४</span><span>वाहनाची सर्व्हिसिंग व दुरुस्ती <strong>निर्धारित वेळेत</strong> अधिकृत सर्व्हिस केंद्रावर करवून घेणे.</span></li>
            <li><span className="duty-num">३.५</span><span>नियोक्त्याच्या लेखी परवानगीशिवाय वाहनात कोणताही संरचनात्मक बदल, स्टिकर, सजावट इत्यादी न करणे.</span></li>
          </ul>

          {/* ══ ४. कागदपत्र व्यवस्थापन ══ */}
          <div className="section-heading">४. कागदपत्र व्यवस्थापन</div>
          <ul className="duty-list">
            <li><span className="duty-num">४.१</span><span>वाहन व स्वतःची सर्व आवश्यक कागदपत्रे — वाहन नोंदणी प्रमाणपत्र (RC), विमा, प्रदूषण नियंत्रण प्रमाणपत्र (PUC), वाहन परवाना व इतर वाहतूक नियमांनुसार आवश्यक कागदपत्रे — सदैव सोबत बाळगणे.</span></li>
            <li><span className="duty-num">४.२</span><span>कागदपत्रांची वैधता संपण्यापूर्वीच <strong>पुरेसा वेळ आधी</strong> नूतनीकरण करवून घेणे व त्याबाबत व्यवस्थापनाला वेळेत कळवणे.</span></li>
            <li><span className="duty-num">४.३</span><span>वाहतूक पोलीस किंवा कोणत्याही सक्षम प्राधिकाऱ्याने तपासणी केल्यास सर्व कागदपत्रे नम्रतेने व त्वरित सादर करणे.</span></li>
          </ul>

          {/* ══ ५. वेळ पालन व उपस्थिती ══ */}
          <div className="section-heading">५. वेळ पालन व उपस्थिती</div>
          <ul className="duty-list">
            <li><span className="duty-num">५.१</span><span>सामान्यतः कर्तव्याची वेळ <strong>सकाळी ०९:३०</strong> ते <strong>सायंकाळी ०७:३०</strong> अशी निर्धारित आहे. परिचालनाची गरज असल्यास अतिरिक्त वेळही काम करावे लागेल, त्याबदल्यात भरपाईची सुट्टी दिली जाऊ शकते. आणीबाणीच्या परिस्थितीत <strong>२४ तासांच्या आत कधीही</strong> कामावर येणे बंधनकारक आहे; अशा वेळी वैयक्तिक कारणे सांगता येणार नाहीत, परंतु अशा अतिरिक्त कामाचा योग्य मोबदला दिला जाईल.</span></li>
            <li><span className="duty-num">५.२</span><span>कोणत्याही परिस्थितीत कर्तव्य हे सर्वोच्च आहे; स्वतःचे हित नंतर पाहावे.</span></li>
            <li><span className="duty-num">५.३</span><span>अनुपस्थितीच्या बाबतीत व्यवस्थापनाला आधीच सूचना देणे अनिवार्य आहे. पूर्वसूचनेशिवाय अनुपस्थिती अनधिकृत रजा मानली जाईल.</span></li>
            <li><span className="duty-num">५.४</span><span>कर्तव्याच्या वेळेत कार्यालयातून थोड्या वेळासाठी बाहेर जायचे असल्यास कार्यालयाच्या रजिस्टरमध्ये जाण्याची व येण्याची वेळ नोंदवणे अनिवार्य आहे.</span></li>
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

          {/* ══ ६. सुरक्षा व शिस्त ══ */}
          <div className="section-heading">६. सुरक्षा व शिस्त</div>
          <ul className="duty-list">
            <li><span className="duty-num">६.१</span><span>कोणत्याही परिस्थितीत <strong>मद्य, मादक पदार्थ किंवा कोणत्याही नशेच्या अवस्थेत</strong> वाहन चालवणे कठोरपणे निषिद्ध आहे. असे आढळल्यास तत्काळ बडतर्फी व कायदेशीर कारवाई केली जाईल.</span></li>
            <li><span className="duty-num">६.२</span><span>वाहन चालवताना <strong>मोबाइल फोन</strong> कोणत्याही प्रकारे — हातात धरून किंवा हँड्सफ्री वापरूनही — वापरण्यास सक्त मनाई आहे.</span></li>
            <li><span className="duty-num">६.३</span><span>वाहनातील सर्व प्रवाशांची, पादचाऱ्यांची व इतर सर्व रस्ता वापरकर्त्यांची सुरक्षा हे चालकाचे सर्वोच्च कर्तव्य आहे.</span></li>
            <li><span className="duty-num">६.४</span><span>ओव्हर-स्पीडिंग, लाल दिवा तोडणे, सीट बेल्ट न घालणे किंवा बेपर्वाईने वाहन चालवणे यांसारखे कोणतेही वाहतूक नियम उल्लंघन कोणत्याही परिस्थितीत केले जाणार नाही.</span></li>
            <li><span className="duty-num">६.५</span><span>नियोक्त्याने दिलेला गणवेश (जर दिला असेल तर) सदैव स्वच्छ व व्यवस्थित परिधान केला जाईल.</span></li>
            <li><span className="duty-num">६.६</span><span>कार्यालयाचे कर्मचारी, प्रवासी किंवा कर्तव्यादरम्यान भेटणाऱ्या कोणत्याही व्यक्तीशी असभ्य, अनादरपूर्ण किंवा वादग्रस्त वर्तन केले जाणार नाही.</span></li>
            <li><span className="duty-num">६.७</span><span>अधिकृत प्रवाशांव्यतिरिक्त कोणत्याही अनधिकृत व्यक्तीला नियोक्ता किंवा नियुक्त अधिकाऱ्याच्या स्पष्ट पूर्वपरवानगीशिवाय वाहनात बसू दिले जाणार नाही.</span></li>
          </ul>

          {/* ══ ७. रजा, वेतन व इतर अटी ══ */}
          <div className="section-heading">७. रजा, वेतन व इतर अटी</div>
          <ul className="duty-list">
            <li><span className="duty-num">७.१</span><span>चालकास दर महिन्यात जास्तीत जास्त <strong>०२ (दोन) नियमित रजा</strong> मिळण्याचा हक्क आहे. अशी रजा किमान <strong>०२ (दोन) दिवस आधी</strong> सूचना देऊन घेता येईल. पूर्वसूचनेशिवाय अचानक रजा घेतल्यास त्या दिवसासाठी पर्यायी चालकाची व्यवस्था करण्याचा खर्च चालकाच्या मासिक वेतनातून वजा केला जाईल, जो एका दिवसाच्या वेतनापेक्षा अधिक असू शकतो.</span></li>
            <li><span className="duty-num">७.२</span><span>खऱ्या आणीबाणीच्या परिस्थितीत तत्काळ सूचना देऊन रजा घेता येईल; परंतु कारण सत्य असणे आवश्यक आहे. असत्य कारण आढळल्यास <strong>दुप्पट वेतन कपात</strong> केली जाईल.</span></li>
            <li><span className="duty-num">७.३</span><span>चालकास दुसरीकडे नोकरी मिळाल्याने सेवा सोडायची असल्यास किमान <strong>९० (नव्वद) दिवस आधी लेखी सूचना</strong> देणे अनिवार्य आहे. ९१व्या दिवसापासून सेवा सोडता येईल. पूर्वसूचनेशिवाय किंवा निर्धारित सूचना कालावधीपूर्वी सेवा सोडल्यास सर्व प्रलंबित देयके व अंतिम निपटारा जप्त केला जाईल.</span></li>
            <li><span className="duty-num">७.४</span><span>चालकाने स्वतःचा <strong>वैयक्तिक अपघात विमा</strong> स्वखर्चाने काढणे अनिवार्य आहे. असे न केल्यास कोणत्याही अपघाताच्या किंवा दुखापतीच्या प्रसंगी नियोक्ता {employerFullName} कोणत्याही आर्थिक दायित्वासाठी जबाबदार राहणार नाही.</span></li>
            <li><span className="duty-num">७.५</span><span>कर्तव्याच्या वेळेत कार्यालयातून थोड्या वेळासाठी बाहेर जायचे असल्यास कार्यालयाच्या रजिस्टरमध्ये जाण्याची व येण्याची वेळ नोंदवणे अनिवार्य आहे.</span></li>
            <li><span className="duty-num">७.६</span><span>आवश्यकता असल्यास, कार्यालयाचा नियुक्त कर्मचारी रजेवर असताना चालकाला कार्यालयीन कामेही करावी लागतील. "हे माझे काम नाही" असे सांगता येणार नाही. चालकाने कार्यालयीन कार्यकारीकडून कार्यालयाचे काम शिकणेही अपेक्षित आहे.</span></li>
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

          {/* ══ ८. मोबदला ══ */}
          <div className="section-heading">८. मोबदला</div>

          <div className="sub-heading">वेतन</div>
          <div className="body-text">
            नियोक्ता चालकास ₹{' '}
            <span className="underline-blank">{convertNumberToMarathi(data.employment?.grossAnnualSalary || '')}</span>
            /- (रुपये{' '}
            <span className="underline-blank" style={{ minWidth: '160px' }}>{convertToMarathi(data.employment?.grossAnnualSalaryWords || '')}</span>{' '}
            मात्र) एवढे वार्षिक एकूण वेतन देतील, जे ₹{' '}
            <span className="underline-blank">{convertNumberToMarathi(data.employment?.grossMonthlySalary || '')}</span>
            /- (रुपये{' '}
            <span className="underline-blank" style={{ minWidth: '140px' }}>{convertToMarathi(data.employment?.grossMonthlySalaryWords || '')}</span>{' '}
            मात्र) एवढ्या मासिक एकूण वेतनाच्या समतुल्य असेल, जे समान मासिक हप्त्यांमध्ये, लागू कपाती व वैधानिक उद्गम करास अधीन राहून, देय असेल.
          </div>

          <div className="sub-heading">लाभ</div>
          <div className="body-text">
            चालक नियोक्त्याच्या प्रमाणित धोरणांनुसार खालील लाभांसाठी पात्र असेल:
          </div>

          <div style={{ fontWeight: 700, fontSize: '13px', marginTop: '5px', marginBottom: '2px' }}>
            अनिवार्य वैधानिक लाभ
          </div>
          <ul className="benefits-list">
            <li><strong>कर्मचारी भविष्य निर्वाह निधी (EPF):</strong> २० किंवा अधिक कर्मचारी असलेल्या कंपन्यांसाठी अनिवार्य.</li>
            <li><strong>कर्मचारी राज्य विमा (ESI):</strong> १० पेक्षा जास्त कर्मचारी (काही राज्यांत २०) असलेल्या कंपन्यांसाठी आवश्यक, जेथे वेतन ₹२१,०००/- प्रतिमाह पेक्षा कमी असेल.</li>
            <li><strong>उपदान (Gratuity):</strong> ५ वर्षे सतत सेवा पूर्ण केल्यावर देय.</li>
            <li><strong>रजा धोरण:</strong> वार्षिक / अर्जित रजा ({convertNumberToMarathi(data.employment?.annualLeaves || '12')} दिवस), वैद्यकीय रजा ({convertNumberToMarathi(data.employment?.medicalLeaves || '6')} दिवस) व आकस्मिक रजा ({convertNumberToMarathi(data.employment?.casualLeaves || '6')} दिवस).</li>
            <li><strong>मातृत्व लाभ:</strong> मातृत्व लाभ कायदा, १९६१ नुसार पात्र महिला कर्मचाऱ्यांसाठी सवेतन रजा.</li>
          </ul>

          <div style={{ fontWeight: 700, fontSize: '13px', marginTop: '5px', marginBottom: '2px' }}>
            परिचालन भत्ते
          </div>
          <ul className="benefits-list">
            <li><strong>इंधन व टोल:</strong> अधिकृत कामाच्या प्रवासातील इंधन व टोलचा संपूर्ण खर्च नियोक्त्याकडून वहन केला जाईल.</li>
            <li><strong>ओव्हरटाइम मोबदला:</strong> निर्धारित कामाच्या वेळेपलीकडे केलेल्या कामाचा नियोक्त्याच्या प्रचलित धोरणानुसार योग्य मोबदला.</li>
            <li><strong>गणवेश देखभाल:</strong> नियोक्त्याने गणवेश दिल्यास त्याची स्वच्छता व सुस्थिती राखण्याची जबाबदारी चालकाची असेल.</li>
          </ul>

          {/* ══ ९. रोजगाराची सुरुवात ══ */}
          <div className="section-heading">९. रोजगाराची सुरुवात</div>
          <div className="body-text">
            नियोक्त्याकडे चालकाचा रोजगार{' '}
            <span className="underline-blank">{formatMarathiDate(data.employment?.joiningDate)}</span>{' '}
            पासून सुरू होईल. चालक रुजू होण्याच्या दिनांकापासून{' '}
            <strong>{data.employment?.probationPeriod || '३ (तीन) महिने'}</strong>{' '}
            च्या कालावधीसाठी परिवीक्षाधीन राहील, या काळात कोणताही पक्ष कारण किंवा पूर्वसूचनेशिवाय हा करार संपुष्टात आणू शकतो. परिवीक्षा यशस्वीरीत्या पूर्ण झाल्यावर नियुक्तीची पुष्टी लेखी स्वरूपात दिली जाईल.
          </div>

          {/* ══ १०. गोपनीयता ══ */}
          <div className="section-heading">१०. गोपनीयता</div>
          <div className="body-text">
            चालक मान्य करतो की रोजगाराच्या काळात त्याला नियोक्त्याचे कार्यालय, प्रवासी, व्यावसायिक क्रियाकलाप व अंतर्गत माहिती यांचा प्रवेश मिळेल, ज्यात ग्राहक याद्या, मालमत्ता याद्या, आर्थिक डेटा, विपणन धोरणे, व्यवसाय योजना तसेच प्रवाशांची ओळख, गंतव्ये व हालचाली यांचा समावेश आहे परंतु त्यापुरतेच मर्यादित नाही. चालक ही सर्व माहिती कडक गोपनीय ठेवण्यास व रोजगाराच्या काळात आणि नंतरही नियोक्त्याच्या फायद्याव्यतिरिक्त कोणत्याही उद्देशासाठी कोणत्याही तृतीय पक्षास न उघड करण्यास सहमत आहे. प्रवाशांची ओळख, प्रवासाचे तपशील किंवा कंपनीची कोणतीही अंतर्गत माहिती उघड करणे हे या कराराचे गंभीर उल्लंघन मानले जाईल.
          </div>

          {/* ══ ११. रोजगाराची समाप्ती ══ */}
          <div className="section-heading">११. रोजगाराची समाप्ती</div>

          <div className="sub-heading">नियोक्त्याकडून समाप्ती</div>
          <div className="body-text">नियोक्ता खालील कारणांसाठी चालकाचा रोजगार संपुष्टात आणू शकतात:</div>
          <ul className="termination-list">
            <li>
              <strong>कारणासह (तत्काळ):</strong> मद्याच्या किंवा नशेच्या अवस्थेत वाहन चालवणे; सिद्ध निष्काळजीपणामुळे अपघात; कंपनीच्या वाहनाचा अनधिकृत वापर; प्रवासी किंवा सहकाऱ्यांशी गैरवर्तन; गोपनीयतेचा भंग; कागदपत्र जाळसाजी; घोर अनाज्ञाधारकपणा; फसवणूक; किंवा या कराराचे कोणतेही सारभूत उल्लंघन.
            </li>
            <li>
              <strong>कारणाशिवाय:</strong>{' '}
              <span className="underline-blank">{convertToMarathi(data.employment?.noticePeriodEmployer || '३० (तीस) दिवस')}</span>{' '}
              चे लेखी नोटीस किंवा नोटिसाऐवजी देयक देऊन.
            </li>
          </ul>

          <div className="sub-heading">चालकाकडून समाप्ती</div>
          <div className="body-text">
            चालक नियोक्त्यास किमान{' '}
            <span className="underline-blank">{data.employment?.noticePeriodEmployee || '९० (नव्वद) दिवस'}</span>{' '}
            चे लेखी नोटीस देऊन सेवा सोडू शकतो. नोटिसाशिवाय किंवा निर्धारित नोटीस कालावधीपूर्वी सेवा सोडल्यास सर्व प्रलंबित देयके, अंतिम निपटारा व इतर देय रकमा जप्त केल्या जातील आणि कायदेशीर कारवाईही केली जाऊ शकते. समाप्तीनंतर चालकाने त्वरित वाहनाच्या चाव्या, इंधन कार्ड, प्रवेश पास, गणवेश, सर्व कंपनीची कागदपत्रे व नियोक्त्याची इतर कोणतीही मालमत्ता परत करणे आवश्यक आहे.
          </div>

          {/* ══ १२. शासी कायदा व क्षेत्राधिकार ══ */}
          <div className="section-heading">१२. शासी कायदा व क्षेत्राधिकार</div>
          <div className="body-text">
            हा करार भारताच्या कायद्यांनुसार शासित व त्यांच्यानुसार अर्थ लावला जाईल.
            या करारातून उद्भवणारे किंवा त्याच्याशी संबंधित कोणतेही वाद{' '}
            <span className="underline-blank">{data.employment?.jurisdiction || data.company?.companyDistrict || ''}</span>{' '}
            येथील न्यायालयांच्या अनन्य अधिकारक्षेत्राच्या अधीन असतील.
          </div>

          {/* ══ १३. संपूर्ण करार ══ */}
          <div className="section-heading">१३. संपूर्ण करार</div>
          <div className="body-text">
            हा करार रोजगाराच्या अटींबाबत नियोक्ता व चालक यांच्यातील संपूर्ण करार बनवतो आणि पूर्वीच्या सर्व चर्चा, वाटाघाटी व करार — मग ते लेखी असोत किंवा तोंडी — यांची जागा घेतो.
          </div>

          {/* ══ १४. दुरुस्त्या ══ */}
          <div className="section-heading">१४. दुरुस्त्या</div>
          <div className="body-text">
            या करारातील कोणतीही दुरुस्ती किंवा बदल लेखी स्वरूपात असणे आणि नियोक्ता व चालक दोघांनीही स्वाक्षरी करणे अनिवार्य आहे.
          </div>

          {/* ══ १५. विभाज्यता ══ */}
          <div className="section-heading">१५. विभाज्यता</div>
          <div className="body-text">
            या करारातील कोणतीही तरतूद अवैध किंवा अप्रवर्तनीय असल्याचे आढळल्यास, उर्वरित तरतुदी कायद्याने परवानगी दिलेल्या कमाल मर्यादेपर्यंत वैध व प्रवर्तनीय राहतील.
          </div>

          {/* ══ चालकाची घोषणा व संमती ══ */}
          <div className="consent-box">
            <div className="consent-box-title">चालकाची घोषणा व संमती</div>
            <div className="body-text" style={{ marginBottom: 0 }}>
              मी, <span className="underline-blank" style={{ minWidth: '180px' }}>{employeeFullName}</span>, एतदर्थ घोषित करतो/करते की मी या करारात नमूद केलेल्या सर्व अटी, शर्ती, कर्तव्ये व जबाबदाऱ्या नीट वाचल्या व पूर्णपणे समजून घेतल्या आहेत. मी या सर्व तरतुदींशी पूर्णपणे सहमत आहे. जर मी वरील लिखिताच्या विरुद्ध वागलो/वागले तर या करार व लागू कायद्यांनुसार माझ्यावर योग्य ती कारवाई करावी — माझी कोणतीही हरकत नाही.
            </div>
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

            {/* चालक स्वाक्षरी */}
            <div className="sig-block">
              <div className="sig-block-title">चालकाची स्वाक्षरी</div>
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

export default MarathiDriverAgreement;
