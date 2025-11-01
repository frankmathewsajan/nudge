/**
 * Authentication Service
 *
 * Centralizes Supabase Auth interactions for email/password authentication.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import type { User } from '@supabase/supabase-js';
import { supabase } from '../../config/supabase';
import userProfileService from './userProfileService';

export interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  isEmailVerified: boolean;
}

// Cached current user for synchronous access
let cachedCurrentUser: AuthUser | null = null;

// Initialize cached user from session
supabase.auth.getSession().then(({ data: { session } }) => {
  cachedCurrentUser = session?.user ? convertSupabaseUser(session.user) : null;
});

// Update cache on auth state change
supabase.auth.onAuthStateChange((_event, session) => {
  cachedCurrentUser = session?.user ? convertSupabaseUser(session.user) : null;
});

const convertSupabaseUser = (user: User): AuthUser => ({
  uid: user.id,
  email: user.email ?? null,
  displayName: user.user_metadata?.display_name ?? user.user_metadata?.name ?? null,
  photoURL: user.user_metadata?.avatar_url ?? null,
  isEmailVerified: !!user.email_confirmed_at,
});// Signup rate limiting
let lastSignupAttempt: number = 0;
const SIGNUP_COOLDOWN = 5000; // 5 seconds between signup attempts

export const signUpWithEmail = async (
  email: string,
  password: string,
  displayName?: string,
): Promise<AuthUser> => {
  try {
    // Check signup rate limiting
    const now = Date.now();
    if (now - lastSignupAttempt < SIGNUP_COOLDOWN) {
      const remainingSeconds = Math.ceil((SIGNUP_COOLDOWN - (now - lastSignupAttempt)) / 1000);
      throw new Error(`Please wait ${remainingSeconds} seconds before trying to sign up again.`);
    }
    
    lastSignupAttempt = now;
    
    console.log('📝 Starting email sign-up with Supabase...');
    
    // Sign up with Supabase
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          display_name: displayName,
        },
      },
    });

    if (error) {
      console.error('❌ Supabase signup error:', error);
      throw error;
    }

    if (!data.user) {
      throw new Error('No user returned from Supabase signup');
    }
    
    // Automatically send email verification (Supabase handles this)
    logEmailSend('SIGNUP');
    console.log('✅ Verification email sent successfully');
    
    // Update the profile with display name (profile already created by trigger)
    if (displayName) {
      try {
        await userProfileService.updateUserProfile(data.user.id, { displayName });
        console.log('✅ Profile updated with display name');
      } catch (profileError) {
        console.warn('⚠️ Could not update profile with display name:', profileError);
        // Don't throw - signup was successful, profile update is optional
      }
    }
    
    console.log('✅ Email sign-up successful');
    return convertSupabaseUser(data.user);
  } catch (error: any) {
    console.error('❌ Email sign-up failed:', error);

    if (error.message?.includes('not enabled')) {
      throw new Error(
        'Email authentication is not enabled in Supabase Dashboard. Enable Email/Password auth in Supabase Dashboard.',
      );
    }
    if (error.message?.includes('Password')) {
      throw new Error('Password should be at least 6 characters long.');
    }
    if (error.message?.includes('already registered')) {
      throw new Error('This email is already registered. Try signing in instead.');
    }
    if (error.message?.includes('invalid email')) {
      throw new Error('Please enter a valid email address.');
    }
    if (error.message?.includes('too many')) {
      throw new Error('Too many requests. Please wait a few minutes before trying again.');
    }

    throw new Error(`Email sign-up failed: ${error.message}`);
  }
};

export const signInWithEmail = async (
  email: string,
  password: string,
): Promise<AuthUser> => {
  try {
    console.log('📧 Starting email sign-in with Supabase...');
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error('❌ Supabase signin error:', error);
      throw error;
    }

    if (!data.user) {
      throw new Error('No user returned from Supabase signin');
    }

    console.log('✅ Email sign-in successful');
    
    // Restore user data from backup (if exists)
    try {
      const restoreResult = await userProfileService.restoreUserDataFromBackup(data.user.id);
      if (restoreResult.restored) {
        console.log(`✅ Restored ${restoreResult.restoredItems.length} data items from backup`);
      } else if (!restoreResult.hadBackup) {
        console.log('ℹ️ No previous backup found (first time login or new user)');
      }
    } catch (restoreError) {
      console.warn('⚠️ Could not restore backup data:', restoreError);
      // Continue with login even if restore fails
    }
    
    return convertSupabaseUser(data.user);
  } catch (error: any) {
    console.error('❌ Email sign-in failed:', error);

    if (error.message?.includes('not enabled')) {
      throw new Error(
        'Email authentication is not enabled in Supabase Dashboard. Enable Email/Password auth in Supabase Dashboard.',
      );
    }
    if (error.message?.includes('Invalid login credentials')) {
      throw new Error('Invalid email or password. Please try again.');
    }
    if (error.message?.includes('Email not confirmed')) {
      throw new Error('Please verify your email before signing in.');
    }
    if (error.message?.includes('invalid email')) {
      throw new Error('Please enter a valid email address.');
    }
    if (error.message?.includes('disabled')) {
      throw new Error('This account has been disabled. Please contact support.');
    }
    if (error.message?.includes('too many')) {
      throw new Error('Too many requests. Please wait a few minutes before trying again.');
    }

    throw new Error(`Email sign-in failed: ${error.message}`);
  }
};

export const handleAuthPersistence = async (): Promise<AuthUser | null> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      console.log('✅ Restored auth state from persistence');
      
      // Check if we need to restore user data from backup
      // Only restore if local storage is empty (data was cleared)
      try {
        const hasLocalData = await AsyncStorage.getItem('@nudge_onboarding_completed');
        if (!hasLocalData) {
          console.log('🔄 Local data missing, attempting to restore from backup...');
          const restoreResult = await userProfileService.restoreUserDataFromBackup(user.id);
          if (restoreResult.restored) {
            console.log(`✅ Restored ${restoreResult.restoredItems.length} data items from backup`);
          }
        } else {
          console.log('ℹ️ Local data exists, skipping restore');
        }
      } catch (restoreError) {
        console.warn('⚠️ Could not check/restore backup data:', restoreError);
        // Continue anyway
      }
      
      return convertSupabaseUser(user);
    }
    return null;
  } catch (error: any) {
    console.error('❌ Auth persistence check failed:', error);
    return null;
  }
};

export const signOutUser = async (): Promise<void> => {
  try {
    console.log('🚪 Starting comprehensive sign out process...');
    
    // Get current user from Supabase
    const { data: { user } } = await supabase.auth.getUser();
    
    // If we have a user, sync all data to database first
    if (user) {
      console.log('🔄 Syncing local data to database before logout...');
      try {
        await userProfileService.syncAllDataToFirestore(user.id);
        console.log('✅ Data sync completed successfully');
      } catch (syncError) {
        console.warn('⚠️ Data sync failed, continuing with logout:', syncError);
        // Continue with logout even if sync fails
      }
    }
    
    // Clear user profile data from local storage
    await userProfileService.clearUserProfile();
    
    // Clear all other user data (goals, history, etc.)
    await clearAllUserData();
    
    // Sign out from Supabase
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    
    console.log('✅ User signed out successfully with data backup');
  } catch (error: any) {
    console.error('❌ Error signing out:', error);
    throw error;
  }
};

/**
 * Clear all user-related data from AsyncStorage
 */
