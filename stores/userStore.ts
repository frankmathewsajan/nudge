// User Store - Global user state management with Zustand
// Follows React Native Expo patterns

import { storageService } from '@/services/storage/storageService';
import { create } from 'zustand';

export interface UserGoals {
  original: string;
  processed: any;
  processedAt: string;
}

export interface UserState {
  // State
  goals: UserGoals | null;
  onboardingCompleted: boolean;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  setGoals: (goals: UserGoals) => void;
  loadGoals: () => Promise<void>;
  setOnboardingCompleted: (completed: boolean) => void;
  clearUser: () => void;
  setError: (error: string | null) => void;
  setLoading: (loading: boolean) => void;
}

export const useUserStore = create<UserState>((set, get) => ({
  // Initial state
  goals: null,
  onboardingCompleted: false,
  isLoading: false,
  error: null,

  // Actions
  setGoals: (goals) => {
    set({ goals });
    // Persist to storage
    storageService.saveGoals(goals);
  },

  loadGoals: async () => {
    try {
      set({ isLoading: true, error: null });
      const goals = await storageService.loadGoals();
      const onboardingCompleted = await storageService.isOnboardingComplete();
      
      set({ 
        goals, 
        onboardingCompleted,
        isLoading: false 
      });
    } catch (error) {
      set({ 
        error: 'Failed to load user data',
        isLoading: false 
      });
    }
  },

  setOnboardingCompleted: (completed) => {
    set({ onboardingCompleted: completed });
    if (completed) {
      storageService.saveOnboardingComplete();
    }
  },

  clearUser: async () => {
    try {
      await storageService.clearUserData();
      set({
        goals: null,
        onboardingCompleted: false,
        error: null,
      });
    } catch (error) {
      set({ error: 'Failed to clear user data' });
    }
  },

  setError: (error) => set({ error }),
  
  setLoading: (isLoading) => set({ isLoading }),
}));