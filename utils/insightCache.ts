/**
 * Insight Cache Utility
 * Handles caching of daily reports and insights to prevent unnecessary API requests
 */

import type { DailyReport } from './geminiAI';

interface CacheEntry {
  data: DailyReport;
  timestamp: number;
  inputHash: string;
}

interface ActivityCache {
  userId: string;
  activities: string[];
  lastUpdated: number;
}

// Cache storage
const reportCache: { [key: string]: CacheEntry } = {};
const activityCache: { [key: string]: ActivityCache } = {};

// Cache configuration
const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes
const ACTIVITY_CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

/**
 * Generate a hash of user inputs/activities for cache key
 */
export const generateInputHash = (userId: string, activities: string[]): string => {
  const today = new Date().toDateString();
  const activitiesString = activities.join('|');
  return `${userId}-${today}-${btoa(activitiesString).slice(0, 16)}`;
};

/**
 * Get cache key for daily reports
 */
export const getReportCacheKey = (userId: string): string => {
  const today = new Date().toDateString();
  return `report-${userId}-${today}`;
};

/**
 * Get cache key for activities
 */
export const getActivityCacheKey = (userId: string): string => {
  const today = new Date().toDateString();
  return `activity-${userId}-${today}`;
};

/**
 * Check if a cache entry is still valid
 */
export const isCacheValid = (timestamp: number, duration: number = CACHE_DURATION): boolean => {
  return Date.now() - timestamp < duration;
};

/**
 * Get cached daily report if available and valid
 */
export const getCachedReport = (userId: string, currentInputHash: string): DailyReport | null => {
  const cacheKey = getReportCacheKey(userId);
  const cachedEntry = reportCache[cacheKey];
  
  if (cachedEntry && 
      isCacheValid(cachedEntry.timestamp) &&
      cachedEntry.inputHash === currentInputHash) {
    return cachedEntry.data;
  }
  
  return null;
};

/**
 * Cache a daily report
 */
export const cacheReport = (userId: string, report: DailyReport, inputHash: string): void => {
  const cacheKey = getReportCacheKey(userId);
  reportCache[cacheKey] = {
    data: report,
    timestamp: Date.now(),
    inputHash
  };
};

/**
 * Get cached activities for a user
 */
export const getCachedActivities = (userId: string): string[] => {
  const cacheKey = getActivityCacheKey(userId);
  const cached = activityCache[cacheKey];
  
  if (cached && isCacheValid(cached.lastUpdated, ACTIVITY_CACHE_DURATION)) {
    return cached.activities;
  }
  
  return [];
};

/**
 * Add activity to cache
 */
export const addActivityToCache = (userId: string, activity: string): void => {
  const cacheKey = getActivityCacheKey(userId);
  const existing = activityCache[cacheKey];
  
  if (existing) {
    existing.activities.push(activity);
    existing.lastUpdated = Date.now();
  } else {
    activityCache[cacheKey] = {
      userId,
      activities: [activity],
      lastUpdated: Date.now()
    };
  }
};

/**
 * Clear expired cache entries
 */
export const clearExpiredCache = (): void => {
  const now = Date.now();
  
  // Clear expired report cache
  Object.keys(reportCache).forEach(key => {
    if (!isCacheValid(reportCache[key].timestamp)) {
      delete reportCache[key];
    }
  });
  
  // Clear expired activity cache
  Object.keys(activityCache).forEach(key => {
    if (!isCacheValid(activityCache[key].lastUpdated, ACTIVITY_CACHE_DURATION)) {
      delete activityCache[key];
    }
  });
};

/**
 * Get cache statistics for debugging
 */
export const getCacheStats = () => {
  return {
    reportCacheSize: Object.keys(reportCache).length,
    activityCacheSize: Object.keys(activityCache).length,
    totalActivities: Object.values(activityCache).reduce((sum, cache) => sum + cache.activities.length, 0)
  };
};

// Clean up expired entries every 10 minutes
setInterval(clearExpiredCache, 10 * 60 * 1000);
