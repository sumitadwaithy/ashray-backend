import { 
  Client, 
  Transaction, 
  Property, 
  MasterProperty, 
  TransactionType, 
  PaymentMethod, 
  AppSettings, 
  Investor, 
  TransactionCategory, 
  Kissan, 
  Referral, 
  Doc, 
  Loan,
  PropertyStatus,
  Folder,
  Category,
} from '../types';
import { Accounting } from './accounting';
import { DatabaseService } from './db';

export class LedgerEngine {
  private db: DatabaseService;
  private listeners: (() => void)[] = [];
  private storageKey = 'ashray_ledger_data';
  private isSyncing = false;

  constructor(db: DatabaseService) {
    Object.defineProperty(this, 'db', {
      value: db,
      enumerable: false,
      writable: true,
      configurable: true
    });
  }
  
  private async getBackendUrl() {
  const data = await this.getData();
  return data.settings?.backendUrl || process.env.BACKEND_URL || 'https://ashray-backend-2nt7.onrender.com';
}

  private async getData() {
    try {
      const [
        clients,
        transactions,
        properties,
        masterProperties,
        loans,
        investors,
        kissans,
        referrals,
        docs,
        categories,
        folders,
        settings,
        staff
      ] = await Promise.all([
        this.db.getClients(),
        this.db.getTransactions(),
        this.db.getProperties(),
        this.db.getMasterProperties(),
        this.db.getLoans(),
        this.db.getInvestors(),
        this.db.getKissans(),
        this.db.getReferrals(),
        this.db.getDocs(),
        this.db.getCategories(),
        this.db.getFolders(),
        this.db.getSettings(),
        this.db.getStaff()
      ]);

      return {
        clients,
        transactions,
        properties,
        masterProperties,
        loans,
        investors,
        kissans,
        referrals,
        docs,
        files: docs,
        categories,
        folders,
        staff,
        settings: settings || {
          companyName: 'Ashray Group',
          taxId: 'TAX-12345678',
          autoSync: true,
          whatsappNumber: '919876543210',
          enableAutoSend: true,
          paymentMessageTemplate: "",
          backendUrl: process.env.BACKEND_URL || 'https://ashray-backend-2nt7.onrender.com'
        }
      };

    } catch (err) {
      console.error("DB LOAD ERROR:", err);
      return {
        clients: [],
        transactions: [],
        properties: [],
        masterProperties: [],
        loans: [],
        investors: [],
        kissans: [],
        referrals: [],
        docs: [],
        categories: [],
        folders: [],
        files: [],
        staff: [],
        settings: {
          companyName: 'Ashray Group',
          companyAddress: '108, Spiritual Trade Center, Mumbai, MH',
          taxId: 'TAX-12345678',
          autoSync: true,
          whatsappNumber: '919876543210',
          enableAutoSend: true,
          paymentMessageTemplate: "",
          adminId: 'admin',
          adminPassword: 'ashray123',
          registeredPhone: '9876543210'
        }
      };
    }
  }

  private async saveData(data: any) {
    try {
      await Promise.all([
        ...data.clients.map((c: any) => this.db.saveClient(c)),
        ...data.transactions.map((t: any) => this.db.saveTransaction(t)),
        ...data.properties.map((p: any) => this.db.saveProperty(p)),
        ...data.investors.map((i: any) => this.db.saveInvestor(i)),
        ...data.kissans.map((k: any) => this.db.saveKissan(k)),
        ...data.referrals.map((r: any) => this.db.saveReferral(r)),
        ...data.docs.map((d: any) => this.db.saveDoc(d)),
        ...data.folders.map((f: any) => this.db.saveFolder(f)),
        ...data.categories.map((c: any) => this.db.updateCategory(c.id, c)),
        ...data.staff.map((s: any) => this.db.saveStaff(s)),
        this.db.saveSettings(data.settings)
      ]);

      this.notify();

    } catch (err) {
      console.error("DB SAVE ERROR:", err);
    }
  }

