import React from 'react';
import {
  convertNumberToMarathi,
} from '../../../engine/EnglishToMarathiEngine';
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

const formatAmount = (v?: string | number) => {
  if (!v) return '________';
  return Number(v).toLocaleString('en-IN');
};

// ═══════════════════════════════════════════════════════════════
// MARATHI GENERAL LOAN NOC
// ═══════════════════════════════════════════════════════════════

const MarathiGeneralLoanNOC: React.FC<{ data: AgreementData }> = ({ data, companyLogo, companyWatermark }) => {
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
          <span><strong>दिनांक : </strong>{formatMarathiDate(issueDate)}</span>
        </div>

        {/* ── NOC SERIAL ── */}
        <div className="noc-serial" style={{ marginTop: '10px' }}>
          <span>एनओसी संदर्भ क्र. : {safe(data.nocSerial)}</span>
          <span>दिनांक : {formatMarathiDate(issueDate)}</span>
        </div>

        {/* ── TITLE ── */}
        <div className="mt-6 text-center font-serif text-[19px] font-bold tracking-[1.5px] text-blue-700 underline underline-offset-4">
          ना हरकत प्रमाणपत्र
        </div>
        <div className="text-center text-[13px] font-semibold mt-1 mb-6 text-gray-600">
          (सर्वसाधारण खाजगी कर्ज — कर्जदात्याद्वारे जारी)
        </div>

        {/* ── SUBJECT ── */}
        <div className="clause" style={{ marginBottom: '14px' }}>
          <strong>विषय :</strong> ना हरकत प्रमाणपत्र — <strong>{borrowerName}</strong> यांच्या नावे ₹ {formatAmount(data.loanAmount)}/- चे सर्वसाधारण खाजगी कर्ज, उद्देश : {safe(data.loanPurpose)}।
        </div>

        {/* ── TO LINE ── */}
        <div className="clause" style={{ marginBottom: '14px' }}>
          <strong>ज्यांना संबंधित असेल त्यांना,</strong><br /><br />
          हे प्रमाणपत्र <strong>{lenderDisplay}</strong> यांच्याद्वारे <strong>{borrowerName}</strong> यांच्या विनंतीवरून जारी करण्यात येत आहे।
          वय : {safe(data.client.age)} वर्षे, व्यवसाय : {safe(data.client.occupation)},
          आधार क्र. : {safe(data.client.aadhaar)}, पॅन : {safe(data.client.pan)},
          पत्ता : {borrowerAddress}।
        </div>

        {/* ── LOAN TABLE ── */}
        <table className="loan-table">
          <tbody>
            <tr><td>कर्जदाराचे नाव</td><td>{borrowerName}</td></tr>
            <tr><td>आधार क्रमांक</td><td>{safe(data.client.aadhaar)}</td></tr>
            <tr><td>पॅन क्रमांक</td><td>{safe(data.client.pan)}</td></tr>
            <tr><td>व्यवसाय</td><td>{safe(data.client.occupation)}</td></tr>
            <tr><td>कर्जदाराचा पत्ता</td><td>{borrowerAddress}</td></tr>
            <tr><td>कर्जदात्याचे नाव</td><td>{lenderDisplay}</td></tr>
            <tr><td>कर्जाची रक्कम</td><td>₹ {formatAmount(data.loanAmount)} /- फक्त</td></tr>
            <tr><td>कर्जाचा उद्देश</td><td>{safe(data.loanPurpose)}</td></tr>
            <tr><td>वितरणाची तारीख</td><td>{formatMarathiDate(data.loanDate)}</td></tr>
            <tr><td>कर्जाचा कालावधी</td><td>{safe(data.loanDuration)}</td></tr>
            <tr><td>परतफेडीची पद्धत</td><td>{safe(data.repaymentMode)}</td></tr>
            <tr><td>व्याजदर</td><td>{safe(data.interestRate)}</td></tr>
            <tr><td>एनओसी जारी करण्याची तारीख</td><td>{formatMarathiDate(issueDate)}</td></tr>
          </tbody>
        </table>

        {/* ── CLAUSES ── */}
        <div className="clause">
          <span className="clause-num">१. </span>
          हे प्रमाणित करण्यात येते की <strong>{lenderDisplay}</strong>, ज्यांना यापुढे "कर्जदाता" असे संबोधले जाईल, यांनी <strong>{borrowerName}</strong>, ज्यांना यापुढे "कर्जदार" असे संबोधले जाईल, यांना दिनांक {formatMarathiDate(data.loanDate)} रोजी {safe(data.loanPurpose)} या उद्देशासाठी ₹ {formatAmount(data.loanAmount)}/- (रुपये {safe(data.loanAmount)} फक्त) चे खाजगी वैयक्तिक कर्ज दिले आहे। सदर कर्जाचा कालावधी {safe(data.loanDuration)} असून परतफेड {safe(data.repaymentMode)} द्वारे केली जाईल।
        </div>

        <div className="clause">
          <span className="clause-num">२. </span>
          कर्जदाता एतद्द्वारे घोषित करतात की, कर्जदाराने वरील कर्जाची रक्कम {safe(data.loanPurpose)} या उद्देशासाठी वापरण्यास त्यांची <strong>कोणतीही हरकत नाही</strong>। हे ना हरकत प्रमाणपत्र कर्जदाराने कोणत्याही बँक, वित्तीय संस्था, शासकीय प्राधिकरण किंवा इतर संबंधित पक्षांसमोर सादर करण्यासाठी जारी करण्यात येत आहे।
        </div>

        <div className="clause">
          <span className="clause-num">३. </span>
          कर्जदाता पुष्टी करतात की, ₹ {formatAmount(data.loanAmount)}/- ची वरील कर्जाची रक्कम दिनांक {formatMarathiDate(data.loanDate)} रोजी दोन्ही पक्षांच्या सहमतीनुसार कर्जदाराला विधिवत वितरित करण्यात आली आहे। कर्जदाता हे देखील पुष्टी करतात की, या प्रमाणपत्राच्या जारी करण्याच्या तारखेपर्यंत कर्जदाता आणि कर्जदार यांच्यात कोणताही वाद, प्रलंबित खटला किंवा थकीत दावा अस्तित्वात नाही।
        </div>

        <div className="clause">
          <span className="clause-num">४. </span>
          कर्जदाता एतद्द्वारे घोषित करतात की, कर्जदाराने कर्जाच्या रकमेचा उपयोग कसा केला यास ते कोणत्याही प्रकारे जबाबदार राहणार नाहीत। हे प्रमाणपत्र केवळ सर्वसाधारण ना हरकत घोषणा म्हणून जारी करण्यात येत आहे। कर्जदाराने कर्जाच्या रकमेच्या वापरातून निर्माण होणाऱ्या कोणत्याही आर्थिक व्यवहार, दायित्व किंवा जबाबदारीसाठी कर्जदारच स्वतः व्यक्तिशः उत्तरदायी राहील।
        </div>

        <div className="clause">
          <span className="clause-num">५. </span>
          कर्जदार बिनशर्त वचन देतात की ते सदर कर्जाची रक्कम कर्जदात्याला मान्य परतफेड वेळापत्रकानुसार परत करतील। या ना हरकत प्रमाणपत्राच्या निर्गमनामुळे कर्जदाराच्या परतफेडीच्या बंधनात कोणताही बदल, सवलत किंवा कपात होणार नाही, जे कर्जाच्या संपूर्ण निपटाऱ्यापर्यंत पूर्णपणे बंधनकारक व अंमलबजावणीयोग्य राहील।
        </div>

        <div className="clause">
          <span className="clause-num">६. </span>
          हे ना हरकत प्रमाणपत्र कर्जदात्याद्वारे केवळ वर नमूद केलेल्या कर्जदाराच्या हितासाठी सद्भावनेने जारी करण्यात येत आहे। हे कोणत्याही तृतीय पक्षाला हस्तांतरणीय किंवा नियुक्त करण्यायोग्य नाही, आणि याचा अर्थ कोणत्याही तृतीय पक्ष, बँक किंवा वित्तीय संस्थेप्रती कर्जदात्याची कोणत्याही प्रकारची हमी, जामीन, नुकसानभरपाई किंवा समर्थन असा घेता येणार नाही। हे प्रमाणपत्र जारी केल्याच्या तारखेपासून <strong>९० (नव्वद) दिवसांसाठी</strong> वैध राहील।
        </div>

        {/* ── SIGNATURES ── */}
        <div className="sig-section">
          <div className="sig-block">
            <div className="sig-label">कर्जदाराची स्वीकृती :-</div>
            <div className="sig-line" />
            <div>नाव : {borrowerName}</div>
            <div style={{ marginTop: '4px' }}>दिनांक : {formatMarathiDate(issueDate)}</div>
          </div>
          <div className="sig-block" style={{ textAlign: 'center' }}>
            <div className="noc-stamp-box">कार्यालयीन शिक्का व मुद्रा</div>
          </div>
          <div className="sig-block" style={{ textAlign: 'right' }}>
            <div className="sig-label">अधिकृत स्वाक्षरीकर्ता (कर्जदाता) :-</div>
            <div className="sig-line" />
            <div>(M H Vicky / Vikrant Rana)</div>
            <div>मालक व लेखा / प्रशासन प्रमुख</div>
            <div style={{ fontWeight: '700' }}>{lenderDisplay}</div>
            <div>दिनांक : {formatMarathiDate(issueDate)}</div>
          </div>
        </div>

        {/* ── WITNESSES ── */}
        <div style={{ marginTop: '16px', fontSize: '12.5px' }}>
          <strong>साक्षीदार :-</strong>
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

export default MarathiGeneralLoanNOC;