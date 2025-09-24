/**
 * Authentication Service
 * 
 * Handles Firebase Auth operations with Google Sign-In
 */

import {
    createUserWithEmailAndPassword,
    onAuthStateChanged,
    signInWithEmailAndPassword,
    signInWithPopup,
    signOut,
    User
} from 'firebase/auth';
import { Platform } from 'react-native';
import { auth, googleProvider } from '../config/firebase';

export interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  isEmailVerified: boolean;
}

/**
 * Convert Firebase User to AuthUser
 */
const convertFirebaseUser = (user: User): AuthUser => ({
  uid: user.uid,
  email: user.email,
  displayName: user.displayName,
  photoURL: user.photoURL,
  isEmailVerified: user.emailVerified
});

/**
 * Sign in with Google
 */
export const signInWithGoogle = async (): Promise<AuthUser> => {
  try {
    console.log('🔐 Starting Google Sign-In...');
    
    if (Platform.OS === 'web') {
      // Web platform - use popup
      const result = await signInWithPopup(auth, googleProvider);
      console.log('✅ Google Sign-In successful (popup)');
      return convertFirebaseUser(result.user);
    } else {
      // React Native platform - throw error since we need proper Google Sign-In setup
      throw new Error('Google Sign-In not properly configured for React Native. Please use @react-native-google-signin/google-signin or similar native solution.');
    }
  } catch (error: any) {
    console.error('❌ Google Sign-In failed:', error);
    throw new Error(`Google Sign-In failed: ${error.message}`);
  }
};

/**
 * Sign up with email and password
 */
export const signUpWithEmail = async (email: string, password: string): Promise<AuthUser> => {
  try {
    console.log('📧 Starting email sign-up...');
    const result = await createUserWithEmailAndPassword(auth, email, password);
    console.log('✅ Email sign-up successful');
    return convertFirebaseUser(result.user);
  } catch (error: any) {
    console.error('❌ Email sign-up failed:', error);
    throw new Error(`Email sign-up failed: ${error.message}`);
  }
};

/**
 * Sign in with email and password
 */
export const signInWithEmail = async (email: string, password: string): Promise<AuthUser> => {
  try {
    console.log('📧 Starting email sign-in...');
    const result = await signInWithEmailAndPassword(auth, email, password);
    console.log('✅ Email sign-in successful');
    return convertFirebaseUser(result.user);
  } catch (error: any) {
    console.error('❌ Email sign-in failed:', error);
    throw new Error(`Email sign-in failed: ${error.message}`);
  }
};

/**
 * Handle auth state persistence (React Native compatible)
 */
export const handleAuthPersistence = async (): Promise<AuthUser | null> => {
  try {
    // Simply return current user if available (Firebase handles persistence automatically with AsyncStorage)
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

/**
 * Sign out current user
 */
export const signOutUser = async (): Promise<void> => {
  try {
    await signOut(auth);
    console.log('👋 User signed out successfully');
  } catch (error: any) {
    console.error('❌ Sign out failed:', error);
    throw new Error(`Sign out failed: ${error.message}`);
  }
};

/**
 * Get current user
 */
export const getCurrentUser = (): AuthUser | null => {
  const user = auth.currentUser;
  return user ? convertFirebaseUser(user) : null;
};

/**
 * Listen to auth state changes
 */
export const onAuthStateChange = (callback: (user: AuthUser | null) => void) => {
  return onAuthStateChanged(auth, (user) => {
    callback(user ? convertFirebaseUser(user) : null);
  });
};

/**
 * Check if user is authenticated
 */
export const isAuthenticated = (): boolean => {
  return auth.currentUser !== null;
};

export default {
  signInWithGoogle,
  signUpWithEmail,
  signInWithEmail,
  handleAuthPersistence,
  signOutUser,
  getCurrentUser,
  onAuthStateChange,
  isAuthenticated
};