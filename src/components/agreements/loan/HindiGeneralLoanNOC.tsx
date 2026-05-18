import React from 'react';
import {
  convertNumberToHindi,
} from '../../../engine/EnglishToHindiEngine';
import { PrintFooter } from '../../../../components/Printpreview';

interface ClientData {
  title?: string;
  name: string;
  age: string;
  gender: string;
  occupation: string;
  phone: string;
  email: string;
  aadhaar: string;
  pan: string;
  address: string;
  district?: string;
  locality?: string;
  state?: string;
  pincode?: string;
  folderName?: string;
  folderSerial?: string;
  tokenSerial?: string;
  clientId?: string;
}

interface CompanyData {
  companyName?: string;
  entityType?: string;
  companyPan?: string;
  companyEmail?: string;
  companyWebsite?: string;
  licenseRegistrationNumber?: string;
  companyAddress?: string;
  companyLocality?: string;
  companyDistrict?: string;
  companyState?: string;
  companyPincode?: string;
}

interface ManagerData {
  managerName?: string;
  managerPosition?: string;
  managerPhone?: string;
}

interface AgreementData {
  client: ClientData;
  company: CompanyData;
  manager?: ManagerData;
  nocSerial?: string;
  nocDate?: string;
  loanAmount?: string | number;
  loanDuration?: string;
  loanDate?: string;
  loanPurpose?: string;
  repaymentMode?: string;
  interestRate?: string;
}

// ─── Shared Styles ────────────────────────────────────────────────────────────

const sharedStyles = `
  .a4-page {
    width: 210mm;
    min-height: 297mm;
    margin: 0 auto;
    background: white;
    padding: 12mm 15mm;
    box-sizing: border-box;
    page-break-after: always;
    box-shadow: 0 0 10px rgba(0,0,0,0.1);
    font-family: 'Noto Sans Devanagari', 'Mangal', 'Arial Unicode MS', serif;
    position: relative;
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
      padding: 12mm 15mm;
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
  .header-box {
    border: 2.5px solid #000;
    padding: 8px 12px;
    margin-bottom: 6px;
  }
  .clause {
    font-size: 13px;
    line-height: 1.95;
    text-align: justify;
    margin-bottom: 9px;
  }
  .clause-num {
    font-weight: 800;
  }
  .sig-section {
    display: flex;
    justify-content: space-between;
    margin-top: 30px;
    gap: 20px;
  }
  .sig-block {
    flex: 1;
    font-size: 12.5px;
  }
  .sig-line {
    border-bottom: 1px solid #000;
    min-height: 44px;
    margin: 6px 0;
  }
  .sig-label {
    font-weight: 700;
    font-size: 12.5px;
  }
  .noc-stamp-box {
    border: 1.5px dashed #555;
    width: 90px;
    height: 90px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 10px;
    color: #555;
    text-align: center;
    margin: 0 auto;
  }
  .end-text {
    text-align: center;
    font-weight: 800;
    font-size: 14px;
    margin-top: 24px;
    letter-spacing: 3px;
  }
  .loan-table {
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 14px;
    font-size: 12.5px;
  }
  .loan-table td {
    padding: 5px 8px;
    border: 1px solid #ccc;
  }
  .loan-table td:first-child {
    font-weight: 700;
    width: 42%;
    background: #f9f9f9;
  }
  .noc-serial {
    font-size: 12px;
    font-weight: 700;
    display: flex;
    justify-content: space-between;
    margin-bottom: 10px;
    border-bottom: 1px solid #000;
    padding-bottom: 4px;
  }
  .doc-id-bar {
    margin-top: 6px;
    padding: 6px 10px;
    background: #fef9c3;
    border: 1px solid #fde047;
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 12px;
    font-weight: 600;
    font-family: monospace;
  }
`;

// ─── Helpers ─────────────────────────────────────────────────────────────────

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

const formatAmount = (v?: string | number) => {
  if (!v) return '________';
  return Number(v).toLocaleString('en-IN');
};

// ═══════════════════════════════════════════════════════════════
// HINDI GENERAL LOAN NOC
// ═══════════════════════════════════════════════════════════════

