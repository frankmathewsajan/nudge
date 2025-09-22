// Storage Service - Handles all data persistence
// Uses AsyncStorage with proper error handling

import { AsyncStorageUtils } from '@/utils/asyncStorage';
import { GoalAnalysisResponse } from './geminiService';

export interface GoalHistoryItem {
  id: string;
  goalText: string;
  goalSummary: string;
  analysis: GoalAnalysisResponse;
  createdAt: string;
  timestamp: number;
}

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
      await AsyncStorageUtils.removeItem('@nudge_goal_history');
      return true;
    } catch (error) {
      console.error('Failed to clear user data:', error);
      return false;
    }
  }

  /**
   * Save goal analysis to history
   */
  async saveGoalAnalysis(goalText: string, goalSummary: string, analysis: GoalAnalysisResponse): Promise<boolean> {
    try {
      const history = await this.loadGoalHistory();
      const newItem: GoalHistoryItem = {
        id: Date.now().toString(),
        goalText,
        goalSummary,
        analysis,
        createdAt: new Date().toISOString(),
        timestamp: Date.now(),
      };
      
      const updatedHistory = [newItem, ...history].slice(0, 20); // Keep last 20 analyses
      return await AsyncStorageUtils.setObject('@nudge_goal_history', updatedHistory);
    } catch (error) {
      console.error('Failed to save goal analysis:', error);
      return false;
    }
  }

  /**
   * Load goal history
   */
  async loadGoalHistory(): Promise<GoalHistoryItem[]> {
    try {
      const history = await AsyncStorageUtils.getObject('@nudge_goal_history');
      return Array.isArray(history) ? history : [];
    } catch {
      return [];
    }
  }

  /**
   * Delete goal analysis from history
   */
  async deleteGoalAnalysis(id: string): Promise<boolean> {
    try {
      const history = await this.loadGoalHistory();
      const updatedHistory = history.filter(item => item.id !== id);
      return await AsyncStorageUtils.setObject('@nudge_goal_history', updatedHistory);
    } catch (error) {
      console.error('Failed to delete goal analysis:', error);
      return false;
    }
  }
}

// Export singleton instance
export const storageService = StorageService.getInstance();