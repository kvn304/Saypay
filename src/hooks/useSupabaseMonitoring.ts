import { useState, useEffect } from 'react';
import { supabase } from '../config/supabase';
import { useAuth } from '../contexts/AuthContext';

interface DatabaseStats {
  userExpenseCount: number;
  totalExpenses: number;
  totalProfiles: number;
  estimatedSize: string;
  storageWarning: boolean;
}

export const useSupabaseMonitoring = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DatabaseStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDatabaseStats = async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      setError(null);

      // Get user's expense count
      const { count: userExpenseCount, error: userError } = await supabase
        .from('expenses')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      if (userError) throw userError;

      // Get total expenses count
      const { count: totalExpenses, error: totalError } = await supabase
        .from('expenses')
        .select('*', { count: 'exact', head: true });

      if (totalError) throw totalError;

      // Get total profiles count
      const { count: totalProfiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      if (profilesError) throw profilesError;

      // Estimate storage size (rough calculation)
      const avgExpenseSize = 200; // bytes per expense record
      const estimatedBytes = (totalExpenses || 0) * avgExpenseSize;
      const estimatedSize = formatBytes(estimatedBytes);

      // Check if approaching free tier limits (500MB)
      const FREE_TIER_LIMIT = 500 * 1024 * 1024; // 500MB in bytes
      const storageWarning = estimatedBytes > FREE_TIER_LIMIT * 0.8; // 80% warning

      setStats({
        userExpenseCount: userExpenseCount || 0,
        totalExpenses: totalExpenses || 0,
        totalProfiles: totalProfiles || 0,
        estimatedSize,
        storageWarning
      });

    } catch (err) {
      console.error('Error fetching database stats:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch stats');
    } finally {
      setIsLoading(false);
    }
  };

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  useEffect(() => {
    fetchDatabaseStats();
  }, [user]);

  return {
    stats,
    isLoading,
    error,
    refreshStats: fetchDatabaseStats
  };
};