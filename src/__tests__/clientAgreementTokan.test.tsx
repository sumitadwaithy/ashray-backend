import { describe, it, expect, vi, beforeEach, beforeAll } from 'vitest';
import { render } from '@testing-library/react';
import React from 'react';

import { hindiExports, marathiExports } from './mocks';

const fullData = {
  client: {
    title: 'Mr', name: 'Ramesh Sharma', age: '35', gender: 'Male',
    occupation: 'Engineer', phone: '9876543210', email: 'ramesh@example.com',
    aadhaar: '123456789012', pan: 'ABCDE1234F',
    address: '123 Main Street', locality: 'Sadar', district: 'Nagpur',
    state: 'Maharashtra', pincode: '440001', folderSerial: 'F001', clientId: 'C001',
    nominee1Title: 'Mrs', nominee1Name: 'Sita Sharma', nominee1Age: '30',
    nominee1Occupation: 'Teacher', nominee1Aadhaar: '987654321098',
  },
  property: {
    projectName: 'ABC Project', locality: 'Mouza', tehsil: 'Tehsil',
    district: 'Nagpur', state: 'Maharashtra', pincode: '440001',
    khasraNumber: '123', surveyNumber: '456', plotNumber: '101', area: '1500',
    rate: '2000', totalAmount: '3000000', tokenAmount: '500000',
    paymentReference: 'REF123', bookingDate: '2025-01-15',
    bookingDay: { en: 'Monday', hi: 'सोमवार', mr: 'सोमवार' },
    paymentMode: 'Cash', emiDuration: 36, emiAmount: 69444, remainingAmount: 2500000,
  },
  company: {
    companyName: 'Ashray Group', entityType: 'Pvt. Ltd.',
    companyPan: 'AABCD1234E', companyEmail: 'info@ashray.com',
    companyWebsite: 'www.ashray.com', licenseRegistrationNumber: 'LIC001',
    urcNumber: 'URC001', managerPhone: '8888888888',
    companyAddress: '456 Office Road', companyLocality: 'Civil Lines',
    companyDistrict: 'Nagpur', companyState: 'Maharashtra', companyPincode: '440002',
  },
  manager: {
    managerName: 'Vikrant Rana', managerPosition: 'Admin Head',
    managerAadhaar: '555566667777', managerPhone: '8888888888',
    managerCountryCode: '+91',
  },
};

const emptyData = { client: {}, property: {}, company: {}, manager: {} };

let EnglishAgreement: any, HindiAgreement: any, MarathiAgreement: any;
let EnglishTokan: any, HindiTokan: any, MarathiTokan: any;

beforeAll(async () => {
  EnglishAgreement = (await import('../components/agreements/client/EnglishAgreement')).default;
  HindiAgreement = (await import('../components/agreements/client/HindiAgreement')).default;
  MarathiAgreement = (await import('../components/agreements/client/MarathiAgreement')).default;
  EnglishTokan = (await import('../components/agreements/client/EnglishTokan')).default;
  HindiTokan = (await import('../components/agreements/client/HindiTokan')).default;
  MarathiTokan = (await import('../components/agreements/client/MarathiTokan')).default;
});

beforeEach(() => vi.clearAllMocks());

describe('English Agreement', () => {
  it('renders client fields', () => {
    const { container } = render(React.createElement(EnglishAgreement, { data: fullData }));
    const h = container.innerHTML;
    expect(h).toContain('Ramesh Sharma');
    expect(h).toContain('35');
    expect(h).toContain('Male');
    expect(h).toContain('Engineer');
    expect(h).toContain('123456789012');
  });

  it('renders property fields', () => {
    const { container } = render(React.createElement(EnglishAgreement, { data: fullData }));
    const h = container.innerHTML;
    expect(h).toContain('ABC Project');
    expect(h).toContain('101');
    expect(h).toContain('1500');
    expect(h).toContain('3000000');
  });

  it('renders company fields', () => {
    const { container } = render(React.createElement(EnglishAgreement, { data: fullData }));
    const h = container.innerHTML;
    expect(h).toContain('Ashray Group');
    expect(h).toContain('Pvt. Ltd.');
    expect(h).toContain('LIC001');
  });

  it('handles empty data', () => {
    const { container } = render(React.createElement(EnglishAgreement, { data: emptyData }));
    expect(container.innerHTML).toBeTruthy();
  });
});

