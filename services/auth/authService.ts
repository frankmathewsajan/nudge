/**
 * Authentication Service
 *
 * Centralizes Firebase Auth interactions for email/password authentication.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  createUserWithEmailAndPassword,
  deleteUser,
  onAuthStateChanged,
  sendEmailVerification,
  signInWithEmailAndPassword,
  signOut,
  User,
} from 'firebase/auth';

import { auth } from '../../config/firebase';
import userProfileService from './userProfileService';

export interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  isEmailVerified: boolean;
}

const convertFirebaseUser = (user: User): AuthUser => ({
  uid: user.uid,
  email: user.email,
  displayName: user.displayName,
  photoURL: user.photoURL,
  isEmailVerified: user.emailVerified,
});

// Signup rate limiting
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
    
    console.log('📝 Starting email sign-up...');
    const result = await createUserWithEmailAndPassword(auth, email, password);
    
    // Automatically send email verification (only once during signup)
    logEmailSend('SIGNUP');
    console.log('📧 Sending verification email...');
    await sendEmailVerification(result.user);
    console.log('✅ Verification email sent successfully');
    
    // Create user profile in Firestore with display name
    await userProfileService.createUserProfile(result.user.uid, email, displayName ? { displayName } : undefined);
    
    console.log('✅ Email sign-up successful and profile created');
    return convertFirebaseUser(result.user);
  } catch (error: any) {
    console.error('❌ Email sign-up failed:', error);

    if (error.code === 'auth/operation-not-allowed') {
      throw new Error(
        'Email authentication is not enabled in Firebase Console. Enable Email/Password auth in Firebase Console.',
      );
    }
    if (error.code === 'auth/weak-password') {
      throw new Error('Password should be at least 6 characters long.');
    }
    if (error.code === 'auth/email-already-in-use') {
      throw new Error('This email is already registered. Try signing in instead.');
    }
    if (error.code === 'auth/invalid-email') {
      throw new Error('Please enter a valid email address.');
    }
    if (error.code === 'auth/too-many-requests') {
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
    console.log('📧 Starting email sign-in...');
    const result = await signInWithEmailAndPassword(auth, email, password);
    console.log('✅ Email sign-in successful');
    return convertFirebaseUser(result.user);
  } catch (error: any) {
    console.error('❌ Email sign-in failed:', error);

    if (error.code === 'auth/operation-not-allowed') {
      throw new Error(
        'Email authentication is not enabled in Firebase Console. Enable Email/Password auth in Firebase Console.',
      );
    }
    if (error.code === 'auth/user-not-found') {
      throw new Error('No account found with this email. Please sign up first.');
    }
    if (error.code === 'auth/wrong-password') {
      throw new Error('Incorrect password. Please try again.');
    }
    if (error.code === 'auth/invalid-email') {
      throw new Error('Please enter a valid email address.');
    }
    if (error.code === 'auth/user-disabled') {
      throw new Error('This account has been disabled. Please contact support.');
    }
    if (error.code === 'auth/too-many-requests') {
      throw new Error('Too many requests. Please wait a few minutes before trying again.');
    }

    throw new Error(`Email sign-in failed: ${error.message}`);
  }
};

export const handleAuthPersistence = async (): Promise<AuthUser | null> => {
  try {
    const user = auth.currentUser;
    if (user) {
      console.log('✅ Restored auth state from persistence');
      return convertFirebaseUser(user);
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
    
    const currentUser = auth.currentUser;
    
    // If we have a user, sync all data to Firestore first
    if (currentUser) {
      console.log('🔄 Syncing local data to Firestore before logout...');
      try {
        await userProfileService.syncAllDataToFirestore(currentUser.uid);
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
    
    // Sign out from Firebase
    await signOut(auth);
    
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
  const user = auth.currentUser;
  return user ? convertFirebaseUser(user) : null;
};

export const onAuthStateChange = (callback: (user: AuthUser | null) => void) =>
  onAuthStateChanged(auth, (user) => {
    callback(user ? convertFirebaseUser(user) : null);
  });

export const isAuthenticated = (): boolean => auth.currentUser !== null;

// Rate limiting for email verification
let lastEmailSent: number = 0;
const EMAIL_COOLDOWN = 60000; // 1 minute cooldown

// Debug utility to track email sends
const logEmailSend = (context: string) => {
  console.log(`📧 [${context}] Email verification requested at ${new Date().toISOString()}`);
};

export const sendEmailVerificationToCurrentUser = async (): Promise<void> => {
  try {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('No authenticated user found');
    }
    
    // Check if user is already verified
    if (user.emailVerified) {
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
    await sendEmailVerification(user);
    lastEmailSent = now;
    console.log('✅ Email verification sent successfully');
  } catch (error: any) {
    console.error('❌ Failed to send email verification:', error);
    throw error;
  }
};

export const checkEmailVerification = (): boolean => {
  const user = auth.currentUser;
  return user ? user.emailVerified : false;
};

export const reloadUserAndCheckVerification = async (): Promise<boolean> => {
  try {
    const user = auth.currentUser;
    if (!user) {
      return false;
    }
    
    await user.reload();
    return user.emailVerified;
  } catch (error: any) {
    console.error('❌ Error reloading user:', error);
    return false;
  }
};

export const checkOnboardingStatus = async (): Promise<boolean> => {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      return false;
    }
    
    return await userProfileService.isOnboardingCompleted(currentUser.uid);
  } catch (error) {
    console.error('❌ Error checking onboarding status:', error);
    return false;
  }
};

export const completeOnboarding = async (): Promise<void> => {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error('No authenticated user found');
    }
    
    await userProfileService.markOnboardingCompleted(currentUser.uid);
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
    const currentUser = auth.currentUser;
    if (!currentUser) {
      return { success: false, error: 'No authenticated user found' };
    }

    console.log('🗑️ Deleting user account and data...');
    
    // First delete user profile data from Firestore
    try {
      await userProfileService.deleteUserProfile(currentUser.uid);
      console.log('✅ User profile data deleted');
    } catch (profileError) {
      console.warn('⚠️ Error deleting profile data:', profileError);
      // Continue with account deletion even if profile deletion fails
    }

    // Delete the Firebase Auth account
    await deleteUser(currentUser);
    console.log('✅ Firebase Auth account deleted');

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