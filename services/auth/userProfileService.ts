/**
 * User Profile Service
 * 
 * Handles user profile management with Supabase database and local storage sync
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../../config/supabase';

export interface UserProfile {
  uid: string;
  email: string;
  displayName?: string;
  onboardingCompleted: boolean;
  createdAt: Date;
  updatedAt: Date;
  // Add more profile fields as needed
  preferences?: {
    theme?: 'light' | 'dark' | 'system';
    notifications?: boolean;
  };
}

const PROFILE_STORAGE_KEY = 'user_profile';
const ONBOARDING_STATUS_KEY = 'onboarding_completed';

/**
 * Create a new user profile in Supabase database
 */
export const createUserProfile = async (uid: string, email: string, additionalData?: Partial<UserProfile>): Promise<UserProfile> => {
  try {
    const now = new Date();
    const profileData: UserProfile = {
      uid,
      email,
      onboardingCompleted: false,
      createdAt: now,
      updatedAt: now,
      ...additionalData,
    };

    // Insert into Supabase profiles table
    // Note: If using database trigger, this will update the existing profile
    const { error } = await supabase
      .from('profiles')
      .upsert({
        id: uid,
        email,
        onboarding_completed: false,
        created_at: now.toISOString(),
        updated_at: now.toISOString(),
        display_name: additionalData?.displayName,
        preferences: additionalData?.preferences,
      }, {
        onConflict: 'id'
      });

    if (error) throw error;

    // Cache in local storage
    await AsyncStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profileData));
    
    console.log('✅ User profile created successfully');
    return profileData;
  } catch (error) {
    console.error('❌ Error creating user profile:', error);
    throw error;
  }
};

/**
 * Get user profile from Supabase database (with local cache fallback)
 */
export const getUserProfile = async (uid: string): Promise<UserProfile | null> => {
  try {
    // Try to get from Supabase database first
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', uid)
      .single();
    
    if (error) throw error;
    
    if (data) {
      const profileData: UserProfile = {
        uid: data.id,
        email: data.email,
        displayName: data.display_name,
        onboardingCompleted: data.onboarding_completed ?? false,
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at),
        preferences: data.preferences,
      };
      
      // Update local cache
      await AsyncStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profileData));
      
      return profileData;
    }

    // Fallback to local storage if database query fails
    const cachedProfile = await AsyncStorage.getItem(PROFILE_STORAGE_KEY);
    if (cachedProfile) {
      console.log('📱 Using cached user profile');
      return JSON.parse(cachedProfile);
    }

    return null;
  } catch (error) {
    console.error('❌ Error getting user profile:', error);
    
    // Try local storage as fallback
    try {
      const cachedProfile = await AsyncStorage.getItem(PROFILE_STORAGE_KEY);
      if (cachedProfile) {
        console.log('📱 Using cached user profile (database error)');
        return JSON.parse(cachedProfile);
      }
    } catch (cacheError) {
      console.error('❌ Error reading cached profile:', cacheError);
    }
    
    return null;
  }
};

/**
 * Update user profile in Supabase database and local storage
 */
export const updateUserProfile = async (uid: string, updates: Partial<UserProfile>): Promise<void> => {
  try {
    const now = new Date();
    
    // Convert updates to database column format
    const updateData: any = {
      updated_at: now.toISOString(),
    };
    
    if (updates.displayName !== undefined) updateData.display_name = updates.displayName;
    if (updates.onboardingCompleted !== undefined) updateData.onboarding_completed = updates.onboardingCompleted;
    if (updates.preferences !== undefined) updateData.preferences = updates.preferences;

    // Update Supabase database
    const { error } = await supabase
      .from('profiles')
      .update(updateData)
      .eq('id', uid);

    if (error) throw error;

    // Update local cache
    const currentProfile = await getUserProfile(uid);
    if (currentProfile) {
      const updatedProfile = { ...currentProfile, ...updates, updatedAt: now };
      await AsyncStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(updatedProfile));
    }

    console.log('✅ User profile updated successfully');
  } catch (error) {
    console.error('❌ Error updating user profile:', error);
    throw error;
  }
};

