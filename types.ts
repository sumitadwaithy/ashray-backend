
export enum TransactionType {
  DEBIT = 'DEBIT',
  CREDIT = 'CREDIT'
}

// New Enum to strictly categorize the nature of money
export enum TransactionCategory {
  CAPITAL_INJECTION = 'CAPITAL_INJECTION', // Money added by investor
  INTEREST_ACCRUAL = 'INTEREST_ACCRUAL',   // Profit/Interest added to balance (Non-cash)
  PAYOUT = 'PAYOUT',                       // Money paid back to investor
  GENERAL = 'GENERAL',                     // For clients
  EXPENSE = 'EXPENSE',                     // Business Expenses (Office, Salary, etc.)
  KISSAN_PAYMENT = 'KISSAN_PAYMENT',        // Payments to Farmers
  OPENING = 'OPENING', // Opening Balance Entry
  LOAN = 'LOAN',                            // Loan related transactions
  TRANSFER = 'TRANSFER'                    // Internal Bank Transfer
}

export enum PaymentMethod {
  CASH = 'CASH',
  UPI = 'UPI',
  BANK_TRANSFER = 'BANK_TRANSFER',
  CHEQUE = 'CHEQUE',
  ONLINE = 'ONLINE',
  RTGS = 'RTGS',
  JOURNAL = 'JOURNAL', // For Interest Accruals
  TRANSFER = 'TRANSFER' // Internal Transfer
}

export interface Client {
  id: string;
  clientId?: string;
  title: { en: string; hi: string; mr: string };
  name: { en: string; hi: string; mr: string };
  fatherName?: { en: string; hi: string; mr: string };
  occupation?: { en: string; hi: string; mr: string };
  dob?: string;
  age?: number;
  phone: string;
  email: string;
  address: { en: string; hi: string; mr: string };
  district?: string;
  state?: string;
  pincode?: string;
  aadhaar?: string;
  pan?: string;
  // Personal Details
  gender?: number;
  gstin?: string; // Added Standard Feature
  // System fields
  propertyCount: number;
  openingBalance: number; // Added Standard Feature
  balance: number;
  lastSync?: string;
  // Referral Credentials
  username?: string;
  password?: string;
  // Bank Details
  bankName?: string;
  accountNumber?: string;
  ifscCode?: string;
  totalContractValue?: number;
  emiDuration?: number;
  categoryId?: string;
  folderId?: string;
  folderSerial?: string;
  projectName?: string;
  plotNumber?: string;
  // Referral Data
  investments?: ClientInvestment[];
  payments?: ClientPayment[];
  // =========================
// CLIENT ADDRESS (BUYER)
// =========================
clientAddress?: string;
clientDistrict?: string;
clientState?: string;
clientPincode?: string;

// =========================
// PROJECT ADDRESS (READ ONLY)
// =========================
projectLocality?: string;
projectDistrict?: string;
projectState?: string;

// =========================
// OFFICE ADDRESS (SELLER)
// =========================
officeAddress?: string;
officeDistrict?: string;
officeState?: string;
officePincode?: string;
}

export interface ClientInvestment {
  propertyId: string;
  plotId?: string;
  amount: number;
  purchaseDate: string;
}

export interface ClientPayment {
  id: string;
  date: string;
  amount: number;
  type: 'Credit' | 'Debit';
  description: string;
  paymentMode: string;
  reference: string;
  propertyId?: string;
}

export interface Referral {
  id: string;
  referrerClientId: string;
  refereeName: string;
  refereePhone: string;
  status: 'Pending' | 'Contacted' | 'Converted' | 'Bonus Paid' | 'Rejected';
  bonusAmount: number;
  date: string;
  notes?: string;
}

export interface LandOwner {
  id: string;
  name: string;
  age?: string;
  occupation?: string;
  sharePercentage: number;
  aadhaar: string;
  pan: string;
  bankName: string;
  accountNumber: string;
  ifscCode: string;
  phone: string;
  parentId?: string;
  relation?: string; 
  isCustomRelation?: boolean;
}

