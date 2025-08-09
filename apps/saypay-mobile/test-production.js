#!/usr/bin/env node

require('dotenv').config();

console.log('🧪 SayPay Production Test Suite');
console.log('================================\n');

// Test environment variables
console.log('1. Environment Variables Test');
console.log('-----------------------------');
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const openaiKey = process.env.OPENAI_API_KEY;

console.log(`Supabase URL: ${supabaseUrl ? '✅ Set' : '❌ Missing'}`);
console.log(`Supabase Key: ${supabaseKey ? '✅ Set' : '❌ Missing'}`);
console.log(`OpenAI Key: ${openaiKey ? '✅ Set' : '❌ Missing'}`);

if (!supabaseUrl || !supabaseKey) {
  console.log('\n❌ Missing required environment variables');
  process.exit(1);
}

// Test Supabase connection
console.log('\n2. Supabase Connection Test');
console.log('---------------------------');

const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(supabaseUrl, supabaseKey);

async function testSupabaseConnection() {
  try {
    console.log('Testing connection...');
    
    // Test basic connection
    const { data, error } = await supabase.from('profiles').select('count').limit(1);
    
    if (error) {
      console.log('❌ Connection failed:', error.message);
      return false;
    }
    
    console.log('✅ Supabase connection successful');
    
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

// Test OpenAI API
console.log('\n3. OpenAI API Test');
console.log('------------------');

async function testOpenAI() {
  try {
    console.log('Testing OpenAI API...');
    
    const response = await fetch('https://api.openai.com/v1/models', {
      headers: {
        'Authorization': `Bearer ${openaiKey}`,
      },
    });
    
    if (response.ok) {
      console.log('✅ OpenAI API connection successful');
      return true;
    } else {
      console.log('❌ OpenAI API failed:', response.status, response.statusText);
      return false;
    }
  } catch (error) {
    console.log('❌ OpenAI API test failed:', error.message);
    return false;
  }
}

// Test app configuration
console.log('\n4. App Configuration Test');
console.log('-------------------------');

function testAppConfig() {
  try {
    const fs = require('fs');
    const path = require('path');
    
    // Check if key files exist
    const files = [
      'package.json',
      'app.json',
      'app.config.js',
      'src/config/supabase.ts',
      'src/contexts/AuthContext.tsx',
      'src/hooks/useExpenses.ts',
      'app/login.tsx',
      'app/index.tsx'
    ];
    
    let allFilesExist = true;
    files.forEach(file => {
      const exists = fs.existsSync(path.join(__dirname, file));
      console.log(`${exists ? '✅' : '❌'} ${file}`);
      if (!exists) allFilesExist = false;
    });
    
    return allFilesExist;
  } catch (error) {
    console.log('❌ App config test failed:', error.message);
    return false;
  }
}

// Run all tests
async function runAllTests() {
  console.log('🔄 Running all tests...\n');
  
  const supabaseTest = await testSupabaseConnection();
  const openaiTest = await testOpenAI();
  const configTest = testAppConfig();
  
  console.log('\n📊 Test Results Summary');
  console.log('=======================');
  console.log(`Supabase Connection: ${supabaseTest ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`OpenAI API: ${openaiTest ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`App Configuration: ${configTest ? '✅ PASS' : '❌ FAIL'}`);
  
  const allPassed = supabaseTest && openaiTest && configTest;
  
  if (allPassed) {
    console.log('\n🎉 All tests passed! Your app should work correctly.');
    console.log('\n📱 Next steps:');
    console.log('1. Run: npx expo start --ios');
    console.log('2. Test registration/login in the app');
    console.log('3. Test voice recording feature');
    console.log('4. Test manual expense entry');
  } else {
    console.log('\n⚠️  Some tests failed. Please check the configuration.');
    
    if (!supabaseTest) {
      console.log('\n🔧 Supabase Issues:');
      console.log('- Check your Supabase URL and key');
      console.log('- Ensure the database is set up correctly');
      console.log('- Run the migrations if needed');
    }
    
    if (!openaiTest) {
      console.log('\n🔧 OpenAI Issues:');
      console.log('- Check your OpenAI API key');
      console.log('- Ensure the key has proper permissions');
    }
  }
  
  return allPassed;
}

runAllTests().then(success => {
  process.exit(success ? 0 : 1);
}); 