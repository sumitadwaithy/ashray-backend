
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useData } from '../contexts/DataContext';
import { useLanguage } from '../contexts/LanguageContext';
import { 
  FileText, Download, LogOut, MapPin, Building, AlertCircle, 
  ArrowRight, FileCheck, Scale, Map, ShieldCheck, 
  PieChart, CheckCircle2, Calendar, Clock, Check,
  Menu, X, Newspaper, ExternalLink, Gift, UserPlus, Users, Sparkles,
  Printer, Receipt, CreditCard, Wallet, Banknote, ChevronRight,
  FileDown, FileSpreadsheet, Share2, Eye, FileOutput, Send, RefreshCw,
  User, Shield, Mail, Phone, Landmark, Briefcase
} from 'lucide-react';
import { Referral } from '../types';

// Backend URL
const BACKEND_URL = 'https://ashray-backend-2nt7.onrender.com';

const DocumentActions = ({ url, name }: { url: string, name: string }) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu if user clicks anywhere else
  useEffect(() => {
    const closeMenu = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setIsOpen(false);
    };
    document.addEventListener('mousedown', closeMenu);
    return () => document.removeEventListener('mousedown', closeMenu);
  }, []);

  return (
    <div className="relative" ref={menuRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="px-4 py-2 bg-gray-50 border border-gray-200 hover:bg-red-600 hover:text-white rounded-lg font-bold text-[10px] uppercase transition-all flex items-center gap-2"
      >
        Options <ChevronRight size={12} className={isOpen ? 'rotate-90' : ''} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-100 shadow-2xl rounded-xl z-[100] overflow-hidden">
          <a 
            href={url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-3 px-4 py-3 text-[11px] font-bold text-gray-700 hover:bg-red-50 hover:text-red-600 border-b border-gray-50"
          >
            <Eye size={14} /> VIEW ONLINE
          </a>
          <a 
            href={url.replace('/view/', '/download/')} 
             download={name || "Document.pdf"}

            className="flex items-center gap-3 px-4 py-3 text-[11px] font-bold text-gray-700 hover:bg-red-50 hover:text-red-600"
            onClick={() => setIsOpen(false)}
          >
            <Download size={14} /> DOWNLOAD PDF
          </a>
        </div>
      )}
    </div>
  );
};

interface ClientProfileProps {
  currentUser: any;
  handleLogout: () => void;
  docs: any[];
}