export interface Kissan {
  id: string;
  landName: string; // Name of the property/land
  phone: string; // Primary contact
  email: string;
  address: string;
  // Land Details
  village: string;
  mouza: string;
  khasraNumber: string;
  khataNumber?: string;
  patwariCircle?: string;
  areaHectare?: string;
  akarni?: string;
  ratePerAcre?: number;
  registryMaxMonths?: number;
  eastKhasra?: string;
  westKhasra?: string;
  northKhasra?: string;
  southKhasra?: string;
  tehsil: string;
  district: string;
  surveyNumber: string;
  landArea: string; // e.g. "5.5 Acres"
  state?: string;
  pincode?: string;
  totalLandValue: number;
  openingBalance: number;
  balance: number; // Positive = We owe owners, Negative = Owners owe us
  joinDate: string;
  owners: LandOwner[];
  // Administrative fields
  categoryId?: string;
  folderId?: string;
  folderSerial?: string;
  categoryName?: string;
  folderName?: string;
  companyAddressId?: string;
  officeAddress?: string;
  officeLocality?: string;
  officeDistrict?: string;
  officeState?: string;
  officePincode?: string;
  managerId?: string;
  managerName?: string;
  managerPosition?: string;
  managerPhone?: string;
  managerCountryCode?: string;
  managerAddress?: string;
  managerPAN?: string;
  managerAadhaar?: string;
}

export interface Investor {
  id: string;
  title?: string;
  name: string;
  fatherName?: string;
  occupation?: string;
  dob?: string;
  age?: number;
  gender?: string;
  phone: string;
  countryCode?: string;
  email: string;
  address: string; // Registered Address
  district?: string;
  state?: string;
  pincode?: string;
  officeAddress?: string;
  pan?: string;
  aadhaar?: string;
  gsi?: string; // GSI Number
  interestRate?: number; // Annual % Return
  
  // Credentials
  username?: string;
  password?: string;

  // Bank Details
  bankName?: string;
  accountNumber?: string;
  ifscCode?: string;
  
  // Nominee Details
  nomineeName?: string;
  nomineeRelation?: string;
  nominee1Name?: string;
  nominee1Dob?: string;
  nominee1Age?: number;
  nominee1Occupation?: string;
  nominee1Aadhaar?: string;
  nominee2Name?: string;
  nominee2Dob?: string;
  nominee2Age?: number;
  nominee2Occupation?: string;
  nominee2Aadhaar?: string;
  
  // File Manager & Settings
  categoryId?: string;
  folderId?: string;
  folderSerial?: string;
  categoryName?: string;
  folderName?: string;
  companyAddressId?: string;
  officeLocality?: string;
  officeDistrict?: string;
  officeState?: string;
  officePincode?: string;
  managerId?: string;
  managerName?: string;
  managerPosition?: string;
  managerPhone?: string;
  managerCountryCode?: string;
  managerAddress?: string;
  managerPAN?: string;
  managerAadhaar?: string;
  
  // Investment Details
  investedPropertyId?: string; // Links to MasterProperty.id
  investedPropertyName?: string; // Links to MasterProperty.name
  selectedPlotId?: string; // Links to PlotUnit.id
  totalAmount?: number; // Total Deal Amount
  emiDuration?: string;
  
  totalInvested: number; // Principal Only
  totalInterestAccrued: number; // Profit/Interest Added
  totalReturns: number; // Total Cash Paid Out
  
  currentBalance: number; // calculated field
  marketValue?: number; // Estimated current market value based on updates
  status: 'Active' | 'Inactive';
  joinDate: string;
}

export interface InvestorNominee {
  name: string;
  dob: string;
  age: number;
  relation: string;
  aadhaar: string;
}

export interface PropertyMarketUpdate {
  id: string;
  propertyId: string;
  date: string;
  updateType: 'Appreciation' | 'Depreciation' | 'INFRASTRUCTURE' | 'DEMAND_SURGE' | 'ZONING_CHANGE' | 'OTHER';
  description: string;
  valueModifier: number; // Factor (e.g. 1.1 for 10% increase)
  attachments?: string[]; // Base64 or URL
}

export type ApprovalAuthority = 'NMRDA' | 'NIT' | 'RL' | 'Gram Panchayat' | 'Collector Sanctioned'| 'Non Sanctioned [NULL]';
export type PlotType = 'Residential Plot' | 'Commercial' | 'Commercial Plot' | 'Industrial Plot' | 'Agricultural Land' | 'Layout' | 'Villa' | 'Apartment';
export type NagpurLocality = 'Besa' | 'Hingna' | 'Wardha Road' | 'Manish Nagar' | 'Mihan' | 'Jamtha' | 'Godhani' | 'Koradi' | 'Kamptee Road' | 'Umred Road';

