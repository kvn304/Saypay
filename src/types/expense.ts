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
  { name: 'Food', color: 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400', icon: '🍽️' },
  { name: 'Transport', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400', icon: '🚗' },
  { name: 'Rent', color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400', icon: '🏠' },
  { name: 'Shopping', color: 'bg-pink-100 text-pink-800 dark:bg-pink-900/20 dark:text-pink-400', icon: '🛍️' },
  { name: 'Healthcare', color: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400', icon: '🏥' },
  { name: 'Entertainment', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400', icon: '🎬' },
  { name: 'Utilities', color: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400', icon: '💡' },
  { name: 'Misc', color: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200', icon: '📦' },
];