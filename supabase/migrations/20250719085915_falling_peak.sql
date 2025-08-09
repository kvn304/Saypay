/*
  # Simple Supabase Schema for Voice Expense Tracker

  1. New Tables
    - `profiles`
      - `id` (uuid, primary key, references auth.users)
      - `full_name` (text)
      - `created_at` (timestamp)
    - `expenses`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `amount` (numeric)
      - `currency` (char(3))
      - `category` (text)
      - `description` (text)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on expenses table
    - Add policy for users to access only their own expenses
*/

-- Create profiles table
create table if not exists profiles (
  id uuid primary key references auth.users on delete cascade,
  full_name text,
  created_at timestamptz default now()
);

-- Create expenses table
create table if not exists expenses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  amount numeric(10,2) not null,
  currency char(3) default 'EUR',
  category text,
  description text,
  created_at timestamptz default now()
);

-- Enable RLS on expenses
alter table expenses enable row level security;

-- Create policy for expenses
create policy "Own rows" on expenses
  for all using ( user_id = auth.uid() );

-- Create function to handle new user registration
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$ language plpgsql security definer;

-- Create trigger for new user registration
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();