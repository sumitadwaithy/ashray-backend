import { 
  Client, 
  Transaction, 
  Property, 
  MasterProperty, 
  AppSettings, 
  Investor, 
  Category, 
  Kissan, 
  Referral, 
  Doc, 
  Loan,
  PropertyStatus,
  Folder,
  BankProfile,
  Staff,
  GSTEntry,
  PropertyMarketUpdate,
  PendingReceipt,
  InstallationState,
  MachineRegistration
} from '../types';

import { formatGeneratedId } from './idEngine';
import { LedgerEngine } from './ledgerEngine';

async function apiFetch(url: string, options?: RequestInit) {
  const response = await fetch(url, options);
  if (!response.ok) throw new Error(`Fetch failed: ${response.statusText}`);
  return response;
}

async function apiFetchJSON(url: string, options?: RequestInit) {
  try {
    const response = await apiFetch(url, options);
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      return null;
    }
    return await response.json();
  } catch (err) {
    return null;
  }
}
async function safeFetchJSON(url: string) {
  try {
    const res = await fetch(url);

    if (!res.ok) {
      return null;
    }

    const contentType = res.headers.get('content-type');

    if (!contentType || !contentType.includes('application/json')) {
      return null;
    }

    return await res.json();
  } catch (err) {
    return null;
  }
}

export interface DatabaseService {
  engine: LedgerEngine;
  getSettings(): Promise<AppSettings>;
  saveSettings(settings: AppSettings): Promise<void>;
  getMasterProperties(): Promise<MasterProperty[]>;
  getMasterPropertyById(id: string): Promise<MasterProperty | undefined>;
  saveMasterProperty(property: MasterProperty): Promise<void>;
  getClients(): Promise<Client[]>;
  getClientById(id: string): Promise<Client | undefined>;
  getTodayClientCount(dateStr: string): Promise<number>;
  saveClient(client: Client): Promise<void>;
  deleteClient(id: string): Promise<void>;
  getKissans(): Promise<Kissan[]>;
  getKissanById(id: string): Promise<Kissan | undefined>;
  saveKissan(kissan: Kissan): Promise<void>;
  deleteKissan(id: string): Promise<void>;
  getInvestors(): Promise<Investor[]>;
  getInvestorById(id: string): Promise<Investor | undefined>;
  saveInvestor(investor: Investor): Promise<void>;
  getLoans(): Promise<Loan[]>;
  getLoanById(id: string): Promise<Loan | undefined>;
  saveLoan(loan: Loan): Promise<void>;
  deleteLoan(id: string): Promise<void>;
  getTransactions(): Promise<Transaction[]>;
  saveTransaction(tx: Transaction): Promise<void>;
  deleteTransaction(id: string): Promise<void>;
  getProperties(): Promise<Property[]>;
  getPropertyById(id: string): Promise<Property | undefined>;
  saveProperty(property: Property): Promise<void>;
  deleteProperty(id: string): Promise<void>;
  updateProperty(id: string, updates: Partial<Property>): Promise<void>;
  assignPlotToClient(propertyId: string, plotId: string, clientId: string, clientData: { title?: string; name: string; phone: string; amount?: number; status: PropertyStatus }): Promise<void>;
  getReferrals(): Promise<Referral[]>;
  saveReferral(referral: Referral): Promise<void>;
  deleteReferral(id: string): Promise<void>;
  getBanks(): Promise<BankProfile[]>;
  getBankById(id: string): Promise<BankProfile | undefined>;
  saveBank(bank: BankProfile): Promise<void>;
  deleteBank(id: string): Promise<void>;
  getStaff(): Promise<Staff[]>;
  getStaffById(id: string): Promise<Staff | undefined>;
  saveStaff(staff: Staff): Promise<void>;
  deleteStaff(id: string): Promise<void>;
  getPendingReceipts(): Promise<PendingReceipt[]>;
  savePendingReceipt(receipt: PendingReceipt): Promise<void>;
  deletePendingReceipt(id: string): Promise<void>;
  getGstEntries(): Promise<GSTEntry[]>;
  saveGstEntry(entry: GSTEntry): Promise<void>;
  deleteGstEntry(id: string): Promise<void>;
  updateGstEntry(entry: GSTEntry): Promise<void>;
  getPropertyMarketUpdates(propertyId?: string): Promise<PropertyMarketUpdate[]>;
  savePropertyMarketUpdate(update: PropertyMarketUpdate): Promise<void>;
  deletePropertyMarketUpdate(id: string): Promise<void>;
  
  getInstallationState(): Promise<InstallationState>;
  saveInstallationState(state: InstallationState): Promise<void>;
  getRegisteredMachines(): Promise<MachineRegistration[]>;
  exportSyncPackage(): Promise<string>;
  importSyncPackage(pkg: string): Promise<void>;

  saveClientHistory(clientId: string, categoryId: string, folderId: string, data: any): Promise<void>;
  updateClientFileHistory(clientId: string): Promise<void>;
  updateStaffFileHistory(staffId: string): Promise<void>;
  updateKissanFileHistory(kissanId: string): Promise<void>;
  updateLoanFileHistory(loanId: string): Promise<void>;
  updateInvestorFileHistory(investorId: string): Promise<void>;
  getDocs(includeDeleted?: boolean): Promise<Doc[]>;
  saveDoc(docData: Doc): Promise<void>;
  updateDoc(id: string | number, updates: Partial<Doc>): Promise<void>;
  saveDocument(docData: Doc): Promise<void>;
  deleteDoc(id: string): Promise<void>;
  deleteDocument(id: string, permanent?: boolean): Promise<void>;
  getFolders(showDeleted?: boolean): Promise<Folder[]>;
  saveFolder(folder: Folder): Promise<void>;
  updateFolder(id: string | number, updates: Partial<Folder>): Promise<void>;
  deleteFolder(id: string, permanent?: boolean): Promise<void>;
  getCategories(): Promise<Category[]>;
  getDeletedCategories(): Promise<Category[]>;
  addCategory(name: string, color: string, icon: string): Promise<any>;
  updateCategory(id: number, updates: any): Promise<void>;
  deleteCategory(id: number): Promise<void>;
  restoreCategory(id: number | string): Promise<void>;
  restoreFolder(id: number | string): Promise<void>;
  restoreDoc(id: number | string): Promise<void>;
  permanentlyDeleteCategory(id: number | string): Promise<void>;
  permanentlyDeleteFolder(id: number | string): Promise<void>;
  permanentlyDeleteDoc(id: number | string): Promise<void>;
  emptyTrash(): Promise<void>;
  getStorage(): Promise<number>;
  subscribe(listener: () => void): () => void;
  syncToWebsite(): Promise<{ success: boolean; message: string; error?: string }>;
  rebuildClientPayments(): Promise<void>;
  clearLocalData(): Promise<void>;
  resetLedger(): Promise<void>;
  getDocumentUrl(doc: Doc): string;
  exportData(): Promise<any>;
  generateId(prefix: string, date?: string): Promise<string>;
  peekId(prefix: string, date?: string): Promise<string>;
}

class WebDatabaseService implements DatabaseService {
  engine: LedgerEngine;
  private listeners: (() => void)[] = [];

  constructor() {
    Object.defineProperty(this, 'engine', {
      value: new LedgerEngine(this),
      enumerable: false,
      writable: true,
      configurable: true
    });
  }

