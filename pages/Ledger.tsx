
import React, { useState, useEffect, useMemo } from 'react';
import { 
  Download, Calendar, Filter, Search, Printer, 
  ArrowUpRight, ArrowDownLeft, ChevronDown,
  FileText, User
} from 'lucide-react';
import { dbService } from '../services/db';
import { Transaction, TransactionType, Client, Property, TransactionCategory, PaymentMethod, AppSettings } from '../types';
import { StatementPrintView } from '../components/StatementTemplate';
import { useLanguage } from '../services/i18n';
import { Accounting } from '../services/accounting';
import { sortTransactions, SortOrder } from '../utils/sorting';
import { TransactionTable } from '../components/Shared';

export const Ledger: React.FC = () => {
  // Data State
  const [allTransactions, setAllTransactions] = useState<Transaction[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [farmers, setFarmers] = useState<any[]>([]);
  const [investors, setInvestors] = useState<any[]>([]);
  const [staff, setStaff] = useState<any[]>([]);
  const [banks, setBanks] = useState<any[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  
  // Filter State
  const [dateRange, setDateRange] = useState('this_month'); // this_month, last_month, this_year, all
  const [selectedAccountId, setSelectedAccountId] = useState<string>('MASTER_CLIENT');
  const [searchQuery, setSearchQuery] = useState('');
  const [txType, setTxType] = useState<TransactionType | 'ALL'>('ALL');
  const [sortOrder, setSortOrder] = useState<SortOrder>('newest');
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [showPrintPreview, setShowPrintPreview] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);
  const [currentTx, setCurrentTx] = useState<Transaction | null>(null);
  
  const { t } = useLanguage();

  // Load Data
  const loadData = () => {
    Promise.all([
      dbService.getTransactions(),
      dbService.getClients(),
      dbService.getKissans(),
      dbService.getInvestors(),
      dbService.getStaff(),
      dbService.getBanks(),
      dbService.getProperties(),
      dbService.getSettings()
    ]).then(([txs, cls, kissans, invs, stf, bks, props, sets]) => {
      // Sort by date ascending for correct running balance calculation
      const sorted = txs.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      setAllTransactions(sorted);
      setClients(cls);
      setFarmers(kissans);
      setInvestors(invs);
      setStaff(stf);
      setBanks(bks);
      setProperties(props);
      setSettings(sets);
    });
  };

  useEffect(() => {
    loadData();
    const unsubscribe = dbService.subscribe(loadData);
    return () => unsubscribe();
  }, []);

  // --- Core Accounting Logic ---

  const { filteredTransactions, stats, openingBalance } = useMemo(() => {
    // Filter out Land Purchase Agreement transactions (Journal Credits for Kissan Payments)
    // These are non-cash entries that clutter the main ledger
    let filtered = allTransactions.filter(t => 
      !(t.type === TransactionType.CREDIT && 
        t.category === TransactionCategory.KISSAN_PAYMENT && 
        t.method === PaymentMethod.JOURNAL)
    );
    let openingBal = 0;

    // 1. Filter by Client/Property (Sub-Ledger Scope)
    if (selectedAccountId === 'MASTER_CLIENT') {
      filtered = filtered.filter(t => t.clientId || t.partyType === 'CLIENT');
    } else if (selectedAccountId === 'MASTER_KISSAN') {
      filtered = filtered.filter(t => t.kissanId || t.partyType === 'KISSAN');
    } else if (selectedAccountId === 'MASTER_INVESTOR') {
      filtered = filtered.filter(t => t.investorId || t.partyType === 'INVESTOR');
    } else if (selectedAccountId === 'MASTER_STAFF') {
      filtered = filtered.filter(t => t.staffId || (t.partyType === 'EXPENSE' && t.expenseCategory === 'Salary'));
    } else if (selectedAccountId === 'MASTER_BANK') {
      filtered = filtered.filter(t => t.bankId || t.toBankId || t.partyType === 'BANK');
    } else if (selectedAccountId === 'MASTER_ALL') {
      // No filter, show all
    } else if (selectedAccountId) {
      filtered = filtered.filter(t => 
        t.clientId === selectedAccountId || 
        t.kissanId === selectedAccountId || 
        t.investorId === selectedAccountId || 
        t.staffId === selectedAccountId ||
        t.bankId === selectedAccountId ||
        t.toBankId === selectedAccountId
      );
    }


    // 2. Calculate Opening Balance (Sum of transactions BEFORE the start date)
    // Determine start date based on range
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
      startDate = new Date(now.getFullYear(), 0, 1); // Jan 1st
    }

    // If we have a start date, calculate opening balance strictly
    if (startDate) {
      const previousTxs = filtered.filter(t => new Date(t.date) < startDate!);
      openingBal = previousTxs.reduce((acc, t) => {
        return t.type === TransactionType.CREDIT 
          ? Accounting.add(acc, t.amount) 
          : Accounting.subtract(acc, t.amount);
      }, 0);
      
      // Filter current view to date range
      filtered = filtered.filter(t => {
        const d = new Date(t.date);
        return d >= startDate! && (!endDate || d <= endDate);
      });
    }

    // 3. Apply Search & Type filters (Visual filters, don't affect opening balance calculation usually, but for UI we filter)
    if (searchQuery) {
      const q = searchQuery?.toLowerCase() || '';
      filtered = filtered.filter(t => 
        (t.particulars?.toLowerCase() || '').includes(q) || 
        (t.referenceId?.toLowerCase() || '').includes(q) ||
        t.amount.toString().includes(q)
      );
    }

    if (txType !== 'ALL') {
      filtered = filtered.filter(t => t.type === txType);
    }

    // 4. Calculate Stats for the View (Using Accounting Engine)
    const totalCredit = filtered.reduce((acc, t) => t.type === TransactionType.CREDIT ? Accounting.add(acc, t.amount) : acc, 0);
    const totalDebit = filtered.reduce((acc, t) => t.type === TransactionType.DEBIT ? Accounting.add(acc, t.amount) : acc, 0);
    
    // 5. Compute Running Balance for display (Always calculate oldest to newest)
    let running = openingBal;
    const withBalance = filtered.map(t => {
      // Logic: Credit adds to balance, Debit subtracts
      running = t.type === TransactionType.CREDIT 
        ? Accounting.add(running, t.amount) 
        : Accounting.subtract(running, t.amount);
      return { ...t, displayBalance: running };
    });

    // 6. Sort for display
    const finalTxs = sortTransactions(withBalance, sortOrder);

    // FIX: Use 'openingBal' local variable instead of 'openingBalance' which is not initialized yet
    const closingBalance = Accounting.subtract(Accounting.add(openingBal, totalCredit), totalDebit);

    return {
      filteredTransactions: finalTxs,
      openingBalance: openingBal,
      stats: {
        credit: totalCredit,
        debit: totalDebit,
        closing: closingBalance
      }
    };
  }, [allTransactions, selectedAccountId, dateRange, searchQuery, txType, sortOrder]);

  const handlePrint = () => {
    setShowPrintPreview(true);
  };

  const currentAccountName = useMemo(() => {
    if (selectedAccountId === 'MASTER_ALL') return "Full Consolidated Ledger";
    if (selectedAccountId === 'MASTER_CLIENT') return "All Clients (Master)";
    if (selectedAccountId === 'MASTER_KISSAN') return "All Kissan (Master)";
    if (selectedAccountId === 'MASTER_INVESTOR') return "All Investors (Master)";
    if (selectedAccountId === 'MASTER_STAFF') return "All Staff (Master)";
    if (selectedAccountId === 'MASTER_BANK') return "All Banks (Master)";
    
    const foundClient = clients.find(c => c.id === selectedAccountId)?.name;
    const clientName = foundClient && typeof foundClient === 'object' ? (foundClient as any)?.en || (foundClient as any)?.hi || '' : foundClient;
    return clientName || 
           farmers.find(f => f.id === selectedAccountId)?.landName ||
           (investors.find(i => i.id === selectedAccountId)?.name && typeof investors.find(i => i.id === selectedAccountId)?.name === 'string' ? investors.find(i => i.id === selectedAccountId)?.name :
            (investors.find(i => i.id === selectedAccountId)?.name as any)?.en || '') ||
           staff.find(s => s.id === selectedAccountId)?.name ||
           banks.find(b => b.id === selectedAccountId)?.bankName ||
           'Account';
  }, [selectedAccountId, clients, farmers, investors, staff, banks]);

  return (
    <div className="space-y-6 pb-20">
      
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center">
            <FileText className="mr-2 text-spiritual-maroon" /> 
            {selectedAccountId.startsWith('MASTER') 
              ? currentAccountName
              : `${t('nav_ledger')}: ${currentAccountName}`}
          </h1>
          <p className="text-sm text-slate-500">
            {selectedAccountId.startsWith('MASTER') ? t('consolidated_view') : t('client_statement')}
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={handlePrint} className="flex items-center px-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-50 text-sm font-medium shadow-sm">
            <Printer size={16} className="mr-2" /> {t('print_pdf')}
          </button>
          <button className="flex items-center px-4 py-2 bg-spiritual-maroon text-white rounded-lg hover:bg-red-800 text-sm font-medium shadow-md">
            <Download size={16} className="mr-2" /> {t('export')}
          </button>
        </div>
      </div>

      {/* Advanced Filter Bar */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          
          {/* Account Filter */}
          <div className="relative">
            <label className="text-xs font-semibold text-slate-500 uppercase mb-1 block">{t('account_client')}</label>
            <div className="relative">
              <User className="absolute left-3 top-2.5 text-slate-400" size={16} />
              <select 
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 outline-none appearance-none"
                value={selectedAccountId}
                onChange={e => setSelectedAccountId(e.target.value)}
              >
                <optgroup label="Summarized Views">
                  <option value="MASTER_ALL">Full Consolidated Ledger</option>
                  <option value="MASTER_CLIENT">All Clients Ledger</option>
                  <option value="MASTER_KISSAN">All Kissan (Agri Land) Ledger</option>
                  <option value="MASTER_INVESTOR">All Investors Ledger</option>
                  <option value="MASTER_STAFF">All Staff Salary Ledger</option>
                  <option value="MASTER_BANK">All Banks Ledger</option>
                </optgroup>
              </select>
              <ChevronDown className="absolute right-3 top-2.5 text-slate-400 pointer-events-none" size={16} />
            </div>
          </div>

          {/* Date Range */}
          <div className="relative">
             <label className="text-xs font-semibold text-slate-500 uppercase mb-1 block">{t('period')}</label>
             <div className="relative">
               <Calendar className="absolute left-3 top-2.5 text-slate-400" size={16} />
               <select 
                 className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 outline-none appearance-none"
                 value={dateRange}
                 onChange={e => setDateRange(e.target.value)}
               >
                 <option value="this_month">{t('this_month')}</option>
                 <option value="last_month">{t('last_month')}</option>
                 <option value="this_year">{t('this_year')}</option>
                 <option value="all">{t('all_time')}</option>
               </select>
               <ChevronDown className="absolute right-3 top-2.5 text-slate-400 pointer-events-none" size={16} />
             </div>
          </div>

          {/* Search */}
          <div className="relative">
             <label className="text-xs font-semibold text-slate-500 uppercase mb-1 block">Quick Search</label>
             <div className="relative">
               <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
               <input 
                 type="text" 
                 placeholder={t('search_placeholder')}
                 className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 outline-none"
                 value={searchQuery}
                 onChange={e => setSearchQuery(e.target.value)}
               />
             </div>
          </div>

          {/* Type */}
          <div className="relative">
             <label className="text-xs font-semibold text-slate-500 uppercase mb-1 block">{t('transaction_type')}</label>
             <div className="flex bg-slate-50 p-1 rounded-lg border border-slate-200">
                {['ALL', 'CREDIT', 'DEBIT'].map((type) => (
                  <button
                    key={type}
                    onClick={() => setTxType(type as any)}
                    className={`flex-1 text-xs font-medium py-1.5 rounded-md transition-colors ${
                      txType === type 
                        ? 'bg-white text-slate-800 shadow-sm border border-slate-100' 
                        : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    {type === 'ALL' ? t('all') : type === 'CREDIT' ? t('receipts') : t('payments')}
                  </button>
                ))}
             </div>
          </div>

          {/* Sort Order */}
          <div className="relative">
             <label className="text-xs font-semibold text-slate-500 uppercase mb-1 block">Sort Order</label>
             <button 
               onClick={() => setSortOrder(sortOrder === 'newest' ? 'oldest' : 'newest')}
               className="w-full flex items-center justify-between px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100 transition-all"
             >
               <div className="flex items-center">
                 <Filter size={14} className="mr-2 text-slate-400" />
                 {sortOrder === 'newest' ? 'Newest First' : 'Oldest First'}
               </div>
               <ChevronDown size={14} className="text-slate-400" />
             </button>
          </div>
        </div>
      </div>

      {/* Financial Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Opening Balance Card */}
        {dateRange !== 'all' && (
          <div className="bg-slate-100 p-4 rounded-xl border border-slate-200">
            <p className="text-xs text-slate-500 font-bold uppercase mb-1">{t('opening_balance')}</p>
            <p className={`text-xl font-bold font-mono ${openingBalance < 0 ? 'text-red-600' : 'text-green-700'}`}>
              ₹{Accounting.formatIndian(Math.abs(openingBalance))} {openingBalance < 0 ? 'Dr' : 'Cr'}
            </p>
          </div>
        )}

        <div className="bg-green-50 p-4 rounded-xl border border-green-100">
           <div className="flex items-center justify-between">
             <p className="text-xs text-green-700 font-bold uppercase mb-1">{t('total_receipts')}</p>
             <ArrowDownLeft size={16} className="text-green-600" />
           </div>
           <p className="text-xl font-bold text-green-700 font-mono">+₹{Accounting.formatIndian(stats.credit)}</p>
        </div>

        <div className="bg-red-50 p-4 rounded-xl border border-red-100">
           <div className="flex items-center justify-between">
             <p className="text-xs text-red-700 font-bold uppercase mb-1">{t('total_debits')}</p>
             <ArrowUpRight size={16} className="text-red-600" />
           </div>
           <p className="text-xl font-bold text-red-700 font-mono">-₹{Accounting.formatIndian(stats.debit)}</p>
        </div>

        <div className={`p-4 rounded-xl border ${stats.closing < 0 ? 'bg-red-600 text-white border-red-700' : 'bg-spiritual-maroon text-white border-red-900'}`}>
           <p className="text-xs font-bold uppercase mb-1 opacity-80">{t('closing_balance')}</p>
           <p className="text-2xl font-bold font-mono">
             ₹{Accounting.formatIndian(Math.abs(stats.closing))} {stats.closing < 0 ? 'Dr' : 'Cr'}
           </p>
        </div>
      </div>

      {/* Main Ledger Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <TransactionTable 
          transactions={filteredTransactions} 
          showBalance={true} 
          initialBalance={openingBalance} 
          onUpdate={loadData}
        />
      </div>

      {showPrintPreview && (
        <StatementPrintView
          open={showPrintPreview}
          onClose={() => setShowPrintPreview(false)}
          title={`Statement: ${currentAccountName}`}
          subtitle={`${dateRange === 'all' ? 'Consolidated' : dateRange.replace('_', ' ').toUpperCase()} Report`}
          type="ledger"
          partyName={currentAccountName}
          partyDetails={selectedAccountId.startsWith('MASTER') ? 'All Consolidated Accounts' : 'Individual Account Statement'}
          data={{
            transactions: [
              { id: 'opening', date: '---', particulars: 'Opening Balance', amount: Math.abs(openingBalance), type: openingBalance >= 0 ? TransactionType.CREDIT : TransactionType.DEBIT, balance: openingBalance, method: 'N/A' } as any,
              ...filteredTransactions
            ],
            totals: {
              debit: stats.debit,
              credit: stats.credit,
              balance: stats.closing
            }
          }}
        />
      )}

      {currentTx && (
        <StatementPrintView
          open={showReceipt}
          onClose={() => setShowReceipt(false)}
          title="Payment Receipt"
          subtitle="Transaction Acknowledgement"
          type="receipt"
          partyName={clients.find(c => c.id === currentTx.clientId)?.name || 'Valued Client'}
          data={{
            amount: currentTx.amount,
            method: currentTx.method,
            referenceId: currentTx.referenceId,
            date: currentTx.date,
            particulars: currentTx.particulars
          }}
        />
      )}
    </div>
  );
};
