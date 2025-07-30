-- Username-Only Authentication System
-- Run this in Supabase SQL Editor

-- Drop existing tables if they exist
DROP TABLE IF EXISTS user_status;
DROP TABLE IF EXISTS user_profiles;

-- Create users table with username and password
CREATE TABLE app_users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_status table
CREATE TABLE user_status (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES app_users(id) ON DELETE CASCADE,
  status TEXT CHECK (status IN ('available', 'afk')) DEFAULT 'afk',
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Enable Row Level Security
ALTER TABLE app_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_status ENABLE ROW LEVEL SECURITY;

-- Create policies for app_users
CREATE POLICY "Users can view all usernames" ON app_users
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own record" ON app_users
  FOR INSERT WITH CHECK (true);

-- Create policies for user_status
CREATE POLICY "Users can view all statuses" ON user_status
  FOR SELECT USING (true);

CREATE POLICY "Users can insert own status" ON user_status
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update own status" ON user_status
  FOR UPDATE USING (true);

-- Function to check username availability
CREATE OR REPLACE FUNCTION check_username_available(username_to_check TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN NOT EXISTS (
    SELECT 1 FROM app_users 
    WHERE LOWER(username) = LOWER(username_to_check)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to create user account
CREATE OR REPLACE FUNCTION create_user_account(username_param TEXT, password_param TEXT)
RETURNS JSON AS $$
DECLARE
  new_user_id UUID;
  result JSON;
BEGIN
  -- Check if username is available
  IF NOT check_username_available(username_param) THEN
    RETURN json_build_object('success', false, 'error', 'Username already taken');
  END IF;

  -- Create user
  INSERT INTO app_users (username, password_hash)
  VALUES (username_param, crypt(password_param, gen_salt('bf')))
  RETURNING id INTO new_user_id;

  -- Create user status
  INSERT INTO user_status (user_id, status)
  VALUES (new_user_id, 'afk');

  RETURN json_build_object(
    'success', true, 
    'user_id', new_user_id,
    'username', username_param
  );
EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object('success', false, 'error', SQLERRM);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to authenticate user
CREATE OR REPLACE FUNCTION authenticate_user(username_param TEXT, password_param TEXT)
RETURNS JSON AS $$
DECLARE
  user_record RECORD;
BEGIN
  -- Find user and verify password
  SELECT id, username INTO user_record
  FROM app_users
  WHERE LOWER(username) = LOWER(username_param)
  AND password_hash = crypt(password_param, password_hash);

  IF user_record.id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Invalid username or password');
  END IF;

  RETURN json_build_object(
    'success', true,
    'user_id', user_record.id,
    'username', user_record.username
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update last_updated timestamp
CREATE OR REPLACE FUNCTION update_last_updated()
RETURNS TRIGGER AS $$
BEGIN
  NEW.last_updated = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for timestamp updates
CREATE TRIGGER update_user_status_last_updated
  BEFORE UPDATE ON user_status
  FOR EACH ROW EXECUTE FUNCTION update_last_updated();
