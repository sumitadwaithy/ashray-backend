import { NagpurLocality, ApprovalAuthority, PlotType, PropertyStatus } from './types';

export const NAGPUR_LOCALITIES: NagpurLocality[] = [
  'Besa', 'Hingna', 'Wardha Road', 'Manish Nagar', 'Mihan', 'Jamtha', 'Godhani', 'Koradi', 'Kamptee Road'
];

export const APPROVAL_AUTHORITIES: ApprovalAuthority[] = [
  'NMRDA', 'NIT', 'RL', 'Gram Panchayat', 'Collector Sanctioned', 'Non Sanctioned [NULL]'
];

export const PLOT_TYPES: PlotType[] = [
  'Residential Plot', 'Commercial', 'Industrial Plot','Agricultural Land', 'Layout', 'Villa', 'Apartment'
];

export const PROPERTY_STATUSES: PropertyStatus[] = [
  'Available', 'Reserved', 'Token Paid', 'Sold', 'Blocked'
];

export const LOCALITY_COORDS: Record<string, { lat: number; lng: number }> = {
  'Besa': { lat: 21.1098, lng: 79.0685 },
  'Hingna': { lat: 21.1070, lng: 78.9910 },
  'Wardha Road': { lat: 21.0543, lng: 79.0417 },
  'Manish Nagar': { lat: 21.1167, lng: 79.0667 },
  'Mihan': { lat: 21.0343, lng: 79.0617 },
  'Jamtha': { lat: 21.0178, lng: 79.0263 },
  'Godhani': { lat: 21.2036, lng: 79.0433 },
  'Koradi': { lat: 21.2333, lng: 79.0833 },
  'Kamptee Road': { lat: 21.1789, lng: 79.1122 },
  'Umred Road': { lat: 21.1120, lng: 79.1230 }
};

export const DEFAULT_COORDS = { lat: 21.1458, lng: 79.0882 }; // Nagpur Center

export const AVAILABLE_AMENITIES = [
  'Internal Roads', 'Street Light', 'Water Line', 'Drainage Line', 'Garden',
  'Children Play Area', 'Jogging Track', 'Security', 'Boundary Wall', 
  'Plantation', 'Electrification', 'Sewage Treatment Plant', 
  'Rain Water Harvesting', 'Temple', 'Gym', 'Club House'
];

export const STAFF_ROLES = [
  'Office Supervisor',
  'Office Computer Operator',
  'Site Supervisor',
  'Driver',
  'Accountant',
  'MTS',
  'Head of Digital Operations',
  'Online Business Manager',
  'Digital Growth Manager'
];
