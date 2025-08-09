import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session, AuthError } from '@supabase/supabase-js';
import { supabase, demoAuth } from '../config/supabase';

// Demo mode configuration
const DEMO_MODE = false; // Set to false to use real Supabase

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: AuthError | null; needsVerification?: boolean | undefined }>;
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signOut: () => Promise<{ error: AuthError | null }>;
  updateProfile: (updates: { name?: string; avatar?: string }) => Promise<{ error: AuthError | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing session
    const checkSession = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (error) {
          console.error('Session check error:', error);
        } else if (data.session) {
          setSession(data.session);
          setUser(data.session.user);
        }
      } catch (error) {
        console.error('Session check failed:', error);
      } finally {
        setLoading(false);
      }
    };

    checkSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);

        // Handle specific auth events
        if (event === 'SIGNED_IN') {
          console.log('User signed in successfully');
        } else if (event === 'SIGNED_OUT') {
          console.log('User signed out');
        } else if (event === 'TOKEN_REFRESHED') {
          console.log('User signed up, creating profile...');
          if (session?.user) {
            await createUserProfile(session.user);
          }
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const createUserProfile = async (user: User) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .insert({
          id: user.id,
          name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
          avatar_url: user.user_metadata?.avatar_url,
        });

      if (error && error.code !== '23505') { // Ignore duplicate key errors
        console.error('Error creating profile:', error);
      }
    } catch (error) {
      console.error('Profile creation failed:', error);
    }
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      if (DEMO_MODE) {
        // Use demo authentication
        const result = await demoAuth.signUp(email, password, fullName);
        return { error: null, needsVerification: false };
      } else {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
            }
          }
        });
        
        if (error) {
          console.error('Sign up error:', error);
          return { error };
        }

        // Check if email confirmation is required
        const needsVerification = !data.session && data.user && !data.user.email_confirmed_at;
        
        console.log('Sign up successful:', { 
          user: data.user?.email, 
          needsVerification,
          session: !!data.session 
        });

        return { error: null, needsVerification: needsVerification || undefined };
      }
    } catch (error) {
      console.error('Sign up failed:', error);
      return { error: error as AuthError };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      if (DEMO_MODE) {
        // Use demo authentication
        const result = await demoAuth.signIn(email, password);
        return result;
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        
        if (error) {
          console.error('Sign in error:', error);
          return { error };
        }

        console.log('Sign in successful:', data.user?.email);
        return { error: null };
      }
    } catch (error) {
      console.error('Sign in failed:', error);
      return { error: error as AuthError };
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('Sign out error:', error);
        return { error };
      }

      console.log('Sign out successful');
      return { error: null };
    } catch (error) {
      console.error('Sign out failed:', error);
      return { error: error as AuthError };
    }
  };

  const updateProfile = async (updates: { name?: string; avatar?: string }) => {
    try {
      if (!user) throw new Error('No user logged in');
      
      const { error } = await supabase.auth.updateUser({
        data: updates,
      });
      
      return { error };
    } catch (error) {
      console.error('Update profile error:', error);
      return { error: error as AuthError };
    }
  };

  const value = {
    user,
    session,
    loading,
    signUp,
    signIn,
    signOut,
    updateProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};