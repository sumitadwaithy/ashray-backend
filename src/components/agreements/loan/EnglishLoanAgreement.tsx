import React from 'react';
import { PrintFooter } from '../../../../components/Printpreview';

interface ClientData {
  title?: string;
  name: string;
  age?: string | number;
  occupation?: string;
  phone: string;
  email?: string;
  aadhaar?: string;
  pan?: string;
  address?: string;
  fatherHusbandName?: string;
  folderSerial?: string;
  clientId?: string;
}

interface CompanyData {
  companyName?: string;
  entityType?: string;
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
  managerAddress?: string;
  managerPAN?: string;
  managerAadhaar?: string;
  managerPhone?: string;
  managerCountryCode?: string;
}

interface GuarantorData {
  name: string;
  phone: string;
  relation: string;
  address?: string;
  aadhaar?: string;
  pan?: string;
}

interface AgreementData {
  client: ClientData;
  company: CompanyData;
  manager?: ManagerData;
  guarantors?: GuarantorData[];
  loanAmount?: string | number;
  loanDuration?: string;
  loanDate?: string;
  loanPurpose?: string;
  repaymentMode?: string;
  interestRate?: string;
  interestType?: string;
  monthlyEMI?: string | number;
  collateral?: string;
  collateralType?: string;
  collateralValue?: string | number;
  collateralDetails?: string;
  loanId?: string;
}

const formatDate = (dateStr?: string) => {
  if (!dateStr) return '________';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr;
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
};

const safe = (v?: any) => (!v || v === '') ? '____________________' : String(v);

const formatAmount = (v?: string | number) => {
  if (!v) return '________';
  return Number(v).toLocaleString('en-IN');
};

const numberToWords = (num: number): string => {
  if (num === 0) return 'Zero';
  const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
  const convertBelowThousand = (n: number): string => {
    if (n === 0) return '';
    if (n < 20) return ones[n];
    if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 ? ' ' + ones[n % 10] : '');
    return ones[Math.floor(n / 100)] + ' Hundred' + (n % 100 ? ' ' + convertBelowThousand(n % 100) : '');
  };
  const convert = (n: number): string => {
    if (n === 0) return '';
    const crore = Math.floor(n / 10000000);
    const lakh = Math.floor((n % 10000000) / 100000);
    const thousand = Math.floor((n % 100000) / 1000);
    const hundred = Math.floor((n % 1000) / 100);
    const remainder = n % 100;
    let result = '';
    if (crore) result += convertBelowThousand(crore) + ' Crore ';
    if (lakh) result += convertBelowThousand(lakh) + ' Lakh ';
    if (thousand) result += convertBelowThousand(thousand) + ' Thousand ';
    if (hundred) result += convertBelowThousand(hundred) + ' Hundred ';
    if (remainder) result += convertBelowThousand(remainder);
    return result.trim();
  };
  return convert(Math.floor(num)) + (num % 1 !== 0 ? ' and ' + Math.round((num % 1) * 100) + '/100' : '') + ' Only';
};

