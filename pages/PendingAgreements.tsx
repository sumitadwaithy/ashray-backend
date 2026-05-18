import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { dbService } from '../services/db';
import { 
  FileText, 
  Printer, 
  Trash2, 
  CheckCircle, 
  Clock, 
  Search, 
  ArrowLeft, 
  AlertCircle,
  FileCheck
} from 'lucide-react';
import { AgreementPrintLayout } from '../components/AgreementTemplates';

interface PendingAgreement {
  id: string;
  partyId: string;
  partyName: string;
  partyType: 'Client' | 'Staff' | 'Kissan' | 'Investor';
  date: string;
  printed: boolean;
  previewData: any;
  role?: string;
}

export const PendingAgreements: React.FC = () => {
  const [agreements, setAgreements] = useState<PendingAgreement[]>([]);
  const [isRecovering, setIsRecovering] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'all' | 'pending' | 'printed'>('all');
  const [selectedAgreement, setSelectedAgreement] = useState<PendingAgreement | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const loadData = () => {
      const stored = JSON.parse(localStorage.getItem('pending_agreements') || '[]');
      setAgreements(stored);
    };
    loadData();
    window.addEventListener('storage', loadData);
    return () => window.removeEventListener('storage', loadData);
  }, []);

  const saveAgreements = (updated: PendingAgreement[]) => {
    localStorage.setItem('pending_agreements', JSON.stringify(updated));
    setAgreements(updated);
  };

  const recoverMissingAgreements = async () => {
    if (!confirm('Scan the database for missing agreements and add them to the pending list?')) return;
    
    setIsRecovering(true);
    try {
      const clients = await dbService.getClients();
      const kissans = await dbService.getKissans();
      const investors = await dbService.getInvestors();
      const staff = await dbService.getStaff();
      const settings = await dbService.getSettings();
      
      const stored = JSON.parse(localStorage.getItem('pending_agreements') || '[]');
      const currentIds = new Set(stored.map((a: any) => a.partyId));
      let addedCount = 0;
      
      const newAgreements = [...stored];
      
      for (const clientItem of clients) {
        const c = clientItem as any;
        if (!currentIds.has(c.id)) {
          newAgreements.push({
            id: `pa_${Date.now()}_${c.id}`,
            partyId: c.id,
            partyName: c.name?.en || c.name?.hi || (typeof c.name === 'string' ? c.name : 'Unknown'),
            partyType: 'Client',
            date: c.created_at || new Date().toISOString(),
            printed: false,
            previewData: {
              client: {
                ...c,
                name: c.name?.en || c.name?.hi || (typeof c.name === 'string' ? c.name : ''),
                title: c.title?.en || c.title?.hi || (typeof c.title === 'string' ? c.title : '')
              },
              property: c.investments?.[0] ? { totalAmount: c.investments[0].amount } : {},
              company: { companyName: settings?.companyName || '' },
              manager: { managerName: settings?.managers?.[0]?.name || '' }
            }
          });
          currentIds.add(c.id);
          addedCount++;
        }
      }
      
      for (const kissanItem of kissans) {
        const k = kissanItem as any;
        if (!currentIds.has(k.id)) {
          newAgreements.push({
            id: `pa_${Date.now()}_${k.id}`,
            partyId: k.id,
            partyName: k.name?.en || k.name?.hi || (typeof k.name === 'string' ? k.name : 'Unknown'),
            partyType: 'Kissan',
            date: k.created_at || new Date().toISOString(),
            printed: false,
            previewData: {
              kissan: { ...k, name: k.name?.en || k.name?.hi || (typeof k.name === 'string' ? k.name : '') },
              property: { totalAmount: k.totalAmount || 0 },
              company: { companyName: settings?.companyName || '' }
            }
          });
          currentIds.add(k.id);
          addedCount++;
        }
      }
      
      for (const investorItem of investors) {
        const i = investorItem as any;
        if (!currentIds.has(i.id)) {
          newAgreements.push({
            id: `pa_${Date.now()}_${i.id}`,
            partyId: i.id,
            partyName: i.name?.en || i.name?.hi || (typeof i.name === 'string' ? i.name : 'Unknown'),
            partyType: 'Investor',
            date: i.created_at || new Date().toISOString(),
            printed: false,
            previewData: {
              investor: { ...i, name: i.name?.en || i.name?.hi || (typeof i.name === 'string' ? i.name : '') },
              company: { companyName: settings?.companyName || '' }
            }
          });
          currentIds.add(i.id);
          addedCount++;
        }
      }
      
      for (const staffItem of staff) {
        const s = staffItem as any;
        if (!currentIds.has(s.id)) {
          newAgreements.push({
            id: `pa_${Date.now()}_${s.id}`,
            partyId: s.id,
            partyName: s.name?.en || s.name?.hi || (typeof s.name === 'string' ? s.name : 'Unknown'),
            partyType: 'Staff',
            date: s.created_at || new Date().toISOString(),
            printed: false,
            role: s.role,
            previewData: {
              staff: { ...s, name: s.name?.en || s.name?.hi || (typeof s.name === 'string' ? s.name : '') },
              company: { companyName: settings?.companyName || '' }
            }
          });
          currentIds.add(s.id);
          addedCount++;
        }
      }
      
      saveAgreements(newAgreements);
      alert(`Successfully recovered ${addedCount} missing agreements!`);
    } catch (e) {
      console.error(e);
      alert('Error recovering agreements');
    } finally {
      setIsRecovering(false);
    }
  };

  const deleteAgreement = (id: string) => {
    if (confirm('Are you sure you want to remove this agreement from the pending list?')) {
      saveAgreements(agreements.filter(a => a.id !== id));
    }
  };

  const togglePrinted = (id: string) => {
    saveAgreements(agreements.map(a => 
      a.id === id ? { ...a, printed: !a.printed } : a
    ));
  };

  const handlePrint = (agreement: PendingAgreement) => {
    setSelectedAgreement(agreement);
    setTimeout(() => {
      window.print();
      // After print dialog, maybe mark as printed
      if (!agreement.printed) {
        togglePrinted(agreement.id);
      }
      setSelectedAgreement(null);
    }, 500);
  };

  const filteredAgreements = agreements
    .filter(a => {
      const matchesSearch = (a.partyName || '').toLowerCase().includes((searchTerm || '').toLowerCase()) || 
                            (a.partyId || '').toLowerCase().includes((searchTerm || '').toLowerCase());
      const matchesFilter = filter === 'all' || 
                            (filter === 'pending' && !a.printed) || 
                            (filter === 'printed' && a.printed);
      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="min-h-screen bg-spiritual-cream/30 pb-20">
      {/* Header Area */}
      <div className="bg-white border-b border-spiritual-maroon/10 mb-6 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between py-4 gap-4">
            <div className="flex items-center gap-3">
              <button 
                onClick={() => navigate('/')}
                className="p-1.5 hover:bg-brand-50 rounded-full transition-colors text-spiritual-maroon"
              >
                <ArrowLeft size={20} />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-spiritual-maroon tracking-tight flex items-center gap-2">
                  <div className="p-1.5 bg-brand-50 rounded-lg">
                    <FileCheck className="text-brand-600" size={20} />
                  </div>
                  Pending Agreements
                </h1>
                <p className="text-xs text-slate-500 mt-0.5 font-medium italic">Track and manage agreements waiting for signatures</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3">
              <div className="relative w-full sm:w-72">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="text"
                  placeholder="Search party name or ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border-2 border-transparent focus:border-brand-200 focus:bg-white focus:ring-0 rounded-xl text-sm transition-all font-medium"
                />
              </div>

              <div className="flex p-1 bg-slate-100 rounded-xl border border-slate-200">
                <button
                  onClick={recoverMissingAgreements}
                  disabled={isRecovering}
                  className="px-5 py-2 mr-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all bg-indigo-50 text-indigo-600 hover:bg-indigo-100 disabled:opacity-50"
                  title="Scan database for ungenerated agreements"
                >
                  {isRecovering ? 'Scanning...' : 'Scan Missing'}
                </button>
                {(['all', 'pending', 'printed'] as const).map((f) => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`px-5 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${
                      filter === f 
                        ? 'bg-white text-brand-600 shadow-md ring-1 ring-black/5' 
                        : 'text-slate-500 hover:text-brand-600'
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
        {filteredAgreements.length === 0 ? (
          <div className="bg-white rounded-3xl p-20 text-center shadow-xl shadow-brand-900/5 border border-brand-100 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-brand-500 via-spiritual-maroon to-brand-500 opacity-20"></div>
            <div className="w-24 h-24 bg-brand-50 rounded-full flex items-center justify-center mx-auto mb-8 border border-brand-100">
              <FileCheck size={48} className="text-brand-200" />
            </div>
            <h3 className="text-2xl font-bold text-slate-800 mb-3">No Agreements Found</h3>
            <p className="text-slate-500 max-w-md mx-auto mb-10 text-lg leading-relaxed">
              {searchTerm || filter !== 'all' 
                ? "We couldn't find any agreements matching your criteria. Try adjusting your search or filters." 
                : "Your pending list is empty. New agreements generated during creation will appear here automatically."}
            </p>
            {(searchTerm || filter !== 'all') && (
              <button 
                onClick={() => {setSearchTerm(''); setFilter('all');}}
                className="bg-brand-50 text-brand-600 px-8 py-3 rounded-xl font-bold hover:bg-brand-100 transition-all active:scale-95"
              >
                Clear all filters
              </button>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-3xl shadow-xl shadow-brand-900/5 border border-brand-100 overflow-hidden relative">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-brand-100 text-left">
                    <th className="px-8 py-5 text-xs font-black text-brand-700 uppercase tracking-[0.2em]">Status</th>
                    <th className="px-8 py-5 text-xs font-black text-brand-700 uppercase tracking-[0.2em]">Party Details</th>
                    <th className="px-8 py-5 text-xs font-black text-brand-700 uppercase tracking-[0.2em]">Agreement Type</th>
                    <th className="px-8 py-5 text-xs font-black text-brand-700 uppercase tracking-[0.2em] text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-50/50">
                  {filteredAgreements.map((agreement) => (
                    <tr key={agreement.id} className="hover:bg-brand-50/30 transition-colors group">
                      <td className="px-8 py-6 whitespace-nowrap">
                        <div className="flex items-center">
                          {agreement.printed ? (
                            <span className="flex items-center gap-2 px-4 py-1.5 bg-emerald-50 text-emerald-700 rounded-full text-xs font-black border border-emerald-100 shadow-sm">
                              <CheckCircle size={16} />
                              COMPLETED
                            </span>
                          ) : (
                            <span className="flex items-center gap-2 px-4 py-1.5 bg-orange-50 text-orange-700 rounded-full text-xs font-black border border-orange-100 shadow-sm animate-pulse">
                              <Clock size={16} />
                              WAITING
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex flex-col">
                          <div className="text-lg font-bold text-slate-900 group-hover:text-brand-600 transition-colors">{agreement.partyName}</div>
                          <div className="text-sm text-slate-400 flex items-center gap-3 mt-1 font-medium">
                            <span className="bg-slate-100 px-2 py-0.5 rounded text-[10px] tracking-widest uppercase">{agreement.partyId}</span>
                            <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                            {agreement.date ? new Date(agreement.date).toLocaleDateString(undefined, {
                              month: 'long',
                              day: 'numeric',
                              year: 'numeric'
                            }) : 'N/A'}
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-3 text-spiritual-maroon/70">
                          <div className="p-2 bg-spiritual-cream rounded-lg border border-brand-100">
                             <FileText size={18} />
                          </div>
                          <span className="text-xs uppercase font-black tracking-widest">
                            {agreement.partyType}
                          </span>
                        </div>
                      </td>
                      <td className="px-8 py-6 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-3 sm:opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0">
                          <button 
                            onClick={() => handlePrint(agreement)}
                            className="p-3 bg-brand-50 text-brand-600 hover:bg-brand-600 hover:text-white rounded-2xl transition-all shadow-sm active:scale-90"
                            title="Print Agreement"
                          >
                            <Printer size={20} />
                          </button>
                          <button 
                            onClick={() => togglePrinted(agreement.id)}
                            className={`p-3 rounded-2xl transition-all shadow-sm active:scale-90 ${
                              agreement.printed 
                                ? 'bg-amber-50 text-amber-600 hover:bg-amber-600 hover:text-white' 
                                : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white'
                            }`}
                            title={agreement.printed ? "Mark as Pending" : "Mark as Completed"}
                          >
                            {agreement.printed ? <Clock size={20} /> : <CheckCircle size={20} />}
                          </button>
                          <button 
                            onClick={() => deleteAgreement(agreement.id)}
                            className="p-3 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white rounded-2xl transition-all shadow-sm active:scale-90"
                            title="Delete"
                          >
                            <Trash2 size={20} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <div className="mt-12 flex items-start gap-4 p-6 bg-brand-50/50 border-2 border-brand-100 rounded-3xl text-brand-900 border-dashed">
          <div className="p-3 bg-white rounded-2xl border border-brand-100 shadow-sm text-brand-600 shrink-0">
            <AlertCircle size={24} />
          </div>
          <div className="text-sm">
            <p className="font-bold text-lg mb-2 text-spiritual-maroon">Signature Process Management</p>
            <p className="opacity-80 text-base leading-relaxed">Agreements are tracked here once generated during a party registration or profile update. Use the print action to output the document. Once physically signed and completed, mark as "Completed" to keep your records organized. Completed agreements are archived and stop showing alerts on the main dashboard.</p>
          </div>
        </div>
      </div>

      {/* Hidden Print Area */}
      <div className="hidden print:block fixed inset-0 z-[9999] bg-white">
        {selectedAgreement && (
          <AgreementPrintLayout 
            type={selectedAgreement.partyType === 'Client' ? 'sale_agreement' : 'agreement'} 
            data={selectedAgreement.previewData}
            language={selectedAgreement.previewData?.language || 'hi'}
          />
        )}
      </div>
    </div>
  );
};
