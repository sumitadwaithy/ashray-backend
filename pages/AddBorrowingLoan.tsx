
import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { ArrowLeft, Save, Landmark, User, Phone, CreditCard, Calendar, Clock, FileText, CheckCircle, Fingerprint, Eye, X, Printer, Upload, Trash2, File, ArrowDownLeft, Shield, FileCheck, Globe, Activity, AlertCircle, Info } from 'lucide-react';
import { dbService } from '../services/db';
import { Loan, Transaction, TransactionType, TransactionCategory, PaymentMethod, LoanDocument, Doc, LoanType, Category, Folder, CompanyAddress, Manager } from '../types';
import { useLanguage } from '../services/i18n';
import { AgreementPreview } from '../components/AgreementTemplates';

export const AddBorrowingLoan: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useLanguage();
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingLoanId, setEditingLoanId] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [officeAddresses, setOfficeAddresses] = useState<CompanyAddress[]>([]);
  const [managers, setManagers] = useState<Manager[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedFolder, setSelectedFolder] = useState('');
  const [previewType, setPreviewType] = useState<'agreement' | 'token' | null>(null);
  const [selectedLang, setSelectedLang] = useState<'english' | 'hindi' | 'marathi' | null>(null);
  const [companySettings, setCompanySettings] = useState<any>(null);

  const [formData, setFormData] = useState({
    loanType: LoanType.TAKEN,
    borrowerName: '',
    fatherHusbandName: '',
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
    purpose: 'BUSINESS',
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
    officeLocality: '',
    officeDistrict: '',
    officeState: '',
    officePincode: '',
    managerId: '',
    managerName: '',
    managerPosition: '',
    managerPhone: '',
    managerCountryCode: '',
    managerAddress: '',
    managerAadhaar: '',
    title: 'Mr.',
    monthlyEMI: 0,
    loanId: ''
  });

  useEffect(() => {
    if (!isEditMode && !formData.loanId) {
      dbService.peekId('LID', formData.startDate).then(id => {
        setPreviewId(id);
      });
    }
  }, [isEditMode, formData.startDate, formData.loanId]);

  const [monthlyEMIInput, setMonthlyEMIInput] = useState('');
  const [calculationResult, setCalculationResult] = useState<{
    simpleRate: number;
    compoundRate: number;
    totalInterest: number;
    totalPayable: number;
    isValid: boolean;
  } | null>(null);
  const [previewId, setPreviewId] = useState<string>('');


  const calculateEMI = (p: number, r: number, n: number, type: 'SIMPLE' | 'COMPOUND') => {
    if (!p || !r || !n) return 0;
    const monthlyRate = r / (12 * 100);
    if (type === 'COMPOUND') {
      if (monthlyRate === 0) return Math.round(p / n);
      const emi = (p * monthlyRate * Math.pow(1 + monthlyRate, n)) / (Math.pow(1 + monthlyRate, n) - 1);
      return Math.round(emi);
    } else {
      const totalInterest = (p * (r / 100) * (n / 12));
      const emi = (p + totalInterest) / n;
      return Math.round(emi);
    }
  };

  const findRateFromEMI = (p: number, emi: number, n: number, type: 'SIMPLE' | 'COMPOUND') => {
    if (!p || !emi || !n || emi * n <= p) return 0;
    if (type === 'SIMPLE') {
      const rate = ((emi * n - p) / p) * (12 / n) * 100;
      return Number(rate.toFixed(2));
    } else {
      let low = 0;
      let high = 500;
      for (let i = 0; i < 25; i++) {
        const mid = (low + high) / 2;
        const r = mid / 1200;
        if (r === 0) {
          if (p/n > emi) low = mid; else high = mid;
          continue;
        }
        const calcEmi = (p * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
        if (calcEmi > emi) high = mid;
        else low = mid;
      }
      return Number(((low + high) / 2).toFixed(2));
    }
  };

  useEffect(() => {
    const p = Number(formData.principalAmount);
    const n = Number(formData.durationMonths);
    const emi = Number(monthlyEMIInput);

    if (p > 0 && n > 0 && emi > 0) {
      const sRate = findRateFromEMI(p, emi, n, 'SIMPLE');
      const cRate = findRateFromEMI(p, emi, n, 'COMPOUND');
      const totalPayable = emi * n;
      const totalInterest = totalPayable - p;

      setCalculationResult({
        simpleRate: sRate,
        compoundRate: cRate,
        totalInterest,
        totalPayable,
        isValid: totalPayable > p
      });

      // Update formData with the compound rate as default applied rate
      setFormData(prev => ({ 
        ...prev, 
        interestRate: formData.interestType === 'SIMPLE' ? sRate.toString() : cRate.toString(),
        monthlyEMI: emi
      }));
    } else {
      setCalculationResult(null);
    }
  }, [formData.principalAmount, formData.durationMonths, monthlyEMIInput, formData.interestType]);

  useEffect(() => {
    const fetchData = async () => {
      const [cats, fols, settings] = await Promise.all([
        dbService.getCategories(),
        dbService.getFolders(),
        dbService.getSettings()
      ]);
      setCategories(cats);
      setFolders(fols);
      setCompanySettings(settings);
      setOfficeAddresses(settings.companyAddresses || []);
      setManagers(settings.managers || []);
    };
    fetchData();
  }, []);

  useEffect(() => {
    const editId = location.state?.loanId;
    if (editId) {
      const loadLoan = async () => {
        const loan = await dbService.getLoanById(editId);
        if (loan) {
          setIsEditMode(true);
          setEditingLoanId(editId);
          setFormData({
            loanType: LoanType.TAKEN,
            borrowerName: loan.borrowerName,
            fatherHusbandName: loan.fatherHusbandName || '',
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
            purpose: loan.purpose || 'BUSINESS',
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
            monthlyEMI: loan.monthlyEMI || 0
          });
          setSelectedCategory(loan.categoryId || '');
          setSelectedFolder(loan.folderId || '');
        }
      };
      loadLoan();
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
      loanType: LoanType.TAKEN,
      borrowerName: formData.borrowerName,
      fatherHusbandName: formData.fatherHusbandName,
      occupation: 'Institution',
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
      const creditTx: Transaction = {
        id: 'TX' + Date.now(),
        date: formData.startDate,
        particulars: `Loan Taken - ${formData.borrowerName}`,
        amount: principal,
        type: TransactionType.CREDIT,
        category: TransactionCategory.LOAN,
        method: formData.method,
        referenceId: 'LOAN-TAKEN-' + Math.floor(Math.random() * 1000),
        loanId: loanId,
        balanceAfter: 0,
        synced: false
      };
      await dbService.saveTransaction(creditTx);
    }

    await dbService.saveLoan(newLoan);

    if (formData.documents && formData.documents.length > 0) {
      for (const doc of formData.documents) {
        const centralDoc: Doc = {
          id: doc.id,
           name: doc.name, date: (doc.uploadDate || '').split('T')[0], size: 'N/A', type: (doc.fileType || '').includes('pdf') ? 'pdf' : 'img', synced: false, category: 'LOAN', loanId: loanId, created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
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
          <div className="p-4 rounded-full bg-orange-100 text-orange-600">
            <CheckCircle size={48} />
          </div>
        </div>
        <div>
          <h2 className="text-2xl font-bold text-slate-800">{isEditMode ? 'Liability Updated Successfully!' : 'Loan Taken Registered Successfully!'}</h2>
          <p className="text-slate-500 mt-2">
            {isEditMode ? 'The loan taken profile has been updated.' : 'The loan taken has been registered and the credit transaction has been recorded.'}
          </p>
        </div>
        <div className="flex flex-col gap-2">
          <button onClick={() => navigate('/loan-ledger')} className="w-full bg-orange-600 text-white py-3 rounded-xl font-bold shadow-lg shadow-orange-200">Go to Loan Ledger</button>
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
          {isEditMode ? 'Edit Loan Taken' : 'Register New Loan Taken (Borrowing)'}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-100 bg-orange-50/20">
          <h3 className="font-bold text-slate-800 flex items-center">
            <User size={18} className="mr-2 text-orange-600" /> Lender / Institution Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div className="md:col-span-2 grid grid-cols-4 gap-4">
              <div className="col-span-1">
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Title</label>
                <select 
                  className="w-full bg-white border border-slate-200 p-2.5 rounded-xl outline-none focus:ring-2 focus:ring-orange-500 transition-all font-bold"
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
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Lender / Bank Name</label>
                <input type="text" required className="w-full bg-white border border-slate-200 p-2.5 rounded-xl outline-none focus:ring-2 focus:ring-orange-500 transition-all font-bold" value={formData.borrowerName} onChange={e => setFormData({...formData, borrowerName: e.target.value})} />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Contact Person Name</label>
              <input type="text" className="w-full bg-white border border-slate-200 p-2.5 rounded-xl outline-none focus:ring-2 focus:ring-orange-500 transition-all" value={formData.fatherHusbandName} onChange={e => setFormData({...formData, fatherHusbandName: e.target.value})} />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Contact Phone</label>
              <input type="tel" required className="w-full bg-white border border-slate-200 p-2.5 rounded-xl outline-none focus:ring-2 focus:ring-orange-500 transition-all" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Email Address</label>
              <input type="email" className="w-full bg-white border border-slate-200 p-2.5 rounded-xl outline-none focus:ring-2 focus:ring-orange-500 transition-all" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Address</label>
              <input type="text" className="w-full bg-white border border-slate-200 p-2.5 rounded-xl outline-none focus:ring-2 focus:ring-orange-500 transition-all" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} />
            </div>
          </div>
        </div>

        <div className="p-6 border-b border-slate-100 bg-orange-50/10">
          <h3 className="font-bold text-slate-800 flex items-center">
            <FileText size={18} className="mr-2 text-orange-600" /> Loan Account Details
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Loan Account Number</label>
              <input type="text" placeholder="L-12345678" className="w-full bg-white border border-slate-200 p-2.5 rounded-xl outline-none focus:ring-2 focus:ring-orange-500 transition-all font-mono" value={formData.loanAccountNumber} onChange={e => setFormData({...formData, loanAccountNumber: e.target.value})} />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Sanction Date</label>
              <input type="date" className="w-full bg-white border border-slate-200 p-2.5 rounded-xl outline-none focus:ring-2 focus:ring-orange-500 transition-all" value={formData.sanctionDate} onChange={e => setFormData({...formData, sanctionDate: e.target.value})} />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Sanction Amount (₹)</label>
              <input type="number" required className="w-full bg-white border border-slate-200 p-2.5 rounded-xl outline-none focus:ring-2 focus:ring-orange-500 transition-all font-bold" value={formData.sanctionAmount} onChange={e => setFormData({...formData, sanctionAmount: e.target.value})} />
            </div>
          </div>
        </div>

        <div className="p-6 border-b border-slate-100">
          <h3 className="font-bold text-slate-800 flex items-center">
            <Fingerprint size={18} className="mr-2 text-orange-600" /> Institution Identity Details
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">GST / Registration Number</label>
              <input type="text" placeholder="27AAAAA0000A1Z5" className="w-full bg-white border border-slate-200 p-2.5 rounded-xl outline-none focus:ring-2 focus:ring-orange-500 transition-all" value={formData.aadhaar} onChange={e => setFormData({...formData, aadhaar: e.target.value})} />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">PAN Card Number</label>
              <input type="text" placeholder="ABCDE1234F" className="w-full bg-white border border-slate-200 p-2.5 rounded-xl outline-none focus:ring-2 focus:ring-orange-500 transition-all uppercase" value={formData.pan} onChange={e => setFormData({...formData, pan: e.target.value})} />
            </div>
          </div>
        </div>

        <div className="p-6 border-b border-slate-100 bg-slate-50/30">
          <h3 className="font-bold text-slate-800 flex items-center">
            <Landmark size={18} className="mr-2 text-orange-600" /> Repayment Account (Our Side)
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Bank Name</label>
              <input type="text" className="w-full bg-white border border-slate-200 p-2.5 rounded-xl outline-none focus:ring-2 focus:ring-orange-500 transition-all" value={formData.bankName} onChange={e => setFormData({...formData, bankName: e.target.value})} />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Account Number</label>
              <input type="text" className="w-full bg-white border border-slate-200 p-2.5 rounded-xl outline-none focus:ring-2 focus:ring-orange-500 transition-all" value={formData.accountNumber} onChange={e => setFormData({...formData, accountNumber: e.target.value})} />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">IFSC Code</label>
              <input type="text" className="w-full bg-white border border-slate-200 p-2.5 rounded-xl outline-none focus:ring-2 focus:ring-orange-500 transition-all uppercase" value={formData.ifscCode} onChange={e => setFormData({...formData, ifscCode: e.target.value})} />
            </div>
          </div>
        </div>

        <div className="p-6 border-b border-slate-100">
          <h3 className="font-bold text-slate-800 flex items-center mb-4">
            <CreditCard size={18} className="mr-2 text-orange-600" /> Financial Terms & Discovery
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Loan Amount Taken (₹)</label>
              <input 
                type="number" 
                required 
                className="w-full bg-white border border-slate-200 p-2.5 rounded-xl outline-none focus:ring-2 focus:ring-orange-500 transition-all font-bold" 
                placeholder="Ex: 100000"
                value={formData.principalAmount} 
                onChange={e => setFormData({...formData, principalAmount: e.target.value})} 
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Duration (Months)</label>
              <input 
                type="number" 
                required 
                className="w-full bg-white border border-slate-200 p-2.5 rounded-xl outline-none focus:ring-2 focus:ring-orange-500 transition-all font-bold" 
                placeholder="Ex: 12"
                value={formData.durationMonths} 
                onChange={e => setFormData({...formData, durationMonths: e.target.value})} 
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-orange-600 uppercase mb-1">Monthly EMI (₹)</label>
              <input 
                type="number" 
                required 
                className="w-full bg-orange-50 border border-orange-200 p-2.5 rounded-xl outline-none focus:ring-2 focus:ring-orange-500 transition-all font-black text-orange-900" 
                placeholder="Ex: 9333"
                value={monthlyEMIInput} 
                onChange={e => setMonthlyEMIInput(e.target.value)} 
              />
            </div>
          </div>

          {!calculationResult && formData.principalAmount && formData.durationMonths && monthlyEMIInput && (
             <div className="mt-4 p-3 bg-red-50 border border-red-100 rounded-xl flex items-center gap-2 text-red-600 animate-pulse">
                <AlertCircle size={16} />
                <p className="text-[10px] font-bold uppercase">Invalid Structure: Total repayment must be greater than principal amount.</p>
             </div>
          )}

          {calculationResult && calculationResult.isValid && (
            <div className="mt-8 space-y-6 animate-in fade-in slide-in-from-top-4 duration-500">
              {/* Results Breakdown */}
              <div className="bg-slate-900 rounded-2xl p-6 text-white relative overflow-hidden ring-4 ring-orange-500/10">
                <div className="absolute top-0 right-0 p-4 opacity-5">
                  <Landmark size={120} />
                </div>
                
                <h4 className="text-sm font-black uppercase tracking-widest text-orange-400 mb-6 flex items-center">
                  <Activity size={16} className="mr-2" /> Applied Interest Insights
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
                  <div className="space-y-6">
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase mb-2">Lender Applied Interest Type</p>
                      <div className="flex gap-2">
                        <button 
                          type="button"
                          onClick={() => setFormData({...formData, interestType: 'SIMPLE'})}
                          className={`flex-1 p-3 rounded-xl border transition-all text-center ${formData.interestType === 'SIMPLE' ? 'bg-orange-600 border-orange-500 shadow-lg shadow-orange-900/20' : 'bg-white/5 border-white/10 hover:bg-white/10'}`}
                        >
                          <p className="text-[9px] font-bold uppercase opacity-60">Flat Rate</p>
                          <p className="text-lg font-black">{calculationResult.simpleRate}%</p>
                          <p className="text-[8px] font-medium uppercase opacity-40">Simple Interest</p>
                        </button>
                        <button 
                          type="button"
                          onClick={() => setFormData({...formData, interestType: 'COMPOUND'})}
                          className={`flex-1 p-3 rounded-xl border transition-all text-center ${formData.interestType === 'COMPOUND' ? 'bg-indigo-600 border-indigo-500 shadow-lg shadow-indigo-900/20' : 'bg-white/5 border-white/10 hover:bg-white/10'}`}
                        >
                          <p className="text-[9px] font-bold uppercase opacity-60">Reducing Rate</p>
                          <p className="text-lg font-black">{calculationResult.compoundRate}%</p>
                          <p className="text-[8px] font-medium uppercase opacity-40">Compounded</p>
                        </button>
                      </div>
                    </div>

                    <div className="p-4 bg-white/5 rounded-xl border border-white/10 space-y-3">
                       <div className="flex justify-between items-center">
                          <span className="text-[10px] font-bold text-slate-400 uppercase">Hidden/Processing Margin</span>
                          <span className="text-xs font-black text-red-400">
                             {calculationResult.compoundRate > 24 ? '🚨 HIGH SURCHARGE' : calculationResult.compoundRate > 15 ? '⚠️ ABOVE AVG' : '✅ STANDARD'}
                          </span>
                       </div>
                       <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                          <div 
                            className={`h-full transition-all duration-1000 ${calculationResult.compoundRate > 20 ? 'bg-red-500' : 'bg-orange-500'}`}
                            style={{ width: `${Math.min(100, (calculationResult.compoundRate / 40) * 100)}%` }}
                          ></div>
                       </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                        <p className="text-[9px] font-bold text-slate-500 uppercase">Principal Amount</p>
                        <p className="text-xl font-black">₹ {Number(formData.principalAmount || 0).toLocaleString('en-IN')}</p>
                      </div>
                      <div className="p-4 bg-red-500/10 rounded-xl border border-red-500/20">
                        <p className="text-[9px] font-bold text-red-400 uppercase">Total Interest</p>
                        <p className="text-xl font-black text-red-400">₹ {(calculationResult?.totalInterest || 0).toLocaleString('en-IN')}</p>
                      </div>
                    </div>

                    <div className="bg-orange-500 rounded-xl p-5 shadow-lg shadow-orange-950/40">
                      <p className="text-[10px] font-bold text-orange-200 uppercase mb-1">Total Repayment (Principal + Interest)</p>
                      <div className="flex items-end justify-between">
                        <p className="text-3xl font-black text-white">₹ {calculationResult.totalPayable.toLocaleString('en-IN')}</p>
                        <p className="text-[10px] font-bold text-orange-100 uppercase opacity-80 mb-1">{formData.durationMonths} Months Tenure</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-[10px]">
                  <div className="flex items-center gap-4 text-slate-400">
                    <span className="flex items-center gap-1"><Clock size={12} className="text-orange-500" /> Start: {formData.startDate}</span>
                    <span className="flex items-center gap-1"><CreditCard size={12} className="text-orange-500" /> EMI: ₹ {monthlyEMIInput}</span>
                  </div>
                  <p className="text-orange-400/60 font-medium italic">Calculations based on 100% principal recovery over {formData.durationMonths} months</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-4 bg-orange-50 border border-orange-100 rounded-xl">
                 <div className="p-2 bg-orange-600 text-white rounded-lg"><Info size={16} /></div>
                 <div>
                    <h5 className="text-[10px] font-bold text-orange-900 uppercase">Lender Type Recognition</h5>
                    <p className="text-xs text-orange-800">Banks typically use <span className="font-bold">Reducing/Compound</span> interest. Individual lenders often use <span className="font-bold">Flat/Simple</span> interest.</p>
                 </div>
              </div>
            </div>
          )}
        </div>

        <div className="p-6 border-b border-slate-100 bg-slate-50/30">
          <h3 className="font-bold text-slate-800 flex items-center">
            <Upload size={18} className="mr-2 text-orange-600" /> Lending Institution Documents
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
            <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  {['Agreement', 'Sanction Letter', 'Bank Statement', 'Other'].map((docType) => (
                    <div key={docType} className="relative">
                      <input type="file" id={`file-${docType}`} className="hidden" onChange={(e) => handleFileUpload(e, docType)} accept="image/*,application/pdf" />
                      <label htmlFor={`file-${docType}`} className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-slate-200 rounded-2xl hover:border-orange-400 hover:bg-orange-50 transition-all cursor-pointer group text-center">
                        <File size={20} className="text-slate-400 mb-1 group-hover:text-orange-500" />
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
                    <FileText size={16} className="text-orange-600 mr-2" />
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
          <textarea className="w-full bg-white border border-slate-200 p-3 rounded-xl outline-none focus:ring-2 focus:ring-orange-500 transition-all" rows={3} placeholder="Repayment schedule details or institution specifics..." value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})}></textarea>
        </div>

        {/* Section: File Manager & Assignments */}
        <div className="p-6 border-t border-slate-100 bg-white">
          <h2 className="text-lg font-semibold text-slate-800 mb-6 flex items-center">
            <Shield size={20} className="mr-2 text-orange-500" /> Administrative Assignments
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1 uppercase text-[10px] font-bold tracking-wider">Select Category</label>
              <select 
                className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 outline-none bg-white text-slate-900"
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
                className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 outline-none bg-white text-slate-900"
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
                className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 outline-none bg-white text-slate-900"
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
                className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 outline-none bg-white text-slate-900"
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
              <FileCheck size={18} className="mr-2 text-orange-600" /> Generate Documents
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button 
                type="button"
                onClick={() => handleGenerateClick('loan_agreement')}
                className="flex items-center justify-between p-4 rounded-xl border border-orange-100 bg-orange-50/30 hover:bg-orange-50 transition-all group"
              >
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 mr-3 group-hover:scale-110 transition-transform">
                    <FileText size={20} />
                  </div>
                  <div className="text-left">
                    <p className="font-bold text-slate-800 text-sm">Loan Agreement</p>
                    <p className="text-[10px] text-slate-500">Draft legal agreement</p>
                  </div>
                </div>
                <Printer size={16} className="text-slate-400 group-hover:text-orange-600 transition-colors" />
              </button>

              <button 
                type="button"
                onClick={() => handleGenerateClick('token')}
                className="flex items-center justify-between p-4 rounded-xl border border-indigo-100 bg-indigo-50/30 hover:bg-indigo-50 transition-all group"
              >
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 mr-3 group-hover:scale-110 transition-transform">
                    <CreditCard size={20} />
                  </div>
                  <div className="text-left">
                    <p className="font-bold text-slate-800 text-sm">Token Receipt</p>
                    <p className="text-[10px] text-slate-500">Official booking confirmation</p>
                  </div>
                </div>
                <Printer size={16} className="text-slate-400 group-hover:text-indigo-600 transition-colors" />
              </button>
            </div>
          </div>
        </div>

        <div className="p-6 bg-white border-t border-slate-100 flex gap-3">
          <button type="button" onClick={() => navigate('/loan-ledger')} className="px-6 py-3 border border-slate-200 text-slate-600 rounded-xl font-bold hover:bg-slate-50 transition-all">Cancel</button>
          <button type="submit" disabled={isProcessing} className="flex-1 bg-orange-600 text-white py-3 rounded-xl font-bold shadow-lg shadow-orange-200 flex items-center justify-center gap-2 hover:bg-orange-700 transition-all disabled:opacity-50">
            {isProcessing ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <Save size={20} />}
            {isEditMode ? 'Update Record' : 'Register Loan Taken'}
          </button>
        </div>
      </form>

      {/* Language Selection Modal */}
      {previewType && !selectedLang && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-[110] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-slate-800 flex items-center">
                <Globe size={24} className="mr-2 text-orange-600" /> Select Language
              </h3>
              <button onClick={() => setPreviewType(null)} className="p-2 hover:bg-slate-100 rounded-full text-slate-500">
                <X size={24} />
              </button>
            </div>
            <div className="grid grid-cols-1 gap-4">
              <button onClick={() => setSelectedLang('english')} className="flex items-center justify-between p-4 rounded-xl border-2 border-slate-100 hover:border-orange-500 hover:bg-orange-50 transition-all group">
                <span className="font-bold text-slate-700 group-hover:text-orange-700">English</span>
                <span className="text-xs text-slate-400 font-mono">ENG</span>
              </button>
              <button onClick={() => setSelectedLang('hindi')} className="flex items-center justify-between p-4 rounded-xl border-2 border-slate-100 hover:border-orange-500 hover:bg-orange-50 transition-all group">
                <span className="font-bold text-slate-700 group-hover:text-orange-700">Hindi (हिंदी)</span>
                <span className="text-xs text-slate-400 font-mono">HIN</span>
              </button>
              <button onClick={() => setSelectedLang('marathi')} className="flex items-center justify-between p-4 rounded-xl border-2 border-slate-100 hover:border-orange-500 hover:bg-orange-50 transition-all group">
                <span className="font-bold text-slate-700 group-hover:text-orange-700">Marathi (मराठी)</span>
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
              occupation: 'Institution',
              phone: formData.phone,
              email: formData.email,
              aadhaar: formData.aadhaar,
              pan: formData.pan,
              address: formData.address,
              district: '',
              state: '',
              pincode: '',
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
            },
            manager: {
              managerName: formData.managerName || '',
              managerPosition: formData.managerPosition || '',
              managerPhone: formData.managerPhone || '',
            }
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
