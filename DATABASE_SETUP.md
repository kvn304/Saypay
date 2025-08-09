# 🗄️ Database Setup Instructions

## Quick Setup (Recommended)

### Option 1: Copy & Paste SQL
1. Go to your [Supabase Dashboard](https://app.supabase.com)
2. Navigate to **SQL Editor**
3. Copy the entire contents of `supabase/migrations/create_initial_schema.sql`
4. Paste and run the SQL script
5. ✅ Done! Your database is ready.

### Option 2: Manual Table Creation
If you prefer to create tables manually, follow these steps:

## 📋 Manual Setup Steps

### 1. Create Tables

```sql
-- Create profiles table
CREATE TABLE profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (id)
);

-- Create expenses table
CREATE TABLE expenses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 2. Enable Row Level Security

```sql
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
```

### 3. Create Security Policies

```sql
-- Profiles policies
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Expenses policies
CREATE POLICY "Users can view own expenses" ON expenses FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own expenses" ON expenses FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own expenses" ON expenses FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own expenses" ON expenses FOR DELETE USING (auth.uid() = user_id);
```

## 🔧 Environment Variables

Make sure you have these environment variables set:

```bash
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## ✅ Verification

After running the setup, verify your tables exist:

1. Go to **Table Editor** in Supabase Dashboard
2. You should see:
   - `profiles` table
   - `expenses` table
3. Both tables should have RLS enabled (🔒 icon)

## 🚀 Ready to Go!

Once the database is set up, your app will:
- ✅ Create user profiles automatically on signup
- ✅ Store expenses securely per user
- ✅ Sync data in real-time
- ✅ Work offline with local fallback

## 🆘 Troubleshooting

**Error: "relation does not exist"**
- Make sure you've run the SQL setup script
- Check that tables appear in your Supabase Table Editor

**Error: "RLS policy violation"**
- Verify RLS policies are created correctly
- Check that you're authenticated when accessing data

**Error: "Invalid API key"**
- Double-check your environment variables
- Make sure you're using the correct Supabase project URL and anon key