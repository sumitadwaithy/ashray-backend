import React from 'react';
import { PrintFooter } from '../../../../components/Printpreview';
import { convertToHindi, convertNumberToHindi, formatAadhaarHindi, convertNameWithTitle } from '../../../engine/EnglishToHindiEngine';

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
  relievingDate?: string;
  lastWorkingDay?: string;
  department?: string;
  designation?: string;
  reportingTo?: string;
  placeOfPosting?: string;
  grossMonthlySalary?: string | number;
  conductRemark?: 'EXCELLENT' | 'GOOD' | 'SATISFACTORY';
  performanceRemark?: 'EXCELLENT' | 'GOOD' | 'SATISFACTORY';
  nocPurpose?: string;
  nocIssuedTo?: string;
  reasonForLeaving?: string;
  jurisdiction?: string;
  nocNumber?: string;
  nocDate?: string;
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
  managerPAN?: string;
  managerAadhaar?: string;
  managerPhone?: string;
  companyAddress?: string;
  companyLocality?: string;
  companyDistrict?: string;
  companyState?: string;
  companyPincode?: string;
  hrName?: string;
  hrDesignation?: string;
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
  type: 'agreement' | 'token' | 'noc';
  onClose: () => void;
  companyLogo?: string;
  companyWatermark?: string;
}

const HINDI_MONTHS = [
  'जनवरी','फरवरी','मार्च','अप्रैल','मई','जून',
  'जुलाई','अगस्त','सितम्बर','अक्टूबर','नवम्बर','दिसम्बर',
];

const formatHindiDate = (dateStr?: string) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return convertNumberToHindi(dateStr);
  const day = convertNumberToHindi(date.getDate());
  const month = convertNumberToHindi(date.getMonth() + 1);
  const year = convertNumberToHindi(date.getFullYear());
  return `${day}/${month}/${year}`;
};

const formatHindiDateLong = (dateStr?: string) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return `${convertNumberToHindi(d.getDate())} ${HINDI_MONTHS[d.getMonth()]}, ${convertNumberToHindi(d.getFullYear())}`;
};

const formatPhone = (phone?: string) => {
  if (!phone) return '';
  return `+91 ${phone.toString().replace('+91','').trim()}`;
};

