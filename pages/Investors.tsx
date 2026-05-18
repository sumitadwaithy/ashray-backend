
import React, { useState, useEffect } from 'react';
import { Search, Phone, MapPin, ChevronRight, Plus, TrendingUp, RefreshCcw } from 'lucide-react';
import { Link } from 'react-router-dom';
import { dbService } from '../services/db';
import { Investor, PropertyMarketUpdate } from '../types';
import { useLanguage } from '../services/i18n';
import { PropertyMarketUpdateModal } from '../components/PropertyMarketUpdateModal';
import { InvestorEngine } from '../services/investorEngine';

export const Investors: React.FC = () => {
  const [investors, setInvestors] = useState<Investor[]>([]);
  const [marketUpdates, setMarketUpdates] = useState<PropertyMarketUpdate[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { t } = useLanguage();

  const loadData = () => {
    Promise.all([
      dbService.getInvestors(),
      dbService.getPropertyMarketUpdates()
    ]).then(([invs, updates]) => {
      setInvestors(invs);
      setMarketUpdates(updates);
    });
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredInvestors = investors.filter(i => {
    const search = searchTerm?.toLowerCase() || '';
    return (i.name?.toLowerCase() || '').includes(search) ||
           (i.email?.toLowerCase() || '').includes(search);
  });

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Search investors by name..."
            className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <button 
             onClick={() => setIsModalOpen(true)}
             className="flex items-center justify-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-medium"
          >
            <TrendingUp size={18} className="mr-2" /> Market Updates
          </button>
          <Link to="/add-investor" className="flex items-center justify-center px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-white-700 text-sm font-medium">
            <Plus size={18} className="mr-2" /> {t('add_investor')}
          </Link>
        </div>
      </div>

      <PropertyMarketUpdateModal 
        isOpen={isModalOpen} 
        onClose={() => {
          setIsModalOpen(false);
          loadData();
        }} 
      />

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredInvestors.map(investor => {
          const marketValue = InvestorEngine.calculateValuation(investor, marketUpdates);
          return (
            <InvestorCard 
              key={investor.id} 
              investor={investor} 
              marketValue={marketValue}
              t={t} 
            />
          );
        })}
      </div>
    </div>
  );
};

const InvestorCard: React.FC<{ investor: Investor, marketValue: number, t: any }> = ({ investor, marketValue, t }) => {
  const returns = InvestorEngine.calculateReturns(investor, marketValue);
  const isUp = marketValue >= (investor.totalInvested || 0);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5 hover:shadow-md transition-shadow flex flex-col h-full group">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="font-bold text-lg text-slate-800">{investor.name}</h3>
          <p className="text-[10px] text-slate-400 font-mono tracking-tighter uppercase">ID: {investor.id}</p>
        </div>
        <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-widest ${investor.status === 'Active' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-slate-50 text-slate-500 border border-slate-100'}`}>
          {investor.status}
        </span>
      </div>

      <div className="space-y-2 text-sm text-slate-500 mb-6 flex-1">
        <div className="flex items-center">
          <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 mr-3 group-hover:bg-brand-50 group-hover:text-brand-500 transition-colors">
            <Phone size={14} />
          </div>
          {investor.phone}
        </div>
        <div className="flex items-center">
          <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 mr-3 group-hover:bg-brand-50 group-hover:text-brand-500 transition-colors">
            <MapPin size={14} />
          </div>
          <span className="truncate">{investor.district}, {investor.state}</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 border-t border-slate-50 pt-4 mb-4">
         <div>
           <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest flex items-center mb-1">
             <TrendingUp size={12} className="mr-1 text-emerald-500"/> Invested
           </p>
           <p className="font-black text-slate-800">₹{(investor.totalInvested || 0).toLocaleString()}</p>
         </div>
         <div className="text-right">
           <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest flex items-center justify-end mb-1">
             Actual ROI <RefreshCcw size={10} className="ml-1 text-blue-500 animate-spin-slow"/>
           </p>
           <p className={`font-black ${isUp ? 'text-emerald-600' : 'text-red-600'}`}>
             {returns.actualReturnPercentage.toFixed(1)}%
           </p>
         </div>
      </div>

      <div className="flex items-end justify-between pt-2 bg-slate-900 -mx-5 -mb-5 p-4 border-t border-slate-800 rounded-b-xl group-hover:bg-brand-900 transition-colors">
        <div>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em]">{t('market_value')}</p>
          <p className="text-xl font-black text-white">
            ₹{marketValue.toLocaleString()}
          </p>
        </div>
        <Link to={`/investors/${investor.id}`} className="w-10 h-10 bg-white/10 hover:bg-white/20 flex items-center justify-center rounded-xl text-white transition-all">
          <ChevronRight size={20} />
        </Link>
      </div>
    </div>
  );
};
