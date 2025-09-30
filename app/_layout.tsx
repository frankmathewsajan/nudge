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
import * as Notifications from 'expo-notifications';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
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

import { AuthUser } from '@/services/auth/authService';

// App state management hook
function useAppState() {
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [onboardingComplete, setOnboardingComplete] = useState(false);

  useEffect(() => {
    checkAppState();
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
