import React, { useState } from 'react';
import { RefreshCw, CheckCircle, FileText, Database } from 'lucide-react';
import { dbService } from '../services/db';

export const SyncCenter: React.FC = () => {
  const [websiteSyncing, setWebsiteSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);

  const handleWebsiteSync = async () => {
    setWebsiteSyncing(true);
    setSyncMessage(null);
    const result = await dbService.syncToWebsite();
    setSyncMessage(result.message);
    setWebsiteSyncing(false);
    setTimeout(() => setSyncMessage(null), 5000);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 text-center">
        <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <RefreshCw size={32} className={`text-blue-600 ${websiteSyncing ? 'animate-spin' : ''}`} />
        </div>
        <h2 className="text-xl font-bold text-slate-800">Sync Status: Healthy</h2>
        <p className="text-slate-500 mt-2">Last synced: Just now</p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-6">
          <button 
            onClick={handleWebsiteSync}
            disabled={websiteSyncing}
            className="bg-brand-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-brand-700 disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm"
          >
            <RefreshCw size={18} className={websiteSyncing ? 'animate-spin' : ''} />
            {websiteSyncing ? 'Syncing to Website...' : 'Sync With Website'}
          </button>
        </div>

        {syncMessage && (
          <div className={`mt-4 p-3 rounded-lg text-sm font-medium ${syncMessage.includes('Successfully') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
            {syncMessage}
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-4 border-b border-slate-100 font-semibold text-slate-800">
          Pending Changes Queue
        </div>
        <div className="p-4">
           {/* Placeholder for empty state */}
           <div className="flex items-center justify-center py-8 text-slate-400">
             <CheckCircle size={24} className="mr-2 text-green-500" />
             <span>All transactions are synced with the cloud.</span>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex items-center">
           <Database className="text-slate-400 mr-3" />
           <div>
             <p className="text-sm font-medium text-slate-800">Local Database</p>
             <p className="text-xs text-slate-500">14.2 MB Used</p>
           </div>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex items-center">
           <FileText className="text-slate-400 mr-3" />
           <div>
             <p className="text-sm font-medium text-slate-800">Cached Documents</p>
             <p className="text-xs text-slate-500">32 Files Available Offline</p>
           </div>
        </div>
      </div>
    </div>
  );
};