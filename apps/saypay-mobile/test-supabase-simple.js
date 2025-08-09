#!/usr/bin/env node

require('dotenv').config();

console.log('🔍 Simple Supabase Test');
console.log('========================\n');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

console.log(`Supabase URL: ${supabaseUrl}`);
console.log(`Supabase Key: ${supabaseKey ? 'Present' : 'Missing'}`);

if (!supabaseUrl || !supabaseKey) {
  console.log('❌ Missing environment variables');
  process.exit(1);
}

// Test basic fetch to Supabase
async function testBasicConnection() {
  try {
    console.log('\n🔄 Testing basic connection...');
    
    const response = await fetch(`${supabaseUrl}/rest/v1/`, {
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log(`Response status: ${response.status}`);
    console.log(`Response ok: ${response.ok}`);
    
    if (response.ok) {
      console.log('✅ Basic connection successful!');
      return true;
    } else {
      console.log('❌ Connection failed with status:', response.status);
      return false;
    }
  } catch (error) {
    console.log('❌ Connection error:', error.message);
    return false;
  }
}

testBasicConnection().then(success => {
  if (success) {
    console.log('\n🎉 Supabase connection is working!');
    console.log('The issue might be in the app configuration.');
  } else {
    console.log('\n⚠️  Supabase connection failed.');
    console.log('Please check your Supabase URL and key.');
  }
}); 