/**
 * Sleep State Management Utility
 * Manages user's sleep/wake status and handles notification scheduling accordingly
 * Updated to use latest AsyncStorage best practices
 */

import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { AsyncStorageUtils } from './asyncStorage.utils';

export interface SleepSession {
  id: string;
  startTime: Date;
  endTime?: Date;
  duration?: number; // in hours
  isActive: boolean;
}

export interface SleepState {
  isAsleep: boolean;
  currentSession?: SleepSession;
  lastWakeTime?: Date;
  lastSleepTime?: Date;
  sleepHistory: SleepSession[];
}

const STORAGE_KEY = 'sleep_state';
const NOTIFICATION_TAG = 'hourly_productivity';

/**
 * Get current sleep state from storage using latest AsyncStorage patterns
 */
export async function getSleepState(): Promise<SleepState> {
  try {
    const stored = await AsyncStorageUtils.getObject<any>(STORAGE_KEY);
    if (stored) {
      // Convert date strings back to Date objects
      return {
        ...stored,
        lastWakeTime: stored.lastWakeTime ? new Date(stored.lastWakeTime) : undefined,
        lastSleepTime: stored.lastSleepTime ? new Date(stored.lastSleepTime) : undefined,
        currentSession: stored.currentSession ? {
          ...stored.currentSession,
          startTime: new Date(stored.currentSession.startTime),
          endTime: stored.currentSession.endTime ? new Date(stored.currentSession.endTime) : undefined,
        } : undefined,
        sleepHistory: stored.sleepHistory?.map((session: any) => ({
          ...session,
          startTime: new Date(session.startTime),
          endTime: session.endTime ? new Date(session.endTime) : undefined,
        })) || [],
      };
    }
  } catch (error) {
    console.error('Error getting sleep state:', error);
  }
  
  return {
    isAsleep: false,
    sleepHistory: [],
  };
}

/**
 * Save sleep state to storage using latest AsyncStorage patterns
 */
async function saveSleepState(state: SleepState): Promise<void> {
  try {
    const success = await AsyncStorageUtils.setObject(STORAGE_KEY, state);
    if (!success) {
      console.error('Failed to save sleep state');
    }
  } catch (error) {
    console.error('Error saving sleep state:', error);
  }
}

/**
 * Start sleep session and cancel notifications
 */
export async function startSleep(): Promise<void> {
  const currentState = await getSleepState();
  const now = new Date();
  
  // If already asleep, don't start a new session
  if (currentState.isAsleep) {
    console.log('User is already asleep');
    return;
  }
  
  const sessionId = `sleep_${now.getTime()}`;
  const newSession: SleepSession = {
    id: sessionId,
    startTime: now,
    isActive: true,
  };
  
  const newState: SleepState = {
    ...currentState,
    isAsleep: true,
    currentSession: newSession,
    lastSleepTime: now,
    sleepHistory: [...currentState.sleepHistory, newSession],
  };
  
  await saveSleepState(newState);
  
  // Cancel all scheduled productivity notifications
  await cancelProductivityNotifications();
  
  console.log('Sleep session started at:', now.toLocaleTimeString());
}

/**
 * End sleep session and reschedule notifications
 */
export async function wakeUp(): Promise<void> {
  const currentState = await getSleepState();
  const now = new Date();
  
  // If not asleep, nothing to do
  if (!currentState.isAsleep || !currentState.currentSession) {
    console.log('User is not asleep');
    return;
  }
  
  // Calculate sleep duration
  const sleepDuration = (now.getTime() - currentState.currentSession.startTime.getTime()) / (1000 * 60 * 60);
  
  // End current session
  const endedSession: SleepSession = {
    ...currentState.currentSession,
    endTime: now,
    duration: sleepDuration,
    isActive: false,
  };
  
  // Update sleep history
  const updatedHistory = currentState.sleepHistory.map(session => 
    session.id === endedSession.id ? endedSession : session
  );
  
  const newState: SleepState = {
    ...currentState,
    isAsleep: false,
    currentSession: undefined,
    lastWakeTime: now,
    sleepHistory: updatedHistory,
  };
  
  await saveSleepState(newState);
  
  // Schedule productivity notifications for awake hours
  await scheduleAwakeHourNotifications();
  
  console.log(`Wake up! Slept for ${sleepDuration.toFixed(1)} hours`);
}

