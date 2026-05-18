import React from 'react';
import { PrintFooter } from '../../../../components/Printpreview';

// =========================
// TYPES
// =========================

export interface SellerPerson {
  salutation?: string;    // Mr. / Mrs. / Smt. etc.
  name: string;
  age: string;
  occupation: string;
  aadhaar: string;
  pan: string;
  phone: string;
}

export interface BuyerData {
  salutation?: string;
  name: string;
  age: string;
  occupation: string;
  address: string;
  locality?: string;
  district?: string;
  state?: string;
  pincode?: string;
  aadhaar: string;
  pan: string;
  phone: string;
}

export interface LandData {
  landName: string;             // Property Name
  village: string;              // Mauza / Village name
  phHalkaNo: string;            // Patwar Halka No.
  khataNo: string;              // Account / Khata No.
  khasraNo: string;             // Khasra / Survey No.
  areaHectare: string;          // Area in Ha. Ar.
  akarni?: string;              // Uncultivated (Akaarni)
  tehsil: string;
  district: string;
  state: string;
  pincode: string;

  // Four boundaries
  eastKhasra: string;
  westKhasra: string;
  northKhasra: string;
  southKhasra: string;
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

export type PaymentMode = 'Cash' | 'Cheque' | 'UPI' | 'NEFT' | 'RTGS' | 'Other';

export interface PaymentEntry {
  amount: number;
  amountWords: string;
  mode: PaymentMode;
  referenceNo?: string;
  bankName?: string;
  date: string;                 // YYYY-MM-DD
  receivedBy: string;           // seller name who received
}

export interface ScheduledPayment {
  label: string;                // e.g. "August 2026"
  perSellerAmount: number;
  sellerCount: number;
  totalAmount: number;
}

export interface EnglishAgreementData {
  agreementDate: string;        // YYYY-MM-DD
  agreementDay?: string | { en: string; hi: string };        // e.g. "Sunday"

  buyer: BuyerData;

  sellers: SellerPerson[];      // 1–4 sellers
  sellersCommonAddress: string;

  land: LandData;

  totalAmount: number;
  totalAmountWords: string;
  ratePerAcre: number;
  ratePerAcreWords: string;

  paidTotal: number;
  paidTotalWords: string;
  paidUptoDate: string;

  payments: PaymentEntry[];

  remainingAmount: number;
  remainingAmountWords: string;
  registryMaxMonths: number;

  scheduledPayments: ScheduledPayment[];

  accountHolderName: string;
  companyName?: string;
  accountNo: string;
  bank: string;
  branch: string;

  tokenLetterDate: string;      // display string e.g. "29/01/2026"

  kissanId?: string;
  folderSerial?: string;

