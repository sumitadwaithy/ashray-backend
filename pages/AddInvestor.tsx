
import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, Save, User, Eye, EyeOff, Copy, Check, Lock, Sparkles, CreditCard, Percent, Building2, Landmark, Users, MapPin, Shield, RefreshCw, 
  Phone, Mail, FileText, Upload, Wallet, Globe, X, FileCheck, Printer, Plus 
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { dbService } from '../services/db';
import { generateCredentials } from '../services/CredentialsEngine';
import { Property, BankProfile, CompanyAddress, TransactionType, TransactionCategory, PaymentMethod } from '../types';
import { AgreementPreview } from '../components/AgreementTemplates';

export const AddInvestor: React.FC = () => {
  const navigate = useNavigate();
  const [properties, setProperties] = useState<Property[]>([]);
  const [kissans, setKissans] = useState<any[]>([]);
  const [banks, setBanks] = useState<BankProfile[]>([]);
  const [officeAddresses, setOfficeAddresses] = useState<CompanyAddress[]>([]);
  const [showPassword, setShowPassword] = useState(false);
  const [copiedField, setCopiedField] = useState<'username' | 'password' | null>(null);
  const [justGenerated, setJustGenerated] = useState(false);
  const [agreementGenerated, setAgreementGenerated] = useState(false);
  const [managers, setManagers] = useState<any[]>([]);
  const [companySettings, setCompanySettings] = useState<any>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [folders, setFolders] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedFolder, setSelectedFolder] = useState<string>('');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewType, setPreviewType] = useState<'agreement' | 'token' | null>(null);
  const [selectedLang, setSelectedLang] = useState<'english' | 'hindi' | 'marathi' | null>(null);
  const [previewId, setPreviewId] = useState<string>('');

  const [formData, setFormData] = useState({
    title: 'Mr.',
    name: '',
    fatherName: '',
    occupation: '',
    dob: '',
    age: '',
    gender: '',
    phone: '',
    countryCode: '+91',
    email: '',
    address: '',
    district: '',
    state: '',
    pincode: '',
    officeAddress: '',
    username: '',
    password: '',
    pan: '',
    aadhaar: '',
    gsi: '',
    gstin: '', // added for parity
    interestRate: '',
    bankName: '',
    accountNumber: '',
    ifscCode: '',
    
    // Dynamic Nominees
    nominees: [
      { name: '', dob: '', age: '', relation: '', aadhaar: '' }
    ],

    // Investment Portfolio
    propertyType: 'Residential Plot', 
    investedPropertyId: '', // Selected Project/Land
    selectedPlotId: '',
    
    // Legacy fields (for compatibility)
    nomineeName: '',
    totalAmount: '',
    emiDuration: '12',
    bookingDate: new Date().toISOString().split('T')[0],
    bookingDay: { en: '', hi: '', mr: '' },

    // Settings ids
    categoryId: '',
    folderId: '',
    companyAddressId: '',
    managerId: '',
    
    // Office details
    officeDistrict: '',
    officeState: '',
    officePincode: '',
    officeLocality: '',

    // Manager details
    managerName: '',
    managerPosition: '',
    managerPhone: '',
    managerAddress: '',
    managerPAN: '',
    managerAadhaar: '',
    managerCountryCode: '',

    splitPayments: [
      { amount: '', mode: 'Cash', reference: '', bankId: '' }
    ],
    investorId: ''
  });

  useEffect(() => {
    if (!formData.investorId) {
      dbService.peekId('IID', formData.bookingDate).then(id => {
        setPreviewId(id);
      });
    }
  }, [formData.bookingDate, formData.investorId]);

  const selectedProperty = properties.find(p => p.id === formData.investedPropertyId);
  const selectedKissan = kissans.find(k => `kissan_${k.id}` === formData.investedPropertyId);
  const selectedPlot = selectedProperty?.inventory?.find(
    (p: any) => p.id === formData.selectedPlotId
  );

  const propertyTypes = [
    { id: 'Residential Plot', label: 'Residential Plot', icon: MapPin, color: 'text-blue-600', bg: 'bg-blue-50' },
    { id: 'Commercial', label: 'Commercial', icon: Building2, color: 'text-amber-600', bg: 'bg-amber-50' },
    { id: 'Industrial Plot', label: 'Industrial Plot', icon: Landmark, color: 'text-purple-600', bg: 'bg-purple-50' },
    { id: 'Agricultural Land', label: 'Agricultural Land', icon: Globe, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { id: 'Layout', label: 'Layout / Township', icon: Users, color: 'text-rose-600', bg: 'bg-rose-50' },
    { id: 'Villa', label: 'Villa / Raw House', icon: Shield, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { id: 'Apartment', label: 'Apartment / Flat', icon: Building2, color: 'text-cyan-600', bg: 'bg-cyan-50' },
  ];

  useEffect(() => {
    const loadData = async () => {
      const [props, bks, cats, flds, settings, kins] = await Promise.all([
        dbService.getProperties(),
        dbService.getBanks(),
        dbService.getCategories(),
        dbService.getFolders(),
        dbService.getSettings(),
        dbService.getKissans()
      ]);

      setProperties(props);
      setKissans(kins || []);
      setBanks(bks);
      setCategories(Array.isArray(cats) ? cats : []);
      setFolders(Array.isArray(flds) ? flds : []);
      setCompanySettings(settings);
      setOfficeAddresses(settings.companyAddresses || []);
      setManagers(settings.managers || []);
    };

    loadData();
  }, []);

  const getDayName = (dateStr: string) => {
    if (!dateStr) return { en: '', hi: '', mr: '' };
    const d = new Date(dateStr);
    return {
      en: d.toLocaleDateString('en-US', { weekday: 'long' }),
      hi: ['रविवार','सोमवार','मंगलवार','बुधवार','गुरुवार','शुक्रवार','शनिवार'][d.getDay()],
      mr: ['रविवार','सोमवार','मंगळवार','बुधवार','गुरुवार','शुक्रवार','शनिवार'][d.getDay()]
    };
  };

  const calculateAge = (dob: string) => {
    if (!dob) return '';
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age > 0 ? age.toString() : '0';
  };

  const generateUsername = (fullName: string): string => {
    if (!fullName.trim()) return '';
    const parts = fullName
      .trim()
      .toLowerCase()
      .replace(/[^a-z\s]/g, '')
      .split(/\s+/)
      .filter(Boolean);
  
    if (parts.length === 0) return '';
    if (parts.length === 1) return parts[0].slice(0, 20);
    return `${parts[0]}.${parts[1]}`.slice(0, 20);
  };
  
  /**
   * Generates a strong memorable password:
   * Pattern: Word + Number + Symbol  e.g. "Tiger@4821"
   */
  const generatePassword = (): string => {
    const adjectives = [
      'Tiger', 'Eagle', 'Storm', 'Blaze', 'Frost',
      'Swift', 'Stone', 'Solar', 'Lunar', 'Nexus',
      'Prime', 'Valor', 'Forge', 'Drake', 'Atlas'
    ];
    const symbols = ['@', '#', '!', '$', '&'];
    const word = adjectives[Math.floor(Math.random() * adjectives.length)];
    const num = Math.floor(1000 + Math.random() * 9000);
    const sym = symbols[Math.floor(Math.random() * symbols.length)];
    return `${word}${sym}${num}`;
  };
  
  /**
   * Password strength: 0 (empty) → 4 (very strong)
   */
  const getPasswordStrength = (pwd: string): { score: number; label: string; color: string } => {
    if (!pwd) return { score: 0, label: '', color: '' };
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
  
    if (score <= 1) return { score, label: 'Weak', color: '#ef4444' };
    if (score === 2) return { score, label: 'Fair', color: '#f59e0b' };
    if (score === 3) return { score, label: 'Good', color: '#3b82f6' };
    return { score, label: 'Strong', color: '#22c55e' };
  };
  
    // ── Auto-generate both username + password ──
    const handleAutoGenerate = () => {
    const { username, password } = generateCredentials(
    formData.name,
    formData.dob
  );
    setFormData(prev => ({ ...prev, username, password }));
    setJustGenerated(true);
    setTimeout(() => setJustGenerated(false), 2000);
  };
  
    // ── Copy to clipboard ──
    const handleCopy = async (field: 'username' | 'password') => {
    const value = field === 'username' ? formData.username : formData.password;
      if (!value) return;
      await navigator.clipboard.writeText(value);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name === 'dob') {
      const age = calculateAge(value);
      setFormData(prev => ({ ...prev, dob: value, age }));
    } else if (name === 'bookingDate') {
      const day = getDayName(value);
      setFormData(prev => ({ ...prev, bookingDate: value, bookingDay: day }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const updateNominee = (index: number, field: string, value: string) => {
    const newNominees = [...formData.nominees];
    const nominee = { ...newNominees[index], [field]: value };
    
    if (field === 'dob') {
      nominee.age = calculateAge(value);
    }
    
    newNominees[index] = nominee;
    setFormData(prev => ({ ...prev, nominees: newNominees }));
  };

  const addNominee = () => {
    setFormData(prev => ({
      ...prev,
      nominees: [...prev.nominees, { name: '', dob: '', age: '', relation: '', aadhaar: '' }]
    }));
  };

  const removeNominee = (index: number) => {
    if (formData.nominees.length <= 1) return;
    setFormData(prev => ({
      ...prev,
      nominees: prev.nominees.filter((_, i) => i !== index)
    }));
  };

  const handlePropertyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const propId = e.target.value;
    setFormData(prev => ({ ...prev, investedPropertyId: propId, selectedPlotId: '' }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setSelectedFiles(Array.from(e.target.files));
    }
  };

  const handleGenerateClick = (type: 'investor_agreement' | 'token') => {
    setPreviewType(type);
    setSelectedLang(null);
  };

  const updateSplitPayment = (index: number, field: string, value: string) => {
    const newPayments = [...formData.splitPayments];
    newPayments[index] = { ...newPayments[index], [field]: value };
    
    setFormData(prev => ({ ...prev, splitPayments: newPayments }));
  };

  const addSplitPayment = () => {
    setFormData(prev => ({
      ...prev,
      splitPayments: [...prev.splitPayments, { amount: '', mode: 'Cash', reference: '', bankId: '' }]
    }));
  };

  const removeSplitPayment = (index: number) => {
    if (formData.splitPayments.length <= 1) return;
    const newPayments = formData.splitPayments.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, splitPayments: newPayments }));
  };

  const totalTokenAmount = formData.splitPayments.reduce((sum, p) => sum + Number(p.amount || 0), 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 0. Generate Serial and Investor ID
    const investorId = formData.investorId || await dbService.generateId('IID', formData.bookingDate);
    
    const bookingDate = formData.bookingDate || new Date().toISOString().split('T')[0];
    
    // 1. Save the Investor
    const totalInvestmentAmount = Number(formData.totalAmount) || totalTokenAmount;
    
    await dbService.saveInvestor({
      ...formData,
      id: investorId,
      age: formData.age ? Number(formData.age) : undefined,
      interestRate: formData.interestRate ? Number(formData.interestRate) : 0,
      investedPropertyName: selectedProperty?.title || selectedKissan?.landName || '',
      investedPropertyId: formData.investedPropertyId,
      totalAmount: totalInvestmentAmount,
      
      totalInvested: totalTokenAmount, // Actual cash paid in
      totalInterestAccrued: 0,
      totalReturns: 0,
      currentBalance: totalTokenAmount, 
      
      nominees: formData.nominees.map(n => ({
        ...n,
        age: n.age ? Number(n.age) : 0
      })),
      
      status: 'Active',
      joinDate: bookingDate,
      categoryId: formData.categoryId,
      folderId: formData.folderId,
      categoryName: formData.categoryName,
      folderName: formData.folderName
    } as any);

    // 1.5 Handle Agricultural Land (Kissan) if selected
    if (selectedKissan) {
      await dbService.saveKissan({
        ...selectedKissan,
        status: 'Sold', // Mark it as tied to an investor
        investorId: investorId,
        investorName: formData.name
      });
    }

    // 2. Handle Split Payments (Transactions)
    const pendingReceiptsToAdd = [];
    if (totalTokenAmount > 0) {
      for (let i = 0; i < formData.splitPayments.length; i++) {
        const payment = formData.splitPayments[i];
        if (!payment.amount || Number(payment.amount) <= 0) continue;

        let method = PaymentMethod.CASH;
        if (payment.mode === 'UPI') method = PaymentMethod.UPI;
        if (payment.mode === 'Bank Transfer') method = PaymentMethod.BANK_TRANSFER;
        if (payment.mode === 'Cheque') method = PaymentMethod.CHEQUE;
        if (payment.mode === 'RTGS/NEFT') method = PaymentMethod.RTGS;

        const txId = `tx-investor-${Date.now()}-${i}`;
        await dbService.saveTransaction({
          id: txId,
          date: bookingDate,
          particulars: `Investor Investment (${payment.mode}): ${selectedProperty?.title || selectedKissan?.landName || ''}${selectedPlot ? ` - Plot ${selectedPlot.plotNumber}` : ''} from ${formData.name}`,
          amount: Number(payment.amount),
          type: TransactionType.CREDIT,
          category: TransactionCategory.CAPITAL_INJECTION,
          method: method,
          bankId: payment.bankId || undefined,
          referenceId: payment.reference || `INV-${Date.now()}-${i}`,
          investorId: investorId,
          propertyId: formData.investedPropertyId,
          balanceAfter: 0, // Ledger engine usually calculates this
          synced: true
        });

        pendingReceiptsToAdd.push({
          id: `pr_${Date.now()}_${i}`,
          transactionId: txId,
          payeeName: formData.name,
          amount: Number(payment.amount),
          date: bookingDate,
          partyType: 'Investor',
          partyId: investorId,
          printed: false
        });
      }
    }

    if (pendingReceiptsToAdd.length > 0) {
      const existingReceipts = JSON.parse(localStorage.getItem('pending_receipts') || '[]');
      localStorage.setItem('pending_receipts', JSON.stringify([...existingReceipts, ...pendingReceiptsToAdd]));
      Promise.all(pendingReceiptsToAdd.map(r => dbService.savePendingReceipt(r).catch(err => console.error('Failed to save pending receipt:', err))));
      localStorage.removeItem('pending_receipts_remind_after');
    }

    // 3. Update plot status if selected
    if (formData.investedPropertyId && formData.selectedPlotId) {
      await dbService.assignPlotToClient(
        formData.investedPropertyId,
        formData.selectedPlotId,
        investorId,
        {
          name: formData.name,
          phone: `${formData.countryCode}${formData.phone}`,
          amount: Number(totalTokenAmount || 0),
          status: 'Reserved'
        }
      );
    }

    // 4. Save uploaded documents
    if (selectedFiles.length > 0) {
      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i];
        
        try {
          const reader = new FileReader();
          
          const base64Promise = new Promise<string>((resolve, reject) => {
            reader.onload = () => {
              if (typeof reader.result === 'string') {
                resolve(reader.result);
              } else {
                reject(new Error('Base64 conversion failed'));
              }
            };
            reader.onerror = () => reject(new Error('FileReader error'));
            reader.readAsDataURL(file);
          });
          
          const base64Data = await base64Promise;
          
          await dbService.saveDoc({
            id: `doc_${Date.now()}_${i}`,
            name: file.name,
            date: new Date().toISOString().split('T')[0],
            size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
            type: file.type.includes('pdf') ? 'pdf' : 'img',
            synced: false,
            category: 'INVESTOR',
            investorId: investorId,
            propertyId: formData.investedPropertyId || undefined,
            fileData: base64Data,
            folder_id: formData.folderId || undefined,
            category_id: formData.categoryId || undefined,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });
        } catch (error) {
          console.error('Upload error:', error);
        }
      }
    }

    // 5. Update File History if file manager used
    if (formData.folderId) {
      try {
        await dbService.updateInvestorFileHistory(investorId);
      } catch (error) {
        console.error('History save error:', error);
      }
    }

    // 🔥 Add to pending agreements if skipped
    setTimeout(() => {
      try {
        if (!agreementGenerated) {
          const pendingAgreementsStr = localStorage.getItem('pending_agreements');
          let pendingAgreements = [];
          try {
            pendingAgreements = pendingAgreementsStr ? JSON.parse(pendingAgreementsStr) : [];
          } catch (e) {
            console.error('Failed to parse pending_agreements:', e);
            pendingAgreements = [];
          }
          pendingAgreements.push({
        id: `pa_${Date.now()}`,
        partyId: investorId,
        partyName: formData.name,
        partyType: 'Investor',
        date: bookingDate,
        printed: false,
        previewData: {
          client: {
            title: formData.title,
            name: formData.name,
            age: formData.age,
            gender: formData.gender,
            fatherName: formData.fatherName || '',
            occupation: formData.occupation,
            phone: `${formData.countryCode}${formData.phone}`,
            email: formData.email,
            aadhaar: formData.aadhaar,
            pan: formData.pan,
            address: formData.address,
            district: formData.district,
            state: formData.state,
            pincode: formData.pincode,
            folderSerial: formData.folderSerial || '',
            clientId: investorId,
            nominee1Name: formData.nominees[0]?.name || '',
            nominee1Age: formData.nominees[0]?.age || '',
            nominee1Occupation: formData.nominees[0]?.relation || '',
            nominee1Aadhaar: formData.nominees[0]?.aadhaar || '',
            nominee2Name: formData.nominees[1]?.name || '',
            nominee2Age: formData.nominees[1]?.age || '',
            nominee2Occupation: formData.nominees[1]?.relation || '',
            nominee2Aadhaar: formData.nominees[1]?.aadhaar || '',
          },
          property: {
            projectName: selectedProperty?.title || selectedKissan?.landName || '',
            locality: selectedProperty?.locality || selectedKissan?.village || '',
            plotNumber: selectedPlot?.plotNumber || '',
            area: selectedPlot?.size || '',
            totalAmount: formData.totalAmount || totalTokenAmount || '',
            tokenAmount: totalTokenAmount || '',
            bookingDate: formData.bookingDate || '',
            paymentMode: formData.splitPayments[0]?.mode || 'Split',
            interestRate: formData.interestRate || '',
            emiDuration: formData.emiDuration || '',
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
        }
      });
      localStorage.setItem('pending_agreements', JSON.stringify(pendingAgreements));
      localStorage.removeItem('pending_agreements_remind_after');
      window.dispatchEvent(new Event('storage'));
        }
      } catch (e) {
        console.error('Failed to save pending agreement:', e);
      }
    }, 0);
    
    alert(`✅ Investor Saved Successfully\nID: ${investorId}`);
    navigate('/investors');
  };

  return (
    <div className="max-w-4xl mx-auto pb-10">
      <div className="flex items-center mb-6">
        <Link to="/investors" className="p-2 mr-2 hover:bg-slate-200 rounded-full">
          <ArrowLeft size={20} className="text-slate-600" />
        </Link>
        <h1 className="text-xl font-bold text-slate-800">Add New Investor</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Section 1: Personal Information */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center">
            <User size={20} className="mr-2 text-brand-500" /> Personal Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
              <div className="flex gap-2">
                <select 
                  name="title"
                  className="border border-slate-300 rounded-lg px-2 py-2 focus:ring-2 focus:ring-brand-500 outline-none bg-white text-slate-900"
                  value={formData.title} onChange={handleChange}
                >
                  <option value="Mr.">Mr.</option>
                  <option value="Mrs.">Mrs.</option>
                  <option value="Ms.">Ms.</option>
                  <option value="Shri">Shri</option>
                  <option value="Smt.">Smt.</option>
                  <option value="Dr.">Dr.</option>
                </select>
                <input 
                  type="text" name="name" required placeholder="e.g. John Doe"
                  className="flex-1 border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-brand-500 outline-none bg-white text-slate-900"
                  value={formData.name} onChange={handleChange}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Father's / Husband's Name</label>
              <input 
                type="text" name="fatherName" placeholder="e.g. Robert Doe"
                className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-brand-500 outline-none bg-white text-slate-900"
                value={formData.fatherName} onChange={handleChange}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Occupation</label>
              <input 
                type="text" name="occupation" placeholder="e.g. Business"
                className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-brand-500 outline-none bg-white text-slate-900"
                value={formData.occupation} onChange={handleChange}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Date of Birth</label>
              <input 
                type="date" name="dob"
                className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-brand-500 outline-none bg-white text-slate-900"
                value={formData.dob} onChange={handleChange}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Age</label>
              <input 
                type="number" name="age" placeholder="e.g. 35"
                className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-brand-500 outline-none bg-white text-slate-900"
                value={formData.age} onChange={handleChange}
              />
            </div>
            <div>
  <label className="block text-sm font-medium text-slate-700 mb-1">Gender</label>
  <select
    name="gender"
    className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-brand-500 outline-none bg-white text-slate-900"
    value={formData.gender}
    onChange={handleChange}
  >
    <option value="">Select Gender</option>
    <option value="Male">Male</option>
    <option value="Female">Female</option>
    <option value="Other">Other</option>
  </select>
</div>
            <div>
  <label className="block text-sm font-medium text-slate-700 mb-1">Phone Number</label>

  <div className="flex gap-2">
    
    {/* Country Code Selector */}
    <select
      name="countryCode"
      className="border border-slate-300 rounded-lg px-2 py-2 bg-white text-slate-900"
      value={formData.countryCode}
      onChange={handleChange}
    >
      <option value="+91">+91 (India)</option>
<option value="+1">+1 (USA)</option>
<option value="+44">+44 (UK)</option>
<option value="+971">+971 (UAE)</option>
<option value="+61">+61 (Australia)</option>
<option value="+81">+81 (Japan)</option>
<option value="+49">+49 (Germany)</option>
<option value="+33">+33 (France)</option>
<option value="+86">+86 (China)</option>
<option value="+92">+92 (Pakistan)</option>
<option value="+880">+880 (Bangladesh)</option>
<option value="+94">+94 (Sri Lanka)</option>
<option value="+977">+977 (Nepal)</option>
<option value="+7">+7 (Russia)</option>
<option value="+39">+39 (Italy)</option>
    </select>

    {/* Phone Input */}
    <input 
      type="tel"
      name="phone"
      required
      placeholder="9876543210"
      className="flex-1 border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-brand-500 outline-none bg-white text-slate-900"
      value={formData.phone}
      onChange={handleChange}
    />

  </div>
</div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
              <input 
                type="email" name="email" placeholder="john@example.com"
                className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-brand-500 outline-none bg-white text-slate-900"
                value={formData.email} onChange={handleChange}
              />
            </div>
          </div>
        </div>

          {/* Section 3: Address Information */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center">
              <MapPin size={20} className="mr-2 text-brand-500" /> Address Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">Full Address</label>
                <input 
                  type="text" name="address" placeholder="House No, Street, Landmark"
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-brand-500 outline-none bg-white text-slate-900"
                  value={formData.address} onChange={handleChange}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">District</label>
                <input 
                  type="text" name="district" placeholder="District"
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-brand-500 outline-none bg-white text-slate-900"
                  value={formData.district} onChange={handleChange}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">State</label>
                <select 
                  name="state"
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-brand-500 outline-none bg-white text-slate-900"
                  value={formData.state} onChange={handleChange}
                >
                  <option value="">Select State</option>
                  <option value="Andhra Pradesh">Andhra Pradesh</option>
                  <option value="Arunachal Pradesh">Arunachal Pradesh</option>
                  <option value="Assam">Assam</option>
                  <option value="Bihar">Bihar</option>
                  <option value="Chhattisgarh">Chhattisgarh</option>
                  <option value="Goa">Goa</option>
                  <option value="Gujarat">Gujarat</option>
                  <option value="Haryana">Haryana</option>
                  <option value="Himachal Pradesh">Himachal Pradesh</option>
                  <option value="Jharkhand">Jharkhand</option>
                  <option value="Karnataka">Karnataka</option>
                  <option value="Kerala">Kerala</option>
                  <option value="Madhya Pradesh">Madhya Pradesh</option>
                  <option value="Maharashtra">Maharashtra</option>
                  <option value="Manipur">Manipur</option>
                  <option value="Meghalaya">Meghalaya</option>
                  <option value="Mizoram">Mizoram</option>
                  <option value="Nagaland">Nagaland</option>
                  <option value="Odisha">Odisha</option>
                  <option value="Punjab">Punjab</option>
                  <option value="Rajasthan">Rajasthan</option>
                  <option value="Sikkim">Sikkim</option>
                  <option value="Tamil Nadu">Tamil Nadu</option>
                  <option value="Telangana">Telangana</option>
                  <option value="Tripura">Tripura</option>
                  <option value="Uttar Pradesh">Uttar Pradesh</option>
                  <option value="Uttarakhand">Uttarakhand</option>
                  <option value="West Bengal">West Bengal</option>
                  <option value="Andaman and Nicobar Islands">Andaman and Nicobar Islands</option>
                  <option value="Chandigarh">Chandigarh</option>
                  <option value="Dadra and Nagar Haveli and Daman and Diu">Dadra and Nagar Haveli and Daman and Diu</option>
                  <option value="Delhi">Delhi</option>
                  <option value="Jammu and Kashmir">Jammu and Kashmir</option>
                  <option value="Ladakh">Ladakh</option>
                  <option value="Lakshadweep">Lakshadweep</option>
                  <option value="Puducherry">Puducherry</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Pincode</label>
                <input 
                  type="text" name="pincode" placeholder="e.g. 440001"
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-brand-500 outline-none bg-white text-slate-900"
                  value={formData.pincode} onChange={handleChange}
                />
              </div>
            </div>
          </div>

          {/* Section: Login Credentials */}
<div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
  <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-indigo-50 to-slate-50 border-b border-slate-100">
    <div className="flex items-center gap-2">
      <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
        <Shield size={16} className="text-indigo-600" />
      </div>
      <div>
        <h2 className="text-sm font-bold text-slate-800 leading-tight">Login Credentials</h2>
        <p className="text-[10px] text-slate-400 leading-tight">Username & password for portal access</p>
      </div>
    </div>
    <button
      type="button"
      onClick={handleAutoGenerate}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-wider transition-all duration-300 select-none ${
        justGenerated
          ? 'bg-green-500 text-white shadow-md shadow-green-200'
          : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm'
      }`}
    >
      {justGenerated
        ? <><Check size={11} /> Generated!</>
        : <><Sparkles size={11} /> Auto-Generate</>
      }
    </button>
  </div>

  <div className="p-6 space-y-5">
    {formData.name && (
      <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 rounded-xl border border-slate-100">
        <User size={13} className="text-slate-400 shrink-0" />
        <span className="text-[11px] text-slate-500">
          Generating credentials for: <span className="font-bold text-slate-700">{formData.name}</span>
        </span>
      </div>
    )}

    {/* Username */}
    <div>
      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
        Login ID (Username)
      </label>
      <div className="relative flex items-center">
        <div className="absolute left-3 text-slate-400">
          <User size={15} />
        </div>
        <input
          type="text"
          name="username"
          placeholder="e.g. ramesh.kumar"
          className="w-full pl-9 pr-10 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition-all"
          value={formData.username}
          onChange={handleChange}
        />
        <button
          type="button"
          onClick={() => handleCopy('username')}
          disabled={!formData.username}
          className="absolute right-3 text-slate-300 hover:text-indigo-500 transition-colors disabled:opacity-30"
        >
          {copiedField === 'username' ? <Check size={15} className="text-green-500" /> : <Copy size={15} />}
        </button>
      </div>
      <p className="text-[10px] text-slate-400 mt-1 ml-1">
        Auto-fills as <span className="font-semibold">firstname.lastname</span> from Full Name
      </p>
    </div>

    {/* Password */}
    <div>
      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
        Password
      </label>
      <div className="relative flex items-center">
        <div className="absolute left-3 text-slate-400">
          <Lock size={15} />
        </div>
        <input
          type={showPassword ? 'text' : 'password'}
          name="password"
          placeholder="Generate or type a password"
          className="w-full pl-9 pr-20 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition-all font-mono tracking-widest"
          value={formData.password}
          onChange={handleChange}
        />
        <div className="absolute right-3 flex items-center gap-2">
          <button
            type="button"
            onClick={() => handleCopy('password')}
            disabled={!formData.password}
            className="text-slate-300 hover:text-indigo-500 transition-colors disabled:opacity-30"
          >
            {copiedField === 'password' ? <Check size={15} className="text-green-500" /> : <Copy size={15} />}
          </button>
          <button
            type="button"
            onClick={() => setShowPassword(v => !v)}
            className="text-slate-300 hover:text-indigo-500 transition-colors"
          >
            {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
          </button>
        </div>
      </div>
    </div>

    {/* Regenerate password only */}
    <button
      type="button"
      onClick={() => {
        const { password } = generateCredentials(
         formData.name,
         formData.dob
       );
        setFormData(prev => ({ ...prev, password }));
      }}
      className="w-full flex items-center justify-center gap-2 py-2 rounded-xl border border-dashed border-indigo-200 text-indigo-500 text-xs font-bold hover:bg-indigo-50 hover:border-indigo-400 transition-all"
    >
      <RefreshCw size={12} /> Regenerate Password Only
    </button>
  </div>
</div>


        {/* Bank & Financial Info */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center">
            <Landmark size={20} className="mr-2 text-brand-500" /> Bank & Financial Details
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Bank Name</label>
              <input 
                type="text" name="bankName" placeholder="e.g. HDFC Bank"
                className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-brand-500 outline-none bg-white text-slate-900"
                value={formData.bankName} onChange={handleChange}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Account Number</label>
              <input 
                type="text" name="accountNumber" placeholder="Account Number"
                className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-brand-500 outline-none bg-white text-slate-900"
                value={formData.accountNumber} onChange={handleChange}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">IFSC Code</label>
              <input 
                type="text" name="ifscCode" placeholder="IFSC Code"
                className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-brand-500 outline-none bg-white text-slate-900 uppercase"
                value={formData.ifscCode} onChange={handleChange}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">PAN Card Number</label>
              <input 
                type="text" name="pan" placeholder="ABCDE1234F"
                className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-brand-500 outline-none bg-white text-slate-900 uppercase"
                value={formData.pan} onChange={handleChange}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Aadhaar Number</label>
              <input 
                type="text" name="aadhaar" placeholder="1234-5678-9012"
                className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-brand-500 outline-none bg-white text-slate-900"
                value={formData.aadhaar} onChange={handleChange}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">GSI Number</label>
              <input 
                type="text" name="gsi" placeholder="GST Number / GSI"
                className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-brand-500 outline-none bg-white text-slate-900 uppercase"
                value={formData.gsi} onChange={handleChange}
              />
            </div>
          </div>
        </div>


        {/* Section 2: Investment Selection */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h2 className="text-lg font-bold text-slate-800 flex items-center">
                <Globe size={20} className="mr-2 text-red-600" /> Investment Selection
              </h2>
            </div>
            {formData.investedPropertyId && (
              <button 
                type="button"
                onClick={() => setFormData(p => ({ ...p, investedPropertyId: '', selectedPlotId: '' }))}
                className="text-[10px] bg-slate-100 text-slate-600 px-2 py-1 rounded font-bold uppercase hover:bg-slate-200 transition-colors"
              >
                Reset
              </button>
            )}
          </div>

          <div className="mb-6">
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">1. Property Type</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
              {propertyTypes.map((type) => (
                <button
                  key={type.id}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, propertyType: type.id, investedPropertyId: '', selectedPlotId: '' }))}
                  className={`relative flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all duration-200 gap-1.5 group ${
                    formData.propertyType === type.id 
                      ? `border-slate-800 ${type.bg} ${type.color}` 
                      : 'border-slate-100 bg-white text-slate-400 hover:border-slate-200 hover:text-slate-600'
                  }`}
                >
                  <type.icon size={18} />
                  <span className="text-[9px] font-bold uppercase text-center leading-tight">{type.label}</span>
                </button>
              ))}
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="space-y-2">
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                2. Project / Khata
              </label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <select 
                  name="investedPropertyId"
                  className="w-full pl-10 border border-slate-200 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-slate-100 focus:border-slate-900 outline-none bg-slate-50/50 text-slate-900 text-sm font-semibold transition-all appearance-none cursor-pointer"
                  value={formData.investedPropertyId}
                  onChange={handlePropertyChange}
                >
                  <option value="">-- Choose {formData.propertyType === 'Agricultural Land' ? 'Land Khata' : 'Project'} --</option>
                  {formData.propertyType === 'Agricultural Land' ? (
                    kissans.map(k => (
                      <option key={k.id} value={`kissan_${k.id}`}>{k.landName} - {k.village}</option>
                    ))
                  ) : (
                    properties
                      .filter(p => p.type === formData.propertyType)
                      .map(p => (
                        <option key={p.id} value={p.id}>{p.title} ({p.locality})</option>
                      ))
                  )}
                </select>
              </div>
            </div>

            {formData.propertyType !== 'Agricultural Land' ? (
              <div className="space-y-2">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  3. {['Villa', 'Apartment'].includes(formData.propertyType) ? 'Unit No.' : 'Plot Number'}
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <select 
                    name="selectedPlotId"
                    className="w-full pl-10 border border-slate-200 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-slate-100 focus:border-slate-900 outline-none bg-slate-50/50 text-slate-900 text-sm font-semibold transition-all appearance-none cursor-pointer"
                    value={formData.selectedPlotId}
                    onChange={handleChange}
                    disabled={!formData.investedPropertyId}
                  >
                    <option value="">-- Choose {['Villa', 'Apartment'].includes(formData.propertyType) ? 'Unit' : 'Plot'} --</option>
                    {selectedProperty?.inventory?.filter((p: any) => p.status === 'Available').map((p: any) => (
                      <option key={p.id} value={p.id}>
                        {['Villa', 'Apartment'].includes(formData.propertyType) ? `Unit ${p.plotNumber}` : `Plot ${p.plotNumber}`} 
                        {' '}({p.size} sqft)
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">3. Land Capacity</label>
                {selectedKissan ? (
                  <div className="bg-emerald-50 border border-emerald-100 p-2.5 rounded-lg flex items-center justify-between">
                    <div>
                      <p className="text-[9px] font-bold text-emerald-600 uppercase">Area</p>
                      <p className="text-sm font-bold text-emerald-900">{selectedKissan.landArea}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[9px] font-bold text-emerald-600 uppercase">Valuation</p>
                      <p className="text-sm font-bold text-emerald-900">₹ {selectedKissan.totalLandValue?.toLocaleString()}</p>
                    </div>
                  </div>
                ) : (
                  <div className="bg-slate-50 border border-dashed border-slate-200 p-2.5 rounded-lg text-center text-slate-300 text-[10px] uppercase font-bold">
                    Select Khata
                  </div>
                )}
              </div>
            )}
          </div>
          
          <div className="mt-6 p-4 bg-slate-50 rounded-xl border border-slate-100">
            <div className="flex items-center gap-3">
              <RefreshCw size={16} className="text-slate-400 animate-spin-slow" />
              <p className="text-[10px] text-slate-500 font-medium">
                Actual returns will be indexed against market updates for <span className="text-slate-900 font-bold underline underline-offset-2">{selectedProperty?.title || selectedKissan?.landName || 'selected asset'}</span>.
              </p>
            </div>
          </div>
        </div>

        {/* Section 3: Booking & Payment Details */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-slate-800 flex items-center">
              <CreditCard size={20} className="mr-2 text-brand-500" /> Investment & Payment Details
            </h2>
            <button 
              type="button"
              onClick={addSplitPayment}
              className="text-xs bg-brand-50 text-brand-600 px-3 py-1.5 rounded-lg font-bold border border-brand-100 hover:bg-brand-100 transition-colors flex items-center"
            >
              <Plus size={14} className="mr-1" /> Add Split Payment
            </button>
          </div>

          <div className="space-y-6">
            {formData.splitPayments.map((payment, index) => (
              <div key={index} className="p-4 bg-slate-50/50 rounded-xl border border-slate-100 relative group">
                {formData.splitPayments.length > 1 && (
                  <button 
                    type="button"
                    onClick={() => removeSplitPayment(index)}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-100 text-red-600 rounded-full flex items-center justify-center shadow-sm hover:bg-red-200 transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <X size={14} />
                  </button>
                )}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Amount (₹)</label>
                    <input 
                      type="number" 
                      placeholder="e.g. 40000"
                      className="w-full border border-slate-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-brand-500 outline-none bg-white text-slate-900 text-sm"
                      value={payment.amount}
                      onChange={(e) => updateSplitPayment(index, 'amount', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Mode</label>
                    <select 
                      className="w-full border border-slate-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-brand-500 outline-none bg-white text-slate-900 text-sm"
                      value={payment.mode}
                      onChange={(e) => updateSplitPayment(index, 'mode', e.target.value)}
                    >
                      <option value="Cash">Cash</option>
                      <option value="Cheque">Cheque</option>
                      <option value="Bank Transfer">Bank Transfer</option>
                      <option value="UPI">UPI / Online</option>
                      <option value="RTGS/NEFT">RTGS / NEFT</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Bank Account</label>
                    <select 
                      className="w-full border border-slate-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-brand-500 outline-none bg-white text-slate-900 text-sm"
                      value={payment.bankId}
                      onChange={(e) => updateSplitPayment(index, 'bankId', e.target.value)}
                    >
                      <option value="">-- Select Bank --</option>
                      {banks.map(bank => (
                        <option key={bank.id} value={bank.id}>
                          {bank.bankName} ({(bank.accountNumber || '').slice(-4)})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Reference / TXN ID</label>
                    <input 
                      type="text" 
                      placeholder="Ref No."
                      className="w-full border border-slate-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-brand-500 outline-none bg-white text-slate-900 text-sm"
                      value={payment.reference}
                      onChange={(e) => updateSplitPayment(index, 'reference', e.target.value)}
                    />
                  </div>
                </div>
              </div>
            ))}

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 pt-4 border-t border-slate-100 items-end">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-2">ROI (%)</label>
                <div className="relative">
                  <Percent className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                  <input 
                    type="number" step="0.1" name="interestRate" placeholder="15"
                    className="w-full pl-9 border border-slate-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-slate-100 focus:border-slate-900 outline-none bg-white text-slate-900 text-sm font-bold"
                    value={formData.interestRate} onChange={handleChange}
                  />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-2">Total Investment (₹)</label>
                <div className="relative">
                   <Wallet className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-600" size={16} />
                   <input 
                    type="number" name="totalAmount" placeholder="0.00"
                    className="w-full pl-10 border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-brand-500 outline-none bg-white text-slate-900 font-bold text-sm"
                    value={formData.totalAmount || totalTokenAmount} 
                    onChange={handleChange}
                    required
                  />
                </div>
                {totalTokenAmount > 0 && Number(formData.totalAmount) !== totalTokenAmount && (
                  <p className="text-[9px] text-amber-600 mt-1 font-bold italic">
                    Note: Paid sum is ₹{totalTokenAmount.toLocaleString()}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-2">Investment Date</label>
                <input 
                  type="date" name="bookingDate"
                  className="w-full border border-slate-300 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-brand-500 outline-none bg-white text-slate-900 text-sm font-semibold"
                  value={formData.bookingDate} onChange={handleChange}
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-2">EMI Duration</label>
                <select 
                  name="emiDuration"
                  className="w-full border border-slate-300 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-brand-500 outline-none bg-white text-slate-900 text-sm font-semibold"
                  value={formData.emiDuration} onChange={handleChange}
                >
                  <option value="6">6 Months</option>
                  <option value="12">12 Months</option>
                  <option value="18">18 Months</option>
                  <option value="24">24 Months</option>
                  <option value="36">36 Months</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Section: Bank Details */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center">
            <Wallet size={20} className="mr-2 text-brand-500" /> Bank Details (For Payouts)
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Bank Name</label>
              <input 
                type="text" name="bankName" placeholder="e.g. HDFC Bank"
                className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-brand-500 outline-none bg-white text-slate-900"
                value={formData.bankName} onChange={handleChange}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Account Number</label>
              <input 
                type="text" name="accountNumber" placeholder="Account Number"
                className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-brand-500 outline-none bg-white text-slate-900"
                value={formData.accountNumber} onChange={handleChange}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">IFSC Code</label>
              <input 
                type="text" name="ifscCode" placeholder="IFSC Code"
                className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-brand-500 outline-none bg-white text-slate-900 uppercase"
                value={formData.ifscCode} onChange={handleChange}
              />
            </div>
          </div>
        </div>

        {/* Section: Identity Details */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center">
            <CreditCard size={20} className="mr-2 text-brand-500" /> Identity Details
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Aadhaar Card Number</label>
              <input 
                type="text" name="aadhaar" placeholder="12-digit Aadhaar Number"
                className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-brand-500 outline-none bg-white text-slate-900"
                value={formData.aadhaar} onChange={handleChange}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">PAN Card Number</label>
              <input 
                type="text" name="pan" placeholder="10-character PAN"
                className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-brand-500 outline-none bg-white text-slate-900 uppercase"
                value={formData.pan} onChange={handleChange}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">GSTIN (Optional)</label>
              <input 
                type="text" name="gstin" placeholder="GST Number"
                className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-brand-500 outline-none bg-white text-slate-900 uppercase"
                value={formData.gstin} onChange={handleChange}
              />
            </div>
            <div className="md:col-span-2">
               <label className="block text-sm font-medium text-slate-700 mb-1">Upload Identity Documents (Aadhaar/PAN)</label>
               <div 
                 onClick={() => document.getElementById('file-upload')?.click()}
                 className="border-2 border-dashed border-slate-300 rounded-lg px-6 py-8 flex flex-col items-center justify-center text-slate-500 hover:bg-slate-50 cursor-pointer bg-white"
               >
                 <Upload size={32} className="mb-2 text-slate-400" />
                 <span className="text-sm font-medium">Click to upload or drag and drop</span>
                 <span className="text-xs text-slate-400 mt-1">PDF, JPG, PNG up to 5MB</span>
                 <input 
                   id="file-upload"
                   type="file" 
                   className="hidden" 
                   multiple 
                   onChange={handleFileChange}
                   accept=".pdf,.jpg,.jpeg,.png"
                 />
               </div>
               {selectedFiles.length > 0 && (
                 <div className="mt-4 space-y-2">
                   {selectedFiles.map((file, idx) => (
                     <div key={idx} className="flex items-center justify-between p-2 bg-slate-50 rounded-lg border border-slate-200">
                       <div className="flex items-center overflow-hidden">
                         <FileText size={16} className="text-slate-400 mr-2 shrink-0" />
                         <span className="text-sm text-slate-700 truncate">{file.name}</span>
                       </div>
                       <button 
                         type="button"
                         onClick={(e) => {
                           e.stopPropagation();
                           setSelectedFiles(prev => prev.filter((_, i) => i !== idx));
                         }}
                         className="text-slate-400 hover:text-red-500 ml-2"
                       >
                         <X size={16} />
                       </button>
                     </div>
                   ))}
                 </div>
               )}
            </div>
          </div>
        </div>

        {/* Section: Nominee Details */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold text-slate-800 flex items-center">
              <Users size={20} className="mr-2 text-brand-500" /> Nominee Details
            </h2>
            <button 
              type="button"
              onClick={addNominee}
              className="text-xs bg-brand-50 text-brand-600 px-3 py-1.5 rounded-lg font-bold border border-brand-100 hover:bg-brand-100 transition-colors flex items-center"
            >
              <Plus size={14} className="mr-1" /> Add Nominee
            </button>
          </div>
          
          <div className="space-y-6">
            {formData.nominees.map((nominee, index) => (
              <div key={index} className="p-5 border border-slate-100 rounded-xl bg-slate-50/30 relative group">
                {formData.nominees.length > 1 && (
                  <button 
                    type="button"
                    onClick={() => removeNominee(index)}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-100 text-red-600 rounded-full flex items-center justify-center shadow-sm hover:bg-red-200 transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <X size={14} />
                  </button>
                )}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-1">
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Full Name</label>
                    <input 
                      placeholder="Nominee Name" 
                      value={nominee.name} 
                      onChange={(e) => updateNominee(index, 'name', e.target.value)} 
                      className="w-full border border-slate-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-brand-500 outline-none bg-white text-slate-900 text-sm" 
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Date of Birth</label>
                    <input 
                      type="date" 
                      value={nominee.dob} 
                      onChange={(e) => updateNominee(index, 'dob', e.target.value)} 
                      className="w-full border border-slate-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-brand-500 outline-none bg-white text-slate-900 text-sm" 
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Age</label>
                    <input 
                      placeholder="Age" 
                      value={nominee.age} 
                      readOnly 
                      className="w-full border border-slate-200 rounded-lg px-3 py-2 bg-slate-100 text-slate-500 text-sm cursor-not-allowed" 
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Relation with Investor</label>
                    <input 
                      placeholder="e.g. Spouse, Son" 
                      value={nominee.relation} 
                      onChange={(e) => updateNominee(index, 'relation', e.target.value)} 
                      className="w-full border border-slate-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-brand-500 outline-none bg-white text-slate-900 text-sm" 
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Aadhaar Number</label>
                    <input 
                      placeholder="Aadhaar Number" 
                      value={nominee.aadhaar} 
                      onChange={(e) => updateNominee(index, 'aadhaar', e.target.value)} 
                      className="w-full border border-slate-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-brand-500 outline-none bg-white text-slate-900 text-sm" 
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Section: File Manager & Assignments */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
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
                onClick={() => handleGenerateClick('investor_agreement')}
                className="flex items-center justify-between p-4 rounded-xl border border-brand-100 bg-brand-50/30 hover:bg-brand-50 transition-all group"
              >
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-brand-100 rounded-full flex items-center justify-center text-brand-600 mr-3 group-hover:scale-110 transition-transform">
                    <FileText size={20} />
                  </div>
                  <div className="text-left">
                    <p className="font-bold text-slate-800 text-sm">Inestor Agreement</p>
                    <p className="text-[10px] text-slate-500">Draft legal agreement</p>
                  </div>
                </div>
                <Printer size={16} className="text-slate-400 group-hover:text-brand-600 transition-colors" />
              </button>

              
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4 pb-8">
          <button type="button" onClick={() => navigate('/investors')} className="mr-4 px-6 py-3 rounded-lg font-medium text-slate-600 hover:bg-slate-100">
            Cancel
          </button>
          <button type="submit" className="bg-brand-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-brand-700 flex items-center shadow-md">
            <Save size={18} className="mr-2" /> Save Investor
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
          onGenerate={() => setAgreementGenerated(true)}
          data={{
            client: {
              title: formData.title,
              name: formData.name,
              age: formData.age,
              gender: formData.gender,
              occupation: formData.occupation,
              phone: `${formData.countryCode}${formData.phone}`,
              email: formData.email,
              aadhaar: formData.aadhaar,
              pan: formData.pan,
              address: formData.address,
              district: formData.district,
              state: formData.state,
              pincode: formData.pincode,
              nominee1Name: formData.nominee1Name,
              nominee1Age: formData.nominee1Age,
              nominee1Occupation: formData.nominee1Occupation,
              nominee1Aadhaar: formData.nominee1Aadhaar,
              nominee2Name: formData.nominee2Name,
              nominee2Age: formData.nominee2Age,
              nominee2Occupation: formData.nominee2Occupation,
              nominee2Aadhaar: formData.nominee2Aadhaar,
              clientId: formData.investorId || previewId || 'TEMP-ID'
            },
            property: {
              projectName: selectedProperty?.title || selectedKissan?.landName || '',
              locality: selectedProperty?.locality || selectedKissan?.village || '',
              plotNumber: selectedPlot?.plotNumber || '',
              area: selectedPlot?.size || '',
              totalAmount: formData.totalAmount || '',
              tokenAmount: totalTokenAmount || '',
              bookingDate: formData.bookingDate || '',
              paymentMode: formData.splitPayments[0]?.mode || 'Split',
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
