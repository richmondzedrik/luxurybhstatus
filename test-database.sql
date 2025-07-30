-- Test Database Setup
-- Run this in Supabase SQL Editor to verify everything is working

-- Test 1: Check if tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('user_profiles', 'user_status');

-- Test 2: Check if functions exist
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name IN ('handle_new_user', 'update_last_updated', 'check_username_available');

-- Test 3: Test username availability function
SELECT check_username_available('testuser123');

-- Test 4: Check if RLS is enabled
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename IN ('user_profiles', 'user_status');

-- If all tests return results, your database is set up correctly!
