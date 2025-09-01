/**
 * AsyncStorage wrapper with latest syntax and fallback for when native module is not available
 * Following latest @react-native-async-storage/async-storage documentation
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

// Enhanced storage utilities with latest best practices
export class AsyncStorageUtils {
  /**
   * Store string value with error handling
   */
  static async setString(key: string, value: string): Promise<boolean> {
    try {
      await AsyncStorage.setItem(key, value);
      return true;
    } catch (error) {
      console.error(`Error storing string for key ${key}:`, error);
      return false;
    }
  }

  /**
   * Store object value with JSON serialization
   */
  static async setObject(key: string, value: object): Promise<boolean> {
    try {
      const jsonValue = JSON.stringify(value);
      await AsyncStorage.setItem(key, jsonValue);
      return true;
    } catch (error) {
      console.error(`Error storing object for key ${key}:`, error);
      return false;
    }
  }

  /**
   * Get string value with null check
   */
  static async getString(key: string): Promise<string | null> {
    try {
      const value = await AsyncStorage.getItem(key);
      return value;
    } catch (error) {
      console.error(`Error reading string for key ${key}:`, error);
      return null;
    }
  }

  /**
   * Get object value with JSON parsing
   */
  static async getObject<T = any>(key: string): Promise<T | null> {
    try {
      const jsonValue = await AsyncStorage.getItem(key);
      return jsonValue != null ? JSON.parse(jsonValue) : null;
    } catch (error) {
      console.error(`Error reading object for key ${key}:`, error);
      return null;
    }
  }

  /**
   * Remove item with error handling
   */
  static async removeItem(key: string): Promise<boolean> {
    try {
      await AsyncStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error(`Error removing item for key ${key}:`, error);
      return false;
    }
  }

  /**
   * Clear all data with error handling
   */
  static async clear(): Promise<boolean> {
    try {
      await AsyncStorage.clear();
      return true;
    } catch (error) {
      console.error('Error clearing AsyncStorage:', error);
      return false;
    }
  }

  /**
   * Get all keys with error handling
   */
  static async getAllKeys(): Promise<string[]> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      return [...keys]; // Convert readonly array to mutable array
    } catch (error) {
      console.error('Error getting all keys:', error);
      return [];
    }
  }

  /**
   * Check if AsyncStorage is available
   */
  static async isAvailable(): Promise<boolean> {
    try {
      const testKey = '__asyncstorage_test__';
      await AsyncStorage.setItem(testKey, 'test');
      const testValue = await AsyncStorage.getItem(testKey);
      await AsyncStorage.removeItem(testKey);
      return testValue === 'test';
    } catch (error) {
      console.warn('AsyncStorage is not available:', error);
      return false;
    }
  }

  /**
   * Get multiple items at once (batch operation)
   */
  static async multiGet(keys: string[]): Promise<{ [key: string]: string | null }> {
    try {
      const keyValuePairs = await AsyncStorage.multiGet(keys);
      const result: { [key: string]: string | null } = {};
      keyValuePairs.forEach(([key, value]) => {
        result[key] = value;
      });
      return result;
    } catch (error) {
      console.error('Error in multiGet:', error);
      return {};
    }
  }

  /**
   * Set multiple items at once (batch operation)
   */
  static async multiSet(keyValuePairs: Array<[string, string]>): Promise<boolean> {
    try {
      await AsyncStorage.multiSet(keyValuePairs);
      return true;
    } catch (error) {
      console.error('Error in multiSet:', error);
      return false;
    }
  }

  /**
   * Remove multiple items at once (batch operation)
   */
  static async multiRemove(keys: string[]): Promise<boolean> {
    try {
      await AsyncStorage.multiRemove(keys);
      return true;
    } catch (error) {
      console.error('Error in multiRemove:', error);
      return false;
    }
  }
}

// Export default AsyncStorage for backward compatibility
export default AsyncStorage;
