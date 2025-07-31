-- Add is_admin column to app_users table
-- This migration adds admin functionality to the user system

-- Add the is_admin column with default value false
ALTER TABLE app_users 
ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE;

-- Add a comment to document the column
COMMENT ON COLUMN app_users.is_admin IS 'Indicates if the user has admin privileges';

-- Create an index for faster admin user queries
CREATE INDEX IF NOT EXISTS idx_app_users_is_admin ON app_users(is_admin) WHERE is_admin = TRUE;

-- Optional: Create a function to safely promote users to admin
CREATE OR REPLACE FUNCTION promote_user_to_admin(user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    UPDATE app_users 
    SET is_admin = TRUE 
    WHERE id = user_id;
    
    IF FOUND THEN
        RETURN TRUE;
    ELSE
        RETURN FALSE;
    END IF;
END;
$$;

-- Optional: Create a function to safely demote admin users
CREATE OR REPLACE FUNCTION demote_admin_user(user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    UPDATE app_users 
    SET is_admin = FALSE 
    WHERE id = user_id;
    
    IF FOUND THEN
        RETURN TRUE;
    ELSE
        RETURN FALSE;
    END IF;
END;
$$;

-- Grant necessary permissions (adjust as needed for your setup)
-- GRANT EXECUTE ON FUNCTION promote_user_to_admin(UUID) TO authenticated;
-- GRANT EXECUTE ON FUNCTION demote_admin_user(UUID) TO authenticated;
