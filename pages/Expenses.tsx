
import React, { useState, useEffect } from 'react';
import { Plus, Filter, ArrowDown } from 'lucide-react';
import { Link } from 'react-router-dom';
import { dbService } from '../services/db';
import { Transaction, TransactionCategory, TransactionType } from '../types';
import { TransactionTable } from '../components/Shared';
import { Accounting } from '../services/accounting';
import { sortTransactions, SortOrder } from '../utils/sorting';

export const Expenses: React.FC = () => {
  const [expenses, setExpenses] = useState<Transaction[]>([]);
  const [totalExpense, setTotalExpense] = useState(0);
  const [sortOrder, setSortOrder] = useState<SortOrder>('newest');

  useEffect(() => {
    loadData();
  }, [sortOrder]);

  const loadData = async () => {
    const all = await dbService.getTransactions();
    // Filter for Category EXPENSE OR KISSAN_PAYMENT (if it's a debit/payment)
    const exp = all.filter(t => 
      t.category === TransactionCategory.EXPENSE || 
      (t.category === TransactionCategory.KISSAN_PAYMENT && t.type === TransactionType.DEBIT)
    );
    setExpenses(sortTransactions(exp, sortOrder));
    const total = exp.reduce((acc, t) => Accounting.add(acc, t.amount), 0);
    setTotalExpense(total);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Expenses</h1>
          <p className="text-sm text-slate-500">Manage office costs, salaries, and operational payments.</p>
        </div>
        <Link to="/add-transaction" className="flex items-center bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 font-medium shadow-sm">
          <Plus size={18} className="mr-2" /> Add Expense
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-500 uppercase">Total Expenses (All Time)</p>
              <p className="text-3xl font-bold text-slate-800 mt-2">₹{Accounting.formatIndian(totalExpense)}</p>
              <p className="text-xs text-slate-400 italic mt-1">{Accounting.formatIndianWords(totalExpense)}</p>
            </div>
            <div className="bg-red-50 p-4 rounded-full text-red-600">
               <ArrowDown size={32} />
            </div>
          </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200">
        <div className="p-4 border-b border-slate-100 flex justify-between items-center">
          <span className="font-semibold text-slate-700">Expense History</span>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setSortOrder(sortOrder === 'newest' ? 'oldest' : 'newest')}
              className="text-slate-500 hover:text-slate-800 text-sm flex items-center bg-slate-50 px-3 py-1 rounded-lg border border-slate-200 transition-all"
            >
              <Filter size={14} className="mr-1" />
              {sortOrder === 'newest' ? 'Newest First' : 'Oldest First'}
            </button>
          </div>
        </div>
        <TransactionTable transactions={expenses} onUpdate={loadData} />
      </div>
    </div>
  );
};
