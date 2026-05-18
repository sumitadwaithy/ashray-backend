import { Property } from "../types";

const KEY = "ledger_properties";

export const propertyDB = {

  async getAll(): Promise<Property[]> {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : [];
  },

  async save(property: Property) {

    const list = await this.getAll();

    list.push(property);

    localStorage.setItem(KEY, JSON.stringify(list));

  },

  async update(id: string, updates: Partial<Property>) {

    const list = await this.getAll();

    const updated = list.map(p =>
      p.id === id ? { ...p, ...updates } : p
    );

    localStorage.setItem(KEY, JSON.stringify(updated));

  }

};