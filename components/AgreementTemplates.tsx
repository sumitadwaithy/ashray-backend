
import React, { useState, useEffect } from 'react';
import { Printer, X } from 'lucide-react';
import PrintPreview from './Printpreview';
import { dbService } from '../services/db';
import HindiAgreement from '../src/components/agreements/client/HindiAgreement';
import EnglishAgreement from '../src/components/agreements/client/EnglishAgreement';
import MarathiAgreement from '../src/components/agreements/client/MarathiAgreement';
import HindiTokan from '../src/components/agreements/client/HindiTokan';
import EnglishTokan from '../src/components/agreements/client/EnglishTokan';
import  MarathiTokan from '../src/components/agreements/client/MarathiTokan';
import { EnglishPreSaleNOC } from '../src/components/agreements/client/EnglishPreSaleNOC';
import { EnglishPostSaleNOC } from '../src/components/agreements/client/EnglishPostSaleNOC';
import { HindiPreSaleNOC } from '../src/components/agreements/client/HindiPreSaleNOC';
import { HindiPostSaleNOC } from '../src/components/agreements/client/HindiPostSaleNOC';
import { MarathiPreSaleNOC } from '../src/components/agreements/client/MarathiPreSaleNOC';
import { MarathiPostSaleNOC } from '../src/components/agreements/client/MarathiPostSaleNOC';
import  EnglishLoanNOC from '../src/components/agreements/loan/EnglishGeneralLoanNOC';
import  HindiLoanNOC from '../src/components/agreements/loan/HindiGeneralLoanNOC';
import  MarathiLoanNOC from '../src/components/agreements/loan/MarathiGeneralLoanNOC';
import EnglishLoanAgreement from '../src/components/agreements/loan/EnglishLoanAgreement';
import HindiLoanAgreement from '../src/components/agreements/loan/HindiLoanAgreement';
import MarathiLoanAgreement from '../src/components/agreements/loan/MarathiLoanAgreement';
import EnglishPostJobNOC from '../src/components/agreements/employee/EnglishPostJobNOC';
import  HindiPostJobNOC from '../src/components/agreements/employee/HindiPostJobNOC';
import  MarathiPostJobNOC from '../src/components/agreements/employee/MarathiPostJobNOC';
import HindiKhetiZameenAgreement from '../src/components/agreements/kisaan/HindiKhetiZameenAgreement';
import EnglishKhetiZameenAgreement from '../src/components/agreements/kisaan/EnglishKhetiZameenAgreement';
import MarathiKhetiZameenAgreement from '../src/components/agreements/kisaan/MarathiKhetiZameenAgreement';
import EnglishInvestorAgreement from '../src/components/agreements/investor/EnglishInvestorAgreement';
import HindiInvestorAgreement from '../src/components/agreements/investor/HindiInvestorAgreement';
import MarathiInvestorAgreement from '../src/components/agreements/investor/MarathiInvestorAgreement';
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
  type: 'agreement' | 'token' | 'staff_agreement' | 'kissan_agreement' | 'noc' | 'loan_agreement' | 'investor_agreement' | 'sale_agreement';
  role?: string;
  onClose: () => void;
  onGenerate?: () => void;
}

  // Helper to determine which staff agreement to show
  const StaffAgreementRenderer = ({ role, language, data, settings, onClose, type }: any) => {
    const lang = (language || 'hi').toLowerCase();
    const normalizedRole = role || '';
    const isEnglish = lang === 'en' || lang === 'english';
    const isHindi = lang === 'hi' || lang === 'hindi';
    const isMarathi = lang === 'mr' || lang === 'marathi';

    // MAPPING LOGIC (Specific Files)
    if (normalizedRole === 'Office Supervisor') {
      if (isEnglish) {
        const EnglishOfficeSupervisorAgreement = React.lazy(() => import('../src/components/agreements/employee/EnglishOfficeSupervisorAgreement'));
        return <React.Suspense fallback={<div>Loading...</div>}><EnglishOfficeSupervisorAgreement data={data as any} companyLogo={settings?.companyLogo} companyWatermark={settings?.companyWatermark} language={language as any} type={type} onClose={onClose} /></React.Suspense>;
      }
      if (isHindi) {
        const HindiOfficeSupervisorAgreement = React.lazy(() => import('../src/components/agreements/employee/HindiOfficeSupervisorAgreement'));
        return <React.Suspense fallback={<div>Loading...</div>}><HindiOfficeSupervisorAgreement data={data as any} companyLogo={settings?.companyLogo} companyWatermark={settings?.companyWatermark} language={language as any} type={type} onClose={onClose} /></React.Suspense>;
      }
      if (isMarathi) {
        const MarathiOfficeSupervisorAgreement = React.lazy(() => import('../src/components/agreements/employee/MarathiOfficeSupervisorAgreement'));
        return <React.Suspense fallback={<div>Loading...</div>}><MarathiOfficeSupervisorAgreement data={data as any} companyLogo={settings?.companyLogo} companyWatermark={settings?.companyWatermark} language={language as any} type={type} onClose={onClose}/></React.Suspense>;
      }
    }

    if (normalizedRole === 'Office Computer Operator') {
      if (isEnglish) {
        const EnglishOfficeComputerOperatorAgreement = React.lazy(() => import('../src/components/agreements/employee/EnglishOfficeComputerOperatorAgreement'));
        return <React.Suspense fallback={<div>Loading...</div>}><EnglishOfficeComputerOperatorAgreement data={data as any} onClose={onClose} /></React.Suspense>;
      }
      if (isHindi) {
        const HindiOfficeComputerOperatorAgreement = React.lazy(() => import('../src/components/agreements/employee/HindiOfficeComputerOperatorAgreement'));
        return <React.Suspense fallback={<div>Loading...</div>}><HindiOfficeComputerOperatorAgreement data={data as any} onClose={onClose} /></React.Suspense>;
      }
      if (isMarathi) {
        const MarathiOfficeComputerOperatorAgreement = React.lazy(() => import('../src/components/agreements/employee/MarathiOfficeComputerOperatorAgreement'));
        return <React.Suspense fallback={<div>Loading...</div>}><MarathiOfficeComputerOperatorAgreement data={data as any} onClose={onClose} /></React.Suspense>;
      }
    }

    if (normalizedRole === 'Site Supervisor') {
      if (isEnglish) {
        const EnglishSiteSupervisorAgreement = React.lazy(() => import('../src/components/agreements/employee/EnglishSiteSupervisorAgreement'));
        return <React.Suspense fallback={<div>Loading...</div>}><EnglishSiteSupervisorAgreement data={data as any} onClose={onClose} /></React.Suspense>;
      }
      if (isHindi) {
        const HindiSiteSupervisorAgreement = React.lazy(() => import('../src/components/agreements/employee/HindiSiteSupervisorAgreement'));
        return <React.Suspense fallback={<div>Loading...</div>}><HindiSiteSupervisorAgreement data={data as any} onClose={onClose} /></React.Suspense>;
      }
      if (isMarathi) {
        const MarathiSiteSupervisorAgreement = React.lazy(() => import('../src/components/agreements/employee/MarathiSiteSupervisorAgreement'));
        return <React.Suspense fallback={<div>Loading...</div>}><MarathiSiteSupervisorAgreement data={data as any} onClose={onClose} /></React.Suspense>;
      }
    }

    if (normalizedRole === 'Driver') {
      if (isEnglish) {
        const EnglishDriverAgreement = React.lazy(() => import('../src/components/agreements/employee/EnglishDriverAgreement'));
        return <React.Suspense fallback={<div>Loading...</div>}><EnglishDriverAgreement data={data as any} onClose={onClose} /></React.Suspense>;
      }
      if (isHindi) {
        const HindiDriverAgreement = React.lazy(() => import('../src/components/agreements/employee/HindiDriverAgreement'));
        return <React.Suspense fallback={<div>Loading...</div>}><HindiDriverAgreement data={data as any} onClose={onClose} /></React.Suspense>;
      }
      if (isMarathi) {
        const MarathiDriverAgreement = React.lazy(() => import('../src/components/agreements/employee/MarathiDriverAgreement'));
        return <React.Suspense fallback={<div>Loading...</div>}><MarathiDriverAgreement data={data as any} onClose={onClose} /></React.Suspense>;
      }
    }

    if (normalizedRole === 'Accountant') {
      if (isEnglish) {
        const EnglishAccountantAgreement = React.lazy(() => import('../src/components/agreements/employee/EnglishAccountantAgreement'));
        return <React.Suspense fallback={<div>Loading...</div>}><EnglishAccountantAgreement data={data as any} onClose={onClose} /></React.Suspense>;
      }
      if (isHindi) {
        const HindiAccountantAgreement = React.lazy(() => import('../src/components/agreements/employee/HindiAccountantAgreement'));
        return <React.Suspense fallback={<div>Loading...</div>}><HindiAccountantAgreement data={data as any} onClose={onClose} /></React.Suspense>;
      }
      if (isMarathi) {
        const MarathiAccountantAgreement = React.lazy(() => import('../src/components/agreements/employee/MarathiAccountantAgreement'));
        return <React.Suspense fallback={<div>Loading...</div>}><MarathiAccountantAgreement data={data as any} onClose={onClose} /></React.Suspense>;
      }
    }

    if (normalizedRole === 'MTS') {
      if (isEnglish) {
        const EnglishMTSAgreement = React.lazy(() => import('../src/components/agreements/employee/EnglishMTSAgreement'));
        return <React.Suspense fallback={<div>Loading...</div>}><EnglishMTSAgreement data={data as any} onClose={onClose} /></React.Suspense>;
      }
      if (isHindi) {
        const HindiMTSAgreement = React.lazy(() => import('../src/components/agreements/employee/HindiMTSAgreement'));
        return <React.Suspense fallback={<div>Loading...</div>}><HindiMTSAgreement data={data as any} onClose={onClose} /></React.Suspense>;
      }
      if (isMarathi) {
        const MarathiMTSAgreement = React.lazy(() => import('../src/components/agreements/employee/MarathiMTSAgreement'));
        return <React.Suspense fallback={<div>Loading...</div>}><MarathiMTSAgreement data={data as any} onClose={onClose} /></React.Suspense>;
      }
    }

    if (normalizedRole === 'Head of Digital Operations') {
      if (isEnglish) {
        const EnglishDigitalOpsAgreement = React.lazy(() => import('../src/components/agreements/employee/EnglishDigitalOpsAgreement'));
        return <React.Suspense fallback={<div>Loading...</div>}><EnglishDigitalOpsAgreement data={data as any} onClose={onClose} /></React.Suspense>;
      }
      if (isHindi) {
        const HindiDigitalOpsAgreement = React.lazy(() => import('../src/components/agreements/employee/HindiDigitalOpsAgreement'));
        return <React.Suspense fallback={<div>Loading...</div>}><HindiDigitalOpsAgreement data={data as any} onClose={onClose} /></React.Suspense>;
      }
      if (isMarathi) {
        const MarathiDigitalOpsAgreement = React.lazy(() => import('../src/components/agreements/employee/MarathiDigitalOpsAgreement'));
        return <React.Suspense fallback={<div>Loading...</div>}><MarathiDigitalOpsAgreement data={data as any} onClose={onClose} /></React.Suspense>;
      }
    }

    if (normalizedRole === 'Online Business Manager') {
      if (isEnglish) {
        const EnglishOBMAgreement = React.lazy(() => import('../src/components/agreements/employee/EnglishOBMAgreement'));
        return <React.Suspense fallback={<div>Loading...</div>}><EnglishOBMAgreement data={data as any} onClose={onClose} /></React.Suspense>;
      }
      if (isHindi) {
        const HindiOBMAgreement = React.lazy(() => import('../src/components/agreements/employee/HindiOBMAgreement'));
        return <React.Suspense fallback={<div>Loading...</div>}><HindiOBMAgreement data={data as any} onClose={onClose} /></React.Suspense>;
      }
      if (isMarathi) {
        const MarathiOBMAgreement = React.lazy(() => import('../src/components/agreements/employee/MarathiOBMAgreement'));
        return <React.Suspense fallback={<div>Loading...</div>}><MarathiOBMAgreement data={data as any} onClose={onClose} /></React.Suspense>;
      }
    }

    if (normalizedRole === 'Digital Growth Manager') {
      if (isEnglish) {
        const EnglishGrowthMgrAgreement = React.lazy(() => import('../src/components/agreements/employee/EnglishGrowthMgrAgreement'));
        return <React.Suspense fallback={<div>Loading...</div>}><EnglishGrowthMgrAgreement data={data as any} onClose={onClose} /></React.Suspense>;
      }
      if (isHindi) {
        const HindiGrowthMgrAgreement = React.lazy(() => import('../src/components/agreements/employee/HindiGrowthMgrAgreement'));
        return <React.Suspense fallback={<div>Loading...</div>}><HindiGrowthMgrAgreement data={data as any} onClose={onClose} /></React.Suspense>;
      }
      if (isMarathi) {
        const MarathiGrowthMgrAgreement = React.lazy(() => import('../src/components/agreements/employee/MarathiGrowthMgrAgreement'));
        return <React.Suspense fallback={<div>Loading...</div>}><MarathiGrowthMgrAgreement data={data as any} onClose={onClose} /></React.Suspense>;
      }
    }
    
    // Fallback or other roles (General Staff Agreements)
    // We pass the role name dynamically to these general templates
    if (isEnglish) {
      const EnglishEmploymentAgreement = React.lazy(() => import('../src/components/agreements/employee/EnglishEmploymentAgreement'));
      return <React.Suspense fallback={<div>Loading...</div>}><EnglishEmploymentAgreement data={data as any} onClose={onClose} /></React.Suspense>;
    }
    if (isHindi) {
      const HindiEmploymentAgreement = React.lazy(() => import('../src/components/agreements/employee/HindiEmploymentAgreement'));
      return <React.Suspense fallback={<div>Loading...</div>}><HindiEmploymentAgreement data={data as any} onClose={onClose} /></React.Suspense>;
    }
    if (isMarathi) {
      const MarathiEmploymentAgreement = React.lazy(() => import('../src/components/agreements/employee/MarathiEmploymentAgreement'));
      return <React.Suspense fallback={<div>Loading...</div>}><MarathiEmploymentAgreement data={data as any} onClose={onClose} /></React.Suspense>;
    }

    return <div className="p-8 text-center bg-white rounded-xl shadow">Agreement component for {normalizedRole} in {lang} is being prepared.</div>;
  };

  export const AgreementPrintLayout: React.FC<{ data: any; language: string; type: string }> = ({ data, language, type: rawType, ...props }) => {
    const type = rawType === 'sale_agreement' ? 'agreement' : rawType;
    const lang = (language || 'hi').toLowerCase() as any;
    
    return (
      <div className="p-8 font-serif text-slate-900">
        {type === 'agreement' && (lang === 'hi' || lang === 'hindi') && <HindiAgreement data={data as any} language={lang} type={type} onClose={() => {}} />}
        {type === 'agreement' && (lang === 'en' || lang === 'english') && <EnglishAgreement data={data as any} language={lang} type={type} onClose={() => {}} />}
        {type === 'agreement' && (lang === 'mr' || lang === 'marathi') && <MarathiAgreement data={data as any} language={lang} type={type} onClose={() => {}} />}
        {type === 'token' && (lang === 'hi' || lang === 'hindi') && <HindiTokan data={data as any} language={lang} type={type} onClose={() => {}} />}
        {type === 'token' && (lang === 'en' || lang === 'english') && <EnglishTokan data={data as any} language={lang} type={type} onClose={() => {}} />}
        {type === 'token' && (lang === 'mr' || lang === 'marathi') && <MarathiTokan data={data as any} language={lang} type={type} onClose={() => {}} />}
        {type === 'noc' && (lang === 'en' || lang === 'english') && (
          (data as any).nocType === 'PRE_SALE' ? <EnglishPreSaleNOC data={data as any} language={lang} type={type} onClose={() => {}} /> : 
          (data as any).nocType === 'POST_SALE' ? <EnglishPostSaleNOC data={data as any} language={lang} type={type} onClose={() => {}} /> :
          (data as any).nocType === 'LOAN' ? <EnglishLoanNOC data={data as any} language={lang} type={type} onClose={() => {}} /> :
          (data as any).nocType === 'POST_JOB' ? <EnglishPostJobNOC data={data as any} language={lang} type={type} onClose={() => {}} /> : null
        )}
        {type === 'noc' && (lang === 'hi' || lang === 'hindi') && (
          (data as any).nocType === 'PRE_SALE' ? <HindiPreSaleNOC data={data as any} language={lang} type={type} onClose={() => {}} /> : 
          (data as any).nocType === 'POST_SALE' ? <HindiPostSaleNOC data={data as any} language={lang} type={type} onClose={() => {}} /> :
          (data as any).nocType === 'LOAN' ? <HindiLoanNOC data={data as any} language={lang} type={type} onClose={() => {}} /> :
          (data as any).nocType === 'POST_JOB' ? <HindiPostJobNOC data={data as any} language={lang} type={type} onClose={() => {}} /> : null
        )}
        {type === 'noc' && (lang === 'mr' || lang === 'marathi') && (
          (data as any).nocType === 'PRE_SALE' ? <MarathiPreSaleNOC data={data as any} language={lang} type={type} onClose={() => {}} /> : 
          (data as any).nocType === 'POST_SALE' ? <MarathiPostSaleNOC data={data as any} language={lang} type={type} onClose={() => {}} /> :
          (data as any).nocType === 'LOAN' ? <MarathiLoanNOC data={data as any} language={lang} type={type} onClose={() => {}} /> :
          (data as any).nocType === 'POST_JOB' ? <MarathiPostJobNOC data={data as any} language={lang} type={type} onClose={() => {}} /> : null
        )}
        {type === 'kissan_agreement' && (lang === 'hi' || lang === 'hindi') && <HindiKhetiZameenAgreement data={data as any} language={lang} type={type} onClose={() => {}} />}
        {type === 'kissan_agreement' && (lang === 'en' || lang === 'english') && <EnglishKhetiZameenAgreement data={data as any} language={lang} type={type} onClose={() => {}} />}
        {type === 'kissan_agreement' && (lang === 'mr' || lang === 'marathi') && <MarathiKhetiZameenAgreement data={data as any} language={lang} type={type} onClose={() => {}} />}
      </div>
    );
  };

  export const AgreementPreview: React.FC<TemplateProps> = ({ data, language, type, role, onClose, onGenerate }) => {
  const [isEditing, setIsEditing] = React.useState(false);
  const [showPrintPreview, setShowPrintPreview] = React.useState(false);
  const [settings, setSettings] = useState<any>(null);

  useEffect(() => {
    dbService.getSettings().then(s => setSettings(s));
  }, []);

  const handlePrint = () => {
    if (onGenerate) onGenerate();
    setShowPrintPreview(true);
  };

  // Flatten nested data if it exists (from AddClient.tsx)
  const getFlattenedData = (input: any) => {
    if (!input) return {};
    
    // Start with a merge of high-level objects if they exist
    const flattened = input.client ? {
      ...input.client,
      ...(input.property || {}),
      ...(input.company || {}),
      ...(input.manager || {}),
      ...input,
      transferNote: input.transferNote
    } : { ...input };

    // Standardize field names for templates (NOCs, Agreements, Tokens)
    if (flattened.name && !flattened.clientName) flattened.clientName = flattened.name;
    if (flattened.phone && !flattened.clientPhone) flattened.clientPhone = flattened.phone;
    if (flattened.address && !flattened.clientAddress) flattened.clientAddress = flattened.address;
    if (flattened.pan && !flattened.clientPan) flattened.clientPan = flattened.pan;
    if (flattened.aadhaar && !flattened.clientAadhaar) flattened.clientAadhaar = flattened.aadhaar;

    // Staff specifics
    if (flattened.role) flattened.staffRole = flattened.role;
    if (flattened.salary) flattened.staffSalary = flattened.salary;
    if (flattened.joinDate) flattened.staffJoinDate = flattened.joinDate;

    // Loan specifics
    if (flattened.borrowerName) flattened.clientName = flattened.borrowerName;
    if (flattened.principalAmount) flattened.loanAmount = flattened.principalAmount;
    if (flattened.interestRate) flattened.interestRate = flattened.interestRate;
    if (flattened.durationMonths) flattened.duration = flattened.durationMonths;
    if (flattened.purpose) flattened.loanPurpose = flattened.purpose;

    // Land specifics (Kissans)
    if (flattened.landName) flattened.propertyName = flattened.landName;
    
    // Explicit property selection from generators
    if (flattened.selectedProperty) {
      flattened.propertyName = flattened.selectedProperty.name;
      flattened.propertyLocation = flattened.selectedProperty.location;
      flattened.propertyArea = flattened.selectedProperty.totalArea;
      flattened.propertyPrice = flattened.selectedProperty.agreedPrice;
      flattened.propertySector = flattened.selectedProperty.sector || flattened.selectedProperty.partId;
      flattened.propertyPlotNo = flattened.selectedProperty.plotNo || flattened.selectedProperty.id;
    }

    // Normalize company data field names (AppSettings vs CompanyData mismatch)
    if (flattened.company) {
      if (flattened.company.panNumber && !flattened.company.companyPan) {
        flattened.company.companyPan = flattened.company.panNumber;
      }
    }

    // Staff to employee mapping for PostJobNOC template
    if (flattened.staff && !flattened.employee) {
      flattened.employee = flattened.staff;
    }
    // Build employment object for PostJobNOC if missing
    if (flattened.staff && !flattened.employment) {
      flattened.employment = {
        joiningDate: flattened.staff.joinDate || flattened.joinDate || '',
        relievingDate: flattened.formData?.relievingDate || '',
        lastWorkingDay: flattened.formData?.relievingDate || '',
        department: flattened.staff.role || '',
        designation: flattened.staff.role || '',
        reportingTo: flattened.staff.managerName || '',
        placeOfPosting: flattened.staff.officeLocality || '',
        grossMonthlySalary: flattened.staff.salary || '',
        conductRemark: flattened.formData?.conductRemark || 'GOOD',
        performanceRemark: flattened.formData?.performanceRemark || 'GOOD',
        nocPurpose: flattened.formData?.nocPurpose || '',
        nocIssuedTo: flattened.staff?.name || '',
        reasonForLeaving: flattened.formData?.reasonForLeaving || '',
        nocNumber: flattened.formData?.nocNumber || '',
        nocDate: flattened.formData?.date || '',
      };
    }

    // Normalize nocDate for all NOC types
    if (flattened.formData?.date && !flattened.nocDate) {
      flattened.nocDate = flattened.formData.date;
    }
    // Map loan-specific fields
    if (flattened.loan) {
      flattened.loanAmount = flattened.loan.principalAmount || flattened.loanAmount;
      flattened.loanDuration = flattened.loan.durationMonths ? `${flattened.loan.durationMonths} Months` : flattened.loanDuration;
      flattened.loanDate = flattened.loan.startDate || flattened.loanDate;
      flattened.loanPurpose = flattened.loan.purpose || flattened.loanPurpose;
      flattened.interestRate = flattened.loan.interestRate != null ? String(flattened.loan.interestRate) : flattened.interestRate;
      flattened.interestType = flattened.loan.interestType || flattened.interestType;
      flattened.repaymentMode = flattened.loan.repaymentMode || flattened.repaymentMode;
      flattened.monthlyEMI = flattened.loan.monthlyEMI || flattened.monthlyEMI;
      flattened.collateral = flattened.loan.collateral || flattened.collateral;
      flattened.collateralType = flattened.loan.collateralType || flattened.collateralType;
      flattened.collateralValue = flattened.loan.collateralValue || flattened.collateralValue;
      flattened.collateralDetails = flattened.loan.collateralDetails || flattened.collateralDetails;
      // Ensure nested client fields exist from loan data
      if (!flattened.client) {
        flattened.client = {
          name: flattened.loan.borrowerName || flattened.clientName,
          title: flattened.title || 'Mr.',
          age: flattened.loan.age || '',
          occupation: flattened.loan.occupation || '',
          phone: flattened.loan.phone || '',
          email: flattened.loan.email || '',
          aadhaar: flattened.loan.aadhaar || '',
          pan: flattened.loan.pan || '',
          address: flattened.loan.address || '',
          fatherHusbandName: flattened.loan.fatherHusbandName || '',
          folderSerial: flattened.loan.folderSerial || '',
          clientId: flattened.loan.id || '',
        };
      }
    }
    // Map guarantors from loan object
    if (flattened.loan?.guarantors && !flattened.guarantors) {
      flattened.guarantors = flattened.loan.guarantors;
    }

    return flattened;
  };

  const flatData = getFlattenedData(data);

  const execCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value);
  };


  const agreementContent = (
    <div className="relative">
      <div 
        id="printable-document" 
        contentEditable={isEditing}
        className={`outline-none transition-all ${isEditing ? 'ring-2 ring-brand-500 ring-offset-8 rounded-sm' : ''}`}
      >
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
        `}</style>

        <div className="flex flex-col items-center gap-8 font-serif text-slate-900">
          {type === 'agreement' && (language === 'hi' || language === 'hindi') && <HindiAgreement data={data as any} companyLogo={settings?.companyLogo} companyWatermark={settings?.companyWatermark} language={language} type={type} onClose={onClose} />}
          {type === 'agreement' && (language === 'en' || language === 'english') && <EnglishAgreement data={data as any} companyLogo={settings?.companyLogo} companyWatermark={settings?.companyWatermark} language={language} type={type} onClose={onClose} />}
          {type === 'agreement' && (language === 'mr' || language === 'marathi') && <MarathiAgreement data={data as any} companyLogo={settings?.companyLogo} companyWatermark={settings?.companyWatermark} language={language} type={type} onClose={onClose} />}
          
          {type === 'token' && (language === 'hi' || language === 'hindi') && <HindiTokan data={data as any} companyLogo={settings?.companyLogo} companyWatermark={settings?.companyWatermark} language={language} type={type} onClose={onClose} />}
          {type === 'token' && (language === 'en' || language === 'english') && <EnglishTokan data={data as any}companyLogo={settings?.companyLogo} companyWatermark={settings?.companyWatermark} language={language} type={type} onClose={onClose} />}
          {type === 'token' && (language === 'mr' || language === 'marathi') && <MarathiTokan data={data as any} companyLogo={settings?.companyLogo} companyWatermark={settings?.companyWatermark} language={language} type={type} onClose={onClose} />}

          {/* LOAN AGREEMENT */}
          {type === 'loan_agreement' && (language === 'en' || language === 'english') && <EnglishLoanAgreement data={flatData as any} companyLogo={settings?.companyLogo} companyWatermark={settings?.companyWatermark} />}
          {type === 'loan_agreement' && (language === 'hi' || language === 'hindi') && <HindiLoanAgreement data={flatData as any} companyLogo={settings?.companyLogo} companyWatermark={settings?.companyWatermark} />}
          {type === 'loan_agreement' && (language === 'mr' || language === 'marathi') && <MarathiLoanAgreement data={flatData as any} companyLogo={settings?.companyLogo} companyWatermark={settings?.companyWatermark} />}

          {/* ENGLISH */}
{type === 'noc' && (language === 'en' || language === 'english') && (
  (data as any).nocType === 'PRE_SALE' ? (
    <EnglishPreSaleNOC data={flatData as any} />
  ) : (data as any).nocType === 'POST_SALE' ? (
    <EnglishPostSaleNOC data={flatData as any} />
  ) : (data as any).nocType === 'LOAN' ? (
    <EnglishLoanNOC data={flatData as any} />
  ) : (data as any).nocType === 'POST_JOB' ? (
    <EnglishPostJobNOC data={flatData as any} 
    companyLogo={settings?.companyLogo}
    companyWatermark={settings?.companyWatermark}
    language={language}
    type={type}
    onClose={onClose} />
  ) : null
)}

{/* HINDI */}
{type === 'noc' && (language === 'hi' || language === 'hindi') && (
  (data as any).nocType === 'PRE_SALE' ? (
    <HindiPreSaleNOC data={flatData as any} />
  ) : (data as any).nocType === 'POST_SALE' ? (
    <HindiPostSaleNOC data={flatData as any} />
  ) : (data as any).nocType === 'LOAN' ? (
    <HindiLoanNOC data={flatData as any} />
  ) : (data as any).nocType === 'POST_JOB' ? (
    <HindiPostJobNOC data={flatData as any} 
    companyLogo={settings?.companyLogo}
    companyWatermark={settings?.companyWatermark}
    language={language}
    type={type}
    onClose={onClose} />
  ) : null
)}

{/* MARATHI */}
{type === 'noc' && (language === 'mr' || language === 'marathi') && (
  (data as any).nocType === 'PRE_SALE' ? (
    <MarathiPreSaleNOC data={flatData as any} />
  ) : (data as any).nocType === 'POST_SALE' ? (
    <MarathiPostSaleNOC data={flatData as any} />
  ) : (data as any).nocType === 'LOAN' ? (
    <MarathiLoanNOC data={flatData as any} />
  ) : (data as any).nocType === 'POST_JOB' ? (
    <MarathiPostJobNOC data={flatData as any} companyLogo={settings?.companyLogo}
    companyWatermark={settings?.companyWatermark}
    language={language}
    type={type}
    onClose={onClose} />
  ) : null
)}


{/* Staff Agreements - Strictly isolated by type */}
{type === 'staff_agreement' && <StaffAgreementRenderer role={role} language={language} data={data} settings={settings} onClose={onClose} type={type} />}


{/* KISAAN AGREEMENT */}
{type === 'kissan_agreement' && (language === 'hi' || language === 'hindi') && (
  <HindiKhetiZameenAgreement
    data={data as any}
    companyLogo={settings?.companyLogo}
    companyWatermark={settings?.companyWatermark}
    language={language}
    type={type}
    onClose={onClose}
  />
)}

{type === 'kissan_agreement' && (language === 'en' || language === 'english') && (
  <EnglishKhetiZameenAgreement
    data={data as any}
    companyLogo={settings?.companyLogo}
    companyWatermark={settings?.companyWatermark}
    language={language}
    type={type}
    onClose={onClose}
  />
)}

{type === 'kissan_agreement' && (language === 'mr' || language === 'marathi') && (
  <MarathiKhetiZameenAgreement
    data={data as any}
    companyLogo={settings?.companyLogo}
    companyWatermark={settings?.companyWatermark}
    language={language}
    type={type}
    onClose={onClose}
  />
)}

{/* INVESTOR AGREEMENT */}
{type === 'investor_agreement' && (language === 'en' || language === 'english') && (
  <EnglishInvestorAgreement
    data={flatData as any}
    companyLogo={settings?.companyLogo}
    companyWatermark={settings?.companyWatermark}
  />
)}
{type === 'investor_agreement' && (language === 'hi' || language === 'hindi') && (
  <HindiInvestorAgreement
    data={flatData as any}
    companyLogo={settings?.companyLogo}
    companyWatermark={settings?.companyWatermark}
  />
)}
{type === 'investor_agreement' && (language === 'mr' || language === 'marathi') && (
  <MarathiInvestorAgreement
    data={flatData as any}
    companyLogo={settings?.companyLogo}
    companyWatermark={settings?.companyWatermark}
  />
)}
</div>
      </div>
    </div>
  );

  return (
    <>
      {/* Main Preview Modal */}
      <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4 print:static print:block print:p-0 print:bg-transparent">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl flex flex-col h-[95vh] overflow-hidden print:shadow-none print:w-full print:max-w-none print:block print:rounded-none">
          {/* Header */}
          <div className="p-4 border-b border-slate-100 flex justify-between items-center sticky top-0 bg-white z-10 rounded-t-2xl print:hidden">
            <h3 className="font-bold text-slate-800 uppercase tracking-wider text-sm">
              {type === 'agreement' || type === 'sale_agreement' ? 'Sale Agreement Preview' : type === 'staff_agreement' ? 'Employment Agreement Preview' : type === 'loan_agreement' ? 'Loan Agreement Preview' : type === 'noc' ? 'NOC Preview' : type === 'kissan_agreement' ? 'Kissan Agreement Preview' : type === 'investor_agreement' ? 'Investor Agreement Preview' : 'Token Receipt Preview'}
            </h3>
            <div className="flex items-center space-x-3">
              {isEditing && (
                <div className="flex items-center space-x-2 mr-4 border-r pr-4">
                  <button onClick={() => execCommand('bold')} className="p-1 hover:bg-slate-200 rounded font-bold">B</button>
                  <button onClick={() => execCommand('underline')} className="p-1 hover:bg-slate-200 rounded underline">U</button>
                  <button onClick={() => execCommand('italic')} className="p-1 hover:bg-slate-200 rounded italic">I</button>
                </div>
              )}
              <button 
                onClick={() => setIsEditing(!isEditing)}
                className={`px-4 py-2 rounded-lg font-bold text-sm transition-all shadow-sm ${
                  isEditing 
                    ? 'bg-green-600 text-white hover:bg-green-700' 
                    : 'bg-slate-600 text-white hover:bg-slate-700'
                }`}
              >
                {isEditing ? 'Save Changes' : (type === 'agreement' || type === 'sale_agreement' ? 'Edit Agreement' : 'Edit Tokan')}
              </button>
              <button 
                onClick={handlePrint}
                className="bg-brand-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-brand-700 transition-all font-bold text-sm shadow-md"
              >
                <Printer size={18} className="mr-2" /> Print Document
              </button>
              <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full text-slate-500 transition-all">
                <X size={24} />
              </button>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto flex justify-center bg-slate-200 p-12 print:p-0">
            {agreementContent}
          </div>
        </div>
      </div>

      {/* Print Preview Component */}
      {showPrintPreview && (
        <PrintPreview
          title={type === 'agreement' ? 'Sale Agreement' : 'Token Receipt'}
          subtitle={`${language.charAt(0).toUpperCase() + language.slice(1)} Version`}
          companyName={flatData.companyName}
          onClose={() => setShowPrintPreview(false)}
          open={showPrintPreview}
          defaultSettings={{
            margins: 'none',
            showHeader: false,
            showFooter: false,
            showPageNumbers: false,
            showDate: false
          }}
        >
          {agreementContent}
        </PrintPreview>
      )}
    </>
  );
};