/**
 * Mark onboarding as completed
 */
export const markOnboardingCompleted = async (uid: string): Promise<void> => {
  try {
    await updateUserProfile(uid, { onboardingCompleted: true });
    await AsyncStorage.setItem(ONBOARDING_STATUS_KEY, 'true');
    console.log('✅ Onboarding marked as completed');
  } catch (error) {
    console.error('❌ Error marking onboarding as completed:', error);
    throw error;
  }
};

/**
 * Check if onboarding is completed (checks both Firestore and local storage)
 */
export const isOnboardingCompleted = async (uid: string): Promise<boolean> => {
  try {
    // Check Firestore first
    const profile = await getUserProfile(uid);
    if (profile) {
      const completed = profile.onboardingCompleted;
      // Sync with local storage
      await AsyncStorage.setItem(ONBOARDING_STATUS_KEY, completed.toString());
      return completed;
    }

    // Fallback to local storage
    const localStatus = await AsyncStorage.getItem(ONBOARDING_STATUS_KEY);
    return localStatus === 'true';
  } catch (error) {
    console.error('❌ Error checking onboarding status:', error);
    
    // Ultimate fallback to local storage only
    try {
      const localStatus = await AsyncStorage.getItem(ONBOARDING_STATUS_KEY);
      return localStatus === 'true';
    } catch (cacheError) {
      console.error('❌ Error reading local onboarding status:', cacheError);
      return false;
    }
  }
};

/**
 * Sync onboarding data to profile (name and other data from AsyncStorage)
 */
export const syncOnboardingDataToProfile = async (uid: string): Promise<void> => {
  try {
    // Get data from AsyncStorage that might have been saved during onboarding
    const userName = await AsyncStorage.getItem('@nudge_user_name');
    const userAge = await AsyncStorage.getItem('@nudge_user_age');
    const userGoals = await AsyncStorage.getItem('@nudge_user_goals');
    
    const updates: Partial<UserProfile> = {};
    
    if (userName) {
      updates.displayName = userName;
    }
    
    // Add other fields as needed
    if (userAge || userGoals) {
      updates.preferences = {
        ...updates.preferences,
        // Store additional onboarding data in preferences
      };
    }
    
    if (Object.keys(updates).length > 0) {
      await updateUserProfile(uid, updates);
      console.log('✅ Onboarding data synced to Firestore profile');
    }
  } catch (error) {
    console.error('❌ Error syncing onboarding data:', error);
  }
};

/**
 * Get consolidated user data from both AsyncStorage and Firestore
 */
export const getConsolidatedUserData = async (uid: string): Promise<{
  profile: UserProfile | null;
  localData: Record<string, string>;
}> => {
  try {
    const profile = await getUserProfile(uid);
    
    // Get all AsyncStorage data for display
    const keys = await AsyncStorage.getAllKeys();
    const stores = await AsyncStorage.multiGet(keys);
    const localData: Record<string, string> = {};
    
    stores.forEach(([key, value]) => {
      if (key.startsWith('@nudge_') && value) {
        localData[key] = value;
      }
    });
    
    return { profile, localData };
  } catch (error) {
    console.error('❌ Error getting consolidated user data:', error);
    return { profile: null, localData: {} };
  }
};

/**
 * Delete user profile permanently (for account deletion)
 */
