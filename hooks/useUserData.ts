/**
 * useUserData Hook - Simplified User State Management
 * 
 * Provides user authentication and progress data.
 * Used by individual screens that need user information.
 * Flow control is now handled by Expo Router layouts.
 */

import authService, { AuthUser } from '@/services/authService';
import userProgressService from '@/services/userProgressService';
import { useEffect, useState } from 'react';

export interface UserData {
  currentUser: AuthUser | null;
  userName: string;
  isLoading: boolean;
  onboardingCompleted: boolean;
  goalsCompleted: boolean;
}

export function useUserData(): UserData {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [userName, setUserName] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [onboardingCompleted, setOnboardingCompleted] = useState(false);
  const [goalsCompleted, setGoalsCompleted] = useState(false);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      setIsLoading(true);
      
      // Get current user
      const user = authService.getCurrentUser();
      setCurrentUser(user);

      if (user) {
        // Get user progress
        const progress = await userProgressService.getProgressSummary();
        setUserName(progress.onboarding.userName || '');
        setOnboardingCompleted(progress.onboarding.isCompleted);
        setGoalsCompleted(progress.goals.isCompleted);
      }
      
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    currentUser,
    userName,
    isLoading,
    onboardingCompleted,
    goalsCompleted,
  };
}