/**
 * Cancel all productivity notifications
 */
async function cancelProductivityNotifications(): Promise<void> {
  try {
    const scheduledNotifications = await Notifications.getAllScheduledNotificationsAsync();
    
    // Filter and cancel productivity notifications
    const productivityNotifications = scheduledNotifications.filter(
      notification => notification.content.data?.type === 'hourly_checkin'
    );
    
    for (const notification of productivityNotifications) {
      await Notifications.cancelScheduledNotificationAsync(notification.identifier);
    }
    
    console.log(`Cancelled ${productivityNotifications.length} productivity notifications`);
  } catch (error) {
    console.error('Error cancelling productivity notifications:', error);
  }
}

/**
 * Platform-specific notification scheduling helper
 */
function createScheduleTrigger(hour: number, minute: number = 0): Notifications.NotificationTriggerInput {
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
 * Schedule notifications only for awake hours
 */
async function scheduleAwakeHourNotifications(): Promise<void> {
  try {
    // First cancel existing notifications
    await cancelProductivityNotifications();
    
    const now = new Date();
    const currentHour = now.getHours();
    
    // Schedule notifications for remaining hours of the day (until 10 PM)
    const endHour = 22; // 10 PM
    
    for (let hour = Math.max(currentHour + 1, 7); hour <= endHour; hour++) {
      // Calculate if this hour is still in the future
      const targetTime = new Date();
      targetTime.setHours(hour, 0, 0, 0);
      
      // Only schedule if the target time is in the future
      if (targetTime.getTime() > now.getTime()) {
        const trigger = createScheduleTrigger(hour, 0);
        
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
      }
    }
    
    console.log(`Scheduled productivity notifications from ${Math.max(currentHour + 1, 7)}:00 to ${endHour}:00`);
  } catch (error) {
    console.error('Error scheduling awake hour notifications:', error);
  }
}

/**
 * Check if user is currently asleep
 */
export async function isUserAsleep(): Promise<boolean> {
  const state = await getSleepState();
  return state.isAsleep;
}

/**
 * Get current sleep session if active
 */
export async function getCurrentSleepSession(): Promise<SleepSession | null> {
  const state = await getSleepState();
  return state.currentSession || null;
}

/**
 * Get sleep history
 */
export async function getSleepHistory(): Promise<SleepSession[]> {
  const state = await getSleepState();
  return state.sleepHistory;
}

/**
 * Get sleep statistics
 */
export async function getSleepStats(): Promise<{
  totalSessions: number;
  averageSleepDuration: number;
  lastSleepDuration?: number;
  totalSleepTime: number;
}> {
  const state = await getSleepState();
  const completedSessions = state.sleepHistory.filter(session => session.duration !== undefined);
  
  const totalSleepTime = completedSessions.reduce((sum, session) => sum + (session.duration || 0), 0);
  const averageSleepDuration = completedSessions.length > 0 ? totalSleepTime / completedSessions.length : 0;
  const lastSleepDuration = completedSessions[completedSessions.length - 1]?.duration;
  
  return {
    totalSessions: completedSessions.length,
    averageSleepDuration,
    lastSleepDuration,
    totalSleepTime,
  };
}

/**
 * Initialize sleep state on app start with AsyncStorage verification
 */
export async function initializeSleepState(): Promise<void> {
  try {
    // First verify AsyncStorage is working
    const isStorageAvailable = await AsyncStorageUtils.isAvailable();
    if (!isStorageAvailable) {
      console.warn('⚠️ AsyncStorage not available, sleep state will not persist');
    } else {
      console.log('✅ AsyncStorage verified and working');
    }

    const state = await getSleepState();
    
    // If user was marked as asleep but it's been more than 12 hours, auto-wake them
    if (state.isAsleep && state.currentSession) {
      const now = new Date();
      const sleepDuration = (now.getTime() - state.currentSession.startTime.getTime()) / (1000 * 60 * 60);
      
      if (sleepDuration > 12) {
        console.log('Auto-waking user after 12+ hours');
        await wakeUp();
      }
    }
    
    console.log('✅ Sleep state initialized successfully');
  } catch (error) {
    console.error('❌ Error initializing sleep state:', error);
    // Continue anyway - don't crash the app
  }
}
