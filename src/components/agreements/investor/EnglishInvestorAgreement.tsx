import React from 'react';
import { PrintFooter } from '../../../../components/Printpreview';

interface InvestorData {
  title?: string;
  name: string;
  fatherName?: string;
  age?: string | number;
  gender?: string;
  occupation?: string;
  phone: string;
  email?: string;
  aadhaar?: string;
  pan?: string;
  address: string;
  district?: string;
  state?: string;
  pincode?: string;
  clientId?: string;
  folderSerial?: string;
}

interface InvestmentData {
  projectName?: string;
  propertyType?: string;
  plotNumber?: string;
  area?: string;
  totalAmount?: string | number;
  tokenAmount?: string | number;
  bookingDate?: string;
  interestRate?: string | number;
  emiDuration?: string | number;
  paymentMode?: string;
  locality?: string;
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
  managerPhone?: string;
  managerCountryCode?: string;
}

interface NomineeData {
  name?: string;
  age?: string | number;
  relation?: string;
  aadhaar?: string;
}

interface AgreementData {
  client: InvestorData;
  property: InvestmentData;
  company: CompanyData;
  manager?: ManagerData;
  nominees?: NomineeData[];
}

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
  .doc-title {
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
  .investor-table {
    width: 100%;
    border-collapse: collapse;
    margin: 20px 0;
    font-size: 13px;
  }
  .investor-table td {
    padding: 6px 10px;
    border: 1px solid #ccc;
  }
  .investor-table td:first-child {
    font-weight: 700;
    width: 35%;
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
  .witness-section {
    margin-top: 30px;
    font-size: 13px;
  }
  .nominee-table {
    width: 100%;
    border-collapse: collapse;
    margin: 10px 0;
    font-size: 12.5px;
  }
  .nominee-table td {
    padding: 5px 8px;
    border: 1px solid #ccc;
  }
  .nominee-table td:first-child {
    font-weight: 700;
    width: 25%;
    background: #f9f9f9;
  }
`;

const EnglishInvestorAgreement: React.FC<{ data: AgreementData; companyLogo?: string; companyWatermark?: string }> = ({ data, companyLogo, companyWatermark }) => {
  const investorName = [data.client.title, data.client.name].filter(Boolean).join(' ');
  const companyDisplay = `${data.company.companyName || ''}${data.company.entityType ? ` (${data.company.entityType})` : ''}`;
  const investorAddress = [data.client.address, data.client.district, data.client.state].filter(Boolean).join(', ') + (data.client.pincode ? ` - ${data.client.pincode}` : '');
  const companyFullAddress = [data.company.companyAddress, data.company.companyLocality, data.company.companyDistrict, data.company.companyState].filter(Boolean).join(', ') + (data.company.companyPincode ? ` - ${data.company.companyPincode}` : '');
  const agreementDate = formatDate(data.property?.bookingDate);
  const amountNum = Number(data.property?.totalAmount) || 0;
  const amountWords = numberToWords(amountNum);
  const tokenNum = Number(data.property?.tokenAmount) || 0;
  const tokenWords = numberToWords(tokenNum);
  const nominees = data.nominees?.filter(n => n.name) || [];
  const interestRate = data.property?.interestRate || 0;

  return (
    <div id="printable-document" className="flex flex-col items-center">
      <style>{sharedStyles}</style>
      <div className="a4-page" style={{ position: "relative" }}>
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

        <div style={{ position: "relative", zIndex: 1 }}>
          <div className="border-b-[3px] border-[#D9001B] pb-4 mb-6">
            <div className="flex justify-between items-center text-[12px] font-bold text-slate-700 tracking-wide mb-3">
              <div>REG NO: {data.company?.licenseRegistrationNumber?.toUpperCase()}</div>
              <div>EST. 2019</div>
            </div>
            <div className="flex justify-between items-start">
              <div className="flex flex-col text-left">
                <span className="text-[52px] font-extrabold font-serif leading-tight gradient-text">Ashray Group</span>
                <div className="text-[13px] text-slate-800 mt-3 font-medium max-w-[480px] leading-relaxed">
                  {companyFullAddress}.
                </div>
                <div className="flex flex-wrap gap-2 text-[12px] font-bold text-slate-600 mt-2">
                  <span>Mob: {(data.manager?.managerPhone || data.company?.managerPhone)}</span>
                  <span className="text-slate-300">|</span>
                  <span>Mail: {data.company?.companyEmail}</span>
                  <span className="text-slate-300">|</span>
                  <span>Web: {data.company?.companyWebsite}</span>
                </div>
              </div>
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
            <span className="font-mono">{`${data.client.folderSerial || ''}-${data.client.clientId || ''}-INV-AGR`}</span>
            <span><strong>Date: </strong>{agreementDate}</span>
          </div>

          <div className="doc-title">INVESTOR AGREEMENT</div>
          <div className="sub-title">(Investment and Profit-Sharing Agreement between Investor and Company)</div>

          <div className="clause" style={{ marginBottom: '18px' }}>
            This Investor Agreement (hereinafter referred to as the <strong>"Agreement"</strong>) is made and entered into on this <strong>{agreementDate}</strong> at <strong>{data.company.companyDistrict || '________'}</strong>.
          </div>

          <div className="clause" style={{ marginBottom: '6px' }}>
            <strong>BETWEEN</strong>
          </div>
          <div className="clause">
            <strong>{companyDisplay}</strong>, having its registered office at {companyFullAddress} (hereinafter referred to as the <strong>"Company"</strong>, which expression shall mean and include its successors and assigns) of the <strong>FIRST PART</strong>.
          </div>

          <div className="clause" style={{ marginBottom: '6px', marginTop: '10px' }}>
            <strong>AND</strong>
          </div>
          <div className="clause">
            <strong>{investorName}</strong>, {data.client.fatherName ? `S/o ${data.client.fatherName}, ` : ''}Age: {safe(data.client.age)} Years, Occupation: {safe(data.client.occupation)}, Aadhaar: {safe(data.client.aadhaar)}, PAN: {safe(data.client.pan)}, Residing at: {investorAddress} (hereinafter referred to as the <strong>"Investor"</strong>, which expression shall mean and include his/her heirs, legal representatives, successors, and assigns) of the <strong>SECOND PART</strong>.
          </div>

          <div className="clause" style={{ marginBottom: '6px', marginTop: '10px' }}>
            The Investor named above and the Company named above are hereinafter individually referred to as a <strong>"Party"</strong> and collectively as the <strong>"Parties"</strong>.
          </div>

          <div style={{ marginTop: '20px', textAlign: 'center', fontWeight: 800, fontSize: '16px', textDecoration: 'underline', textUnderlineOffset: '4px', marginBottom: '16px' }}>
            NOW THIS AGREEMENT WITNESSETH AS FOLLOWS:
          </div>

          <table className="investor-table">
            <tbody>
              <tr><td>Investor Name</td><td>{investorName}</td></tr>
              <tr><td>Project / Asset</td><td>{safe(data.property?.projectName)}</td></tr>
              {data.property?.plotNumber && <tr><td>Plot / Unit Number</td><td>{data.property.plotNumber}</td></tr>}
              {data.property?.area && <tr><td>Area</td><td>{data.property.area} sq. ft.</td></tr>}
              <tr><td>Total Investment Amount</td><td>₹ {formatAmount(data.property?.totalAmount)} /- ({amountWords})</td></tr>
              <tr><td>Amount Paid (Token)</td><td>₹ {formatAmount(data.property?.tokenAmount)} /- ({tokenWords})</td></tr>
              <tr><td>Date of Investment</td><td>{agreementDate}</td></tr>
              <tr><td>Rate of Return (ROI)</td><td>{safe(interestRate)}% per annum</td></tr>
              <tr><td>Payment Mode</td><td>{safe(data.property?.paymentMode)}</td></tr>
            </tbody>
          </table>

          <div className="clause">
            <span className="clause-num">1. </span>
            <strong>INVESTMENT AMOUNT:</strong> The Investor has invested and the Company has accepted a sum of ₹ {formatAmount(data.property?.totalAmount)}/- (Rupees {amountWords}) (hereinafter referred to as the <strong>"Investment Amount"</strong>) towards the project/asset known as <strong>{safe(data.property?.projectName)}</strong>. The Investor acknowledges that the Investment Amount has been paid to the Company on the date of this Agreement.
          </div>

          <div className="clause">
            <span className="clause-num">2. </span>
            <strong>RETURNS AND PROFIT SHARING:</strong> The Company agrees to pay the Investor a return at the rate of {safe(interestRate)}% per annum on the Investment Amount. Returns shall be calculated on a yearly basis and shall be credited to the Investor's account as per the Company's policy. The Investor shall be entitled to receive the principal amount along with accrued returns upon maturity or as mutually agreed.
          </div>

          <div className="clause">
            <span className="clause-num">3. </span>
            <strong>TENURE AND MATURITY:</strong> The investment shall remain with the Company for a minimum period of {safe(data.property?.emiDuration)} months from the date of this Agreement, unless otherwise mutually agreed. Upon completion of the tenure, the Investor may withdraw the Investment Amount along with all accrued returns subject to a notice period as determined by the Company.
          </div>

          <div className="clause">
            <span className="clause-num">4. </span>
            <strong>USE OF INVESTMENT:</strong> The Investor acknowledges and agrees that the Investment Amount shall be used by the Company for its business operations, including but not limited to project development, land acquisition, construction, and working capital requirements. The Investor shall not have any right, title, or interest in any specific asset or property of the Company by virtue of this investment.
          </div>

          <div className="clause">
            <span className="clause-num">5. </span>
            <strong>REPRESENTATIONS AND WARRANTIES:</strong> The Investor represents and warrants that all information provided by the Investor including personal details, identity documents, financial information, and bank details is true, complete, and accurate. The Investor agrees to immediately notify the Company of any change in contact details, address, or bank account information.
          </div>

          <div className="clause">
            <span className="clause-num">6. </span>
            <strong>NOMINATION:</strong> The Investor has appointed the following nominee(s) who shall be entitled to receive the Investment Amount and accrued returns in the event of the Investor's demise:
          </div>

          {nominees.length > 0 ? (
            <table className="nominee-table">
              <thead>
                <tr style={{ background: '#f9f9f9', fontWeight: 700 }}>
                  <td>#</td>
                  <td>Name</td>
                  <td>Relation</td>
                  <td>Age</td>
                  <td>Aadhaar</td>
                </tr>
              </thead>
              <tbody>
                {nominees.map((n, i) => (
                  <tr key={i}>
                    <td>{i + 1}</td>
                    <td>{n.name}</td>
                    <td>{safe(n.relation)}</td>
                    <td>{safe(n.age)}</td>
                    <td>{safe(n.aadhaar)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="clause" style={{ paddingLeft: '20px' }}>
              No nominee has been appointed by the Investor. In the event of the Investor's demise, the Investment Amount shall be paid to the legal heirs of the Investor upon production of succession certificate or other valid legal documents.
            </div>
          )}

          <div className="clause">
            <span className="clause-num">{nominees.length > 0 ? '7' : '7'}. </span>
            <strong>WITHDRAWAL AND PREMATURE EXIT:</strong> The Investor may withdraw the Investment Amount before the completion of the minimum tenure only with the prior written consent of the Company. In case of premature withdrawal, the Company reserves the right to adjust the returns at a reduced rate or levy an early exit charge as determined by the Company's policy in force at that time.
          </div>

          <div className="clause">
            <span className="clause-num">{nominees.length > 0 ? '8' : '8'}. </span>
            <strong>FORCE MAJEURE:</strong> The Company shall not be liable for any delay or failure in performance of its obligations under this Agreement if such delay or failure arises from causes beyond the reasonable control of the Company, including but not limited to acts of God, government actions, market crashes, natural disasters, or任何 other unforeseen circumstances.
          </div>

          <div className="clause">
            <span className="clause-num">{nominees.length > 0 ? '9' : '9'}. </span>
            <strong>NOTICE:</strong> Any notice or communication required to be given under this Agreement shall be deemed to have been duly given if sent by email, registered post, or delivered personally to the address of the Party as mentioned in this Agreement.
          </div>

          <div className="clause">
            <span className="clause-num">{nominees.length > 0 ? '10' : '10'}. </span>
            <strong>GOVERNING LAW AND JURISDICTION:</strong> This Agreement shall be governed by and construed in accordance with the laws of India. The courts at {data.company.companyDistrict || data.company.companyState || '________'} shall have exclusive jurisdiction over any matters arising out of or in connection with this Agreement.
          </div>

          <div className="clause">
            <span className="clause-num">{nominees.length > 0 ? '11' : '11'}. </span>
            <strong>ENTIRE AGREEMENT:</strong> This Agreement constitutes the entire agreement between the Parties with respect to the subject matter hereof and supersedes all prior negotiations, representations, and agreements, whether oral or written. No modification or amendment to this Agreement shall be binding unless in writing and signed by both Parties.
          </div>

          <div style={{ marginTop: '24px', fontSize: '13px', fontStyle: 'italic', textAlign: 'center' }}>
            IN WITNESS WHEREOF the Parties have signed this Agreement on the date first mentioned above.
          </div>

          <div className="sig-section">
            <div className="sig-block">
              <div className="sig-label">INVESTOR</div>
              <div className="sig-line" />
              <div>Name: {investorName}</div>
              <div>Aadhaar: {safe(data.client.aadhaar)}</div>
              <div>Date: {agreementDate}</div>
            </div>
            <div className="sig-block" style={{ textAlign: 'center' }}>
              <div className="sig-label">COMPANY / OFFICE SEAL</div>
              <div className="sig-line" />
              <div>For {companyDisplay}</div>
            </div>
            <div className="sig-block" style={{ textAlign: 'right' }}>
              <div className="sig-label">AUTHORISED SIGNATORY (COMPANY)</div>
              <div className="sig-line" />
              <div>(M H Vicky / Vikrant Rana)</div>
              <div>Owner & Accounts / Admin Head</div>
              <div>{companyDisplay}</div>
              <div>Date: {agreementDate}</div>
            </div>
          </div>

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

          <div className="end-text">* * * END OF AGREEMENT * * *</div>
        </div>
        <PrintFooter />
      </div>
    </div>
  );
};

export default EnglishInvestorAgreement;