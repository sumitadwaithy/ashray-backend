import { describe, it, expect, vi, beforeEach, beforeAll } from 'vitest';
import { render } from '@testing-library/react';
import React from 'react';

// Must be before any component imports
import { hindiExports, marathiExports } from './mocks';

const fullData = {
  client: {
    title: 'Mr', name: 'Ramesh Sharma', age: '35', gender: 'Male',
    occupation: 'Engineer', phone: '9876543210', email: 'ramesh@example.com',
    aadhaar: '123456789012', pan: 'ABCDE1234F',
    address: '123 Main Street', locality: 'Sadar', district: 'Nagpur',
    state: 'Maharashtra', pincode: '440001', folderSerial: 'F001', clientId: 'C001',
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
    companyEmail: 'info@ashray.com', companyWebsite: 'www.ashray.com',
    licenseRegistrationNumber: 'LIC001', managerPhone: '8888888888',
    companyAddress: '456 Office Road', companyLocality: 'Civil Lines',
    companyDistrict: 'Nagpur', companyState: 'Maharashtra', companyPincode: '440002',
  },
  manager: { managerPhone: '8888888888' },
  nocSerial: 'NOC001', nocDate: '2025-06-01',
};

const emptyData = { client: {}, property: {}, company: {}, manager: {} };

let EnglishPreSaleNOC: any, EnglishPostSaleNOC: any;
let HindiPreSaleNOC: any, HindiPostSaleNOC: any;
let MarathiPreSaleNOC: any, MarathiPostSaleNOC: any;

beforeAll(async () => {
  EnglishPreSaleNOC = (await import('../components/agreements/client/EnglishPreSaleNOC')).EnglishPreSaleNOC;
  EnglishPostSaleNOC = (await import('../components/agreements/client/EnglishPostSaleNOC')).EnglishPostSaleNOC;
  HindiPreSaleNOC = (await import('../components/agreements/client/HindiPreSaleNOC')).HindiPreSaleNOC;
  HindiPostSaleNOC = (await import('../components/agreements/client/HindiPostSaleNOC')).HindiPostSaleNOC;
  MarathiPreSaleNOC = (await import('../components/agreements/client/MarathiPreSaleNOC')).MarathiPreSaleNOC;
  MarathiPostSaleNOC = (await import('../components/agreements/client/MarathiPostSaleNOC')).MarathiPostSaleNOC;
});

beforeEach(() => vi.clearAllMocks());

describe('English NOC files', () => {
  it('EnglishPreSaleNOC renders all key fields from full data', () => {
    const { container } = render(React.createElement(EnglishPreSaleNOC, { data: fullData }));
    const h = container.innerHTML;
    expect(h).toContain('Ramesh Sharma');
    expect(h).toContain('123456789012');
    expect(h).toContain('ABC Project');
    expect(h).toContain('101');
    expect(h).toContain('1500');
    expect(h).toContain('30,00,000');
    expect(h).toContain('Ashray Group');
    expect(h).toContain('Pvt. Ltd.');
    expect(h).toContain('No Objection Certificate');
    expect(h).toContain('END');
  });

  it('EnglishPreSaleNOC shows ________ for empty fields', () => {
    const { container } = render(React.createElement(EnglishPreSaleNOC, { data: emptyData }));
    expect(container.innerHTML).toContain('________');
  });

  it('EnglishPostSaleNOC renders key fields', () => {
    const { container } = render(React.createElement(EnglishPostSaleNOC, { data: fullData }));
    const h = container.innerHTML;
    expect(h).toContain('Ramesh Sharma');
    expect(h).toContain('30,00,000');
    expect(h).toContain('No Objection Certificate');
    expect(h).toContain('Post-Sale');
    expect(h).toContain('END');
  });

  it('EnglishPostSaleNOC shows ________ for missing data', () => {
    const { container } = render(React.createElement(EnglishPostSaleNOC, { data: emptyData }));
    expect(container.innerHTML).toContain('________');
  });
});

