
import React, { useState, useEffect } from 'react';
import { ArrowLeft, Save, User, Phone, Mail, Eye, EyeOff, Copy, Check, Lock, Sparkles, MapPin, CreditCard, FileText, Upload, Wallet, Shield, RefreshCw, FileCheck, Printer, Globe, X, AlertTriangle, Landmark, Plus } from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { dbService } from '../services/db';
import { Accounting } from '../services/accounting';
import { generateCredentials } from '../services/CredentialsEngine';
import { AgreementPreview } from '../components/AgreementTemplates';
import { numberToWords } from '../utils/numberToWords';
import { TransactionType, TransactionCategory, PaymentMethod, CompanyAddress, BankProfile } from '../types';

export const AddClient: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const [formData, setFormData] = useState({
    title: 'Mr.',
    name: '',
    fatherName: '',
    occupation: '',
    dob: '',
    age: '',
    gender: '',
    countryCode: '+91',
    manualCountryCode: '',
    phone: '',
    email: '',
    address: '',
    district: '',
    state: '',
    pincode: '',
    aadhaar: '',
    pan: '',
    gstin: '',
    username: '',
    password: '',
    bankName: '',
    accountNumber: '',
    ifscCode: '',
    nominee1Dob: '',
    nominee2Dob: '',
    nominee1Name: '',
    nominee1Age: '',
    nominee1Occupation: '',
    nominee1Aadhaar: '',
    nominee2Name: '',
    nominee2Age: '',
    nominee2Occupation: '',
    nominee2Aadhaar: '',

    // Property & Payment Details
    selectedPropertyId: '',
    selectedPlotId: '',
    bookingDate: new Date().toISOString().split('T')[0],
    bookingDay: { en: '', hi: '', mr: '' },
    totalAmount: '',
    emiDuration: '12',

    // File Manager Details
    categoryId: '',
    categoryCode: '',
    rangeStart: 0,
    rangeEnd: 0,
    tokenSerial: '',
    folderId: '',
    folderName: '',
    folderSerial: '',
    clientId: '',
    pinCode: '',
    companyAddressId: '',
    // COMPANY EXTRA (AUTO-FETCH DISPLAY)
    companyEmail: '',
    companyWebsite: '',
    companyentityType: '',
    companyAddress: '',
    companyDistrict: '',
    companyState: '',
    companyPincode: '',
    companyLocality: '',
    managerId: '',
    managerName: '',
    managerPosition: '',
    managerPhone: '',
    managerCountryCode: '',
    splitPayments: [
      { amount: '', mode: 'Cash', reference: '', bankId: '' }
    ],
  });

  const [properties, setProperties] = useState<any[]>([]);
  const [banks, setBanks] = useState<BankProfile[]>([]);
  const [selectedProperty, setSelectedProperty] = useState<any>(null);
  const selectedPlot = selectedProperty?.inventory?.find(
    (p: any) => p.id === formData.selectedPlotId
  );
  const [isTransfer, setIsTransfer] = useState(false);
  const [transferFrom, setTransferFrom] = useState<{ id: string; name: string } | null>(null);
  const [transferFee, setTransferFee] = useState(0);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [officeAddresses, setOfficeAddresses] = useState<CompanyAddress[]>([]);
  const [managers, setManagers] = useState<any[]>([]);
  const [previewId, setPreviewId] = useState<string>(''); // Added for ID peek
  const [companySettings, setCompanySettings] = useState<any>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [copiedField, setCopiedField] = useState<'username' | 'password' | null>(null);
  const [justGenerated, setJustGenerated] = useState(false);
  const [agreementGenerated, setAgreementGenerated] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
   // File Manager State
  const [categories, setCategories] = useState<any[]>([]);
  const [folders, setFolders] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedFolder, setSelectedFolder] = useState<string>('');
 
  useEffect(() => {
    dbService.getSettings().then(s => {
    console.log('🔥 SETTINGS IN ADD CLIENT:', s);
    setOfficeAddresses(s.companyAddresses || []);
    setManagers(s.managers || []);
    setCompanySettings(s);
    // 🔥 AUTO MAP COMPANY DATA
    setFormData(prev => ({
      ...prev,
      companyEmail: s.companyEmail || '',
      companyWebsite: s.companyWebsite || '',
      companyentityType: s.entityType || 'Sole Proprietorship'
    }));

  });

  // Fetch Banks
  dbService.getBanks().then(setBanks);
  }, []);

  useEffect(() => {
  if (formData.bookingDate && !formData.bookingDay?.en) {
    const day = getDayName(formData.bookingDate);

    setFormData(prev => ({
      ...prev,
      bookingDay: day
    }));
  }
}, []);

  useEffect(() => {
  const searchParams = new URLSearchParams(location.search);

  const prefilledName = searchParams.get('name');
  const prefilledPhone = searchParams.get('phone');
  const transferFromId = searchParams.get('transferFrom');
  const transferFromName = searchParams.get('transferFromName');
  const propertyId = searchParams.get('propertyId');
  const plotId = searchParams.get('plotId');
  const fee = searchParams.get('transferFee');

  // 🔹 PREFILL BASIC DATA
  if (prefilledName || prefilledPhone) {
    setFormData(prev => ({
      ...prev,
      name: prefilledName || prev.name,
      phone: prefilledPhone || prev.phone
    }));
  }

  // 🔹 TRANSFER LOGIC
  if (transferFromId && transferFromName) {
    setIsTransfer(true);
    setTransferFrom({ id: transferFromId, name: transferFromName });
    setTransferFee(Number(fee) || 0);

    setFormData(prev => ({
      ...prev,
      selectedPropertyId: propertyId || '',
      selectedPlotId: plotId || ''
    }));
  }

  // 🔹 FETCH PROPERTIES
  const fetchProperties = async () => {
    const props = await dbService.getProperties();
    setProperties(props);

    if (propertyId) {
      const prop = props.find(p => p.id === propertyId);
      setSelectedProperty(prop || null);
    }
  };

  // 🔹 FETCH FILE MANAGER (CATEGORIES + FOLDERS)
  const fetchFileManagerData = async () => {
    const cats = await dbService.getCategories();
    const flds = await dbService.getFolders();

    console.log('🔥 Categories:', cats);
    console.log('🔥 Folders:', flds);

    setCategories(Array.isArray(cats) ? cats : []);
    setFolders(Array.isArray(flds) ? flds : []);
  };

  // 🔹 EXECUTE
  fetchProperties();
  fetchFileManagerData();

}, [location.search]);


  useEffect(() => {
    // 🔥 PEEK CLIENT ID FOR NEW CLIENTS (PREVIEW ONLY)
    if (!formData.clientId) {
      dbService.peekId('CID', formData.bookingDate).then(id => {
        setPreviewId(id);
      });
    }
  }, [formData.bookingDate, formData.clientId]);

  const handlePropertyChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const propId = e.target.value;
    const prop = properties.find(p => p.id === propId);
    setSelectedProperty(prop);
    setFormData({ ...formData, selectedPropertyId: propId, selectedPlotId: '' });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setSelectedFiles(Array.from(e.target.files));
    }
  };

  const [previewType, setPreviewType] = useState<'agreement' | 'token' | null>(null);
  const [selectedLang, setSelectedLang] = useState<'english' | 'hindi' | 'marathi' | null>(null);

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
  const { name, value } = e.target;

  if (name === 'dob') {
    const age = calculateAge(value);
    setFormData({ ...formData, dob: value, age });
  }

  else if (name === 'nominee1Dob') {
    const age = calculateAge(value);
    setFormData({ ...formData, nominee1Dob: value, nominee1Age: age });
  }

  else if (name === 'nominee2Dob') {
    const age = calculateAge(value);
    setFormData({ ...formData, nominee2Dob: value, nominee2Age: age });
  }

  // 🔥 BOOKING DATE LOGIC (MUST BE BEFORE FINAL ELSE)
  else if (name === 'bookingDate') {
    const day = getDayName(value);

    setFormData({
      ...formData,
      bookingDate: value,
      bookingDay: day
    });
  }

  else {
    setFormData({ ...formData, [name]: value });
  }
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


  const handleGenerateClick = (type: 'agreement' | 'token') => {
    setPreviewType(type);
    setSelectedLang(null); // Reset language to show selection modal
  };

  const updateSplitPayment = (index: number, field: string, value: string) => {
    const newPayments = [...formData.splitPayments];
    newPayments[index] = { ...newPayments[index], [field]: value };
    setFormData({ ...formData, splitPayments: newPayments });
  };

  const addSplitPayment = () => {
    setFormData({
      ...formData,
      splitPayments: [...formData.splitPayments, { amount: '', mode: 'Cash', reference: '', bankId: '' }]
    });
  };

  const removeSplitPayment = (index: number) => {
    if (formData.splitPayments.length <= 1) return;
    const newPayments = formData.splitPayments.filter((_, i) => i !== index);
    setFormData({ ...formData, splitPayments: newPayments });
  };

  const totalTokenAmount = formData.splitPayments.reduce((sum, p) => sum + Number(p.amount || 0), 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSaving) return;
    setIsSaving(true);
    
    try {
      const now = new Date();

      // 0. GENERATE UNIQUE ID (USE PRE-GENERATED IF AVAILABLE)
      const clientId = formData.clientId || await dbService.generateId('CID', formData.bookingDate);
      const bookingDate = formData.bookingDate || new Date().toISOString().split('T')[0];

      setFormData(prev => ({
       ...prev,
       clientId: clientId
      }));

      // 1. Save the Client first with 0 balance
      await dbService.saveClient({
        id: clientId,
        title: formData.title,
        name: formData.name,
        fatherName: formData.fatherName,
        occupation: formData.occupation,
        dob: formData.dob,
        phone: `${formData.countryCode === 'manual'
          ? formData.manualCountryCode
          : formData.countryCode}${formData.phone}`,
        email: formData.email,
        address: formData.address,
        district: formData.district,
        projectLocality: selectedProperty?.locality || '',
        projectDistrict: selectedProperty?.district || '',
        projectState: selectedProperty?.state || '',
        state: formData.state,
        pincode: formData.pincode,
        age: Number(formData.age),
        gender: formData.gender,
        aadhaar: formData.aadhaar,
        pan: formData.pan,
        gstin: formData.gstin,
        propertyCount: (formData.selectedPropertyId && formData.selectedPlotId) ? 1 : 0, 
        openingBalance: 0,
        balance: 0,
        totalContractValue: Number(formData.totalAmount) || 0,
        emiDuration: formData.emiDuration,
        projectName: selectedProperty?.title || '',
        plotNumber: selectedPlot?.plotNumber || formData.selectedPlotId || '',
        username: formData.username || formData.phone,
        password: formData.password || 'ashray123',
        bankName: formData.bankName,
        accountNumber: formData.accountNumber,
        ifscCode: formData.ifscCode,
        categoryId: formData.categoryId,
        folderId: formData.folderId,
        folderSerial: formData.folderSerial,
        investments: (formData.selectedPropertyId && formData.selectedPlotId) ? [{
          propertyId: formData.selectedPropertyId,
          plotId: formData.selectedPlotId,
          amount: Number(formData.totalAmount) || 0,
          purchaseDate: formData.bookingDate || new Date().toISOString()
        }] : [],
        payments: []
      });

      // 2. Split Payments
      const totalTokenAmountValue = formData.splitPayments.reduce((sum, p) => sum + Number(p.amount || 0), 0);
      const pendingReceiptsToAdd = [];
      
      if (totalTokenAmountValue > 0) {
        const property = properties.find(p => p.id === formData.selectedPropertyId);
        const plot = property?.inventory?.find((p: any) => p.id === formData.selectedPlotId);

        for (let i = 0; i < formData.splitPayments.length; i++) {
          const payment = formData.splitPayments[i];
          if (!payment.amount || Number(payment.amount) <= 0) continue;

          let method = PaymentMethod.CASH;
          if (payment.mode === 'UPI') method = PaymentMethod.UPI;
          if (payment.mode === 'Bank Transfer') method = PaymentMethod.BANK_TRANSFER;
          if (payment.mode === 'Cheque') method = PaymentMethod.CHEQUE;
          if (payment.mode === 'RTGS/NEFT') method = PaymentMethod.RTGS;

          const txId = `tx-token-${Date.now()}-${i}`;
          await dbService.saveTransaction({
            id: txId,
            date: bookingDate,
            particulars: `Booking Token Amount Received (${payment.mode}): ${property?.title || ''} - Plot No. ${plot?.plotNumber || 'N/A'} from ${formData.name}`,
            amount: Number(payment.amount),
            type: TransactionType.CREDIT,
            category: TransactionCategory.GENERAL,
            method: method,
            bankId: payment.bankId || undefined,
            referenceId: payment.reference || `TOKEN-${Date.now()}-${i}`,
            clientId: clientId,
            propertyId: formData.selectedPropertyId,
            balanceAfter: 0,
            synced: true
          });

          pendingReceiptsToAdd.push({
            id: `pr_${Date.now()}_${i}`,
            transactionId: txId,
            payeeName: formData.name,
            amount: Number(payment.amount),
            date: bookingDate,
            partyType: 'Client',
            partyId: clientId,
            printed: false
          });
        }
      }

      if (pendingReceiptsToAdd.length > 0) {
        const existingReceiptsStr = localStorage.getItem('pending_receipts');
        let existingReceipts = [];
        try {
          existingReceipts = existingReceiptsStr ? JSON.parse(existingReceiptsStr) : [];
        } catch (e) {
          console.error('Failed to parse pending_receipts:', e);
          existingReceipts = [];
        }
        localStorage.setItem('pending_receipts', JSON.stringify([...existingReceipts, ...pendingReceiptsToAdd]));
        localStorage.removeItem('pending_receipts_remind_after');
      }

      // 4. Update plot status
      if (formData.selectedPropertyId && formData.selectedPlotId) {
        await dbService.assignPlotToClient(
          formData.selectedPropertyId,
          formData.selectedPlotId,
          clientId,
          {
            name: formData.name,
            phone: (formData.countryCode === 'manual' ? formData.manualCountryCode : formData.countryCode) + formData.phone,
            amount: Number(formData.totalAmount),
            status: 'Reserved'
          }
        );
      }

      // 5. Documents
      if (selectedFiles.length > 0) {
        for (let i = 0; i < selectedFiles.length; i++) {
          const file = selectedFiles[i];
          try {
            const reader = new FileReader();
            const base64Promise = new Promise<string>((resolve, reject) => {
              reader.onload = () => typeof reader.result === 'string' ? resolve(reader.result) : reject(new Error('Base64 conversion failed'));
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
              category: 'CLIENT',
              clientId: clientId,
              propertyId: formData.selectedPropertyId || undefined,
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

      // 6. History
      try {
        await dbService.updateClientFileHistory(clientId);
      } catch (error) {
        console.error('History save error:', error);
      }

      // 🔥 FINAL WRAP UP
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
              partyId: clientId,
              partyName: formData.name,
              partyType: 'Client',
              date: bookingDate,
              printed: false,
              previewData: {
                client: {
                  title: formData.title || '',
                  name: formData.name || '',
                  age: formData.age || '',
                  gender: formData.gender || '',
                  occupation: formData.occupation || '',
                  phone: `${formData.countryCode}${formData.phone}` || '',
                  email: formData.email || '',
                  aadhaar: formData.aadhaar || '',
                  pan: formData.pan || '',
                  address: formData.address || '',
                  district: formData.district || '',
                  state: formData.state || '',
                  pincode: formData.pincode || '',
                  folderName: formData.folderName || '',
                  folderSerial: formData.folderSerial || '',
                  clientId: clientId,
                  nominee1Title: formData.nominee1Title || '',
                  nominee1Name: formData.nominee1Name || '',
                  nominee1Age: formData.nominee1Age || '',
                  nominee1Occupation: formData.nominee1Occupation || '',
                  nominee1Aadhaar: formData.nominee1Aadhaar || '',
                  nominee2Title: formData.nominee2Title || '',
                  nominee2Name: formData.nominee2Name || '',
                  nominee2Age: formData.nominee2Age || '',
                  nominee2Occupation: formData.nominee2Occupation || '',
                  nominee2Aadhaar: formData.nominee2Aadhaar || '',
                },
                property: {
                  projectName: selectedProperty?.title || '',
                  locality: selectedProperty?.locality || '',
                  tehsil: selectedProperty?.tehsil || '',
                  district: selectedProperty?.district || formData.district || '',
                  state: selectedProperty?.state || formData.state || '',
                  pincode: selectedProperty?.pincode || formData.pincode || '',
                  khasraNumber: selectedProperty?.khasraNumber || '',
                  surveyNumber: selectedProperty?.surveyNumber || '',
                  plotNumber: selectedPlot?.plotNumber || '',
                  area: selectedPlot?.size ? String(selectedPlot.size) : '',
                  rate: selectedPlot?.price || selectedProperty?.price || '',
                  totalAmount: formData.totalAmount || selectedPlot?.price || selectedProperty?.price || '',
                  tokenAmount: totalTokenAmountValue.toString(),
                  bookingDate: formData.bookingDate || '',
                  bookingDay: formData.bookingDay || { en: '', hi: '', mr: '' },
                  paymentReference: formData.splitPayments.map(p => `${p.mode}: ${p.reference}`).join(', '),
paymentMode: formData.splitPayments.length > 1 ? 'Split Payment' : (formData.splitPayments[0]?.mode || 'Cash'),
                  emiDuration: Number(formData.emiDuration || 0),
                },
                company: {
                  companyName: companySettings?.companyName || '',
                  entityType: formData.entityType || '',
                  companyPan: companySettings?.panNumber || '',
                  companyEmail: formData.companyEmail || companySettings?.companyEmail || '',
                  companyWebsite: formData.companyWebsite || companySettings?.companyWebsite || '',
                  licenseRegistrationNumber: companySettings?.licenseRegistrationNumber || '',
                  urcNumber: companySettings?.urcNumber || '',
                  companyAddress: formData.officeAddress || '',
                  companyLocality: formData.officeLocality || '',
                  companyDistrict: formData.officeDistrict || '',
                  companyState: formData.officeState || '',
                  companyPincode: formData.officePincode || '',
                  managerPhone: formData.managerPhone || companySettings?.managers?.[0]?.phone || '',
                },
                manager: {
                  managerName: formData.managerName || companySettings?.managers?.[0]?.name || '',
                  managerPosition: formData.managerPosition || companySettings?.managers?.[0]?.role || '',
                  managerAddress: formData.managerAddress || companySettings?.managers?.[0]?.address || '',
                  managerPAN: formData.managerPAN || companySettings?.managers?.[0]?.pan || '',
                  managerAadhaar: formData.managerAadhaar || companySettings?.managers?.[0]?.aadhaar || '',
                  managerPhone: formData.managerPhone || companySettings?.managers?.[0]?.phone || '',
                  managerCountryCode: formData.managerCountryCode || companySettings?.managers?.[0]?.countryCode || '',
                },
              }
            });
            localStorage.setItem('pending_agreements', JSON.stringify(pendingAgreements));
            localStorage.removeItem('pending_agreements_remind_after');
            window.dispatchEvent(new Event('storage'));
          }
        } catch (innerError) {
          console.error('Error during agreement storage:', innerError);
        } finally {
          setIsSaving(false);
          alert(`✅ Client Saved Successfully\nID: ${clientId}`);
          navigate('/clients');
        }
      }, 500);

    } catch (outerError) {
      console.error('Fatal Submit Error:', outerError);
      setIsSaving(false);
      alert('❌ Failed to save client. Please check your internet connection or console for details.');
    }
  };
  const liveClientId = formData.clientId || previewId || 'TEMP-ID';

  return (
    <div className="max-w-4xl mx-auto pb-10">
      <div className="flex items-center mb-6">
        <Link to="/" className="p-2 mr-2 hover:bg-slate-200 rounded-full">
          <ArrowLeft size={20} className="text-slate-600" />
        </Link>
        <h1 className="text-xl font-bold text-slate-800">Add New Client</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">

        
        {isTransfer && transferFrom && (
          <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl flex items-start gap-3 animate-pulse">
            <AlertTriangle className="text-amber-600 shrink-0 mt-0.5" size={20} />
            <div>
              <p className="text-sm font-bold text-amber-800">Property Transfer Process</p>
              <p className="text-xs text-amber-700 mt-1">
                This property is being transferred from <span className="font-black underline">{transferFrom.name}</span>. 
                A transfer fee of <span className="font-black">₹{transferFee.toLocaleString()}</span> (10% of balance) will be applied to the original owner's account.
              </p>
            </div>
          </div>
        )}

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

        {/* Section 2: Property Selection */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center">
            <MapPin size={20} className="mr-2 text-brand-500" /> Property Selection
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Select Project</label>
              <select 
                name="selectedPropertyId"
                className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-brand-500 outline-none bg-white text-slate-900"
                value={formData.selectedPropertyId}
                onChange={handlePropertyChange}
              >
                <option value="">-- Choose Project --</option>
                {properties.map(p => (
                  <option key={p.id} value={p.id}>{p.title} ({p.locality})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Select Plot / Unit</label>
              <select 
                name="selectedPlotId"
                className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-brand-500 outline-none bg-white text-slate-900"
                value={formData.selectedPlotId}
                onChange={(e) => {
                  const plotId = e.target.value;
                  const plot = selectedProperty?.inventory?.find((p: any) => p.id === plotId);
                  setFormData(prev => ({
                    ...prev,
                    selectedPlotId: plotId,
                    totalAmount: plot?.price ? String(plot.price) : prev.totalAmount
                  }));
                }}
                disabled={!selectedProperty}
              >
                <option value="">-- Choose Plot --</option>
                {selectedProperty?.inventory?.filter((p: any) => p.status === 'Available').map((p: any) => (
                  <option key={p.id} value={p.id}>Plot No. {p.plotNumber} ({p.size} sqft)</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Total Sale Value (₹)</label>
              <input 
                type="number" name="totalAmount" placeholder="Total Deal Amount"
                className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-brand-500 outline-none bg-white text-slate-900"
                value={formData.totalAmount} onChange={handleChange}
              />
              {formData.totalAmount && Number(formData.totalAmount) > 0 && (
                <p className="mt-1 text-xs font-semibold text-brand-600 bg-brand-50 px-2 py-1 rounded inline-block">
                   Words: {numberToWords(Number(formData.totalAmount))}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Section 3: Booking & Payment Details */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-slate-800 flex items-center">
              <CreditCard size={20} className="mr-2 text-brand-500" /> Booking & Payment Details
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
                    {payment.amount && Number(payment.amount) > 0 && (
                      <p className="mt-1 text-[10px] font-semibold text-brand-500 bg-brand-50 px-1.5 py-0.5 rounded inline-block">
                         {numberToWords(Number(payment.amount))}
                      </p>
                    )}
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

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-slate-100">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Total Token Amount (₹)</label>
                <div className="w-full border border-slate-300 rounded-lg px-3 py-2 bg-brand-50 text-brand-700 font-bold">
                  ₹ {totalTokenAmount.toLocaleString()}
                </div>
                {totalTokenAmount > 0 && (
                  <p className="mt-1 text-[10px] font-semibold text-brand-600">
                    {numberToWords(totalTokenAmount)}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Booking Date</label>
                <input 
                  type="date" name="bookingDate"
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-brand-500 outline-none bg-white text-slate-900"
                  value={formData.bookingDate} onChange={handleChange}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Balance Amount (₹)</label>
                <input 
                  type="number" 
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 bg-slate-50 text-slate-900 font-bold"
                  value={Math.max(0, Number(formData.totalAmount) - totalTokenAmount)}
                  readOnly
                />
                {Number(formData.totalAmount) - totalTokenAmount > 0 && (
                  <p className="mt-1 text-[10px] font-semibold text-slate-600 font-mono">
                    {numberToWords(Number(formData.totalAmount) - totalTokenAmount)}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">EMI Duration (Months)</label>
                <select 
                  name="emiDuration"
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-brand-500 outline-none bg-white text-slate-900"
                  value={formData.emiDuration} onChange={handleChange}
                >
                  <option value="6">6 Months</option>
                  <option value="12">12 Months</option>
                  <option value="18">18 Months</option>
                  <option value="24">24 Months</option>
                  <option value="36">36 Months</option>
                  <option value="48">48 Months</option>
                  <option value="60">60 Months</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Monthly EMI (₹)</label>
                <input 
                  type="number" 
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 bg-slate-50 text-slate-900"
                  value={formData.emiDuration? (Math.max(0, Number(formData.totalAmount) - totalTokenAmount) / Number(formData.emiDuration)).toFixed(2) : '0.00'}
                  readOnly
                />
              </div>
            </div>
          </div>
        </div>

        

        {/* Section 3: Bank Details */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center">
            <Wallet size={20} className="mr-2 text-brand-500" /> Bank Details
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

        {/* Section 4: Identity Details */}
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


            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
  <h2 className="text-lg font-semibold text-slate-800 mb-4">
    Nominee Details
  </h2>

  {/* Nominee 1 */}
  <div className="mb-6">
    <h3 className="text-sm font-bold mb-3 text-slate-600">Nominee 1</h3>
    <div className="grid grid-cols-2 gap-4">
  <input name="nominee1Name" placeholder="Name" onChange={handleChange} className="w-full border px-3 py-2 rounded-lg" />

  <input type="date" name="nominee1Dob" onChange={handleChange} className="w-full border px-3 py-2 rounded-lg" />

  <input name="nominee1Age" placeholder="Age" value={formData.nominee1Age} readOnly className="w-full border px-3 py-2 rounded-lg bg-slate-100" />

  <input name="nominee1Occupation" placeholder="Occupation" onChange={handleChange} className="w-full border px-3 py-2 rounded-lg" />

  <input name="nominee1Aadhaar" placeholder="Aadhaar Number" onChange={handleChange} className="w-full border px-3 py-2 rounded-lg col-span-2" />
</div>
  </div>

  {/* Nominee 2 */}
  <div>
    <h3 className="text-sm font-bold mb-3 text-slate-600">Nominee 2</h3>
    <div className="grid grid-cols-2 gap-4">
  <input name="nominee2Name" placeholder="Name" onChange={handleChange} className="w-full border px-3 py-2 rounded-lg" />

  <input type="date" name="nominee2Dob" onChange={handleChange} className="w-full border px-3 py-2 rounded-lg" />

  <input name="nominee2Age" placeholder="Age" value={formData.nominee2Age} readOnly className="w-full border px-3 py-2 rounded-lg bg-slate-100" />

  <input name="nominee2Occupation" placeholder="Occupation" onChange={handleChange} className="w-full border px-3 py-2 rounded-lg" />

  <input name="nominee2Aadhaar" placeholder="Aadhaar Number" onChange={handleChange} className="w-full border px-3 py-2 rounded-lg col-span-2" />
</div>
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

          {/* Generate Agreement/Token Section */}
          <div className="mt-8 pt-8 border-t border-slate-100">
            <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center uppercase tracking-wider">
              <FileCheck size={18} className="mr-2 text-brand-600" /> Generate Agreement / Token
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button 
                type="button"
                onClick={() => handleGenerateClick('agreement')}
                className="flex items-center justify-between p-4 rounded-xl border border-brand-100 bg-brand-50/30 hover:bg-brand-50 transition-all group"
              >
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-brand-100 rounded-full flex items-center justify-center text-brand-600 mr-3 group-hover:scale-110 transition-transform">
                    <FileText size={20} />
                  </div>
                  <div className="text-left">
                    <p className="font-bold text-slate-800 text-sm">Generate Sale Agreement</p>
                    <p className="text-[10px] text-slate-500">Full 8-page stamp paper format</p>
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
                    <p className="font-bold text-slate-800 text-sm">Generate Token Receipt</p>
                    <p className="text-[10px] text-slate-500">Official booking confirmation receipt</p>
                  </div>
                </div>
                <Printer size={16} className="text-slate-400 group-hover:text-brand-600 transition-colors" />
              </button>
            </div>
            <p className="mt-3 text-[10px] text-slate-400 italic">
              * Clicking these will automatically fetch client details into the document template for printing.
            </p>
          </div>
        </div>

        <div className="flex justify-end pt-4 pb-8">
          <button type="button" onClick={() => navigate('/clients')} className="mr-4 px-6 py-3 rounded-lg font-medium text-slate-600 hover:bg-slate-100">
            Cancel
          </button>
          <button 
            type="submit" 
            disabled={isSaving}
            className={`px-8 py-3 rounded-lg font-medium flex items-center shadow-md transition-all ${
              isSaving ? 'bg-slate-400 cursor-not-allowed' : 'bg-brand-600 hover:bg-brand-700 text-white'
            }`}
          >
            {isSaving ? (
              <>
                <RefreshCw size={18} className="mr-2 animate-spin" /> Saving Client...
              </>
            ) : (
              <>
                <Save size={18} className="mr-2" /> Save Client Record
              </>
            )}
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
            
            <p className="text-slate-600 mb-8">
              Please select the language in which you want to generate the {previewType === 'agreement' ? 'Sale Agreement' : 'Token Receipt'}.
            </p>

            <div className="grid grid-cols-1 gap-4">
              <button 
                onClick={() => setSelectedLang('english')}
                className="flex items-center justify-between p-4 rounded-xl border-2 border-slate-100 hover:border-brand-500 hover:bg-brand-50 transition-all group"
              >
                <span className="font-bold text-slate-700 group-hover:text-brand-700">English</span>
                <span className="text-xs text-slate-400 font-mono">ENG</span>
              </button>
              <button 
                onClick={() => setSelectedLang('hindi')}
                className="flex items-center justify-between p-4 rounded-xl border-2 border-slate-100 hover:border-brand-500 hover:bg-brand-50 transition-all group"
              >
                <span className="font-bold text-slate-700 group-hover:text-brand-700">हिंदी (Hindi)</span>
                <span className="text-xs text-slate-400 font-mono">HIN</span>
              </button>
              <button 
                onClick={() => setSelectedLang('marathi')}
                className="flex items-center justify-between p-4 rounded-xl border-2 border-slate-100 hover:border-brand-500 hover:bg-brand-50 transition-all group"
              >
                <span className="font-bold text-slate-700 group-hover:text-brand-700">मराठी (Marathi)</span>
                <span className="text-xs text-slate-400 font-mono">MAR</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Document Preview */}
{previewType && selectedLang && (
  <AgreementPreview
    onGenerate={() => setAgreementGenerated(true)}
    data={{
      // =========================
      // CLIENT (BUYER)
      // =========================
      client: {
        title: formData.title || '',
        name: formData.name || '',
        age: formData.age || '',
        gender: formData.gender || '',
        occupation: formData.occupation || '',
        phone: formData.phone || '',
        email: formData.email || '',
        aadhaar: formData.aadhaar || '',
        pan: formData.pan || '',

        address: formData.address || '',
        district: formData.district || '',
        state: formData.state || '',
        pincode: formData.pincode || '',

        folderName: formData.folderName || '',
        folderSerial: formData.folderSerial || '',
        clientId: liveClientId,

        nominee1Title: formData.nominee1Title || '',
        nominee1Name: formData.nominee1Name || '',
        nominee1Age: formData.nominee1Age || '',
        nominee1Occupation: formData.nominee1Occupation || '',
        nominee1Aadhaar: formData.nominee1Aadhaar || '',

        nominee2Title: formData.nominee2Title || '',
        nominee2Name: formData.nominee2Name || '',
        nominee2Age: formData.nominee2Age || '',
        nominee2Occupation: formData.nominee2Occupation || '',
        nominee2Aadhaar: formData.nominee2Aadhaar || '',
       },

      // =========================
      // PROPERTY (PROJECT + PLOT)
      // =========================
      property: {
      projectName: selectedProperty?.title || '',
      locality: selectedProperty?.locality || '',

      // 🔥 ADD THESE (CRITICAL)
      tehsil: selectedProperty?.tehsil || '',
      district: selectedProperty?.district || formData.district || '',
      state: selectedProperty?.state || formData.state || '',
      pincode: selectedProperty?.pincode || formData.pincode || '',

      khasraNumber: selectedProperty?.khasraNumber || '',
      surveyNumber: selectedProperty?.surveyNumber || '',

      plotNumber: selectedPlot?.plotNumber || '',
      area: selectedPlot?.size ? String(selectedPlot.size) : '',

      rate: selectedPlot?.price || selectedProperty?.price || '',
      totalAmount:
        formData.totalAmount ||
        selectedPlot?.price ||
        selectedProperty?.price ||
        '',

      // 🔥 ADD THESE (VERY IMPORTANT)
      tokenAmount: totalTokenAmount.toString(),
      bookingDate: formData.bookingDate || '',
      bookingDay: formData.bookingDay || { en: '', hi: '', mr: '' },
      paymentReference: formData.splitPayments.map(p => `${p.mode}: ${p.reference}`).join(', '),
      paymentMode: formData.splitPayments.length > 1 ? 'Split Payment' : formData.splitPayments[0].mode,
      emiDuration: Number(formData.emiDuration || 0),
    },

      // =========================
      // COMPANY (SELLER)
      // =========================
      company: {
      companyName: companySettings?.companyName || '',
      entityType: formData.entityType || '',
      companyPan: companySettings?.panNumber || '',
      companyEmail: formData.companyEmail || companySettings?.companyEmail || '',
      companyWebsite: formData.companyWebsite || companySettings?.companyWebsite || '',

      licenseRegistrationNumber:
      companySettings?.licenseRegistrationNumber || '',
      urcNumber: companySettings?.urcNumber || '',

      companyAddress: formData.officeAddress || '',
      companyLocality: formData.officeLocality || '',
      companyDistrict: formData.officeDistrict || '',
      companyState: formData.officeState || '',
      companyPincode: formData.officePincode || '',
      managerPhone: formData.managerPhone || companySettings?.managers?.[0]?.phone || '',
    },

      // CRITICAL FIX (ADD THIS BLOCK)
      manager: {
      managerName: formData.managerName || companySettings?.managers?.[0]?.name || '',
      managerPosition: formData.managerPosition || companySettings?.managers?.[0]?.role || '',
      managerAddress: formData.managerAddress || companySettings?.managers?.[0]?.address || '',
      managerPAN: formData.managerPAN || companySettings?.managers?.[0]?.pan || '',
      managerAadhaar: formData.managerAadhaar || companySettings?.managers?.[0]?.aadhaar || '',
      managerPhone: formData.managerPhone || companySettings?.managers?.[0]?.phone || '',
      managerCountryCode: formData.managerCountryCode || companySettings?.managers?.[0]?.countryCode || '',
    },

      // =========================
      // TRANSFER
      // =========================
      transferNote:
        isTransfer && transferFrom?.name
          ? `This property has been transferred from ${transferFrom.name}`
          : undefined,
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
