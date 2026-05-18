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
  licenseNumber?: string;
  licenseExpiry?: string;
  licenseType?: string;
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
// MANAGER
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

const EnglishDriverAgreement = ({ data, companyLogo, companyWatermark }: TemplateProps) => {

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
          line-height: 1.85;
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
          margin-bottom: 5px;
          letter-spacing: 0.4px;
        }
        .body-text {
          font-size: 13px;
          line-height: 1.9;
          text-align: justify;
          margin-bottom: 5px;
        }
        .duty-list {
          margin: 3px 0 5px 16px;
          font-size: 13px;
          line-height: 1.9;
          list-style-type: none;
          padding: 0;
        }
        .duty-list li {
          margin-bottom: 4px;
          display: flex;
          gap: 8px;
        }
        .duty-num {
          font-weight: 800;
          min-width: 36px;
          flex-shrink: 0;
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
          line-height: 1.85;
          list-style-type: disc;
        }
        .benefits-list li {
          margin-bottom: 2px;
        }
        .termination-list {
          margin: 3px 0 5px 20px;
          font-size: 13px;
          line-height: 1.9;
          list-style-type: disc;
        }
        .termination-list li {
          margin-bottom: 4px;
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
        .consent-box {
          border: 1.5px solid #c0392b;
          border-left: 4px solid #c0392b;
          background: #fff8f7;
          padding: 10px 14px;
          margin: 12px 0 6px 0;
          font-size: 12.5px;
          line-height: 1.9;
          border-radius: 2px;
        }
        .consent-box-title {
          font-weight: 800;
          font-size: 13px;
          margin-bottom: 5px;
          text-decoration: underline;
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

          {/* ── TITLE ── */}
          <div className="agreement-title">Employment Agreement</div>
          <div className="agreement-subtitle">(Vehicle Driver — Duties, Responsibilities &amp; Terms of Service)</div>

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
            {data.employee?.fatherName && <div><strong>Father's Name:</strong> {data.employee.fatherName}</div>}
            <div><strong>Address:</strong> {employeeAddress}</div>
            <div>
              <strong>Date of Birth:</strong>{' '}
              {data.employee?.dob ? formatDate(data.employee.dob) : <span className="underline-blank" style={{ minWidth: '100px' }} />}
            </div>
            <div>
              <strong>Aadhaar No.:</strong>{' '}
              {data.employee?.aadhaar || <span className="underline-blank" style={{ minWidth: '130px' }} />}
              &emsp;
              <strong>PAN No.:</strong>{' '}
              {data.employee?.pan || <span className="underline-blank" style={{ minWidth: '100px' }} />}
            </div>
            <div>
              <strong>Driving Licence No.:</strong>{' '}
              <span className="underline-blank" style={{ minWidth: '130px' }}>{safe((data.employee as any)?.licenseNumber)}</span>
              &emsp;
              <strong>Valid Till:</strong>{' '}
              <span className="underline-blank" style={{ minWidth: '90px' }}>{safe((data.employee as any)?.licenseExpiry)}</span>
            </div>
            <div style={{ fontStyle: 'italic' }}>(hereinafter referred to as <strong>"Driver"</strong>)</div>
          </div>

          {/* ══ 1. POSITION AND DUTIES ══ */}
          <div className="section-heading">1. Position and Duties</div>
          <div className="body-text">
            The Employer hereby employs the Driver in the position of <strong>Vehicle Driver</strong>
            {data.employment?.department ? ` in the ${data.employment.department} Department` : ''}. The Driver shall be posted at{' '}
            <span className="underline-blank">{safe(data.employment?.placeOfPosting)}</span>{' '}
            and shall report to{' '}
            <span className="underline-blank">{safe(data.employment?.reportingTo)}</span>.
            The Driver's primary responsibility shall be to operate the Employer's authorised vehicles safely, in a disciplined manner, and in accordance with all applicable laws, and to transport authorised personnel to designated destinations in a timely and safe manner.
          </div>

        </div>
        <PrintFooter />
      </div>

      <div className="a4-gap" />

      {/* ══════════════════════════════════════════
          PAGE 2
      ══════════════════════════════════════════ */}
      <div className="a4-page" style={{ position: "relative" }}>

        <div style={{
          position: "absolute", top: 0, left: 0, width: "100%", height: "100%",
          display: "flex", alignItems: "center", justifyContent: "center",
          opacity: 0.08, zIndex: 0, pointerEvents: "none",
        }}>
          <img src={companyWatermark || companyLogo || ''} style={{ width: "70%", maxWidth: "720px", height: "auto", objectFit: "contain" }} />
        </div>

        <div className="divider-page"></div>
        <div style={{ position: "relative", zIndex: 1 }}>

          {/* ══ 2. KEY RESPONSIBILITIES ══ */}
          <div className="section-heading">2. Key Responsibilities</div>
          <ul className="duty-list">
            <li><span className="duty-num">2.1</span><span>To safely transport all authorised personnel associated with the Company to and from designated locations.</span></li>
            <li><span className="duty-num">2.2</span><span>To have the vehicle ready — clean and fuelled — at least <strong>05 (five) minutes before</strong> the scheduled departure time for every trip.</span></li>
            <li><span className="duty-num">2.3</span><span>To strictly comply with all traffic laws and road regulations at all times while operating the vehicle.</span></li>
            <li><span className="duty-num">2.4</span><span>To behave with discipline, decency, and respect towards all passengers in the vehicle and all other persons encountered during duty.</span></li>
            <li><span className="duty-num">2.5</span><span>To maintain complete confidentiality of all travel-related information, including the identity, destination, and movements of passengers.</span></li>
            <li><span className="duty-num">2.6</span><span>To park the vehicle only in the designated and authorised parking locations assigned by the Employer.</span></li>
            <li><span className="duty-num">2.7</span><span>Not to use the Company vehicle for any personal purpose whatsoever, under any circumstances, without the prior written permission of the Employer.</span></li>
            <li><span className="duty-num">2.8</span><span>To familiarise oneself with the assigned route prior to every trip and to have knowledge of alternative routes where necessary.</span></li>
          </ul>

          {/* ══ 3. VEHICLE CARE AND MAINTENANCE ══ */}
          <div className="section-heading">3. Vehicle Care and Maintenance</div>
          <ul className="duty-list">
            <li><span className="duty-num">3.1</span><span>To carry out a thorough pre-trip inspection before every journey, checking fuel, brakes, tyres, water, coolant, engine oil, battery, indicators, and all other essential components.</span></li>
            <li><span className="duty-num">3.2</span><span>To clean the vehicle inside and out on a daily basis and to carry out a deep cleaning at least <strong>twice a week</strong>; more frequently if required by the management.</span></li>
            <li><span className="duty-num">3.3</span><span>To immediately report any mechanical defect, accident, unusual noise, or malfunction to the management without delay.</span></li>
            <li><span className="duty-num">3.4</span><span>To ensure that the vehicle's servicing and repairs are carried out at the designated authorised service centre at the prescribed intervals.</span></li>
            <li><span className="duty-num">3.5</span><span>Not to make any structural modification, apply stickers, decorations, or accessories to the vehicle without the prior written approval of the Employer.</span></li>
          </ul>

          {/* ══ 4. DOCUMENT MANAGEMENT ══ */}
          <div className="section-heading">4. Document Management</div>
          <ul className="duty-list">
            <li><span className="duty-num">4.1</span><span>To keep all mandatory vehicle and personal documents on their person at all times while on duty, including the Vehicle Registration Certificate (RC), Insurance Certificate, Pollution Under Control Certificate (PUC), valid Driving Licence, and any other documents required under applicable traffic laws.</span></li>
            <li><span className="duty-num">4.2</span><span>To ensure timely renewal of all documents well before their expiry date and to inform the management of any upcoming expiry sufficiently in advance.</span></li>
            <li><span className="duty-num">4.3</span><span>To present all documents politely and promptly when required by traffic police or any other competent authority.</span></li>
          </ul>

          {/* ══ 5. TIMEKEEPING AND ATTENDANCE ══ */}
          <div className="section-heading">5. Timekeeping and Attendance</div>
          <ul className="duty-list">
            <li><span className="duty-num">5.1</span><span>Standard duty hours are <strong>09:30 AM to 07:30 PM</strong>. The Driver may be required to work beyond these hours when operational necessity demands, and compensatory rest may be provided accordingly. In emergency situations, the Driver may be called to duty at <strong>any time within 24 hours</strong> and shall not cite personal or family reasons as grounds for non-availability; fair compensation shall be provided for such emergency duties.</span></li>
            <li><span className="duty-num">5.2</span><span>Under all circumstances, duty obligations take precedence over personal interests. The Driver's professional commitment to the Employer shall come first.</span></li>
            <li><span className="duty-num">5.3</span><span>In case of any absence, the Driver must immediately inform the management in advance. Absence without prior intimation shall be treated as unauthorised leave.</span></li>
            <li><span className="duty-num">5.4</span><span>For brief absences from the office premises during duty hours, the Driver must record the departure and return time in the designated office register.</span></li>
          </ul>

        </div>
        <PrintFooter />
      </div>

      <div className="a4-gap" />

      {/* ══════════════════════════════════════════
          PAGE 3
      ══════════════════════════════════════════ */}
      <div className="a4-page" style={{ position: "relative" }}>

        <div style={{
          position: "absolute", top: 0, left: 0, width: "100%", height: "100%",
          display: "flex", alignItems: "center", justifyContent: "center",
          opacity: 0.08, zIndex: 0, pointerEvents: "none",
        }}>
          <img src={companyWatermark || companyLogo || ''} style={{ width: "70%", maxWidth: "720px", height: "auto", objectFit: "contain" }} />
        </div>

        <div style={{ position: "relative", zIndex: 1 }}>
          <div className="divider-page"></div>

          {/* ══ 6. SAFETY AND DISCIPLINE ══ */}
          <div className="section-heading">6. Safety and Discipline</div>
          <ul className="duty-list">
            <li><span className="duty-num">6.1</span><span>The Driver shall <strong>never operate any vehicle under the influence of alcohol, narcotics, or any intoxicant</strong>, under any circumstances whatsoever. Discovery of such conduct shall result in immediate termination and initiation of legal proceedings.</span></li>
            <li><span className="duty-num">6.2</span><span>The use of a <strong>mobile phone</strong> in any manner while driving — whether handheld or hands-free — is strictly prohibited at all times.</span></li>
            <li><span className="duty-num">6.3</span><span>The safety of all passengers in the vehicle, pedestrians, and all other road users shall be the Driver's paramount concern at all times.</span></li>
            <li><span className="duty-num">6.4</span><span>No traffic violations shall be committed under any circumstances, including but not limited to over-speeding, jumping red lights, not wearing a seat belt, or reckless driving.</span></li>
            <li><span className="duty-num">6.5</span><span>The Driver shall wear the Company-provided uniform (if issued) in a clean and presentable manner at all times while on duty.</span></li>
            <li><span className="duty-num">6.6</span><span>The Driver shall not engage in any rude, disrespectful, or confrontational behaviour towards Company employees, passengers, or any person encountered in the course of duty.</span></li>
            <li><span className="duty-num">6.7</span><span>No unauthorised person shall be allowed into the vehicle under any circumstances without the prior explicit permission of the Employer or the designated reporting authority.</span></li>
          </ul>

          {/* ══ 7. LEAVE, SALARY AND OTHER CONDITIONS ══ */}
          <div className="section-heading">7. Leave, Salary and Other Conditions</div>
          <ul className="duty-list">
            <li><span className="duty-num">7.1</span><span>The Driver is entitled to a maximum of <strong>02 (Two) scheduled leaves per calendar month</strong>. Such leave must be applied for and approved at least <strong>02 (Two) days in advance</strong>. If leave is taken without prior notice, the cost of arranging a replacement driver for that day shall be deducted from the Driver's monthly salary, which may exceed the value of a single day's wage.</span></li>
            <li><span className="duty-num">7.2</span><span>In a genuine emergency, the Driver may apply for leave with immediate effect; however, the reason must be truthful and verifiable. If the stated reason is found to be false, a deduction equivalent to <strong>double the daily wage</strong> shall be made from the salary.</span></li>
            <li><span className="duty-num">7.3</span><span>If the Driver wishes to resign in order to take up another employment, a minimum of <strong>90 (Ninety) days' written notice</strong> must be provided to the Employer. The Driver may be relieved on or after the 91st day from the date of such notice. If the Driver abandons employment without notice, all pending dues and final settlement shall be forfeited without exception.</span></li>
            <li><span className="duty-num">7.4</span><span>The Driver is required to obtain and maintain a valid <strong>personal accident insurance policy</strong> at their own cost. In the event of any accident or injury arising during the course of employment, the Employer {employerFullName} shall bear no financial liability whatsoever if the Driver has not obtained such insurance.</span></li>
            <li><span className="duty-num">7.5</span><span>For brief absences from the office premises during duty hours, the Driver must record the departure and return time in the designated office register. This is mandatory without exception.</span></li>
            <li><span className="duty-num">7.6</span><span>When required, the Driver shall assist with and perform general office duties during periods when the designated office executive is on leave. The Driver shall not refuse such tasks on the grounds that they fall outside the Driver's designated role. The Driver shall also learn basic office operations from the Office Executive as directed by the management.</span></li>
          </ul>

        </div>
        <PrintFooter />
      </div>

      <div className="a4-gap" />

      {/* ══════════════════════════════════════════
          PAGE 4
      ══════════════════════════════════════════ */}
      <div className="a4-page" style={{ position: "relative" }}>

        <div style={{
          position: "absolute", top: 0, left: 0, width: "100%", height: "100%",
          display: "flex", alignItems: "center", justifyContent: "center",
          opacity: 0.08, zIndex: 0, pointerEvents: "none",
        }}>
          <img src={companyWatermark || companyLogo || ''} style={{ width: "70%", maxWidth: "720px", height: "auto", objectFit: "contain" }} />
        </div>

        <div style={{ position: "relative", zIndex: 1 }}>
          <div className="divider-page"></div>

          {/* ══ 8. COMPENSATION ══ */}
          <div className="section-heading">8. Compensation</div>

          <div className="sub-heading">Salary</div>
          <div className="body-text">
            The Employer shall pay the Driver a gross annual salary of ₹{' '}
            <span className="underline-blank">{data.employment?.grossAnnualSalary || ''}</span>
            /- (Rupees{' '}
            <span className="underline-blank" style={{ minWidth: '160px' }}>{data.employment?.grossAnnualSalaryWords || ''}</span>{' '}
            only), which is equivalent to a gross monthly salary of ₹{' '}
            <span className="underline-blank">{data.employment?.grossMonthlySalary || ''}</span>
            /- (Rupees{' '}
            <span className="underline-blank" style={{ minWidth: '140px' }}>{data.employment?.grossMonthlySalaryWords || ''}</span>{' '}
            only), payable in equal monthly instalments, subject to applicable deductions and statutory withholdings.
          </div>

          <div className="sub-heading">Benefits</div>
          <div className="body-text">
            The Driver shall be eligible for benefits as per the Employer's standard policies, which may include:
          </div>

          <div style={{ fontWeight: 700, fontSize: '13px', marginTop: '5px', marginBottom: '2px' }}>
            Mandatory Statutory Benefits
          </div>
          <ul className="benefits-list">
            <li><strong>Employees' Provident Fund (EPF):</strong> Mandatory for companies with 20 or more employees.</li>
            <li><strong>Employee State Insurance (ESI):</strong> Required if company size exceeds 10 employees (20 in some states) and employees earn below ₹21,000 per month.</li>
            <li><strong>Gratuity:</strong> Payable upon completion of 5 years of continuous service.</li>
            <li><strong>Leave Policy:</strong> Paid Annual / Earned Leave ({data.employment?.annualLeaves || '12'} days), Sick / Medical Leave ({data.employment?.medicalLeaves || '6'} days), and Casual Leave ({data.employment?.casualLeaves || '6'} days).</li>
            <li><strong>Maternity Benefits:</strong> Paid leave for eligible female employees as per the Maternity Benefit Act, 1961.</li>
          </ul>

          <div style={{ fontWeight: 700, fontSize: '13px', marginTop: '5px', marginBottom: '2px' }}>
            Operational Allowances
          </div>
          <ul className="benefits-list">
            <li><strong>Fuel and Toll:</strong> All fuel and toll charges incurred in the course of official duties shall be borne entirely by the Employer.</li>
            <li><strong>Overtime Compensation:</strong> Fair compensation for duties performed beyond standard working hours, as per the Employer's prevailing policy.</li>
            <li><strong>Uniform Maintenance:</strong> If a uniform is provided by the Employer, the Driver shall be responsible for its upkeep, cleanliness, and presentable condition at all times.</li>
          </ul>

          {/* ══ 9. COMMENCEMENT OF EMPLOYMENT ══ */}
          <div className="section-heading">9. Commencement of Employment</div>
          <div className="body-text">
            The Driver's employment with the Employer shall commence on{' '}
            <span className="underline-blank">{formatDate(data.employment?.joiningDate)}</span>.
            The Driver shall be on probation for a period of{' '}
            <strong>{data.employment?.probationPeriod || '3 (Three) months'}</strong> from the date of joining,
            during which either party may terminate this Agreement without cause or prior notice.
            Upon successful completion of probation, the employment shall be confirmed in writing.
          </div>

          {/* ══ 10. CONFIDENTIALITY ══ */}
          <div className="section-heading">10. Confidentiality</div>
          <div className="body-text">
            The Driver acknowledges that during the course of employment, they will have access to confidential and proprietary information belonging to the Employer, including but not limited to client lists, property listings, financial data, marketing strategies, business plans, as well as the personal identity, destinations, and movements of passengers. The Driver agrees to keep all such information strictly confidential and not to disclose it to any third party or use it for any purpose other than for the benefit of the Employer, both during and after the term of employment. Any disclosure of passenger identities, travel details, or any internal Company information shall constitute a serious breach of this Agreement.
          </div>

          {/* ══ 11. TERMINATION OF EMPLOYMENT ══ */}
          <div className="section-heading">11. Termination of Employment</div>

          <div className="sub-heading">Termination by Employer</div>
          <div className="body-text">The Employer may terminate the Driver's employment for any of the following reasons:</div>
          <ul className="termination-list">
            <li>
              <strong>With Cause (Immediate):</strong> Driving under the influence of alcohol or any intoxicant; involvement in an accident due to proven negligence; unauthorised use of the Company vehicle; misconduct towards passengers or colleagues; breach of confidentiality; document fraud; gross insubordination; fraud; or any material breach of this Agreement.
            </li>
            <li>
              <strong>Without Cause:</strong> By providing{' '}
              <span className="underline-blank">{data.employment?.noticePeriodEmployer || '30 (Thirty) days'}</span>{' '}
              written notice or payment in lieu of notice.
            </li>
          </ul>

          <div className="sub-heading">Termination by Driver</div>
          <div className="body-text">
            The Driver may terminate employment by providing a minimum of{' '}
            <span className="underline-blank">{data.employment?.noticePeriodEmployee || '90 (Ninety) days'}</span>{' '}
            written notice to the Employer. If the Driver abandons employment without notice or before the completion of the required notice period, all pending dues, final settlement amounts, and any other amounts payable shall stand forfeited without exception, and legal action may be initiated. Upon termination, the Driver shall immediately return the vehicle keys, fuel card, access passes, uniform, all Company documents, and any other property belonging to the Employer.
          </div>

          {/* ══ 12. GOVERNING LAW AND JURISDICTION ══ */}
          <div className="section-heading">12. Governing Law and Jurisdiction</div>
          <div className="body-text">
            This Agreement shall be governed by and construed in accordance with the laws of India.
            Any disputes arising out of or in connection with this Agreement shall be subject to the exclusive jurisdiction of the courts in{' '}
            <span className="underline-blank">{data.employment?.jurisdiction || data.company?.companyDistrict || ''}</span>.
          </div>

          {/* ══ 13. ENTIRE AGREEMENT ══ */}
          <div className="section-heading">13. Entire Agreement</div>
          <div className="body-text">
            This Agreement constitutes the entire agreement between the Employer and the Driver with respect to the terms of employment and supersedes all prior discussions, negotiations, and agreements, whether written or oral.
          </div>

          {/* ══ 14. AMENDMENTS ══ */}
          <div className="section-heading">14. Amendments</div>
          <div className="body-text">
            Any amendment or modification to this Agreement must be in writing and signed by both the Employer and the Driver.
          </div>

          {/* ══ 15. SEVERABILITY ══ */}
          <div className="section-heading">15. Severability</div>
          <div className="body-text">
            If any provision of this Agreement is held to be invalid or unenforceable, the remaining provisions shall continue to be valid and enforceable to the fullest extent permitted by law.
          </div>

          {/* ══ DRIVER'S DECLARATION AND CONSENT ══ */}
          <div className="consent-box">
            <div className="consent-box-title">Driver's Declaration and Consent</div>
            <div className="body-text" style={{ marginBottom: 0 }}>
              I, <span className="underline-blank" style={{ minWidth: '180px' }}>{employeeFullName}</span>, hereby declare that I have read and fully understood all the terms, conditions, duties, and responsibilities set out in this Agreement. I agree to abide by all the above provisions in their entirety. If I am found to have acted in contravention of any of the above, I consent to appropriate action being taken against me in accordance with the terms of this Agreement and the applicable laws — I have no objection whatsoever.
            </div>
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

            {/* DRIVER SIGNATURE */}
            <div className="sig-block">
              <div className="sig-block-title">Driver's Signature</div>
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

export default EnglishDriverAgreement;