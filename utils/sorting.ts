import { Transaction } from '../types';

export type SortOrder = 'newest' | 'oldest';

export function sortTransactions(transactions: Transaction[], order: SortOrder): Transaction[] {
  if (!transactions) return [];
  const sorted = [...transactions];
  sorted.sort((a, b) => {
    const dateA = new Date(a.date).getTime();
    const dateB = new Date(b.date).getTime();
    return order === 'newest' ? dateB - dateA : dateA - dateB;
  });
  return sorted;
}