-- Database Fix - Run this in Supabase SQL Editor
-- This will create a working trigger function

-- First, drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create a simple, working function
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Only proceed if this is a real user signup with our domain
  IF NEW.email LIKE '%@bosshunting.app' THEN
    -- Create user profile with username from metadata
    INSERT INTO user_profiles (user_id, username)
    VALUES (
      NEW.id,
      COALESCE(
        NEW.raw_user_meta_data->>'username',
        split_part(NEW.email, '@', 1) -- Extract username from email
      )
    )
    ON CONFLICT (user_id) DO NOTHING;

    -- Create user status
    INSERT INTO user_status (user_id, status)
    VALUES (NEW.id, 'afk')
    ON CONFLICT (user_id) DO NOTHING;
  END IF;

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Don't fail the user creation if profile creation fails
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Create username availability function
CREATE OR REPLACE FUNCTION check_username_available(username_to_check TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN NOT EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE LOWER(username) = LOWER(username_to_check)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create update timestamp function
CREATE OR REPLACE FUNCTION update_last_updated()
RETURNS TRIGGER AS $$
BEGIN
  NEW.last_updated = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create update timestamp trigger
DROP TRIGGER IF EXISTS update_user_status_last_updated ON user_status;
CREATE TRIGGER update_user_status_last_updated
  BEFORE UPDATE ON user_status
  FOR EACH ROW EXECUTE FUNCTION update_last_updated();
