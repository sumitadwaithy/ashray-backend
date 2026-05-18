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
  relievingDate?: string;
  lastWorkingDay?: string;
  department?: string;
  designation?: string;
  reportingTo?: string;
  placeOfPosting?: string;
  grossMonthlySalary?: string | number;
  conductRemark?: 'EXCELLENT' | 'GOOD' | 'SATISFACTORY';
  performanceRemark?: 'EXCELLENT' | 'GOOD' | 'SATISFACTORY';
  nocPurpose?: string;           // "joining another organization", "higher studies", etc.
  nocIssuedTo?: string;          // Name of org the employee is joining (optional)
  reasonForLeaving?: string;
  jurisdiction?: string;
  nocNumber?: string;
  nocDate?: string;
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
  managerPAN?: string;
  managerAadhaar?: string;
  managerPhone?: string;
  companyAddress?: string;
  companyLocality?: string;
  companyDistrict?: string;
  companyState?: string;
  companyPincode?: string;
  hrName?: string;
  hrDesignation?: string;
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
  type: 'agreement' | 'token' | 'noc';
  onClose: () => void;
  companyLogo?: string;
  companyWatermark?: string;
}

const EnglishPostJobNOC = ({ data, companyLogo, companyWatermark }: TemplateProps) => {

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr || '';
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const formatDateLong = (dateStr?: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr || '';
    return date.toLocaleDateString('en-IN', {
      day: 'numeric', month: 'long', year: 'numeric'
    });
  };

  const formatPhone = (phone?: string) => {
    if (!phone) return '';
    const clean = phone.toString().replace('+91', '').trim();
    return `+91 ${clean}`;
  };

  // Calculate service duration
  const calcDuration = (join?: string, relieve?: string) => {
    if (!join || !relieve) return '';
    const j = new Date(join);
    const r = new Date(relieve);
    if (isNaN(j.getTime()) || isNaN(r.getTime())) return '';
    let years = r.getFullYear() - j.getFullYear();
    let months = r.getMonth() - j.getMonth();
    if (months < 0) { years--; months += 12; }
    const parts: string[] = [];
    if (years > 0) parts.push(`${years} Year${years > 1 ? 's' : ''}`);
    if (months > 0) parts.push(`${months} Month${months > 1 ? 's' : ''}`);
    return parts.length ? parts.join(' and ') : 'Less than 1 Month';
  };

  const employeeFullName = [data.employee?.title, data.employee?.name].filter(Boolean).join(' ');
  const employerFullName = `${data.company?.companyName || ''}${data.company?.entityType ? ` (${data.company.entityType})` : ''}`;

  const employeeAddress = [
    data.employee?.address,
    data.employee?.locality,
    data.employee?.district,
    data.employee?.state,
  ].filter(Boolean).join(', ') + (data.employee?.pincode ? ` - ${data.employee.pincode}` : '');

  const serviceDuration = calcDuration(
    data.employment?.joiningDate,
    data.employment?.relievingDate || data.employment?.lastWorkingDay
  );

  const nocNo = data.employment?.nocNumber || `NOC-${(data.employee?.staffId || data.employee?.employeeId || 'EMP').toUpperCase()}-${new Date().getFullYear()}`;
  const nocDate = data.employment?.nocDate || new Date().toISOString().split('T')[0];

  const conductLabel = {
    EXCELLENT: 'Excellent',
    GOOD: 'Good',
    SATISFACTORY: 'Satisfactory',
  }[data.employment?.conductRemark || 'GOOD'] || 'Good';

  const perfLabel = {
    EXCELLENT: 'Excellent',
    GOOD: 'Good',
    SATISFACTORY: 'Satisfactory',
  }[data.employment?.performanceRemark || 'GOOD'] || 'Good';

  const nocPurpose = data.employment?.nocPurpose || 'seeking employment / pursuing opportunities elsewhere';
  const nocIssuedTo = data.employment?.nocIssuedTo;
  const reasonLeaving = data.employment?.reasonForLeaving || 'personal reasons / mutual consent';

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
        .gradient-text { color: #D9001B; }
        @media screen {
          .gradient-text {
            background: linear-gradient(180deg, #FF3A3A 0%, #FF1E2D 60%, #D9001B 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
          }
        }
        .noc-outer-border {
          border: 3px double #b0001a;
          padding: 16px 18px 20px 18px;
          margin-top: 10px;
          position: relative;
        }
        .noc-title {
          text-align: center;
          font-size: 20px;
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: 3px;
          text-decoration: underline;
          margin-bottom: 2px;
          font-family: 'Times New Roman', serif;
        }
        .noc-subtitle {
          text-align: center;
          font-size: 12.5px;
          font-style: italic;
          color: #444;
          margin-bottom: 12px;
          letter-spacing: 0.5px;
        }
        .noc-ref-row {
          display: flex;
          justify-content: space-between;
          font-size: 12px;
          font-weight: 700;
          margin-bottom: 14px;
          border-bottom: 1px solid #ccc;
          padding-bottom: 8px;
        }
        .body-text {
          font-size: 13px;
          line-height: 1.9;
          text-align: justify;
          margin-bottom: 9px;
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
        .detail-grid {
          width: 100%;
          border-collapse: collapse;
          margin: 10px 0 12px 0;
          font-size: 13px;
        }
        .detail-grid td {
          padding: 4px 8px 4px 0;
          vertical-align: top;
          line-height: 1.7;
        }
        .detail-grid td:first-child {
          font-weight: 700;
          white-space: nowrap;
          width: 48%;
        }
        .detail-grid td:nth-child(2) {
          width: 4%;
          font-weight: 700;
          text-align: center;
        }
        .detail-grid td:last-child {
          border-bottom: 1px solid #999;
          width: 48%;
          padding-bottom: 2px;
        }
        .remark-pill {
          display: inline-block;
          border: 1.5px solid #000;
          padding: 1px 12px;
          font-weight: 700;
          font-size: 12.5px;
          letter-spacing: 0.5px;
          border-radius: 2px;
        }
        .section-heading {
          font-size: 13px;
          font-weight: 900;
          text-decoration: underline;
          margin-top: 10px;
          margin-bottom: 4px;
          text-transform: uppercase;
          letter-spacing: 0.4px;
        }
        .stamp-box {
          border: 2px dashed #bbb;
          width: 110px;
          height: 100px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 10px;
          color: #aaa;
          font-style: italic;
          text-align: center;
          letter-spacing: 0.5px;
        }
        .sig-grid {
          display: flex;
          justify-content: space-between;
          margin-top: 24px;
          gap: 28px;
          align-items: flex-end;
        }
        .sig-block {
          flex: 1;
          font-size: 13px;
          line-height: 1.8;
        }
        .sig-line {
          border-bottom: 1.5px solid #000;
          min-height: 50px;
          margin-bottom: 6px;
        }
        .sig-label {
          font-weight: 700;
          font-size: 12.5px;
          margin-bottom: 2px;
        }
        .sig-field-row {
          font-size: 12.5px;
          display: flex;
          align-items: baseline;
          gap: 4px;
          margin-top: 2px;
        }
        .disclaimer-box {
          border-top: 2px solid #D9001B;
          margin-top: 20px;
          padding-top: 10px;
          font-size: 11.5px;
          color: #444;
          line-height: 1.7;
          text-align: justify;
        }
        .end-text {
          text-align: center;
          font-weight: 900;
          font-size: 14px;
          margin-top: 18px;
          letter-spacing: 3px;
        }
        .a4-gap { height: 40px; }
        @media print { .a4-gap { display: none; } }
      `}</style>

      {/* ══════════════════════════════════════════
          PAGE 1 — NOC
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

          {/* ── FOLDER / DOC ID BAR ── */}
          <div className="bg-yellow-200 border border-yellow-300 text-[12.5px] font-semibold px-2 py-1 text-center mb-5">
            <span className="font-mono">
              {data.employee?.folderSerial || 'AG'} / {data.employee?.staffId || data.employee?.employeeId || 'EMP-ID'} / NOC / {new Date(nocDate).getFullYear()}
            </span>
          </div>

          {/* ── OUTER BORDER NOC BODY ── */}
          <div className="noc-outer-border">

            {/* TITLE */}
            <div className="noc-title">No Objection Certificate</div>
            <div className="noc-subtitle">(Post-Employment — Relieving & Clearance NOC)</div>

            {/* REF ROW */}
            <div className="noc-ref-row">
              <span>NOC Ref. No.: <strong>{nocNo}</strong></span>
              <span>Date: <strong>{formatDateLong(nocDate)}</strong></span>
            </div>

            {/* TO WHOM IT MAY CONCERN */}
            <div className="body-text">
              <strong>To Whomsoever It May Concern{nocIssuedTo ? ` / To, ${nocIssuedTo}` : ''}:</strong>
            </div>

            {/* OPENING PARA */}
            <div className="body-text">
              This is to certify that{' '}
              <strong>{employeeFullName}</strong>,{' '}
              {data.employee?.age ? `aged ${data.employee.age} years, ` : ''}
              {data.employee?.aadhaar ? `bearing Aadhaar No. ${data.employee.aadhaar}, ` : ''}
              {data.employee?.pan ? `PAN No. ${data.employee.pan?.toUpperCase()}, ` : ''}
              residing at <strong>{employeeAddress}</strong>,
              was employed with <strong>{employerFullName}</strong> in the capacity of{' '}
              <strong>{data.employment?.designation || <span className="underline-blank" style={{ minWidth: '120px' }} />}</strong>
              {data.employment?.department ? ` in the ${data.employment.department} Department` : ''}.
            </div>

            {/* SERVICE DETAIL TABLE */}
            <div className="section-heading">Service Details</div>
            <table className="detail-grid">
              <tbody>
                <tr>
                  <td>Date of Joining</td>
                  <td>:</td>
                  <td>{formatDateLong(data.employment?.joiningDate)}</td>
                </tr>
                <tr>
                  <td>Last Working Day / Date of Relieving</td>
                  <td>:</td>
                  <td>{formatDateLong(data.employment?.relievingDate || data.employment?.lastWorkingDay)}</td>
                </tr>
                <tr>
                  <td>Total Service Duration</td>
                  <td>:</td>
                  <td><strong>{serviceDuration}</strong></td>
                </tr>
                <tr>
                  <td>Designation Held</td>
                  <td>:</td>
                  <td>{data.employment?.designation || <span className="underline-blank" />}</td>
                </tr>
                <tr>
                  <td>Department</td>
                  <td>:</td>
                  <td>{data.employment?.department || <span className="underline-blank" />}</td>
                </tr>
                <tr>
                  <td>Place of Posting</td>
                  <td>:</td>
                  <td>{data.employment?.placeOfPosting || data.company?.companyLocality || <span className="underline-blank" />}</td>
                </tr>
                <tr>
                  <td>Employee ID</td>
                  <td>:</td>
                  <td>{data.employee?.staffId || data.employee?.employeeId || <span className="underline-blank" />}</td>
                </tr>
                <tr>
                  <td>Reason for Leaving</td>
                  <td>:</td>
                  <td>{reasonLeaving}</td>
                </tr>
              </tbody>
            </table>

            {/* CONDUCT & PERFORMANCE */}
            <div className="section-heading">Conduct and Performance</div>
            <div className="body-text">
              During the entire tenure of service with the Company, the conduct and behaviour of{' '}
              <strong>{employeeFullName}</strong> has been{' '}
              <span className="remark-pill">{conductLabel}</span>, and their overall work
              performance and professional output has been rated as{' '}
              <span className="remark-pill">{perfLabel}</span>.
              The employee has demonstrated integrity, diligence, and a co-operative attitude throughout
              their association with the Company.
            </div>

            {/* NO OBJECTION PARA */}
            <div className="section-heading">No Objection Declaration</div>
            <div className="body-text">
              The Company hereby declares that it has <strong>No Objection</strong> whatsoever to{' '}
              <strong>{employeeFullName}</strong> {nocPurpose}
              {nocIssuedTo ? ` at / with <strong>${nocIssuedTo}</strong>` : ''}.
              All dues payable to the employee as per the Company's policy have been settled in full, and all Company
              property, documents, credentials, and assets in the custody of the employee have been duly returned and
              verified to the satisfaction of the management. The employee has been relieved of all duties and
              responsibilities as of <strong>{formatDateLong(data.employment?.relievingDate || data.employment?.lastWorkingDay)}</strong>.
            </div>

            {/* CLEARANCE CONFIRMATION */}
            <div className="section-heading">Clearance Confirmation</div>
            <div className="body-text">
              This certificate further confirms that:
            </div>
            <ol style={{ margin: '0 0 8px 22px', fontSize: '13px', lineHeight: '1.85' }}>
              <li>All outstanding salaries, dues, and statutory entitlements of the employee have been fully discharged.</li>
              <li>No disciplinary action, legal proceedings, or financial recovery claims are pending against the employee as of the date of this certificate.</li>
              <li>The employee has successfully completed the exit formalities, including handover of duties, return of Company assets, and sign-off on the No-Dues declaration.</li>
              <li>The Company's confidentiality, non-disclosure, and non-solicitation obligations remain binding on the employee beyond the term of employment as per the Employment Agreement executed between the parties.</li>
            </ol>

            {/* RECOMMENDATION (optional positive note) */}
            <div className="body-text">
              The Company sincerely wishes <strong>{employeeFullName}</strong> the very best in their future endeavours and career growth.
            </div>

            {/* SIGNATURE SECTION */}
            <div className="sig-grid">

              {/* COMPANY SIGNATORY */}
              <div className="sig-block" style={{ flex: 2 }}>
                <div className="sig-label">For and on behalf of {employerFullName}</div>
                <div className="sig-line" style={{ marginTop: '10px' }} />
                <div className="sig-field-row">
                  <strong>Name:</strong>
                  <span className="underline-blank" style={{ minWidth: '150px' }}>
                    {data.manager?.managerName || data.company?.managerName || data.company?.hrName || ''}
                  </span>
                </div>
                <div className="sig-field-row">
                  <strong>Designation:</strong>
                  <span className="underline-blank" style={{ minWidth: '130px' }}>
                    {data.manager?.managerPosition || data.company?.managerPosition || data.company?.hrDesignation || ''}
                  </span>
                </div>
                <div className="sig-field-row">
                  <strong>Date:</strong>
                  <span className="underline-blank" style={{ minWidth: '110px' }}>
                    {formatDate(nocDate)}
                  </span>
                </div>
                <div className="sig-field-row">
                  <strong>Place:</strong>
                  <span className="underline-blank" style={{ minWidth: '120px' }}>
                    {data.company?.companyLocality || data.company?.companyDistrict || ''}
                  </span>
                </div>
              </div>

              {/* COMPANY SEAL */}
              <div className="sig-block" style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div className="sig-label" style={{ marginBottom: '8px', textAlign: 'center' }}>Company Seal / Stamp</div>
                <div className="stamp-box">
                  Seal &amp;<br />Stamp
                </div>
              </div>

            </div>
          </div>

          {/* DISCLAIMER */}
          <div className="disclaimer-box">
            <strong>Disclaimer:</strong> This No Objection Certificate is issued in good faith on the basis of records available with the Company and shall be valid solely for the purpose of {nocPurpose}. The Company shall not be held responsible for any misuse, misrepresentation, or use of this certificate for any purpose other than that for which it has been issued. This certificate does not constitute a character reference, employment guarantee, or any form of legal undertaking beyond the scope of its stated purpose. Any verification queries may be directed to <strong>{data.company?.companyEmail || '[Company Email]'}</strong> or{' '}
            <strong>{formatPhone(data.manager?.managerPhone || data.company?.managerPhone)}</strong>.
          </div>

          <div className="end-text">* * * END * * *</div>

        </div>

        <PrintFooter />
      </div>
    </div>
  );
};

export default EnglishPostJobNOC;