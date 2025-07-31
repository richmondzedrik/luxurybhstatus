-- Quick setup for admin functionality
-- Run this in your Supabase SQL Editor

-- Add is_admin column to app_users table
ALTER TABLE app_users 
ADD COLUMN is_admin BOOLEAN DEFAULT FALSE;

-- Add comment for documentation
COMMENT ON COLUMN app_users.is_admin IS 'Indicates if the user has admin privileges';

-- Create index for better performance when querying admin users
CREATE INDEX idx_app_users_is_admin ON app_users(is_admin) WHERE is_admin = TRUE;

-- Verify the column was added (optional - for checking)
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'app_users' AND column_name = 'is_admin';