  subscribe(listener: () => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notify() {
    this.listeners.forEach(l => l());
  }

  // --- Settings ---
  async getSettings(): Promise<AppSettings> {
    const data = await this.getData();
    return data.settings;
  }

  async saveSettings(settings: AppSettings): Promise<void> {
    const data = await this.getData();
    data.settings = settings;
    await this.saveData(data);
  }

  // --- Master Properties (Projects) ---
  async getMasterProperties(): Promise<MasterProperty[]> {
    const data = await this.getData();
    return data.masterProperties;
  }

  async getMasterPropertyById(id: string): Promise<MasterProperty | undefined> {
    const data = await this.getData();
    return data.masterProperties.find((p: MasterProperty) => p.id === id);
  }

  async saveMasterProperty(property: MasterProperty): Promise<void> {
    const data = await this.getData();
    const index = data.masterProperties.findIndex((p: MasterProperty) => p.id === property.id);
    if (index >= 0) {
      data.masterProperties[index] = property;
    } else {
      data.masterProperties.push(property);
    }
    await this.saveData(data);
  }

  // --- Clients ---
  async getClients(): Promise<Client[]> {
    const data = await this.getData();
    return data.clients;
  }

  async getClientById(id: string): Promise<Client | undefined> {
    const data = await this.getData();
    return data.clients.find((c: Client) => c.id === id);
  }

  async saveClient(client: Client): Promise<void> {
    const data = await this.getData();
    const index = data.clients.findIndex((c: Client) => c.id === client.id);
    if (index >= 0) {
      data.clients[index] = client;
    } else {
      data.clients.push(client);
    }
    await this.saveData(data);
    
    if (data.settings.autoSync) {
      this.syncNow();
    }
  }

  async deleteClient(id: string): Promise<void> {
    const data = await this.getData();
    data.clients = data.clients.filter((c: Client) => c.id !== id);
    await this.saveData(data);
    
    try {
      await fetch(`${await this.getBackendUrl()}/api/client/delete/${id}`, { method: 'DELETE' });
    } catch (e) {
      console.error("Failed to delete client from cloud:", e);
    }
  }

  // --- Kissans (Farmers) ---
  async getKissans(): Promise<Kissan[]> {
    const data = await this.getData();
    return data.kissans;
  }

  async getKissanById(id: string): Promise<Kissan | undefined> {
    const data = await this.getData();
    return data.kissans.find((k: Kissan) => k.id === id);
  }

  async saveKissan(kissan: Kissan): Promise<void> {
    const data = await this.getData();
    const index = data.kissans.findIndex((k: Kissan) => k.id === kissan.id);
    if (index >= 0) {
      data.kissans[index] = kissan;
    } else {
      data.kissans.push(kissan);
    }
    await this.saveData(data);
  }

  async deleteKissan(id: string): Promise<void> {
    const data = await this.getData();
    data.kissans = data.kissans.filter(k => k.id !== id);
    await this.saveData(data);
    this.notify();
  }

  // --- Investors ---
  async getInvestors(): Promise<Investor[]> {
  const data = await this.getData();
  return data.investors;
}

  async getInvestorById(id: string): Promise<Investor | undefined> {
    const data = await this.getData();
    return data.investors.find((i: Investor) => i.id === id);
  }

  async saveInvestor(investor: Investor): Promise<void> {
    const data = await this.getData();
    const index = data.investors.findIndex((i: Investor) => i.id === investor.id);
    if (index >= 0) {
      data.investors[index] = investor;
    } else {
      data.investors.push(investor);
    }
    await this.saveData(data);
  }

  // --- Loans ---
  async getLoans(): Promise<Loan[]> {
    const data = await this.getData();
    return data.loans;
  }

  async getLoanById(id: string): Promise<Loan | undefined> {
    const data = await this.getData();
    return data.loans.find((l: Loan) => l.id === id);
  }

  async saveLoan(loan: Loan): Promise<void> {
    const data = await this.getData();
    const index = data.loans.findIndex((l: Loan) => l.id === loan.id);
    if (index >= 0) {
      data.loans[index] = loan;
    } else {
      data.loans.push(loan);
    }
    await this.saveData(data);
  }

  async deleteLoan(id: string): Promise<void> {
    const data = await this.getData();
    data.loans = data.loans.filter((l: Loan) => l.id !== id);
    await this.saveData(data);
  }

  

  // --- Transactions ---
  async getTransactions(): Promise<Transaction[]> {
  const data = await this.getData();

  const sorted = [...data.transactions].sort((a: Transaction, b: Transaction) => {
    const dateA = new Date(a.date).getTime();
    const dateB = new Date(b.date).getTime();

    if (dateB !== dateA) {
      return dateB - dateA;
    }

    return data.transactions.indexOf(b) - data.transactions.indexOf(a);
  });

  return this.processTransactions(sorted);
}

  async saveTransaction(tx: Transaction): Promise<void> {
    const data = await this.getData();
    const index = data.transactions.findIndex((t: Transaction) => t.id === tx.id);
    
    if (index >= 0) {
      const oldTx = data.transactions[index];
      this.revertBalances(data, oldTx);
      data.transactions[index] = tx;
    } else {
      data.transactions.push(tx);
    }

    // Update Balances locally
    if (tx.clientId) {
      const clientIndex = data.clients.findIndex((c: Client) => c.id === tx.clientId);
      if (clientIndex >= 0) {
        const client = data.clients[clientIndex];
        let newBalance = client.balance;
        if (tx.type === TransactionType.CREDIT) newBalance = Accounting.add(newBalance, tx.amount);
        if (tx.type === TransactionType.DEBIT) newBalance = Accounting.subtract(newBalance, tx.amount);
        client.balance = newBalance;
        tx.balanceAfter = newBalance;

        const payment = {
          id: tx.id,
          date: tx.date,
          amount: tx.amount,
          type: tx.type === TransactionType.CREDIT ? 'Credit' : 'Debit' as any,
          description: tx.particulars,
          paymentMode: tx.method,
          reference: tx.referenceId,
          propertyId: tx.propertyId
        };
        
        if (!client.payments) client.payments = [];
        const pIndex = client.payments.findIndex(p => p.id === tx.id);
        if (pIndex >= 0) {
          client.payments[pIndex] = payment;
        } else {
          client.payments.push(payment);
        }
      }
    }

    if (tx.kissanId) {
      const kissanIndex = data.kissans.findIndex((k: Kissan) => k.id === tx.kissanId);
      if (kissanIndex >= 0) {
        let newBalance = data.kissans[kissanIndex].balance;
        if (tx.type === TransactionType.CREDIT) newBalance = Accounting.add(newBalance, tx.amount);
        if (tx.type === TransactionType.DEBIT) newBalance = Accounting.subtract(newBalance, tx.amount);
        data.kissans[kissanIndex].balance = newBalance;
      }
    }

    if (tx.investorId) {
      const investorIndex = data.investors.findIndex((i: Investor) => i.id === tx.investorId);
      if (investorIndex >= 0) {
        const investor = data.investors[investorIndex];
        if (tx.category === TransactionCategory.CAPITAL_INJECTION) {
          investor.totalInvested = Accounting.add(investor.totalInvested, tx.amount);
          investor.currentBalance = Accounting.add(investor.currentBalance, tx.amount);
        } else if (tx.category === TransactionCategory.INTEREST_ACCRUAL) {
          investor.totalInterestAccrued = Accounting.add(investor.totalInterestAccrued, tx.amount);
          investor.currentBalance = Accounting.add(investor.currentBalance, tx.amount);
        } else if (tx.category === TransactionCategory.PAYOUT) {
          investor.totalReturns = Accounting.add(investor.totalReturns, tx.amount);
          investor.currentBalance = Accounting.subtract(investor.currentBalance, tx.amount);
        }
      }
    }

    if (tx.loanId) {
      const loanIndex = data.loans.findIndex((l: Loan) => l.id === tx.loanId);
      if (loanIndex >= 0) {
        const loan = data.loans[loanIndex];
        if (tx.type === TransactionType.CREDIT) {
          loan.totalPaid = Accounting.add(loan.totalPaid, tx.amount);
          loan.remainingPrincipal = Accounting.subtract(loan.remainingPrincipal, tx.amount);
          loan.lastPaymentDate = tx.date;
        } else if (tx.type === TransactionType.DEBIT) {
          loan.remainingPrincipal = Accounting.add(loan.remainingPrincipal, tx.amount);
        }
      }
    }

    await this.saveData(data);
    
    if (data.settings.autoSync) {
      this.syncNow();
    }
  }

  async deleteTransaction(id: string): Promise<void> {
    const data = await this.getData();
    const index = data.transactions.findIndex((t: Transaction) => t.id === id);
    if (index >= 0) {
      const tx = data.transactions[index];
      this.revertBalances(data, tx);
      
      if (tx.clientId) {
        const client = data.clients.find((c: Client) => c.id === tx.clientId);
        if (client && client.payments) {
          client.payments = client.payments.filter(p => p.id !== id);
        }
      }

      data.transactions.splice(index, 1);
      await this.saveData(data);

      if (data.settings.autoSync) {
        this.syncNow();
      }

      try {
        await fetch(`${await this.getBackendUrl()}/api/transaction/delete/${id}`, { method: 'DELETE' });
      } catch (e) {
        console.error("Failed to delete transaction from cloud:", e);
      }
    }
  }

  private revertBalances(data: any, tx: Transaction) {
    if (tx.clientId) {
      const clientIndex = data.clients.findIndex((c: Client) => c.id === tx.clientId);
      if (clientIndex >= 0) {
        let newBalance = data.clients[clientIndex].balance;
        if (tx.type === TransactionType.CREDIT) newBalance = Accounting.subtract(newBalance, tx.amount);
        if (tx.type === TransactionType.DEBIT) newBalance = Accounting.add(newBalance, tx.amount);
        data.clients[clientIndex].balance = newBalance;
      }
    }

    if (tx.kissanId) {
      const kissanIndex = data.kissans.findIndex((k: Kissan) => k.id === tx.kissanId);
      if (kissanIndex >= 0) {
        let newBalance = data.kissans[kissanIndex].balance;
        if (tx.type === TransactionType.CREDIT) newBalance = Accounting.subtract(newBalance, tx.amount);
        if (tx.type === TransactionType.DEBIT) newBalance = Accounting.add(newBalance, tx.amount);
        data.kissans[kissanIndex].balance = newBalance;
      }
    }

    if (tx.investorId) {
      const investorIndex = data.investors.findIndex((i: Investor) => i.id === tx.investorId);
      if (investorIndex >= 0) {
        const investor = data.investors[investorIndex];
        if (tx.category === TransactionCategory.CAPITAL_INJECTION) {
          investor.totalInvested = Accounting.subtract(investor.totalInvested, tx.amount);
          investor.currentBalance = Accounting.subtract(investor.currentBalance, tx.amount);
        } else if (tx.category === TransactionCategory.INTEREST_ACCRUAL) {
          investor.totalInterestAccrued = Accounting.subtract(investor.totalInterestAccrued, tx.amount);
          investor.currentBalance = Accounting.subtract(investor.currentBalance, tx.amount);
        } else if (tx.category === TransactionCategory.PAYOUT) {
          investor.totalReturns = Accounting.subtract(investor.totalReturns, tx.amount);
          investor.currentBalance = Accounting.add(investor.currentBalance, tx.amount);
        }
      }
    }

    if (tx.loanId) {
      const loanIndex = data.loans.findIndex((l: Loan) => l.id === tx.loanId);
      if (loanIndex >= 0) {
        const loan = data.loans[loanIndex];
        if (tx.type === TransactionType.CREDIT) {
          loan.totalPaid = Accounting.subtract(loan.totalPaid, tx.amount);
          loan.remainingPrincipal = Accounting.add(loan.remainingPrincipal, tx.amount);
        } else if (tx.type === TransactionType.DEBIT) {
          loan.remainingPrincipal = Accounting.subtract(loan.remainingPrincipal, tx.amount);
        }
      }
    }
  }

  processTransactions(txs: Transaction[]): Transaction[] {
  let runningBalance = 0;

  return txs.map(tx => {
    if (tx.type === TransactionType.CREDIT) {
      runningBalance = Accounting.add(runningBalance, tx.amount);
    } else {
      runningBalance = Accounting.subtract(runningBalance, tx.amount);
    }

    return {
      ...tx,
      balanceAfter: runningBalance
    };
  });
}

  // --- Properties (Projects) ---
  async getProperties(): Promise<Property[]> {
    const data = await this.getData();
    return data.properties;
  }

  async getPropertyById(id: string): Promise<Property | undefined> {
    const data = await this.getData();
    return data.properties.find((p: Property) => p.id === id);
  }

  async saveProperty(property: Property): Promise<void> {
    const data = await this.getData();
    const index = data.properties.findIndex((p: Property) => p.id === property.id);
    if (index >= 0) {
      data.properties[index] = property;
    } else {
      data.properties.push(property);
    }
    await this.saveData(data);
    
    if (data.settings.autoSync) {
      this.syncNow();
    }
  }

  async deleteProperty(id: string): Promise<void> {
    const data = await this.getData();
    data.properties = data.properties.filter((p: Property) => p.id !== id);
    await this.saveData(data);
    
    try {
      await fetch(`${await this.getBackendUrl()}/api/property/delete/${id}`, { method: 'DELETE' });
    } catch (e) {
      console.error("Failed to delete property from cloud:", e);
    }
  }

  async updateProperty(id: string, updates: Partial<Property>): Promise<void> {
    const data = await this.getData();
    const index = data.properties.findIndex((p: Property) => p.id === id);
    if (index >= 0) {
      data.properties[index] = { ...data.properties[index], ...updates };
      await this.saveData(data);
      
      if (data.settings.autoSync) {
        this.syncNow();
      }
    }
  }

  async assignPlotToClient(
  propertyId: string,
  plotId: string,
  clientId: string,
  clientData: {
    title?: string;
    name: string;
    phone: string;
    amount?: number;
    status: PropertyStatus
  }
): Promise<void> {
    const data = await this.getData();
    const propertyIndex = data.properties.findIndex((p: Property) => p.id === propertyId);
    if (propertyIndex >= 0) {
      const property = data.properties[propertyIndex];
      if (property.inventory) {
        const plotIndex = property.inventory.findIndex((p: any) => p.id === plotId);
        if (plotIndex >= 0) {
          const plot = property.inventory[plotIndex];
          const saleAmount = clientData.amount || plot.price || property.price;
          
          property.inventory[plotIndex] = {
            ...plot,
            status: clientData.status,
            buyerName: clientData.name,
            buyerPhone: clientData.phone,
            price: saleAmount
          };
          
          let client = data.clients.find((c: Client) => c.id === clientId);
          if (!client) {
            client = {
              id: `c_${Date.now()}`,
              title: { en: clientData.title || '', hi: clientData.title || '', mr: clientData.title || '' },
              name: { en: clientData.name, hi: clientData.name, mr: clientData.name },
              phone: clientData.phone,
              email: '',
              address: { en: '', hi: '', mr: '' },
              balance: 0,
              propertyCount: 0,
              openingBalance: 0,
              totalContractValue: 0
            };
            data.clients.push(client);
          }
          
          const existingInv = client.investments?.find((inv: any) => inv.propertyId === property.id && inv.plotId === plot.id);
          
          if (!existingInv) {
            client.propertyCount = (client.propertyCount || 0) + 1;
            client.totalContractValue = (client.totalContractValue || 0) + saleAmount;
            
            if (!client.investments) client.investments = [];
            client.investments.push({
              propertyId: property.id,
              plotId: plot.id,
              amount: saleAmount,
              purchaseDate: new Date().toISOString().split('T')[0]
            });

            const purchaseTx: Transaction = {
              id: `PUR-${plotId}-${Date.now()}`,
              date: new Date().toISOString().split('T')[0],
              particulars: `Property Purchase: ${property.title} - Plot ${plot.plotNumber}`,
              amount: saleAmount,
              type: TransactionType.DEBIT,
              category: TransactionCategory.GENERAL,
              method: PaymentMethod.JOURNAL,
              referenceId: `PUR-${plot.plotNumber}-${Date.now().toString().slice(-4)}`,
              clientId: client.id,
              propertyId: property.id,
              balanceAfter: 0,
              synced: false
            };
            
            await this.saveData(data);
            await this.saveTransaction(purchaseTx);
          } else {
            await this.saveData(data);
          }
          
          if (data.settings.autoSync) {
            this.syncNow();
          }
        }
      }
    }
  }

  async syncNow(): Promise<boolean> {
    if (this.isSyncing) {
      console.log("⏳ Sync already running...");
      return false;
    }

    this.isSyncing = true;
    console.log("🔥 syncNow() STARTED");

    try {
      await this.rebuildClientPayments();

      const data = await this.getData();
      const localProps = data.properties;
      const localClients = data.clients.map(c => ({
        ...c,
        username: c.username || c.phone,
        password: c.password || process.env.ADMIN_PASSWORD || 'ashray123'
      }));
      const localTransactions = data.transactions;
      const localReferrals = data.referrals;
      const processedDocs = data.docs
        .filter((d: any) => d.category !== 'REPORT' && d.type !== 'virtual')
        .map(({ data: _data, ...rest }: any) => rest);

      // Chunked doc push (2 per batch to avoid SSL SYSCALL errors from oversized payloads)
      const pushDocsChunked = async () => {
        if (processedDocs.length === 0) return { name: 'Docs', ok: true, json: async () => [] };
        const chunkSize = 2;
        for (let i = 0; i < processedDocs.length; i += chunkSize) {
          const chunk = processedDocs.slice(i, i + chunkSize);
          try {
            const r = await fetch(`${await this.getBackendUrl()}/api/doc/bulk-upsert`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(chunk),
            });
            if (!r.ok) return { name: 'Docs', ok: false, json: async () => [] };
          } catch (e: any) {
            return { name: 'Docs', ok: false, json: async () => [] };
          }
        }
        return { name: 'Docs', ok: true, json: async () => [] };
      };
      const docsResultPromise = pushDocsChunked();

      const pushResults = await Promise.allSettled([
        fetch(`${await this.getBackendUrl()}/api/property/bulk-upsert`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(localProps),
        }).then(async r => ({ name: 'Properties', ok: r.ok, status: r.status, body: !r.ok ? await r.text() : null })),
        fetch(`${await this.getBackendUrl()}/api/client/bulk-upsert`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(localClients),
        }).then(async r => ({ name: 'Clients', ok: r.ok, status: r.status, body: !r.ok ? await r.text() : null })),
        fetch(`${await this.getBackendUrl()}/api/transaction/bulk-upsert`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(localTransactions),
        }).then(async r => ({ name: 'Transactions', ok: r.ok, status: r.status, body: !r.ok ? await r.text() : null })),
        fetch(`${await this.getBackendUrl()}/api/referral/bulk-upsert`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(localReferrals),
        }).then(async r => ({ name: 'Referrals', ok: r.ok, status: r.status, body: !r.ok ? await r.text() : null })),
        docsResultPromise,
        fetch(`${await this.getBackendUrl()}/api/staff/bulk-upsert`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data.staff),
        }).then(async r => ({ name: 'Staff', ok: r.ok, status: r.status, body: !r.ok ? await r.text() : null }))
      ]);

      const [
       cloudPropsRes,
       cloudClientsRes,
       cloudTransactionsRes,
       cloudReferralsRes,
       cloudDocsRes,
       cloudStaffRes
         ] = pushResults.map((r: any) =>
         r.status === 'fulfilled' ? r.value : { ok: false }
       );


      if (cloudPropsRes.ok && cloudClientsRes.ok && cloudTransactionsRes.ok && cloudReferralsRes.ok && cloudDocsRes.ok && cloudStaffRes.ok) {
        const cloudProps = await cloudPropsRes.json();
        const cloudClients = await cloudClientsRes.json();
        const cloudTransactions = await cloudTransactionsRes.json();
        const cloudReferrals = await cloudReferralsRes.json();
        const cloudDocs = await cloudDocsRes.json();
        const cloudStaff = await cloudStaffRes.json();
        
        const currentData = await this.getData();
        
        cloudProps.forEach((cp: any) => {
          const index = currentData.properties.findIndex((p: any) => p.id === cp.id);
          if (index >= 0) {
            currentData.properties[index] = { ...currentData.properties[index], ...cp };
          } else {
            currentData.properties.push(cp);
          }
        });

        cloudClients.forEach((cc: any) => {
          const index = currentData.clients.findIndex((c: any) => c.id === cc.id);
          if (index >= 0) {
            currentData.clients[index] = { ...currentData.clients[index], ...cc };
          } else {
            currentData.clients.push(cc);
          }
        });

        cloudTransactions.forEach((ct: any) => {
          const index = currentData.transactions.findIndex((t: any) => t.id === ct.id);
          if (index >= 0) {
            currentData.transactions[index] = { ...currentData.transactions[index], ...ct };
          } else {
            currentData.transactions.push(ct);
          }
        });

        cloudReferrals.forEach((cr: any) => {
          const index = currentData.referrals.findIndex((r: any) => r.id === cr.id);
          if (index >= 0) {
            currentData.referrals[index] = { ...currentData.referrals[index], ...cr };
          } else {
            currentData.referrals.push(cr);
          }
        });

        cloudDocs.forEach((cd: any) => {
          const index = currentData.docs.findIndex((d: any) => d.id === cd.id);
          if (index >= 0) {
            currentData.docs[index] = {
              ...currentData.docs[index],
              ...cd,
              fileData: (
                currentData.docs[index].fileData &&
                currentData.docs[index].fileData.startsWith('data:')
              )
                ? currentData.docs[index].fileData
                : cd.fileData
            };
          } else {
            currentData.docs.push(cd);
          }
        });

        cloudStaff.forEach((cs: any) => {
          const index = currentData.staff.findIndex((s: any) => s.id === cs.id);
          if (index >= 0) {
            currentData.staff[index] = { ...currentData.staff[index], ...cs };
          } else {
            currentData.staff.push(cs);
          }
        });

        await this.saveData(currentData);
        await this.rebuildClientPayments();
      }

      return true;
    } catch (err) {
      console.error("❌ GLOBAL SYNC ERROR:", err);
      return false;
    } finally {
      this.isSyncing = false;
    }
  }

