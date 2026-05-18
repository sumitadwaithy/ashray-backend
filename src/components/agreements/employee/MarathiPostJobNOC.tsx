import React from 'react';
import { PrintFooter } from '../../../../components/Printpreview';
import { convertToMarathi, convertNumberToMarathi, formatAadhaarMarathi, convertNameWithTitle } from '../../../engine/EnglishToMarathiEngine';

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

const MARATHI_MONTHS = [
  'जानेवारी','फेब्रुवारी','मार्च','एप्रिल','मे','जून',
  'जुलै','ऑगस्ट','सप्टेंबर','ऑक्टोबर','नोव्हेंबर','डिसेंबर',
];

const formatMarathiDate = (dateStr?: string) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return convertNumberToMarathi(dateStr);
  const day = convertNumberToMarathi(date.getDate());
  const month = convertNumberToMarathi(date.getMonth() + 1);
  const year = convertNumberToMarathi(date.getFullYear());
  return `${day}/${month}/${year}`;
};

const formatMarathiDateLong = (dateStr?: string) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return `${convertNumberToMarathi(d.getDate())} ${MARATHI_MONTHS[d.getMonth()]}, ${convertNumberToMarathi(d.getFullYear())}`;
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
    if (years > 0) parts.push(`${years} वर्ष${years > 1 ? 'े' : ''}`);
    if (months > 0) parts.push(`${months} महिन${months > 1 ? 'े' : 'ा'}`);
    return parts.length ? parts.join(' व ') : '१ महिन्यापेक्षा कमी';
  };

  const MarathiPostJobNOC = ({ data, companyLogo, companyWatermark }: TemplateProps) => {

  const employeeFullName  = convertNameWithTitle(data.employee?.name, data.employee?.title);
  const employerFullName  = `${convertToMarathi(data.company?.companyName || '')}${data.company?.entityType ? ` (${convertToMarathi(data.company.entityType)})` : ''}`;

  const employeeAddress = convertToMarathi([
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
    GOOD: 'चांगले',
    SATISFACTORY: 'समाधानकारक',
  }[data.employment?.conductRemark || 'GOOD'] || 'चांगले';

  const perfLabel = {
    EXCELLENT: 'उत्कृष्ट',
    GOOD: 'चांगले',
    SATISFACTORY: 'समाधानकारक',
  }[data.employment?.performanceRemark || 'GOOD'] || 'चांगले';

  const nocPurpose    = data.employment?.nocPurpose    || 'अन्यत्र रोजगार मिळविण्यासाठी / संधी शोधण्यासाठी';
  const nocIssuedTo   = data.employment?.nocIssuedTo;
  const reasonLeaving = data.employment?.reasonForLeaving || 'वैयक्तिक कारणे / परस्पर संमती';

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
          letter-spacing: 0.4px;
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
          line-height: 1.9;
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
          letter-spacing: 0.4px;
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
          line-height: 1.85;
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
          पान १ — ना-हरकत प्रमाणपत्र
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

          {/* ── दस्तऐवज आयडी पट्टी ── */}
          <div className="bg-yellow-200 border border-yellow-300 text-[12.5px] font-semibold px-2 py-1 text-center mb-5">
            <span className="font-mono">
              {data.employee?.folderSerial || 'AG'} / {data.employee?.staffId || data.employee?.employeeId || 'EMP-ID'} / NOC / {new Date(nocDate).getFullYear()}
            </span>
          </div>

          {/* ── मुख्य NOC बाह्य सीमा ── */}
          <div className="noc-outer-border">

            {/* शीर्षक */}
            <div className="noc-title">ना-हरकत प्रमाणपत्र</div>
            <div className="noc-subtitle">
              (नोकरी उपरांत — मुक्तता व निर्गमन ना-हरकत प्रमाणपत्र)
            </div>

            {/* संदर्भ पंक्ती */}
            <div className="noc-ref-row">
              <span>NOC संदर्भ क्र.: <strong>{nocNo}</strong></span>
              <span>दिनांक: <strong>{formatMarathiDateLong(nocDate)}</strong></span>
            </div>

            {/* संबोधन */}
            <div className="body-text">
              <strong>ज्यांना संबंधित असेल त्यांना{nocIssuedTo ? ` / सेवेत, ${convertToMarathi(nocIssuedTo)}` : ''}:</strong>
            </div>

            {/* प्रारंभिक परिच्छेद */}
            <div className="body-text">
              याद्वारे प्रमाणित केले जाते की{' '}
              <strong>{employeeFullName}</strong>,{' '}
              {data.employee?.age ? `वय ${convertNumberToMarathi(data.employee.age)} वर्षे, ` : ''}
              {data.employee?.aadhaar ? `आधार क्र. ${formatAadhaarMarathi(data.employee.aadhaar)}, ` : ''}
              {data.employee?.pan ? `पॅन क्र. ${convertToMarathi(data.employee.pan?.toUpperCase())}, ` : ''}
              रा. <strong>{employeeAddress}</strong>,
              {' '}<strong>{employerFullName}</strong> मध्ये{' '}
              <strong>
                {convertToMarathi(data.employment?.designation || '') || <span className="underline-blank" style={{ minWidth: '120px' }} />}
              </strong>{' '}
              या पदावर{' '}
              {data.employment?.department ? `${convertToMarathi(data.employment.department)} विभागात ` : ''}
              कार्यरत होते.
            </div>

            {/* सेवा तपशील */}
            <div className="section-heading">१. सेवा तपशील</div>
            <table className="detail-grid">
              <tbody>
                <tr>
                  <td>रुजू दिनांक</td>
                  <td>:</td>
                  <td>{formatMarathiDateLong(data.employment?.joiningDate)}</td>
                </tr>
                <tr>
                  <td>शेवटचा कार्यदिवस / मुक्तता दिनांक</td>
                  <td>:</td>
                  <td>{formatMarathiDateLong(data.employment?.relievingDate || data.employment?.lastWorkingDay)}</td>
                </tr>
                <tr>
                  <td>एकूण सेवा कालावधी</td>
                  <td>:</td>
                  <td><strong>{serviceDuration}</strong></td>
                </tr>
                <tr>
                  <td>धारण केलेले पद / पदनाम</td>
                  <td>:</td>
                  <td>{convertToMarathi(data.employment?.designation || '') || <span className="underline-blank" />}</td>
                </tr>
                <tr>
                  <td>विभाग</td>
                  <td>:</td>
                  <td>{data.employment?.department || <span className="underline-blank" />}</td>
                </tr>
                <tr>
                  <td>पदस्थापना ठिकाण</td>
                  <td>:</td>
                  <td>
                    {convertToMarathi(data.employment?.placeOfPosting || '') || convertToMarathi(data.company?.companyLocality || '') || <span className="underline-blank" />}
                  </td>
                </tr>
                <tr>
                  <td>कर्मचारी आयडी</td>
                  <td>:</td>
                  <td>{convertToMarathi(data.employee?.staffId || data.employee?.employeeId || '') || <span className="underline-blank" />}</td>
                </tr>
                <tr>
                  <td>नोकरी सोडण्याचे कारण</td>
                  <td>:</td>
                  <td>{convertToMarathi(reasonLeaving)}</td>
                </tr>
              </tbody>
            </table>

            {/* वर्तणूक व कार्यप्रदर्शन */}
            <div className="section-heading">२. वर्तणूक व कार्यप्रदर्शन</div>
            <div className="body-text">
              कंपनीमधील संपूर्ण सेवाकाळात <strong>{employeeFullName}</strong> यांची वर्तणूक व वागणूक{' '}
              <span className="remark-pill">{conductLabel}</span>{' '}
              राहिली असून त्यांचे एकूण कार्यप्रदर्शन व व्यावसायिक योगदान{' '}
              <span className="remark-pill">{perfLabel}</span>{' '}
              असे मूल्यांकित करण्यात आले आहे. कर्मचाऱ्याने संपूर्ण सेवाकाळात प्रामाणिकपणा,
              कर्तव्यनिष्ठा व सहकार्याची भावना दाखवली आहे.
            </div>

            {/* ना-हरकत घोषणा */}
            <div className="section-heading">३. ना-हरकत घोषणा</div>
            <div className="body-text">
              कंपनी याद्वारे घोषित करते की <strong>{employeeFullName}</strong> यांनी{' '}
              {convertToMarathi(nocPurpose)}
              {nocIssuedTo ? ` — <strong>${convertToMarathi(nocIssuedTo)}</strong> येथे` : ''}{' '}
              याबाबत कंपनीला कोणतीही <strong>ना-हरकत नाही</strong>.
              कंपनीच्या धोरणानुसार कर्मचाऱ्याला देय असलेल्या सर्व रकमांचे पूर्ण प्रदान करण्यात आले आहे तसेच
              कर्मचाऱ्याकडे असलेली कंपनीची सर्व मालमत्ता, कागदपत्रे, प्रमाणपत्रे व साहित्य व्यवस्थापनाच्या
              समाधानानुसार परत मिळवण्यात आले आहे व पडताळणी पूर्ण झाली आहे. कर्मचाऱ्याला{' '}
              <strong>{formatMarathiDateLong(data.employment?.relievingDate || data.employment?.lastWorkingDay)}</strong>{' '}
              पासून सर्व कर्तव्ये व जबाबदाऱ्यांमधून मुक्त करण्यात येत आहे.
            </div>

            {/* निर्गमन पुष्टी */}
            <div className="section-heading">४. निर्गमन पुष्टी</div>
            <div className="body-text">
              हे प्रमाणपत्र पुढील बाबी देखील पुष्टी करते:
            </div>
            <ol style={{
              margin: '0 0 8px 22px',
              fontSize: '13px',
              lineHeight: '2',
              fontFamily: "'Noto Sans Devanagari','Mangal',serif",
            }}>
              <li>
                कर्मचाऱ्याचे सर्व बाकी वेतन, देय रकमा व वैधानिक हक्क पूर्णतः अदा करण्यात आले आहेत.
              </li>
              <li>
                या प्रमाणपत्राच्या दिनांकापर्यंत कर्मचाऱ्याविरुद्ध कोणतीही शिस्तभंग कारवाई, कायदेशीर
                कार्यवाही अथवा आर्थिक वसुलीचा दावा प्रलंबित नाही.
              </li>
              <li>
                कर्मचाऱ्याने कर्तव्य हस्तांतरण, कंपनी मालमत्तेची परतफेड व नो-ड्यूज घोषणेवर सही
                यासह सर्व निर्गमन औपचारिकता यशस्वीरीत्या पूर्ण केल्या आहेत.
              </li>
              <li>
                कंपनीचे गोपनीयता, अप्रकटीकरण व गैर-आग्रह (Non-Solicitation) संबंधी दायित्वे सेवाकाळ
                संपल्यानंतरही रोजगार कराराच्या तरतुदींनुसार कर्मचाऱ्यावर बंधनकारक राहतील.
              </li>
            </ol>

            {/* शुभेच्छा परिच्छेद */}
            <div className="body-text">
              कंपनी <strong>{employeeFullName}</strong> यांना त्यांच्या भावी प्रयत्नांसाठी व
              करिअरच्या वाढीसाठी मनःपूर्वक शुभेच्छा देते.
            </div>

            {/* स्वाक्षरी विभाग */}
            <div className="sig-grid">

              {/* कंपनी स्वाक्षरीकार */}
              <div className="sig-block" style={{ flex: 2 }}>
                <div className="sig-label">{employerFullName} यांच्यासाठी व वतीने</div>
                <div className="sig-line" style={{ marginTop: '10px' }} />
                <div className="sig-field-row">
                  <strong>नाव:</strong>
                  <span className="underline-blank" style={{ minWidth: '150px' }}>
                    {convertNameWithTitle(data.manager?.managerName || data.company?.managerName || data.company?.hrName || '') || ''}
                  </span>
                </div>
                <div className="sig-field-row">
                  <strong>पद:</strong>
                  <span className="underline-blank" style={{ minWidth: '130px' }}>
                    {convertToMarathi(data.manager?.managerPosition || data.company?.managerPosition || data.company?.hrDesignation || '')}
                  </span>
                </div>
                <div className="sig-field-row">
                  <strong>दिनांक:</strong>
                  <span className="underline-blank" style={{ minWidth: '110px' }}>
                    {formatMarathiDate(nocDate)}
                  </span>
                </div>
                <div className="sig-field-row">
                  <strong>ठिकाण:</strong>
                  <span className="underline-blank" style={{ minWidth: '120px' }}>
                    {convertToMarathi(data.company?.companyLocality || data.company?.companyDistrict || '')}
                  </span>
                </div>
              </div>

              {/* कंपनी शिक्का */}
              <div className="sig-block" style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
              }}>
                <div className="sig-label" style={{ marginBottom: '8px', textAlign: 'center' }}>
                  कंपनी शिक्का / मुद्रा
                </div>
                <div className="stamp-box">
                  शिक्का व<br />मुद्रा
                </div>
              </div>

            </div>
          </div>

          {/* अस्वीकरण */}
          <div className="disclaimer-box">
            <strong>अस्वीकरण:</strong> हे ना-हरकत प्रमाणपत्र कंपनीकडे उपलब्ध नोंदींच्या आधारे सद्भावनेने जारी
            करण्यात आले असून ते केवळ {convertToMarathi(nocPurpose)} या उद्देशासाठी वैध आहे. या प्रमाणपत्राचा कोणताही गैरवापर,
            चुकीचे सादरीकरण अथवा नमूद उद्देशाव्यतिरिक्त इतर कोणत्याही हेतूसाठी वापर केल्यास कंपनी जबाबदार
            राहणार नाही. हे प्रमाणपत्र चारित्र्य संदर्भ, रोजगार हमी अथवा नमूद उद्देशाच्या पलीकडील कोणत्याही
            कायदेशीर वचनबद्धतेचे स्वरूप धारण करत नाही. पडताळणीसाठी कोणत्याही चौकशी{' '}
            <strong>{convertToMarathi(data.company?.companyEmail || '[कंपनी ईमेल]')}</strong> अथवा{' '}
            <strong>{convertNumberToMarathi(formatPhone(data.manager?.managerPhone || data.company?.managerPhone))}</strong>{' '}
            यांच्याशी संपर्क साधावा.
          </div>

          <div className="end-text">* * * समाप्त * * *</div>

        </div>

        <PrintFooter />
      </div>
    </div>
  );
};

export default MarathiPostJobNOC;