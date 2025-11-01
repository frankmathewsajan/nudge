/**
 * Root Layout - Expo Router Best Practices
 * 
 * Provides global providers and conditional rendering based on auth state.
 * Uses proper Expo Router patterns instead of programmatic redirects.
 */

import { AuthScreen } from '@/components/auth/AuthScreen.component';
import { FormOnboarding } from '@/components/onboarding/FormOnboarding.component';
import { LoadingScreen } from '@/components/ui/LoadingScreen.component';
import authService from '@/services/auth/authService';
import userProgressService from '@/services/storage/userProgressService';
import config from '@/tamagui.config';
import { initializeSleepState } from '@/utils/data/sleepState.utils';
import { handleNotificationResponse, setupNotificationCategories } from '@/utils/system/notifications.utils';
import { TamaguiProvider } from '@tamagui/core';
import * as Linking from 'expo-linking';
import * as Notifications from 'expo-notifications';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { Alert } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ThemeProvider } from '../contexts/ThemeContext';

// Hook for observing notification events
function useNotificationObserver() {
  useEffect(() => {
    let isMounted = true;

    function handleResponse(response: Notifications.NotificationResponse) {
      handleNotificationResponse(response);
    }

    Notifications.getLastNotificationResponseAsync()
      .then(response => {
        if (!isMounted || !response?.notification) {
          return;
        }
        handleResponse(response);
      });

    const responseSubscription = Notifications.addNotificationResponseReceivedListener(handleResponse);
    const receivedSubscription = Notifications.addNotificationReceivedListener(
      (notification) => {
        console.log('Notification received in foreground:', notification);
      }
    );

    return () => {
      isMounted = false;
      responseSubscription.remove();
      receivedSubscription.remove();
    };
  }, []);
}

// Hook for handling deep links (email verification, etc.)
function useDeepLinking(refreshState: () => void) {
  useEffect(() => {
    // Handle the initial URL if app was opened from a link
    Linking.getInitialURL().then((url) => {
      if (url) {
        console.log('📱 App opened with URL:', url);
        handleDeepLink(url, refreshState);
      }
    });

    // Listen for incoming URLs while app is running
    const subscription = Linking.addEventListener('url', ({ url }) => {
      console.log('📱 Deep link received:', url);
      handleDeepLink(url, refreshState);
    });

    return () => {
      subscription.remove();
    };
  }, [refreshState]);
}

// Handle deep link URLs from Supabase
async function handleDeepLink(url: string, refreshState: () => void) {
  try {
    console.log('🔗 Processing deep link:', url);
    
    // Check if it's a Supabase auth callback
    if (url.includes('auth/v1/verify') || url.includes('#access_token=')) {
      console.log('🔐 Supabase auth callback detected');
      
      // Wait a moment for Supabase to process the callback
      setTimeout(async () => {
        const isVerified = await authService.reloadUserAndCheckVerification();
        if (isVerified) {
          console.log('✅ Email verified via deep link');
          Alert.alert(
            'Email Verified! 🎉',
            'Your email has been successfully verified. Welcome!',
            [{ text: 'Continue' }]
          );
          refreshState();
        }
      }, 1000);
    }
  } catch (error) {
    console.error('❌ Error handling deep link:', error);
  }
}

import { AuthUser } from '@/services/auth/authService';

// App state management hook
function useAppState() {
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [onboardingComplete, setOnboardingComplete] = useState(false);

  useEffect(() => {
    checkAppState();
    
    // Listen for auth state changes (logout, login, etc.)
    const { data: { subscription } } = authService.onAuthStateChange(async (authUser) => {
      console.log('🔄 Auth state changed:', authUser ? `User: ${authUser.email}` : 'User signed out');
      setUser(authUser);
      
      if (authUser) {
        // User logged in - check onboarding status
        try {
          const progress = await userProgressService.getProgressSummary();
          setOnboardingComplete(progress.onboarding.isCompleted);
        } catch (error) {
          console.error('Error checking onboarding:', error);
          setOnboardingComplete(false);
        }
      } else {
        // User logged out - reset state
        setOnboardingComplete(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const checkAppState = async () => {
    try {
      const currentUser = authService.getCurrentUser();
      setUser(currentUser);

      if (currentUser) {
        const progress = await userProgressService.getProgressSummary();
        setOnboardingComplete(progress.onboarding.isCompleted);
      }
    } catch (error) {
      console.error('Error checking app state:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    user,
    onboardingComplete,
    refreshState: checkAppState
  };
}

export default function RootLayout() {
  useNotificationObserver();
  const { isLoading, user, onboardingComplete, refreshState } = useAppState();
  
  // Handle deep links for email verification
  useDeepLinking(refreshState);

  useEffect(() => {
    setupNotificationCategories();
    initializeSleepState();
  }, []);

  if (isLoading) {
    return (
      <SafeAreaProvider>
        <ThemeProvider>
          <TamaguiProvider config={config}>
            <LoadingScreen />
            <StatusBar style="auto" />
          </TamaguiProvider>
        </ThemeProvider>
      </SafeAreaProvider>
    );
  }

  // Conditional rendering based on app state - proper Expo Router pattern
  if (!user) {
    return (
      <SafeAreaProvider>
        <ThemeProvider>
          <TamaguiProvider config={config}>
            <AuthScreen onAuthSuccess={refreshState} />
            <StatusBar style="auto" />
          </TamaguiProvider>
        </ThemeProvider>
      </SafeAreaProvider>
    );
  }

  if (!onboardingComplete) {
    return (
      <SafeAreaProvider>
        <ThemeProvider>
          <TamaguiProvider config={config}>
            <FormOnboarding onComplete={async (userName: string) => {
              try {
                // Save onboarding completion to storage
                await userProgressService.setOnboardingComplete(userName);
                // Refresh app state to trigger navigation
                refreshState();
              } catch (error) {
                console.error('❌ Error saving onboarding completion:', error);
              }
            }} />
            <StatusBar style="auto" />
          </TamaguiProvider>
        </ThemeProvider>
      </SafeAreaProvider>
    );
  }

  // Main app navigation - Goals Collection IS the main app!
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <TamaguiProvider config={config}>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
            <Stack.Screen 
              name="modal/settings" 
              options={{ 
                presentation: 'modal',
                headerShown: false
              }} 
            />
            <Stack.Screen 
              name="modal/side-menu" 
              options={{ 
                presentation: 'modal',
                headerShown: false,
                animation: 'slide_from_left'
              }} 
            />
          </Stack>
          <StatusBar style="auto" />
        </TamaguiProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
