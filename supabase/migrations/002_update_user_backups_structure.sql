-- Update user_backups table to have proper columns instead of dumping everything in JSON

-- Drop the old data column if it exists
ALTER TABLE user_backups DROP COLUMN IF EXISTS data;

-- Add structured columns for important data
ALTER TABLE user_backups ADD COLUMN IF NOT EXISTS user_name TEXT;
ALTER TABLE user_backups ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT FALSE;
ALTER TABLE user_backups ADD COLUMN IF NOT EXISTS goals JSONB;
ALTER TABLE user_backups ADD COLUMN IF NOT EXISTS goal_history JSONB;
ALTER TABLE user_backups ADD COLUMN IF NOT EXISTS user_profile JSONB;
ALTER TABLE user_backups ADD COLUMN IF NOT EXISTS additional_data JSONB;

-- Update the synced_at column to have a default
ALTER TABLE user_backups ALTER COLUMN synced_at SET DEFAULT NOW();

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS idx_user_backups_user_id ON user_backups(user_id);
CREATE INDEX IF NOT EXISTS idx_user_backups_synced_at ON user_backups(synced_at);

-- Add comment to table
COMMENT ON TABLE user_backups IS 'Stores backup of user data from AsyncStorage before logout';
COMMENT ON COLUMN user_backups.user_name IS 'User name from onboarding';
COMMENT ON COLUMN user_backups.onboarding_completed IS 'Whether user completed onboarding';
COMMENT ON COLUMN user_backups.goals IS 'User goals data';
COMMENT ON COLUMN user_backups.goal_history IS 'User goal history';
COMMENT ON COLUMN user_backups.user_profile IS 'Complete user profile data';
COMMENT ON COLUMN user_backups.additional_data IS 'Other miscellaneous data from AsyncStorage';