const clearAllUserData = async (): Promise<void> => {
  try {
    console.log('🧹 Clearing all local user data...');
    
    // Get all AsyncStorage keys
    const allKeys = await AsyncStorage.getAllKeys();
    
    // Filter for @nudge_ keys and other user-related keys
    const userKeys = allKeys.filter((key: string) => 
      key.startsWith('@nudge_') || 
      key === 'user_profile' || 
      key === 'onboarding_completed' ||
      key.includes('gemini_cache') ||
      key.includes('user_')
    );
    
    // Remove all user-related keys
    if (userKeys.length > 0) {
      await AsyncStorage.multiRemove(userKeys);
      console.log(`✅ Cleared ${userKeys.length} user data keys:`, userKeys);
    }
    
    console.log('✅ All local user data cleared');
  } catch (error) {
    console.error('❌ Error clearing local user data:', error);
    // Don't throw - logout should continue
  }
};

export const getCurrentUser = (): AuthUser | null => {
  return cachedCurrentUser;
};

export const getCurrentUserAsync = async (): Promise<AuthUser | null> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    const authUser = user ? convertSupabaseUser(user) : null;
    cachedCurrentUser = authUser; // Update cache
    return authUser;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
};

export const onAuthStateChange = (callback: (user: AuthUser | null) => void) => {
  return supabase.auth.onAuthStateChange((_event, session) => {
    callback(session?.user ? convertSupabaseUser(session.user) : null);
  });
};

