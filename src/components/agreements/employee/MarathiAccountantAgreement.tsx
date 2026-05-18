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

const MarathiOfficeAccountantAgreement = ({ data, companyLogo, companyWatermark }: TemplateProps) => {

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
    "कंपनीने निर्धारित केलेल्या Tally ERP / Tally Prime किंवा इतर कोणत्याही लेखा सॉफ्टवेअरमध्ये खाजगी मर्यादित कंपन्यांना लागू असलेल्या लेखा मानकांनुसार अचूक हिशेब-वह्या राखणे.",
    "मालमत्ता बुकिंग, टोकन रक्कम, हप्ता संकलन, रद्दीकरण, दलाली देयके आणि विक्रेता देयके यांसह सर्व आर्थिक व्यवहारांची नोंद करणे व ताळमेळ घालणे.",
    "कंपनीच्या स्थावर मालमत्ता व्यवसायासाठी GST कायदा, २०१७ अंतर्गत मासिक, त्रैमासिक आणि वार्षिक GST रिटर्न (GSTR-1, GSTR-3B, GSTR-9) तयार करणे व दाखल करणे.",
    "प्राप्तिकर कायदा, १९६१ अंतर्गत लागू TDS कपात करणे व भरणे तसेच विहित देय तारखांच्या आत TDS रिटर्न (फॉर्म 24Q, 26Q, 27Q) दाखल करणे.",
    "कंपनी कायदा, २०१३ आणि लागू लेखा मानकांनुसार (AS / Ind AS) वार्षिक वित्तीय विवरणे — ताळेबंद, नफा-तोटा खाते आणि रोख प्रवाह विवरण — तयार करण्यात सहाय्य करणे.",
    "देय आणि प्राप्य खात्यांचे व्यवस्थापन करणे, ज्यात मालमत्ता खरेदीदारांकडील थकीत रकमांचा मागोवा घेणे, विलंबित देयकांचा पाठपुरावा करणे आणि विक्रेत्यांची बिले प्रक्रिया करणे यांचा समावेश आहे.",
    "व्यवस्थापन आढाव्यासाठी MIS अहवाल, बजेट विरुद्ध वास्तविक अहवाल, प्रकल्पनिहाय खर्च विवरण आणि रोख प्रवाह अंदाज तयार करणे व राखणे.",
    "कंपनी कायदा, २०१३ अंतर्गत आवश्यक वार्षिक लेखापरीक्षण, संचालक मंडळाचे ठराव आणि ROC दाखलींसाठी वैधानिक लेखापरीक्षक, अंतर्गत लेखापरीक्षक आणि कंपनी सचिव यांच्याशी समन्वय साधणे.",
    "लागू कामगार कायद्यांनुसार कंपनीच्या कर्मचाऱ्यांसाठी वेतनपट प्रक्रिया, EPF, ESI, व्यावसायिक कर आणि इतर वैधानिक कपातींची गणना व व्यवस्थापन करणे.",
    "वैधानिक अभिलेख धारण आवश्यकतांनुसार सर्व आर्थिक नोंदी, व्हाउचर, पावत्या, चालाने आणि बँक विवरणांचे योग्य दस्तऐवजीकरण राखणे.",
    "RERA (स्थावर मालमत्ता नियमन व विकास कायदा, २०१६) च्या आर्थिक अहवाल आवश्यकतांचे पालन सुनिश्चित करणे, ज्यात प्रत्येक प्रकल्पासाठी स्वतंत्र एस्क्रो खाते राखणे समाविष्ट आहे.",
    "वेळोवेळी व्यवस्थापनाने नेमून दिलेली इतर लेखांकन, आर्थिक किंवा प्रशासकीय कामे पार पाडणे.",
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
          <div className="agreement-title">रोजगार करार</div>
          <div className="agreement-subtitle">(कार्यालय लेखापाल)</div>

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
            <div>
              <strong>शैक्षणिक पात्रता:</strong>{' '}
              {data.employee?.qualification || <span className="underline-blank" style={{ minWidth: '160px' }} />}
            </div>
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
            कंपनी एतद्द्वारे कर्मचाऱ्याला <strong>कार्यालय लेखापाल</strong> या पदावर
            {data.employment?.department ? ` ${convertToMarathi(data.employment.department)} विभागात` : ''} नियुक्त करते. कर्मचारी{' '}
            <span className="underline-blank">{convertToMarathi(data.employment?.reportingTo || '')}</span>{' '}
            यांना अहवाल देईल आणि स्थावर मालमत्ता खाजगी मर्यादित कंपनीत आवश्यक असलेली सर्व लेखांकन, आर्थिक व अनुपालन कर्तव्ये परिश्रमपूर्वक पार पाडेल, ज्यात खालील गोष्टींचा समावेश आहे परंतु त्या इतक्याच मर्यादित नाहीत:
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
            जे पुढील महिन्याच्या ७ तारखेला किंवा त्यापूर्वी समान मासिक हप्त्यांमध्ये, प्राप्तिकर कायदा, १९६१ अंतर्गत लागू TDS कपाती आणि भारतीय कायद्यानुसार वैधानिक रोखे यांच्या अधीन राहून देय असेल.
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
            <li><strong>कर्मचारी राज्य विमा (ईएसआय) — ESI कायदा, १९४८:</strong> लागू जेव्हा कर्मचाऱ्याचे एकूण वेतन दरमहा ₹२१,०००/- किंवा त्याहून कमी असेल आणि आस्थापना १० (काही राज्यांत २०) किंवा अधिक व्यक्तींना रोजगार देत असेल.</li>
            <li><strong>उपदान (ग्रॅच्युइटी) — ग्रॅच्युइटी देयक कायदा, १९७२:</strong> ५ (पाच) वर्षांची सलग सेवा पूर्ण झाल्यावर प्रत्येक पूर्ण सेवा वर्षासाठी १५ दिवसांच्या वेतनाच्या दराने देय.</li>
            <li>
              <strong>रजा पात्रता — दुकाने व आस्थापना कायदा (राज्य):</strong> सवेतन वार्षिक / अर्जित रजा ({convertNumberToMarathi(data.employment?.annualLeaves || '12')} दिवस),
              आजारपण / वैद्यकीय रजा ({convertNumberToMarathi(data.employment?.medicalLeaves || '6')} दिवस) आणि नैमित्तिक रजा ({convertNumberToMarathi(data.employment?.casualLeaves || '6')} दिवस) प्रति दिनदर्शिका वर्ष.
            </li>
            <li><strong>मातृत्व लाभ — मातृत्व लाभ कायदा, १९६१:</strong> पात्र महिला कर्मचाऱ्यांसाठी २६ आठवड्यांची सवेतन मातृत्व रजा (२ जिवंत मुलांपर्यंत); पुढील गर्भधारणेसाठी १२ आठवडे.</li>
            <li><strong>बोनस — बोनस देयक कायदा, १९६५:</strong> कंपनीचा वार्षिक उलाढाल कायद्याच्या अटींनुसार अर्हता प्राप्त करत असल्यास लागू; वार्षिक वेतनाच्या किमान ८.३३% किंवा ₹१००/- प्रति महिना, यापैकी जे अधिक असेल.</li>
          </ul>

          <div style={{ fontWeight: 700, fontSize: '13px', marginTop: '5px', marginBottom: '2px' }}>
            ऐच्छिक / स्पर्धात्मक लाभ
          </div>
          <ul className="benefits-list">
            <li><strong>सामूहिक आरोग्य विमा:</strong> कंपनी धोरणानुसार सर्वसमावेशक वैद्यकीय संरक्षण.</li>
            <li><strong>कार्यक्षमता प्रोत्साहन:</strong> लेखापरीक्षण निकाल आणि अनुपालन कामगिरीशी संलग्न संचालक मंडळ / व्यवस्थापनाच्या विवेकाधीन कार्यक्षमता-आधारित बोनस आणि वार्षिक वेतनवाढ.</li>
            <li><strong>व्यावसायिक विकास:</strong> CA Inter / CMA / ACCA अभ्यास, Tally प्रमाणपत्र, GST व्यवसायी अभ्यासक्रम आणि संबंधित कौशल्य उन्नती कार्यक्रमांसाठी सहाय्य.</li>
            <li><strong>लवचिक काम:</strong> व्यवस्थापनाच्या मान्यतेच्या व वैधानिक दाखल मुदतींच्या अधीन.</li>
          </ul>

          <div style={{ fontWeight: 700, fontSize: '13px', marginTop: '5px', marginBottom: '2px' }}>
            पर्यायी सुविधा
          </div>
          <ul className="benefits-list">
            <li>कल्याण कार्यक्रम: जिम सदस्यत्व, मानसिक आरोग्य सहाय्य.</li>
            <li>अतिरिक्त रजा: कंपनी धोरणानुसार पितृत्व रजा, शोक रजा.</li>
            <li>सहाय्य: बाल संगोपन सहाय्य, स्थलांतर सहाय्य लागू असल्यास.</li>
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
            दुपारच्या जेवणाची सुट्टी असेल, जे लागू राज्य दुकाने व आस्थापना कायद्यानुसार असेल. लेखांकन व वैधानिक दाखल दायित्वांचे स्वरूप लक्षात घेता, कर्मचारी मान्य करतो की GST रिटर्न तारखा, TDS देय तारखा, आगाऊ कर तारखा आणि आर्थिक वर्ष-अंत समापनाच्या वेळी विशेषतः अतिरिक्त तास काम करणे आवश्यक असू शकते. कोणत्याही अतिरिक्त कामाचा मोबदला लागू कायद्यानुसार असेल.
          </div>

          {/* ५. विश्वस्त कर्तव्य आणि आर्थिक प्रामाणिकपणा */}
          <div className="section-heading">५. विश्वस्त कर्तव्य आणि आर्थिक प्रामाणिकपणा</div>
          <div className="body-text">
            कर्मचाऱ्यावर सोपविलेल्या संवेदनशील आर्थिक भूमिकेच्या दृष्टीने, कर्मचारी स्पष्टपणे सहमत होतो की तो:
          </div>
          <ul className="clause-list">
            <li>सदैव आर्थिक प्रामाणिकपणा आणि व्यावसायिक नैतिकतेचे सर्वोच्च मानक राखेल;</li>
            <li>कंपनीच्या अंतर्गत प्राधिकरण आराखड्यानुसार योग्य मंजुरीशिवाय कोणतेही देयक, व्यवहार किंवा आर्थिक नोंद करणार नाही, अधिकृत करणार नाही किंवा सुलभ करणार नाही;</li>
            <li>कोणतीही आर्थिक अनियमितता, फसवणूक, संशयास्पद अपहार किंवा खात्यातील चूक याची माहिती तत्काळ लेखी स्वरूपात अहवाल देणाऱ्या प्राधिकाऱ्याला देईल;</li>
            <li>संचालक मंडळाने लेखी स्पष्टपणे अधिकृत केल्याशिवाय कोणत्याही कंपनी बँक खात्याचे संचालन, वापर किंवा स्वाक्षरी अधिकार ठेवणार नाही;</li>
            <li>कंपनीच्या व्यवसायाशी संबंधित कोणत्याही विक्रेत्या, कंत्राटदाराकडून किंवा तृतीय पक्षाकडून कोणतीही भेट, कमिशन किंवा लाभ स्वीकारणार नाही.</li>
          </ul>
          <div className="body-text">
            विश्वस्त कर्तव्याच्या कोणत्याही उल्लंघनामुळे कर्मचारी तात्काळ सेवासमाप्ती, आर्थिक नुकसानीची वसुली आणि भारतीय दंड संहिता, १८६० आणि भ्रष्टाचार प्रतिबंध कायदा, १९८८ च्या लागू तरतुदींनुसार फौजदारी खटल्यास पात्र असेल.
          </div>

          {/* ६. गोपनीयता आणि डेटा संरक्षण */}
          <div className="section-heading">६. गोपनीयता आणि डेटा संरक्षण</div>
          <div className="body-text">
            कर्मचाऱ्याला कंपनी आणि तिच्या ग्राहकांच्या अत्यंत संवेदनशील आर्थिक व वैयक्तिक माहितीचा प्रवेश असेल, ज्यात बँक खाते तपशील, मालमत्ता व्यवहार मूल्यांकन, ग्राहकांचा पॅन व आधार डेटा, लेखापरीक्षण अहवाल, कर दाखली आणि संचालक मंडळाचे ठराव समाविष्ट आहेत, परंतु ते इतक्याच मर्यादित नाहीत. कर्मचारी सहमत आहे की तो:
          </div>
          <ul className="clause-list">
            <li>रोजगाराच्या कालावधीत आणि नंतर अशी सर्व माहिती पूर्णपणे गोपनीय ठेवेल;</li>
            <li>पूर्व लेखी अधिकाराशिवाय कोणतीही आर्थिक माहिती किंवा ग्राहकाची माहिती कोणत्याही तृतीय पक्षाला उघड करणार नाही, प्रत किंवा प्रसारित करणार नाही किंवा गैरवापर करणार नाही;</li>
            <li>डिजिटल वैयक्तिक डेटा संरक्षण कायदा, २०२३ (DPDPA) आणि लागू IT व आर्थिक नियमांतर्गत सर्व दायित्वांचे पालन करेल;</li>
            <li>रोजगार संपुष्टात आल्यावर आर्थिक नोंदी, पासवर्ड किंवा क्रेडेन्शियल यांची कोणतीही भौतिक किंवा डिजिटल प्रत स्वतःकडे ठेवणार नाही.</li>
          </ul>

          {/* ७. अ-स्पर्धा आणि अ-आकर्षण */}
          <div className="section-heading">७. अ-स्पर्धा आणि अ-आकर्षण</div>
          <div className="body-text">
            रोजगाराच्या कालावधीत आणि कोणत्याही कारणास्तव रोजगार संपुष्टात आल्यानंतर{' '}
            <span className="underline-blank">{convertToMarathi(data.employment?.nonCompetePeriod || '६ (सहा) महिने')}</span>{' '}
            कालावधीसाठी, कर्मचारी खालील गोष्टी करणार नाही:
          </div>
          <ul className="clause-list">
            <li>कंपनीच्या प्राथमिक व्यवसाय स्थानाच्या{' '}
              <span className="underline-blank">{convertToMarathi(data.employment?.nonCompeteRadius || '२५ कि.मी.')}</span>{' '}
              त्रिज्येत कंपनीच्या स्थावर मालमत्ता व्यवसायाशी स्पर्धा करणाऱ्या कोणत्याही व्यवसायात प्रत्यक्ष किंवा अप्रत्यक्षपणे सहभागी होणार नाही, रोजगार घेणार नाही किंवा लेखांकन / आर्थिक सेवा देणार नाही;</li>
            <li>कोणत्याही स्पर्धात्मक किंवा वैयक्तिक आर्थिक उद्देशासाठी कंपनीच्या कोणत्याही ग्राहकाला, विक्रेत्याला किंवा व्यावसायिक सहयोगीला संपर्क, विनंती किंवा सल्ला देणार नाही;</li>
            <li>कंपनीच्या कोणत्याही कर्मचाऱ्याला त्यांचा रोजगार सोडण्यास प्रवृत्त करणार नाही किंवा प्रयत्न करणार नाही.</li>
          </ul>

          {/* ८. रोजगार समाप्ती */}
          <div className="section-heading">८. रोजगार समाप्ती</div>

          <div className="sub-heading">कंपनीद्वारे समाप्ती</div>
          <div className="body-text">कंपनी खालील परिस्थितींमध्ये हा करार समाप्त करू शकते:</div>
          <ul className="termination-list">
            <li>
              <strong>कारणासह (तात्काळ बडतर्फी):</strong> आर्थिक फसवणूक, अपहार, खात्यांची बनावट, कंपनीला दंड लावणाऱ्या वैधानिक दाखलींमध्ये जाणीवपूर्वक कसूर, सकल गैरवर्तन किंवा या कराराचे किंवा कंपनीच्या धोरणांचे महत्त्वपूर्ण उल्लंघन याकरिता नोटिशिशिवाय तात्काळ.
            </li>
            <li>
              <strong>कारणाशिवाय:</strong>{' '}
              <span className="underline-blank">{convertToMarathi(data.employment?.noticePeriodEmployer || '३० (तीस) दिवस')}</span>{' '}
              लेखी नोटीस किंवा नोटीसऐवजी वेतन देऊन, लागू असल्यास औद्योगिक विवाद कायदा, १९४७ च्या तरतुदींच्या अधीन.
            </li>
          </ul>

          <div className="sub-heading">कर्मचाऱ्याद्वारे समाप्ती</div>
          <div className="body-text">
            कर्मचारी कंपनीला{' '}
            <span className="underline-blank">{convertToMarathi(data.employment?.noticePeriodEmployee || '३० (तीस) दिवस')}</span>{' '}
            लेखी नोटीस देऊन राजीनामा देऊ शकतो. रोजगार संपुष्टात आल्यावर, कर्मचारी: (i) सर्व प्रलंबित वैधानिक दाखली व खाते ताळमेळ पूर्ण करेल; (ii) सर्व कंपनी मालमत्ता, उपकरणे, लॉगिन क्रेडेन्शियल, डिजिटल स्वाक्षरी प्रमाणपत्रे (DSC) आणि आर्थिक दस्तऐवज सुपूर्द करेल; (iii) नियुक्त उत्तराधिकाऱ्याकडे औपचारिक खाते हस्तांतरण पूर्ण करेल; आणि (iv) अंतिम निपटाऱ्यापूर्वी नो-ड्यूज प्रमाणपत्रावर सही करेल.
          </div>

          {/* ९. शासक कायदा आणि न्यायक्षेत्र */}
          <div className="section-heading">९. शासक कायदा आणि न्यायक्षेत्र</div>
          <div className="body-text">
            हा करार कंपनी कायदा, २०१३, करार कायदा, १८७२, प्राप्तिकर कायदा, १९६१, GST कायदा, २०१७ आणि लागू कामगार विधानांसह भारताच्या कायद्यांनुसार शासित व अर्थान्वित केला जाईल. या करारातून उद्भवणाऱ्या किंवा संबंधित कोणत्याही वादावर{' '}
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
            <strong>लागू विधान:</strong> कंपनी कायदा, २०१३ &nbsp;|&nbsp; करार कायदा, १८७२ &nbsp;|&nbsp; प्राप्तिकर कायदा, १९६१ &nbsp;|&nbsp; GST कायदा, २०१७ &nbsp;|&nbsp; RERA, २०१६ &nbsp;|&nbsp; EPF आणि MP कायदा, १९५२ &nbsp;|&nbsp; ESI कायदा, १९४८ &nbsp;|&nbsp; ग्रॅच्युइटी देयक कायदा, १९७२ &nbsp;|&nbsp; बोनस देयक कायदा, १९६५ &nbsp;|&nbsp; मातृत्व लाभ कायदा, १९६१ &nbsp;|&nbsp; किमान वेतन कायदा, १९४८ &nbsp;|&nbsp; वेतन देयक कायदा, १९३६ &nbsp;|&nbsp; औद्योगिक विवाद कायदा, १९४७ &nbsp;|&nbsp; मनी लाँड्रिंग प्रतिबंध कायदा, २००२ &nbsp;|&nbsp; IT कायदा, २००० &nbsp;|&nbsp; डिजिटल वैयक्तिक डेटा संरक्षण कायदा, २०२३ &nbsp;|&nbsp; राज्य दुकाने व आस्थापना कायदा (महाराष्ट्र)
          </div>
          <div className="body-text" style={{ marginTop: '4px' }}>
            या कराराच्या अटी आणि कोणत्याही लागू कायद्याच्या तरतुदी यांच्यात कोणताही विरोध असल्यास, कायद्याच्या तरतुदी प्रभावी राहतील. कर्मचारी पुढे मान्य करतो की एक आर्थिक अधिकारी म्हणून, वैधानिक अनुपालनात जाणीवपूर्वक कसूर किंवा निष्काळजीपणासाठी तो प्राप्तिकर कायदा, १९६१ आणि GST कायदा, २०१७ च्या काही तरतुदींनुसार वैयक्तिकरित्या जबाबदार असू शकतो.
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

export default MarathiOfficeAccountantAgreement;
