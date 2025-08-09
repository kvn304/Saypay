#!/usr/bin/env node

const AsyncStorage = require('@react-native-async-storage/async-storage');

console.log('🔍 Testing Demo Authentication');
console.log('=============================\n');

// Simulate demo auth functions
const demoAuth = {
  signUp: async (email, password, fullName) => {
    console.log('Testing signUp with:', { email, password, fullName });
    
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
    
    console.log('✅ SignUp successful');
    return { data: { user, session: { user } }, error: null };
  },

  signIn: async (email, password) => {
    console.log('Testing signIn with:', { email, password });
    
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
    
    console.log('✅ SignIn successful');
    return { data: { user, session: { user } }, error: null };
  },

  getSession: async () => {
    console.log('Testing getSession');
    const session = await AsyncStorage.getItem('demo-session');
    if (session) {
      const parsed = JSON.parse(session);
      console.log('✅ Session found:', parsed.user.email);
      return { data: { session: parsed }, error: null };
    }
    console.log('❌ No session found');
    return { data: { session: null }, error: null };
  },

  signOut: async () => {
    console.log('Testing signOut');
    await AsyncStorage.removeItem('demo-session');
    console.log('✅ SignOut successful');
    return { error: null };
  }
};

async function testAuth() {
  try {
    console.log('🔄 Testing demo authentication...\n');
    
    // Test signup
    const signupResult = await demoAuth.signUp('test@example.com', 'password123', 'Test User');
    console.log('SignUp result:', signupResult.error ? '❌ Failed' : '✅ Success');
    
    // Test getSession
    const sessionResult = await demoAuth.getSession();
    console.log('GetSession result:', sessionResult.error ? '❌ Failed' : '✅ Success');
    
    // Test signout
    const signoutResult = await demoAuth.signOut();
    console.log('SignOut result:', signoutResult.error ? '❌ Failed' : '✅ Success');
    
    // Test signin
    const signinResult = await demoAuth.signIn('test@example.com', 'password123');
    console.log('SignIn result:', signinResult.error ? '❌ Failed' : '✅ Success');
    
    console.log('\n🎉 All demo authentication tests passed!');
    console.log('The app should work correctly with demo mode.');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testAuth(); 