  private async autoSyncIfEnabled() {
    try {
      const settings = await this.getSettings();
      if (settings?.autoSync) {
        await this.syncToWebsite().catch(console.error);
      }
    } catch (err) {
      console.error("Auto Sync failed", err);
    }
  }

  private notify() {
    this.listeners.forEach(l => l());
  }
  async getSettings(): Promise<AppSettings> {
  try {
    const stored = localStorage.getItem('ashray_settings');
    if (stored) {
      try { return JSON.parse(stored); } catch (_e) {}
    }
    const res = await fetch('/api/settings');
    if (!res.ok) {
      const defaults: AppSettings = { companyName: 'Ashray Group', whatsappNumber: '', autoSync: true, adminPassword: 'ashray123', enableAutoSend: false, paymentMessageTemplate: '' };
      localStorage.setItem('ashray_settings', JSON.stringify(defaults));
      return defaults;
    }
    const data = await res.json();
    if (data) localStorage.setItem('ashray_settings', JSON.stringify(data));
    return data || {};
  } catch (err) {
    const defaults: AppSettings = { companyName: 'Ashray Group', whatsappNumber: '', autoSync: true, adminPassword: 'ashray123', enableAutoSend: false, paymentMessageTemplate: '' };
    localStorage.setItem('ashray_settings', JSON.stringify(defaults));
    return defaults;
  }
}
  async saveSettings(settings: AppSettings): Promise<void> { 
    const res = await fetch('/api/settings', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(settings) }); 
    if (!res.ok) {
      throw new Error(`Failed to save settings: ${res.statusText}`);
    }
    this.notify();
    this.autoSyncIfEnabled();
  }
  async getMasterProperties(): Promise<MasterProperty[]> {
    const stored = localStorage.getItem('ashray_master_properties');
    if (stored) {
      try { const parsed = JSON.parse(stored); if (Array.isArray(parsed)) return parsed; } catch(_e) {}
    }
    const data = await safeFetchJSON('/api/master-properties/all');
    if (Array.isArray(data)) localStorage.setItem('ashray_master_properties', JSON.stringify(data));
    return Array.isArray(data) ? data : [];
  }
  async getMasterPropertyById(id: string): Promise<MasterProperty | undefined> { return (await safeFetchJSON(`/api/master-properties/${id}`)) || undefined; }
  async saveMasterProperty(property: MasterProperty): Promise<void> { await fetch('/api/master-properties/upsert', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(property) }); }
  async getClients(): Promise<Client[]> {
    const stored = localStorage.getItem('ashray_clients');
    if (stored) {
      try { const parsed = JSON.parse(stored); if (Array.isArray(parsed)) return parsed; } catch(_e) {}
    }
    const data = await safeFetchJSON('/api/client/all');
    if (Array.isArray(data)) localStorage.setItem('ashray_clients', JSON.stringify(data));
    return Array.isArray(data) ? data : [];
  }
  async getClientById(id: string): Promise<Client | undefined> {
    const stored = localStorage.getItem('ashray_clients');
    if (stored) {
      try { const parsed = JSON.parse(stored); const found = parsed.find((c: Client) => c.id === id); if (found) return found; } catch(_e) {}
    }
    return (await safeFetchJSON(`/api/client/${encodeURIComponent(id)}`)) || undefined;
  }
  async saveClient(client: Client): Promise<void> { 
    await apiFetch('/api/client/upsert', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(client) }); 
    await this.updateClientFileHistory(client.id);
    this.notify();
    this.autoSyncIfEnabled();
  }
  async deleteClient(id: string): Promise<void> { await fetch(`/api/client/delete/${id}`, { method: 'DELETE' }); this.notify(); }
  async getKissans(): Promise<Kissan[]> {
    const stored = localStorage.getItem('ashray_kissans');
    if (stored) {
      try { const parsed = JSON.parse(stored); if (Array.isArray(parsed)) return parsed; } catch(_e) {}
    }
    const data = await safeFetchJSON('/api/kissan/all');
    if (Array.isArray(data)) localStorage.setItem('ashray_kissans', JSON.stringify(data));
    return Array.isArray(data) ? data : [];
  }
  async getKissanById(id: string): Promise<Kissan | undefined> { return (await safeFetchJSON(`/api/kissan/${id}`)) || undefined; }
  async saveKissan(kissan: Kissan): Promise<void> { 
    await fetch('/api/kissan/upsert', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(kissan) }); 
    await this.updateKissanFileHistory(kissan.id);
    this.notify();
  }
  async deleteKissan(id: string): Promise<void> { await fetch(`/api/kissan/delete/${id}`, { method: 'DELETE' }); this.notify(); }
  async getInvestors(): Promise<Investor[]> {
    const stored = localStorage.getItem('ashray_investors');
    if (stored) {
      try { const parsed = JSON.parse(stored); if (Array.isArray(parsed)) return parsed; } catch(_e) {}
    }
    const data = await safeFetchJSON('/api/investor/all');
    if (Array.isArray(data)) localStorage.setItem('ashray_investors', JSON.stringify(data));
    return Array.isArray(data) ? data : [];
  }
  async getInvestorById(id: string): Promise<Investor | undefined> { return (await safeFetchJSON(`/api/investor/${id}`)) || undefined; }
  async saveInvestor(investor: Investor): Promise<void> { 
    await fetch('/api/investor/upsert', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(investor) }); 
    await this.updateInvestorFileHistory(investor.id);
    this.notify();
    this.autoSyncIfEnabled();
  }
  async getLoans(): Promise<Loan[]> {
    const stored = localStorage.getItem('ashray_loans');
    if (stored) {
      try { const parsed = JSON.parse(stored); if (Array.isArray(parsed)) return parsed; } catch(_e) {}
    }
    const data = await safeFetchJSON('/api/loan/all');
    if (Array.isArray(data)) localStorage.setItem('ashray_loans', JSON.stringify(data));
    return Array.isArray(data) ? data : [];
  }
  async getLoanById(id: string): Promise<Loan | undefined> { return (await safeFetchJSON(`/api/loan/${id}`)) || undefined; }
  async saveLoan(loan: Loan): Promise<void> { 
    await fetch('/api/loan/upsert', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(loan) }); 
    await this.updateLoanFileHistory(loan.id);
    this.notify();
  }
  async deleteLoan(id: string): Promise<void> { await fetch(`/api/loan/delete/${id}`, { method: 'DELETE' }); this.notify(); }
  async getTransactions(): Promise<Transaction[]> {
    const stored = localStorage.getItem('ashray_transactions');
    if (stored) {
      try { const parsed = JSON.parse(stored); if (Array.isArray(parsed)) return parsed; } catch(_e) {}
    }
    const data = await safeFetchJSON('/api/transaction/all');
    if (Array.isArray(data)) localStorage.setItem('ashray_transactions', JSON.stringify(data));
    return Array.isArray(data) ? data : [];
  }
  async saveTransaction(tx: Transaction): Promise<void> { 
    await fetch('/api/transaction/upsert', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(tx) }); 
    if (tx.clientId) await this.updateClientFileHistory(tx.clientId);
    if (tx.investorId) await this.updateInvestorFileHistory(tx.investorId);
    if (tx.staffId) await this.updateStaffFileHistory(tx.staffId);
    if (tx.kissanId) await this.updateKissanFileHistory(tx.kissanId);
    if (tx.loanId) await this.updateLoanFileHistory(tx.loanId);
    this.notify();
  }
  async deleteTransaction(id: string): Promise<void> { await fetch(`/api/transaction/delete/${id}`, { method: 'DELETE' }); }
  async getProperties(): Promise<Property[]> {
    const stored = localStorage.getItem('ashray_properties');
    if (stored) {
      try { const parsed = JSON.parse(stored); if (Array.isArray(parsed)) return parsed; } catch(_e) {}
    }
    const data = await safeFetchJSON('/api/property/all');
    if (Array.isArray(data)) localStorage.setItem('ashray_properties', JSON.stringify(data));
    return Array.isArray(data) ? data : [];
  }
  async getPropertyById(id: string): Promise<Property | undefined> { return (await safeFetchJSON(`/api/property/${id}`)) || undefined; }
  async saveProperty(property: Property): Promise<void> { 
    await fetch('/api/property/upsert', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(property) }); 
    this.autoSyncIfEnabled();
  }
  async deleteProperty(id: string): Promise<void> { 
    await fetch(`/api/property/delete/${id}`, { method: 'DELETE' }); 
    this.autoSyncIfEnabled();
  }
  async updateProperty(id: string, updates: Partial<Property>): Promise<void> { 
    await fetch(`/api/property/update/${id}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(updates) }); 
    this.autoSyncIfEnabled();
  }
  async assignPlotToClient(propertyId: string, plotId: string, clientId: string, clientData: { title?: string; name: string; phone: string; amount?: number; status: PropertyStatus }): Promise<void> { 
    await fetch('/api/property/assign', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ propertyId, plotId, clientId, clientData }) }); 
    await this.updateClientFileHistory(clientId);
    this.autoSyncIfEnabled();
  }
  async getReferrals(): Promise<Referral[]> { return (await safeFetchJSON('/api/referral/all')) || []; }
  async saveReferral(referral: Referral): Promise<void> { await fetch('/api/referral/upsert', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(referral) }); }
  async deleteReferral(id: string): Promise<void> { await fetch(`/api/referral/delete/${id}`, { method: 'DELETE' }); }
  async getBanks(): Promise<BankProfile[]> {
    const stored = localStorage.getItem('ashray_banks');
    if (stored) {
      try { const parsed = JSON.parse(stored); if (Array.isArray(parsed)) return parsed; } catch(_e) {}
    }
    const data = await safeFetchJSON('/api/bank/all');
    if (Array.isArray(data)) localStorage.setItem('ashray_banks', JSON.stringify(data));
    return Array.isArray(data) ? data : [];
  }
  async getBankById(id: string): Promise<BankProfile | undefined> { 
    return (await this.getBanks()).find((b: BankProfile) => b.id === id);
  }
  async saveBank(bank: BankProfile): Promise<void> { await fetch('/api/bank/upsert', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(bank) }); }
  async deleteBank(id: string): Promise<void> { await fetch(`/api/bank/delete/${id}`, { method: 'DELETE' }); }
  async getStaff(): Promise<Staff[]> {
    const stored = localStorage.getItem('ashray_staff');
    if (stored) {
      try { const parsed = JSON.parse(stored); if (Array.isArray(parsed)) return parsed; } catch(_e) {}
    }
    const data = await apiFetchJSON('/api/staff/all');
    if (Array.isArray(data)) localStorage.setItem('ashray_staff', JSON.stringify(data));
    return Array.isArray(data) ? data : [];
  }
  async getStaffById(id: string): Promise<Staff | undefined> { 
    return (await this.getStaff()).find((s: Staff) => s.id === id);
  }
  async saveStaff(staff: Staff): Promise<void> { 
    await fetch('/api/staff/upsert', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(staff) }); 
    await this.updateStaffFileHistory(staff.id);
    this.notify();
  }
  async deleteStaff(id: string): Promise<void> { await fetch(`/api/staff/delete/${id}`, { method: 'DELETE' }); this.notify(); }

  async getPendingReceipts(): Promise<PendingReceipt[]> {
    const data = await apiFetchJSON('/api/pending-receipts/all');
    return Array.isArray(data) ? data : [];
  }
  async savePendingReceipt(receipt: PendingReceipt): Promise<void> {
    await apiFetch('/api/pending-receipts/upsert', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(receipt) });
    this.notify();
  }
  async deletePendingReceipt(id: string): Promise<void> {
    await apiFetch(`/api/pending-receipts/delete/${id}`, { method: 'DELETE' });
    this.notify();
  }
  
  async getGstEntries(): Promise<GSTEntry[]> {
    const stored = localStorage.getItem('ashray_gst_book');
    if (stored) {
      try { return JSON.parse(stored); } catch (_e) { return []; }
    }
    return [];
  }
  async saveGstEntry(entry: GSTEntry): Promise<void> {
    const entries = await this.getGstEntries();
    const idx = entries.findIndex(e => e.id === entry.id);
    if (idx >= 0) entries[idx] = entry; else entries.push(entry);
    localStorage.setItem('ashray_gst_book', JSON.stringify(entries));
  }
  async deleteGstEntry(id: string): Promise<void> {
    const entries = await this.getGstEntries();
    localStorage.setItem('ashray_gst_book', JSON.stringify(entries.filter(e => e.id !== id)));
  }
  async updateGstEntry(entry: GSTEntry): Promise<void> {
    await this.saveGstEntry(entry);
  }

  async getPropertyMarketUpdates(propertyId?: string): Promise<PropertyMarketUpdate[]> {
    const stored = localStorage.getItem('ashray_market_updates');
    if (stored) {
      try { const parsed = JSON.parse(stored); if (Array.isArray(parsed)) { return propertyId ? parsed.filter(u => u.propertyId === propertyId) : parsed; } } catch(_e) {}
    }
    try {
      const res = await fetch(`/api/market-updates${propertyId ? `?propertyId=${propertyId}` : ''}`);
      const data = await res.json();
      if (Array.isArray(data)) localStorage.setItem('ashray_market_updates', JSON.stringify(data));
      return Array.isArray(data) ? data : [];
    } catch {
      return [];
    }
  }

  async savePropertyMarketUpdate(update: PropertyMarketUpdate): Promise<void> {
    await fetch('/api/market-updates/upsert', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(update)
    });
  }

  async deletePropertyMarketUpdate(id: string): Promise<void> {
    await fetch(`/api/market-updates/delete/${id}`, { method: 'DELETE' });
  }

  async getTodayClientCount(dateStr: string): Promise<number> {
    const clients = await this.getClients();
    return clients.filter(c => c.id.split('/')[2] === dateStr).length;
  }
  async saveClientHistory(clientId: string, categoryId: string, folderId: string, data: any, type: 'CLIENT' | 'KISSAN' | 'INVESTOR' | 'LOAN' | 'STAFF' = 'CLIENT'): Promise<void> {
    const docData: Doc = {
      id: `history_${clientId.replace(/\//g, '_')}`,
      name: clientId, // Use the full ID as the file name as requested
      date: new Date().toISOString().split('T')[0],
      size: `${(JSON.stringify(data).length / 1024).toFixed(2)} KB`,
      type: 'virtual', // Mark as virtual so it can be handled specifically in DataBase.tsx
      synced: true,
      category: 'REPORT',
      clientId: type === 'CLIENT' ? clientId : undefined,
      kissanId: type === 'KISSAN' ? clientId : undefined,
      investorId: type === 'INVESTOR' ? clientId : undefined,
      loanId: type === 'LOAN' ? clientId : undefined,
      staffId: type === 'STAFF' ? clientId : undefined,
      fileData: btoa(JSON.stringify(data, null, 2)),
      folder_id: folderId,
      category_id: categoryId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    await this.saveDoc(docData);
  }

  async updateStaffFileHistory(staffId: string): Promise<void> {
    const staff = await this.getStaffById(staffId);
    if (!staff || !staff.categoryId || !staff.folderId) return;
    const historyData = { staff, updatedAt: new Date().toISOString(), version: 'Telly' };
    await this.saveClientHistory(staffId, staff.categoryId, staff.folderId, historyData, 'STAFF');
  }

  async updateKissanFileHistory(kissanId: string): Promise<void> {
    const kissan = await this.getKissanById(kissanId);
    if (!kissan || !kissan.categoryId || !kissan.folderId) return;
    const historyData = { kissan, updatedAt: new Date().toISOString(), version: 'Telly' };
    await this.saveClientHistory(kissanId, kissan.categoryId, kissan.folderId, historyData, 'KISSAN');
  }

  async updateLoanFileHistory(loanId: string): Promise<void> {
    const loan = await this.getLoanById(loanId);
    if (!loan || !loan.categoryId || !loan.folderId) return;
    const historyData = { loan, updatedAt: new Date().toISOString(), version: 'Telly' };
    await this.saveClientHistory(loanId, loan.categoryId, loan.folderId, historyData, 'LOAN');
  }

  async updateInvestorFileHistory(investorId: string): Promise<void> {
    const investor = await this.getInvestorById(investorId);
    if (!investor || !investor.categoryId || !investor.folderId) return;

    const transactions = await this.getTransactions();
    const investorTransactions = transactions.filter(t => t.investorId === investorId);

    const historyData = {
      investor,
      transactions: investorTransactions,
      updatedAt: new Date().toISOString(),
      version: 'Telly'
    };

    await this.saveClientHistory(investorId, investor.categoryId, investor.folderId, historyData, 'INVESTOR');
  }

  async updateClientFileHistory(clientId: string): Promise<void> {
    const client = await this.getClientById(clientId);
    if (!client || !client.categoryId || !client.folderId) return;

    const [transactions, properties] = await Promise.all([
      this.getTransactions(),
      this.getProperties()
    ]);

    const clientTransactions = transactions.filter(t => t.clientId === clientId);
    const clientPropertyIds = new Set(client.investments?.map(inv => inv.propertyId) || []);
    const clientProperties = properties.filter(p => clientPropertyIds.has(p.id));

    const historyData = {
      client,
      transactions: clientTransactions,
      properties: clientProperties,
      updatedAt: new Date().toISOString(),
      version: 'Telly'
    };

    await this.saveClientHistory(clientId, client.categoryId, client.folderId, historyData);
  }
  async getDocs(includeDeleted = false): Promise<Doc[]> {
  const stored = localStorage.getItem('ashray_docs');
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) return parsed.filter(d => includeDeleted ? true : d.is_deleted === 0 || d.is_deleted === undefined || d.is_deleted === 0);
    } catch(_e) {}
  }
  const data = await apiFetchJSON('/api/doc/all');
  if (Array.isArray(data)) localStorage.setItem('ashray_docs', JSON.stringify(data));
  if (!Array.isArray(data)) return [];
  return data.filter(d => includeDeleted ? true : d.is_deleted === 0);
}
  async saveDoc(docData: Doc): Promise<void> { await fetch('/api/doc/upsert', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(docData) }); }
  async updateDoc(id: string | number, updates: Partial<Doc>): Promise<void> {
    await apiFetch(`/api/files/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
    this.notify();
  }
  async saveDocument(docData: Doc): Promise<void> { await this.saveDoc(docData); }
  async deleteDoc(id: string): Promise<void> { await fetch(`/api/doc/delete/${id}`, { method: 'DELETE' }); }
  async deleteDocument(id: string, permanent: boolean = false): Promise<void> {
    await fetch(`/api/doc/${id}?permanent=${permanent}`, { method: 'DELETE' });
  }
  async getFolders(showDeleted = false): Promise<Folder[]> {
  const stored = localStorage.getItem('ashray_folders');
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) return parsed.filter(f => showDeleted ? true : f.is_deleted === 0 || f.is_deleted === undefined);
    } catch(_e) {}
  }
  const data = await apiFetchJSON('/api/folder/all');
  if (Array.isArray(data)) localStorage.setItem('ashray_folders', JSON.stringify(data));
  if (!Array.isArray(data)) return [];
  return data.filter(f => showDeleted ? true : f.is_deleted === 0);
}
  async saveFolder(folder: Folder): Promise<void> { await apiFetch('/api/folder/upsert', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(folder) }); }
  async updateFolder(id: string | number, updates: Partial<Folder>): Promise<void> {
    await apiFetch(`/api/folders/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
    this.notify();
  }
  async deleteFolder(id: string, permanent: boolean = false): Promise<void> {
  if (permanent) {
    await fetch(`/api/folders/${id}?permanent=true`, {
      method: 'DELETE'
    });
  } else {
    await fetch(`/api/folder/update/${id}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_deleted: 1 })
    });
  }
}
  async getCategories(): Promise<Category[]> {
  const stored = localStorage.getItem('ashray_categories');
  if (stored) {
    try { const parsed = JSON.parse(stored); if (Array.isArray(parsed)) return parsed; } catch(_e) {}
  }
  const data = await apiFetchJSON('/api/category/all');
  if (Array.isArray(data)) localStorage.setItem('ashray_categories', JSON.stringify(data));
  return Array.isArray(data) ? data : [];
}
  async getDeletedCategories(): Promise<Category[]> {
    const stored = localStorage.getItem('ashray_deleted_categories');
    if (stored) {
      try { const parsed = JSON.parse(stored); if (Array.isArray(parsed)) return parsed; } catch(_e) {}
    }
    const data = await apiFetchJSON('/api/category/deleted');
    if (Array.isArray(data)) localStorage.setItem('ashray_deleted_categories', JSON.stringify(data));
    return Array.isArray(data) ? data : [];
}
  async restoreCategory(id: number | string): Promise<void> {
  try {
    await fetch(`/api/categories/${id}/restore`, {
      method: 'POST',
    });
  } catch (err) {
    console.error('Restore category failed:', err);
  }
}

async restoreFolder(id: number | string): Promise<void> {
  try {
    await fetch(`/api/folders/${id}/restore`, {
      method: 'POST',
    });
  } catch (err) {
    console.error('Restore folder failed:', err);
  }
}

async restoreDoc(id: number | string): Promise<void> {
  try {
    await fetch(`/api/files/${id}/restore`, {
      method: 'POST',
    });
  } catch (err) {
    console.error('Restore doc failed:', err);
  }
}

async permanentlyDeleteCategory(id: number | string): Promise<void> {
  try {
    await fetch(`/api/categories/${id}`, {
      method: 'DELETE',
    });
  } catch (err) {
    console.error('Permanent delete category failed:', err);
  }
}

async permanentlyDeleteFolder(id: number | string): Promise<void> {
  try {
    await fetch(`/api/folders/${id}?permanent=true`, {
      method: 'DELETE',
    });
  } catch (err) {
    console.error('Permanent delete folder failed:', err);
  }
}

async permanentlyDeleteDoc(id: number | string): Promise<void> {
  try {
    await fetch(`/api/files/${id}?permanent=true`, {
      method: 'DELETE',
    });
  } catch (err) {
    console.error('Permanent delete doc failed:', err);
  }
}
async addCategory(name: string, color: string, icon: string): Promise<any> {
  try {
    const res = await fetch('/api/category/upsert', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, color, icon })
    });

    if (!res.ok) {
      console.error('❌ CATEGORY CREATE FAILED:', res.status);
      return null;
    }

    const contentType = res.headers.get('content-type');

    if (!contentType || !contentType.includes('application/json')) {
      console.error('❌ CATEGORY CREATE NON-JSON RESPONSE');
      return null;
    }

    return await res.json();
  } catch (err) {
    console.error('❌ CATEGORY CREATE ERROR:', err);
    return null;
  }
}
  async updateCategory(id: number, updates: any): Promise<void> { await fetch(`/api/category/update/${id}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(updates) }); }
  async deleteCategory(id: number): Promise<void> {
  await fetch(`/api/category/update/${id}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ is_deleted: 1 })
  });
}
async emptyTrash(): Promise<void> {
  await fetch('/api/trash/empty', { method: 'DELETE' });
}
   async getStorage(): Promise<number> {
    const stored = localStorage.getItem('ashray_storage');
    if (stored) {
      try { const parsed = JSON.parse(stored); if (typeof parsed === 'number') return parsed; } catch(_e) {}
    }
    try {
      const res = await fetch('/api/storage');
      const data = await res.json();
      const size = data.totalStorage || 0;
      localStorage.setItem('ashray_storage', JSON.stringify(size));
      return size;
    } catch (err) {
      console.error('getStorage error:', err);
      return 0;
    }
  }
  subscribe(_listener: () => void): () => void { return () => {}; }
  async syncToWebsite(): Promise<{ success: boolean; message: string; error?: string }> { 
    return (await apiFetch('/api/sync-to-website', { method: 'POST' })).json();
  }
  async rebuildClientPayments(): Promise<void> { }
  async clearLocalData(): Promise<void> {
    await fetch('/api/reset-ledger', { method: 'POST' });
  }
  async resetLedger(): Promise<void> {
    await fetch('/api/reset-ledger', { method: 'POST' });
  }
  getDocumentUrl(doc: Doc): string { 
    if (doc.id && doc.id.startsWith('doc_')) {
      return `/api/doc/serve/${encodeURIComponent(doc.id)}`;
    }
    return `/api/doc/view/${encodeURIComponent(doc.name || 'undefined')}`; 
  }
  async exportData(): Promise<any> {
    const [clients, transactions, properties, masterProperties, loans, investors, kissans, referrals, docs, folders, categories, banks, staff, gstEntries, pendingReceipts, settings] = await Promise.all([
      this.getClients(), this.getTransactions(), this.getProperties(), this.getMasterProperties(), this.getLoans(), this.getInvestors(), this.getKissans(), this.getReferrals(), this.getDocs(true), this.getFolders(true), this.getCategories(), this.getBanks(), this.getStaff(), this.getGstEntries(), this.getPendingReceipts(), this.getSettings()
    ]);
    return { clients, transactions, properties, masterProperties, loans, investors, kissans, referrals, docs, folders, categories, banks, staff, gstEntries, pendingReceipts, settings };
  }

  async generateId(prefix: string, date?: string): Promise<string> {
  try {
    const res = await fetch('/api/generate-id', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prefix, date })
    });

    const data = await res.json();
    return data.id;
  } catch (err) {
    console.error('❌ fallback generateId error:', err);
    return formatGeneratedId(
      prefix,
      date ? new Date(date) : new Date(),
      Math.floor(Math.random() * 100000)
    );
  }
}

  async peekId(prefix: string, date?: string): Promise<string> {
    try {
      const res = await fetch('/api/peek-id', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prefix, date })
      });
      if (!res.ok) throw new Error('API Error');
      const data = await res.json();
      return data.id;
} catch {
      return formatGeneratedId(prefix, date ? new Date(date) : new Date(), 99999);
    }
}

  async getInstallationState(): Promise<InstallationState> {
    try {
      const stored = localStorage.getItem('ashray_installation_state');
      if (stored) return JSON.parse(stored);
    } catch (_e) {}
    return { mode: 'Independent', ledgerId: '', machineId: '', syncCode: '', serverUrl: '', isInitialized: false };
  }

  async saveInstallationState(state: InstallationState): Promise<void> {
    localStorage.setItem('ashray_installation_state', JSON.stringify(state));
  }

  async getRegisteredMachines(): Promise<MachineRegistration[]> {
    return [];
  }

  async exportSyncPackage(): Promise<string> {
    const data = await this.exportData();
    return JSON.stringify({
      version: '1.0',
      timestamp: new Date().toISOString(),
      data
    });
  }

  async importSyncPackage(pkg: string): Promise<void> {
    const parsed = JSON.parse(pkg);
    const data = parsed.data || parsed;
    if (data.clients) for (const c of data.clients) await this.saveClient(c);
    if (data.transactions) for (const t of data.transactions) await this.saveTransaction(t);
    if (data.properties) for (const p of data.properties) await this.saveProperty(p);
    if (data.kissans) for (const k of data.kissans) await this.saveKissan(k);
    if (data.investors) for (const i of data.investors) await this.saveInvestor(i);
    if (data.loans) for (const l of data.loans) await this.saveLoan(l);
    if (data.banks) for (const b of data.banks) await this.saveBank(b);
    if (data.staff) for (const s of data.staff) await this.saveStaff(s);
    if (data.docs) for (const d of data.docs) await this.saveDoc(d);
    if (data.gstEntries) for (const g of data.gstEntries) await this.saveGstEntry(g);
    if (data.pendingReceipts) for (const r of data.pendingReceipts) await this.savePendingReceipt(r);
    if (data.settings && Object.keys(data.settings).length > 0) {
      try { await this.saveSettings(data.settings); } catch {}
    }
  }
}

class ElectronDatabaseService implements DatabaseService {
  engine!: LedgerEngine;
  private api: any;

  constructor() {
    const self = this as unknown as DatabaseService;
    Object.defineProperty(this, 'engine', {
      value: new LedgerEngine(self),
      enumerable: false,
      writable: true,
      configurable: true
    });
    try {
      this.api = (window as any).api;
    } catch {
      this.api = undefined;
    }
  }

  private async autoSyncIfEnabled() {
    try {
      const settings = await this.getSettings();
      if (settings?.autoSync) {
        await this.syncToWebsite().catch(console.error);
      }
    } catch (err) {
      console.error("Auto Sync failed", err);
    }
  }

  async getSettings(): Promise<AppSettings> {
  if (!this.api) {
    console.error("❌ Electron API not available");
    return {} as AppSettings;
  }
  return this.api.getSettings();
}
  async saveSettings(settings: AppSettings): Promise<void> { 
  await this.api.saveSettings(settings);

  // 🔥 CRITICAL: trigger UI update
  if (this.api.subscribe) {
    const listeners = await this.api.subscribe(() => {});
  }

  window.dispatchEvent(new CustomEvent('settings-updated'));
  this.autoSyncIfEnabled();
}

  async getMasterProperties(): Promise<MasterProperty[]> { 
    if (!this.api) throw new Error("Electron API not available");
    return this.api.getMasterProperties(); }
  async getMasterPropertyById(id: string): Promise<MasterProperty | undefined> { 
    if (!this.api) throw new Error("Electron API not available");
    return this.api.getMasterPropertyById(id); }
  async saveMasterProperty(property: MasterProperty): Promise<void> { await this.api.saveMasterProperty(property); }

  async getClients(): Promise<Client[]> { 
    if (!this.api) throw new Error("Electron API not available");
    return this.api.getClients(); }
  async getClientById(id: string): Promise<Client | undefined> {
    if (!this.api) throw new Error("Electron API not available");
    return this.api.getClientById(id); }

  async saveClient(client: Client): Promise<void> {
    await this.api.saveClient(client);
    await this.updateClientFileHistory(client.id);
    this.autoSyncIfEnabled();
  }

  async deleteClient(id: string): Promise<void> { await this.api.deleteClient(id); }

  async getKissans(): Promise<Kissan[]> { 
    if (!this.api) throw new Error("Electron API not available");
    const kissans = await this.api.getKissans();
    return kissans.map((k: any) => ({
      ...k,
      landName: k.landName || k.name || '',
      owners: Array.isArray(k.owners) ? k.owners : [],
      documents: Array.isArray(k.documents) ? k.documents : []
    }));
  }
  async getKissanById(id: string): Promise<Kissan | undefined> { 
    if (!this.api) throw new Error("Electron API not available");
    const k = await this.api.getKissanById(id);
    if (!k) return undefined;
    return {
      ...k,
      landName: k.landName || k.name || '',
      owners: Array.isArray(k.owners) ? k.owners : [],
      documents: Array.isArray(k.documents) ? k.documents : []
    };
  }
  async saveKissan(kissan: Kissan): Promise<void> { 
    await this.api.saveKissan(kissan); 
    await this.updateKissanFileHistory(kissan.id);
  }
  async deleteKissan(id: string): Promise<void> { await this.api.deleteKissan(id); }

  async getInvestors(): Promise<Investor[]> { 
    if (!this.api) throw new Error("Electron API not available");
    return this.api.getInvestors(); }
  async getInvestorById(id: string): Promise<Investor | undefined> { 
    if (!this.api) throw new Error("Electron API not available");
    return this.api.getInvestorById(id); }
  async saveInvestor(investor: Investor): Promise<void> { 
    await this.api.saveInvestor(investor); 
    await this.updateInvestorFileHistory(investor.id);
    this.autoSyncIfEnabled();
  }

  async getLoans(): Promise<Loan[]> { 
    if (!this.api) throw new Error("Electron API not available");
    return this.api.getLoans(); }
  async getLoanById(id: string): Promise<Loan | undefined> {
    if (!this.api) throw new Error("Electron API not available");
    return this.api.getLoanById(id); }
  async saveLoan(loan: Loan): Promise<void> { 
    await this.api.saveLoan(loan); 
    await this.updateLoanFileHistory(loan.id);
  }
  async deleteLoan(id: string): Promise<void> { await this.api.deleteLoan(id); }

  async getTransactions(): Promise<Transaction[]> { 
    if (!this.api) throw new Error("Electron API not available");
    return this.api.getTransactions(); }

  async saveTransaction(tx: Transaction): Promise<void> {
    await this.api.saveTransaction(tx);
    if (tx.clientId) await this.updateClientFileHistory(tx.clientId);
    if (tx.investorId) await this.updateInvestorFileHistory(tx.investorId);
    if (tx.staffId) await this.updateStaffFileHistory(tx.staffId);
    if (tx.kissanId) await this.updateKissanFileHistory(tx.kissanId);
    if (tx.loanId) await this.updateLoanFileHistory(tx.loanId);
  }

  async deleteTransaction(id: string): Promise<void> { await this.api.deleteTransaction(id); }

  async getProperties(): Promise<Property[]> { 
    if (!this.api) throw new Error("Electron API not available");
    return this.api.getProperties(); }
  async getPropertyById(id: string): Promise<Property | undefined> { 
    if (!this.api) throw new Error("Electron API not available");
    return this.api.getPropertyById(id); }
  async saveProperty(property: Property): Promise<void> { 
    await this.api.saveProperty(property); 
    this.autoSyncIfEnabled();
  }
  async deleteProperty(id: string): Promise<void> { 
    await this.api.deleteProperty(id); 
    this.autoSyncIfEnabled();
  }
  async updateProperty(id: string, updates: Partial<Property>): Promise<void> { 
    await this.api.updateProperty(id, updates); 
    this.autoSyncIfEnabled();
  }

  async assignPlotToClient(
    propertyId: string,
    plotId: string,
    clientId: string,
    clientData: { title?: string; name: string; phone: string; amount?: number; status: PropertyStatus }
  ): Promise<void> {
    await this.api.assignPlotToClient(propertyId, plotId, clientId, clientData);
    await this.updateClientFileHistory(clientId);
    this.autoSyncIfEnabled();
  }

  async getReferrals(): Promise<Referral[]> { 
    if (!this.api) throw new Error("Electron API not available");
    return this.api.getReferrals(); }
  async saveReferral(referral: Referral): Promise<void> { await this.api.saveReferral(referral); }
  async deleteReferral(id: string): Promise<void> { await this.api.deleteReferral(id); }

  // ✅ FIXED (CRITICAL)
  async getBanks(): Promise<BankProfile[]> { 
    if (!this.api) throw new Error("Electron API not available");
    return this.api.getBanks(); }
  async getBankById(id: string): Promise<BankProfile | undefined> { 
    if (!this.api) throw new Error("Electron API not available");
    return this.api.getBankById(id); }
  async saveBank(bank: BankProfile): Promise<void> { await this.api.saveBank(bank); }
  async deleteBank(id: string): Promise<void> { await this.api.deleteBank(id); }

  async getStaff(): Promise<Staff[]> { 
    if (!this.api) throw new Error("Electron API not available");
    return this.api.getStaff(); }
  async getStaffById(id: string): Promise<Staff | undefined> { 
    if (!this.api) throw new Error("Electron API not available");
    return this.api.getStaffById(id); }
  async saveStaff(staff: Staff): Promise<void> { 
    await this.api.saveStaff(staff); 
    await this.updateStaffFileHistory(staff.id);
  }
  async deleteStaff(id: string): Promise<void> { await this.api.deleteStaff(id); }

  async getPendingReceipts(): Promise<PendingReceipt[]> {
    if (!this.api) throw new Error("Electron API not available");
    return this.api.getPendingReceipts();
  }
  async savePendingReceipt(receipt: PendingReceipt): Promise<void> {
    await this.api.savePendingReceipt(receipt);
  }
  async deletePendingReceipt(id: string): Promise<void> {
    await this.api.deletePendingReceipt(id);
  }

  async getGstEntries(): Promise<GSTEntry[]> {
    if (!this.api) throw new Error("Electron API not available");
    return this.api.getGstEntries();
  }
  async saveGstEntry(entry: GSTEntry): Promise<void> { await this.api.saveGstEntry(entry); }
  async deleteGstEntry(id: string): Promise<void> { await this.api.deleteGstEntry(id); }
  async updateGstEntry(entry: GSTEntry): Promise<void> { await this.api.updateGstEntry(entry.id, entry); }

  async getPropertyMarketUpdates(propertyId?: string): Promise<PropertyMarketUpdate[]> {
    if (!this.api) throw new Error("Electron API not available");
    return this.api.getPropertyMarketUpdates(propertyId);
  }

  async savePropertyMarketUpdate(update: PropertyMarketUpdate): Promise<void> {
    await this.api.savePropertyMarketUpdate(update);
  }

  async deletePropertyMarketUpdate(id: string): Promise<void> {
    await this.api.deletePropertyMarketUpdate(id);
  }

  async getTodayClientCount(dateStr: string): Promise<number> {
    const clients = await this.getClients();
    return clients.filter(c => c.id.split('/')[2] === dateStr).length;
  }

  async getDocs(includeDeleted = false): Promise<Doc[]> {
     if (!this.api) throw new Error("Electron API not available");
     // We need to merge both the ledger 'docs' table and the generic 'documents' table
     const docsPromise = this.api.getDocs ? this.api.getDocs() : Promise.resolve([]);
     const documentsPromise = this.api.getDocuments ? this.api.getDocuments({ includeDeleted }) : Promise.resolve([]);
     
     const [docs, documents] = await Promise.all([docsPromise, documentsPromise]);
     
     // Merge and remove duplicates by ID
     const combined = [...(docs || []), ...(documents || [])];
     const unique = Array.from(new Map(combined.map(item => [item.id, item])).values());
     return unique;
  }
  async saveDoc(docData: Doc): Promise<void> {
    // Route ledger docs (those with a party ID) to the docs table (api.saveDoc)
    // Route File Manager-only docs (no party ID) to the documents table (api.saveDocument)
    const isLedgerDoc = !!(docData.clientId || docData.kissanId || docData.investorId || docData.staffId || docData.loanId);
    if (isLedgerDoc) {
      // Always use docs table for ledger documents — it has clientId column
      await this.api.saveDoc(docData);
      
      // Update history (SKIP for virtual/history docs to prevent infinite recursion)
      if (docData.type !== 'virtual') {
        if (docData.clientId) await this.updateClientFileHistory(docData.clientId);
        if (docData.kissanId) await this.updateKissanFileHistory(docData.kissanId);
        if (docData.investorId) await this.updateInvestorFileHistory(docData.investorId);
        if (docData.staffId) await this.updateStaffFileHistory(docData.staffId);
        if (docData.loanId) await this.updateLoanFileHistory(docData.loanId);
      }
    } else if (this.api.saveDocument) {
       await this.api.saveDocument(docData);
    } else {
       await this.api.saveDoc(docData);
    }
  }
  async updateDoc(id: string | number, updates: Partial<Doc>): Promise<void> {
    if (this.api.updateDoc) {
      await this.api.updateDoc(id, updates);
    } else {
      const docs = await this.getDocs(true);
      const doc = docs.find(d => String(d.id) === String(id));
      if (doc) {
        await this.saveDoc({ ...doc, ...updates } as Doc);
      }
    }
  }
  async saveDocument(docData: Doc): Promise<void> { 
    if (this.api.saveDocument) {
      await this.api.saveDocument(docData);
    } else {
      await this.api.saveDoc(docData);
    }
  }
  async deleteDoc(id: string): Promise<void> { 
       await this.api.deleteDoc(id); 
  }
  async deleteDocument(id: string, permanent: boolean = false): Promise<void> {
    await this.api.deleteDocument(id, permanent);
  }
  async getFolders(showDeleted = false): Promise<Folder[]> { 
    if (!this.api) throw new Error("Electron API not available");
    return this.api.getFolders(showDeleted); }
  async saveFolder(folder: Folder): Promise<void> { await this.api.saveFolder(folder); }
  async updateFolder(id: string | number, updates: Partial<Folder>): Promise<void> {
    if (this.api.updateFolder) {
      await this.api.updateFolder(id, updates);
    } else {
      const folders = await this.getFolders(true);
      const folder = folders.find(f => String(f.id) === String(id));
      if (folder) {
        await this.saveFolder({ ...folder, ...updates } as Folder);
      }
    }
  }
  async deleteFolder(id: string, permanent: boolean = false): Promise<void> {
  await this.api.deleteFolder(id, permanent);
}

  async getCategories(): Promise<Category[]> { 
    if (!this.api) throw new Error("Electron API not available");
    return this.api.getCategories(); }
  async getDeletedCategories(): Promise<Category[]> {
    if (!this.api) throw new Error("Electron API not available");
    return this.api.getDeletedCategories(); }
  async addCategory(name: string, color: string, icon: string): Promise<any> {
  if (!this.api) throw new Error("Electron API not available");

  try {
    return await this.api.addCategory(name, color, icon);
  } catch (err) {
    console.error('❌ CATEGORY CREATE ERROR:', err);
    return null;
  }
}
  async updateCategory(id: number, updates: any): Promise<void> { await this.api.updateCategory(id, updates); }
  async deleteCategory(id: number): Promise<void> { await this.api.deleteCategory(id); }
  async restoreCategory(id: number | string): Promise<void> {
    if (!this.api) return;
    return this.api.restoreCategory(id);
  }

  async restoreFolder(id: number | string): Promise<void> {
  if (!this.api) return;
  await this.api.restoreFolder(id);
}

  async restoreDoc(id: number | string): Promise<void> {
    if (!this.api) return;
    return this.api.restoreDocument ? this.api.restoreDocument(id) : this.api.updateDocument(id, { is_deleted: 0 });
  }

  async permanentlyDeleteCategory(id: number | string): Promise<void> {
    if (!this.api) return;
    return this.api.permanentlyDeleteCategory(id);
  }

  async permanentlyDeleteFolder(id: number | string): Promise<void> {
    if (!this.api) return;
    return this.api.deleteFolder(id, true);
  }

  async permanentlyDeleteDoc(id: number | string): Promise<void> {
    if (!this.api) return;
    return this.api.deleteDocument ? this.api.deleteDocument(id, true) : this.api.deleteDoc(id);
  }
  async emptyTrash(): Promise<void> {
  await this.api.emptyTrash();
}
  async getStorage(): Promise<number> { 
    if (!this.api) throw new Error("Electron API not available");
    return this.api.getStorage(); }

  subscribe(listener: () => void): () => void { 
    if (!this.api) throw new Error("Electron API not available");
    return this.api.subscribe(listener); }

  async syncToWebsite(): Promise<{ success: boolean; message: string; error?: string }> { 
    if (!this.api) throw new Error("Electron API not available");
    return this.api.syncToWebsite(); }
  async rebuildClientPayments(): Promise<void> { await this.api.rebuildClientPayments(); }
  async clearLocalData(): Promise<void> { await this.api.clearLocalData(); }
  async resetLedger(): Promise<void> { await this.api.resetLedger(); }

  getDocumentUrl(doc: Doc): string { 
    if (!this.api) throw new Error("Electron API not available");
    return this.api.getDocumentUrl(doc); }

  async exportData(): Promise<any> { 
    if (!this.api) throw new Error("Electron API not available");
    return this.api.exportData(); }

  async generateId(prefix: string, date?: string): Promise<string> {
    if (this.api && this.api.generateId) {
      try {
        return await this.api.generateId(prefix, date);
      } catch (err) {
        console.error('❌ generateId electron error:', err);
        return formatGeneratedId(prefix, date ? new Date(date) : new Date(), Math.floor(Math.random() * 100000));
      }
    }
    try {
      const res = await fetch('/api/generate-id', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prefix, date })
      });
      const data = await res.json();
      return data.id;
    } catch (err) {
      console.error('❌ generateId electron error:', err);
      return formatGeneratedId(prefix, date ? new Date(date) : new Date(), Math.floor(Math.random() * 100000));
    }
  }

  async peekId(prefix: string, date?: string): Promise<string> {
    if (this.api && this.api.peekId) {
      try {
        return await this.api.peekId(prefix, date);
      } catch (err) {
        console.error('❌ peekId electron error:', err);
        return formatGeneratedId(prefix, date ? new Date(date) : new Date(), 99999);
      }
    }
    try {
      const res = await fetch('/api/peek-id', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prefix, date })
      });
      if (!res.ok) throw new Error('API Error');
      const data = await res.json();
      return data.id;
    } catch {
      return formatGeneratedId(prefix, date ? new Date(date) : new Date(), 99999);
    }
  }

  async getInstallationState(): Promise<InstallationState> {
    if (this.api) return await this.api.getInstallationState();
    return JSON.parse(localStorage.getItem('ashray_installation_state') || '{"isInitialized": false}');
  }

  async saveInstallationState(state: InstallationState): Promise<void> {
    if (this.api) {
      await this.api.saveInstallationState(state);
    } else {
      localStorage.setItem('ashray_installation_state', JSON.stringify(state));
    }
  }

  async getRegisteredMachines(): Promise<MachineRegistration[]> {
    if (this.api) return await this.api.getRegisteredMachines();
    return [];
  }

  async exportSyncPackage(): Promise<string> {
    if (this.api) return await this.api.exportSyncPackage();
    return localStorage.getItem('ashray_backup') || '{}';
  }

  async importSyncPackage(pkg: string): Promise<void> {
    if (this.api) {
      await this.api.importSyncPackage(pkg);
      return;
    }
    // Web fallback: parse and save each entity
    const parsed = JSON.parse(pkg);
    const data = parsed.data || parsed;
    for (const c of data.clients || []) await this.saveClient(c);
    for (const t of data.transactions || []) await this.saveTransaction(t);
    for (const p of data.properties || []) await this.saveProperty(p);
    for (const k of data.kissans || []) await this.saveKissan(k);
    for (const i of data.investors || []) await this.saveInvestor(i);
    for (const l of data.loans || []) await this.saveLoan(l);
    for (const b of data.banks || []) await this.saveBank(b);
    for (const s of data.staff || []) await this.saveStaff(s);
    for (const d of data.docs || []) await this.saveDoc(d);
    for (const g of data.gstEntries || []) await this.saveGstEntry(g);
    for (const r of data.pendingReceipts || []) await this.savePendingReceipt(r);
    if (data.settings && Object.keys(data.settings).length > 0) {
      try { await this.saveSettings(data.settings); } catch {}
    }
  }

  async saveClientHistory(clientId: string, categoryId: string, folderId: string, data: any, type: 'CLIENT' | 'KISSAN' | 'INVESTOR' | 'LOAN' | 'STAFF' = 'CLIENT'): Promise<void> {
    const docData: Doc = {
      id: `history_${clientId.replace(/\//g, '_')}`,
      name: clientId,
      date: new Date().toISOString().split('T')[0],
      size: `${(JSON.stringify(data).length / 1024).toFixed(2)} KB`,
      type: 'virtual',
      synced: true,
      category: 'REPORT',
      clientId: type === 'CLIENT' ? clientId : undefined,
      kissanId: type === 'KISSAN' ? clientId : undefined,
      investorId: type === 'INVESTOR' ? clientId : undefined,
      loanId: type === 'LOAN' ? clientId : undefined,
      staffId: type === 'STAFF' ? clientId : undefined,
      fileData: btoa(JSON.stringify(data, null, 2)),
      folder_id: folderId,
      category_id: categoryId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    await this.saveDoc(docData);
  }

  async updateClientFileHistory(clientId: string): Promise<void> {
    const client = await this.getClientById(clientId);
    if (!client || !client.categoryId || !client.folderId) return;
    const historyData = { client, updatedAt: new Date().toISOString(), version: 'Telly' };
    await this.saveClientHistory(clientId, client.categoryId, client.folderId, historyData);
  }

  async updateStaffFileHistory(staffId: string): Promise<void> {
    const staff = await this.getStaffById(staffId);
    if (!staff || !staff.categoryId || !staff.folderId) return;
    const historyData = { staff, updatedAt: new Date().toISOString(), version: 'Telly' };
    await this.saveClientHistory(staffId, staff.categoryId, staff.folderId, historyData, 'STAFF');
  }

  async updateKissanFileHistory(kissanId: string): Promise<void> {
    const kissan = await this.getKissanById(kissanId);
    if (!kissan || !kissan.categoryId || !kissan.folderId) return;
    const historyData = { kissan, updatedAt: new Date().toISOString(), version: 'Telly' };
    await this.saveClientHistory(kissanId, kissan.categoryId, kissan.folderId, historyData, 'KISSAN');
  }

  async updateLoanFileHistory(loanId: string): Promise<void> {
    const loan = await this.getLoanById(loanId);
    if (!loan || !loan.categoryId || !loan.folderId) return;
    const historyData = { loan, updatedAt: new Date().toISOString(), version: 'Telly' };
    await this.saveClientHistory(loanId, loan.categoryId, loan.folderId, historyData, 'LOAN');
  }

  async updateInvestorFileHistory(investorId: string): Promise<void> {
    const investor = await this.getInvestorById(investorId);
    if (!investor || !investor.categoryId || !investor.folderId) return;
    const transactions = await this.getTransactions();
    const investorTransactions = transactions.filter(t => t.investorId === investorId);
    const historyData = { investor, transactions: investorTransactions, updatedAt: new Date().toISOString(), version: 'Telly' };
    await this.saveClientHistory(investorId, investor.categoryId, investor.folderId, historyData, 'INVESTOR');
  }

async clearTrash(): Promise<void> {
  if (!this.api) throw new Error("Electron API not available");

  const docs = await this.api.getDocs();

  const deletedDocs = docs.filter((d: any) => d.is_deleted === 1);

  for (const doc of deletedDocs) {
    await this.api.deleteDoc(doc.id);
  }
}
}
const isElectron = typeof window !== 'undefined' && (window as any).api !== undefined;
console.log("🔥 DB MODE:", isElectron ? "ELECTRON" : "WEB");
export const dbService: DatabaseService =

  isElectron ? new ElectronDatabaseService() : new WebDatabaseService();
