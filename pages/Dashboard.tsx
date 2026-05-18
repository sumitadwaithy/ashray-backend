
import React, { useState, useEffect } from 'react';
import { TrendingUp, Users, AlertCircle, Clock, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { TransactionTable } from '../components/Shared';
import { dbService } from '../services/db';
import { Transaction, TransactionType, TransactionCategory, PaymentMethod } from '../types';
import { useLanguage } from '../services/i18n';
import { Accounting } from '../services/accounting';
import { sortTransactions } from '../utils/sorting';


export const Dashboard: React.FC = () => {
  const [recentTx, setRecentTx] = useState<Transaction[]>([]);
  const [stats, setStats] = useState({
    totalReceivables: 0,
    totalClients: 0,
    collectionsMonth: 0,
    pendingCount: 0
  });
  const { t } = useLanguage();

  const loadData = async () => {
    const [allTxs, clients] = await Promise.all([
      dbService.getTransactions(),
      dbService.getClients()
    ]);

    // Filter out Land Purchase Agreement transactions (Non-cash Journal entries)
    const txs = allTxs.filter(t => 
      !(t.type === TransactionType.CREDIT && 
        t.category === TransactionCategory.KISSAN_PAYMENT && 
        t.method === PaymentMethod.JOURNAL)
    );

    // 1. Set recent transactions (Sorted newest first)
    const sortedTxs = sortTransactions(txs, 'newest');
    setRecentTx(sortedTxs.slice(0, 5));

    // 2. Calculate Total Receivables (Sum of negative client balances)
    // Note: Ledger balance < 0 means Client owes us money.
    // Use Accounting engine for precision
    const receivables = clients.reduce((acc, c) => c.balance < 0 ? Accounting.add(acc, Math.abs(c.balance)) : acc, 0);

    // 3. Calculate Collections This Month
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const collections = txs
      .filter(t => t.type === TransactionType.CREDIT && new Date(t.date) >= firstDay)
      .reduce((acc, t) => Accounting.add(acc, t.amount), 0);

    // 4. Pending/Overdue (Simulation: Clients with > 50L outstanding)
    const pendingHighValue = clients.filter(c => c.balance < -5000000).length;

    setStats({
      totalReceivables: receivables,
      totalClients: clients.length,
      collectionsMonth: collections,
      pendingCount: pendingHighValue
    });
  };

  useEffect(() => {
    loadData();
    const unsubscribe = dbService.subscribe(loadData);
    return () => unsubscribe();
  }, []);

  return (
    <div className="space-y-8">
      {/* Stats Grid - Vibrant Colors */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard 
          title={t('collections_month')}
          value={`₹${Accounting.formatIndian(stats.collectionsMonth)}`} 
          change={t('cash_inflow')}
          icon={<TrendingUp className="text-white" size={24} />} 
          variant="green"
        />
        <StatCard 
          title={t('total_receivables')} 
          value={`₹${Accounting.formatIndian(stats.totalReceivables)}`} 
          change={t('market_outstanding')}
          icon={<Clock className="text-white" size={24} />} 
          variant="gold"
        />
        <StatCard 
          title={t('active_clients')} 
          value={stats.totalClients} 
          change={t('across_projects')}
          icon={<Users className="text-white" size={24} />} 
          variant="maroon"
        />
        <StatCard 
          title={t('high_value_dues')} 
          value={stats.pendingCount} 
          change={t('need_followup')}
          icon={<AlertCircle className="text-white" size={24} />} 
          variant="red"
        />
      </div>

      {/* Quick Actions */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-brand-100">
        <h2 className="text-sm font-bold text-spiritual-maroon uppercase tracking-wider mb-4 flex items-center">
          <span className="w-1 h-4 bg-brand-500 rounded-full mr-2"></span> {t('quick_actions')}
        </h2>
        <div className="flex flex-wrap gap-4">
          <ActionButton to="/add-transaction" label={t('new_transaction')} />
          <ActionButton to="/add-client" label={t('add_client')} />
          <ActionButton to="/add-loan" label={t('add_loan')} />
          <ActionButton to="/add-kissan" label={t('add_kissan')} />
          <ActionButton to="/add-investor" label={t('add_investor')} />
          <ActionButton to="/add-property" label={t('add_property')} />
          <ActionButton to="/add-transaction" label={t('add_expense')} state={{ partyType: 'EXPENSE' }} />
          <ActionButton to="/gst-book" label={t('add_gst')} state={{ openForm: true }} />
          <ActionButton to="/documents" label={t('upload_document')} />
          <ActionButton to="/ledger" label={t('view_ledger')} outline />
          <ActionButton to="/daybook" label={t('nav_daybook')} outline />
          <ActionButton to="/reports" label={t('ca_title')} outline />
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-white rounded-2xl shadow-sm border border-brand-100 overflow-hidden">
        <div className="px-6 py-5 border-b border-brand-50 flex justify-between items-center bg-brand-50/30">
          <h2 className="font-bold text-spiritual-maroon text-lg">{t('recent_transactions')}</h2>
          <Link to="/ledger" className="text-sm text-brand-600 hover:text-brand-700 font-semibold flex items-center hover:underline">
            {t('view_all')} <ArrowRight size={14} className="ml-1" />
          </Link>
        </div>
        <TransactionTable transactions={recentTx} />
      </div>
    </div>
  );
};

const ActionButton = ({ to, label, outline = false, state }: { to: string, label: string, outline?: boolean, state?: any }) => (
  <Link 
    to={to} 
    state={state}
    className={`
      px-5 py-3 rounded-xl text-sm font-semibold transition-all transform hover:-translate-y-0.5
      ${outline 
        ? 'bg-white border-2 border-brand-100 text-brand-700 hover:border-brand-300' 
        : 'bg-brand-50 text-brand-800 hover:bg-brand-100 border border-brand-100'
      }
    `}
  >
    {label}
  </Link>
);

const StatCard = ({ title, value, change, icon, variant }: any) => {
  const variants: any = {
    saffron: 'bg-gradient-to-br from-brand-500 to-brand-600 text-white',
    maroon: 'bg-gradient-to-br from-spiritual-maroon to-red-900 text-white',
    gold: 'bg-gradient-to-br from-yellow-500 to-amber-600 text-white',
    red: 'bg-gradient-to-br from-red-500 to-red-600 text-white',
    green: 'bg-gradient-to-br from-green-600 to-emerald-600 text-white'
  };

  const bgClass = variants[variant] || variants.saffron;

  return (
    <div className={`relative p-6 rounded-2xl shadow-lg overflow-hidden ${bgClass}`}>
      {/* Decorative Circle */}
      <div className="absolute -top-6 -right-6 w-24 h-24 bg-white opacity-10 rounded-full blur-xl"></div>
      
      <div className="flex justify-between items-start relative z-10">
        <div>
          <p className="text-xs font-medium opacity-90 uppercase tracking-wide">{title}</p>
          <h3 className="text-3xl font-bold mt-2 tracking-tight">{value}</h3>
          <p className="text-xs font-medium mt-2 opacity-80 bg-black/10 inline-block px-2 py-1 rounded-lg">
            {change}
          </p>
        </div>
        <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm shadow-inner">
          {icon}
        </div>
      </div>
    </div>
  );
};
