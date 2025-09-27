import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';
import { getAI, GoogleAIBackend } from 'firebase/ai';
import { initializeApp } from 'firebase/app';
import { getAuth, initializeAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Initialize Firebase
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY!,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN!,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID!,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET!,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID!,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID!,
  measurementId: process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID!
};

const app = initializeApp(firebaseConfig);

// Import getReactNativePersistence dynamically to avoid TypeScript issues
const getReactNativePersistence = (() => {
  try {
    // Try to get the official function
    const authModule = require('firebase/auth');
    if (authModule.getReactNativePersistence) {
      return authModule.getReactNativePersistence;
    }
  } catch (error) {
    console.warn('Official getReactNativePersistence not available, using fallback');
  }
  
  // Fallback implementation
  return (storage: typeof ReactNativeAsyncStorage) => ({
    type: 'LOCAL' as const,
    _isAvailable: () => Promise.resolve(true),
    _set: (key: string, value: string) => storage.setItem(key, value),
    _get: (key: string) => storage.getItem(key),
    _remove: (key: string) => storage.removeItem(key),
  });
})();

// Initialize Firebase Auth with AsyncStorage for React Native
let auth: any;
try {
  // Initialize auth with React Native AsyncStorage persistence
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(ReactNativeAsyncStorage)
  });
  console.log('✅ Firebase Auth initialized with AsyncStorage persistence');
} catch (error: any) {
  // If auth is already initialized, get the existing instance
  console.log('⚠️ Auth already initialized, using existing instance:', error.message);
  auth = getAuth(app);
}

// Email/Password authentication only - no Google Sign-In needed

// Initialize other Firebase services
const firestore = getFirestore(app);
const storage = getStorage(app);
const ai = getAI(app, { backend: new GoogleAIBackend() });

// For more information on how to access Firebase in your project,
// see the Firebase documentation: https://firebase.google.com/docs/web/setup#access-firebase

export { ai, app, auth, firestore, getAuth, storage };
export default app;