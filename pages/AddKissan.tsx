
import React, { useState, useEffect } from 'react';
import { ArrowLeft, Save, User, Phone, MapPin, LandPlot, Tractor, DollarSign, CreditCard, Upload, Plus, Trash2, Building2, Percent, Users, Wallet, FileText, Landmark, Shield, RefreshCw, 
 Globe, X, FileCheck, Printer, } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { dbService } from '../services/db';
import { LandOwner, PaymentMethod, CompanyAddress, TransactionType, TransactionCategory, BankProfile } from '../types';
import { AgreementPreview } from '../components/AgreementTemplates';
import { Accounting } from '../services/accounting';

const OwnerTreeNode: React.FC<{ 
  owner: LandOwner; 
  allOwners: LandOwner[]; 
  level: number;
}> = ({ owner, allOwners, level }) => {
  const children = allOwners.filter(o => o.parentId === owner.id);
  const isRoot = level === 0;

  return (
    <div className="space-y-3">
      <div className={`${isRoot ? 'p-3 border-slate-200' : 'p-2 border-slate-100 relative'} border rounded-lg bg-white shadow-sm flex justify-between items-center`}>
        {!isRoot && <div className="absolute -left-6 top-1/2 w-6 h-0.5 bg-slate-200"></div>}
        <div className="flex items-center">
          <div className={`${isRoot ? 'w-8 h-8 bg-brand-50 text-brand-600 border-brand-100' : 'w-6 h-6 bg-slate-50 text-slate-500 border-slate-100'} rounded-full flex items-center justify-center ${isRoot ? 'mr-3' : 'mr-2'} border`}>
            <User size={isRoot ? 16 : 12} />
          </div>
          <div>
            <div className="flex items-center">
              <h3 className={`font-bold text-slate-800 ${isRoot ? 'text-sm' : 'text-xs'}`}>
                {owner.name || `Owner ${allOwners.indexOf(owner) + 1}`}
              </h3>
              {!isRoot && (
                <span className="ml-2 text-[8px] bg-slate-100 text-slate-500 px-1 py-0.5 rounded font-bold uppercase tracking-wider">
                  {(() => {
                    const parent = allOwners.find(p => p.id === owner.parentId);
                    if (!parent || !owner.relation) return 'Relative';

                    const name = parent.name || 'Parent';

                    // Handle names ending with 's' (Ramesh → Ramesh's, but e.g. "James" → "James'")
                    const possessive = name.endsWith('s') ? `${name}'` : `${name}'s`;

                    return `${possessive} ${owner.relation}`;
                  })()}
                </span>
              )}
            </div>
            <p className={`${isRoot ? 'text-[10px] text-slate-500' : 'text-[9px] text-slate-400'} flex items-center`}>
              <Percent size={isRoot ? 10 : 8} className="mr-1" /> {owner.sharePercentage}% Share
            </p>
          </div>
        </div>
      </div>

      {children.length > 0 && (
        <div className="ml-8 pl-6 border-l-2 border-slate-200 space-y-3 relative">
          {children.map(child => (
            <OwnerTreeNode key={child.id} owner={child} allOwners={allOwners} level={level + 1} />
          ))}
        </div>
      )}
    </div>
  );
};

