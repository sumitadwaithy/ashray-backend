import { app, BrowserWindow, ipcMain, shell, dialog, session } from 'electron';
import path from 'path';
import fs from 'fs';
import os from 'os';
import { execFile } from 'child_process';
import { promisify } from 'util';
import { fileURLToPath } from 'url';
let mainWindow;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const execFileAsync = promisify(execFile);

import dbModule from './database.cjs';
import * as syncService from './syncService.cjs';

const {
  db,
  getCategories,
  addCategory,
  updateCategory,
  deleteCategory,
  getDeletedCategories,
  restoreCategory,
  permanentlyDeleteCategory,
  getFolders,
  saveFolder,
  updateFolder,
  deleteFolder,
  getDocuments,
  saveDocument,
  updateDocument,
  deleteDocument,
  getSettings,
  saveSettings,
  getMasterProperties,
  getMasterPropertyById,
  saveMasterProperty,
  getClients,
  getClientById,
  saveClient,
  deleteClient,
  getTodayClientCount,
  getKissans,
  getKissanById,
  saveKissan,
  deleteKissan,
  getInvestors,
  getInvestorById,
  saveInvestor,
  getLoans,
  getLoanById,
  saveLoan,
  deleteLoan,
  getProperties,
  getPropertyById,
  saveProperty,
  deleteProperty,
  updateProperty,
  assignPlotToClient,
  getTransactions,
  saveTransaction,
  deleteTransaction,
  getReferrals,
  saveReferral,
  deleteReferral,
  getBanks,
  getBankById,
  saveBank,
  deleteBank,
  getStaff,
  getStaffById,
  saveStaff,
  deleteStaff,
  getPendingReceipts,
  getPendingReceipts,
  savePendingReceipt,
  deletePendingReceipt,
  getGstEntries,
  saveGstEntry,
  deleteGstEntry,
  updateGstEntry,
  getDocs,
  saveDoc,
  deleteDoc,
  clearLocalData,
  getStorage,
  emptyTrash,
  cleanupTrash,
  generateId,
  peekId,
  getPropertyMarketUpdates,
  savePropertyMarketUpdate,
  deletePropertyMarketUpdate,
  getInstallationState,
  saveInstallationState,
  getRegisteredMachines,
  exportSyncPackage,
  restoreFolder,
  restoreDoc,
  resetLedger,
  registerMachine,
  importSyncPackage
} = dbModule.default || dbModule;
// ================= WINDOW =================

async function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      webSecurity: true
    },
  });

  const isDev = !app.isPackaged;
  const devURL = process.env.VITE_DEV_SERVER_URL || 'http://localhost:3000';

  if (isDev) {
    // 🔥 Install React DevTools
    try {
      const chromeExtPath = path.join(os.homedir(), "Library/Application Support/Google/Chrome/Default/Extensions/fmkadmapgofadopljbjfkapdkoienihi/7.0.1_0");
      if (fs.existsSync(chromeExtPath)) {
        await session.defaultSession.loadExtension(chromeExtPath);
        console.log('React DevTools loaded from local Chrome path');
      }

      const devToolsModule = await import('electron-devtools-installer');
      const installExtension = devToolsModule.default || devToolsModule.installExtension;
      const REACT_DEVELOPER_TOOLS = devToolsModule.REACT_DEVELOPER_TOOLS;

      if (installExtension && REACT_DEVELOPER_TOOLS) {
        await installExtension(REACT_DEVELOPER_TOOLS, {
          loadExtensionOptions: { allowFileAccess: true },
          forceDownload: false
        });
        console.log('React DevTools installed');
      }
    } catch (err) {
      console.error('React DevTools install failed:', err);
    }

    // ✅ Load URL after extension (hopefully) installed
    mainWindow.loadURL(devURL);
    mainWindow.webContents.openDevTools();

    // Forward renderer console to main process
    mainWindow.webContents.on('console-message', function(event) {
      const level = event.level;
      const message = event.message;
      const prefix = ['log', 'info', 'warn', 'error'][level] || 'log';
      console.log('[RENDERER:' + prefix + '] ' + message);
    });

    console.log('[DEV] Dev mode active — login page will require credentials');

  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }
}

