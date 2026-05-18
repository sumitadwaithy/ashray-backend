import React from 'react';
import { PrintFooter } from '../../../../components/Printpreview';

// =========================
// CLIENT (BUYER)
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

  nominee1Title?: string;
  nominee1Name?: string;
  nominee1Age?: string;
  nominee1Occupation?: string;
  nominee1Aadhaar?: string;

  nominee2Title?: string;
  nominee2Name?: string;
  nominee2Age?: string;
  nominee2Occupation?: string;
  nominee2Aadhaar?: string;

  folderName?: string;
  folderSerial?: string;
  tokenSerial?: string;
  clientId?: string;
}

// =========================
// PROPERTY (PROJECT + PLOT)
// =========================
interface PropertyData {
  projectName?: string;
  locality?: string;
  tehsil?: string;
  district?: string;
  state?: string;
  pincode?: string;

  khasraNumber?: string;
  surveyNumber?: string;
  registrationNumber?: string;
  layoutApprovalNumber?: string;
  reraNumber?: string;

  plotNumber?: string;
  area?: string;
  plotStatus?: string;

  rate?: string | number;
  totalAmount?: string | number;

  tokenAmount?: number | string;
  paymentReference?: string;
  bookingDate?: string;
  bookingDay?: {
    en: string;
    hi: string;
    mr: string;
  };

  paymentMode?: string;
  emiDuration?: number;
  emiAmount?: number;
  remainingAmount?: number;
}

