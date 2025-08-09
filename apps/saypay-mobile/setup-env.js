#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔧 SayPay Environment Setup');
console.log('============================\n');

// Check if .env file exists
const envPath = path.join(__dirname, '.env');
const envExists = fs.existsSync(envPath);

if (envExists) {
  console.log('✅ .env file found');
  const envContent = fs.readFileSync(envPath, 'utf8');
  
  // Check for required variables
  const hasSupabaseUrl = envContent.includes('SUPABASE_URL=');
  const hasSupabaseKey = envContent.includes('SUPABASE_ANON_KEY=');
  const hasOpenAIKey = envContent.includes('OPENAI_API_KEY=');
  
  console.log(`Supabase URL: ${hasSupabaseUrl ? '✅ Set' : '❌ Missing'}`);
  console.log(`Supabase Key: ${hasSupabaseKey ? '✅ Set' : '❌ Missing'}`);
  console.log(`OpenAI Key: ${hasOpenAIKey ? '✅ Set' : '❌ Missing'}`);
  
  if (hasSupabaseUrl && hasSupabaseKey && hasOpenAIKey) {
    console.log('\n🎉 All environment variables are configured!');
    console.log('You can now run: npx expo start --ios');
  } else {
    console.log('\n⚠️  Some environment variables are missing.');
    console.log('Please update your .env file with the actual values.');
  }
} else {
  console.log('❌ .env file not found');
  console.log('\n📝 Creating .env file template...');
  
  const envTemplate = `# Supabase Configuration
SUPABASE_URL=your_supabase_url_here
SUPABASE_ANON_KEY=your_supabase_anon_key_here

# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key_here
`;
  
  fs.writeFileSync(envPath, envTemplate);
  console.log('✅ Created .env file template');
  console.log('\n📋 Please update the .env file with your actual values:');
  console.log('1. SUPABASE_URL: Your Supabase project URL');
  console.log('2. SUPABASE_ANON_KEY: Your Supabase anonymous key');
  console.log('3. OPENAI_API_KEY: Your OpenAI API key');
  console.log('\nAfter updating, run this script again to verify.');
}

console.log('\n📚 Next steps:');
console.log('1. Make sure your .env file has the correct values');
console.log('2. Run: npx expo start --ios');
console.log('3. Test the app in the iOS Simulator');
console.log('4. Try logging in with your Supabase credentials'); 