// ================= REFERRAL SYSTEM =================

async getReferrals(): Promise<Referral[]> {
  const data = await this.getData();
  return data.referrals;
}

async saveReferral(referral: Referral): Promise<void> {
  const data = await this.getData();

  const index = data.referrals.findIndex((r: Referral) => r.id === referral.id);

  if (index >= 0) {
    data.referrals[index] = referral;
  } else {
    data.referrals.push(referral);
  }

  await this.saveData(data);

  if (data.settings?.autoSync) {
    await this.syncNow();
  }
}

async deleteReferral(id: string): Promise<void> {
  const data = await this.getData();

  data.referrals = data.referrals.filter((r: Referral) => r.id !== id);

  await this.saveData(data);

  if (data.settings?.autoSync) {
    await this.syncNow();
  }

  try {
    const backendUrl = await this.getBackendUrl();

    await fetch(`${backendUrl}/api/referral/delete/${id}`, {
      method: 'DELETE'
    });
  } catch (e) {
    console.error("Failed to delete referral from cloud:", e);
  }
}


// ================= DOCUMENT MANAGER =================

async getDocs(): Promise<Doc[]> {
  const data = await this.getData();
  return data.docs;
}

async saveDoc(docData: Doc): Promise<void> {
  const data = await this.getData();

  const index = data.docs.findIndex((d: Doc) => d.id === docData.id);

  if (index >= 0) {
    data.docs[index] = docData;
  } else {
    data.docs.push(docData);
  }

  await this.saveData(data);

  if (data.settings?.autoSync) {
    await this.syncNow();
  }
}

