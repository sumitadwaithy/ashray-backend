
import React, { useState, useEffect, useMemo } from 'react';
import { 
  Landmark, Plus, Search, Filter, ArrowUpRight, ArrowDownLeft, 
  MoreVertical, Edit2, Trash2, CheckCircle, AlertCircle, 
  TrendingUp, TrendingDown, DollarSign, Calendar, Tag, 
  ChevronRight, Download, FileText, PieChart, History, ShieldCheck,
  X
} from 'lucide-react';
import { dbService } from '../services/db';
import { BankProfile, Transaction, TransactionType, BankAccountType, TransactionCategory, PaymentMethod } from '../types';
import { Accounting } from '../services/accounting';
import { motion, AnimatePresence } from 'framer-motion';

export const BankManager: React.FC = () => {
  const [banks, setBanks] = useState<BankProfile[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [selectedBankId, setSelectedBankId] = useState<string | null>(null);
  const [showAddBank, setShowAddBank] = useState(false);
  const [editingBank, setEditingBank] = useState<BankProfile | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'ALL' | 'CREDIT' | 'DEBIT'>('ALL');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [loading, setLoading] = useState(true);

  const [newBank, setNewBank] = useState<Partial<BankProfile>>({
    bankName: '',
    branch: '',
    accountHolderName: '',
    accountNumber: '',
    ifsc: '',
    openingBalance: 0,
    accountType: BankAccountType.SAVINGS,
    colorTag: '#4f46e5'
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [allBanks, allTransactions] = await Promise.all([
        dbService.getBanks(),
        dbService.getTransactions()
      ]);
      setBanks(allBanks);
      setTransactions(allTransactions);
    } catch (error) {
      console.error('Failed to load bank data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getMethodShortcut = (method: PaymentMethod) => {
    switch (method) {
      case PaymentMethod.CASH: return 'CSH';
      case PaymentMethod.UPI: return 'UPI';
      case PaymentMethod.BANK_TRANSFER: return 'BT';
      case PaymentMethod.CHEQUE: return 'CHQ';
      case PaymentMethod.ONLINE: return 'ONL';
      case PaymentMethod.RTGS: return 'RTG';
      case PaymentMethod.JOURNAL: return 'JRN';
      case PaymentMethod.TRANSFER: return 'TRF';
      default: return method;
    }
  };

  const handleSaveBank = async (e: React.FormEvent) => {
    e.preventDefault();
    const bankToSave: BankProfile = {
      id: editingBank?.id || Date.now().toString(),
      bankName: newBank.bankName || '',
      branch: newBank.branch || '',
      accountHolderName: newBank.accountHolderName || '',
      accountNumber: newBank.accountNumber || '',
      ifsc: newBank.ifsc || '',
      openingBalance: Number(newBank.openingBalance) || 0,
      accountType: newBank.accountType as BankAccountType,
      colorTag: newBank.colorTag || '#4f46e5',
      createdAt: editingBank?.createdAt || new Date().toISOString(),
      isDefault: newBank.isDefault || false
    };

    await dbService.saveBank(bankToSave);
    setShowAddBank(false);
    setEditingBank(null);
    setNewBank({
      bankName: '',
      branch: '',
      accountHolderName: '',
      accountNumber: '',
      ifsc: '',
      openingBalance: 0,
      accountType: BankAccountType.SAVINGS,
      colorTag: '#4f46e5'
    });
    loadData();
  };

  const handleDeleteBank = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this bank profile? This will NOT delete transactions linked to it.')) {
      await dbService.deleteBank(id);
      loadData();
    }
  };

  const getBankBalance = (bank: BankProfile) => {
    const bankTx = transactions.filter(t => t.bankId === bank.id || t.toBankId === bank.id);
    let balance = bank.openingBalance;
    
    bankTx.forEach(t => {
      if (t.category === TransactionCategory.TRANSFER) {
        if (t.bankId === bank.id) balance -= t.amount; // Outgoing
        if (t.toBankId === bank.id) balance += t.amount; // Incoming
      } else {
        if (t.type === TransactionType.CREDIT) balance += t.amount;
        else balance -= t.amount;
      }
    });
    
    return balance;
  };

  const filteredTransactions = useMemo(() => {
    let list = transactions;
    if (selectedBankId) {
      list = list.filter(t => t.bankId === selectedBankId || t.toBankId === selectedBankId);
    }

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      list = list.filter(t => 
        (t.particulars || '').toLowerCase().includes(q) || 
        (t.referenceId || '').toLowerCase().includes(q) ||
        t.amount.toString().includes(q)
      );
    }

    if (filterType !== 'ALL') {
      list = list.filter(t => t.type === filterType);
    }

    if (dateRange.start) {
      list = list.filter(t => t.date >= dateRange.start);
    }
    if (dateRange.end) {
      list = list.filter(t => t.date <= dateRange.end);
    }

    return list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [transactions, selectedBankId, searchQuery, filterType, dateRange]);

  const stats = useMemo(() => {
    const list = selectedBankId 
      ? transactions.filter(t => t.bankId === selectedBankId || t.toBankId === selectedBankId)
      : transactions;
    
    const inflow = list.reduce((sum, t) => {
        if (t.category === TransactionCategory.TRANSFER) {
            return t.toBankId === selectedBankId ? sum + t.amount : sum;
        }
        return t.type === TransactionType.CREDIT ? sum + t.amount : sum;
    }, 0);

    const outflow = list.reduce((sum, t) => {
        if (t.category === TransactionCategory.TRANSFER) {
            return t.bankId === selectedBankId ? sum + t.amount : sum;
        }
        return t.type === TransactionType.DEBIT ? sum + t.amount : sum;
    }, 0);

    return { inflow, outflow, net: inflow - outflow };
  }, [transactions, selectedBankId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-20">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-slate-800">Bank Accounts</h2>
          <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Manage your financial profiles</p>
        </div>
        <button 
          onClick={() => setShowAddBank(true)}
          className="flex items-center justify-center space-x-2 bg-brand-600 text-white px-4 py-2 rounded-xl hover:bg-brand-700 transition-all shadow-md text-sm font-bold"
        >
          <Plus size={18} />
          <span>Add Bank</span>
        </button>
      </div>

      {/* Bank Profiles Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        <motion.div 
          whileHover={{ scale: 1.02 }}
          onClick={() => setSelectedBankId(null)}
          className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${!selectedBankId ? 'border-brand-500 bg-brand-50 shadow-lg shadow-brand-500/10' : 'border-slate-200 bg-white hover:border-brand-200'}`}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="p-1.5 bg-slate-100 rounded-lg text-slate-500">
              <PieChart size={20} />
            </div>
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Consolidated</span>
          </div>
          <h3 className="text-xs font-bold text-slate-600">All Accounts</h3>
          <p className="text-xl font-black text-slate-800 mt-0.5">
            ₹{Accounting.formatIndian(banks.reduce((sum, b) => sum + getBankBalance(b), 0))}
          </p>
          <div className="mt-3 pt-3 border-t border-slate-100">
            <p className="text-[9px] text-slate-400 uppercase font-bold">Profiles: {banks.length}</p>
          </div>
        </motion.div>

        {banks.map(bank => {
          const balance = getBankBalance(bank);
          const isSelected = selectedBankId === bank.id;
          return (
            <motion.div 
              key={bank.id}
              whileHover={{ scale: 1.02 }}
              onClick={() => setSelectedBankId(bank.id)}
              className={`p-4 rounded-2xl border-2 cursor-pointer transition-all relative group ${isSelected ? 'border-brand-500 bg-brand-50 shadow-lg shadow-brand-500/10' : 'border-slate-200 bg-white hover:border-brand-200'}`}
              style={{ borderLeftColor: bank.colorTag, borderLeftWidth: '4px' }}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="p-1.5 rounded-lg" style={{ backgroundColor: `${bank.colorTag}15`, color: bank.colorTag }}>
                  <Landmark size={20} />
                </div>
                <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingBank(bank);
                      setNewBank(bank);
                      setShowAddBank(true);
                    }}
                    className="p-1 text-slate-400 hover:text-brand-600 transition-colors"
                  >
                    <Edit2 size={14} />
                  </button>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteBank(bank.id);
                    }}
                    className="p-1 text-slate-400 hover:text-red-600 transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
              <h3 className="text-xs font-bold text-slate-800 truncate">{bank.bankName}</h3>
              <p className="text-[10px] text-slate-500 mb-0.5 truncate flex items-center gap-1">
                <Tag size={9} /> {bank.branch || 'Main Branch'}
              </p>
              <p className="text-[10px] text-slate-500 mb-1 font-mono">{bank.accountNumber}</p>
              <p className={`text-xl font-black ${balance >= 0 ? 'text-slate-800' : 'text-red-600'}`}>
                ₹{Accounting.formatIndian(balance)}
              </p>
            </motion.div>
          );
        })}
      </div>

      {/* Analytics & Filters Section */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Stats Sidebar */}
        <div className="lg:col-span-1 space-y-4">
          {selectedBankId && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-2">
                <button 
                  onClick={() => {
                    const bank = banks.find(b => b.id === selectedBankId);
                    if (bank) {
                      setEditingBank(bank);
                      setNewBank(bank);
                      setShowAddBank(true);
                    }
                  }}
                  className="p-2 text-slate-400 hover:text-brand-600 transition-colors"
                >
                  <Edit2 size={18} />
                </button>
              </div>
              <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-6">Account Details</h4>
              <div className="space-y-4">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Bank Name</p>
                  <p className="text-sm font-bold text-slate-800">{banks.find(b => b.id === selectedBankId)?.bankName}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Branch / Address</p>
                  <p className="text-sm font-medium text-slate-600">{banks.find(b => b.id === selectedBankId)?.branch || 'Main Branch'}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Account Holder</p>
                  <p className="text-sm font-medium text-slate-600">{banks.find(b => b.id === selectedBankId)?.accountHolderName}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Account Number</p>
                  <p className="text-base font-mono text-slate-800 font-bold">{banks.find(b => b.id === selectedBankId)?.accountNumber}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">IFSC Code</p>
                  <p className="text-sm font-mono text-slate-600">{banks.find(b => b.id === selectedBankId)?.ifsc}</p>
                </div>
              </div>
            </motion.div>
          )}

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-6">Performance</h4>
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
                    <TrendingUp size={20} />
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase font-bold">Total Inflow</p>
                    <p className="text-lg font-black text-emerald-600">₹{Accounting.formatIndian(stats.inflow)}</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-red-50 text-red-600 rounded-xl">
                    <TrendingDown size={20} />
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase font-bold">Total Outflow</p>
                    <p className="text-lg font-black text-red-600">₹{Accounting.formatIndian(stats.outflow)}</p>
                  </div>
                </div>
              </div>
              <div className="pt-6 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-bold text-slate-500">Net Position</p>
                  <p className={`text-lg font-black ${stats.net >= 0 ? 'text-brand-600' : 'text-red-600'}`}>
                    {stats.net >= 0 ? '+' : ''}₹{Accounting.formatIndian(stats.net)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-brand-600 to-brand-800 text-white p-6 rounded-2xl shadow-2xl relative overflow-hidden">
            <div className="relative z-10">
              <ShieldCheck className="text-brand-300 mb-4" size={36} />
              <h4 className="font-black text-xl mb-2">Ledger Intelligence</h4>
              <p className="text-brand-100 text-xs leading-relaxed font-medium">
                {stats.net < 0 ? 'Cash flow dropped this month. Review your expenses to maintain a healthy balance.' : 'Positive cash flow detected! Your financial health is improving. Consider reinvesting surpluses.'}
              </p>
            </div>
            <div className="absolute -right-8 -bottom-8 opacity-10">
              <Landmark size={160} />
            </div>
          </div>
        </div>

        {/* Transaction List & Filters */}
        <div className="lg:col-span-3 space-y-4">
          <div className="bg-white p-3 rounded-2xl shadow-sm border border-slate-200 flex flex-wrap items-center gap-3">
            <div className="flex-1 min-w-[200px] relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text"
                placeholder="Search transactions..."
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 text-slate-800 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none transition-all placeholder:text-slate-400 text-sm"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <select 
                className="bg-slate-50 text-slate-700 border border-slate-200 rounded-xl px-3 py-2.5 text-xs focus:ring-2 focus:ring-brand-500 outline-none transition-all"
                value={filterType}
                onChange={e => setFilterType(e.target.value as any)}
              >
                <option value="ALL">All Types</option>
                <option value="CREDIT">Credits Only</option>
                <option value="DEBIT">Debits Only</option>
              </select>
              <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl px-2">
                <Calendar size={16} className="text-slate-400" />
                <input 
                  type="date"
                  className="bg-transparent text-slate-700 border-none text-xs p-2.5 outline-none"
                  value={dateRange.start}
                  onChange={e => setDateRange({...dateRange, start: e.target.value})}
                />
                <span className="text-slate-300 mx-0.5">-</span>
                <input 
                  type="date"
                  className="bg-transparent text-slate-700 border-none text-xs p-2.5 outline-none"
                  value={dateRange.end}
                  onChange={e => setDateRange({...dateRange, end: e.target.value})}
                />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="px-6 py-5 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Date & Ref</th>
                    <th className="px-6 py-5 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Particulars</th>
                    <th className="px-6 py-5 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Bank</th>
                    <th className="px-6 py-5 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-right">Amount</th>
                    <th className="px-6 py-5 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredTransactions.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-20 text-center">
                        <div className="flex flex-col items-center text-slate-400">
                          <History size={48} className="mb-4 opacity-20" />
                          <p className="text-sm font-medium">No transactions found for this selection.</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredTransactions.map(tx => {
                      const bank = banks.find(b => b.id === tx.bankId);
                      const toBank = banks.find(b => b.id === tx.toBankId);
                      const isCredit = tx.type === TransactionType.CREDIT || (tx.category === TransactionCategory.TRANSFER && tx.toBankId === selectedBankId);
                      const isTransfer = tx.category === TransactionCategory.TRANSFER;

                      return (
                        <tr key={tx.id} className="hover:bg-slate-50 transition-colors group">
                          <td className="px-6 py-4">
                            <p className="text-sm font-bold text-slate-800">{new Date(tx.date).toLocaleDateString()}</p>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span className="text-[10px] font-bold text-brand-600 tracking-widest uppercase">
                                {getMethodShortcut(tx.method)}
                              </span>
                              <span className="text-[10px] text-slate-400 font-mono tracking-tighter truncate max-w-[80px]">
                                {tx.referenceId || tx.id.slice(0, 8)}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center space-x-3">
                              <div className={`p-1.5 rounded-lg ${isTransfer ? 'bg-brand-50 text-brand-600' : isCredit ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                                {isTransfer ? <History size={14} /> : isCredit ? <ArrowDownLeft size={14} /> : <ArrowUpRight size={14} />}
                              </div>
                              <span className="text-sm font-medium text-slate-700 truncate max-w-[200px]">{tx.particulars}</span>
                            </div>
                            {tx.tags && tx.tags.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-2">
                                {tx.tags.map(tag => (
                                  <span key={tag} className="text-[9px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-md uppercase font-black border border-slate-200">{tag}</span>
                                ))}
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            {isTransfer ? (
                              <div className="flex items-center space-x-2 text-xs">
                                <span className="font-bold text-slate-500">{bank?.bankName || 'N/A'}</span>
                                <ChevronRight size={12} className="text-slate-400" />
                                <span className="font-bold text-brand-600">{toBank?.bankName || 'N/A'}</span>
                              </div>
                            ) : (
                              <span className="text-xs font-bold text-slate-500">{bank?.bankName || 'N/A'}</span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <p className={`text-sm font-black ${isCredit ? 'text-emerald-600' : 'text-red-600'}`}>
                              {isCredit ? '+' : '-'}₹{Accounting.formatIndian(tx.amount)}
                            </p>
                          </td>
                          <td className="px-6 py-4 text-center">
                             <button 
                               onClick={async () => {
                                 const updatedTx = { ...tx, isVerified: !tx.isVerified };
                                 await dbService.saveTransaction(updatedTx);
                                 loadData();
                               }}
                               className={`transition-all transform hover:scale-110 ${tx.isVerified ? 'text-emerald-500' : 'text-slate-300 hover:text-slate-400'}`}
                             >
                               <CheckCircle size={22} />
                             </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Add/Edit Bank Modal */}
      <AnimatePresence>
        {showAddBank && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-200"
            >
              <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                <div>
                  <h3 className="text-base font-black text-slate-800">{editingBank ? 'Edit Bank Profile' : 'New Bank Profile'}</h3>
                  <p className="text-[9px] text-slate-500 uppercase font-bold tracking-wider">Enter bank account details below</p>
                </div>
                <button onClick={() => { setShowAddBank(false); setEditingBank(null); }} className="p-1.5 text-slate-400 hover:text-slate-600 transition-colors"><X size={18} /></button>
              </div>
              <form onSubmit={handleSaveBank} className="p-4 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1">Bank Name</label>
                    <input 
                      type="text"
                      className="w-full bg-slate-50 text-slate-800 border border-slate-200 rounded-lg p-2 text-xs focus:ring-2 focus:ring-brand-500 outline-none transition-all placeholder:text-slate-400"
                      placeholder="e.g. HDFC Bank"
                      value={newBank.bankName}
                      onChange={e => setNewBank({...newBank, bankName: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1">Branch Name</label>
                    <input 
                      type="text"
                      className="w-full bg-slate-50 text-slate-800 border border-slate-200 rounded-lg p-2 text-xs focus:ring-2 focus:ring-brand-500 outline-none transition-all placeholder:text-slate-400"
                      placeholder="e.g. MG Road"
                      value={newBank.branch}
                      onChange={e => setNewBank({...newBank, branch: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1">Account Holder</label>
                    <input 
                      type="text"
                      className="w-full bg-slate-50 text-slate-800 border border-slate-200 rounded-lg p-2 text-xs focus:ring-2 focus:ring-brand-500 outline-none transition-all placeholder:text-slate-400"
                      placeholder="Full Name"
                      value={newBank.accountHolderName}
                      onChange={e => setNewBank({...newBank, accountHolderName: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1">Account Number</label>
                    <input 
                      type="text"
                      className="w-full bg-slate-50 text-slate-800 border border-slate-200 rounded-lg p-2 text-xs focus:ring-2 focus:ring-brand-500 outline-none transition-all font-mono placeholder:text-slate-400"
                      placeholder="0000 0000 0000"
                      value={newBank.accountNumber}
                      onChange={e => setNewBank({...newBank, accountNumber: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1">IFSC Code</label>
                    <input 
                      type="text"
                      className="w-full bg-slate-50 text-slate-800 border border-slate-200 rounded-lg p-2 text-xs focus:ring-2 focus:ring-brand-500 outline-none transition-all font-mono placeholder:text-slate-400"
                      placeholder="HDFC0001234"
                      value={newBank.ifsc}
                      onChange={e => setNewBank({...newBank, ifsc: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1">Opening Balance</label>
                    <input 
                      type="number"
                      className="w-full bg-slate-50 text-slate-800 border border-slate-200 rounded-lg p-2 text-xs focus:ring-2 focus:ring-brand-500 outline-none transition-all font-mono placeholder:text-slate-400"
                      placeholder="0.00"
                      value={newBank.openingBalance}
                      onChange={e => setNewBank({...newBank, openingBalance: Number(e.target.value)})}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1">Account Type</label>
                    <select 
                      className="w-full bg-slate-50 text-slate-800 border border-slate-200 rounded-lg p-2 text-xs focus:ring-2 focus:ring-brand-500 outline-none transition-all"
                      value={newBank.accountType}
                      onChange={e => setNewBank({...newBank, accountType: e.target.value as BankAccountType})}
                    >
                      {Object.values(BankAccountType).map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1">Color Tag</label>
                    <div className="flex items-center gap-1.5 bg-slate-50 p-1.5 rounded-lg border border-slate-200">
                      {['#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4'].map(color => (
                        <button 
                          key={color}
                          type="button"
                          onClick={() => setNewBank({...newBank, colorTag: color})}
                          className={`w-5 h-5 rounded-full border-2 transition-all transform hover:scale-110 ${newBank.colorTag === color ? 'scale-110 border-white shadow-md' : 'border-transparent'}`}
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
                <div className="pt-1">
                  <button 
                    type="submit"
                    className="w-full bg-brand-600 text-white py-3 rounded-xl font-black hover:bg-brand-700 transition-all shadow-lg text-xs uppercase tracking-widest"
                  >
                    {editingBank ? 'Update Profile' : 'Create Profile'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
