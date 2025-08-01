-- Complete Manual Verification System Setup
-- Run this in Supabase SQL Editor to implement the full verification system
-- This includes DELETE policy fixes and verification functionality

-- =============================================================================
-- STEP 1: Fix Missing DELETE and UPDATE Policies for app_users table
-- =============================================================================

-- Drop existing policies if they exist, then recreate them
DROP POLICY IF EXISTS "Allow user deletion" ON app_users;
DROP POLICY IF EXISTS "Allow user updates" ON app_users;

-- Add DELETE policy for app_users table (allows user deletion)
CREATE POLICY "Allow user deletion" ON app_users
  FOR DELETE USING (true);

-- Add UPDATE policy for app_users table (needed for admin status and verification changes)
CREATE POLICY "Allow user updates" ON app_users
  FOR UPDATE USING (true);

-- =============================================================================
-- STEP 2: Add Verification System Columns
-- =============================================================================

-- Add is_verified column to track verification status
ALTER TABLE app_users 
ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT FALSE;

-- Add verified_at column to track when user was verified
ALTER TABLE app_users 
ADD COLUMN IF NOT EXISTS verified_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;

-- Add comments for documentation
COMMENT ON COLUMN app_users.is_verified IS 'Indicates if the user has been manually verified by admins';
COMMENT ON COLUMN app_users.verified_at IS 'Timestamp when the user was verified by an admin';

-- Create index for better performance when querying verified users
CREATE INDEX IF NOT EXISTS idx_app_users_is_verified ON app_users(is_verified);

-- =============================================================================
-- STEP 3: Create Verification Management Functions
-- =============================================================================

-- Function to verify a user (sets is_verified = true and verified_at = now)
CREATE OR REPLACE FUNCTION verify_user(user_id_param UUID)
RETURNS JSON AS $$
DECLARE
  result JSON;
  user_name TEXT;
BEGIN
  -- Get username for logging
  SELECT username INTO user_name FROM app_users WHERE id = user_id_param;
  
  -- Update user verification status
  UPDATE app_users 
  SET is_verified = TRUE, verified_at = NOW()
  WHERE id = user_id_param;

  IF FOUND THEN
    RETURN json_build_object(
      'success', true,
      'message', 'User ' || COALESCE(user_name, 'Unknown') || ' verified successfully',
      'user_id', user_id_param,
      'verified_at', NOW()
    );
  ELSE
    RETURN json_build_object(
      'success', false,
      'error', 'User not found'
    );
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to unverify a user (sets is_verified = false and verified_at = null)
CREATE OR REPLACE FUNCTION unverify_user(user_id_param UUID)
RETURNS JSON AS $$
DECLARE
  result JSON;
  user_name TEXT;
BEGIN
  -- Get username for logging
  SELECT username INTO user_name FROM app_users WHERE id = user_id_param;
  
  -- Update user verification status
  UPDATE app_users 
  SET is_verified = FALSE, verified_at = NULL
  WHERE id = user_id_param;

  IF FOUND THEN
    RETURN json_build_object(
      'success', true,
      'message', 'Verification removed from user ' || COALESCE(user_name, 'Unknown'),
      'user_id', user_id_param
    );
  ELSE
    RETURN json_build_object(
      'success', false,
      'error', 'User not found'
    );
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================================================
-- STEP 4: Update create_user_account Function for Verification
-- =============================================================================

-- Drop existing function if it exists, then recreate it
DROP FUNCTION IF EXISTS create_user_account(TEXT, TEXT, TEXT, BOOLEAN, BOOLEAN);

-- Update the create_user_account function to include verification status
CREATE OR REPLACE FUNCTION create_user_account(
  username_param TEXT, 
  password_param TEXT,
  class_param TEXT DEFAULT NULL,
  has_arcane_shield_param BOOLEAN DEFAULT FALSE,
  has_group_heal_param BOOLEAN DEFAULT FALSE
)
RETURNS JSON AS $$
DECLARE
  new_user_id UUID;
  result JSON;
BEGIN
  -- Check if username is available
  IF NOT check_username_available(username_param) THEN
    RETURN json_build_object('success', false, 'error', 'Username already taken');
  END IF;

  -- Create user with verification status set to false (unverified by default)
  INSERT INTO app_users (username, password_hash, class, has_arcane_shield, has_group_heal, is_verified)
  VALUES (username_param, crypt(password_param, gen_salt('bf')), class_param, has_arcane_shield_param, has_group_heal_param, FALSE)
  RETURNING id INTO new_user_id;

  -- Create user status
  INSERT INTO user_status (user_id, status)
  VALUES (new_user_id, 'afk');

  RETURN json_build_object(
    'success', true, 
    'user_id', new_user_id,
    'username', username_param,
    'class', class_param,
    'has_arcane_shield', has_arcane_shield_param,
    'has_group_heal', has_group_heal_param,
    'is_verified', FALSE,
    'message', 'Account created successfully. Verification required to access the system.'
  );
EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object('success', false, 'error', SQLERRM);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================================================
-- STEP 5: Verification and Testing Queries
-- =============================================================================

-- Verify the columns were added successfully
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'app_users' 
AND column_name IN ('is_verified', 'verified_at')
ORDER BY column_name;

-- Check current verification status of all users
SELECT 
  id,
  username,
  is_verified,
  verified_at,
  is_admin,
  created_at
FROM app_users 
ORDER BY created_at DESC;

-- Show verification statistics
SELECT 
  COUNT(*) as total_users,
  COUNT(CASE WHEN is_verified = true THEN 1 END) as verified_users,
  COUNT(CASE WHEN is_verified = false THEN 1 END) as pending_verification,
  COUNT(CASE WHEN is_admin = true THEN 1 END) as admin_users
FROM app_users;

-- Verify policies exist
SELECT schemaname, tablename, policyname, cmd, qual 
FROM pg_policies 
WHERE tablename = 'app_users'
ORDER BY policyname;

-- =============================================================================
-- SETUP COMPLETE
-- =============================================================================

-- Success message
SELECT 'Manual Verification System setup completed successfully!' as status,
       'New users will be unverified by default and need admin approval' as note;
