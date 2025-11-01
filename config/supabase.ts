/**
 * Supabase Configuration
 * 
 * Initializes Supabase client for authentication and database operations
 * with proper deep linking support for email verification
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import * as Linking from 'expo-linking';

// Supabase configuration from environment variables
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase environment variables');
  throw new Error('Supabase URL and Anon Key are required. Please set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY in your environment.');
}

// Get the app's deep link URL scheme
const redirectUrl = Linking.createURL('/');
console.log('🔗 Supabase redirect URL:', redirectUrl);

// Create Supabase client with React Native AsyncStorage for persistence
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true, // Enable URL detection for deep links
    flowType: 'pkce', // Use PKCE flow for mobile apps
  },
});

console.log('✅ Supabase client initialized');

export default supabase;