function notifyDBChange() {
  if (mainWindow && mainWindow.webContents) {
    mainWindow.webContents.send('db-changed');
  }
}

async function getSystemPrinters() {
  if (process.platform === 'win32') return [];

  try {
    const [printerListResult, defaultResult] = await Promise.allSettled([
      execFileAsync('/usr/bin/lpstat', ['-e'], { timeout: 4000 }),
      execFileAsync('/usr/bin/lpstat', ['-d'], { timeout: 4000 }),
    ]);

    const printerListOutput =
      printerListResult.status === 'fulfilled' ? printerListResult.value.stdout : '';
    const defaultOutput =
      defaultResult.status === 'fulfilled' ? defaultResult.value.stdout : '';

    const defaultMatch = defaultOutput.match(/system default destination:\s*(.+)$/i);
    const defaultPrinter = defaultMatch?.[1]?.trim();

    return printerListOutput
      .split(/\r?\n/)
      .map((name) => name.trim())
      .filter(Boolean)
      .map((name) => ({
        name,
        displayName: name,
        description: 'System printer',
        status: 0,
        isDefault: defaultPrinter === name,
        options: {},
      }));
  } catch (error) {
    console.error('System printer fallback error:', error);
    return [];
  }
}

async function getPpdPrinters() {
  if (process.platform !== 'darwin') return [];

  try {
    const ppdDir = '/etc/cups/ppd';
    const files = await fs.promises.readdir(ppdDir);
    const ppdFiles = files.filter((file) => file.toLowerCase().endsWith('.ppd'));

    const printers = await Promise.all(
      ppdFiles.map(async (file, index) => {
        const printerName = path.basename(file, '.ppd');
        const ppdPath = path.join(ppdDir, file);
        let displayName = printerName.replace(/_/g, ' ');

        try {
          const content = await fs.promises.readFile(ppdPath, 'utf8');
          const nickNameMatch = content.match(/^\*NickName:\s*"([^"]+)"/m);
          const modelNameMatch = content.match(/^\*ModelName:\s*"([^"]+)"/m);
          displayName = nickNameMatch?.[1] || modelNameMatch?.[1] || displayName;

          if (/_\d+$/.test(printerName)) {
            displayName = `${displayName} ${printerName.match(/_(\d+)$/)?.[1]}`;
          }
        } catch (error) {
          console.error(`Unable to read PPD printer file ${file}:`, error);
        }

        return {
          name: printerName,
          displayName,
          description: 'Installed macOS printer',
          status: 0,
          isDefault: index === 0,
          options: {},
        };
      })
    );

    return printers;
  } catch (error) {
    console.error('PPD printer fallback error:', error);
    return [];
  }
}