// =========================
// COMPANY (SELLER)
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
  property: PropertyData;
  company: CompanyData;
  manager?: ManagerData;

  nocSerial?: string;
  nocDate?: string;
  transferNote?: string;
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
  .doc-title {
    text-align: center;
    font-weight: 800;
    text-decoration: underline;
    letter-spacing: 0.5px;
  }
  .field-row {
    display: flex;
    align-items: flex-end;
    margin-bottom: 5px;
    font-size: 13px;
    flex-wrap: wrap;
    gap: 4px;
  }
  .field-label {
    font-weight: 700;
    white-space: nowrap;
    font-size: 13px;
  }
  .field-value {
    border-bottom: 1px solid #000;
    min-width: 80px;
    flex: 1;
    min-height: 18px;
    font-size: 13px;
    padding: 0 2px;
  }
  .field-value-wide {
    border-bottom: 1px solid #000;
    width: 100%;
    min-height: 18px;
    font-size: 13px;
    padding: 0 2px;
    margin-top: 2px;
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
  .property-table {
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 14px;
    font-size: 12.5px;
  }
  .property-table td {
    padding: 4px 8px;
    border-bottom: 1px solid #ddd;
  }
  .property-table td:first-child {
    font-weight: 700;
    width: 42%;
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
  .a4-gap {
    height: 40px;
  }
  .notice-box {
    border: 1.5px solid #c0392b;
    border-left: 4px solid #c0392b;
    background: #fff8f7;
    padding: 8px 12px;
    margin: 10px 0 6px 0;
    font-size: 12.5px;
    line-height: 1.7;
  }
  .notice-box-title {
    font-weight: 800;
    color: #c0392b;
    font-size: 12px;
    letter-spacing: 0.5px;
    margin-bottom: 4px;
    text-transform: uppercase;
  }
  @media print {
    .a4-gap { display: none; }
  }
`;

// ─── Helper ──────────────────────────────────────────────────────────────────

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

export const EnglishPreSaleNOC: React.FC<{ data: AgreementData }> = ({ data }) => {
  const clientName = [data.client.title, data.client.name].filter(Boolean).join(' ');
  const companyDisplay = `${data.company.companyName || ''} (${data.company.entityType || ''})`;
  const issueDate = data.nocDate || data.property.bookingDate;
  const plotArea = safe(data.property.area);

  return (
    <div id="printable-document" className="flex flex-col items-center">
      <style>{sharedStyles}</style>
      <div className="a4-page">

        {/* HEADER */}
        <div className="header-box">

          {/* Top Row */}
          <div className="flex justify-between text-sm font-bold mb-2">
            <div>Reg No : {data.company?.licenseRegistrationNumber}</div>
            <div>Since : 2019</div>
          </div>

          {/* Center Branding */}
          <div className="flex flex-col items-center text-center">

            <div className="text-red-600 text-[48px] font-extrabold tracking-wide font-serif leading-tight">
              {data.company.companyName}
            </div>

            <div className="text-sm font-semibold mt-2">
              Mob: +91 {data.manager?.managerPhone} &nbsp;|&nbsp; Mail: {data.company?.companyEmail} &nbsp;|&nbsp; Website: {data.company?.companyWebsite}
            </div>

            <div className="text-sm mt-1">
              {[data.company.companyAddress, data.company.companyLocality, data.company.companyDistrict, data.company.companyState].filter(Boolean).join(', ')}{data.company.companyPincode ? ` - ${data.company.companyPincode}` : ''}.
            </div>

          </div>
        </div>

        {/* TITLE */}
        <div className="mt-10 text-center font-serif text-[19px] font-bold tracking-[1.5px] uppercase text-indigo-600 underline underline-offset-4">
          No Objection Certificate/PROVISIONAL
        </div>
        <div className="text-center text-[13px] font-semibold mt-1 mb-6 text-gray-600">
          (Pre-Sale — Prior to Execution of Sale Deed)
        </div>

        {/* TOKEN LINE */}
        <div className="mt-6 px-3 py-2 bg-yellow-200 border border-yellow-300 flex justify-between items-center text-[12px] font-semibold">

          {/* LEFT: DOC NUMBER */}
          <div className="flex-1 pr-4 whitespace-nowrap font-mono">
            {`${data.client.folderSerial || ''}-${data.client.clientId || ''}-P${data?.property?.plotNumber || ''}-${data?.property?.projectName || ''}-${data?.property?.khasraNumber || data?.property?.surveyNumber || ''}-${data?.property?.locality || ''}-${data?.property?.district || ''}-${data?.property?.state || ''}-${data?.property?.pincode || ''}`}
          </div>

          {/* RIGHT: DATE */}
          <div className="whitespace-nowrap text-right">
            <span className="font-bold mr-1">Date:</span>
            <span>{data.property.bookingDate}</span>
          </div>

        </div>

        {/* SUBJECT LINE */}
        <div className="clause" style={{ marginBottom: '14px' }}>
          <strong>Subject:</strong> No Objection Certificate for the Purchase and Registration of Plot No. <span className="underline-blank">{safe(data.property.plotNumber)}</span> in the <span className="underline-blank">{safe(data.property.projectName)}</span> Project, Mouza <span className="underline-blank">{safe(data.property.locality)}</span>, Tehsil <span className="underline-blank">{safe(data.property.tehsil)}</span>, District <span className="underline-blank">{safe(data.property.district)}</span>.
        </div>

        {/* TO LINE */}
        <div className="clause" style={{ marginBottom: '14px' }}>
          <strong>To,</strong><br />
          {clientName},<br />
          Age: {safe(data.client.age)} Years, Aadhaar No.: {safe(data.client.aadhaar)}, PAN: {safe(data.client.pan)},<br />
          Address: {[data.client.address, data.client.locality, data.client.district, data.client.state].filter(Boolean).join(', ')}{data.client.pincode ? ` - ${data.client.pincode}` : ''}.
        </div>

        {/* PROPERTY TABLE */}
        <table className="property-table">
          <tbody>
            <tr><td>Project Name</td><td>{safe(data.property.projectName)}</td></tr>
            <tr><td>Plot Number</td><td>{safe(data.property.plotNumber)}</td></tr>
            <tr><td>Area</td><td>{safe(data.property.area)} Sq. Ft.</td></tr>
            <tr><td>Mouza / Locality</td><td>{safe(data.property.locality)}</td></tr>
            <tr><td>Tehsil</td><td>{safe(data.property.tehsil)}</td></tr>
            <tr><td>District</td><td>{safe(data.property.district)}</td></tr>
            <tr><td>Khasra / Survey No.</td><td>{safe(data.property.khasraNumber || data.property.surveyNumber)}</td></tr>
            <tr><td>Agreed Sale Consideration</td><td>₹ {formatAmount(data.property.totalAmount)} /- Only</td></tr>
            <tr><td>Token / Advance Paid</td><td>₹ {formatAmount(data.property.tokenAmount)} /- Only</td></tr>
            <tr><td>Booking Date</td><td>{formatDate(data.property.bookingDate)}</td></tr>
          </tbody>
        </table>

        {/* ── CLAUSES ── */}

        <div className="clause">
          <span className="clause-num">1. </span>
          This is to certify that {companyDisplay}, the owner and developer of the above-described property, hereby grants this No Objection Certificate in favour of <strong>{clientName}</strong> for the purchase, registration, and all lawful dealings in respect of Plot No. {safe(data.property.plotNumber)}, measuring {plotArea} Sq. Ft., situated in the <strong>{safe(data.property.projectName)}</strong> project, Mouza {safe(data.property.locality)}, Tehsil {safe(data.property.tehsil)}, District {safe(data.property.district)}.
        </div>

        <div className="clause">
          <span className="clause-num">2. </span>
          {companyDisplay} hereby declares and confirms that the above-mentioned property is <strong>free from all encumbrances, charges, liens, mortgages, disputes, litigations, attachments</strong>, and any other legal or financial obligations as on the date of issuance of this certificate. No third party holds any prior claim, right, or interest over the said property.
        </div>

        <div className="clause">
          <span className="clause-num">3. </span>
          {companyDisplay} further declares that the said plot has not been previously sold, transferred, gifted, mortgaged, or assigned to any other person or entity, and that {companyDisplay} holds the lawful, clear, and marketable title to the said property with full authority to sell and transfer the same.
        </div>

        <div className="clause">
          <span className="clause-num">4. </span>
          {companyDisplay} has <strong>no objection</strong> to {clientName} proceeding with the execution of the Sale Deed, registration of the property in their name before the concerned Sub-Registrar, and carrying out any construction, development, or any other lawful activity on the said plot after due registration.
        </div>

        <div className="clause">
          <span className="clause-num">5. </span>
          {companyDisplay} undertakes that in the event of any legal dispute, claim, or encumbrance arising on the said property from any third party subsequent to the issuance of this certificate, {companyDisplay} shall be solely responsible and shall indemnify {clientName} against all losses, costs, and damages arising therefrom.
        </div>

        <div className="clause">
          <span className="clause-num">6. </span>
          This No Objection Certificate is issued in good faith on the basis of the Sale Agreement / Token Receipt executed between both parties on {formatDate(data.property.bookingDate)}, and shall remain valid until the execution and registration of the Sale Deed between the parties. This certificate is binding upon {companyDisplay}, its successors, heirs, and legal representatives.
        </div>

        {/* ── NEW CLAUSES (7–11) ── */}

        {/* Notice/Info box header for new conditions */}
        <div className="notice-box" style={{ marginTop: '14px' }}>
          <div className="notice-box-title">⚠ Important Conditions &amp; Pending Obligations</div>
          <div style={{ fontSize: '12px', color: '#555' }}>
            The following clauses (7–11) set out conditions, obligations, and charges applicable to {clientName} with respect to Plot No. {safe(data.property.plotNumber)}. These conditions form an integral part of this Provisional NOC and are binding upon the purchaser.
          </div>
        </div>

        <div className="clause">
          <span className="clause-num">7. </span>
          With reference to the above subject, {companyDisplay} wishes to inform <strong>{clientName}</strong> that this office has <strong>no objection</strong> to the subject matter as stated herein. The payment for the above-mentioned plot has been duly received. As per the records of this office, there is nothing adverse on record against the said individual in relation to the subject plot at this time; however, the same shall be <strong>re-verified against the Agreement and Payment Slips</strong>, and accordingly, the <strong>Final NOC</strong> shall be issued separately upon completion of such verification.
        </div>

        <div className="clause">
          <span className="clause-num">8. </span>
          If <strong>{clientName}</strong> desires to take possession of the subject plot, they are hereby required to first <strong>inform this office in writing</strong> and submit a formal application along with a Possession Letter Fee of <strong>₹ 2,000/- (Rupees Two Thousand Only)</strong>. Possession shall be granted only after the issuance of the <strong>Final NOC</strong>. No possession shall be considered valid prior to receipt of the Final NOC from this office.
        </div>

        <div className="clause">
          <span className="clause-num">9. </span>
          In the event that <strong>{clientName}</strong> intends to sell, transfer, or otherwise dispose of the subject plot to any third party, they must <strong>first notify this office and obtain prior written permission</strong> from {companyDisplay} before initiating or executing any such sale or transfer. Such permission shall be granted only after the issuance of the <strong>Final NOC</strong>. Any sale or transfer effected without such prior written permission shall be treated as null and void.
        </div>

        <div className="clause">
          <span className="clause-num">10. </span>
          In case of any transfer of the subject plot to a person <strong>other than a blood relation</strong>, a <strong>Transfer Charge</strong> shall be applicable. The minimum transfer charge is <strong>₹ 20,000/- (Rupees Twenty Thousand Only)</strong>, and the maximum shall be <strong>10% (Ten Percent) of the prevailing market rate</strong> of the plot at the time of such transfer request. The applicable transfer charge shall be determined by {companyDisplay} at the time the transfer application is submitted, and must be paid in full before any transfer is processed. This condition is applicable only after the issuance of the <strong>Final NOC</strong>.
        </div>

        <div className="clause">
          <span className="clause-num">11. </span>
          The <strong>Layout Development Charge</strong> for the subject Plot No. {safe(data.property.plotNumber)}, measuring {plotArea} Sq. Ft., is <strong>₹ 20/- (Rupees Twenty Only) per Sq. Ft.</strong>, which remains <strong>pending and payable</strong> by {clientName}. You are hereby requested to clear this outstanding amount at the earliest. Please be advised that this charge is subject to escalation at the rate of <strong>₹ 3–5 per Sq. Ft. per quarter</strong> (i.e., approximately <strong>₹ 12–20 per Sq. Ft. per annum</strong>). The <strong>Final NOC</strong> for the subject plot shall be released by {companyDisplay} only upon full and complete payment of the Layout Development Charge outstanding at the time of such payment.
        </div>

        {/* SIGNATURES */}
        <div className="sig-section">
          <div className="sig-block">
            <div className="sig-label">Purchaser's Acknowledgement :-</div>
            <div className="sig-line" />
            <div>Name: {clientName}</div>
            <div style={{ marginTop: '4px' }}>Date: {formatDate(issueDate)}</div>
          </div>
          <div className="sig-block" style={{ textAlign: 'center' }}>
            <div className="noc-stamp-box">Office Seal &amp; Stamp</div>
          </div>
          <div className="sig-block" style={{ textAlign: 'right' }}>
            <div className="sig-label">Authorised Signatory :-</div>
            <div className="sig-line" />
            <div>(M H Vicky / Vikrant Rana)</div>
            <div>Owner &amp; Accounts / Admin Head</div>
            <div style={{ fontWeight: '700' }}>{companyDisplay}</div>
            <div>Date: {formatDate(issueDate)}</div>
          </div>
        </div>

        {/* WITNESSES */}
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

        <PrintFooter />
      </div>
    </div>
  );
};

export default EnglishPreSaleNOC;