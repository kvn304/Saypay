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
  date: supabaseExpense.created_at.split('T')[0], // Extract date part
  createdAt: supabaseExpense.created_at,
});

export const useExpenses = () => {
  const { user } = useAuth();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load expenses from Supabase
  const loadExpenses = useCallback(async () => {
    if (!user) {
      setExpenses([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('expenses')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      const convertedExpenses = (data || []).map(convertToAppExpense);
      setExpenses(convertedExpenses);
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

      if (insertError) throw insertError;

      const newExpense = convertToAppExpense(data);
      setExpenses(prev => [newExpense, ...prev]);
      return newExpense;
    } catch (err) {
      console.error('Error adding expense:', err);
      throw err;
    }
  }, [user]);

  // Update expense
  const updateExpense = useCallback(async (id: string, updates: Partial<Expense>) => {
    if (!user) throw new Error('User not authenticated');

    try {
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

      if (updateError) throw updateError;

      const updatedExpense = convertToAppExpense(data);
      setExpenses(prev => prev.map(exp => exp.id === id ? updatedExpense : exp));
      return updatedExpense;
    } catch (err) {
      console.error('Error updating expense:', err);
      throw err;
    }
  }, [user]);

  // Delete expense
  const deleteExpense = useCallback(async (id: string) => {
    if (!user) throw new Error('User not authenticated');

    try {
      const { error: deleteError } = await supabase
        .from('expenses')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (deleteError) throw deleteError;

      setExpenses(prev => prev.filter(exp => exp.id !== id));
    } catch (err) {
      console.error('Error deleting expense:', err);
      throw err;
    }
  }, [user]);

  // Clear all expenses
  const clearAllExpenses = useCallback(async () => {
    if (!user) throw new Error('User not authenticated');

    try {
      const { error: deleteError } = await supabase
        .from('expenses')
        .delete()
        .eq('user_id', user.id);

      if (deleteError) throw deleteError;

      setExpenses([]);
    } catch (err) {
      console.error('Error clearing expenses:', err);
      throw err;
    }
  }, [user]);

  // Load expenses when user changes
  useEffect(() => {
    loadExpenses();
  }, [loadExpenses]);

  // Set up real-time subscription
  useEffect(() => {
    if (!user) return;

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