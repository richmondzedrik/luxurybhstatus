-- Part 3: Create Functions and Triggers
-- Copy and paste this into Supabase SQL Editor AFTER Part 2

-- Create function to automatically create user profile and status on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  username_value TEXT;
BEGIN
  -- Get username from metadata or generate a default one
  username_value := COALESCE(
    NEW.raw_user_meta_data->>'username',
    'user_' || substring(NEW.id::text, 1, 8)
  );

  -- Create user profile with username from metadata
  INSERT INTO user_profiles (user_id, username)
  VALUES (NEW.id, username_value)
  ON CONFLICT (user_id) DO NOTHING;

  -- Create user status
  INSERT INTO user_status (user_id, status)
  VALUES (NEW.id, 'afk')
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error but don't fail the user creation
    RAISE WARNING 'Error in handle_new_user: %', SQLERRM;
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
