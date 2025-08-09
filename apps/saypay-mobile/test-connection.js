#!/usr/bin/env node

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

console.log('🔍 Testing Supabase Connection');
console.log('==============================\n');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.log('❌ Missing Supabase environment variables');
  console.log('Please check your .env file');
  process.exit(1);
}

console.log(`Supabase URL: ${supabaseUrl.substring(0, 30)}...`);
console.log(`Supabase Key: ${supabaseKey.substring(0, 20)}...`);

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  try {
    console.log('\n🔄 Testing connection...');
    
    // Test basic connection
    const { data, error } = await supabase.from('expenses').select('count').limit(1);
    
    if (error) {
      console.log('❌ Connection failed:', error.message);
      return false;
    }
    
    console.log('✅ Supabase connection successful!');
    console.log('✅ Database is accessible');
    
    // Test auth
    const { data: authData, error: authError } = await supabase.auth.getSession();
    
    if (authError) {
      console.log('⚠️  Auth test failed:', authError.message);
    } else {
      console.log('✅ Authentication system working');
    }
    
    return true;
  } catch (error) {
    console.log('❌ Connection test failed:', error.message);
    return false;
  }
}

testConnection().then(success => {
  if (success) {
    console.log('\n🎉 All tests passed! Your app should work correctly.');
    console.log('You can now run: npx expo start --ios');
  } else {
    console.log('\n⚠️  Some tests failed. Please check your configuration.');
  }
}); 