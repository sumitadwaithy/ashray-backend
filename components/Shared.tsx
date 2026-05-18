
import React, { useState, useEffect } from 'react';
import { Transaction, TransactionType, Doc, PaymentMethod, AppSettings, Client } from '../types';
import { Trash2, Edit2, FileText, Download, X, Printer, Loader2, Eye } from 'lucide-react';
import { dbService } from '../services/db';
import { Accounting } from '../services/accounting';
import { StatementPrintView } from './StatementTemplate';
import { TransactionPartyLink } from './TransactionPartyLink';
import { useNavigate } from 'react-router-dom';
import { ReceiptPrintView, ReceiptTemplate } from './Receipt';
import { getDocUrl, handleDownloadDoc } from './docUtils';

interface DocumentViewerProps {
  doc: Doc | null;
  onClose: () => void;
}

export const DocumentViewer: React.FC<DocumentViewerProps> = ({ doc, onClose }) => {
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setHasError(false);
  }, [doc]);

  if (!doc) return null;

  const url = getDocUrl(doc) || '';
  const isLocal = url.startsWith('data:');

  return (
    <div className="fixed inset-0 bg-slate-950/80 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-slate-900 rounded-2xl w-full max-w-5xl h-[90vh] flex flex-col overflow-hidden shadow-2xl border border-slate-800">
        <div className="flex justify-between items-center p-4 border-b border-slate-800 bg-slate-800/50">
          <h3 className="font-bold text-white flex items-center">
            <FileText size={18} className="mr-2 text-brand-400" />
            {doc.name}
          </h3>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => handleDownloadDoc(doc)}
              className="p-2 text-slate-400 hover:text-brand-400 hover:bg-slate-800 rounded-lg transition-colors"
              title="Download"
            >
              <Download size={18} />
            </button>
            <button 
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-lg transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        </div>
        <div className="flex-1 bg-slate-950 overflow-auto flex items-center justify-center p-4 relative">
          {!url || hasError ? (
            <div className="text-center p-8 bg-slate-900 rounded-xl shadow-sm border border-red-900/30 max-w-md">
              <div className="w-16 h-16 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <X size={32} />
              </div>
              <h4 className="text-lg font-bold text-white mb-2">Document Not Found</h4>
              <p className="text-slate-400 mb-4">
                The file content for this document is missing or corrupted. This usually happens with older documents that were not fully uploaded or were stored in a different format.
              </p>
              <p className="text-sm text-slate-500 font-medium">
                Try downloading the file instead, or re-upload the document if the problem persists.
              </p>
            </div>
          ) : doc.type === 'pdf' || (doc.name && doc.name.toLowerCase().endsWith('.pdf')) ? (
            <iframe 
              src={url} 
              className="w-full h-full rounded-lg shadow-sm bg-white" 
              title={doc.name}
              onError={() => setHasError(true)}
              referrerPolicy="no-referrer"
            />
          ) : (
            <img 
              src={url} 
              alt={doc.name} 
              className="max-w-full max-h-full object-contain rounded-lg shadow-sm"
              onError={() => setHasError(true)}
              referrerPolicy="no-referrer"
            />
          )}
        </div>
      </div>
    </div>
  );
};

interface TransactionTableProps {
  transactions: Transaction[];
  onUpdate?: () => void;
  showBalance?: boolean;
  initialBalance?: number;
}

