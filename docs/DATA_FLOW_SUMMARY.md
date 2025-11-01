# Data Flow Summary - Backup & Restore System

## Quick Reference

### 🔐 Login Flow
```typescript
signInWithEmail()
  ├─ Authenticate with Supabase
  ├─ Call restoreUserDataFromBackup(userId)
  │  ├─ Query user_backups table
  │  ├─ If backup exists:
  │  │  ├─ Restore to AsyncStorage
  │  │  └─ Log restored items
  │  └─ If no backup: Continue (new user)
  └─ Return authenticated user
```

### 🚪 Logout Flow
```typescript
signOut()
  ├─ Get current user
  ├─ Call syncAllDataToFirestore(userId)
  │  ├─ Read all AsyncStorage data
  │  ├─ Categorize by type (name, goals, etc.)
  │  ├─ Upsert to user_backups (structured columns)
  │  └─ Update profiles table
  ├─ Clear AsyncStorage
  └─ Sign out from Supabase
```

### 🔄 App Restart Flow
```typescript
handleAuthPersistence()
  ├─ Check Supabase session
  ├─ If user exists:
  │  ├─ Check if local data exists
  │  ├─ If missing:
  │  │  └─ Call restoreUserDataFromBackup()
  │  └─ If exists: Skip restore
  └─ Return user or null
```

### 📝 Onboarding Complete Flow
```typescript
setOnboardingComplete(userName)
  ├─ Save to AsyncStorage
  │  ├─ @nudge_onboarding_completed = 'true'
  │  └─ @nudge_onboarding_user_name = userName
  └─ Sync to Supabase profiles
     ├─ onboarding_completed = true
     └─ display_name = userName
```

## Key Files

### Services
- `services/auth/authService.ts` - Login/logout with restore integration
- `services/auth/userProfileService.ts` - Backup & restore functions
- `services/storage/userProgressService.ts` - Onboarding state management

### Database Tables
- `profiles` - Main user profile (frequently accessed)
- `user_backups` - Complete backup with structured columns

### AsyncStorage Keys
- `@nudge_onboarding_completed` - Boolean string
- `@nudge_onboarding_user_name` - User's name
- `@nudge_user_goals` - JSON string of goals
- `@nudge_goal_history` - JSON string of history
- `user_profile` - JSON string of profile

## Why This Design?

### Problem We Solved
1. ❌ Users had to redo onboarding after logout
2. ❌ Data lost when switching devices
3. ❌ Manual restore was complex
4. ❌ Data dumped in single JSON column (hard to query)

### Solution
1. ✅ Automatic backup on logout
2. ✅ Automatic restore on login
3. ✅ Structured database columns (easy queries)
4. ✅ Smart restore logic (only when needed)
5. ✅ Seamless user experience

## Testing Checklist

- [ ] Complete onboarding as new user
- [ ] Verify data saved to AsyncStorage
- [ ] Verify data synced to profiles table
- [ ] Logout (should backup to user_backups)
- [ ] Login again (should restore automatically)
- [ ] Check logs for "Restored X items from backup"
- [ ] Verify no re-onboarding required
- [ ] Clear app cache, restart app
- [ ] Verify data restores automatically
- [ ] Login from different device (if possible)
- [ ] Verify data syncs across devices

## Debugging

### Check if backup exists:
```sql
SELECT * FROM user_backups WHERE user_id = 'your-user-id';
```

### Check profile data:
```sql
SELECT * FROM profiles WHERE id = 'your-user-id';
```

### Check AsyncStorage (React Native Debugger):
```javascript
AsyncStorage.getAllKeys().then(keys => console.log(keys));
AsyncStorage.getItem('@nudge_onboarding_completed').then(console.log);
```

### Check logs:
Look for:
- `📥 Checking for user data backup...`
- `✅ Restored X data items from backup`
- `🔄 Starting comprehensive data sync to Supabase...`
- `📦 Backup data structure: ...`
