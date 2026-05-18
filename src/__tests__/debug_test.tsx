import { it } from 'vitest';
import { render } from '@testing-library/react';
import React from 'react';
import './mocks';
import { hindiExports } from './mocks';

const fullData = {
  client: {
    title: 'Mr', name: 'Ramesh Sharma', age: '35', gender: 'Male',
    occupation: 'Engineer', phone: '9876543210', aadhaar: '123456789012',
    pan: 'ABCDE1234F', address: '123 Main Street', locality: 'Sadar',
    district: 'Nagpur', state: 'Maharashtra', pincode: '440001',
    folderSerial: 'F001', clientId: 'C001',
  },
  property: {
    projectName: 'ABC Project', locality: 'Mouza', tehsil: 'Tehsil',
    district: 'Nagpur', state: 'Maharashtra', pincode: '440001',
    khasraNumber: '123', plotNumber: '101', area: '1500', rate: '2000',
    totalAmount: '3000000', tokenAmount: '500000',
    bookingDate: '2025-01-15', paymentMode: 'Cash',
  },
  company: {
    companyName: 'Ashray Group', entityType: 'Pvt. Ltd.',
    companyEmail: 'info@ashray.com', companyWebsite: 'www.ashray.com',
    licenseRegistrationNumber: 'LIC001', managerPhone: '8888888888',
    companyAddress: '456 Office Road',
  },
  manager: { managerPhone: '8888888888' },
};

it('debug', async () => {
  const { HindiPreSaleNOC } = await import('../components/agreements/client/HindiPreSaleNOC');
  render(React.createElement(HindiPreSaleNOC, { data: fullData }));
  console.log('ALL convertToHindi calls:', JSON.stringify(hindiExports.convertToHindi.mock.calls));
  console.log('ALL convertNumberToHindi calls:', JSON.stringify(hindiExports.convertNumberToHindi.mock.calls));
  console.log('ALL convertNameWithTitle calls:', JSON.stringify(hindiExports.convertNameWithTitle.mock.calls));
});
