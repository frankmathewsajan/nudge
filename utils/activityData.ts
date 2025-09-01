/**
 * Activity Data Management
 * Handles storing and retrieving daily activity data for the calendar
 */

import { AsyncStorageUtils } from './asyncStorage';

export interface HourlyActivity {
  hour: number;
  activities: string[];
  timestamp: Date;
}

export interface DayActivity {
  date: string; // YYYY-MM-DD format
  hourlyActivities: { [hour: number]: string[] };
  totalActivities: number;
  lastUpdated: Date;
}

const ACTIVITY_DATA_KEY = 'daily_activity_data';

/**
 * Get activity data for a specific date
 */
export async function getDayActivity(date: Date): Promise<DayActivity | null> {
  try {
    const dateKey = formatDateKey(date);
    const allData = await getAllActivityData();
    return allData[dateKey] || null;
  } catch (error) {
    console.error('Error getting day activity:', error);
    return null;
  }
}

/**
 * Add an activity to a specific date and hour
 */
export async function addHourlyActivity(
  date: Date, 
  hour: number, 
  activity: string
): Promise<boolean> {
  try {
    const dateKey = formatDateKey(date);
    const allData = await getAllActivityData();
    
    if (!allData[dateKey]) {
      allData[dateKey] = {
        date: dateKey,
        hourlyActivities: {},
        totalActivities: 0,
        lastUpdated: new Date(),
      };
    }
    
    // Initialize hour if it doesn't exist
    if (!allData[dateKey].hourlyActivities[hour]) {
      allData[dateKey].hourlyActivities[hour] = [];
    }
    
    // Add the activity
    allData[dateKey].hourlyActivities[hour].push(activity);
    allData[dateKey].totalActivities += 1;
    allData[dateKey].lastUpdated = new Date();
    
    // Save back to storage
    const success = await AsyncStorageUtils.setObject(ACTIVITY_DATA_KEY, allData);
    
    if (success) {
      console.log(`Added activity for ${dateKey} at ${hour}:00 - ${activity}`);
    }
    
    return success;
  } catch (error) {
    console.error('Error adding hourly activity:', error);
    return false;
  }
}

/**
 * Get all activity data
 */
export async function getAllActivityData(): Promise<{ [dateKey: string]: DayActivity }> {
  try {
    const data = await AsyncStorageUtils.getObject<{ [dateKey: string]: DayActivity }>(ACTIVITY_DATA_KEY);
    return data || {};
  } catch (error) {
    console.error('Error getting all activity data:', error);
    return {};
  }
}

/**
 * Get activity count for a specific date
 */
export async function getActivityCount(date: Date): Promise<number> {
  const dayActivity = await getDayActivity(date);
  return dayActivity?.totalActivities || 0;
}

/**
 * Get dates with activities in a month
 */
export async function getMonthActivityDates(year: number, month: number): Promise<string[]> {
  try {
    const allData = await getAllActivityData();
    const monthPrefix = `${year}-${String(month + 1).padStart(2, '0')}`;
    
    return Object.keys(allData).filter(dateKey => 
      dateKey.startsWith(monthPrefix) && allData[dateKey].totalActivities > 0
    );
  } catch (error) {
    console.error('Error getting month activity dates:', error);
    return [];
  }
}

/**
 * Log productivity check-in activity
 */
export async function logProductivityCheckin(
  activity: string,
  hour?: number
): Promise<boolean> {
  const now = new Date();
  const currentHour = hour || now.getHours();
  
  return await addHourlyActivity(now, currentHour, activity);
}

/**
 * Initialize sample data for testing
 */
export async function initializeSampleData(): Promise<void> {
  try {
    const existingData = await getAllActivityData();
    
    // Only add sample data if no data exists
    if (Object.keys(existingData).length > 0) {
      console.log('Activity data already exists, skipping sample data');
      return;
    }
    
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    
    // Add sample activities for today
    await addHourlyActivity(today, 9, 'Started DSA practice');
    await addHourlyActivity(today, 9, 'Read algorithm theory');
    await addHourlyActivity(today, 10, 'Solved 2 coding problems');
    await addHourlyActivity(today, 14, 'German lesson - Chapter 5');
    await addHourlyActivity(today, 16, 'Chess practice - 3 games');
    await addHourlyActivity(today, 18, 'Project work - Setup');
    
    // Add sample activities for yesterday
    await addHourlyActivity(yesterday, 8, 'Morning routine');
    await addHourlyActivity(yesterday, 9, 'DSA - Binary trees');
    await addHourlyActivity(yesterday, 11, 'Deep Learning quiz prep');
    await addHourlyActivity(yesterday, 15, 'German vocabulary');
    await addHourlyActivity(yesterday, 19, 'Chess tactics training');
    
    console.log('✅ Sample activity data initialized');
  } catch (error) {
    console.error('Error initializing sample data:', error);
  }
}

/**
 * Helper function to format date as YYYY-MM-DD
 */
export function formatDateKey(date: Date): string {
  return date.toISOString().split('T')[0];
}

/**
 * Parse date key back to Date object
 */
export function parseDateKey(dateKey: string): Date {
  return new Date(dateKey + 'T00:00:00.000Z');
}
