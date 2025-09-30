/**
 * Notification Utility for Expo
 * Handles scheduling and interactive notifications
 */

import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { logProductivityCheckin } from '../data/activity.utils';

// Configure notification handler - updated for latest SDK
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

/**
 * Platform-specific notification scheduling helper
 */
function createPlatformScheduleTrigger(hour: number, minute: number = 0): Notifications.NotificationTriggerInput {
  if (Platform.OS === 'ios') {
    // iOS supports calendar triggers
    return {
      type: Notifications.SchedulableTriggerInputTypes.CALENDAR,
      hour,
      minute,
      repeats: false,
    } as Notifications.CalendarTriggerInput;
  } else {
    // Android uses time interval
    const now = new Date();
    const targetTime = new Date();
    targetTime.setHours(hour, minute, 0, 0);
    
    const secondsUntilTarget = Math.max(0, (targetTime.getTime() - now.getTime()) / 1000);
    
    return {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: Math.round(secondsUntilTarget),
      channelId: 'productivity',
    } as Notifications.TimeIntervalTriggerInput;
  }
}

/**
 * Request notification permissions with latest SDK patterns
 */
export async function registerForPushNotificationsAsync(): Promise<string | null> {
  let token;

  if (Platform.OS === 'android') {
    // Create notification channel first for Android 8.0+
    await Notifications.setNotificationChannelAsync('default', {
      name: 'Default notifications',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#D4AF37',
      sound: 'default',
    });

    // Create productivity channel for categorized notifications
    await Notifications.setNotificationChannelAsync('productivity', {
      name: 'Productivity reminders',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#D4AF37',
      sound: 'default',
    });
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync({
      ios: {
        allowAlert: true,
        allowBadge: true,
        allowSound: true,
        allowDisplayInCarPlay: false,
        allowCriticalAlerts: false,
      },
    });
    finalStatus = status;
  }
  
  if (finalStatus !== 'granted') {
    console.log('Notification permission denied');
    return null;
  }
  
  try {
    // Updated for latest SDK - use projectId from expo config
    const tokenData = await Notifications.getExpoPushTokenAsync({
      projectId: process.env.EXPO_PUBLIC_PROJECT_ID,
    });
    token = tokenData?.data || null;
    console.log('Push token acquired:', token ? 'Success' : 'Failed');
  } catch (error) {
    console.log('Error getting push token:', error);
    token = null;
  }

  return token;
}

/**
 * Schedule a test notification with input capability
 */
export async function scheduleTestNotification(): Promise<void> {
  await registerForPushNotificationsAsync();
  
  const notificationId = await Notifications.scheduleNotificationAsync({
    content: {
      title: "Productivity Check-in",
      body: "How are you doing with your goals? Tap to quickly log your activity!",
      data: { 
        type: 'productivity_checkin',
        timestamp: Date.now()
      },
      categoryIdentifier: 'PRODUCTIVITY_ACTION',
      badge: 1,
      sound: 'default',
      priority: Platform.OS === 'android' ? 'high' : undefined,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: 5,
      channelId: Platform.OS === 'android' ? 'productivity' : undefined,
    },
  });

  console.log('Scheduled test notification:', notificationId);
}

/**
 * Schedule hourly productivity reminders
 */
export async function scheduleHourlyReminders(): Promise<void> {
  await registerForPushNotificationsAsync();
  
  // Cancel existing productivity notifications
  const scheduledNotifications = await Notifications.getAllScheduledNotificationsAsync();
  const productivityNotifications = scheduledNotifications.filter(
    notification => notification.content.data?.type === 'hourly_checkin'
  );
  
  for (const notification of productivityNotifications) {
    await Notifications.cancelScheduledNotificationAsync(notification.identifier);
  }
  
  const now = new Date();
  const currentHour = now.getHours();
  
  // Schedule notifications for remaining hours of the day (until 10 PM)
  const endHour = 22; // 10 PM
  let scheduledCount = 0;
  
  for (let hour = Math.max(currentHour + 1, 7); hour <= endHour; hour++) {
    // Calculate seconds until the target hour
    const targetTime = new Date();
    targetTime.setHours(hour, 0, 0, 0);
    
    const secondsUntilTarget = Math.max(0, (targetTime.getTime() - now.getTime()) / 1000);
    
    // Only schedule if the target time is in the future
    if (secondsUntilTarget > 0) {
      const trigger = createPlatformScheduleTrigger(hour, 0);
      
      await Notifications.scheduleNotificationAsync({
        content: {
          title: `${hour}:00 Productivity Check-in`,
          body: "Take a moment to reflect on your last hour. What did you accomplish?",
          data: { 
            type: 'hourly_checkin',
            hour,
            timestamp: Date.now()
          },
          categoryIdentifier: 'PRODUCTIVITY_ACTION',
          badge: 1,
          sound: 'default',
          priority: Platform.OS === 'android' ? 'high' : undefined,
        },
        trigger,
      });
      scheduledCount++;
    }
  }
  
  console.log(`Scheduled ${scheduledCount} hourly reminders from ${Math.max(currentHour + 1, 7)}:00 to ${endHour}:00`);
}

