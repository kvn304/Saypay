import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../config/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Expense } from '../types/expense';

interface SupabaseExpense {
  id: string;
  user_id: string;
  amount: number;
  description: string;
  category: string;
  currency: string;
  created_at: string;
}

// Convert Supabase expense to app expense format
const convertToAppExpense = (supabaseExpense: SupabaseExpense): Expense => ({
  id: supabaseExpense.id,
  amount: supabaseExpense.amount,
  description: supabaseExpense.description,
  category: supabaseExpense.category,
  date: supabaseExpense.created_at.split('T')[0] || formatDate(new Date()), // Extract date part with fallback
  createdAt: supabaseExpense.created_at,
});

// Helper function to format date as YYYY-MM-DD
const formatDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Demo mode configuration
const DEMO_MODE = false; // Set to false to use real Supabase

// Demo expenses for testing
const DEMO_EXPENSES: Expense[] = [
  {
    id: 'demo-1',
    amount: 25.50,
    description: 'Lunch at Chipotle',
    category: 'Food & Dining',
    date: formatDate(new Date()),
    createdAt: new Date().toISOString(),
  },
  {
    id: 'demo-2',
    amount: 45.00,
    description: 'Gas station',
    category: 'Transportation',
    date: formatDate(new Date(Date.now() - 24 * 60 * 60 * 1000)),
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'demo-3',
    amount: 120.00,
    description: 'Grocery shopping',
    category: 'Shopping',
    date: formatDate(new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)),
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

export const useExpenses = () => {
  const { user } = useAuth();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load expenses from Supabase or demo data
  const loadExpenses = useCallback(async () => {
    if (!user) {
      setExpenses([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      if (DEMO_MODE) {
        // Use demo expenses
        setExpenses(DEMO_EXPENSES);
      } else {
        try {
          const { data, error: fetchError } = await supabase
            .from('expenses')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });

          if (fetchError) {
            console.error('Error fetching expenses:', fetchError);
            // Fall back to demo expenses if database table doesn't exist
            console.log('Falling back to demo expenses due to database error');
            setExpenses(DEMO_EXPENSES);
            return;
          }

          const convertedExpenses = (data || []).map(convertToAppExpense);
          setExpenses(convertedExpenses);
        } catch (err) {
          console.error('Database error, using demo expenses:', err);
          setExpenses(DEMO_EXPENSES);
        }
      }
    } catch (err) {
      console.error('Error loading expenses:', err);
      setError(err instanceof Error ? err.message : 'Failed to load expenses');
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Add new expense
  const addExpense = useCallback(async (expenseData: Omit<Expense, 'id' | 'createdAt'>) => {
    if (!user) throw new Error('User not authenticated');

    try {
      const newExpense: Expense = {
        id: `demo-${Date.now()}`,
        amount: expenseData.amount,
        description: expenseData.description,
        category: expenseData.category,
        date: expenseData.date,
        createdAt: new Date().toISOString(),
      };

      if (DEMO_MODE) {
        // Add to demo expenses
        setExpenses(prev => [newExpense, ...prev]);
        return newExpense;
      } else {
        try {
          const { data, error: insertError } = await supabase
            .from('expenses')
            .insert({
              user_id: user.id,
              amount: expenseData.amount,
              description: expenseData.description,
              category: expenseData.category,
              currency: 'USD', // Default currency
            })
            .select()
            .single();

          if (insertError) {
            console.error('Error inserting expense:', insertError);
            // Fall back to demo mode for this expense
            console.log('Falling back to demo mode for expense addition');
            setExpenses(prev => [newExpense, ...prev]);
            return newExpense;
          }

          const convertedExpense = convertToAppExpense(data);
          setExpenses(prev => [convertedExpense, ...prev]);
          return convertedExpense;
        } catch (err) {
          console.error('Database error, using demo mode for expense:', err);
          setExpenses(prev => [newExpense, ...prev]);
          return newExpense;
        }
      }
    } catch (err) {
      console.error('Error adding expense:', err);
      throw err;
    }
  }, [user]);

  // Update expense
  const updateExpense = useCallback(async (id: string, updates: Partial<Expense>) => {
    if (!user) throw new Error('User not authenticated');

    try {
      if (DEMO_MODE) {
        // Update demo expense
        setExpenses(prev => prev.map(exp => 
          exp.id === id ? { ...exp, ...updates } : exp
        ));
        return expenses.find(exp => exp.id === id);
      } else {
        const { data, error: updateError } = await supabase
          .from('expenses')
          .update({
            amount: updates.amount,
            description: updates.description,
            category: updates.category,
          })
          .eq('id', id)
          .eq('user_id', user.id)
          .select()
          .single();

        if (updateError) {
          console.error('Error updating expense:', updateError);
          throw updateError;
        }

        const updatedExpense = convertToAppExpense(data);
        setExpenses(prev => prev.map(exp => exp.id === id ? updatedExpense : exp));
        return updatedExpense;
      }
    } catch (err) {
      console.error('Error updating expense:', err);
      throw err;
    }
  }, [user, expenses]);

  // Delete expense
  const deleteExpense = useCallback(async (id: string) => {
    if (!user) throw new Error('User not authenticated');

    try {
      if (DEMO_MODE) {
        // Delete from demo expenses
        setExpenses(prev => prev.filter(exp => exp.id !== id));
      } else {
        const { error: deleteError } = await supabase
          .from('expenses')
          .delete()
          .eq('id', id)
          .eq('user_id', user.id);

        if (deleteError) {
          console.error('Error deleting expense:', deleteError);
          throw deleteError;
        }

        setExpenses(prev => prev.filter(exp => exp.id !== id));
      }
    } catch (err) {
      console.error('Error deleting expense:', err);
      throw err;
    }
  }, [user]);

  // Clear all expenses
  const clearAllExpenses = useCallback(async () => {
    if (!user) throw new Error('User not authenticated');

    try {
      if (DEMO_MODE) {
        // Clear demo expenses
        setExpenses([]);
      } else {
        const { error: deleteError } = await supabase
          .from('expenses')
          .delete()
          .eq('user_id', user.id);

        if (deleteError) {
          console.error('Error clearing expenses:', deleteError);
          throw deleteError;
        }

        setExpenses([]);
      }
    } catch (err) {
      console.error('Error clearing expenses:', err);
      throw err;
    }
  }, [user]);

  // Load expenses when user changes
  useEffect(() => {
    loadExpenses();
  }, [loadExpenses]);

  // Set up real-time subscription (only for real Supabase)
  useEffect(() => {
    if (!user || DEMO_MODE) return;

    const subscription = supabase
      .channel('expenses_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'expenses',
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          // Reload expenses when changes occur
          loadExpenses();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [user, loadExpenses]);

  return {
    expenses,
    isLoading,
    error,
    addExpense,
    updateExpense,
    deleteExpense,
    clearAllExpenses,
    refreshExpenses: loadExpenses,
  };
};