export const AddKissan: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    landName: '',
    phone: '',
    email: '',
    address: '',
    village: '',
    mouza: '',
    khasraNumber: '',
    tehsil: '',
    district: '',
    surveyNumber: '',
    khataNumber: '',
    patwariCircle: '',
    akarni: '',
    pincode: '',
    state: '',
    landArea: '',
    ratePerAcre: '',
    totalLandValue: '',
    openingBalance: '0',
    paymentMethod: PaymentMethod.CASH as string,
    paymentPurpose: 'Opening Balance Payment',
    registryMaxMonths: '12',
    eastKhasra: '',
    westKhasra: '',
    northKhasra: '',
    southKhasra: '',
    bankId: '',
    officeAddress: '',
    kissanId: '',
    joinDate: new Date().toISOString().split('T')[0]
  });
  const [agreementGenerated, setAgreementGenerated] = useState(false);

  const [banks, setBanks] = useState<BankProfile[]>([]);
  const [managers, setManagers] = useState<any[]>([]);
  const [officeAddresses, setOfficeAddresses] = useState<CompanyAddress[]>([]);
  const [companySettings, setCompanySettings] = useState<any>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [folders, setFolders] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedFolder, setSelectedFolder] = useState<string>('');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewType, setPreviewType] = useState<'agreement' | 'token' | null>(null);
  const [selectedLang, setSelectedLang] = useState<'english' | 'hindi' | 'marathi' | null>(null);
  const [previewId, setPreviewId] = useState<string>('');

  
  useEffect(() => {
    const loadBanks = async () => {
      const allBanks = await dbService.getBanks();
      setBanks(allBanks);
    };
    loadBanks();
  }, []);

  useEffect(() => {
    if (!formData.kissanId) {
      dbService.peekId('KID', formData.joinDate).then(id => {
        setPreviewId(id);
      });
    }
  }, [formData.joinDate, formData.kissanId]);

  const [landFiles, setLandFiles] = useState<File[]>([]);
  const [openingBalanceBreakdown, setOpeningBalanceBreakdown] = useState<Record<string, string>>({});
  const [ownerPaymentMethods, setOwnerPaymentMethods] = useState<Record<string, PaymentMethod>>({});
  const [ownerReferenceIds, setOwnerReferenceIds] = useState<Record<string, string>>({});

  const [owners, setOwners] = useState<(Partial<LandOwner> & { files?: File[]; isCustomRelation?: boolean })[]>([
    { id: 'o1', name: '', age: '', occupation: '', sharePercentage: 100, aadhaar: '', pan: '', bankName: '', accountNumber: '', ifscCode: '', phone: '', parentId: '', relation: '', files: [], isCustomRelation: false }
  ]);

  const COMMON_RELATIONS = [
    'Brother', 'Sister', 'Husband', 'Wife', 'Father', 'Mother', 'Son', 'Daughter', 
    'Grandfather', 'Grandmother', 'Legal Heir', 'Power of Attorney Holder', 'Partner'
  ];

  const distributeOpeningBalance = (total: number, currentOwners: Partial<LandOwner>[]) => {
    const newBreakdown: Record<string, string> = {};
    currentOwners.forEach(owner => {
      if (owner.id) {
        const share = (total * (Number(owner.sharePercentage) || 0)) / 100;
        newBreakdown[owner.id] = share.toFixed(2);
      }
    });
    setOpeningBalanceBreakdown(newBreakdown);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const newData = { ...prev, [name]: value };
      
      // If total opening balance changes, distribute it among owners
      if (name === 'openingBalance') {
        distributeOpeningBalance(Number(value) || 0, owners);
      }
      
      return newData;
    });
  };

  const handleOwnerOpeningBalanceChange = (ownerId: string, value: string) => {
    const newBreakdown = { ...openingBalanceBreakdown, [ownerId]: value };
    setOpeningBalanceBreakdown(newBreakdown);
    
    // Update total opening balance
    const total = Object.values(newBreakdown).reduce((acc: number, val) => acc + (Number(val) || 0), 0);
    setFormData(prev => ({ ...prev, openingBalance: total.toString() }));
  };

  const handleOwnerChange = (index: number, field: string, value: any) => {
    setOwners(prev => {
      const updatedOwners = [...prev];
      if (field === 'files') {
        const existingFiles = updatedOwners[index].files || [];
        updatedOwners[index] = { ...updatedOwners[index], files: [...existingFiles, ...value] };
      } else {
        updatedOwners[index] = { ...updatedOwners[index], [field]: value };
      }
      
      // If parentId is cleared, also clear relation and custom flag
      if (field === 'parentId' && !value) {
        updatedOwners[index].relation = '';
        updatedOwners[index].isCustomRelation = false;
      }

      // SIDE EFFECT: If sharePercentage changes, redistribute opening balance
      // We do this after returning or we could call a separate function
      return updatedOwners;
    });

    if (field === 'sharePercentage') {
      setOwners(current => {
        distributeOpeningBalance(Number(formData.openingBalance) || 0, current);
        return current;
      });
    }
  };

  const removeOwnerFile = (ownerIndex: number, fileIndex: number) => {
    const updatedOwners = [...owners];
    if (updatedOwners[ownerIndex].files) {
      updatedOwners[ownerIndex].files = updatedOwners[ownerIndex].files?.filter((_, i) => i !== fileIndex);
      setOwners(updatedOwners);
    }
  };

  const addOwner = async () => {
    try {
      const partnerId = await dbService.generateId('PID', formData.joinDate);
      const newOwner = { 
        id: partnerId, 
        name: '', 
        age: '',
        occupation: '',
        sharePercentage: 0, 
        aadhaar: '', 
        pan: '', 
        bankName: '', 
        accountNumber: '', 
        ifscCode: '', 
        phone: '',
        parentId: '',
        relation: '',
        files: []
      };
      const updatedOwners = [...owners, newOwner];
      setOwners(updatedOwners);
      
      // Ensure new owner has a key in breakdown
      setOpeningBalanceBreakdown(prev => ({ ...prev, [newOwner.id]: '0' }));
    } catch (error) {
      console.error('Error generating partner ID:', error);
      // Fallback
      const newOwner = { id: 'o' + Date.now(), name: '', age: '', occupation: '', sharePercentage: 0, aadhaar: '', pan: '', bankName: '', accountNumber: '', ifscCode: '', phone: '', parentId: '', relation: '' };
      setOwners([...owners, newOwner]);
    }
  };

  const removeOwner = (index: number) => {
    if (owners.length > 1) {
      const removedOwnerId = owners[index].id;
      const updatedOwners = owners
        .filter((_, i) => i !== index)
        .map(o => o.parentId === removedOwnerId ? { ...o, parentId: '', relation: '' } : o);
      setOwners(updatedOwners);

      // Remove from breakdown and redistribute
      const newBreakdown = { ...openingBalanceBreakdown };
      delete newBreakdown[removedOwnerId!];
      setOpeningBalanceBreakdown(newBreakdown);
      
      // Recalculate total if needed, or redistribute based on new total?
      // Usually if you remove an owner, you might want to redistribute the existing total among remaining owners
      distributeOpeningBalance(Number(formData.openingBalance) || 0, updatedOwners);
    }
  };

  const handleGenerateClick = (type: 'agreement' | 'token') => {
    setPreviewType(type);
    setSelectedLang(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate total share percentage
    const totalShare = owners.reduce((acc, o) => acc + (Number(o.sharePercentage) || 0), 0);
    if (totalShare !== 100) {
      alert(`Total share percentage must be 100%. Current total: ${totalShare}%`);
      return;
    }

    const kissanId = formData.kissanId || await dbService.generateId('KID', formData.joinDate);
    const totalLandValue = Number(formData.totalLandValue);
    const totalOpeningBalance = Number(formData.openingBalance);

    // 1. Save Kissan Record
    await dbService.saveKissan({
      id: kissanId,
      landName: formData.landName,
      phone: formData.phone,
      email: formData.email,
      address: formData.address,
      village: formData.village,
      mouza: formData.mouza,
      khasraNumber: formData.khasraNumber,
      tehsil: formData.tehsil,
      district: formData.district,
      pincode: formData.pincode,
      state: formData.state,
      surveyNumber: formData.surveyNumber,
      khataNumber: formData.khataNumber,
      patwariCircle: formData.patwariCircle,
      akarni: formData.akarni,
      landArea: formData.landArea,
      ratePerAcre: Number(formData.ratePerAcre) || 0,
      totalLandValue: totalLandValue,
      openingBalance: totalOpeningBalance,
      balance: totalLandValue - totalOpeningBalance, // Correct starting balance
      registryMaxMonths: Number(formData.registryMaxMonths) || 12,
      eastKhasra: formData.eastKhasra,
      westKhasra: formData.westKhasra,
      northKhasra: formData.northKhasra,
      southKhasra: formData.southKhasra,
      joinDate: new Date().toISOString().split('T')[0],
      owners: owners as LandOwner[],
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
      managerAadhaar: formData.managerAadhaar
    });

    // 1.1 Save Owner specific documents
    for (const owner of owners) {
      if (owner.files && owner.files.length > 0) {
        for (const file of owner.files) {
          const reader = new FileReader();
          const filePromise = new Promise<string>((resolve) => {
            reader.onload = () => resolve(reader.result as string);
            reader.readAsDataURL(file);
          });
          const fileData = await filePromise;

          await dbService.saveDoc({
            id: `doc_${Date.now()}_${owner.id}_${file.name}`,
            name: file.name,
            date: new Date().toISOString().split('T')[0],
            size: `${(file.size / 1024).toFixed(2)} KB`,
            type: file.type.includes('pdf') ? 'pdf' : 'img',
            synced: false,
            category: 'KISSAN',
            kissanId: kissanId,
            ownerId: owner.id, // Linked to specific owner
            fileData: fileData,
            folder_id: formData.folderId,
            category_id: formData.categoryId,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });
        }
      }
    }

    // 1.2 Save Land specific documents
    if (landFiles.length > 0) {
      for (const file of landFiles) {
        const reader = new FileReader();
        const base64 = await new Promise<string>((resolve) => {
          reader.onload = (e) => resolve(e.target?.result as string);
          reader.readAsDataURL(file);
        });

        await dbService.saveDoc({
          id: `doc_land_${Date.now()}_${file.name}`,
          name: file.name,
          date: new Date().toISOString().split('T')[0],
          size: `${(file.size / 1024).toFixed(2)} KB`,
          type: file.type.includes('pdf') ? 'pdf' : 'img',
          synced: false,
          category: 'KISSAN',
          kissanId: kissanId,
          fileData: base64,
          folder_id: formData.folderId,
          category_id: formData.categoryId,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
      }
    }

    const pendingCheques: any[] = [];

    // 2. Create Land Purchase Agreement Transaction (Credit - We owe them)

    for (const owner of owners) {
      const amount = Number(openingBalanceBreakdown[owner.id!] || 0);
      const method = ownerPaymentMethods[owner.id!] || formData.paymentMethod as PaymentMethod;
      const referenceId = method === PaymentMethod.CHEQUE ? 'CHEQUE PENDING' : (ownerReferenceIds[owner.id!] || 'OPENING-BAL');
      const txId = `tx_ob_${Date.now()}_${owner.id}`;
      if (amount > 0) {
        await dbService.saveTransaction({
          id: txId,
          date: new Date().toISOString().split('T')[0],
          particulars: `${formData.paymentPurpose} - ${formData.landName} (${owner.name})`,
          amount: amount,
          type: TransactionType.DEBIT,
          category: TransactionCategory.KISSAN_PAYMENT,
          method: method,
          bankId: formData.bankId || undefined,
          referenceId: referenceId,
          kissanId: kissanId,
          ownerId: owner.id,
          balanceAfter: 0, // Updated by service
          synced: false
        });

        const pendingReceipt = {
          id: `pr_${Date.now()}_${owner.id}`,
          transactionId: txId,
          payeeName: owner.name || 'Unnamed Owner',
          amount: amount,
          date: new Date().toISOString().split('T')[0],
          partyType: 'Kissan',
          partyId: kissanId,
          printed: false
        };

        const existingReceipts = JSON.parse(localStorage.getItem('pending_receipts') || '[]');
        localStorage.setItem('pending_receipts', JSON.stringify([...existingReceipts, pendingReceipt]));
        localStorage.removeItem('pending_receipts_remind_after');

        if (method === 'CHEQUE') {
          pendingCheques.push({
            id: `pc_${Date.now()}_${owner.id}`,
            transactionId: txId, 
            payeeName: owner.name || 'Unnamed Owner',
            amount: amount,
            date: new Date().toISOString().split('T')[0],
            partyType: 'Kissan',
            partyId: `${kissanId}::${owner.id}`,
            printed: false
          });
        }
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
            partyId: kissanId,
            partyName: formData.landName,
            partyType: 'Kissan',
            date: new Date().toISOString().split('T')[0],
            printed: false,
            previewData: {
              client: {
                title: 'Mr.',
                name: formData.landName || '',
                age: '',
                gender: '',
                occupation: '',
                phone: formData.phone,
                email: formData.email,
                aadhaar: '',
                pan: '',
                address: formData.address,
                district: formData.district,
                state: formData.state,
                pincode: formData.pincode,
                nominee1Name: '',
                nominee1Age: '',
                nominee1Occupation: '',
                nominee1Aadhaar: '',
                nominee2Name: '',
                nominee2Age: '',
                nominee2Occupation: '',
                nominee2Aadhaar: '',
                clientId: kissanId
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

    alert('Agriculture Land Added to Kissan Khata!');
    
    if (pendingCheques.length > 0) {
      const existing = JSON.parse(localStorage.getItem('pending_cheques') || '[]');
      localStorage.setItem('pending_cheques', JSON.stringify([...existing, ...pendingCheques]));
      localStorage.removeItem('pending_cheques_remind_after');
      navigate('/pending-cheques');
    } else {
      navigate('/kissan-khata');
    }
  };


  useEffect(() => {
      const loadData = async () => {
        const [props, bks, cats, flds, settings] = await Promise.all([
          dbService.getProperties(),
          dbService.getBanks(),
          dbService.getCategories(),
          dbService.getFolders(),
          dbService.getSettings(),
        ]);
  
        setBanks(bks);
        setCategories(Array.isArray(cats) ? cats : []);
        setFolders(Array.isArray(flds) ? flds : []);
        setCompanySettings(settings);
        setOfficeAddresses(settings.companyAddresses || []);
        setManagers(settings.managers || []);
      };
  
      loadData();
    }, []);

  return (
    <div className="max-w-4xl mx-auto pb-10">
      <div className="flex items-center mb-6">
        <Link to="/kissan-khata" className="p-2 mr-2 hover:bg-slate-200 rounded-full">
          <ArrowLeft size={20} className="text-slate-600" />
        </Link>
        <h1 className="text-xl font-bold text-slate-800">Add Agriculture Land / Property</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Land Basic Info */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center">
            <Tractor size={20} className="mr-2 text-brand-500" /> Land Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">Agriculture Land / Property Name</label>
              <input type="text" name="landName" required placeholder="e.g. Karjat Riverside Estate" className="w-full bg-white text-slate-900 border border-slate-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-brand-500" value={formData.landName} onChange={handleChange} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Mouza Name</label>
              <input type="text" name="mouza" required className="w-full bg-white text-slate-900 border border-slate-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-brand-500" value={formData.mouza} onChange={handleChange} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Survey Number</label>
              <input
                type="text"
                name="surveyNumber"
                placeholder="e.g. 45/2A"
                className="w-full bg-white text-slate-900 border border-slate-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-brand-500"
                value={formData.surveyNumber}
                onChange={handleChange}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Khata Number</label>
              <input type="text" name="khataNumber" className="w-full bg-white text-slate-900 border border-slate-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-brand-500" value={formData.khataNumber} onChange={handleChange} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Patwari Circle (P.H. No.)</label>
              <input type="text" name="patwariCircle" className="w-full bg-white text-slate-900 border border-slate-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-brand-500" value={formData.patwariCircle} onChange={handleChange} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Uncultivated (Akarni) Area</label>
              <input type="text" name="akarni" placeholder="e.g. 0.05 Ha." className="w-full bg-white text-slate-900 border border-slate-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-brand-500" value={formData.akarni} onChange={handleChange} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Khasra Number</label>
              <input type="text" name="khasraNumber" required className="w-full bg-white text-slate-900 border border-slate-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-brand-500" value={formData.khasraNumber} onChange={handleChange} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Land Area</label>
              <input type="text" name="landArea" placeholder="e.g. 1.50 Ha." className="w-full bg-white text-slate-900 border border-slate-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-brand-500" value={formData.landArea} onChange={handleChange} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Rate Per Acre</label>
              <input type="number" name="ratePerAcre" className="w-full bg-white text-slate-900 border border-slate-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-brand-500" value={formData.ratePerAcre} onChange={handleChange} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Total Consideration Value</label>
              <input type="number" name="totalLandValue" required className="w-full bg-white text-slate-900 border border-slate-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-brand-500" value={formData.totalLandValue} onChange={handleChange} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Registry Deadline (Months)</label>
              <input type="number" name="registryMaxMonths" className="w-full bg-white text-slate-900 border border-slate-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-brand-500" value={formData.registryMaxMonths} onChange={handleChange} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Phone Number</label>
              <input type="tel" name="phone" required className="w-full bg-white text-slate-900 border border-slate-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-brand-500" value={formData.phone} onChange={handleChange} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Email (Optional)</label>
              <input type="email" name="email" className="w-full bg-white text-slate-900 border border-slate-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-brand-500" value={formData.email} onChange={handleChange} />
            </div>
          </div>
        </div>

        {/* Land Documents Section */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center">
            <FileText size={20} className="mr-2 text-brand-500" /> Land Property Documents
          </h2>
          <div className="space-y-6">
            <div 
              onClick={() => document.getElementById('land-file-upload')?.click()}
              className="w-full border-2 border-dashed border-slate-200 rounded-xl p-10 flex flex-col items-center justify-center text-slate-400 hover:bg-slate-50 hover:border-brand-200 transition-all cursor-pointer bg-white group"
            >
              <Upload size={40} className="mb-3 group-hover:text-brand-500 transition-colors" />
              <span className="text-sm font-bold uppercase tracking-wider group-hover:text-brand-600 transition-colors text-center">Upload Land Records (7/12, Map, etc.)</span>
              <p className="text-[10px] text-slate-400 mt-2">Files will be visible in the property documents section after adding</p>
              <input 
                id="land-file-upload"
                type="file" 
                className="hidden" 
                multiple 
                onChange={(e) => {
                  if (e.target.files) {
                    setLandFiles(prev => [...prev, ...Array.from(e.target.files!)]);
                  }
                }}
                accept=".pdf,.jpg,.jpeg,.png"
              />
            </div>

            {landFiles.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-2">
                {landFiles.map((file, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-brand-50/50 rounded-xl border border-brand-100">
                    <div className="flex items-center overflow-hidden">
                      <FileText size={18} className="text-brand-500 mr-2 shrink-0" />
                      <span className="text-xs text-slate-700 font-medium truncate">{file.name}</span>
                    </div>
                    <button 
                      type="button"
                      onClick={() => setLandFiles(prev => prev.filter((_, i) => i !== idx))}
                      className="text-slate-400 hover:text-red-500 p-1 rounded-lg hover:bg-white"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Location Details */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center">
            <MapPin size={20} className="mr-2 text-brand-500" /> Location Details
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">Address Line</label>
              <input
                type="text"
                name="address"
                placeholder="House no., road, landmark, or nearby location"
                className="w-full bg-white text-slate-900 border border-slate-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-brand-500"
                value={formData.address}
                onChange={handleChange}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Village</label>
              <input type="text" name="village" required className="w-full bg-white text-slate-900 border border-slate-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-brand-500" value={formData.village} onChange={handleChange} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Tehsil</label>
              <input type="text" name="tehsil" required className="w-full bg-white text-slate-900 border border-slate-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-brand-500" value={formData.tehsil} onChange={handleChange} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">District</label>
              <input type="text" name="district" required className="w-full bg-white text-slate-900 border border-slate-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-brand-500" value={formData.district} onChange={handleChange} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">State</label>
              <select
                name="state"
                className="w-full bg-white text-slate-900 border border-slate-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-brand-500"
                value={formData.state}
                onChange={handleChange}
              >
                <option value="">-- Select State --</option>
                <option value="Maharashtra">Maharashtra</option>
                <option value="Madhya Pradesh">Madhya Pradesh</option>
                <option value="Chhattisgarh">Chhattisgarh</option>
                <option value="Gujarat">Gujarat</option>
                <option value="Rajasthan">Rajasthan</option>
                <option value="Uttar Pradesh">Uttar Pradesh</option>
                <option value="Telangana">Telangana</option>
                <option value="Karnataka">Karnataka</option>
                <option value="Tamil Nadu">Tamil Nadu</option>
                <option value="Delhi">Delhi</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Pincode</label>
              <input
                type="text"
                name="pincode"
                placeholder="e.g. 440001"
                className="w-full bg-white text-slate-900 border border-slate-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-brand-500"
                value={formData.pincode}
                onChange={handleChange}
              />
            </div>
            <div className="md:col-span-2 grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 border-t pt-4">
              <div className="col-span-full mb-2">
                <h3 className="text-xs font-bold text-slate-500 uppercase">Land Boundaries (Khasra Nos.)</h3>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-tight">East</label>
                <input type="text" name="eastKhasra" className="w-full bg-white text-slate-900 border border-slate-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-500" value={formData.eastKhasra} onChange={handleChange} />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-tight">West</label>
                <input type="text" name="westKhasra" className="w-full bg-white text-slate-900 border border-slate-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-500" value={formData.westKhasra} onChange={handleChange} />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-tight">North</label>
                <input type="text" name="northKhasra" className="w-full bg-white text-slate-900 border border-slate-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-500" value={formData.northKhasra} onChange={handleChange} />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-tight">South</label>
                <input type="text" name="southKhasra" className="w-full bg-white text-slate-900 border border-slate-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-500" value={formData.southKhasra} onChange={handleChange} />
              </div>
            </div>
        </div>
                </div>


        {/* Owners Section */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-slate-800 flex items-center">
              <User size={20} className="mr-2 text-brand-500" /> Land Owners / Partners
            </h2>
            <button 
              type="button" 
              onClick={addOwner}
              className="text-sm font-bold text-brand-600 hover:text-brand-700 flex items-center"
            >
              <Plus size={16} className="mr-1" /> Add Owner
            </button>
          </div>

          <div className="space-y-6">
            {owners.map((owner, index) => (
              <div key={owner.id} className="p-4 border border-slate-100 rounded-xl bg-slate-50/50 relative">
                {owners.length > 1 && (
                  <button 
                    type="button" 
                    onClick={() => removeOwner(index)}
                    className="absolute top-4 right-4 text-slate-400 hover:text-red-500"
                  >
                    <Trash2 size={18} />
                  </button>
                )}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Owner Name</label>
                    <input type="text" required className="w-full bg-white text-slate-900 border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-500" value={owner.name} onChange={(e) => handleOwnerChange(index, 'name', e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Age</label>
                    <input type="text" className="w-full bg-white text-slate-900 border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-500" value={owner.age} onChange={(e) => handleOwnerChange(index, 'age', e.target.value)} placeholder="e.g. 45" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Occupation</label>
                    <input type="text" className="w-full bg-white text-slate-900 border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-500" value={owner.occupation} onChange={(e) => handleOwnerChange(index, 'occupation', e.target.value)} placeholder="e.g. Farmer" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Share %</label>
                    <input type="number" required className="w-full bg-white text-slate-900 border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-500" value={owner.sharePercentage} onChange={(e) => handleOwnerChange(index, 'sharePercentage', e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Aadhaar Number</label>
                    <input type="text" className="w-full bg-white text-slate-900 border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-500" value={owner.aadhaar} onChange={(e) => handleOwnerChange(index, 'aadhaar', e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">PAN Number</label>
                    <input type="text" className="w-full bg-white text-slate-900 border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-500" value={owner.pan} onChange={(e) => handleOwnerChange(index, 'pan', e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Phone</label>
                    <input type="tel" className="w-full bg-white text-slate-900 border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-500" value={owner.phone} onChange={(e) => handleOwnerChange(index, 'phone', e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Related To (Parent Owner)</label>
                    <select 
                      className="w-full bg-white text-slate-900 border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-500"
                      value={owner.parentId || ''}
                      onChange={(e) => handleOwnerChange(index, 'parentId', e.target.value)}
                    >
                      <option value="">None (Main Owner)</option>
                      {owners.filter((_, i) => i !== index).map(p => (
                        <option key={p.id} value={p.id}>{p.name || `Owner ${owners.indexOf(p) + 1}`}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Relation</label>
                    <div className="space-y-2">
                      <select 
                        className="w-full bg-white text-slate-900 border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-500"
                        value={owner.isCustomRelation ? 'Other' : (owner.relation || '')}
                        disabled={!owner.parentId}
                        onChange={(e) => {
                          const val = e.target.value;
                          setOwners(prev => {
                            const newOwners = [...prev];
                            if (val === 'Other') {
                              newOwners[index] = { ...newOwners[index], isCustomRelation: true, relation: '' };
                            } else {
                              newOwners[index] = { ...newOwners[index], isCustomRelation: false, relation: val };
                            }
                            return newOwners;
                          });
                        }}
                      >
                        <option value="">Select Relation</option>
                        {COMMON_RELATIONS.map(rel => (
                          <option key={rel} value={rel}>{rel}</option>
                        ))}
                        <option value="Other">Other (Custom)</option>
                      </select>

                      {(owner.isCustomRelation || (owner.relation && !COMMON_RELATIONS.includes(owner.relation))) && (
                        <input 
                          type="text" 
                          className="w-full bg-white text-slate-900 border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-500 animate-in slide-in-from-top-1 duration-200" 
                          value={owner.relation || ''} 
                          onChange={(e) => handleOwnerChange(index, 'relation', e.target.value)}
                          placeholder="Type custom relation..."
                          autoFocus
                        />
                      )}
                    </div>
                  </div>
                  <div className="md:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-slate-200 pt-4 mt-2">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Bank Name</label>
                      <input type="text" className="w-full bg-white text-slate-900 border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-500" value={owner.bankName} onChange={(e) => handleOwnerChange(index, 'bankName', e.target.value)} />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Account Number</label>
                      <input type="text" className="w-full bg-white text-slate-900 border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-500" value={owner.accountNumber} onChange={(e) => handleOwnerChange(index, 'accountNumber', e.target.value)} />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1">IFSC Code</label>
                      <input type="text" className="w-full bg-white text-slate-900 border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-500" value={owner.ifscCode} onChange={(e) => handleOwnerChange(index, 'ifscCode', e.target.value)} />
                    </div>
                  </div>

                  {/* Identity Details section per Owner */}
                  <div className="md:col-span-3 mt-4 pt-4 border-t border-dashed border-slate-200">
                    <h3 className="text-[10px] font-bold text-brand-600 uppercase tracking-widest mb-3 flex items-center">
                      <Shield size={12} className="mr-1.5" /> Identity Details & Documents
                    </h3>
                    <div className="space-y-4">
                      <div 
                        onClick={() => document.getElementById(`file-upload-${owner.id}`)?.click()}
                        className="w-full border-2 border-dashed border-slate-200 rounded-xl p-6 flex flex-col items-center justify-center text-slate-400 hover:bg-slate-50 hover:border-brand-200 transition-all cursor-pointer bg-white group"
                      >
                        <Upload size={32} className="mb-2 group-hover:text-brand-500 transition-colors" />
                        <span className="text-[11px] font-bold uppercase tracking-wider group-hover:text-brand-600 transition-colors text-center">Upload Partner/Owner Identity Documents</span>
                        <input 
                          id={`file-upload-${owner.id}`}
                          type="file" 
                          className="hidden" 
                          multiple 
                          onChange={(e) => {
                            if (e.target.files) {
                              handleOwnerChange(index, 'files', Array.from(e.target.files));
                            }
                          }}
                          accept=".pdf,.jpg,.jpeg,.png"
                        />
                      </div>

                      {owner.files && owner.files.length > 0 && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                           {owner.files.map((file, fIdx) => (
                             <div key={fIdx} className="flex items-center justify-between p-3 bg-brand-50/50 rounded-xl border border-brand-100">
                               <div className="flex items-center overflow-hidden">
                                 <FileText size={16} className="text-brand-500 mr-2 shrink-0" />
                                 <span className="text-[11px] text-slate-700 font-medium truncate">{file.name}</span>
                               </div>
                               <button 
                                 type="button"
                                 onClick={() => removeOwnerFile(index, fIdx)}
                                 className="text-slate-400 hover:text-red-500 p-1 rounded-lg hover:bg-white"
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
              </div>
            ))}
          </div>
        </div>

        {/* Relation Tree Preview */}
        {owners.length > 1 && (
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center">
              <Users size={20} className="mr-2 text-brand-500" /> Relation Tree Preview
            </h2>
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-4">
              {owners.filter(o => !o.parentId).map(mainOwner => (
                <OwnerTreeNode 
                  key={mainOwner.id} 
                  owner={mainOwner} 
                  allOwners={owners} 
                  level={0} 
                />
              ))}
            </div>
          </div>
        )}

        {/* Financial Details */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex justify-between items-center">
            <h2 className="text-lg font-bold text-slate-800 flex items-center">
              <DollarSign size={20} className="mr-2 text-brand-600" /> Deal & Financial Configuration
            </h2>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Land Value</span>
              <span className="text-lg font-mono font-bold text-brand-700">₹{(Number(formData.totalLandValue) || 0).toLocaleString('en-IN')}</span>
            </div>
          </div>
          
          <div className="p-6 space-y-8">
            {/* Top Level Summary Inputs */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Total Purchase Value</label>
                <div className="relative group">
                  <span className="absolute left-3 top-2.5 text-slate-400 group-focus-within:text-brand-500 transition-colors">₹</span>
                  <input 
                    type="number" 
                    name="totalLandValue" 
                    required 
                    placeholder="Enter total amount"
                    className="w-full pl-8 bg-white text-slate-900 border border-slate-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-brand-500 transition-all font-bold text-lg" 
                    value={formData.totalLandValue} 
                    onChange={handleChange} 
                  />
                </div>
                <p className="text-[10px] font-medium text-brand-600 italic mt-1 leading-tight">
                  {Accounting.formatIndianWords(Number(formData.totalLandValue) || 0)} Rupees Only
                </p>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Settlement Bank/Cash</label>
                  <Link to="/bank-manager" className="text-[9px] text-brand-600 hover:underline font-bold uppercase transition-all">Setup Banks</Link>
                </div>
                <div className="relative group">
                  <span className="absolute left-3 top-2.5 text-slate-400 group-focus-within:text-brand-500 transition-colors"><Landmark size={18} /></span>
                  <select 
                    name="bankId" 
                    className="w-full pl-10 bg-white text-slate-900 border border-slate-300 rounded-lg px-3 py-2.5 outline-none focus:ring-2 focus:ring-brand-500 transition-all font-medium" 
                    value={formData.bankId} 
                    onChange={handleChange}
                    required={Object.values(ownerPaymentMethods).some(m => m !== PaymentMethod.CASH)}
                  >
                    <option value="">-- Choose Account --</option>
                    {banks.map(bank => (
                      <option key={bank.id} value={bank.id}>
                        {bank.bankName} (..{(bank.accountNumber || '').slice(-4)})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Payment Narrative</label>
                <div className="relative group">
                  <span className="absolute left-3 top-2.5 text-slate-400 group-focus-within:text-brand-500 transition-colors"><FileText size={18} /></span>
                  <select 
                    name="paymentPurpose" 
                    className="w-full pl-10 bg-white text-slate-900 border border-slate-300 rounded-lg px-3 py-2.5 outline-none focus:ring-2 focus:ring-brand-500 transition-all font-medium" 
                    value={formData.paymentPurpose} 
                    onChange={handleChange}
                  >
                    <option value="Opening Balance Payment">Opening Balance Payment</option>
                    <option value="Token / Advance Payment">Token / Advance Payment</option>
                    <option value="Part Payment">Part Payment</option>
                    <option value="Full Payment">Full Payment</option>
                    <option value="Agreement Payment">Agreement Payment</option>
                    <option value="Other">Other narrative</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Partner Distribution Table-like Layout */}
            <div className="space-y-4">
              <div className="flex justify-between items-end">
                <div>
                  <h3 className="text-sm font-bold text-slate-800 flex items-center">
                    <Users size={18} className="mr-2 text-slate-400" /> Initial Payment (Paid Amount) Distribution
                  </h3>
                  <p className="text-[10px] text-slate-400 font-medium">Record existing payments made to each partner before adding to system</p>
                </div>
                <div className="bg-brand-50 px-4 py-2 rounded-lg border border-brand-100/50 flex flex-col items-end">
                  <span className="text-[9px] font-bold text-brand-500 uppercase tracking-widest">Total Initial Payment</span>
                  <div className="flex items-center gap-1.5 cursor-pointer">
                    <span className="text-sm font-bold text-brand-700">₹</span>
                    <input 
                      type="number" 
                      name="openingBalance" 
                      className="bg-transparent text-brand-700 font-bold text-lg outline-none w-32 text-right" 
                      value={formData.openingBalance} 
                      onChange={handleChange} 
                    />
                  </div>
                </div>
              </div>

              <div className="border border-slate-100 rounded-xl overflow-hidden divide-y divide-slate-100 bg-slate-50/30">
                {owners.map((owner) => {
                  const totalValue = Number(formData.totalLandValue) || 0;
                  const sharePercentage = Number(owner.sharePercentage) || 0;
                  const totalShareValue = (totalValue * sharePercentage) / 100;
                  const openingPayment = Number(openingBalanceBreakdown[owner.id!] || 0);
                  const remainingBalance = totalShareValue - openingPayment;

                  return (
                    <div key={owner.id} className="p-4 hover:bg-white transition-all">
                      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                        {/* Owner Info */}
                        <div className="lg:col-span-3 flex items-center">
                          <div className="w-10 h-10 bg-brand-50 rounded-lg flex items-center justify-center text-brand-600 mr-3 shrink-0 border border-brand-100">
                            <User size={20} />
                          </div>
                          <div className="truncate">
                            <span className="text-sm font-bold text-slate-800 block truncate">{owner.name || 'Unnamed Owner'}</span>
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-bold text-brand-500 uppercase">{owner.sharePercentage}% Share</span>
                              <span className="text-[10px] text-slate-400 font-mono">₹{totalShareValue.toLocaleString('en-IN')}</span>
                            </div>
                          </div>
                        </div>

                        {/* Payment Inputs */}
                        <div className="lg:col-span-9 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                          <div className="space-y-1">
                            <label className="text-[9px] font-bold text-slate-400 uppercase tracking-tight block">Initial Payment</label>
                            <div className="relative">
                              <span className="absolute left-2.5 top-1.5 text-xs text-slate-400">₹</span>
                              <input 
                                type="number" 
                                className="w-full pl-6 bg-white border border-slate-200 rounded-lg py-1.5 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-brand-500 transition-all" 
                                value={openingBalanceBreakdown[owner.id!] || '0'} 
                                onChange={(e) => handleOwnerOpeningBalanceChange(owner.id!, e.target.value)}
                              />
                            </div>
                          </div>

                          <div className="space-y-1">
                            <label className="text-[9px] font-bold text-slate-400 uppercase tracking-tight block">Payment Mode</label>
                            <select 
                              className="w-full bg-white border border-slate-200 rounded-lg py-1.5 px-2 text-xs font-bold text-slate-700 outline-none focus:ring-2 focus:ring-brand-500 transition-all h-[34px]"
                              value={ownerPaymentMethods[owner.id!] || PaymentMethod.CASH}
                              onChange={(e) => setOwnerPaymentMethods(prev => ({ ...prev, [owner.id!]: e.target.value as PaymentMethod }))}
                            >
                              {Object.values(PaymentMethod).map(method => (
                                <option key={method} value={method}>{method}</option>
                              ))}
                            </select>
                          </div>

                          <div className="space-y-1">
                            <label className="text-[9px] font-bold text-slate-400 uppercase tracking-tight block">Reference / TXN ID</label>
                            <input 
                              type="text" 
                              placeholder={ownerPaymentMethods[owner.id!] === PaymentMethod.CHEQUE ? "Will be added on Cheque" : "ID / Ref No."}
                              disabled={ownerPaymentMethods[owner.id!] === PaymentMethod.CHEQUE}
                              className={`w-full bg-white border border-slate-200 rounded-lg py-1.5 px-3 text-xs font-medium text-slate-700 outline-none focus:ring-2 focus:ring-brand-500 transition-all h-[34px] ${ownerPaymentMethods[owner.id!] === PaymentMethod.CHEQUE ? 'bg-slate-50 cursor-not-allowed italic' : ''}`}
                              value={ownerPaymentMethods[owner.id!] === PaymentMethod.CHEQUE ? '' : (ownerReferenceIds[owner.id!] || '')}
                              onChange={(e) => setOwnerReferenceIds(prev => ({ ...prev, [owner.id!]: e.target.value }))}
                            />
                          </div>

                          <div className={`p-1.5 rounded-lg border flex flex-col justify-center items-end ${remainingBalance > 0 ? 'bg-orange-50/50 border-orange-100' : 'bg-emerald-50/50 border-emerald-100'}`}>
                            <span className={`text-[8px] font-bold uppercase block ${remainingBalance > 0 ? 'text-orange-500' : 'text-emerald-500'}`}>Balance Due</span>
                            <span className={`text-xs font-bold font-mono ${remainingBalance > 0 ? 'text-orange-700' : 'text-emerald-700'}`}>
                              ₹{remainingBalance.toLocaleString('en-IN')}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              
              {/* Total Distribution Check */}
              <div className="flex justify-end pr-4">
                 <div className="flex items-center gap-2 text-slate-400 text-[10px] font-bold italic">
                   <Shield size={12} className={Number(formData.openingBalance) > 0 ? 'text-brand-500' : 'text-slate-300'} />
                   Every partner's payment mode is individually recorded in the ledger
                 </div>
              </div>
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
          
          <div className="mt-8 pt-6 border-t border-slate-100">
            <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center uppercase tracking-wider">
              <FileCheck size={18} className="mr-2 text-brand-600" /> Generate Documents
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
                    <p className="font-bold text-slate-800 text-sm">Kheti Zameen Agreement</p>
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
                    <p className="text-[10px] text-slate-500">Official land booking confirmation</p>
                  </div>
                </div>
                <Printer size={16} className="text-slate-400 group-hover:text-brand-600 transition-colors" />
              </button>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4 pb-8">
          <button type="button" onClick={() => navigate('/kissan-khata')} className="mr-4 px-6 py-3 rounded-lg font-medium text-slate-600 hover:bg-slate-100">
            Cancel
          </button>
          <button type="submit" className="bg-brand-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-brand-700 flex items-center shadow-md">
            <Save size={18} className="mr-2" /> Save Agriculture Land
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
          data={previewType === 'agreement' ? {
            agreementDate: new Date().toISOString(),
            agreementDay: { 
              hi: new Intl.DateTimeFormat('hi-IN', { weekday: 'long' }).format(new Date()), 
              en: new Intl.DateTimeFormat('en-US', { weekday: 'long' }).format(new Date()) 
            },
            buyer: {
              salutation: 'Mr.',
              name: formData.managerName || companySettings?.companyName || '',
              age: '40', // Manager default age if not available
              occupation: formData.managerPosition || 'Manager',
              address: formData.officeAddress || companySettings?.companyAddress || '',
              locality: formData.officeLocality || '',
              district: formData.officeDistrict || '',
              state: formData.officeState || '',
              pincode: formData.officePincode || '',
              pan: formData.managerPAN || companySettings?.panNumber || '',
              aadhaar: formData.managerAadhaar || '',
              phone: formData.managerPhone || companySettings?.companyEmail || ''
            },
            sellers: owners.map((o, idx) => ({
              idx: idx + 1,
              salutation: 'Mr./Mrs.',
              name: o.name || '',
              age: o.age || '',
              occupation: o.occupation || '',
              aadhaar: o.aadhaar || '',
              pan: o.pan || '',
              phone: o.phone || ''
            })),
            sellersCommonAddress: formData.address || '',
            sellersCommonAddressHindi: '',
            land: {
              landName: formData.landName || '',
              village: formData.village || '',
              mauza: formData.mouza || '',
              phHalkaNo: formData.patwariCircle || '',
              khataNo: formData.khataNumber || '',
              khasraNo: formData.khasraNumber || '',
              surveyNumber: formData.surveyNumber || '',
              areaHectare: formData.landArea || '',
              akarni: formData.akarni || '',
              tehsil: formData.tehsil || '',
              district: formData.district || '',
              state: formData.state || '',
              pincode: formData.pincode || '',
              eastKhasra: formData.eastKhasra || '',
              westKhasra: formData.westKhasra || '',
              northKhasra: formData.northKhasra || '',
              southKhasra: formData.southKhasra || ''
            },
            totalAmount: Number(formData.totalLandValue) || 0,
            totalAmountWords: Accounting.formatIndianWords(Number(formData.totalLandValue) || 0),
            ratePerAcre: Number(formData.ratePerAcre) || 0,
            ratePerAcreWords: Accounting.formatIndianWords(Number(formData.ratePerAcre) || 0),
            paidTotal: Number(formData.openingBalance) || 0,
            paidTotalWords: Accounting.formatIndianWords(Number(formData.openingBalance) || 0),
            paidUptoDate: new Date().toISOString(),
            payments: [
              {
                amount: Number(formData.openingBalance) || 0,
                amountWords: Accounting.formatIndianWords(Number(formData.openingBalance) || 0),
                mode: (formData.paymentMethod as any) || 'Cash',
                referenceNo: 'Initial Payment',
                date: new Date().toISOString(),
                receivedBy: owners.length > 1 
                  ? owners.map((o, i) => {
                      const prefix = o?.salutation || 'Mr./Mrs.';
                      if (i === 0) return `${prefix} ${o.name}`;
                      if (i === owners.length - 1) return ` & ${prefix} ${o.name}`;
                      return `, ${prefix} ${o.name}`;
                    }).join('')
                  : (owners[0] ? `${owners[0]?.salutation || 'Mr./Mrs.'} ${owners[0].name}` : 'Seller')
              }
            ],
            remainingAmount: (Number(formData.totalLandValue) || 0) - (Number(formData.openingBalance) || 0),
            remainingAmountWords: Accounting.formatIndianWords((Number(formData.totalLandValue) || 0) - (Number(formData.openingBalance) || 0)),
            registryMaxMonths: Number(formData.registryMaxMonths) || 12,
            scheduledPayments: (Number(formData.totalLandValue) || 0) - (Number(formData.openingBalance) || 0) > 0 ? [
              {
                label: 'Final Payment (At Registration)',
                perSellerAmount: ((Number(formData.totalLandValue) || 0) - (Number(formData.openingBalance) || 0)) / (owners.length || 1),
                sellerCount: owners.length || 1,
                totalAmount: (Number(formData.totalLandValue) || 0) - (Number(formData.openingBalance) || 0)
              }
            ] : [],
            accountHolderName: companySettings?.companyName || '',
            companyName: companySettings?.companyName || '',
            accountNo: '', // Can be filled from settings if available
            bank: '',
            branch: '',
            tokenLetterDate: new Date().toLocaleDateString('en-IN'),
            // NEW: Pass full company and manager data
            company: {
              companyName: companySettings?.companyName || '',
              entityType: companySettings?.entityType || '',
              companyPan: companySettings?.panNumber || '',
              companyEmail: companySettings?.companyEmail || '',
              companyAddress: companySettings?.companyAddress || '',
              companyLocality: companySettings?.companyLocality || '',
              companyDistrict: companySettings?.companyDistrict || '',
              companyState: companySettings?.companyState || '',
              companyPincode: companySettings?.companyPincode || '',
              licenseRegistrationNumber: companySettings?.licenseRegistrationNumber || '',
              urcNumber: companySettings?.urcNumber || ''
            },
            manager: {
              managerName: formData.managerName || '',
              managerPosition: formData.managerPosition || 'Manager',
              managerAadhaar: formData.managerAadhaar || '',
              managerPAN: formData.managerPAN || '',
              managerPhone: formData.managerPhone || '',
              managerCountryCode: '+91'
            },
            // Compatibility for generic templates
            kissanId: formData.kissanId || previewId || 'TEMP-ID',
            folderSerial: formData.folderSerial || '',
            clientId: formData.kissanId || previewId || 'TEMP-ID'
          } : {
            client: {
              title: 'Mr.',
              name: formData.landName || '',
              age: '',
              gender: '',
              occupation: '',
              phone: formData.phone,
              email: formData.email,
              aadhaar: '',
              pan: '',
              address: formData.address,
              district: formData.district,
              state: formData.state,
              pincode: formData.pincode,
              clientId: formData.kissanId || previewId || 'TEMP-ID',
              folderSerial: formData.folderSerial || ''
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
          type={previewType === 'agreement' ? 'kissan_agreement' : 'token'}
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
