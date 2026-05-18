import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, Clock, Receipt } from 'lucide-react';
import { dbService } from '../services/db';

export interface PendingReceipt {
  id: string;
  transactionId: string;
  payeeName: string;
  amount: number;
  date: string;
  partyType?: string;
  partyId?: string;
  printed: boolean;
}

export const PendingReceipts: React.FC = () => {
  const [receipts, setReceipts] = useState<PendingReceipt[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;
    const loadData = async () => {
      let stored = JSON.parse(localStorage.getItem('pending_receipts') || '[]');
      
      // Auto-migrate partyName to payeeName
      let modified = false;
      stored = stored.map((r: any) => {
        if (r.partyName && !r.payeeName) {
          modified = true;
          return { ...r, payeeName: r.partyName };
        }
        return r;
      });
      if (modified) localStorage.setItem('pending_receipts', JSON.stringify(stored));
      
      if (isMounted) setReceipts(stored);
    };
    loadData();
    window.addEventListener('storage', loadData);
    return () => {
      isMounted = false;
      window.removeEventListener('storage', loadData);
    };
  }, []);

  const handleRemindLater = () => {
    localStorage.setItem('pending_receipts_remind_after', (Date.now() + 15 * 60 * 1000).toString()); // 15 mins
    navigate('/');
  };

  const handleGenerate = (receipt: PendingReceipt) => {
    let url = `/generate-receipt?amount=${receipt.amount}&date=${receipt.date}&payeeName=${encodeURIComponent(receipt.payeeName || '')}&pendingId=${receipt.id}`;
    if (receipt.partyId) url += `&partyId=${receipt.partyId}`;
    url += `&particulars=${encodeURIComponent('Payment Received')}`;
    navigate(url);
  };

  const activeCount = receipts.filter(r => !r.printed).length;

  if (receipts.length === 0) {
    return (
      <div className="max-w-3xl mx-auto py-10 text-center">
        <h1 className="text-2xl font-bold text-slate-800 mb-4">No Pending Receipts</h1>
        <p className="text-slate-500 mb-6">You have no receipts to generate currently.</p>
        <button onClick={() => navigate('/')} className="bg-spiritual-maroon text-white px-4 py-2 rounded-lg">Return to Dashboard</button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-10 px-4">
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-200 bg-red-50 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-red-900 mb-1 flex items-center">
              <Receipt className="mr-2" size={24} /> 
              Receipts to Generate
            </h1>
            <p className="text-sm text-red-700">You have {activeCount} receipt{activeCount !== 1 && 's'} remaining to generate for recent payments.</p>
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
            {receipts.map((receipt) => (
              <div key={receipt.id} className={`flex items-center justify-between p-4 rounded-xl border ${receipt.printed ? 'bg-green-50/50 border-green-100' : 'bg-slate-50 border-slate-200'}`}>
                <div>
                  <h3 className={`font-bold ${receipt.printed ? 'text-green-800' : 'text-slate-800'}`}>{receipt.payeeName}</h3>
                  <div className="flex items-center mt-1 space-x-4">
                    <span className="text-sm text-slate-500">Amount: <strong className="text-slate-700">₹{receipt.amount.toLocaleString('en-IN')}</strong></span>
                    <span className="text-sm text-slate-500">Date: {receipt.date}</span>
                  </div>
                </div>

                <div>
                  {receipt.printed ? (
                    <div className="flex items-center text-green-600 font-bold px-4 py-2">
                      <CheckCircle size={20} className="mr-2" />
                      Printed
                    </div>
                  ) : (
                    <button 
                      onClick={() => handleGenerate(receipt)}
                      className="flex items-center bg-spiritual-maroon text-white px-4 py-2 rounded-lg hover:bg-red-800 font-medium shadow-sm"
                    >
                      <Receipt size={16} className="mr-2" />
                      Generate Receipt
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
              <p className="text-slate-600 mb-6">All pending receipts have been generated.</p>
              <button 
                onClick={() => {
                  localStorage.removeItem('pending_receipts');
                  localStorage.removeItem('pending_receipts_remind_after');
                  navigate('/');
                }}
                className="bg-spiritual-maroon text-white px-6 py-2 rounded-lg font-bold hover:bg-red-800"
              >
                Back to Dashboard
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
