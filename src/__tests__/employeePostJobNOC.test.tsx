import { describe, it, expect, vi, beforeAll, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import React from 'react';

// Import mocks early so vi.mock() is hoisted
import './mocks';
import { hindiExports, marathiExports } from './mocks';

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

let EnglishPostJobNOC: any, HindiPostJobNOC: any, MarathiPostJobNOC: any;

beforeAll(async () => {
  EnglishPostJobNOC = (await import('../components/agreements/employee/EnglishPostJobNOC')).default;
  HindiPostJobNOC = (await import('../components/agreements/employee/HindiPostJobNOC')).default;
  MarathiPostJobNOC = (await import('../components/agreements/employee/MarathiPostJobNOC')).default;
});

beforeEach(() => vi.clearAllMocks());

describe('EnglishPostJobNOC', () => {
  it('renders employee name, aadhaar, pan', () => {
    const { container } = render(React.createElement(EnglishPostJobNOC, { data: baseData }));
    const h = container.innerHTML;
    expect(h).toContain('Ramesh Sharma');
    expect(h).toContain('123456789012');
    expect(h).toContain('ABCDE1234F');
  });

  it('renders company name and entity type', () => {
    const { container } = render(React.createElement(EnglishPostJobNOC, { data: baseData }));
    const h = container.innerHTML;
    expect(h).toContain('Ashray Group');
    expect(h).toContain('Pvt. Ltd.');
  });

  it('renders employment fields: designation, department', () => {
    const { container } = render(React.createElement(EnglishPostJobNOC, { data: baseData }));
    const h = container.innerHTML;
    expect(h).toContain('Office Supervisor');
    expect(h).toContain('Accounts');
    expect(h).toContain('NOC001');
  });

  it('handles empty data', () => {
    const { container } = render(React.createElement(EnglishPostJobNOC, { data: emptyData }));
    expect(container.innerHTML).toBeTruthy();
  });
});

describe('HindiPostJobNOC — engine translates dynamic data', () => {
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

  it('calls convertToHindi for company name and entity type', () => {
    render(React.createElement(HindiPostJobNOC, { data: baseData }));
    const calls = hindiExports.convertToHindi.mock.calls.map((c: any[]) => String(c[0]));
    expect(calls).toContain('Ashray Group');
    expect(calls).toContain('Pvt. Ltd.');
  });

  it('handles empty data without crashing', () => {
    const { container } = render(React.createElement(HindiPostJobNOC, { data: emptyData }));
    expect(container.innerHTML).toBeTruthy();
  });
});

describe('MarathiPostJobNOC — engine translates dynamic data', () => {
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

  it('calls convertToMarathi for company details', () => {
    render(React.createElement(MarathiPostJobNOC, { data: baseData }));
    const calls = marathiExports.convertToMarathi.mock.calls.map((c: any[]) => String(c[0]));
    expect(calls).toContain('Ashray Group');
    expect(calls).toContain('Pvt. Ltd.');
  });

  it('handles empty data', () => {
    const { container } = render(React.createElement(MarathiPostJobNOC, { data: emptyData }));
    expect(container.innerHTML).toBeTruthy();
  });
});