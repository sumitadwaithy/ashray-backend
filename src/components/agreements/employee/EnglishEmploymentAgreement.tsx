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
  // ── Role ──────────────────────────────────────────────────
  designation?: string;           // e.g. "Sales Executive", "Site Engineer", "Accountant"
  employmentType?: string;        // "Full-Time Permanent" | "Part-Time" | "Fixed-Term Contract" | "Probationary"
  contractEndDate?: string;       // only for Fixed-Term; ISO date string
  department?: string;
  reportingTo?: string;
  placeOfPosting?: string;

  // ── Schedule ──────────────────────────────────────────────
  joiningDate?: string;
  probationPeriod?: string;
  workingHours?: string;
  lunchBreak?: string;
  workingDays?: string;

  // ── Compensation ──────────────────────────────────────────
  grossAnnualSalary?: string | number;
  grossAnnualSalaryWords?: string;
  grossMonthlySalary?: string | number;
  grossMonthlySalaryWords?: string;
  salaryPaymentFrequency?: string;

  // ── Leave ─────────────────────────────────────────────────
  annualLeaves?: string;
  casualLeaves?: string;
  medicalLeaves?: string;

  // ── Terms ─────────────────────────────────────────────────
  noticePeriodEmployer?: string;
  noticePeriodEmployee?: string;
  nonCompetePeriod?: string;
  nonCompeteRadius?: string;
  jurisdiction?: string;

  // ── Duties (role-specific; filled by parent form) ─────────
  duties?: string[];

  // ── Additional custom clauses (optional free-text) ────────
  additionalClauses?: string[];
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
// MANAGER / AUTHORISED SIGNATORY
// =========================
interface ManagerData {
  managerName?: string;
  managerPosition?: string;
  managerPhone?: string;
}

// =========================
// ROOT AGREEMENT DATA
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

// ─────────────────────────────────────────────────────────────
//  HELPERS
// ─────────────────────────────────────────────────────────────

const Blank = ({ width = 90 }: { width?: number }) => (
  <span
    style={{
      borderBottom: '1px solid #000',
      display: 'inline-block',
      minWidth: `${width}px`,
      minHeight: '16px',
      textAlign: 'center',
      padding: '0 4px',
      verticalAlign: 'bottom',
    }}
  />
);

// ─────────────────────────────────────────────────────────────
//  COMPONENT
// ─────────────────────────────────────────────────────────────

