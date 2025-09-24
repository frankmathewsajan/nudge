import { initializeApp } from 'firebase/app';

// Optionally import the services that you want to use
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';
import { getAI, GoogleAIBackend } from 'firebase/ai';
import { getAuth, GoogleAuthProvider, initializeAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';
import { Platform } from 'react-native';

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

// Initialize Firebase Auth with React Native AsyncStorage persistence
let auth: any;
try {
  // For React Native, initialize with AsyncStorage persistence
  if (Platform.OS !== 'web') {
    auth = initializeAuth(app, {
      persistence: ReactNativeAsyncStorage as any
    });
  } else {
    auth = getAuth(app);
  }
} catch (error) {
  // If auth is already initialized, get the existing instance
  auth = getAuth(app);
}

// Configure Google Auth Provider
const googleProvider = new GoogleAuthProvider();
googleProvider.addScope('profile');
googleProvider.addScope('email');

// Initialize other Firebase services
const storage = getStorage(app);
const ai = getAI(app, { backend: new GoogleAIBackend() });

// For more information on how to access Firebase in your project,
// see the Firebase documentation: https://firebase.google.com/docs/web/setup#access-firebase

export { ai, auth, googleProvider, storage };
export default app;