function mergePrinters(...printerGroups) {
  const seen = new Set();

  return printerGroups.flat().filter((printer) => {
    const key = (printer.name || printer.displayName || '').toLowerCase();
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
// ================= APP READY =================

app.whenReady().then(() => {


  // ===== IPC =====

ipcMain.handle('getCategories', () => getCategories());
ipcMain.handle('getDeletedCategories', () => getDeletedCategories());

ipcMain.handle('addCategory', (_, name, color, icon) => {
  const result = addCategory(name, color, icon);
  notifyDBChange();
  return result;
});

ipcMain.handle('updateCategory', (_, id, updates) => {
  const result = updateCategory(id, updates);
  notifyDBChange();
  return result;
});

ipcMain.handle('deleteCategory', (_, id) => {
  const result = deleteCategory(id);
  notifyDBChange();
  return result;
});

// ✅ RESTORE
ipcMain.handle('restoreCategory', (_, id) => {
  restoreCategory(id);

  db.prepare(`
    UPDATE folders
    SET is_deleted = 0,
        deleted_at = NULL
    WHERE category_id = ?
  `).run(id);

  db.prepare(`
    UPDATE documents
    SET is_deleted = 0,
        deleted_at = NULL
    WHERE category_id = ?
  `).run(id);

  notifyDBChange();
});

// ✅ PERMANENT DELETE
ipcMain.handle('permanentlyDeleteCategory', (_, id) => {
  const result = permanentlyDeleteCategory(id);
  notifyDBChange();
  return result;
});

  ipcMain.handle('getFolders', (_, showDeleted = false) =>
  getFolders(showDeleted)
);

ipcMain.handle('saveFolder', (_, folder) => {
  const result = saveFolder(folder);
  notifyDBChange();
  return result;
});

ipcMain.handle('updateFolder', (_, id, updates) => {
  const result = updateFolder(id, updates);
  notifyDBChange();
  return result;
});

// ✅ DELETE (SOFT + HARD)
ipcMain.handle('deleteFolder', (_, id, permanent = false) => {
  const result = deleteFolder(id, permanent);
  notifyDBChange();
  return result;
});

// ✅ RESTORE
ipcMain.handle('restoreFolder', (_, id) => {
  restoreFolder(id);
  notifyDBChange();
});

// ✅ PERMANENT DELETE
ipcMain.handle('permanentlyDeleteFolder', (_, id) => {
  const result = deleteFolder(id, true);
  notifyDBChange();
  return result;
});

  ipcMain.handle('getDocuments', (_, query) =>
  getDocuments(query)
);

ipcMain.handle('saveDocument', (_, doc) => {
  const result = saveDocument(doc);
  notifyDBChange();
  return result;
});

ipcMain.handle('updateDocument', (_, id, updates) => {
  const result = updateDocument(id, updates);
  notifyDBChange();
  return result;
});

// ✅ DELETE (SOFT + HARD)
ipcMain.handle('deleteDocument', (_, id, permanent = false) => {
  const result = deleteDocument(id, permanent);
  notifyDBChange();
  return result;
});

// ✅ RESTORE
ipcMain.handle('restoreDocument', (_, id) => {
  const result = updateDocument(id, {
    is_deleted: 0,
    deleted_at: null
  });
  notifyDBChange();
  return result;
});

// ✅ PERMANENT DELETE
ipcMain.handle('permanentlyDeleteDocument', (_, id) => {
  const result = deleteDocument(id, true);
  notifyDBChange();
  return result;
});

ipcMain.handle('restoreDoc', (_, id) => {
  restoreDoc(id);
  notifyDBChange();
});

// ✅ EMPTY TRASH
ipcMain.handle('emptyTrash', () => emptyTrash());

  ipcMain.handle('openDocument', async (_, name, base64Data, type) => {
    try {
      if (!base64Data) throw new Error('No data provided');
      
      const buffer = Buffer.from(base64Data, 'base64');
      const tempDir = path.join(app.getPath('temp'), 'ashray-uploads');
      
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
      }

      // Ensure extension is present
      let finalName = name;
      const ext = path.extname(name);
      if (!ext) {
        if (type === 'pdf') finalName += '.pdf';
        else if (type === 'img' || type === 'image') finalName += '.jpg';
        else if (type === 'doc' || type === 'docx') finalName += '.docx';
      }

      const safeName = finalName.replace(/[^a-z0-9.]/gi, '_').toLowerCase();
      const filePath = path.join(tempDir, `${Date.now()}_${safeName}`);
      
      console.log('IPC: Writing temp file to:', filePath);
      fs.writeFileSync(filePath, buffer);
      
      console.log('IPC: Calling shell.openPath');
      const error = await shell.openPath(filePath);
      if (error) {
        throw new Error(error);
      }
      return { success: true };
    } catch (error) {
      console.error('IPC: Failed to open document:', error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('saveFileToDisk', (_, name, buffer) => {
  const uploadsDir = path.join(app.getPath('userData'), 'uploads');

  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  const filePath = path.join(uploadsDir, name);
  fs.writeFileSync(filePath, buffer);

  return filePath;
});

  // ===== LEDGER IPC =====
  ipcMain.handle('getSettings', () => getSettings());
  ipcMain.handle('saveSettings', async (_, settings) => {
  const result = await saveSettings(settings);
  notifyDBChange();
  return result;
});
  ipcMain.handle('getMasterProperties', () => getMasterProperties());
  ipcMain.handle('getMasterPropertyById', (_, id) => getMasterPropertyById(id));
  ipcMain.handle('saveMasterProperty', (_, property) => saveMasterProperty(property));
  ipcMain.handle('getClients', () => getClients());
  ipcMain.handle('getClientById', (_, id) => getClientById(id));
  ipcMain.handle('saveClient', (_, client) => {
  const result = saveClient(client);
  notifyDBChange();
  return result;
});
  ipcMain.handle('deleteClient', (_, id) => {
  const result = deleteClient(id);
  notifyDBChange();
  return result;
});
  ipcMain.handle('getKissans', () => getKissans());
  ipcMain.handle('getKissanById', (_, id) => getKissanById(id));
  ipcMain.handle('saveKissan', (_, kissan) => {
  const result = saveKissan(kissan);
  notifyDBChange();
  return result;
});
  ipcMain.handle('deleteKissan', (_, id) => {
  const result = deleteKissan(id);
  notifyDBChange();
  return result;
});
  ipcMain.handle('getInvestors', () => getInvestors());
  ipcMain.handle('getInvestorById', (_, id) => getInvestorById(id));
  ipcMain.handle('saveInvestor', (_, investor) => {
  const result = saveInvestor(investor);
  notifyDBChange();
  return result;
});
  ipcMain.handle('getLoans', () => getLoans());
  ipcMain.handle('getLoanById', (_, id) => getLoanById(id));
  ipcMain.handle('saveLoan', (_, loan) => {
  const result = saveLoan(loan);
  notifyDBChange();
  return result;
});
  ipcMain.handle('deleteLoan', (_, id) => {
  const result = deleteLoan(id);
  notifyDBChange();
  return result;
});
  ipcMain.handle('getProperties', () => getProperties());
  ipcMain.handle('getPropertyById', (_, id) => getPropertyById(id));
  ipcMain.handle('saveProperty', (_, property) => {
  const result = saveProperty(property);
  notifyDBChange();
  return result;
});
  ipcMain.handle('deleteProperty', (_, id) => deleteProperty(id));
  ipcMain.handle('updateProperty', (_, id, updates) => {
  const result = updateProperty(id, updates);
  notifyDBChange();
  return result;
});
ipcMain.handle('assignPlotToClient', (_, propertyId, plotId, clientId, clientData) => {
  const result = assignPlotToClient(propertyId, plotId, clientId, clientData);
  notifyDBChange();
  return result;
});
  ipcMain.handle('getTransactions', () => getTransactions());
  ipcMain.handle('saveTransaction', (_, tx) => {
  const result = saveTransaction(tx);
  notifyDBChange();
  return result;
});
  ipcMain.handle('deleteTransaction', (_, id) => {
  const result = deleteTransaction(id);
  notifyDBChange();
  return result;
});
  ipcMain.handle('getReferrals', () => getReferrals());
  ipcMain.handle('saveReferral', (_, referral) => {
  const result = saveReferral(referral);
  notifyDBChange();
  return result;
});
  ipcMain.handle('deleteReferral', (_, id) => {
  const result = deleteReferral(id);
  notifyDBChange();
  return result;
});
  ipcMain.handle('getDocs', () => getDocs());
  ipcMain.handle('saveDoc', (_, docData) => {
  const result = saveDoc(docData);
  notifyDBChange();
  return result;
});
  ipcMain.handle('deleteDoc', (_, id) => {
  const result = deleteDoc(id);
  notifyDBChange();
  return result;
});

ipcMain.handle('generateId', (_, prefix, date) => {
    try {
      const result = generateId(prefix, date);
      notifyDBChange();
      return result;
    } catch (error) {
      console.error('generateId failed:', error);
      const targetDate = date ? new Date(date) : new Date();
      const year = targetDate.getFullYear();
      const month = String(targetDate.getMonth() + 1).padStart(2, '0');
      const day = String(targetDate.getDate()).padStart(2, '0');
      const serial = String(Date.now() % 100000).padStart(5, '0');
      return `${prefix}/AG/${year}${month}${day}/${serial}`;
    }
  });

ipcMain.handle('peekId', (_, prefix, date) => {
    const result = peekId(prefix, date);
    return result;
  });

  // ===== BANK =====
ipcMain.handle('getBanks', () => getBanks());
ipcMain.handle('getBankById', (_, id) => getBankById(id));
ipcMain.handle('saveBank', (_, data) => {
  const result = saveBank(data);
  notifyDBChange();
  return result;
});
ipcMain.handle('deleteBank', (_, id) => {
  const result = deleteBank(id);
  notifyDBChange();
  return result;
});
// ===== STAFF =====
ipcMain.handle('getStaff', () => getStaff());
ipcMain.handle('getStaffById', (_, id) => getStaffById(id));
ipcMain.handle('saveStaff', (_, data) => {
  const result = saveStaff(data);
  notifyDBChange();
  return result;
});
ipcMain.handle('deleteStaff', (_, id) => {
  const result = deleteStaff(id);
  notifyDBChange();
  return result;
});

ipcMain.handle('getPendingReceipts', () => getPendingReceipts());
ipcMain.handle('savePendingReceipt', (_, receipt) => {
  const result = savePendingReceipt(receipt);
  notifyDBChange();
  return result;
});
ipcMain.handle('deletePendingReceipt', (_, id) => {
  const result = deletePendingReceipt(id);
  notifyDBChange();
  return result;
});

// ===== GST =====
ipcMain.handle('getGstEntries', () => getGstEntries());
ipcMain.handle('saveGstEntry', (_, data) => {
  const result = saveGstEntry(data);
  notifyDBChange();
  return result;
});
ipcMain.handle('deleteGstEntry', (_, id) => {
  const result = deleteGstEntry(id);
  notifyDBChange();
  return result;
});
ipcMain.handle('updateGstEntry', (_, id, updates) => {
  const result = updateGstEntry(id, updates);
  notifyDBChange();
  return result;
});

// ===== PROPERTY MARKET UPDATES =====
ipcMain.handle('getPropertyMarketUpdates', (_, propertyId) => {
  return getPropertyMarketUpdates(propertyId);
});
ipcMain.handle('savePropertyMarketUpdate', (_, update) => {
  const result = savePropertyMarketUpdate(update);
  notifyDBChange();
  return result;
});
ipcMain.handle('deletePropertyMarketUpdate', (_, id) => {
  const result = deletePropertyMarketUpdate(id);
  notifyDBChange();
  return result;
});

// ===== SYNC & INSTALLATION =====
ipcMain.handle('getInstallationState', () => getInstallationState());
ipcMain.handle('saveInstallationState', (_, state) => {
  saveInstallationState(state);
  // Restart sync logic if needed
  initializeSync();
  return { success: true };
});
ipcMain.handle('getRegisteredMachines', () => getRegisteredMachines());
ipcMain.handle('exportSyncPackage', () => exportSyncPackage());
ipcMain.handle('importSyncPackage', (_, pkg) => {
  if (typeof pkg === 'string') {
    return importSyncPackage(pkg);
  }
  return importSyncPackage(JSON.stringify(pkg));
});
ipcMain.handle('registerMachine', (_, machine) => {
  registerMachine(machine);
  return { success: true };
});
ipcMain.handle('startLanSync', () => {
  initializeSync();
  return { success: true };
});
ipcMain.handle('stopLanSync', () => {
  syncService.stopMasterServer?.();
  syncService.stopClientSync?.();
  return { success: true };
});
ipcMain.handle('syncNow', async () => {
  const state = getInstallationState();
  if (state.mode === 'Client') {
    syncService.startClientSync(state.serverUrl);
  }
  return { success: true };
});

function initializeSync() {
  const state = getInstallationState();
  if (state.mode === 'Master') {
    syncService.startMasterServer();
  } else if (state.mode === 'Client') {
    syncService.startClientSync(state.serverUrl);
  }
}



ipcMain.handle('resetLedger', () => {
  resetLedger();
  notifyDBChange();
});
  ipcMain.handle('clearLocalData', () => clearLocalData());
  ipcMain.handle('getStorage', () => getStorage());
  ipcMain.handle('syncToWebsite', async () => {
    try {
      const settings = getSettings();
      const rawBackendUrl = settings.backendUrl || process.env.BACKEND_URL || 'https://ashray-backend-2nt7.onrender.com';
      const backendUrl = rawBackendUrl.endsWith('/') ? rawBackendUrl.slice(0, -1) : rawBackendUrl;
      
      const clients = getClients();
      const investors = getInvestors();
      const properties = getProperties();
      const transactions = getTransactions();
      const docs = getDocs()
        .filter(d => d.category !== 'REPORT' && d.type !== 'virtual')
        .map(({ data: _data, ...rest }) => rest);
      const referrals = getReferrals();
      const pendingReceipts = getPendingReceipts();

      // Health check with retry for Render cold starts
      const waitForBackend = async (maxRetries = 10, delayMs = 5000) => {
        for (let i = 0; i < maxRetries; i++) {
          try {
            const res = await fetch(`${backendUrl}/api/health`, { signal: AbortSignal.timeout(10000) });
            if (res.ok) return true;
          } catch {}
          if (i < maxRetries - 1) {
            console.log(`⏳ Backend not ready, retrying in ${delayMs/1000}s... (${i+1}/${maxRetries})`);
            await new Promise(r => setTimeout(r, delayMs));
          }
        }
        return false;
      };

      const backendReady = await waitForBackend();
      if (!backendReady) {
        return { success: false, error: 'Backend not reachable. Render may be spinning up — try again in 1-2 minutes.' };
      }

      // Helper to push data with retry
      const push = async (path, data, retries = 3) => {
        if (!data || data.length === 0) return { status: 'skipped', count: 0 };
        for (let i = 0; i < retries; i++) {
          try {
            const res = await fetch(`${backendUrl}${path}`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(data),
              signal: AbortSignal.timeout(30000)
            });
            if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
            return res.json();
          } catch (e) {
            if (i < retries - 1) {
              console.log(`⏳ Retry ${i+1}/${retries} for ${path}...`);
              await new Promise(r => setTimeout(r, 3000));
            } else {
              throw e;
            }
          }
        }
      };

      // Chunked push for large payloads (e.g., docs with fileData)
      const pushChunked = async (path, data, chunkSize = 5, retries = 3) => {
        if (!data || data.length === 0) return { status: 'skipped', count: 0 };
        let totalCount = 0;
        for (let i = 0; i < data.length; i += chunkSize) {
          const chunk = data.slice(i, i + chunkSize);
          const result = await push(path, chunk, retries);
          totalCount += result.count || chunk.length;
        }
        return { status: 'success', count: totalCount };
      };

      // Bulk Upsert everything
      await Promise.all([
        push('/api/client/bulk-upsert', clients),
        push('/api/investor/bulk-upsert', investors),
        push('/api/property/bulk-upsert', properties),
        pushChunked('/api/doc/bulk-upsert', docs, 2),
        push('/api/transaction/bulk-upsert', transactions),
        push('/api/referral/bulk-upsert', referrals),
        push('/api/pending-receipt/bulk-upsert', pendingReceipts),
      ]);

      // Mark all pushed docs as synced locally
      for (const doc of docs) {
        saveDoc({ ...doc, synced: true });
      }

      return { success: true, message: `Sync successful — ${clients.length} clients, ${properties.length} properties, ${transactions.length} transactions, ${docs.length} docs, ${referrals.length} referrals, ${pendingReceipts.length} pending receipts pushed.` };
    } catch (error) {
      console.error("Sync Error:", error);
      return { success: false, error: error.message };
    }
  });
  ipcMain.handle('rebuildClientPayments', () => { /* Implement if needed */ });
  ipcMain.handle('exportData', async () => {
  const data = {
    clients: getClients(),
    transactions: getTransactions(),
    properties: getProperties(),
    loans: getLoans(),
    investors: getInvestors(),
    kissans: getKissans(),
    referrals: getReferrals(),
    docs: getDocs(),
    folders: getFolders(false),
    categories: getCategories(),
    gstEntries: getGstEntries()
  };
  return data;
});

ipcMain.handle('getTodayClientCount', (_, dateStr) =>
  getTodayClientCount(dateStr)
);

ipcMain.handle('getDocumentUrl', (_, doc) => {
  return doc.fileData; // or file path if you store files
});

ipcMain.handle('getPrinters', async (event) => {
  try {
    const contents = event.sender || mainWindow?.webContents;

    if (!contents) {
      console.error("getPrinters: No webContents available");
      return [];
    }

    const electronPrinters = await contents.getPrintersAsync();
    const [systemPrinters, ppdPrinters] = electronPrinters.length
      ? [[], []]
      : await Promise.all([getSystemPrinters(), getPpdPrinters()]);
    const printers = mergePrinters(electronPrinters, systemPrinters, ppdPrinters);

    console.log(`getPrinters: Found ${printers.length} printers`);
    return printers;

  } catch (error) {
    console.error("getPrinters error:", error);
    return [];
  }
});

ipcMain.handle('print', async (event, options) => {
  const contents = event?.sender || mainWindow?.webContents;
  if (!contents) return { success: false, error: 'No web contents found' };

  try {
    return new Promise((resolve) => {
      contents.print(options, (success, errorType) => {
        if (!success) {
          resolve({ success: false, error: errorType });
        } else {
          resolve({ success: true });
        }
      });
    });
  } catch (error) {
    console.error("Main process print error:", error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('savePDF', async (event, options) => {
  try {
    const win = BrowserWindow.fromWebContents(event.sender);

    if (!win) {
      return { success: false, error: 'Window not found' };
    }
     console.log("Main process savePDF called with options:", JSON.stringify(options, null, 2));

    const pdfBuffer = await win.webContents.printToPDF({
      printBackground: true,
      ...options,
    });

    const { canceled, filePath } = await dialog.showSaveDialog(win, {
      title: 'Save PDF',
      defaultPath: `ledger-${Date.now()}.pdf`,
      filters: [{ name: 'PDF', extensions: ['pdf'] }],
    });

    if (canceled || !filePath) {
      return { success: false, error: 'Save cancelled' };
    }

    fs.writeFileSync(filePath, pdfBuffer);

    return { success: true, filePath };

  } catch (err) {
    console.error('savePDF ERROR:', err);
    return { success: false, error: err.message };
  }
});

  // ===== START WINDOW =====
  createWindow();

  // ===== CLEANUP =====
  cleanupTrash();
  setInterval(cleanupTrash, 24 * 60 * 60 * 1000);

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });

});
// ================= CLOSE =================

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