export const ClientProfile: React.FC<ClientProfileProps> = ({ currentUser, handleLogout, docs }) => {
  const { properties, referrals, addReferral, transactions, pendingReceipts } = useData();
  const { t } = useLanguage();
  const ledgerRef = useRef<HTMLDivElement>(null);
  
  // View State (Dashboard)
  const [selectedInvestmentId, setSelectedInvestmentId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'financials' | 'documents' | 'referrals' | 'profile'>('financials');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); 
  const [viewReceiptTx, setViewReceiptTx] = useState<any>(null);

  const getReceiptStatus = (txId: string) => {
    const receipt = pendingReceipts?.find((r: any) => r.transactionId === txId);
    if (!receipt) return 'none';
    return receipt.printed ? 'printed' : 'pending';
  };

  // Referral Modal State
  const [isReferralModalOpen, setIsReferralModalOpen] = useState(false);
  const [referralForm, setReferralForm] = useState({ name: '', phone: '', notes: '' });
  const [referralSubmitting, setReferralSubmitting] = useState(false);
  const [referralSuccess, setReferralSuccess] = useState(false);

  // Derived State for Dashboard
  const activeInvestments = useMemo(() => currentUser?.investments || [], [currentUser]);
  const userReferrals = useMemo(() => referrals.filter(r => r.referrerClientId === currentUser?.id), [referrals, currentUser]);
  const totalReferralBonus = useMemo(() => userReferrals.reduce((sum, r) => sum + r.bonusAmount, 0), [userReferrals]);
  
  useEffect(() => {
    if (activeInvestments.length > 0 && !selectedInvestmentId) {
      setSelectedInvestmentId(activeInvestments[0].propertyId + (activeInvestments[0].plotId || ''));
    }
  }, [activeInvestments, selectedInvestmentId]);

  const currentInvestment = useMemo(() => {
    if (!selectedInvestmentId) return activeInvestments[0];
    return activeInvestments.find((inv: any) => (inv.propertyId + (inv.plotId || '')) === selectedInvestmentId) || activeInvestments[0];
  }, [activeInvestments, selectedInvestmentId]);

  const currentProperty = useMemo(() => {
    return properties.find(p => p.id === currentInvestment?.propertyId);
  }, [properties, currentInvestment]);

  const currentPlot = useMemo(() => {
    return currentProperty?.inventory?.find(p => p.id === currentInvestment?.plotId);
  }, [currentProperty, currentInvestment]);

  // Financial Calculations for Ledger (Including Bonuses as Credits)
  const investmentFinancials = useMemo(() => {
    if (!currentUser || !currentInvestment) return { paid: 0, total: 0, due: 0, percent: 0, ledgerRows: [] };
    
    const linkedPayments = transactions
      .filter((tx: any) => tx.clientId === currentUser.id)
      .filter((tx: any) => tx.propertyId === currentInvestment.propertyId || !tx.propertyId)
      .map((tx: any) => ({
        id: tx.id,
        date: tx.date,
        amount: tx.amount,
        type: tx.type === 'CREDIT' ? 'Credit' : 'Debit',
        description: tx.particulars,
        paymentMode: tx.method,
        reference: tx.referenceId,
        entryType: 'Payment' as const
      }));

    const linkedBonuses = userReferrals
      .filter(r => r.bonusAmount > 0 && (r.status === 'Bonus Paid' || r.status === 'Converted'))
      .map(r => ({
        id: r.id,
        date: r.date,
        amount: r.bonusAmount,
        type: 'Credit' as const,
        description: `Referral Bonus Credit: ${r.refereeName}`,
        paymentMode: 'Adjustment',
        reference: `REF-${r.id.split('_').pop()?.toUpperCase()}`,
        receiptId: null,
        entryType: 'Bonus' as const
      }));

    const allEntries = [...linkedPayments, ...linkedBonuses].sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    const total = currentInvestment.amount;
    let runningBalance = total;

    const ledgerRows = allEntries.map(entry => {
        if (entry.type === 'Credit') {
            runningBalance -= entry.amount;
        } else {
            runningBalance += entry.amount;
        }
        return { ...entry, balanceAfter: runningBalance };
    });

    const totalCredits = allEntries
      .filter(p => p.type === 'Credit')
      .reduce((sum, p) => sum + p.amount, 0);
    const finalBalance = Math.max(0, total - totalCredits);
    const percent = total > 0 ? Math.min((totalCredits / total) * 100, 100) : 0;

    return { paid: totalCredits, total, due: finalBalance, percent, ledgerRows };
  }, [currentUser, currentInvestment, userReferrals]);

  // Handlers for Exporting/Printing
  const handlePrint = (e: React.MouseEvent) => { e.preventDefault(); window.print(); };
  const handlePdf = (e: React.MouseEvent) => { e.preventDefault(); window.print(); };
  const handleExportExcel = (e: React.MouseEvent) => {
    e.preventDefault();
    const headers = ["Date", "Description", "Mode/Ref", "Debit (₹)", "Credit (₹)", "Balance (₹)"];
    const rows = investmentFinancials.ledgerRows.map(row => [
      row.date, row.description, `${row.paymentMode || ''}/${row.reference || ''}`,
      row.type === 'Debit' ? row.amount : 0, row.type === 'Credit' ? row.amount : 0, row.balanceAfter
    ]);
    rows.unshift([currentInvestment.purchaseDate, "Opening Balance", "Initial Recognition", investmentFinancials.total, 0, investmentFinancials.total]);
    const csvContent = [[`STATEMENT - ${currentUser?.name?.toUpperCase()}`], [`Property: ${currentProperty?.title}`], [], headers, ...rows]
      .map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    link.setAttribute("href", URL.createObjectURL(blob));
    link.setAttribute("download", `Statement_${currentUser?.name.replace(/\s+/g, '_')}.csv`);
    link.click();
  };

  // Referral Submission

  const handleSubmitReferral = async (e: React.FormEvent) => {

    e.preventDefault();

    setReferralSubmitting(true);

    const newReferral: Referral = {

      id: `WEBREF_${Date.now()}`,

      referrerClientId: currentUser.id,

      refereeName: referralForm.name,

      refereePhone: referralForm.phone,

      status: 'Pending',

      bonusAmount: 0,

      date: new Date().toISOString().split('T')[0],

      notes: referralForm.notes

    };

    try {

      await fetch(`${BACKEND_URL}/api/referral/upsert`, {

        method: 'POST',

        headers: { 'Content-Type': 'application/json' },

        body: JSON.stringify(newReferral)

      });

    } catch (e) {
      console.error("Failed to post referral to backend:", e);
    }

    addReferral(newReferral);

    setReferralSubmitting(false);

    setReferralSuccess(true);

    setReferralForm({ name: '', phone: '', notes: '' });

    setTimeout(() => { setIsReferralModalOpen(false); setReferralSuccess(false); }, 3000);
  };

  // Valuation Logic
  const valuationData = useMemo(() => {
      if (!currentProperty || !currentInvestment) return null;
      const marketRate = currentProperty.currentMarketRate || currentProperty.ratePerSqft || 0;
      const plotSize = currentPlot?.size || currentProperty.plotSize || 0;
      const currentValuation = plotSize * marketRate;
      const purchasePrice = currentInvestment.amount;
      const appreciation = currentValuation - purchasePrice;
      const growthPercent = purchasePrice > 0 ? (appreciation / purchasePrice) * 100 : 0;
      return { purchasePrice, currentRate: marketRate, currentValuation, appreciation, growthPercent };
  }, [currentProperty, currentInvestment, currentPlot]);

  const formatPhoneNumber = (val: string) => val.replace(/\D/g, '').slice(0, 10);

  return (
    <div className="min-h-screen bg-gray-50 pb-20 text-gray-900 print:bg-white print:p-0">
      <div className="bg-red-700 text-white pt-24 pb-20 px-4 print:hidden">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
            <div>
                <h1 className="text-2xl md:text-3xl font-bold font-playfair">{t('welcome_back')}, {currentUser.name}</h1>
                <p className="text-red-200 text-sm mt-1 uppercase tracking-wider font-bold">Client ID: {currentUser.id.toUpperCase()}</p>
            </div>
            <div className="flex gap-2">
                <button onClick={handleLogout} className="flex items-center gap-2 bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg transition-colors text-sm font-medium"><LogOut size={16}/> {t('logout')}</button>
            </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12 relative print:mt-0 print:px-0">
        <div className="flex flex-col lg:flex-row gap-8">
            <div className={`w-full lg:w-72 flex-shrink-0 space-y-4 print:hidden ${isSidebarOpen ? 'block' : 'hidden lg:block'}`}>
                <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
                    <div className="p-4 bg-gray-50 border-b border-gray-100 font-bold text-gray-700 flex justify-between items-center text-xs uppercase tracking-wider">
                        My Portfolio
                        <Building size={14} className="text-gray-400" />
                    </div>
                    <div className="divide-y divide-gray-50">
                        {activeInvestments.map((inv: any, idx: number) => {
                            const prop = properties.find(p => p.id === inv.propertyId);
                            const plot = prop?.inventory?.find(pl => pl.id === inv.plotId);
                            const isSelected = (inv.propertyId + (inv.plotId || '')) === selectedInvestmentId;
                            return (
                                <button key={idx} onClick={() => setSelectedInvestmentId(inv.propertyId + (inv.plotId || ''))} className={`w-full text-left p-4 hover:bg-gray-50 transition-colors group flex items-center justify-between ${isSelected ? 'bg-red-50 border-l-4 border-red-600' : ''}`}>
                                    <div>
                                        <div className={`font-bold text-sm ${isSelected ? 'text-red-700' : 'text-gray-800'}`}>{plot ? `Plot No. ${plot.plotNumber}` : prop?.type}</div>
                                        <div className="text-xs text-gray-500 truncate max-w-[180px]">{prop?.title}</div>
                                    </div>
                                    <ChevronRight size={14} className={`transition-transform ${isSelected ? 'translate-x-1 text-red-600' : 'text-gray-300 group-hover:translate-x-1'}`} />
                                </button>
                            );
                        })}
                    </div>
                </div>

                <div className="bg-gradient-to-br from-orange-600 to-red-600 rounded-xl shadow-lg p-6 text-white group cursor-pointer" onClick={() => setActiveTab('referrals')}>
                    <div className="flex justify-between items-start mb-4">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-orange-100">Referral Earnings</h3>
                        <Gift size={18} className="text-white/40 group-hover:scale-110 transition-transform"/>
                    </div>
                    <div className="mb-4">
                        <span className="text-3xl font-black">₹{totalReferralBonus.toLocaleString('en-IN')}</span>
                        <p className="text-[10px] text-orange-50 mt-1 flex items-center gap-1 font-bold">
                            <Sparkles size={10}/> FROM {userReferrals.filter(r => r.bonusAmount > 0).length} CONVERSIONS
                        </p>
                    </div>
                    <button onClick={(e) => { e.stopPropagation(); setIsReferralModalOpen(true); }} className="w-full bg-white/20 hover:bg-white/30 text-[10px] font-bold py-2.5 rounded-lg transition-colors flex items-center justify-center gap-1 uppercase tracking-widest">
                        Submit Referral <ArrowRight size={12}/>
                    </button>
                </div>
            </div>

            <div className="flex-1 space-y-6">
                {currentProperty && (
                    <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden print:shadow-none print:border-none">
                        <div className="flex border-b border-gray-100 px-4 overflow-x-auto bg-gray-50/50 print:hidden">
                            <TabButton active={activeTab === 'financials'} onClick={() => setActiveTab('financials')} icon={<PieChart size={16}/>} label="Financials" />
                            <TabButton active={activeTab === 'profile'} onClick={() => setActiveTab('profile')} icon={<User size={16}/>} label="Profile & KYC" />
                            <TabButton active={activeTab === 'documents'} onClick={() => setActiveTab('documents')} icon={<FileText size={16}/>} label="Documents" />
                            <TabButton active={activeTab === 'referrals'} onClick={() => setActiveTab('referrals')} icon={<Gift size={16}/>} label="Referrals & Rewards" />
                        </div>

                        <div className="p-6 print:p-0">
                            {activeTab === 'financials' && (
                                <div className="animate-fade-in space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 print:hidden">
                                        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm relative overflow-hidden group">
                                            <p className="text-[10px] font-bold text-gray-400 uppercase mb-2">Total Contract Value</p>
                                            <p className="text-2xl font-bold text-gray-900">₹{investmentFinancials.total.toLocaleString('en-IN')}</p>
                                        </div>
                                        <div className="bg-white p-5 rounded-2xl border border-green-100 shadow-sm relative overflow-hidden group">
                                            <p className="text-[10px] font-bold text-green-600 uppercase mb-2">Total Credits Applied</p>
                                            <p className="text-2xl font-bold text-green-800">₹{investmentFinancials.paid.toLocaleString('en-IN')}</p>
                                            <div className="mt-3 h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                                                <div className="h-full bg-green-500 rounded-full transition-all duration-1000" style={{width: `${investmentFinancials.percent}%`}}></div>
                                            </div>
                                            <p className="text-[9px] text-green-600 mt-1 uppercase font-bold">Includes Referral Bonuses</p>
                                        </div>
                                        <div className="bg-white p-5 rounded-2xl border border-red-100 shadow-sm relative overflow-hidden group">
                                            <p className="text-[10px] font-bold text-red-600 uppercase mb-2">Balance Outstanding</p>
                                            <p className="text-2xl font-bold text-red-800">₹{investmentFinancials.due.toLocaleString('en-IN')}</p>
                                        </div>
                                    </div>

                                    <div ref={ledgerRef} className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm print:border-none print:shadow-none">
                                        <div className="px-6 py-4 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-center bg-gray-50/50 gap-4 print:hidden">
                                            <div className="flex items-center gap-2">
                                                <div className="w-1.5 h-6 bg-red-600 rounded-full"></div>
                                                <h3 className="font-bold text-gray-800 uppercase text-xs tracking-widest">Account Ledger</h3>
                                            </div>
                                            <div className="flex gap-2">
                                                <button type="button" onClick={handlePrint} className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-[10px] font-bold text-gray-600 hover:bg-gray-50 transition-all uppercase"><Printer size={12}/> Print</button>
                                                <div className="flex rounded-lg overflow-hidden border border-red-600 font-bold text-[10px] uppercase">
                                                    <button type="button" onClick={handlePdf} className="flex items-center gap-2 px-3 py-1.5 bg-red-600 text-white hover:bg-red-700 transition-colors border-r border-red-500">PDF</button>
                                                    <button type="button" onClick={handleExportExcel} className="flex items-center gap-2 px-3 py-1.5 bg-red-600 text-white hover:bg-red-700 transition-colors">Excel</button>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-xs text-left border-collapse">
                                                <thead className="bg-gray-100/80 text-gray-500 uppercase font-bold text-[10px] tracking-wider border-y border-gray-200">
                                                    <tr>
                                                        <th className="px-6 py-3 border-r border-gray-200">Date</th>
                                                        <th className="px-6 py-3 border-r border-gray-200">Description</th>
                                                        <th className="px-6 py-3 text-right border-r border-gray-200 w-28">Debit (₹)</th>
                                                        <th className="px-6 py-3 text-right border-r border-gray-200 w-28">Credit (₹)</th>
                                                        <th className="px-6 py-3 text-right border-r border-gray-200 w-32">Balance (₹)</th>
                                                        <th className="px-6 py-3 text-center w-20 print:hidden">Receipt</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-gray-100">
                                                    <tr className="bg-gray-50/40">
                                                        <td className="px-6 py-4 font-mono text-gray-400 italic border-r border-gray-100">{currentInvestment.purchaseDate}</td>
                                                        <td className="px-6 py-4 border-r border-gray-100 font-bold text-gray-500">Opening Balance (Total Liability)</td>
                                                        <td className="px-6 py-4 text-right font-bold">{investmentFinancials.total.toLocaleString('en-IN')}</td>
                                                        <td className="px-6 py-4 text-right text-gray-300 italic">---</td>
                                                        <td className="px-6 py-4 text-right font-bold">{investmentFinancials.total.toLocaleString('en-IN')}</td>
                                                        <td className="px-6 py-4 text-center print:hidden"><Download size={14} className="opacity-10 mx-auto"/></td>
                                                    </tr>
                                                    {investmentFinancials.ledgerRows.map((entry, idx) => (
                                                        <tr key={idx} className={`hover:bg-red-50/30 transition-colors ${entry.entryType === 'Bonus' ? 'bg-orange-50/20' : ''}`}>
                                                            <td className="px-6 py-4 font-mono text-gray-700 border-r border-gray-100">{entry.date}</td>
                                                            <td className="px-6 py-4 border-r border-gray-100">
                                                                <div className="font-bold flex items-center gap-1.5">{entry.entryType === 'Bonus' && <Gift size={12} className="text-orange-600"/>}{entry.description}</div>
                                                                <div className="text-[10px] text-gray-400">{entry.paymentMode}/{entry.reference}</div>
                                                            </td>
                                                            <td className="px-6 py-4 text-right text-gray-300">---</td>
                                                            <td className={`px-6 py-4 text-right font-bold ${entry.entryType === 'Bonus' ? 'text-orange-600' : 'text-green-700'}`}>{entry.amount.toLocaleString('en-IN')}</td>
                                                            <td className="px-6 py-4 text-right font-bold">{entry.balanceAfter.toLocaleString('en-IN')}</td>
                                                             <td className="px-6 py-4 text-center print:hidden">
                                                              {(() => {
                                                                const status = getReceiptStatus(entry.id);
                                                                if (status === 'printed') {
                                                                  return (
                                                                    <button onClick={() => setViewReceiptTx(entry)} className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-600 text-white text-[10px] font-bold rounded-lg hover:bg-emerald-700 transition-all shadow-sm">
                                                                      <Eye size={12}/> Receipt
                                                                    </button>
                                                                  );
                                                                }
                                                                if (status === 'pending') {
                                                                  return (
                                                                    <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-red-50 text-red-500 text-[10px] font-bold rounded-lg border border-red-300 animate-pulse">
                                                                      <FileText size={12}/> Receipt
                                                                    </span>
                                                                  );
                                                                }
                                                                return (
                                                                  <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-slate-100 text-slate-400 text-[10px] font-bold rounded-lg border border-slate-200">
                                                                    <FileText size={12}/> Receipt
                                                                  </span>
                                                                );
                                                              })()}
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                                <tfoot className="bg-gray-100/80 border-t border-gray-200">
                                                    <tr>
                                                        <td colSpan={2} className="px-6 py-3 font-bold text-right uppercase text-[9px]">Summary</td>
                                                        <td className="px-6 py-3 text-right font-black">{investmentFinancials.total.toLocaleString('en-IN')}</td>
                                                        <td className="px-6 py-3 text-right font-black text-green-700">{investmentFinancials.paid.toLocaleString('en-IN')}</td>
                                                        <td className="px-6 py-3 text-right text-base font-black text-red-600 bg-red-50">₹{investmentFinancials.due.toLocaleString('en-IN')}</td>
                                                        <td className="print:hidden"></td>
                                                    </tr>
                                                </tfoot>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'referrals' && (
                                <div className="animate-fade-in space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="bg-orange-50 p-8 rounded-3xl border border-orange-100 relative overflow-hidden group">
                                            <div className="absolute top-0 right-0 p-8 opacity-5 -mr-4 -mt-4 group-hover:scale-110 transition-transform"><UserPlus size={96}/></div>
                                            <h3 className="font-bold text-xl text-orange-900 mb-2">Help a friend invest</h3>
                                            <p className="text-orange-800 text-sm mb-6 leading-relaxed">Refer someone interested in land or property. When they buy, we allot a referral bonus directly to your account.</p>
                                            <button onClick={() => setIsReferralModalOpen(true)} className="bg-orange-600 text-white px-6 py-3 rounded-xl text-sm font-bold shadow-lg shadow-orange-600/30 hover:bg-orange-700 transition-colors">Submit a Referral</button>
                                        </div>
                                        <div className="bg-gray-900 p-8 rounded-3xl text-white">
                                            <div className="flex justify-between items-start mb-6">
                                                <div>
                                                    <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mb-1">Total Bonus Earned</p>
                                                    <div className="text-4xl font-black text-orange-400">₹{totalReferralBonus.toLocaleString('en-IN')}</div>
                                                </div>
                                                <div className="p-4 bg-white/5 rounded-2xl"><Gift className="text-orange-400" size={32}/></div>
                                            </div>
                                            <div className="flex items-center gap-2 text-xs text-orange-400 font-bold bg-white/5 p-3 rounded-xl border border-white/5">
                                                <Sparkles size={14}/> Referrals automagically apply as credits to your ledger.
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <div className="flex items-center justify-between mb-4">
                                            <h3 className="font-bold text-gray-900 uppercase text-xs tracking-widest">Referral History</h3>
                                            <button type="button" className="text-xs text-red-600 font-bold hover:underline">Download Summary</button>
                                        </div>
                                        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
                                            <table className="w-full text-xs text-left">
                                                <thead className="bg-gray-50 text-gray-500 uppercase font-bold text-[9px] tracking-wider border-b border-gray-200">
                                                    <tr>
                                                        <th className="px-6 py-4">Friend Name</th>
                                                        <th className="px-6 py-4">Status</th>
                                                        <th className="px-6 py-4">Date</th>
                                                        <th className="px-6 py-4 text-right">Bonus (₹)</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-gray-100">
                                                    {userReferrals.length > 0 ? userReferrals.map((ref, idx) => (
                                                        <tr key={idx} className="hover:bg-gray-50">
                                                            <td className="px-6 py-4">
                                                                <div className="font-bold text-gray-900">{ref.refereeName}</div>
                                                                <div className="text-[10px] text-gray-400">Ref ID: {ref.id.toUpperCase()}</div>
                                                            </td>
                                                            <td className="px-6 py-4">
                                                                <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                                                                    ref.status === 'Bonus Paid' ? 'bg-green-100 text-green-700' :
                                                                    ref.status === 'Converted' ? 'bg-blue-100 text-blue-700' :
                                                                    'bg-yellow-100 text-yellow-700'
                                                                }`}>{ref.status}</span>
                                                            </td>
                                                            <td className="px-6 py-4 text-gray-500">{ref.date}</td>
                                                            <td className="px-6 py-4 text-right font-bold text-orange-600">{ref.bonusAmount > 0 ? `₹${ref.bonusAmount.toLocaleString('en-IN')}` : '---'}</td>
                                                        </tr>
                                                    )) : (
                                                        <tr><td colSpan={4} className="p-12 text-center text-gray-400">No referral activity recorded yet.</td></tr>
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                            )}
                            
                            {activeTab === 'profile' && (
                                <div className="animate-fade-in max-w-4xl mx-auto py-4">
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                                        {/* Identity & Contact Group */}
                                        <div className="space-y-8">
                                            
                                            {/* Group 1: Personal Details */}
                                            <div>
                                                <h3 className="text-xs font-black text-gray-800 uppercase tracking-widest mb-4 border-b border-gray-200 pb-2">Personal Details</h3>
                                                <dl className="space-y-4 text-sm">
                                                    <div className="flex justify-between items-center group">
                                                        <dt className="text-gray-500 font-medium">Guardian Name</dt>
                                                        <dd className="font-semibold text-gray-900">{currentUser.fatherName || '-'}</dd>
                                                    </div>
                                                    <div className="flex justify-between items-center group">
                                                        <dt className="text-gray-500 font-medium">Occupation</dt>
                                                        <dd className="font-semibold text-gray-900">{currentUser.occupation || '-'}</dd>
                                                    </div>
                                                    <div className="flex justify-between items-center group">
                                                        <dt className="text-gray-500 font-medium">Gender & Age</dt>
                                                        <dd className="font-semibold text-gray-900">{currentUser.gender || 'N/A'} <span className="text-gray-300 mx-1">•</span> {currentUser.age || 'N/A'} Yrs</dd>
                                                    </div>
                                                    <div className="flex justify-between items-center group">
                                                        <dt className="text-gray-500 font-medium">Date of Birth</dt>
                                                        <dd className="font-mono text-xs font-bold text-gray-700 bg-gray-50 px-2 py-1 rounded border border-gray-100">{currentUser.dob || '-'}</dd>
                                                    </div>
                                                </dl>
                                            </div>

                                            {/* Group 2: Contact Info */}
                                            <div>
                                                <h3 className="text-xs font-black text-gray-800 uppercase tracking-widest mb-4 border-b border-gray-200 pb-2">Contact Details</h3>
                                                <dl className="space-y-4 text-sm">
                                                    <div className="flex justify-between items-center">
                                                        <dt className="text-gray-500 font-medium flex items-center gap-2"><Phone size={14} className="text-gray-400"/> Phone</dt>
                                                        <dd className="font-mono text-xs font-bold text-gray-900">{currentUser.phone || '-'}</dd>
                                                    </div>
                                                    <div className="flex justify-between items-center">
                                                        <dt className="text-gray-500 font-medium flex items-center gap-2"><Mail size={14} className="text-gray-400"/> Email</dt>
                                                        <dd className="font-semibold text-gray-900">{currentUser.email || '-'}</dd>
                                                    </div>
                                                    <div className="pt-2">
                                                        <dt className="text-gray-500 font-medium flex items-center gap-2 mb-2"><MapPin size={14} className="text-gray-400"/> Registered Address</dt>
                                                        <dd className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                                                            <p className="text-gray-800 font-medium leading-relaxed mb-2">
                                                                {currentUser.address || '-'}
                                                            </p>
                                                            {(currentUser.district || currentUser.state || currentUser.pincode) && (
                                                                <p className="text-xs text-gray-500 font-bold uppercase tracking-wide">
                                                                    {[currentUser.district, currentUser.state, currentUser.pincode].filter(Boolean).join(', ')}
                                                                </p>
                                                            )}
                                                        </dd>
                                                    </div>
                                                </dl>
                                            </div>
                                        </div>

                                        {/* KYC & Financials Group */}
                                        <div className="space-y-8">
                                            
                                            {/* Group 3: Statutory KYC */}
                                            <div>
                                                <h3 className="text-xs font-black text-gray-800 uppercase tracking-widest mb-4 border-b border-gray-200 pb-2">Statutory KYC</h3>
                                                <div className="flex flex-col gap-3">
                                                    <div className="border border-gray-200 rounded-xl p-4 flex justify-between items-center bg-white shadow-sm hover:border-gray-300 transition-colors">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center border border-gray-100">
                                                                <FileText size={14} className="text-gray-500" />
                                                            </div>
                                                            <span className="font-bold text-gray-700 text-sm">PAN Card</span>
                                                        </div>
                                                        <span className="font-mono font-bold tracking-widest text-gray-900">{currentUser.pan || '-'}</span>
                                                    </div>
                                                    <div className="border border-gray-200 rounded-xl p-4 flex justify-between items-center bg-white shadow-sm hover:border-gray-300 transition-colors">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center border border-gray-100">
                                                                <Shield size={14} className="text-gray-500" />
                                                            </div>
                                                            <span className="font-bold text-gray-700 text-sm">Aadhaar</span>
                                                        </div>
                                                        <span className="font-mono font-bold tracking-widest text-gray-900">{currentUser.aadhaar || '-'}</span>
                                                    </div>
                                                    <div className="border border-gray-200 rounded-xl p-4 flex justify-between items-center bg-white shadow-sm hover:border-gray-300 transition-colors">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center border border-gray-100">
                                                                <Briefcase size={14} className="text-gray-500" />
                                                            </div>
                                                            <span className="font-bold text-gray-700 text-sm">GSTIN</span>
                                                        </div>
                                                        <span className="font-mono font-bold tracking-widest text-gray-900">{currentUser.gstin || '-'}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Group 4: Settlement Account */}
                                            <div>
                                                <h3 className="text-xs font-black text-gray-800 uppercase tracking-widest mb-4 border-b border-gray-200 pb-2">Settlement Account</h3>
                                                <div className="relative rounded-2xl overflow-hidden bg-gray-900 p-6 shadow-xl pt-8 pb-10">
                                                    {/* Card Pattern overlay */}
                                                    <div className="absolute inset-0 opacity-[0.03]" style={{backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '12px 12px'}}></div>
                                                    <div className="absolute right-0 top-0 translate-x-1/4 -translate-y-1/4 opacity-10 pointer-events-none">
                                                        <Landmark size={180} className="text-white" />
                                                    </div>
                                                    
                                                    <div className="relative z-10">
                                                        <div className="flex justify-between items-end mb-8">
                                                            <div>
                                                                <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold mb-1">Bank Name</p>
                                                                <p className="text-xl text-white font-playfair tracking-wide">{currentUser.bankName || 'Not Provided'}</p>
                                                            </div>
                                                            <div className="w-10 h-8 rounded bg-gray-800/80 border border-gray-700/50 flex items-center justify-center shadow-inner">
                                                                <div className="w-4 h-4 rounded-full bg-gray-600/50 shadow-inner"></div>
                                                            </div>
                                                        </div>
                                                        
                                                        <div className="mb-6">
                                                            <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold mb-2">Account Number</p>
                                                            <p className="text-white font-mono tracking-widest text-xl drop-shadow-sm font-medium">
                                                                {currentUser.accountNumber ? `•••• •••• •••• ${currentUser.accountNumber.slice(-4)}` : '•••• •••• •••• ••••'}
                                                            </p>
                                                        </div>
                                                        
                                                        <div className="flex justify-between items-center text-sm">
                                                            <div>
                                                                <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold mb-1">IFSC Code</p>
                                                                <p className="text-gray-200 font-mono tracking-wider font-bold">{currentUser.ifscCode || '---'}</p>
                                                            </div>
                                                            <div className="text-right">
                                                                <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold mb-1">Status</p>
                                                                <div className="flex items-center gap-1.5 justify-end">
                                                                    <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
                                                                    <span className="text-emerald-400 font-bold text-[10px] uppercase tracking-wider">Active</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'documents' && (
  <div className="animate-fade-in">
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-2">
        <div className="w-1.5 h-6 bg-red-600 rounded-full"></div>
        <h3 className="font-bold text-gray-800 uppercase text-xs tracking-widest">
          Property Documents
        </h3>
      </div>

      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
        {(docs || []).filter(d => d.clientId === currentUser?.id && d.category !== 'REPORT' && d.type !== 'virtual').length} Documents Available
      </p>
    </div>

    {(docs || []).filter(d => d.clientId === currentUser?.id && d.category !== 'REPORT' && d.type !== 'virtual').length > 0 ? (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {(docs || [])
          .filter(d => d.clientId === currentUser?.id && d.category !== 'REPORT' && d.type !== 'virtual')
          .map((doc, idx) => {
            const docName = doc.name || doc.file_name || doc.id;
            const viewUrl = `${BACKEND_URL}/api/doc/view/${encodeURIComponent(docName)}`;
            const downloadUrl = `${BACKEND_URL}/api/doc/download/${encodeURIComponent(docName)}`;

            return (
              <div
                key={idx}
                className="group relative bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden transition-all hover:shadow-md hover:border-red-100"
              >
                <div className="p-6">
                  <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center mb-4 text-red-600">
                    {doc.file_name?.includes('.pdf') ? (
                      <FileText size={24} />
                    ) : (
                      <FileSpreadsheet size={24} />
                    )}
                  </div>

                  <h4 className="font-bold text-gray-900 mb-1 truncate">
                    {doc.name}
                  </h4>

                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">
                      {doc.category || ""}
                    </span>

                    <span className="text-[10px] font-mono text-gray-400">
                      {doc.dateUploaded || doc.date || ""}
                    </span>
                  </div>
                </div>

                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-red-600/90 opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col items-center justify-center gap-3 backdrop-blur-[2px]">
                  
                  <a
                    href={viewUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 bg-white text-red-600 px-5 py-2.5 rounded-xl text-xs font-bold hover:bg-gray-50 transition-colors shadow-lg"
                  >
                    <Eye size={16} /> View Online
                  </a>

                  <a
                    href={downloadUrl}
                    download
                    className="flex items-center gap-2 bg-red-700 text-white px-5 py-2.5 rounded-xl text-xs font-bold hover:bg-red-800 transition-colors shadow-lg border border-red-500/30"
                  >
                    <Download size={16} /> Download PDF
                  </a>

                </div>
              </div>
            );
          })}
      </div>
    ) : (
      <div className="p-20 text-center bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
          <FileText size={24} className="text-gray-300" />
        </div>
        <h3 className="font-bold text-gray-900 mb-1">No documents found</h3>
        <p className="text-gray-500 text-sm">
          Documents for this property will appear here once uploaded.
        </p>
      </div>
    )}
  </div>
)}
                        </div>
                    </div>
                )}
            </div>
        </div>
      </div>

      {/* REFERRAL SUBMISSION MODAL */}
      {isReferralModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-fade-in">
                {referralSuccess ? (
                    <div className="p-12 text-center">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4"><Check className="text-green-600 w-8 h-8"/></div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Referral Submitted!</h3>
                        <p className="text-gray-500 text-sm">Our team will contact your friend and link their conversion to your rewards profile.</p>
                    </div>
                ) : (
                    <>
                        <div className="bg-orange-600 p-6 text-white flex justify-between items-center">
                            <h3 className="font-bold text-lg flex items-center gap-2"><UserPlus size={20}/> Submit a Referral</h3>
                            <button onClick={() => setIsReferralModalOpen(false)}><X/></button>
                        </div>
                        <form onSubmit={handleSubmitReferral} className="p-6 space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Friend's Full Name</label>
                                <input required className="w-full p-3 bg-gray-50 border rounded-xl outline-none focus:ring-2 focus:ring-orange-500" value={referralForm.name} onChange={e => setReferralForm({...referralForm, name: e.target.value})} placeholder="e.g. Rahul Sharma" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Friend's Phone Number</label>
                                <input required type="tel" className="w-full p-3 bg-gray-50 border rounded-xl outline-none focus:ring-2 focus:ring-orange-500" value={referralForm.phone} onChange={e => setReferralForm({...referralForm, phone: e.target.value})} placeholder="+91 98765 00000" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Additional Notes (Optional)</label>
                                <textarea className="w-full p-3 bg-gray-50 border rounded-xl outline-none focus:ring-2 focus:ring-orange-500" rows={2} value={referralForm.notes} onChange={e => setReferralForm({...referralForm, notes: e.target.value})} placeholder="Interested in Crystal City plots..." />
                            </div>
                            <button disabled={referralSubmitting} className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-orange-600/20 flex items-center justify-center gap-2">
                                {referralSubmitting ? <><RefreshCcw size={18} className="animate-spin"/> Submitting...</> : <><Send size={18}/> Send to Ashray Group</>}
                            </button>
                        </form>
                    </>
                )}
            </div>
        </div>
      )}

      {viewReceiptTx && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl shadow-xl relative">
            <div className="sticky top-0 bg-white border-b border-gray-100 p-4 flex items-center justify-between">
              <h3 className="font-bold text-lg">Receipt</h3>
              <button onClick={() => setViewReceiptTx(null)} className="p-2 hover:bg-gray-100 rounded-full transition">
                <X size={20} />
              </button>
            </div>
            <div className="p-6">
              <div className="border-2 border-gray-200 rounded-xl p-6 bg-white shadow-sm">
                <div className="text-center mb-6 border-b border-gray-100 pb-4">
                  <h2 className="text-xl font-black text-gray-800">Ashray Group</h2>
                  <p className="text-[10px] text-gray-500 mt-1">Payment Receipt</p>
                </div>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between border-b border-dashed border-gray-200 pb-2">
                    <span className="text-gray-500">Date</span>
                    <span className="font-bold">{viewReceiptTx.date}</span>
                  </div>
                  <div className="flex justify-between border-b border-dashed border-gray-200 pb-2">
                    <span className="text-gray-500">Payee</span>
                    <span className="font-bold">{viewReceiptTx.partyName || viewReceiptTx.description || viewReceiptTx.particulars || '-'}</span>
                  </div>
                  <div className="flex justify-between border-b border-dashed border-gray-200 pb-2">
                    <span className="text-gray-500">Amount</span>
                    <span className="font-bold text-green-700">₹{viewReceiptTx.amount?.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between border-b border-dashed border-gray-200 pb-2">
                    <span className="text-gray-500">Mode</span>
                    <span className="font-bold">{viewReceiptTx.paymentMode || viewReceiptTx.method || '-'}</span>
                  </div>
                  <div className="flex justify-between border-b border-dashed border-gray-200 pb-2">
                    <span className="text-gray-500">Reference</span>
                    <span className="font-bold">{viewReceiptTx.reference || viewReceiptTx.referenceId || '-'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Description</span>
                    <span className="font-bold text-right max-w-[60%]">{viewReceiptTx.description || viewReceiptTx.particulars || '-'}</span>
                  </div>
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button onClick={() => window.print()} className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-all shadow-md">
                  <Printer size={16}/> Print
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const TabButton: React.FC<{ active: boolean; onClick: () => void; icon: React.ReactNode; label: string }> = ({ active, onClick, icon, label }) => (
    <button type="button" onClick={onClick} className={`flex items-center gap-2 px-6 py-4 text-[10px] font-bold border-b-2 transition-all whitespace-nowrap uppercase tracking-widest ${active ? 'border-red-600 text-red-600 bg-red-50/50' : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}>
        {icon} {label}
    </button>
);

const RefreshCcw = ({ size, className }: { size: number, className: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M21 2v6h-6"/><path d="M3 12a9 9 0 0 1 15-6.7L21 8"/><path d="M3 22v-6h6"/><path d="M21 12a9 9 0 0 1-15 6.7L3 16"/></svg>
);

export default ClientProfile;