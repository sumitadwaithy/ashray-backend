
import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { ArrowLeft, Save, Landmark, User, Phone, CreditCard, Calendar, Clock, FileText, CheckCircle, Briefcase, Fingerprint, Languages, Eye, X, Printer, Upload, Trash2, File, ArrowUpRight, Shield, FileCheck, Globe } from 'lucide-react';
import { dbService } from '../services/db';
import { Loan, Transaction, TransactionType, TransactionCategory, PaymentMethod, LoanDocument, Doc, LoanType, Category, Folder, CompanyAddress, Manager } from '../types';
import { useLanguage } from '../services/i18n';
import { AgreementPreview } from '../components/AgreementTemplates';

const PURPOSE_RATES: Record<string, number> = {
  'PERSONAL': 12,
  'BUSINESS': 14,
  'PROPERTY': 10,
  'VEHICLE': 9,
  'EDUCATION': 8,
  'GOLD': 7,
  'OTHER': 12
};

export const AddLendingLoan: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useLanguage();
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingLoanId, setEditingLoanId] = useState<string | null>(null);
  const [clients, setClients] = useState<any[]>([]);
  const [farmers, setFarmers] = useState<any[]>([]);
  const [investors, setInvestors] = useState<any[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [officeAddresses, setOfficeAddresses] = useState<CompanyAddress[]>([]);
  const [managers, setManagers] = useState<Manager[]>([]);
  const [previewId, setPreviewId] = useState('');

  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedFolder, setSelectedFolder] = useState('');
  const [previewType, setPreviewType] = useState<'loan_agreement' | 'token' | null>(null);
  const [selectedLang, setSelectedLang] = useState<'english' | 'hindi' | 'marathi' | null>(null);
  const [companySettings, setCompanySettings] = useState<any>(null);
  const [borrowerType, setBorrowerType] = useState<'NEW' | 'CLIENT' | 'KISSAN' | 'INVESTOR'>('NEW');
  const [selectedBorrowerId, setSelectedBorrowerId] = useState('');

  const [formData, setFormData] = useState({
    loanType: LoanType.GIVEN,
    borrowerName: '',
    fatherHusbandName: '',
    occupation: '',
    dob: '',
    age: 0,
    aadhaar: '',
    pan: '',
    bankName: '',
    accountNumber: '',
    ifscCode: '',
    phone: '',
    email: '',
    address: '',
    principalAmount: '',
    interestRate: '12',
    interestType: 'SIMPLE' as 'SIMPLE' | 'COMPOUND',
    startDate: new Date().toISOString().split('T')[0],
    durationMonths: '12',
    collateral: '',
    purpose: 'PERSONAL',
    notes: '',
    method: PaymentMethod.BANK_TRANSFER,
    loanAccountNumber: '',
    sanctionDate: new Date().toISOString().split('T')[0],
    sanctionAmount: '',
    documents: [] as LoanDocument[],
    // Administrative fields
    categoryId: '',
    categoryName: '',
    folderId: '',
    folderName: '',
    companyAddressId: '',
    officeAddress: '',
    officeDistrict: '',
    officeState: '',
    officePincode: '',
    officeLocality: '',
    managerId: '',
    managerName: '',
    managerPosition: '',
    managerPhone: '',
    managerCountryCode: '',
    managerAddress: '',
    managerPAN: '',
    managerAadhaar: '',
    title: 'Mr.',
    monthlyEMI: 0,
    guarantors: [
      { id: 'G1', name: '', phone: '', relation: '', address: '', aadhaar: '', pan: '' },
      { id: 'G2', name: '', phone: '', relation: '', address: '', aadhaar: '', pan: '' }
    ],
    collateralType: 'NON_COLLATERAL',
    collateralValue: '',
    collateralDetails: '',
    loanId: ''
  });

  const calculateEMI = (p: number, r: number, n: number, type: 'SIMPLE' | 'COMPOUND') => {
    if (!p || !r || !n) return 0;
    
    // Monthly rate
    const monthlyRate = r / (12 * 100);
    
    if (type === 'COMPOUND') {
      const emi = (p * monthlyRate * Math.pow(1 + monthlyRate, n)) / (Math.pow(1 + monthlyRate, n) - 1);
      return Math.round(emi);
    } else {
      // Simple Interest: (P + (P * R * T)) / N
      const totalInterest = (p * (r / 100) * (n / 12));
      const emi = (p + totalInterest) / n;
      return Math.round(emi);
    }
  };

  useEffect(() => {
    const emi = calculateEMI(
      Number(formData.principalAmount), 
      Number(formData.interestRate), 
      Number(formData.durationMonths), 
      formData.interestType
    );
    setFormData(prev => ({ ...prev, monthlyEMI: emi }));
  }, [formData.principalAmount, formData.interestRate, formData.durationMonths, formData.interestType]);

  useEffect(() => {
    const fetchData = async () => {
      const [c, k, i, cats, fols, settings] = await Promise.all([
        dbService.getClients(),
        dbService.getKissans(),
        dbService.getInvestors(),
        dbService.getCategories(),
        dbService.getFolders(),
        dbService.getSettings()
      ]);
      setClients(c);
      setFarmers(k);
      setInvestors(i);
      setCategories(cats);
      setFolders(fols);
      setCompanySettings(settings);
      setOfficeAddresses(settings.companyAddresses || []);
      setManagers(settings.managers || []);
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (!isEditMode && !formData.loanId) {
      dbService.peekId('LID', formData.startDate).then(id => {
        setPreviewId(id);
      });
    }
  }, [isEditMode, formData.startDate, formData.loanId]);

  useEffect(() => {
    if (borrowerType === 'NEW') return;

    let party: any;
    if (borrowerType === 'CLIENT') party = clients.find(c => c.id === selectedBorrowerId);
    else if (borrowerType === 'KISSAN') {
      for (const k of farmers) {
        const owner = (k.owners || []).find((o: any) => o.id === selectedBorrowerId);
        if (owner) {
          party = { ...owner, address: k.village + ', ' + k.district, occupation: 'Farmer' };
          break;
        }
      }
    }
    else if (borrowerType === 'INVESTOR') party = investors.find(i => i.id === selectedBorrowerId);

    if (party) {
      setFormData(prev => ({
        ...prev,
        borrowerName: party.name,
        fatherHusbandName: party.fatherName || party.fatherHusbandName || '',
        occupation: party.occupation || '',
        dob: party.dob || '',
        age: party.age || calculateAge(party.dob) || 0,
        aadhaar: party.aadhaar || '',
        pan: party.pan || '',
        bankName: party.bankName || '',
        accountNumber: party.accountNumber || '',
        ifscCode: party.ifscCode || '',
        phone: party.phone || '',
        email: party.email || '',
        address: party.address || ''
      }));
    }
  }, [selectedBorrowerId, borrowerType, clients, farmers, investors]);

  useEffect(() => {
    const editId = location.state?.loanId;
    const borrowerData = location.state?.borrowerData;

    if (editId) {
      const loadLoan = async () => {
        const loan = await dbService.getLoanById(editId);
        if (loan) {
          setIsEditMode(true);
          setEditingLoanId(editId);
          setFormData({
            loanType: LoanType.GIVEN,
            borrowerName: loan.borrowerName,
            fatherHusbandName: loan.fatherHusbandName || '',
            occupation: loan.occupation || '',
            dob: loan.dob || '',
            age: loan.age || 0,
            aadhaar: loan.aadhaar || '',
            pan: loan.pan || '',
            bankName: loan.bankName || '',
            accountNumber: loan.accountNumber || '',
            ifscCode: loan.ifscCode || '',
            phone: loan.phone,
            email: loan.email || '',
            address: loan.address || '',
            principalAmount: loan.principalAmount.toString(),
            interestRate: loan.interestRate.toString(),
            interestType: loan.interestType,
            startDate: loan.startDate,
            durationMonths: loan.durationMonths.toString(),
            collateral: loan.collateral || '',
            purpose: loan.purpose || 'PERSONAL',
            notes: loan.notes || '',
            method: PaymentMethod.BANK_TRANSFER,
            loanAccountNumber: loan.loanAccountNumber || '',
            sanctionDate: loan.sanctionDate || loan.startDate,
            sanctionAmount: loan.sanctionAmount?.toString() || loan.principalAmount.toString(),
            documents: loan.documents || [],
            categoryId: loan.categoryId || '',
            categoryName: loan.categoryName || '',
            folderId: loan.folderId || '',
            folderName: loan.folderName || '',
            companyAddressId: loan.companyAddressId || '',
            officeAddress: loan.officeAddress || '',
            officeLocality: loan.officeLocality || '',
            officeDistrict: loan.officeDistrict || '',
            officeState: loan.officeState || '',
            officePincode: loan.officePincode || '',
            managerId: loan.managerId || '',
            managerName: loan.managerName || '',
            managerPosition: loan.managerPosition || '',
            managerPhone: loan.managerPhone || '',
            managerCountryCode: loan.managerCountryCode || '',
            managerAddress: loan.managerAddress || '',
            managerPAN: loan.managerPAN || '',
            managerAadhaar: loan.managerAadhaar || '',
            title: loan.title || 'Mr.',
            monthlyEMI: loan.monthlyEMI || 0,
            guarantors: loan.guarantors || [
              { id: 'G1', name: '', phone: '', relation: '', address: '', aadhaar: '', pan: '' },
              { id: 'G2', name: '', phone: '', relation: '', address: '', aadhaar: '', pan: '' }
            ],
            collateralType: loan.collateralType || 'NON_COLLATERAL',
            collateralValue: loan.collateralValue?.toString() || '',
            collateralDetails: loan.collateralDetails || ''
          });
          setSelectedCategory(loan.categoryId || '');
          setSelectedFolder(loan.folderId || '');
        }
      };
      loadLoan();
    } else if (borrowerData) {
      setFormData(prev => ({
        ...prev,
        borrowerName: borrowerData.borrowerName,
        fatherHusbandName: borrowerData.fatherHusbandName || '',
        occupation: borrowerData.occupation || '',
        dob: borrowerData.dob || '',
        age: borrowerData.age || 0,
        aadhaar: borrowerData.aadhaar || '',
        pan: borrowerData.pan || '',
        bankName: borrowerData.bankName || '',
        accountNumber: borrowerData.accountNumber || '',
        ifscCode: borrowerData.ifscCode || '',
        phone: borrowerData.phone,
        email: borrowerData.email || '',
        address: borrowerData.address || '',
        principalAmount: '',
        interestRate: '12',
        interestType: 'SIMPLE',
        startDate: new Date().toISOString().split('T')[0],
        durationMonths: '12',
        documents: borrowerData.documents || [],
        categoryId: borrowerData.categoryId || '',
        categoryName: borrowerData.categoryName || '',
        folderId: borrowerData.folderId || '',
        folderName: borrowerData.folderName || ''
      }));
      setSelectedCategory(borrowerData.categoryId || '');
      setSelectedFolder(borrowerData.folderId || '');
    }
  }, [location.state]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, type: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      const newDoc: LoanDocument = {
        id: 'DOC' + Date.now() + Math.random().toString(36).substr(2, 9),
        name: file.name,
        type: type,
        fileData: base64String,
        fileType: file.type,
        uploadDate: new Date().toISOString()
      };
      setFormData(prev => ({ ...prev, documents: [...prev.documents, newDoc] }));
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const removeDocument = (id: string) => {
    setFormData(prev => ({ ...prev, documents: prev.documents.filter(doc => doc.id !== id) }));
  };

  const handlePurposeChange = (purpose: string) => {
    setFormData({ ...formData, purpose, interestRate: PURPOSE_RATES[purpose]?.toString() || formData.interestRate });
  };

  const calculateAge = (dob: string) => {
    if (!dob) return 0;
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
    return age;
  };

  const handleDobChange = (dob: string) => {
    const age = calculateAge(dob);
    setFormData({ ...formData, dob, age });
  };

  const handleGenerateClick = (type: 'loan_agreement' | 'token') => {
    setPreviewType(type);
    setSelectedLang(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    const loanId = isEditMode && editingLoanId ? editingLoanId : (formData.loanId || await dbService.generateId('LID', formData.startDate));
    const principal = Number(formData.principalAmount);

    let existingLoan: Loan | undefined;
    if (isEditMode && editingLoanId) existingLoan = await dbService.getLoanById(editingLoanId);

    const newLoan: Loan = {
      id: loanId,
      loanType: LoanType.GIVEN,
      borrowerName: formData.borrowerName,
      fatherHusbandName: formData.fatherHusbandName,
      occupation: formData.occupation,
      dob: formData.dob,
      age: formData.age,
      aadhaar: formData.aadhaar,
      pan: formData.pan,
      bankName: formData.bankName,
      accountNumber: formData.accountNumber,
      ifscCode: formData.ifscCode,
      phone: formData.phone,
      email: formData.email,
      address: formData.address,
      principalAmount: principal,
      interestRate: Number(formData.interestRate),
      interestType: formData.interestType,
      startDate: formData.startDate,
      durationMonths: Number(formData.durationMonths),
      status: existingLoan?.status || 'ACTIVE',
      collateral: formData.collateral,
      purpose: formData.purpose,
      notes: formData.notes,
      totalPaid: existingLoan?.totalPaid || 0,
      remainingPrincipal: isEditMode ? (existingLoan?.remainingPrincipal || principal) : principal,
      totalInterestPaid: existingLoan?.totalInterestPaid || 0,
      loanAccountNumber: formData.loanAccountNumber,
      sanctionDate: formData.sanctionDate,
      sanctionAmount: Number(formData.sanctionAmount) || principal,
      documents: formData.documents,
      title: formData.title,
      monthlyEMI: formData.monthlyEMI,
      guarantors: formData.guarantors,
      collateralType: formData.collateralType,
      collateralValue: Number(formData.collateralValue) || 0,
      collateralDetails: formData.collateralDetails,
      categoryId: formData.categoryId,
      categoryName: formData.categoryName,
      folderId: formData.folderId,
      folderSerial: formData.folderSerial,
      folderName: formData.folderName,
      companyAddressId: formData.companyAddressId,
      officeAddress: formData.officeAddress,
      officeLocality: formData.officeLocality,
      officeDistrict: formData.officeDistrict,
      officeState: formData.officeState,
      officePincode: formData.officePincode,
      managerId: formData.managerId,
      managerName: formData.managerName,
      managerPosition: formData.managerPosition,
      managerPhone: formData.managerPhone,
      managerCountryCode: formData.managerCountryCode,
      managerAddress: formData.managerAddress,
      managerPAN: formData.managerPAN,
      managerAadhaar: formData.managerAadhaar
    };

    if (!isEditMode) {
      const disbursementTx: Transaction = {
        id: 'TX' + Date.now(),
        date: formData.startDate,
        particulars: `Loan Disbursement - ${formData.borrowerName}`,
        amount: principal,
        type: TransactionType.DEBIT,
        category: TransactionCategory.LOAN,
        method: formData.method,
        referenceId: 'LOAN-DISB-' + Math.floor(Math.random() * 1000),
        loanId: loanId,
        balanceAfter: 0,
        synced: false
      };
      await dbService.saveTransaction(disbursementTx);
    }

    await dbService.saveLoan(newLoan);

    if (formData.documents && formData.documents.length > 0) {
      for (const doc of formData.documents) {
        const centralDoc: Doc = {
                  id: doc.id,
                   name: doc.name, date: doc.uploadDate.split('T')[0], size: 'N/A', type: doc.fileType.includes('pdf') ? 'pdf' : 'img', synced: false, category: 'LOAN', loanId: loanId, created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
                };
                await dbService.saveDoc(centralDoc);
              }
            }

    setTimeout(() => {
      setIsProcessing(false);
      setShowSuccess(true);
    }, 800);
  };

  if (showSuccess) {
    return (
      <div className="max-w-md mx-auto mt-20 bg-white p-8 rounded-2xl shadow-xl border border-slate-100 text-center space-y-6 animate-in zoom-in-95 duration-300">
        <div className="flex justify-center">
          <div className="p-4 rounded-full bg-green-100 text-green-600">
            <CheckCircle size={48} />
          </div>
        </div>
        <div>
          <h2 className="text-2xl font-bold text-slate-800">{isEditMode ? 'Loan Updated Successfully!' : 'Loan Created Successfully!'}</h2>
          <p className="text-slate-500 mt-2">
            {isEditMode 
              ? 'The loan profile has been updated.' 
              : 'The loan has been registered and the disbursement transaction has been recorded.'}
          </p>
        </div>
        <div className="flex flex-col gap-2">
          <button onClick={() => navigate('/loan-ledger')} className="w-full bg-brand-600 text-white py-3 rounded-xl font-bold shadow-lg shadow-brand-200">Go to Loan Ledger</button>
          {!isEditMode && <button onClick={() => setShowSuccess(false)} className="w-full bg-slate-100 text-slate-700 py-3 rounded-xl font-medium">Add Another Loan</button>}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto pb-20">
      <div className="flex items-center mb-6">
        <Link to="/loan-ledger" className="p-2 mr-2 hover:bg-slate-200 rounded-full transition-colors">
          <ArrowLeft size={20} className="text-slate-600" />
        </Link>
        <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
          {isEditMode ? 'Edit Lending Loan' : 'Register New Lending Loan (Loan Given)'}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        {!isEditMode && (
          <div className="p-6 border-b border-slate-100 bg-brand-50/30">
            <label className="block text-xs font-bold text-slate-500 uppercase mb-3">Select Borrower Source</label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {[
                { id: 'NEW', label: 'New Borrower' },
                { id: 'CLIENT', label: 'Existing Client' },
                { id: 'KISSAN', label: 'Kissan (Owner)' },
                { id: 'INVESTOR', label: 'Partner' },
              ].map((bt) => (
                <button
                  key={bt.id}
                  type="button"
                  onClick={() => {
                    setBorrowerType(bt.id as any);
                    setSelectedBorrowerId('');
                    if (bt.id === 'NEW') {
                      setFormData(prev => ({
                        ...prev,
                        borrowerName: '', fatherHusbandName: '', occupation: '', dob: '', age: 0, aadhaar: '', pan: '', bankName: '', accountNumber: '', ifscCode: '', phone: '', email: '', address: ''
                      }));
                    }
                  }}
                  className={`py-2.5 rounded-xl text-xs font-bold border transition-all ${
                    borrowerType === bt.id
                      ? 'bg-brand-600 border-brand-600 text-white shadow-md'
                      : 'bg-white border-slate-200 text-slate-600 hover:border-brand-300'
                  }`}
                >
                  {bt.label}
                </button>
              ))}
            </div>

            {borrowerType !== 'NEW' && (
              <div className="mt-4 animate-in fade-in slide-in-from-top-2 duration-300">
                <select
                  className="w-full bg-white border border-slate-200 p-3 rounded-xl outline-none focus:ring-2 focus:ring-brand-500 transition-all font-bold"
                  value={selectedBorrowerId}
                  onChange={(e) => setSelectedBorrowerId(e.target.value)}
                >
                  <option value="">-- Select {borrowerType === 'KISSAN' ? 'Owner' : borrowerType} --</option>
                  {borrowerType === 'CLIENT' && clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  {borrowerType === 'KISSAN' && farmers.flatMap(k => (k.owners || []).map((o: any) => (
                    <option key={o.id} value={o.id}>{o.name} ({k.landName})</option>
                  )))}
                  {borrowerType === 'INVESTOR' && investors.map(i => <option key={i.id} value={i.id}>{i.name}</option>)}
                </select>
              </div>
            )}
          </div>
        )}

        <div className="p-6 border-b border-slate-100 bg-slate-50/50">
          <h3 className="font-bold text-slate-800 flex items-center">
            <User size={18} className="mr-2 text-brand-600" /> Borrower Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div className="md:col-span-2 grid grid-cols-4 gap-4">
              <div className="col-span-1">
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Title</label>
                <select 
                  className="w-full bg-white border border-slate-200 p-2.5 rounded-xl outline-none focus:ring-2 focus:ring-brand-500 transition-all font-bold"
                  value={formData.title}
                  onChange={e => setFormData({...formData, title: e.target.value})}
                >
                  <option value="Mr.">Mr.</option>
                  <option value="Mrs.">Mrs.</option>
                  <option value="Ms.">Ms.</option>
                  <option value="Dr.">Dr.</option>
                  <option value="Prof.">Prof.</option>
                </select>
              </div>
              <div className="col-span-3">
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Full Name</label>
                <input type="text" required className="w-full bg-white border border-slate-200 p-2.5 rounded-xl outline-none focus:ring-2 focus:ring-brand-500 transition-all font-bold" value={formData.borrowerName} onChange={e => setFormData({...formData, borrowerName: e.target.value})} />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Father/Husband Name</label>
              <input type="text" className="w-full bg-white border border-slate-200 p-2.5 rounded-xl outline-none focus:ring-2 focus:ring-brand-500 transition-all" value={formData.fatherHusbandName} onChange={e => setFormData({...formData, fatherHusbandName: e.target.value})} />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Occupation</label>
              <input type="text" className="w-full bg-white border border-slate-200 p-2.5 rounded-xl outline-none focus:ring-2 focus:ring-brand-500 transition-all" value={formData.occupation} onChange={e => setFormData({...formData, occupation: e.target.value})} />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Date of Birth</label>
              <div className="flex gap-2">
                <input type="date" className="flex-1 bg-white border border-slate-200 p-2.5 rounded-xl outline-none focus:ring-2 focus:ring-brand-500 transition-all" value={formData.dob} onChange={e => handleDobChange(e.target.value)} />
                <div className="w-16 bg-slate-100 border border-slate-200 p-2.5 rounded-xl text-center font-bold text-slate-600 flex items-center justify-center">{formData.age || '--'}</div>
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Phone Number</label>
              <input type="tel" required className="w-full bg-white border border-slate-200 p-2.5 rounded-xl outline-none focus:ring-2 focus:ring-brand-500 transition-all" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Email Address</label>
              <input type="email" className="w-full bg-white border border-slate-200 p-2.5 rounded-xl outline-none focus:ring-2 focus:ring-brand-500 transition-all" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Address</label>
              <input type="text" className="w-full bg-white border border-slate-200 p-2.5 rounded-xl outline-none focus:ring-2 focus:ring-brand-500 transition-all" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} />
            </div>
          </div>
        </div>

        <div className="p-6 border-b border-slate-100">
          <h3 className="font-bold text-slate-800 flex items-center">
            <Fingerprint size={18} className="mr-2 text-brand-600" /> Identity Details
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Aadhaar Card Number</label>
              <input type="text" placeholder="XXXX-XXXX-XXXX" className="w-full bg-white border border-slate-200 p-2.5 rounded-xl outline-none focus:ring-2 focus:ring-brand-500 transition-all" value={formData.aadhaar} onChange={e => setFormData({...formData, aadhaar: e.target.value})} />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">PAN Card Number</label>
              <input type="text" placeholder="ABCDE1234F" className="w-full bg-white border border-slate-200 p-2.5 rounded-xl outline-none focus:ring-2 focus:ring-brand-500 transition-all uppercase" value={formData.pan} onChange={e => setFormData({...formData, pan: e.target.value})} />
            </div>
          </div>
        </div>

        <div className="p-6 border-b border-slate-100 bg-slate-50/30">
          <h3 className="font-bold text-slate-800 flex items-center">
            <Landmark size={18} className="mr-2 text-brand-600" /> Borrower Bank Details
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Bank Name</label>
              <input type="text" className="w-full bg-white border border-slate-200 p-2.5 rounded-xl outline-none focus:ring-2 focus:ring-brand-500 transition-all" value={formData.bankName} onChange={e => setFormData({...formData, bankName: e.target.value})} />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Account Number</label>
              <input type="text" className="w-full bg-white border border-slate-200 p-2.5 rounded-xl outline-none focus:ring-2 focus:ring-brand-500 transition-all" value={formData.accountNumber} onChange={e => setFormData({...formData, accountNumber: e.target.value})} />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">IFSC Code</label>
              <input type="text" className="w-full bg-white border border-slate-200 p-2.5 rounded-xl outline-none focus:ring-2 focus:ring-brand-500 transition-all uppercase" value={formData.ifscCode} onChange={e => setFormData({...formData, ifscCode: e.target.value})} />
            </div>
          </div>
        </div>

        {/* Section: Guarantor Profiles */}
        <div className="p-6 border-b border-slate-100">
          <h3 className="font-bold text-slate-800 flex items-center mb-4">
            <Shield size={18} className="mr-2 text-brand-600" /> Guarantor Profiles
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {formData.guarantors.map((guarantor, index) => (
              <div key={guarantor.id} className="p-4 rounded-2xl bg-slate-50/50 border border-slate-100 relative">
                <div className="absolute -top-3 left-4 bg-white px-2 text-[10px] font-bold text-brand-600 border border-brand-100 rounded-full">
                  GUARANTOR #{index + 1}
                </div>
                <div className="grid grid-cols-1 gap-3 mt-2">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase">Guarantor Name</label>
                    <input 
                      type="text" 
                      className="w-full bg-white border border-slate-200 p-2 rounded-lg outline-none focus:ring-2 focus:ring-brand-500 text-sm"
                      value={guarantor.name}
                      onChange={(e) => {
                        const newGuarantors = [...formData.guarantors];
                        newGuarantors[index].name = e.target.value;
                        setFormData({ ...formData, guarantors: newGuarantors });
                      }}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase">Phone</label>
                      <input 
                        type="tel" 
                        className="w-full bg-white border border-slate-200 p-2 rounded-lg outline-none focus:ring-2 focus:ring-brand-500 text-sm"
                        value={guarantor.phone}
                        onChange={(e) => {
                          const newGuarantors = [...formData.guarantors];
                          newGuarantors[index].phone = e.target.value;
                          setFormData({ ...formData, guarantors: newGuarantors });
                        }}
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase">Relation</label>
                      <input 
                        type="text" 
                        className="w-full bg-white border border-slate-200 p-2 rounded-lg outline-none focus:ring-2 focus:ring-brand-500 text-sm"
                        value={guarantor.relation}
                        onChange={(e) => {
                          const newGuarantors = [...formData.guarantors];
                          newGuarantors[index].relation = e.target.value;
                          setFormData({ ...formData, guarantors: newGuarantors });
                        }}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase">Aadhaar</label>
                      <input 
                        type="text" 
                        className="w-full bg-white border border-slate-200 p-2 rounded-lg outline-none focus:ring-2 focus:ring-brand-500 text-sm"
                        value={guarantor.aadhaar}
                        onChange={(e) => {
                          const newGuarantors = [...formData.guarantors];
                          newGuarantors[index].aadhaar = e.target.value;
                          setFormData({ ...formData, guarantors: newGuarantors });
                        }}
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase">PAN</label>
                      <input 
                        type="text" 
                        className="w-full bg-white border border-slate-200 p-2 rounded-lg outline-none focus:ring-2 focus:ring-brand-500 text-sm uppercase"
                        value={guarantor.pan}
                        onChange={(e) => {
                          const newGuarantors = [...formData.guarantors];
                          newGuarantors[index].pan = e.target.value;
                          setFormData({ ...formData, guarantors: newGuarantors });
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="p-6 border-b border-slate-100">
          <h3 className="font-bold text-slate-800 flex items-center">
            <CreditCard size={18} className="mr-2 text-brand-600" /> Loan Terms
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Principal Amount (₹)</label>
              <input type="number" required className="w-full bg-white border border-slate-200 p-2.5 rounded-xl outline-none focus:ring-2 focus:ring-brand-500 transition-all font-bold" value={formData.principalAmount} onChange={e => setFormData({...formData, principalAmount: e.target.value})} />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Purpose of Loan</label>
              <select className="w-full bg-white border border-slate-200 p-2.5 rounded-xl outline-none focus:ring-2 focus:ring-brand-500 transition-all" value={formData.purpose} onChange={e => handlePurposeChange(e.target.value)}>
                {Object.keys(PURPOSE_RATES).map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Interest Rate (% p.a.)</label>
              <input type="number" required step="0.1" className="w-full bg-white border border-slate-200 p-2.5 rounded-xl outline-none focus:ring-2 focus:ring-brand-500 transition-all" value={formData.interestRate} onChange={e => setFormData({...formData, interestRate: e.target.value})} />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Interest Type</label>
              <select className="w-full bg-white border border-slate-200 p-2.5 rounded-xl outline-none focus:ring-2 focus:ring-brand-500 transition-all" value={formData.interestType} onChange={e => setFormData({...formData, interestType: e.target.value as any})}>
                <option value="SIMPLE">Simple Interest</option>
                <option value="COMPOUND">Compound Interest</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Start Date</label>
              <input type="date" required className="w-full bg-white border border-slate-200 p-2.5 rounded-xl outline-none focus:ring-2 focus:ring-brand-500 transition-all" value={formData.startDate} onChange={e => setFormData({...formData, startDate: e.target.value})} />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Duration (Months)</label>
              <input type="number" required className="w-full bg-white border border-slate-200 p-2.5 rounded-xl outline-none focus:ring-2 focus:ring-brand-500 transition-all" value={formData.durationMonths} onChange={e => setFormData({...formData, durationMonths: e.target.value})} />
            </div>
          </div>

          <div className="mt-6 p-4 rounded-2xl bg-brand-50/50 border border-brand-100 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold text-brand-600 uppercase tracking-wider mb-1">Calculated Monthly EMI</p>
              <p className="text-3xl font-black text-brand-900">₹ {(formData.monthlyEMI || 0).toLocaleString('en-IN')}</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Total Repayment</p>
              <p className="text-lg font-bold text-slate-700">₹ {((formData.monthlyEMI || 0) * Number(formData.durationMonths || 0)).toLocaleString('en-IN')}</p>
            </div>
          </div>
        </div>

        <div className="p-6 border-b border-slate-100 bg-slate-50/30">
          <h3 className="font-bold text-slate-800 flex items-center">
            <Shield size={18} className="mr-2 text-brand-600" /> Loan Collateral Security
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Collateral Type</label>
              <select 
                className="w-full bg-white border border-slate-200 p-2.5 rounded-xl outline-none focus:ring-2 focus:ring-brand-500 transition-all"
                value={formData.collateralType}
                onChange={e => setFormData({...formData, collateralType: e.target.value})}
              >
                <option value="NON_COLLATERAL">No Collateral (Personal Loan)</option>
                <option value="PROPERTY">Property / Real Estate</option>
                <option value="VEHICLE">Vehicle (Car/Bike)</option>
                <option value="GOLD">Gold / Jewelry</option>
                <option value="DOCUMENTS">Original Documents / Cheque</option>
                <option value="OTHER">Other Assets</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Estimated Market Value (₹)</label>
              <input 
                type="number" 
                className="w-full bg-white border border-slate-200 p-2.5 rounded-xl outline-none focus:ring-2 focus:ring-brand-500 transition-all"
                placeholder="Market Value"
                value={formData.collateralValue}
                onChange={e => setFormData({...formData, collateralValue: e.target.value})}
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Collateral Details / Security Description</label>
              <textarea 
                className="w-full bg-white border border-slate-200 p-3 rounded-xl outline-none focus:ring-2 focus:ring-brand-500 transition-all"
                rows={2}
                placeholder="Enter details like Registry Number, Vehicle ID, Gold weight, etc."
                value={formData.collateralDetails}
                onChange={e => setFormData({...formData, collateralDetails: e.target.value})}
              ></textarea>
            </div>
          </div>
        </div>

        <div className="p-6 border-b border-slate-100 bg-slate-50/30">
          <h3 className="font-bold text-slate-800 flex items-center">
            <Upload size={18} className="mr-2 text-brand-600" /> Borrower Documents
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
            <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  {['Aadhaar', 'PAN', 'Electric Bill', 'Other'].map((docType) => (
                    <div key={docType} className="relative">
                      <input type="file" id={`file-${docType}`} className="hidden" onChange={(e) => handleFileUpload(e, docType)} accept="image/*,application/pdf" />
                      <label htmlFor={`file-${docType}`} className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-slate-200 rounded-2xl hover:border-brand-400 hover:bg-brand-50 transition-all cursor-pointer group text-center">
                        <File size={20} className="text-slate-400 mb-1 group-hover:text-brand-500" />
                        <span className="text-[10px] font-bold text-slate-500">{docType}</span>
                      </label>
                    </div>
                  ))}
                </div>
            </div>
            <div className="space-y-2">
              {formData.documents.map((doc) => (
                <div key={doc.id} className="flex items-center justify-between p-2 bg-white rounded-xl border border-slate-100 shadow-sm">
                  <div className="flex items-center">
                    <FileText size={16} className="text-brand-600 mr-2" />
                    <div>
                      <p className="text-[10px] font-bold text-slate-800 truncate max-w-[150px]">{doc.name}</p>
                      <p className="text-[8px] text-slate-400 uppercase tracking-wider">{doc.type}</p>
                    </div>
                  </div>
                  <button type="button" onClick={() => removeDocument(doc.id)} className="p-1 px-2 text-red-500 hover:bg-red-50 rounded-lg transition-all"><Trash2 size={14} /></button>
                </div>
              ))}
              {formData.documents.length === 0 && <p className="text-xs text-slate-400 italic text-center py-4">No documents uploaded yet</p>}
            </div>
          </div>
        </div>

        <div className="p-6 bg-slate-50/50">
          <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Additional Notes</label>
          <textarea className="w-full bg-white border border-slate-200 p-3 rounded-xl outline-none focus:ring-2 focus:ring-brand-500 transition-all" rows={3} placeholder="Any specific terms or details..." value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})}></textarea>
        </div>

        {/* Section: File Manager & Assignments */}
        <div className="p-6 border-t border-slate-100 bg-white">
          <h2 className="text-lg font-semibold text-slate-800 mb-6 flex items-center">
            <Shield size={20} className="mr-2 text-brand-500" /> Administrative Assignments
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1 uppercase text-[10px] font-bold tracking-wider">Select Category</label>
              <select 
                className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-brand-500 outline-none bg-white text-slate-900"
                value={selectedCategory}
                onChange={(e) => {
                  const cat = categories.find(c => String(c.id) === String(e.target.value));
                  setSelectedCategory(e.target.value);
                  setSelectedFolder('');
                  setFormData(prev => ({ 
                    ...prev, 
                    categoryId: e.target.value, 
                    categoryName: cat?.name || '',
                    folderId: '',
                    folderName: ''
                  }));
                }}
              >
                <option value="">-- Select Category --</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1 uppercase text-[10px] font-bold tracking-wider">Select Folder (File)</label>
              <select 
                className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-brand-500 outline-none bg-white text-slate-900"
                value={selectedFolder}
                onChange={(e) => {
                  const folder = folders.find(f => String(f.id) === String(e.target.value));
                  setSelectedFolder(e.target.value);
                  setFormData(prev => ({ 
                    ...prev, 
                    folderId: e.target.value,
                    folderName: folder?.name || '',
                    folderSerial: folder?.name?.split('-')[0] || ''
                  }));
                }}
                disabled={!selectedCategory}
              >
                <option value="">-- Select Folder --</option>
                {folders.filter(f => String(f.category_id) === String(selectedCategory)).map(folder => (
                  <option key={folder.id} value={folder.id}>{folder.name}</option>
                ))}
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1 uppercase text-[10px] font-bold tracking-wider">Select Office Address</label>
              <select 
                className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-brand-500 outline-none bg-white text-slate-900"
                value={formData.companyAddressId}
                onChange={(e) => {
                  const addr = officeAddresses.find(a => String(a.id) === String(e.target.value));
                  if (addr) {
                    setFormData(prev => ({
                      ...prev,
                      companyAddressId: e.target.value,
                      officeAddress: addr.addressLine || addr.address || '',
                      officeDistrict: addr.district || '',
                      officeState: addr.state || '',
                      officePincode: addr.pinCode || '',
                      officeLocality: addr.locality || ''
                    }));
                  }
                }}
              >
                <option value="">Select Office Address</option>
                {officeAddresses.map(addr => (
                  <option key={addr.id} value={addr.id}>{addr.name} - {addr.locality}</option>
                ))}
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1 uppercase text-[10px] font-bold tracking-wider">Select Manager</label>
              <select 
                className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-brand-500 outline-none bg-white text-slate-900"
                value={formData.managerId}
                onChange={(e) => {
                  const manager = managers.find(m => String(m.id) === String(e.target.value));
                  if (manager) {
                    setFormData(prev => ({
                      ...prev,
                      managerId: e.target.value,
                      managerName: manager.name,
                      managerPosition: manager.role,
                      managerPhone: manager.phone,
                      managerCountryCode: manager.countryCode,
                      managerAddress: manager.address || '',
                      managerPAN: manager.pan || '',
                      managerAadhaar: manager.aadhaar || ''
                    }));
                  }
                }}
              >
                <option value="">Select Manager</option>
                {managers.map(manager => (
                  <option key={manager.id} value={manager.id}>{manager.name} - {manager.role}</option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="mt-8 pt-6 border-t border-slate-100">
            <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center uppercase tracking-wider">
              <FileCheck size={18} className="mr-2 text-brand-600" /> Generate Documents
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button 
                type="button"
                onClick={() => handleGenerateClick('loan_agreement')}
                className="flex items-center justify-between p-4 rounded-xl border border-brand-100 bg-brand-50/30 hover:bg-brand-50 transition-all group"
              >
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-brand-100 rounded-full flex items-center justify-center text-brand-600 mr-3 group-hover:scale-110 transition-transform">
                    <FileText size={20} />
                  </div>
                  <div className="text-left">
                    <p className="font-bold text-slate-800 text-sm">Loan Agreement</p>
                    <p className="text-[10px] text-slate-500">Draft legal agreement</p>
                  </div>
                </div>
                <Printer size={16} className="text-slate-400 group-hover:text-brand-600 transition-colors" />
              </button>

              <button 
                type="button"
                onClick={() => handleGenerateClick('token')}
                className="flex items-center justify-between p-4 rounded-xl border border-brand-100 bg-brand-50/30 hover:bg-brand-50 transition-all group"
              >
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-brand-100 rounded-full flex items-center justify-center text-brand-600 mr-3 group-hover:scale-110 transition-transform">
                    <FileCheck size={20} />
                  </div>
                  <div className="text-left">
                    <p className="font-bold text-slate-800 text-sm">Token Receipt</p>
                    <p className="text-[10px] text-slate-500">Official loan token confirmation</p>
                  </div>
                </div>
                <Printer size={16} className="text-slate-400 group-hover:text-brand-600 transition-colors" />
              </button>
            </div>
          </div>
        </div>

        <div className="p-6 bg-white border-t border-slate-100 flex gap-3">
          <button type="button" onClick={() => navigate('/loan-ledger')} className="px-6 py-3 border border-slate-200 text-slate-600 rounded-xl font-bold hover:bg-slate-50 transition-all">Cancel</button>
          <button type="submit" disabled={isProcessing} className="flex-1 bg-brand-600 text-white py-3 rounded-xl font-bold shadow-lg shadow-brand-200 flex items-center justify-center gap-2 hover:bg-brand-700 transition-all disabled:opacity-50">
            {isProcessing ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <Save size={20} />}
            {isEditMode ? 'Update Loan' : 'Register Loan'}
          </button>
        </div>
      </form>

      {/* Language Selection Modal */}
      {previewType && !selectedLang && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-[110] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-slate-800 flex items-center">
                <Globe size={24} className="mr-2 text-brand-600" /> Select Language
              </h3>
              <button onClick={() => setPreviewType(null)} className="p-2 hover:bg-slate-100 rounded-full text-slate-500">
                <X size={24} />
              </button>
            </div>
            <div className="grid grid-cols-1 gap-4">
              <button onClick={() => setSelectedLang('english')} className="flex items-center justify-between p-4 rounded-xl border-2 border-slate-100 hover:border-brand-500 hover:bg-brand-50 transition-all group">
                <span className="font-bold text-slate-700 group-hover:text-brand-700">English</span>
                <span className="text-xs text-slate-400 font-mono">ENG</span>
              </button>
              <button onClick={() => setSelectedLang('hindi')} className="flex items-center justify-between p-4 rounded-xl border-2 border-slate-100 hover:border-brand-500 hover:bg-brand-50 transition-all group">
                <span className="font-bold text-slate-700 group-hover:text-brand-700">Hindi (हिंदी)</span>
                <span className="text-xs text-slate-400 font-mono">HIN</span>
              </button>
              <button onClick={() => setSelectedLang('marathi')} className="flex items-center justify-between p-4 rounded-xl border-2 border-slate-100 hover:border-brand-500 hover:bg-brand-50 transition-all group">
                <span className="font-bold text-slate-700 group-hover:text-brand-700">Marathi (मराठी)</span>
                <span className="text-xs text-slate-400 font-mono">MAR</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Agreement Preview */}
      {previewType && selectedLang && (
        <AgreementPreview
          data={{
            client: {
              title: formData.title,
              name: formData.borrowerName,
              age: formData.age,
              gender: 'N/A',
              occupation: formData.occupation,
              phone: formData.phone,
              email: formData.email,
              aadhaar: formData.aadhaar,
              pan: formData.pan,
              address: formData.address,
              fatherHusbandName: formData.fatherHusbandName,
              district: '',
              state: '',
              pincode: '',
              folderSerial: formData.folderSerial,
              clientId: formData.loanId || editingLoanId || previewId || 'TEMP-ID'
            },
            company: {
              companyName: companySettings?.companyName || '',
              entityType: companySettings?.entityType || '',
              companyAddress: formData.officeAddress || '',
              companyLocality: formData.officeLocality || '',
              companyDistrict: formData.officeDistrict || '',
              companyState: formData.officeState || '',
              companyPincode: formData.officePincode || '',
              companyEmail: companySettings?.companyEmail || '',
              companyWebsite: companySettings?.companyWebsite || '',
              licenseRegistrationNumber: companySettings?.licenseRegistrationNumber || '',
            },
            manager: {
              managerName: formData.managerName || '',
              managerPosition: formData.managerPosition || '',
              managerPhone: formData.managerPhone || '',
            },
            guarantors: formData.guarantors.filter(g => g.name).map(g => ({
              name: g.name,
              phone: g.phone,
              relation: g.relation,
              address: g.address,
              aadhaar: g.aadhaar,
              pan: g.pan
            })),
            loanAmount: formData.principalAmount,
            loanDuration: formData.durationMonths ? `${formData.durationMonths} Months` : '',
            loanDate: formData.startDate,
            loanPurpose: formData.purpose,
            repaymentMode: 'EMI (Monthly Instalment)',
            interestRate: `${formData.interestRate}% p.a.`,
            interestType: formData.interestType === 'SIMPLE' ? 'Simple Interest' : 'Compound Interest',
            monthlyEMI: formData.monthlyEMI,
            collateralType: formData.collateralType,
            collateralValue: formData.collateralValue,
            collateralDetails: formData.collateralDetails,
            loanId: formData.loanId || editingLoanId || previewId
          }}
          type={previewType}
          language={selectedLang}
          onClose={() => {
            setPreviewType(null);
            setSelectedLang(null);
          }}
        />
      )}
    </div>
  );
};
