
import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useParams, useLocation } from 'react-router-dom';
import { Tractor, LandPlot, FileText, Activity, Edit2, Save, X, User, CreditCard, Building2, Percent, Landmark, Plus, Trash2, Upload, Printer, FileSpreadsheet, FileDown, Shield } from 'lucide-react';
import { dbService } from '../services/db';
import { Kissan, Transaction, LandOwner, Doc, TransactionType, TransactionCategory, PaymentMethod } from '../types';
import { TransactionTable, DocumentViewer } from '../components/Shared';
import { handleDownloadDoc } from '../components/docUtils';
import { Accounting } from '../services/accounting';
import { utils, writeFile } from 'xlsx';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { sortTransactions, SortOrder } from '../utils/sorting';
import { StatementPrintView } from '../components/StatementTemplate';

export const KissanProfile: React.FC = () => {
  const { id } = useParams();
  const location = useLocation();
  const profileId = id ? decodeURIComponent(id) : '';
  const [kissan, setKissan] = useState<Kissan | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [sortOrder, setSortOrder] = useState<SortOrder>('newest');
  const [docs, setDocs] = useState<Doc[]>([]);
  const [activeTab, setActiveTab] = useState<'info' | 'docs'>('info');
  const [selectedOwnerId, setSelectedOwnerId] = useState<string | 'all'>(location.state?.ownerId || 'all');
  const [selectedOwnerForDetail, setSelectedOwnerForDetail] = useState<LandOwner | null>(null);
  const [allKissans, setAllKissans] = useState<Kissan[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [showAddOwnerModal, setShowAddOwnerModal] = useState(false);
  const [editingOwner, setEditingOwner] = useState<LandOwner | null>(null);
  const [editForm, setEditForm] = useState<Partial<Kissan>>({});
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadModalConfig, setUploadModalConfig] = useState<{ category?: 'LAND_PROPERTY' | 'OWNER_IDENTITY', ownerId?: string }>({});
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewDoc, setPreviewDoc] = useState<Doc | null>(null);

  const [kissanBalance, setKissanBalance] = useState(0);

  useEffect(() => {
    fetchData();
    const unsubscribe = dbService.subscribe(fetchData);
    return () => unsubscribe();
  }, [profileId]);

  useEffect(() => {
    if (kissan && location.state?.ownerId && !selectedOwnerForDetail) {
      const owner = kissan.owners.find(o => o.id === location.state.ownerId);
      if (owner) {
        setSelectedOwnerForDetail(owner);
      }
    }
  }, [kissan, location.state?.ownerId]);

  const fetchData = async () => {
    const kissans = (await dbService.getKissans()).map(k => ({
      ...k,
      totalLandValue: Number(k.totalLandValue) || 0,
      openingBalance: Number(k.openingBalance) || 0,
      owners: Array.isArray(k.owners) ? k.owners : [],
      documents: Array.isArray((k as any).documents) ? (k as any).documents : [],
    }));
    setAllKissans(kissans);
    const k = kissans.find(k => k.id === profileId);
    if (k) {
      setKissan(k);
      setEditForm(k);
    }

    const txs = await dbService.getTransactions();
    const kissanTxs = txs.filter(t => t.kissanId === profileId).sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    setTransactions(kissanTxs);
    
    if (k) {
      const totalPaid = kissanTxs
        .filter(t => t.type === TransactionType.DEBIT)
        .reduce((acc, t) => Accounting.add(acc, (Number(t.amount) || 0)), 0);
      
      const totalCredits = kissanTxs
        .filter(t => t.type === TransactionType.CREDIT)
        .reduce((acc, t) => Accounting.add(acc, (Number(t.amount) || 0)), 0);
      
      const totalLandValue = Number(k.totalLandValue) || 0;
      // Balance = (Initial Debt + Additional Credits) - (Payments/Debits)
      const calculatedBalance = Accounting.subtract(Accounting.add(totalLandValue, totalCredits), totalPaid);
      setKissanBalance(calculatedBalance);
    }

    const allDocs = await dbService.getDocs();
    setDocs(allDocs.filter(d => d.kissanId === profileId && d.type !== 'virtual' && d.category !== 'REPORT'));
  };

  const handleSave = async () => {
    if (kissan) {
      const updated = { ...kissan, ...editForm } as Kissan;
      await dbService.saveKissan(updated);
      setKissan(updated);
      setIsEditing(false);
    }
  };
  

  const handleUploadLandDocs = async (files: File[]) => {
    if (!kissan) return;
    
    for (const file of files) {
      const reader = new FileReader();
      const base64 = await new Promise<string>((resolve) => {
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.readAsDataURL(file);
      });

      await dbService.saveDoc({
        id: `doc_land_${Date.now()}_${file.name}`,
        name: file.name,
        date: new Date().toISOString().split('T')[0],
        size: `${(file.size / 1024).toFixed(4)} KB`,
        type: file.type.includes('pdf') ? 'pdf' : 'img',
        synced: false,
        category: 'KISSAN',
        kissanId: kissan.id,
        fileData: base64,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
    }
    fetchData();
  };

  const handleDelete = async () => {
  if (!kissan) return;

  const confirmDelete = window.confirm(
    `Delete "${kissan.landName}" permanently?\n\nThis will remove:\n- All owners\n- All transactions\n- All documents\n\nThis action cannot be undone.`
  );

  if (!confirmDelete) return;

  try {
    // 🔥 DELETE RELATED DATA FIRST
    const allTx = await dbService.getTransactions();
    const relatedTx = allTx.filter(t => t.kissanId === kissan.id);

    for (const tx of relatedTx) {
      await dbService.deleteTransaction(tx.id);
    }

    const allDocs = await dbService.getDocs();
    const relatedDocs = allDocs.filter(d => d.kissanId === kissan.id);

    for (const doc of relatedDocs) {
      await dbService.deleteDoc(doc.id);
    }

    // 🔥 DELETE MAIN KISSAN
    await dbService.deleteKissan(kissan.id);

    // 🔥 REDIRECT AFTER DELETE
    window.location.href = '/kissan-khata';

  } catch (err) {
    console.error('Delete failed:', err);
    alert('Failed to delete land');
  }
};

  const handleAddOwner = async (newOwner: LandOwner & { files?: File[] }) => {
    if (kissan) {
      const { files, ...ownerData } = newOwner;
      const updatedOwners = [...kissan.owners, ownerData as LandOwner];
      const updatedKissan = { ...kissan, owners: updatedOwners };
      
      // Save Kissan first
      await dbService.saveKissan(updatedKissan);
      
      // Save files if any
      if (files && files.length > 0) {
        for (const file of files) {
          const reader = new FileReader();
          const base64 = await new Promise<string>((resolve) => {
            reader.onload = (e) => resolve(e.target?.result as string);
            reader.readAsDataURL(file);
          });

          await dbService.saveDoc({
            id: `doc_${Date.now()}_${ownerData.id}_${file.name}`,
            name: file.name,
            date: new Date().toISOString().split('T')[0],
            size: `${(file.size / 1024).toFixed(4)} KB`,
            type: file.type.includes('pdf') ? 'pdf' : 'img',
            synced: false,
            category: 'KISSAN',
            kissanId: kissan.id,
            ownerId: ownerData.id,
            fileData: base64,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });
        }
      }

      setKissan(updatedKissan);
      setShowAddOwnerModal(false);
      fetchData(); // Refresh everything
    }
  };

  const handleUpdateOwner = async (updatedOwner: LandOwner & { files?: File[] }) => {
    if (kissan) {
      const { files, ...ownerData } = updatedOwner;
      const updatedOwners = kissan.owners.map(o => o.id === ownerData.id ? (ownerData as LandOwner) : o);
      const updatedKissan = { ...kissan, owners: updatedOwners };
      
      // Save Kissan
      await dbService.saveKissan(updatedKissan);
      
      // Save files if any
      if (files && files.length > 0) {
        for (const file of files) {
          const reader = new FileReader();
          const base64 = await new Promise<string>((resolve) => {
            reader.onload = (e) => resolve(e.target?.result as string);
            reader.readAsDataURL(file);
          });

          await dbService.saveDoc({
            id: `doc_${Date.now()}_${ownerData.id}_${file.name}`,
            name: file.name,
            date: new Date().toISOString().split('T')[0],
            size: `${(file.size / 1024).toFixed(4)} KB`,
            type: file.type.includes('pdf') ? 'pdf' : 'img',
            synced: false,
            category: 'KISSAN',
            kissanId: kissan.id,
            ownerId: ownerData.id,
            fileData: base64,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });
        }
      }

      setKissan(updatedKissan);
      setEditingOwner(null);
      setSelectedOwnerForDetail(ownerData as LandOwner);
      fetchData(); // Refresh everything
    }
  };

  const handleDeleteOwner = async (ownerId: string) => {
    if (kissan) {
      if (!window.confirm('Are you sure you want to remove this owner? This action cannot be undone.')) return;
      
      const updatedOwners = kissan.owners.filter(o => o.id !== ownerId);
      const updatedKissan = { ...kissan, owners: updatedOwners };
      await dbService.saveKissan(updatedKissan);
      setKissan(updatedKissan);
      setSelectedOwnerForDetail(null);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || !kissan) return;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const reader = new FileReader();

const base64 = await new Promise<string>((resolve, reject) => {
  reader.onload = (e) => resolve(e.target?.result as string);
  reader.onerror = reject;
  reader.readAsDataURL(file);
});

const newDoc: Doc = {
  id: `doc_${Date.now()}_${i}`,
  name: file.name,
  date: new Date().toISOString().split('T')[0],
  size: `${(file.size / (1024 * 1024)).toFixed(2)} MB`,
  type: file.type.includes('pdf') ? 'pdf' : 'img',
  synced: false,
  category: 'KISSAN',
  kissanId: kissan.id,
  fileData: base64,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
};
      await dbService.saveDoc(newDoc);
    }
    fetchData();
  };

  const handleDeleteDoc = async (docId: string) => {
    if (window.confirm('Are you sure you want to delete this document?')) {
      await dbService.deleteDoc(docId);
      fetchData();
    }
  };

  const handleViewDoc = (doc: Doc) => {
  setPreviewDoc(doc);
};

  // Recursive component to render the owner tree
  const OwnerNode: React.FC<{ 
    owner: LandOwner; 
    allOwners: LandOwner[]; 
    level: number;
  }> = ({ owner, allOwners, level }) => {
    const children = allOwners.filter(o => o.parentId === owner.id);
    const isRoot = level === 0;

    // Financial calculations for the node
    const matchTransactionToOwner = (tx: Transaction, owner: LandOwner) => {
      if (tx.ownerId === owner.id) return true;
      if (!tx.ownerId || tx.ownerId === 'undefined' || tx.ownerId === 'null' || tx.ownerId === '') {
        const ownerName = owner.name.toLowerCase().trim();
        const txPartyName = tx.partyName?.toLowerCase()?.trim() || '';
        const txParticulars = tx.particulars?.toLowerCase()?.trim() || '';
        
        return txPartyName.includes(ownerName) || txParticulars.includes(ownerName);
      }
      return false;
    };

    const ownerTxs = transactions.filter(t => matchTransactionToOwner(t, owner));
    const totalPaid = ownerTxs
      .filter(t => t.type === TransactionType.DEBIT)
      .reduce((acc, t) => acc + (Number(t.amount) || 0), 0);
    const shareValue = (Number(kissan?.totalLandValue) || 0) * (owner.sharePercentage || 0) / 100;
    const balance = Math.max(0, shareValue - totalPaid);

    return (
      <div className="space-y-3">
        <div 
          onClick={() => setSelectedOwnerForDetail(owner)}
          className={`p-4 border rounded-xl bg-white hover:bg-brand-50 hover:border-brand-200 cursor-pointer transition-all group shadow-sm relative ${!isRoot ? 'ml-4' : ''}`}
        >
          {!isRoot && <div className="absolute -left-4 top-1/2 w-4 h-0.5 bg-slate-200"></div>}
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <div className={`rounded-full flex items-center justify-center mr-3 shadow-sm border group-hover:scale-110 transition-transform ${
                isRoot ? 'w-10 h-10 bg-brand-50 text-brand-600 border-brand-100' : 'w-8 h-8 bg-slate-50 text-slate-500 border-slate-100'
              }`}>
                <User size={isRoot ? 20 : 16} />
              </div>
              <div className="mr-4">
                <div className="flex items-center">
                  <h3 className={`font-bold text-slate-800 group-hover:text-brand-700 transition-colors ${isRoot ? 'text-base' : 'text-sm'}`}>
                    {owner.name}
                  </h3>
                  {!isRoot && (
                    <span className="ml-2 text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded font-medium uppercase tracking-wider">
                      {(() => {
                        const parent = allOwners.find(p => p.id === owner.parentId);
                        if (!parent || !owner.relation) return 'Partner';

                        const name = parent.name || 'Parent';
                        const possessive = (name || '').endsWith('s') ? `${name}'` : `${name}'s`;

                        return `${possessive} ${owner.relation}`;
                       })()}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3 mt-1">
                  <p className="text-[10px] text-slate-500 flex items-center">
                    <Percent size={10} className="mr-1" /> {owner.sharePercentage}%
                  </p>
                  <div className="h-3 w-px bg-slate-200"></div>
                  <p className="text-[10px] text-slate-500 flex items-center">
                    <LandPlot size={10} className="mr-1" /> {Accounting.formatIndian(shareValue)}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-6">
              <div className="text-right hidden sm:block">
                <p className="text-[9px] font-bold text-green-600 uppercase">Paid</p>
                <p className="text-xs font-bold text-green-700 font-mono">₹{Accounting.formatIndian(totalPaid)}</p>
              </div>
              <div className="text-right hidden sm:block">
                <p className="text-[9px] font-bold text-orange-600 uppercase font-mono">Balance</p>
                <p className="text-xs font-bold text-orange-700 font-mono">₹{Accounting.formatIndian(balance)}</p>
              </div>
              <div className="text-right">
                <p className="text-[9px] font-bold text-slate-400 uppercase">Phone</p>
                <p className={`font-medium text-slate-700 ${isRoot ? 'text-xs' : 'text-[11px]'}`}>{owner.phone}</p>
              </div>
            </div>
          </div>
        </div>

        {children.length > 0 && (
          <div className="ml-6 pl-4 border-l-2 border-slate-100 space-y-3">
            {children.map(child => (
              <OwnerNode key={child.id} owner={child} allOwners={allOwners} level={level + 1} />
            ))}
          </div>
        )}
      </div>
    );
  };

  if (!kissan) return <div className="p-8">Loading...</div>;

  const filteredTransactions = sortTransactions(
    (selectedOwnerId === 'all' 
      ? transactions 
      : transactions.filter(t => {
          if (t.ownerId === selectedOwnerId) return true;
          const owner = kissan?.owners.find(o => o.id === selectedOwnerId);
          if (owner && (!t.ownerId || t.ownerId === 'undefined' || t.ownerId === 'null' || t.ownerId === '')) {
const ownerName = (owner.name || '').toLowerCase().trim();
            const txPartyName = t.partyName?.toLowerCase()?.trim() || '';
            const txParticulars = t.particulars?.toLowerCase()?.trim() || '';
            return txPartyName.includes(ownerName) || txParticulars.includes(ownerName);
          }
          return false;
        }))
      .filter(t => !(t.type === TransactionType.CREDIT && t.category === TransactionCategory.KISSAN_PAYMENT && t.method === PaymentMethod.JOURNAL)),
    sortOrder
  );


  return (
    <div className="space-y-6">
      {/* Land Header & Basic Info */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex justify-between items-start">
           <div className="flex items-center">
             <div className="w-16 h-16 bg-brand-50 rounded-full flex items-center justify-center text-xl font-bold text-brand-600 mr-4 border-2 border-brand-100">
               <Tractor size={32} />
             </div>
             <div>
               {!isEditing ? (
                 <h1 className="text-2xl font-bold text-slate-800">{kissan.landName}</h1>
               ) : (
                 <input className="text-xl font-bold border-b border-brand-500 focus:outline-none" value={editForm.landName} onChange={e => setEditForm({...editForm, landName: e.target.value})} />
               )}
               <p className="text-xs text-slate-400">{kissan.mouza}, {kissan.tehsil}, {kissan.district}</p>
             </div>
           </div>
           <div className="flex space-x-2">
             <button 
               onClick={() => setShowPrintModal(true)}
               className="flex items-center bg-white border border-slate-200 text-slate-700 px-3 py-1.5 rounded-lg hover:bg-slate-50 text-sm font-medium shadow-sm"
             >
               <Printer size={16} className="mr-2 text-brand-600" /> Print Statement
             </button>

<div className="flex space-x-2">

  {!isEditing ? (
    <>
      <button
        onClick={() => setIsEditing(true)}
        className="flex items-center text-slate-500 hover:text-brand-600 px-3 py-1.5 rounded-lg hover:bg-brand-50 text-sm font-medium"
      >
        <Edit2 size={16} className="mr-2" />
        Edit Land
      </button>

      <button
        onClick={handleDelete}
        className="flex items-center text-red-500 hover:text-red-700 px-3 py-1.5 rounded-lg hover:bg-red-50 text-sm font-medium transition-colors"
      >
        <Trash2 size={16} className="mr-2" />
        Delete Land
      </button>
    </>
  ) : (
    <>
      <button
        onClick={() => {
          setIsEditing(false);
          setEditForm(kissan);
        }}
        className="px-3 py-1.5 rounded-lg text-slate-500 text-sm font-medium"
      >
        <X size={16} />
      </button>

      <button
        onClick={handleSave}
        className="bg-brand-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium flex items-center"
      >
        <Save size={16} className="mr-2" />
        Save
      </button>
    </>
  )}
</div>
</div>
</div>

        <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {!isEditing ? (
            <>
              <InfoField label="Mouza" value={kissan.mouza} />
              <InfoField label="Khata Number" value={kissan.khataNumber} />
              <InfoField label="Survey Number" value={kissan.surveyNumber} />
              <InfoField label="Khasra Number" value={kissan.khasraNumber} />
              <InfoField label="Patwari Circle" value={kissan.patwariCircle} />
              <InfoField label="Akarni" value={kissan.akarni} />
              <InfoField label="Land Area" value={kissan.landArea} />
              <InfoField label="Rate Per Acre" value={kissan.ratePerAcre ? Accounting.formatIndian(kissan.ratePerAcre) : 'N/A'} />
              <InfoField label="Registry Max Months" value={kissan.registryMaxMonths?.toString()} />
              <InfoField label="Primary Phone" value={kissan.phone} />
              <InfoField label="Email" value={kissan.email} />
              <InfoField label="Total Land Value" value={Accounting.formatIndian(kissan.totalLandValue)} colorClass="text-blue-600" />
              <InfoField label="Opening Payment (Paid)" value={Accounting.formatIndian(kissan.openingBalance || 0)} />
              <InfoField label="Address" value={kissan.address} />
              <InfoField label="Village" value={kissan.village} />
              <InfoField label="Tehsil" value={kissan.tehsil} />
              <InfoField label="District" value={kissan.district} />
              <InfoField label="State" value={kissan.state} />
              <InfoField label="Pincode" value={kissan.pincode} />
              <InfoField label="East Khasra" value={kissan.eastKhasra} />
              <InfoField label="West Khasra" value={kissan.westKhasra} />
              <InfoField label="North Khasra" value={kissan.northKhasra} />
              <InfoField label="South Khasra" value={kissan.southKhasra} />
              <InfoField label="Join Date" value={kissan.joinDate ? new Date(kissan.joinDate).toLocaleDateString() : 'N/A'} />
              <InfoField label="Property ID" value={kissan.id} />
            </>
          ) : (
            <>
              <EditField label="Mouza" value={editForm.mouza || ''} onChange={val => setEditForm({...editForm, mouza: val})} />
              <EditField label="Khata Number" value={editForm.khataNumber || ''} onChange={val => setEditForm({...editForm, khataNumber: val})} />
              <EditField label="Survey Number" value={editForm.surveyNumber || ''} onChange={val => setEditForm({...editForm, surveyNumber: val})} />
              <EditField label="Khasra Number" value={editForm.khasraNumber || ''} onChange={val => setEditForm({...editForm, khasraNumber: val})} />
              <EditField label="Patwari Circle" value={editForm.patwariCircle || ''} onChange={val => setEditForm({...editForm, patwariCircle: val})} />
              <EditField label="Akarni" value={editForm.akarni || ''} onChange={val => setEditForm({...editForm, akarni: val})} />
              <EditField label="Land Area" value={editForm.landArea || ''} onChange={val => setEditForm({...editForm, landArea: val})} />
              <EditField label="Rate Per Acre" type="number" value={editForm.ratePerAcre?.toString() || ''} onChange={val => setEditForm({...editForm, ratePerAcre: Number(val)})} />
              <EditField label="Registry Max Months" type="number" value={editForm.registryMaxMonths?.toString() || ''} onChange={val => setEditForm({...editForm, registryMaxMonths: Number(val)})} />
              <EditField label="Primary Phone" value={editForm.phone || ''} onChange={val => setEditForm({...editForm, phone: val})} />
              <EditField label="Email" value={editForm.email || ''} onChange={val => setEditForm({...editForm, email: val})} />
              <EditField label="Total Land Value" type="number" value={editForm.totalLandValue?.toString() || ''} onChange={val => setEditForm({...editForm, totalLandValue: Number(val)})} />
              <EditField label="Total Opening Payment" type="number" value={editForm.openingBalance?.toString() || ''} onChange={val => setEditForm({...editForm, openingBalance: Number(val)})} />
              <EditField label="Address" value={editForm.address || ''} onChange={val => setEditForm({...editForm, address: val})} />
              <EditField label="Village" value={editForm.village || ''} onChange={val => setEditForm({...editForm, village: val})} />
              <EditField label="Tehsil" value={editForm.tehsil || ''} onChange={val => setEditForm({...editForm, tehsil: val})} />
              <EditField label="District" value={editForm.district || ''} onChange={val => setEditForm({...editForm, district: val})} />
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">State</p>
                <select
                  className="w-full bg-white text-slate-900 border border-slate-300 rounded-lg px-2 py-1 text-xs outline-none focus:ring-2 focus:ring-brand-500"
                  value={editForm.state || ''}
                  onChange={e => setEditForm({...editForm, state: e.target.value})}
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
              <EditField label="Pincode" value={editForm.pincode || ''} onChange={val => setEditForm({...editForm, pincode: val})} />
              <EditField label="East Khasra" value={editForm.eastKhasra || ''} onChange={val => setEditForm({...editForm, eastKhasra: val})} />
              <EditField label="West Khasra" value={editForm.westKhasra || ''} onChange={val => setEditForm({...editForm, westKhasra: val})} />
              <EditField label="North Khasra" value={editForm.northKhasra || ''} onChange={val => setEditForm({...editForm, northKhasra: val})} />
              <EditField label="South Khasra" value={editForm.southKhasra || ''} onChange={val => setEditForm({...editForm, southKhasra: val})} />
            </>
          )}
        </div>

        <div className="p-6 bg-red-50 flex items-center justify-between border-t border-red-100">
           <div className="flex items-center text-red-900 font-bold">
             <Activity size={20} className="mr-2" /> Total Payable (Outstanding)
           </div>
           <span className="text-2xl font-bold text-red-600 font-mono">{Accounting.formatIndian(kissanBalance)}</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200">
        <button 
          onClick={() => setActiveTab('info')}
          className={`px-6 py-3 text-sm font-bold transition-all border-b-2 ${activeTab === 'info' ? 'border-brand-600 text-brand-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
        >
          Land Info & Ledger
        </button>
        <button 
          onClick={() => setActiveTab('docs')}
          className={`px-6 py-3 text-sm font-bold transition-all border-b-2 ${activeTab === 'docs' ? 'border-brand-600 text-brand-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
        >
          Documents ({docs.length})
        </button>
      </div>

      {activeTab === 'info' ? (
        <>
          {/* Owners Section */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-100 font-bold text-spiritual-maroon flex items-center justify-between">
          <div className="flex items-center">
            <User size={18} className="mr-2" /> Owners & Partners Details
          </div>
          <button 
            onClick={() => setShowAddOwnerModal(true)}
            className="text-xs bg-brand-600 text-white px-3 py-1.5 rounded-lg hover:bg-brand-700 transition-colors flex items-center shadow-sm"
          >
            <Plus size={14} className="mr-1" /> Add Owner
          </button>
        </div>
        <div className="p-6 space-y-4">
          {/* Render the tree starting from root owners (no parentId) */}
          {kissan.owners.filter(o => !o.parentId).map(mainOwner => (
            <OwnerNode 
              key={mainOwner.id} 
              owner={mainOwner} 
              allOwners={kissan.owners} 
              level={0} 
            />
          ))}

          {/* Handle cases where parentId might be set but parent doesn't exist (orphans) */}
          {kissan.owners.filter(o => o.parentId && !kissan.owners.find(p => p.id === o.parentId)).map(orphanOwner => (
             <OwnerNode 
              key={orphanOwner.id} 
              owner={orphanOwner} 
              allOwners={kissan.owners} 
              level={0} 
            />
          ))}
        </div>
      </div>

      {/* Owner Detail Modal */}
      {selectedOwnerForDetail && kissan && (
        <OwnerDetailModal 
          owner={selectedOwnerForDetail} 
          currentKissan={kissan}
          allKissans={allKissans}
          transactions={transactions.filter(t => {
            if (t.ownerId === selectedOwnerForDetail.id) return true;
            if (!t.ownerId || t.ownerId === 'undefined' || t.ownerId === 'null' || t.ownerId === '') {
              const ownerName = selectedOwnerForDetail.name.toLowerCase().trim();
              const txPartyName = t.partyName?.toLowerCase()?.trim() || '';
              const txParticulars = t.particulars?.toLowerCase()?.trim() || '';
              return txPartyName.includes(ownerName) || txParticulars.includes(ownerName);
            }
            return false;
          })}
          ownerDocs={docs.filter(d => d.ownerId === selectedOwnerForDetail.id)}
          onClose={() => setSelectedOwnerForDetail(null)} 
          onEdit={() => {
            setEditingOwner(selectedOwnerForDetail);
            setSelectedOwnerForDetail(null);
          }}
          onDelete={() => handleDeleteOwner(selectedOwnerForDetail.id)}
          onUploadDoc={() => {
            setUploadModalConfig({ category: 'OWNER_IDENTITY', ownerId: selectedOwnerForDetail.id });
            setShowUploadModal(true);
          }}
          onDeleteDoc={handleDeleteDoc}
          onViewDoc={handleViewDoc}
          onDownloadDoc={handleDownloadDoc}
        />
      )}

      {/* Add Owner Modal */}
      {showAddOwnerModal && (
        <AddOwnerModal 
          onAdd={handleAddOwner}
          onClose={() => setShowAddOwnerModal(false)}
          currentTotalShare={kissan.owners.reduce((acc, o) => acc + o.sharePercentage, 0)}
          availableParents={kissan.owners}
        />
      )}

      {/* Edit Owner Modal */}
      {editingOwner && (
        <AddOwnerModal 
          ownerToEdit={editingOwner}
          onAdd={handleUpdateOwner}
          onClose={() => {
            setEditingOwner(null);
            setSelectedOwnerForDetail(editingOwner);
          }}
          currentTotalShare={kissan.owners.reduce((acc, o) => acc + (o.id === editingOwner.id ? 0 : o.sharePercentage), 0)}
          availableParents={kissan.owners.filter(o => o.id !== editingOwner.id)}
        />
      )}

      {/* Ledger History */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden mb-6">
        <div className="p-4 border-b border-slate-100 flex justify-between items-center">
          <div className="font-semibold text-slate-700">Land Ledger History</div>
          <div className="flex items-center space-x-2">
            <button 
              onClick={() => setSortOrder(prev => prev === 'newest' ? 'oldest' : 'newest')}
              className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-400 rounded-lg text-xs font-bold transition-all border border-slate-700"
            >
              <Activity size={14} className={sortOrder === 'newest' ? 'rotate-90' : '-rotate-90'} />
              {sortOrder === 'newest' ? 'Newest First' : 'Oldest First'}
            </button>
            <span className="text-xs text-slate-400">Filter by Owner:</span>
            <select 
              className="text-xs border border-slate-200 rounded px-2 py-1 outline-none focus:ring-1 focus:ring-brand-500"
              value={selectedOwnerId}
              onChange={(e) => setSelectedOwnerId(e.target.value)}
            >
              <option value="all">All Kissan</option>
            </select>
          </div>
        </div>
        <TransactionTable 
          transactions={filteredTransactions} 
          showBalance={true}
          initialBalance={selectedOwnerId === 'all' 
            ? kissan.totalLandValue 
            : (kissan.totalLandValue * (kissan.owners.find(o => o.id === selectedOwnerId)?.sharePercentage || 0)) / 100
          }
        />
      </div>

      {/* Print Modal */}
      {showPrintModal && (
        <PrintStatementModal 
          kissan={kissan}
          transactions={transactions}
          onClose={() => setShowPrintModal(false)}
        />
      )}
      </>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden p-6">
          <div className="p-0 space-y-8">

            {/* Land Property Documents */}
            <div>
              <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center">
                <FileText size={16} className="mr-2 text-brand-600" /> Land Property Documents
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {docs.filter(d => d.kissanId === kissan.id && !d.ownerId).map(doc => (
                  <div
                    key={doc.id}
                    className="relative p-4 border border-slate-200 rounded-xl bg-white hover:border-brand-300 transition-all flex items-center gap-3 group"
                  >
                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-slate-900/60 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 z-10 p-2 text-center">
                      <button
                        onClick={() => handleViewDoc(doc)}
                        className="px-2 py-1 bg-white text-slate-800 text-[10px] font-bold rounded hover:bg-brand-50"
                      >
                        View
                        </button>
                        <button
                          onClick={() => handleDownloadDoc(doc)}
                          className="px-2 py-1 bg-brand-600 text-white text-[10px] font-bold rounded hover:bg-brand-700"
                        >
                        Get
                      </button>
                      <button
                        onClick={() => handleDeleteDoc(doc.id)}
                        className="p-1 bg-red-100 text-red-600 rounded hover:bg-red-200"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>

                    <div className={`p-2 rounded-lg ${doc.type === 'pdf' ? 'bg-red-50 text-red-500' : 'bg-blue-50 text-blue-500'}`}>
                      <FileText size={20} />
                    </div>

                    <div className="overflow-hidden">
                      <p className="text-xs font-bold text-slate-800 truncate" title={doc.name}>
                        {doc.name}
                      </p>
                      <p className="text-[9px] text-slate-400">
                        {doc.date}
                      </p>
                    </div>
                  </div>
                ))}
                {docs.filter(d => d.kissanId === kissan.id && !d.ownerId).length === 0 && (
                  <div className="col-span-full py-8 text-center border-2 border-dashed border-slate-100 rounded-xl">
                    <p className="text-xs text-slate-400">No land documents uploaded.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Owner Identity Documents */}
            <div>
              <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center">
                <User size={16} className="mr-2 text-brand-500" /> Owner Identity Documents
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {docs.filter(d => d.kissanId === kissan.id && d.ownerId).map(doc => {
                  const owner = (kissan.owners || []).find(o => o.id === doc.ownerId);
                  return (
                    <div
                      key={doc.id}
                      className="relative p-4 border border-slate-200 rounded-xl bg-white hover:border-brand-300 transition-all flex items-center gap-3 group"
                    >
                      <div className="absolute inset-0 bg-slate-900/60 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 z-10 p-2 text-center">
                        <button
                          onClick={() => handleViewDoc(doc)}
                          className="px-2 py-1 bg-white text-slate-800 text-[10px] font-bold rounded hover:bg-brand-50"
                        >
                          View
                        </button>
                        <button
                          onClick={() => handleDownloadDoc(doc)}
                          className="px-2 py-1 bg-brand-600 text-white text-[10px] font-bold rounded hover:bg-brand-700"
                        >
                          Get
                        </button>
                        <button
                          onClick={() => handleDeleteDoc(doc.id)}
                          className="p-1 bg-red-100 text-red-600 rounded hover:bg-red-200"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>

                      <div className={`p-2 rounded-lg ${doc.type === 'pdf' ? 'bg-red-50 text-red-500' : 'bg-blue-50 text-blue-500'}`}>
                        <FileText size={20} />
                      </div>

                      <div className="overflow-hidden">
                        <p className="text-xs font-bold text-slate-800 truncate" title={doc.name}>
                          {doc.name}
                        </p>
                        <p className="text-[9px] text-slate-500 font-medium">
                          {owner?.name || 'Unknown Owner'}
                        </p>
                      </div>
                    </div>
                  );
                })}
                {docs.filter(d => d.kissanId === kissan.id && d.ownerId).length === 0 && (
                  <div className="col-span-full py-8 text-center border-2 border-dashed border-slate-100 rounded-xl">
                    <p className="text-xs text-slate-400">No owner identity documents uploaded.</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <button
            onClick={() => {
              setUploadModalConfig({ category: 'LAND_PROPERTY' });
              setShowUploadModal(true);
            }}
            className="w-full mt-8 py-4 bg-brand-50 border-2 border-dashed border-brand-200 text-brand-600 rounded-xl hover:bg-brand-100 hover:border-brand-300 font-bold text-sm flex items-center justify-center transition-all group"
          >
            <Upload size={20} className="mr-2 group-hover:scale-110 transition-transform" /> Upload New Document
          </button>
        </div>
      )}

      {showUploadModal && kissan && (
        <UploadModal 
          kissan={kissan} 
          initialCategory={uploadModalConfig.category}
          initialOwnerId={uploadModalConfig.ownerId}
          onClose={() => {
            setShowUploadModal(false);
            setUploadModalConfig({});
          }} 
          onUpload={async (category, ownerId, files) => {
            for (const file of files) {
              const reader = new FileReader();
              const base64 = await new Promise<string>((resolve) => {
                reader.onload = (e) => resolve(e.target?.result as string);
                reader.readAsDataURL(file);
              });

              await dbService.saveDoc({
                id: `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                name: file.name,
                date: new Date().toISOString().split('T')[0],
                size: `${(file.size / (1024 * 1024)).toFixed(2)} MB`,
                type: file.type.includes('pdf') ? 'pdf' : 'img',
                synced: false,
                category: 'KISSAN',
                kissanId: kissan.id,
                ownerId: category === 'OWNER_IDENTITY' ? ownerId : undefined,
                fileData: base64,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              });
            }
            fetchData();
            setShowUploadModal(false);
          }} 
        />
      )}

      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        multiple
        onChange={handleFileUpload}
      />

      {/* Document Preview Modal */}
      <DocumentViewer doc={previewDoc} onClose={() => setPreviewDoc(null)} />
    </div>
  );
};

const AddOwnerModal = ({ onAdd, onClose, currentTotalShare, ownerToEdit, availableParents = [] }: { onAdd: (owner: LandOwner & { files?: File[] }) => void, onClose: () => void, currentTotalShare: number, ownerToEdit?: LandOwner, availableParents?: LandOwner[] }) => {
  const [formData, setFormData] = useState<Partial<LandOwner> & { files?: File[] }>(ownerToEdit ? { ...ownerToEdit, files: [] } : {
    name: '',
    phone: '',
    sharePercentage: 0,
    aadhaar: '',
    pan: '',
    bankName: '',
    accountNumber: '',
    ifscCode: '',
    parentId: '',
    relation: '',
    files: []
  });

  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentTotalShare + (formData.sharePercentage || 0) > 100) {
      alert(`Total share cannot exceed 100%. Current total: ${currentTotalShare}%`);
      return;
    }
    
    const newOwner: LandOwner & { files?: File[] } = {
      ...formData as LandOwner,
      id: ownerToEdit ? ownerToEdit.id : `owner-${Date.now()}`,
      files: selectedFiles
    };
    onAdd(newOwner);
  };

  return createPortal(
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 overflow-y-auto">
      <div className="min-h-full flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-brand-600 text-white">
          <h2 className="text-xl font-bold flex items-center">
            <User className="mr-2" /> {ownerToEdit ? 'Edit Owner / Partner' : 'Add New Owner / Partner'}
          </h2>
          <button onClick={onClose} className="p-1 hover:bg-white/10 rounded-full transition-colors">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase">Full Name</label>
              <input 
                required
                className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-brand-500 outline-none"
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
                placeholder="Enter owner name"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase">Phone Number</label>
              <input 
                required
                className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-brand-500 outline-none"
                value={formData.phone}
                onChange={e => setFormData({...formData, phone: e.target.value})}
                placeholder="10-digit mobile"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase">Share Percentage (%)</label>
              <input 
                required
                type="number"
                min="1"
                max={100 - currentTotalShare}
                className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-brand-500 outline-none"
                value={formData.sharePercentage || ''}
                onChange={e => setFormData({...formData, sharePercentage: Number(e.target.value)})}
                placeholder={`Max ${100 - currentTotalShare}%`}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase">Aadhaar Number</label>
              <input 
                className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-brand-500 outline-none"
                value={formData.aadhaar}
                onChange={e => setFormData({...formData, aadhaar: e.target.value})}
                placeholder="12-digit Aadhaar"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase">PAN Number</label>
              <input 
                className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-brand-500 outline-none"
                value={formData.pan}
                onChange={e => setFormData({...formData, pan: e.target.value})}
                placeholder="ABCDE1234F"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase">Related To (Parent Owner)</label>
              <select 
                className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-brand-500 outline-none bg-white"
                value={formData.parentId || ''}
                onChange={e => setFormData({...formData, parentId: e.target.value})}
              >
                <option value="">None (Main Owner)</option>
                {availableParents.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase">Relation</label>
              <input 
                className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-brand-500 outline-none"
                value={formData.relation}
                onChange={e => setFormData({...formData, relation: e.target.value})}
                placeholder="e.g. Brother, Sister, Friend"
                disabled={!formData.parentId}
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100">
            <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center">
              <Landmark size={16} className="mr-2 text-brand-600" /> Bank Account Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Bank Name</label>
                <input 
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-brand-500 outline-none text-sm"
                  value={formData.bankName}
                  onChange={e => setFormData({...formData, bankName: e.target.value})}
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Account Number</label>
                <input 
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-brand-500 outline-none text-sm"
                  value={formData.accountNumber}
                  onChange={e => setFormData({...formData, accountNumber: e.target.value})}
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">IFSC Code</label>
                <input 
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-brand-500 outline-none text-sm"
                  value={formData.ifscCode}
                  onChange={e => setFormData({...formData, ifscCode: e.target.value})}
                />
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100">
            <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center">
              <Shield size={16} className="mr-2 text-brand-600" /> Identity Details & Documents
            </h3>
            <div className="space-y-4">
               <div 
                 onClick={() => document.getElementById('modal-file-upload')?.click()}
                 className="w-full border-2 border-dashed border-slate-200 rounded-xl p-8 flex flex-col items-center justify-center text-slate-400 hover:bg-slate-50 hover:border-brand-200 transition-all cursor-pointer bg-white group"
               >
                 <Upload size={32} className="mb-2 group-hover:text-brand-500 transition-colors" />
                 <span className="text-[11px] font-bold uppercase tracking-wider group-hover:text-brand-600 transition-colors text-center">Upload Partner Identity Documents</span>
                 <input 
                   id="modal-file-upload"
                   type="file" 
                   className="hidden" 
                   multiple 
                   onChange={(e) => {
                     if (e.target.files) {
                       setSelectedFiles(prev => [...prev, ...Array.from(e.target.files!)]);
                     }
                   }}
                   accept=".pdf,.jpg,.jpeg,.png"
                 />
               </div>

               {selectedFiles.length > 0 && (
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {selectedFiles.map((file, fIdx) => (
                      <div key={fIdx} className="flex items-center justify-between p-3 bg-brand-50/50 rounded-xl border border-brand-100">
                        <div className="flex items-center overflow-hidden">
                          <FileText size={16} className="text-brand-500 mr-2 shrink-0" />
                          <span className="text-[11px] text-slate-700 font-medium truncate">{file.name}</span>
                        </div>
                        <button 
                          type="button"
                          onClick={() => setSelectedFiles(prev => prev.filter((_, i) => i !== fIdx))}
                          className="text-slate-400 hover:text-red-500 p-1 rounded-lg hover:bg-white transition-colors"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ))}
                 </div>
               )}
            </div>
          </div>

          <div className="pt-6 flex justify-end gap-3">
            <button 
              type="button"
              onClick={onClose}
              className="px-6 py-2 rounded-xl font-bold text-slate-600 hover:bg-slate-100 transition-all"
            >
              Cancel
            </button>
            <button 
              type="submit"
              className="px-8 py-2 bg-brand-600 text-white rounded-xl font-bold hover:bg-brand-700 transition-all shadow-lg"
            >
              {ownerToEdit ? 'Update Owner' : 'Add Owner'}
            </button>
          </div>
        </form>
      </div>
      </div>
    </div>,
    document.body
  );
};

const InfoField = ({ label, value, colorClass = "text-slate-800" }: { label: string, value: string, colorClass?: string }) => (
  <div>
    <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">{label}</p>
    <p className={`text-sm font-bold ${colorClass}`}>{value || 'N/A'}</p>
  </div>
);

const EditField = ({ label, value, onChange, type = "text" }: { label: string, value: string, onChange: (val: string) => void, type?: string }) => (
  <div>
    <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">{label}</p>
    <input
      type={type}
      className="w-full bg-white text-slate-900 border border-slate-300 rounded-lg px-2 py-1 text-xs outline-none focus:ring-2 focus:ring-brand-500"
      value={value}
      onChange={e => onChange(e.target.value)}
    />
  </div>
);

const PrintStatementModal = ({ kissan, transactions, onClose }: { kissan: Kissan, transactions: Transaction[], onClose: () => void }) => {
  const [scope, setScope] = useState<'all' | 'specific'>('all');
  const [selectedOwnerId, setSelectedOwnerId] = useState<string>(kissan.owners[0]?.id || '');
  const [format, setFormat] = useState<'pdf' | 'excel' | 'print'>('pdf');
  const [showPreview, setShowPreview] = useState(false);
  const [previewData, setPreviewData] = useState<any>(null);

  const handleGenerate = () => {
    const owner = scope === 'specific' ? kissan.owners.find(o => o.id === selectedOwnerId) : null;
    const filteredTxs = (scope === 'all' 
      ? transactions 
      : transactions.filter(t => t.ownerId === selectedOwnerId))
      .filter(t => !(t.type === TransactionType.CREDIT && t.category === TransactionCategory.KISSAN_PAYMENT && t.method === PaymentMethod.JOURNAL))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    const initialBalance = scope === 'all' 
      ? kissan.totalLandValue 
      : (kissan.totalLandValue * (owner?.sharePercentage || 0)) / 100;

    let runningBalance = initialBalance;
    const processedTxs = filteredTxs.map(tx => {
      if (tx.type === TransactionType.CREDIT) {
        runningBalance = Accounting.add(runningBalance, tx.amount);
      } else {
        runningBalance = Accounting.subtract(runningBalance, tx.amount);
      }
      return { ...tx, balance: runningBalance };
    });

    if (format === 'excel') {
      generateExcel(kissan, owner, processedTxs, initialBalance);
      onClose();
    } else {
      // Use StatementTemplate (Print/PDF)
      setPreviewData({
        title: 'Account Ledger',
        subtitle: scope === 'all' ? `Consolidated Statement - ${kissan.landName}` : `Partner Statement - ${owner?.name}`,
        dateRange: 'All History',
        data: {
          transactions: [
            { date: '---', particulars: 'Opening Balance', amount: initialBalance, type: TransactionType.CREDIT, balance: initialBalance, method: 'N/A' },
            ...processedTxs
          ],
          totals: {
            debit: filteredTxs.filter(t => t.type === TransactionType.DEBIT).reduce((acc, t) => acc + t.amount, 0),
            credit: filteredTxs.filter(t => t.type === TransactionType.CREDIT).reduce((acc, t) => acc + t.amount, 0),
            balance: runningBalance
          }
        },
        type: 'ledger',
        partyName: owner?.name || 'All Partners',
        partyDetails: owner ? `${owner.phone}\n${owner.aadhaar}\nA/C: ${owner.accountNumber}` : `Land: ${kissan.landName}\nLocation: ${kissan.mouza}, ${kissan.district}`
      });
      setShowPreview(true);
    }
  };

  const generateExcel = (kissan: Kissan, owner: LandOwner | null, txs: any[], initialBalance: number) => {
    const data = [];
    // Header Info
    data.push(['Statement of Account']);
    data.push(['Land:', kissan.landName]);
    data.push(['Location:', `${kissan.mouza}, ${kissan.tehsil}, ${kissan.district}`]);
    if (owner) {
      data.push(['Partner:', owner.name, `(${owner.sharePercentage}% Share)`]);
    } else {
      data.push(['Partners:', 'All Partners Consolidated']);
    }
    data.push(['Generated On:', new Date().toLocaleDateString()]);
    data.push([]);

    // Table Header
    data.push(['Date', 'Particulars', 'Reference', 'Debit', 'Credit', 'Balance']);

    // Opening Balance Row
    data.push(['', 'Opening Balance', '', '', '', initialBalance]);

    // Transactions
    txs.forEach(tx => {
      data.push([
        tx.date,
        tx.particulars,
        tx.referenceId,
        tx.type === TransactionType.DEBIT ? tx.amount : '',
        tx.type === TransactionType.CREDIT ? tx.amount : '',
        tx.balance
      ]);
    });

    const ws = utils.aoa_to_sheet(data);
    const wb = utils.book_new();
    utils.book_append_sheet(wb, ws, 'Statement');
    writeFile(wb, `${kissan.landName}_Statement_${new Date().getTime()}.xlsx`);
  };

  return createPortal(
    <>
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 overflow-y-auto">
        <div className="min-h-full flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-brand-600 text-white">
            <h2 className="text-xl font-bold flex items-center">
              <Printer className="mr-2" /> Statement Options
            </h2>
            <button onClick={onClose} className="p-1 hover:bg-white/10 rounded-full transition-colors">
              <X size={24} />
            </button>
          </div>

          <div className="p-6 space-y-6">
            {/* Scope Selection */}
            <div className="space-y-3">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Statement Scope</label>
              <div className="grid grid-cols-2 gap-3">
                <button 
                  onClick={() => setScope('all')}
                  className={`p-3 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${scope === 'all' ? 'border-brand-600 bg-brand-50 text-brand-700' : 'border-slate-100 hover:border-slate-200 text-slate-500'}`}
                >
                  <User size={24} />
                  <span className="text-sm font-bold">All Partners</span>
                </button>
                <button 
                  onClick={() => setScope('specific')}
                  className={`p-3 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${scope === 'specific' ? 'border-brand-600 bg-brand-50 text-brand-700' : 'border-slate-100 hover:border-slate-200 text-slate-500'}`}
                >
                  <User size={24} className="opacity-50" />
                  <span className="text-sm font-bold">Specific Partner</span>
                </button>
              </div>
            </div>

            {/* Partner Selection (Conditional) */}
            {scope === 'specific' && (
              <div className="space-y-2 animate-in slide-in-from-top-2 duration-200">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Select Partner</label>
                <select 
                  className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-brand-500 outline-none bg-white"
                  value={selectedOwnerId}
                  onChange={e => setSelectedOwnerId(e.target.value)}
                >
                  {kissan.owners.map(o => (
                    <option key={o.id} value={o.id}>{o.name} ({o.sharePercentage}%)</option>
                  ))}
                </select>
              </div>
            )}

            {/* Format Selection */}
            <div className="space-y-3">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Export Format</label>
              <div className="grid grid-cols-3 gap-3">
                <button 
                  onClick={() => setFormat('pdf')}
                  className={`p-3 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${format === 'pdf' ? 'border-brand-600 bg-brand-50 text-brand-700' : 'border-slate-100 hover:border-slate-200 text-slate-500'}`}
                >
                  <FileDown size={20} />
                  <span className="text-[10px] font-bold">PDF</span>
                </button>
                <button 
                  onClick={() => setFormat('excel')}
                  className={`p-3 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${format === 'excel' ? 'border-brand-600 bg-brand-50 text-brand-700' : 'border-slate-100 hover:border-slate-200 text-slate-500'}`}
                >
                  <FileSpreadsheet size={20} />
                  <span className="text-[10px] font-bold">Excel</span>
                </button>
                <button 
                  onClick={() => setFormat('print')}
                  className={`p-3 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${format === 'print' ? 'border-brand-600 bg-brand-50 text-brand-700' : 'border-slate-100 hover:border-slate-200 text-slate-500'}`}
                >
                  <Printer size={20} />
                  <span className="text-[10px] font-bold">Print</span>
                </button>
              </div>
            </div>

            <div className="pt-4 flex gap-3">
              <button 
                onClick={onClose}
                className="flex-1 py-3 rounded-xl font-bold text-slate-600 hover:bg-slate-100 transition-all"
              >
                Cancel
              </button>
              <button 
                onClick={handleGenerate}
                className="flex-[2] py-3 bg-brand-600 text-white rounded-xl font-bold hover:bg-brand-700 transition-all shadow-lg flex items-center justify-center gap-2"
              >
                {format === 'excel' ? <FileSpreadsheet size={18} /> : format === 'pdf' ? <FileDown size={18} /> : <Printer size={18} />}
                {format === 'excel' ? 'Download Excel' : format === 'pdf' ? 'Generate Statement' : 'Print Statement'}
              </button>
            </div>
          </div>
        </div>
        </div>
      </div>

      {showPreview && (
        <StatementPrintView
          open={showPreview}
          onClose={() => { setShowPreview(false); onClose(); }}
          {...previewData}
        />
      )}
    </>,
    document.body
  );
};

const OwnerDetailModal = (
  {
    owner,
    currentKissan,
    allKissans,
    transactions,
    ownerDocs,
    onClose,
    onEdit,
    onDelete,
    onUploadDoc,
    onDeleteDoc,
    onViewDoc,
    onDownloadDoc
  }: {
    owner: LandOwner;
    currentKissan: Kissan;
    allKissans: Kissan[];
    transactions: Transaction[];
    ownerDocs: Doc[];
    onClose: () => void;
    onEdit: () => void;
    onDelete: () => void;
    onUploadDoc: () => void;

    // 🔥 ADD THESE (THIS IS WHAT YOU MISSED)
    onDeleteDoc: (id: string) => void;
    onViewDoc: (doc: Doc) => void;
    onDownloadDoc: (doc: Doc) => void;
  }
) => {
const ownerShareValue = (currentKissan.totalLandValue * owner.sharePercentage) / 100;
  
  const totalPaid = transactions
    .filter(t => t.type === TransactionType.DEBIT)
    .reduce((acc, t) => acc + (Number(t.amount) || 0), 0);
  
  const remainingBalance = ownerShareValue - totalPaid;

  // Helper to match owners across properties reliably
  const isSamePerson = (o1: LandOwner, o2: LandOwner) => {
    const n1 = (o1.name || '').toLowerCase().trim();
    const n2 = (o2.name || '').toLowerCase().trim();
    
    // Names must match roughly to be considered the same person in this context
    if (n1 !== n2) return false;

    const a1 = o1.aadhaar?.trim();
    const a2 = o2.aadhaar?.trim();
    const p1 = o1.pan?.trim();
    const p2 = o2.pan?.trim();
    const ph1 = o1.phone?.trim();
    const ph2 = o2.phone?.trim();

    // Check for unique identifiers
    if (a1 && a2 && a1.length > 5 && a1 === a2) return true;
    if (p1 && p2 && p1.length > 5 && p1 === p2) return true;
    if (ph1 && ph2 && ph1.length > 5 && ph1 === ph2) return true;

    return false;
  };

  // Find other lands this owner is involved in
  const otherLands = allKissans.filter(k => 
    k.id !== currentKissan.id && 
    k.owners.some(o => isSamePerson(o, owner))
  );

  return createPortal(
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 overflow-y-auto">
      <div className="min-h-full flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[95vh] overflow-hidden flex flex-col animate-in fade-in zoom-in duration-200">
        {/* Modal Header */}
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-brand-600 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
            <User size={120} />
          </div>
          <div className="flex items-center relative z-10">
            <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center mr-4 shadow-inner">
              <User size={32} />
            </div>
            <div>
              <h2 className="text-2xl font-bold">{owner.name}</h2>
              <p className="text-sm opacity-90 flex items-center">
                <LandPlot size={14} className="mr-1" /> {owner.sharePercentage}% Partner • {currentKissan.landName}
                {owner.parentId && owner.relation && (
                  <span className="ml-2 px-2 py-0.5 bg-white/20 rounded-full text-[10px] font-bold uppercase tracking-wider">
                    {(() => {
                      const parent = currentKissan.owners.find(o => o.id === owner.parentId);
                      if (!parent || !owner.relation) return null;

                      const name = parent.name || 'Parent';
                      const possessive = (name || '').endsWith('s') ? `${name}'` : `${name}'s`;

                      return `${possessive} ${owner.relation}`;
                    })()}
                  </span>
                )}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2 relative z-10">
            <button 
              onClick={onEdit}
              className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors flex items-center text-sm font-medium"
              title="Edit Owner"
            >
              <Edit2 size={18} className="mr-1" /> Edit
            </button>
            <button 
              onClick={onDelete}
              className="p-2 bg-red-500/20 hover:bg-red-500/40 rounded-lg transition-colors flex items-center text-sm font-medium text-red-100"
              title="Delete Owner"
            >
              <Trash2 size={18} className="mr-1" /> Delete
            </button>
            <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
              <X size={28} />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8 bg-slate-50/30">
          {/* Top Row: Financials & Other Accounts */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Financial Summary */}
            <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Total Share Value</p>
                <p className="text-2xl font-bold text-slate-800 font-mono">{Accounting.formatIndian(ownerShareValue)}</p>
                <p className="text-[10px] text-slate-500 mt-1 italic">{Accounting.formatIndianWords(ownerShareValue)}</p>
              </div>
              <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
                <p className="text-[10px] font-bold text-green-600 uppercase tracking-wider mb-2">Total Paid to Date</p>
                <p className="text-2xl font-bold text-green-700 font-mono">{Accounting.formatIndian(totalPaid)}</p>
                <p className="text-[10px] text-green-600 mt-1 italic">{Accounting.formatIndianWords(totalPaid)}</p>
              </div>
              <div className={`p-5 rounded-2xl shadow-sm border ${remainingBalance > 0 ? 'bg-white border-orange-200' : 'bg-white border-blue-200'}`}>
                <p className={`text-[10px] font-bold uppercase tracking-wider mb-2 ${remainingBalance > 0 ? 'text-orange-600' : 'text-blue-600'}`}>Remaining Balance</p>
                <p className={`text-2xl font-bold font-mono ${remainingBalance > 0 ? 'text-orange-700' : 'text-blue-700'}`}>
                  {Accounting.formatIndian(remainingBalance)}
                </p>
                <p className={`text-[10px] mt-1 italic ${remainingBalance > 0 ? 'text-orange-600' : 'text-blue-600'}`}>
                  {Accounting.formatIndianWords(remainingBalance)}
                </p>
              </div>
            </div>

            {/* Other Accounts (Lands) */}
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center">
                <Building2 size={14} className="mr-2" /> Other Land Accounts
              </h4>
              <div className="space-y-2">
                {otherLands.length > 0 ? (
                  otherLands.map(land => (
                    <div key={land.id} className="flex justify-between items-center p-2 rounded-lg bg-slate-50 border border-slate-100">
                      <div className="text-sm font-medium text-slate-700 truncate mr-2">{land.landName}</div>
                      <div className="text-[10px] font-bold bg-brand-100 text-brand-700 px-2 py-0.5 rounded">
                        {land.owners.find(o => isSamePerson(o, owner))?.sharePercentage}%
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-400 italic py-2">No other land accounts found.</p>
                )}
              </div>
            </div>
          </div>

          {/* Personal & Bank Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
              <h3 className="font-bold text-slate-800 flex items-center mb-6 text-lg">
                <CreditCard size={20} className="mr-2 text-brand-600" /> Personal Information
              </h3>
              <div className="grid grid-cols-2 gap-y-6 gap-x-4">
                <InfoField label="Mobile Number" value={owner.phone} />
                <InfoField label="Aadhaar Number" value={owner.aadhaar} />
                <InfoField label="PAN Card Number" value={owner.pan} />
                <InfoField label="Land Share" value={`${owner.sharePercentage}%`} />
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
              <h3 className="font-bold text-slate-800 flex items-center mb-6 text-lg">
                <Landmark size={20} className="mr-2 text-brand-600" /> Bank Account Details
              </h3>
              <div className="grid grid-cols-2 gap-y-6 gap-x-4">
                <InfoField label="Bank Name" value={owner.bankName} />
                <InfoField label="Account Number" value={owner.accountNumber} />
                <InfoField label="IFSC Code" value={owner.ifscCode} />
                <div className="col-span-2 pt-2">
                  <div className="bg-brand-50 p-3 rounded-lg border border-brand-100 flex items-start">
                    <Activity size={16} className="text-brand-600 mr-2 mt-0.5" />
                    <p className="text-[11px] text-brand-800 leading-relaxed">
                      All payments to this owner are processed via the bank details mentioned above. Ensure verification before processing large transfers.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Owner Documents Section */}
<div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
  <div className="flex justify-between items-center mb-6">
    <h3 className="font-bold text-slate-800 flex items-center text-lg">
      <FileText size={20} className="mr-2 text-brand-600" /> Identity Documents
    </h3>

    <button
      onClick={onUploadDoc}
      className="text-[10px] font-bold bg-brand-50 text-brand-600 px-3 py-1.5 rounded-lg border border-brand-100 hover:bg-brand-100 transition-all flex items-center"
    >
      <Plus size={14} className="mr-1" /> Add Doc
    </button>
  </div>

  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
    {ownerDocs.length > 0 ? (
      ownerDocs.map(doc => (
        <div
          key={doc.id}
          className="relative p-4 border border-slate-200 rounded-xl bg-white hover:border-brand-300 transition-all flex items-center gap-3 group"
        >
          {/* 🔥 HOVER OVERLAY (STANDARDIZED) */}
          <div className="absolute inset-0 bg-slate-900/60 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 z-10 p-2 text-center">
            
            {/* VIEW */}
            <button
              onClick={() => onViewDoc(doc)}
              className="px-2 py-1 bg-white text-slate-800 text-[10px] font-bold rounded hover:bg-brand-50"
            >
              View
            </button>

            {/* DOWNLOAD */}
            <button
              onClick={() => onDownloadDoc(doc)}
              className="px-2 py-1 bg-brand-600 text-white text-[10px] font-bold rounded hover:bg-brand-700"
            >
              Get
            </button>

            {/* DELETE */}
            <button
              onClick={() => onDeleteDoc(doc.id)}
              className="p-1 bg-red-100 text-red-600 rounded hover:bg-red-200"
            >
              <Trash2 size={12} />
            </button>
          </div>

          {/* ICON */}
          <div
            className={`p-2 rounded-lg ${
              doc.type === 'pdf'
                ? 'bg-red-50 text-red-500'
                : 'bg-blue-50 text-blue-500'
            }`}
          >
            <FileText size={20} />
          </div>

          {/* META */}
          <div className="overflow-hidden">
            <p
              className="text-xs font-bold text-slate-800 truncate"
              title={doc.name}
            >
              {doc.name}
            </p>
            <p className="text-[9px] text-slate-400">
              {doc.date}
            </p>
          </div>
        </div>
      ))
    ) : (
      <div className="col-span-full py-6 text-center border-2 border-dashed border-slate-100 rounded-xl">
        <p className="text-xs text-slate-400 italic">
          No identity documents uploaded for this owner.
        </p>
      </div>
    )}
  </div>
</div>

          {/* Account History */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
              <h3 className="font-bold text-slate-800 flex items-center">
                <Activity size={20} className="mr-2 text-brand-600" /> Individual Transaction History
              </h3>
              <span className="text-xs font-medium text-slate-500 bg-white px-3 py-1 rounded-full border border-slate-200">
                {transactions.filter(t => !(t.type === TransactionType.CREDIT && t.category === TransactionCategory.KISSAN_PAYMENT && t.method === PaymentMethod.JOURNAL)).length} Transactions
              </span>
            </div>
            <div className="max-h-[400px] overflow-y-auto">
              <TransactionTable 
                transactions={transactions
                  .filter(t => !(t.type === TransactionType.CREDIT && t.category === TransactionCategory.KISSAN_PAYMENT && t.method === PaymentMethod.JOURNAL))
                  .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())} 
                showBalance={true}
                initialBalance={ownerShareValue}
              />
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-100 bg-white flex justify-end items-center gap-4">
          <p className="text-xs text-slate-400 mr-auto ml-4">
            Last updated: {new Date().toLocaleDateString()}
          </p>
          <button 
            onClick={onClose}
            className="px-8 py-2.5 bg-slate-800 text-white rounded-xl font-bold hover:bg-slate-700 transition-all shadow-lg active:scale-95"
          >
            Close Profile
          </button>
        </div>
      </div>
      </div>
    </div>,
    document.body
  );
};

const UploadModal = ({ kissan, onClose, onUpload, initialCategory = 'LAND_PROPERTY', initialOwnerId = '' }: { kissan: Kissan, onClose: () => void, onUpload: (category: 'LAND_PROPERTY' | 'OWNER_IDENTITY', ownerId: string | undefined, files: File[]) => void, initialCategory?: 'LAND_PROPERTY' | 'OWNER_IDENTITY', initialOwnerId?: string }) => {
  const [category, setCategory] = useState<'LAND_PROPERTY' | 'OWNER_IDENTITY'>(initialCategory);
  const [selectedOwnerId, setSelectedOwnerId] = useState<string>(initialOwnerId);
  const [files, setFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };

  const handleUpload = async () => {
    if (files.length === 0) return;
    if (category === 'OWNER_IDENTITY' && !selectedOwnerId) {
      alert('Please select an owner');
      return;
    }

    setIsUploading(true);
    await onUpload(category, category === 'OWNER_IDENTITY' ? selectedOwnerId : undefined, files);
    setIsUploading(false);
  };

  return createPortal(
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[60] overflow-y-auto">
      <div className="min-h-full flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-brand-50/30">
          <h3 className="font-bold text-slate-800 flex items-center">
            <Upload size={18} className="mr-2 text-brand-600" /> Upload Document
          </h3>
          <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded-full transition-colors">
            <X size={20} className="text-slate-400" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Category Selection */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Document Category</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setCategory('LAND_PROPERTY')}
                className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all ${
                  category === 'LAND_PROPERTY' 
                    ? 'border-brand-500 bg-brand-50 text-brand-700' 
                    : 'border-slate-100 bg-slate-50 text-slate-500 hover:border-slate-200'
                }`}
              >
                <LandPlot size={20} className="mb-1" />
                <span className="text-[11px] font-bold">Land Property</span>
              </button>
              <button
                onClick={() => setCategory('OWNER_IDENTITY')}
                className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all ${
                  category === 'OWNER_IDENTITY' 
                    ? 'border-brand-500 bg-brand-50 text-brand-700' 
                    : 'border-slate-100 bg-slate-50 text-slate-500 hover:border-slate-200'
                }`}
              >
                <User size={20} className="mb-1" />
                <span className="text-[11px] font-bold">Owner Identity</span>
              </button>
            </div>
          </div>

          {/* Owner Selection - Only if category is Owner Identity */}
          {category === 'OWNER_IDENTITY' && (
            <div className="space-y-2 animate-in slide-in-from-top-2 duration-200">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Select Owner</label>
              <select
                value={selectedOwnerId}
                onChange={(e) => setSelectedOwnerId(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-brand-500 outline-none"
              >
                <option value="">-- Choose Owner --</option>
                {kissan.owners.map(owner => (
                  <option key={owner.id} value={owner.id}>{owner.name}</option>
                ))}
              </select>
            </div>
          )}

          {/* File Selection Area */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Select Files</label>
            <div 
              onClick={() => fileInputRef.current?.click()}
              className={`p-6 border-2 border-dashed rounded-xl flex flex-col items-center justify-center cursor-pointer transition-all ${
                files.length > 0 ? 'border-brand-300 bg-brand-50' : 'border-slate-200 hover:border-brand-200 hover:bg-slate-50'
              }`}
            >
              <Upload size={32} className={`mb-2 ${files.length > 0 ? 'text-brand-600' : 'text-slate-300'}`} />
              <p className={`text-xs font-bold ${files.length > 0 ? 'text-brand-700' : 'text-slate-500'}`}>
                {files.length > 0 ? `${files.length} file(s) selected` : 'Click to select or drag & drop'}
              </p>
              <p className="text-[10px] text-slate-400 mt-1">PDF or Images only</p>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                className="hidden" 
                multiple 
                accept="application/pdf,image/*"
              />
            </div>
            {files.length > 0 && (
              <div className="max-h-32 overflow-y-auto space-y-1 pt-1">
                {files.map((file, idx) => (
                  <div key={idx} className="flex items-center text-[10px] text-slate-600 bg-slate-50 p-1.5 rounded-lg border border-slate-100">
                    <FileText size={12} className="mr-1.5 text-slate-400" />
                    <span className="truncate flex-1">{file.name}</span>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setFiles(prev => prev.filter((_, i) => i !== idx));
                      }}
                      className="text-red-400 hover:text-red-600"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="p-4 bg-slate-50 border-t border-slate-100 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 border border-slate-200 bg-white text-slate-600 rounded-xl font-bold text-sm hover:bg-slate-100 transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleUpload}
            disabled={files.length === 0 || (category === 'OWNER_IDENTITY' && !selectedOwnerId) || isUploading}
            className="flex-1 py-2.5 bg-brand-600 text-white rounded-xl font-bold text-sm hover:bg-brand-700 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {isUploading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                Uploading...
              </>
            ) : (
              'Upload Now'
            )}
          </button>
        </div>
      </div>
      </div>
    </div>,
    document.body
  );
};
