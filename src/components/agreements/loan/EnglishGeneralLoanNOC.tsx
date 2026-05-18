import React from 'react';
import { PrintFooter } from '../../../../components/Printpreview';

// =========================
// CLIENT (BORROWER)
// =========================
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

// =========================
// COMPANY (LENDER)
// =========================
interface CompanyData {
  companyName?: string;
  entityType?: string;
  companyPan?: string;
  companyEmail?: string;
  companyWebsite?: string;
  
  licenseRegistrationNumber?: string;
  urcNumber?: string;

  managerPosition?: string;
  managerAddress?: string;
  managerPAN?: string;
  managerAadhaar?: string;
  managerPhone?: string;
  managerCountryCode?: string;

  // ✅ OFFICE ADDRESS
  companyAddress?: string;
  companyLocality?: string;
  companyDistrict?: string;
  companyState?: string;
  companyPincode?: string;
}

// =========================
// MANAGER (SELLER PERSON)
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
  client: ClientData;
  company: CompanyData;
  manager?: ManagerData;

  nocSerial?: string;
  nocDate?: string;

  // Loan-specific fields
  loanAmount?: string | number;
  loanDuration?: string;       // e.g. "12 months" or "2 years"
  loanDate?: string;           // date loan was disbursed
  loanPurpose?: string;        // e.g. "personal/medical/educational/business"
  repaymentMode?: string;      // e.g. "EMI / lump sum"
  interestRate?: string;       // e.g. "0% / 12% p.a."
  companyLogo?: string;
  companyWatermark?: string;
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
    font-family: 'Times New Roman', 'Georgia', serif;
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
    line-height: 1.85;
    text-align: justify;
    margin-bottom: 9px;
  }
  .clause-num {
    font-weight: 800;
  }
  .underline-blank {
    border-bottom: 1px solid #000;
    display: inline-flex;
    justify-content: center;
    align-items: center;
    min-width: 80px;
    min-height: 16px;
    text-align: center;
    padding: 0 4px;
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

const formatDate = (dateStr?: string) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr || '';
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

const safe = (v?: any) => (!v || v === '') ? '________' : String(v);

const formatAmount = (v?: string | number) => {
  if (!v) return '________';
  return Number(v).toLocaleString('en-IN');
};

// ═══════════════════════════════════════════════════════════════
// GENERAL LOAN NOC
// Issued BY Ashray Group AS the lender.
// Certifies that a private personal loan has been extended
// to the borrower, confirms loan terms, and declares
// no objection to the borrower's stated purpose of use.
// ═══════════════════════════════════════════════════════════════

const EnglishGeneralLoanNOC: React.FC<{ data: AgreementData }> = ({ data, companyLogo, companyWatermark }) => {
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
    paddingBottom: "1700px",   // 🔥 fine control

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
          <span>
            <strong>Date: </strong>{formatDate(issueDate)}
          </span>
        </div>

        {/* ── NOC SERIAL ── */}
        <div className="noc-serial" style={{ marginTop: '10px' }}>
          <span>NOC Ref. No.: {safe(data.nocSerial)}</span>
          <span>Date: {formatDate(issueDate)}</span>
        </div>

        {/* ── TITLE ── */}
        <div className="mt-6 text-center font-serif text-[19px] font-bold tracking-[1.5px] uppercase text-blue-700 underline underline-offset-4">
          No Objection Certificate
        </div>
        <div className="text-center text-[13px] font-semibold mt-1 mb-6 text-gray-600">
          (General Private Loan — Issued by Lender)
        </div>

        {/* ── SUBJECT LINE ── */}
        <div className="clause" style={{ marginBottom: '14px' }}>
          <strong>Subject:</strong> No Objection Certificate — General Private Loan of ₹ {formatAmount(data.loanAmount)}/- in favour of <strong>{borrowerName}</strong> for {safe(data.loanPurpose)} purpose.
        </div>

        {/* ── TO LINE ── */}
        <div className="clause" style={{ marginBottom: '14px' }}>
          <strong>To Whomsoever It May Concern,</strong><br /><br />
          This certificate is issued by <strong>{lenderDisplay}</strong> at the request of <strong>{borrowerName}</strong>,
          Age: {safe(data.client.age)} Years, Occupation: {safe(data.client.occupation)},
          Aadhaar No.: {safe(data.client.aadhaar)}, PAN: {safe(data.client.pan)},
          Address: {borrowerAddress}.
        </div>

        {/* ── LOAN DETAILS TABLE ── */}
        <table className="loan-table">
          <tbody>
            <tr><td>Borrower Name</td><td>{borrowerName}</td></tr>
            <tr><td>Aadhaar No.</td><td>{safe(data.client.aadhaar)}</td></tr>
            <tr><td>PAN No.</td><td>{safe(data.client.pan)}</td></tr>
            <tr><td>Occupation</td><td>{safe(data.client.occupation)}</td></tr>
            <tr><td>Borrower Address</td><td>{borrowerAddress}</td></tr>
            <tr><td>Lender Name</td><td>{lenderDisplay}</td></tr>
            <tr><td>Loan Amount</td><td>₹ {formatAmount(data.loanAmount)} /- Only</td></tr>
            <tr><td>Loan Purpose</td><td>{safe(data.loanPurpose)}</td></tr>
            <tr><td>Date of Disbursement</td><td>{formatDate(data.loanDate)}</td></tr>
            <tr><td>Loan Duration</td><td>{safe(data.loanDuration)}</td></tr>
            <tr><td>Repayment Mode</td><td>{safe(data.repaymentMode)}</td></tr>
            <tr><td>Rate of Interest</td><td>{safe(data.interestRate)}</td></tr>
            <tr><td>NOC Issue Date</td><td>{formatDate(issueDate)}</td></tr>
          </tbody>
        </table>

        {/* ── CLAUSES ── */}
        <div className="clause">
          <span className="clause-num">1. </span>
          This is to certify that <strong>{lenderDisplay}</strong>, hereinafter referred to as "the Lender", has extended a private personal loan of ₹ {formatAmount(data.loanAmount)}/- (Rupees {safe(data.loanAmount)} Only) to <strong>{borrowerName}</strong>, hereinafter referred to as "the Borrower", on {formatDate(data.loanDate)} for the purpose of {safe(data.loanPurpose)}, for a duration of {safe(data.loanDuration)}, repayable by {safe(data.repaymentMode)}.
        </div>

        <div className="clause">
          <span className="clause-num">2. </span>
          The Lender hereby declares that it has <strong>no objection</strong> to the Borrower utilising the above loan amount for the stated purpose of {safe(data.loanPurpose)}. This No Objection Certificate is issued to enable the Borrower to produce the same before any bank, financial institution, government authority, or any other concerned party as proof of the private loan arrangement, wherever required.
        </div>

        <div className="clause">
          <span className="clause-num">3. </span>
          The Lender confirms that the said loan of ₹ {formatAmount(data.loanAmount)}/- has been duly disbursed to the Borrower on {formatDate(data.loanDate)} as agreed between the parties. The Lender further confirms that there is no dispute, pending litigation, or claim outstanding between the Lender and the Borrower as on the date of issue of this certificate.
        </div>

        <div className="clause">
          <span className="clause-num">4. </span>
          The Lender hereby declares that it shall not be liable or responsible for how the Borrower utilises the loan amount, and that this NOC is issued solely as a general declaration of no objection. Any financial transactions, liabilities, or obligations arising out of the Borrower's use of the loan amount shall be the sole personal responsibility of the Borrower.
        </div>

        <div className="clause">
          <span className="clause-num">5. </span>
          The Borrower unconditionally undertakes to repay the said loan amount to the Lender as per the agreed repayment schedule. The issuance of this No Objection Certificate shall not in any manner alter, waive, or reduce the repayment obligation of the Borrower towards the Lender, which shall remain fully binding and enforceable until the loan is settled in full.
        </div>

        <div className="clause">
          <span className="clause-num">6. </span>
          This No Objection Certificate is issued by the Lender in good faith for the sole benefit of the Borrower named herein. It shall not be transferable or assignable to any third party, and shall not be construed as a guarantee, surety, indemnity, or endorsement of any kind by the Lender towards any third party, bank, or financial institution. This certificate is valid for a period of <strong>90 (Ninety) days</strong> from the date of issuance.
        </div>

        {/* ── SIGNATURES ── */}
        <div className="sig-section">
          <div className="sig-block">
            <div className="sig-label">Borrower's Acknowledgement :-</div>
            <div className="sig-line" />
            <div>Name: {borrowerName}</div>
            <div style={{ marginTop: '4px' }}>Date: {formatDate(issueDate)}</div>
          </div>
          <div className="sig-block" style={{ textAlign: 'center' }}>
            <div className="noc-stamp-box">Office Seal &amp; Stamp</div>
          </div>
          <div className="sig-block" style={{ textAlign: 'right' }}>
            <div className="sig-label">Authorised Signatory (Lender) :-</div>
            <div className="sig-line" />
            <div>(M H Vicky / Vikrant Rana)</div>
            <div>Owner &amp; Accounts / Admin Head</div>
            <div style={{ fontWeight: '700' }}>{lenderDisplay}</div>
            <div>Date: {formatDate(issueDate)}</div>
          </div>
        </div>

        {/* ── WITNESSES ── */}
        <div style={{ marginTop: '16px', fontSize: '12.5px' }}>
          <strong>Witnesses:-</strong>
          <div style={{ display: 'flex', gap: '40px', marginTop: '8px' }}>
            <div style={{ flex: 1 }}>
              (A) <span style={{ borderBottom: '1px solid #000', display: 'inline-block', minWidth: '160px' }} />
            </div>
            <div style={{ flex: 1 }}>
              (B) <span style={{ borderBottom: '1px solid #000', display: 'inline-block', minWidth: '160px' }} />
            </div>
          </div>
        </div>

        <div className="end-text">* * * END * * *</div>

        </div>
        <PrintFooter />
      </div>
    
  );
};

export default EnglishGeneralLoanNOC;