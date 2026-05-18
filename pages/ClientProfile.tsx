
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Mail, Phone, MapPin, Building, FileText, Activity, Edit2, Save, X, User, CreditCard, Home, Upload, Download, Shield, Globe, Plus, Trash2, Users, RefreshCw, Trophy, Gift, Wallet, TrendingUp, Calendar, Check, Briefcase, UserPlus, ArrowRight, Settings, AlertTriangle, CheckCircle, Printer } from 'lucide-react';
import { dbService } from '../services/db';
import { Client, Property, Transaction, MasterProperty, Referral, ClientInvestment, TransactionType, PaymentMethod, Doc, TransactionCategory } from '../types';
import { TransactionTable, DocumentViewer } from '../components/Shared';
import { handleDownloadDoc } from '../components/docUtils';
import { AgreementPreview } from '../components/AgreementTemplates';
import { Accounting } from '../services/accounting';
import { sortTransactions, SortOrder } from '../utils/sorting';
import { StatementPrintView } from '../components/StatementTemplate';

export const ClientProfile: React.FC = () => {
  const { id } = useParams();
  const normalizedId = id ? decodeURIComponent(id) : undefined;
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'overview' | 'properties' | 'referral' | 'docs'>('overview');
  const [client, setClient] = useState<Client | null>(null);
  const [properties, setProperties] = useState<Property[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [sortOrder, setSortOrder] = useState<SortOrder>('newest');
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [docs, setDocs] = useState<Doc[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [editingReferral, setEditingReferral] = useState<Referral | null>(null);
  const [showAddReferralModal, setShowAddReferralModal] = useState(false);
  const [newReferralForm, setNewReferralForm] = useState({ name: '', phone: '' });
  const [showAddPropertyModal, setShowAddPropertyModal] = useState(false);
  const [allProperties, setAllProperties] = useState<Property[]>([]);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [newPropertyForm, setNewPropertyForm] = useState({
    propertyId: '',
    plotId: '',
    totalAmount: '',
    tokenAmount: '',
    paymentMode: 'Cash',
    paymentReference: '',
    bookingDate: new Date().toISOString().split('T')[0],
    bookingDay: { en: '', hi: '', mr: '' },
  });
  const [justAddedProperty, setJustAddedProperty] = useState<any>(null);
  const [showManageModal, setShowManageModal] = useState(false);
  const [selectedInvestment, setSelectedInvestment] = useState<ClientInvestment | null>(null);
  const [showCancelConfirmation, setShowCancelConfirmation] = useState(false);
  const [previewDoc, setPreviewDoc] = useState<Doc | null>(null);
  const [showStatementPreview, setShowStatementPreview] = useState(false);
  
  const sortedTransactions = React.useMemo(() => {
    return sortTransactions(transactions, sortOrder);
  }, [transactions, sortOrder]);

  // Editing State
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<Partial<Client>>({});
  
  // File Upload
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!normalizedId) return;

    dbService.getClientById(normalizedId).then(c => {
      if (!c) return;
      setClient(c);
      setEditForm(c);
    });
    dbService.getProperties().then(props => {
      setProperties(props);
      setAllProperties(props);
    });
    dbService.getTransactions().then(txs => {
      const normalizedId = id ? decodeURIComponent(id) : undefined;
      const filtered = txs.filter(t => t.clientId === normalizedId);
      setTransactions(filtered);
    });
    dbService.getReferrals().then(refs => {
      setReferrals(refs.filter(r => r.referrerClientId === normalizedId));
    });
    dbService.getDocs().then(docs => setDocs(docs.filter(d => d.type !== 'virtual' && d.category !== 'REPORT')));

    const unsubscribe = dbService.subscribe(() => {
      dbService.getTransactions().then(txs => {
        const normalizedId = id ? decodeURIComponent(id) : undefined;
        const filtered = txs.filter(t => t.clientId === normalizedId);
        setTransactions(filtered);
      });
      dbService.getClientById(normalizedId!).then(c => {
        if (c) setClient(c);
      });
      dbService.getDocs().then(docs => setDocs(docs.filter(d => d.type !== 'virtual' && d.category !== 'REPORT')));
    });

    return () => unsubscribe();
  }, [normalizedId]);

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      await dbService.syncToWebsite();
      alert('Client data synced to website successfully!');
    } catch (error) {
      alert('Failed to sync to website. Check console for details.');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleSave = async () => {
    if (client) {
      const normalizePhone = (phone: string) => phone.replace(/\D/g, '').slice(-10);

      const buildPhone = (phone: string) => {
        return '+91' + normalizePhone(phone);
      };

      const updatedClient = {
        ...client,
        ...editForm,
        phone: buildPhone(editForm.phone || client.phone),
        gender: editForm.gender || client.gender || 'Male'
      } as Client;

      await dbService.saveClient(updatedClient);
            setClient(updatedClient);
            setIsEditing(false);
          }
        };

  const handleCancel = () => {
    setEditForm(client || {});
    setIsEditing(false);
  };

  const handleDeleteClient = async () => {
    if (!client) return;
    
    if (window.confirm(`Are you sure you want to delete client "${client.name}"? This action cannot be undone.`)) {
      try {
        await dbService.deleteClient(client.id);
        alert("Client deleted successfully.");
        navigate('/clients');
      } catch (error) {
        console.error("Failed to delete client:", error);
        alert("Failed to delete client. Please try again.");
      }
    }
  };

  const handleUpdateReferral = async (referral: Referral) => {
    // If status is "Bonus Paid", we should add a transaction record to the client's ledger
    if (referral.status === 'Bonus Paid' && referral.bonusAmount > 0 && client) {
      const bonusDescription = `Referral Bonus: ${referral.refereeName}`;
      const existingTx = transactions.find(t => t.particulars === bonusDescription);
      
      if (!existingTx) {
        const newTx: Transaction = {
          id: `tx_ref_${referral.id}_${Date.now()}`,
          date: new Date().toISOString().split('T')[0],
          particulars: bonusDescription,
          amount: referral.bonusAmount,
          type: TransactionType.CREDIT,
          category: TransactionCategory.GENERAL,
          method: PaymentMethod.JOURNAL,
          referenceId: referral.id,
          clientId: client.id,
          balanceAfter: (client.balance || 0) + referral.bonusAmount,
          synced: false
        };
        
        await dbService.saveTransaction(newTx);
      }
    }

    await dbService.saveReferral(referral);
    const refs = await dbService.getReferrals();
    setReferrals(refs.filter(r => r.referrerClientId === normalizedId));
    setEditingReferral(null);
  };

  const handleAddReferral = async () => {
    if (newReferralForm.name && newReferralForm.phone && client) {
      const newRef: Referral = {
        id: `ref_${Date.now()}`,
        referrerClientId: client.id,
        refereeName: newReferralForm.name,
        refereePhone: '+91' + newReferralForm.phone.replace(/\D/g, '').slice(-10),
        status: 'Pending',
        bonusAmount: 0,
        date: new Date().toISOString().split('T')[0]
      };
      await dbService.saveReferral(newRef);
      setReferrals(prev => [...prev, newRef]);
      setShowAddReferralModal(false);

      // Automatically navigate to Add Client page with pre-filled details
      const params = new URLSearchParams();
      params.set('name', newReferralForm.name);
      params.set('phone', newReferralForm.phone);
      navigate(`/add-client?${params.toString()}`);

      setNewReferralForm({ name: '', phone: '' });
    }
  };

  const handleAddNewPlot = () => {
    if (selectedInvestment) {
      setNewPropertyForm({
        ...newPropertyForm,
        propertyId: selectedInvestment.propertyId,
        plotId: '',
        totalAmount: '',
        tokenAmount: '',
        paymentMode: 'Cash',
        paymentReference: '',
        bookingDate: new Date().toISOString().split('T')[0]
      });
      setSelectedProperty(allProperties.find(p => p.id === selectedInvestment.propertyId) || null);
      setShowManageModal(false);
      setShowAddPropertyModal(true);
    }
  };

  const handleTransfer = () => {
    if (selectedInvestment && client) {
      const transferFee = Math.abs(client.balance) * 0.1;
      const params = new URLSearchParams();
      params.set('transferFrom', client.id);
      params.set('transferFromName', client.name);
      params.set('propertyId', selectedInvestment.propertyId);
      params.set('plotId', selectedInvestment.plotId || '');
      params.set('transferFee', transferFee.toString());
      navigate(`/add-client?${params.toString()}`);
    }
  };

  const handleCancellation = async () => {
    if (selectedInvestment && client) {
      const cancellationFee = Math.abs(client.balance) * 0.1;
      
      // 1. Update Plot Status to 'Available'
      const property = allProperties.find(p => p.id === selectedInvestment.propertyId);
      if (property && property.inventory) {
        const plot = property.inventory.find(pl => pl.id === selectedInvestment.plotId);
        if (plot) {
          plot.status = 'Available';
          plot.buyerName = undefined;
          plot.buyerPhone = undefined;
          await dbService.saveProperty(property);
        }
      }
      
      // 2. Remove investment from client
      const updatedInvestments = client.investments?.filter(inv => 
        !(inv.propertyId === selectedInvestment.propertyId && inv.plotId === selectedInvestment.plotId)
      ) || [];
      
      // 3. Create Transaction for Cancellation Fee
      const feeTx: Transaction = {
        id: `tx_cancel_fee_${Date.now()}`,
        date: new Date().toISOString().split('T')[0],
        particulars: `Cancellation Fee (10% of Balance) - ${property?.title}`,
        amount: cancellationFee,
        type: TransactionType.DEBIT,
        method: PaymentMethod.JOURNAL,
        referenceId: `CANCEL_${selectedInvestment.plotId || 'N/A'}`,
        clientId: client.id,
        balanceAfter: client.balance - cancellationFee,
        synced: false
      };
      await dbService.saveTransaction(feeTx);
      
      // 4. Update Client
      const updatedClient = {
        ...client,
        investments: updatedInvestments,
        propertyCount: Math.max(0, (client.propertyCount || 0) - 1),
        balance: client.balance - cancellationFee
      };
      await dbService.saveClient(updatedClient);
      
      setClient(updatedClient);
      setEditForm(updatedClient);
      
      // Refresh transactions
      const updatedTxs = await dbService.getTransactions();
      setTransactions(updatedTxs.filter(t => t.clientId === normalizedId));

      setShowManageModal(false);
      setShowCancelConfirmation(false);
      alert(`Property cancelled successfully. Cancellation fee of ₹${cancellationFee.toLocaleString()} applied.`);
    }
  };

  const handleAddPropertySubmit = async () => {
    if (!client || !newPropertyForm.propertyId || !newPropertyForm.plotId || !newPropertyForm.totalAmount) return;

    const property = allProperties.find(p => p.id === newPropertyForm.propertyId);
    const plot = property?.inventory?.find(p => p.id === newPropertyForm.plotId);
    
    if (!property || !plot) return;

    // 1. Create Credit Transaction for Token if paid
    if (newPropertyForm.tokenAmount) {
      await dbService.saveTransaction({
        id: 'tx-token-' + Date.now(),
        date: newPropertyForm.bookingDate,
        particulars: `Booking Token Amount Received: ${property.title} - Plot No. ${plot.plotNumber}`,
        amount: Number(newPropertyForm.tokenAmount),
        type: 'Credit' as any,
        category: 'General' as any,
        method: newPropertyForm.paymentMode as any,
        referenceId: newPropertyForm.paymentReference || 'TOKEN-' + Date.now(),
        clientId: client.id,
        propertyId: property.id,
        balanceAfter: client.balance + Number(newPropertyForm.tokenAmount),
        synced: true
      });
    }

    // 2. Update Plot Status and Client Stats (This also creates the DEBIT transaction)
    await dbService.assignPlotToClient(
  property.id,
  plot.id,
  client.id,
  {
    name: client.name,
    phone: client.phone,
    amount: Number(newPropertyForm.totalAmount),
    status: 'Reserved'
  }
);

    // Refresh data
    const updatedClients = await dbService.getClients();
    const refreshedClient = updatedClients.find(c => c.id === client.id);
    if (refreshedClient) setClient(refreshedClient);

    const updatedTxs = await dbService.getTransactions();
    setTransactions(updatedTxs.filter(t => t.clientId === normalizedId));
    
    // Set just added property for agreement generation
    if (refreshedClient) {
      const totalPaid = transactions
  .filter(t => t.type === TransactionType.CREDIT)
  .reduce((sum, t) => sum + t.amount, 0);

const remaining = Math.max(0, (refreshedClient.totalContractValue || 0) - totalPaid);

const duration = Number(refreshedClient.emiDuration || 0);

const emiAmount = duration > 0 ? Math.round(remaining / duration) : 0;

setJustAddedProperty({
  ...refreshedClient,

  // EXISTING
  projectName: property.title,
  locality: property.locality,
  plotNumber: plot.plotNumber,
  area: plot.size?.toString(),
  totalAmount: newPropertyForm.totalAmount,
  tokenAmount: newPropertyForm.tokenAmount,
  paymentMode: newPropertyForm.paymentMode,
  bookingDate: newPropertyForm.bookingDate,
  bookingDay: newPropertyForm.bookingDay,

  // 🔥 ADD THIS (MANDATORY)
  emiDuration: duration,
  emiAmount: emiAmount,
  remainingAmount: remaining,
});
    }

    setShowAddPropertyModal(false);
    setNewPropertyForm({
      propertyId: '',
      plotId: '',
      totalAmount: '',
      tokenAmount: '',
      paymentMode: 'Cash',
      paymentReference: '',
      bookingDate: new Date().toISOString().split('T')[0]
    });
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

  const handleChange = (field: keyof Client, value: any) => {
    if (field === 'dob') {
      const age = calculateAge(value);
      setEditForm(prev => ({ ...prev, dob: value, age: Number(age) }));
    } else {
      setEditForm(prev => ({ ...prev, [field]: value }));
    }
  };

  const handleAddProperty = () => {
    setShowAddPropertyModal(true);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0 || !client) return;
    
    const files = Array.from(e.target.files) as File[];
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      try {
        const reader = new FileReader();
        
        const base64Promise = new Promise<string>((resolve, reject) => {
          reader.onload = (event) => resolve(event.target?.result as string);
          reader.onerror = (error) => reject(error);
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
          clientId: client.id,
          propertyId: selectedInvestment?.propertyId,
          fileData: base64Data
        });
      } catch (error) {
        console.error('Upload error:', error);
        alert(`Failed to save document locally: ${file.name}`);
      }
    }
    
    // Refresh documents
    dbService.getDocs().then(allDocs => {
      setDocs(allDocs.filter(d => String(d.clientId) === String(client.id) && d.type !== 'virtual' && d.category !== 'REPORT'));
    });
  };

  const handleViewDoc = (doc: Doc) => {
    setPreviewDoc(doc);
  };

  const handleDeleteDoc = async (docId: string) => {
    if (window.confirm('Are you sure you want to delete this document?')) {
      await dbService.deleteDoc(docId);
      const updatedDocs = await dbService.getDocs();
      setDocs(updatedDocs.filter(d => d.clientId === client.id && d.type !== 'virtual' && d.category !== 'REPORT'));
    }
  };

  const [previewType, setPreviewType] = useState<'agreement' | 'token' | null>(null);
  const [selectedLang, setSelectedLang] = useState<'en' | 'hi' | 'mr' | null>(null);

  if (!client) return <div className="p-8">Loading...</div>;

  const getDayName = (dateStr: string) => {
  if (!dateStr) return '';

  const d = new Date(dateStr);

  return {
    en: d.toLocaleDateString('en-US', { weekday: 'long' }),
    hi: ['रविवार','सोमवार','मंगलवार','बुधवार','गुरुवार','शुक्रवार','शनिवार'][d.getDay()],
    mr: ['रविवार','सोमवार','मंगळवार','बुधवार','गुरुवार','शुक्रवार','शनिवार'][d.getDay()]
  };
};

  return (
    <div className="space-y-3">
      {/* Main Profile Card */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        
         {/* Header Actions */}
        <div className="p-6 border-b border-slate-100 flex justify-between items-start">
           <div className="flex items-center flex-1">
             <div className="w-16 h-16 bg-brand-50 rounded-full flex items-center justify-center text-xl font-bold text-brand-600 mr-4 border-2 border-brand-100 flex-shrink-0">
               {client.name.substring(0, 2).toUpperCase()}
             </div>
             <div className="w-full max-w-md">
               {!isEditing ? (
                 <h1 className="text-2xl font-bold text-slate-800">{client.name}</h1>
               ) : (
                 <input 
                   type="text" 
                   className="text-xl font-bold text-slate-800 border-b-2 border-brand-500 focus:outline-none mb-1 w-full bg-transparent px-1"
                   value={editForm.name}
                   onChange={e => handleChange('name', e.target.value)}
                 />
               )}
               <p className="text-xs text-slate-400">ID: {(client.id || '').toUpperCase()}</p>
             </div>
           </div>

           <div className="flex space-x-2">
             <button 
               onClick={handleSync} 
               disabled={isSyncing}
               className="flex items-center text-slate-500 hover:text-brand-600 px-3 py-1.5 rounded-lg hover:bg-brand-50 text-sm font-medium transition-colors disabled:opacity-50"
             >
               <RefreshCw size={16} className={`mr-2 ${isSyncing ? 'animate-spin' : ''}`} /> 
               {isSyncing ? 'Syncing...' : 'Sync to Website'}
             </button>
             {!isEditing ? (
               <>
                 <button onClick={() => setIsEditing(true)} className="flex items-center text-slate-500 hover:text-brand-600 px-3 py-1.5 rounded-lg hover:bg-brand-50 text-sm font-medium transition-colors">
                   <Edit2 size={16} className="mr-2" /> Edit Details
                 </button>
                 <button onClick={handleDeleteClient} className="flex items-center text-red-500 hover:text-red-700 px-3 py-1.5 rounded-lg hover:bg-red-50 text-sm font-medium transition-colors">
                   <Trash2 size={16} className="mr-2" /> Delete Client
                 </button>
               </>
             ) : (
               <>
                 <button onClick={handleCancel} className="flex items-center text-slate-500 hover:text-slate-700 px-3 py-1.5 rounded-lg hover:bg-slate-100 text-sm font-medium transition-colors">
                   <X size={16} className="mr-2" /> Cancel
                 </button>
                 <button onClick={handleSave} className="flex items-center bg-brand-600 text-white px-3 py-1.5 rounded-lg hover:bg-brand-700 text-sm font-medium transition-colors">
                   <Save size={16} className="mr-2" /> Save
                 </button>
               </>
             )}
           </div>
        </div>

        {/* Detailed Info Sections */}
        <div className="divide-y divide-slate-100">
          
          {/* Section 1: Personal */}
          <div className="p-6">
            <h3 className="text-sm font-semibold text-slate-800 mb-4 flex items-center">
              <User size={16} className="mr-2 text-brand-500" /> Personal Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <InfoField label="Father's / Husband's Name" value={client.fatherName} isEditing={isEditing} 
                editValue={editForm.fatherName} onChange={v => handleChange('fatherName', v)} icon={User} />

              <InfoField label="Occupation" value={client.occupation} isEditing={isEditing} 
                editValue={editForm.occupation} onChange={v => handleChange('occupation', v)} icon={Briefcase} />

              <InfoField label="Date of Birth" value={client.dob} isEditing={isEditing} 
                editValue={editForm.dob} onChange={v => handleChange('dob', v)} icon={Calendar} type="date" />

              <InfoField label="Age" value={client.age} isEditing={isEditing} 
                editValue={editForm.age} onChange={v => handleChange('age', v)} type="number" />

              <InfoField label="Gender" value={client.gender} isEditing={isEditing} 
                editValue={editForm.gender} onChange={v => handleChange('gender', v)} 
                type="select" options={["Male", "Female", "Other"]} />  

              <InfoField label="Phone" value={client.phone} isEditing={isEditing} 
                editValue={editForm.phone} onChange={v => handleChange('phone', v)} icon={Phone} />
              
              <InfoField label="Email" value={client.email} isEditing={isEditing} 
                editValue={editForm.email} onChange={v => handleChange('email', v)} icon={Mail} />
              
              <InfoField label="Address" value={client.address} isEditing={isEditing} 
                editValue={editForm.address} onChange={v => handleChange('address', v)} icon={MapPin} />
              
              <InfoField label="District" value={client.district} isEditing={isEditing} 
                editValue={editForm.district} onChange={v => handleChange('district', v)} />
              
              <InfoField label="State" value={client.state} isEditing={isEditing} 
                editValue={editForm.state} onChange={v => handleChange('state', v)} 
                type="select" options={[
                  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat", "Haryana", 
                  "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", 
                  "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", 
                  "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal", "Andaman and Nicobar Islands", "Chandigarh", 
                  "Dadra and Nagar Haveli and Daman and Diu", "Delhi", "Jammu and Kashmir", "Ladakh", "Lakshadweep", "Puducherry"
                ]} />
              
              <InfoField label="Pincode" value={client.pincode} isEditing={isEditing} 
                editValue={editForm.pincode} onChange={v => handleChange('pincode', v)} />
            </div>
          </div>

          {/* Section 2: Username & Password Management */}
          <div className="p-6 bg-indigo-50/30">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-semibold text-slate-800 flex items-center">
                <Shield size={16} className="mr-2 text-indigo-500" /> Username & Password Management
              </h3>
              {isEditing && (
                <button 
                  onClick={() => {
                    const password = Math.random().toString(36).slice(-8).toUpperCase();
                    handleChange('password', password);
                    // Always default to phone number if username is empty or if we want to reset it
                    handleChange('username', '+91' + (editForm.phone || client.phone).replace(/\D/g, '').slice(-10));
                  }}
                  className="text-[10px] bg-indigo-600 text-white px-2 py-1 rounded flex items-center hover:bg-indigo-700 transition-colors font-bold uppercase tracking-wider"
                >
                  <RefreshCw size={10} className="mr-1" /> Auto-Generate Credentials
                </button>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <InfoField 
                label="Login ID (Username)" 
                value={client.username || client.phone} 
                isEditing={isEditing} 
                editValue={editForm.username} 
                onChange={(v: string) => handleChange('username', v)} 
                icon={User}
                placeholder="Defaults to Mobile Number"
              />
              
              <InfoField 
                label="Password-ID" 
                value={client.password} 
                isEditing={isEditing} 
                editValue={editForm.password} 
                onChange={(v: string) => handleChange('password', v)} 
                icon={Shield}
                placeholder="Enter or Generate Password"
              />
            </div>
          </div>

          {/* Section 3: Identity */}
          <div className="p-6 bg-slate-50/50">
            <h3 className="text-sm font-semibold text-slate-800 mb-4 flex items-center">
              <CreditCard size={16} className="mr-2 text-brand-500" /> Identity Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <InfoField label="Aadhaar Number" value={client.aadhaar} isEditing={isEditing} 
                editValue={editForm.aadhaar} onChange={v => handleChange('aadhaar', v)} />
              
              <InfoField label="PAN Number" value={client.pan} isEditing={isEditing} 
                editValue={editForm.pan} onChange={v => handleChange('pan', v)} />

              <InfoField label="GSTIN" value={client.gstin} isEditing={isEditing} 
                editValue={editForm.gstin} onChange={v => handleChange('gstin', v)} />
            </div>
          </div>

          {/* Section 4: Bank Details */}
          <div className="p-6">
            <h3 className="text-sm font-semibold text-slate-800 mb-4 flex items-center">
              <Building size={16} className="mr-2 text-brand-500" /> Bank Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <InfoField label="Bank Name" value={client.bankName} isEditing={isEditing} 
                editValue={editForm.bankName} onChange={v => handleChange('bankName', v)} icon={Building} />
              
              <InfoField label="Account Number" value={client.accountNumber} isEditing={isEditing} 
                editValue={editForm.accountNumber} onChange={v => handleChange('accountNumber', v)} icon={CreditCard} />
              
              <InfoField label="IFSC Code" value={client.ifscCode} isEditing={isEditing} 
                editValue={editForm.ifscCode} onChange={v => handleChange('ifscCode', v)} icon={Shield} />
            </div>
          </div>

          {/* Contract Value Row */}
          <div className="p-6 bg-slate-50 flex items-center justify-between border-b border-slate-100">
            <div className="flex items-center">
              <FileText size={20} className="mr-3 text-slate-600" />
              <span className="font-semibold text-slate-700">Total Contract Value (Sale Value)</span>
            </div>
            <div className="text-right">
              <span className="text-2xl font-bold text-blue-700">
                ₹{Accounting.formatIndian(client.totalContractValue || 0)}
              </span>
              <p className="text-[11px] font-medium text-slate-500 mt-1">
                {Accounting.formatIndianWords(client.totalContractValue || 0)} Only
              </p>
            </div>
          </div>

          {/* Paid Amount Row */}
<div className="p-6 bg-green-50 flex items-center justify-between border-b border-green-100">
  <div className="flex items-center">
    <CheckCircle size={20} className="mr-3 text-green-600" />
    <span className="font-semibold text-green-700">Total Amount Paid</span>
  </div>
  <div className="text-right">
    {(() => {
      const totalPaid = transactions
        .filter(t => t.type === TransactionType.CREDIT)
        .reduce((sum, t) => sum + t.amount, 0);

        

      return (
        <>
          <span className="text-2xl font-bold text-green-800">
            ₹{Accounting.formatIndian(totalPaid)}
          </span>
          <p className="text-[11px] font-medium text-green-600 mt-1">
            {Accounting.formatIndianWords(totalPaid)} Only
          </p>
        </>
      );
    })()}
  </div>
</div>

{/* Balance Row */}
<div className="p-6 bg-brand-50 flex items-center justify-between">
  <div className="flex items-center">
    <Activity size={20} className="mr-3 text-brand-600" />
    <span className="font-semibold text-brand-900">Remaining Balance (Outstanding)</span>
  </div>
  <div className="text-right">
    {(() => {
      const totalPaid = transactions
        .filter(t => t.type === TransactionType.CREDIT)
        .reduce((sum, t) => sum + t.amount, 0);

      const contractValue = client.totalContractValue || 0;
      const remaining = contractValue - totalPaid;

      return (
        <>
          <span className={`text-2xl font-bold ${remaining > 0 ? 'text-red-600' : 'text-green-600'}`}>
            ₹{Accounting.formatIndian(Math.abs(remaining))} {remaining > 0 ? 'Dr' : 'Cr'}
          </span>
          <p className={`text-[11px] font-medium mt-1 ${remaining > 0 ? 'text-red-500' : 'text-red-600'}`}>
            {Accounting.formatIndianWords(Math.abs(remaining))} Only
          </p>
        </>
      );
    })()}
  </div>
</div>
{/* EMI Information Row */}
{client.emiDuration && (
  <div className="p-6 bg-slate-50 flex items-center justify-between border-t border-slate-100">
    <div className="flex items-center">
      <Calendar size={20} className="mr-3 text-slate-600" />
      <span className="font-semibold text-slate-700">EMI Plan</span>
    </div>
    <div className="text-right">
      {(() => {
        const totalPaid = transactions
          .filter(t => t.type === TransactionType.CREDIT)
          .reduce((sum, t) => sum + t.amount, 0);

          const remaining = Math.max(0, (client.totalContractValue || 0) - totalPaid);
          const totalMonths = Number(client.emiDuration || 1);
          const paidMonths = Math.floor(
          totalPaid / ((client.totalContractValue || 0) / totalMonths)
        );

          const remainingMonths = Math.max(1, totalMonths - paidMonths);
          const emi = remaining / remainingMonths;

        return (
          <>
            <span className="text-lg font-bold text-slate-800">
              ₹{Accounting.formatIndian(Math.round(emi))} / month
            </span>
            <p className="text-[10px] text-slate-500">
              For {client.emiDuration} months
            </p>
          </>
        );
      })()}
    </div>
  </div>
)}

</div>
</div>

      {/* Tabs Section */}
      <div className="flex space-x-1 bg-slate-200 p-1 rounded-lg w-fit">
        {[
          { id: 'overview', label: 'Ledger History', icon: <FileText size={16} /> },
          { id: 'properties', label: 'Properties', icon: <Building size={16} /> },
          { id: 'referral', label: 'Referral Loyalty Bonus', icon: <Globe size={16} /> },
          { id: 'docs', label: 'Documents', icon: <FileText size={16} /> }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === tab.id ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 min-h-[300px]">
        {activeTab === 'overview' && (
          <div>
             <div className="p-4 border-b border-slate-100 font-semibold text-slate-700 flex justify-between items-center bg-slate-50/50">
               <div className="flex items-center gap-4">
                 <span>Account Ledger</span>
                 <button 
                   onClick={() => setShowStatementPreview(true)}
                   className="flex items-center gap-2 px-3 py-1.5 bg-brand-600 text-white rounded-lg text-xs font-bold hover:bg-brand-700 transition-all shadow-sm"
                 >
                   <Printer size={14} />
                   Print Statement
                 </button>
               </div>
               <button 
                 onClick={() => setSortOrder(prev => prev === 'newest' ? 'oldest' : 'newest')}
                 className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg text-xs font-bold transition-all"
               >
                 <ArrowRight size={14} className={sortOrder === 'newest' ? 'rotate-90' : '-rotate-90'} />
                 {sortOrder === 'newest' ? 'Newest First' : 'Oldest First'}
               </button>
             </div>
             <TransactionTable transactions={sortedTransactions.slice(0, 10)} />
          </div>
        )}

        {activeTab === 'properties' && (
           <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
             {/* If project name exists in client, show it as a primary property card */}
             {client?.projectName && (!client.investments || client.investments.length === 0) && (
               <div className="border border-brand-200 bg-brand-50/30 rounded-lg p-4 relative">
                  <div className="absolute top-4 right-4 text-xs font-bold text-brand-600 bg-brand-100 px-2 py-1 rounded">PRIMARY</div>
                  <h3 className="font-semibold text-slate-800">{client.projectName}</h3>
                  <p className="text-sm text-slate-500 mt-1">Unit: {client.plotNumber}</p>
                  <div className="flex items-center text-xs text-slate-400 mt-3">
                    <MapPin size={12} className="mr-1 flex-shrink-0" /> 
                    <span className="truncate">
                      {[client.address, client.district, client.state].filter(Boolean).join(', ')}
                    </span>
                  </div>
               </div>
             )}
             
             {client?.investments?.map(inv => {
               const property = allProperties.find(p => p.id === inv.propertyId);
               const plot = property?.inventory?.find(pl => pl.id === inv.plotId);
               return (
                 <div key={`${inv.propertyId}-${inv.plotId}`} className="border border-slate-200 rounded-lg p-4 hover:border-brand-300 bg-white shadow-sm">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-slate-800">{property?.title || 'Unknown Property'}</h3>
                        <p className="text-sm text-slate-500 mt-1">Unit: {plot?.plotNumber || inv.plotId || 'N/A'}</p>
                      </div>
                      <button 
                        onClick={() => {
                          setSelectedInvestment(inv);
                          setShowManageModal(true);
                        }}
                        className="px-3 py-1 bg-brand-50 text-brand-600 text-xs font-bold rounded-lg hover:bg-brand-100 transition-colors flex items-center gap-1"
                      >
                        <Settings size={12} /> Manage
                      </button>
                    </div>
                    <div className="flex items-center text-xs text-slate-400 mt-3">
                      <MapPin size={12} className="mr-1" /> {property?.locality || 'N/A'}, {property?.city || 'N/A'}
                    </div>
                    <div className="mt-3 pt-3 border-t border-slate-50 flex justify-between items-center text-xs">
                      <span className="text-slate-400">Purchased: {inv.purchaseDate}</span>
                      <span className="font-bold text-slate-700">₹{inv.amount.toLocaleString()}</span>
                    </div>
                 </div>
               );
             })}
             
             <button 
               onClick={() => setShowAddPropertyModal(true)}
               className="border-2 border-dashed border-slate-300 rounded-lg p-4 flex flex-col items-center justify-center text-slate-500 hover:bg-slate-50 hover:border-brand-300 transition-colors w-full h-full min-h-[120px]"
             >
               <Building size={24} className="mb-2" />
               <span className="text-sm font-medium">Add Another Property</span>
             </button>
           </div>
        )}

        {activeTab === 'referral' && (
          <div className="p-6 space-y-8" id="referral-tab-content">
            {/* Referral Dashboard Summary */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 p-4 rounded-2xl text-white shadow-md">
                <div className="flex justify-between items-start mb-2">
                  <div className="p-2 bg-white/20 rounded-lg">
                    <Users size={20} />
                  </div>
                  <span className="text-xs font-bold bg-white/20 px-2 py-1 rounded-full uppercase tracking-wider">Total</span>
                </div>
                <p className="text-2xl font-black">{referrals.length}</p>
                <p className="text-xs font-medium opacity-80 uppercase tracking-widest">Referrals</p>
              </div>

              <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 p-4 rounded-2xl text-white shadow-md">
                <div className="flex justify-between items-start mb-2">
                  <div className="p-2 bg-white/20 rounded-lg">
                    <Trophy size={20} />
                  </div>
                  <span className="text-xs font-bold bg-white/20 px-2 py-1 rounded-full uppercase tracking-wider">Earned</span>
                </div>
                <p className="text-2xl font-black">₹{referrals.reduce((acc, r) => acc + r.bonusAmount, 0).toLocaleString()}</p>
                <p className="text-xs font-medium opacity-80 uppercase tracking-widest">Total Bonus</p>
              </div>

              <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-4 rounded-2xl text-white shadow-md">
                <div className="flex justify-between items-start mb-2">
                  <div className="p-2 bg-white/20 rounded-lg">
                    <Wallet size={20} />
                  </div>
                  <span className="text-xs font-bold bg-white/20 px-2 py-1 rounded-full uppercase tracking-wider">Paid</span>
                </div>
                <p className="text-2xl font-black">₹{(client.payments || []).filter(p => (p.description || '').includes('Referral Bonus')).reduce((acc, p) => acc + (p.amount || 0), 0).toLocaleString()}</p>
                <p className="text-xs font-medium opacity-80 uppercase tracking-widest">Bonus Paid</p>
              </div>

              <div className="bg-gradient-to-br from-amber-500 to-amber-600 p-4 rounded-2xl text-white shadow-md">
                <div className="flex justify-between items-start mb-2">
                  <div className="p-2 bg-white/20 rounded-lg">
                    <TrendingUp size={20} />
                  </div>
                  <span className="text-xs font-bold bg-white/20 px-2 py-1 rounded-full uppercase tracking-wider">Due</span>
                </div>
                <p className="text-2xl font-black">
                  ₹{(referrals.reduce((acc, r) => acc + r.bonusAmount, 0) - (client.payments || []).filter(p => p.description.includes('Referral Bonus')).reduce((acc, p) => acc + p.amount, 0)).toLocaleString()}
                </p>
                <p className="text-xs font-medium opacity-80 uppercase tracking-widest">Pending Bonus</p>
              </div>
            </div>

            {/* Referral Requests from Website */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Globe size={18} className="text-indigo-600" />
                  <h3 className="font-bold text-slate-800 uppercase text-xs tracking-widest">Referral Requests (from Website)</h3>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={async () => {
                      const res = await dbService.syncToWebsite();
                      if (res.success) {
                        alert(res.message);
                      } else {
                        alert('Sync failed: ' + (res.error || 'Unknown error'));
                      }
                    }}
                    className="text-[10px] font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 uppercase tracking-widest"
                  >
                    <RefreshCw size={12} /> Push to Cloud
                  </button>
                  <button 
                    onClick={async () => {
                      try {
                        const backendUrl = 'https://ashray-backend-2nt7.onrender.com';
                        const refRes = await fetch(`${backendUrl}/api/referral/all`);
                        const refs = await refRes.json();
                        if (Array.isArray(refs)) {
                          let count = 0;
                          for (const r of refs) {
                            if (r.referrerClientId === client?.id) {
                              await dbService.saveReferral(r);
                              count++;
                            }
                          }
                          const refs2 = await dbService.getReferrals();
                          setReferrals(refs2.filter(r => r.referrerClientId === normalizedId));
                          alert(`Fetched ${count} referral(s) from website.`);
                        }
                      } catch (err) {
                        alert('Failed to fetch from website: ' + (err instanceof Error ? err.message : String(err)));
                      }
                    }}
                    className="text-[10px] font-bold text-green-600 hover:text-green-800 flex items-center gap-1 uppercase tracking-widest"
                  >
                    <Globe size={12} /> Fetch from Website
                  </button>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-slate-50 text-slate-500 uppercase font-bold text-[10px] tracking-wider border-b border-slate-200">
                    <tr>
                      <th className="px-6 py-4">Date</th>
                      <th className="px-6 py-4">Referee Name</th>
                      <th className="px-6 py-4">Phone</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4 text-right">Bonus (₹)</th>
                      <th className="px-6 py-4 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {referrals.length > 0 ? referrals.map((ref) => (
                      <tr key={ref.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4 text-slate-500 font-mono text-xs">{ref.date}</td>
                        <td className="px-6 py-4 font-bold text-slate-800">{ref.refereeName}</td>
                        <td className="px-6 py-4 text-slate-600">{ref.refereePhone}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            ref.status === 'Bonus Paid' ? 'bg-green-100 text-green-700' :
                            ref.status === 'Converted' ? 'bg-blue-100 text-blue-700' :
                            ref.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' :
                            ref.status === 'Rejected' ? 'bg-red-100 text-red-700' :
                            'bg-slate-100 text-slate-700'
                          }`}>
                            {ref.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right font-bold text-emerald-600">
                          {ref.bonusAmount > 0 ? `₹${ref.bonusAmount.toLocaleString()}` : '---'}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <button 
                            onClick={() => setEditingReferral(ref)}
                            className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                            title="Process Referral"
                          >
                            <Edit2 size={16} />
                          </button>
                        </td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan={6} className="px-6 py-12 text-center text-slate-400 italic">
                          No referral requests found for this client.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Add New Referral Modal */}
            {showAddReferralModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-fade-in">
                  <div className="bg-brand-600 p-6 text-white flex justify-between items-center">
                    <h3 className="font-bold text-lg flex items-center gap-2">
                      <Plus size={20} /> Add New Referral
                    </h3>
                    <button onClick={() => setShowAddReferralModal(false)} className="hover:bg-white/20 p-1 rounded-full transition-colors">
                      <X size={20} />
                    </button>
                  </div>
                  <div className="p-6 space-y-4">
                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1 ml-1">Referee Name</label>
                        <input 
                          type="text"
                          className="w-full p-3 bg-white border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-brand-500 text-sm"
                          value={newReferralForm.name}
                          onChange={(e) => setNewReferralForm({ ...newReferralForm, name: e.target.value })}
                          placeholder="Enter full name"
                          autoFocus
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1 ml-1">Referee Phone</label>
                        <input 
                          type="tel"
                          className="w-full p-3 bg-white border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-brand-500 text-sm"
                          value={newReferralForm.phone}
                          onChange={(e) => setNewReferralForm({ ...newReferralForm, phone: e.target.value })}
                          placeholder="Enter phone number"
                        />
                      </div>
                    </div>

                    <div className="flex gap-3 pt-4">
                      <button 
                        onClick={() => setShowAddReferralModal(false)}
                        className="flex-1 px-4 py-3 rounded-xl font-bold text-slate-600 hover:bg-slate-100 transition-colors text-sm"
                      >
                        Cancel
                      </button>
                      <button 
                        onClick={handleAddReferral}
                        disabled={!newReferralForm.name || !newReferralForm.phone}
                        className="flex-1 px-4 py-3 bg-brand-600 text-white rounded-xl font-bold hover:bg-brand-700 transition-all shadow-lg shadow-brand-600/20 text-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:shadow-none"
                      >
                        <Check size={18} /> Add Referral
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Referral Processing Modal */}
            {editingReferral && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-fade-in">
                  <div className="bg-indigo-600 p-6 text-white flex justify-between items-center">
                    <h3 className="font-bold text-lg flex items-center gap-2">
                      <Gift size={20} /> Process Referral
                    </h3>
                    <button onClick={() => setEditingReferral(null)} className="hover:bg-white/20 p-1 rounded-full transition-colors">
                      <X size={20} />
                    </button>
                  </div>
                  <div className="p-6 space-y-4">
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Referee Details</p>
                      <p className="font-bold text-slate-800">{editingReferral.refereeName}</p>
                      <p className="text-sm text-slate-600">{editingReferral.refereePhone}</p>
                      {editingReferral.notes && (
                        <div className="mt-2 pt-2 border-t border-slate-200">
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Notes from Client</p>
                          <p className="text-xs text-slate-600 italic">"{editingReferral.notes}"</p>
                        </div>
                      )}
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1 ml-1">Update Status</label>
                        <select 
                          className="w-full p-3 bg-white border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                          value={editingReferral.status}
                          onChange={(e) => setEditingReferral({ ...editingReferral, status: e.target.value as any })}
                        >
                          <option value="Pending">Pending</option>
                          <option value="Contacted">Contacted</option>
                          <option value="Converted">Converted</option>
                          <option value="Bonus Paid">Bonus Paid</option>
                          <option value="Rejected">Rejected</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1 ml-1">Allot Loyalty Bonus (₹)</label>
                        <div className="relative">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
                          <input 
                            type="number"
                            className="w-full p-3 pl-8 bg-white border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-bold"
                            value={editingReferral.bonusAmount}
                            onChange={(e) => setEditingReferral({ ...editingReferral, bonusAmount: Number(e.target.value) })}
                            placeholder="0.00"
                          />
                        </div>
                        <p className="text-[10px] text-slate-400 mt-1 ml-1 font-medium italic">This amount will be credited to the client's loyalty balance.</p>
                      </div>
                    </div>

                    <div className="flex gap-3 pt-4">
                      <button 
                        onClick={() => setEditingReferral(null)}
                        className="flex-1 px-4 py-3 rounded-xl font-bold text-slate-600 hover:bg-slate-100 transition-colors text-sm"
                      >
                        Cancel
                      </button>
                      <button 
                        onClick={() => handleUpdateReferral(editingReferral)}
                        className="flex-1 px-4 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-600/20 text-sm flex items-center justify-center gap-2"
                      >
                        <Check size={18} /> Save Changes
                      </button>
                    </div>

                    {(editingReferral.status === 'Converted' || editingReferral.status === 'Bonus Paid') && (
                      <div className="pt-4 border-t border-slate-100 mt-4">
                        <button 
                          onClick={() => {
                            const params = new URLSearchParams();
                            params.set('name', editingReferral.refereeName);
                            params.set('phone', editingReferral.refereePhone);
                            navigate(`/add-client?${params.toString()}`);
                          }}
                          className="w-full px-4 py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-600/20 text-sm flex items-center justify-center gap-2"
                        >
                          <UserPlus size={18} /> Add as New Client
                        </button>
                        <p className="text-[10px] text-slate-400 mt-2 text-center italic">
                          This will pre-fill the Add Client form with the referee's details.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Referrals & Loyalty List */}
            <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div className="flex items-center gap-4">
                  <div className="p-4 bg-brand-50 rounded-2xl text-brand-600 shadow-inner">
                    <Gift size={28} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-slate-800 tracking-tight">Referrals & Loyalty Program</h3>
                    <p className="text-sm text-slate-500 font-medium">Track and reward successful referrals</p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowAddReferralModal(true)}
                  className="flex items-center gap-2 px-6 py-3 bg-brand-600 text-white rounded-2xl hover:bg-brand-700 transition-all shadow-lg hover:shadow-brand-200 active:scale-95 text-sm font-black uppercase tracking-widest"
                >
                  <Plus size={20} /> Add New Referral
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {referrals.map((ref) => (
                  <div key={ref.id} className="p-6 border border-slate-200 rounded-2xl bg-white shadow-sm hover:shadow-xl transition-all hover:-translate-y-1 border-b-4 border-b-brand-500">
                    <div className="flex justify-between items-start mb-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl flex items-center justify-center text-slate-600 font-black text-lg shadow-inner">
                          {ref.refereeName.substring(0, 1)}
                        </div>
                        <div>
                          <h4 className="font-black text-slate-800 text-lg leading-tight">{ref.refereeName}</h4>
                          <p className="text-xs text-slate-500 font-bold flex items-center gap-1 mt-1">
                            <Phone size={12} className="text-brand-500" /> {ref.refereePhone}
                          </p>
                        </div>
                      </div>
                      <div className={`text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest shadow-sm ${
                        ref.status === 'Converted' ? 'bg-green-100 text-green-700' : 
                        ref.status === 'Pending' ? 'bg-amber-100 text-amber-700' : 
                        ref.status === 'Bonus Paid' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-700'
                      }`}>
                        {ref.status}
                      </div>
                    </div>
                    
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex justify-between items-center">
                      <div className="space-y-1">
                        <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest">Date Referred</p>
                        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600">
                          <Calendar size={14} className="text-slate-400" /> {ref.date}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest">Loyalty Bonus</p>
                        <p className="text-2xl font-black text-brand-600 tracking-tighter">₹{ref.bonusAmount.toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                ))}
                {referrals.length === 0 && (
                  <div className="col-span-full flex flex-col items-center justify-center py-20 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200 text-slate-400">
                    <Gift size={64} className="mb-4 opacity-10" />
                    <p className="text-lg font-bold">No referrals yet</p>
                    <p className="text-sm italic">Start adding referrals to track loyalty bonuses</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'docs' && (
           <div className="p-6 space-y-8">
             
             {/* Client Specific Documents */}
             <div>
               <h3 className="text-sm font-semibold text-slate-800 mb-4 flex items-center">
                 <User size={16} className="mr-2 text-brand-500" /> Documents & Agreements
               </h3>
               
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                 {docs.filter(d => d.clientId === client?.id).map(doc => (
                   <div key={doc.id} className="relative p-4 border border-slate-200 rounded-xl bg-white hover:border-brand-300 transition-all flex items-center gap-3 group">
                     {/* Hover Overlay */}
                     <div className="absolute inset-0 bg-slate-900/60 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 z-10">
                       <button 
                         onClick={() => handleViewDoc(doc)}
                         className="px-3 py-1.5 bg-white text-slate-800 text-xs font-bold rounded-lg hover:bg-brand-50 transition-colors"
                       >
                         View Online
                       </button>
                       <button 
                         onClick={() => handleDownloadDoc(doc)}
                         className="px-3 py-1.5 bg-brand-600 text-white text-xs font-bold rounded-lg hover:bg-brand-700 transition-colors"
                       >
                         Download
                       </button>
                       <button 
                         onClick={() => handleDeleteDoc(doc.id)}
                         className="p-1.5 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                       >
                         <Trash2 size={16} />
                       </button>
                     </div>

                     <div className={`p-2 rounded-lg ${doc.type === 'pdf' ? 'bg-red-50 text-red-500' : 'bg-blue-50 text-blue-500'}`}>
                       <FileText size={24} />
                     </div>
                     <div className="overflow-hidden">
                       <p className="text-sm font-bold text-slate-800 truncate" title={doc.name}>{doc.name}</p>
                       <p className="text-[10px] text-slate-400">{doc.date} • {doc.size}</p>
                     </div>
                   </div>
                 ))}
                 
                 {docs.filter(d => d.clientId === client?.id).length === 0 && (
                   <div className="col-span-full text-center text-slate-500 py-12 border-2 border-dashed border-slate-100 rounded-xl">
                     <FileText size={48} className="mx-auto mb-4 text-slate-300" />
                     <p className="font-medium">No documents found for this client</p>
                     <p className="text-sm text-slate-400">Upload agreements, ID proofs, or receipts.</p>
                   </div>
                 )}
               </div>
               
               <input 
                 type="file" 
                 ref={fileInputRef} 
                 className="hidden" 
                 multiple 
                 onChange={handleFileUpload}
               />
               
               <button 
                 onClick={() => fileInputRef.current?.click()}
                 className="w-full py-3 bg-brand-50 border border-brand-100 text-brand-600 rounded-xl hover:bg-brand-100 font-bold text-sm flex items-center justify-center transition-all"
               >
                 <Upload size={18} className="mr-2" /> Upload New Document
               </button>
             </div>

           </div>
        )}
      </div>

      {/* Manage Property Modal */}
      {showManageModal && selectedInvestment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-fade-in">
            <div className="bg-brand-600 p-6 text-white flex justify-between items-center">
              <h3 className="font-bold text-lg flex items-center gap-2">
                <Settings size={20} /> Manage Property
              </h3>
              <button onClick={() => setShowManageModal(false)} className="hover:bg-white/20 p-1 rounded-full transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 mb-4">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Property Details</p>
                <p className="font-bold text-slate-800">
                  {allProperties.find(p => p.id === selectedInvestment.propertyId)?.title}
                </p>
                <p className="text-sm text-slate-600">
                  Unit: {allProperties.find(p => p.id === selectedInvestment.propertyId)?.inventory?.find(pl => pl.id === selectedInvestment.plotId)?.plotNumber || 'N/A'}
                </p>
              </div>

              <div className="grid grid-cols-1 gap-3">
                <button 
                  onClick={handleAddNewPlot}
                  className="flex items-center gap-4 p-4 rounded-xl border border-slate-200 hover:border-brand-500 hover:bg-brand-50 transition-all text-left group"
                >
                  <div className="w-10 h-10 bg-brand-100 rounded-full flex items-center justify-center text-brand-600 group-hover:scale-110 transition-transform">
                    <Plus size={20} />
                  </div>
                  <div>
                    <p className="font-bold text-slate-800 text-sm">Add New Plot</p>
                    <p className="text-[10px] text-slate-500">Book another unit in the same project</p>
                  </div>
                </button>

                <button 
                  onClick={handleTransfer}
                  className="flex items-center gap-4 p-4 rounded-xl border border-slate-200 hover:border-indigo-500 hover:bg-indigo-50 transition-all text-left group"
                >
                  <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 group-hover:scale-110 transition-transform">
                    <RefreshCw size={20} />
                  </div>
                  <div>
                    <p className="font-bold text-slate-800 text-sm">Property Transfer</p>
                    <p className="text-[10px] text-slate-500">Transfer this plot to another client</p>
                  </div>
                </button>

                <button 
                  onClick={() => setShowCancelConfirmation(true)}
                  className="flex items-center gap-4 p-4 rounded-xl border border-slate-200 hover:border-red-500 hover:bg-red-50 transition-all text-left group"
                >
                  <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center text-red-600 group-hover:scale-110 transition-transform">
                    <Trash2 size={20} />
                  </div>
                  <div>
                    <p className="font-bold text-slate-800 text-sm">Property Cancellation</p>
                    <p className="text-[10px] text-slate-500">Cancel booking with 10% fee</p>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cancellation Confirmation Modal */}
      {showCancelConfirmation && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-bounce-in">
            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle size={32} />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">Confirm Cancellation</h3>
              <p className="text-sm text-slate-500 mb-6">
                Are you sure you want to cancel this property? 
                <br />
                <span className="font-bold text-red-600">A 10% cancellation fee of the current balance will be applied.</span>
              </p>
              
              <div className="flex gap-3">
                <button 
                  onClick={() => setShowCancelConfirmation(false)}
                  className="flex-1 px-4 py-3 rounded-xl font-bold text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  No, Keep it
                </button>
                <button 
                  onClick={handleCancellation}
                  className="flex-1 px-4 py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-all shadow-lg shadow-red-600/20"
                >
                  Yes, Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add New Property Modal */}
      {showAddPropertyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-fade-in">
            <div className="bg-brand-600 p-6 text-white flex justify-between items-center">
              <h3 className="font-bold text-lg flex items-center gap-2">
                <Building size={20} /> Add Another Property to Portfolio
              </h3>
              <button onClick={() => setShowAddPropertyModal(false)} className="hover:bg-white/20 p-1 rounded-full transition-colors">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1 ml-1">Select Project</label>
                  <select 
                    className="w-full p-3 bg-white border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-brand-500 text-sm"
                    value={newPropertyForm.propertyId}
                    onChange={(e) => {
                      const propId = e.target.value;
                      const prop = allProperties.find(p => p.id === propId);
                      setSelectedProperty(prop || null);
                      setNewPropertyForm({ ...newPropertyForm, propertyId: propId, plotId: '' });
                    }}
                  >
                    <option value="">-- Choose Project --</option>
                    {allProperties.map(p => (
                      <option key={p.id} value={p.id}>{p.title} ({p.locality})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1 ml-1">Select Plot / Unit</label>
                  <select 
                    className="w-full p-3 bg-white border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-brand-500 text-sm"
                    value={newPropertyForm.plotId}
                    onChange={(e) => setNewPropertyForm({ ...newPropertyForm, plotId: e.target.value })}
                    disabled={!selectedProperty}
                  >
                    <option value="">-- Choose Plot --</option>
                    {selectedProperty?.inventory?.filter((p: any) => p.status === 'Available').map((p: any) => (
                      <option key={p.id} value={p.id}>Plot No. {p.plotNumber} ({p.size} sqft)</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1 ml-1">Total Sale Value (₹)</label>
                  <input 
                    type="number"
                    className="w-full p-3 bg-white border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-brand-500 text-sm font-bold"
                    value={newPropertyForm.totalAmount}
                    onChange={(e) => setNewPropertyForm({ ...newPropertyForm, totalAmount: e.target.value })}
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1 ml-1">Booking Date</label>
                  <input 
                    type="date"
                    className="w-full p-3 bg-white border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-brand-500 text-sm"
                    onChange={(e) => {
  const date = e.target.value;
  const day = getDayName(date);

  setNewPropertyForm({
    ...newPropertyForm,
    bookingDate: date,
    bookingDay: day
  });
}}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1 ml-1">Token Amount (₹)</label>
                  <input 
                    type="number"
                    className="w-full p-3 bg-white border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-brand-500 text-sm font-bold"
                    value={newPropertyForm.tokenAmount}
                    onChange={(e) => setNewPropertyForm({ ...newPropertyForm, tokenAmount: e.target.value })}
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1 ml-1">Payment Mode</label>
                  <select 
                    className="w-full p-3 bg-white border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-brand-500 text-sm"
                    value={newPropertyForm.paymentMode}
                    onChange={(e) => setNewPropertyForm({ ...newPropertyForm, paymentMode: e.target.value })}
                  >
                    <option value="Cash">Cash</option>
                    <option value="Cheque">Cheque</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="UPI">UPI / Online</option>
                    <option value="RTGS/NEFT">RTGS / NEFT</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button 
                  onClick={() => setShowAddPropertyModal(false)}
                  className="flex-1 px-4 py-3 rounded-xl font-bold text-slate-600 hover:bg-slate-100 transition-colors text-sm"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleAddPropertySubmit}
                  disabled={!newPropertyForm.propertyId || !newPropertyForm.plotId || !newPropertyForm.totalAmount}
                  className="flex-1 px-4 py-3 bg-brand-600 text-white rounded-xl font-bold hover:bg-brand-700 transition-all shadow-lg shadow-brand-600/20 text-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:shadow-none"
                >
                  <Check size={18} /> Add Property to Client
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal with Agreement Options */}
      {justAddedProperty && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-bounce-in">
            <div className="bg-emerald-600 p-8 text-white text-center">
              <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check size={40} className="text-white" />
              </div>
              <h3 className="text-2xl font-black mb-2">Property Added Successfully!</h3>
              <p className="opacity-90 font-medium">The property has been added to {client.name}'s portfolio and a ledger entry has been created.</p>
            </div>
            
            <div className="p-8 space-y-4">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest text-center mb-4">What would you like to do next?</p>
              
              <div className="grid grid-cols-1 gap-3">
                <button 
                  onClick={() => {
                    setPreviewType('agreement');
                    setSelectedLang(null);
                  }}
                  className="flex items-center justify-between p-4 rounded-2xl border-2 border-emerald-100 bg-emerald-50/50 hover:bg-emerald-50 hover:border-emerald-500 transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-emerald-100 rounded-lg text-emerald-600 group-hover:scale-110 transition-transform">
                      <FileText size={20} />
                    </div>
                    <div className="text-left">
                      <p className="font-bold text-slate-800">Generate Sale Agreement</p>
                      <p className="text-[10px] text-slate-500">Full legal format for {justAddedProperty.projectName}</p>
                    </div>
                  </div>
                  <ArrowRight size={18} className="text-emerald-400" />
                </button>

                <button 
                  onClick={() => {
                    setPreviewType('token');
                    setSelectedLang(null);
                  }}
                  className="flex items-center justify-between p-4 rounded-2xl border-2 border-indigo-100 bg-indigo-50/50 hover:bg-indigo-50 hover:border-indigo-500 transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-100 rounded-lg text-indigo-600 group-hover:scale-110 transition-transform">
                      <CreditCard size={20} />
                    </div>
                    <div className="text-left">
                      <p className="font-bold text-slate-800">Generate Token Receipt</p>
                      <p className="text-[10px] text-slate-500">Booking confirmation for ₹{Number(justAddedProperty.tokenAmount).toLocaleString()}</p>
                    </div>
                  </div>
                  <ArrowRight size={18} className="text-indigo-400" />
                </button>

                <button 
                  onClick={() => setJustAddedProperty(null)}
                  className="w-full py-4 text-slate-500 font-bold text-sm hover:text-slate-800 transition-colors"
                >
                  Close and Return to Profile
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Language Selection Modal */}
      {previewType && !selectedLang && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-scale-in">
            <div className="p-8 text-center">
              <div className="w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-4 text-indigo-600">
                <Globe size={32} />
              </div>
              <h3 className="text-xl font-black text-slate-800 mb-2">Select Language</h3>
              <p className="text-sm text-slate-500 mb-8">Choose the language for your {previewType === 'agreement' ? 'Sale Agreement' : 'Token Receipt'}</p>
              
              <div className="grid grid-cols-1 gap-3">
                {[
                  { id: 'en', label: 'English', sub: 'Standard Professional' },
                  { id: 'hi', label: 'Hindi (हिंदी)', sub: 'Official Translation' },
                  { id: 'mr', label: 'Marathi (मराठी)', sub: 'Regional Format' }
                ].map((lang) => (
                  <button
                    key={lang.id}
                    onClick={() => setSelectedLang(lang.id as any)}
                    className="flex items-center justify-between p-4 rounded-2xl border-2 border-slate-100 hover:border-indigo-500 hover:bg-indigo-50 transition-all group"
                  >
                    <div className="text-left">
                      <p className="font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">{lang.label}</p>
                      <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest">{lang.sub}</p>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-all">
                      <ArrowRight size={16} />
                    </div>
                  </button>
                ))}
              </div>
              
              <button 
                onClick={() => setPreviewType(null)}
                className="mt-6 text-slate-400 font-bold text-sm hover:text-slate-600 transition-colors"
              >
                Go Back
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Document Preview */}
      {previewType && selectedLang && (
        <AgreementPreview 
          data={justAddedProperty || {}} 
          type={previewType} 
          language={selectedLang}
          onClose={() => {
            setPreviewType(null);
            setSelectedLang(null);
          }} 
        />
      )}
      {/* Document Preview Modal */}
      <DocumentViewer doc={previewDoc} onClose={() => setPreviewDoc(null)} />

      {showStatementPreview && client && (
        <StatementPrintView
          open={showStatementPreview}
          onClose={() => setShowStatementPreview(false)}
          title="Account Ledger"
          subtitle={`Customer Statement - ${client.name}`}
          partyName={client.name}
          partyDetails={`${client.phone}\n${client.address || ''}\n${client.district || ''}`}
          type="ledger"
          data={{
            transactions: sortedTransactions,
            totals: {
              debit: sortedTransactions.filter(t => t.type === TransactionType.DEBIT).reduce((acc, t) => acc + t.amount, 0),
              credit: sortedTransactions.filter(t => t.type === TransactionType.CREDIT).reduce((acc, t) => acc + t.amount, 0),
              balance: (client.totalContractValue || 0) - sortedTransactions.filter(t => t.type === TransactionType.CREDIT).reduce((acc, t) => acc + t.amount, 0)
            }
          }}
        />
      )}
    </div>
  );
};

// Helper Component for Info Fields
const InfoField = ({ label, value, isEditing, editValue, onChange, icon: Icon, type = "text", placeholder, options }: any) => (
  <div className="space-y-1">
    <p className="text-xs text-slate-400 uppercase font-semibold flex items-center">
      {Icon && <Icon size={12} className="mr-1" />} {label}
    </p>
    {!isEditing ? (
      <p className="text-sm text-slate-700 font-medium truncate min-h-[20px]">{value || <span className="text-slate-300 italic">Not set</span>}</p>
    ) : type === 'select' && options ? (
      <select
        className="text-sm border border-slate-300 rounded px-2 py-1.5 w-full focus:ring-2 focus:ring-brand-500 outline-none bg-white"
        value={editValue || ''}
        onChange={e => onChange(e.target.value)}
      >
        <option value="">Select {label}</option>
        {options.map((opt: string) => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </select>
    ) : (
      <input 
        type={type}
        className="text-sm border border-slate-300 rounded px-2 py-1.5 w-full focus:ring-2 focus:ring-brand-500 outline-none bg-white" 
        value={editValue || ''} 
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder || label}
      />
    )}
  </div>
);
