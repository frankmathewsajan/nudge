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