export const deleteUserProfile = async (uid: string): Promise<void> => {
  try {
    // Delete from Supabase database
    const { error } = await supabase
      .from('profiles')
      .delete()
      .eq('id', uid);
    
    if (error) throw error;
    
    // Clear from local storage
    await AsyncStorage.removeItem(PROFILE_STORAGE_KEY);
    await AsyncStorage.removeItem(ONBOARDING_STATUS_KEY);
    
    // Also clear any other user-related data
    // Add more storage keys here if needed
    const allKeys = await AsyncStorage.getAllKeys();
    const userKeys = allKeys.filter(key => 
      key.includes(uid) || 
      key.includes('user_') || 
      key.includes('goals_') ||
      key.includes('gemini_')
    );
    
    if (userKeys.length > 0) {
      await AsyncStorage.multiRemove(userKeys);
    }
    
    console.log('✅ User profile and associated data deleted permanently');
  } catch (error) {
    console.error('❌ Error deleting user profile:', error);
    throw error;
  }
};

/**
 * Sync all local AsyncStorage data to Supabase database before logout
 */
export const syncAllDataToFirestore = async (uid: string): Promise<void> => {
  try {
    console.log('🔄 Starting comprehensive data sync to Supabase...');
    
    // Get all AsyncStorage data
    const keys = await AsyncStorage.getAllKeys();
    const stores = await AsyncStorage.multiGet(keys);
    
    // Extract specific data points with proper typing
    let userName: string | null = null;
    let onboardingCompleted = false;
    let goalsData: any = null;
    let goalHistoryData: any = null;
    let userProfileData: any = null;
    let otherData: Record<string, any> = {};
    
    // Process all nudge-related data and categorize it
    for (const [key, value] of stores) {
      if (!key.startsWith('@nudge_') || !value) continue;
      
      try {
        // Handle specific keys
        if (key === '@nudge_onboarding_user_name') {
          userName = value;
        } else if (key === '@nudge_onboarding_completed') {
          onboardingCompleted = value === 'true';
        } else if (key === '@nudge_user_goals') {
          goalsData = JSON.parse(value);
        } else if (key === '@nudge_goal_history') {
          goalHistoryData = JSON.parse(value);
        } else if (key === 'user_profile') {
          userProfileData = JSON.parse(value);
        } else {
          // Store other data in a separate object
          try {
            otherData[key] = JSON.parse(value);
          } catch {
            otherData[key] = value;
          }
        }
      } catch (parseError) {
        console.warn(`⚠️ Could not parse ${key}:`, parseError);
        otherData[key] = value;
      }
    }
    
    // Create a properly structured backup in Supabase with separate columns
    // Only include columns that exist in the current schema
    const backupData: any = {
      user_id: uid,
      synced_at: new Date().toISOString(),
      
      // Structured data in separate columns
      user_name: userName,
      onboarding_completed: onboardingCompleted,
      goals: goalsData,
      goal_history: goalHistoryData,
      user_profile: userProfileData,
    };
    
    // Only add additional_data if it exists AND has content
    // This column might not exist in older schemas
    if (Object.keys(otherData).length > 0) {
      backupData.additional_data = otherData;
    }
    
    console.log('📦 Backup data structure:', {
      user_name: userName,
      onboarding_completed: onboardingCompleted,
      has_goals: !!goalsData,
      has_history: !!goalHistoryData,
      has_profile: !!userProfileData,
      additional_keys: Object.keys(otherData).length,
    });
    
    // Save to Supabase user_backups table (upsert to replace existing)
    const { error } = await supabase
      .from('user_backups')
      .upsert(backupData, { onConflict: 'user_id' });
    
    if (error) throw error;
    
    // Also ensure the main profile is up to date with onboarding status and name
    const currentProfile = await getUserProfile(uid);
    if (currentProfile) {
      const profileUpdates: Partial<UserProfile> = {};
      
      // Sync onboarding status if different
      if (currentProfile.onboardingCompleted !== onboardingCompleted) {
        profileUpdates.onboardingCompleted = onboardingCompleted;
        console.log(`🔄 Syncing onboarding status: ${onboardingCompleted}`);
      }
      
      // Sync user name if available and different
      if (userName && currentProfile.displayName !== userName) {
        profileUpdates.displayName = userName;
        console.log(`🔄 Syncing user name: ${userName}`);
      }
      
      // Update profile if there are changes
      if (Object.keys(profileUpdates).length > 0) {
        await updateUserProfile(uid, profileUpdates);
      }
    }
    
    console.log('✅ Comprehensive data sync to Supabase completed');
  } catch (error) {
    console.error('❌ Error syncing data to Supabase:', error);
    // Don't throw - we want logout to continue even if sync fails
  }
};