describe('Hindi NOC files', () => {
  const e = () => hindiExports;

  it('HindiPreSaleNOC calls convertNameWithTitle', () => {
    render(React.createElement(HindiPreSaleNOC, { data: fullData }));
    expect(e().convertNameWithTitle).toHaveBeenCalled();
  });

  it('HindiPreSaleNOC calls convertToHindi for address/pan/project', () => {
    render(React.createElement(HindiPreSaleNOC, { data: fullData }));
    const calls = e().convertToHindi.mock.calls.map((c: any[]) => String(c[0]));
    expect(calls.some((s: string) => s.includes('Nagpur'))).toBe(true);
    expect(calls).toContain('ABC Project');
  });

  it('HindiPreSaleNOC calls formatAadhaarHindi', () => {
    render(React.createElement(HindiPreSaleNOC, { data: fullData }));
    expect(e().formatAadhaarHindi).toHaveBeenCalledWith('123456789012');
  });

  it('HindiPreSaleNOC calls convertNumberToHindi for age', () => {
    render(React.createElement(HindiPreSaleNOC, { data: fullData }));
    expect(e().convertNumberToHindi).toHaveBeenCalledWith('35');
  });

  it('HindiPreSaleNOC calls convertToHindi for address', () => {
    render(React.createElement(HindiPreSaleNOC, { data: fullData }));
    expect(e().convertToHindi).toHaveBeenCalledWith(expect.stringContaining('Nagpur'));
  });

  it('HindiPreSaleNOC calls convertToHindi for company', () => {
    render(React.createElement(HindiPreSaleNOC, { data: fullData }));
    expect(e().convertToHindi).toHaveBeenCalledWith('Ashray Group');
    expect(e().convertToHindi).toHaveBeenCalledWith('Pvt. Ltd.');
  });

  it('HindiPreSaleNOC calls convertNumberToHindi for phone', () => {
    render(React.createElement(HindiPreSaleNOC, { data: fullData }));
    expect(e().convertNumberToHindi).toHaveBeenCalledWith('8888888888');
  });

  it('HindiPreSaleNOC handles empty data', () => {
    const { container } = render(React.createElement(HindiPreSaleNOC, { data: emptyData }));
    expect(container.innerHTML).toBeTruthy();
  });

  it('HindiPostSaleNOC calls convertNameWithTitle', () => {
    render(React.createElement(HindiPostSaleNOC, { data: fullData }));
    expect(e().convertNameWithTitle).toHaveBeenCalled();
  });

  it('HindiPostSaleNOC calls convertToHindi for property', () => {
    render(React.createElement(HindiPostSaleNOC, { data: fullData }));
    expect(e().convertToHindi).toHaveBeenCalledWith(expect.stringContaining('ABC'));
  });

  it('HindiPostSaleNOC handles empty data', () => {
    const { container } = render(React.createElement(HindiPostSaleNOC, { data: emptyData }));
    expect(container.innerHTML).toBeTruthy();
  });
});

describe('Marathi NOC files', () => {
  const e = () => marathiExports;

  it('MarathiPreSaleNOC calls convertNameWithTitle', () => {
    render(React.createElement(MarathiPreSaleNOC, { data: fullData }));
    expect(e().convertNameWithTitle).toHaveBeenCalled();
  });

  it('MarathiPreSaleNOC calls convertToMarathi for address/project', () => {
    render(React.createElement(MarathiPreSaleNOC, { data: fullData }));
    const calls = e().convertToMarathi.mock.calls.map((c: any[]) => String(c[0]));
    expect(calls.some((s: string) => s.includes('Nagpur'))).toBe(true);
    expect(calls).toContain('ABC Project');
  });

  it('MarathiPreSaleNOC calls formatAadhaarMarathi', () => {
    render(React.createElement(MarathiPreSaleNOC, { data: fullData }));
    expect(e().formatAadhaarMarathi).toHaveBeenCalledWith('123456789012');
  });

  it('MarathiPreSaleNOC calls convertNumberToMarathi for age', () => {
    render(React.createElement(MarathiPreSaleNOC, { data: fullData }));
    expect(e().convertNumberToMarathi).toHaveBeenCalledWith('35');
  });

  it('MarathiPreSaleNOC calls convertToMarathi for company', () => {
    render(React.createElement(MarathiPreSaleNOC, { data: fullData }));
    expect(e().convertToMarathi).toHaveBeenCalledWith('Ashray Group');
    expect(e().convertToMarathi).toHaveBeenCalledWith('Pvt. Ltd.');
  });

  it('MarathiPreSaleNOC handles empty data', () => {
    const { container } = render(React.createElement(MarathiPreSaleNOC, { data: emptyData }));
    expect(container.innerHTML).toBeTruthy();
  });

  it('MarathiPostSaleNOC calls convertNameWithTitle', () => {
    render(React.createElement(MarathiPostSaleNOC, { data: fullData }));
    expect(e().convertNameWithTitle).toHaveBeenCalled();
  });

  it('MarathiPostSaleNOC calls convertNumberToMarathi', () => {
    render(React.createElement(MarathiPostSaleNOC, { data: fullData }));
    expect(e().convertNumberToMarathi).toHaveBeenCalled();
  });

  it('MarathiPostSaleNOC handles empty data', () => {
    const { container } = render(React.createElement(MarathiPostSaleNOC, { data: emptyData }));
    expect(container.innerHTML).toBeTruthy();
  });
});