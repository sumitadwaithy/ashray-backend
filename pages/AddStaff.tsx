import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { 
  ArrowLeft, Save, User, MapPin, 
  Briefcase, Landmark, Eye, EyeOff, Copy, Check, Lock, Sparkles,
  Fingerprint, CheckCircle, X, Upload, File, FileText, Trash2,
  Shield, RefreshCw, Printer, CreditCard, Globe, FileCheck
} from 'lucide-react';
import { dbService } from '../services/db';
import { generateCredentials } from '../services/CredentialsEngine';
import { Staff, StaffDocument, CompanyAddress } from '../types';
import { STAFF_ROLES } from '../constants';
import { AgreementPreview } from '../components/AgreementTemplates';
import { IDCardEngine } from '../components/IDCardEngine';

export const AddStaff: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingStaffId, setEditingStaffId] = useState<string | null>(null);
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
  const [previewType, setPreviewType] = useState<'staff_agreement' | 'token' | null>(null);
  const [selectedLang, setSelectedLang] = useState<'english' | 'hindi' | 'marathi' | null>(null);
  const [showIDCard, setShowIDCard] = useState(false);
  const [showCustomRole, setShowCustomRole] = useState(false);
  const [showCustomJurisdiction, setShowCustomJurisdiction] = useState(false);
  const [showCustomWorkingHours, setShowCustomWorkingHours] = useState(false);
  const [previewId, setPreviewId] = useState<string>('');

  const [formData, setFormData] = useState<any>({
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
    role: '',
    bankName: '',
    accountNumber: '',
    ifscCode: '',
    salary: 0,
    joiningDate: new Date().toISOString().split('T')[0],
    status: 'ACTIVE',
    bloodGroup: '',
    payable: 'Monthly',
    workingHours: '',
    placeOfPosting: '',
    jurisdiction: 'Nagpur',
    annualSalary: 0,
    totalSalaryPaid: 0,
    documents: [] as StaffDocument[],
  });

  const handleChange = (
  e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
) => {
  const { name, value } = e.target;

  setFormData(prev => {
    const updated = { ...prev, [name]: value };

    // 🔥 AUTO AGE CALCULATION
    if (name === 'dob') {
      updated.age = calculateAge(value);
    }
    
    // 🔥 AUTO ANNUAL SALARY CALCULATION
    if (name === 'payable' || name === 'salary') {
      const salary = Number(updated.salary || 0);
      const payable = updated.payable || 'Monthly';
      if (payable === 'Monthly') updated.annualSalary = salary * 12;
      else if (payable === 'Yearly') updated.annualSalary = salary;
      else if (payable === 'Daily') updated.annualSalary = salary * 365;
      else if (payable === 'Weekly') updated.annualSalary = salary * 52;
      else if (payable === 'Quarterly') updated.annualSalary = salary * 4;
      else if (payable === 'Semi-Annually') updated.annualSalary = salary * 2;
    }

    return updated;
  });
};