const calcDuration = (join?: string, relieve?: string) => {
  if (!join || !relieve) return '';
  const j = new Date(join), r = new Date(relieve);
  if (isNaN(j.getTime()) || isNaN(r.getTime())) return '';
  let years = r.getFullYear() - j.getFullYear();
  let months = r.getMonth() - j.getMonth();
    if (months < 0) { years--; months += 12; }
    const parts: string[] = [];
    if (years > 0) parts.push(`${years} वर्ष`);
    if (months > 0) parts.push(`${months} माह`);
    return parts.length ? parts.join(' एवं ') : '1 माह से कम';
  };

  const HindiPostJobNOC = ({ data, companyLogo, companyWatermark }: TemplateProps) => {

  const employeeFullName  = convertNameWithTitle(data.employee?.name, data.employee?.title);

  const employerFullName  = `${convertToHindi(data.company?.companyName || '')}${data.company?.entityType ? ` (${convertToHindi(data.company.entityType)})` : ''}`;

  const employeeAddress = convertToHindi([
    data.employee?.address,
    data.employee?.locality,
    data.employee?.district,
    data.employee?.state,
  ].filter(Boolean).join(', ') + (data.employee?.pincode ? ` - ${data.employee.pincode}` : ''));
  const serviceDuration = calcDuration(
    data.employment?.joiningDate,
    data.employment?.relievingDate || data.employment?.lastWorkingDay
  );

  const nocNo   = data.employment?.nocNumber
    || `NOC-${(data.employee?.staffId || data.employee?.employeeId || 'EMP').toUpperCase()}-${new Date().getFullYear()}`;
  const nocDate = data.employment?.nocDate || new Date().toISOString().split('T')[0];

  const conductLabel = {
    EXCELLENT: 'उत्कृष्ट',
    GOOD: 'अच्छा',
    SATISFACTORY: 'संतोषजनक',
  }[data.employment?.conductRemark || 'GOOD'] || 'अच्छा';

  const perfLabel = {
    EXCELLENT: 'उत्कृष्ट',
    GOOD: 'अच्छा',
    SATISFACTORY: 'संतोषजनक',
  }[data.employment?.performanceRemark || 'GOOD'] || 'अच्छा';

  const nocPurpose  = data.employment?.nocPurpose  || 'अन्यत्र रोजगार प्राप्त करने / अवसरों की तलाश करने';
  const nocIssuedTo = data.employment?.nocIssuedTo;
  const reasonLeaving = data.employment?.reasonForLeaving || 'व्यक्तिगत कारणों / आपसी सहमति';

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
          font-family: 'Noto Sans Devanagari','Mangal','Kokila',serif;
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
        .gradient-text { color: #D9001B; }
        @media screen {
          .gradient-text {
            background: linear-gradient(180deg,#FF3A3A 0%,#FF1E2D 60%,#D9001B 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
          }
        }
        .noc-outer-border {
          border: 3px double #b0001a;
          padding: 16px 18px 20px 18px;
          margin-top: 10px;
          position: relative;
        }
        .noc-title {
          text-align: center;
          font-size: 21px;
          font-weight: 900;
          text-decoration: underline;
          margin-bottom: 2px;
          font-family: 'Noto Sans Devanagari','Mangal',serif;
          letter-spacing: 1px;
        }
        .noc-subtitle {
          text-align: center;
          font-size: 12.5px;
          font-style: italic;
          color: #444;
          margin-bottom: 12px;
          letter-spacing: 0.5px;
        }
        .noc-ref-row {
          display: flex;
          justify-content: space-between;
          font-size: 12px;
          font-weight: 700;
          margin-bottom: 14px;
          border-bottom: 1px solid #ccc;
          padding-bottom: 8px;
        }
        .body-text {
          font-size: 13px;
          line-height: 2;
          text-align: justify;
          margin-bottom: 9px;
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
        .detail-grid {
          width: 100%;
          border-collapse: collapse;
          margin: 10px 0 12px 0;
          font-size: 13px;
        }
        .detail-grid td {
          padding: 4px 8px 4px 0;
          vertical-align: top;
          line-height: 1.85;
        }
        .detail-grid td:first-child {
          font-weight: 700;
          white-space: nowrap;
          width: 48%;
        }
        .detail-grid td:nth-child(2) {
          width: 4%;
          font-weight: 700;
          text-align: center;
        }
        .detail-grid td:last-child {
          border-bottom: 1px solid #999;
          width: 48%;
          padding-bottom: 2px;
        }
        .remark-pill {
          display: inline-block;
          border: 1.5px solid #000;
          padding: 1px 12px;
          font-weight: 700;
          font-size: 12.5px;
          letter-spacing: 0.5px;
          border-radius: 2px;
        }
        .section-heading {
          font-size: 13px;
          font-weight: 900;
          text-decoration: underline;
          margin-top: 10px;
          margin-bottom: 4px;
          letter-spacing: 0.3px;
        }
        .stamp-box {
          border: 2px dashed #bbb;
          width: 110px;
          height: 100px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 10px;
          color: #aaa;
          font-style: italic;
          text-align: center;
          letter-spacing: 0.5px;
        }
        .sig-grid {
          display: flex;
          justify-content: space-between;
          margin-top: 24px;
          gap: 28px;
          align-items: flex-end;
        }
        .sig-block {
          flex: 1;
          font-size: 13px;
          line-height: 1.85;
        }
        .sig-line {
          border-bottom: 1.5px solid #000;
          min-height: 50px;
          margin-bottom: 6px;
        }
        .sig-label {
          font-weight: 700;
          font-size: 12.5px;
          margin-bottom: 2px;
        }
        .sig-field-row {
          font-size: 12.5px;
          display: flex;
          align-items: baseline;
          gap: 4px;
          margin-top: 2px;
        }
        .disclaimer-box {
          border-top: 2px solid #D9001B;
          margin-top: 20px;
          padding-top: 10px;
          font-size: 11.5px;
          color: #444;
          line-height: 1.8;
          text-align: justify;
        }
        .end-text {
          text-align: center;
          font-weight: 900;
          font-size: 14px;
          margin-top: 18px;
          letter-spacing: 3px;
        }
        .a4-gap { height: 40px; }
        @media print { .a4-gap { display: none; } }
      `}</style>

      {/* ══════════════════════════════════════════
          पृष्ठ 1 — अनापत्ति प्रमाण पत्र
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

          {/* ── दस्तावेज़ ID पट्टी ── */}
          <div className="bg-yellow-200 border border-yellow-300 text-[12.5px] font-semibold px-2 py-1 text-center mb-5">
            <span className="font-mono">
              {data.employee?.folderSerial || 'AG'} / {data.employee?.staffId || data.employee?.employeeId || 'EMP-ID'} / NOC / {new Date(nocDate).getFullYear()}
            </span>
          </div>

          {/* ── मुख्य NOC बाह्य सीमा ── */}
          <div className="noc-outer-border">

            {/* शीर्षक */}
            <div className="noc-title">अनापत्ति प्रमाण पत्र</div>
            <div className="noc-subtitle">(नौकरी उपरांत — राहत एवं निकासी अनापत्ति प्रमाण पत्र)</div>

            {/* संदर्भ पंक्ति */}
            <div className="noc-ref-row">
              <span>NOC संदर्भ सं.: <strong>{nocNo}</strong></span>
              <span>दिनांक: <strong>{formatHindiDateLong(nocDate)}</strong></span>
            </div>

            {/* संबोधन */}
            <div className="body-text">
              <strong>जिसे भी संबंधित हो{nocIssuedTo ? ` / सेवा में, ${convertToHindi(nocIssuedTo)}` : ''}:</strong>
            </div>

            {/* प्रारंभिक अनुच्छेद */}
            <div className="body-text">
              यह प्रमाणित किया जाता है कि{' '}
              <strong>{employeeFullName}</strong>,{' '}
              {data.employee?.age ? `आयु ${convertNumberToHindi(data.employee.age)} वर्ष, ` : ''}
              {data.employee?.aadhaar ? `आधार सं. ${formatAadhaarHindi(data.employee.aadhaar)}, ` : ''}
              {data.employee?.pan ? `पैन सं. ${convertToHindi(data.employee.pan?.toUpperCase())}, ` : ''}
              निवासी: <strong>{employeeAddress}</strong>,
              {' '}<strong>{employerFullName}</strong> में{' '}
              <strong>{convertToHindi(data.employment?.designation || '') || <span className="underline-blank" style={{ minWidth: '120px' }} />}</strong>{' '}
              के पद पर{' '}
              {data.employment?.department ? `${convertToHindi(data.employment.department)} विभाग में ` : ''}
              कार्यरत रहे हैं।
            </div>

            {/* सेवा विवरण */}
            <div className="section-heading">१. सेवा विवरण</div>
            <table className="detail-grid">
              <tbody>
                <tr>
                  <td>नियुक्ति दिनांक</td>
                  <td>:</td>
                  <td>{formatHindiDateLong(data.employment?.joiningDate)}</td>
                </tr>
                <tr>
                  <td>अंतिम कार्य दिवस / राहत दिनांक</td>
                  <td>:</td>
                  <td>{formatHindiDateLong(data.employment?.relievingDate || data.employment?.lastWorkingDay)}</td>
                </tr>
                <tr>
                  <td>कुल सेवा अवधि</td>
                  <td>:</td>
                  <td><strong>{serviceDuration}</strong></td>
                </tr>
                <tr>
                  <td>धारित पद / पदनाम</td>
                  <td>:</td>
                  <td>{convertToHindi(data.employment?.designation || '') || <span className="underline-blank" />}</td>
                </tr>
                <tr>
                  <td>विभाग</td>
                  <td>:</td>
                  <td>{convertToHindi(data.employment?.department || '') || <span className="underline-blank" />}</td>
                </tr>
                <tr>
                  <td>पदस्थापना स्थान</td>
                  <td>:</td>
                  <td>{convertToHindi(data.employment?.placeOfPosting || '') || convertToHindi(data.company?.companyLocality || '') || <span className="underline-blank" />}</td>
                </tr>
                <tr>
                  <td>कर्मचारी आईडी</td>
                  <td>:</td>
                  <td>{convertToHindi(data.employee?.staffId || data.employee?.employeeId || '') || <span className="underline-blank" />}</td>
                </tr>
                <tr>
                  <td>सेवा छोड़ने का कारण</td>
                  <td>:</td>
                  <td>{convertToHindi(reasonLeaving)}</td>
                </tr>
              </tbody>
            </table>

            {/* आचरण एवं कार्यप्रदर्शन */}
            <div className="section-heading">२. आचरण एवं कार्यप्रदर्शन</div>
            <div className="body-text">
              कंपनी में संपूर्ण सेवाकाल के दौरान <strong>{employeeFullName}</strong> का आचरण एवं व्यवहार{' '}
              <span className="remark-pill">{conductLabel}</span>{' '}
              रहा है तथा उनका समग्र कार्यप्रदर्शन एवं व्यावसायिक योगदान{' '}
              <span className="remark-pill">{perfLabel}</span>{' '}
              आंका गया है। कर्मचारी ने अपने संपूर्ण कार्यकाल में ईमानदारी, परिश्रम एवं सहयोगी भावना का प्रदर्शन किया है।
            </div>

            {/* अनापत्ति घोषणा */}
            <div className="section-heading">३. अनापत्ति घोषणा</div>
            <div className="body-text">
              कंपनी एतद्द्वारा घोषित करती है कि उसे <strong>{employeeFullName}</strong> द्वारा{' '}
              {convertToHindi(nocPurpose)}
              {nocIssuedTo ? ` — <strong>${convertToHindi(nocIssuedTo)}</strong> में` : ''}{' '}
              हेतु किसी प्रकार की <strong>कोई आपत्ति नहीं</strong> है।
              कंपनी की नीति के अनुसार कर्मचारी को देय समस्त बकाया राशियों का पूर्ण भुगतान कर दिया गया है तथा कर्मचारी के पास
              कंपनी की समस्त संपत्ति, दस्तावेज़, प्रमाण-पत्र एवं परिसंपत्तियाँ प्रबंधन की संतुष्टि अनुसार वापस प्राप्त एवं सत्यापित
              की जा चुकी हैं। कर्मचारी को{' '}
              <strong>{formatHindiDateLong(data.employment?.relievingDate || data.employment?.lastWorkingDay)}</strong>{' '}
              से सभी कर्तव्यों एवं उत्तरदायित्वों से मुक्त किया जाता है।
            </div>

            {/* निकासी पुष्टि */}
            <div className="section-heading">४. निकासी पुष्टि</div>
            <div className="body-text">
              यह प्रमाण पत्र आगे पुष्टि करता है कि:
            </div>
            <ol style={{ margin: '0 0 8px 22px', fontSize: '13px', lineHeight: '2', fontFamily: "'Noto Sans Devanagari','Mangal',serif" }}>
              <li>कर्मचारी का समस्त बकाया वेतन, देय राशियाँ एवं वैधानिक अधिकार पूर्णतः प्रदत्त कर दिए गए हैं।</li>
              <li>इस प्रमाण पत्र की तिथि तक कर्मचारी के विरुद्ध कोई अनुशासनात्मक कार्रवाई, कानूनी कार्यवाही अथवा वित्तीय वसूली का दावा लंबित नहीं है।</li>
              <li>कर्मचारी ने कर्तव्य हस्तांतरण, कंपनी संपत्ति की वापसी एवं नो-ड्यूज़ घोषणा पर हस्ताक्षर सहित समस्त निकास औपचारिकताएँ सफलतापूर्वक पूर्ण कर ली हैं।</li>
              <li>कंपनी की गोपनीयता, अप्रकटीकरण एवं गैर-आग्रह (Non-Solicitation) संबंधी बाध्यताएँ सेवाकाल समाप्त होने के पश्चात् भी रोजगार अनुबंध के प्रावधानों के अनुसार कर्मचारी पर बाध्यकारी रहेंगी।</li>
            </ol>

            {/* शुभकामना अनुच्छेद */}
            <div className="body-text">
              कंपनी <strong>{employeeFullName}</strong> को उनके भावी प्रयासों एवं करियर विकास के लिए हार्दिक शुभकामनाएँ देती है।
            </div>

            {/* हस्ताक्षर खंड */}
            <div className="sig-grid">

              {/* कंपनी हस्ताक्षरकर्ता */}
              <div className="sig-block" style={{ flex: 2 }}>
                <div className="sig-label">{employerFullName} की ओर से एवं उनके लिए</div>
                <div className="sig-line" style={{ marginTop: '10px' }} />
                <div className="sig-field-row">
                  <strong>नाम:</strong>
                  <span className="underline-blank" style={{ minWidth: '150px' }}>
                    {convertNameWithTitle(data.manager?.managerName || data.company?.managerName || data.company?.hrName || '') || ''}
                  </span>
                </div>
                <div className="sig-field-row">
                  <strong>पद:</strong>
                  <span className="underline-blank" style={{ minWidth: '130px' }}>
                    {convertToHindi(data.manager?.managerPosition || data.company?.managerPosition || data.company?.hrDesignation || '')}
                  </span>
                </div>
                <div className="sig-field-row">
                  <strong>दिनांक:</strong>
                  <span className="underline-blank" style={{ minWidth: '110px' }}>
                    {formatHindiDate(nocDate)}
                  </span>
                </div>
                <div className="sig-field-row">
                  <strong>स्थान:</strong>
                  <span className="underline-blank" style={{ minWidth: '120px' }}>
                    {convertToHindi(data.company?.companyLocality || data.company?.companyDistrict || '')}
                  </span>
                </div>
              </div>

              {/* कंपनी मुहर */}
              <div className="sig-block" style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div className="sig-label" style={{ marginBottom: '8px', textAlign: 'center' }}>कंपनी सील / मुहर</div>
                <div className="stamp-box">
                  सील एवं<br />मुहर
                </div>
              </div>

            </div>
          </div>

          {/* अस्वीकरण */}
          <div className="disclaimer-box">
            <strong>अस्वीकरण:</strong> यह अनापत्ति प्रमाण पत्र कंपनी के पास उपलब्ध अभिलेखों के आधार पर सद्भावनापूर्वक जारी किया गया है
            और यह केवल {convertToHindi(nocPurpose)} के उद्देश्य हेतु मान्य है। कंपनी इस प्रमाण पत्र के किसी भी दुरुपयोग, गलत प्रस्तुतीकरण अथवा इसमें
            उल्लिखित उद्देश्य से भिन्न किसी भी उद्देश्य हेतु उपयोग के लिए उत्तरदायी नहीं होगी। यह प्रमाण पत्र चरित्र संदर्भ, रोजगार गारंटी
            अथवा इसके घोषित उद्देश्य से परे किसी भी प्रकार के कानूनी उपक्रम का गठन नहीं करता। सत्यापन संबंधी किसी भी जिज्ञासा के
            लिए <strong>{convertToHindi(data.company?.companyEmail || '[कंपनी ईमेल]')}</strong> अथवा{' '}
            <strong>{convertNumberToHindi(formatPhone(data.manager?.managerPhone || data.company?.managerPhone))}</strong> पर संपर्क करें।
          </div>

          <div className="end-text">* * * समाप्त * * *</div>

        </div>

        <PrintFooter />
      </div>
    </div>
  );
};

export default HindiPostJobNOC;