describe('Hindi Agreement', () => {
  const e = () => hindiExports;

  it('calls convertNameWithTitle', () => {
    render(React.createElement(HindiAgreement, { data: fullData }));
    expect(e().convertNameWithTitle).toHaveBeenCalled();
  });

  it('calls convertToHindi for occupation', () => {
    render(React.createElement(HindiAgreement, { data: fullData }));
    expect(e().convertToHindi).toHaveBeenCalledWith('Engineer');
  });

  it('calls formatAadhaarHindi', () => {
    render(React.createElement(HindiAgreement, { data: fullData }));
    expect(e().formatAadhaarHindi).toHaveBeenCalledWith('123456789012');
  });

  it('calls convertNumberToHindi for age', () => {
    render(React.createElement(HindiAgreement, { data: fullData }));
    expect(e().convertNumberToHindi).toHaveBeenCalledWith('35');
  });

  it('calls convertToHindi for company name', () => {
    render(React.createElement(HindiAgreement, { data: fullData }));
    expect(e().convertToHindi).toHaveBeenCalledWith('Ashray Group');
  });

  it('handles empty data', () => {
    const { container } = render(React.createElement(HindiAgreement, { data: emptyData }));
    expect(container.innerHTML).toBeTruthy();
  });
});

describe('Marathi Agreement', () => {
  const e = () => marathiExports;

  it('calls convertNameWithTitle', () => {
    render(React.createElement(MarathiAgreement, { data: fullData }));
    expect(e().convertNameWithTitle).toHaveBeenCalled();
  });

  it('calls convertToMarathi for occupation', () => {
    render(React.createElement(MarathiAgreement, { data: fullData }));
    expect(e().convertToMarathi).toHaveBeenCalledWith('Engineer');
  });

  it('calls formatAadhaarMarathi', () => {
    render(React.createElement(MarathiAgreement, { data: fullData }));
    expect(e().formatAadhaarMarathi).toHaveBeenCalledWith('123456789012');
  });

  it('calls convertNumberToMarathi for age', () => {
    render(React.createElement(MarathiAgreement, { data: fullData }));
    expect(e().convertNumberToMarathi).toHaveBeenCalledWith('35');
  });

  it('calls convertToMarathi for company name', () => {
    render(React.createElement(MarathiAgreement, { data: fullData }));
    expect(e().convertToMarathi).toHaveBeenCalledWith('Ashray Group');
  });

  it('handles empty data', () => {
    const { container } = render(React.createElement(MarathiAgreement, { data: emptyData }));
    expect(container.innerHTML).toBeTruthy();
  });
});

describe('English Tokan', () => {
  it('renders client fields', () => {
    const { container } = render(React.createElement(EnglishTokan, { data: fullData }));
    const h = container.innerHTML;
    expect(h).toContain('Ramesh Sharma');
    expect(h).toContain('123456789012');
    expect(h).toContain('9876543210');
  });

  it('renders property fields', () => {
    const { container } = render(React.createElement(EnglishTokan, { data: fullData }));
    const h = container.innerHTML;
    expect(h).toContain('ABC Project');
    expect(h).toContain('101');
    expect(h).toContain('1500');
  });

  it('renders company name', () => {
    const { container } = render(React.createElement(EnglishTokan, { data: fullData }));
    const h = container.innerHTML;
    expect(h).toContain('Ashray Group');
  });

  it('handles empty data', () => {
    const { container } = render(React.createElement(EnglishTokan, { data: emptyData }));
    expect(container.innerHTML).toBeTruthy();
  });
});

describe('Hindi Tokan', () => {
  const e = () => hindiExports;

  it('calls convertNameWithTitle', () => {
    render(React.createElement(HindiTokan, { data: fullData }));
    expect(e().convertNameWithTitle).toHaveBeenCalled();
  });

  it('calls convertToHindi for project name', () => {
    render(React.createElement(HindiTokan, { data: fullData }));
    expect(e().convertToHindi).toHaveBeenCalledWith('ABC Project');
  });

  it('calls convertNumberToHindi for amounts', () => {
    render(React.createElement(HindiTokan, { data: fullData }));
    expect(e().convertNumberToHindi).toHaveBeenCalledWith('1500');
  });

  it('handles empty data', () => {
    const { container } = render(React.createElement(HindiTokan, { data: emptyData }));
    expect(container.innerHTML).toBeTruthy();
  });
});

describe('Marathi Tokan', () => {
  const e = () => marathiExports;

  it('calls convertNameWithTitle', () => {
    render(React.createElement(MarathiTokan, { data: fullData }));
    expect(e().convertNameWithTitle).toHaveBeenCalled();
  });

  it('calls convertToMarathi for project name', () => {
    render(React.createElement(MarathiTokan, { data: fullData }));
    expect(e().convertToMarathi).toHaveBeenCalledWith('ABC Project');
  });

  it('calls convertNumberToMarathi for amounts', () => {
    render(React.createElement(MarathiTokan, { data: fullData }));
    expect(e().convertNumberToMarathi).toHaveBeenCalledWith('1500');
  });

  it('handles empty data', () => {
    const { container } = render(React.createElement(MarathiTokan, { data: emptyData }));
    expect(container.innerHTML).toBeTruthy();
  });
});