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
  property: PropertyData;
  company: CompanyData;
  manager?: ManagerData;

  transferNote?: string;
}

interface TemplateProps {
  data: AgreementData;
  language: 'hi' | 'en' | 'mr' | 'hindi' | 'english' | 'marathi';
  type: 'agreement' | 'token';
  onClose: () => void;
  companyLogo?: string;
  companyWatermark?: string;
}

const EnglishTokan = ({ data, companyLogo, companyWatermark }: TemplateProps) => {

// 🔥 SAFE NUMERIC CALCULATIONS

  return (
    <div id="printable-document" className="flex flex-col items-center">
      <style>{`
        .a4-page {
          width: 210mm;
          min-height: 297mm;
          margin: 0 auto;
          background: white;
          padding: 12mm 15mm;
          box-sizing: border-box;
          page-break-after: always;
          box-shadow: 0 0 10px rgba(0,0,0,0.1);
          font-family: 'Noto Sans Devanagari', 'Mangal', sans-serif;
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
         .gradient-text {
          color: #D9001B; /* fallback for print */
        }

        @media screen {
         .gradient-text {
         background: linear-gradient(180deg, #FF3A3A 0%, #FF1E2D 60%, #D9001B 100%);
         -webkit-background-clip: text;
         -webkit-text-fill-color: transparent;
       }
      }

        .header-box {
          border: 2.5px solid #000;
          padding: 8px 12px;
          margin-bottom: 6px;
        }
        .company-name {
          font-size: 22px;
          font-weight: 900;
          letter-spacing: 1px;
          color: #000;
          font-style: italic;
        }
        .reg-line {
          font-size: 11px;
          font-weight: 700;
          color: #000;
        }
        .since-line {
          font-size: 11px;
          font-weight: 700;
          color: #000;
        }
        .address-line {
          font-size: 10.5px;
          font-weight: 600;
          color: #000;
          margin-top: 4px;
        }
        .doc-title {
          text-align: center;
          font-weight: 800;
          text-decoration: underline;
          letter-spacing: 0.5px;
        }
        .token-number {
          font-size: 12px;
          font-weight: 700;
          margin-bottom: 8px;
          display: flex;
          justify-content: space-between;
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
          font-size: 12.5px;
          line-height: 1.75;
          text-align: justify;
          margin-bottom: 7px;
        }
        .clause-num {
          font-weight: 700;
        }
        .payment-table {
          width: 100%;
          font-size: 12px;
          margin-top: 4px;
        }
        .payment-row {
          display: flex;
          align-items: flex-end;
          gap: 6px;
          margin-bottom: 4px;
        }
        .payment-label {
          font-weight: 700;
          white-space: nowrap;
          font-size: 12.5px;
          min-width: 28px;
        }
        .payment-field {
          display: flex;
          align-items: flex-end;
          gap: 3px;
          flex: 1;
        }
        .payment-field-label {
          font-weight: 600;
          white-space: nowrap;
          font-size: 12px;
        }
        .payment-field-value {
          border-bottom: 1px solid #000;
          flex: 1;
          min-height: 16px;
          min-width: 50px;
          display: flex;
          align-items: center;
          justify-content: center;
          text-align: center;
        font-size: 12px;      /* ↓ reduced from default */
  font-weight: 500;     /* keeps readability */
  letter-spacing: 0.3px;
}
        .sig-section {
          display: flex;
          justify-content: space-between;
          margin-top: 10px;
          gap: 20px;
        }
        .sig-block {
          flex: 1;
          font-size: 12.5px;
        }
        .sig-line {
          border-bottom: 1px solid #000;
          min-height: 40px;
          margin: 6px 0;
        }
        .sig-label {
          font-weight: 700;
          font-size: 12.5px;
        }
        .witness-row {
          display: flex;
          gap: 20px;
          margin-top: 8px;
          font-size: 12.5px;
        }
        .divider {
          text-align: center;
          font-weight: 700;
          font-size: 12px;
          margin: 6px 0;
        }
        .end-text {
          text-align: center;
          font-weight: 700;
          font-size: 14px;
          margin-top: 12px;
          letter-spacing: 2px;
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
        .doc-title-secondary {
         font-size: 15px;
         margin-top: 6px;
         margin-bottom: 14px;
         text-align: center;
         font-weight: 800;
         letter-spacing: 0.6px;
        }


.a4-gap {
  height: 40px; /* visual gap on screen */
}

@media print {
  .a4-gap {
    display: none;
  }

  .a4-page {
    page-break-after: always;
  }

  .a4-page:last-child {
    page-break-after: auto;
  }
}
        @media print {
           * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
           }
         }
      `}</style>

      <div style={{ fontFamily: "'Noto Sans Devanagari', 'Mangal', sans-serif" }}>
  </div>

        {/* ── PAGE 1 ─────────────────────────────────────────────── */}
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
    alignItems: "flex-end",   // 🔥 push down
    justifyContent: "center",
    paddingBottom: "170px",   // 🔥 fine control

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

  {/* TITLE */}
<div className="mt-10 flex items-center justify-center relative">

  {/* CENTER TITLE */}
  <div className="text-center font-serif text-[19px] font-bold tracking-[1.5px] uppercase text-indigo-600 underline underline-offset-4">
    Token / Advance Receipt
  </div>

  {/* RIGHT DATE (ABSOLUTE — PERFECT ALIGNMENT) */}
  <div className="absolute right-0 text-[12px] font-semibold">
    <span className="font-bold mr-1">Date:</span>
    <span>{data.property.bookingDate}</span>
  </div>
</div>

  {/* TOKEN LINE */}
<div className="mt-6 bg-yellow-200 border border-yellow-300 text-[12.5px] font-semibold px-1 py-1 text-center">

  <div className="font-mono leading-tight break-words inline-block text-center max-w-full">
    {`${data.client.folderSerial || ''}-${data.client.clientId || ''}-P${data?.property?.plotNumber || ''}-${data?.property?.projectName || ''}-${data?.property?.khasraNumber || data?.property?.surveyNumber || ''}-${data?.property?.locality || ''}-${data?.property?.district || ''}-${data?.property?.state || ''}-${data?.property?.pincode || ''}`}
  </div>
</div>

          <div className="mt-4 grid grid-cols-[2fr_1fr_2fr] items-end gap-x-6 text-[12px]">

  {/* Name */}
  <div className="flex items-end">
    <span className="font-semibold whitespace-nowrap">1. Name:-</span>
    <span className="ml-2 border-b border-black flex-1 text-center leading-tight">
      {data.client.name}
    </span>
  </div>

  {/* Age */}
  <div className="flex items-end">
    <span className="font-semibold whitespace-nowrap">2. Age:-</span>
    <span className="ml-2 border-b border-black w-full text-center">
      {data.client.age}
    </span>
    <span className="ml-1 whitespace-nowrap">Yrs</span>
  </div>

  {/* Occupation */}
  <div className="flex items-end">
    <span className="font-semibold whitespace-nowrap">3. Occupation:-</span>
    <span className="ml-2 border-b border-black flex-1 text-center">
      {data.client.occupation}
    </span>
  </div>

</div>

            {/* Address */}
           <div className="field-row items-start">
  <span className="field-label">4. Address:-</span>

  <div className="flex-1">
    <div className="field-value-wide leading-[1.6] break-words">
      {[
        data.client.address,
        data.client.locality,
        data.client.district,
        data.client.state
      ]
        .filter(Boolean)
        .join(', ')}
      {data.client.pincode ? ` - ${data.client.pincode}` : ''}
	          </div>
	        </div>
		        </div>

            <div className="mt-3 flex items-center justify-between text-[13px] gap-6">

  {/* Aadhaar */}
{/* Aadhaar */}
<div className="flex items-center flex-[1.8] min-w-0">
  <span className="font-semibold whitespace-nowrap">5. Aadhaar No.:-</span>

  <span className="ml-2 border-b border-black px-2 flex-1 text-center whitespace-nowrap overflow-hidden">
    {data.client.aadhaar || ''}
  </span>
</div>

  {/* PAN */}
  <div className="flex items-center flex-1">
    <span className="font-semibold whitespace-nowrap">6. PAN No.:-</span>
    <span className="ml-2 border-b border-black px-2 w-full text-center uppercase tracking-wide">
      {data.client.pan || ''}
    </span>
  </div>

  {/* Contact */}
  <div className="flex items-center flex-1">
    <span className="font-semibold whitespace-nowrap">7. Contact No.:-</span>
    <span className="ml-2 border-b border-black px-2 w-full text-center tracking-wide">
      {data.client.phone || ''}
    </span>
  </div>

</div>

         {/* Clause 8 */}
          <div className="clause">
            <span className="clause-num">8.</span> That I, the above-mentioned and undersigned person, in full possession of my senses, am entering into this Token/Advance Receipt/Sale Agreement with <strong>Ashray Group</strong> for their &ldquo;<strong>{data.property?.projectName}</strong>&rdquo; project, whose Khasra Number is:- <span className="underline-blank">{data.property?.khasraNumber || data.property?.surveyNumber}</span>,&nbsp;
             Mouza:- <span className="underline-blank">{data.property?.locality}</span>,&nbsp;
             Tehsil:- <span className="underline-blank">{data.property?.tehsil}</span>, District:- <span className="underline-blank">{data.property?.district}</span>, for Plot Number:- <span className="underline-blank">{data.property?.plotNumber}</span>/-(
            <span className="underline-blank">{data.property?.plotNumber}</span> only) which is <span className="underline-blank">{data.property?.area}</span>/-(
            <span className="underline-blank">{data.property?.area}</span> only) square feet, of my own complete free will and happiness.
          </div>

          {/* Clause 9 */}
          <div className="clause">
            <span className="clause-num">9.</span> That I have decided to purchase the above plot at the rate of <span className="underline-blank">{data.property.rate}</span>/-(
            <span className="underline-blank">{data.property.rate}</span> only) rupees per square foot, the total price of which is&nbsp;
            <span className="underline-blank">{data.property.tokenAmount}</span>/-(
            <span className="underline-blank">{data.property.tokenAmount}</span> only) rupees, and after paying the advance amount to Ashray Group, I will pay the remaining balance in 36/-(thirty-six only) easy monthly installments.
          </div>

          {/* Clause 10 */}
          <div className="clause">
            <span className="clause-num">10.</span>That today I have paid Ashray Group via <strong>{data.property.paymentMode}</strong> (Slip No.: <strong>{data.property.paymentMode !== 'Cash' ? (data.property.paymentReference || '___________') : '___________'}</strong>) as a Token/Advance Receipt/Sale Agreement for the above plot, an amount of&nbsp;
            <span className="underline-blank">{data.property.tokenAmount}</span>/-(
            <span className="underline-blank">{data.property.tokenAmount}</span> only) rupees. After this Token/Advance Receipt/Sale Agreement is completed, all payments made on the basis of this Token/Advance Receipt/Sale Agreement but before the Stamp Paper Sale Agreement shall be recorded on this Token/Advance Receipt/Sale Agreement itself. If I complete the Stamp Paper Sale Agreement for the above plot and continue the deal further, then the entire deposited amount recorded on this Token/Advance Receipt/Sale Agreement letter shall be added to the calculation of the total amount of the plot. And if I do not continue the deal further, then this entire amount shall not be refunded in any form — this amount has been mutually determined by both parties as actual loss, and shall not be considered a penalty in any form. I am fully aware of and agree to this condition.
          </div>

          {/* Clause 11 */}
          <div className="clause">
            <span className="clause-num">11.</span> That this Token/Advance Receipt/Sale Agreement is valid for only <strong>07/-(seven)</strong> days. On the 08th/-(eighth) day, Ashray Group is completely free to make a deal for the above plot with any other person, and I do not hold the right to interfere in any manner. If I interfere, 
	          </div>
		          </div>
        <PrintFooter />
		        </div>

		         {/* GAP BETWEEN PAGES */}
<div className="a4-gap" />

        {/* ── PAGE 2 ─────────────────────────────────────────────── */}
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
    alignItems: "center",
    justifyContent: "center",

    opacity: 0.08,        // 🔥 increased from 0.05
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

          {/* Page 2 divider */}
          <div className="divider">. . . 2 . . .</div>
           <div className="doc-title doc-title-secondary">
              Token / Advance Receipt
           </div>
           <div className="clause" style={{ marginTop: '8px' }}>
           <span className="clause-num"></span>I shall be liable for punishment under the Indian Constitution's penal provisions for the offence of violating this Token/Advance Receipt/Sale Agreement. However, if I do not make the Stamp Paper Sale Agreement and instead wish to proceed with payments in installments on the basis of this Token/Advance Receipt/Sale Agreement itself and get the registered document made directly in my name, or if I wish to make the Stamp Paper Sale Agreement at my own time as per my wish, then this 07/-(seven) day condition does not apply. But in that case, this Token/Advance Receipt/Sale Agreement itself shall be the main basis of the deal between both parties.
           </div>
           {/* Clause 12 */}
          <div className="clause" style={{ marginTop: '8px' }}>
            <span className="clause-num"></span>The time limit of this Token/Advance Receipt/Sale Agreement depends on the payments made by me every month, which shall not be less than one thirty-sixth of the total price of the above plot. Therefore, it is mandatory for me to pay one thirty-sixth of the total price of the above plot every month, and the details of all payments made shall be recorded on this Token/Advance Receipt/Sale Agreement itself. If space is insufficient, the next page shall be added, which shall be signed by both parties. In case of any delay, procrastination or default in payment by me, the condition of Clause No.-10 shall automatically apply in full. I am fully aware of this condition and also agree to it.
          </div>

          {/* Clause 12 */}
          <div className="clause" style={{ marginTop: '8px' }}>
            <span className="clause-num">12.</span> That this Token/Advance Receipt/Sale Agreement itself is the complete understanding between both parties. Apart from this, any oral, written, lawyer's notice or electronic communication shall not be effective on this Token/Advance Receipt in any form, and any amendment herein shall be valid only in written form with the signatures of both parties. However, if I make a Stamp Paper Sale Agreement, a processing resource fee of Rs. 2000/-(two thousand only) per plot shall be paid separately, for which no receipt shall be given, nor shall this amount be added to the calculation of the total amount of the plot.
          </div>

          {/* Clause 13 */}
          <div className="clause">
            <span className="clause-num">13.</span> That I have read and understood all the above rules and conditions of this Token/Advance Receipt/Sale Agreement well, and I am completely in agreement and satisfied. And I declare that I have not consumed any kind of intoxicant, nor am I under any force, pressure, inducement, misunderstanding or fraud. I have signed this Token/Advance Receipt/Sale Agreement in complete sound mind, after due thought and deliberation, keeping in mind the future of myself and my family for the purpose of benefit. I shall refrain from raising any objection regarding any condition in the future.
          </div>

          {/* Clause 14 — Payment table */}
          <div style={{ marginBottom: '8px' }}>
            <div style={{ fontWeight: '700', fontSize: '13px', marginBottom: '6px' }}>
              14. Details of installment payments made towards completing the advance payment on the basis of Token/Advance Receipt:-
            </div>

            {['A', 'B', 'C', 'D', 'E'].map((letter, idx) => (
  <div key={idx} className="payment-row">

    <span className="payment-label">({letter})</span>

    {/* Amount */}
    <div className="payment-field">
      <span className="payment-field-label">Amount:-</span>
      <span className="payment-field-value">
        {idx === 0 ? data.property.tokenAmount : ''}
      </span>
    </div>

    {/* Mode */}
    <div className="payment-field" style={{ marginLeft: '6px' }}>
      <span className="payment-field-label">Mode:-</span>
      <span className="payment-field-value">
        {idx === 0 ? (data.property.paymentMode || '') : ''}
      </span>
    </div>

    {/* Reference */}
    <div className="payment-field" style={{ marginLeft: '6px' }}>
      <span className="payment-field-label">Ref No.:-</span>
      <span className="payment-field-value">
        {idx === 0 ? (data.property.paymentMode !== 'Cash' ? data.property.paymentReference : '') : ''}
      </span>
    </div>
  </div>
))}


          </div>
        </div>
        <PrintFooter />
        </div>

{/* GAP BETWEEN PAGES */}
<div className="a4-gap" />

        {/* ── PAGE 3 ─────────────────────────────────────────────── */}
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
    alignItems: "center",
    justifyContent: "center",

    opacity: 0.08,        // 🔥 increased from 0.05
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

          {/* Page 2 divider */}
          <div className="divider"></div>

          {/* Signatures */}
          <div className="sig-section">

            {/* Buyer signature */}
            <div className="sig-block">
              <div className="sig-label">15. Name, Signature and Left Thumb Impression of the Buyer :-</div>
              <div style={{ marginTop: '6px', fontSize: '12.5px' }}>
                <div className="field-row" style={{ marginBottom: '4px' }}>
                  <span className="field-label">Name:-</span>
                  <span className="field-value">{[data.client.title, data.client.name].filter(Boolean).join(' ')}</span>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '20px', marginTop: '20px' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '12px', fontWeight: '700' }}>Signature:-</div>
                  <div className="sig-line" />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '12px', fontWeight: '700' }}>Left Thumb Impression:-</div>
                  <div className="sig-line" />
                </div>
              </div>
            </div>

          </div>

          {/* Seller signature */}
          <div style={{ marginTop: '14px', fontSize: '12.5px' }}>
            <div className="sig-label">16. Name, Signature and Left Thumb Impression of the Seller :-</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px' }}>
              <div>
                {/* LEFT SIDE — PLACE & DATE (IMPROVED LEGAL FORMAT) */}