const sharedStyles = `
  .a4-page {
    width: 210mm;
    min-height: 297mm;
    margin: 0 auto;
    background: white;
    padding: 15mm 18mm;
    box-sizing: border-box;
    page-break-after: always;
    box-shadow: 0 0 10px rgba(0,0,0,0.1);
    font-family: 'Times New Roman', 'Georgia', serif;
    position: relative;
    line-height: 1.6;
  }
  @media print {
    @page { size: A4; margin: 0; }
    html, body { width: 210mm; margin: 0; padding: 0; background: white; }
    body * { visibility: hidden; }
    #printable-document, #printable-document * { visibility: visible; }
    #printable-document { position: absolute; left: 0; top: 0; width: 210mm; }
    .a4-page { width: 210mm; min-height: 297mm; padding: 15mm 18mm; margin: 0; box-shadow: none; page-break-after: always; }
    .a4-page:last-child { page-break-after: auto; }
    .no-print { display: none !important; }
    * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
  }
  .agreement-title {
    text-align: center;
    font-size: 22px;
    font-weight: 800;
    text-decoration: underline;
    text-underline-offset: 5px;
    margin: 30px 0 10px 0;
    letter-spacing: 1.5px;
  }
  .sub-title {
    text-align: center;
    font-size: 14px;
    font-weight: 600;
    color: #444;
    margin-bottom: 30px;
  }
  .clause {
    font-size: 13px;
    line-height: 1.9;
    text-align: justify;
    margin-bottom: 12px;
  }
  .clause-num {
    font-weight: 800;
  }
  .sig-section {
    display: flex;
    justify-content: space-between;
    margin-top: 40px;
    gap: 30px;
  }
  .sig-block {
    flex: 1;
    font-size: 13px;
  }
  .sig-line {
    border-bottom: 1px solid #000;
    min-height: 50px;
    margin: 8px 0;
  }
  .sig-label {
    font-weight: 700;
    font-size: 13px;
  }
  .end-text {
    text-align: center;
    font-weight: 800;
    font-size: 14px;
    margin-top: 30px;
    letter-spacing: 3px;
  }
  .party-details {
    width: 100%;
    border-collapse: collapse;
    margin: 20px 0;
    font-size: 13px;
  }
  .party-details td {
    padding: 6px 10px;
    border: 1px solid #ccc;
    vertical-align: top;
  }
  .party-details td:first-child {
    font-weight: 700;
    width: 30%;
    background: #f9f9f9;
  }
  .loan-terms-table {
    width: 100%;
    border-collapse: collapse;
    margin: 20px 0;
    font-size: 13px;
  }
  .loan-terms-table td {
    padding: 6px 10px;
    border: 1px solid #ccc;
  }
  .loan-terms-table td:first-child {
    font-weight: 700;
    width: 40%;
    background: #f9f9f9;
  }
  .doc-id-bar {
    padding: 6px 10px;
    background: #fef9c3;
    border: 1px solid #fde047;
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 11px;
    font-weight: 600;
    font-family: monospace;
    margin-bottom: 6px;
  }
  .header-box {
    border: 2.5px solid #000;
    padding: 8px 12px;
    margin-bottom: 6px;
  }
  .witness-section {
    margin-top: 30px;
    font-size: 13px;
  }
`;

