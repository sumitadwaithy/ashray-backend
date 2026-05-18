
import React, { useState, useEffect, useMemo } from 'react';
import { Printer, Calendar, Filter, CheckSquare, Square, PieChart } from 'lucide-react';
import { dbService } from '../services/db';
import { Transaction, Client, PaymentMethod, Investor, TransactionType, TransactionCategory, AppSettings } from '../types';
import { useLanguage } from '../services/i18n';
import { Accounting } from '../services/accounting';
import { sortTransactions, SortOrder } from '../utils/sorting';

export const CAReports: React.FC = () => {
  const { t } = useLanguage();
  
  // Data
  const [allTransactions, setAllTransactions] = useState<Transaction[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [investors, setInvestors] = useState<Investor[]>([]);
  const [sortOrder, setSortOrder] = useState<SortOrder>('newest');
  const [settings, setSettings] = useState<AppSettings | null>(null);

  // Filter State
  const [dateRange, setDateRange] = useState('this_year');
  const [selectedPaymentMethods, setSelectedPaymentMethods] = useState<Set<string>>(
    new Set([PaymentMethod.BANK_TRANSFER, PaymentMethod.CHEQUE, PaymentMethod.RTGS, PaymentMethod.ONLINE, PaymentMethod.UPI])
  );
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(
    new Set([
      TransactionCategory.GENERAL, 
      TransactionCategory.CAPITAL_INJECTION, 
      TransactionCategory.PAYOUT, 
      TransactionCategory.INTEREST_ACCRUAL,
      TransactionCategory.EXPENSE,
      TransactionCategory.KISSAN_PAYMENT
    ])
  );
  
  // Selection State (IDs of transactions to show)
  const [selectedTxIds, setSelectedTxIds] = useState<Set<string>>(new Set());
  const [isAllSelected, setIsAllSelected] = useState(true);

  const formattedFinancialYear = useMemo(() => {
    if (!settings?.financialYearStart || !settings?.financialYearEnd) return null;
    const start = new Date(settings.financialYearStart).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
    const end = new Date(settings.financialYearEnd).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
    return `${start} to ${end}`;
  }, [settings]);

  const displayPeriod = useMemo(() => {
    if (dateRange === 'this_year' && formattedFinancialYear) {
      return formattedFinancialYear;
    }
    return t(dateRange) || dateRange.replace('_', ' ');
  }, [dateRange, formattedFinancialYear, t]);

  // Load Data
  useEffect(() => {
    Promise.all([
      dbService.getTransactions(),
      dbService.getClients(),
      dbService.getInvestors(),
      dbService.getSettings()
    ]).then(([txs, cls, invs, stgs]) => {
      setAllTransactions(txs);
      setClients(cls);
      setInvestors(invs);
      setSettings(stgs);
      // Default: Select all valid ones initially
      setSelectedTxIds(new Set(txs.map(t => t.id)));
    });
  }, []);

  // 1. Filter Transactions based on Global Filters (Date, Method, Category)
  const filteredCandidates = useMemo(() => {
    const now = new Date();
    let startDate: Date | null = null;
    let endDate: Date | null = null;

    if (dateRange === 'this_month') {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    } else if (dateRange === 'last_month') {
      startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      endDate = new Date(now.getFullYear(), now.getMonth(), 0);
    } else if (dateRange === 'this_year') {
      if (settings?.financialYearStart && settings?.financialYearEnd) {
        startDate = new Date(settings.financialYearStart);
        endDate = new Date(settings.financialYearEnd);
      } else {
        startDate = new Date(now.getFullYear(), 0, 1);
      }
    }

    const filtered = allTransactions.filter(t => {
      const d = new Date(t.date);
      const matchDate = !startDate || (d >= startDate && (!endDate || d <= endDate));
      const matchMethod = selectedPaymentMethods.has(t.method);
      const matchCat = t.category ? selectedCategories.has(t.category) : selectedCategories.has(TransactionCategory.GENERAL);
      
      return matchDate && matchMethod && matchCat;
    });

    return sortTransactions(filtered, sortOrder);
  }, [allTransactions, dateRange, selectedPaymentMethods, selectedCategories, sortOrder]);

  // 2. Compute "Final" list based on individual Checkboxes
  // Note: We only show items that passed filters, AND are checked.
  const finalReportTransactions = useMemo(() => {
    return filteredCandidates.filter(t => selectedTxIds.has(t.id));
  }, [filteredCandidates, selectedTxIds]);

  // 3. Compute Totals (STRICT MATH)
  const totals = useMemo(() => {
    const credits = finalReportTransactions
      .filter(t => t.type === TransactionType.CREDIT)
      .reduce((acc, t) => Accounting.add(acc, t.amount), 0);
    
    const debits = finalReportTransactions
      .filter(t => t.type === TransactionType.DEBIT)
      .reduce((acc, t) => Accounting.add(acc, t.amount), 0);

    return { credits, debits, net: Accounting.subtract(credits, debits) };
  }, [finalReportTransactions]);

  // Handlers
  const togglePaymentMethod = (method: string) => {
    const newSet = new Set(selectedPaymentMethods);
    if (newSet.has(method)) newSet.delete(method);
    else newSet.add(method);
    setSelectedPaymentMethods(newSet);
  };

  const toggleCategory = (cat: string) => {
    const newSet = new Set(selectedCategories);
    if (newSet.has(cat)) newSet.delete(cat);
    else newSet.add(cat);
    setSelectedCategories(newSet);
  };

  const toggleTxSelection = (id: string) => {
    const newSet = new Set(selectedTxIds);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedTxIds(newSet);
    setIsAllSelected(false);
  };

  const toggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedTxIds(new Set()); // Deselect all visible
    } else {
      setSelectedTxIds(new Set(filteredCandidates.map(t => t.id)));
    }
    setIsAllSelected(!isAllSelected);
  };

  // Sync "Select All" state when candidates change
  useEffect(() => {
    setSelectedTxIds(new Set(filteredCandidates.map(t => t.id)));
    setIsAllSelected(true);
  }, [filteredCandidates]);

  const handlePrint = () => {
    window.print();
  };

  const getPartyName = (tx: Transaction) => {
    if (tx.clientId) return clients.find(c => c.id === tx.clientId)?.name;
    if (tx.investorId) return investors.find(i => i.id === tx.investorId)?.name;
    if (tx.kissanId) return 'Kissan / Land Owner';
    return 'General / Expense';
  };

  return (
    <div className="flex flex-col md:flex-row h-full gap-6 pb-20 md:pb-0">
      
      {/* LEFT PANEL: FILTERS (Hidden on Print) */}
      <div className="w-full md:w-80 flex-shrink-0 space-y-6 print:hidden">
        
        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
           <h2 className="font-bold text-slate-800 flex items-center mb-4">
             <Filter size={20} className="mr-2 text-brand-600" /> Report Configuration
           </h2>
           
           {/* Date */}
           <div className="mb-6">
             <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">{t('period')}</label>
             <div className="relative">
               <Calendar className="absolute left-3 top-2.5 text-slate-400" size={16} />
               <select 
                 className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 outline-none"
                 value={dateRange}
                 onChange={e => setDateRange(e.target.value)}
               >
                 <option value="this_month">{t('this_month')}</option>
                 <option value="last_month">{t('last_month')}</option>
                 <option value="this_year">{t('this_year')}</option>
                 <option value="all">{t('all_time')}</option>
               </select>
             </div>
             {dateRange === 'this_year' && formattedFinancialYear && (
               <div className="mt-2 p-2 bg-brand-50 border border-brand-100 rounded text-[10px] text-brand-700 font-medium flex items-center">
                 <Calendar size={12} className="mr-1.5" />
                 {formattedFinancialYear}
               </div>
             )}
           </div>

           <div className="mb-6">
              <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Sort Order</label>
              <button 
                onClick={() => setSortOrder(prev => prev === 'newest' ? 'oldest' : 'newest')}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-lg text-xs font-bold transition-all border border-slate-200"
              >
                <Calendar size={14} className={sortOrder === 'newest' ? 'rotate-90' : '-rotate-90'} />
                {sortOrder === 'newest' ? 'Newest First' : 'Oldest First'}
              </button>
            </div>

           {/* Payment Methods */}
           <div className="mb-6">
             <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Include Payment Modes</label>
             <div className="space-y-2">
               {Object.values(PaymentMethod).map(method => (
                 <label key={method} className="flex items-center cursor-pointer hover:bg-slate-50 p-1 rounded">
                    <input 
                      type="checkbox" 
                      className="w-4 h-4 text-brand-600 rounded border-gray-300 focus:ring-brand-500"
                      checked={selectedPaymentMethods.has(method)}
                      onChange={() => togglePaymentMethod(method)}
                    />
                    <span className="ml-2 text-sm text-slate-700 capitalize">{method.replace('_', ' ')}</span>
                 </label>
               ))}
             </div>
           </div>

           {/* Categories */}
           <div className="mb-6">
             <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Categories</label>
             <div className="space-y-2">
               {[
                 TransactionCategory.GENERAL, 
                 TransactionCategory.CAPITAL_INJECTION, 
                 TransactionCategory.INTEREST_ACCRUAL, 
                 TransactionCategory.PAYOUT,
                 TransactionCategory.EXPENSE,
                 TransactionCategory.KISSAN_PAYMENT
               ].map(cat => (
                 <label key={cat} className="flex items-center cursor-pointer hover:bg-slate-50 p-1 rounded">
                    <input 
                      type="checkbox" 
                      className="w-4 h-4 text-brand-600 rounded border-gray-300 focus:ring-brand-500"
                      checked={selectedCategories.has(cat)}
                      onChange={() => toggleCategory(cat)}
                    />
                    <span className="ml-2 text-sm text-slate-700 capitalize">
                      {cat === TransactionCategory.GENERAL ? 'General Business' : cat.replace('_', ' ')}
                    </span>
                 </label>
               ))}
             </div>
           </div>

           <button 
             onClick={handlePrint} 
             className="w-full bg-brand-600 text-white py-3 rounded-lg font-bold flex items-center justify-center hover:bg-brand-700 shadow-md transition-colors"
           >
             <Printer size={18} className="mr-2" /> {t('generate_statement')}
           </button>
           <p className="text-center text-xs text-slate-400 mt-2">{t('print_instructions')}</p>

        </div>
      </div>

      {/* RIGHT PANEL: PREVIEW */}
      <div className="flex-1 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-[calc(100vh-140px)] print:h-auto print:shadow-none print:border-none print:w-full">
        
        {/* Report Header (Print Visible) */}
        <div className="p-6 border-b border-slate-200 bg-slate-50/50">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 uppercase tracking-wide">Statement of Accounts</h1>
              <p className="text-sm text-slate-500 mt-1">For Tax / Audit Purposes</p>
              {settings && (
                <div className="mt-2 text-xs text-slate-500">
                  <p className="font-bold text-slate-700">{settings.companyName}</p>
                  <div className="flex flex-wrap gap-x-4">
                    {settings.licenseRegistrationNumber && <p>Reg No: {settings.licenseRegistrationNumber}</p>}
                    {settings.panNumber && <p>PAN: {settings.panNumber}</p>}
                    {settings.tanNumber && <p>TAN: {settings.tanNumber}</p>}
                  </div>
                </div>
              )}
            </div>
            <div className="text-right">
              <div className="inline-block bg-brand-100 text-brand-800 text-xs font-bold px-3 py-1 rounded-full mb-2 print:hidden">
                 Preview Mode
              </div>
              <p className="text-sm font-medium text-slate-600">Period: <span className="text-slate-900 font-bold">{displayPeriod}</span></p>
              <p className="text-xs text-slate-400 mt-1">Generated: {new Date().toLocaleDateString()}</p>
            </div>
          </div>
        </div>

        {/* Totals Summary */}
        <div className="grid grid-cols-3 divide-x divide-slate-100 border-b border-slate-200 bg-white">
          <div className="p-4 text-center">
             <p className="text-xs text-slate-500 uppercase font-bold">{t('included_items')}</p>
             <p className="text-xl font-bold text-slate-800">{finalReportTransactions.length}</p>
          </div>
          <div className="p-4 text-center">
             <p className="text-xs text-slate-500 uppercase font-bold">Total Debits</p>
             <p className="text-xl font-bold text-red-600">{Accounting.formatMoney(totals.debits)}</p>
          </div>
          <div className="p-4 text-center">
             <p className="text-xs text-slate-500 uppercase font-bold">Total Credits</p>
             <p className="text-xl font-bold text-green-600">{Accounting.formatMoney(totals.credits)}</p>
          </div>
        </div>
        
        {/* Table Header */}
        <div className="bg-slate-50 border-b border-slate-200 px-6 py-3 grid grid-cols-12 gap-4 items-center text-xs font-bold text-slate-500 uppercase">
          <div className="col-span-1 print:hidden flex justify-center">
             <button onClick={toggleSelectAll}>
               {isAllSelected ? <CheckSquare size={18} className="text-brand-600" /> : <Square size={18} />}
             </button>
          </div>
          <div className="col-span-2">{t('date')}</div>
          <div className="col-span-3">Party / Particulars</div>
          <div className="col-span-2">Mode</div>
          <div className="col-span-2 text-right">{t('debit')}</div>
          <div className="col-span-2 text-right">{t('credit')}</div>
        </div>

        {/* Scrollable List */}
        <div className="flex-1 overflow-y-auto print:overflow-visible">
          {finalReportTransactions.length === 0 ? (
             <div className="p-10 text-center text-slate-400">
               <PieChart size={48} className="mx-auto mb-4 opacity-50" />
               <p>No transactions match your filters.</p>
             </div>
          ) : (
            finalReportTransactions.map(tx => (
              <div key={tx.id} className="grid grid-cols-12 gap-4 items-center px-6 py-3 border-b border-slate-50 hover:bg-slate-50 text-sm">
                 <div className="col-span-1 print:hidden flex justify-center">
                    <button onClick={() => toggleTxSelection(tx.id)}>
                      <CheckSquare size={16} className="text-brand-600" />
                    </button>
                 </div>
                 <div className="col-span-2 text-slate-600 font-mono text-xs">{tx.date}</div>
                 <div className="col-span-3">
                   <p className="font-semibold text-slate-800 truncate">{getPartyName(tx)}</p>
                   <p className="text-xs text-slate-500 truncate">{tx.particulars}</p>
                 </div>
                 <div className="col-span-2">
                   <span className="text-xs bg-slate-100 px-2 py-1 rounded text-slate-600 font-medium">
                     {tx.method.replace('_', ' ')}
                   </span>
                 </div>
                 <div className="col-span-2 text-right text-red-600 font-medium">
                   {tx.type === TransactionType.DEBIT ? Accounting.formatMoney(tx.amount) : '-'}
                 </div>
                 <div className="col-span-2 text-right text-green-600 font-medium">
                   {tx.type === TransactionType.CREDIT ? Accounting.formatMoney(tx.amount) : '-'}
                 </div>
              </div>
            ))
          )}
        </div>

        {/* Net Footer */}
        <div className="p-4 bg-slate-100 border-t border-slate-200 flex justify-end items-center">
           <span className="text-sm font-bold text-slate-600 uppercase mr-4">{t('net_balance')} (Selected):</span>
           <span className={`text-xl font-bold font-mono ${totals.net < 0 ? 'text-red-700' : 'text-green-700'}`}>
             {Accounting.formatDrCr(totals.net)}
           </span>
        </div>
      </div>
    </div>
  );
};
