export interface Expense {
  id: string;
  amount: number;
  description: string;
  category: string;
  date: string;
  createdAt: string;
}

interface ExpenseCategory {
  name: string;
  color: string;
  icon: string;
}

export const EXPENSE_CATEGORIES: ExpenseCategory[] = [
  { name: 'Food', color: '#F97316', icon: '🍽️' },
  { name: 'Transport', color: '#3B82F6', icon: '🚗' },
  { name: 'Rent', color: '#8B5CF6', icon: '🏠' },
  { name: 'Shopping', color: '#EC4899', icon: '🛍️' },
  { name: 'Health', color: '#EF4444', icon: '🏥' },
  { name: 'Entertainment', color: '#F59E0B', icon: '🎬' },
  { name: 'Utilities', color: '#10B981', icon: '💡' },
  { name: 'Misc', color: '#6B7280', icon: '📦' },
];