/**
 * Clear user profile data (for logout)
 */
export const clearUserProfile = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(PROFILE_STORAGE_KEY);
    await AsyncStorage.removeItem(ONBOARDING_STATUS_KEY);
    console.log('✅ User profile data cleared');
  } catch (error) {
    console.error('❌ Error clearing user profile data:', error);
  }
};

/**
 * Restore user data from Supabase backup on login
 * This prevents users from having to go through onboarding again
 */
export const restoreUserDataFromBackup = async (uid: string): Promise<{
  restored: boolean;
  hadBackup: boolean;
  restoredItems: string[];
}> => {
  try {
    console.log('📥 Checking for user data backup...');
    
    // Query user_backups table for this user
    const { data, error } = await supabase
      .from('user_backups')
      .select('*')
      .eq('user_id', uid)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        // No backup found - this is fine for new users
        console.log('ℹ️ No backup found (new user or first login)');
        return { restored: false, hadBackup: false, restoredItems: [] };
      }
      throw error;
    }
    
    if (!data) {
      console.log('ℹ️ No backup data found');
      return { restored: false, hadBackup: false, restoredItems: [] };
    }
    
    console.log('📦 Backup found, restoring data...');
    const restoredItems: string[] = [];
    
    // Restore user name and onboarding status
    if (data.user_name) {
      await AsyncStorage.setItem('@nudge_onboarding_user_name', data.user_name);
      restoredItems.push('user_name');
      console.log('✅ Restored user name:', data.user_name);
    }
    
    if (data.onboarding_completed !== null && data.onboarding_completed !== undefined) {
      await AsyncStorage.setItem('@nudge_onboarding_completed', data.onboarding_completed.toString());
      restoredItems.push('onboarding_completed');
      console.log('✅ Restored onboarding status:', data.onboarding_completed);
    }
    
    // Restore goals
    if (data.goals) {
      await AsyncStorage.setItem('@nudge_user_goals', JSON.stringify(data.goals));
      restoredItems.push('goals');
      console.log('✅ Restored goals data');
    }
    
    // Restore goal history
    if (data.goal_history) {
      await AsyncStorage.setItem('@nudge_goal_history', JSON.stringify(data.goal_history));
      restoredItems.push('goal_history');
      console.log('✅ Restored goal history');
    }
    
    // Restore user profile
    if (data.user_profile) {
      await AsyncStorage.setItem('user_profile', JSON.stringify(data.user_profile));
      restoredItems.push('user_profile');
      console.log('✅ Restored user profile');
    }
    
    // Note: additional_data column is optional and may not exist in all schemas
    // If you need to restore additional data, add the column to your user_backups table first
    
    console.log(`✅ Data restoration complete! Restored ${restoredItems.length} items:`, restoredItems);
    return { restored: true, hadBackup: true, restoredItems };
    
  } catch (error) {
    console.error('❌ Error restoring user data from backup:', error);
    // Don't throw - login should continue even if restore fails
    return { restored: false, hadBackup: false, restoredItems: [] };
  }
};

export default {
  createUserProfile,
  getUserProfile,
  updateUserProfile,
  markOnboardingCompleted,
  isOnboardingCompleted,
  syncOnboardingDataToProfile,
  getConsolidatedUserData,
  syncAllDataToFirestore,
  restoreUserDataFromBackup,
  clearUserProfile,
  deleteUserProfile,
};