  company?: CompanyData;
  manager?: ManagerData;
}

interface TemplateProps {
  data: EnglishAgreementData;
  companyLogo?: string;
  companyWatermark?: string;
}

// =========================
// HELPERS
// =========================

const fmt = (n: number): string =>
  n?.toLocaleString('en-IN') ?? '0';

const fmtDate = (dateStr?: string): string => {
  if (!dateStr) return '________';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

const fmtDateLong = (dateStr?: string): string => {
  if (!dateStr) return '________';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
};

const withTitle = (name?: string, salutation?: string): string => {
  if (!name) return '________________';
  return salutation ? `${salutation} ${name}` : name;
};

const payModeStr = (mode: PaymentMode, ref?: string, bank?: string): string => {
  if (mode === 'UPI') return `Google Pay / UPI (Ref. No. ${ref || '___________'})`;
  if (mode === 'Cheque') return `${bank || 'HDFC'} Bank Cheque No. ${ref || '___________'}`;
  if (mode === 'Cash') return 'Cash (Hand-to-Hand)';
  if (mode === 'NEFT') return `NEFT Transfer (UTR No. ${ref || '___________'})`;
  if (mode === 'RTGS') return `RTGS Transfer (UTR No. ${ref || '___________'})`;
  return mode;
};

const ORDINALS_EN = ['', 'first', 'second', 'third', 'fourth', 'fifth', 'sixth', 'seventh', 'eighth', 'ninth', 'tenth',
  'eleventh', 'twelfth', 'thirteenth', 'fourteenth', 'fifteenth', 'sixteenth', 'seventeenth', 'eighteenth'];

const numWords = (n: number): string => ORDINALS_EN[n] ?? String(n);

// =========================
// SUB-COMPONENTS
// =========================

const Watermark: React.FC<{ logo?: string; watermark?: string }> = ({ logo, watermark }) => (
  <div style={{
    position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    opacity: 0.06, zIndex: 0, pointerEvents: 'none',
  }}>
    <img src={watermark || logo || ''} style={{ width: '70%', maxWidth: '720px', height: 'auto', objectFit: 'contain' }} />
  </div>
);

const PageTitle: React.FC = () => (
  <div className="text-center mb-6">
    <h2 className="text-[15px] font-bold uppercase tracking-[3px] border-b-2 border-black inline-block pb-1">
      Agreement for Sale of Agricultural Land
    </h2>
  </div>
);



// =========================
// MAIN COMPONENT
// =========================

const EnglishKhetiZameenAgreement: React.FC<TemplateProps> = ({ data, companyLogo, companyWatermark }) => {
  const safeData: EnglishAgreementData = {
  ...data,
  company: data.company ?? {},
  manager: data.manager ?? {},
  sellers: data.sellers ?? [],
  payments: data.payments ?? [],
  scheduledPayments: data.scheduledPayments ?? [],
};

const {
  agreementDate, agreementDay, buyer, sellers, sellersCommonAddress, land,
  totalAmount, totalAmountWords, ratePerAcre, ratePerAcreWords,
  paidTotal, paidTotalWords, paidUptoDate, payments,
  remainingAmount, remainingAmountWords, registryMaxMonths,
  scheduledPayments, accountHolderName, companyName, accountNo, bank, branch,
  tokenLetterDate, company, manager, folderSerial
} = safeData;

  const buyerLabel = withTitle(buyer.name, buyer.salutation);
  const compLabel = companyName ? `${companyName}` : 'the Company';
  
  return (
    <div id="printable-document" className="flex flex-col items-center">
      <style>{`
        .a4-page {
          width: 210mm;
          min-height: 297mm;
          margin: 0 auto 20px;
          background: white;
          padding: 22mm 22mm 18mm;
          box-sizing: border-box;
          page-break-after: always;
          box-shadow: 0 0 12px rgba(0,0,0,0.12);
          display: block;
          position: relative;
          font-family: 'Georgia', 'Times New Roman', serif;
        }
          .u-field {
  border-bottom: 1px solid #000;
  display: inline-block;
  height: 18px;
  line-height: 18px;
}
        @media print {
          .a4-page { margin: 0 auto; box-shadow: none; }
          .no-print { display: none !important; }
        }
        .clause-body {
          font-size: 14px;
          line-height: 2;
          text-align: justify;
          color: #111;
        }
        .clause-num {
          font-weight: 700;
          min-width: 52px;
          flex-shrink: 0;
          font-size: 14px;
        }
        .section-title {
          font-weight: 700;
          font-size: 14.5px;
          margin-bottom: 10px;
          letter-spacing: 0.3px;
        }
        .party-box {
          border: 1.5px solid #333;
          padding: 14px 16px;
          margin-bottom: 14px;
          background: #fdfcf9;
        }
        .party-head {
          font-size: 13px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 1.2px;
          border-bottom: 1px solid #ccc;
          padding-bottom: 6px;
          margin-bottom: 10px;
        }
        .land-box {
          border: 2px solid #000;
          padding: 14px 16px;
          margin: 12px 0;
          background: #fefefe;
        }
        .sched-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 13.5px;
          margin-top: 10px;
        }
        .sched-table th {
          border: 1px solid #000;
          padding: 6px 10px;
          background: #f0ede6;
          font-weight: 700;
          text-align: center;
          font-size: 12.5px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .sched-table td {
          border: 1px solid #555;
          padding: 6px 10px;
          text-align: center;
        }
        .sched-table tr:last-child td {
          background: #fdf9e8;
          font-weight: 700;
        }
        .sig-box {
          border-top: 1.5px solid #000;
          margin-top: 56px;
          padding-top: 8px;
          text-align: center;
          font-size: 13px;
        }
        .payment-row {
          font-size: 13.5px;
          line-height: 1.85;
          border-bottom: 1px dashed #ccc;
          padding: 6px 0;
          display: flex;
          gap: 10px;
        }
        .payment-idx {
          font-weight: 700;
          min-width: 30px;
          text-align: right;
          flex-shrink: 0;
        }
      `}</style>

      <div className="flex flex-col items-center gap-8 text-gray-900" style={{ fontFamily: 'Georgia, Times New Roman, serif' }}>

        {/* ══════════════════════════════════════
            PAGE 1 — COVER + SUMMARY + PARTY 01
        ══════════════════════════════════════ */}
        <div className="a4-page">
          {/* Stamp paper top space */}
          <div className="h-[240px]" />

          {/* Document type label */}
          <div className="text-center mb-2">
            <p className="text-[11px] font-bold uppercase tracking-[4px] text-gray-500 mb-1">Immovable Property</p>
            <h1 className="text-[24px] font-extrabold uppercase tracking-[2px] underline decoration-double underline-offset-4 mb-1">
              Agreement for Sale
            </h1>
            <p className="text-[13px] font-semibold tracking-wide">of Agricultural Land</p>
          </div>

         {/* Summary — Inline Legal Format (English) */}
<div className="mt-10 mb-6 text-[14px] leading-[2.2] text-black">

 {/* Summary — Standard Registry Format */}
<div className="mt-10 mb-6 text-[14px] leading-[2.2] text-black">

  {/* Sale Consideration */}
  <div className="flex items-end gap-2">
    <span className="font-bold min-w-[230px]">Sale Consideration Amount :</span>
    <span className="u-field flex-1 text-center">
      {totalAmount ? `${fmt(totalAmount)}/-` : ''}
    </span>
  </div>

  

  {/* Village */}
  <div className="flex items-end gap-2 mt-2">
    <span className="font-bold min-w-[230px]">Village :</span>
    <span className="u-field flex-1 text-center">{land.village}</span>
  </div>

  {/* Mauza */}
  <div className="flex items-end gap-2">
    <span className="font-bold min-w-[230px]">Mauza :</span>
    <span className="u-field flex-1 text-center">{land.village}</span>
  </div>

  {/* P.H. No */}
  <div className="flex items-end gap-2">
    <span className="font-bold min-w-[230px]">Patwari Circle Number :</span>
    <span className="u-field flex-1 text-center">{land.phHalkaNo}</span>
  </div>

  {/* Khata No */}
  <div className="flex items-end gap-2">
    <span className="font-bold min-w-[230px]">Khata No. :</span>
    <span className="u-field flex-1 text-center">{land.khataNo}</span>
  </div>

  {/* Khasra No */}
  <div className="flex items-end gap-2">
    <span className="font-bold min-w-[230px]">Khasra No. :</span>
    <span className="u-field flex-1 text-center">{land.khasraNo}</span>
  </div>

  {/* Total Area */}
  <div className="flex items-end gap-2">
    <span className="font-bold min-w-[230px]">Total Area :</span>
    <span className="u-field flex-1 text-center">
      {land.areaHectare}
    </span>
  </div>

  {/* Tehsil */}
  <div className="flex items-end gap-2">
    <span className="font-bold min-w-[230px]">Tehsil :</span>
    <span className="u-field flex-1 text-center">{land.tehsil}</span>
  </div>

  {/* District */}
  <div className="flex items-end gap-2">
    <span className="font-bold min-w-[230px]">District :</span>
    <span className="u-field flex-1 text-center">{land.district}</span>
  </div>

  {/* State */}
  <div className="flex items-end gap-2">
    <span className="font-bold min-w-[230px]">State :</span>
    <span className="u-field flex-1 text-center">{land.state}</span>
  </div>

  {/* PIN */}
  <div className="flex items-end gap-2">
    <span className="font-bold min-w-[230px]">Pincode :</span>
    <span className="u-field flex-1 text-center">{land.pincode}</span>
  </div>
</div>
</div>

          <div className="grid grid-cols-[200px_1fr] gap-8 mb-6">

  {/* LEFT SIDE — PARTY TITLE */}
  <div className="font-bold leading-tight">
    <div>Party No. 01 – The Purchaser</div>
    <div>Party Receiving the Deed:-</div>
  </div>

  {/* RIGHT SIDE — FORM FIELDS */}
  <div className="space-y-3 text-[14px]">

    {/* NAME */}
    <div className="flex items-end gap-3">
      <span className="font-bold w-28">1. Name:-</span>
      <span className="u-field flex-1 font-bold">
        {manager?.managerName || buyer.name || ''} ({manager?.managerPosition || buyer.occupation || 'Manager'})
        {company?.companyName ? ` for ${company.companyName}` : ''}
        {company?.entityType ? ` (${company.entityType})` : ''}
      </span>
    </div>

    {/* ADDRESS */}
    <div className="flex items-end gap-3">
      <span className="font-bold w-28">Address:-</span>
      <span className="u-field flex-1">
        {[
          company?.companyAddress || buyer.address,
          company?.companyLocality || buyer.locality,
          company?.companyDistrict || buyer.district,
          company?.companyState || buyer.state,
          (company?.companyPincode || buyer.pincode) ? `PIN ${company?.companyPincode || buyer.pincode}` : null
        ].filter(Boolean).join(', ')}
      </span>
    </div>

    {/* AADHAAR */}
    <div className="flex items-end gap-3">
      <span className="font-bold w-40">Aadhaar No.:-</span>
      <span className="u-field flex-1">
        {manager?.managerAadhaar || buyer.aadhaar || ''}
      </span>
    </div>

    {/* PAN */}
    <div className="flex items-end gap-3">
      <span className="font-bold w-40">PAN Card No.:-</span>
      <span className="u-field flex-1 uppercase">
        {manager?.managerPAN || company?.companyPan || buyer.pan || ''}
      </span>
    </div>

    {/* CONTACT */}
    <div className="flex items-end gap-3">
      <span className="font-bold w-40">Contact No.:-</span>
      <span className="u-field flex-1">
        {manager?.managerPhone
          ? `${manager.managerCountryCode || '+91'} ${manager.managerPhone}`
          : (buyer.phone || '')}
      </span>
    </div>

    {/* LICENSE */}
    <div className="flex items-end gap-3">
      <span className="font-bold w-52">License Registration No.:-</span>
      <span className="u-field flex-1">
        {company?.licenseRegistrationNumber || ''}
      </span>
    </div>

    {/* URC */}
    <div className="flex items-end gap-3">
      <span className="font-bold w-40">Udyam / URC No.:-</span>
      <span className="u-field flex-1">
        {company?.urcNumber || ''}
      </span>
    </div>

  </div>


    
                 </div> 
                   <PrintFooter />
                 </div>


        {/* ══════════════════════════════════════
            PAGE 2 — PARTY 02 (SELLERS) + CLAUSE 1
        ══════════════════════════════════════ */}
        <div className="a4-page" style={{ position: 'relative' }}>
  <Watermark logo={companyLogo} watermark={companyWatermark} />

  <div style={{ position: 'relative', zIndex: 1 }}>
    <PageTitle />

    <div className="grid grid-cols-[200px_1fr] gap-8 mb-6">

  {/* LEFT SIDE */}
  <div className="font-bold leading-tight">
    <div>Party No. 02 – The Vendor(s)</div>
    <div>Party Giving the Deed:-</div>
  </div>

  {/* RIGHT SIDE */}
  <div className="space-y-4 text-[14px]">

    {sellers.map((seller, idx) => {
      const nameDisplay = withTitle(seller.name, seller.salutation);

      return (
        <div key={idx} className="space-y-3 pb-6 border-b border-dashed border-gray-200 last:border-0 last:pb-0">

          {/* NAME */}
          <div className="flex items-end gap-3">
            <span className="font-bold w-28">
              {idx + 1}. Name:-
            </span>
            <span className="u-field flex-1 font-bold">
              {nameDisplay}
            </span>
          </div>

          {/* AGE + OCCUPATION */}
          <div className="flex items-end gap-3">
            <span className="font-bold w-28">Age:-</span>
            <span className="u-field flex-1">
              {seller.age} Years, Occupation:- {seller.occupation}
            </span>
          </div>

          {/* AADHAAR */}
          <div className="flex items-end gap-3">
            <span className="font-bold w-40">Aadhaar No.:-</span>
            <span className="u-field flex-1">{seller.aadhaar}</span>
          </div>

          {/* PAN */}
          <div className="flex items-end gap-3">
            <span className="font-bold w-40">PAN Card No.:-</span>
            <span className="u-field flex-1">
              {seller.pan?.toUpperCase()}
            </span>
          </div>

          {/* CONTACT */}
          <div className="flex items-end gap-3">
            <span className="font-bold w-40">Contact No.:-</span>
            <span className="u-field flex-1">{seller.phone}</span>
          </div>

        </div>
      );
    })}

    {/* COMMON ADDRESS */}
    <div className="flex items-end gap-3">
      <span className="font-bold w-28">Address:-</span>
      <span className="u-field flex-1">
        {sellersCommonAddress}
      </span>
    </div>

  </div>
</div>

            {/* Clause 01 */}
            <div className="clause-body">
              <div className="flex gap-3">
                <span className="clause-num">01.</span>
                <span>
                  On this {agreementDay ? `${(typeof agreementDay === 'object' ? (agreementDay as any).en : agreementDay)}, ` : ''}the {fmtDateLong(agreementDate)}, both the above-mentioned parties, out of their own free will, complete satisfaction, and for the purpose of mutual benefit and fulfillment of their respective family needs, execute this Agreement for Sale, the complete particulars of which are as follows.
                </span>
              </div>
            </div>
          </div>

            {/* Clause 02 */}
            <div className="clause-body mb-4">
              <div className="flex gap-3">
                <span className="clause-num">02.</span>
                <span>
                  That Party No. 02 is the complete owner and possessor of the agricultural land described below, as per Government records and as per 7/1 and 2/8(A) extracts. The said agricultural land is entirely in the possession of Party No. 02 up to the date of completion of this Agreement for Sale. The description thereof is as follows:
                </span>
              </div>
            </div>

            {/* Land detail box */}
            <div className="land-box">
              <p className="section-title underline mb-3">2.1 Description of Agricultural Land :-</p>
              <div className="grid grid-cols-2 gap-x-10 gap-y-2 text-[13.5px]">
                {[
                  ['Khasra No. :-', land.khasraNo],
                  ['Khata No. :-', land.khataNo],
                  ['Cultivated Area :-', `${land.areaHectare} Ha. Ar.`],
                  ['Uncultivated (Akarni) :-', land.akarni || '—'],
                  ['Village / Mauza :-', land.village],
                  ['Tehsil :-', land.tehsil],
                  ['District :-', land.district],
                  ['State :-', land.state],
                  ['PIN Code :-', land.pincode],
                ].map(([lbl, val]) => (
                  <div key={lbl} className="flex gap-2 items-end">
                    <span className="font-bold shrink-0">{lbl}</span>
                    <span className="u-field flex-1">{val}</span>
                  </div>
                ))}
              </div>

              <p className="section-title underline mt-6 mb-3">2.2 Four Boundaries of Agricultural Land :-</p>
              <div className="grid grid-cols-2 gap-x-10 gap-y-2 text-[13.5px]">
                {[
                  ['East :-', `Khasra No. ${land.eastKhasra}`],
                  ['West :-', `Khasra No. ${land.westKhasra}`],
                  ['North :-', `Khasra No. ${land.northKhasra}`],
                  ['South :-', `Khasra No. ${land.southKhasra}`],
                ].map(([dir, val]) => (
                  <div key={dir} className="flex gap-2 items-end">
                    <span className="font-bold w-20 shrink-0">{dir}</span>
                    <span className="u-field flex-1">{val}</span>
                  </div>
                ))}
              </div>
                      </div>

             <PrintFooter />
            </div>

            {/* ══════════════════════════════════════
            PAGE 3 — LAND DETAILS + CLAUSES 02 & 03
        ══════════════════════════════════════ */}
        <div className="a4-page" style={{ position: 'relative' }}>
          <Watermark logo={companyLogo} watermark={companyWatermark} />
          <div style={{ position: 'relative', zIndex: 1 }}>
            <PageTitle />

            {/* Clause 03 */}
            <div className="clause-body mt-4">
              <div className="flex gap-3">
                <span className="clause-num">03.</span>
                <span>
                  That Party No. 02 has agreed to sell the entire above-described agricultural land to Party No. 01 and has also handed over complete physical possession thereof. From this date, Party No. 01 is the absolute owner and possessor of the said land in every respect. Party No. 01 is fully at liberty to execute a written agreement for sale, gift, or donation of the said land either in full or in part to any person, and to carry out any work on the agricultural land. Party No. 01 is not bound or obligated in any manner whatsoever to Party No. 02.
                </span>
              </div>
            </div>

            {/* Clause 04 header */}
            <div className="clause-body mb-4">
              <div className="flex gap-3">
                <span className="clause-num">04.</span>
                <span>
                  That Party No. 02 has sold the entire above-described agricultural land at the rate of{' '}
                  <strong>Rs. {fmt(ratePerAcre)}/- ({ratePerAcreWords} Rupees Only)</strong>{' '}
                  per acre. The total consideration amount is{' '}
                  <strong>Rs. {fmt(totalAmount)}/- ({totalAmountWords} Rupees Only)</strong>,{' '}
                  out of which Party No. 02 has received a total of{' '}
                  <strong>Rs. {fmt(paidTotal)}/- ({paidTotalWords} Rupees Only)</strong>{' '}
                  by way of cash, cheque, and e-transfer up to{' '}
                  <strong>{fmtDate(paidUptoDate)}</strong>.{' '}
                  The complete particulars of the same are as under:-
                </span>
              </div>
            </div>
            
            {/* Payment list */}
            <div className="mt-2">
              {payments.map((p, idx) => (
                <div className="payment-row" key={idx}>
                  <span className="payment-idx">4.{idx + 1})</span>
                  <span>
                    <strong>Rs. {fmt(p.amount)}/- ({p.amountWords} Rupees Only)</strong>{' '}
                    received via {payModeStr(p.mode, p.referenceNo, p.bankName)} on{' '}
                    <strong>{fmtDate(p.date)}</strong> by{' '}
                    <strong>{withTitle(p.receivedBy)}</strong>{' '}
                    — acknowledged and accepted.
                  </span>
                </div>
              ))}
            </div>
          </div>

            {/* Clause 05 */}
            <div className="clause-body mb-3">
              <div className="flex gap-3">
                <span className="clause-num">05.</span>
                <span>
                  That after receipt of the above-mentioned payments, the balance amount of{' '}
                  <strong>Rs. {fmt(remainingAmount)}/- ({remainingAmountWords} Rupees Only)</strong>{' '}
                  shall be paid by Party No. 01 to Party No. 02 after Party No. 02 has rectified all documents related to the land for registration as per Government regulations, and after completing all necessary proceedings including Government survey (Mojni), family partition (Watni), etc. The registration shall be carried out on a mutually agreed date, and the balance shall be paid within a maximum of{' '}
                  <strong>{registryMaxMonths} ({numWords(registryMaxMonths)}) months</strong>{' '}
                  from the date hereof. No payment beyond Sub-clause 5.1 shall be made before all documents are duly rectified as per Government norms, and Party No. 02 shall not raise any dispute in respect of payment. The schedule of remaining payments is as follows:-
                </span>
              </div>
            </div>

            {/* Scheduled payment table */}
            <table className="sched-table">
              <thead>
                <tr>
                  <th>Sl. No.</th>
                  <th>Due Month</th>
                  <th>Amount per Vendor (Rs.)</th>
                  <th>No. of Vendors</th>
                  <th>Total Amount (Rs.)</th>
                </tr>
              </thead>
              <tbody>
                {scheduledPayments.map((sp, i) => (
                  <tr key={i}>
                    <td>5.{i + 1}</td>
                    <td>{sp.label}</td>
                    <td>{fmt(sp.perSellerAmount)}/-</td>
                    <td>{sp.sellerCount}</td>
                    <td>{fmt(sp.totalAmount)}/-</td>
                  </tr>
                ))}
                <tr>
                  <td colSpan={4} style={{ textAlign: 'right', fontWeight: 700, paddingRight: 12 }}>
                    Total Balance Payable
                  </td>
                  <td style={{ fontWeight: 700 }}>{fmt(remainingAmount)}/-</td>
                </tr>
              </tbody>
            </table>        
             <PrintFooter />
            </div>


            {/* ══════════════════════════════════════
            PAGE 6 — TERMS & CONDITIONS (Part A)
        ══════════════════════════════════════ */}
        <div className="a4-page" style={{ position: 'relative' }}>
          <Watermark logo={companyLogo} watermark={companyWatermark} />
          <div style={{ position: 'relative', zIndex: 1 }}>
            <PageTitle />
            {/* Clause 06 */}
            <div className="clause-body mt-6">
              <div className="flex gap-3">
                <span className="clause-num">06.</span>
                <span>
                  That all payments under this Agreement, whether made by online transfer, cheque, NEFT, RTGS, Google Pay, or any other mode, shall be made in the name of{' '}
                  <strong>{accountHolderName}</strong>, or alternatively in the name of{' '}
                  {companyName ? <strong>{companyName}</strong> : '___________'}{' '}
                  via Current Account No. <strong>{accountNo}</strong>, Bank: <strong>{bank}</strong>, Branch: <strong>{branch}</strong>.{' '}
                  Payments made through either name shall be considered valid, and Party No. 02 has no objection thereto, nor shall they raise any objection in future.
                </span>
              </div>
            </div>

          

            <p className="section-title text-[15px] mb-4">07. Terms and Conditions</p>

            <div className="clause-body space-y-5">
              {[
                {
                  num: '7.1',
                  text: `All Government survey (Mojni), partition map (Bhag Naksha), mutation register (Fer Far Panji), record of rights, and all other documents pertaining to the said agricultural land, and all present or future family disputes, shall be resolved and settled by Party No. 02. Party No. 02 shall be entitled to payment only in proportion to the area confirmed by the Government survey. If the Government survey reveals a lesser area, Party No. 02 shall not raise any dispute on the basis of the area mentioned in the 7/12 extract or the area described above.`,
                },
                {
                  num: '7.2',
                  text: `Party No. 02 shall be solely liable for all Government taxes, irrigation department dues, bank loans, mortgages, encumbrances, or any other dues on the said agricultural land up to the date of registration. If Party No. 02 fails to discharge the same, Party No. 01 shall deduct the amounts from the remaining balance consideration and settle the dues, and Party No. 02 shall not raise any dispute in this regard.`,
                },
                {
                  num: '7.3',
                  text: `Party No. 02 confirms that they have not previously entered into any agreement for sale of the above land with any other person, nor have they received any amount from any other person in respect of the said land. If any such matter comes to light in future, Party No. 02 shall bear complete responsibility and shall settle the same at their cost. If the deal is cancelled for this reason, Party No. 02 shall refund all amounts received under the Token Letter-cum-Agreement for Sale dated ${tokenLetterDate} on the very day of cancellation, failing which the cancellation shall not be valid.`,
                },
              ].map(({ num, text }) => (
                <div key={num} className="flex gap-3">
                  <span className="clause-num">{num}</span>
                  <span>{text}</span>
                </div>
              ))}
            </div>
                        </div>

          <PrintFooter />
        </div>


        {/* ══════════════════════════════════════
            PAGE 7 — TERMS & CONDITIONS (Part B)
        ══════════════════════════════════════ */}
        <div className="a4-page" style={{ position: 'relative' }}>
          <Watermark logo={companyLogo} watermark={companyWatermark} />
          <div style={{ position: 'relative', zIndex: 1 }}>
            <PageTitle />

            <div className="clause-body space-y-5">
              {[
                {
                  num: '7.4',
                  text: `If anything happens to Party No. 01 or Party No. 02, or either of them, in future, their legal heirs are fully aware of and bound by this Agreement for Sale and the possession of the agricultural land, and shall accordingly complete the transaction. If the heirs of Party No. 02 fail to do so, the heirs of Party No. 01 shall register the said land unilaterally in their name, provided the remaining balance is paid as agreed. If the heirs of Party No. 02 refuse to accept the payment, the heirs of Party No. 01 shall deposit the remaining balance amount in the Government treasury after effecting registration in their name.`,
                },
                {
                  num: '7.5',
                  text: `That after full payment as per the above terms, Party No. 01 may, at their own discretion, get the said agricultural land registered in their own name or in the name of any other authorized officer of ${compLabel}. Party No. 02 fully agrees to this and shall not raise any dispute or objection in future.`,
                },
                {
                  num: '7.6',
                  text: `Any amendment or modification to this Agreement for Sale shall be valid only if made in writing and duly signed and thumb-impressed by both parties. No telephonic conversation, WhatsApp message, e-mail, or communication through any other medium shall have any bearing on or effect upon this Agreement.`,
                },
                {
                  num: '7.7',
                  text: `If a situation arises where payment is not made on time as agreed, the claim or possession of Party No. 02 over the said agricultural land shall not be recognized in any form. In such an event, both parties shall sit together and mutually resolve the matter and determine a future course of action in accordance with Sub-clause 7.6 of Clause 07.`,
                },
                {
                  num: '7.8',
                  text: `Both parties hereby declare that they are in complete sound health, are not suffering from any mental illness, and have not consumed any intoxicant or narcotic substance. If anyone subsequently claims that the Agreement was executed under the influence of any illness or intoxication, such person shall be liable to punishment under the provisions of the Indian Penal Code.`,
                },
              ].map(({ num, text }) => (
                <div key={num} className="flex gap-3">
                  <span className="clause-num">{num}</span>
                  <span>{text}</span>
                </div>
              ))}
            </div>
          </div>
          <PrintFooter />
        </div>


        {/* ══════════════════════════════════════
            PAGE 8 — SIGNATURES
        ══════════════════════════════════════ */}
        <div className="a4-page" style={{ position: 'relative' }}>
          <Watermark logo={companyLogo} watermark={companyWatermark} />
          <div style={{ position: 'relative', zIndex: 1 }}>
            <PageTitle />

            {/* Signatures */}
            <div className="mb-10">
              <p className="section-title text-[14.5px] mb-6">
                08. Signatures & Left Thumb Impressions of Party No. 02 (Vendor{sellers.length > 1 ? 's' : ''}) :-
              </p>
              <div className="space-y-6">
                {sellers.map((s, i) => (
                  <div key={i} className="flex items-center justify-between gap-6 pb-2 border-b border-gray-100">
                    <div className="flex-1">
                      <p className="font-bold text-[14px] uppercase tracking-wide">{withTitle(s.name, s.salutation)}</p>
                      <p className="text-[11px] text-gray-500 uppercase tracking-widest mt-1">
                        Vendor{sellers.length > 1 ? ` ${i + 1}` : ''} / Party No. 02
                      </p>
                    </div>
                    <div className="w-[280px] shrink-0 text-center flex gap-4">
                      <div
                        className="border border-dashed border-gray-400 bg-gray-50/50 flex-1 flex flex-col justify-between items-center py-2"
                        style={{ height: 110 }}
                      >
                        <span className="text-[9px] text-gray-400 uppercase font-black tracking-widest">Left Thumb</span>
                      </div>
                      <div
                         className="border border-dashed border-gray-400 bg-gray-50/50 flex-1 flex flex-col justify-between items-center py-2"
                         style={{ height: 110 }}
                       >
                         <span className="text-[9px] text-gray-400 uppercase font-black tracking-widest">Signature</span>
                       </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Buyer signature */}
            <div className="mb-10">
              <p className="section-title text-[14.5px] mb-6">
                09. Signature & Left Thumb Impression of Party No. 01 (Purchaser) :-
              </p>
              <div className="flex items-center justify-between gap-6 pb-2 border-b border-gray-100">
                <div className="flex-1">
                  <p className="font-bold text-[14px] uppercase tracking-wide">{buyerLabel}</p>
                  <p className="text-[11px] text-gray-500 uppercase tracking-widest mt-1">
                    {companyName ? `Manager, ${companyName}` : 'Purchaser'} / Party No. 01
                  </p>
                </div>
                <div className="w-[280px] shrink-0 text-center flex gap-4">
                   <div
                     className="border border-dashed border-gray-400 bg-gray-50/50 flex-1 flex flex-col justify-between items-center py-2"
                     style={{ height: 110 }}
                   >
                     <span className="text-[9px] text-gray-400 uppercase font-black tracking-widest">Left Thumb</span>
                   </div>
                   <div
                      className="border border-dashed border-gray-400 bg-gray-50/50 flex-1 flex flex-col justify-between items-center py-2"
                      style={{ height: 110 }}
                    >
                      <span className="text-[9px] text-gray-400 uppercase font-black tracking-widest">Signature</span>
                    </div>
                </div>
              </div>
            </div>

            {/* Witness signatures */}
            <div className="mb-12">
              <p className="section-title text-[14.5px] mb-6">
                10. Signatures &amp; Thumb Impressions of Witnesses :-
              </p>
              <div className="space-y-6">
                {['10.1 Witness One', '10.2 Witness Two'].map((n, idx) => (
                  <div key={idx} className="flex items-center justify-between gap-6 pb-2 border-b border-gray-100">
                    <div className="flex-1">
                      <p className="font-semibold text-[13px]">{n}: _______________________</p>
                      <p className="text-[10px] text-gray-400 uppercase tracking-widest mt-1">Identity Verified Witness</p>
                    </div>
                    <div className="w-[180px] shrink-0 text-center">
                      <div
                        className="border border-dashed border-gray-400 bg-gray-50/50 flex items-end justify-center pb-2"
                        style={{ height: 75 }}
                      >
                        <span className="text-[9px] text-gray-400 uppercase font-bold">Impression</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* END mark */}
            <div className="mt-14 text-center space-y-3">
              <p className="text-[20px] font-bold tracking-[6px]">- - -   E N D   - - -</p>
              <p className="text-[11px] font-mono text-gray-400 break-words">
                {`${folderSerial || (safeData as any).clientId?.split('-')[0] || 'KS'}-${land.landName?.replace(/\s+/g, '-') || sellers[0]?.name?.split(' ')[0] || ''}-${land.village}-${land.khasraNo}-${land.tehsil}-${fmtDate(agreementDate).replace(/\//g, '-')}`}
              </p>
            </div>
          </div>
          <PrintFooter />
        </div>
      </div>
    </div>

  );
};

export default EnglishKhetiZameenAgreement;


// =========================
// SAMPLE DATA (remove before production)
// =========================
/*
const sampleData: EnglishAgreementData = {
  agreementDate: '2026-02-15',
  agreementDay: 'Sunday',

  buyer: {
    salutation: 'Smt.',
    name: 'Mamata Keshlal Patle',
    age: '42',
    occupation: 'Business',
    address: 'Ward No. 5, Ashray Colony',
    locality: 'Mankapur',
    district: 'Nagpur',
    state: 'Maharashtra',
    pincode: '441013',
    aadhaar: '1234 5678 9012',
    pan: 'ABCDE1234F',
    phone: '9876543210',
  },

  sellers: [
    { salutation: 'Shri', name: 'Prayag Gangadhar Wankhede', age: '58', occupation: 'Agriculture', aadhaar: '9876 5432 1098', pan: 'XYZPW1234G', phone: '9112345678' },
    { salutation: 'Smt.', name: 'Usha Gangadhar Wankhede',   age: '52', occupation: 'Homemaker',   aadhaar: '8765 4321 0987', pan: 'UVWUW5678H', phone: '9223456789' },
    { salutation: 'Shri', name: 'Prashant Gangadhar Wankhede', age: '34', occupation: 'Service',   aadhaar: '7654 3210 9876', pan: 'MNOPW3456J', phone: '9334567890' },
    { salutation: 'Shri', name: 'Mahesh Gangadhar Wankhede',   age: '30', occupation: 'Business',  aadhaar: '6543 2109 8765', pan: 'GHIJW6789K', phone: '9445678901' },
  ],
  sellersCommonAddress: 'Ward No. 2, Near Datta Mandir, Ghogali, Po. Lonkheri, Tahsil & District Nagpur, Maharashtra - 441111',

  land: {
    village: 'Lonkheri',
    phHalkaNo: '12',
    khataNo: '45',
    khasraNo: '123/1',
    areaHectare: '2.50',
    tehsil: 'Nagpur',
    district: 'Nagpur',
    state: 'Maharashtra',
    pincode: '441111',
    eastKhasra: '122',
    westKhasra: '124',
    northKhasra: '120',
    southKhasra: '125/2',
  },

  totalAmount: 2500000,
  totalAmountWords: 'Twenty-Five Lakhs',
  ratePerAcre: 1000000,
  ratePerAcreWords: 'Ten Lakhs',
  paidTotal: 1212000,
  paidTotalWords: 'Twelve Lakhs Twelve Thousand',
  paidUptoDate: '2026-02-15',

  payments: [
    { amount: 21000,  amountWords: 'Twenty-One Thousand',  mode: 'UPI',    referenceNo: '9876543210', date: '2026-01-29', receivedBy: 'Prayag Gangadhar Wankhede' },
    { amount: 10000,  amountWords: 'Ten Thousand',          mode: 'UPI',    referenceNo: '9876543210', date: '2026-02-01', receivedBy: 'Prayag Gangadhar Wankhede' },
    { amount: 600000, amountWords: 'Six Lakhs',             mode: 'Cheque', referenceNo: '000123', bankName: 'HDFC', date: '2026-02-15', receivedBy: 'Usha Gangadhar Wankhede' },
    { amount: 600000, amountWords: 'Six Lakhs',             mode: 'Cheque', referenceNo: '000124', bankName: 'HDFC', date: '2026-02-15', receivedBy: 'Prashant Gangadhar Wankhede' },
    { amount: 600000, amountWords: 'Six Lakhs',             mode: 'Cheque', referenceNo: '000125', bankName: 'HDFC', date: '2026-02-15', receivedBy: 'Mahesh Gangadhar Wankhede' },
  ],

  remainingAmount: 1288000,
  remainingAmountWords: 'Twelve Lakhs Eighty-Eight Thousand',
  registryMaxMonths: 17,

  scheduledPayments: [
    { label: 'August 2026',   perSellerAmount: 100000, sellerCount: 4, totalAmount: 400000 },
    { label: 'November 2026', perSellerAmount: 100000, sellerCount: 4, totalAmount: 400000 },
    { label: 'February 2027', perSellerAmount: 100000, sellerCount: 4, totalAmount: 400000 },
    { label: 'May 2027',      perSellerAmount: 50000,  sellerCount: 4, totalAmount: 200000 },
    { label: 'July 2027',     perSellerAmount: 22000,  sellerCount: 4, totalAmount:  88000 },
  ],

  accountHolderName: 'Mamata Keshlal Patle',
  companyName: 'Ashray Group',
  accountNo: '12345678901234',
  bank: 'HDFC Bank',
  branch: 'Nagpur Main',

  tokenLetterDate: '29/01/2026',
};
*/