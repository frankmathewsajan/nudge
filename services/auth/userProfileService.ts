/**
 * User Profile Service
 * 
 * Handles user profile management with Firestore and local storage sync
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { deleteDoc, doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { firestore } from '../../config/firebase';

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
 * Create a new user profile in Firestore
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

    const userDocRef = doc(firestore, 'profiles', uid);
    await setDoc(userDocRef, profileData);

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
 * Get user profile from Firestore (with local cache fallback)
 */
export const getUserProfile = async (uid: string): Promise<UserProfile | null> => {
  try {
    // Try to get from Firestore first
    const userDocRef = doc(firestore, 'profiles', uid);
    const docSnap = await getDoc(userDocRef);
    
    if (docSnap.exists()) {
      const profileData = {
        ...docSnap.data(),
        createdAt: docSnap.data().createdAt?.toDate?.() || docSnap.data().createdAt,
        updatedAt: docSnap.data().updatedAt?.toDate?.() || docSnap.data().updatedAt,
      } as UserProfile;
      
      // Update local cache
      await AsyncStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profileData));
      
      return profileData;
    }

    // Fallback to local storage if Firestore fails
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
        console.log('📱 Using cached user profile (Firestore error)');
        return JSON.parse(cachedProfile);
      }
    } catch (cacheError) {
      console.error('❌ Error reading cached profile:', cacheError);
    }
    
    return null;
  }
};

/**
 * Update user profile in Firestore and local storage
 */
export const updateUserProfile = async (uid: string, updates: Partial<UserProfile>): Promise<void> => {
  try {
    const updateData = {
      ...updates,
      updatedAt: new Date(),
    };

    // Update Firestore
    const userDocRef = doc(firestore, 'profiles', uid);
    await updateDoc(userDocRef, updateData);

    // Update local cache
    const currentProfile = await getUserProfile(uid);
    if (currentProfile) {
      const updatedProfile = { ...currentProfile, ...updateData };
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
    // Delete from Firestore
    const userDocRef = doc(firestore, 'profiles', uid);
    await deleteDoc(userDocRef);
    
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
 * Sync all local AsyncStorage data to Firestore before logout
 */
export const syncAllDataToFirestore = async (uid: string): Promise<void> => {
  try {
    console.log('🔄 Starting comprehensive data sync to Firestore...');
    
    // Get all AsyncStorage data
    const keys = await AsyncStorage.getAllKeys();
    const stores = await AsyncStorage.multiGet(keys);
    const localData: Record<string, any> = {};
    
    // Process all nudge-related data
    for (const [key, value] of stores) {
      if (key.startsWith('@nudge_') && value) {
        try {
          // Try to parse as JSON, fallback to string
          localData[key] = JSON.parse(value);
        } catch {
          localData[key] = value;
        }
      }
    }
    
    // Create a comprehensive backup document in Firestore
    const backupData = {
      uid,
      syncedAt: new Date(),
      data: localData,
      // Include specific data types for easier access
      goals: localData['@nudge_user_goals'] || null,
      goalHistory: localData['@nudge_goal_history'] || null,
      onboardingComplete: localData['@nudge_onboarding_complete'] || null,
      userProfile: localData['user_profile'] || null,
      // Add any other specific data we want to track
    };
    
    // Save to Firestore user_backups collection
    const backupDocRef = doc(firestore, 'user_backups', uid);
    await setDoc(backupDocRef, backupData);
    
    // Also ensure the main profile is up to date
    const currentProfile = await getUserProfile(uid);
    if (currentProfile) {
      // Update profile with any local changes
      const profileUpdates: Partial<UserProfile> = {
        updatedAt: new Date(),
      };
      
      // Sync onboarding status if different
      const localOnboarding = localData['@nudge_onboarding_complete'] === 'true';
      if (currentProfile.onboardingCompleted !== localOnboarding) {
        profileUpdates.onboardingCompleted = localOnboarding;
      }
      
      // Update profile if there are changes
      if (Object.keys(profileUpdates).length > 1) { // More than just updatedAt
        await updateUserProfile(uid, profileUpdates);
      }
    }
    
    console.log('✅ Comprehensive data sync to Firestore completed');
  } catch (error) {
    console.error('❌ Error syncing data to Firestore:', error);
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

export default {
  createUserProfile,
  getUserProfile,
  updateUserProfile,
  markOnboardingCompleted,
  isOnboardingCompleted,
  syncOnboardingDataToProfile,
  getConsolidatedUserData,
  syncAllDataToFirestore,
  clearUserProfile,
  deleteUserProfile,
};