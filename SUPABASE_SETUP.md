# Supabase Setup Guide

## 1. Create a Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Sign up or log in to your account
3. Click "New Project"
4. Choose your organization
5. Enter project name: "afk-availability"
6. Enter a strong database password
7. Choose a region close to your users
8. Click "Create new project"

## 2. Get Your Project Credentials

1. Go to Settings > API in your Supabase dashboard
2. Copy the following values:
   - Project URL
   - Project API Key (anon public)

## 3. Configure Environment Variables

1. Create a `.env` file in your project root
2. Add the following variables:

```
VITE_SUPABASE_URL=your_project_url_here
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

## 4. Set Up Database Schema

Go to the SQL Editor in your Supabase dashboard and run the following SQL:

```sql
-- Enable Row Level Security
ALTER TABLE auth.users ENABLE ROW LEVEL SECURITY;

-- Create user_profiles table for usernames
CREATE TABLE user_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Create user_status table
CREATE TABLE user_status (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT CHECK (status IN ('available', 'afk')) DEFAULT 'afk',
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Enable Row Level Security on user_profiles
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Enable Row Level Security on user_status
ALTER TABLE user_status ENABLE ROW LEVEL SECURITY;

-- Create policies for user_profiles table
-- Users can read all profiles (for username display)
CREATE POLICY "Users can view all profiles" ON user_profiles
  FOR SELECT USING (true);

-- Users can only insert their own profile
CREATE POLICY "Users can insert own profile" ON user_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can only update their own profile
CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = user_id);

-- Create policies for user_status table
-- Users can read all statuses (for the user list)
CREATE POLICY "Users can view all statuses" ON user_status
  FOR SELECT USING (true);

-- Users can only insert their own status
CREATE POLICY "Users can insert own status" ON user_status
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can only update their own status
CREATE POLICY "Users can update own status" ON user_status
  FOR UPDATE USING (auth.uid() = user_id);

-- Users can only delete their own status
CREATE POLICY "Users can delete own status" ON user_status
  FOR DELETE USING (auth.uid() = user_id);

-- Create function to automatically create user profile and status on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Create user profile with username from metadata
  INSERT INTO user_profiles (user_id, username)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'username', 'user_' || substring(NEW.id::text, 1, 8)));

  -- Create user status
  INSERT INTO user_status (user_id, status)
  VALUES (NEW.id, 'afk');

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to call the function when a new user signs up
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Create function to update last_updated timestamp
CREATE OR REPLACE FUNCTION update_last_updated()
RETURNS TRIGGER AS $$
BEGIN
  NEW.last_updated = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update last_updated
CREATE TRIGGER update_user_status_last_updated
  BEFORE UPDATE ON user_status
  FOR EACH ROW EXECUTE FUNCTION update_last_updated();

-- Create function to check username availability
CREATE OR REPLACE FUNCTION check_username_available(username_to_check TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN NOT EXISTS (
    SELECT 1 FROM user_profiles
    WHERE LOWER(username) = LOWER(username_to_check)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

## 5. Enable Realtime

1. Go to Database > Replication in your Supabase dashboard
2. Find the `user_status` table
3. Toggle "Enable Realtime" for this table

## 6. Test Your Setup

After completing the setup, you should be able to:
- Sign up new users (they will automatically get an 'afk' status)
- Sign in existing users
- View and update user statuses
- See real-time updates when other users change their status

## Security Notes

- Row Level Security is enabled to ensure users can only modify their own status
- All users can view all statuses (required for the user list feature)
- The database automatically handles user creation and status initialization
- Timestamps are automatically managed by the database
