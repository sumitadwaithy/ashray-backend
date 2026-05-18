
import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { Mail, Phone, MapPin, FileText, Activity, User, TrendingUp, TrendingDown, CreditCard, Building2, Landmark, Users, Briefcase, Upload, Download, Trash2, Globe, RefreshCw, Edit2 } from 'lucide-react';
import { dbService } from '../services/db';
import { Investor, Transaction, Doc, PropertyMarketUpdate, TransactionType, TransactionCategory } from '../types';
import { TransactionTable, DocumentViewer } from '../components/Shared';
import { handleDownloadDoc } from '../components/docUtils';
import { StatementPrintView } from '../components/StatementTemplate';
import { Accounting } from '../services/accounting';
import { sortTransactions, SortOrder } from '../utils/sorting';
import { InvestorEngine } from '../services/investorEngine';

export const InvestorDetails: React.FC = () => {
  const { id } = useParams();
  const [investor, setInvestor] = useState<Investor | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [sortOrder, setSortOrder] = useState<SortOrder>('newest');
  const [docs, setDocs] = useState<Doc[]>([]);
  const [marketUpdates, setMarketUpdates] = useState<PropertyMarketUpdate[]>([]);
  const [activeTab, setActiveTab] = useState<'info' | 'docs'>('info');
  const [isSyncing, setIsSyncing] = useState(false);
  const [previewDoc, setPreviewDoc] = useState<Doc | null>(null);
  const [showPrintPreview, setShowPrintPreview] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  useEffect(() => {
    fetchData();
  }, [id, sortOrder]);

  const fetchData = async () => {
    const investors = await dbService.getInvestors();
    const inv = investors.find(i => i.id === id);
    if (!inv) return;

    const txs = await dbService.getTransactions();
    const invTxs = txs.filter(t => t.investorId === id);
    
    const totalInterestAccrued = invTxs
      .filter(t => t.type === TransactionType.CREDIT && t.category === TransactionCategory.INTEREST_ACCRUAL)
      .reduce((sum, t) => sum + t.amount, 0);

    const totalReturns = invTxs
      .filter(t => t.type === TransactionType.DEBIT)
      .reduce((sum, t) => sum + t.amount, 0);

    const updatedInvestor = {
      ...inv,
      totalInterestAccrued,
      totalReturns
    } as Investor;

    await dbService.saveInvestor(updatedInvestor);

    setInvestor(updatedInvestor);
    setTransactions(sortTransactions(invTxs, sortOrder));

    const allDocs = await dbService.getDocs();
    setDocs(allDocs.filter(d => d.investorId === id && d.type !== 'virtual' && d.category !== 'REPORT'));

    const updates = await dbService.getPropertyMarketUpdates();
    setMarketUpdates(updates);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || !investor) return;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      // Read file as base64
      const reader = new FileReader();
      reader.onload = async (event) => {
        const base64Data = event.target?.result as string;
        
        const newDoc: Doc = {
          id: `doc_${Date.now()}_${i}`,
          name: file.name,
          date: new Date().toISOString().split('T')[0],
          size: `${(file.size / (1024 * 1024)).toFixed(2)} MB`,
          type: file.type.includes('pdf') ? 'pdf' : 'img',
          synced: false,
          category: 'INVESTOR',
          investorId: investor.id,
          propertyId: investor.investedPropertyId,
          fileData: base64Data
        };
        
        await dbService.saveDoc(newDoc);
        fetchData();
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDeleteDoc = async (docId: string) => {
    if (window.confirm('Are you sure you want to delete this document?')) {
      await dbService.deleteDoc(docId);
      fetchData();
    }
  };

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      await dbService.syncToWebsite();
      alert('Investor data synced to website successfully!');
    } catch (error) {
      alert('Failed to sync to website. Check console for details.');
    } finally {
      setIsSyncing(false);
    }
  };

  if (!investor) return <div className="p-8">Loading...</div>;

  const marketValuation = InvestorEngine.calculateValuation(investor, marketUpdates);
  const actualROI = InvestorEngine.calculateReturns(investor, marketValuation);

  // Calculate ROI Percentage for display (Safe Math)
  const projectedRoi = investor.totalInvested > 0 
    ? ((investor.totalInterestAccrued / investor.totalInvested) * 100).toFixed(1) 
    : '0';

  return (
    <div className="space-y-6">
      {/* Main Profile Card */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        
        {/* Header */}
        <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/30">
           <div className="flex items-center flex-1">
             <div className="w-20 h-20 bg-brand-600 rounded-2xl flex items-center justify-center text-2xl font-black text-white mr-6 shadow-xl shadow-brand-200 rotate-3">
               {investor.title} {(investor.name || '??').substring(0, 2).toUpperCase()}
             </div>
             <div>
               <div className="flex items-center gap-3 mb-1">
                 <h1 className="text-3xl font-black text-slate-900 tracking-tight">{investor.title} {investor.name}</h1>
                 <span className={`text-[10px] px-2.5 py-1 rounded-full font-black uppercase tracking-widest ${investor.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
                   {investor.status}
                 </span>
               </div>
               <div className="flex items-center space-x-4">
                  <span className="text-[11px] text-slate-400 font-bold uppercase tracking-widest">ID: {investor.id}</span>
                  <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                  <span className="text-[11px] text-slate-400 font-bold uppercase tracking-widest flex items-center">
                    <Mail size={12} className="mr-1.5" /> {investor.email || 'N/A'}
                  </span>
                  <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                  <span className="text-[11px] text-slate-400 font-bold uppercase tracking-widest flex items-center">
                    <Phone size={12} className="mr-1.5" /> {investor.countryCode} {investor.phone}
                  </span>
               </div>
             </div>
           </div>
           
           <div className="flex flex-col items-end gap-3">
              <div className="text-right">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Portfolio Type</p>
                <div className="flex items-center justify-end gap-2">
                  <span className="px-3 py-1.5 bg-slate-900 text-white rounded-lg text-xs font-black uppercase tracking-tighter">
                    {investor.propertyType || 'Standard'}
                  </span>
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
              </div>
            </div>
        </div>

        {/* Dynamic Summary Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-slate-100 border-b border-slate-100">
           <div className="p-4 text-center">
             <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Principal</p>
             <p className="text-xl font-black text-slate-900 tracking-tighter">{Accounting.formatIndian(investor.totalInvested)}</p>
           </div>
           <div className="p-4 text-center">
             <p className="text-[10px] font-bold text-brand-600 uppercase tracking-widest mb-1">Net Gain/Loss</p>
             <p className={`text-xl font-black tracking-tighter ${actualROI.actualReturnAmount >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
               {actualROI.actualReturnAmount >= 0 ? '+' : ''}{Accounting.formatIndian(actualROI.actualReturnAmount)}
             </p>
           </div>
           <div className="p-4 text-center">
             <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Current ROI</p>
             <p className="text-xl font-black text-slate-900 tracking-tighter">{actualROI.actualReturnPercentage.toFixed(1)}%</p>
           </div>
           <div className="p-4 text-center">
             <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Expectation</p>
             <p className="text-xl font-black text-slate-900 tracking-tighter">{investor.interestRate}% <span className="text-[10px] text-slate-400">p.a</span></p>
           </div>
        </div>

        {/* Detailed Info */}
        <div className="divide-y divide-slate-100 bg-white">
          
          <div className="p-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
              
              {/* Left Column: Personal & Identity */}
              <div className="space-y-8">
                <div>
                  <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest mb-6 flex items-center bg-slate-50 p-2 rounded-lg">
                    <User size={14} className="mr-2 text-brand-600" /> Personal Identity
                  </h3>
                  <div className="space-y-5">
                    <div className="flex justify-between items-start">
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-tight">Guardian Name</span>
                      <span className="text-sm font-bold text-slate-700 text-right">{investor.fatherName || '-'}</span>
                    </div>
                    <div className="flex justify-between items-start">
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-tight">Occupation</span>
                      <span className="text-sm font-bold text-slate-700 text-right">{investor.occupation || '-'}</span>
                    </div>
                    <div className="flex justify-between items-start">
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-tight">Gender / Age</span>
                      <span className="text-sm font-bold text-slate-700 text-right">{investor.gender} • {investor.age} Yrs</span>
                    </div>
                    <div className="flex justify-between items-start text-xs">
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-tight">Birth Date</span>
                      <span className="font-mono text-slate-500">{investor.dob || '-'}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest mb-6 flex items-center bg-slate-50 p-2 rounded-lg">
                    <MapPin size={14} className="mr-2 text-brand-600" /> Permanent Residence
                  </h3>
                  <div className="space-y-5">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight block mb-1">Full Address</span>
                      <p className="text-sm font-bold text-slate-700 leading-relaxed">{investor.address}</p>
                      <p className="text-sm font-bold text-slate-700">{investor.district}, {investor.state} - {investor.pincode}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest mb-6 flex items-center bg-slate-50 p-2 rounded-lg">
                    <FileText size={14} className="mr-2 text-brand-600" /> Statutory KYC
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <span className="text-[9px] font-bold text-slate-400 uppercase block mb-1">PAN Card</span>
                      <span className="text-xs font-black text-slate-800 font-mono tracking-widest">{investor.pan || '-'}</span>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <span className="text-[9px] font-bold text-slate-400 uppercase block mb-1">GST Number</span>
                      <span className="text-xs font-black text-slate-800 font-mono tracking-widest">{investor.gst || investor.gstin || '-'}</span>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 col-span-2">
                      <span className="text-[9px] font-bold text-slate-400 uppercase block mb-1">Aadhaar Universal ID</span>
                      <span className="text-xs font-black text-slate-800 font-mono tracking-widest">{investor.aadhaar || '-'}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Middle Column: Business & Investment */}
              <div className="space-y-8">
                <div>
                  <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest mb-6 flex items-center bg-slate-50 p-2 rounded-lg">
                    <Briefcase size={14} className="mr-2 text-brand-600" /> Professional Location
                  </h3>
                  <div className="space-y-5">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight block mb-1">Office Address</span>
                      <p className="text-sm font-bold text-slate-700 leading-relaxed">{investor.officeAddress || '-'}</p>
                      {investor.officeLocality && (
                        <p className="text-sm font-bold text-slate-700">
                          {investor.officeLocality}{investor.officeDistrict ? `, ${investor.officeDistrict}` : ''}
                        </p>
                      )}
                      {(investor.officeState || investor.officePincode) && (
                        <p className="text-sm font-bold text-slate-700">
                          {investor.officeState} {investor.officePincode ? `- ${investor.officePincode}` : ''}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest mb-6 flex items-center bg-slate-50 p-2 rounded-lg">
                    <Landmark size={14} className="mr-2 text-brand-600" /> Settlement Account
                  </h3>
                  <div className="bg-slate-900 text-white p-5 rounded-3xl shadow-xl shadow-slate-200 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16"></div>
                    <p className="text-[10px] font-black tracking-widest mb-6 opacity-60">PRIMARY BANK</p>
                    <p className="text-lg font-black tracking-widest mb-1 italic uppercase">{investor.bankName || 'NOT SPECIFIED'}</p>
                    <p className="text-xl font-bold font-mono tracking-tighter mb-4">{investor.accountNumber || '**** **** **** ****'}</p>
                    <div className="flex justify-between items-end border-t border-white/10 pt-4">
                      <div>
                        <p className="text-[8px] font-bold opacity-40 uppercase mb-0.5">IFSC Code</p>
                        <p className="text-xs font-bold font-mono">{investor.ifscCode || '-'}</p>
                      </div>
                      <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center">
                        <CreditCard size={16} className="opacity-60" />
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest mb-6 flex items-center bg-slate-50 p-2 rounded-lg">
                    <Globe size={14} className="mr-2 text-brand-600" /> Active Asset Link
                  </h3>
                  <div className="p-4 bg-red-50 border border-red-100 rounded-2xl">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-red-600 shadow-sm border border-red-200">
                        {investor.propertyType === 'Agricultural Land' ? <Globe size={20} /> : <Building2 size={20} />}
                      </div>
                      <div className="flex-1 overflow-hidden">
                        <p className="text-[9px] font-black text-red-600 uppercase tracking-widest">Linked {investor.propertyType === 'Agricultural Land' ? 'Land' : 'Project'}</p>
                        <p className="text-sm font-black text-slate-900 truncate tracking-tight">{investor.investedPropertyName}</p>
                      </div>
                    </div>
                    {investor.selectedPlotId && (
                      <div className="bg-white/80 p-2 rounded-lg border border-red-100 flex justify-between items-center">
                        <span className="text-[10px] font-bold text-slate-500 uppercase">Unit / Plot Ref:</span>
                        <span className="text-xs font-black text-slate-900 bg-red-600 text-white px-2 py-0.5 rounded">
                          {(investor.selectedPlotId || '').split('_').pop() || '#N/A'}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Right Column: Nominees & Admin Support */}
              <div className="space-y-8">
                <div>
                  <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest mb-6 flex items-center bg-slate-50 p-2 rounded-lg">
                    <Users size={14} className="mr-2 text-brand-600" /> Nominee Protocol
                  </h3>
                  <div className="space-y-4">
                    {investor.nominees && investor.nominees.length > 0 ? (
                      investor.nominees.map((nominee, idx) => (
                        <div key={idx} className="p-4 rounded-2xl border border-slate-100 bg-slate-50/50">
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3 pb-1 border-b border-slate-100">
                            {idx === 0 ? 'Primary Beneficiary' : `Nominee ${idx + 1}`}
                          </p>
                          <div className="space-y-2.5">
                            <div className="flex justify-between items-center">
                              <span className="text-[10px] font-bold text-slate-500">Full Name</span>
                              <span className="text-xs font-bold text-slate-900">{nominee.name || '-'}</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-[10px] font-bold text-slate-500">Relationship / Age</span>
                              <span className="text-xs font-bold text-slate-900">{nominee.relation || 'N/A'} • {nominee.age || '-'} Yrs</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-[10px] font-bold text-slate-500">Aadhaar (Nom)</span>
                              <span className="text-[10px] font-mono font-bold text-slate-700">{nominee.aadhaar || '-'}</span>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-4 rounded-2xl border border-slate-100 bg-slate-50/50">
                        <p className="text-[10px] text-slate-500 italic">No nominees added</p>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest mb-6 flex items-center bg-slate-50 p-2 rounded-lg">
                    <Users size={14} className="mr-2 text-brand-600" /> Administrative Assignment
                  </h3>
                  <div className="space-y-4">
                    <div className="p-4 rounded-2xl border border-slate-100 bg-slate-50/50">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-slate-900 shadow-sm border border-slate-200">
                          <Building2 size={20} />
                        </div>
                        <div>
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Mapped Office Branch</p>
                          <p className="text-xs font-bold text-slate-900">{investor.assignedOfficeAddress || 'Main Head Office'}</p>
                        </div>
                      </div>
                      <div className="space-y-3 pt-3 border-t border-slate-100">
                        <div className="flex justify-between">
                          <span className="text-[10px] font-bold text-slate-400 uppercase">Assigned Manager</span>
                          <span className="text-xs font-black text-slate-800">{investor.managerName || 'DIRECT'}</span>
                        </div>
                        {investor.managerPosition && (
                           <div className="flex justify-between">
                            <span className="text-[10px] font-bold text-slate-400 uppercase">Position</span>
                            <span className="text-xs font-bold text-slate-600">{investor.managerPosition}</span>
                          </div>
                        )}
                        {investor.managerPhone && (
                           <div className="flex justify-between">
                            <span className="text-[10px] font-bold text-slate-400 uppercase">Manager Phone</span>
                            <span className="text-xs font-bold text-slate-600">{investor.managerCountryCode} {investor.managerPhone}</span>
                          </div>
                        )}
                        <div className="flex justify-between pt-2 border-t border-slate-100/50">
                          <span className="text-[10px] font-bold text-slate-400 uppercase">File Location</span>
                          <span className="text-[10px] bg-slate-900 text-white px-2 py-0.5 rounded-full font-bold uppercase tracking-widest">
                            {investor.categoryName || 'Default'} / {investor.folderName || 'Root'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>

          <div className="p-6 bg-slate-50/50">
             <h3 className="text-sm font-semibold text-slate-800 mb-4 flex items-center">
               <Activity size={16} className="mr-2 text-brand-500" /> Investment Performance
             </h3>
             <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                
                <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200">
                   <p className="text-xs text-slate-400 font-bold uppercase mb-1 flex items-center">
                     <TrendingUp size={14} className="mr-1 text-slate-600"/> Principal Invested
                   </p>
                   <p className="text-xl font-bold text-slate-800">{Accounting.formatIndian(investor.totalInvested)}</p>
                   <p className="text-[10px] text-slate-500 mt-1 italic">{Accounting.formatIndianWords(investor.totalInvested)}</p>
                </div>

                <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200">
                   <p className="text-xs text-slate-400 font-bold uppercase mb-1 flex items-center">
                     <Building2 size={14} className="mr-1 text-brand-600"/> Current Market Value
                   </p>
                   <p className="text-xl font-bold text-brand-700">{Accounting.formatIndian(marketValuation)}</p>
                   <p className={`text-[10px] font-bold mt-1 ${actualROI.actualReturnAmount >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                     {actualROI.actualReturnAmount >= 0 ? 'Profit: ' : 'Loss: '} 
                     {Accounting.formatIndian(Math.abs(actualROI.actualReturnAmount))} ({actualROI.actualReturnPercentage.toFixed(1)}%)
                   </p>
                </div>
                
                <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200">
                   <p className="text-xs text-slate-400 font-bold uppercase mb-1 flex items-center">
                     <TrendingUp size={14} className="mr-1 text-green-600"/> Interest Accrued
                   </p>
                   <p className="text-xl font-bold text-green-700">{Accounting.formatIndian(investor.totalInterestAccrued)}</p>
                   <p className="text-[10px] text-green-600 mt-1 italic">{projectedRoi}% Projected Yield</p>
                </div>
                
                <div className="bg-brand-600 p-4 rounded-lg shadow-sm border border-brand-700 text-white">
                   <p className="text-xs text-brand-100 font-bold uppercase mb-1 flex items-center">
                     <Activity size={14} className="mr-1"/> Portfolio Balance
                   </p>
                   <p className="text-xl font-bold">{Accounting.formatIndian(marketValuation + investor.totalInterestAccrued - investor.totalReturns)}</p>
                   <p className="text-[10px] opacity-80 mt-1">Market Value + Interest - Payouts</p>
                </div>
             </div>
          </div>

        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200">
        <button 
          onClick={() => setActiveTab('info')}
          className={`px-6 py-3 text-sm font-bold transition-all border-b-2 ${activeTab === 'info' ? 'border-brand-600 text-brand-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
        >
          Investment Info & Ledger
        </button>
        <button 
          onClick={() => setActiveTab('docs')}
          className={`px-6 py-3 text-sm font-bold transition-all border-b-2 ${activeTab === 'docs' ? 'border-brand-600 text-brand-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
        >
          Documents ({docs.length})
        </button>
      </div>

      {activeTab === 'info' ? (
        <div className="bg-white rounded-xl shadow-sm border border-slate-100">
          <div className="p-4 border-b border-slate-100 font-semibold text-slate-700 flex justify-between items-center">
            <div className="flex items-center">
              <FileText size={18} className="mr-2" /> Investment Ledger
            </div>
            <button 
              onClick={() => setSortOrder(prev => prev === 'newest' ? 'oldest' : 'newest')}
              className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-lg text-xs font-bold transition-all border border-slate-200"
            >
              <Activity size={14} className={sortOrder === 'newest' ? 'rotate-90' : '-rotate-90'} />
              {sortOrder === 'newest' ? 'Newest First' : 'Oldest First'}
            </button>
            <button 
              onClick={() => setShowPrintPreview(true)}
              className="flex items-center gap-2 px-3 py-1.5 bg-brand-600 text-white rounded-lg text-xs font-bold transition-all shadow-sm shadow-brand-100 hover:bg-brand-700"
            >
              <FileText size={14} />
              Print Statement
            </button>
          </div>
          <TransactionTable transactions={transactions} />
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-slate-800 flex items-center">
              <FileText size={20} className="mr-2 text-brand-500" /> Investor Documents
            </h3>
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition-all text-sm font-bold"
            >
              <Upload size={16} /> Upload Document
            </button>
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileUpload} 
              className="hidden" 
              multiple 
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {docs.map(doc => (
              <div key={doc.id} className="p-4 border border-slate-200 rounded-xl bg-white hover:border-brand-300 transition-all flex items-center justify-between group">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${doc.type === 'pdf' ? 'bg-red-50 text-red-500' : 'bg-blue-50 text-blue-500'}`}>
                    <FileText size={20} />
                  </div>
                  <div className="overflow-hidden">
                    <p className="text-sm font-bold text-slate-800 truncate" title={doc.name}>{doc.name}</p>
                    <p className="text-[10px] text-slate-400">{doc.date} • {doc.size}</p>
                  </div>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={() => setPreviewDoc(doc)}
                    className="p-1.5 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg"
                    title="View Document"
                  >
                    <FileText size={16} />
                  </button>
                  <button 
                    onClick={() => handleDownloadDoc(doc)}
                    className="p-1.5 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg"
                    title="Download"
                  >
                    <Download size={16} />
                  </button>
                  <button 
                    onClick={() => handleDeleteDoc(doc.id)}
                    className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                    title="Delete"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
            
            {docs.length === 0 && (
              <div className="col-span-full text-center text-slate-500 py-12 border-2 border-dashed border-slate-100 rounded-xl">
                <FileText size={48} className="mx-auto mb-4 text-slate-300" />
                <p className="font-medium">No documents found for this investor</p>
                <p className="text-sm text-slate-400">Upload investment agreements, PAN, or Aadhaar copies.</p>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-100 bg-slate-50/50">
          <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center">
            <Activity size={16} className="mr-2 text-brand-500" /> Market Valuation & Return Evidence
          </h3>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight mt-1 ml-6">
            Paper cuttings and return-related documentation will always be visible here.
          </p>
        </div>
        <div className="p-6 space-y-4">
          {marketUpdates
            .filter(u => u.propertyId === investor.investedPropertyId)
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
            .map(update => (
              <div key={update.id} className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${update.updateType === 'Appreciation' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                      {update.updateType === 'Appreciation' ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-800">{update.updateType}</p>
                      <p className="text-[10px] text-slate-400">{update.date}</p>
                    </div>
                  </div>
                  <span className={`text-sm font-black ${update.updateType === 'Appreciation' ? 'text-emerald-600' : 'text-red-600'}`}>
                    {update.valueModifier > 1 ? '+' : ''}{((update.valueModifier - 1) * 100).toFixed(1)}%
                  </span>
                </div>
                <p className="text-xs text-slate-600 mb-4">{update.description}</p>
                
                {update.attachments && update.attachments.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 mt-4 pt-4 border-t border-slate-200/50">
                    {update.attachments.map((base64, idx) => {
                      const isPdf = base64.startsWith('data:application/pdf');
                      return (
                        <div key={idx} className="relative group aspect-square">
                          {isPdf ? (
                            <button 
                              onClick={() => setPreviewDoc({
                                id: `update_doc_${update.id}_${idx}`,
                                name: `Paper Cutting ${idx + 1}`,
                                date: update.date,
                                size: '0 MB',
                                type: 'pdf',
                                fileData: base64,
                                category: 'PROPERTY'
                              } as any)}
                              className="w-full h-full flex flex-col items-center justify-center bg-white border-2 border-slate-200 rounded-xl hover:border-brand-400 hover:bg-brand-50 transition-all shadow-sm"
                            >
                              <FileText size={24} className="text-red-500 mb-1" />
                              <span className="text-[9px] font-black text-slate-500 uppercase">View PDF Proof</span>
                            </button>
                          ) : (
                            <button 
                              onClick={() => setPreviewDoc({
                                id: `update_doc_${update.id}_${idx}`,
                                name: `Market Evidence ${idx + 1}`,
                                date: update.date,
                                size: '0 MB',
                                type: 'img',
                                fileData: base64,
                                category: 'PROPERTY'
                              } as any)}
                              className="w-full h-full rounded-xl overflow-hidden border-2 border-slate-200 hover:border-brand-400 transition-all shadow-sm relative"
                            >
                              <img 
                                src={base64} 
                                className="w-full h-full object-cover" 
                                alt="Evidence" 
                                referrerPolicy="no-referrer"
                              />
                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                <FileText size={20} className="text-white" />
                              </div>
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}
          {marketUpdates.filter(u => u.propertyId === investor.investedPropertyId).length === 0 && (
            <div className="text-center py-12 text-slate-400 italic text-xs bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
              <FileText size={32} className="mx-auto mb-2 opacity-20" />
              No market updates or paper cuttings recorded for this property assets.
            </div>
          )}
        </div>
      </div>

      <DocumentViewer doc={previewDoc} onClose={() => setPreviewDoc(null)} />

      {showPrintPreview && (
        <StatementPrintView
          open={showPrintPreview}
          onClose={() => setShowPrintPreview(false)}
          title="Investment Account Statement"
          subtitle={`Portfolio Report: ${investor.name}`}
          type="ledger"
          partyName={investor.name}
          partyDetails={`${investor.phone}\n${investor.address}`}
          data={{
            transactions: transactions,
            totals: {
              debit: investor.totalReturns,
              credit: investor.totalInvested + investor.totalInterestAccrued,
              balance: marketValuation + investor.totalInterestAccrued - investor.totalReturns
            }
          }}
        />
      )}
    </div>
  );
};
