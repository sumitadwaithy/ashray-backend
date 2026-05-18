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

const MarathiMTSAgreement = ({ data, companyLogo, companyWatermark }: TemplateProps) => {

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
    "निर्देशानुसार संबंधित विभाग, कर्मचारी किंवा बाह्य पक्षांना फाइल्स, पत्रे, दस्तऐवज आणि संदेश पाठविण्यासह सामान्य कार्यालयीन सहाय्य कार्ये करणे.",
    "कार्यालय परिसर, बैठक कक्ष, स्वागत क्षेत्र, साइट कार्यालये आणि सर्व सामायिक क्षेत्रांची स्वच्छता व नीटनेटकेपणा सदैव राखणे.",
    "फोटोकॉपी मशीन, प्रिंटर, स्कॅनर, श्रेडर आणि बाइंडिंग मशीन यांसारखी मूलभूत कार्यालयीन उपकरणे चालविणे आणि कोणताही बिघाड तत्काळ कळविणे.",
    "कार्यालय स्थलांतर किंवा साइट भेटीदरम्यान कार्यालयीन फर्निचर, फिटिंग्ज, साहित्य आणि मालमत्ता-संबंधित दस्तऐवजांची हाताळणी, लोडिंग, अनलोडिंग आणि व्यवस्था करण्यात सहाय्य करणे.",
    "आवश्यकतेनुसार ग्राहक, बँका, सरकारी कार्यालये, नोंदणी कार्यालये (उप-निबंधक) आणि इतर ठिकाणी फाइल्स, धनादेश, डिमांड ड्राफ्ट, कायदेशीर दस्तऐवज व इतर अधिकृत पत्रव्यवहार पोहोचविणे व प्राप्त करणे.",
    "आवक आणि जावक डिस्पॅच नोंदवह्या व्यवस्थापित करणे, कुरिअर ट्रॅकिंग आणि पोचपावत्यांसह प्राप्त व पाठविलेल्या सर्व दस्तऐवजांच्या योग्य नोंदी राखणे.",
    "अभ्यागतांचे स्वागत, ग्राहकांना मार्गदर्शन, जलपान देणे आणि अभ्यागत नोंदवही राखण्यासह फ्रंट डेस्क / रिसेप्शनवर सहाय्य प्रदान करणे.",
    "मालमत्ता प्रदर्शने, साइट भेटी आणि ग्राहक कार्यक्रमांदरम्यान सेटअप, लॉजिस्टिक्स आणि साहित्य वितरणात सहाय्य करून विक्री व विपणन संघाला पाठिंबा देणे.",
    "निर्देशानुसार मालमत्ता दस्तऐवज, विक्री पत्रे, करार, NOC आणि इतर कायदेशीर कागदपत्रांची फोटोकॉपी, स्कॅनिंग, लॅमिनेशन आणि फाइलिंग करण्यात सहाय्य करणे.",
    "धनादेश जमा करणे, डिमांड ड्राफ्ट संकलन करणे, दस्तऐवज सादर करणे आणि बँक शिक्के / पोचपावत्या प्राप्त करणे यांसारखी बँक-संबंधित कामे करणे.",
    "मुद्रांक संकलन, फ्रँकिंग, नोटरीकरण, शासकीय संपर्क आणि व्यवस्थापनाने नेमून दिलेली इतर कोणतीही कामे यांसह अधिकृत कामे पूर्ण करणे.",
    "वेळोवेळी व्यवस्थापनाने नेमून दिलेली इतर बहु-कार्य, सहाय्यक किंवा गृहनिर्माण कर्तव्ये पार पाडणे.",
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
        .conduct-box {
          border: 1px solid #000;
          padding: 8px 11px;
          margin: 8px 0 5px 0;
          font-size: 12.5px;
          line-height: 1.75;
        }
        .a4-gap {
          height: 40px;
        }
        @media print {
          .a4-gap { display: none; }
          .compliance-box { background: #f5f5f5 !important; }
          .conduct-box { background: white !important; }
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
          <div className="agreement-title">रोजगार करार</div>
          <div className="agreement-subtitle">(बहु-कार्य कर्मचारी — MTS)</div>

          {/* प्रस्तावना */}
          <div className="body-text">
            हा रोजगार करार <strong>("करार")</strong> दिनांक{' '}
            <span className="underline-blank">{formatMarathiDate(data.employment?.joiningDate)}</span>{' '}
            रोजी खालील पक्षांमध्ये केला गेला आहे:
          </div>

          {/* नियोक्ता */}
          <div className="party-block">
            <div className="party-name">{employerFullName}</div>
            <div><strong>नोंदणीकृत पत्ता:</strong> {employerAddress}</div>
            <div><strong>सीआयएन:</strong> {data.company?.cinNumber || <span className="underline-blank" style={{ minWidth: '160px' }} />}</div>
            <div><strong>पॅन:</strong> {data.company?.companyPan || <span className="underline-blank" style={{ minWidth: '120px' }} />}</div>
            <div style={{ fontStyle: 'italic' }}>
              (कंपनी कायदा, २०१३ अंतर्गत निगमित एक कंपनी, यापुढे <strong>"कंपनी"</strong> किंवा <strong>"नियोक्ता"</strong> असे संबोधण्यात येईल)
            </div>
          </div>

          <div className="and-divider">आणि</div>

          {/* कर्मचारी */}
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

          {/* १. पद आणि कर्तव्ये */}
          <div className="section-heading">१. पद आणि कर्तव्ये</div>
          <div className="body-text">
            कंपनी एतद्द्वारे कर्मचाऱ्याला <strong>बहु-कार्य कर्मचारी (MTS)</strong> या पदावर
            {data.employment?.department ? ` ${convertToMarathi(data.employment.department)} विभागात` : ''} नियुक्त करते. कर्मचारी{' '}
            <span className="underline-blank">{convertToMarathi(data.employment?.reportingTo || '')}</span>{' '}
            यांना अहवाल देईल आणि स्थावर मालमत्ता खाजगी मर्यादित कंपनीत आवश्यक सर्व सहाय्यक, परिचालन आणि गृहव्यवस्था कर्तव्ये परिश्रमपूर्वक पार पाडेल, ज्यात खालील गोष्टींचा समावेश आहे परंतु त्या इतक्याच मर्यादित नाहीत:
          </div>
          <ol className="duty-list">
            {allDuties.map((duty, idx) => (
              <li key={idx}>{duty}</li>
            ))}
          </ol>
          <div className="body-text">
            कर्मचारी मान्य करतो की MTS भूमिकेच्या स्वरूपानुसार विभाग आणि कामांमध्ये लवचिकता आवश्यक आहे. पदस्थापनेचे ठिकाण{' '}
            <span className="underline-blank">{data.employment?.placeOfPosting || ''}</span>{' '}
            असेल. नियोक्ता आपल्या विवेकाधीन कोणत्याही कार्यालय, प्रकल्प स्थळे किंवा शाखा स्थानांवर कर्तव्ये नेमण्याचा अधिकार राखतो.
          </div>

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

        {/* मजकूर */}
        <div style={{ position: "relative", zIndex: 1 }}>

          {/* २. रोजगाराची सुरुवात आणि परिवीक्षा */}
          <div className="section-heading">२. रोजगाराची सुरुवात आणि परिवीक्षा</div>
          <div className="body-text">
            कर्मचाऱ्याचा रोजगार{' '}
            <span className="underline-blank">{formatMarathiDate(data.employment?.joiningDate)}</span>{' '}
            पासून सुरू होईल. कर्मचारी रुजू होण्याच्या तारखेपासून{' '}
            <strong>{data.employment?.probationPeriod || '३ (तीन) महिने'}</strong>{' '}
            परिवीक्षा (प्रोबेशन) कालावधीत असेल, ज्या दरम्यान कोणताही पक्ष कारण किंवा पूर्वसूचनेशिवाय हा करार समाप्त करू शकतो. परिवीक्षा समाधानकारकरीत्या पूर्ण झाल्यावर, कंपनीच्या HR धोरणानुसार कंपनीच्या विधिवत अधिकृत अधिकाऱ्याद्वारे लेखी रोजगार पुष्टी केली जाईल.
          </div>

          {/* ३. मोबदला */}
          <div className="section-heading">३. मोबदला</div>

          <div className="sub-heading">वेतन</div>
          <div className="body-text">
            कंपनी कर्मचाऱ्यास ₹{' '}
            <span className="underline-blank">{convertNumberToMarathi(data.employment?.grossAnnualSalary || '')}</span>
            /- (रुपये{' '}
            <span className="underline-blank" style={{ minWidth: '160px' }}>
              {convertToMarathi(data.employment?.grossAnnualSalaryWords || '')}
            </span>{' '}
            फक्त) एवढे एकूण वार्षिक वेतन देईल,
            जे ₹{' '}
            <span className="underline-blank">{convertNumberToMarathi(data.employment?.grossMonthlySalary || '')}</span>
            /- (रुपये{' '}
            <span className="underline-blank" style={{ minWidth: '140px' }}>
              {convertToMarathi(data.employment?.grossMonthlySalaryWords || '')}
            </span>{' '}
            फक्त) एवढ्या एकूण मासिक वेतनाशी समतुल्य आहे,
            जे पुढील महिन्याच्या ७ तारखेला किंवा त्यापूर्वी समान मासिक हप्त्यांमध्ये, प्राप्तिकर कायदा, १९६१ अंतर्गत लागू TDS कपाती आणि भारतीय कायद्यानुसार वैधानिक रोखे यांच्या अधीन राहून देय असेल. वेतन कोणत्याही वेळी लागू श्रेणी व राज्यासाठी किमान वेतन कायदा, १९४८ अंतर्गत अधिसूचित किमान वेतनापेक्षा कमी असणार नाही.
          </div>

          <div className="sub-heading">वैधानिक लाभ</div>
          <div className="body-text">
            खाजगी मर्यादित कंपन्यांना लागू असलेल्या भारतीय कामगार विधानानुसार, कर्मचारी खालील वैधानिक लाभांसाठी पात्र असेल:
          </div>

          <div style={{ fontWeight: 700, fontSize: '13px', marginTop: '5px', marginBottom: '2px' }}>
            अनिवार्य वैधानिक लाभ
          </div>
          <ul className="benefits-list">
            <li><strong>कर्मचारी भविष्य निर्वाह निधी (ईपीएफ) — EPF आणि MP कायदा, १९५२:</strong> नियोक्ता आणि कर्मचारी प्रत्येकी मूळ वेतनाच्या १२% योगदान देतील. कंपनीत २० किंवा अधिक व्यक्ती असल्यास लागू.</li>
            <li><strong>कर्मचारी राज्य विमा (ईएसआय) — ESI कायदा, १९४८:</strong> लागू जेव्हा कर्मचाऱ्याचे एकूण वेतन दरमहा ₹२१,०००/- किंवा त्याहून कमी असेल आणि आस्थापना १० (काही राज्यांत २०) किंवा अधिक व्यक्तींना रोजगार देत असेल. ESI संरक्षणात वैद्यकीय, आजारपण, मातृत्व आणि अपंगत्व लाभांचा समावेश आहे.</li>
            <li><strong>उपदान (ग्रॅच्युइटी) — ग्रॅच्युइटी देयक कायदा, १९७२:</strong> ५ (पाच) वर्षांची सलग सेवा पूर्ण झाल्यावर प्रत्येक पूर्ण सेवा वर्षासाठी १५ दिवसांच्या वेतनाच्या दराने देय.</li>
            <li>
              <strong>रजा पात्रता — दुकाने व आस्थापना कायदा (राज्य):</strong> सवेतन वार्षिक / अर्जित रजा ({convertNumberToMarathi(data.employment?.annualLeaves || '12')} दिवस),
              आजारपण / वैद्यकीय रजा ({convertNumberToMarathi(data.employment?.medicalLeaves || '6')} दिवस) आणि नैमित्तिक रजा ({convertNumberToMarathi(data.employment?.casualLeaves || '6')} दिवस) प्रति दिनदर्शिका वर्ष.
            </li>
            <li><strong>मातृत्व लाभ — मातृत्व लाभ कायदा, १९६१:</strong> पात्र महिला कर्मचाऱ्यांसाठी २६ आठवड्यांची सवेतन मातृत्व रजा (२ जिवंत मुलांपर्यंत); पुढील गर्भधारणेसाठी १२ आठवडे.</li>
            <li><strong>बोनस — बोनस देयक कायदा, १९६५:</strong> कंपनीचा वार्षिक उलाढाल कायद्याच्या अटींनुसार अर्हता प्राप्त करत असल्यास लागू; वार्षिक वेतनाच्या किमान ८.३३% किंवा ₹१००/- प्रति महिना, यापैकी जे अधिक असेल.</li>
            <li><strong>किमान वेतन — किमान वेतन कायदा, १९४८:</strong> कर्मचाऱ्याचे एकूण मानधन कोणत्याही वेळी राज्य सरकारने लागू अनुसूचित रोजगार श्रेणीसाठी अधिसूचित केलेल्या किमान वेतनापेक्षा कमी असणार नाही.</li>
          </ul>

          <div style={{ fontWeight: 700, fontSize: '13px', marginTop: '5px', marginBottom: '2px' }}>
            ऐच्छिक / अतिरिक्त लाभ
          </div>
          <ul className="benefits-list">
            <li><strong>सामूहिक आरोग्य विमा:</strong> कंपनी धोरणानुसार वैद्यकीय संरक्षण.</li>
            <li><strong>कार्यक्षमता प्रोत्साहन:</strong> वेळनिष्ठता, विश्वासार्हता आणि असाधारण सेवेसाठी विवेकाधीन प्रोत्साहन.</li>
            <li><strong>गणवेश / ड्रेस कोड भत्ता:</strong> लागू असल्यास, कंपनी धोरणानुसार कंपनी गणवेश किंवा ड्रेस कोड भत्ता दिला जाऊ शकतो.</li>
            <li><strong>प्रवास भत्ता:</strong> कंपनीच्या परताव्याच्या धोरणानुसार अधिकृत प्रवास आणि कामांसाठी परतावा.</li>
          </ul>

          <div style={{ fontWeight: 700, fontSize: '13px', marginTop: '5px', marginBottom: '2px' }}>
            पर्यायी सुविधा
          </div>
          <ul className="benefits-list">
            <li>अतिरिक्त रजा: कंपनी धोरणानुसार पितृत्व रजा, शोक रजा.</li>
            <li>भविष्य निर्वाह निधी अंशदान आणि कंपनीने वेळोवेळी ठरविलेले इतर लाभ.</li>
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

        {/* मजकूर */}
        <div style={{ position: "relative", zIndex: 1 }}>

          <div className="divider-page"></div>

          {/* ४. कामाचे तास */}
          <div className="section-heading">४. कामाचे तास</div>
          <div className="body-text">
            कर्मचाऱ्याचे मानक कामाचे तास{' '}
            <span className="underline-blank">{data.employment?.workingHours || 'सकाळी ९:०० ते सायंकाळी ६:०० वा.'}</span>,{' '}
            {data.employment?.workingDays || 'सोमवार ते शनिवार'} असतील, ज्यात{' '}
            <span className="underline-blank">{data.employment?.lunchBreak || '१ (एक) तास'}</span>{' '}
            दुपारच्या जेवणाची सुट्टी असेल, जे लागू राज्य दुकाने व आस्थापना कायद्यानुसार असेल. MTS भूमिकेच्या परिचालन स्वरूपाच्या दृष्टीने, कर्मचाऱ्याला प्रकल्प स्थळे, ग्राहक स्थाने किंवा बाह्य कार्यालयांवरील कामांसाठी लवकर हजर होणे, उशिरापर्यंत थांबणे किंवा जाणे आवश्यक असू शकते. कोणत्याही अतिरिक्त कामाचा मोबदला लागू कायद्यानुसार असेल.
          </div>

          {/* ५. आचारसंहिता आणि वर्तणूक मानके */}
          <div className="section-heading">५. आचारसंहिता आणि वर्तणूक मानके</div>
          <div className="body-text">
            कार्यालये, प्रकल्प स्थळे आणि बाह्य ठिकाणी कंपनीचे प्रतिनिधित्व करणारा MTS कर्मचारी म्हणून, कर्मचारी सदैव:
          </div>
          <div className="conduct-box">
            <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '12.5px', lineHeight: 1.8 }}>
              <li>स्वच्छ, नीटनेटके आणि सादर करण्यायोग्य स्वरूप राखेल आणि कंपनीच्या ड्रेस कोड किंवा गणवेश आवश्यकतांचे पालन करेल;</li>
              <li>ग्राहक, अभ्यागत, सहकर्मचारी आणि सर्वसामान्य जनतेशी सदैव विनम्र आणि आदरपूर्वक वागेल;</li>
              <li>कार्यालय किंवा प्रकल्प स्थळ परिसरात दारू, तंबाखू किंवा कोणत्याही मादक पदार्थाचे सेवन करणार नाही;</li>
              <li>त्याच्याकडे सोपविलेले सर्व दस्तऐवज, धनादेश, डिमांड ड्राफ्ट आणि अधिकृत साहित्य अत्यंत काळजीपूर्वक, प्रामाणिकपणे आणि जबाबदारीने हाताळेल;</li>
              <li>आपल्या ताब्यातील कंपनीची मालमत्ता किंवा दस्तऐवजांचे नुकसान, चोरी, हानी किंवा गहाळ होण्याची तात्काळ पर्यवेक्षी प्राधिकाऱ्याला माहिती देईल;</li>
              <li>कोणत्याही बाह्य व्यक्तीला ग्राहक, मालमत्ता, किंमत निर्धारण, अंतर्गत कामकाज किंवा व्यवसाय व्यवहारांबद्दल कोणतीही माहिती देणार नाही;</li>
              <li>कंपनीची मालमत्ता, वाहने किंवा उपकरणे केवळ अधिकृत कारणांसाठीच वापरेल.</li>
            </ul>
          </div>
          <div className="body-text">
            आचारसंहितेच्या कोणत्याही उल्लंघनामुळे कंपनीच्या विवेकाधीन निलंबन किंवा सेवासमाप्तीसह शिस्तभंगाची कारवाई होऊ शकते.
          </div>

          {/* ६. गोपनीयता */}
          <div className="section-heading">६. गोपनीयता</div>
          <div className="body-text">
            कर्मचारी मान्य करतो की आपल्या कर्तव्यांदरम्यान, तो कंपनीची गोपनीय माहिती हाताळू शकतो, घेऊन जाऊ शकतो किंवा अजाणतेपणे त्याबद्दल माहिती मिळवू शकतो, ज्यात ग्राहकांचे तपशील, मालमत्ता व्यवहाराचे दस्तऐवज, आर्थिक साधने, अंतर्गत पत्रव्यवहार आणि व्यवसाय धोरणे यांचा समावेश आहे परंतु ते इतक्याच मर्यादित नाहीत. कर्मचारी सहमत आहे की तो:
          </div>
          <ul className="clause-list">
            <li>रोजगाराच्या कालावधीत आणि नंतर अशी सर्व माहिती पूर्णपणे गोपनीय ठेवेल;</li>
            <li>कोणत्याही कंपनीच्या दस्तऐवजाची, नोंदीची किंवा माहितीची कोणत्याही अनधिकृत व्यक्तीला उघड, प्रत, छायाचित्र किंवा सामायिक करणार नाही;</li>
            <li>रोजगार संपुष्टात आल्यावर तात्काळ सर्व दस्तऐवज, साहित्य, चाव्या, प्रवेश कार्डे, गणवेश आणि कंपनीची मालमत्ता परत करेल.</li>
          </ul>

          {/* ७. अ-स्पर्धा */}
          <div className="section-heading">७. अ-स्पर्धा</div>
          <div className="body-text">
            रोजगाराच्या कालावधीत आणि कोणत्याही कारणास्तव रोजगार संपुष्टात आल्यानंतर{' '}
            <span className="underline-blank">{data.employment?.nonCompetePeriod || '३ (तीन) महिने'}</span>{' '}
            कालावधीसाठी, कर्मचारी कंपनीच्या प्राथमिक व्यवसाय स्थानाच्या{' '}
            <span className="underline-blank">{data.employment?.nonCompeteRadius || '१० कि.मी.'}</span>{' '}
            त्रिज्येत कोणत्याही स्पर्धात्मक स्थावर मालमत्ता व्यवसायासाठी प्रत्यक्ष किंवा अप्रत्यक्षपणे काम करणार नाही, सहाय्य करणार नाही किंवा सेवा देणार नाही.
          </div>

          {/* ८. रोजगार समाप्ती */}
          <div className="section-heading">८. रोजगार समाप्ती</div>

          <div className="sub-heading">कंपनीद्वारे समाप्ती</div>
          <div className="body-text">कंपनी खालील परिस्थितींमध्ये हा करार समाप्त करू शकते:</div>
          <ul className="termination-list">
            <li>
              <strong>कारणासह (तात्काळ बडतर्फी):</strong> चोरी, कंपनीच्या मालमत्तेचा किंवा दस्तऐवजांचा अपहार, सकल गैरवर्तन, अवज्ञा, अप्रामाणिकपणा, सवयीची अनुपस्थिती, कामाच्या ठिकाणी नशेच्या अवस्थेत आढळणे किंवा या कराराचे किंवा कंपनीच्या धोरणांचे महत्त्वपूर्ण उल्लंघन याकरिता नोटिशिशिवाय तात्काळ.
            </li>
            <li>
              <strong>कारणाशिवाय:</strong>{' '}
              <span className="underline-blank">{data.employment?.noticePeriodEmployer || '१५ (पंधरा) दिवस'}</span>{' '}
              लेखी नोटीस किंवा नोटीसऐवजी वेतन देऊन, लागू असल्यास औद्योगिक विवाद कायदा, १९४७ आणि राज्य दुकाने व आस्थापना कायद्याच्या तरतुदींच्या अधीन.
            </li>
          </ul>

          <div className="sub-heading">कर्मचाऱ्याद्वारे समाप्ती</div>
          <div className="body-text">
            कर्मचारी कंपनीला{' '}
            <span className="underline-blank">{data.employment?.noticePeriodEmployee || '१५ (पंधरा) दिवस'}</span>{' '}
            लेखी नोटीस देऊन राजीनामा देऊ शकतो. रोजगार संपुष्टात आल्यावर, कर्मचारी: (i) आपल्या ताब्यातील सर्व कंपनी मालमत्ता, दस्तऐवज, चाव्या, प्रवेश कार्डे, गणवेश आणि साहित्य तात्काळ परत करेल; (ii) प्रलंबित कामांचे औपचारिक हस्तांतरण पूर्ण करेल; आणि (iii) अंतिम निपटाऱ्यापूर्वी नो-ड्यूज प्रमाणपत्रावर सही करेल.
          </div>

          {/* ९. शासक कायदा आणि न्यायक्षेत्र */}
          <div className="section-heading">९. शासक कायदा आणि न्यायक्षेत्र</div>
          <div className="body-text">
            हा करार कंपनी कायदा, २०१३, करार कायदा, १८७२, किमान वेतन कायदा, १९४८ आणि लागू कामगार विधानांसह भारताच्या कायद्यांनुसार शासित व अर्थान्वित केला जाईल. या करारातून उद्भवणाऱ्या किंवा संबंधित कोणत्याही वादावर{' '}
            <span className="underline-blank">{data.employment?.jurisdiction || data.company?.companyDistrict || ''}</span>{' '}
            येथील न्यायालयांचे अनन्य न्यायक्षेत्र असेल.
          </div>

          {/* १०. संपूर्ण करार */}
          <div className="section-heading">१०. संपूर्ण करार</div>
          <div className="body-text">
            हा करार रोजगाराच्या अटींच्या संदर्भात कंपनी आणि कर्मचारी यांच्यातील संपूर्ण करार घटित करतो आणि सर्व पूर्वीच्या चर्चा, वाटाघाटी व करार, लेखी असोत वा तोंडी, यांना अधिक्रमित करतो. यात नमूद नसलेल्या कोणत्याही प्रतिनिधित्वाला कायदेशीर परिणाम नसेल.
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

        {/* मजकूर */}
        <div style={{ position: "relative", zIndex: 1 }}>

          <div className="divider-page"></div>

          {/* ११. दुरुस्त्या */}
          <div className="section-heading">११. दुरुस्त्या</div>
          <div className="body-text">
            या करारातील कोणतीही दुरुस्ती किंवा बदल केवळ तेव्हाच वैध असेल जेव्हा तो लेखी स्वरूपात असेल आणि कंपनीच्या अधिकृत प्रतिनिधी तसेच कर्मचारी दोघांनीही विधिवत सही केलेला असेल. कोणतीही तोंडी दुरुस्ती कोणत्याही पक्षावर बंधनकारक नसेल.
          </div>

          {/* १२. विभाज्यता */}
          <div className="section-heading">१२. विभाज्यता</div>
          <div className="body-text">
            या कराराची कोणतीही तरतूद लागू कायद्यानुसार अवैध, रद्द किंवा अप्रवर्तनीय आढळल्यास, ती तरतूद या करारातून वेगळी केली गेली असे मानले जाईल आणि उर्वरित तरतुदी पूर्ण शक्ती व परिणामासह कायम राहतील.
          </div>

          {/* १३. वैधानिक अनुपालन घोषणा */}
          <div className="section-heading">१३. वैधानिक अनुपालन घोषणा</div>
          <div className="body-text">
            दोन्ही पक्ष मान्य करतात की हा करार सर्व लागू केंद्रीय व राज्य विधानांच्या अधीन आहे आणि त्यांच्याशी सुसंगतपणे अर्थान्वित केला जाईल, ज्यात खालील गोष्टींचा समावेश आहे परंतु त्या इतक्याच मर्यादित नाहीत:
          </div>
          <div className="compliance-box">
            <strong>लागू विधान:</strong> कंपनी कायदा, २०१३ &nbsp;|&nbsp; करार कायदा, १८७२ &nbsp;|&nbsp; किमान वेतन कायदा, १९४८ &nbsp;|&nbsp; वेतन देयक कायदा, १९३६ &nbsp;|&nbsp; EPF आणि MP कायदा, १९५२ &nbsp;|&nbsp; ESI कायदा, १९४८ &nbsp;|&nbsp; ग्रॅच्युइटी देयक कायदा, १९७२ &nbsp;|&nbsp; बोनस देयक कायदा, १९६५ &nbsp;|&nbsp; मातृत्व लाभ कायदा, १९६१ &nbsp;|&nbsp; औद्योगिक विवाद कायदा, १९४७ &nbsp;|&nbsp; कंत्राटी कामगार (नियमन व निर्मूलन) कायदा, १९७० &nbsp;|&nbsp; आंतरराज्यीय स्थलांतरित कामगार कायदा, १९७९ (लागू असल्यास) &nbsp;|&nbsp; कामाच्या ठिकाणी महिलांचे लैंगिक छळापासून संरक्षण कायदा, २०१३ (POSH) &nbsp;|&nbsp; राज्य दुकाने व आस्थापना कायदा (महाराष्ट्र)
          </div>
          <div className="body-text" style={{ marginTop: '4px' }}>
            या कराराच्या अटी आणि कोणत्याही लागू कायद्याच्या तरतुदी यांच्यात कोणताही विरोध असल्यास, कायद्याच्या तरतुदी प्रभावी राहतील. कंपनी पुष्टी करते की ती कर्मचाऱ्याच्या संदर्भात सर्व लागू किमान वेतन अधिसूचना आणि कामगार कल्याण दायित्वांचे पालन करेल.
          </div>

          {/* सह्या */}
          <div className="sig-grid">

            {/* कंपनीची सही */}
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
                <strong>DIN / PAN:</strong>
                <span className="underline-blank" style={{ minWidth: '110px' }}>
                  {data.company?.managerPAN || data.manager?.managerPAN || ''}
                </span>
              </div>
              <div style={{ marginTop: '6px', fontSize: '12px', fontStyle: 'italic' }}>
                अधिकृत स्वाक्षरीकर्ता — {convertToMarathi(data.company?.companyName || '')}{data.company?.entityType ? ` (${data.company.entityType})` : ''}
              </div>
            </div>

            {/* कर्मचाऱ्याची सही */}
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
                <div style={{ marginTop: '4px' }}>सही: <span className="underline-blank" style={{ minWidth: '120px' }} /></div>
              </div>
              <div style={{ flex: 1, fontSize: '13px', lineHeight: 1.8 }}>
                <div><strong>२.</strong> नाव: <span className="underline-blank" style={{ minWidth: '140px' }} /></div>
                <div style={{ marginTop: '4px' }}>सही: <span className="underline-blank" style={{ minWidth: '120px' }} /></div>
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

export default MarathiMTSAgreement;