const HindiGeneralLoanNOC: React.FC<{ data: AgreementData }> = ({ data, companyLogo, companyWatermark }) => {
  const borrowerName = [data.client.title, data.client.name].filter(Boolean).join(' ');
  const lenderDisplay = `${data.company.companyName || ''}${data.company.entityType ? ` (${data.company.entityType})` : ''}`;
  const issueDate = data.nocDate || data.loanDate;
  const borrowerAddress = [
    data.client.address,
    data.client.locality,
    data.client.district,
    data.client.state,
  ].filter(Boolean).join(', ') + (data.client.pincode ? ` - ${data.client.pincode}` : '');

  return (
    <div id="printable-document" className="flex flex-col items-center">
      <style>{sharedStyles}</style>
      <div className="a4-page">

        {/* ── PAGE 1 ─────────────────────────────────────────────── */}
  {/* WATERMARK */}
  <div
  style={{
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",

    display: "flex",
    alignItems: "flex-end",   // 🔥 push down
    justifyContent: "center",
    paddingBottom: "120px",   // 🔥 fine control

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
                		        </div>

        {/* ── DOC ID BAR ── */}
        <div className="doc-id-bar">
          <span className="font-mono">
            {`${data.client.folderSerial || ''}-${data.client.clientId || ''}-LOAN-NOC`}
          </span>
          <span><strong>दिनांक : </strong>{formatHindiDate(issueDate)}</span>
        </div>

        {/* ── NOC SERIAL ── */}
        <div className="noc-serial" style={{ marginTop: '10px' }}>
          <span>एनओसी संदर्भ क्र. : {safe(data.nocSerial)}</span>
          <span>दिनांक : {formatHindiDate(issueDate)}</span>
        </div>

        {/* ── TITLE ── */}
        <div className="mt-6 text-center font-serif text-[19px] font-bold tracking-[1.5px] text-blue-700 underline underline-offset-4">
          अनापत्ति प्रमाण पत्र
        </div>
        <div className="text-center text-[13px] font-semibold mt-1 mb-6 text-gray-600">
          (सामान्य निजी ऋण — ऋणदाता द्वारा जारी)
        </div>

        {/* ── SUBJECT ── */}
        <div className="clause" style={{ marginBottom: '14px' }}>
          <strong>विषय :</strong> अनापत्ति प्रमाण पत्र — <strong>{borrowerName}</strong> के पक्ष में ₹ {formatAmount(data.loanAmount)}/- का सामान्य निजी ऋण, उद्देश्य : {safe(data.loanPurpose)}।
        </div>

        {/* ── TO LINE ── */}
        <div className="clause" style={{ marginBottom: '14px' }}>
          <strong>जिसे भी संबंधित हो,</strong><br /><br />
          यह प्रमाण पत्र <strong>{lenderDisplay}</strong> द्वारा <strong>{borrowerName}</strong> के अनुरोध पर जारी किया जाता है।
          आयु : {safe(data.client.age)} वर्ष, व्यवसाय : {safe(data.client.occupation)},
          आधार संख्या : {safe(data.client.aadhaar)}, पैन : {safe(data.client.pan)},
          पता : {borrowerAddress}।
        </div>

        {/* ── LOAN TABLE ── */}
        <table className="loan-table">
          <tbody>
            <tr><td>ऋणी का नाम</td><td>{borrowerName}</td></tr>
            <tr><td>आधार संख्या</td><td>{safe(data.client.aadhaar)}</td></tr>
            <tr><td>पैन संख्या</td><td>{safe(data.client.pan)}</td></tr>
            <tr><td>व्यवसाय</td><td>{safe(data.client.occupation)}</td></tr>
            <tr><td>ऋणी का पता</td><td>{borrowerAddress}</td></tr>
            <tr><td>ऋणदाता का नाम</td><td>{lenderDisplay}</td></tr>
            <tr><td>ऋण राशि</td><td>₹ {formatAmount(data.loanAmount)} /- मात्र</td></tr>
            <tr><td>ऋण का उद्देश्य</td><td>{safe(data.loanPurpose)}</td></tr>
            <tr><td>वितरण की तिथि</td><td>{formatHindiDate(data.loanDate)}</td></tr>
            <tr><td>ऋण अवधि</td><td>{safe(data.loanDuration)}</td></tr>
            <tr><td>पुनर्भुगतान का तरीका</td><td>{safe(data.repaymentMode)}</td></tr>
            <tr><td>ब्याज दर</td><td>{safe(data.interestRate)}</td></tr>
            <tr><td>एनओसी जारी करने की तिथि</td><td>{formatHindiDate(issueDate)}</td></tr>
          </tbody>
        </table>

        {/* ── CLAUSES ── */}
        <div className="clause">
          <span className="clause-num">१. </span>
          यह प्रमाणित किया जाता है कि <strong>{lenderDisplay}</strong>, जिन्हें आगे "ऋणदाता" कहा जाएगा, ने <strong>{borrowerName}</strong>, जिन्हें आगे "ऋणी" कहा जाएगा, को {formatHindiDate(data.loanDate)} को {safe(data.loanPurpose)} के उद्देश्य से ₹ {formatAmount(data.loanAmount)}/- (रुपये {safe(data.loanAmount)} मात्र) का निजी व्यक्तिगत ऋण प्रदान किया है। उक्त ऋण की अवधि {safe(data.loanDuration)} है तथा पुनर्भुगतान {safe(data.repaymentMode)} के माध्यम से किया जाएगा।
        </div>

        <div className="clause">
          <span className="clause-num">२. </span>
          ऋणदाता एतद्द्वारा घोषित करता है कि उसे उपरोक्त ऋण राशि का उपयोग ऋणी द्वारा {safe(data.loanPurpose)} के उद्देश्य से किए जाने पर <strong>कोई आपत्ति नहीं</strong> है। यह अनापत्ति प्रमाण पत्र ऋणी को किसी भी बैंक, वित्तीय संस्था, सरकारी प्राधिकरण या अन्य संबंधित पक्ष के समक्ष प्रस्तुत करने हेतु जारी किया गया है।
        </div>

        <div className="clause">
          <span className="clause-num">३. </span>
          ऋणदाता पुष्टि करता है कि उपरोक्त ₹ {formatAmount(data.loanAmount)}/- की ऋण राशि {formatHindiDate(data.loanDate)} को दोनों पक्षों के बीच सहमति के अनुसार ऋणी को विधिवत वितरित की जा चुकी है। ऋणदाता यह भी पुष्टि करता है कि इस प्रमाण पत्र की जारी करने की तिथि तक ऋणदाता और ऋणी के मध्य कोई विवाद, लंबित मुकदमा या बकाया दावा विद्यमान नहीं है।
        </div>

        <div className="clause">
          <span className="clause-num">४. </span>
          ऋणदाता एतद्द्वारा घोषित करता है कि ऋणी द्वारा ऋण राशि का उपयोग किस प्रकार किया जाता है, उसके लिए वह किसी भी प्रकार से उत्तरदायी नहीं होगा। यह प्रमाण पत्र केवल सामान्य अनापत्ति की घोषणा के रूप में जारी किया गया है। ऋणी के ऋण राशि के उपयोग से उत्पन्न किसी भी वित्तीय लेनदेन, देनदारी या दायित्व के लिए ऋणी स्वयं व्यक्तिगत रूप से उत्तरदायी होगा।
        </div>

        <div className="clause">
          <span className="clause-num">५. </span>
          ऋणी बिना किसी शर्त के वचन देता है कि वह उक्त ऋण राशि को ऋणदाता को सहमत पुनर्भुगतान अनुसूची के अनुसार लौटाएगा। इस अनापत्ति प्रमाण पत्र के जारी होने से किसी भी प्रकार से ऋणी की पुनर्भुगतान की बाध्यता में कोई परिवर्तन, छूट या कमी नहीं होगी, जो ऋण के पूर्ण निपटान तक पूर्णतः बाध्यकारी एवं प्रवर्तनीय रहेगी।
        </div>

        <div className="clause">
          <span className="clause-num">६. </span>
          यह अनापत्ति प्रमाण पत्र ऋणदाता द्वारा केवल उपरोक्त नामित ऋणी के लाभ हेतु सद्भावना में जारी किया गया है। यह किसी तृतीय पक्ष को हस्तांतरणीय या हस्तांकित करने योग्य नहीं है, तथा इसे किसी तृतीय पक्ष, बैंक या वित्तीय संस्था के प्रति ऋणदाता की किसी भी प्रकार की गारंटी, जमानत, क्षतिपूर्ति या समर्थन के रूप में नहीं माना जाएगा। यह प्रमाण पत्र जारी करने की तिथि से <strong>९० (नब्बे) दिनों</strong> की अवधि के लिए वैध है।
        </div>

        {/* ── SIGNATURES ── */}
        <div className="sig-section">
          <div className="sig-block">
            <div className="sig-label">ऋणी की स्वीकृति :-</div>
            <div className="sig-line" />
            <div>नाम : {borrowerName}</div>
            <div style={{ marginTop: '4px' }}>दिनांक : {formatHindiDate(issueDate)}</div>
          </div>
          <div className="sig-block" style={{ textAlign: 'center' }}>
            <div className="noc-stamp-box">कार्यालय मुहर एवं स्टाम्प</div>
          </div>
          <div className="sig-block" style={{ textAlign: 'right' }}>
            <div className="sig-label">अधिकृत हस्ताक्षरकर्ता (ऋणदाता) :-</div>
            <div className="sig-line" />
            <div>(M H Vicky / Vikrant Rana)</div>
            <div>स्वामी एवं लेखा / प्रशासन प्रमुख</div>
            <div style={{ fontWeight: '700' }}>{lenderDisplay}</div>
            <div>दिनांक : {formatHindiDate(issueDate)}</div>
          </div>
        </div>

        {/* ── WITNESSES ── */}
        <div style={{ marginTop: '16px', fontSize: '12.5px' }}>
          <strong>साक्षीगण :-</strong>
          <div style={{ display: 'flex', gap: '40px', marginTop: '8px' }}>
            <div style={{ flex: 1 }}>
              (अ) <span style={{ borderBottom: '1px solid #000', display: 'inline-block', minWidth: '160px' }} />
            </div>
            <div style={{ flex: 1 }}>
              (ब) <span style={{ borderBottom: '1px solid #000', display: 'inline-block', minWidth: '160px' }} />
            </div>
          </div>
        </div>

        <div className="end-text">* * * समाप्त * * *</div>

        </div>
        <PrintFooter />
      </div>
  );
};

export default HindiGeneralLoanNOC;