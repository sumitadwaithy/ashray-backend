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

const formatDate = (dateStr?: string) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString('en-IN'); // 31/03/2026
};

const EnglishAgreement = ({ data, companyLogo, companyWatermark }: TemplateProps) => {


// 🔥 SAFE NUMERIC CALCULATIONS
const total = Number(data?.property?.totalAmount || 0);
const token = Number(data?.property?.tokenAmount || 0);
const duration = Number(data?.property?.emiDuration || 0);

const remaining = total - token;

const emi =
  Number(data?.property?.emiAmount) ||
  (duration > 0 ? Math.round(remaining / duration) : 0);


// 🔥 CALCULATE INSTALLMENT + AGREEMENT END DATE
const calculateEndDate = (start?: string, months?: number) => {
  if (!start || !months) return '';

  const d = new Date(start);

  if (isNaN(d.getTime())) return '';

  d.setMonth(d.getMonth() + months);

  return d.toISOString().split('T')[0]; // YYYY-MM-DD
};

const lastInstallmentDate = calculateEndDate(data?.property?.bookingDate, duration);
const agreementEndDate = lastInstallmentDate;

const renderWatermark = () => (
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
);

  return (
         <div id="printable-document" className="flex flex-col items-center">
           <style>{`
          .a4-page {
            width: 210mm;
            min-height: 297mm;
            margin: 0 auto 20px;
            background: white;
            padding: 25mm 20mm;
            box-sizing: border-box;
            page-break-after: always;
            box-shadow: 0 0 10px rgba(0,0,0,0.1);
            display: block;
            position: relative;
          }

          @media print {
            .a4-page {
              margin: 0 auto;
              box-shadow: none;
            }
            .no-print {
              display: none !important;
            }
          }

          .stamp-paper-header {
            border: 4px double #333;
            padding: 20px;
            text-align: center;
            margin-bottom: 40px;
            position: relative;
          }

          .stamp-paper-header::before {
            content: 'Rs. 100';
            position: absolute;
            top: 10px;
            left: 10px;
            font-weight: bold;
            font-size: 24px;
          }

          .stamp-paper-header::after {
            content: 'ONE HUNDRED RUPEES';
            position: absolute;
            bottom: 10px;
            right: 10px;
            font-weight: bold;
            font-size: 14px;
          }

          /* =========================
   HEADER BOX (LETTERHEAD)
   ========================= */
.header-box {
  border: 2.5px solid #000;
  padding: 10px 14px;
  margin-bottom: 10px;
}

/* =========================
   FIELD LAYOUT (FORM STYLE)
   ========================= */
.field-row {
  display: flex;
  align-items: flex-end;
  gap: 6px;
  margin-bottom: 6px;
  flex-wrap: wrap;
}

.field-label {
  font-weight: 700;
  white-space: nowrap;
  font-size: 13px;
}

/* 🔥 MAIN UNDERLINE */
.field-value {
  border-bottom: 1px solid #000;
  min-height: 20px;
  flex: 1;
  display: inline-block;
}

/* 🔥 FULL WIDTH LINE (ADDRESS) */
.field-value-wide {
  border-bottom: 1px solid #000;
  width: 100%;
  min-height: 20px;
  display: block;
}
        `}</style>

          <div className="flex flex-col items-center gap-8 text-slate-900" style={{ fontFamily: "'Noto Sans Devanagari', 'Mangal', sans-serif" }}>

          {/* PAGE 1 */}
          <div className="a4-page">
            {/* STAMP PAPER TOP SPACE (REALISTIC) */}
            <div className="h-[300px]"></div>

            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold underline decoration-double">SALE AGREEMENT</h2>
            </div>

            {/* Party 1: Buyer */}
           <div className="mb-8">
  <div className="flex items-start mb-4">
    <div className="font-bold mr-4 leading-tight">
      <div>Party No. 01 – The Purchaser</div>
            <div>(Party Receiving the Deed):-</div>
    </div>

    <div className="flex-1 space-y-2">
                  <div className="flex items-end pb-1">
                    <span className="w-24 font-bold">(1) Name:-</span>
                    <span className="flex-1 border-b border-black inline-block min-h-[20px]">{[data?.client?.title, data.client.name].filter(Boolean).join(' ')}</span>
                  </div>
                  {/* Age + Gender */}
<div className="flex items-end pb-1">
  <span className="w-24 font-bold">Age:-</span>
  <span className="flex-1 border-b border-black inline-block min-h-[20px]">
    {data.client.age} Years
  </span>

  <span className="w-20 font-bold">Gender :-</span>
  <span className="w-24 border-b border-black inline-block min-h-[20px]">
    {data.client.gender}
  </span>
</div>

{/* Occupation (Separate Line) */}
<div className="flex items-end pb-1">
  <span className="w-40 font-bold">Occupation:-</span>
  <span className="flex-1 border-b border-black inline-block min-h-[20px]">
    {data.client.occupation}
  </span>


                  </div>
                  <div className="flex items-end pb-1">
                    <span className="w-24 font-bold">Address:-</span>
                    <span className="flex-1 border-b border-black inline-block min-h-[20px]">        
                        {`${data.client.address || ''}${ data.client.district ? `, ${data.client.district}` : ''}${data.client.state ? `, ${data.client.state}` : ''}${data.client.pincode ? ` - ${data.client.pincode}`: ''}`}
                    </span>
                  </div>
                  <div className="flex items-end pb-1">
                    <span className="w-40 font-bold">Aadhaar Number:-</span>
                    <span className="flex-1 border-b border-black inline-block min-h-[20px]">{(data.client.aadhaar || '').replace(/(\d{4})(?=\d)/g, '$1 ')}</span>
                  </div>
                  <div className="flex items-end pb-1">
                    <span className="w-40 font-bold">PAN Card Number:-</span>
                    <span className="flex-1 border-b border-black inline-block min-h-[20px]">{String(data.client.pan || '').toUpperCase()}</span>
                  </div>
                  <div className="flex items-end pb-1">
                    <span className="w-40 font-bold">Contact Number:-</span>
                    <span className="flex-1 border-b border-black inline-block min-h-[20px]">{data.client.phone}</span>
                  </div>
                  <div className="flex items-end pb-1">
                    <span className="w-24 font-bold">Email ID:-</span>
                    <span className="flex-1 border-b border-black inline-block min-h-[20px]">
                      {data.client.email}
                    </span>

            </div>
            </div>
            </div>

            </div>

            {/* =========================
            
   PARTY NO. 02 — SELLER
   ========================= */}
   <div className="mb-8">
  <div className="flex items-start mb-4">
    <div className="font-bold mr-4 leading-tight">
      <div className="flex justify-between w-full">
  <span>Party No. 02 – The Seller</span>
  <span className="invisible">abc</span>
</div>
            <div>(Party Giving the Deed):-</div>
    </div>

    <div className="flex-1 space-y-2">
                  <div className="flex items-end pb-1">
                    <span className="w-24 font-bold">(1) Name:-</span>
                    <div className="flex-1 border-b border-black inline-block min-h-[20px]">
          <div>
              <div>
  <div>
    Manager, {data.company.companyName || ''}, 
  </div>
  <div>
     {data.company.entityType || ''}
  </div>
</div>
          </div>
        
        </div>
      </div>


      {/* ADDRESS (AUTO FROM SETTINGS OFFICE ADDRESS) */}
      <div className="flex items-end pb-1">
        <span className="w-24 font-bold">Address:-</span>
        <span className="flex-1 border-b border-black inline-block min-h-[20px]">
          {[data.company.companyAddress, data.company.companyLocality, data.company.companyDistrict, data.company.companyState].filter(Boolean).join(', ')}{data.company.companyPincode? ` - ${data.company.companyPincode}` : ''}.
        </span>
      </div>

      {/* AADHAAR */}
      <div className="flex items-end pb-1">
        <span className="w-32 font-bold">Aadhaar No.:-</span>
        <span className="flex-1 border-b border-black inline-block min-h-[20px]">
          {data.manager?.managerAadhaar || ''}
        </span>
      </div>

      {/* PAN */}
      <div className="flex items-end pb-1">
        <span className="w-32 font-bold">PAN Card No.:-</span>
        <span className="flex-1 border-b border-black inline-block min-h-[20px]">
          {data.manager?.managerPAN || data.company.companyPan || ''}
        </span>
      </div>

      {/* CONTACT */}
      <div className="flex items-end pb-1">
        <span className="w-32 font-bold">Contact No.:-</span>
        <span className="flex-1 border-b border-black inline-block min-h-[20px]">
          {data.manager?.managerPhone
  ? `${data.manager.managerCountryCode || ''} ${data.manager.managerPhone}`
  : ''
}
        </span>
      </div>

      {/* UDYAM / LICENSE */}
<div className="flex flex-col pb-1">
  
  {/* LICENSE REGISTRATION — SINGLE LINE */}
<div className="flex items-end pb-1">
  <span className="w-56 font-bold whitespace-nowrap">
    License Registration No.:
  </span>
  <span className="flex-1 border-b border-black inline-block min-h-[20px]">
    {data.company?.licenseRegistrationNumber}
  </span>
</div>

  {/* LINE 2 — URC NUMBER */}
  <div className="flex items-end">
    <span className="w-40 font-bold">
      Udyam / URC No.:
    </span>
    <span className="flex-1 border-b border-black inline-block min-h-[20px]">
      {data.company.urcNumber}
    </span>
  </div>

</div>

    </div>
  </div>

             </div> 
               <PrintFooter />
             </div>

{/* PAGE 2 */}
<div className="a4-page" style={{ position: "relative" }}>
  {renderWatermark()}
  <div style={{ position: "relative", zIndex: 1 }}>
  </div>


  {/* Page Title */}
  <div className="text-center mb-6">
    <h2 className="text-[20px] font-bold underline tracking-wide">SALE AGREEMENT</h2>
  </div>

  {/* Page Content */}
  <div className="flex-1 whitespace-pre-line text-[14px] leading-[1.9] text-justify">

{`
1. This deed of agreement is entered into on the date ${data.property.bookingDate} Day ${data?.property?.bookingDay?.en || ''} with the complete mutual consent and willingness of both the above-mentioned parties. The complete details thereof are as follows:

2. That Party No. 02 has developed a commercial and residential plot layout named “${data.property.projectName}” on land which is in his ownership, possession, and title. This falls under the jurisdiction of Village/Mouza: ${data.property.locality}, Tehsil:- ${data.property.tehsil}, District:- ${data.property.district}. The Khasra Number is:- ${data.property.khasraNumber} and the Patwari Halka Number is:- ${data.property.surveyNumber}.

3. That on the above layout, Plot Number:- ${data.property.plotNumber} / (${data.property.plotNumber}), measuring ${data.property.area} / (${data.property.area} sq. ft. only), has been agreed to be allotted to Party No. 01 at the rate of ${data.property.rate} / (${data.property.rate} Only) Rupees per square foot. The complete details are as listed below.

4. That Party No. 01 has paid an amount of ₹${data.property.tokenAmount} / (${data.property.tokenAmount} only) Rupees as a Token/Booking amount on dated ${formatDate(data.property.bookingDate)} via ${data.property.paymentMode} (This amount shall NOT be refunded under any circumstances.)

5. That Party No. 01 has paid an advance amount of ₹${data.property.tokenAmount} / (${data.property.tokenAmount} only) Rupees by dated ${formatDate(data.property.bookingDate)} via ${data.property.paymentMode}. The Slip No. is: ${data.property.paymentMode !== 'Cash'? (data.property.paymentReference || '___________'): '___________'}. (In the event of cancellation of the deal, only 70% of this amount shall be refunded.)

6. That the total price of the above ${data.property.area}sq. ft. plot is ₹ ${data.property.totalAmount} / ((${data.property.totalAmount} only) Rupees. Out of this, Party No. 01 has already paid ₹ ${data.property.tokenAmount} / (${data.property.tokenAmount} only) Rupees to Party No. 02 up to the date of this agreement. The remaining balance of ₹ ${(Number(data.property.totalAmount || 0) - Number(data.property.tokenAmount || 0))} / (${Number(data.property.totalAmount || 0) - Number(data.property.tokenAmount || 0)} only) Rupees shall be paid by Party No. 01 to Party No. 02 in ${data.property.emiDuration} (${data.property.emiDuration}) easy monthly installments. Each monthly installment of Party No. 01 shall be ₹ (${emi}) Rupees. The amount after the decimal point (.00) may be rounded off; the final installment will be adjusted with the final balance.
`}
  </div>
    <PrintFooter />
</div>


{/* PAGE 3 */}
<div className="a4-page" style={{ position: "relative" }}>
  {renderWatermark()}
  <div style={{ position: "relative", zIndex: 1 }}>
  </div>

  {/* Page Title */}
  <div className="text-center mb-6">
    <h2 className="text-[20px] font-bold underline tracking-wide">SALE AGREEMENT</h2>
  </div>

  {/* Page Content */}
  <div className="flex-1 whitespace-pre-line text-[14px] leading-[1.9] text-justify">

{`
7. That the last monthly installment of the above plot shall fall on dated: ${formatDate(lastInstallmentDate)}, and this agreement shall be deemed concluded on dated: ${formatDate(agreementEndDate)} after which no installment shall be accepted. If any payment is still due for the above plot, Party No. 02's decision shall be final in such matters — whether to accept the remaining amount and transfer the plot to Party No. 01, or to deduct the amount as per the terms of this agreement and return the balance by cheque within a maximum of six months after the agreement period ends, or to charge 10% monthly compound interest on the outstanding balance and thereafter transfer the plot. Party No. 01 accepts this in all forms from now.
8. The complete details of the above plot are as follows:
    Plot:- ${data.property.plotNumber} / (${data.property.plotNumber}), Total: ${data.property.area} sq. ft.)
    East Side:- _______
    West Side:- ________ Plot Number_______
    North Side:- ________ Plot Number_______
	South Side:- ________ Plot Number
    Khasra Number:- ________
9. The development works to be provided by Ashray Group on the above layout at the above agreed price:
	(a) That all the roads of the above layout shall be provided in Murrum (gravel/compacted soil) grade only.
	(b) That the public utility space of the above layout shall be developed, including trees, plants, etc.								
    (c) That only electricity poles shall be installed on the above layout.
10. Benefits to be provided to Party No. 01:
	(a) That if Party No. 01 completes full payment of the above plot amount within the last day of 1 (one) year from the plot booking date ${formatDate(data.property.bookingDate)}, Party No. 01 shall receive a 5% discount on the total price of the plot as a bonus.
	(b) That if Party No. 01 completes full payment of the above plot amount within the last day of 2 (two) years from the plot booking date ${formatDate(data.property.bookingDate)}, Party No. 01 shall receive a 3% discount on the total price of the plot as a bonus.
    (c) That if Party No. 01 completes full payment of the above plot amount by the last day of the agreement from the plot booking date ${formatDate(agreementEndDate)}, Party No. 01 shall receive a 1.00% discount on the total price of the plot as a bonus.
`}
  </div>
    <PrintFooter />
</div>


{/* PAGE 4 */}
<div className="a4-page" style={{ position: "relative" }}>
  {renderWatermark()}
  <div style={{ position: "relative", zIndex: 1 }}>
  </div>

  {/* Page Title */}
  <div className="text-center mb-6">
    <h2 className="text-[20px] font-bold underline tracking-wide">SALE AGREEMENT</h2>
  </div>

  {/* Page Content */}
  <div className="flex-1 whitespace-pre-line text-[14px] leading-[1.9] text-justify">

{`
    11. The terms and conditions of this agreement are as follows:
     
    (a) That Party No. 01 shall be required to pay the installment of the above plot by the 10th of every month under all circumstances. If the installment is paid on the 11th, an additional 10% interest on the total installment amount shall be mandatorily paid as a late fee. Party No. 01 may use net banking, mobile wallet, bank cheque, or any other mode for making the installment payment.
    (b) That if Party No. 01 is unable to pay the installment in any month, Party No. 01 must necessarily inform the office through the office contact number or the officer's contact number; otherwise, an additional 10% interest on the installment amount shall be mandatorily paid as a late fee.
    (c) That if Party No. 01 fails to pay three consecutive installments without any notice under any circumstances, this agreement shall stand void, and the above plot shall be allotted to another person without informing Party No. 01, and the plot shall not be given to Party No. 01. However, until Party No. 01 submits a self-signed cancellation application to this office, monthly installment late charges shall continue to accrue against Party No. 01. If Party No. 01 files a case in court against this, Party No. 01 shall be liable to punishment under the Indian Penal Code for breach of this agreement.
    (d) That if Party No. 01, even after cancellation of the agreement, violates Sub-clause (c) of Clause 11 and applies again at this office for the above plot, and if the above plot has not yet been allotted to anyone else, then Party No. 01 shall be required to pay additional 10% (ten percent) monthly compound interest as a late fee on all missed installments, and shall also be required to submit an affidavit in writing promising never to repeat such mistakes in the future.
    (e) That if this agreement is cancelled due to any reason on the part of Party No. 01, after deducting the advance payment and token amount as per Clauses 4 and 5 above, 30% (thirty percent) of the remaining amount shall be deducted as a penalty from the balance amount. Additionally, late fees on unpaid installments as specified above shall also be deducted from the remaining 70% (seventy percent) balance, and the remaining money shall be refunded to Party No. 01 by cheque within a maximum of six months after the agreement period ends. Party No. 01 shall not interfere in any manner in between. If Party No. 01 does so, Party No. 01 shall be liable to punishment under the Indian Penal Code for breach of this agreement.
`}
  </div>
    <PrintFooter />
</div>

{/* PAGE 5 */}
<div className="a4-page" style={{ position: "relative" }}>
  {renderWatermark()}
  <div style={{ position: "relative", zIndex: 1 }}>
  </div>

  {/* Page Title */}
  <div className="text-center mb-6">
    <h2 className="text-[20px] font-bold underline tracking-wide">SALE AGREEMENT</h2>
  </div>

  {/* Page Content */}
  <div className="flex-1 whitespace-pre-line text-[14px] leading-[1.9] text-justify">

{`
    (f) That all expenses for the sale deed / sale agreement / power of attorney of the above plot shall be borne by Party No. 01. Additionally, all government taxes including state, gram panchayat, nagar panchayat, and any other government levies shall also be paid by Party No. 01.
    (g) That the complete responsibility of getting the entire layout approved under NMRDA / Gunthewari Act, and for developing the entire layout in accordance with NMRDA / Gunthewari Act (including roads, electricity, water supply, sewage drainage, and all other works required under the said law) lies with Party No. 02. However, all expenses incurred for this entire work shall be paid separately by Party No. 01 on a per square foot basis. Party No. 02 shall utilize this payment for the said development work, and the remaining amount shall be deposited as government fees in the NMRDA / Gunthewari office as per the applicable rules.
    (h) That the sale deed / sale agreement / power of attorney of the above plot shall be executed within a maximum of six months after Sub-clause (g) of Clause 11 is completed. Party No. 01 shall not compel Party No. 02 in any manner to execute the sale deed / sale agreement / power of attorney before the development works are completed and before all government fees are paid.
    (i) That the sale deed / sale agreement / power of attorney of the above plot shall be made only in the name of Party No. 01 or his/her blood relative / spouse. If Party No. 01 wishes to have it executed in the name of any other person, Party No. 01 shall be required to make an additional payment of 10% transfer charges to Party No. 02 based on the market value of the plot at that time. Party No. 01 accepts this.
    (j) That before executing the sale deed / sale agreement / power of attorney of the above plot, this agreement and all payment receipts along with any documents / papers issued by this office to Party No. 01 related to this transaction must be mandatorily submitted to this office without any question.
    (k) That if Party No. 01 does not have the payment receipt, Party No. 01 must deposit Rs. 100/- (One Hundred only) per receipt and obtain a duplicate copy from this office and then submit the same. Only thereafter shall the sale deed / sale agreement / power of attorney be executed. Party No. 01 shall not compel in any manner for this work without submitting all documents. If Party No. 01 does so, Party No. 01 shall be liable to punishment under the provisions of the Indian Penal Code.
    
`}
  </div>
    <PrintFooter />
</div>


{/* PAGE 6 */}
<div className="a4-page" style={{ position: "relative" }}>
  {renderWatermark()}
  <div style={{ position: "relative", zIndex: 1 }}>
  </div>

  {/* Page Title */}
  <div className="text-center mb-6">
    <h2 className="text-[20px] font-bold underline tracking-wide">SALE AGREEMENT</h2>
  </div>

  {/* Page Content */}
  <div className="flex-1 whitespace-pre-line text-[14px] leading-[1.9] text-justify">

{`
   (l) That if this agreement itself is lost, the decision of the Administrative Officer of this office shall be final and binding in that regard, which Party No. 01 accepts in all forms from now.
   (m) That this agreement for the above plot has been made exclusively with Party No. 01. If in the future Party No. 02 enters into an agreement for this plot with any other person while Party No. 01's agreement is still valid, or if such an agreement has already been executed and remains valid up to the date of completion of this agreement, then Party No. 02 shall be liable to punishment under the provisions of the Indian Penal Code.
   (n) That if anything happens to Party No. 02 before the sale deed / sale agreement / power of attorney of the above plot is registered in favor of Party No. 01, then the legal heirs of Party No. 02 shall complete this work as per this agreement and shall execute the sale deed / sale agreement / power of attorney of the above plot in favor of Party No. 01. Party No. 02 hereby grants this right to his/her successors/heirs within this agreement itself, so that Party No. 01 does not face any kind of problem in the future.
   (o) That the plot number assigned to Party No. 01 at this time may be changed in the future; however, the location of the plot shall not change. But if any mandatory changes are required in the entire layout as per NMRDA / Gunthewari Act which result in a change of location, Party No. 01 shall fully cooperate and agrees completely to this, and shall not raise any dispute in the future. If Party No. 01 does so, Party No. 01 shall be liable to punishment under the provisions of the Indian Penal Code for breach of agreement, which Party No. 01 accepts from now.
   (p) That Party No. 01 shall be added to a WhatsApp Broadcast Group. If Party No. 01 does not use WhatsApp, all information such as installment payment reminders, document-related information, agreement-related information, notices, and all other communications shall be provided via SMS or phone call. All such communications provided by the office shall be fully authenticated, and Party No. 01 shall take all of them with complete seriousness. If Party No. 01 does not take them seriously and acts in violation of the agreement, Party No. 01 shall be deemed guilty of breach of agreement and shall be acted upon accordingly.
   (q) That if the contact number registered by Party No. 01 at the time of the agreement is changed or permanently deactivated for any reason, Party No. 01 must promptly inform this office and register a new contact number. If Party No. 01 fails to do so and the office is unable to reach Party No. 01, Party No. 01 alone shall be fully responsible for the consequences.
   
`}
  </div>
    <PrintFooter />
</div>



{/* PAGE 7 */}
<div className="a4-page" style={{ position: "relative" }}>
  {renderWatermark()}
  <div style={{ position: "relative", zIndex: 1 }}>
  </div>

  {/* Page Title */}
  <div className="text-center mb-6">
    <h2 className="text-[20px] font-bold underline tracking-wide">SALE AGREEMENT</h2>
  </div>
{/* Page Content */}
  <div className="flex-1 whitespace-pre-line text-[14px] leading-[1.9] text-justify">

{`
  (r) That if any legal dispute or any other legal problem is raised on the entire above layout land by any third party / parties in the future, Party No. 01 shall peacefully cooperate until the dispute/problem is resolved and shall continue making payments as per the above rules. If payments are stopped, Party No. 01 shall pay the applicable late charges as per the above rules, and shall not raise any dispute in any form or manner.
   (s) That both of us parties are in complete possession of our senses, have not consumed any intoxicant of any kind, and neither of us is mentally ill. We are in complete good health and swear that we shall fulfill all the terms and conditions of this agreement with full responsibility. If either of us acts contrary to this agreement, that party shall be legally liable to punishment, and both parties fully agree to this.
`}
  </div>
  {/* Section 12 */}
<div className="text-[15px] leading-[1.9] text-justify">

  <p className="font-bold mb-2">
    12. Special Note (if any):
  </p>

  {/* 🔥 HANDWRITING SPACE (HALF PAGE) */}
  <div className="h-[35vh] border border-black mt-2"></div>

</div>
{/* Nominee Section */}
<div className="mt-6 text-[15px] space-y-6">

  <p className="font-bold">13. Nominees:</p>

  {/* Nominee 1 */}
  <div className="space-y-3">

    <div className="flex items-end gap-2">
      <span className="w-19 font-bold">(a) Name:-</span>
      <span className="flex-1 border-b border-black min-h-[20px]">
        {`${data.client.nominee1Title || ''} ${data.client.nominee1Name || ''}`.trim()}
      </span>
    </div>

    <div className="space-y-3">

  {/* AGE + YEAR + OCCUPATION */}
  <div className="flex items-end gap-6">

    {/* AGE */}
    <div className="flex items-end gap-2 flex-1">
      <span className="w-10 font-bold">Age:-</span>
      <span className="flex-1 border-b border-black min-h-[20px]">
        {data.client.nominee1Age}
      </span>
    </div>

    {/* OCCUPATION */}
    <div className="flex items-end gap-2 flex-1">
      <span className="w-19 font-bold">Occupation:-</span>
      <span className="flex-1 border-b border-black min-h-[20px]">
        {data.client.nominee1Occupation}
      </span>
    </div>

  </div>

  {/* AADHAAR */}
  <div className="flex items-end gap-3">
    <span className="w-30 font-bold">Aadhaar Number:-</span>
    <span className="flex-1 border-b border-black min-h-[20px]">
      {(data.client.nominee1Aadhaar || '').replace(/(\d{4})(?=\d)/g, '$1 ')}
    </span>
  </div>

</div>

  </div>

  {/* Nominee 2 */}
  <div className="space-y-3">

    <div className="flex items-end gap-2">
      <span className="w-19 font-bold">(b) Name:-</span>
      <span className="flex-1 border-b border-black min-h-[20px]">
        {`${data.client.nominee2Title || ''} ${data.client.nominee2Name || ''}`.trim()}
      </span>
    </div>

    <div className="space-y-3">

  {/* AGE + YEAR + OCCUPATION */}
  <div className="flex items-end gap-6">

    {/* AGE */}
    <div className="flex items-end gap-2 flex-1">
      <span className="w-10 font-bold">Age:-</span>
      <span className="flex-1 border-b border-black min-h-[20px]">
        {data.client.nominee2Age}
      </span>
    </div>

    {/* OCCUPATION */}
    <div className="flex items-end gap-2 flex-1">
      <span className="w-19 font-bold">Occupation:-
      </span>
      <span className="flex-1 border-b border-black min-h-[20px]">
       {data.client.nominee2Occupation}
      </span>
    </div>

  </div>

  {/* AADHAAR */}
  <div className="flex items-end gap-3">
    <span className="w-30 font-bold">Aadhaar Number:-</span>
    <span className="flex-1 border-b border-black min-h-[20px]">
      {(data.client.nominee2Aadhaar || '').replace(/(\d{4})(?=\d)/g, '$1 ')}
    </span>
  </div>

</div>

  </div>
    </div>
    <PrintFooter />
</div>
  
      

  {/* PAGE 8 */}
<div className="a4-page" style={{ position: "relative" }}>
  {renderWatermark()}
  <div style={{ position: "relative", zIndex: 1 }}>
  </div>

  {/* Page Title */}
  <div className="text-center mb-6">
    <h2 className="text-[20px] font-bold underline tracking-wide">SALE AGREEMENT</h2>
  </div>

  {/* Signatures */}
<div className="mt-12 text-[15px] space-y-10">

  {/* PARTY SIGNATURES (SIDE BY SIDE) */}
  <div className="grid grid-cols-2 gap-12">

    {/* SELLER / COMPANY */}
    <div className="text-center">
      <p className="font-bold mb-2">14. Signature of the Party Giving the Deed (Party No. 02):</p>

      <div className="h-20"></div>

      <p className="font-bold">(_____________________)</p>

      <p className="mt-2 font-semibold">Manager</p>
      <p className="font-semibold">{data.company.companyName || ''} ({data.company.entityType})</p>
    </div>

    {/* BUYER / CLIENT */}
    <div className="text-center">
      <p className="font-bold mb-2">15. Signature of the Party Receiving the Deed (Party No. 01):</p>

      <div className="h-20"></div>

      <p className="font-bold">
        {`${data?.client?.title || ''} ${data.client.name || ''}`.trim() || '_____________________'}
      </p>

      <p className="mt-2 font-semibold">Member / Purchaser</p>
    </div>

  </div>

  {/* WITNESSES */}
  <div className="mt-28">

  <p className="font-bold mb-6">16. Signatures of Witnesses:</p>

  <div className="space-y-10">

      <div>
        <div className="h-16"></div>
        <p>(a) __________________________</p>
      </div>

      <div>
        <div className="h-16"></div>
        <p>(b) __________________________</p>
      </div>

    </div>
  </div>

{/* END */}
<div className="mt-auto pt-16 text-center space-y-2">

    <p className="text-[18px] tracking-widest font-bold">
    * * * END * * *
  </p>

  <p className="text-[12px] tracking-wide font-medium break-words">
    {`${data.client.folderSerial || ''}-${data.client.clientId || ''}-P${data?.property?.plotNumber || ''}-${data?.property?.projectName || ''}-${data?.property?.khasraNumber || data?.property?.surveyNumber || ''}-${data?.property?.locality || ''}-${data?.property?.district || ''}-${data?.property?.state || ''}-${data?.property?.pincode || ''}`}
  </p>


</div>
    </div>
        <PrintFooter />
    </div>

        {/* PAGE 9 — FINAL CLEAN SEPARATE PAGE */}
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
  <div className="header-box">

    {/* Top Row */}
    <div className="flex justify-between text-sm font-bold mb-2">
      <div>Reg No : {data.company?.licenseRegistrationNumber}</div>
      <div>EST. 2019</div>
    </div>

    {/* Center Branding */}
    <div className="flex flex-col items-center text-center">

      <div className="flex items-center justify-center gap-3">

  {/* ASHRAY */}
  <span
    className="text-[52px] font-extrabold font-serif leading-tight"
    style={{
      background: "linear-gradient(180deg, #FF3A3A 0%, #FF1E2D 60%, #D9001B 100%)",
      WebkitBackgroundClip: "text",
      WebkitTextFillColor: "transparent",
    }}
  >
    Ashray
  </span>

  {/* LOGO */}
  <img
    src={companyLogo || ''}
    style={{
      width: "60px",
      height: "60px",
      objectFit: "contain",
    }}
  />

  {/* GROUP */}
  <span
    className="text-[52px] font-extrabold font-serif leading-tight"
    style={{
      background: "linear-gradient(180deg, #FF3A3A 0%, #FF1E2D 60%, #D9001B 100%)",
      WebkitBackgroundClip: "text",
      WebkitTextFillColor: "transparent",
    }}
  >
    Group
  </span>

</div>

      <div className="text-sm font-semibold mt-2">
        Mob: +91 {data.manager?.managerPhone || data.company?.managerPhone} &nbsp;|&nbsp; Mail: {data.company?.companyEmail} &nbsp;|&nbsp; Website: {data.company?.companyWebsite}
      </div>

      <div className="text-sm mt-1">
        {[data.company.companyAddress, data.company.companyLocality, data.company.companyDistrict, data.company.companyState].filter(Boolean).join(', ')}{data.company.companyPincode? ` - ${data.company.companyPincode}` : ''}.
      </div>

    </div>
  </div>

  {/* TITLE */}
<div className="mt-10 flex items-center justify-center relative">

  {/* CENTER TITLE */}
  <div className="font-serif text-[16px] font-bold tracking-[1.5px] uppercase text-indigo-600 underline underline-offset-4">
    Certificate of Declaration
  </div>

  {/* RIGHT DATE (NOW PERFECTLY ALIGNED TO TITLE LINE) */}
  <div className="absolute right-0 text-[11px] font-semibold">
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

  {/* CONTENT BLOCK */}
<div className="mt-6 space-y-4 text-[14px]">

  {/* LINE 1 — NAME + AADHAAR */}
  <div className="field-row flex items-end gap-4">

    {/* NAME */}
    <div className="flex items-end flex-1">
      <span className="field-label mr-2 whitespace-nowrap">1. Name:-</span>
      <span className="field-value flex-1">
        {[data?.client?.title, data.client.name].filter(Boolean).join(' ')}
      </span>
    </div>

    {/* AADHAAR */}
    <div className="flex items-end w-[260px]">
      <span className="field-label mr-2 whitespace-nowrap">2. Aadhaar No.:-</span>
      <span className="field-value flex-1">
        {(data.client.aadhaar)}
      </span>
    </div>

  </div>

  {/* LINE 2 — ADDRESS */}
  <div className="field-row items-start">
    <span className="field-label">3. Address:-</span>

    <div className="flex-1">
      <div className="field-value-wide">
          {`${data.client.address || ''}${ data.client.district ? `, ${data.client.district}` : ''}${data.client.state ? `, ${data.client.state}` : ''}${data.client.pincode ? ` - ${data.client.pincode}`: ''}`}
      </div>
    </div>
  </div>

  {/* LINE 3 — MOBILE */}
  <div className="field-row">
    <span className="field-label">4. Contact No.:-</span>
    <span className="field-value">
      {(data.client.phone)}
    </span>
  </div>

</div>

  {/* Page Content */}
  <div className="flex-1 whitespace-pre-line text-[15.5px] leading-[1.9] text-justify">

{`
1.  I, the undersigned Owner and Accounts & Administration Head {(Ashray Group)(S.P.)}, hereby certify that I have read and understood the entire agreement, and that both signatories to the agreement are in complete sound health and have signed before me of their own free will and happiness, without any intoxication or pressure of any kind.
2.  I hereby swear that I will always keep both parties aware of the compliance of all the rules and conditions of this agreement. Even after this, if anyone violates this agreement, then by virtue of being the Administration Head {(Ashray Group)(S.P.)}, I will not back down in any way from ensuring that they are punished according to the rules of the Indian Constitution. In any kind of disputed situation, the decision of the Administration Head {(Ashray Group)(S.P.)} shall be the final decision, which is acceptable to both parties.
`}
  </div>

  {/* FOOTER BLOCK (PLACE + DATE + AUTHORITY) */}
<div className="mt-auto pt-20">

  <div className="flex justify-between items-end">

    {/* LEFT SIDE — PLACE & DATE (IMPROVED LEGAL FORMAT) */}
<div className="text-[14px] leading-tight">

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

    {/* RIGHT SIDE — FIXED AUTHORITY (IMPROVED) */}
<div className="text-right">

  <div className="font-bold text-[15px] leading-tight">
      {data.manager?.managerName ? `(${data.manager.managerName})` : ''}
  </div>

  <div className="mt-2 text-[14px] leading-tight">
    Owner
  </div>

  <div className="text-[14px] leading-tight">
    Accts & Administration Head
  </div>

  <div className="mt-2 font-semibold text-[14px] leading-tight">
  <div>{data.company.companyName || ''}</div>
  <div>{data.company.entityType}</div>
</div>

</div>
  </div>
    </div>
  </div>
  </div>
  </div>
      <PrintFooter />

  </div>
  


  );
};

export default EnglishAgreement;