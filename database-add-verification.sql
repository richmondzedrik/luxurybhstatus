-- Add verification system to app_users table
-- Run this in Supabase SQL Editor

-- Add is_verified column to app_users table
ALTER TABLE app_users 
ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT FALSE;

-- Add comment for documentation
COMMENT ON COLUMN app_users.is_verified IS 'Indicates if the user has been manually verified by admins';

-- Create index for better performance when querying verified users
CREATE INDEX IF NOT EXISTS idx_app_users_is_verified ON app_users(is_verified);

-- Add verification timestamp column to track when user was verified
ALTER TABLE app_users 
ADD COLUMN IF NOT EXISTS verified_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;

-- Add comment for verification timestamp
COMMENT ON COLUMN app_users.verified_at IS 'Timestamp when the user was verified by an admin';

-- Create function to verify a user (can only be called by admins)
CREATE OR REPLACE FUNCTION verify_user(user_id_param UUID)
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  -- Update user verification status
  UPDATE app_users 
  SET is_verified = TRUE, verified_at = NOW()
  WHERE id = user_id_param;

  IF FOUND THEN
    RETURN json_build_object(
      'success', true,
      'message', 'User verified successfully'
    );
  ELSE
    RETURN json_build_object(
      'success', false,
      'error', 'User not found'
    );
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to unverify a user (can only be called by admins)
CREATE OR REPLACE FUNCTION unverify_user(user_id_param UUID)
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  -- Update user verification status
  UPDATE app_users 
  SET is_verified = FALSE, verified_at = NULL
  WHERE id = user_id_param;

  IF FOUND THEN
    RETURN json_build_object(
      'success', true,
      'message', 'User verification removed successfully'
    );
  ELSE
    RETURN json_build_object(
      'success', false,
      'error', 'User not found'
    );
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

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

  -- Create user with verification status set to false
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
    'is_verified', FALSE
  );
EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object('success', false, 'error', SQLERRM);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Verify the columns were added
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'app_users'
AND column_name IN ('is_verified', 'verified_at')
ORDER BY column_name;
