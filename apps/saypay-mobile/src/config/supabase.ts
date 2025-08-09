import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import 'react-native-url-polyfill/auto';
import Constants from 'expo-constants';

// Demo mode configuration for testing without real Supabase
const DEMO_MODE = false; // Set to false to use real Supabase

// Get environment variables from app config
const supabaseUrl = Constants.expoConfig?.extra?.supabaseUrl || process.env.SUPABASE_URL;
const supabaseAnonKey = Constants.expoConfig?.extra?.supabaseAnonKey || process.env.SUPABASE_ANON_KEY;

// Validate required environment variables
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables. Please check your .env file.');
  console.error('Supabase URL:', supabaseUrl ? 'Set' : 'Missing');
  console.error('Supabase Key:', supabaseAnonKey ? 'Set' : 'Missing');
  throw new Error('Supabase URL and Anon Key are required');
}

console.log('🔧 Supabase Configuration:');
console.log('URL:', supabaseUrl?.substring(0, 30) + '...');
console.log('Key:', supabaseAnonKey ? 'Present' : 'Missing');

// Create Supabase client with proper configuration
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
  global: {
    headers: {
      'X-Client-Info': 'saypay-mobile-app',
    },
  },
});

// Test the connection
export const testSupabaseConnection = async () => {
  try {
    const { data, error } = await supabase.from('profiles').select('count').limit(1);
    if (error) {
      console.error('❌ Supabase connection test failed:', error.message);
      return false;
    }
    console.log('✅ Supabase connection successful');
    return true;
  } catch (error) {
    console.error('❌ Supabase connection error:', error);
    return false;
  }
};

// Demo authentication functions for testing
export const demoAuth = {
  signIn: async (email: string, password: string) => {
    if (DEMO_MODE) {
      // Simulate successful login
      const user = {
        id: 'demo-user-id',
        email: email,
        name: 'Demo User',
        avatar_url: null,
      };
      
      // Store demo session
      await AsyncStorage.setItem('demo-session', JSON.stringify({
        user,
        access_token: 'demo-token',
        refresh_token: 'demo-refresh-token',
      }));
      
      return { data: { user, session: { user } }, error: null };
    }
    return supabase.auth.signInWithPassword({ email, password });
  },

  signUp: async (email: string, password: string, fullName: string) => {
    if (DEMO_MODE) {
      // Simulate successful signup
      const user = {
        id: 'demo-user-id',
        email: email,
        name: fullName,
        avatar_url: null,
      };
      
      // Store demo session
      await AsyncStorage.setItem('demo-session', JSON.stringify({
        user,
        access_token: 'demo-token',
        refresh_token: 'demo-refresh-token',
      }));
      
      return { data: { user, session: { user } }, error: null };
    }
    return supabase.auth.signUp({ 
      email, 
      password,
      options: {
        data: {
          full_name: fullName,
        }
      }
    });
  },

  signOut: async () => {
    if (DEMO_MODE) {
      await AsyncStorage.removeItem('demo-session');
      return { error: null };
    }
    return supabase.auth.signOut();
  },

  getSession: async () => {
    if (DEMO_MODE) {
      const session = await AsyncStorage.getItem('demo-session');
      if (session) {
        const parsed = JSON.parse(session);
        return { data: { session: parsed }, error: null };
      }
      return { data: { session: null }, error: null };
    }
    return supabase.auth.getSession();
  },

  onAuthStateChange: (callback: (event: string, session: any) => void) => {
    if (DEMO_MODE) {
      // Simulate auth state changes
      return { data: { subscription: { unsubscribe: () => {} } } };
    }
    return supabase.auth.onAuthStateChange(callback);
  },
};

// Database interface for TypeScript
interface Database {
  public: {
    Tables: {
      expenses: {
        Row: {
          id: string;
          user_id: string;
          amount: number;
          description: string;
          category: string;
          date: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          amount: number;
          description: string;
          category: string;
          date: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          amount?: number;
          description?: string;
          category?: string;
          date?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      profiles: {
        Row: {
          id: string;
          name: string;
          avatar_url?: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          name: string;
          avatar_url?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          avatar_url?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
}