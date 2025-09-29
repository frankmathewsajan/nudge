/**
 * useAppFlow Hook - Application Flow State Management
 * 
 * Manages the entire app flow using a state machine pattern.
 * Extracts all state management, async logic, and flow control from components.
 */

import { useTheme } from '@/contexts/ThemeContext';
import authService, { AuthUser } from '@/services/authService';
import userProgressService from '@/services/userProgressService';
import { useEffect, useState } from 'react';

// State machine for app flow - prevents invalid state combinations
export type FlowStep = 
  | 'LOADING' 
  | 'AUTH' 
  | 'ONBOARDING' 
  | 'GOALS' 
  | 'MAIN' 
  | 'SETTINGS';

export interface AppFlowState {
  flowStep: FlowStep;
  currentUser: AuthUser | null;
  userName: string;
  isLoading: boolean;
}

export interface AppFlowActions {
  handleAuthSuccess: (user: AuthUser) => Promise<void>;
  handleOnboardingComplete: (name: string) => Promise<void>;
  handleGoalsComplete: (goals: any[]) => Promise<void>;
  handleOpenSettings: () => void;
  handleCloseSettings: () => void;
  handleLogout: () => Promise<void>;
}

export function useAppFlow(): AppFlowState & AppFlowActions {
  const { theme } = useTheme();
  
  // State machine - single source of truth
  const [flowStep, setFlowStep] = useState<FlowStep>('LOADING');
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [userName, setUserName] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Initialize app flow on mount
  useEffect(() => {
    checkInitialAppState();
  }, []);

  /**
   * Check authentication and progress status to determine initial flow step
   */
  const checkInitialAppState = async () => {
    try {
      setIsLoading(true);
      
      // Check authentication first
      const user = authService.getCurrentUser();
      if (!user) {
        setFlowStep('AUTH');
        setIsLoading(false);
        return;
      }

      setCurrentUser(user);
      
      // Check user progress to determine flow step
      await determineFlowStep(user);
      
    } catch (error) {
      console.error('Error checking initial app state:', error);
      // On any error, force authentication
      setFlowStep('AUTH');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Determine the correct flow step based on user progress
   */
  const determineFlowStep = async (user: AuthUser) => {
    try {
      const progress = await userProgressService.getProgressSummary();
      
      // Step 1: Check onboarding completion
      if (!progress.onboarding.isCompleted) {
        setFlowStep('ONBOARDING');
        setUserName('');
        return;
      }
      
      // Step 2: Check goals completion
      if (!progress.goals.isCompleted) {
        setUserName(progress.onboarding.userName || '');
        setFlowStep('GOALS');
        return;
      }
      
      // Step 3: Everything complete - show main app
      setUserName(progress.onboarding.userName || '');
      setFlowStep('MAIN');
      
    } catch (error) {
      console.error('Error determining flow step:', error);
      // Force onboarding on any error
      setFlowStep('ONBOARDING');
      setUserName('');
    }
  };

  /**
   * Handle successful authentication
   */
  const handleAuthSuccess = async (user: AuthUser) => {
    setCurrentUser(user);
    await determineFlowStep(user);
  };

  /**
   * Handle onboarding completion
   */
  const handleOnboardingComplete = async (name: string) => {
    try {
      await userProgressService.setOnboardingComplete(name);
      setUserName(name);
      setFlowStep('GOALS');
    } catch (error) {
      console.error('Error completing onboarding:', error);
      // Stay in onboarding on error
    }
  };

  /**
   * Handle goals completion
   */
  const handleGoalsComplete = async (goals: any[]) => {
    try {
      await userProgressService.setGoalsComplete(goals);
      setFlowStep('MAIN');
    } catch (error) {
      console.error('Error completing goals:', error);
      // Stay in goals on error
    }
  };

  /**
   * Handle opening settings overlay
   */
  const handleOpenSettings = () => {
    setFlowStep('SETTINGS');
  };

  /**
   * Handle closing settings overlay
   */
  const handleCloseSettings = () => {
    // Return to main app when closing settings
    setFlowStep('MAIN');
  };

  /**
   * Handle user logout
   */
  const handleLogout = async () => {
    try {
      await authService.signOut();
      setCurrentUser(null);
      setUserName('');
      setFlowStep('AUTH');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return {
    // State
    flowStep,
    currentUser,
    userName,
    isLoading,
    
    // Actions
    handleAuthSuccess,
    handleOnboardingComplete,
    handleGoalsComplete,
    handleOpenSettings,
    handleCloseSettings,
    handleLogout,
  };
}