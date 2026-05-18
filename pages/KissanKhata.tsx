
import React, { useState, useEffect } from 'react';
import { Search, MapPin, ChevronRight, Plus, Tractor, LandPlot } from 'lucide-react';
import { Link } from 'react-router-dom';
import { dbService } from '../services/db';
import { Kissan, Transaction } from '../types';
import { useLanguage } from '../services/i18n';
import { Accounting } from '../services/accounting';

export const KissanKhata: React.FC = () => {
  const [farmers, setFarmers] = useState<Kissan[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const { t } = useLanguage();

  useEffect(() => {
    const loadData = async () => {
      const [f, tData] = await Promise.all([
        dbService.getKissans(),
        dbService.getTransactions()
      ]);
      setFarmers(f);
      setTransactions(tData);
    };
    loadData();
    const unsubscribe = dbService.subscribe(loadData);
    return () => unsubscribe();
  }, []);

  const search = searchTerm.toLowerCase();
  const filteredFarmers = farmers.filter(f => {
    const ownerNames = Array.isArray(f.owners) ? f.owners : [];

    return (
      (f.landName || '').toLowerCase().includes(search) ||
      (f.village || '').toLowerCase().includes(search) ||
      ownerNames.some(o => (o.name || '').toLowerCase().includes(search))
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Search by land name, village or owner..."
            className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <Link to="/add-kissan" className="flex items-center justify-center px-4 py-2 bg-spiritual-maroon text-white rounded-lg hover:bg-red-900 text-sm font-medium">
            <Plus size={18} className="mr-2" /> {t('add_kissan')}
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredFarmers.map(farmer => {
          const kissanTxs = transactions.filter(t => t.kissanId === farmer.id);
          const totalPaid = kissanTxs
            .filter(t => t.type === 'DEBIT')
            .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
          const totalCredits = kissanTxs
            .filter(t => t.type === 'CREDIT')
            .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
          
          const totalLandValue = Number(farmer.totalLandValue) || 0;
          const computedBalance = Accounting.subtract(Accounting.add(totalLandValue, totalCredits), totalPaid);
          
          return (
            <KissanCard key={farmer.id} farmer={{...farmer, balance: computedBalance}} totalLandValue={totalLandValue} totalPaid={totalPaid} />
          );
        })}
      </div>
    </div>
  );
};

const KissanCard: React.FC<{ farmer: Kissan; totalLandValue: number; totalPaid: number }> = ({ farmer, totalLandValue, totalPaid }) => (
  <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5 hover:shadow-md transition-all group">
    <div className="flex justify-between items-start mb-4">
      <div className="flex items-center">
        <div className="w-10 h-10 bg-brand-50 rounded-full flex items-center justify-center text-brand-600 mr-3 group-hover:scale-110 transition-transform">
           <Tractor size={20} />
        </div>
        <div>
          <h3 className="font-semibold text-lg text-slate-800">{farmer.landName || 'Unnamed Agriculture Land'}</h3>
          <p className="text-[10px] font-bold text-brand-600 uppercase tracking-tighter">Kisaan ID: {farmer.id}</p>
          <p className="text-xs text-slate-400">{[farmer.mouza, farmer.tehsil].filter(Boolean).join(', ') || 'Location not set'}</p>
        </div>
      </div>
      <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${(farmer.balance || 0) > 0 ? 'bg-orange-50 text-orange-600' : 'bg-green-50 text-green-600'}`}>
        {(farmer.balance || 0) > 0 ? 'Payment Due' : 'Paid'}
      </span>
    </div>

    <div className="space-y-2 text-sm text-slate-500 mb-6">
      <div className="flex items-center">
        <MapPin size={14} className="mr-2" /> {[farmer.village, farmer.district].filter(Boolean).join(', ') || 'Address not set'}
      </div>
      <div className="flex items-center">
        <LandPlot size={14} className="mr-2" /> {farmer.landArea || 'Area not set'} (Khasra: {farmer.khasraNumber || 'N/A'})
      </div>
      <div className="flex items-center text-xs text-slate-400 italic">
        {(farmer.owners || []).length} Owners: {(farmer.owners || []).map(o => o.name || 'Unnamed Owner').join(', ') || 'No owners added'}
      </div>
    </div>

    <div className="grid grid-cols-2 gap-4 mb-4 pt-4 border-t border-slate-50">
      <div>
        <p className="text-[10px] text-slate-400 font-bold uppercase">Total Value</p>
        <p className="text-xs font-bold text-blue-600">{Accounting.formatIndian(totalLandValue)}</p>
      </div>
      <div className="text-right">
        <p className="text-[10px] text-slate-400 font-bold uppercase">Total Paid</p>
        <p className="text-xs font-bold text-green-600">{Accounting.formatIndian(totalPaid)}</p>
      </div>
    </div>

    <div className="flex items-end justify-between border-t border-slate-50 pt-4">
      <div>
        <p className="text-[10px] text-red-500 font-bold uppercase mb-1">Total Payable (Outstanding)</p>
        <p className="text-lg font-black text-red-600 font-mono">
          {Accounting.formatMoney(farmer.balance || 0)}
        </p>
      </div>
      <Link to={`/kissan-khata/${encodeURIComponent(farmer.id)}`} className="p-2 bg-brand-50 rounded-full text-brand-600 hover:bg-brand-100 transition-colors">
        <ChevronRight size={20} />
      </Link>
    </div>
  </div>
);
