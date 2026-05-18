/// <reference types="vite/client" />

declare module "*.png" {
  const value: string;
  export default value;
}

declare module "*.jpg" {
  const value: string;
  export default value;
}

declare module "*.jpeg" {
  const value: string;
  export default value;
}

declare module "*.svg" {
  const value: string;
  export default value;
}

declare global {
  interface Window {
    __AUTO_NAV__?: boolean;
    api: {
      getSettings(): Promise<any>;
      saveSettings(settings: any): Promise<any>;
      getMasterProperties(): Promise<any[]>;
      getMasterPropertyById(id: string): Promise<any>;
      saveMasterProperty(property: any): Promise<any>;
      getClients(): Promise<any[]>;
      getClientById(id: string): Promise<any>;
      getTodayClientCount(dateStr: string): Promise<number>;
      saveClient(client: any): Promise<any>;
      deleteClient(id: string): Promise<any>;
      getKissans(): Promise<any[]>;
      getKissanById(id: string): Promise<any>;
      saveKissan(kissan: any): Promise<any>;
      deleteKissan(id: string): Promise<any>;
      getInvestors(): Promise<any[]>;
      getInvestorById(id: string): Promise<any>;
      saveInvestor(investor: any): Promise<any>;
      getLoans(): Promise<any[]>;
      getLoanById(id: string): Promise<any>;
      saveLoan(loan: any): Promise<any>;
      deleteLoan(id: string): Promise<any>;
      getTransactions(): Promise<any[]>;
      saveTransaction(tx: any): Promise<any>;
      deleteTransaction(id: string): Promise<any>;
      getProperties(): Promise<any[]>;
      getPropertyById(id: string): Promise<any>;
      saveProperty(property: any): Promise<any>;
      deleteProperty(id: string): Promise<any>;
      updateProperty(id: string, updates: any): Promise<any>;
      assignPlotToClient(propertyId: string, plotId: string, clientId: string, clientData: any): Promise<any>;
      getReferrals(): Promise<any[]>;
      saveReferral(referral: any): Promise<any>;
      deleteReferral(id: string): Promise<any>;
      getBanks(): Promise<any[]>;
      getBankById(id: string): Promise<any>;
      saveBank(bank: any): Promise<any>;
      deleteBank(id: string): Promise<any>;
      getStaff(): Promise<any[]>;
      getStaffById(id: string): Promise<any>;
      saveStaff(staff: any): Promise<any>;
      deleteStaff(id: string): Promise<any>;
      getDocs(): Promise<any[]>;
      getDocuments(query: any): Promise<any[]>;
      saveDocument(doc: any): Promise<any>;
      saveDoc(docData: any): Promise<any>;
      deleteDoc(id: string): Promise<any>;
      generateId(prefix: string, date?: string): Promise<string>;
      peekId(prefix: string, date?: string): Promise<string>;
      deleteDocument(id: string, permanent?: boolean): Promise<any>;
      emptyTrash(): Promise<any>;
      getFolders(showDeleted?: boolean): Promise<any[]>;
      saveFolder(folder: any): Promise<any>;
      deleteFolder(id: string, permanent?: boolean): Promise<any>;
      getCategories(): Promise<any[]>;
      addCategory(name: string, color: string, icon: string): Promise<any>;
      updateCategory(id: number, updates: any): Promise<any>;
      deleteCategory(id: number): Promise<any>;
      getDeletedCategories(): Promise<any[]>;
      restoreCategory(id: number): Promise<any>;
      permanentlyDeleteCategory(id: number): Promise<any>;
      syncToWebsite(): Promise<any>;
      rebuildClientPayments(): Promise<any>;
      clearLocalData(): Promise<any>;
      exportData(): Promise<any>;
      resetLedger(): Promise<any>;
      getStorage(): Promise<any>;
      openDocument(name: string, base64: string, type: string): Promise<any>;
      getDocumentUrl(doc: any): Promise<any>;
      saveFileToDisk(name: string, buffer: any): Promise<any>;
      getPrinters(): Promise<any[]>;
      print(options: any): Promise<{ success: boolean; error?: string }>;
      savePDF(options: any): Promise<{ success: boolean; error?: string; filePath?: string }>;
      subscribe(listener: (event: any, ...args: any[]) => void): () => void;
      getGstEntries(): Promise<any[]>;
      saveGstEntry(entry: any): Promise<any>;
      deleteGstEntry(id: string): Promise<any>;
      updateGstEntry(id: string, updates: any): Promise<any>;
      getPropertyMarketUpdates(propertyId?: string): Promise<any[]>;
      savePropertyMarketUpdate(update: any): Promise<any>;
      deletePropertyMarketUpdate(id: string): Promise<any>;
    };
  }
}

export {};