export type PropertyStatus =
  | "Available"
  | "Reserved"
  | "Token Paid"
  | "Sold"
  | "Blocked";

export type PlaceType =
  | "School"
  | "Hospital"
  | "Mall"
  | "Airport"
  | "Metro"
  | "Highway"
  | "Station"
  | "Other";

export interface PropertyDocument {
  id: string;
  title: string;
  type: 'pdf' | 'jpg' | 'doc';
  category: 'Legal' | 'Map' | 'Sanction' | 'Other';
  url: string;
  dateUploaded?: string;
}  

export interface Property {

  id: string;

  title: string;

  price: number;

  ratePerSqft?: number;
  currentMarketRate?: number;

  locality: NagpurLocality;

  city?: string;

  type: PlotType;

  approval: ApprovalAuthority;

  plotSize: number;

  dimensions?: string;

  facing?: string;

  description: string;

  images: string[];

  imageAlts: string[];

  amenities: string[];

  status: PropertyStatus;

  dateAdded: string;

  agentId: string;

  coordinates: {
    lat: number;
    lng: number;
  };

  inventory?: PlotUnit[];

  nearbyPlaces?: {
    name: string;
    distance: string;
    type: PlaceType;
  }[];

  documents?: PropertyDocument[];

  featured?: boolean;

  stats?: {
    views: number;
    enquiries: number;
  };

  priceHistory?: {
    price: number;
    date: string;
    note: string;
  }[];

  seo?: {
    slug: string;
    metaTitle: string;
    metaDescription: string;
    canonicalUrl?: string;
    keywords?: string[];
    ogImage?: string;
    schema?: string;
    lastUpdated?: string;
  };

}

export interface PlotUnit {
  id: string;
  plotNumber: string;
  size: number;
  status: PropertyStatus;
  dimensions?: string;
  facing?: string;
  price?: number;
  clientId?: string;
  buyerName?: string;
  buyerPhone?: string;
}

export interface MasterProperty {
  id: string;
  name: string;
  location: string;
  totalUnits: number;
  description?: string;
  generalDocs: Doc[]; // Maps, Plans, Brochures
}

export interface Transaction {
  id: string;
  date: string;
  dueDate?: string; // Added Standard Feature: Payment Due Date
  particulars: string; // Description
  amount: number;
  type: TransactionType;
  category?: TransactionCategory; 
  method: PaymentMethod;
  referenceId: string;
  clientId?: string; 
  investorId?: string; 
  kissanId?: string;
  ownerId?: string; // Specific owner for Kissan transactions
  loanId?: string; // Linked loan
  expenseCategory?: string; // For Expenses (e.g. "Rent", "Salary")
  propertyId?: string;
  bankId?: string; // Linked Bank Profile
  toBankId?: string; // For Transfers: Destination Bank
  linkedTransactionId?: string; // For Transfers: The other side of the transfer
  partyName?: string; // Display name for the party involved
  tags?: string[]; // Salary, Investment, Property Deal, etc.
  isVerified?: boolean; // Reconciliation Mode
  attachments?: string[]; // URLs or Base64 IDs
  balanceAfter: number; // Running balance snapshot
  synced: boolean;
  receiptUrl?: string; // Generated Link
  staffId?: string; 
  partyType?: string; // e.g. 'CLIENT', 'KISSAN', 'INVESTOR', 'LOAN'
  purpose?: string;
  expensePayee?: string;
  agriType?: string;
  partNumber?: string;
  manualPart?: string;
  isSplit?: boolean;
  splitGroup?: string;
  splitPayments?: any[];
}

