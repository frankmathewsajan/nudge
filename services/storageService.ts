// Storage Service - Handles all data persistence
// Uses AsyncStorage with proper error handling

import { AsyncStorageUtils } from '@/utils/asyncStorage';

export class StorageService {
  private static instance: StorageService;
  
  private constructor() {}
  
  static getInstance(): StorageService {
    if (!StorageService.instance) {
      StorageService.instance = new StorageService();
    }
    return StorageService.instance;
  }

  /**
   * Save user onboarding completion status
   */
  async saveOnboardingComplete(): Promise<boolean> {
    try {
      return await AsyncStorageUtils.setString('@nudge_onboarding_complete', 'true');
    } catch (error) {
      console.error('Failed to save onboarding status:', error);
      return false;
    }
  }

  /**
   * Check if onboarding is complete
   */
  async isOnboardingComplete(): Promise<boolean> {
    try {
      const status = await AsyncStorageUtils.getString('@nudge_onboarding_complete');
      return status === 'true';
    } catch {
      return false;
    }
  }

  /**
   * Save user goals
   */
  async saveGoals(goals: any): Promise<boolean> {
    try {
      return await AsyncStorageUtils.setObject('@nudge_user_goals', goals);
    } catch (error) {
      console.error('Failed to save goals:', error);
      return false;
    }
  }

  /**
   * Load user goals
   */
  async loadGoals(): Promise<any | null> {
    try {
      return await AsyncStorageUtils.getObject('@nudge_user_goals');
    } catch {
      return null;
    }
  }

  /**
   * Check if user has existing data
   */
  async hasUserData(): Promise<boolean> {
    try {
      const goals = await this.loadGoals();
      const onboardingComplete = await this.isOnboardingComplete();
      return !!goals || onboardingComplete;
    } catch {
      return false;
    }
  }

  /**
   * Clear all user data
   */
  async clearUserData(): Promise<boolean> {
    try {
      await AsyncStorageUtils.removeItem('@nudge_onboarding_complete');
      await AsyncStorageUtils.removeItem('@nudge_user_goals');
      return true;
    } catch (error) {
      console.error('Failed to clear user data:', error);
      return false;
    }
  }
}

// Export singleton instance
export const storageService = StorageService.getInstance();