# Data Backup Structure

## Overview
The app now uses a **structured backup approach** instead of dumping all data into a single JSON column. This makes data more accessible, queryable, and maintainable.

## Database Tables

### 1. `profiles` Table (Main User Profile)
Stores the primary user profile data that's frequently accessed.

```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email TEXT NOT NULL,
  display_name TEXT,                    -- User name from onboarding
  onboarding_completed BOOLEAN DEFAULT FALSE,
  preferences JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Key Fields:**
- `display_name` - User's name from onboarding
- `onboarding_completed` - Whether user completed onboarding flow
- `preferences` - User settings and preferences

### 2. `user_backups` Table (Backup Before Logout)
Stores a complete backup of user data from AsyncStorage when they log out.

```sql
CREATE TABLE user_backups (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id),
  synced_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Structured columns for important data
  user_name TEXT,                       -- User name from onboarding
  onboarding_completed BOOLEAN,         -- Onboarding status
  goals JSONB,                          -- User goals data
  goal_history JSONB,                   -- Goal history
  user_profile JSONB,                   -- Complete profile snapshot
  additional_data JSONB                 -- Other misc data
);
```

**Key Fields:**
- `user_name` - Direct column for user name (easy to query)
- `onboarding_completed` - Direct column for onboarding status
- `goals` - Structured JSON of user goals
- `goal_history` - Structured JSON of goal history
- `user_profile` - Complete profile data at time of backup
- `additional_data` - Any other data from AsyncStorage

## Data Flow

### During Onboarding
```
User completes onboarding
    ↓
1. Save to AsyncStorage (@nudge_onboarding_user_name, @nudge_onboarding_completed)
    ↓
2. Sync to Supabase profiles table (display_name, onboarding_completed)
    ↓
3. Data is now in both local and cloud storage
```

### During Logout
```
User clicks logout
    ↓
1. Collect all data from AsyncStorage
    ↓
2. Extract and categorize:
   - user_name (from @nudge_onboarding_user_name)
   - onboarding_completed (from @nudge_onboarding_completed)
   - goals (from @nudge_user_goals)
   - goal_history (from @nudge_goal_history)
   - user_profile (from user_profile)
   - additional_data (everything else)
    ↓
3. Upsert to user_backups with structured columns
    ↓
4. Update profiles table with latest onboarding status and name
    ↓
5. Clear AsyncStorage
    ↓
6. Logout completes
```

### During Login (NEW! 🎉)
```
User logs in with email/password
    ↓
1. Authenticate with Supabase
    ↓
2. Check user_backups table for backup data
    ↓
3. If backup exists:
   ├─ Restore user_name → @nudge_onboarding_user_name
   ├─ Restore onboarding_completed → @nudge_onboarding_completed
   ├─ Restore goals → @nudge_user_goals
   ├─ Restore goal_history → @nudge_goal_history
   ├─ Restore user_profile → user_profile
   └─ Restore additional_data → respective keys
    ↓
4. User can continue where they left off
    ↓
5. No need to redo onboarding! ✅
```

### During App Restart
```
App starts
    ↓
1. Check for persisted Supabase session
    ↓
2. If session exists:
   ├─ Check if local AsyncStorage has data
   ├─ If data missing (e.g., cache cleared):
   │  └─ Automatically restore from user_backups
   └─ User seamlessly continues
```

## AsyncStorage Keys Tracked

### Onboarding Data
- `@nudge_onboarding_completed` → `onboarding_completed` column
- `@nudge_onboarding_user_name` → `user_name` column

### Goals Data
- `@nudge_user_goals` → `goals` column (JSONB)
- `@nudge_goal_history` → `goal_history` column (JSONB)

### Profile Data
- `user_profile` → `user_profile` column (JSONB)

### Other Data
- Any other `@nudge_*` keys → `additional_data` column (JSONB)

## Benefits of This Structure

### ✅ Easy Queries
```sql
-- Find all users who completed onboarding
SELECT * FROM profiles WHERE onboarding_completed = true;

