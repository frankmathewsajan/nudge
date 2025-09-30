/**
 * User Progress Service
 * 
 * Centralized service for managing user onboarding and goal progress persistence.
 * This abstracts away AsyncStorage details and provides a clean API for flow management.
 */

import { STORAGE_KEYS } from '@/constants/AppConstants';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface OnboardingStatus {
  isCompleted: boolean;
  userName: string | null;
}

export interface GoalsStatus {
  isCompleted: boolean;
  goals: any[] | null;
}

export class UserProgressService {
  
  /**
   * Get onboarding completion status and user name
   */
  async getOnboardingStatus(): Promise<OnboardingStatus> {
    try {
      const [completed, storedName] = await AsyncStorage.multiGet([
        STORAGE_KEYS.ONBOARDING_COMPLETED,
        STORAGE_KEYS.ONBOARDING_USER_NAME,
      ]);

      const isCompleted = completed[1] === 'true' && 
                         storedName[1] && 
                         storedName[1].trim() !== '';

      return {
        isCompleted: Boolean(isCompleted),
        userName: storedName[1] || null,
      };
    } catch (error) {
      console.error('Error getting onboarding status:', error);
      return { isCompleted: false, userName: null };
    }
  }

  /**
   * Mark onboarding as complete and save user name
   */
  async setOnboardingComplete(userName: string): Promise<void> {
    try {
      await AsyncStorage.multiSet([
        [STORAGE_KEYS.ONBOARDING_COMPLETED, 'true'],
        [STORAGE_KEYS.ONBOARDING_USER_NAME, userName.trim()],
      ]);
    } catch (error) {
      console.error('Error saving onboarding completion:', error);
      throw new Error('Failed to save onboarding progress');
    }
  }

  /**
   * Get goals completion status and saved goals
   */
  async getGoalsStatus(): Promise<GoalsStatus> {
    try {
      const [completed, savedGoals] = await AsyncStorage.multiGet([
        STORAGE_KEYS.GOALS_COMPLETED,
        STORAGE_KEYS.GOALS_USER_GOALS,
      ]);

      const isCompleted = completed[1] === 'true';
      let goals: any[] | null = null;

      if (savedGoals[1]) {
        try {
          goals = JSON.parse(savedGoals[1]);
        } catch (parseError) {
          console.error('Error parsing saved goals:', parseError);
        }
      }

      return { 
        isCompleted: Boolean(isCompleted), 
        goals 
      };
    } catch (error) {
      console.error('Error getting goals status:', error);
      return { isCompleted: false, goals: null };
    }
  }

  /**
   * Mark goals as complete and save goals data
   */
  async setGoalsComplete(goals: any[]): Promise<void> {
    try {
      await AsyncStorage.multiSet([
        [STORAGE_KEYS.GOALS_COMPLETED, 'true'],
        [STORAGE_KEYS.GOALS_USER_GOALS, JSON.stringify(goals)],
      ]);
    } catch (error) {
      console.error('Error saving goals completion:', error);
      throw new Error('Failed to save goals progress');
    }
  }

  /**
   * Reset all user progress (for testing/development)
   */
  async resetAllProgress(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([
        STORAGE_KEYS.ONBOARDING_COMPLETED,
        STORAGE_KEYS.GOALS_COMPLETED,
        STORAGE_KEYS.ONBOARDING_USER_NAME,
        STORAGE_KEYS.GOALS_USER_GOALS,
      ]);
    } catch (error) {
      console.error('Error resetting progress:', error);
      throw new Error('Failed to reset progress');
    }
  }

  /**
   * Get complete progress summary
   */
  async getProgressSummary() {
    const [onboarding, goals] = await Promise.all([
      this.getOnboardingStatus(),
      this.getGoalsStatus(),
    ]);

    return {
      onboarding,
      goals,
      isFullyComplete: onboarding.isCompleted && goals.isCompleted,
    };
  }
}

// Export singleton instance
export const userProgressService = new UserProgressService();
export default userProgressService;