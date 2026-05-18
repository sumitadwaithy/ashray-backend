import React from 'react';
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

const EnglishOfficeAccountantAgreement = ({ data, companyLogo, companyWatermark }: TemplateProps) => {

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr || '';
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const employerFullName = `${data.company?.companyName || ''} ${data.company?.entityType ? `(${data.company.entityType})` : ''}`.trim();

  const employerAddress = [
    data.company?.companyAddress,
    data.company?.companyLocality,
    data.company?.companyDistrict,
    data.company?.companyState,
  ].filter(Boolean).join(', ') + (data.company?.companyPincode ? ` - ${data.company.companyPincode}` : '');

  const employeeFullName = [data.employee?.title, data.employee?.name].filter(Boolean).join(' ');

  const employeeAddress = [
    data.employee?.address,
    data.employee?.locality,
    data.employee?.district,
    data.employee?.state,
  ].filter(Boolean).join(', ') + (data.employee?.pincode ? ` - ${data.employee.pincode}` : '');

  const defaultDuties = [
    "Maintaining accurate books of accounts using Tally ERP / Tally Prime or any other accounting software as prescribed by the Company, in compliance with accounting standards applicable to Private Limited Companies.",
    "Recording and reconciling all financial transactions including property bookings, token amounts, instalment collections, cancellations, brokerage payouts, and vendor payments.",
    "Preparing and filing monthly, quarterly, and annual GST returns (GSTR-1, GSTR-3B, GSTR-9) as applicable under the Goods and Services Tax Act, 2017, for the Company's real estate operations.",
    "Deducting and depositing Tax Deducted at Source (TDS) as applicable under the Income Tax Act, 1961, and filing TDS returns (Form 24Q, 26Q, 27Q) within prescribed due dates.",
    "Assisting in the preparation of annual financial statements — Balance Sheet, Profit & Loss Account, and Cash Flow Statement — in accordance with the Companies Act, 2013, and applicable Accounting Standards (AS) or Ind AS.",
    "Managing accounts payable and accounts receivable, including tracking outstanding dues from property buyers, following up on overdue payments, and processing vendor bills.",
    "Preparing and maintaining MIS reports, budget-vs-actual reports, project-wise cost statements, and cash flow projections for management review.",
    "Coordinating with statutory auditors, internal auditors, and Company Secretary for annual audits, Board resolutions, and ROC filings as required under the Companies Act, 2013.",
    "Managing payroll processing, computation of EPF, ESI, professional tax, and other statutory deductions for Company employees in compliance with applicable labour laws.",
    "Maintaining proper documentation of all financial records, vouchers, receipts, invoices, and bank statements in accordance with statutory retention requirements.",
    "Ensuring compliance with RERA (Real Estate Regulation and Development Act, 2016) financial reporting requirements including maintenance of a separate escrow account for each project.",
    "Performing any other accounting, financial, or administrative duties as assigned by the management from time to time.",
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
          font-family: 'Times New Roman', 'Georgia', serif;
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
          font-family: 'Times New Roman', serif;
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

          {/* TOKEN LINE */}
          <div className="mt-6 bg-yellow-200 border border-yellow-300 text-[12.5px] font-semibold px-1 py-1 text-center">
            <div className="font-mono leading-tight break-words inline-block text-center max-w-full">
              {data.employee.folderSerial || '0000'}/{data.employee.staffId || data.employee.employeeId || 'TEMP-ID'}
            </div>
          </div>

          {/* TITLE */}
          <div className="agreement-title">Employment Agreement</div>
          <div className="agreement-subtitle">(Office Accountant)</div>

          {/* PREAMBLE */}
          <div className="body-text">
            This Employment Agreement <strong>("Agreement")</strong> is made and entered into as of{' '}
            <span className="underline-blank">{formatDate(data.employment?.joiningDate)}</span>, by and between:
          </div>

          {/* EMPLOYER */}
          <div className="party-block">
            <div className="party-name">{employerFullName}</div>
            <div><strong>Registered Address:</strong> {employerAddress}</div>
            <div><strong>CIN:</strong> {data.company?.cinNumber || <span className="underline-blank" style={{ minWidth: '160px' }} />}</div>
            <div><strong>PAN:</strong> {data.company?.companyPan || <span className="underline-blank" style={{ minWidth: '120px' }} />}</div>
            <div style={{ fontStyle: 'italic' }}>
              (A Company incorporated under the Companies Act, 2013, hereinafter referred to as the <strong>"Company"</strong> or <strong>"Employer"</strong>)
            </div>
          </div>

          <div className="and-divider">AND</div>

          {/* EMPLOYEE */}
          <div className="party-block">
            <div className="party-name">{employeeFullName}</div>
            <div><strong>Address:</strong> {employeeAddress}</div>
            <div>
              <strong>Qualification:</strong>{' '}
              {data.employee?.qualification || <span className="underline-blank" style={{ minWidth: '160px' }} />}
            </div>
            <div><strong>Date of Birth:</strong> {data.employee?.dob ? formatDate(data.employee.dob) : <span className="underline-blank" style={{ minWidth: '100px' }} />}</div>
            <div>
              <strong>Aadhaar No.:</strong> {data.employee?.aadhaar || <span className="underline-blank" style={{ minWidth: '120px' }} />}
              &emsp;
              <strong>PAN No.:</strong> {data.employee?.pan || <span className="underline-blank" style={{ minWidth: '100px' }} />}
            </div>
            <div style={{ fontStyle: 'italic' }}>(hereinafter referred to as the <strong>"Employee"</strong>)</div>
          </div>

          {/* 1. POSITION AND DUTIES */}
          <div className="section-heading">1. Position and Duties</div>
          <div className="body-text">
            The Company hereby appoints the Employee in the position of <strong>Office Accountant</strong>
            {data.employment?.department ? ` in the ${data.employment.department} Department` : ''}. The Employee shall report to{' '}
            <span className="underline-blank">{data.employment?.reportingTo || ''}</span>{' '}
            and shall diligently perform all accounting, financial, and compliance duties as required in a real estate Private Limited Company, including but not limited to:
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
          PAGE 2
      ══════════════════════════════════════════ */}
      <div className="a4-page" style={{ position: "relative" }}>
        {/* WATERMARK */}
        <div style={{
          position: "absolute", top: 0, left: 0, width: "100%", height: "100%",
          display: "flex", alignItems: "center", justifyContent: "center",
          opacity: 0.08, zIndex: 0, pointerEvents: "none",
        }}>
          <img src={companyWatermark || companyLogo || ''}
            style={{ width: "70%", maxWidth: "720px", height: "auto", objectFit: "contain" }} />
        </div>

        <div className="divider-page"></div>

        {/* CONTENT */}
        <div style={{ position: "relative", zIndex: 1 }}>

          {/* 2. COMMENCEMENT & PROBATION */}
          <div className="section-heading">2. Commencement and Probation</div>
          <div className="body-text">
            The Employee's employment shall commence on{' '}
            <span className="underline-blank">{formatDate(data.employment?.joiningDate)}</span>.
            The Employee shall be on a probationary period of{' '}
            <strong>{data.employment?.probationPeriod || '3 (Three) months'}</strong> from the date of joining,
            during which either party may terminate this Agreement without cause or prior notice.
            Upon satisfactory completion of the probationary period, the employment shall be confirmed in writing by a duly authorised officer of the Company in accordance with the Company's HR policy.
          </div>

          {/* 3. COMPENSATION */}
          <div className="section-heading">3. Compensation</div>

          <div className="sub-heading">Salary</div>
          <div className="body-text">
            The Company shall pay the Employee a gross annual salary of ₹{' '}
            <span className="underline-blank">{data.employment?.grossAnnualSalary || ''}</span>
            /- (Rupees{' '}
            <span className="underline-blank" style={{ minWidth: '160px' }}>
              {data.employment?.grossAnnualSalaryWords || ''}
            </span>{' '}
            only),
            which is equivalent to a gross monthly salary of ₹{' '}
            <span className="underline-blank">{data.employment?.grossMonthlySalary || ''}</span>
            /- (Rupees{' '}
            <span className="underline-blank" style={{ minWidth: '140px' }}>
              {data.employment?.grossMonthlySalaryWords || ''}
            </span>{' '}
            only),
            payable in equal monthly instalments on or before the 7th of the following month, subject to applicable deductions, TDS as per the Income Tax Act, 1961, and all statutory withholdings as prescribed under Indian law.
          </div>

          <div className="sub-heading">Statutory Benefits</div>
          <div className="body-text">
            As mandated under Indian labour legislation applicable to Private Limited Companies, the Employee shall be entitled to the following statutory benefits:
          </div>

          <div style={{ fontWeight: 700, fontSize: '13px', marginTop: '5px', marginBottom: '2px' }}>
            Mandatory Statutory Benefits
          </div>
          <ul className="benefits-list">
            <li><strong>Employees' Provident Fund (EPF) — EPF &amp; MP Act, 1952:</strong> Employer and Employee shall each contribute 12% of basic wages. Applicable when the Company employs 20 or more persons.</li>
            <li><strong>Employee State Insurance (ESI) — ESI Act, 1948:</strong> Applicable where the Employee's gross wages are ₹21,000/- per month or below and the establishment employs 10 or more persons (20 in certain states).</li>
            <li><strong>Gratuity — Payment of Gratuity Act, 1972:</strong> Payable upon completion of 5 (five) years of continuous service at the rate of 15 days' wages for each completed year of service.</li>
            <li>
              <strong>Leave Entitlement — Shops &amp; Establishments Act (State):</strong> Paid Annual / Earned Leave ({data.employment?.annualLeaves || '12'} days),
              Sick / Medical Leave ({data.employment?.medicalLeaves || '6'} days), and Casual Leave ({data.employment?.casualLeaves || '6'} days) per calendar year.
            </li>
            <li><strong>Maternity Benefits — Maternity Benefit Act, 1961:</strong> Paid maternity leave of 26 weeks for eligible female employees (up to 2 surviving children); 12 weeks for subsequent pregnancies.</li>
            <li><strong>Bonus — Payment of Bonus Act, 1965:</strong> Applicable if the Company's annual turnover qualifies under the Act; minimum bonus of 8.33% of annual wages or ₹100/- per month, whichever is higher.</li>
          </ul>

          <div style={{ fontWeight: 700, fontSize: '13px', marginTop: '5px', marginBottom: '2px' }}>
            Voluntary / Competitive Benefits
          </div>
          <ul className="benefits-list">
            <li><strong>Group Health Insurance:</strong> Comprehensive medical coverage as per Company policy.</li>
            <li><strong>Performance Incentives:</strong> Performance-based bonuses and annual salary increments at the Board / Management's discretion, linked to audit outcomes and compliance performance.</li>
            <li><strong>Professional Development:</strong> Support for CA Inter / CMA / ACCA studies, Tally certification, GST practitioner courses, and relevant upskilling programmes.</li>
            <li><strong>Flexible Working:</strong> Subject to management approval and statutory filing deadlines.</li>
          </ul>

          <div style={{ fontWeight: 700, fontSize: '13px', marginTop: '5px', marginBottom: '2px' }}>
            Optional Perks
          </div>
          <ul className="benefits-list">
            <li>Wellness Programs: Gym memberships, mental wellness support.</li>
            <li>Additional Leaves: Paternity leave, bereavement leave as per Company policy.</li>
            <li>Assistance: Childcare support, relocation assistance as applicable.</li>
            <li>Provident Fund contributions and other benefits as determined by the Company from time to time.</li>
          </ul>

        </div>
        <PrintFooter />
      </div>

      <div className="a4-gap" />

      {/* ══════════════════════════════════════════
          PAGE 3
      ══════════════════════════════════════════ */}
      <div className="a4-page" style={{ position: "relative" }}>
        {/* WATERMARK */}
        <div style={{
          position: "absolute", top: 0, left: 0, width: "100%", height: "100%",
          display: "flex", alignItems: "center", justifyContent: "center",
          opacity: 0.08, zIndex: 0, pointerEvents: "none",
        }}>
          <img src={companyWatermark || companyLogo || ''}
            style={{ width: "70%", maxWidth: "720px", height: "auto", objectFit: "contain" }} />
        </div>

        {/* CONTENT */}
        <div style={{ position: "relative", zIndex: 1 }}>

          <div className="divider-page"></div>

          {/* 4. WORKING HOURS */}
          <div className="section-heading">4. Working Hours</div>
          <div className="body-text">
            The Employee's standard working hours shall be{' '}
            <span className="underline-blank">{data.employment?.workingHours || '9:00 AM to 6:00 PM'}</span>,{' '}
            {data.employment?.workingDays || 'Monday to Saturday'}, with a{' '}
            <span className="underline-blank">{data.employment?.lunchBreak || '1 (one) hour'}</span>{' '}
            lunch break, in accordance with the applicable State Shops &amp; Establishments Act. Given the nature of accounting and statutory filing obligations, the Employee acknowledges that additional hours may be required particularly during GST return filing dates, TDS due dates, advance tax dates, and financial year-end closing. Any overtime compensation shall be governed by applicable law.
          </div>

          {/* 5. FIDUCIARY DUTY & FINANCIAL INTEGRITY */}
          <div className="section-heading">5. Fiduciary Duty and Financial Integrity</div>
          <div className="body-text">
            In view of the sensitive financial role entrusted to the Employee, the Employee expressly agrees to:
          </div>
          <ul className="clause-list">
            <li>Maintain the highest standards of financial integrity and professional ethics at all times;</li>
            <li>Not make, authorise, or facilitate any payment, transaction, or financial entry without proper approval as per the Company's internal authorisation matrix;</li>
            <li>Immediately report any financial irregularity, fraud, suspected misappropriation, or error in accounts to the reporting authority in writing;</li>
            <li>Not operate, access, or have signing authority over any Company bank account except as expressly authorised in writing by the Board of Directors;</li>
            <li>Not accept any gratification, commission, or benefit from any vendor, contractor, or third party connected with the Company's business.</li>
          </ul>
          <div className="body-text">
            Any breach of fiduciary duty shall render the Employee liable to immediate termination, recovery of financial losses, and criminal prosecution under applicable provisions of the Indian Penal Code, 1860, and the Prevention of Corruption Act, 1988.
          </div>

          {/* 6. CONFIDENTIALITY */}
          <div className="section-heading">6. Confidentiality and Data Protection</div>
          <div className="body-text">
            The Employee shall have access to highly sensitive financial and personal information of the Company and its clients, including but not limited to bank account details, property transaction valuations, client PAN and Aadhaar data, audit reports, tax filings, and Board resolutions. The Employee agrees to:
          </div>
          <ul className="clause-list">
            <li>Keep all such information strictly confidential during and after the term of employment;</li>
            <li>Not disclose, copy, transmit, or misuse any financial data or client information for personal gain or to any third party without prior written authorisation;</li>
            <li>Comply with all obligations under the Digital Personal Data Protection Act, 2023 (DPDPA), and applicable IT and financial regulations;</li>
            <li>Not retain any physical or digital copies of financial records, passwords, or credentials upon cessation of employment.</li>
          </ul>

          {/* 7. NON-COMPETITION */}
          <div className="section-heading">7. Non-Competition and Non-Solicitation</div>
          <div className="body-text">
            During the term of employment and for a period of{' '}
            <span className="underline-blank">{data.employment?.nonCompetePeriod || '6 (Six) months'}</span>{' '}
            following the termination of employment for any reason, the Employee shall not:
          </div>
          <ul className="clause-list">
            <li>Directly or indirectly engage in, be employed by, or provide accounting or financial services to any business that competes with the Company's real estate operations within a{' '}
              <span className="underline-blank">{data.employment?.nonCompeteRadius || '25 km'}</span>{' '}
              radius of the Company's primary place of business;</li>
            <li>Solicit, approach, or advise any client, vendor, or business associate of the Company for any competing or personal financial purpose;</li>
            <li>Induce or attempt to induce any employee of the Company to leave their employment.</li>
          </ul>

          {/* 8. TERMINATION */}
          <div className="section-heading">8. Termination of Employment</div>

          <div className="sub-heading">Termination by the Company</div>
          <div className="body-text">The Company may terminate this Agreement in the following circumstances:</div>
          <ul className="termination-list">
            <li>
              <strong>With Cause (Summary Dismissal):</strong> Immediately and without notice for reasons including financial fraud, embezzlement, falsification of accounts, wilful default in statutory filings resulting in penalties to the Company, gross misconduct, or material breach of this Agreement or Company policies.
            </li>
            <li>
              <strong>Without Cause:</strong> By providing{' '}
              <span className="underline-blank">{data.employment?.noticePeriodEmployer || '30 (Thirty) days'}</span>{' '}
              written notice or payment of salary in lieu of such notice, subject to applicable provisions of the Industrial Disputes Act, 1947, if applicable.
            </li>
          </ul>

          <div className="sub-heading">Termination by the Employee</div>
          <div className="body-text">
            The Employee may resign by providing{' '}
            <span className="underline-blank">{data.employment?.noticePeriodEmployee || '30 (Thirty) days'}</span>{' '}
            written notice to the Company. Upon cessation of employment, the Employee shall: (i) complete all pending statutory filings and account reconciliations; (ii) surrender all Company property, devices, login credentials, digital certificates (DSC), and financial documents; (iii) complete a formal accounts handover to the designated successor; and (iv) sign a No-Dues Certificate before final settlement is processed.
          </div>

          {/* 9. GOVERNING LAW */}
          <div className="section-heading">9. Governing Law and Jurisdiction</div>
          <div className="body-text">
            This Agreement shall be governed by and construed in accordance with the laws of India, including the Companies Act, 2013, the Contract Act, 1872, the Income Tax Act, 1961, the GST Act, 2017, and applicable labour legislation. Any disputes arising out of or in connection with this Agreement shall be subject to the exclusive jurisdiction of the courts at{' '}
            <span className="underline-blank">{data.employment?.jurisdiction || data.company?.companyDistrict || ''}</span>.
          </div>

          {/* 10. ENTIRE AGREEMENT */}
          <div className="section-heading">10. Entire Agreement</div>
          <div className="body-text">
            This Agreement constitutes the entire agreement between the Company and the Employee with respect to the terms of employment and supersedes all prior discussions, negotiations, and agreements, whether written or oral. Any representations not contained herein shall have no legal effect.
          </div>

        </div>
        <PrintFooter />
      </div>

      <div className="a4-gap" />

      {/* ══════════════════════════════════════════
          PAGE 4
      ══════════════════════════════════════════ */}
      <div className="a4-page" style={{ position: "relative" }}>
        {/* WATERMARK */}
        <div style={{
          position: "absolute", top: 0, left: 0, width: "100%", height: "100%",
          display: "flex", alignItems: "center", justifyContent: "center",
          opacity: 0.08, zIndex: 0, pointerEvents: "none",
        }}>
          <img src={companyWatermark || companyLogo || ''}
            style={{ width: "70%", maxWidth: "720px", height: "auto", objectFit: "contain" }} />
        </div>

        {/* CONTENT */}
        <div style={{ position: "relative", zIndex: 1 }}>

          <div className="divider-page"></div>

          {/* 11. AMENDMENTS */}
          <div className="section-heading">11. Amendments</div>
          <div className="body-text">
            Any amendment or modification to this Agreement shall be valid only if made in writing and duly signed by the authorised representative of the Company and the Employee. No oral amendments shall be binding on either party.
          </div>

          {/* 12. SEVERABILITY */}
          <div className="section-heading">12. Severability</div>
          <div className="body-text">
            If any provision of this Agreement is found to be invalid, void, or unenforceable under applicable law, such provision shall be deemed severed from this Agreement, and the remaining provisions shall continue in full force and effect.
          </div>

          {/* 13. STATUTORY COMPLIANCE DECLARATION */}
          <div className="section-heading">13. Statutory Compliance Declaration</div>
          <div className="body-text">
            Both parties acknowledge that this Agreement is subject to, and shall be interpreted in conformity with, all applicable central and state legislation, including but not limited to:
          </div>
          <div className="compliance-box">
            <strong>Applicable Legislation:</strong> Companies Act, 2013 &nbsp;|&nbsp; Contract Act, 1872 &nbsp;|&nbsp; Income Tax Act, 1961 &nbsp;|&nbsp; GST Act, 2017 &nbsp;|&nbsp; RERA, 2016 &nbsp;|&nbsp; EPF &amp; MP Act, 1952 &nbsp;|&nbsp; ESI Act, 1948 &nbsp;|&nbsp; Payment of Gratuity Act, 1972 &nbsp;|&nbsp; Payment of Bonus Act, 1965 &nbsp;|&nbsp; Maternity Benefit Act, 1961 &nbsp;|&nbsp; Minimum Wages Act, 1948 &nbsp;|&nbsp; Payment of Wages Act, 1936 &nbsp;|&nbsp; Industrial Disputes Act, 1947 &nbsp;|&nbsp; Prevention of Money Laundering Act, 2002 &nbsp;|&nbsp; IT Act, 2000 &nbsp;|&nbsp; Digital Personal Data Protection Act, 2023 &nbsp;|&nbsp; State Shops &amp; Establishments Act (Maharashtra)
          </div>
          <div className="body-text" style={{ marginTop: '4px' }}>
            In the event of any conflict between the terms of this Agreement and the provisions of any applicable statute, the statute shall prevail. The Employee further acknowledges that, as a financial officer, they may be personally liable under certain provisions of the Income Tax Act, 1961 and GST Act, 2017, for wilful default or negligence in statutory compliance.
          </div>

          {/* SIGNATURES */}
          <div className="sig-grid">

            {/* COMPANY SIGNATURE */}
            <div className="sig-block">
              <div className="sig-block-title">For and on behalf of the Company</div>
              <div className="sig-line" />
              <div className="sig-field-row">
                <strong>Date:</strong>
                <span className="underline-blank" style={{ minWidth: '110px' }}>
                  {formatDate(data.employment?.joiningDate)}
                </span>
              </div>
              <div className="sig-field-row">
                <strong>Name:</strong>
                <span className="underline-blank" style={{ minWidth: '130px' }}>
                  {data.manager?.managerName || data.company?.managerName || data.company?.hrName || ''}
                </span>
              </div>
              <div className="sig-field-row">
                <strong>Designation:</strong>
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
                Authorised Signatory — {data.company?.companyName || ''}{data.company?.entityType ? ` (${data.company.entityType})` : ''}
              </div>
            </div>

            {/* EMPLOYEE SIGNATURE */}
            <div className="sig-block">
              <div className="sig-block-title">Employee Acceptance</div>
              <div className="sig-line" />
              <div className="sig-field-row">
                <strong>Date:</strong>
                <span className="underline-blank" style={{ minWidth: '110px' }}>
                  {formatDate(data.employment?.joiningDate)}
                </span>
              </div>
              <div className="sig-field-row">
                <strong>Name:</strong>
                <span className="underline-blank" style={{ minWidth: '130px' }}>
                  {employeeFullName}
                </span>
              </div>
              <div className="sig-field-row">
                <strong>Aadhaar No.:</strong>
                <span className="underline-blank" style={{ minWidth: '110px' }}>
                  {data.employee?.aadhaar || ''}
                </span>
              </div>
              <div style={{ marginTop: '14px', fontSize: '12.5px', fontWeight: 700 }}>
                Left Thumb Impression:-
              </div>
              <div style={{
                border: '1px solid #000',
                minHeight: '77px',
                marginTop: '4px',
                width: '130px',
              }} />
            </div>

          </div>

          {/* WITNESS */}
          <div style={{ marginTop: '24px', borderTop: '1.5px solid #000', paddingTop: '10px' }}>
            <div style={{ fontWeight: 700, fontSize: '13px', marginBottom: '8px' }}>Witness</div>
            <div style={{ display: 'flex', gap: '40px' }}>
              <div style={{ flex: 1, fontSize: '13px', lineHeight: 1.8 }}>
                <div><strong>1.</strong> Name: <span className="underline-blank" style={{ minWidth: '140px' }} /></div>
                <div style={{ marginTop: '4px' }}>Signature: <span className="underline-blank" style={{ minWidth: '120px' }} /></div>
              </div>
              <div style={{ flex: 1, fontSize: '13px', lineHeight: 1.8 }}>
                <div><strong>2.</strong> Name: <span className="underline-blank" style={{ minWidth: '140px' }} /></div>
                <div style={{ marginTop: '4px' }}>Signature: <span className="underline-blank" style={{ minWidth: '120px' }} /></div>
              </div>
            </div>
          </div>

          <div className="end-text">* * * END * * *</div>

        </div>
        <PrintFooter />
      </div>

    </div>
  );
};

export default EnglishOfficeAccountantAgreement;