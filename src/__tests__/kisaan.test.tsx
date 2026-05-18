import { describe, it, expect, vi, beforeEach, beforeAll } from 'vitest';
import { render } from '@testing-library/react';
import React from 'react';
import './mocks';
import { hindiExports, marathiExports } from './mocks';

const fullData = {
  agreementDate: '2026-01-15',
  agreementDay: { en: 'Monday', hi: 'सोमवार', mr: 'सोमवार' },
  buyer: {
    salutation: 'Mr', name: 'Ramesh Sharma', age: '35',
    occupation: 'Engineer', aadhaar: '123456789012', pan: 'ABCDE1234F',
    phone: '9876543210', address: '123 Main Street', locality: 'Sadar',
    district: 'Nagpur', state: 'Maharashtra', pincode: '440001',
  },
  sellers: [{
    salutation: 'Mr', name: 'Suresh Yadav', age: '50',
    occupation: 'Farmer', aadhaar: '555566667777', pan: 'XYZPD5678K',
    phone: '8888888888',
  }],
  sellersCommonAddress: '456 Village Road',
  land: {
    landName: 'Kheti Zameen', mauza: 'Mouza Village',
    phHalkaNo: 'PH123', khataNo: 'KT456', khasraNo: 'KS789',
    areaHectare: '2.50', akarni: '0.50',
    tehsil: 'Tehsil', district: 'Nagpur', state: 'Maharashtra', pincode: '440001',
    eastKhasra: 'E1', westKhasra: 'W1', northKhasra: 'N1', southKhasra: 'S1',
    areaSqMt: '2500', totalArea: '2.50',
  },
  totalAmount: 5000000,
  totalAmountWords: 'Fifty Lakh Only',
  ratePerAcre: 2000000,
  ratePerAcreWords: 'Twenty Lakh Only',
  paidTotal: 3000000,
  paidTotalWords: 'Thirty Lakh Only',
  paidUptoDate: '2026-01-15',
  payments: [{
    amount: 3000000, amountWords: 'Thirty Lakh Only',
    mode: 'Cash' as const, date: '2026-01-15', receivedBy: 'Suresh Yadav',
  }],
  remainingAmount: 2000000,
  remainingAmountWords: 'Twenty Lakh Only',
  registryMaxMonths: 6,
  scheduledPayments: [{
    label: 'July 2026', perSellerAmount: 2000000, sellerCount: 1, totalAmount: 2000000,
  }],
  accountHolderName: 'Ramesh Sharma',
  companyName: 'Ashray Group',
  accountNo: '1234567890',
  bank: 'HDFC',
  branch: 'Nagpur Branch',
  tokenLetterDate: '15/01/2026',
  kissanId: 'K001',
  folderSerial: 'F001',
  company: {
    companyName: 'Ashray Group', entityType: 'Pvt. Ltd.',
    companyEmail: 'info@ashray.com', companyWebsite: 'www.ashray.com',
    licenseRegistrationNumber: 'LIC001', managerPhone: '8888888888',
    companyAddress: '456 Office Road', companyDistrict: 'Nagpur',
    companyState: 'Maharashtra', companyPincode: '440002',
  },
  manager: {
    managerName: 'Vikrant Rana', managerPosition: 'Admin Head',
    managerPhone: '8888888888', managerCountryCode: '+91',
  },
};

const emptyData = {
  agreementDate: '', buyer: {}, sellers: [], sellersCommonAddress: '',
  land: {}, payments: [], scheduledPayments: [], company: {}, manager: {},
};

let EnglishKisaan: any, HindiKisaan: any, MarathiKisaan: any;

beforeAll(async () => {
  EnglishKisaan = (await import('../components/agreements/kisaan/EnglishKhetiZameenAgreement')).default;
  HindiKisaan = (await import('../components/agreements/kisaan/HindiKhetiZameenAgreement')).default;
  MarathiKisaan = (await import('../components/agreements/kisaan/MarathiKhetiZameenAgreement')).default;
});

beforeEach(() => vi.clearAllMocks());

describe('English Kisaan KhetiZameenAgreement', () => {
  it('renders buyer fields from AddKisaan data', () => {
    const { container } = render(React.createElement(EnglishKisaan, { data: fullData }));
    const h = container.innerHTML;
    expect(h).toContain('Ramesh Sharma');
    expect(h).toContain('123456789012');
    expect(h).toContain('ABCDE1234F');
  });

  it('renders seller fields', () => {
    const { container } = render(React.createElement(EnglishKisaan, { data: fullData }));
    const h = container.innerHTML;
    expect(h).toContain('Suresh Yadav');
    expect(h).toContain('555566667777');
  });

  it('renders land/property fields', () => {
    const { container } = render(React.createElement(EnglishKisaan, { data: fullData }));
    const h = container.innerHTML;
    expect(h).toContain('KS789');
    expect(h).toContain('PH123');
    expect(h).toContain('KT456');
    expect(h).toContain('Tehsil');
    expect(h).toContain('2.50');
  });

  it('renders company fields', () => {
    const { container } = render(React.createElement(EnglishKisaan, { data: fullData }));
    const h = container.innerHTML;
    expect(h).toContain('Ashray Group');
    expect(h).toContain('LIC001');
  });

  it('renders financial fields from AddKisaan', () => {
    const { container } = render(React.createElement(EnglishKisaan, { data: fullData }));
    const h = container.innerHTML;
    expect(h).toContain('50,00,000');
    expect(h).toContain('30,00,000');
    expect(h).toContain('20,00,000');
  });

  it('renders payment entry details', () => {
    const { container } = render(React.createElement(EnglishKisaan, { data: fullData }));
    const h = container.innerHTML;
    expect(h).toContain('Cash');
    expect(h).toContain('Suresh Yadav');
  });

  it('renders PrintFooter', () => {
    const { container } = render(React.createElement(EnglishKisaan, { data: fullData }));
    expect(container.innerHTML).toBeTruthy();
  });

  it('handles empty data gracefully', () => {
    const { container } = render(React.createElement(EnglishKisaan, { data: emptyData }));
    expect(container.innerHTML).toBeTruthy();
  });
});

