-- Part 2: Create Security Policies
-- Copy and paste this into Supabase SQL Editor AFTER Part 1

-- Create policies for user_profiles table
-- Users can read all profiles (for username display)
CREATE POLICY "Users can view all profiles" ON user_profiles
  FOR SELECT USING (true);

-- Users can only insert their own profile
CREATE POLICY "Users can insert own profile" ON user_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can only update their own profile
CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = user_id);

-- Create policies for user_status table
-- Users can read all statuses (for the user list)
CREATE POLICY "Users can view all statuses" ON user_status
  FOR SELECT USING (true);

-- Users can only insert their own status
CREATE POLICY "Users can insert own status" ON user_status
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can only update their own status
CREATE POLICY "Users can update own status" ON user_status
  FOR UPDATE USING (auth.uid() = user_id);

-- Users can only delete their own status
CREATE POLICY "Users can delete own status" ON user_status
  FOR DELETE USING (auth.uid() = user_id);
