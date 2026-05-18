import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Printer, CheckCircle, Clock } from 'lucide-react';
import { dbService } from '../services/db';

export interface PendingCheque {
  id: string;
  payeeName: string;
  amount: number;
  date: string;
  partyType?: string;
  partyId?: string;
  printed: boolean;
}

export const PendingCheques: React.FC = () => {
  const [cheques, setCheques] = useState<PendingCheque[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;
    const loadData = async () => {
      let stored = JSON.parse(localStorage.getItem('pending_cheques') || '[]');
      
      let modified = false;
      stored = stored.map((r: any) => {
        if (r.partyName && !r.payeeName) {
          modified = true;
          return { ...r, payeeName: r.partyName };
        }
        return r;
      });
      if (modified) localStorage.setItem('pending_cheques', JSON.stringify(stored));
      
      const clientsList = await dbService.getClients();
      const kissansList = await (dbService as any).getKissans ? await (dbService as any).getKissans() : await (dbService as any).getKissan();
      const investorsList = await dbService.getInvestors();
      const loansList = await dbService.getLoans();
      const staffList = await dbService.getStaff();

      const validIds = new Set([
        ...clientsList.map((c: any) => c.id),
        ...kissansList.map((k: any) => k.id),
        ...investorsList.map((i: any) => i.id),
        ...loansList.map((l: any) => l.id),
        ...staffList.map((s: any) => s.id),
        ...kissansList.flatMap((k: any) => k.owners?.map((o: any) => `${k.id}::${o.id}`) || [])
      ]);

      const validNames = new Set([
        ...clientsList.map((c: void | any) => c.name?.toLowerCase()),
        ...kissansList.map((k: void | any) => k.landName?.toLowerCase()),
        ...investorsList.map((i: void | any) => i.name?.toLowerCase()),
        ...loansList.map((l: void | any) => l.borrowerName?.toLowerCase()),
        ...staffList.map((s: void | any) => s.name?.toLowerCase()),
        ...kissansList.flatMap((k: void | any) => k.owners?.map((o: any) => o.name?.toLowerCase()) || [])
      ]);

      const validCheques = stored.filter((c: any) => {
        if (c.partyId) return validIds.has(c.partyId);
        if (c.payeeName) return validNames.has(c.payeeName.toLowerCase());
        return true;
      });
      if (validCheques.length !== stored.length) {
        localStorage.setItem('pending_cheques', JSON.stringify(validCheques));
      }

      if (isMounted) setCheques(validCheques);
    };
    loadData();
    window.addEventListener('storage', loadData);
    return () => {
      isMounted = false;
      window.removeEventListener('storage', loadData);
    };
  }, []);

  const handleRemindLater = () => {
    localStorage.setItem('pending_cheques_remind_after', (Date.now() + 15 * 60 * 1000).toString()); // 15 mins
    navigate('/');
  };

  const handleGenerate = (cheque: PendingCheque) => {
    let url = `/generate-cheque?amount=${cheque.amount}&date=${cheque.date}&payeeName=${encodeURIComponent(cheque.payeeName)}&pendingId=${cheque.id}`;
    if (cheque.partyType) url += `&partyType=${cheque.partyType}`;
    if (cheque.partyId) url += `&partyId=${cheque.partyId}`;
    navigate(url);
  };

  const activeCount = cheques.filter(c => !c.printed).length;

  if (cheques.length === 0) {
    return (
      <div className="max-w-3xl mx-auto py-10 text-center">
        <h1 className="text-2xl font-bold text-slate-800 mb-4">No Pending Cheques</h1>
        <p className="text-slate-500 mb-6">You have no cheques to print currently.</p>
        <button onClick={() => navigate('/')} className="bg-brand-600 text-white px-4 py-2 rounded-lg">Return to Dashboard</button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-10">
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-200 bg-brand-50 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-brand-900 mb-1 flex items-center">
              <Printer className="mr-2" size={24} /> 
              Cheques to Print
            </h1>
            <p className="text-sm text-brand-700">You have {activeCount} cheque{activeCount !== 1 && 's'} remaining to print for recent land purchases.</p>
          </div>
          <button 
            onClick={handleRemindLater}
            className="flex items-center gap-2 bg-white text-slate-600 px-4 py-2 rounded-lg border border-slate-200 hover:bg-slate-50 hover:text-slate-900 transition-colors text-sm font-medium shadow-sm"
          >
            <Clock size={16} /> Remind Me Later
          </button>
        </div>

        <div className="p-6">
          <div className="space-y-4">
            {cheques.map((cheque) => (
              <div key={cheque.id} className={`flex items-center justify-between p-4 rounded-xl border ${cheque.printed ? 'bg-green-50/50 border-green-100' : 'bg-slate-50 border-slate-200'}`}>
                <div>
                  <h3 className={`font-bold ${cheque.printed ? 'text-green-800' : 'text-slate-800'}`}>{cheque.payeeName}</h3>
                  <div className="flex items-center mt-1 space-x-4">
                    <span className="text-sm text-slate-500">Amount: <strong className="text-slate-700">₹{cheque.amount.toLocaleString('en-IN')}</strong></span>
                    <span className="text-sm text-slate-500">Date: {cheque.date}</span>
                  </div>
                </div>

                <div>
                  {cheque.printed ? (
                    <div className="flex items-center text-green-600 font-bold px-4 py-2">
                      <CheckCircle size={20} className="mr-2" />
                      Printed
                    </div>
                  ) : (
                    <button 
                      onClick={() => handleGenerate(cheque)}
                      className="flex items-center bg-brand-600 text-white px-4 py-2 rounded-lg hover:bg-brand-700 font-medium shadow-sm"
                    >
                      <Printer size={16} className="mr-2" />
                      Generate Cheque
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {activeCount === 0 && (
            <div className="mt-8 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 text-green-600 mb-4">
                <CheckCircle size={32} />
              </div>
              <h2 className="text-xl font-bold text-slate-800 mb-2">All Done!</h2>
              <p className="text-slate-600 mb-6">All pending cheques have been printed.</p>
              <button 
                onClick={() => {
                  localStorage.removeItem('pending_cheques');
                  localStorage.removeItem('pending_cheques_remind_after');
                  navigate('/kissan-khata');
                }}
                className="bg-brand-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-brand-700"
              >
                Continue to Kissan Khata
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
export default PendingCheques;