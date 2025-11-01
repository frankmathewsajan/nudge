-- Ensure profiles table has all necessary columns for onboarding tracking

-- Add display_name if it doesn't exist (user name from onboarding)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS display_name TEXT;

-- Ensure onboarding_completed exists with proper default
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT FALSE;

-- Add index for onboarding queries
CREATE INDEX IF NOT EXISTS idx_profiles_onboarding_completed ON profiles(onboarding_completed);

-- Update the trigger to include onboarding data
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, onboarding_completed, created_at, updated_at)
  VALUES (
    NEW.id,
    NEW.email,
    FALSE,  -- Start with onboarding not completed
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO NOTHING;  -- Don't overwrite if already exists
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Ensure the trigger is properly set up
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- Add comments for documentation
COMMENT ON COLUMN profiles.display_name IS 'User display name from onboarding or profile settings';
COMMENT ON COLUMN profiles.onboarding_completed IS 'Whether user has completed the onboarding flow';