const EnglishLoanAgreement: React.FC<{ data: AgreementData }> = ({ data, companyLogo, companyWatermark }) => {
  const borrowerName = [data.client.title, data.client.name].filter(Boolean).join(' ');
  const lenderDisplay = `${data.company.companyName || ''}${data.company.entityType ? ` (${data.company.entityType})` : ''}`;
  const borrowerAddress = data.client.address || '';
  const companyFullAddress = [data.company.companyAddress, data.company.companyLocality, data.company.companyDistrict, data.company.companyState].filter(Boolean).join(', ') + (data.company.companyPincode ? ` - ${data.company.companyPincode}` : '');
  const agreementDate = formatDate(data.loanDate);
  const amountNum = Number(data.loanAmount) || 0;
  const amountWords = numberToWords(amountNum);

  return (
    <div id="printable-document" className="flex flex-col items-center">
      <style>{sharedStyles}</style>
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

          <div className="doc-id-bar">
            <span className="font-mono">{`${data.client.folderSerial || ''}-${data.client.clientId || data.loanId || ''}-LOAN-AGR`}</span>
            <span><strong>Date: </strong>{agreementDate}</span>
          </div>

          <div className="agreement-title">LOAN AGREEMENT</div>
          <div className="sub-title">(General Private Loan Agreement between Lender and Borrower)</div>

          {/* PARTIES */}
          <div className="clause" style={{ marginBottom: '18px' }}>
            This Loan Agreement (hereinafter referred to as the <strong>"Agreement"</strong>) is made and entered into on this <strong>{agreementDate}</strong> at <strong>{data.company.companyDistrict || '________'}</strong>.
          </div>

          <div className="clause" style={{ marginBottom: '6px' }}>
            <strong>BETWEEN</strong>
          </div>
          <div className="clause">
            <strong>{lenderDisplay}</strong>, having its registered office at {companyFullAddress} (hereinafter referred to as the <strong>"Lender"</strong>, which expression shall mean and include its successors and assigns) of the <strong>FIRST PART</strong>.
          </div>

          <div className="clause" style={{ marginBottom: '6px', marginTop: '10px' }}>
            <strong>AND</strong>
          </div>
          <div className="clause">
            <strong>{borrowerName}</strong>, {data.client.fatherHusbandName ? `S/o ${data.client.fatherHusbandName}, ` : ''}Age: {safe(data.client.age)} Years, Occupation: {safe(data.client.occupation)}, Aadhaar: {safe(data.client.aadhaar)}, PAN: {safe(data.client.pan)}, Residing at: {borrowerAddress} (hereinafter referred to as the <strong>"Borrower"</strong>, which expression shall mean and include his/her heirs, legal representatives, successors, and assigns) of the <strong>SECOND PART</strong>.
          </div>

          <div className="clause" style={{ marginBottom: '6px', marginTop: '10px' }}>
            <strong>AND</strong>
          </div>
          <div className="clause">
            The Borrower named above and the Lender named above are hereinafter individually referred to as a <strong>"Party"</strong> and collectively as the <strong>"Parties"</strong>.
          </div>

          {/* NOW IT IS HEREBY AGREED */}
          <div style={{ marginTop: '20px', textAlign: 'center', fontWeight: 800, fontSize: '16px', textDecoration: 'underline', textUnderlineOffset: '4px', marginBottom: '16px' }}>
            NOW THIS AGREEMENT WITNESSETH AS FOLLOWS:
          </div>

          {/* LOAN TERMS TABLE */}
          <table className="loan-terms-table">
            <tbody>
              <tr><td>Loan Amount (Principal)</td><td>₹ {formatAmount(data.loanAmount)} /- ({amountWords})</td></tr>
              <tr><td>Purpose of Loan</td><td>{safe(data.loanPurpose)}</td></tr>
              <tr><td>Date of Disbursement</td><td>{agreementDate}</td></tr>
              <tr><td>Loan Duration</td><td>{safe(data.loanDuration)}</td></tr>
              <tr><td>Rate of Interest</td><td>{safe(data.interestRate)}</td></tr>
              <tr><td>Interest Type</td><td>{safe(data.interestType)}</td></tr>
              <tr><td>Mode of Repayment</td><td>{safe(data.repaymentMode)}</td></tr>
              <tr><td>Monthly Instalment (EMI)</td><td>₹ {formatAmount(data.monthlyEMI)} /-</td></tr>
            </tbody>
          </table>

          {/* CLAUSES */}
          <div className="clause">
            <span className="clause-num">1. </span>
            <strong>LOAN GRANT:</strong> The Lender has granted and the Borrower has accepted a loan of ₹ {formatAmount(data.loanAmount)}/- (Rupees {amountWords}) (hereinafter referred to as the <strong>"Loan Amount"</strong>) for the purpose of {safe(data.loanPurpose)}. The Borrower acknowledges receipt of the Loan Amount in full on the date of this Agreement.
          </div>

          <div className="clause">
            <span className="clause-num">2. </span>
            <strong>REPAYMENT TERMS:</strong> The Borrower agrees and undertakes to repay the Loan Amount together with interest at the rate of {safe(data.interestRate)} ({safe(data.interestType)} interest basis) to the Lender in accordance with the repayment schedule. The Borrower shall pay a monthly instalment of ₹ {formatAmount(data.monthlyEMI)}/- or such other amount as mutually agreed, until the entire Loan Amount and accrued interest are repaid in full. The Borrower may prepay the loan in part or in full at any time without any prepayment penalty.
          </div>

          <div className="clause">
            <span className="clause-num">3. </span>
            <strong>INTEREST:</strong> Interest shall be calculated on the outstanding principal amount at the rate of {safe(data.interestRate)} per annum on a {safe(data.interestType)} interest basis. Interest shall accrue from the date of disbursement until the date of full repayment. In the event of default in payment of any instalment, the Lender reserves the right to charge additional interest at such rate as the Lender may determine, not exceeding {safe(data.interestRate)} per annum.
          </div>

          <div className="clause">
            <span className="clause-num">4. </span>
            <strong>PURPOSE OF LOAN:</strong> The Borrower represents and warrants that the Loan Amount shall be utilised solely for the purpose of {safe(data.loanPurpose)}. The Borrower shall not divert or utilise the Loan Amount for any unlawful, speculative, or prohibited purpose. The Lender shall have the right to verify the utilisation of the Loan Amount at any reasonable time.
          </div>

          {data.collateralType && data.collateralType !== 'NON_COLLATERAL' && (
            <div className="clause">
              <span className="clause-num">5. </span>
              <strong>COLLATERAL SECURITY:</strong> The Borrower has provided collateral security in the form of {safe(data.collateralType)} valued at approximately ₹ {formatAmount(data.collateralValue)}/-, details: {safe(data.collateralDetails)}. The Borrower agrees that the Lender shall hold the collateral as security until the Loan Amount and all accrued interest are fully repaid. In the event of default, the Lender shall have the right to liquidate the collateral and recover the outstanding dues.
            </div>
          )}

          {(!data.collateralType || data.collateralType === 'NON_COLLATERAL') && (
            <div className="clause">
              <span className="clause-num">5. </span>
              <strong>SECURITY:</strong> This loan is an unsecured personal loan granted based on the trust and creditworthiness of the Borrower. The Borrower agrees that this Agreement shall constitute sufficient proof of the debt and shall be binding on the Borrower.
            </div>
          )}

          <div className="clause">
            <span className="clause-num">{data.collateralType && data.collateralType !== 'NON_COLLATERAL' ? '6' : '6'}. </span>
            <strong>DEFAULT AND CONSEQUENCES:</strong> If the Borrower fails to pay any instalment within the stipulated time, the Borrower shall be considered in default. Upon default, the Lender may recall the entire outstanding Loan Amount together with accrued interest immediately. The Borrower shall be liable to pay all costs, including legal costs, incurred by the Lender for recovery of the dues.
          </div>

          <div className="clause">
            <span className="clause-num">7. </span>
            <strong>REPRESENTATIONS AND WARRANTIES:</strong> The Borrower represents and warrants that all information provided by the Borrower including personal details, identity documents, financial information, and any other information furnished to the Lender is true, complete, and accurate. The Borrower agrees to immediately notify the Lender of any change in the Borrower's contact details, address, or other relevant information.
          </div>

          {data.guarantors && data.guarantors.length > 0 && data.guarantors.some(g => g.name) && (
            <>
              <div className="clause">
                <span className="clause-num">8. </span>
                <strong>GUARANTOR UNDERTAKING:</strong> The following persons have agreed to stand as guarantors for the Loan Amount and guarantee the repayment thereof:
                <table className="loan-terms-table" style={{ marginTop: '10px' }}>
                  <tbody>
                    {data.guarantors.filter(g => g.name).map((g, i) => (
                      <tr key={i}><td>Guarantor {i + 1}</td><td>{g.name} | Relation: {g.relation} | Phone: {g.phone}{g.aadhaar ? ` | Aadhaar: ${g.aadhaar}` : ''}{g.pan ? ` | PAN: ${g.pan}` : ''}</td></tr>
                    ))}
                  </tbody>
                </table>
                Each Guarantor hereby irrevocably and unconditionally guarantees to the Lender the full and punctual repayment of the Loan Amount and all interest and other amounts payable by the Borrower. The Guarantors agree that their liability hereunder shall be joint and several with the Borrower and shall not be affected by any indulgence or forbearance granted by the Lender to the Borrower.
              </div>
              <div className="clause">
                <span className="clause-num">9. </span>
                <strong>GUARANTOR'S OBLIGATIONS:</strong> The Guarantors undertake that in the event of default by the Borrower, the Lender shall have the right to demand and recover the entire outstanding amount from the Guarantors without being required to first proceed against the Borrower or any other security. The Guarantors waive any right to require the Lender to proceed against the Borrower before enforcing this guarantee.
              </div>
            </>
          )}

          <div className="clause">
            <span className="clause-num">{data.guarantors && data.guarantors.some(g => g.name) ? '10' : '8'}. </span>
            <strong>NOTICE:</strong> Any notice or communication required to be given under this Agreement shall be deemed to have been duly given if sent by email, registered post, or delivered personally to the address of the Party as mentioned in this Agreement.
          </div>

          <div className="clause">
            <span className="clause-num">{data.guarantors && data.guarantors.some(g => g.name) ? '11' : '9'}. </span>
            <strong>GOVERNING LAW AND JURISDICTION:</strong> This Agreement shall be governed by and construed in accordance with the laws of India. The courts at {data.company.companyDistrict || data.company.companyState || '________'} shall have exclusive jurisdiction over any matters arising out of or in connection with this Agreement.
          </div>

          <div className="clause">
            <span className="clause-num">{data.guarantors && data.guarantors.some(g => g.name) ? '12' : '10'}. </span>
            <strong>INDEMNITY:</strong> The Borrower agrees to indemnify and hold harmless the Lender from and against any and all losses, claims, damages, liabilities, costs, and expenses arising out of or in connection with any breach of the Borrower's representations, warranties, or obligations under this Agreement.
          </div>

          <div className="clause">
            <span className="clause-num">{data.guarantors && data.guarantors.some(g => g.name) ? '13' : '11'}. </span>
            <strong>ENTIRE AGREEMENT:</strong> This Agreement constitutes the entire agreement between the Parties with respect to the subject matter hereof and supersedes all prior negotiations, representations, and agreements, whether oral or written. No modification or amendment to this Agreement shall be binding unless in writing and signed by both Parties.
          </div>

          <div className="clause">
            <span className="clause-num">{data.guarantors && data.guarantors.some(g => g.name) ? '14' : '12'}. </span>
            <strong>SEVERABILITY:</strong> If any provision of this Agreement is held to be invalid, illegal, or unenforceable, the validity, legality, and enforceability of the remaining provisions shall not in any way be affected or impaired thereby.
          </div>

          {/* IN WITNESS WHEREOF */}
          <div style={{ marginTop: '24px', fontSize: '13px', fontStyle: 'italic', textAlign: 'center' }}>
            IN WITNESS WHEREOF the Parties have signed this Agreement on the date first mentioned above.
          </div>

          {/* SIGNATURES */}
          <div className="sig-section">
            <div className="sig-block">
              <div className="sig-label">BORROWER</div>
              <div className="sig-line" />
              <div>Name: {borrowerName}</div>
              <div>Aadhaar: {safe(data.client.aadhaar)}</div>
              <div>Date: {agreementDate}</div>
            </div>
            <div className="sig-block" style={{ textAlign: 'center' }}>
              <div className="sig-label">LENDER / OFFICE SEAL</div>
              <div className="sig-line" />
              <div>For {lenderDisplay}</div>
            </div>
            <div className="sig-block" style={{ textAlign: 'right' }}>
              <div className="sig-label">AUTHORISED SIGNATORY (LENDER)</div>
              <div className="sig-line" />
              <div>(M H Vicky / Vikrant Rana)</div>
              <div>Owner & Accounts / Admin Head</div>
              <div>{lenderDisplay}</div>
              <div>Date: {agreementDate}</div>
            </div>
          </div>

          {/* WITNESSES */}
          <div className="witness-section">
            <strong>WITNESSES:</strong>
            <div style={{ display: 'flex', gap: '40px', marginTop: '10px' }}>
              <div style={{ flex: 1 }}>
                (A) <span style={{ borderBottom: '1px solid #000', display: 'inline-block', minWidth: '160px' }} />
              </div>
              <div style={{ flex: 1 }}>
                (B) <span style={{ borderBottom: '1px solid #000', display: 'inline-block', minWidth: '160px' }} />
              </div>
            </div>
          </div>

          {/* GUARANTOR SIGNATURES */}
          {data.guarantors && data.guarantors.filter(g => g.name).length > 0 && (
            <div className="sig-section" style={{ marginTop: '40px' }}>
              {data.guarantors.filter(g => g.name).map((g, i) => (
                <div key={i} className="sig-block">
                  <div className="sig-label">GUARANTOR {i + 1} — {g.name}</div>
                  <div className="sig-line" />
                  <div>Relation: {g.relation}</div>
                  <div>Phone: {g.phone}</div>
                  <div>Date: {agreementDate}</div>
                </div>
              ))}
            </div>
          )}

          <div className="end-text">* * * END OF AGREEMENT * * *</div>
        </div>
        <PrintFooter />
      </div>
    </div>
  );
};

export default EnglishLoanAgreement;