export interface Staff {
  id: string;
  title?: string;
  name: string;
  fatherName?: string;
  occupation?: string;
  dob?: string;
  age?: number | string;
  gender?: string;
  phone: string;
  countryCode?: string;
  email?: string;
  address?: string;
  district?: string;
  state?: string;
  pincode?: string;
  aadhaar?: string;
  pan?: string;
  username?: string;
  password?: string;
  role: string;
  bankName?: string;
  accountNumber?: string;
  ifscCode?: string;
  salary: number;
  payable?: string;
  annualSalary?: number;
  workingHours?: string;
  placeOfPosting?: string;
  jurisdiction?: string;
  joiningDate: string;
  status: 'ACTIVE' | 'INACTIVE';
  bloodGroup?: string;
  totalSalaryPaid: number;
  lastPaymentDate?: string;
  documents?: StaffDocument[];
  // Administrative fields
  categoryId?: string;
  folderId?: string;
  folderSerial?: string;
  categoryName?: string;
  folderName?: string;
  companyAddressId?: string;
  officeAddress?: string;
  officeLocality?: string;
  officeDistrict?: string;
  officeState?: string;
  officePincode?: string;
  managerId?: string;
  managerName?: string;
  managerPosition?: string;
  managerPhone?: string;
  managerCountryCode?: string;
  managerAddress?: string;
  managerPAN?: string;
  managerAadhaar?: string;
}

export interface StaffDocument {
  id: string;
  name: string;
  type: string;
  fileData: string;
  fileType: string;
  uploadDate: string;
}

export interface Receipt {
  id: string;
  transactionId: string;
  date: string;
  amount: number;
  url: string;
}

export interface PendingReceipt {
  id: string;
  transactionId: string;
  payeeName: string;
  amount: number;
  date: string;
  partyType?: string;
  partyId?: string;
  printed: boolean;
}

export interface Doc {
  id: string;
  name: string;
  date: string;
  size: string;
    type: 'pdf' | 'img' | 'file' | 'virtual';
  synced: boolean;
  category?: 'GENERAL' | 'CLIENT' | 'KISSAN' | 'INVESTOR' | 'LOAN' | 'REPORT'; 
  propertyId?: string; 
  clientId?: string; 
  kissanId?: string; 
  ownerId?: string;    // Linked owner (for Kissan partners) 
  investorId?: string;
  loanId?: string;
  staffId?: string;    // Linked staff
  fileData?: string;
  folderId?: string | number;   // Add this for folder support
  folder_id?: string | number;
  category_id?: string | number;
  is_starred?: boolean | number;
  is_deleted?: boolean | number;
  created_at?: string;
  updated_at?: string;
}

export interface SyncState {
  isOnline: boolean;
  lastSynced: string;
  pendingUploads: number;
  status: 'IDLE' | 'SYNCING' | 'ERROR';
}

export interface OfficeAddress {
  id: string;
  name: string;
  address: string;
}

export interface CompanyAddress {
  id: string;
  name: string;
  addressLine: string;
  locality: string;
  district: string;
  state: string;
  pinCode: string;
}

// =========================
// MANAGER TYPE (NEW)
// =========================
export interface Manager {
  id: string;
  name: string;
  role: string;
  phone?: string;
  countryCode?: string;
  address?: string;
  pan?: string;
  aadhaar?: string;
}

export interface AppSettings {
  companyName: string;
  entityType?: string;
  panNumber?: string;
  licenseRegistrationNumber?: string;
  urcNumber?: string;
  tanNumber?: string;
  companyGST?: string;
  gstNumbers?: GSTEntry[];
  companyEmail?: string;
  companyWebsite?: string;
  autoSync: boolean;
  // Manager Profile
  managerPosition?: string;
  managerAddress?: string;
  managerPAN?: string;
  managerAadhaar?: string;
  managerPhone?: string;
  managerCountryCode?: string;

  // Managers
  managers?: Manager[];

  // Communication Settings
  whatsappNumber: string; // The business sending number
  enableAutoSend: boolean;
  paymentMessageTemplate: string; // e.g. "Dear {name}, received {amount}..."
  companyAddresses?: OfficeAddress[]; // Renamed from companyAddress and changed to array
  
  // Login Credentials (for offline mode)
  adminId?: string;
  adminPassword?: string;
  registeredPhone?: string;
  backendUrl?: string;
  
  // Backup Settings
  backupCycleStartYear?: number;
  lastBackupDate?: string;
  backupReminderSnoozeUntil?: string; // ISO string

   // Financial Year Settings
  financialYearStart?: string; // YYYY-MM-DD
  financialYearEnd?: string;   // YYYY-MM-DD
  companyLogo?: string;        // Base64
  companyWatermark?: string; 
}

