-- Simple user_backups table structure that works with current code
-- Run this in Supabase SQL Editor

-- Fix user_backups table structure to match code expectations

-- Add missing user_name column
ALTER TABLE user_backups ADD COLUMN IF NOT EXISTS user_name TEXT;

-- Rename onboarding_complete to onboarding_completed and change type
ALTER TABLE user_backups DROP COLUMN IF EXISTS onboarding_complete;
ALTER TABLE user_backups ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT FALSE;

-- Drop the old data column (we use structured columns now)
ALTER TABLE user_backups DROP COLUMN IF EXISTS data;

-- Ensure other columns exist
ALTER TABLE user_backups ADD COLUMN IF NOT EXISTS goals JSONB;
ALTER TABLE user_backups ADD COLUMN IF NOT EXISTS goal_history JSONB;
ALTER TABLE user_backups ADD COLUMN IF NOT EXISTS user_profile JSONB;
ALTER TABLE user_backups ADD COLUMN IF NOT EXISTS synced_at TIMESTAMPTZ DEFAULT NOW();

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_backups_user_id ON user_backups(user_id);
CREATE INDEX IF NOT EXISTS idx_user_backups_synced_at ON user_backups(synced_at);

-- Row Level Security Policies
ALTER TABLE user_backups ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Users can view own backup" ON user_backups;
DROP POLICY IF EXISTS "Users can insert own backup" ON user_backups;
DROP POLICY IF EXISTS "Users can update own backup" ON user_backups;
DROP POLICY IF EXISTS "Users can delete own backup" ON user_backups;

-- Allow users to manage their own backups
CREATE POLICY "Users can view own backup"
  ON user_backups FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own backup"
  ON user_backups FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own backup"
  ON user_backups FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own backup"
  ON user_backups FOR DELETE
  USING (auth.uid() = user_id);

-- Add helpful comments
COMMENT ON TABLE user_backups IS 'Stores backup of user data from AsyncStorage before logout';
COMMENT ON COLUMN user_backups.user_name IS 'User name from onboarding';
COMMENT ON COLUMN user_backups.onboarding_completed IS 'Whether user completed onboarding';
COMMENT ON COLUMN user_backups.goals IS 'User goals data in JSON format';
COMMENT ON COLUMN user_backups.goal_history IS 'User goal history in JSON format';
COMMENT ON COLUMN user_backups.user_profile IS 'Complete user profile data';

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'user_backups table created/updated successfully!';
  RAISE NOTICE 'Table structure:';
  RAISE NOTICE '  - user_id (UUID, unique, references auth.users)';
  RAISE NOTICE '  - user_name (TEXT)';
  RAISE NOTICE '  - onboarding_completed (BOOLEAN)';
  RAISE NOTICE '  - goals (JSONB)';
  RAISE NOTICE '  - goal_history (JSONB)';
  RAISE NOTICE '  - user_profile (JSONB)';
  RAISE NOTICE 'RLS policies enabled for user access';
END $$;