export const isAuthenticated = (): boolean => {
  return cachedCurrentUser !== null;
};

// Rate limiting for email verification
let lastEmailSent: number = 0;
const EMAIL_COOLDOWN = 60000; // 1 minute cooldown

// Debug utility to track email sends
const logEmailSend = (context: string) => {
  console.log(`📧 [${context}] Email verification requested at ${new Date().toISOString()}`);
};

export const sendEmailVerificationToCurrentUser = async (): Promise<void> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('No authenticated user found');
    }
    
    // Check if user is already verified
    if (user.email_confirmed_at) {
      console.log('📧 User email is already verified, skipping verification email');
      return;
    }
    
    // Check rate limiting
    const now = Date.now();
    if (now - lastEmailSent < EMAIL_COOLDOWN) {
      const remainingSeconds = Math.ceil((EMAIL_COOLDOWN - (now - lastEmailSent)) / 1000);
      throw new Error(`Please wait ${remainingSeconds} seconds before requesting another verification email.`);
    }
    
    logEmailSend('RESEND');
    console.log('📧 Sending email verification...');
    
    // Resend verification email
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: user.email!,
    });
    
    if (error) throw error;
    
    lastEmailSent = now;
    console.log('✅ Email verification sent successfully');
  } catch (error: any) {
    console.error('❌ Failed to send email verification:', error);
    throw error;
  }
};

export const checkEmailVerification = async (): Promise<boolean> => {
  const { data: { user } } = await supabase.auth.getUser();
  return user ? !!user.email_confirmed_at : false;
};

export const reloadUserAndCheckVerification = async (): Promise<boolean> => {
  try {
    // Refresh the session to get updated user data
    const { data: { session }, error } = await supabase.auth.refreshSession();
    if (error) throw error;
    
    return session?.user?.email_confirmed_at ? true : false;
  } catch (error: any) {
    console.error('❌ Error refreshing session:', error);
    return false;
  }
};

export const checkOnboardingStatus = async (): Promise<boolean> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return false;
    }
    
    return await userProfileService.isOnboardingCompleted(user.id);
  } catch (error) {
    console.error('❌ Error checking onboarding status:', error);
    return false;
  }
};

export const completeOnboarding = async (): Promise<void> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('No authenticated user found');
    }
    
    await userProfileService.markOnboardingCompleted(user.id);
    console.log('✅ Onboarding completed');
  } catch (error) {
    console.error('❌ Error completing onboarding:', error);
    throw error;
  }
};

/**
 * Delete Account
 * 
 * Permanently deletes the current user's account and all associated data
 */
export const deleteAccount = async (): Promise<{ success: boolean; error?: string }> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: 'No authenticated user found' };
    }

    console.log('🗑️ Deleting user account and data...');
    
    // First delete user profile data from database
    try {
      await userProfileService.deleteUserProfile(user.id);
      console.log('✅ User profile data deleted');
    } catch (profileError) {
      console.warn('⚠️ Error deleting profile data:', profileError);
      // Continue with account deletion even if profile deletion fails
    }

    // Delete the Supabase Auth account
    const { error } = await supabase.auth.admin.deleteUser(user.id);
    if (error) throw error;
    
    console.log('✅ Supabase Auth account deleted');

    return { success: true };
  } catch (error) {
    console.error('❌ Error deleting account:', error);
    
    if (error instanceof Error) {
      // Handle specific Firebase Auth errors
      if (error.message.includes('auth/requires-recent-login')) {
        return { 
          success: false, 
          error: 'For security reasons, please log out and log back in before deleting your account.' 
        };
      }
      return { success: false, error: error.message };
    }
    
    return { success: false, error: 'Failed to delete account' };
  }
};

export default {
  signUpWithEmail,
  signInWithEmail,
  sendEmailVerification: sendEmailVerificationToCurrentUser,
  checkEmailVerification,
  reloadUserAndCheckVerification,
  handleAuthPersistence,
  signOut: signOutUser,
  getCurrentUser,
  onAuthStateChange,
  isAuthenticated,
  checkOnboardingStatus,
  completeOnboarding,
  deleteAccount,
};