export interface GSTEntry {
  id: string;
  date: string;
  billNumber: string;
  partyName: string;
  gstin: string;
  itemDescription: string;
  taxableValue: number;
  gstRate: number; // e.g. 5, 12, 18, 28
  cgst: number;
  sgst: number;
  igst: number;
  totalAmount: number;
  type: 'INWARD' | 'OUTWARD'; // Purchase or Sale
}

export interface LoanDocument {
  id: string;
  name: string;
  type: string; // 'Aadhaar' | 'PAN' | 'Electric Bill' | 'Other'
  fileData: string; // Base64
  fileType: string; // mime type
  uploadDate: string;
}

export enum BankAccountType {
  SAVINGS = 'Savings',
  CURRENT = 'Current',
  SALARY = 'Salary Account',
  RD = 'Recurring Deposit (RD) Account',
  FD = 'Fixed Deposit (FD) Account',
  CASH = 'Cash',
  UPI = 'UPI',
  CREDIT = 'Credit'
}

export interface BankProfile {
  id: string;
  bankName: string;
  branch?: string;
  accountHolderName: string;
  accountNumber: string;
  ifsc: string;
  openingBalance: number;
  accountType: BankAccountType;
  colorTag: string;
  createdAt: string;
  isDefault?: boolean;
}

export interface BorrowerReview {
  score: number; // 0-100
  status: 'EXCELLENT' | 'GOOD' | 'AVERAGE' | 'RISKY' | 'DEFAULTED';
  summary: string;
  insights: string[];
  lastUpdated: string;
}

export enum LoanType {
  GIVEN = 'GIVEN', // Lending to others (Asset)
  TAKEN = 'TAKEN'  // Borrowing from others (Liability)
}

export interface Loan {
  id: string;
  loanType: LoanType;
  title?: string;
  borrowerName: string; // This will be Lender Name if LoanType is TAKEN
  fatherHusbandName?: string;
  occupation?: string;
  dob?: string;
  age?: number;
  aadhaar?: string;
  pan?: string;
  bankName?: string;
  accountNumber?: string;
  ifscCode?: string;
  phone: string;
  email?: string;
  address?: string;
  principalAmount: number;
  interestRate: number; // Annual %
  interestType: 'SIMPLE' | 'COMPOUND';
  startDate: string;
  durationMonths: number;
  monthlyEMI?: number;
  status: 'ACTIVE' | 'CLOSED' | 'DEFAULTED';
  collateral?: string;
  purpose?: string;
  collateralType?: string;
  collateralValue?: number;
  collateralDetails?: string;
  guarantors?: Guarantor[];
  notes?: string;
  totalPaid: number;
  remainingPrincipal: number;
  totalInterestPaid: number;
  lastPaymentDate?: string;
  nextPaymentDate?: string;
  loanAccountNumber?: string;
  sanctionDate?: string;
  sanctionAmount?: number;
  documents?: LoanDocument[];
  // Administrative fields
  categoryId?: string;
  folderId?: string;
  folderSerial?: string;
  categoryName?: string;
  folderName?: string;
  companyAddressId?: string;
  officeAddress?: string;
  officeLocality?: string;
  officeDistrict?: string;
  officeState?: string;
  officePincode?: string;
  managerId?: string;
  managerName?: string;
  managerPosition?: string;
  managerPhone?: string;
  managerCountryCode?: string;
  managerAddress?: string;
  managerPAN?: string;
  managerAadhaar?: string;
}

export interface Guarantor {
  id: string;
  name: string;
  phone: string;
  relation: string;
  address?: string;
  aadhaar?: string;
  pan?: string;
}

export interface Folder {
  id: string | number;
  name: string;
  parentId?: string | number;
  parent_id?: string | number;
  category_id?: string | number;
  is_starred?: boolean | number;
  is_deleted?: boolean | number;
  is_locked?: boolean | number;
  icon?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Category {
  id: number;
  name: string;
  color?: string;
  icon?: string;
  created_at?: string;
  updated_at?: string;
  is_deleted?: boolean | number; 
}

export interface InstallationState {
  mode: 'Independent' | 'Master' | 'Client' | 'CloudRelay';
  ledgerId: string;
  machineId: string;
  syncCode: string;
  serverUrl: string;
  isInitialized: boolean;
}

export interface MachineRegistration {
  machineId: string;
  name: string;
  deviceType: string;
  lastSync: string;
  status: string;
}