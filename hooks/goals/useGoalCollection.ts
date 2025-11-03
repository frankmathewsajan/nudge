/**
 * useGoalCollection - Goal collection business logic
 * 
 * Manages user goal input, validation, and submission.
 * Separated from UI for clean architecture and testability.
 */

import authService from '@/services/auth/authService';
import promptService from '@/services/prompts/promptService';
import { useCallback, useState } from 'react';

interface Goal {
  id: string;
  text: string;
  createdAt: Date;
  category?: string;
}

interface GoalCollectionState {
  currentGoal: string;
  goals: Goal[];
  isSubmitting: boolean;
  isValid: boolean;
}

interface GoalCollectionController {
  state: GoalCollectionState;
  handlers: {
    updateCurrentGoal: (text: string) => void;
    submitGoal: () => void;
    clearCurrentGoal: () => void;
    removeGoal: (id: string) => void;
  };
}

/**
 * Hook for managing goal collection flow.
 * 
 * Provides clean separation between goal management logic and UI.
 * Validates input and manages goal submission state.
 */
export const useGoalCollection = (
  onGoalSubmitted?: (goal: Goal) => void,
  onAllGoalsComplete?: (goals: Goal[]) => void
): GoalCollectionController => {
  const [currentGoal, setCurrentGoal] = useState('');
  const [goals, setGoals] = useState<Goal[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Validation logic - goal must be meaningful
  const isValid = currentGoal.trim().length >= 3;

  const updateCurrentGoal = useCallback((text: string) => {
    setCurrentGoal(text);
  }, []);

  const submitGoal = useCallback(async () => {
    if (!isValid || isSubmitting) return;

    setIsSubmitting(true);

    try {
      const newGoal: Goal = {
        id: Date.now().toString(),
        text: currentGoal.trim(),
        createdAt: new Date(),
      };

      // Save to Supabase prompts table
      const currentUser = authService.getCurrentUser();
      if (currentUser) {
        await promptService.savePrompt(currentGoal.trim(), currentUser.uid);
      } else {
        console.warn('⚠️ No user found, goal saved locally only');
      }

      setGoals(prev => [...prev, newGoal]);
      setCurrentGoal('');

      // Notify parent component
      if (onGoalSubmitted) {
        onGoalSubmitted(newGoal);
      }

      // Check if we have enough goals (could be configurable)
      const updatedGoals = [...goals, newGoal];
      if (updatedGoals.length >= 3 && onAllGoalsComplete) {
        onAllGoalsComplete(updatedGoals);
      }
    } catch (error) {
      console.error('Error submitting goal:', error);
    } finally {
      setIsSubmitting(false);
    }
  }, [currentGoal, isValid, isSubmitting, goals, onGoalSubmitted, onAllGoalsComplete]);

  const clearCurrentGoal = useCallback(() => {
    setCurrentGoal('');
  }, []);

  const removeGoal = useCallback((id: string) => {
    setGoals(prev => prev.filter(goal => goal.id !== id));
  }, []);

  return {
    state: {
      currentGoal,
      goals,
      isSubmitting,
      isValid
    },
    handlers: {
      updateCurrentGoal,
      submitGoal,
      clearCurrentGoal,
      removeGoal
    }
  };
};