async deleteDoc(id: string): Promise<void> {
  const data = await this.getData();

  data.docs = data.docs.filter((d: Doc) => d.id !== id);

  await this.saveData(data);

  if (data.settings?.autoSync) {
    await this.syncNow();
  }

  try {
    const backendUrl = await this.getBackendUrl();

    await fetch(`${backendUrl}/api/doc/delete/${id}`, {
      method: 'DELETE'
    });
  } catch (e) {
    console.error("Failed to delete doc from cloud:", e);
  }
}

  // ================= FOLDERS =================

async getFolders(): Promise<Folder[]> {
  const data = await this.getData();
  return data.folders;
}

async saveFolder(folder: Folder): Promise<void> {
  const data = await this.getData();

  const index = data.folders.findIndex((f: Folder) => f.id === folder.id);

  if (index >= 0) {
    data.folders[index] = folder;
  } else {
    data.folders.push(folder);
  }

  await this.saveData(data);
}

async deleteFolder(id: number): Promise<void> {
  const data = await this.getData();

  data.folders = data.folders.filter((f: Folder) => f.id !== id);

  await this.saveData(data);
}


// ================= CATEGORIES =================

async getCategories(): Promise<Category[]> {
  const data = await this.getData();
  return data.categories;
}

async addCategory(name: string, color: string, icon: string): Promise<Category> {
  const data = await this.getData();

  const newCategory: Category = {
    id: Date.now(),
    name,
    color,
    icon,
    created_at: new Date().toISOString()
  };

  data.categories.push(newCategory);

  await this.saveData(data);

  return newCategory;
}

