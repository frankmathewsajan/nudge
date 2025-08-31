import { TamaguiProvider } from '@tamagui/core';
import * as Notifications from 'expo-notifications';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import config from '../tamagui.config';
import { handleNotificationResponse, setupNotificationCategories } from '../utils/notifications';

// Hook for observing notification events - following latest SDK pattern
function useNotificationObserver() {
  useEffect(() => {
    let isMounted = true;

    function handleResponse(response: Notifications.NotificationResponse) {
      handleNotificationResponse(response);
    }

    // Check for initial notification response
    Notifications.getLastNotificationResponseAsync()
      .then(response => {
        if (!isMounted || !response?.notification) {
          return;
        }
        handleResponse(response);
      });

    // Subscribe to notification responses
    const responseSubscription = Notifications.addNotificationResponseReceivedListener(handleResponse);

    // Subscribe to notifications received while app is in foreground
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

export default function RootLayout() {
  useNotificationObserver();

  useEffect(() => {
    // Set up notification categories
    setupNotificationCategories();
  }, []);

  return (
    <SafeAreaProvider>
      <TamaguiProvider config={config}>
        <Stack>
          <Stack.Screen name="index" options={{ headerShown: false }} />
        </Stack>
        <StatusBar style="auto" />
      </TamaguiProvider>
    </SafeAreaProvider>
  );
}
