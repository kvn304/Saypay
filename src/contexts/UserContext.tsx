import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { supabase } from '../config/supabase';

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

interface UserContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  updateUserProfile: (updates: { name?: string; avatar?: string }) => Promise<void>;
  loading: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user: authUser } = useAuth();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (authUser) {
      loadUserProfile();
    } else {
      setUser(null);
    }
  }, [authUser]);

  const loadUserProfile = async () => {
    if (!authUser) return;

    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .limit(1);

      if (error || !data || data.length === 0) {
        if (error) {
          console.error('Error loading user profile:', error);
        } else {
          console.log('No profile found for user, using fallback data');
        }
        // Fallback to auth user data
        setUser({
          id: authUser.id,
          name: authUser.user_metadata?.full_name || authUser.email?.split('@')[0] || 'User',
          email: authUser.email || '',
          avatar: authUser.user_metadata?.avatar_url || `https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2`
        });
      } else {
        const profile = data[0];
        setUser({
          id: profile.id,
          name: profile.full_name || profile.email.split('@')[0],
          email: profile.email,
          avatar: profile.avatar_url || `https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2`
        });
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
      // Fallback to auth user data
      if (authUser) {
        setUser({
          id: authUser.id,
          name: authUser.user_metadata?.full_name || authUser.email?.split('@')[0] || 'User',
          email: authUser.email || '',
          avatar: authUser.user_metadata?.avatar_url || `https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2`
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const updateUserProfile = async (updates: { name?: string; avatar?: string }) => {
    if (!authUser || !user) return;

    try {
      setLoading(true);
      
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: updates.name,
          avatar_url: updates.avatar,
          updated_at: new Date().toISOString(),
        })
        .eq('id', authUser.id);

      if (error) throw error;

      // Update local user state
      setUser(prev => prev ? {
        ...prev,
        name: updates.name || prev.name,
        avatar: updates.avatar || prev.avatar,
      } : null);
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return (
    <UserContext.Provider value={{ user, setUser, updateUserProfile, loading }}>
      {children}
    </UserContext.Provider>
  );
};