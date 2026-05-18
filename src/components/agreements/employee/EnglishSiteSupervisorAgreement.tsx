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

const EnglishOfficeSupervisorAgreement = ({ data, companyLogo, companyWatermark }: TemplateProps) => {

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
    "Overseeing daily office operations and administrative staff.",
    "Managing office supplies, equipment, and inventory.",
    "Coordinating meetings, appointments, and site/property visits.",
    "Maintaining client records, files, and project documentation.",
    "Assisting with marketing and promotional activities.",
    "Ensuring compliance with company policies and procedures.",
    "Handling inquiries from clients, vendors, and agents.",
    "Performing other duties as assigned by the management from time to time.",
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
          margin-bottom: 10px;
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
        .a4-gap {
          height: 40px;
        }
        @media print {
          .a4-gap { display: none; }
        }
        .agreement-watermark,
        .agreement-watermark img {
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
        .agreement-watermark {
          top: var(--ashray-print-margin-top, 14mm) !important;
          right: var(--ashray-print-margin-right, 16mm) !important;
          bottom: var(--ashray-print-margin-bottom, 14mm) !important;
          left: var(--ashray-print-margin-left, 16mm) !important;
          width: auto !important;
          height: auto !important;
          box-sizing: border-box !important;
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

          <div className="mt-6 bg-yellow-200 border border-yellow-300 text-[12.5px] font-semibold px-1 py-1 text-center">

  <div className="font-mono leading-tight break-words inline-block text-center max-w-full">
    {data.employee.folderSerial || '0000'}/{data.employee.staffId || data.employee.employeeId || 'TEMP-ID'}
  </div>
</div>

          {/* ── TITLE ── */}
          <div className="agreement-title">Employment Agreement</div>
          <div className="agreement-subtitle">(Office Supervisor)</div>

          {/* ── PREAMBLE ── */}
          <div className="body-text">
            This Employment Agreement <strong>("Agreement")</strong> is made and entered into as of{' '}
            <span className="underline-blank">{formatDate(data.employment?.joiningDate)}</span>, by and between:
          </div>

          {/* ── EMPLOYER ── */}
          <div className="party-block">
            <div className="party-name">{employerFullName}</div>
            <div><strong>Address:</strong> {employerAddress}</div>
            <div><strong>CIN / Reg. No.:</strong> {data.company?.cinNumber || data.company?.licenseRegistrationNumber || ''}</div>
            <div style={{ fontStyle: 'italic' }}>(hereinafter referred to as <strong>"Employer"</strong>)</div>
          </div>

          <div className="and-divider">AND</div>

          {/* ── EMPLOYEE ── */}
          <div className="party-block">
            <div className="party-name">{employeeFullName}</div>
            <div><strong>Address:</strong> {employeeAddress}</div>
            <div><strong>Date of Birth:</strong> {data.employee?.dob ? formatDate(data.employee.dob) : <span className="underline-blank" style={{ minWidth: '100px' }} />}</div>
            <div>
              <strong>Aadhaar No.:</strong> {data.employee?.aadhaar || <span className="underline-blank" style={{ minWidth: '120px' }} />}
              &emsp;
              <strong>PAN No.:</strong> {data.employee?.pan || <span className="underline-blank" style={{ minWidth: '100px' }} />}
            </div>
            <div style={{ fontStyle: 'italic' }}>(hereinafter referred to as <strong>"Employee"</strong>)</div>
          </div>

          {/* ══ 1. POSITION AND DUTIES ══ */}
          <div className="section-heading">1. Position and Duties</div>
          <div className="body-text">
            The Employer hereby employs the Employee in the position of <strong>Office Supervisor</strong>
            {data.employment?.department ? ` in the ${data.employment.department} Department` : ''}. The Employee shall report to{' '}
            <span className="underline-blank">{data.employment?.reportingTo || ''}</span>{' '}
            and shall perform all duties and responsibilities as typically associated with such a position in a real estate business, including but not limited to:
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
<div className="divider-page"></div>
  {/* CONTENT */}
  <div style={{ position: "relative", zIndex: 1 }}>

          {/* ══ 2. COMMENCEMENT ══ */}
          <div className="section-heading">2. Commencement of Employment</div>
          <div className="body-text">
            The Employee's employment with the Employer shall commence on{' '}
            <span className="underline-blank">{formatDate(data.employment?.joiningDate)}</span>.
            The Employee shall be on probation for a period of{' '}
            <strong>{data.employment?.probationPeriod || '3 (Three) months'}</strong> from the date of joining,
            during which either party may terminate this Agreement without cause or prior notice.
            Upon successful completion of probation, the employment shall be confirmed in writing.
          </div>


          {/* ══ 3. COMPENSATION ══ */}
          <div className="section-heading">3. Compensation</div>

          <div className="sub-heading">Salary</div>
          <div className="body-text">
  The Employer shall pay the Employee a gross annual salary of ₹{' '}
  <span className="underline-blank">
    {data.employment?.grossAnnualSalary || ''}
  </span>
  /- (Rupees{' '}
  <span className="underline-blank" style={{ minWidth: '160px' }}>
    {data.employment?.grossAnnualSalaryWords || ''}
  </span>{' '}
  only),

  which is equivalent to a gross monthly salary of ₹{' '}
  <span className="underline-blank">
    {data.employment?.grossMonthlySalary || ''}
  </span>
  /- (Rupees{' '}
  <span className="underline-blank" style={{ minWidth: '140px' }}>
    {data.employment?.grossMonthlySalaryWords || ''}
  </span>{' '}
  only),

  payable in equal monthly installments, subject to applicable deductions and statutory withholdings.
</div>

          <div className="sub-heading">Benefits</div>
          <div className="body-text">
            The Employee shall be eligible for benefits as per the Employer's standard policies, which may include:
          </div>

          <div style={{ fontWeight: 700, fontSize: '13px', marginTop: '5px', marginBottom: '2px' }}>
            Mandatory Statutory Benefits
          </div>
	          <ul className="benefits-list">
            <li><strong>Employees' Provident Fund (EPF):</strong> Mandatory for companies with 20 or more employees.</li>
            <li><strong>Employee State Insurance (ESI):</strong> Required if company size exceeds 10 employees (20 in some states) and employees earn below ₹21,000 per month.</li>
            <li><strong>Gratuity:</strong> Payable if the employee has completed 5 years of continuous service.</li>
            <li>
              <strong>Leave Policy:</strong> Includes paid Annual / Earned Leave ({data.employment?.annualLeaves || '12'} days),
              Sick / Medical Leave ({data.employment?.medicalLeaves || '6'} days), and Casual Leave ({data.employment?.casualLeaves || '6'} days).
            </li>
            <li><strong>Maternity Benefits:</strong> Paid leave for eligible female employees as per the Maternity Benefit Act, 1961.</li>
          </ul>

          <div style={{ fontWeight: 700, fontSize: '13px', marginTop: '5px', marginBottom: '2px' }}>
            Voluntary / Competitive Benefits
          </div>
          <ul className="benefits-list">
            <li><strong>Group Health Insurance:</strong> Comprehensive medical coverage as per Company policy.</li>
            <li><strong>Performance Incentives:</strong> Performance-based bonuses and salary increments at management's discretion.</li>
            <li><strong>Flexible Working:</strong> Hybrid/remote work options and flexible hours, subject to management approval.</li>
            <li><strong>Professional Development:</strong> Training workshops, certifications, and upskilling opportunities.</li>
            <li><strong>Employee Stock Ownership Plans (ESOPs):</strong> Offering equity to motivate and retain top talent, if applicable.</li>
          </ul>

          <div style={{ fontWeight: 700, fontSize: '13px', marginTop: '5px', marginBottom: '2px' }}>
            Optional Perks
          </div>
          <ul className="benefits-list">
            <li>Wellness Programs: Gym memberships, mental wellness support.</li>
            <li>Additional Leaves: Paternity leave, bereavement leave as per Company policy.</li>
            <li>Assistance: Childcare support, relocation assistance as applicable.</li>
            <li>Health insurance, paid time off (vacation, sick leave, public holidays).</li>
	            <li>Provident Fund contributions and other benefits as determined by the Employer from time to time.</li>
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

          <div className="divider-page"></div>
          {/* ══ 4. WORKING HOURS ══ */}
          <div className="section-heading">4. Working Hours</div>
          <div className="body-text">
            The Employee's standard working hours shall be{' '}
            <span className="underline-blank">{data.employment?.workingHours || '9:00 AM to 6:00 PM'}</span>,{' '}
            {data.employment?.workingDays || 'Monday to Friday'}, with a{' '}
            <span className="underline-blank">{data.employment?.lunchBreak || '1 (one) hour'}</span>{' '}
            lunch break. The Employee may be required to work additional hours as necessary to fulfill the duties of the position.
          </div>

          {/* ══ 5. CONFIDENTIALITY ══ */}
          <div className="section-heading">5. Confidentiality</div>
          <div className="body-text">
            The Employee acknowledges that during the course of employment, they will have access to confidential and proprietary information belonging to the Employer, including but not limited to client lists, property listings, financial data, marketing strategies, and business plans. The Employee agrees to keep all such information strictly confidential and not to disclose it to any third party or use it for any purpose other than for the benefit of the Employer, both during and after the term of employment.
          </div>

          {/* ══ 6. NON-COMPETITION ══ */}
          <div className="section-heading">6. Non-Competition</div>
          <div className="body-text">
            During the term of employment and for a period of{' '}
            <span className="underline-blank">{data.employment?.nonCompetePeriod || '6 (Six) months'}</span>{' '}
            following the termination of employment for any reason, the Employee shall not, directly or indirectly, engage in any business or activity that competes with the Employer's real estate business within a{' '}
            <span className="underline-blank">{data.employment?.nonCompeteRadius || '25 km'}</span>{' '}
            radius of the Employer's primary place of business.
          </div>

      

      

          {/* ══ 7. TERMINATION ══ */}
          <div className="section-heading">7. Termination of Employment</div>

          <div className="sub-heading">Termination by Employer</div>
          <div className="body-text">The Employer may terminate the Employee's employment for any of the following reasons:</div>
          <ul className="termination-list">
            <li>
              <strong>With Cause:</strong> Immediately, for reasons including but not limited to gross misconduct,
              insubordination, breach of confidentiality, fraud, or material breach of this Agreement.
            </li>
            <li>
              <strong>Without Cause:</strong> By providing{' '}
              <span className="underline-blank">{data.employment?.noticePeriodEmployer || '30 (Thirty) days'}</span>{' '}
              written notice or payment in lieu of notice.
            </li>
          </ul>

          <div className="sub-heading">Termination by Employee</div>
          <div className="body-text">
            The Employee may terminate their employment by providing{' '}
            <span className="underline-blank">{data.employment?.noticePeriodEmployee || '30 (Thirty) days'}</span>{' '}
            written notice to the Employer. Upon termination, the Employee shall immediately return all Company property, documents, records, access credentials, and any other assets belonging to the Employer.
          </div>

          {/* ══ 8. GOVERNING LAW ══ */}
          <div className="section-heading">8. Governing Law and Jurisdiction</div>
          <div className="body-text">
            This Agreement shall be governed by and construed in accordance with the laws of India.
            Any disputes arising out of or in connection with this Agreement shall be subject to the exclusive jurisdiction of the courts in{' '}
            <span className="underline-blank">{data.employment?.jurisdiction || data.company?.companyDistrict || ''}</span>.
          </div>

          {/* ══ 9. ENTIRE AGREEMENT ══ */}
          <div className="section-heading">9. Entire Agreement</div>
	          <div className="body-text">
	            This Agreement constitutes the entire agreement between the Employer and the Employee with respect to the terms of employment and supersedes all prior discussions, negotiations, and agreements, whether written or oral.
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

          <div className="divider-page"></div>
          {/* ══ 10. AMENDMENTS ══ */}
          <div className="section-heading">10. Amendments</div>
          <div className="body-text">
            Any amendment or modification to this Agreement must be in writing and signed by both the Employer and the Employee.
          </div>

          

          {/* ══ 11. SEVERABILITY ══ */}
          <div className="section-heading">11. Severability</div>
          <div className="body-text">
            If any provision of this Agreement is held to be invalid or unenforceable, the remaining provisions shall continue to be valid and enforceable to the fullest extent permitted by law.
          </div>

          {/* ══ SIGNATURES ══ */}
          <div className="sig-grid">

            {/* EMPLOYER SIGNATURE */}
            <div className="sig-block">
              <div className="sig-block-title">Employer Signature</div>
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
                <strong>Title:</strong>
                <span className="underline-blank" style={{ minWidth: '120px' }}>
                  {data.manager?.managerPosition || data.company?.managerPosition || data.company?.hrDesignation}
                </span>
              </div>
              <div style={{ marginTop: '6px', fontSize: '12px', fontStyle: 'italic' }}>
                For {data.company?.companyName || ''}{data.company?.entityType ? ` (${data.company.entityType})` : ''}
              </div>
            </div>

            {/* EMPLOYEE SIGNATURE */}
            <div className="sig-block">
              <div className="sig-block-title">Employee Signature</div>
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
              <div style={{ marginTop: '16px', fontSize: '12.5px', fontWeight: 700 }}>
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

	          <div className="end-text">* * * END * * *</div>
	          

	        </div>
        <PrintFooter />
	      </div>
	    </div>
  );
};

export default EnglishOfficeSupervisorAgreement;