export const TransactionTable: React.FC<TransactionTableProps> = ({ 
  transactions, 
  onUpdate, 
  showBalance = false,
  initialBalance = 0 
}) => {
  const navigate = useNavigate();
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [clients, setClients] = useState<Client[]>([]);
  const [pendingReceipts, setPendingReceipts] = useState<any[]>([]);
  const [printReceiptTx, setPrintReceiptTx] = useState<Transaction | null>(null);
  const [viewReceiptTx, setViewReceiptTx] = useState<Transaction | null>(null);

  useEffect(() => {
    dbService.getSettings().then(setSettings);
    dbService.getClients().then(setClients);
    
    // Initial load
    const receipts = JSON.parse(localStorage.getItem('pending_receipts') || '[]');
    setPendingReceipts(receipts);

    // Listen for storage changes (for real-time color updates across tabs/windows)
    const handleStorage = () => {
      const updated = JSON.parse(localStorage.getItem('pending_receipts') || '[]');
      setPendingReceipts(updated);
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);
  
  const getReceiptStatus = (txId: string) => {
    const receipt = pendingReceipts.find(r => r.transactionId === txId);
    if (!receipt) return 'none';
    return receipt.printed ? 'printed' : 'pending';
  };
  
  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this transaction? This will reverse the balance.")) {
      await dbService.deleteTransaction(id);
      if (onUpdate) onUpdate();
      else window.location.reload(); // Simple reload fallback
    }
  };

  const getMethodShortcut = (method: PaymentMethod) => {
    switch (method) {
      case PaymentMethod.CASH: return 'CSH';
      case PaymentMethod.UPI: return 'UPI';
      case PaymentMethod.BANK_TRANSFER: return 'BT';
      case PaymentMethod.CHEQUE: return 'CHQ';
      case PaymentMethod.ONLINE: return 'ONL';
      case PaymentMethod.RTGS: return 'RTG';
      case PaymentMethod.JOURNAL: return 'JRN';
      case PaymentMethod.TRANSFER: return 'TRF';
      default: return method;
    }
  };

  // Calculate running balance if needed
  let runningBalance = initialBalance;
  const processedTransactions = showBalance 
    ? transactions.map(tx => {
        if (tx.type === TransactionType.CREDIT) {
          runningBalance = Accounting.add(runningBalance, tx.amount);
        } else {
          runningBalance = Accounting.subtract(runningBalance, tx.amount);
        }
        return { ...tx, displayBalance: runningBalance };
      })
    : transactions;

  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-50/50 border-b border-slate-100">
            <tr>
              <th className="px-6 py-4 text-[10px] font-bold text-slate-600 uppercase tracking-widest">Date & Ref</th>
              <th className="px-6 py-4 text-[10px] font-bold text-slate-600 uppercase tracking-widest">Particulars</th>
              <th className="px-6 py-4 text-[10px] font-bold text-slate-600 uppercase tracking-widest text-right">Amount</th>
              {showBalance && <th className="px-6 py-4 text-[10px] font-bold text-slate-600 uppercase tracking-widest text-right">Balance</th>}
              <th className="px-6 py-4 text-[10px] font-bold text-slate-600 uppercase tracking-widest text-center">Status</th>
              <th className="px-6 py-4 text-[10px] font-bold text-slate-600 uppercase tracking-widest text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {processedTransactions.map((tx: any) => (
              <tr key={tx.id} className="hover:bg-slate-50 group transition-colors">
                <td className="px-6 py-4">
                  <div className="text-sm font-bold text-slate-900">{tx.date}</div>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="text-[10px] font-bold text-brand-600 tracking-widest uppercase">
                      {getMethodShortcut(tx.method)}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono tracking-tighter truncate max-w-[80px]">
                      {tx.referenceId || (tx.id || '').slice(0, 8)}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <TransactionPartyLink tx={tx} className="text-sm font-bold text-slate-700 block" />
                  <div className="text-[10px] text-slate-400 mt-0.5 flex items-center">
                    <span className="bg-slate-100 px-1.5 py-0.5 rounded mr-2 border border-slate-200 uppercase tracking-tighter text-[9px]">{tx.method}</span>
                    {tx.expenseCategory && <span className="text-brand-500 font-medium italic">#{tx.expenseCategory}</span>}
                  </div>
                </td>
                <td className={`px-6 py-4 text-sm font-black text-right font-mono ${tx.type === TransactionType.DEBIT ? 'text-red-600' : 'text-emerald-600'}`}>
                  {tx.type === TransactionType.DEBIT ? '-' : '+'}₹{Accounting.formatIndian(tx.amount)}
                </td>
                {showBalance && (
                  <td className="px-6 py-4 text-sm font-black text-right font-mono text-slate-600">
                    {Accounting.formatDrCr(tx.displayBalance)}
                  </td>
                )}
                <td className="px-6 py-4 text-center">
                  <div className="flex justify-center">
                    <div className={`w-2 h-2 rounded-full ${tx.synced ? 'bg-emerald-500' : 'bg-orange-500'} shadow-sm`}></div>
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => navigate('/add-transaction', { state: { transaction: tx, editMode: true } })}
                      className="text-slate-400 hover:text-brand-600 p-1.5 hover:bg-brand-50 rounded-lg transition-all" 
                      title="Edit"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button onClick={() => handleDelete(tx.id)} className="text-slate-400 hover:text-red-600 p-1.5 hover:bg-red-50 rounded-lg transition-all" title="Delete">
                      <Trash2 size={16} />
                    </button>
                    {(() => {
                      const status = getReceiptStatus(tx.id);
                      if (status === 'printed' || tx.receiptUrl) {
                        return (
                          <>
                            <button 
                              onClick={async () => {
                                // If it's a static URL, open it
                                if (tx.receiptUrl && tx.receiptUrl.startsWith('http')) {
                                  window.open(tx.receiptUrl, '_blank');
                                  return;
                                }
                                // Otherwise, open the View locally
                                setViewReceiptTx(tx);
                              }}
                              className="p-1.5 rounded-lg transition-all shadow-sm text-blue-600 bg-blue-50 hover:bg-blue-100 opacity-100"
                              title="View Receipt"
                            >
                              <Eye size={16} />
                            </button>
                            <button 
                              onClick={() => {
                                setPrintReceiptTx(tx);
                              }}
                              className="p-1.5 rounded-lg transition-all shadow-sm text-emerald-600 bg-emerald-50 hover:bg-emerald-100 opacity-100"
                              title="Download / Print Receipt"
                            >
                              <FileText size={16} />
                            </button>
                          </>
                        );
                      }
                      
                      return (
                        <button 
                          onClick={() => {
                            const pending = JSON.parse(localStorage.getItem('pending_receipts') || '[]');
                            const found = pending.find((r: any) => r.transactionId === tx.id);
                            navigate('/generate-receipt', { state: { transaction: tx, pendingId: found?.id } });
                          }}
                          className={`p-1.5 rounded-lg transition-all shadow-sm ${
                            status === 'pending' 
                              ? 'text-red-600 bg-red-50 hover:bg-red-100 ring-1 ring-red-200 opacity-100' 
                              : 'text-slate-400 hover:text-brand-600 hover:bg-brand-50'
                          }`}
                          title={status === 'pending' ? "Generate Pending Receipt" : "Generate Receipt"}
                        >
                          <Printer size={16} />
                        </button>
                      );
                    })()}
                  </div>
                </td>
              </tr>
            ))}
            {transactions.length === 0 && (
              <tr>
                <td colSpan={showBalance ? 6 : 5} className="text-center py-20 text-slate-400 text-sm italic">No transactions found in this view.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {viewReceiptTx && settings && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-slate-100/50 w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-xl relative backdrop-blur-md border border-white/20">
            <div className="sticky top-0 right-0 p-4 flex justify-end z-10">
              <button onClick={() => setViewReceiptTx(null)} className="p-2 bg-white rounded-full shadow hover:bg-slate-50 text-slate-500 hover:text-slate-700 transition">
                <X size={20} />
              </button>
            </div>
            <div className="p-4 pt-0 w-full flex justify-center">
               <div className="w-full origin-top transform sm:scale-100 scale-75 origin-top">
                 <ReceiptTemplate
                   transaction={viewReceiptTx}
                   client={{ name: viewReceiptTx.partyName || '' } as any}
                   settings={settings}
                 />
               </div>
            </div>
          </div>
        </div>
      )}

      {printReceiptTx && settings && (
        <ReceiptPrintView
          open={!!printReceiptTx}
          onClose={() => setPrintReceiptTx(null)}
          transaction={printReceiptTx}
          client={{ name: printReceiptTx.partyName || printReceiptTx.particulars || '' } as any}
          settings={settings}
        />
      )}
    </>
  );
};
