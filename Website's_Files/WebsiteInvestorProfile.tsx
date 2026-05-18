import React, { useState } from 'react';
import { Mail, Phone, MapPin, FileText, Activity, User, TrendingUp, TrendingDown, CreditCard, Building2, Landmark, Users, Briefcase, Download, Trash2, Globe, Eye, Shield, CalendarDays } from 'lucide-react';

export const InvestorProfile: React.FC<{ investor: any, docs?: any[] }> = ({ investor, docs = [] }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'ledger' | 'profile' | 'docs'>('overview');
  const [previewDoc, setPreviewDoc] = useState<any | null>(null);

  if (!investor) return null;

  const marketValuation = investor.currentMarketValue || investor.totalInvested || 0;
  const appreciation = marketValuation - (investor.totalInvested || 0);
  const actualReturnAmount = appreciation + (investor.totalInterestAccrued || 0) - (investor.totalReturns || 0);
  const actualReturnPercentage = investor.totalInvested > 0 ? (actualReturnAmount / investor.totalInvested) * 100 : 0;
  const projectedRoi = investor.totalInvested > 0 ? ((investor.totalInterestAccrued || 0) / investor.totalInvested) * 100 : 0;

  const formatIndian = (num: number) => {
    if (!num) return '₹0';
    return '₹' + num.toLocaleString('en-IN');
  };

  const transactions = investor.transactions || [];

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20 pt-8" style={{ marginTop: '2rem' }}>
      {/* Main Profile Card - Only Header and Summary Bar */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        
        {/* Header */}
        <div className="p-8 border-b border-slate-100 flex flex-col md:flex-row justify-between items-center bg-slate-50/30 gap-6">
           <div className="flex items-center flex-1">
             <div className="w-20 h-20 bg-red-600 rounded-2xl flex items-center justify-center text-2xl font-black text-white mr-6 shadow-xl shadow-red-200 rotate-3 animate-fade-in">
               {investor.title || ''} {(investor.name || 'Inv').substring(0, 2).toUpperCase()}
             </div>
             <div>
               <div className="flex items-center gap-3 mb-1">
                 <h1 className="text-3xl font-black text-slate-900 tracking-tight">{investor.title} {investor.name || investor.username}</h1>
                 <span className={`text-[10px] px-2.5 py-1 rounded-full font-black uppercase tracking-widest ${investor.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
                   {investor.status || 'Active'}
                 </span>
               </div>
                <div className="flex items-center space-x-4 flex-wrap gap-y-2">
                   <span className="text-[11px] text-slate-400 font-bold uppercase tracking-widest">ID: {investor.id}</span>
                   {investor.joinDate && <><span className="hidden md:inline w-1 h-1 bg-slate-300 rounded-full"></span><span className="text-[11px] text-slate-400 font-bold uppercase tracking-widest flex items-center"><CalendarDays size={12} className="mr-1.5" /> Since {investor.joinDate}</span></>}
                   <span className="hidden md:inline w-1 h-1 bg-slate-300 rounded-full"></span>
                  <span className="text-[11px] text-slate-400 font-bold uppercase tracking-widest flex items-center">
                    <Mail size={12} className="mr-1.5" /> {investor.email || 'N/A'}
                  </span>
                  <span className="hidden md:inline w-1 h-1 bg-slate-300 rounded-full"></span>
                  <span className="text-[11px] text-slate-400 font-bold uppercase tracking-widest flex items-center">
                    <Phone size={12} className="mr-1.5" /> {investor.countryCode || '+91'} {investor.phone || 'N/A'}
                  </span>
               </div>
             </div>
           </div>
           
           <div className="text-left md:text-right w-full md:w-auto mt-4 md:mt-0">
             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Portfolio Type</p>
             <div className="flex items-center md:justify-end gap-2">
               <span className="px-3 py-1.5 bg-slate-900 text-white rounded-lg text-xs font-black uppercase tracking-tighter">
                 {investor.propertyType || 'Standard'}
               </span>
             </div>
           </div>
        </div>

        {/* Dynamic Summary Bar */}
        <div className="grid grid-cols-2 lg:grid-cols-4 divide-y lg:divide-y-0 lg:divide-x divide-slate-100 bg-white">
           <div className="p-4 text-center hover:bg-slate-50 transition-colors">
             <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Principal</p>
             <p className="text-xl font-black text-slate-900 tracking-tighter">{formatIndian(investor.totalInvested || 0)}</p>
           </div>
           <div className="p-4 text-center hover:bg-slate-50 transition-colors">
             <p className="text-[10px] font-bold text-red-600 uppercase tracking-widest mb-1">Net Gain/Loss</p>
             <p className={`text-xl font-black tracking-tighter ${actualReturnAmount >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
               {actualReturnAmount >= 0 ? '+' : ''}{formatIndian(actualReturnAmount)}
             </p>
           </div>
           <div className="p-4 text-center hover:bg-slate-50 transition-colors">
             <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Current ROI</p>
             <p className="text-xl font-black text-slate-900 tracking-tighter">{actualReturnPercentage.toFixed(1)}%</p>
           </div>
           <div className="p-4 text-center hover:bg-slate-50 transition-colors">
             <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Expectation</p>
             <p className="text-xl font-black text-slate-900 tracking-tighter">
               {investor.interestRate || 0}% <span className="text-[10px] text-slate-400">p.a</span>
             </p>
             {investor.emiDuration && (
               <p className="text-[9px] font-black uppercase text-slate-400 mt-0.5 tracking-wider">
                 Duration: {investor.emiDuration} Months
               </p>
             )}
           </div>
        </div>

        {/* Tabs inside the main card for seamless look */}
        <div className="flex overflow-x-auto scrollbar-hide border-t border-b border-slate-200 bg-slate-50/50">
          <button 
            onClick={() => setActiveTab('overview')}
            className={`px-6 py-4 text-sm font-bold transition-all border-b-2 whitespace-nowrap flex items-center gap-2 ${activeTab === 'overview' ? 'border-red-600 text-red-600 bg-white' : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'}`}
          >
            <Activity size={16} /> Overview
          </button>
          <button 
            onClick={() => setActiveTab('ledger')}
            className={`px-6 py-4 text-sm font-bold transition-all border-b-2 whitespace-nowrap flex items-center gap-2 ${activeTab === 'ledger' ? 'border-red-600 text-red-600 bg-white' : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'}`}
          >
            <Landmark size={16} /> Ledger & Transactions
          </button>
          <button 
            onClick={() => setActiveTab('profile')}
            className={`px-6 py-4 text-sm font-bold transition-all border-b-2 whitespace-nowrap flex items-center gap-2 ${activeTab === 'profile' ? 'border-red-600 text-red-600 bg-white' : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'}`}
          >
            <User size={16} /> Profile Details
          </button>
          <button 
            onClick={() => setActiveTab('docs')}
            className={`px-6 py-4 text-sm font-bold transition-all border-b-2 whitespace-nowrap flex items-center gap-2 ${activeTab === 'docs' ? 'border-red-600 text-red-600 bg-white' : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'}`}
          >
            <FileText size={16} /> Documents ({docs.length})
          </button>
        </div>

        {/* Tab Content Area */}
        <div className="bg-white">
          
          {/* OVERVIEW TAB */}
          {activeTab === 'overview' && (
            <div className="p-8 animate-fade-in">
               <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-6 flex items-center">
                 <Activity size={16} className="mr-2 text-red-600" /> Investment Performance
               </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                  <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                     <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mb-2 flex items-center">
                       <TrendingUp size={14} className="mr-1.5 text-slate-400"/> Principal Invested
                     </p>
                     <p className="text-2xl font-black text-slate-900 tracking-tighter">{formatIndian(investor.totalInvested || 0)}</p>
                     <p className="text-[10px] font-bold text-slate-400 mt-1.5 uppercase tracking-widest">
                       Total Target: <span className="text-slate-600">{formatIndian(investor.totalAmount || investor.totalInvested || 0)}</span>
                     </p>
                  </div>

                  <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                     <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mb-2 flex items-center">
                       <Building2 size={14} className="mr-1.5 text-red-500"/> Current Market Value
                     </p>
                     <p className="text-2xl font-black text-red-600 tracking-tighter">{formatIndian(marketValuation)}</p>
                     <p className={`text-[10px] font-bold mt-1.5 uppercase tracking-widest ${actualReturnAmount >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                       {actualReturnAmount >= 0 ? 'Profit: ' : 'Loss: '} 
                       {formatIndian(Math.abs(actualReturnAmount))} ({actualReturnPercentage.toFixed(1)}%)
                     </p>
                  </div>
                  
                  <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                     <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mb-2 flex items-center">
                       <TrendingUp size={14} className="mr-1.5 text-emerald-500"/> Interest Accrued
                     </p>
                     <p className="text-2xl font-black text-emerald-600 tracking-tighter">{formatIndian(investor.totalInterestAccrued || 0)}</p>
                     <p className="text-[10px] font-bold text-emerald-600 mt-1.5 uppercase tracking-widest cursor-help" title="Projected overall yield currently">
                       {projectedRoi.toFixed(1)}% Projected Yield
                     </p>
                   </div>
                   
                   <div className="bg-orange-50 p-6 rounded-2xl border border-orange-100">
                      <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mb-2 flex items-center">
                        <TrendingDown size={14} className="mr-1.5 text-orange-500"/> Total Returns Paid
                      </p>
                      <p className="text-2xl font-black text-orange-700 tracking-tighter">{formatIndian(investor.totalReturns || 0)}</p>
                      <p className="text-[10px] font-bold text-orange-500 mt-1.5 uppercase tracking-widest">
                        Cumulative Payouts
                      </p>
                   </div>
                   
                   <div className="bg-red-600 p-6 rounded-2xl shadow-lg shadow-red-200 border border-red-500 text-white relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-4 opacity-10">
                        <Activity size={64} />
                      </div>
                      <p className="text-xs text-red-100 font-bold uppercase tracking-widest mb-2 flex items-center relative z-10">
                        <Activity size={14} className="mr-1.5"/> Portfolio Balance
                      </p>
                      <p className="text-3xl font-black tracking-tighter relative z-10">{formatIndian(marketValuation + (investor.totalInterestAccrued || 0) - (investor.totalReturns || 0))}</p>
                      <p className="text-[9px] font-bold text-red-200 mt-2 uppercase tracking-widest relative z-10">Market Value + Interest - Payouts</p>
                   </div>
                </div>

               <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Linked Properties Summary */}
                  <div>
                    <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest mb-4 flex items-center bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <Globe size={14} className="mr-2 text-red-600" /> Active Asset Link
                    </h3>
                    <div className="p-5 bg-white border border-slate-200 rounded-2xl">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center text-red-600 shadow-sm border border-red-100">
                          {investor.propertyType === 'Agricultural Land' ? <Globe size={24} /> : <Building2 size={24} />}
                        </div>
                        <div className="flex-1 overflow-hidden">
                          <p className="text-[10px] font-black text-red-600 uppercase tracking-widest mb-1">Linked {investor.propertyType === 'Agricultural Land' ? 'Land' : 'Project'}</p>
                          <p className="text-base font-black text-slate-900 truncate tracking-tight">{investor.investedPropertyName || 'None active'}</p>
                        </div>
                      </div>
                      {investor.selectedPlotId ? (
                        <div className="bg-slate-50 px-4 py-3 rounded-xl border border-slate-100 flex justify-between items-center">
                          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Unit / Plot Ref:</span>
                          <span className="text-xs font-black text-slate-900 bg-white border border-slate-200 px-3 py-1 rounded-lg shadow-sm">
                            {investor.selectedPlotId.split('_').pop() || '#N/A'}
                          </span>
                        </div>
                      ) : (
                        <p className="text-xs text-slate-400 italic">No specific plot or unit assigned</p>
                      )}
                    </div>
                  </div>

                  {/* Quick Banking Summary */}
                  <div>
                    <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest mb-4 flex items-center bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <Landmark size={14} className="mr-2 text-red-600" /> Settlement Account
                    </h3>
                    <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-lg relative overflow-hidden h-[134px]">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16"></div>
                      <p className="text-[10px] font-black tracking-widest mb-4 opacity-60">PRIMARY BANK</p>
                      <p className="text-lg font-black tracking-widest mb-1 uppercase">{investor.bankName || 'NOT SPECIFIED'}</p>
                      <div className="flex justify-between items-end">
                        <p className="text-xl font-bold font-mono tracking-tighter text-white/90">{investor.accountNumber ? `****${investor.accountNumber.slice(-4)}` : '****'}</p>
                        <CreditCard size={20} className="opacity-40" />
                      </div>
                    </div>
                  </div>
               </div>
            </div>
          )}

          {/* LEDGER TAB */}
          {activeTab === 'ledger' && (
            <div className="p-8 animate-fade-in">
               <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
                 <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center">
                   <FileText size={16} className="mr-2 text-red-600" /> Transaction Ledger
                 </h3>
                 <button className="flex items-center gap-2 px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors">
                   <Download size={14} /> Download Statement
                 </button>
               </div>

               {transactions.length === 0 ? (
                 <div className="text-center py-12 bg-slate-50 rounded-2xl border border-slate-100 border-dashed">
                   <Activity size={32} className="mx-auto mb-3 text-slate-300" />
                   <p className="text-sm font-bold text-slate-500">No transactions recorded yet</p>
                   <p className="text-[11px] font-medium text-slate-400 mt-1 uppercase tracking-widest">Financial activity will appear here</p>
                 </div>
               ) : (
                 <div className="overflow-x-auto rounded-xl border border-slate-200">
                   <table className="w-full text-left border-collapse">
                     <thead>
                       <tr className="bg-slate-50 border-b border-slate-200">
                         <th className="px-4 py-3 text-[10px] font-black text-slate-500 uppercase tracking-widest w-28">Date</th>
                         <th className="px-4 py-3 text-[10px] font-black text-slate-500 uppercase tracking-widest">Description</th>
                         <th className="px-4 py-3 text-[10px] font-black text-slate-500 uppercase tracking-widest w-32">Type</th>
                         <th className="px-4 py-3 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right w-36">Amount</th>
                       </tr>
                     </thead>
                     <tbody className="divide-y divide-slate-100 bg-white">
                       {transactions.map((tx: any, idx: number) => (
                         <tr key={tx.id || idx} className="hover:bg-slate-50/50 transition-colors">
                           <td className="px-4 py-3 whitespace-nowrap text-xs font-bold text-slate-600">{tx.date}</td>
                           <td className="px-4 py-3 text-xs text-slate-800 font-medium">
                             <div>{tx.description || '-'}</div>
                             {tx.reference && <div className="text-[10px] text-slate-400 font-mono mt-0.5">Ref: {tx.reference}</div>}
                           </td>
                           <td className="px-4 py-3 whitespace-nowrap">
                             <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest ${
                               tx.type === 'Credit' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                             }`}>
                               {tx.type === 'Credit' ? 'Investment' : 'Return'}
                             </span>
                           </td>
                           <td className={`px-4 py-3 whitespace-nowrap text-right font-black font-mono tracking-tighter ${
                             tx.type === 'Credit' ? 'text-emerald-600' : 'text-red-600'
                           }`}>
                             {tx.type === 'Credit' ? '+' : '-'}{formatIndian(tx.amount)}
                           </td>
                         </tr>
                       ))}
                     </tbody>
                   </table>
                 </div>
               )}
            </div>
          )}

          {/* PROFILE DETAILS TAB */}
          {activeTab === 'profile' && (
            <div className="p-8 animate-fade-in">
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                
                {/* Column 1: Personal Identity & KYC */}
                <div className="space-y-6">
                  {/* Personal Identity */}
                  <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                    <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center">
                        <User size={16} />
                      </div>
                      <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest">Personal Identity</h3>
                    </div>
                    <div className="p-5 space-y-4">
                      <div className="flex justify-between items-center pb-3 border-b border-slate-50">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Guardian Name</span>
                        <span className="text-xs font-bold text-slate-800 text-right">{investor.fatherName || '-'}</span>
                      </div>
                      <div className="flex justify-between items-center pb-3 border-b border-slate-50">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Occupation</span>
                        <span className="text-xs font-bold text-slate-800 text-right">{investor.occupation || '-'}</span>
                      </div>
                      <div className="flex justify-between items-center pb-3 border-b border-slate-50">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Gender / Age</span>
                        <span className="text-xs font-bold text-slate-800 text-right">{investor.gender || 'N/A'} • {investor.age || 'N/A'} Yrs</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Date of Birth</span>
                        <span className="text-[11px] font-mono font-bold text-slate-600 text-right">{investor.dob || '-'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Statutory KYC */}
                  <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                    <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                        <Shield size={16} />
                      </div>
                      <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest">Statutory KYC</h3>
                    </div>
                    <div className="p-5">
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-1">PAN Card</span>
                          <span className="text-xs font-black text-slate-800 font-mono tracking-widest">{investor.pan || '-'}</span>
                        </div>
                        <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-1">GST / GSI</span>
                          <span className="text-xs font-black text-slate-800 font-mono tracking-widest">{investor.gsi || investor.gst || investor.gstin || '-'}</span>
                        </div>
                      </div>
                      <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100 flex justify-between items-center">
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Aadhaar Universal ID</span>
                        <span className="text-xs font-black text-slate-800 font-mono tracking-widest">{investor.aadhaar || '-'}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Column 2: Residence & Office */}
                <div className="space-y-6">
                  {/* Permanent Residence */}
                  <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                    <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                        <MapPin size={16} />
                      </div>
                      <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest">Permanent Residence</h3>
                    </div>
                    <div className="p-5">
                      <div className="flex items-start gap-4">
                        <div className="flex-1">
                          <p className="text-sm font-bold text-slate-700 leading-relaxed mb-2">{investor.address || '-'}</p>
                          {investor.district && (
                            <div className="flex flex-wrap gap-2 mt-2">
                              {investor.district && <span className="px-2 py-1 bg-slate-50 text-slate-600 rounded text-[10px] font-bold uppercase">{investor.district}</span>}
                              {investor.state && <span className="px-2 py-1 bg-slate-50 text-slate-600 rounded text-[10px] font-bold uppercase">{investor.state}</span>}
                              {investor.pincode && <span className="px-2 py-1 bg-slate-50 text-slate-600 rounded text-[10px] font-bold uppercase tracking-widest">{investor.pincode}</span>}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Professional Location */}
                  <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                    <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                        <Briefcase size={16} />
                      </div>
                      <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest">Professional Location</h3>
                    </div>
                    <div className="p-5">
                      <p className="text-sm font-bold text-slate-700 leading-relaxed mb-2">{investor.officeAddress || '-'}</p>
                      {(investor.officeLocality || investor.officeDistrict || investor.officeState || investor.officePincode) && (
                        <div className="flex flex-wrap gap-2 mt-2">
                           {investor.officeLocality && <span className="px-2 py-1 bg-slate-50 text-slate-600 rounded text-[10px] font-bold uppercase">{investor.officeLocality}</span>}
                           {investor.officeDistrict && <span className="px-2 py-1 bg-slate-50 text-slate-600 rounded text-[10px] font-bold uppercase">{investor.officeDistrict}</span>}
                           {investor.officeState && <span className="px-2 py-1 bg-slate-50 text-slate-600 rounded text-[10px] font-bold uppercase">{investor.officeState}</span>}
                           {investor.officePincode && <span className="px-2 py-1 bg-slate-50 text-slate-600 rounded text-[10px] font-bold uppercase tracking-widest">{investor.officePincode}</span>}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Column 3: Bank & Nominees */}
                <div className="space-y-6 md:col-span-2 xl:col-span-1">
                  {/* Settlement Account */}
                  <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-lg relative">
                    <div className="absolute top-0 right-0 p-6 opacity-5">
                      <Landmark size={64} className="text-white" />
                    </div>
                    <div className="p-4 border-b border-slate-800/50 bg-white/5 flex items-center gap-3 relative z-10">
                      <div className="w-8 h-8 rounded-lg bg-white/10 text-white flex items-center justify-center backdrop-blur-md">
                        <Landmark size={16} />
                      </div>
                      <h3 className="text-xs font-black text-white uppercase tracking-widest">Settlement Account</h3>
                    </div>
                    <div className="p-5 relative z-10">
                      <div className="mb-4">
                         <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Bank Name</span>
                         <span className="text-sm font-black text-white tracking-tight">{investor.bankName || '-'}</span>
                      </div>
                      <div className="pt-4 border-t border-slate-800 flex justify-between items-end">
                         <div>
                           <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Account Number</span>
                           <span className="text-sm font-mono font-bold text-slate-200 tracking-tighter">{investor.accountNumber ? `****${investor.accountNumber.slice(-4)}` : '-'}</span>
                         </div>
                         <div className="text-right">
                           <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-1">IFSC Code</span>
                           <span className="text-xs font-mono font-bold text-slate-300 tracking-tighter">{investor.ifscCode || '-'}</span>
                         </div>
                      </div>
                    </div>
                  </div>

                  {/* Nominee Protocol */}
                  <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                    <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
                        <Users size={16} />
                      </div>
                      <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest">Nominee Protocol</h3>
                    </div>
                    <div className="p-5">
                      <div className="space-y-4">
                        {investor.nominees && investor.nominees.length > 0 ? (
                          investor.nominees.map((nominee: any, idx: number) => (
                            <div key={idx} className="relative">
                              {idx > 0 && <div className="absolute -top-2 left-0 right-0 border-t border-slate-100"></div>}
                              <div className="flex justify-between items-start mb-2">
                                <div>
                                  <span className="text-[9px] font-black text-brand-600 uppercase tracking-widest px-2 py-0.5 bg-brand-50 rounded mb-1.5 inline-block">
                                    {idx === 0 ? 'Primary' : `Nominee ${idx + 1}`}
                                  </span>
                                  <p className="text-xs font-bold text-slate-900">{nominee.name || '-'}</p>
                                </div>
                                <div className="text-right">
                                  <span className="text-[10px] font-bold text-slate-500 block mb-0.5">Relation</span>
                                  <span className="text-xs font-bold text-slate-900">{nominee.relation || '-'}</span>
                                </div>
                              </div>
                              <div className="flex justify-between items-center text-[10px]">
                                <span className="font-bold text-slate-500">Age: <span className="text-slate-800">{nominee.age || '-'} Yrs</span></span>
                                <span className="font-mono font-bold text-slate-500">Aadhaar: <span className="text-slate-800">{nominee.aadhaar || '-'}</span></span>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="py-6 text-center">
                            <Users size={20} className="mx-auto text-slate-300 mb-2" />
                            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">No nominees added</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* DOCUMENTS TAB */}
          {activeTab === 'docs' && (
            <div className="p-8 animate-fade-in">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center">
                  <FileText size={16} className="mr-2 text-red-600" /> Investment Documents
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {docs.map((doc, idx) => {
                  const docName = doc.name || doc.file_name || doc.id;
                  const viewUrl = `https://ashray-backend-2nt7.onrender.com/api/doc/view/${encodeURIComponent(docName)}`;
                  const downloadUrl = `https://ashray-backend-2nt7.onrender.com/api/doc/download/${encodeURIComponent(docName)}`;

                  return (
                  <div key={idx} className="p-4 border border-slate-200 rounded-xl bg-white hover:border-red-300 hover:shadow-md transition-all flex items-center justify-between group cursor-pointer" onClick={() => window.open(viewUrl, '_blank')}>
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className={`p-2.5 rounded-lg shrink-0 ${doc.name?.toLowerCase().includes('.pdf') ? 'bg-red-50 text-red-500' : 'bg-slate-50 text-slate-500'}`}>
                        <FileText size={20} />
                      </div>
                      <div className="overflow-hidden min-w-0">
                        <p className="text-xs font-bold text-slate-900 truncate" title={doc.name}>{doc.name}</p>
                        <p className="text-[10px] text-slate-400 font-medium mt-0.5">{doc.dateUploaded || doc.date || 'Unknown Date'}</p>
                      </div>
                    </div>
                    <div className="flex gap-1 shrink-0 ml-2 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
                      <a 
                        href={downloadUrl}
                        download
                        onClick={(e) => e.stopPropagation()}
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-100"
                        title="Download Document"
                      >
                        <Download size={14} />
                      </a>
                    </div>
                  </div>
                )})}
                
                {docs.length === 0 && (
                  <div className="col-span-full py-16 bg-slate-50 rounded-2xl border border-slate-100 border-dashed text-center">
                    <FileText size={40} className="mx-auto mb-3 text-slate-300" />
                    <p className="text-sm font-bold text-slate-500">No documents found</p>
                    <p className="text-[11px] font-medium text-slate-400 mt-1 uppercase tracking-widest">Your investment documents will appear here</p>
                  </div>
                )}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
export default InvestorProfile;