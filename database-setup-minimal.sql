-- Minimal Database Setup (if Part 3 still fails)
-- Run this instead of Part 3

-- Simple function without complex error handling
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Create user profile
  INSERT INTO user_profiles (user_id, username)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'username', 'user_' || substring(NEW.id::text, 1, 8)));
  
  -- Create user status  
  INSERT INTO user_status (user_id, status)
  VALUES (NEW.id, 'afk');
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Username availability function
CREATE OR REPLACE FUNCTION check_username_available(username_to_check TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN NOT EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE LOWER(username) = LOWER(username_to_check)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update timestamp function
CREATE OR REPLACE FUNCTION update_last_updated()
RETURNS TRIGGER AS $$
BEGIN
  NEW.last_updated = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Update timestamp trigger
CREATE TRIGGER update_user_status_last_updated
  BEFORE UPDATE ON user_status
  FOR EACH ROW EXECUTE FUNCTION update_last_updated();