const calculateAge = (dob: string): string => {
  if (!dob) return '';

  const birthDate = new Date(dob);
  const today = new Date();

  let age = today.getFullYear() - birthDate.getFullYear();

  const monthDiff = today.getMonth() - birthDate.getMonth();

  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < birthDate.getDate())
  ) {
    age--;
  }

  return age >= 0 ? age.toString() : '';
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
  
  const numberToIndianWords = (num: number): string => {
  if (!num || num === 0) return 'Zero';

  const a = [
    '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six',
    'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve',
    'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen',
    'Seventeen', 'Eighteen', 'Nineteen'
  ];
  const b = [
    '', '', 'Twenty', 'Thirty', 'Forty', 'Fifty',
    'Sixty', 'Seventy', 'Eighty', 'Ninety'
  ];

  const convert = (n: number): string => {
    if (n < 20) return a[n];
    if (n < 100) return b[Math.floor(n / 10)] + (n % 10 ? ' ' + a[n % 10] : '');
    if (n < 1000) return a[Math.floor(n / 100)] + ' Hundred' + (n % 100 ? ' ' + convert(n % 100) : '');
    if (n < 100000) return convert(Math.floor(n / 1000)) + ' Thousand' + (n % 1000 ? ' ' + convert(n % 1000) : '');
    if (n < 10000000) return convert(Math.floor(n / 100000)) + ' Lakh' + (n % 100000 ? ' ' + convert(n % 100000) : '');
    return convert(Math.floor(n / 10000000)) + ' Crore' + (n % 10000000 ? ' ' + convert(n % 10000000) : '');
  };

  return convert(num) + ' Only';
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

  const handleGenerateClick = (type: 'staff_agreement' | 'token') => {
    setPreviewType(type);
    setSelectedLang(null);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, type: string) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      const newDoc: StaffDocument = {
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
    setFormData(prev => ({
      ...prev,
      documents: prev.documents.filter(doc => doc.id !== id)
    }));
  };

  useEffect(() => {
  const fetchInitialData = async () => {
    try {
      const [cats, flds, settings] = await Promise.all([
        dbService.getCategories(),
        dbService.getFolders(),
        dbService.getSettings()
      ]);

      console.log('🔥 STAFF Categories:', cats);
      console.log('🔥 STAFF Folders:', flds);

      setCategories(Array.isArray(cats) ? cats : []);
      setFolders(Array.isArray(flds) ? flds : []);

      setOfficeAddresses(settings.companyAddresses || []);
      setManagers(settings.managers || []);
      setCompanySettings(settings);

    } catch (err) {
      console.error('❌ STAFF INIT ERROR:', err);
    }
  };

  fetchInitialData();
}, []);

  useEffect(() => {
    const editId = location.state?.staffId;
    const staffData = location.state?.staffData;
    if (editId) {
      const loadStaff = async () => {
        const staffList = await dbService.getStaff();
        const staff = staffList.find(s => s.id === editId);
        if (staff) {
          setIsEditMode(true);
          setEditingStaffId(editId);
          setFormData(staff);
          if (staff.role && !STAFF_ROLES.includes(staff.role)) {
            setShowCustomRole(true);
          }
        }
      };
      loadStaff();
    } else if (staffData) {
      setIsEditMode(true);
      setEditingStaffId(staffData.id);
      setFormData(staffData);
      if (staffData.role && !STAFF_ROLES.includes(staffData.role)) {
        setShowCustomRole(true);
      }
    }
  }, [location.state]);

  useEffect(() => {
    if (!isEditMode && !formData.staffId) {
      dbService.peekId('EID', formData.joiningDate).then(id => {
        setPreviewId(id);
      });
    }
  }, [isEditMode, formData.joiningDate, formData.staffId]);

  const getDayName = (dateStr: string) => {
    if (!dateStr) return { en: '', hi: '', mr: '' };
  
    const d = new Date(dateStr);
  
    return {
      en: d.toLocaleDateString('en-US', { weekday: 'long' }),
      hi: ['रविवार','सोमवार','मंगलवार','बुधवार','गुरुवार','शुक्रवार','शनिवार'][d.getDay()],
      mr: ['रविवार','सोमवार','मंगळवार','बुधवार','गुरुवार','शुक्रवार','शनिवार'][d.getDay()]
    };
  };
  

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    try {
      const staffId = isEditMode && editingStaffId ? editingStaffId : (formData.staffId || await dbService.generateId('EID', formData.joiningDate));
      const staffToSave: Staff = {
        id: staffId,
        title: formData.title,
        name: formData.name || '',
        fatherName: formData.fatherName,
        occupation: formData.occupation,
        dob: formData.dob,
        age: formData.age,
        gender: formData.gender,
        phone: formData.phone || '',
        countryCode: formData.countryCode,
        email: formData.email || '',
        address: formData.address || '',
        district: formData.district,
        state: formData.state,
        pincode: formData.pincode,
        aadhaar: formData.aadhaar || '',
        pan: formData.pan || '',
        username: formData.username,
        password: formData.password,
        role: formData.role || '',
        bankName: formData.bankName || '',
        accountNumber: formData.accountNumber || '',
        ifscCode: formData.ifscCode || '',
        salary: Number(formData.salary) || 0,
        joiningDate: formData.joiningDate || new Date().toISOString().split('T')[0],
        status: formData.status as 'ACTIVE' | 'INACTIVE',
        bloodGroup: formData.bloodGroup,
        totalSalaryPaid: formData.totalSalaryPaid || 0,
        lastPaymentDate: formData.lastPaymentDate,
        documents: formData.documents,
        // Administrative fields
        categoryId: formData.categoryId,
        folderId: formData.folderId,
        folderSerial: formData.folderSerial,
        categoryName: formData.categoryName,
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
        managerAadhaar: formData.managerAadhaar,
      };
      await dbService.saveStaff(staffToSave);

      // 🔥 Add to pending agreements if skipped
      if (!agreementGenerated) {
        const pendingAgreements = JSON.parse(localStorage.getItem('pending_agreements') || '[]');
        pendingAgreements.push({
          id: `pa_${Date.now()}`,
          partyId: staffId,
          partyName: formData.name,
          partyType: 'Staff',
          date: new Date().toLocaleDateString('en-CA'),
          printed: false,
          previewData: {
            employee: {
              title: formData.title,
              name: formData.name,
              age: formData.age,
              gender: formData.gender,
              fatherName: formData.fatherName,
              phone: `${formData.countryCode}${formData.phone}`,
              email: formData.email,
              aadhaar: formData.aadhaar,
              pan: formData.pan,
              dob: formData.dob,
              address: formData.address,
              district: formData.district,
              state: formData.state,
              pincode: formData.pincode,
              employeeId: staffId,
              staffId: staffId,
              folderSerial: formData.folderSerial,
              qualification: formData.qualification || ''
            },
            employment: {
              joiningDate: formData.joiningDate,
              role: formData.role,
              designation: formData.role,
              department: formData.categoryName,
              reportingTo: formData.managerName,
              placeOfPosting: formData.placeOfPosting || formData.officeLocality,
              grossAnnualSalary: formData.annualSalary,
              grossMonthlySalary: formData.salary,
              grossAnnualSalaryWords: numberToIndianWords(formData.annualSalary),
              grossMonthlySalaryWords: numberToIndianWords(formData.salary),
              salaryPaymentFrequency: formData.payable,
              probationPeriod: '3 (Three) Months',
              workingHours: formData.workingHours || '09:00 AM to 05:00 PM',
              lunchBreak: '45 Minutes',
              workingDays: 'Monday to Saturday',
              noticePeriodEmployer: '30 Days',
              noticePeriodEmployee: '30 Days',
              annualLeaves: '12',
              medicalLeaves: '6',
              casualLeaves: '6',
              jurisdiction: formData.jurisdiction || 'Nagpur'
            },
            company: {
              companyName: companySettings?.companyName || 'Ashray Group',
              entityType: companySettings?.entityType || '',
              companyAddress: formData.officeAddress || '',
              companyLocality: formData.officeLocality || '',
              companyDistrict: formData.officeDistrict || '',
              companyState: formData.officeState || '',
              companyPincode: formData.officePincode || '',
              managerPhone: formData.managerPhone || companySettings?.managers?.[0]?.phone || companySettings?.whatsappNumber || companySettings?.registeredPhone,
              companyEmail: companySettings?.companyEmail || companySettings?.email,
              companyWebsite: companySettings?.companyWebsite || companySettings?.website,
              licenseRegistrationNumber: companySettings?.licenseRegistrationNumber,
              cinNumber: companySettings?.cinNumber,
              companyPan: companySettings?.companyPan || companySettings?.pan,
            },
            manager: {
              managerName: formData.managerName || companySettings?.managers?.[0]?.name || '',
              managerPosition: formData.managerPosition || companySettings?.managers?.[0]?.role || '',
              managerAddress: formData.managerAddress || companySettings?.managers?.[0]?.address || '',
              managerPhone: formData.managerPhone || companySettings?.managers?.[0]?.phone || '',
              managerCountryCode: formData.managerCountryCode || companySettings?.managers?.[0]?.countryCode || '',
            }
          },
          role: formData.role
        });
        localStorage.setItem('pending_agreements', JSON.stringify(pendingAgreements));
        localStorage.removeItem('pending_agreements_remind_after');
        window.dispatchEvent(new Event('storage'));
      }

      setTimeout(() => {
        setIsProcessing(false);
        setShowSuccess(true);
      }, 800);
    } catch (error) {
      console.error('Error saving staff:', error);
      setIsProcessing(false);
    }
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
          <h2 className="text-2xl font-bold text-slate-800">
            {isEditMode ? 'Staff Updated Successfully!' : 'Staff Added Successfully!'}
          </h2>
          <p className="text-slate-500 mt-2">
            The staff member profile has been {isEditMode ? 'updated' : 'created'}.
          </p>
        </div>
        <div className="flex flex-col gap-2">
          <button
            onClick={() => navigate('/staff-ledger')}
            className="w-full bg-brand-600 text-white py-3 rounded-xl font-bold shadow-lg shadow-brand-200"
          >
            Go to Staff Ledger
          </button>
          {!isEditMode && (
            <button
              onClick={() => setShowSuccess(false)}
              className="w-full bg-slate-100 text-slate-700 py-3 rounded-xl font-medium"
            >
              Add Another Staff
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto pb-20">

      {/* Page Header */}
      <div className="flex items-center mb-6">
        <Link to="/staff-ledger" className="p-2 mr-2 hover:bg-slate-200 rounded-full transition-colors">
          <ArrowLeft size={20} className="text-slate-600" />
        </Link>
        <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
          {isEditMode ? 'Edit Staff Member' : 'Add Staff Member'}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">

        {/* ── Section 1: Personal Information ── */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center">
            <User size={20} className="mr-2 text-brand-500" /> Personal Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* Full Name */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
              <div className="flex gap-2">
                <select
                  name="title"
                  className="border border-slate-300 rounded-lg px-2 py-2 focus:ring-2 focus:ring-brand-500 outline-none bg-white text-slate-900"
                  value={formData.title}
                  onChange={handleChange}
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
                  value={formData.name}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Father's Name */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Father's / Husband's Name</label>
              <input
                type="text" name="fatherName" placeholder="e.g. Robert Doe"
                className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-brand-500 outline-none bg-white text-slate-900"
                value={formData.fatherName}
                onChange={handleChange}
              />
            </div>

            {/* Date of Birth */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Date of Birth</label>
              <input
                type="date" name="dob"
                className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-brand-500 outline-none bg-white text-slate-900"
                value={formData.dob}
                onChange={handleChange}
              />
            </div>

            {/* Age */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Age</label>
              <input
                type="number" name="age" placeholder="e.g. 35"
                className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-brand-500 outline-none bg-white text-slate-900"
                value={formData.age}
                onChange={handleChange}
              />
            </div>

            {/* Gender */}
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

            {/* Phone Number */}
<div>
  <label className="block text-sm font-medium text-slate-700 mb-1">Phone Number</label>
  <div className="flex gap-2 w-full">
    
    {/* Custom country code selector - shows only +XX but dropdown shows full names */}
    <div className="relative">
      <select
        name="countryCode"
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
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
      {/* Visible display — shows only the code */}
      <div className="flex items-center gap-1 border border-slate-300 rounded-lg px-2 py-2 bg-white text-slate-900 pointer-events-none select-none min-w-[72px]">
        <span className="text-sm font-medium">{formData.countryCode}</span>
        <svg className="w-3 h-3 text-slate-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </div>

    <input
      type="tel" name="phone" required placeholder="9876543210"
      className="flex-1 border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-brand-500 outline-none bg-white text-slate-900"
      value={formData.phone}
      onChange={handleChange}
    />
  </div>
</div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
              <input
                type="email" name="email" placeholder="john@example.com"
                className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-brand-500 outline-none bg-white text-slate-900"
                value={formData.email}
                onChange={handleChange}
              />
            </div>

            {/* Blood Group */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Blood Group</label>
              <select
                name="bloodGroup"
                className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-brand-500 outline-none bg-white text-slate-900"
                value={formData.bloodGroup}
                onChange={handleChange}
              >
                <option value="">Select Blood Group</option>
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
              </select>
            </div>

          </div>
        </div>

        {/* ── Section 2: Address Information ── */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center">
            <MapPin size={20} className="mr-2 text-brand-500" /> Address Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">Full Address</label>
              <input
                type="text" name="address" placeholder="House No, Street, Landmark"
                className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-brand-500 outline-none bg-white text-slate-900"
                value={formData.address}
                onChange={handleChange}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">District</label>
              <input
                type="text" name="district" placeholder="District"
                className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-brand-500 outline-none bg-white text-slate-900"
                value={formData.district}
                onChange={handleChange}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">State</label>
              <select
                name="state"
                className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-brand-500 outline-none bg-white text-slate-900"
                value={formData.state}
                onChange={handleChange}
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
                value={formData.pincode}
                onChange={handleChange}
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

        {/* ── Section 4: Employment Details ── */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <h2 className="text-lg font-semibold text-slate-800 mb-6 flex items-center">
            <Briefcase size={20} className="mr-2 text-brand-500" /> Employment Details
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Role / Designation *</label>
              <div className="space-y-2">
                <select
                  name="roleSelect"
                  required={!showCustomRole}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-brand-500 outline-none bg-white text-slate-900"
                  value={showCustomRole ? 'Other' : formData.role}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === 'Other') {
                      setShowCustomRole(true);
                      setFormData(prev => ({ ...prev, role: '' }));
                    } else {
                      setShowCustomRole(false);
                      setFormData(prev => ({ ...prev, role: val }));
                    }
                  }}
                >
                  <option value="">Select Role</option>
                  {STAFF_ROLES.map(role => (
                    <option key={role} value={role}>{role}</option>
                  ))}
                  <option value="Other">Other (Custom Entry)</option>
                </select>

                {showCustomRole && (
                  <div className="relative animate-in slide-in-from-top-1 duration-200">
                    <input
                      type="text"
                      name="role"
                      required
                      placeholder="Enter custom designation"
                      className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-brand-500 outline-none bg-white text-slate-900 pr-10"
                      value={formData.role}
                      onChange={handleChange}
                    />
                    <button
                      type="button"
                      onClick={() => setShowCustomRole(false)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      <X size={16} />
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
              <select
                name="status"
                className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-brand-500 outline-none bg-white text-slate-900"
                value={formData.status}
                onChange={handleChange}
              >
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Payable (Frequency) *</label>
              <select
                name="payable" required
                className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-brand-500 outline-none bg-white text-slate-900"
                value={formData.payable || 'Monthly'}
                onChange={handleChange}
              >
                <option value="Daily">Daily</option>
                <option value="Weekly">Weekly</option>
                <option value="Monthly">Monthly</option>
                <option value="Quarterly">Quarterly</option>
                <option value="Semi-Annually">Semi-Annually</option>
                <option value="Yearly">Yearly</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Salary *</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-semibold">₹</span>
                <input
                  type="number" name="salary" required
                  className="w-full pl-8 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none bg-white text-slate-900"
                  value={formData.salary || ''}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Calculated Annual Salary</label>
              <div className="relative border border-slate-200 rounded-lg bg-slate-50 flex items-center px-3 py-2 opacity-80 cursor-not-allowed">
                <span className="text-gray-400 font-semibold mr-2">₹</span>
                <span className="text-slate-700">{formData.annualSalary || 0}</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Working Hours</label>
              <div className="space-y-2">
               <select
                  name="workingHoursSelect"
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-brand-500 outline-none bg-white text-slate-900"
                  value={showCustomWorkingHours ? 'Custom' : (formData.workingHours || '')}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === 'Custom') {
                      setShowCustomWorkingHours(true);
                      setFormData(prev => ({ ...prev, workingHours: '' }));
                    } else {
                      setShowCustomWorkingHours(false);
                      setFormData(prev => ({ ...prev, workingHours: val }));
                    }
                  }}
                >
                  <option value="">Select Working Hours</option>
                  <option value="09:00 AM to 05:00 PM">09:00 AM to 05:00 PM</option>
                  <option value="09:30 AM to 06:30 PM">09:30 AM to 06:30 PM</option>
                  <option value="10:00 AM to 06:00 PM">10:00 AM to 06:00 PM</option>
                  <option value="10:00 AM to 07:00 PM">10:00 AM to 07:00 PM</option>
                  <option value="11:00 AM to 08:00 PM">11:00 AM to 08:00 PM</option>
                  <option value="Custom">Custom</option>
                </select>
                {showCustomWorkingHours && (
                  <div className="relative animate-in slide-in-from-top-1 duration-200">
                    <input
                      type="text" name="workingHours" placeholder="e.g. 9 AM to 5 PM"
                      className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-brand-500 outline-none bg-white text-slate-900"
                      value={formData.workingHours || ''}
                      onChange={handleChange}
                    />
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Place of Posting</label>
               <input
                  type="text" name="placeOfPosting" placeholder="e.g. Head Office"
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-brand-500 outline-none bg-white text-slate-900"
                  value={formData.placeOfPosting || ''}
                  onChange={handleChange}
                />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Jurisdiction of Courts</label>
              <div className="space-y-2">
                <select
                  name="jurisdictionSelect"
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-brand-500 outline-none bg-white text-slate-900"
                  value={showCustomJurisdiction ? 'Custom' : (formData.jurisdiction || 'Nagpur')}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === 'Custom') {
                      setShowCustomJurisdiction(true);
                      setFormData(prev => ({ ...prev, jurisdiction: '' }));
                    } else {
                      setShowCustomJurisdiction(false);
                      setFormData(prev => ({ ...prev, jurisdiction: val }));
                    }
                  }}
                >
                  <option value="Nagpur">Nagpur</option>
                  <option value="Mumbai">Mumbai</option>
                  <option value="Pune">Pune</option>
                  <option value="Delhi">Delhi</option>
                  <option value="Custom">Custom</option>
                </select>
                {showCustomJurisdiction && (
                  <div className="relative animate-in slide-in-from-top-1 duration-200">
                    <input
                      type="text"
                      name="jurisdiction"
                      placeholder="Enter custom jurisdiction"
                      className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-brand-500 outline-none bg-white text-slate-900"
                      value={formData.jurisdiction || ''}
                      onChange={handleChange}
                    />
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Joining Date</label>
              <input
                type="date" name="joiningDate"
                className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-brand-500 outline-none bg-white text-slate-900"
                value={formData.joiningDate}
                onChange={handleChange}
              />
            </div>

          </div>
        </div>

        {/* ── Section 5: Bank Details ── */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <h2 className="text-lg font-semibold text-slate-800 mb-6 flex items-center">
            <Landmark size={20} className="mr-2 text-brand-500" /> Bank Details
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Bank Name</label>
              <input
                type="text" name="bankName"
                className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-brand-500 outline-none bg-white text-slate-900"
                value={formData.bankName}
                onChange={handleChange}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Account No.</label>
              <input
                type="text" name="accountNumber"
                className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-brand-500 outline-none bg-white text-slate-900"
                value={formData.accountNumber}
                onChange={handleChange}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">IFSC Code</label>
              <input
                type="text" name="ifscCode"
                className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-brand-500 outline-none bg-white text-slate-900"
                value={formData.ifscCode}
                onChange={handleChange}
              />
            </div>

          </div>
        </div>

        {/* ── Section 6: Identity Details ── */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <h2 className="text-lg font-semibold text-slate-800 mb-6 flex items-center">
            <Fingerprint size={20} className="mr-2 text-brand-500" /> Identity Details
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Aadhaar Card Number</label>
              <input
                type="text" name="aadhaar" placeholder="XXXX-XXXX-XXXX"
                className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-brand-500 outline-none bg-white text-slate-900"
                value={formData.aadhaar}
                onChange={handleChange}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">PAN Card Number</label>
              <input
                type="text" name="pan" placeholder="ABCDE1234F"
                className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-brand-500 outline-none bg-white text-slate-900 uppercase"
                value={formData.pan}
                onChange={handleChange}
              />
            </div>

          </div>
        </div>

        {/* ── Section 7: Documents Upload ── */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <h2 className="text-lg font-semibold text-slate-800 mb-6 flex items-center">
            <Upload size={20} className="mr-2 text-brand-500" /> Documents Upload
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                {['Photo', 'Aadhaar', 'PAN', 'Electric Bill', 'Other'].map((docType) => (
                  <div key={docType} className="relative">
                    <input
                      type="file"
                      id={`file-${docType}`}
                      className="hidden"
                      onChange={(e) => handleFileUpload(e, docType)}
                      accept="image/*,application/pdf"
                    />
                    <label
                      htmlFor={`file-${docType}`}
                      className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-slate-200 rounded-2xl hover:border-brand-400 hover:bg-brand-50 transition-all cursor-pointer group text-center"
                    >
                      <Upload size={20} className="text-slate-400 group-hover:text-brand-600 mb-2" />
                      <span className="text-xs font-bold text-slate-600 group-hover:text-brand-700">{docType}</span>
                    </label>
                  </div>
                ))}
              </div>
              <p className="text-[10px] text-slate-400 font-medium italic">* Supported formats: JPG, PNG, PDF. Max size: 5MB.</p>
            </div>

            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
              <h4 className="text-xs font-bold text-slate-500 uppercase mb-3">
                Uploaded Files ({formData.documents.length})
              </h4>
              {formData.documents.length === 0 ? (
                <div className="h-32 flex flex-col items-center justify-center text-slate-400">
                  <File size={24} className="mb-2 opacity-20" />
                  <p className="text-xs">No documents uploaded yet</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                  {formData.documents.map((doc) => (
                    <div key={doc.id} className="flex items-center justify-between bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
                      <div className="flex items-center min-w-0">
                        <div className="bg-brand-50 p-2 rounded-lg text-brand-600 mr-3 shrink-0">
                          <FileText size={16} />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-800 truncate">{doc.name}</p>
                          <p className="text-[10px] text-slate-500">{doc.type}</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeDocument(doc.id)}
                        className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-all"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        </div>

        {/* ── Section 8: Administrative Assignments ── */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <h2 className="text-lg font-semibold text-slate-800 mb-6 flex items-center">
            <Shield size={20} className="mr-2 text-brand-500" /> Administrative Assignments
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            <div>
              <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1">Select Category</label>
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
              <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1">Select Folder (File)</label>
              <select
                className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-brand-500 outline-none bg-white text-slate-900"
                value={selectedFolder}
                disabled={!selectedCategory}
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
              >
                <option value="">-- Select Folder --</option>
                {folders.filter(f => String(f.category_id) === String(selectedCategory)).map(folder => (
                  <option key={folder.id} value={folder.id}>{folder.name}</option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1">Select Office Address</label>
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
              <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1">Select Manager</label>
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

          {/* Generate Documents */}
          <div className="mt-8 pt-6 border-t border-slate-100">
            <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center uppercase tracking-wider">
              <FileCheck size={18} className="mr-2 text-brand-600" /> Generate Documents
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              <button
                type="button"
                onClick={() => handleGenerateClick('staff_agreement')}
                className="flex items-center justify-between p-4 rounded-xl border border-brand-100 bg-brand-50/30 hover:bg-brand-50 transition-all group"
              >
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-brand-100 rounded-full flex items-center justify-center text-brand-600 mr-3 group-hover:scale-110 transition-transform">
                    <FileText size={20} />
                  </div>
                  <div className="text-left">
                    <p className="font-bold text-slate-800 text-sm">Employment Agreement</p>
                    <p className="text-[10px] text-slate-500">Draft legal agreement</p>
                  </div>
                </div>
                <Printer size={16} className="text-slate-400 group-hover:text-brand-600 transition-colors" />
              </button>

              <button
                type="button"
                onClick={() => setShowIDCard(true)}
                className="flex items-center justify-between p-4 rounded-xl border border-indigo-100 bg-indigo-50/30 hover:bg-indigo-50 transition-all group"
              >
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 mr-3 group-hover:scale-110 transition-transform">
                    <Shield size={20} />
                  </div>
                  <div className="text-left">
                    <p className="font-bold text-slate-800 text-sm">Generate Staff ID Card</p>
                    <p className="text-[10px] text-slate-500">Official identification card</p>
                  </div>
                </div>
                <Printer size={16} className="text-slate-400 group-hover:text-indigo-600 transition-colors" />
              </button>

            </div>
          </div>
        </div>

        {/* ── Submit Buttons ── */}
        <div className="flex justify-end pt-2 pb-8">
          <button
            type="button"
            onClick={() => navigate('/staff-ledger')}
            className="mr-4 px-6 py-3 rounded-lg font-medium text-slate-600 hover:bg-slate-100"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="bg-brand-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-brand-700 flex items-center shadow-md"
          >
            <Save size={18} className="mr-2" /> Save Staff
          </button>
        </div>

      </form>

      {/* ── Language Selection Modal ── */}
      {previewType && !selectedLang && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-[110] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-slate-800 flex items-center">
                <Globe size={24} className="mr-2 text-brand-600" /> Select Language
              </h3>
              <button
                onClick={() => setPreviewType(null)}
                className="p-2 hover:bg-slate-100 rounded-full text-slate-500"
              >
                <X size={24} />
              </button>
            </div>
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
                <span className="font-bold text-slate-700 group-hover:text-brand-700">Hindi (हिंदी)</span>
                <span className="text-xs text-slate-400 font-mono">HIN</span>
              </button>
              <button
                onClick={() => setSelectedLang('marathi')}
                className="flex items-center justify-between p-4 rounded-xl border-2 border-slate-100 hover:border-brand-500 hover:bg-brand-50 transition-all group"
              >
                <span className="font-bold text-slate-700 group-hover:text-brand-700">Marathi (मराठी)</span>
                <span className="text-xs text-slate-400 font-mono">MAR</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Agreement Preview ── */}
      {previewType && selectedLang && (
        <AgreementPreview
          onGenerate={() => setAgreementGenerated(true)}
          data={{
            employee: {
              title: formData.title,
              name: formData.name,
              age: formData.age,
              gender: formData.gender,
              fatherName: formData.fatherName,
              phone: `${formData.countryCode}${formData.phone}`,
              email: formData.email,
              aadhaar: formData.aadhaar,
              pan: formData.pan,
              dob: formData.dob,
              address: formData.address,
              district: formData.district,
              state: formData.state,
              pincode: formData.pincode,
              employeeId: formData.staffId || editingStaffId || previewId,
              staffId: formData.staffId || editingStaffId || previewId || 'TEMP-ID',
              folderSerial: formData.folderSerial
            },
            employment: {
  joiningDate: formData.joiningDate,
  role: formData.role,
  department: formData.categoryName,
  reportingTo: formData.managerName,

  // ✅ FIXED
  placeOfPosting: formData.placeOfPosting || formData.officeLocality,

  // ✅ SALARY CORE
  grossAnnualSalary: formData.annualSalary,
  grossMonthlySalary: formData.salary,

  // ✅ ADD THIS (CRITICAL)
  grossAnnualSalaryWords: numberToIndianWords(formData.annualSalary),
  grossMonthlySalaryWords: numberToIndianWords(formData.salary),

  salaryPaymentFrequency: formData.payable,

  probationPeriod: '3 (Three) Months',

  // ✅ SAFE FALLBACK
  workingHours: formData.workingHours || '09:00 AM to 05:00 PM',

  lunchBreak: '45 Minutes',
  workingDays: 'Monday to Saturday',

  noticePeriodEmployer: '30 Days',
  noticePeriodEmployee: '30 Days',

  annualLeaves: '12',
  medicalLeaves: '6',
  casualLeaves: '6',

  jurisdiction: formData.jurisdiction || 'Nagpur'
},
            company: {
              companyName: companySettings?.companyName || 'Ashray Group',
              entityType: companySettings?.entityType || '',
              companyAddress: formData.officeAddress || '',
              companyLocality: formData.officeLocality || '',
              companyDistrict: formData.officeDistrict || '',
              companyState: formData.officeState || '',
              companyPincode: formData.officePincode || '',
              managerPhone: formData.managerPhone || companySettings?.managers?.[0]?.phone || companySettings?.whatsappNumber || companySettings?.registeredPhone,
              companyEmail: companySettings?.companyEmail || companySettings?.email,
              companyWebsite: companySettings?.companyWebsite || companySettings?.website,
              licenseRegistrationNumber: companySettings?.licenseRegistrationNumber,
              cinNumber: companySettings?.cinNumber,
              companyPan: companySettings?.companyPan || companySettings?.pan,
            },
            manager: {
              managerName: formData.managerName || companySettings?.managers?.[0]?.name || '',
              managerPosition: formData.managerPosition || companySettings?.managers?.[0]?.role || '',
              managerAddress: formData.managerAddress || companySettings?.managers?.[0]?.address || '',
              managerPhone: formData.managerPhone || companySettings?.managers?.[0]?.phone || '',
              managerCountryCode: formData.managerCountryCode || companySettings?.managers?.[0]?.countryCode || '',
            }
          }}
          type={previewType}
          language={selectedLang}
          role={formData.role}
          onClose={() => {
            setPreviewType(null);
            setSelectedLang(null);
          }}
        />
      )}

      {/* ── ID Card Preview ── */}
      {showIDCard && (
        <IDCardEngine
          officeAddresses={officeAddresses}
          data={{
            person: {
              name: formData.name,
              role: formData.role,
              id: formData.staffId || editingStaffId || 'TEMP-ID',
              phone: `${formData.countryCode}${formData.phone}`,
              email: formData.email,
              address: `${formData.address}, ${formData.district}, ${formData.state} - ${formData.pincode}`,
              bloodGroup: formData.bloodGroup,
              joiningDate: formData.joiningDate,
              officeLocality: formData.officeLocality,
              officeAddressId: formData.companyAddressId,
              photo: formData.documents.find((d: any) => d.type === 'Photo' || (d.name || '').toLowerCase().includes('photo'))?.fileData,
              type: 'STAFF'
            },
            company: {
              companyName: companySettings?.companyName || 'Ashray Group',
              companyAddress: formData.officeAddress || companySettings?.companyAddresses?.[0]?.address || 'Corporate Office',
              companyPhone: companySettings?.phone,
              companyEmail: companySettings?.email,
              companyLogo: companySettings?.companyLogo
            }
          }}
          onClose={() => setShowIDCard(false)}
        />
      )}

    </div>
  );
};