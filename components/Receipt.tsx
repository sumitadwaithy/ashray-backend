
import React from 'react';
import { AppSettings, Transaction, Client, PaymentMethod } from '../types';

// Receipt Header Logo
const ReceiptLogo = ({ src, className }: { src?: string; className?: string }) => (
  src ? (
    <img src={src} alt="Company Logo" className={className} referrerPolicy="no-referrer" />
  ) : (
    <div className={`flex items-center justify-center bg-slate-100 rounded border border-slate-200 ${className}`}>
      <span className="text-[10px] font-bold text-slate-400">LOGO</span>
    </div>
  )
);

interface ReceiptProps {
  transaction: Partial<Transaction>;
  client?: Partial<Client>;
  settings: AppSettings;
}

export const ReceiptTemplate: React.FC<ReceiptProps> = ({ transaction, client, settings }) => {
    const partyName = transaction.clientName || transaction.partyName || (client?.name);
    const partyPhone = client?.phone || ''; 
    const companyAddress = settings.companyAddresses?.[0]?.addressLine || 'Corporate Office';
    const taxId = settings.companyGST || settings.gstNumbers?.[0]?.gstin || settings.panNumber || 'N/A';
    
    return (
      <div id="receipt-print" className="bg-white p-8 max-w-2xl mx-auto text-slate-900 border-4 border-double border-spiritual-maroon relative overflow-hidden shadow-2xl">
        
        {/* Watermark Logo */}
        <div className="absolute inset-0 flex items-center justify-center opacity-[0.05] pointer-events-none">
          {settings.companyLogo ? (
            <img src={settings.companyLogo} alt="Watermark" className="w-64 h-64 object-contain" referrerPolicy="no-referrer" />
          ) : (
            <div className="w-64 h-64 border-4 border-dashed border-slate-200 rounded-full flex items-center justify-center text-slate-200 font-bold text-4xl transform -rotate-12">
              RECEIPT
            </div>
          )}
        </div>
  
        {/* Header */}
        <div className="flex justify-between items-start border-b-2 border-spiritual-gold pb-6 mb-6">
          <div className="flex items-center space-x-4">
             <div className="border-2 border-spiritual-maroon p-1 rounded-lg bg-white shadow-sm overflow-hidden flex items-center justify-center w-16 h-16">
               <ReceiptLogo src={settings.companyLogo} className="max-w-full max-h-full object-contain" />
             </div>
             <div>
               <h1 className="text-2xl font-bold text-spiritual-maroon uppercase tracking-wide">{settings.companyName}</h1>
               <p className="text-sm text-slate-600 max-w-[200px] leading-tight mt-1">{companyAddress}</p>
               <p className="text-xs text-slate-500 mt-1">GST/PAN: {taxId}</p>
             </div>
          </div>
          <div className="text-right">
            <h2 className="text-3xl font-bold text-slate-200 uppercase">Receipt</h2>
            <div className="mt-2 text-sm font-mono text-slate-600">
               <p>NO: {transaction.referenceId}</p>
               <p>DATE: {transaction.date}</p>
            </div>
          </div>
        </div>
  
        {/* Content */}
        <div className="space-y-6 text-sm">
          <div className="flex justify-between items-center bg-brand-50 p-4 rounded-lg border border-brand-100">
            <span className="font-semibold text-spiritual-maroon text-lg">RECEIVED WITH THANKS FROM</span>
          </div>
          
          <div className="pl-4 border-l-4 border-spiritual-gold space-y-4">
             <div>
               <p className="text-xs uppercase text-slate-500 font-bold tracking-wider">Name</p>
               <p className="text-lg font-medium text-slate-800">{partyName}</p>
             </div>
             
             <div className="grid grid-cols-2 gap-8">
               <div>
                 <p className="text-xs uppercase text-slate-500 font-bold tracking-wider">Phone</p>
                 <p className="font-mono text-slate-700">{partyPhone || 'N/A'}</p>
               </div>
               <div>
                 <p className="text-xs uppercase text-slate-500 font-bold tracking-wider">Reference / Project</p>
                 <p className="text-slate-700">{transaction.landName || (client as any)?.projectName || (client as any)?.village || 'General'} {(client as any)?.plotNumber ? `/ ${(client as any).plotNumber}` : ''}</p>
               </div>
             </div>
          </div>

        <div className="py-4">
          <div className="flex items-baseline mb-2">
             <p className="text-xs uppercase text-slate-500 font-bold tracking-wider w-32">The Sum of</p>
             <p className="flex-1 border-b border-dotted border-slate-400 font-medium text-slate-800 italic">
               Rupees {Number(transaction.amount || 0).toLocaleString()} Only
             </p>
          </div>
          <div className="flex items-baseline mb-2">
             <p className="text-xs uppercase text-slate-500 font-bold tracking-wider w-32">Towards</p>
             <p className="flex-1 border-b border-dotted border-slate-400 text-slate-800">
               {transaction.particulars}
             </p>
          </div>
          <div className="flex items-start">
             <p className="text-xs uppercase text-slate-500 font-bold tracking-wider w-32 mt-1">Payment Mode</p>
             <div className="flex-1">
                {transaction.isSplit && (transaction as any).splitPayments ? (
                  <div className="space-y-1">
                    {(transaction as any).splitPayments.map((p: any, i: number) => (
                      <div key={i} className="flex justify-between border-b border-dotted border-slate-300 pb-1">
                        <span className="text-slate-800">{p.method} {p.reference ? `(${p.reference})` : ''}</span>
                        <span className="font-bold text-slate-700">₹{Number(p.amount || 0).toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="border-b border-dotted border-slate-400 text-slate-800 pb-1">
                    {transaction.method} {transaction.referenceId && `(${transaction.referenceId})`}
                  </p>
                )}
             </div>
          </div>
        </div>

        {/* Amount Box */}
        <div className="flex justify-between items-center mt-8 pt-6 border-t border-slate-200">
           <div className="bg-spiritual-maroon text-white px-6 py-3 rounded-xl shadow-lg flex items-center">
             <span className="text-2xl font-bold mr-1">₹</span>
             <span className="text-2xl font-bold tracking-widest">{Number(transaction.amount).toLocaleString()}</span>
           </div>

           <div className="text-center">
             <div className="h-16 w-32 mb-2 flex items-end justify-center">
                {/* Signature Placeholder */}
                <span className="font-script text-2xl text-slate-400">Authorized</span>
             </div>
             <p className="text-xs font-bold uppercase text-slate-500 border-t border-slate-400 pt-1 w-40">Authorized Signatory</p>
           </div>
        </div>
      </div>

      <div className="mt-8 text-center text-[10px] text-slate-400 uppercase tracking-widest">
         Computer Generated Receipt • No Signature Required
      </div>
    </div>
  );
};

import PrintPreview from './Printpreview';

export const ReceiptPrintView: React.FC<{
  transaction: Transaction;
  client?: Client;
  settings: AppSettings;
  open: boolean;
  onClose: () => void;
}> = ({ transaction, client, settings, open, onClose }) => {
  return (
    <PrintPreview
      open={open}
      onClose={onClose}
      title="Payment Receipt"
      subtitle={`Receipt No: ${transaction.referenceId}`}
      companyName={settings.companyName}
      taxId={`GST/PAN: ${settings.taxId || settings.panNumber || settings.gstNumber || ''}`}
    >
      <div className="a4-page">
        <ReceiptTemplate 
          transaction={transaction} 
          client={client} 
          settings={settings} 
        />
      </div>
    </PrintPreview>
  );
};