<div className="text-[12.5px] leading-tight">

  <div className="flex items-center gap-2">
    <span className="font-semibold whitespace-nowrap">Station :-</span>
    <span className="border-b border-black min-w-[180px] inline-block">
          {`${data.company.companyLocality || ''}${data.company.companyDistrict ? `, ${data.company.companyDistrict}` : ''}`}
    </span>
  </div>

  <div className="flex items-center gap-2 mt-3">
    <span className="font-semibold whitespace-nowrap">Dated :-</span>
    <span className="border-b border-black min-w-[150px] inline-block">
      {(new Date(data?.property?.bookingDate || '').getDate())}/
      {(new Date(data?.property?.bookingDate || '').getMonth() + 1)}/
      {(new Date(data?.property?.bookingDate || '').getFullYear())}
    </span>
  </div>

</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ minHeight: '40px' }} />
                <div style={{ fontWeight: '700', fontSize: '12.5px' }}>Owner / Manager</div>
                <div style={{ fontWeight: '700', fontSize: '12.5px' }}>{data.company.companyName || ''} ({data.company.entityType}</div>
              </div>
            </div>
          </div>

          {/* Witnesses */}
          <div style={{ marginTop: '12px', fontSize: '12.5px' }}>
            <span style={{ fontWeight: '700' }}>17. Witnesses:- </span>
            <span style={{ marginLeft: '6px' }}>
              (A) <span className="underline-blank" style={{ minWidth: '120px' }} />&nbsp;&nbsp;&nbsp;
              (B) <span className="underline-blank" style={{ minWidth: '120px' }} />
            </span>
          </div>

          {/* End */}
          <div style={{ marginTop: 'auto', paddingTop: '50px' }}>
            <div className="end-text">* * * END * * *</div>
          </div>
        </div>
        <PrintFooter />
      </div>
    </div>

  );
};

export default EnglishTokan;