const EnglishGeneralEmploymentAgreement = ({
  data,
  companyLogo,
  companyWatermark,
}: TemplateProps) => {

  // ── formatters ──────────────────────────────────────────
  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
  };

  // ── derived strings ──────────────────────────────────────
  const employerFullName =
    `${data.company?.companyName || ''} ${data.company?.entityType ? `(${data.company.entityType})` : ''}`.trim();

  const employerAddress = [
    data.company?.companyAddress,
    data.company?.companyLocality,
    data.company?.companyDistrict,
    data.company?.companyState,
  ].filter(Boolean).join(', ') +
    (data.company?.companyPincode ? ` - ${data.company.companyPincode}` : '');

  const employeeFullName = [data.employee?.title, data.employee?.name]
    .filter(Boolean).join(' ');

  const employeeAddress = [
    data.employee?.address,
    data.employee?.locality,
    data.employee?.district,
    data.employee?.state,
  ].filter(Boolean).join(', ') +
    (data.employee?.pincode ? ` - ${data.employee.pincode}` : '');

  const designation   = data.employment?.designation || 'Employee';
  const empType       = data.employment?.employmentType || 'Full-Time Permanent';
  const isFixedTerm   = empType.toLowerCase().includes('fixed');
  const signatoryName = data.manager?.managerName || data.company?.managerName || data.company?.hrName || '';
  const signatoryRole = data.manager?.managerPosition || data.company?.managerPosition || data.company?.hrDesignation || 'Director';

  // ── duties ───────────────────────────────────────────────
  const duties: string[] = (data.employment?.duties?.length ?? 0) > 0
    ? data.employment!.duties!
    : [
        `Performing all tasks, responsibilities, and functions associated with the role of ${designation} as directed by the management.`,
        'Maintaining high standards of quality, accuracy, and professional conduct in all assigned work.',
        'Adhering to the Company\'s policies, procedures, code of conduct, and applicable statutory requirements at all times.',
        'Participating in training, reviews, and skill development programmes as required by the Company.',
        'Reporting regularly to the designated supervisor/manager on work progress, challenges, and any matters requiring escalation.',
        'Maintaining confidentiality with respect to business-sensitive information, client data, and internal processes.',
        'Coordinating effectively with colleagues, vendors, clients, and other stakeholders to ensure smooth operations.',
        'Performing any other duties as may be assigned by the management from time to time in furtherance of the Company\'s objectives.',
      ];

  // ── watermark block (reused on every page) ───────────────
  const Watermark = () => (
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
  );

  // ─────────────────────────────────────────────────────────
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
            width: 210mm; min-height: 297mm;
            padding: 14mm 16mm; margin: 0;
            box-shadow: none; page-break-after: always;
          }
          .a4-page:last-child { page-break-after: auto; }
          .no-print { display: none !important; }
          * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
        }

        /* ── brand gradient ── */
        .gradient-text { color: #D9001B; }
        @media screen {
          .gradient-text {
            background: linear-gradient(180deg,#FF3A3A 0%,#FF1E2D 60%,#D9001B 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
          }
        }

        /* ── typography ── */
        .agreement-title {
          text-align: center; font-size: 17px; font-weight: 900;
          text-decoration: underline; letter-spacing: 1px;
          text-transform: uppercase; margin: 14px 0 2px 0;
          font-family: 'Times New Roman', serif;
        }
        .agreement-subtitle {
          text-align: center; font-size: 13.5px; font-weight: 700;
          margin-bottom: 10px; font-style: italic; color: #333;
        }
        .section-heading {
          font-size: 13.5px; font-weight: 900; text-transform: uppercase;
          text-decoration: underline; margin-top: 13px; margin-bottom: 4px;
          letter-spacing: 0.4px;
        }
        .body-text {
          font-size: 13px; line-height: 1.8; text-align: justify; margin-bottom: 5px;
        }
        .sub-heading {
          font-weight: 700; font-size: 13px;
          margin-top: 7px; margin-bottom: 2px; text-decoration: underline;
        }
        .party-block {
          margin: 8px 0 8px 10px; font-size: 13px; line-height: 1.75;
        }
        .party-name {
          font-weight: 800; font-size: 13.5px;
          text-transform: uppercase; letter-spacing: 0.3px;
        }
        .and-divider {
          text-align: center; font-weight: 900; font-size: 13px;
          margin: 4px 0; letter-spacing: 3px;
        }
        .duty-list {
          margin: 3px 0 5px 20px; font-size: 13px;
          line-height: 1.8; list-style-type: decimal;
        }
        .duty-list li { margin-bottom: 2px; }
        .bullet-list {
          margin: 2px 0 5px 20px; font-size: 12.5px;
          line-height: 1.75; list-style-type: disc;
        }
        .bullet-list li { margin-bottom: 2px; }
        .dash-list {
          margin: 3px 0 5px 20px; font-size: 13px;
          line-height: 1.8; list-style-type: disc;
        }
        .dash-list li { margin-bottom: 3px; }

        /* ── signature ── */
        .sig-grid {
          display: flex; justify-content: space-between;
          margin-top: 28px; gap: 32px;
        }
        .sig-block {
          flex: 1; font-size: 13px; line-height: 1.8;
          border-top: 2px solid #000; padding-top: 10px;
        }
        .sig-block-title { font-weight: 900; font-size: 13.5px; margin-bottom: 14px; }
        .sig-line { border-bottom: 1.5px solid #000; min-height: 48px; margin-bottom: 6px; }
        .sig-field-row {
          margin-top: 5px; font-size: 13px;
          display: flex; align-items: baseline; gap: 4px;
        }
        .end-text {
          text-align: center; font-weight: 900;
          font-size: 14px; margin-top: 24px; letter-spacing: 3px;
        }

        /* ── layout ── */
        .a4-gap { height: 40px; }
        @media print { .a4-gap { display: none; } }
        .divider-page {
          text-align: center; font-weight: 700;
          font-size: 12px; margin: 0 0 10px 0; letter-spacing: 2px;
        }

        /* ── watermark print fix ── */
        @media print {
          .wm-layer { display: flex !important; visibility: visible !important; opacity: 0.08 !important; }
          .wm-layer img { display: block !important; visibility: visible !important; }
        }
      `}</style>

      {/* ══════════════════════════════════════════
          PAGE 1  —  Parties + Position & Duties
      ══════════════════════════════════════════ */}
      <div className="a4-page" style={{ position: "relative" }}>
        <Watermark />
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

          {/* ── FILE REF ── */}
          <div className="mt-6 bg-yellow-200 border border-yellow-300 text-[12.5px] font-semibold px-1 py-1 text-center">
            <span className="font-mono">
              {data.employee.folderSerial || '0000'}/{data.employee.staffId || data.employee.employeeId || 'TEMP-ID'}
            </span>
          </div>

          {/* ── TITLE ── */}
          <div className="agreement-title">Employment Agreement</div>
          <div className="agreement-subtitle">({designation})</div>

          {/* ── PREAMBLE ── */}
          <div className="body-text">
            This Employment Agreement <strong>("Agreement")</strong> is made and entered into as of{' '}
            <span style={{ borderBottom: '1px solid #000', display: 'inline-block', minWidth: '110px', verticalAlign: 'bottom', textAlign: 'center' }}>
              {formatDate(data.employment?.joiningDate)}
            </span>
            , by and between:
          </div>

          {/* ── EMPLOYER ── */}
          <div className="party-block">
            <div className="party-name">{employerFullName}</div>
            <div><strong>Registered Address:</strong> {employerAddress}</div>
            <div><strong>CIN:</strong> {data.company?.cinNumber || ''}&emsp;<strong>PAN:</strong> {data.company?.companyPan || ''}</div>
            <div style={{ fontStyle: 'italic' }}>
              (hereinafter referred to as <strong>"Employer"</strong> or <strong>"Company"</strong>)
            </div>
          </div>

          <div className="and-divider">AND</div>

          {/* ── EMPLOYEE ── */}
          <div className="party-block">
            <div className="party-name">{employeeFullName}</div>
            <div><strong>Address:</strong> {employeeAddress}</div>
            <div>
              <strong>Date of Birth:</strong>{' '}
              {data.employee?.dob
                ? formatDate(data.employee.dob)
                : <Blank width={110} />}
              {data.employee?.gender ? <>&emsp;<strong>Gender:</strong> {data.employee.gender}</> : null}
            </div>
            <div>
              <strong>Aadhaar No.:</strong>{' '}
              {data.employee?.aadhaar || <Blank width={120} />}
              &emsp;
              <strong>PAN No.:</strong>{' '}
              {data.employee?.pan || <Blank width={100} />}
            </div>
            {data.employee?.qualification && (
              <div><strong>Qualification:</strong> {data.employee.qualification}</div>
            )}
            <div style={{ fontStyle: 'italic' }}>
              (hereinafter referred to as <strong>"Employee"</strong>)
            </div>
          </div>

          {/* ── 1. POSITION & DUTIES ── */}
          <div className="section-heading">1. Position, Department and Duties</div>
          <div className="body-text">
            The Employer hereby appoints the Employee to the position of{' '}
            <strong>{designation}</strong>
            {data.employment?.department ? `, ${data.employment.department} Department` : ''}, on a{' '}
            <strong>{empType}</strong> basis
            {isFixedTerm && data.employment?.contractEndDate
              ? ` for a fixed term ending on ${formatDate(data.employment.contractEndDate)}`
              : ''}
            . The Employee shall report to{' '}
            <span style={{ borderBottom: '1px solid #000', display: 'inline-block', minWidth: '100px', verticalAlign: 'bottom', textAlign: 'center' }}>
              {data.employment?.reportingTo || ''}
            </span>{' '}
            and shall diligently and faithfully perform the following duties and responsibilities, as well as any other duties reasonably assigned by the management from time to time:
          </div>
          <ol className="duty-list">
            {duties.map((d, i) => <li key={i}>{d}</li>)}
          </ol>

        </div>
        <PrintFooter />
      </div>

      <div className="a4-gap" />

      {/* ══════════════════════════════════════════
          PAGE 2  —  Commencement · Place · Compensation
      ══════════════════════════════════════════ */}
      <div className="a4-page" style={{ position: 'relative' }}>
        <Watermark />
        <div className="divider-page" />
        <div style={{ position: 'relative', zIndex: 1 }}>

          {/* ── 2. COMMENCEMENT & PROBATION ── */}
          <div className="section-heading">2. Commencement and Probation</div>
          <div className="body-text">
            The Employee's employment shall commence on{' '}
            <span style={{ borderBottom: '1px solid #000', display: 'inline-block', minWidth: '100px', verticalAlign: 'bottom', textAlign: 'center' }}>
              {formatDate(data.employment?.joiningDate)}
            </span>.{' '}
            {isFixedTerm
              ? <>This is a fixed-term engagement ending on <strong>{formatDate(data.employment?.contractEndDate)}</strong>, unless terminated earlier in accordance with the terms of this Agreement.</>
              : <>The Employee shall serve a probation period of <strong>{data.employment?.probationPeriod || '3 (Three) months'}</strong> from the date of joining, during which either party may terminate this Agreement without cause or prior notice. Upon satisfactory completion of probation, the employment shall be confirmed in writing by the Company's authorised signatory.</>
            }
          </div>

          {/* ── 3. PLACE OF POSTING ── */}
          <div className="section-heading">3. Place of Posting</div>
          <div className="body-text">
            The Employee's primary place of posting shall be{' '}
            <span style={{ borderBottom: '1px solid #000', display: 'inline-block', minWidth: '140px', verticalAlign: 'bottom', textAlign: 'center' }}>
              {data.employment?.placeOfPosting || data.company?.companyDistrict || ''}
            </span>.{' '}
            The Employer reserves the right to transfer or depute the Employee to any other location, branch, project site, or office of the Company, as may be required from time to time, with reasonable prior notice.
          </div>

          {/* ── 4. WORKING HOURS ── */}
          <div className="section-heading">4. Working Hours and Attendance</div>
          <div className="body-text">
            The Employee's standard working hours shall be{' '}
            <span style={{ borderBottom: '1px solid #000', display: 'inline-block', minWidth: '130px', verticalAlign: 'bottom', textAlign: 'center' }}>
              {data.employment?.workingHours || '9:30 AM to 6:30 PM'}
            </span>,{' '}
            {data.employment?.workingDays || 'Monday to Saturday'}, with a{' '}
            <span style={{ borderBottom: '1px solid #000', display: 'inline-block', minWidth: '100px', verticalAlign: 'bottom', textAlign: 'center' }}>
              {data.employment?.lunchBreak || '1 (one) hour'}
            </span>{' '}
            lunch break. The Employee may be required to work beyond standard hours to meet operational or project requirements, for which no additional remuneration shall ordinarily be payable unless separately agreed in writing.
          </div>

          {/* ── 5. COMPENSATION ── */}
          <div className="section-heading">5. Compensation</div>

          <div className="sub-heading">Gross Salary</div>
          <div className="body-text">
            The Employer shall pay the Employee a gross annual salary of ₹{' '}
            <span style={{ borderBottom: '1px solid #000', display: 'inline-block', minWidth: '80px', verticalAlign: 'bottom', textAlign: 'center' }}>
              {data.employment?.grossAnnualSalary || ''}
            </span>/- (Rupees{' '}
            <span style={{ borderBottom: '1px solid #000', display: 'inline-block', minWidth: '160px', verticalAlign: 'bottom', textAlign: 'center' }}>
              {data.employment?.grossAnnualSalaryWords || ''}
            </span>{' '}
            only), equivalent to a gross monthly salary of ₹{' '}
            <span style={{ borderBottom: '1px solid #000', display: 'inline-block', minWidth: '80px', verticalAlign: 'bottom', textAlign: 'center' }}>
              {data.employment?.grossMonthlySalary || ''}
            </span>/- (Rupees{' '}
            <span style={{ borderBottom: '1px solid #000', display: 'inline-block', minWidth: '140px', verticalAlign: 'bottom', textAlign: 'center' }}>
              {data.employment?.grossMonthlySalaryWords || ''}
            </span>{' '}
            only), payable on or before the 7th of each calendar month, subject to applicable deductions and statutory withholdings under the Income Tax Act, 1961, and other applicable laws.
          </div>

          <div className="sub-heading">Salary Review</div>
          <div className="body-text">
            The Employee's compensation shall be subject to periodic review at the discretion of the management, based on individual performance, Company performance, and prevailing market conditions. A salary revision, if any, shall be communicated in writing and shall not be construed as a modification to this Agreement unless expressly stated.
          </div>

          {/* ── 6. STATUTORY & OTHER BENEFITS ── */}
          <div className="section-heading">6. Statutory and Other Benefits</div>

          <div className="sub-heading">Mandatory Statutory Benefits</div>
          <ul className="bullet-list">
            <li>
              <strong>Employees' Provident Fund (EPF):</strong> As per the EPF &amp; MP Act, 1952, applicable to establishments with 20 or more employees.
            </li>
            <li>
              <strong>Employee State Insurance (ESI):</strong> Applicable where the Employee's gross monthly salary is below ₹21,000/- and the establishment meets the prescribed threshold.
            </li>
            <li>
              <strong>Gratuity:</strong> As per the Payment of Gratuity Act, 1972, payable upon completion of 5 years of continuous service.
            </li>
            <li>
              <strong>Professional Tax:</strong> Deductible as per the Maharashtra State Tax on Professions, Trades, Callings and Employments Act, 1975.
            </li>
            <li>
              <strong>Leave Entitlement:</strong> Annual / Earned Leave (
              {data.employment?.annualLeaves || '12'} days), Casual Leave (
              {data.employment?.casualLeaves || '6'} days), and Sick / Medical Leave (
              {data.employment?.medicalLeaves || '6'} days) per calendar year.
            </li>
            <li>
              <strong>Maternity Benefits:</strong> As per the Maternity Benefit Act, 1961, for eligible female employees.
            </li>
          </ul>

          <div className="sub-heading">Discretionary Benefits</div>
          <ul className="bullet-list">
            <li><strong>Group Health Insurance:</strong> Medical coverage as per Company policy, subject to eligibility and policy terms.</li>
            <li><strong>Performance Bonus:</strong> Discretionary annual bonus based on individual and Company performance, as determined by the management.</li>
            <li><strong>Professional Development:</strong> Access to relevant training, certifications, and skill development programmes, subject to management approval.</li>
            <li><strong>Other Perks:</strong> Any additional allowances, reimbursements, or facilities as may be communicated separately in writing by the Company from time to time.</li>
          </ul>

        </div>
        <PrintFooter />
      </div>

      <div className="a4-gap" />

      {/* ══════════════════════════════════════════
          PAGE 3  —  Conduct · IP · Confidentiality · Non-Compete · Termination
      ══════════════════════════════════════════ */}
      <div className="a4-page" style={{ position: 'relative' }}>
        <Watermark />
        <div className="divider-page" />
        <div style={{ position: 'relative', zIndex: 1 }}>

          {/* ── 7. CODE OF CONDUCT ── */}
          <div className="section-heading">7. Code of Conduct and Professional Standards</div>
          <div className="body-text">
            The Employee agrees to: (a) conduct themselves professionally, honestly, and ethically at all times; (b) comply fully with the Company's policies, standing orders, and applicable laws; (c) not engage in any act of dishonesty, insubordination, harassment, discrimination, or behaviour that may harm the Company's reputation or interests; and (d) declare any actual or potential conflict of interest to management promptly and in writing.
          </div>

          {/* ── 8. INTELLECTUAL PROPERTY ── */}
          <div className="section-heading">8. Intellectual Property Rights</div>
          <div className="body-text">
            All inventions, designs, reports, software, content, processes, methods, databases, or other work product created by the Employee — whether alone or jointly — in the course of or related to their employment shall be the sole and exclusive intellectual property of the Company. The Employee hereby assigns all rights, title, and interest in such works to the Company and agrees to execute any further instrument to give effect to this assignment. This clause shall survive the termination of this Agreement.
          </div>

          {/* ── 9. CONFIDENTIALITY ── */}
          <div className="section-heading">9. Confidentiality</div>
          <div className="body-text">
            The Employee acknowledges that they will have access to confidential and proprietary information of the Company, including but not limited to: business strategies, client and vendor data, financial information, pricing, internal processes, and any other information not publicly available. The Employee agrees to: (a) keep all such information strictly confidential; (b) not disclose it to any third party without prior written authorisation; and (c) use it solely for the purposes of their employment. These obligations shall continue for a period of <strong>2 (Two) years</strong> after the termination of employment, regardless of the reason for termination. Breach of this clause shall entitle the Company to seek injunctive relief and/or damages under applicable law.
          </div>

          {/* ── 10. NON-COMPETITION & NON-SOLICITATION ── */}
          <div className="section-heading">10. Non-Competition and Non-Solicitation</div>
          <div className="body-text">
            During the term of employment and for a period of{' '}
            <span style={{ borderBottom: '1px solid #000', display: 'inline-block', minWidth: '100px', verticalAlign: 'bottom', textAlign: 'center' }}>
              {data.employment?.nonCompetePeriod || '6 (Six) months'}
            </span>{' '}
            following termination for any reason, the Employee shall not:
          </div>
          <ul className="dash-list">
            <li>
              Directly or indirectly work for, advise, or establish any business that competes with the Company's business within a{' '}
              <span style={{ borderBottom: '1px solid #000', display: 'inline-block', minWidth: '80px', verticalAlign: 'bottom', textAlign: 'center' }}>
                {data.employment?.nonCompeteRadius || '25 km'}
              </span>{' '}
              radius of the Company's registered office;
            </li>
            <li>Solicit, divert, or approach any client, customer, business lead, channel partner, or vendor of the Company for personal gain or on behalf of any competing entity; or</li>
            <li>Recruit, induce, or solicit any employee of the Company to resign or join a competing entity.</li>
          </ul>
          <div className="body-text">
            The Employee acknowledges that these restrictions are reasonable and necessary to protect the legitimate business interests of the Company as a Private Limited Company registered under the Companies Act, 2013.
          </div>

          {/* ── 11. TERMINATION ── */}
          <div className="section-heading">11. Termination of Employment</div>

          <div className="sub-heading">By the Employer</div>
          <ul className="dash-list">
            <li>
              <strong>For Cause (Immediate):</strong> The Employer may terminate without notice in cases of: gross misconduct, wilful insubordination, fraud, misappropriation of Company assets, breach of confidentiality, criminal conviction, or any other material breach of this Agreement.
            </li>
            <li>
              <strong>Without Cause:</strong> By giving{' '}
              <span style={{ borderBottom: '1px solid #000', display: 'inline-block', minWidth: '110px', verticalAlign: 'bottom', textAlign: 'center' }}>
                {data.employment?.noticePeriodEmployer || '30 (Thirty) days'}
              </span>{' '}
              written notice, or salary in lieu thereof.
            </li>
          </ul>

          <div className="sub-heading">By the Employee</div>
          <div className="body-text">
            The Employee may resign by providing{' '}
            <span style={{ borderBottom: '1px solid #000', display: 'inline-block', minWidth: '110px', verticalAlign: 'bottom', textAlign: 'center' }}>
              {data.employment?.noticePeriodEmployee || '30 (Thirty) days'}
            </span>{' '}
            written notice to the Employer. Upon termination or resignation, the Employee shall immediately: (a) return all Company property, devices, documents, and access credentials; (b) hand over all pending work and knowledge documentation; and (c) cooperate fully with the transition process.
          </div>

        </div>
        <PrintFooter />
      </div>

      <div className="a4-gap" />

      {/* ══════════════════════════════════════════
          PAGE 4  —  Additional Clauses · Governing Law · Signatures
      ══════════════════════════════════════════ */}
      <div className="a4-page" style={{ position: 'relative' }}>
        <Watermark />
        <div className="divider-page" />
        <div style={{ position: 'relative', zIndex: 1 }}>

          {/* ── 12. DISPUTE RESOLUTION ── */}
          <div className="section-heading">12. Dispute Resolution</div>
          <div className="body-text">
            In the event of any dispute or disagreement between the parties arising out of or in connection with this Agreement, the parties shall first attempt to resolve the matter amicably through good-faith discussions. If the dispute is not resolved within <strong>30 (Thirty) days</strong> of notice, either party may refer the matter to arbitration under the Arbitration and Conciliation Act, 1996, with a sole arbitrator mutually agreed upon by both parties. The seat of arbitration shall be{' '}
            <span style={{ borderBottom: '1px solid #000', display: 'inline-block', minWidth: '110px', verticalAlign: 'bottom', textAlign: 'center' }}>
              {data.employment?.jurisdiction || data.company?.companyDistrict || ''}
            </span>.
          </div>

          {/* ── 13. GOVERNING LAW ── */}
          <div className="section-heading">13. Governing Law and Jurisdiction</div>
          <div className="body-text">
            This Agreement shall be governed by and construed in accordance with the laws of India, including the Companies Act, 2013, the Indian Contract Act, 1872, the Industrial Employment (Standing Orders) Act, 1946, and all other applicable central and state legislation. The courts at{' '}
            <span style={{ borderBottom: '1px solid #000', display: 'inline-block', minWidth: '110px', verticalAlign: 'bottom', textAlign: 'center' }}>
              {data.employment?.jurisdiction || data.company?.companyDistrict || ''}
            </span>{' '}
            shall have exclusive jurisdiction over any disputes arising from this Agreement.
          </div>

          {/* ── 14. ENTIRE AGREEMENT & SEVERABILITY ── */}
          <div className="section-heading">14. Entire Agreement, Amendments and Severability</div>
          <div className="body-text">
            This Agreement constitutes the entire agreement between the parties with respect to the Employee's employment and supersedes all prior discussions, offer letters, negotiations, and agreements, whether written or oral. Any amendment to this Agreement must be in writing and signed by both parties. If any provision of this Agreement is held to be invalid or unenforceable, the remaining provisions shall continue in full force and effect.
          </div>

          {/* ── 15. ADDITIONAL CLAUSES (optional, data-driven) ── */}
          {(data.employment?.additionalClauses?.length ?? 0) > 0 && (
            <>
              <div className="section-heading">15. Special Conditions</div>
              {data.employment!.additionalClauses!.map((clause, i) => (
                <div className="body-text" key={i}>
                  <strong>15.{i + 1}.</strong> {clause}
                </div>
              ))}
            </>
          )}

          {/* ── 16. ACKNOWLEDGEMENT ── */}
          <div className="section-heading">{(data.employment?.additionalClauses?.length ?? 0) > 0 ? '16' : '15'}. Acknowledgement</div>
          <div className="body-text">
            The Employee confirms that they have read, understood, and freely agreed to all terms and conditions set out in this Agreement, that they are not subject to any prior contractual restriction that would prevent them from fulfilling their duties hereunder, and that they enter into this Agreement without any coercion or undue influence.
          </div>

          {/* ── SIGNATURES ── */}
          <div className="sig-grid">

            {/* EMPLOYER */}
            <div className="sig-block">
              <div className="sig-block-title">For and on Behalf of the Company</div>
              <div className="sig-line" />
              <div className="sig-field-row">
                <strong>Date:</strong>
                <span style={{ borderBottom: '1px solid #000', display: 'inline-block', minWidth: '110px', verticalAlign: 'bottom', textAlign: 'center' }}>
                  {formatDate(data.employment?.joiningDate)}
                </span>
              </div>
              <div className="sig-field-row">
                <strong>Name:</strong>
                <span style={{ borderBottom: '1px solid #000', display: 'inline-block', minWidth: '130px', verticalAlign: 'bottom', textAlign: 'center' }}>
                  {signatoryName}
                </span>
              </div>
              <div className="sig-field-row">
                <strong>Designation:</strong>
                <span style={{ borderBottom: '1px solid #000', display: 'inline-block', minWidth: '120px', verticalAlign: 'bottom', textAlign: 'center' }}>
                  {signatoryRole}
                </span>
              </div>
              <div style={{ marginTop: '6px', fontSize: '12px', fontStyle: 'italic' }}>
                Authorised Signatory —{' '}
                {data.company?.companyName || ''}
                {data.company?.entityType ? ` (${data.company.entityType})` : ''}
              </div>
              <div style={{ marginTop: '4px', fontSize: '12px' }}>
                CIN: {data.company?.cinNumber || ''}
              </div>
              <div style={{ fontSize: '12px' }}>
                PAN: {data.company?.companyPan || ''}
              </div>
            </div>

            {/* EMPLOYEE */}
            <div className="sig-block">
              <div className="sig-block-title">Employee Signature</div>
              <div className="sig-line" />
              <div className="sig-field-row">
                <strong>Date:</strong>
                <span style={{ borderBottom: '1px solid #000', display: 'inline-block', minWidth: '110px', verticalAlign: 'bottom', textAlign: 'center' }}>
                  {formatDate(data.employment?.joiningDate)}
                </span>
              </div>
              <div className="sig-field-row">
                <strong>Name:</strong>
                <span style={{ borderBottom: '1px solid #000', display: 'inline-block', minWidth: '130px', verticalAlign: 'bottom', textAlign: 'center' }}>
                  {employeeFullName}
                </span>
              </div>
              <div className="sig-field-row">
                <strong>Designation:</strong>
                <span style={{ borderBottom: '1px solid #000', display: 'inline-block', minWidth: '120px', verticalAlign: 'bottom', textAlign: 'center' }}>
                  {designation}
                </span>
              </div>
              <div className="sig-field-row">
                <strong>Employee ID:</strong>
                <span style={{ borderBottom: '1px solid #000', display: 'inline-block', minWidth: '100px', verticalAlign: 'bottom', textAlign: 'center' }}>
                  {data.employee?.staffId || data.employee?.employeeId || ''}
                </span>
              </div>
              <div style={{ marginTop: '12px', fontSize: '12.5px', fontWeight: 700 }}>
                Left Thumb Impression:-
              </div>
              <div style={{
                border: '1px solid #000', minHeight: '70px',
                marginTop: '4px', width: '130px',
              }} />
            </div>

          </div>

          {/* ── WITNESS ── */}
          <div style={{ marginTop: '32px', borderTop: '1px dashed #555', paddingTop: '12px' }}>
            <div style={{ fontSize: '12.5px', fontWeight: 700, marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Witnesses
            </div>
            <div style={{ display: 'flex', gap: '40px' }}>
              {[1, 2].map(n => (
                <div key={n} style={{ flex: 1, fontSize: '12.5px', lineHeight: 1.8 }}>
                  <div style={{ fontWeight: 700 }}>Witness {n}</div>
                  <div>Name: <span style={{ borderBottom: '1px solid #000', display: 'inline-block', minWidth: '110px', verticalAlign: 'bottom' }} /></div>
                  <div>Signature: <span style={{ borderBottom: '1px solid #000', display: 'inline-block', minWidth: '100px', verticalAlign: 'bottom' }} /></div>
                  <div>Date: <span style={{ borderBottom: '1px solid #000', display: 'inline-block', minWidth: '90px', verticalAlign: 'bottom' }} /></div>
                </div>
              ))}
            </div>
          </div>

          <div className="end-text">* * * END * * *</div>

        </div>
        <PrintFooter />
      </div>
    </div>
  );
};

export default EnglishGeneralEmploymentAgreement;