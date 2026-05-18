const { contextBridge, ipcRenderer } = require('electron');

// ================= SAFE INVOKE =================

const invoke = (channel, ...args) => ipcRenderer.invoke(channel, ...args);

// ================= API =================

contextBridge.exposeInMainWorld('api', {

  getSettings: () => invoke('getSettings'),
  saveSettings: (settings) => invoke('saveSettings', settings),

  getMasterProperties: () => invoke('getMasterProperties'),
  getMasterPropertyById: (id) => invoke('getMasterPropertyById', id),
  saveMasterProperty: (property) => invoke('saveMasterProperty', property),

  getClients: () => invoke('getClients'),
  getClientById: (id) => invoke('getClientById', id),
  getTodayClientCount: (dateStr) => invoke('getTodayClientCount', dateStr),
  saveClient: (client) => invoke('saveClient', client),
  deleteClient: (id) => invoke('deleteClient', id),

  getKissans: () => invoke('getKissans'),
  getKissanById: (id) => invoke('getKissanById', id),
  saveKissan: (kissan) => invoke('saveKissan', kissan),
  deleteKissan: (id) => invoke('deleteKissan', id),

  getInvestors: () => invoke('getInvestors'),
  getInvestorById: (id) => invoke('getInvestorById', id),
  saveInvestor: (investor) => invoke('saveInvestor', investor),

  getLoans: () => invoke('getLoans'),
  getLoanById: (id) => invoke('getLoanById', id),
  saveLoan: (loan) => invoke('saveLoan', loan),
  deleteLoan: (id) => invoke('deleteLoan', id),

  getTransactions: () => invoke('getTransactions'),
  saveTransaction: (tx) => invoke('saveTransaction', tx),
  deleteTransaction: (id) => invoke('deleteTransaction', id),

  getProperties: () => invoke('getProperties'),
  getPropertyById: (id) => invoke('getPropertyById', id),
  saveProperty: (property) => invoke('saveProperty', property),
  deleteProperty: (id) => invoke('deleteProperty', id),
  updateProperty: (id, updates) => invoke('updateProperty', id, updates),

  assignPlotToClient: (propertyId, plotId, clientId, clientData) =>
    invoke('assignPlotToClient', propertyId, plotId, clientId, clientData),

  getReferrals: () => invoke('getReferrals'),
  saveReferral: (referral) => invoke('saveReferral', referral),
  deleteReferral: (id) => invoke('deleteReferral', id),
    generateId: (prefix, date) => invoke('generateId', prefix, date),
  peekId: (prefix, date) => invoke('peekId', prefix, date),
  getBanks: () => invoke('getBanks'),
  getBankById: (id) => invoke('getBankById', id),
  saveBank: (bank) => invoke('saveBank', bank),
  deleteBank: (id) => invoke('deleteBank', id),

  getStaff: () => invoke('getStaff'),
  getStaffById: (id) => invoke('getStaffById', id),
  saveStaff: (staff) => invoke('saveStaff', staff),
  deleteStaff: (id) => invoke('deleteStaff', id),

  getPendingReceipts: () => invoke('getPendingReceipts'),
  savePendingReceipt: (receipt) => invoke('savePendingReceipt', receipt),
  deletePendingReceipt: (id) => invoke('deletePendingReceipt', id),

  getDocs: () => invoke('getDocs'),
  getDocuments: (query) => invoke('getDocuments', query),
  saveDocument: (doc) => ipcRenderer.invoke('saveDocument', doc),
  saveDoc: (docData) => invoke('saveDoc', docData),
  updateDocument: (id, updates) => invoke('updateDocument', id, updates),
  updateDoc: (id, updates) => invoke('updateDocument', id, updates),
  deleteDoc: (id) => invoke('deleteDocument', id, false),
  deleteDocument: (id, permanent = false) =>
    invoke('deleteDocument', id, permanent),

  emptyTrash: () => invoke('emptyTrash'),

  getFolders: (showDeleted = false) => invoke('getFolders', showDeleted),
  saveFolder: (folder) => invoke('saveFolder', folder),
  updateFolder: (id, updates) => invoke('updateFolder', id, updates),
  deleteFolder: (id, permanent = false) =>
    invoke('deleteFolder', id, permanent),

  getCategories: () => invoke('getCategories'),
  addCategory: (name, color, icon) => invoke('addCategory', name, color, icon),
  updateCategory: (id, updates) => invoke('updateCategory', id, updates),
  deleteCategory: (id) => invoke('deleteCategory', id),
  getDeletedCategories: () => invoke('getDeletedCategories'),
  restoreCategory: (id) => invoke('restoreCategory', id),
  permanentlyDeleteCategory: (id) => invoke('permanentlyDeleteCategory', id),
  restoreFolder: (id) => invoke('restoreFolder', id),
  restoreDoc: (id) => invoke('restoreDoc', id),
  restoreDocument: (id) => invoke('restoreDocument', id),

  syncToWebsite: () => invoke('syncToWebsite'),
  rebuildClientPayments: () => invoke('rebuildClientPayments'),
  clearLocalData: () => invoke('clearLocalData'),
  exportData: () => invoke('exportData'),
  resetLedger: () => invoke('resetLedger'),

  getStorage: () => invoke('getStorage'),

  getGstEntries: () => invoke('getGstEntries'),
  saveGstEntry: (entry) => invoke('saveGstEntry', entry),
  deleteGstEntry: (id) => invoke('deleteGstEntry', id),
  updateGstEntry: (id, updates) => invoke('updateGstEntry', id, updates),

  getPropertyMarketUpdates: (propertyId) => invoke('getPropertyMarketUpdates', propertyId),
  savePropertyMarketUpdate: (update) => invoke('savePropertyMarketUpdate', update),
  deletePropertyMarketUpdate: (id) => invoke('deletePropertyMarketUpdate', id),

  getInstallationState: () => invoke('getInstallationState'),
  saveInstallationState: (state) => invoke('saveInstallationState', state),
  getRegisteredMachines: () => invoke('getRegisteredMachines'),
  exportSyncPackage: () => invoke('exportSyncPackage'),
  importSyncPackage: (pkg) => invoke('importSyncPackage', pkg),
  registerMachine: (machine) => invoke('registerMachine', machine),
  startLanSync: () => invoke('startLanSync'),
  stopLanSync: () => invoke('stopLanSync'),
  syncNow: () => invoke('syncNow'),

  openDocument: (name, base64, type) => invoke('openDocument', name, base64, type),
  getDocumentUrl: (doc) => invoke('getDocumentUrl', doc),

  saveFileToDisk: (name, buffer) => invoke('saveFileToDisk', name, buffer),
  
  getPrinters: () => invoke('getPrinters'),
  print: (options) => invoke('print', options),
  savePDF: (options) => invoke('savePDF', options),

  subscribe: (listener) => {
    ipcRenderer.on('db-changed', listener);
    return () => ipcRenderer.removeListener('db-changed', listener);
  }

});