describe('Hindi Kisaan KhetiZameenAgreement', () => {
  it('calls convertNameWithTitle for buyer', () => {
    render(React.createElement(HindiKisaan, { data: fullData }));
    expect(hindiExports.convertNameWithTitle).toHaveBeenCalled();
  });

  it('calls convertNameWithTitle for buyer', () => {
    render(React.createElement(HindiKisaan, { data: fullData }));
    expect(hindiExports.convertNameWithTitle).toHaveBeenCalled();
  });

  it('calls formatAadhaarHindi', () => {
    render(React.createElement(HindiKisaan, { data: fullData }));
    expect(hindiExports.formatAadhaarHindi).toHaveBeenCalled();
  });

  it('calls convertToHindi for company name', () => {
    render(React.createElement(HindiKisaan, { data: fullData }));
    expect(hindiExports.convertToHindi).toHaveBeenCalledWith('Ashray Group');
  });

  it('calls convertToHindi for text fields', () => {
    render(React.createElement(HindiKisaan, { data: fullData }));
    expect(hindiExports.convertToHindi).toHaveBeenCalledWith('Tehsil');
    expect(hindiExports.convertToHindi).toHaveBeenCalledWith('Nagpur');
    expect(hindiExports.convertToHindi).toHaveBeenCalledWith('Maharashtra');
    expect(hindiExports.convertToHindi).toHaveBeenCalledWith('Farmer');
  });

  it('calls convertNumberToHindi for numbers', () => {
    render(React.createElement(HindiKisaan, { data: fullData }));
    expect(hindiExports.convertNumberToHindi).toHaveBeenCalledWith('KS789');
    expect(hindiExports.convertNumberToHindi).toHaveBeenCalledWith('KT456');
    expect(hindiExports.convertNumberToHindi).toHaveBeenCalledWith('2.50');
  });

  it('handles empty data', () => {
    const { container } = render(React.createElement(HindiKisaan, { data: emptyData }));
    expect(container.innerHTML).toBeTruthy();
  });
});

describe('Marathi Kisaan KhetiZameenAgreement', () => {
  it('calls convertNameWithTitle for buyer', () => {
    render(React.createElement(MarathiKisaan, { data: fullData }));
    expect(marathiExports.convertNameWithTitle).toHaveBeenCalled();
  });

  it('calls convertNameWithTitle for buyer', () => {
    render(React.createElement(MarathiKisaan, { data: fullData }));
    expect(marathiExports.convertNameWithTitle).toHaveBeenCalled();
  });

  it('calls formatAadhaarMarathi', () => {
    render(React.createElement(MarathiKisaan, { data: fullData }));
    expect(marathiExports.formatAadhaarMarathi).toHaveBeenCalled();
  });

  it('calls convertToMarathi for company name', () => {
    render(React.createElement(MarathiKisaan, { data: fullData }));
    expect(marathiExports.convertToMarathi).toHaveBeenCalledWith('Ashray Group');
  });

  it('calls convertToMarathi for text fields', () => {
    render(React.createElement(MarathiKisaan, { data: fullData }));
    expect(marathiExports.convertToMarathi).toHaveBeenCalledWith('Tehsil');
    expect(marathiExports.convertToMarathi).toHaveBeenCalledWith('Nagpur');
    expect(marathiExports.convertToMarathi).toHaveBeenCalledWith('Maharashtra');
    expect(marathiExports.convertToMarathi).toHaveBeenCalledWith('Farmer');
  });

  it('calls convertNumberToMarathi for numbers', () => {
    render(React.createElement(MarathiKisaan, { data: fullData }));
    expect(marathiExports.convertNumberToMarathi).toHaveBeenCalledWith('KS789');
    expect(marathiExports.convertNumberToMarathi).toHaveBeenCalledWith('KT456');
    expect(marathiExports.convertNumberToMarathi).toHaveBeenCalledWith('2.50');
  });

  it('handles empty data', () => {
    const { container } = render(React.createElement(MarathiKisaan, { data: emptyData }));
    expect(container.innerHTML).toBeTruthy();
  });
});