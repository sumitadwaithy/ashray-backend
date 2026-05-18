
import React, { useState, useEffect } from 'react';
import { 
  Search, FileText, Download, User, Calendar, 
  MapPin, Phone, Mail, IndianRupee, Clock,
  ArrowRight, Filter, ChevronDown, ChevronUp,
  Printer, Share2, Shield, Info, Building,
  Tractor, Briefcase, Landmark, History, X,
  Eye
} from 'lucide-react';
import { dbService } from '../services/db';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { 
  Client, Staff, Kissan, Investor, Loan, 
  Transaction, Doc, TransactionType 
} from '../types';
import { format } from 'date-fns';
import { TransactionPartyLink } from './TransactionPartyLink';
import { useNavigate } from 'react-router-dom';

interface CentralizedIntelligenceProps {
  id?: string;
  onClose?: () => void;
  showSearch?: boolean;
}

export const CentralizedIntelligence: React.FC<CentralizedIntelligenceProps> = ({ 
  id: initialId = '', 
  onClose,
  showSearch = true
}) => {
  const [searchId, setSearchId] = useState(initialId);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [result, setResult] = useState<{
    entity: any;
    type: 'CLIENT' | 'STAFF' | 'KISSAN' | 'INVESTOR' | 'LOAN' | null;
    transactions: Transaction[];
    documents: Doc[];
    history: any[];
  } | null>(null);

  useEffect(() => {
    if (initialId) {
      setSearchId(initialId);
      handleSearch(initialId);
    }
  }, [initialId]);

  const handleSearch = async (targetId?: string) => {
    let idToSearch = targetId || searchId.trim();
    if (!idToSearch) return;

    // Handle virtual file IDs from DataBase.tsx (e.g. history_CID_AG_...)
    if (idToSearch.startsWith('history_')) {
      idToSearch = idToSearch.replace('history_', '').replace(/_/g, '/');
    }
    
    setLoading(true);
    setResult(null);

    try {
      const id = idToSearch;
      let entity: any = null;
      let type: any = null;

      // Search across all tables
      const [clients, staff, kissans, investors, loans, allTransactions, allDocs] = await Promise.all([
        dbService.getClients(),
        dbService.getStaff(),
        dbService.getKissans(),
        dbService.getInvestors(),
        dbService.getLoans(),
        dbService.getTransactions(),
        dbService.getDocs()
      ]);

      const foundClient = clients.find(c => c.id === id);
      const foundStaff = staff.find(s => s.id === id);
      const foundKissan = kissans.find(k => k.id === id);
      const foundInvestor = investors.find(i => i.id === id);
      const foundLoan = loans.find(l => l.id === id);

      // Search for partner in Kissans
      let foundPartner: any = null;
      let parentKissan: any = null;
      kissans.forEach(k => {
        const owner = k.owners?.find(o => o.id === id);
        if (owner) {
          foundPartner = owner;
          parentKissan = k;
        }
      });

      if (foundClient) { entity = foundClient; type = 'CLIENT'; }
      else if (foundStaff) { entity = foundStaff; type = 'STAFF'; }
      else if (foundKissan) { entity = foundKissan; type = 'KISSAN'; }
      else if (foundInvestor) { entity = foundInvestor; type = 'INVESTOR'; }
      else if (foundLoan) { entity = foundLoan; type = 'LOAN'; }
      else if (foundPartner) { 
        entity = { 
          ...foundPartner, 
          address: parentKissan.address, 
          status: parentKissan.status || 'Active',
          kissanName: parentKissan.landName 
        }; 
        type = 'CLIENT'; 
      }

      if (entity) {
        const entityTransactions = allTransactions.filter(t => 
          t.clientId === id || t.staffId === id || t.kissanId === id || t.investorId === id || t.loanId === id || t.ownerId === id
        ).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

        const entityDocs = allDocs.filter(d => 
          d.clientId === id || d.staffId === id || d.kissanId === id || d.investorId === id || d.loanId === id || (d as any).ownerId === id
        );

        setResult({
          entity,
          type,
          transactions: entityTransactions,
          documents: entityDocs,
          history: []
        });
      } else if (!targetId) {
        alert('No entity found with this ID');
      }
    } catch (err) {
      console.error('Search error:', err);
      if (!targetId) alert('Error searching for ID');
    } finally {
      setLoading(false);
    }
  };

  const downloadReport = () => {
    if (!result) return;
    
    const { total, paid, remaining, isFullyPaid } = calculateTotals();

    // PDF generation using jsPDF
    const doc = new jsPDF();
    const entity = result.entity;
    const currentId = entity.id;
    
    // Header
    doc.setFontSize(22);
    doc.setTextColor(220, 38, 38); // Brand Red
    doc.text('ASHRAY GROUP - INTELLIGENCE REPORT', 105, 20, { align: 'center' });
    
    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139);
    doc.text(`Generated on: ${format(new Date(), 'dd MMM yyyy, hh:mm a')}`, 105, 27, { align: 'center' });
    
    // Basic Details
    doc.setFontSize(16);
    doc.setTextColor(30, 41, 59);
    doc.text(`${result.type} Profile: ${entity.name}`, 20, 45);
    doc.setFontSize(12);
    doc.text(`ID: ${currentId}`, 20, 52);
    
    doc.setDrawColor(226, 232, 240);
    doc.line(20, 55, 190, 55);
    
    // Info Grid
    doc.setFontSize(10);
    doc.text(`Phone: ${entity.phone || 'N/A'}`, 25, 65);
    doc.text(`Email: ${entity.email || 'N/A'}`, 25, 72);
    doc.text(`Address: ${entity.address || 'N/A'}`, 25, 79);
    
    doc.text(`Aadhaar: ${entity.aadhaar || 'N/A'}`, 110, 65);
    doc.text(`PAN: ${entity.pan || 'N/A'}`, 110, 72);
    doc.text(`Status: ${entity.status || 'Active'}`, 110, 79);

    // Financial Summary
    doc.setDrawColor(241, 245, 249);
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(20, 85, 170, 25, 3, 3, 'FD');
    
    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139);
    doc.text('TOTAL AMOUNT', 25, 93);
    doc.text('TOTAL PAID', 85, 93);
    doc.text('REMAINING', 145, 93);

    doc.setFontSize(11);
    doc.setTextColor(15, 23, 42);
    doc.text(`Rs. ${total.toLocaleString()}`, 25, 101);
    doc.setTextColor(22, 163, 74); // Green
    doc.text(`Rs. ${paid.toLocaleString()}`, 85, 101);
    if (remaining > 0) {
      doc.setTextColor(220, 38, 38); // Red
    } else {
      doc.setTextColor(22, 163, 74); // Green
    }
    doc.text(`Rs. ${remaining.toLocaleString()}${isFullyPaid ? ' (FULLY PAID)' : ''}`, 145, 101);
    
    // Transactions
    if (result.transactions.length > 0) {
      doc.setFontSize(14);
      doc.setTextColor(15, 23, 42);
      doc.text('Financial History', 20, 125);
      
      const txRows = result.transactions.map(t => [
        t.date,
        t.particulars,
        t.type,
        `Rs. ${t.amount.toLocaleString()}`,
        t.method
      ]);
      
      // @ts-ignore
      doc.autoTable({
        startY: 130,
        head: [['Date', 'Particulars', 'Type', 'Amount', 'Method']],
        body: txRows,
        headStyles: { fillColor: [15, 23, 42] },
        alternateRowStyles: { fillColor: [248, 250, 252] }
      });
    }
    
    doc.save(`Report_${currentId.replace(/\//g, '_')}.pdf`);
  };

  const getEntityIcon = (type: string | null) => {
    switch (type) {
      case 'CLIENT': return <User className="text-brand-600" size={24} />;
      case 'STAFF': return <Shield className="text-blue-600" size={24} />;
      case 'KISSAN': return <Tractor className="text-green-600" size={24} />;
      case 'INVESTOR': return <Briefcase className="text-purple-600" size={24} />;
      case 'LOAN': return <Landmark className="text-amber-600" size={24} />;
      default: return <Info className="text-slate-400" size={24} />;
    }
  };

  const calculateTotals = () => {
    if (!result) return { total: 0, paid: 0, remaining: 0, isFullyPaid: false };
    
    const entity = result.entity;
    const transactions = result.transactions;
    let total = 0;
    let paid = 0;
    let remaining = 0;

    switch (result.type) {
      case 'CLIENT':
        total = (entity.totalContractValue || 0) + (entity.openingBalance || 0);
        // For Client, payments we receive are CREDIT
        paid = transactions
          .filter(t => t.type === TransactionType.CREDIT)
          .reduce((sum, t) => sum + (t.amount || 0), 0);
        remaining = Math.max(0, total - paid);
        break;
      case 'KISSAN':
        total = (entity.totalLandValue || 0) + (entity.openingBalance || 0);
        // For Kissan, payments we make TO them are DEBIT
        paid = transactions
          .filter(t => t.type === TransactionType.DEBIT)
          .reduce((sum, t) => sum + (t.amount || 0), 0);
        remaining = Math.max(0, total - paid);
        break;
      case 'INVESTOR':
        total = entity.totalAmount || entity.totalInvested || 0;
        paid = entity.totalReturns || 0;
        remaining = entity.currentBalance || 0;
        break;
      case 'LOAN':
        total = entity.principalAmount || 0;
        paid = transactions
          .filter(t => t.type === TransactionType.DEBIT) // Loan repayment from our side? Or installments?
          .reduce((sum, t) => sum + (t.amount || 0), 0);
        remaining = entity.remainingPrincipal || 0;
        break;
      case 'STAFF':
        total = entity.salary || 0;
        paid = transactions
          .filter(t => t.type === TransactionType.DEBIT)
          .reduce((sum, t) => sum + (t.amount || 0), 0);
        remaining = Math.max(0, total - paid);
        break;
    }

    return { 
      total, 
      paid, 
      remaining, 
      isFullyPaid: remaining <= 0 && total > 0 
    };
  };

  const { total, paid, remaining, isFullyPaid } = calculateTotals();

  return (
    <div className={`max-w-6xl mx-auto space-y-6 pb-10 ${onClose ? 'bg-brand-50/30 p-6 rounded-3xl' : ''}`}>
      {showSearch && (
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              {onClose && (
                <button onClick={onClose} className="p-3 bg-slate-100 rounded-2xl text-slate-500 hover:bg-slate-200 transition-all">
                  <X size={20} />
                </button>
              )}
              <div>
                <h1 className="text-2xl font-bold text-slate-800">ID Intelligence Report</h1>
                <p className="text-slate-500 mt-1">Unified historical and transaction profile.</p>
              </div>
            </div>
            <div className="flex gap-2">
              <div className="relative flex-1 md:w-80">
                <input
                  type="text"
                  placeholder="Enter ID"
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-brand-500 transition-all font-mono text-sm"
                  value={searchId}
                  onChange={(e) => setSearchId(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              </div>
              <button
                onClick={() => handleSearch()}
                disabled={loading}
                className="bg-brand-600 text-white px-6 py-3 rounded-2xl font-bold shadow-lg shadow-brand-200 hover:bg-brand-700 transition-all flex items-center justify-center disabled:opacity-50"
              >
                {loading ? <Clock className="animate-spin" size={20} /> : 'Search'}
              </button>
            </div>
          </div>
        </div>
      )}

      {onClose && !showSearch && (
         <div className="flex justify-start">
             <button onClick={onClose} className="p-3 bg-white border border-slate-200 rounded-2xl text-slate-500 hover:bg-slate-50 transition-all">
                <X size={20} />
            </button>
         </div>
      )}

      {loading && (
          <div className="py-20 text-center">
              <Clock className="animate-spin text-brand-600 mx-auto mb-4" size={48} />
              <p className="text-slate-500 font-bold">Assembling Intelligence Report...</p>
          </div>
      )}

      {result && !loading && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex justify-end gap-3 print:hidden">
            <button
              onClick={() => window.print()}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-slate-600 font-bold hover:bg-slate-50 transition-all shadow-sm"
            >
              <Printer size={18} /> Print Report
            </button>
            <button
              onClick={downloadReport}
              className="flex items-center gap-2 px-4 py-2 bg-brand-600 text-white rounded-xl font-bold hover:bg-brand-700 transition-all shadow-md shadow-brand-100"
            >
              <Download size={18} /> Download PDF Report
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1 space-y-6">
              <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
                <div className="flex items-center gap-4 mb-6">
                  <div className="p-3 bg-slate-50 rounded-2xl">
                    {getEntityIcon(result.type)}
                  </div>
                  <div>
                    <h2 className="font-bold text-slate-800 text-lg uppercase tracking-tight">{result.type} Profile</h2>
                    <p className="text-xs font-mono text-slate-400 font-bold">{result.entity.id}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="p-4 bg-slate-50 rounded-2xl">
                    <p className="text-[10px] uppercase font-black text-slate-400 tracking-widest mb-1">Full Name</p>
                    <p className="font-bold text-slate-800">{result.entity.title || ''} {result.entity.name}</p>
                  </div>

                  <div className="p-4 bg-slate-50 rounded-2xl">
                    <p className="text-[10px] uppercase font-black text-slate-400 tracking-widest mb-1">Phone</p>
                    <p className="text-xs font-bold text-slate-700 truncate">{result.entity.phone}</p>
                  </div>

                  <div className="p-4 bg-slate-50 rounded-2xl">
                    <p className="text-[10px] uppercase font-black text-slate-400 tracking-widest mb-1">Address</p>
                    <p className="text-xs text-slate-600 leading-relaxed font-medium">
                      {[result.entity.address, result.entity.district, result.entity.state].filter(Boolean).join(', ')}
                    </p>
                  </div>
                </div>
              </div>

              {(total > 0 || remaining !== 0) && (
                <div className="bg-brand-900 text-white p-6 rounded-3xl shadow-xl shadow-brand-200 space-y-4">
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] font-bold text-brand-200 uppercase tracking-widest">Financial Status</p>
                    <IndianRupee size={18} className="text-brand-300" />
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between items-end border-b border-white/10 pb-2">
                        <span className="text-xs text-white/60">Total Amount:</span>
                        <span className="text-lg font-bold">₹{total.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-end border-b border-white/10 pb-2">
                        <span className="text-xs text-white/60">Total Paid:</span>
                        <span className="text-lg font-bold text-green-400">₹{paid.toLocaleString()}</span>
                    </div>
                    <div className="pt-2">
                        <div className="flex justify-between items-center mb-1">
                            <span className="text-xs text-white/60">Remaining:</span>
                            {isFullyPaid && (
                                <span className="bg-green-500 text-white text-[10px] px-2 py-0.5 rounded-full font-black uppercase tracking-tighter">Fully Paid</span>
                            )}
                        </div>
                        <p className={`text-3xl font-black tracking-tight font-mono ${isFullyPaid ? 'text-green-400' : 'text-white'}`}>
                            ₹{remaining.toLocaleString()}
                        </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                  <div className="flex items-center gap-2">
                    <History size={20} className="text-brand-600" />
                    <h2 className="font-bold text-slate-800 uppercase tracking-tight">Timeline</h2>
                  </div>
                </div>
                <div className="p-6 max-h-[500px] overflow-y-auto">
                  {result.transactions.length > 0 ? (
                    <div className="space-y-4">
                      {result.transactions.map((tx) => (
                        <div key={tx.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                           <div className="flex justify-between items-center mb-2">
                              <p className="text-[10px] font-black text-slate-400 uppercase">{format(new Date(tx.date), 'MMM dd, yyyy')}</p>
                              <p className={`font-black ${tx.type === TransactionType.CREDIT ? 'text-green-600' : 'text-red-600'}`}>
                                {tx.type === TransactionType.CREDIT ? '+' : '-'} ₹{tx.amount.toLocaleString()}
                              </p>
                           </div>
                           <TransactionPartyLink tx={tx} className="text-sm font-bold text-slate-800" />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-slate-400 py-10">No transactions recorded.</p>
                  )}
                </div>
              </div>

              <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                  <div className="flex items-center gap-2">
                    <FileText size={20} className="text-brand-600" />
                    <h2 className="font-bold text-slate-800 uppercase tracking-tight">Assigned Documents</h2>
                  </div>
                  <p className="text-[10px] font-black text-slate-400 bg-slate-100 px-2 py-1 rounded-lg uppercase tracking-tight">
                    {result.documents.length} Total
                  </p>
                </div>
                <div className="p-6">
                  {result.documents.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {result.documents.map((doc) => (
                        <div key={doc.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:border-brand-200 transition-all group hover:shadow-sm">
                          <div className="flex items-center gap-3 overflow-hidden">
                            <div className={`p-2.5 rounded-xl ${doc.type === 'pdf' ? 'bg-red-50 text-red-500' : 'bg-blue-50 text-blue-500'}`}>
                              <FileText size={20} />
                            </div>
                            <div className="overflow-hidden">
                              <p className="text-sm font-bold text-slate-800 truncate" title={doc.name}>{doc.name}</p>
                              <div className="flex items-center gap-2">
                                <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">{doc.date}</p>
                                <span className="text-[10px] text-slate-300">•</span>
                                <p className="text-[10px] text-slate-400 uppercase font-black">{Math.round(Number(doc.size || 0) / 1024)} KB</p>
                              </div>
                            </div>
                          </div>
                          <button 
                            onClick={() => navigate(`/documents?search=${encodeURIComponent(doc.name)}`)}
                            className="p-2.5 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-xl transition-all shadow-sm bg-white"
                            title="View in Documents"
                          >
                            <Eye size={18} />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 px-4 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                      <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm">
                        <FileText size={24} className="text-slate-300" />
                      </div>
                      <p className="text-slate-500 text-sm font-bold">No documents uploaded</p>
                      <p className="text-slate-400 text-[10px] uppercase font-black tracking-widest mt-1">Upload in the Document Manager</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
