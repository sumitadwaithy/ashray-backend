
import React, { useState, useEffect, useMemo } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon, 
  Search, 
  Download, 
  Printer, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Activity,
  Filter,
  FileText
} from 'lucide-react';
import { dbService } from '../services/db';
import { Transaction, TransactionType, TransactionCategory, PaymentMethod } from '../types';
import { Accounting } from '../services/accounting';
import { sortTransactions, SortOrder } from '../utils/sorting';
import { StatementPrintView } from '../components/StatementTemplate';
import { TransactionTable } from '../components/Shared';

export const DayBook: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [allTransactions, setAllTransactions] = useState<Transaction[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState<SortOrder>('newest');
  const [isLoading, setIsLoading] = useState(true);
  const [showPrintPreview, setShowPrintPreview] = useState(false);

  useEffect(() => {
    loadData();
    const unsubscribe = dbService.subscribe(loadData);
    return () => unsubscribe();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    const all = await dbService.getTransactions();
    setAllTransactions(all);
    setIsLoading(false);
  };

  const dayTransactions = useMemo(() => {
    const filtered = allTransactions
      .filter(t => t.date === selectedDate)
      .filter(t => 
        !(t.type === TransactionType.CREDIT && 
          t.category === TransactionCategory.KISSAN_PAYMENT && 
          t.method === PaymentMethod.JOURNAL)
      )
      .filter(t => 
        (t.particulars || '').toLowerCase().includes((searchQuery || '').toLowerCase()) ||
        (t.referenceId || '').toLowerCase().includes((searchQuery || '').toLowerCase())
      );
    
    return sortTransactions(filtered, sortOrder);
  }, [allTransactions, selectedDate, searchQuery, sortOrder]);

  const stats = useMemo(() => {
    // Filter out Land Purchase Agreement transactions for balance calculations
    const filteredForStats = allTransactions.filter(t => 
      !(t.type === TransactionType.CREDIT && 
        t.category === TransactionCategory.KISSAN_PAYMENT && 
        t.method === PaymentMethod.JOURNAL)
    );

    // 1. Calculate Opening Balance (Sum of all transactions before selectedDate)
    const openingBalance = filteredForStats
      .filter(t => new Date(t.date) < new Date(selectedDate))
      .reduce((acc, t) => {
        if (t.type === TransactionType.CREDIT) return Accounting.add(acc, t.amount);
        return Accounting.subtract(acc, t.amount);
      }, 0);

    // 2. Day's In/Out
    const dayIn = filteredForStats
      .filter(t => t.date === selectedDate && t.type === TransactionType.CREDIT)
      .reduce((acc, t) => Accounting.add(acc, t.amount), 0);
    
    const dayOut = filteredForStats
      .filter(t => t.date === selectedDate && t.type === TransactionType.DEBIT)
      .reduce((acc, t) => Accounting.add(acc, t.amount), 0);

    // 3. Closing Balance
    const closingBalance = Accounting.add(Accounting.subtract(openingBalance, dayOut), dayIn);

    return {
      openingBalance,
      dayIn,
      dayOut,
      closingBalance,
      count: dayTransactions.length
    };
  }, [allTransactions, selectedDate, dayTransactions]);

  const changeDate = (days: number) => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + days);
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  const handlePrint = () => {
    setShowPrintPreview(true);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 print:space-y-4">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 print:hidden">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center">
            <FileText className="mr-2 text-brand-600" size={24} /> Day Book
          </h1>
          <p className="text-sm text-slate-500 mt-1">Daily transaction summary and cash flow</p>
        </div>
        
        <div className="flex items-center space-x-2">
          <div className="flex items-center bg-white p-1 rounded-xl border border-slate-200 shadow-sm">
            <button 
              onClick={() => changeDate(-1)} 
              className="p-2 hover:bg-slate-100 rounded-lg text-slate-600 transition-colors"
            >
              <ChevronLeft size={20}/>
            </button>
            <div className="flex items-center px-3 border-x border-slate-100">
              <CalendarIcon size={18} className="mr-2 text-brand-600" />
              <input 
                type="date" 
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="bg-transparent font-bold text-slate-800 outline-none cursor-pointer"
              />
            </div>
            <button 
              onClick={() => changeDate(1)} 
              className="p-2 hover:bg-slate-100 rounded-lg text-slate-600 transition-colors"
            >
              <ChevronRight size={20}/>
            </button>
          </div>
          
          <button 
            onClick={handlePrint}
            className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 shadow-sm transition-all"
            title="Print Day Book"
          >
            <Printer size={20} />
          </button>
          
          <button 
            className="p-2.5 bg-brand-600 text-white rounded-xl hover:bg-brand-700 shadow-md shadow-brand-200 transition-all flex items-center space-x-2"
          >
            <Download size={18} />
            <span className="hidden sm:inline font-semibold text-sm">Export</span>
          </button>
        </div>
      </div>

      {/* Print Header (Visible only when printing) */}
      <div className="hidden print:block text-center border-b-2 border-slate-800 pb-4 mb-6">
        <h1 className="text-3xl font-bold uppercase tracking-widest">Ashray Group Day Book</h1>
        <p className="text-lg font-semibold mt-2">Date: {new Date(selectedDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
      </div>

      {/* Summary Cards - Advanced Ledger Style */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard 
          label="Opening Balance" 
          value={stats.openingBalance} 
          icon={<Activity size={18} />}
          color="slate"
        />
        <SummaryCard 
          label="Total Receipts (In)" 
          value={stats.dayIn} 
          icon={<ArrowDownLeft size={18} />}
          color="green"
          isPositive
        />
        <SummaryCard 
          label="Total Payments (Out)" 
          value={stats.dayOut} 
          icon={<ArrowUpRight size={18} />}
          color="red"
          isNegative
        />
        <SummaryCard 
          label="Closing Balance" 
          value={stats.closingBalance} 
          icon={<Activity size={18} />}
          color="brand"
          highlight
        />
      </div>

      {/* Main Ledger Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text"
              placeholder="Search by particulars or reference..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
            />
          </div>
          
          <div className="flex items-center space-x-2 text-sm font-medium text-slate-500">
            <button 
              onClick={() => setSortOrder(sortOrder === 'newest' ? 'oldest' : 'newest')}
              className="flex items-center gap-1 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg hover:bg-slate-100 transition-all"
            >
              <Filter size={14} />
              <span>{sortOrder === 'newest' ? 'Newest First' : 'Oldest First'}</span>
            </button>
            <span>{dayTransactions.length} Transactions Found</span>
          </div>
        </div>

        <TransactionTable transactions={dayTransactions} onUpdate={loadData} />
        
        {/* Footer Info */}
        <div className="p-4 bg-slate-50/50 border-t border-slate-100 text-[10px] text-slate-400 flex justify-between items-center">
          <div>Generated on {new Date().toLocaleString()}</div>
          <div className="font-mono uppercase tracking-widest">Ashray Advanced Ledger v2.0</div>
        </div>
      </div>

      {showPrintPreview && (
        <StatementPrintView
          open={showPrintPreview}
          onClose={() => setShowPrintPreview(false)}
          title="Daily Transaction Book"
          subtitle={`Day Book for ${new Date(selectedDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}`}
          type="ledger"
          data={{
            transactions: [
              { date: '---', particulars: 'Opening Balance B/F', amount: Math.abs(stats.openingBalance), type: stats.openingBalance >= 0 ? TransactionType.CREDIT : TransactionType.DEBIT, balance: stats.openingBalance, method: 'N/A' },
              ...dayTransactions.map(tx => ({ ...tx, balance: 0 }))
            ],
            totals: {
              debit: stats.dayOut,
              credit: stats.dayIn,
              balance: stats.closingBalance
            }
          }}
          partyName="Ashray Group"
          partyDetails={`Date: ${selectedDate}\nTransactions: ${dayTransactions.length}`}
        />
      )}
    </div>
  );
};

interface SummaryCardProps {
  label: string;
  value: number;
  icon: React.ReactNode;
  color: 'slate' | 'green' | 'red' | 'brand';
  highlight?: boolean;
  isPositive?: boolean;
  isNegative?: boolean;
}

const SummaryCard: React.FC<SummaryCardProps> = ({ label, value, icon, color, highlight, isPositive, isNegative }) => {
  const colors = {
    slate: 'bg-white border-slate-200 text-slate-600 icon:bg-slate-100 icon:text-slate-600',
    green: 'bg-white border-green-100 text-green-600 icon:bg-green-50 icon:text-green-600',
    red: 'bg-white border-red-100 text-red-600 icon:bg-red-50 icon:text-red-600',
    brand: 'bg-brand-600 border-brand-700 text-white icon:bg-white/20 icon:text-white'
  };

  const config = colors[color];
  const iconClass = config.split('icon:').slice(1).join(' ');
  const baseClass = config.split('icon:')[0];

  return (
    <div className={`p-5 rounded-2xl border shadow-sm transition-all hover:shadow-md ${baseClass} ${highlight ? 'ring-2 ring-brand-500/20' : ''}`}>
      <div className="flex justify-between items-start mb-3">
        <p className={`text-[10px] font-bold uppercase tracking-widest opacity-80 ${color === 'brand' ? 'text-brand-100' : 'text-slate-400'}`}>
          {label}
        </p>
        <div className={`p-2 rounded-xl ${iconClass}`}>
          {icon}
        </div>
      </div>
      <div className="space-y-1">
        <h3 className="text-xl font-bold font-mono tracking-tight">
          {isNegative && '-'}₹{Accounting.formatIndian(Math.abs(value))}
        </h3>
        <p className={`text-[10px] italic opacity-70 ${color === 'brand' ? 'text-brand-100' : 'text-slate-500'}`}>
          {Accounting.formatIndianWords(Math.abs(value))}
        </p>
      </div>
    </div>
  );
};