/**
 * Set up notification action categories
 */
export async function setupNotificationCategories(): Promise<void> {
  await Notifications.setNotificationCategoryAsync('PRODUCTIVITY_ACTION', [
    {
      identifier: 'QUICK_LOG',
      buttonTitle: 'Quick Log',
      options: {
        opensAppToForeground: true,
      },
    },
    {
      identifier: 'REMIND_LATER',
      buttonTitle: 'Remind in 30min',
      options: {
        opensAppToForeground: false,
      },
    },
    {
      identifier: 'MARK_PRODUCTIVE',
      buttonTitle: 'Was Productive',
      options: {
        opensAppToForeground: false,
      },
    },
  ]);
}

/**
 * Handle notification response
 */
export function handleNotificationResponse(response: Notifications.NotificationResponse): void {
  const { actionIdentifier, notification } = response;
  const notificationData = notification.request.content.data;
  
  console.log('Notification action:', actionIdentifier);
  console.log('Notification data:', notificationData);
  
  switch (actionIdentifier) {
    case 'QUICK_LOG':
      // Navigate to productivity tracker
      console.log('Opening app for quick logging');
      break;
    case 'REMIND_LATER':
      // Schedule reminder in 30 minutes
      Notifications.scheduleNotificationAsync({
        content: {
          title: notification.request.content.title,
          body: notification.request.content.body,
          data: notification.request.content.data,
          categoryIdentifier: notification.request.content.categoryIdentifier || undefined,
          badge: 1,
          sound: 'default',
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
          seconds: 30 * 60, // 30 minutes
          channelId: Platform.OS === 'android' ? 'productivity' : undefined,
        },
      });
      console.log('Notification snoozed for 30 minutes');
      break;
    case 'MARK_PRODUCTIVE':
      // Mark current hour as productive and log to activity data
      const hour = (notificationData as any)?.hour || new Date().getHours();
      logProductivityCheckin('Marked as productive via notification', hour);
      console.log('Marked as productive and logged to activity data');
      break;
    default:
      // Default tap - open app
      console.log('Notification tapped - opening app');
      break;
  }
}

/**
 * Cancel all scheduled notifications
 */
export async function cancelAllNotifications(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
  console.log('All notifications cancelled');
}

/**
 * Get scheduled notifications count
 */
export async function getScheduledNotificationsCount(): Promise<number> {
  const notifications = await Notifications.getAllScheduledNotificationsAsync();
  return notifications.length;
}

/**
 * Get notification permission status
 */
export async function getNotificationPermissionStatus(): Promise<string> {
  const { status } = await Notifications.getPermissionsAsync();
  return status;
}

/**
 * Set app badge count
 */
export async function setBadgeCount(count: number): Promise<boolean> {
  try {
    return await Notifications.setBadgeCountAsync(count);
  } catch (error) {
    console.log('Error setting badge count:', error);
    return false;
  }
}

/**
 * Get current badge count
 */
export async function getBadgeCount(): Promise<number> {
  try {
    return await Notifications.getBadgeCountAsync();
  } catch (error) {
    console.log('Error getting badge count:', error);
    return 0;
  }
}

/**
 * Clear all delivered notifications from notification tray
 */
export async function clearAllDeliveredNotifications(): Promise<void> {
  await Notifications.dismissAllNotificationsAsync();
  console.log('All delivered notifications cleared');
}

/**
 * Get all delivered notifications
 */
export async function getDeliveredNotifications(): Promise<Notifications.Notification[]> {
  try {
    return await Notifications.getPresentedNotificationsAsync();
  } catch (error) {
    console.log('Error getting delivered notifications:', error);
    return [];
  }
}
