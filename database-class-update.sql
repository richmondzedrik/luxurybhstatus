-- Add Archer class to the database
-- Run this in Supabase SQL Editor

-- Drop existing class constraint and add new one with Archer
ALTER TABLE app_users DROP CONSTRAINT IF EXISTS app_users_class_check;
ALTER TABLE app_users ADD CONSTRAINT app_users_class_check
CHECK (class IN ('Orb', 'Sword', 'Assassin', 'Mage', 'Dual Blade', 'Archer'));

-- Add skills columns if they don't exist (will be ignored if they already exist)
ALTER TABLE app_users
ADD COLUMN IF NOT EXISTS has_arcane_shield BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS has_group_heal BOOLEAN DEFAULT false;

-- Update the create_user_account function to include class and skills
CREATE OR REPLACE FUNCTION create_user_account(
  username_param TEXT, 
  password_param TEXT,
  class_param TEXT DEFAULT NULL,
  has_arcane_shield_param BOOLEAN DEFAULT false,
  has_group_heal_param BOOLEAN DEFAULT false
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

  -- Create user with class and skills
  INSERT INTO app_users (username, password_hash, class, has_arcane_shield, has_group_heal)
  VALUES (
    username_param, 
    crypt(password_param, gen_salt('bf')),
    class_param,
    has_arcane_shield_param,
    has_group_heal_param
  )
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
    'has_group_heal', has_group_heal_param
  );
EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object('success', false, 'error', SQLERRM);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