async updateCategory(id: number, updates: Partial<Category>): Promise<void> {
  const data = await this.getData();

  const index = data.categories.findIndex((c: Category) => c.id === id);

  if (index >= 0) {
    data.categories[index] = {
      ...data.categories[index],
      ...updates
    };

    await this.saveData(data);
  }
}

async deleteCategory(id: number): Promise<void> {
  const data = await this.getData();

  data.categories = data.categories.filter((c: Category) => c.id !== id);

  await this.saveData(data);
}


// ================= STORAGE =================

async getStorage(): Promise<number> {
  const data = await this.getData();

  return (data.files || []).reduce(
    (acc: number, file: any) => acc + (file.size || 0),
    0
  );
}


// ================= DOCUMENT URL =================

public async getDocumentUrl(doc: Doc): Promise<string> {
  if (doc.fileData && doc.fileData.startsWith('data:')) {
    return doc.fileData;
  }

  if (doc.fileData) {
    const backendUrl = await this.getBackendUrl();
    return `${backendUrl}/uploads/${encodeURIComponent(doc.fileData)}`;
  }

  return '';
}


// ================= SYNC WRAPPER =================

async syncToWebsite(): Promise<{ success: boolean; message: string; error?: string }> {
  const success = await this.syncNow();

  return success
    ? { success: true, message: 'Successfully synced all data to the website portal.' }
    : { success: false, message: 'Failed to sync data. Please check your connection.' };
}


// ================= REBUILD PAYMENTS =================

async rebuildClientPayments(): Promise<void> {
  const data = await this.getData();

  const transactions = data.transactions;
  const clients = data.clients;

  for (const client of clients) {
    client.payments = [];

    const clientTxs = transactions.filter(
      (tx: Transaction) => tx.clientId === client.id
    );

    for (const tx of clientTxs) {
      client.payments.push({
        id: tx.id,
        date: tx.date,
        amount: tx.amount,
        type: tx.type === TransactionType.CREDIT ? 'Credit' : 'Debit' as any,
        description: tx.particulars,
        paymentMode: tx.method,
        reference: tx.referenceId,
        propertyId: tx.propertyId
      });
    }
  }

  await this.saveData(data);
}


// ================= CLEAR LOCAL =================

async clearLocalData(): Promise<void> {
  try {
    await this.db.clearLocalData();
    localStorage.removeItem(this.storageKey);
    this.notify();
  } catch (e) {
    console.error("Clear local error:", e);
  }
}
}
