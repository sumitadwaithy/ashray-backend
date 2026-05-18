
import { GSTEntry } from '../types';
import { dbService } from './db';

class GSTDatabaseService {
  async getEntries(): Promise<GSTEntry[]> {
    return dbService.getGstEntries();
  }

  async addEntry(entry: GSTEntry): Promise<void> {
    return dbService.saveGstEntry(entry);
  }

  async deleteEntry(id: string): Promise<void> {
    return dbService.deleteGstEntry(id);
  }

  async updateEntry(entry: GSTEntry): Promise<void> {
    return dbService.updateGstEntry(entry);
  }
}

export const gstDbService = new GSTDatabaseService();
