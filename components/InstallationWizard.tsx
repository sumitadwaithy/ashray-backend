import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Shield, Server, Network, Check, Copy, AlertTriangle, ArrowRight, Laptop, Activity, Upload, FileUp, HardDrive, Smartphone } from 'lucide-react';
import type { InstallationState } from '../types';
import { dbService } from '../services/db';

export const InstallationWizard: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const [step, setStep] = useState(1);
  const [mode, setMode] = useState<'Independent' | 'Master' | 'Client' | null>(null);
  const [syncCode, setSyncCode] = useState('');
  const [serverUrl, setServerUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importFileName, setImportFileName] = useState('');
  const [importStatus, setImportStatus] = useState('');

  const generateSyncCode = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const handleImportFromFile = async (file: File) => {
    setImportFileName(file.name);
    setImportStatus('Reading file...');
    try {
      const text = await file.text();
      const pkg = JSON.parse(text);
      const data = pkg.data || pkg;
      
      // If package has generatedSyncCode, pre-fill the sync code field
      if (pkg.generatedSyncCode && !syncCode) {
        setSyncCode(pkg.generatedSyncCode);
      }
      
      setImportFile(file);
      setImportStatus(`✅ File loaded: ${file.name} (${(file.size / 1024).toFixed(0)} KB, ${Object.keys(data).length} data sections)`);
    } catch (e) {
      setImportStatus('❌ Invalid sync file. Please use a file exported from Ashray Ledger.');
      setImportFile(null);
    }
  };

  const handleFinish = async () => {
    setLoading(true);
    const machineId = `MAC-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    const ledgerId = mode === 'Master' ? `LEDGER-${Math.random().toString(36).substr(2, 9).toUpperCase()}` : '';
    
    // If import file exists, import data first
    if (importFile && (mode === 'Client' || mode === 'CloudRelay' || mode === 'Independent')) {
      try {
        setImportStatus('Importing data...');
        const text = await importFile.text();
        const pkg = JSON.parse(text);
        const pkgStr = typeof pkg === 'string' ? pkg : JSON.stringify(pkg);
        await dbService.importSyncPackage(pkgStr);
        setImportStatus('✅ Data imported successfully');
      } catch (e) {
        console.error('Import failed during installation:', e);
      }
    }
    
    const finalState: InstallationState = {
      mode: mode || 'Independent',
      ledgerId,
      machineId,
      syncCode: mode === 'Independent' ? '' : (syncCode || generateSyncCode()),
      serverUrl: mode === 'CloudRelay' ? serverUrl : (mode === 'Client' ? serverUrl : 'ws://localhost:3001'),
      isInitialized: true
    };

    try {
      await dbService.saveInstallationState(finalState);
      onComplete();
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-white flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100 flex flex-col md:flex-row min-h-[600px]"
        >
          {/* Sidebar */}
          <div className="w-full md:w-80 bg-gray-900 p-10 text-white flex flex-col">
            <div className="flex items-center gap-3 mb-10">
              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center font-bold text-xl">A</div>
              <h2 className="text-xl font-bold tracking-tight">Ashray Sync</h2>
            </div>

            <div className="flex-1 space-y-8">
              {[
                { s: 1, t: 'Select Mode', d: 'Choose how your device connects' },
                { s: 2, t: 'Configuration', d: 'Set up networking & security' },
                { s: 3, t: 'Finalize', d: 'Ready to start the ledger' }
              ].map((item) => (
                <div key={item.s} className={`flex gap-4 items-start ${step === item.s ? 'opacity-100' : 'opacity-40'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 border-white/20 text-sm font-medium ${step === item.s ? 'bg-white text-gray-900 border-white' : ''}`}>
                    {step > item.s ? <Check className="w-4 h-4" /> : item.s}
                  </div>
                  <div>
                    <h3 className="font-semibold">{item.t}</h3>
                    <p className="text-xs text-gray-400 mt-1">{item.d}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-10 pt-10 border-t border-white/10">
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <Shield className="w-3 h-3" />
                <span>Enterprise Grade Security</span>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 p-12 flex flex-col">
            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div 
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="flex-1"
                >
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome to Ashray Group Ledger</h1>
                  <p className="text-gray-500 mb-10">Select your installation architecture to continue.</p>

                  <div className="grid gap-4">
                    <button 
                      onClick={() => { setMode('Independent'); setStep(2); }}
                      className="group flex items-start gap-5 p-6 rounded-2xl border-2 border-gray-100 hover:border-blue-500 hover:bg-blue-50 text-left transition-all"
                    >
                      <div className="p-3 rounded-xl bg-gray-100 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                        <Shield className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="font-bold text-lg text-gray-900">Independent Ledger</div>
                        <p className="text-sm text-gray-500 mt-1">Standalone offline database. No networking required.</p>
                      </div>
                    </button>

                    <button 
                      onClick={() => { setMode('Master'); setStep(2); }}
                      className="group flex items-start gap-5 p-6 rounded-2xl border-2 border-gray-100 hover:border-blue-500 hover:bg-blue-50 text-left transition-all"
                    >
                      <div className="p-3 rounded-xl bg-gray-100 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                        <Server className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="font-bold text-lg text-gray-900">Create Office Sync Server</div>
                        <p className="text-sm text-gray-500 mt-1">Central node for your LAN. Other machines will connect here.</p>
                      </div>
                    </button>

<button 
					  onClick={() => { setMode('Client'); setStep(2); }}
					  className="group flex items-start gap-5 p-6 rounded-2xl border-2 border-gray-100 hover:border-blue-500 hover:bg-blue-50 text-left transition-all"
					>
					  <div className="p-3 rounded-xl bg-gray-100 group-hover:bg-blue-600 group-hover:text-white transition-colors">
						<Network className="w-6 h-6" />
					  </div>
					  <div>
						<div className="font-bold text-lg text-gray-900">Connect to Existing Network (LAN)</div>
						<p className="text-sm text-gray-500 mt-1">Same-office connection using sync code and IP address.</p>
					  </div>
					</button>

					<button 
					  onClick={() => { setMode('CloudRelay'); setStep(2); }}
					  className="group flex items-start gap-5 p-6 rounded-2xl border-2 border-gray-100 hover:border-sky-500 hover:bg-sky-50 text-left transition-all"
					>
					  <div className="p-3 rounded-xl bg-gray-100 group-hover:bg-sky-600 group-hover:text-white transition-colors">
						<Upload className="w-6 h-6" />
					  </div>
					  <div>
						<div className="font-bold text-lg text-gray-900">Cloud Relay Sync (Internet)</div>
						<p className="text-sm text-gray-500 mt-1">Sync across different locations over the internet. No VPN needed.</p>
					  </div>
					</button>
				  </div>
				</motion.div>
			  )}

              {step === 2 && (
                <motion.div 
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="flex-1"
                >
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    {mode === 'Independent' ? 'Offline Safety' : mode === 'Master' ? 'Server Configuration' : mode === 'CloudRelay' ? 'Cloud Relay Configuration' : 'Network Connection'}
                  </h1>
                  <p className="text-gray-500 mb-10">Configure your local networking parameters.</p>

                  {mode === 'Independent' && (
                    <div className="space-y-6">
                      <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100 flex gap-4">
                        <Shield className="w-6 h-6 text-blue-600 shrink-0" />
                        <div>
                          <h4 className="font-bold text-blue-900">Maximum Privacy</h4>
                          <p className="text-sm text-blue-700 mt-1">By choosing Independent mode, your data never leaves this machine. You can always switch to LAN Sync later in settings.</p>
                        </div>
                      </div>
                      {/* Independent mode also gets import option for migration */}
                      <div className="p-6 bg-yellow-50 rounded-2xl border border-yellow-200">
                        <h4 className="font-bold text-yellow-900 mb-3 flex items-center gap-2">
                          <Upload size={18} /> Import Existing Data (Optional)
                        </h4>
                        <p className="text-sm text-yellow-700 mb-4">Have data from another Ashray Ledger device? Import the sync file here.</p>
                        <div
                          className="border-2 border-dashed border-yellow-300 rounded-xl p-6 text-center cursor-pointer hover:bg-yellow-100/50 transition-all"
                          onClick={() => document.getElementById('install-file-input')?.click()}
                        >
                          <FileUp size={28} className="mx-auto text-yellow-400 mb-2" />
                          <p className="text-sm font-bold text-yellow-800">Click to select sync file</p>
                          <p className="text-xs text-yellow-600 mt-1">.json file from pendrive, email, or download</p>
                        </div>
                        {importFileName && (
                          <div className="mt-3 p-3 bg-green-100 rounded-xl text-sm text-green-800 font-medium flex items-center gap-2">
                            <Check size={16} /> {importFileName} loaded
                          </div>
                        )}
                        {importStatus && importStatus.startsWith('❌') && (
                          <div className="mt-3 p-3 bg-red-100 rounded-xl text-sm text-red-800">{importStatus}</div>
                        )}
                        <input
                          id="install-file-input"
                          type="file"
                          accept=".json"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleImportFromFile(file);
                            e.target.value = '';
                          }}
                        />
                      </div>
                    </div>
                  )}

                  {mode === 'Master' && (
                    <div className="space-y-6">
                      <div className="p-6 bg-gray-50 rounded-2xl border border-gray-200">
                        <div className="text-sm text-gray-500 mb-2 uppercase tracking-wider font-bold">Generated Sync Code</div>
                        <div className="flex items-center gap-4">
                          <code className="text-3xl font-mono font-bold text-blue-600 tracking-widest bg-white px-4 py-2 rounded-lg border border-gray-200 uppercase whitespace-nowrap">
                            {syncCode || '........'}
                          </code>
                          <button 
                            onClick={() => setSyncCode(generateSyncCode())} 
                            className="p-3 rounded-xl bg-white border border-gray-200 hover:bg-gray-50 transition-colors"
                          >
                            <Copy className="w-5 h-5 text-gray-600" />
                          </button>
                        </div>
                        <p className="text-xs text-gray-400 mt-4 flex items-center gap-2">
                          <AlertTriangle className="w-3 h-3" />
                          Share this code with machines you want to connect to your network.
                        </p>
                      </div>
                      <div className="bg-blue-50 p-4 rounded-xl text-sm text-blue-800">
                        <p className="font-medium">👉 After setup, go to Settings → Office LAN Sync → Add Device to export a sync package.</p>
                        <p className="text-xs text-blue-600 mt-1">Give the exported file (via pendrive/WhatsApp/email) and this sync code to the new device.</p>
                      </div>
                    </div>
                  )}

                  {mode === 'Client' && (
                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2 uppercase">Sync Code from Master</label>
                        <input 
                          type="text" 
                          value={syncCode}
                          onChange={(e) => setSyncCode(e.target.value.toUpperCase())}
                          placeholder="E.G. AB12CD34"
                          className="w-full px-5 py-4 rounded-xl border-2 border-gray-100 focus:border-blue-500 focus:ring-0 text-xl font-mono uppercase"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2 uppercase">Server URL / IP Address</label>
                        <input 
                          type="text" 
                          value={serverUrl}
                          onChange={(e) => setServerUrl(e.target.value)}
                          placeholder="ws://192.168.1.15:3001"
                          className="w-full px-5 py-4 rounded-xl border-2 border-gray-100 focus:border-blue-500 focus:ring-0 text-lg"
                        />
                        <p className="text-xs text-gray-400 mt-2">Format: ws://[MASTER_IP_ADDR]:3001</p>
                      </div>
                      {/* Import from file */}
                      <div className="p-6 bg-yellow-50 rounded-2xl border border-yellow-200">
                        <h4 className="font-bold text-yellow-900 mb-3 flex items-center gap-2">
                          <HardDrive size={18} /> Load Data from Pendrive / File
                        </h4>
                        <p className="text-sm text-yellow-700 mb-4">Have a sync file from the Master device? Import it now. This will load all clients, transactions, properties, documents & photos.</p>
                        <div
                          className="border-2 border-dashed border-yellow-300 rounded-xl p-6 text-center cursor-pointer hover:bg-yellow-100/50 transition-all"
                          onClick={() => document.getElementById('install-file-input')?.click()}
                        >
                          <Upload size={28} className="mx-auto text-yellow-400 mb-2" />
                          <p className="text-sm font-bold text-yellow-800">Click to select sync file or drag here</p>
                          <p className="text-xs text-yellow-600 mt-1">Supports .json files from Ashray Ledger backup</p>
                        </div>
                        {importFileName && (
                          <div className="mt-3 p-3 bg-green-100 rounded-xl text-sm text-green-800 font-medium flex items-center gap-2">
                            <Check size={16} /> {importFileName}
                          </div>
                        )}
                        {importStatus && (
                          <div className={`mt-3 p-3 rounded-xl text-sm ${importStatus.includes('✅') ? 'bg-green-100 text-green-800' : importStatus.includes('❌') ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'}`}>
                            {importStatus}
                          </div>
                        )}
                        <input
                          id="install-file-input"
                          type="file"
                          accept=".json"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleImportFromFile(file);
                            e.target.value = '';
                          }}
                        />
                      </div>
                      <div className="bg-blue-50 p-4 rounded-xl text-sm text-blue-800">
                        <Smartphone size={16} className="inline mr-1" />
                        <strong>Tip:</strong> The sync code enables real-time LAN sync. The data file loads your full history. Both together = complete setup.
                      </div>
                    </div>
                  )}

                  {mode === 'CloudRelay' && (
                    <div className="space-y-6">
                      <div className="bg-sky-50 p-6 rounded-2xl border border-sky-100">
                        <div className="flex gap-4">
                          <Upload className="w-6 h-6 text-sky-600 shrink-0" />
                          <div>
                            <h4 className="font-bold text-sky-900">Cross-Location Sync via Cloud Relay</h4>
                            <p className="text-sm text-sky-700 mt-1">This device will sync with the Master ledger over the internet using a cloud backend as relay. No LAN or VPN required.</p>
                          </div>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2 uppercase">Sync Code from Master</label>
                        <input 
                          type="text" 
                          value={syncCode}
                          onChange={(e) => setSyncCode(e.target.value.toUpperCase())}
                          placeholder="E.G. AB12CD34"
                          className="w-full px-5 py-4 rounded-xl border-2 border-gray-100 focus:border-sky-500 focus:ring-0 text-xl font-mono uppercase"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2 uppercase">Cloud Relay URL</label>
                        <input 
                          type="text" 
                          value={serverUrl}
                          onChange={(e) => setServerUrl(e.target.value)}
                          placeholder="https://ashray-backend-2nt7.onrender.com"
                          className="w-full px-5 py-4 rounded-xl border-2 border-gray-100 focus:border-sky-500 focus:ring-0 text-lg"
                        />
                        <p className="text-xs text-gray-400 mt-2">The Master device's backend URL (shown in Settings → Cloud Relay Sync).</p>
                      </div>

                      <div className="p-6 bg-yellow-50 rounded-2xl border border-yellow-200">
                        <h4 className="font-bold text-yellow-900 mb-3 flex items-center gap-2">
                          <HardDrive size={18} /> Initial Data from Pendrive / File
                        </h4>
                        <p className="text-sm text-yellow-700 mb-4">For the first setup, import the data package from the Master device. Future changes will sync automatically via the cloud relay.</p>
                        <div
                          className="border-2 border-dashed border-yellow-300 rounded-xl p-6 text-center cursor-pointer hover:bg-yellow-100/50 transition-all"
                          onClick={() => document.getElementById('install-file-input')?.click()}
                        >
                          <Upload size={28} className="mx-auto text-yellow-400 mb-2" />
                          <p className="text-sm font-bold text-yellow-800">Select sync file from Master</p>
                          <p className="text-xs text-yellow-600 mt-1">.json file from pendrive, email, or download</p>
                        </div>
                        {importFileName && (
                          <div className="mt-3 p-3 bg-green-100 rounded-xl text-sm text-green-800 font-medium flex items-center gap-2">
                            <Check size={16} /> {importFileName}
                          </div>
                        )}
                        {importStatus && (
                          <div className={`mt-3 p-3 rounded-xl text-sm ${importStatus.includes('✅') ? 'bg-green-100 text-green-800' : importStatus.includes('❌') ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'}`}>
                            {importStatus}
                          </div>
                        )}
                        <input
                          id="install-file-input"
                          type="file"
                          accept=".json"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleImportFromFile(file);
                            e.target.value = '';
                          }}
                        />
                      </div>

                      <div className="bg-sky-50 p-4 rounded-xl text-sm text-sky-800">
                        <Globe size={16} className="inline mr-1" />
                        <strong>How it works:</strong> After setup, go to Settings → Cloud Relay Sync and click <strong>"Pull from Cloud"</strong> to fetch the latest data. Enable Auto-Sync for automatic syncing.
                      </div>
                    </div>
                  )}

                  <div className="mt-8 flex gap-4">
                    <button 
                      onClick={() => setStep(1)}
                      className="px-6 py-4 rounded-2xl bg-gray-100 font-bold hover:bg-gray-200 transition-all"
                    >
                      Back
                    </button>
                    <button 
                      onClick={() => setStep(3)}
                      disabled={mode === 'Client' && (!syncCode || !serverUrl)}
                      className="flex-1 bg-gray-900 text-white font-bold py-4 px-6 rounded-2xl hover:bg-gray-800 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                    >
                      Continue <ArrowRight className="w-5 h-5" />
                    </button>
                  </div>
                </motion.div>
              )}

              {step === 3 && (
                <motion.div 
                  key="step3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="flex-1 flex flex-col items-center justify-center text-center"
                >
                  <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-8">
                    <Check className="w-12 h-12 text-green-600" />
                  </div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-4">You're all set!</h1>
                  <p className="text-gray-500 max-w-sm mb-12">
                    Your machine is configured in <b>{mode}</b> mode. {mode === 'Master' ? 'The sync server will start automatically.' : ''}
                  </p>

                  <div className="w-full max-w-sm space-y-3">
                    <div className="flex justify-between items-center p-4 bg-gray-50 rounded-xl border border-gray-100">
                      <span className="text-gray-500 text-sm">Mode</span>
                      <span className="font-bold text-gray-900 uppercase tracking-wider">{mode}</span>
                    </div>
                    {mode !== 'Independent' && (
                       <div className="flex justify-between items-center p-4 bg-gray-50 rounded-xl border border-gray-100">
                        <span className="text-gray-500 text-sm">Sync Code</span>
                        <span className="font-mono font-bold text-blue-600">{syncCode}</span>
                      </div>
                    )}
                    {importFileName && (
                      <div className="flex justify-between items-center p-4 bg-green-50 rounded-xl border border-green-100">
                        <span className="text-gray-500 text-sm">Data File</span>
                        <span className="font-bold text-green-700">{importFileName}</span>
                      </div>
                    )}
                  </div>

                  <button 
                    onClick={handleFinish}
                    disabled={loading}
                    className="mt-12 w-full max-w-sm bg-blue-600 text-white font-bold py-5 px-8 rounded-2xl hover:bg-blue-700 transition-all flex items-center justify-center gap-3 shadow-xl shadow-blue-200"
                  >
                    {loading ? (
                      <Activity className="w-6 h-6 animate-spin" />
                    ) : (
                      <>
                        Launch Application <ArrowRight className="w-6 h-6" />
                      </>
                    )}
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
