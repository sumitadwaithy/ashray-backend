import { describe, it, expect, vi, beforeAll, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import React from 'react';
import './mocks';
import { hindiExports, marathiExports } from './mocks';

// ─────────────────────────────────────────────────────────────
//  DATA
// ─────────────────────────────────────────────────────────────

const baseData = {
  employee: {
    title: 'Mr', name: 'Ramesh Sharma', age: '35', gender: 'Male',
    fatherName: 'Suresh Sharma', phone: '9876543210', email: 'ramesh@ashray.com',
    aadhaar: '123456789012', pan: 'ABCDE1234F', dob: '1990-01-01',
    address: '123 Main Street', locality: 'Sadar', district: 'Nagpur',
    state: 'Maharashtra', pincode: '440001', qualification: 'Graduate',
    employeeId: 'EMP001', staffId: 'STF001', folderSerial: 'F001',
  },
  employment: {
    joiningDate: '2023-01-15', relievingDate: '2025-06-01', lastWorkingDay: '2025-05-31',
    department: 'Accounts', designation: 'Office Supervisor',
    reportingTo: 'Vikrant Rana', placeOfPosting: 'Nagpur Office',
    grossMonthlySalary: '25000', grossAnnualSalary: '300000',
    grossAnnualSalaryWords: 'Three Lakh Only',
    grossMonthlySalaryWords: 'Twenty Five Thousand Only',
    conductRemark: 'EXCELLENT' as const, performanceRemark: 'GOOD' as const,
    nocPurpose: 'Joining Another Organization', nocIssuedTo: 'ABC Corp',
    reasonForLeaving: 'Career Growth', jurisdiction: 'Nagpur',
    nocNumber: 'NOC001', nocDate: '2025-06-15',
    probationPeriod: '6 months', workingHours: '9-6', lunchBreak: '1-2',
    workingDays: 'Mon-Sat', annualLeaves: '12', casualLeaves: '6',
    medicalLeaves: '6', additionalDuties: ['Data entry'],
    salaryPaymentFrequency: 'Monthly',
    employmentType: 'Full-Time Permanent',
    noticePeriodEmployer: '30 Days',
    noticePeriodEmployee: '30 Days',
    nonCompetePeriod: '6 months',
    nonCompeteRadius: '25 km',
    duties: ['Data entry', 'Account reconciliation'],
  },
  company: {
    companyName: 'Ashray Group', entityType: 'Pvt. Ltd.',
    cinNumber: 'U12345MH2020', companyPan: 'AABCD1234E',
    companyEmail: 'info@ashray.com', companyWebsite: 'www.ashray.com',
    licenseRegistrationNumber: 'LIC001',
    managerName: 'Vikrant Rana', managerPosition: 'Admin Head',
    managerPAN: 'XYZPD5678K', managerAadhaar: '555566667777',
    managerPhone: '8888888888', managerCountryCode: '+91',
    hrName: 'Priya Singh', hrDesignation: 'HR Manager',
    companyAddress: '456 Office Road', companyLocality: 'Civil Lines',
    companyDistrict: 'Nagpur', companyState: 'Maharashtra', companyPincode: '440002',
  },
  manager: {
    managerName: 'Vikrant Rana', managerPosition: 'Admin Head',
    managerAddress: '456 Office Road', managerPAN: 'XYZPD5678K',
    managerAadhaar: '555566667777', managerPhone: '8888888888',
    managerCountryCode: '+91',
  },
};

const emptyData = { employee: {}, employment: {}, company: {}, manager: {} };

// ─────────────────────────────────────────────────────────────
//  IMPORTS - all employee agreement components
// ─────────────────────────────────────────────────────────────

type Comp = any;
let EnglishPostJobNOC: Comp, HindiPostJobNOC: Comp, MarathiPostJobNOC: Comp;
let EnglishEmploymentAgreement: Comp, HindiEmploymentAgreement: Comp, MarathiEmploymentAgreement: Comp;
let EnglishAccountantAgreement: Comp, HindiAccountantAgreement: Comp, MarathiAccountantAgreement: Comp;
let EnglishDigitalOpsAgreement: Comp, HindiDigitalOpsAgreement: Comp, MarathiDigitalOpsAgreement: Comp;
let EnglishDriverAgreement: Comp, HindiDriverAgreement: Comp, MarathiDriverAgreement: Comp;
let EnglishGrowthMgrAgreement: Comp, HindiGrowthMgrAgreement: Comp, MarathiGrowthMgrAgreement: Comp;
let EnglishMTSAgreement: Comp, HindiMTSAgreement: Comp, MarathiMTSAgreement: Comp;
let EnglishOBMAgreement: Comp, HindiOBMAgreement: Comp, MarathiOBMAgreement: Comp;
let EnglishOfficeComputerOperatorAgreement: Comp, HindiOfficeComputerOperatorAgreement: Comp, MarathiOfficeComputerOperatorAgreement: Comp;
let EnglishOfficeSupervisorAgreement: Comp, HindiOfficeSupervisorAgreement: Comp, MarathiOfficeSupervisorAgreement: Comp;
let EnglishSiteSupervisorAgreement: Comp, HindiSiteSupervisorAgreement: Comp, MarathiSiteSupervisorAgreement: Comp;

beforeAll(async () => {
  EnglishPostJobNOC  = (await import('../components/agreements/employee/EnglishPostJobNOC')).default;
  HindiPostJobNOC    = (await import('../components/agreements/employee/HindiPostJobNOC')).default;
  MarathiPostJobNOC  = (await import('../components/agreements/employee/MarathiPostJobNOC')).default;

  EnglishEmploymentAgreement = (await import('../components/agreements/employee/EnglishEmploymentAgreement')).default;
  HindiEmploymentAgreement   = (await import('../components/agreements/employee/HindiEmploymentAgreement')).default;
  MarathiEmploymentAgreement = (await import('../components/agreements/employee/MarathiEmploymentAgreement')).default;

  EnglishAccountantAgreement = (await import('../components/agreements/employee/EnglishAccountantAgreement')).default;
  HindiAccountantAgreement   = (await import('../components/agreements/employee/HindiAccountantAgreement')).default;
  MarathiAccountantAgreement = (await import('../components/agreements/employee/MarathiAccountantAgreement')).default;

  EnglishDigitalOpsAgreement = (await import('../components/agreements/employee/EnglishDigitalOpsAgreement')).default;
  HindiDigitalOpsAgreement   = (await import('../components/agreements/employee/HindiDigitalOpsAgreement')).default;
  MarathiDigitalOpsAgreement = (await import('../components/agreements/employee/MarathiDigitalOpsAgreement')).default;

  EnglishDriverAgreement = (await import('../components/agreements/employee/EnglishDriverAgreement')).default;
  HindiDriverAgreement   = (await import('../components/agreements/employee/HindiDriverAgreement')).default;
  MarathiDriverAgreement = (await import('../components/agreements/employee/MarathiDriverAgreement')).default;

  EnglishGrowthMgrAgreement = (await import('../components/agreements/employee/EnglishGrowthMgrAgreement')).default;
  HindiGrowthMgrAgreement   = (await import('../components/agreements/employee/HindiGrowthMgrAgreement')).default;
  MarathiGrowthMgrAgreement = (await import('../components/agreements/employee/MarathiGrowthMgrAgreement')).default;

  EnglishMTSAgreement = (await import('../components/agreements/employee/EnglishMTSAgreement')).default;
  HindiMTSAgreement   = (await import('../components/agreements/employee/HindiMTSAgreement')).default;
  MarathiMTSAgreement = (await import('../components/agreements/employee/MarathiMTSAgreement')).default;

  EnglishOBMAgreement = (await import('../components/agreements/employee/EnglishOBMAgreement')).default;
  HindiOBMAgreement   = (await import('../components/agreements/employee/HindiOBMAgreement')).default;
  MarathiOBMAgreement = (await import('../components/agreements/employee/MarathiOBMAgreement')).default;

  EnglishOfficeComputerOperatorAgreement = (await import('../components/agreements/employee/EnglishOfficeComputerOperatorAgreement')).default;
  HindiOfficeComputerOperatorAgreement   = (await import('../components/agreements/employee/HindiOfficeComputerOperatorAgreement')).default;
  MarathiOfficeComputerOperatorAgreement = (await import('../components/agreements/employee/MarathiOfficeComputerOperatorAgreement')).default;

  EnglishOfficeSupervisorAgreement = (await import('../components/agreements/employee/EnglishOfficeSupervisorAgreement')).default;
  HindiOfficeSupervisorAgreement   = (await import('../components/agreements/employee/HindiOfficeSupervisorAgreement')).default;
  MarathiOfficeSupervisorAgreement = (await import('../components/agreements/employee/MarathiOfficeSupervisorAgreement')).default;

  EnglishSiteSupervisorAgreement = (await import('../components/agreements/employee/EnglishSiteSupervisorAgreement')).default;
  HindiSiteSupervisorAgreement   = (await import('../components/agreements/employee/HindiSiteSupervisorAgreement')).default;
  MarathiSiteSupervisorAgreement = (await import('../components/agreements/employee/MarathiSiteSupervisorAgreement')).default;
});

beforeEach(() => vi.clearAllMocks());

// ─────────────────────────────────────────────────────────────
//  ENGLISH AGREEMENT TESTS
// ─────────────────────────────────────────────────────────────

describe('English Agreements', () => {
  describe('PostJobNOC', () => {
    it('renders full data correctly', () => {
      expect(EnglishPostJobNOC).toBeDefined();
      const { container } = render(React.createElement(EnglishPostJobNOC, { data: baseData }));
      const h = container.innerHTML;
      expect(h).toContain('Ramesh Sharma');
      expect(h).toContain('123456789012');
      expect(h).toContain('ABCDE1234F');
      expect(h).toContain('Ashray Group');
      expect(h).toContain('Pvt. Ltd.');
      expect(h).toContain('Office Supervisor');
      expect(h).toContain('NOC001');
    });
    it('handles empty data', () => {
      const { container } = render(React.createElement(EnglishPostJobNOC, { data: emptyData }));
      expect(container.innerHTML).toBeTruthy();
    });
  });

  describe('EmploymentAgreement', () => {
    it('renders full data', () => {
      expect(EnglishEmploymentAgreement).toBeDefined();
      const { container } = render(React.createElement(EnglishEmploymentAgreement, { data: baseData }));
      const h = container.innerHTML;
      expect(h).toContain('Ramesh Sharma');
      expect(h).toContain('Ashray Group');
      expect(h).toContain('Employment Agreement');
    });
    it('handles empty data', () => {
      const { container } = render(React.createElement(EnglishEmploymentAgreement, { data: emptyData }));
      expect(container.innerHTML).toBeTruthy();
    });
  });

  describe('AccountantAgreement', () => {
    it('renders with data', () => {
      expect(EnglishAccountantAgreement).toBeDefined();
      const { container } = render(React.createElement(EnglishAccountantAgreement, { data: baseData }));
      expect(container.innerHTML).toContain('Ramesh Sharma');
    });
    it('handles empty data', () => {
      const { container } = render(React.createElement(EnglishAccountantAgreement, { data: emptyData }));
      expect(container.innerHTML).toBeTruthy();
    });
  });

  describe('DigitalOpsAgreement', () => {
    it('renders with data', () => {
      expect(EnglishDigitalOpsAgreement).toBeDefined();
      const { container } = render(React.createElement(EnglishDigitalOpsAgreement, { data: baseData }));
      expect(container.innerHTML).toContain('Ramesh Sharma');
    });
    it('handles empty data', () => {
      const { container } = render(React.createElement(EnglishDigitalOpsAgreement, { data: emptyData }));
      expect(container.innerHTML).toBeTruthy();
    });
  });

  describe('DriverAgreement', () => {
    it('renders with data', () => {
      expect(EnglishDriverAgreement).toBeDefined();
      const { container } = render(React.createElement(EnglishDriverAgreement, { data: baseData }));
      expect(container.innerHTML).toContain('Ramesh Sharma');
    });
    it('handles empty data', () => {
      const { container } = render(React.createElement(EnglishDriverAgreement, { data: emptyData }));
      expect(container.innerHTML).toBeTruthy();
    });
  });

  describe('GrowthMgrAgreement', () => {
    it('renders with data', () => {
      expect(EnglishGrowthMgrAgreement).toBeDefined();
      const { container } = render(React.createElement(EnglishGrowthMgrAgreement, { data: baseData }));
      expect(container.innerHTML).toContain('Ramesh Sharma');
    });
    it('handles empty data', () => {
      const { container } = render(React.createElement(EnglishGrowthMgrAgreement, { data: emptyData }));
      expect(container.innerHTML).toBeTruthy();
    });
  });

  describe('MTSAgreement', () => {
    it('renders with data', () => {
      expect(EnglishMTSAgreement).toBeDefined();
      const { container } = render(React.createElement(EnglishMTSAgreement, { data: baseData }));
      expect(container.innerHTML).toContain('Ramesh Sharma');
    });
    it('handles empty data', () => {
      const { container } = render(React.createElement(EnglishMTSAgreement, { data: emptyData }));
      expect(container.innerHTML).toBeTruthy();
    });
  });

  describe('OBMAgreement', () => {
    it('renders with data', () => {
      expect(EnglishOBMAgreement).toBeDefined();
      const { container } = render(React.createElement(EnglishOBMAgreement, { data: baseData }));
      expect(container.innerHTML).toContain('Ramesh Sharma');
    });
    it('handles empty data', () => {
      const { container } = render(React.createElement(EnglishOBMAgreement, { data: emptyData }));
      expect(container.innerHTML).toBeTruthy();
    });
  });

  describe('OfficeComputerOperatorAgreement', () => {
    it('renders with data', () => {
      expect(EnglishOfficeComputerOperatorAgreement).toBeDefined();
      const { container } = render(React.createElement(EnglishOfficeComputerOperatorAgreement, { data: baseData }));
      expect(container.innerHTML).toContain('Ramesh Sharma');
    });
    it('handles empty data', () => {
      const { container } = render(React.createElement(EnglishOfficeComputerOperatorAgreement, { data: emptyData }));
      expect(container.innerHTML).toBeTruthy();
    });
  });

  describe('OfficeSupervisorAgreement', () => {
    it('renders with data', () => {
      expect(EnglishOfficeSupervisorAgreement).toBeDefined();
      const { container } = render(React.createElement(EnglishOfficeSupervisorAgreement, { data: baseData }));
      expect(container.innerHTML).toContain('Ramesh Sharma');
    });
    it('handles empty data', () => {
      const { container } = render(React.createElement(EnglishOfficeSupervisorAgreement, { data: emptyData }));
      expect(container.innerHTML).toBeTruthy();
    });
  });

  describe('SiteSupervisorAgreement', () => {
    it('renders with data', () => {
      expect(EnglishSiteSupervisorAgreement).toBeDefined();
      const { container } = render(React.createElement(EnglishSiteSupervisorAgreement, { data: baseData }));
      expect(container.innerHTML).toContain('Ramesh Sharma');
    });
    it('handles empty data', () => {
      const { container } = render(React.createElement(EnglishSiteSupervisorAgreement, { data: emptyData }));
      expect(container.innerHTML).toBeTruthy();
    });
  });
});

// ─────────────────────────────────────────────────────────────
//  HINDI AGREEMENT TESTS
// ─────────────────────────────────────────────────────────────

describe('Hindi Agreements', () => {
  beforeEach(() => vi.clearAllMocks());

  describe('PostJobNOC', () => {
    it('calls convertNameWithTitle', () => {
      render(React.createElement(HindiPostJobNOC, { data: baseData }));
      expect(hindiExports.convertNameWithTitle).toHaveBeenCalled();
    });
    it('calls formatAadhaarHindi', () => {
      render(React.createElement(HindiPostJobNOC, { data: baseData }));
      expect(hindiExports.formatAadhaarHindi).toHaveBeenCalledWith('123456789012');
    });
    it('calls convertNumberToHindi for age', () => {
      render(React.createElement(HindiPostJobNOC, { data: baseData }));
      expect(hindiExports.convertNumberToHindi).toHaveBeenCalledWith('35');
    });
    it('calls convertToHindi for company name', () => {
      render(React.createElement(HindiPostJobNOC, { data: baseData }));
      const calls = hindiExports.convertToHindi.mock.calls.map((c: any[]) => String(c[0]));
      expect(calls).toContain('Ashray Group');
    });
    it('handles empty data', () => {
      const { container } = render(React.createElement(HindiPostJobNOC, { data: emptyData }));
      expect(container.innerHTML).toBeTruthy();
    });
  });

  describe('EmploymentAgreement', () => {
    it('calls engine functions', () => {
      render(React.createElement(HindiEmploymentAgreement, { data: baseData }));
      expect(hindiExports.formatAadhaarHindi).toHaveBeenCalledWith('123456789012');
      expect(hindiExports.convertToHindi).toHaveBeenCalledWith('Ashray Group');
    });
    it('handles empty data', () => {
      const { container } = render(React.createElement(HindiEmploymentAgreement, { data: emptyData }));
      expect(container.innerHTML).toBeTruthy();
    });
  });

  describe('AccountantAgreement', () => {
    it('calls convertToHindi for company', () => {
      render(React.createElement(HindiAccountantAgreement, { data: baseData }));
      expect(hindiExports.convertToHindi).toHaveBeenCalledWith('Ashray Group');
    });
    it('handles empty data', () => {
      const { container } = render(React.createElement(HindiAccountantAgreement, { data: emptyData }));
      expect(container.innerHTML).toBeTruthy();
    });
  });

  describe('DriverAgreement', () => {
    it('calls convertToHindi for company', () => {
      render(React.createElement(HindiDriverAgreement, { data: baseData }));
      expect(hindiExports.convertToHindi).toHaveBeenCalledWith('Ashray Group');
    });
    it('handles empty data', () => {
      const { container } = render(React.createElement(HindiDriverAgreement, { data: emptyData }));
      expect(container.innerHTML).toBeTruthy();
    });
  });

  describe('OBMAgreement', () => {
    it('calls convertToHindi for company', () => {
      render(React.createElement(HindiOBMAgreement, { data: baseData }));
      expect(hindiExports.convertToHindi).toHaveBeenCalledWith('Ashray Group');
    });
    it('handles empty data', () => {
      const { container } = render(React.createElement(HindiOBMAgreement, { data: emptyData }));
      expect(container.innerHTML).toBeTruthy();
    });
  });

  describe('OfficeSupervisorAgreement', () => {
    it('calls convertToHindi for company and convertNumberToHindi', () => {
      render(React.createElement(HindiOfficeSupervisorAgreement, { data: baseData }));
      expect(hindiExports.convertToHindi).toHaveBeenCalledWith('Ashray Group');
      expect(hindiExports.convertNumberToHindi).toHaveBeenCalled();
    });
    it('handles empty data', () => {
      const { container } = render(React.createElement(HindiOfficeSupervisorAgreement, { data: emptyData }));
      expect(container.innerHTML).toBeTruthy();
    });
  });

  describe('DigitalOpsAgreement', () => {
    it('calls convertToHindi for company', () => {
      render(React.createElement(HindiDigitalOpsAgreement, { data: baseData }));
      expect(hindiExports.convertToHindi).toHaveBeenCalledWith('Ashray Group');
    });
    it('handles empty data', () => {
      const { container } = render(React.createElement(HindiDigitalOpsAgreement, { data: emptyData }));
      expect(container.innerHTML).toBeTruthy();
    });
  });

  describe('GrowthMgrAgreement', () => {
    it('calls convertToHindi for company', () => {
      render(React.createElement(HindiGrowthMgrAgreement, { data: baseData }));
      expect(hindiExports.convertToHindi).toHaveBeenCalledWith('Ashray Group');
    });
    it('handles empty data', () => {
      const { container } = render(React.createElement(HindiGrowthMgrAgreement, { data: emptyData }));
      expect(container.innerHTML).toBeTruthy();
    });
  });

  describe('MTSAgreement', () => {
    it('calls convertToHindi for company', () => {
      render(React.createElement(HindiMTSAgreement, { data: baseData }));
      expect(hindiExports.convertToHindi).toHaveBeenCalledWith('Ashray Group');
    });
    it('handles empty data', () => {
      const { container } = render(React.createElement(HindiMTSAgreement, { data: emptyData }));
      expect(container.innerHTML).toBeTruthy();
    });
  });

  describe('OfficeComputerOperatorAgreement', () => {
    it('calls convertToHindi for company', () => {
      render(React.createElement(HindiOfficeComputerOperatorAgreement, { data: baseData }));
      expect(hindiExports.convertToHindi).toHaveBeenCalledWith('Ashray Group');
    });
    it('handles empty data', () => {
      const { container } = render(React.createElement(HindiOfficeComputerOperatorAgreement, { data: emptyData }));
      expect(container.innerHTML).toBeTruthy();
    });
  });

  describe('SiteSupervisorAgreement', () => {
    it('calls convertToHindi for company', () => {
      render(React.createElement(HindiSiteSupervisorAgreement, { data: baseData }));
      expect(hindiExports.convertToHindi).toHaveBeenCalledWith('Ashray Group');
    });
    it('handles empty data', () => {
      const { container } = render(React.createElement(HindiSiteSupervisorAgreement, { data: emptyData }));
      expect(container.innerHTML).toBeTruthy();
    });
  });
});

// ─────────────────────────────────────────────────────────────
//  MARATHI AGREEMENT TESTS
// ─────────────────────────────────────────────────────────────

describe('Marathi Agreements', () => {
  beforeEach(() => vi.clearAllMocks());

  describe('PostJobNOC', () => {
    it('calls convertNameWithTitle', () => {
      render(React.createElement(MarathiPostJobNOC, { data: baseData }));
      expect(marathiExports.convertNameWithTitle).toHaveBeenCalled();
    });
    it('calls formatAadhaarMarathi', () => {
      render(React.createElement(MarathiPostJobNOC, { data: baseData }));
      expect(marathiExports.formatAadhaarMarathi).toHaveBeenCalledWith('123456789012');
    });
    it('calls convertNumberToMarathi for age', () => {
      render(React.createElement(MarathiPostJobNOC, { data: baseData }));
      expect(marathiExports.convertNumberToMarathi).toHaveBeenCalledWith('35');
    });
    it('calls convertToMarathi for company name', () => {
      render(React.createElement(MarathiPostJobNOC, { data: baseData }));
      const calls = marathiExports.convertToMarathi.mock.calls.map((c: any[]) => String(c[0]));
      expect(calls).toContain('Ashray Group');
    });
    it('handles empty data', () => {
      const { container } = render(React.createElement(MarathiPostJobNOC, { data: emptyData }));
      expect(container.innerHTML).toBeTruthy();
    });
  });

  describe('EmploymentAgreement', () => {
    it('calls engine functions', () => {
      render(React.createElement(MarathiEmploymentAgreement, { data: baseData }));
      expect(marathiExports.formatAadhaarMarathi).toHaveBeenCalledWith('123456789012');
      expect(marathiExports.convertToMarathi).toHaveBeenCalledWith('Ashray Group');
    });
    it('handles empty data', () => {
      const { container } = render(React.createElement(MarathiEmploymentAgreement, { data: emptyData }));
      expect(container.innerHTML).toBeTruthy();
    });
  });

  describe('AccountantAgreement', () => {
    it('calls convertToMarathi for company', () => {
      render(React.createElement(MarathiAccountantAgreement, { data: baseData }));
      expect(marathiExports.convertToMarathi).toHaveBeenCalledWith('Ashray Group');
    });
    it('handles empty data', () => {
      const { container } = render(React.createElement(MarathiAccountantAgreement, { data: emptyData }));
      expect(container.innerHTML).toBeTruthy();
    });
  });

  describe('DriverAgreement', () => {
    it('calls convertToMarathi for company', () => {
      render(React.createElement(MarathiDriverAgreement, { data: baseData }));
      expect(marathiExports.convertToMarathi).toHaveBeenCalledWith('Ashray Group');
    });
    it('handles empty data', () => {
      const { container } = render(React.createElement(MarathiDriverAgreement, { data: emptyData }));
      expect(container.innerHTML).toBeTruthy();
    });
  });

  describe('OBMAgreement', () => {
    it('calls convertToMarathi for company', () => {
      render(React.createElement(MarathiOBMAgreement, { data: baseData }));
      expect(marathiExports.convertToMarathi).toHaveBeenCalledWith('Ashray Group');
    });
    it('handles empty data', () => {
      const { container } = render(React.createElement(MarathiOBMAgreement, { data: emptyData }));
      expect(container.innerHTML).toBeTruthy();
    });
  });

  describe('OfficeSupervisorAgreement', () => {
    it('calls convertToMarathi for company', () => {
      render(React.createElement(MarathiOfficeSupervisorAgreement, { data: baseData }));
      expect(marathiExports.convertToMarathi).toHaveBeenCalledWith('Ashray Group');
    });
    it('handles empty data', () => {
      const { container } = render(React.createElement(MarathiOfficeSupervisorAgreement, { data: emptyData }));
      expect(container.innerHTML).toBeTruthy();
    });
  });

  describe('DigitalOpsAgreement', () => {
    it('calls convertToMarathi for company', () => {
      render(React.createElement(MarathiDigitalOpsAgreement, { data: baseData }));
      expect(marathiExports.convertToMarathi).toHaveBeenCalledWith('Ashray Group');
    });
    it('handles empty data', () => {
      const { container } = render(React.createElement(MarathiDigitalOpsAgreement, { data: emptyData }));
      expect(container.innerHTML).toBeTruthy();
    });
  });

  describe('GrowthMgrAgreement', () => {
    it('calls convertToMarathi for company', () => {
      render(React.createElement(MarathiGrowthMgrAgreement, { data: baseData }));
      expect(marathiExports.convertToMarathi).toHaveBeenCalledWith('Ashray Group');
    });
    it('handles empty data', () => {
      const { container } = render(React.createElement(MarathiGrowthMgrAgreement, { data: emptyData }));
      expect(container.innerHTML).toBeTruthy();
    });
  });

  describe('MTSAgreement', () => {
    it('calls convertToMarathi for company', () => {
      render(React.createElement(MarathiMTSAgreement, { data: baseData }));
      expect(marathiExports.convertToMarathi).toHaveBeenCalledWith('Ashray Group');
    });
    it('handles empty data', () => {
      const { container } = render(React.createElement(MarathiMTSAgreement, { data: emptyData }));
      expect(container.innerHTML).toBeTruthy();
    });
  });

  describe('OfficeComputerOperatorAgreement', () => {
    it('calls convertToMarathi for company', () => {
      render(React.createElement(MarathiOfficeComputerOperatorAgreement, { data: baseData }));
      expect(marathiExports.convertToMarathi).toHaveBeenCalledWith('Ashray Group');
    });
    it('handles empty data', () => {
      const { container } = render(React.createElement(MarathiOfficeComputerOperatorAgreement, { data: emptyData }));
      expect(container.innerHTML).toBeTruthy();
    });
  });

  describe('SiteSupervisorAgreement', () => {
    it('calls convertToMarathi for company', () => {
      render(React.createElement(MarathiSiteSupervisorAgreement, { data: baseData }));
      expect(marathiExports.convertToMarathi).toHaveBeenCalledWith('Ashray Group');
    });
    it('handles empty data', () => {
      const { container } = render(React.createElement(MarathiSiteSupervisorAgreement, { data: emptyData }));
      expect(container.innerHTML).toBeTruthy();
    });
  });
});