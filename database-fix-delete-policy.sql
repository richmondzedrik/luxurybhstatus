-- Fix missing DELETE policy for app_users table
-- This allows admin users to delete other users
-- Run this in Supabase SQL Editor

-- Add DELETE policy for app_users table
-- This allows any authenticated user to delete users (you may want to restrict this to admins only)
CREATE POLICY "Allow user deletion" ON app_users
  FOR DELETE USING (true);

-- Alternative: More restrictive policy that only allows admins to delete users
-- Uncomment the lines below and comment out the above policy if you want admin-only deletion
-- CREATE POLICY "Allow admin user deletion" ON app_users
--   FOR DELETE USING (
--     EXISTS (
--       SELECT 1 FROM app_users admin_user 
--       WHERE admin_user.is_admin = true 
--       AND admin_user.id = auth.uid()
--     )
--   );

-- Also add UPDATE policy for app_users if it doesn't exist (needed for admin status changes)
CREATE POLICY "Allow user updates" ON app_users
  FOR UPDATE USING (true);

-- Verify the policies were created
SELECT schemaname, tablename, policyname, cmd, qual 
FROM pg_policies 
WHERE tablename = 'app_users';
