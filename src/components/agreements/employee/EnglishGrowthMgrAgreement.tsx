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

const EnglishDigitalGrowthManagerAgreement = ({ data, companyLogo, companyWatermark }: TemplateProps) => {

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

  // Default duties for Digital Growth Manager in a real estate / private limited company context
  const defaultDuties = [
    "Developing and executing comprehensive digital marketing strategies to drive online visibility, lead generation, and brand awareness for the Company.",
    "Managing and optimising the Company's presence across all digital platforms including website, Google Business Profile, social media (Instagram, Facebook, LinkedIn, YouTube), and real estate listing portals.",
    "Planning, creating, and publishing engaging digital content — including reels, property showcase videos, blog posts, emailers, and paid ad creatives — aligned with the Company's brand identity.",
    "Running and managing performance marketing campaigns (Google Ads, Meta Ads, YouTube Ads), tracking KPIs, and optimising campaigns to maximise Return on Investment (ROI).",
    "Conducting Search Engine Optimisation (SEO) and Search Engine Marketing (SEM) activities to improve organic rankings and qualified traffic to the Company's digital assets.",
    "Monitoring, analysing, and reporting on digital campaign performance using tools such as Google Analytics, Meta Business Suite, and other relevant platforms, providing monthly reports to management.",
    "Managing CRM integrations, lead nurturing workflows, and digital sales funnels to ensure timely follow-up and conversion of online enquiries.",
    "Collaborating with the sales team, channel partners, and external agencies to align digital efforts with on-ground sales targets and project launch timelines.",
    "Staying updated on emerging digital marketing trends, competitor activity, and industry best practices within the real estate sector, recommending innovations as appropriate.",
    "Performing other duties as assigned by the management from time to time in furtherance of the Company's digital growth objectives.",
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

          {/* TITLE */}
          <div className="agreement-title">Employment Agreement</div>
          <div className="agreement-subtitle">(Digital Growth Manager)</div>

          {/* PREAMBLE */}
          <div className="body-text">
            This Employment Agreement <strong>("Agreement")</strong> is made and entered into as of{' '}
            <span className="underline-blank">{formatDate(data.employment?.joiningDate)}</span>, by and between:
          </div>

          {/* EMPLOYER */}
          <div className="party-block">
            <div className="party-name">{employerFullName}</div>
            <div><strong>Address:</strong> {employerAddress}</div>
            <div><strong>CIN:</strong> {data.company?.cinNumber || ''}</div>
            <div><strong>PAN:</strong> {data.company?.companyPan || ''}</div>
            <div style={{ fontStyle: 'italic' }}>(hereinafter referred to as <strong>"Employer"</strong> or <strong>"Company"</strong>)</div>
          </div>

          <div className="and-divider">AND</div>

          {/* EMPLOYEE */}
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

          {/* 1. POSITION AND DUTIES */}
          <div className="section-heading">1. Position and Duties</div>
          <div className="body-text">
            The Employer hereby employs the Employee in the position of <strong>Digital Growth Manager</strong>
            {data.employment?.department ? ` in the ${data.employment.department} Department` : ' in the Digital Marketing & Growth Department'}. The Employee shall report to{' '}
            <span className="underline-blank">{data.employment?.reportingTo || ''}</span>{' '}
            and shall be responsible for driving the Company's digital presence, online lead generation, and brand growth across all digital channels. The Employee's duties and responsibilities shall include, but shall not be limited to:
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
          <img src={companyWatermark || companyLogo || ''} style={{ width: "70%", maxWidth: "720px", height: "auto", objectFit: "contain" }} />
        </div>
        <div className="divider-page"></div>

        {/* CONTENT */}
        <div style={{ position: "relative", zIndex: 1 }}>

          {/* 2. COMMENCEMENT */}
          <div className="section-heading">2. Commencement of Employment</div>
          <div className="body-text">
            The Employee's employment with the Employer shall commence on{' '}
            <span className="underline-blank">{formatDate(data.employment?.joiningDate)}</span>.
            The Employee shall be on probation for a period of{' '}
            <strong>{data.employment?.probationPeriod || '3 (Three) months'}</strong> from the date of joining,
            during which either party may terminate this Agreement without cause or prior notice.
            Upon successful completion of the probation period, the employment shall be confirmed in writing by the authorised signatory of the Company.
          </div>

          {/* 3. PLACE OF POSTING */}
          <div className="section-heading">3. Place of Posting</div>
          <div className="body-text">
            The Employee's primary place of posting shall be{' '}
            <span className="underline-blank" style={{ minWidth: '140px' }}>
              {data.employment?.placeOfPosting || data.company?.companyDistrict || ''}
            </span>.
            The Employer reserves the right to transfer or depute the Employee to any other location, project site, or office of the Company, as may be necessary from time to time, with prior intimation.
          </div>

          {/* 4. COMPENSATION */}
          <div className="section-heading">4. Compensation</div>

          <div className="sub-heading">Salary</div>
          <div className="body-text">
            The Employer shall pay the Employee a gross annual salary of ₹{' '}
            <span className="underline-blank">{data.employment?.grossAnnualSalary || ''}</span>/-{' '}
            (Rupees{' '}
            <span className="underline-blank" style={{ minWidth: '160px' }}>{data.employment?.grossAnnualSalaryWords || ''}</span>{' '}
            only), which is equivalent to a gross monthly salary of ₹{' '}
            <span className="underline-blank">{data.employment?.grossMonthlySalary || ''}</span>/-{' '}
            (Rupees{' '}
            <span className="underline-blank" style={{ minWidth: '140px' }}>{data.employment?.grossMonthlySalaryWords || ''}</span>{' '}
            only), payable in equal monthly instalments on or before the 7th of the following calendar month, subject to applicable deductions and statutory withholdings under the Income Tax Act, 1961, and other applicable laws.
          </div>

          <div className="sub-heading">Performance Incentives</div>
          <div className="body-text">
            The Employee shall be eligible for performance-based incentives as per the digital KPI framework defined by the management from time to time, including but not limited to metrics such as lead generation volume, cost per lead, website traffic growth, social media engagement, and campaign ROI. Such incentives shall be at the sole discretion of the management and shall not form part of the fixed contractual remuneration.
          </div>

          <div className="sub-heading">Benefits</div>
          <div className="body-text">
            As a Private Limited Company registered under the Companies Act, 2013, the Employer shall provide the following statutory and voluntary benefits:
          </div>

          <div style={{ fontWeight: 700, fontSize: '13px', marginTop: '5px', marginBottom: '2px' }}>
            Mandatory Statutory Benefits (as applicable under Indian Law)
          </div>
          <ul className="benefits-list">
            <li><strong>Employees' Provident Fund (EPF):</strong> Applicable as per the EPF &amp; MP Act, 1952, for establishments with 20 or more employees.</li>
            <li><strong>Employee State Insurance (ESI):</strong> Applicable if the Employee's gross monthly salary is below ₹21,000/- and establishment meets threshold criteria.</li>
            <li><strong>Gratuity:</strong> Payable upon completion of 5 years of continuous service, as per the Payment of Gratuity Act, 1972.</li>
            <li><strong>Professional Tax:</strong> Deductible as per Maharashtra State Tax on Professions, Trades, Callings and Employments Act, 1975.</li>
            <li>
              <strong>Leave Entitlement:</strong> Annual / Earned Leave ({data.employment?.annualLeaves || '12'} days),
              Casual Leave ({data.employment?.casualLeaves || '6'} days), and Sick / Medical Leave ({data.employment?.medicalLeaves || '6'} days) per calendar year.
            </li>
            <li><strong>Maternity Benefits:</strong> As applicable under the Maternity Benefit Act, 1961, for eligible female employees.</li>
          </ul>

          <div style={{ fontWeight: 700, fontSize: '13px', marginTop: '5px', marginBottom: '2px' }}>
            Role-Specific &amp; Voluntary Benefits
          </div>
          <ul className="benefits-list">
            <li><strong>Digital Tools &amp; Software Access:</strong> Company-provided access to licensed digital marketing tools, analytics platforms, design software, and CRM systems necessary to perform the role.</li>
            <li><strong>Group Health Insurance:</strong> Comprehensive medical coverage as per Company policy.</li>
            <li><strong>Professional Development:</strong> Sponsored access to digital marketing certifications, workshops (e.g., Google, Meta, HubSpot), and industry conferences relevant to the role.</li>
            <li><strong>Performance Bonus:</strong> Discretionary annual bonus based on individual and Company performance, as determined by the management.</li>
            <li><strong>Flexible Working:</strong> Hybrid / remote working options subject to management approval and operational requirements.</li>
            <li><strong>Internet &amp; Communication Allowance:</strong> Reimbursement towards internet and mobile expenses directly incurred for work purposes, as per Company policy.</li>
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
          <img src={companyWatermark || companyLogo || ''} style={{ width: "70%", maxWidth: "720px", height: "auto", objectFit: "contain" }} />
        </div>

        {/* CONTENT */}
        <div style={{ position: "relative", zIndex: 1 }}>

          <div className="divider-page"></div>

          {/* 5. WORKING HOURS */}
          <div className="section-heading">5. Working Hours</div>
          <div className="body-text">
            The Employee's standard working hours shall be{' '}
            <span className="underline-blank">{data.employment?.workingHours || '9:30 AM to 6:30 PM'}</span>,{' '}
            {data.employment?.workingDays || 'Monday to Saturday'}, with a{' '}
            <span className="underline-blank">{data.employment?.lunchBreak || '1 (one) hour'}</span>{' '}
            lunch break. Given the nature of digital marketing work, the Employee understands and agrees that certain campaign monitoring, social media management, and client-facing activities may occasionally require engagement outside standard hours. The Employee shall make themselves reasonably available for such requirements without additional remuneration, unless otherwise agreed in writing.
          </div>

          {/* 6. INTELLECTUAL PROPERTY */}
          <div className="section-heading">6. Intellectual Property Rights</div>
          <div className="body-text">
            All creative works, digital content, strategies, campaigns, designs, databases, source codes, scripts, reports, and other materials conceived, developed, or produced by the Employee in the course of employment — whether alone or in collaboration — shall be the sole and exclusive intellectual property of the Company. The Employee hereby assigns all rights, title, and interest in such works to the Company and agrees to execute any further documents as may be reasonably required to give effect to this assignment. This clause shall survive the termination of this Agreement.
          </div>

          {/* 7. CONFIDENTIALITY */}
          <div className="section-heading">7. Confidentiality</div>
          <div className="body-text">
            The Employee acknowledges that in the course of employment they will have access to confidential and proprietary information belonging to the Company, including but not limited to: digital marketing strategies, ad account data, audience targeting parameters, customer and lead databases, vendor contracts, financial performance data, unreleased project information, and technology systems. The Employee agrees to keep all such information strictly confidential, to not disclose it to any third party, and to not use it for any purpose other than for the benefit of the Company — both during and after the term of employment. Breach of this clause shall render the Employee liable for damages, including but not limited to injunctive relief under applicable law.
          </div>

          {/* 8. NON-COMPETITION AND NON-SOLICITATION */}
          <div className="section-heading">8. Non-Competition and Non-Solicitation</div>
          <div className="body-text">
            During the term of employment and for a period of{' '}
            <span className="underline-blank">{data.employment?.nonCompetePeriod || '6 (Six) months'}</span>{' '}
            following the termination of employment for any reason, the Employee shall not:
          </div>
          <ul className="termination-list">
            <li>Directly or indirectly engage in, advise, or be employed by any competing real estate enterprise within a{' '}
              <span className="underline-blank">{data.employment?.nonCompeteRadius || '25 km'}</span>{' '}
              radius of the Company's registered office;
            </li>
            <li>Solicit, approach, or attempt to divert any client, customer, business lead, channel partner, or vendor of the Company for personal gain or for the benefit of any competing entity; or</li>
            <li>Solicit, recruit, or induce any employee of the Company to leave their employment.</li>
          </ul>
          <div className="body-text">
            The Employee acknowledges that these restrictions are reasonable, necessary to protect the Company's legitimate business interests, and are consistent with the standards applicable to employees of private limited companies under Indian law.
          </div>

          {/* 9. TERMINATION */}
          <div className="section-heading">9. Termination of Employment</div>

          <div className="sub-heading">Termination by Employer</div>
          <div className="body-text">The Employer may terminate this Agreement in the following circumstances:</div>
          <ul className="termination-list">
            <li>
              <strong>For Cause (Immediate):</strong> In cases of gross misconduct, wilful insubordination, fraud, misappropriation of digital assets or Company data, unauthorised disclosure of confidential information, criminal conviction, or material breach of any provision of this Agreement — without notice or compensation in lieu of notice.
            </li>
            <li>
              <strong>Without Cause:</strong> By providing{' '}
              <span className="underline-blank">{data.employment?.noticePeriodEmployer || '30 (Thirty) days'}</span>{' '}
              written notice, or payment of equivalent salary in lieu thereof.
            </li>
          </ul>

          <div className="sub-heading">Termination by Employee</div>
          <div className="body-text">
            The Employee may resign by providing{' '}
            <span className="underline-blank">{data.employment?.noticePeriodEmployee || '30 (Thirty) days'}</span>{' '}
            written notice to the Employer. Upon resignation or termination, the Employee shall: (a) immediately return all Company property, devices, access credentials, software licences, and documents; (b) transfer all digital accounts, ad accounts, social media credentials, and campaign assets to the Company; and (c) cooperate fully with the handover process.
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
          <img src={companyWatermark || companyLogo || ''} style={{ width: "70%", maxWidth: "720px", height: "auto", objectFit: "contain" }} />
        </div>

        {/* CONTENT */}
        <div style={{ position: "relative", zIndex: 1 }}>

          <div className="divider-page"></div>

          {/* 10. CODE OF CONDUCT */}
          <div className="section-heading">10. Code of Conduct and Professional Standards</div>
          <div className="body-text">
            The Employee agrees to conduct themselves professionally and ethically at all times when representing the Company online and offline. The Employee shall not publish, post, or disseminate any content — whether on personal or Company channels — that may bring the Company into disrepute, violate applicable advertising standards (including ASI guidelines), or breach the Information Technology Act, 2000. The Employee shall comply with all applicable data protection obligations, including those under the Digital Personal Data Protection Act, 2023, when handling customer or lead data.
          </div>

          {/* 11. GOVERNING LAW */}
          <div className="section-heading">11. Governing Law and Jurisdiction</div>
          <div className="body-text">
            This Agreement shall be governed by and construed in accordance with the laws of India, including the Companies Act, 2013, the Contract Act, 1872, and other applicable central and state legislation. Any disputes arising out of or in connection with this Agreement shall be subject to the exclusive jurisdiction of the courts in{' '}
            <span className="underline-blank">{data.employment?.jurisdiction || data.company?.companyDistrict || ''}</span>.
          </div>

          {/* 12. ENTIRE AGREEMENT */}
          <div className="section-heading">12. Entire Agreement</div>
          <div className="body-text">
            This Agreement constitutes the entire agreement between the Employer and the Employee with respect to the subject matter herein and supersedes all prior discussions, negotiations, offer letters, and agreements — whether written or oral. Any amendment or modification to this Agreement must be in writing and signed by both parties. If any provision of this Agreement is held to be invalid or unenforceable by a competent court, the remaining provisions shall continue in full force and effect.
          </div>

          {/* 13. ACKNOWLEDGEMENT */}
          <div className="section-heading">13. Acknowledgement</div>
          <div className="body-text">
            The Employee confirms that they have read, understood, and agreed to the terms and conditions set out in this Agreement, and that they enter into this Agreement freely and without coercion. The Employee further confirms that they are not bound by any existing non-compete, confidentiality, or other contractual obligation with a prior employer that would restrict them from performing their duties under this Agreement.
          </div>

          {/* SIGNATURES */}
          <div className="sig-grid">

            {/* EMPLOYER SIGNATURE */}
            <div className="sig-block">
              <div className="sig-block-title">For and on Behalf of the Company</div>
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
                <span className="underline-blank" style={{ minWidth: '120px' }}>
                  {data.manager?.managerPosition || data.company?.managerPosition || data.company?.hrDesignation || 'Director'}
                </span>
              </div>
              <div style={{ marginTop: '6px', fontSize: '12px', fontStyle: 'italic' }}>
                Authorised Signatory — {data.company?.companyName || ''}{data.company?.entityType ? ` (${data.company.entityType})` : ''}
              </div>
              <div style={{ marginTop: '4px', fontSize: '12px' }}>
                CIN: {data.company?.cinNumber || ''}
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

export default EnglishDigitalGrowthManagerAgreement;