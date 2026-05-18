import React, { useState, useEffect } from 'react';
import { ArrowLeft, Printer, Receipt, Clock, Search } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { dbService } from '../services/db';
import { AppSettings, Transaction, TransactionType, PaymentMethod } from '../types';
import { ReceiptTemplate, ReceiptPrintView } from '../components/Receipt';

export const ReceiptGenerator: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [parties, setParties] = useState<any[]>([]);
  const [activeParties, setActiveParties] = useState<any[]>([]);
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [banks, setBanks] = useState<any[]>([]);
  const [showReceiptPrint, setShowReceiptPrint] = useState(false);
  const [pendingReceipts, setPendingReceipts] = useState<any[]>([]);
  const [pendingId, setPendingId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    amount: '',
    particulars: 'Payment Received',
    method: PaymentMethod.CASH,
    clientId: '',
    referenceId: 'MANUAL-' + Math.floor(Math.random() * 1000),
    isSplit: false,
    splitPayments: [
      { amount: '', method: PaymentMethod.CASH, bankId: '', reference: '' }
    ]
  });

  useEffect(() => {
    Promise.all([
      dbService.getClients(),
      dbService.getInvestors(),
      dbService.getKissans(),
      dbService.getStaff(),
      dbService.getLoans(),
      dbService.getSettings(),
      dbService.getTransactions(),
      dbService.getBanks()
    ]).then(([clients, investors, kissans, staff, loans, sets, transactions, bankProfiles]) => {
      setBanks(bankProfiles);
      const combined: any[] = [
        ...clients.map(c => ({ id: c.id, name: c.name, type: 'Client', phone: c.phone, category: 'Clients' })),
        ...investors.map(i => ({ id: i.id, name: i.name, type: 'Investor', phone: i.phone, category: 'Investors' })),
        ...kissans.flatMap(k => (k.owners || []).map(o => ({ 
          id: `${k.id}::${o.id}`, 
          name: `${k.landName} - ${o.name}`, 
          type: 'Kissan', 
          phone: o.phone || k.phone,
          category: 'Kissan'
        }))),
        ...staff.map(s => ({ id: s.id, name: s.name, type: 'Staff', phone: s.phone, category: 'Staff' })),
        ...loans.map(l => ({ id: l.id, name: l.borrowerName, type: l.loanType === 'GIVEN' ? 'Borrower' : 'Lender', phone: l.phone, category: 'Loans' }))
      ];

      // Calculate activity frequency from transactions
      const activityMap: Record<string, number> = {};
      const lastUpdateMap: Record<string, number> = {};
      
      transactions.forEach((tx: any) => {
        const partyId = tx.clientId || tx.investorId || tx.loanId || (tx.kissanId ? `${tx.kissanId}::${tx.ownerId}` : null);
        if (partyId) {
          activityMap[partyId] = (activityMap[partyId] || 0) + 1;
          lastUpdateMap[partyId] = Math.max(lastUpdateMap[partyId] || 0, new Date(tx.date).getTime());
        }
      });

      const processed = combined.map(p => ({
        ...p,
        lastUpdatedTime: lastUpdateMap[p.id] || 0,
        activityScore: (activityMap[p.id] || 0)
      }));

      setParties(processed);
      
      // Top 10 most recent profiles (by transaction date)
      const top10 = [...processed]
        .filter(p => p.lastUpdatedTime > 0)
        .sort((a, b) => b.lastUpdatedTime - a.lastUpdatedTime)
        .slice(0, 10);
      
      setActiveParties(top10);
      setSettings(sets);

      const searchParams = new URLSearchParams(location.search);
      const searchAmount = searchParams.get('amount');
      const searchDate = searchParams.get('date');
      const searchPayeeName = searchParams.get('payeeName');
      const searchPendingId = searchParams.get('pendingId');
      const searchPartyId = searchParams.get('partyId');
      const searchParticulars = searchParams.get('particulars');

      if (searchPendingId) {
        setPendingId(searchPendingId);
        // Don't mark as printed yet, wait for actual print
      }

      if (searchAmount || searchPayeeName) {
        setFormData(prev => ({
          ...prev,
          date: searchDate || prev.date,
          amount: searchAmount || prev.amount,
          clientId: searchPartyId || '',
          particulars: searchParticulars || 'Payment Received'
        }));
      } else if (location.state && location.state.transaction) {
        const tx = location.state.transaction as Transaction;
        setFormData({
          date: tx.date || new Date().toISOString().split('T')[0],
          amount: tx.amount.toString(),
          particulars: tx.particulars || 'Payment Received',
          method: tx.method || PaymentMethod.CASH,
          clientId: tx.clientId || tx.investorId || tx.kissanId || tx.loanId || tx.staffId || tx.bankId || '',
          referenceId: tx.referenceId || 'AUTO-' + Math.floor(Math.random() * 1000)
        });
        if (location.state.pendingId) {
          setPendingId(location.state.pendingId);
        }
      }

      // Filter stored pending receipts against valid users
      let stored = JSON.parse(localStorage.getItem('pending_receipts') || '[]');
      
      let modified = false;
      stored = stored.map((r: any) => {
        if (r.partyName && !r.payeeName) {
          modified = true;
          return { ...r, payeeName: r.partyName };
        }
        return r;
      });
      if (modified) localStorage.setItem('pending_receipts', JSON.stringify(stored));

      setPendingReceipts(stored.filter((r: any) => !r.printed));
    });

    const handleStorageChange = () => {
      const stored = JSON.parse(localStorage.getItem('pending_receipts') || '[]');
      setPendingReceipts(stored.filter((r: any) => !r.printed));
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [location.state, location.search]);

  const filteredParties = parties.filter(p => {
    const matchesSearch = (p.name || '').toLowerCase().includes((searchTerm || '').toLowerCase()) || 
                         (p.phone && p.phone.includes(searchTerm || ''));
    const matchesCategory = categoryFilter === 'All' || p.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const displayList = searchTerm ? filteredParties : (categoryFilter === 'All' ? activeParties : filteredParties);

  const selectedParty = parties.find(p => p.id === formData.clientId) || {};

  useEffect(() => {
    if (formData.isSplit) {
      const total = formData.splitPayments.reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0);
      if (total !== parseFloat(formData.amount)) {
        setFormData(prev => ({ ...prev, amount: total.toString() }));
      }
    }
  }, [formData.isSplit, formData.splitPayments, formData.amount]);

  const addSplitPayment = () => {
    setFormData({
      ...formData,
      splitPayments: [...formData.splitPayments, { amount: '', method: PaymentMethod.CASH, bankId: '', reference: '' }]
    });
  };

  const removeSplitPayment = (index: number) => {
    const updated = [...formData.splitPayments];
    updated.splice(index, 1);
    setFormData({ ...formData, splitPayments: updated });
  };

  const updateSplitPayment = (index: number, field: string, value: any) => {
    const updated = [...formData.splitPayments];
    updated[index] = { ...updated[index], [field]: value };
    setFormData({ ...formData, splitPayments: updated });
  };

  const currentTransaction: Transaction = {
    id: 'MANUAL',
    amount: Number(formData.amount),
    date: formData.date,
    particulars: formData.particulars,
    method: formData.method,
    referenceId: formData.referenceId,
    type: TransactionType.CREDIT,
    synced: false,
    balanceAfter: 0,
    partyName: selectedParty.name,
    isSplit: formData.isSplit,
    splitPayments: formData.splitPayments
  } as any;

  return (
    <div className="max-w-6xl mx-auto pb-10">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center">
          <Link to="/" className="p-2 mr-2 hover:bg-slate-200 rounded-full transition-colors">
            <ArrowLeft size={24} className="text-slate-600" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Receipt Assistant</h1>
            <p className="text-sm text-slate-500">Generate on-demand professional receipts for any party</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {pendingId && (
            <Link
              to="/pending-receipts"
              className="bg-emerald-100 border border-emerald-200 text-emerald-700 px-4 py-2 text-xs font-bold rounded-lg hover:bg-emerald-200"
            >
               Return to Pending Receipts Queue
            </Link>
          )}
          <div className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
            System Ready
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form */}
        <div className="lg:col-span-1 border-slate-100 h-fit space-y-6">
           <div className="bg-white p-8 rounded-2xl shadow-xl border border-slate-100 space-y-6">
             <div className="flex items-center gap-2 pb-4 border-b border-slate-50">
               <div className="w-10 h-10 bg-spiritual-maroon/10 rounded-xl flex items-center justify-center">
                 <Receipt size={24} className="text-spiritual-maroon" />
               </div>
               <h2 className="font-bold text-xl text-slate-800">Payment Details</h2>
             </div>

             {pendingReceipts.length > 0 && (
               <div className="bg-orange-50 border border-orange-100 rounded-xl p-3 mb-4">
                 <label className="block text-[10px] font-bold text-orange-600 uppercase tracking-widest mb-2 flex items-center gap-1">
                   <Clock size={12} /> Pending Receipts (Remind me later)
                 </label>
                 <div className="space-y-2">
                    {[...pendingReceipts].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5).map(pending => (
                     <button
                       key={pending.id}
                       onClick={() => {
                          setFormData({
                            ...formData,
                            date: pending.date,
                            amount: pending.amount.toString(),
                            clientId: pending.partyId || '',
                            particulars: 'Payment Received'
                          });
                          setPendingId(pending.id);
                       }}
                       className="w-full text-left bg-white border border-orange-200 hover:border-orange-400 p-2 rounded-lg transition-all group"
                     >
                       <div className="flex justify-between items-center">
                         <span className="text-xs font-bold text-slate-700 group-hover:text-orange-700">{pending.payeeName}</span>
                         <span className="text-[10px] font-bold text-orange-600">₹{pending.amount.toLocaleString('en-IN')}</span>
                       </div>
                       <div className="text-[9px] text-slate-400 mt-0.5">{pending.date}</div>
                     </button>
                   ))}
                   {pendingReceipts.length > 5 && (
                     <Link to="/pending-receipts" className="block text-center text-[10px] font-bold text-orange-500 hover:text-orange-700 mt-1">
                       View All {pendingReceipts.length} Pending
                     </Link>
                   )}
                 </div>
               </div>
             )}

             <div className="space-y-4">
               <div>
                 <label className="block text-sm font-bold text-slate-600 mb-1.5 flex justify-between items-center">
                   <span>Select Party</span>
                   {formData.clientId && (
                     <button 
                       onClick={() => setFormData({...formData, clientId: ''})}
                       className="text-[10px] text-red-500 hover:underline"
                     >
                       Clear Selection
                     </button>
                   )}
                 </label>
                 
                 <div className="relative">
                   {/* Search & Tabs */}
                   <div className="border border-slate-200 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-spiritual-maroon/20 focus-within:border-spiritual-maroon transition-all">
                     <div className="flex bg-slate-50 border-b border-slate-200 overflow-x-auto no-scrollbar">
                       {['All', 'Clients', 'Kissan', 'Staff', 'Investors', 'Loans'].map(cat => (
                         <button
                           key={cat}
                           type="button"
                           onClick={() => {
                             setCategoryFilter(cat);
                             setShowDropdown(true);
                           }}
                           className={`min-w-[70px] flex-1 py-2 text-[9px] font-bold uppercase tracking-wider transition-all whitespace-nowrap px-2 ${
                             categoryFilter === cat 
                               ? 'bg-white text-spiritual-maroon border-b-2 border-spiritual-maroon' 
                               : 'text-slate-400 hover:text-slate-600'
                           }`}
                         >
                           {cat}
                         </button>
                       ))}
                     </div>
                     <div className="relative">
                       <input 
                         type="text"
                         placeholder={selectedParty.name || "Search by name or phone..."}
                         value={searchTerm}
                         onFocus={() => setShowDropdown(true)}
                         onChange={(e) => {
                           setSearchTerm(e.target.value);
                           setShowDropdown(true);
                         }}
                         className="w-full pl-4 pr-10 py-3 bg-white text-sm outline-none placeholder:text-slate-300"
                       />
                       <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none">
                         <Search size={16} />
                       </div>
                     </div>
                   </div>

                   {/* Dropdown Results */}
                   {showDropdown && (
                     <>
                       <div 
                         className="fixed inset-0 z-10" 
                         onClick={(e) => {
                           e.stopPropagation();
                           setShowDropdown(false);
                         }}
                       />
                       <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 rounded-xl shadow-2xl z-20 max-h-80 overflow-y-auto">
                         <div className="p-2">
                           {!searchTerm && categoryFilter === 'All' && activeParties.length > 0 && (
                             <div className="px-3 py-2 text-[10px] font-black text-spiritual-maroon/40 uppercase tracking-widest border-b border-slate-50 mb-1">
                               Recently Active Profiles
                             </div>
                           )}
                           
                           {displayList.length > 0 ? (
                             <div className="grid grid-cols-1 gap-1">
                               {displayList.map(party => (
                                 <button
                                   key={party.id}
                                   type="button"
                                   onClick={() => {
                                     setFormData({...formData, clientId: party.id});
                                     setSearchTerm('');
                                     setShowDropdown(false);
                                   }}
                                   className={`w-full text-left p-3 rounded-lg flex items-center justify-between transition-all group ${
                                     formData.clientId === party.id 
                                       ? 'bg-spiritual-maroon text-white shadow-md' 
                                       : 'hover:bg-slate-50 text-slate-700'
                                   }`}
                                 >
                                   <div className="flex items-center gap-3">
                                     <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold ${
                                       formData.clientId === party.id ? 'bg-white/20' : 'bg-slate-100 text-slate-500'
                                     }`}>
                                       {party.type[0]}
                                     </div>
                                     <div>
                                       <div className="text-xs font-bold">{party.name}</div>
                                       <div className={`text-[10px] ${formData.clientId === party.id ? 'text-white/60' : 'text-slate-400'}`}>
                                         {party.type} • {party.phone || 'No phone'}
                                       </div>
                                     </div>
                                   </div>
                                   {party.activityScore > 0 && categoryFilter === 'All' && !searchTerm && (
                                      <div className={`text-[8px] px-2 py-0.5 rounded-full ${
                                        formData.clientId === party.id ? 'bg-white/20' : 'bg-orange-50 text-orange-600 font-bold'
                                      }`}>
                                        Active
                                      </div>
                                   )}
                                 </button>
                               ))}
                             </div>
                           ) : (
                             <div className="py-8 text-center">
                               <div className="text-slate-300 mb-2 flex justify-center"><Search size={24} /></div>
                               <p className="text-xs text-slate-400">No parties found matching your search</p>
                             </div>
                           )}
                         </div>
                       </div>
                     </>
                   )}
                 </div>
               </div>

               <div className="grid grid-cols-2 gap-4">
                 <div>
                   <label className="block text-sm font-bold text-slate-600 mb-1.5">Amount (₹)</label>
                   <input 
                     type="number" 
                     className="w-full border border-slate-200 rounded-xl px-4 py-3 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-spiritual-maroon/20 focus:border-spiritual-maroon outline-none transition-all font-mono font-bold"
                     placeholder="0.00"
                     value={formData.amount}
                     onChange={e => setFormData({...formData, amount: e.target.value})}
                   />
                 </div>
                 <div>
                   <label className="block text-sm font-bold text-slate-600 mb-1.5">Date</label>
                   <input 
                     type="date" 
                     className="w-full border border-slate-200 rounded-xl px-4 py-3 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-spiritual-maroon/20 focus:border-spiritual-maroon outline-none transition-all"
                     value={formData.date}
                     onChange={e => setFormData({...formData, date: e.target.value})}
                   />
                 </div>
               </div>

               <div>
                 <label className="block text-sm font-bold text-slate-600 mb-1.5">Particulars / Reason</label>
                 <textarea 
                    rows={2}
                    className="w-full border border-slate-200 rounded-xl px-4 py-3 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-spiritual-maroon/20 focus:border-spiritual-maroon outline-none transition-all resize-none"
                    placeholder="e.g. Token for Plot 102"
                    value={formData.particulars}
                    onChange={e => setFormData({...formData, particulars: e.target.value})}
                 />
               </div>

               <div>
                 <div className="flex items-center justify-between mb-1.5">
                   <label className="block text-sm font-bold text-slate-600">Payment Method</label>
                   <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Split Payment</span>
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, isSplit: !formData.isSplit })}
                        className={`w-10 h-5 rounded-full transition-all relative ${formData.isSplit ? 'bg-spiritual-maroon' : 'bg-slate-200'}`}
                      >
                        <div className={`absolute top-1 w-3 h-3 rounded-full bg-white transition-all ${formData.isSplit ? 'left-6' : 'left-1'}`}></div>
                      </button>
                   </div>
                 </div>

                 {!formData.isSplit ? (
                   <div className="grid grid-cols-2 gap-2">
                     {Object.values(PaymentMethod).slice(0, 4).map(m => (
                       <button
                         key={m}
                         type="button"
                         onClick={() => setFormData({...formData, method: m as PaymentMethod})}
                         className={`py-2 px-3 rounded-lg border text-xs font-bold transition-all ${
                           formData.method === m
                             ? 'bg-spiritual-maroon text-white border-spiritual-maroon shadow-lg'
                             : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                         }`}
                       >
                         {m}
                       </button>
                     ))}
                   </div>
                 ) : (
                   <div className="space-y-3 p-3 border border-slate-100 rounded-xl bg-slate-50/50">
                     {formData.splitPayments.map((split, index) => (
                       <div key={index} className="space-y-2 p-3 bg-white border border-slate-200 rounded-lg relative group shadow-sm">
                         {formData.splitPayments.length > 1 && (
                           <button
                             type="button"
                             onClick={() => removeSplitPayment(index)}
                             className="absolute -top-2 -right-2 w-5 h-5 bg-red-100 text-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm border border-red-200"
                           >
                             ×
                           </button>
                         )}
                         <div className="grid grid-cols-2 gap-2">
                           <input
                             type="number"
                             placeholder="Amount"
                             className="w-full border border-slate-100 rounded-lg px-3 py-2 text-xs outline-none focus:border-spiritual-maroon bg-white"
                             value={split.amount}
                             onChange={(e) => updateSplitPayment(index, 'amount', e.target.value)}
                           />
                           <select
                             className="w-full border border-slate-100 rounded-lg px-3 py-2 text-xs outline-none focus:border-spiritual-maroon bg-white"
                             value={split.method}
                             onChange={(e) => updateSplitPayment(index, 'method', e.target.value)}
                           >
                             {Object.values(PaymentMethod).slice(0, 7).map(m => (
                               <option key={m} value={m}>{m}</option>
                             ))}
                           </select>
                         </div>
                         {(split.method === PaymentMethod.BANK_TRANSFER || split.method === PaymentMethod.UPI || split.method === PaymentMethod.ONLINE || split.method === PaymentMethod.CHEQUE || split.method === PaymentMethod.RTGS) && (
                           <div className="grid grid-cols-2 gap-2">
                             <select
                               className="w-full border border-slate-100 rounded-lg px-3 py-2 text-xs outline-none focus:border-spiritual-maroon bg-white"
                               value={split.bankId}
                               onChange={(e) => updateSplitPayment(index, 'bankId', e.target.value)}
                             >
                               <option value="">Select Bank</option>
                               {banks.map(b => (
                                 <option key={b.id} value={b.id}>{b.bankName} - {(b.accountNumber || '').slice(-4)}</option>
                               ))}
                             </select>
                             <input
                               type="text"
                               placeholder="Ref/UTR #"
                               className="w-full border border-slate-100 rounded-lg px-3 py-2 text-xs outline-none focus:border-spiritual-maroon"
                               value={split.reference}
                               onChange={(e) => updateSplitPayment(index, 'reference', e.target.value)}
                             />
                           </div>
                         )}
                       </div>
                     ))}
                     <button
                       type="button"
                       onClick={addSplitPayment}
                       className="w-full py-2 border-2 border-dashed border-slate-200 rounded-lg text-[10px] font-bold text-slate-400 hover:border-spiritual-maroon hover:text-spiritual-maroon transition-all"
                     >
                       + Add Another Payment Mode
                     </button>
                   </div>
                 )}
               </div>

               <div className="pt-4 flex flex-col gap-3">
                 <button 
                    onClick={() => {
                      setShowReceiptPrint(true);
                      if (pendingId) {
                        const stored = JSON.parse(localStorage.getItem('pending_receipts') || '[]');
                        const updated = stored.map((r: any) => 
                          r.id === pendingId ? { ...r, printed: true } : r
                        );
                        localStorage.setItem('pending_receipts', JSON.stringify(updated));
                        const printedReceipt = updated.find((r: any) => r.id === pendingId);
                        if (printedReceipt) {
                          dbService.savePendingReceipt(printedReceipt).catch(console.error);
                        }
                        setPendingReceipts(updated.filter((r: any) => !r.printed));
                        setPendingId(null);
                         console.log('Receipt printed')
                      }
                    }}
                   disabled={!formData.clientId || !formData.amount}
                   className="w-full bg-spiritual-maroon text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-red-800 disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-red-900/10 active:scale-[0.98] transition-all"
                 >
                   <Printer size={20} /> Generate & Print Receipt
                 </button>
                 <button 
                    type="button"
                    onClick={() => {
                      if (!pendingId) {
                        const pendingReceipts = JSON.parse(localStorage.getItem('pending_receipts') || '[]');
                        // Check for existing pending with same amount and payee to avoid spamming "remind later"
                        const exists = pendingReceipts.find((r: any) => 
                          (r.payeeName || '') === (selectedParty.name || 'Unknown Party') && 
                          r.amount === (parseFloat(formData.amount) || 0) &&
                          r.date === formData.date &&
                          !r.printed
                        );
                        
                        if (!exists) {
                          const newPending = {
                            id: Date.now().toString(),
                            transactionId: 'MANUAL-' + Date.now(),
                            payeeName: selectedParty.name || 'Unknown Party',
                            amount: parseFloat(formData.amount) || 0,
                            date: formData.date,
                            partyType: selectedParty.type,
                            partyId: formData.clientId || '',
                            printed: false
                          };
                          localStorage.setItem('pending_receipts', JSON.stringify([...pendingReceipts, newPending]));
                          dbService.savePendingReceipt(newPending).catch(console.error);
                        }
                      }
                      localStorage.removeItem('pending_receipts_remind_after');
                      navigate('/pending-receipts');
                    }}
                    className="w-full bg-slate-100 text-slate-700 py-3 rounded-xl font-medium hover:bg-slate-200 transition-all flex items-center justify-center gap-2"
                 >
                   <Clock size={16} /> Remind me later
                 </button>
                 <p className="text-[10px] text-center text-slate-400 mt-2 italic">
                   Note: Manual receipts are not saved to the ledger.
                 </p>
               </div>
             </div>
           </div>
        </div>

        {/* Preview */}
        <div className="lg:col-span-2">
           <div className="bg-slate-100/50 p-8 rounded-3xl border-2 border-dashed border-slate-200 flex justify-center items-center min-h-[700px] relative overflow-hidden">
              {formData.clientId && settings ? (
                <div className="scale-75 md:scale-90 lg:scale-100 transform transition-all duration-500 hover:scale-[1.02]">
                  <ReceiptTemplate 
                    transaction={currentTransaction}
                    client={selectedParty as any}
                    settings={settings}
                  />
                </div>
              ) : (
                <div className="text-center group">
                  <div className="w-24 h-24 bg-slate-200 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-slate-300 transition-colors">
                    <Receipt size={48} className="text-slate-400" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-700">Live Preview</h3>
                  <p className="text-slate-500 max-w-xs mx-auto mt-2">Select a party and enter the amount to see a real-time preview of the receipt.</p>
                </div>
              )}
           </div>
        </div>
      </div>

      {showReceiptPrint && settings && (
        <ReceiptPrintView
          open={showReceiptPrint}
          onClose={() => setShowReceiptPrint(false)}
          transaction={currentTransaction}
          client={selectedParty as any}
          settings={settings}
        />
      )}
    </div>
  );
};