-- Find backups with goals data
SELECT user_id, user_name, jsonb_array_length(goals) as goal_count
FROM user_backups
WHERE goals IS NOT NULL;

-- Get user names directly
SELECT user_name FROM user_backups WHERE user_id = 'xxx';
```

### ✅ Better Performance
- No need to parse entire JSON blob to find specific data
- Indexed columns for faster lookups
- PostgreSQL can optimize queries on structured columns

### ✅ Data Integrity
- Type checking on boolean fields (onboarding_completed)
- JSONB validation for structured data
- Clear separation of concerns

### ✅ Maintainability
- Clear column names make schema self-documenting
- Easy to add new columns as needed
- No guessing what's in a generic "data" column

### ✅ Seamless User Experience (NEW!)
- **No re-onboarding required** after logout
- **Data persists across devices** (login from another device)
- **Automatic recovery** if local data is lost
- **No manual restore needed** - happens automatically on login

## Migration Path

### Run These SQL Scripts:
1. `001_setup_profiles_and_backups.sql` - Initial setup
2. `002_update_user_backups_structure.sql` - Update backup table
3. `003_ensure_profiles_onboarding.sql` - Ensure onboarding tracking

### In Supabase Dashboard:
1. Go to **SQL Editor**
2. Run each migration script in order
3. Verify tables have correct structure

## Monitoring

### Check Backup Data:
```sql
-- View latest backups
SELECT 
  user_id,
  user_name,
  onboarding_completed,
  synced_at,
  goals IS NOT NULL as has_goals,
  goal_history IS NOT NULL as has_history
FROM user_backups
ORDER BY synced_at DESC
LIMIT 10;
```

### Check Profiles:
```sql
-- View user profiles
SELECT 
  id,
  email,
  display_name,
  onboarding_completed,
  created_at
FROM profiles
ORDER BY created_at DESC
LIMIT 10;
```

## Recovery Process

### Automatic Restore (On Login)

When a user logs in, the system automatically:

1. **Checks for backup** in `user_backups` table
2. **Restores all data** to AsyncStorage:
   - `user_name` → `@nudge_onboarding_user_name`
   - `onboarding_completed` → `@nudge_onboarding_completed`
   - `goals` → `@nudge_user_goals`
   - `goal_history` → `@nudge_goal_history`
   - `user_profile` → `user_profile`
   - `additional_data` → respective keys
3. **Logs restoration details** for debugging
4. **Continues silently** if no backup exists (new user)

### Smart Restore Logic

The restore function is **smart**:
- ✅ Only restores if backup exists
- ✅ Doesn't fail login if restore fails
- ✅ Logs what was restored for debugging
- ✅ Handles missing data gracefully
- ✅ On app restart, only restores if local data is missing

### Manual Recovery (If Needed)

If a user needs manual data restoration:

1. Query `user_backups` table with their `user_id`
2. Extract structured data from individual columns
3. Parse JSONB fields for goals/history
4. Restore to AsyncStorage or profiles table as needed

This structured approach makes recovery much easier than parsing a monolithic JSON blob!

## User Experience

### Scenario 1: Normal Logout & Login
```
Day 1: User completes onboarding, sets goals
  → Logout (data backed up to Supabase)
  → Local storage cleared

Day 2: User logs back in
  → Automatic restore from backup
  → All data back in AsyncStorage
  → User sees their goals immediately
  → No re-onboarding needed! ✅
```

### Scenario 2: Login From Another Device
```
Device A: User completes onboarding
  → Logout (data backed up)

Device B: User logs in
  → Backup restored automatically
  → Same experience as Device A
  → No setup needed! ✅
```

### Scenario 3: App Cache Cleared
```
User clears app data/cache
  → AsyncStorage wiped

User opens app
  → Still logged in (Supabase session)
  → Detects missing local data
  → Automatically restores from backup
  → User continues seamlessly ✅
```

### Scenario 4: New User
```
User signs up for first time
  → No backup exists
  → Goes through onboarding
  → Completes onboarding
  → Data synced to Supabase
  → Future logins will restore this data ✅
```
