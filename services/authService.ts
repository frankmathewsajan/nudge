/**
 * Authentication Service
 *
 * Centralizes Firebase Auth interactions for email/password authentication.
 */

import {
    createUserWithEmailAndPassword,
    onAuthStateChanged,
    sendEmailVerification,
    signInWithEmailAndPassword,
    signOut,
    User,
} from 'firebase/auth';

import { auth } from '../config/firebase';

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

export const signUpWithEmail = async (
  email: string,
  password: string,
): Promise<AuthUser> => {
  try {
    console.log('� Starting email sign-up...');
    const result = await createUserWithEmailAndPassword(auth, email, password);
    console.log('✅ Email sign-up successful');
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
    await signOut(auth);
    console.log('👋 User signed out successfully');
  } catch (error: any) {
    console.error('❌ Sign out failed:', error);
    throw new Error(`Sign out failed: ${error.message}`);
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

export const sendEmailVerificationToCurrentUser = async (): Promise<void> => {
  try {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('No authenticated user found');
    }
    
    console.log('📧 Sending email verification...');
    await sendEmailVerification(user);
    console.log('✅ Email verification sent successfully');
  } catch (error: any) {
    console.error('❌ Failed to send email verification:', error);
    throw error;
  }
};

export default {
  signUpWithEmail,
  signInWithEmail,
  sendEmailVerification: sendEmailVerificationToCurrentUser,
  handleAuthPersistence,
  signOutUser,
  getCurrentUser,
  onAuthStateChange,
  isAuthenticated,
};