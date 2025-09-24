// Home Screen - Authentication -> Onboarding -> Goal Collection
// Clean flow: Auth -> Onboarding -> Goals

import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState } from 'react';
import { AuthScreen } from '../../components/auth/AuthScreen';
import { GoalCollectionScreen } from '../../components/goals/GoalCollectionScreen';
import { FormOnboarding } from '../../components/onboarding/FormOnboarding';
import authService, { AuthUser } from '../../services/authService';

export default function HomeScreen() {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showGoalCollection, setShowGoalCollection] = useState(false);
  const [userName, setUserName] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAppState();
  }, []);

  const checkAppState = async () => {
    try {
      // First check authentication
      const user = authService.getCurrentUser();
      if (user) {
        setCurrentUser(user);
        await checkOnboardingStatus(user);
      }
    } catch (error) {
      console.error('Error checking app state:', error);
    }
    setIsLoading(false);
  };

  const checkOnboardingStatus = async (user: AuthUser) => {
    try {
      const completed = await AsyncStorage.getItem('@nudge_onboarding_completed');
      const goalsCompleted = await AsyncStorage.getItem('@nudge_goals_completed');
      const storedName = await AsyncStorage.getItem('@nudge_user_name');
      
      if (completed === 'true' && storedName) {
        setUserName(storedName);
        setShowOnboarding(false);
        
        if (goalsCompleted !== 'true') {
          setShowGoalCollection(true);
        }
      } else {
        // Show onboarding if not completed
        setShowOnboarding(true);
      }
    } catch (error) {
      console.error('Error checking onboarding status:', error);
      setShowOnboarding(true);
    }
  };

  const handleAuthSuccess = async (user: AuthUser) => {
    console.log('🔐 Authentication successful:', user.displayName);
    setCurrentUser(user);
    await checkOnboardingStatus(user);
  };

  const handleOnboardingComplete = async (name: string) => {
    try {
      await AsyncStorage.setItem('@nudge_onboarding_completed', 'true');
      await AsyncStorage.setItem('@nudge_user_name', name);
      setUserName(name);
      setShowOnboarding(false);
      setShowGoalCollection(true); // Show goal collection after onboarding
    } catch (error) {
      console.error('Error saving onboarding completion:', error);
    }
  };

  const handleGoalsComplete = async (goals: any[]) => {
    try {
      await AsyncStorage.setItem('@nudge_goals_completed', 'true');
      await AsyncStorage.setItem('@nudge_user_goals', JSON.stringify(goals));
      setShowGoalCollection(false);
      console.log('Goals collection completed:', goals);
      // TODO: Navigate to main app or dashboard
    } catch (error) {
      console.error('Error saving goals:', error);
    }
  };

  // Reset function for development/testing
  const resetOnboarding = async () => {
    try {
      await AsyncStorage.setItem('@nudge_onboarding_completed', 'false');
      await AsyncStorage.setItem('@nudge_goals_completed', 'false');
      setShowOnboarding(true);
      setShowGoalCollection(false);
    } catch (error) {
      console.error('Error resetting onboarding:', error);
    }
  };

  if (isLoading) {
    return null; // Or a loading spinner
  }

  // Authentication flow - show auth screen if not authenticated
  if (!currentUser) {
    return <AuthScreen onAuthSuccess={handleAuthSuccess} />;
  }

  // Onboarding flow - show if authenticated but not onboarded
  if (showOnboarding) {
    return <FormOnboarding onComplete={handleOnboardingComplete} />;
  }

  // Goal collection flow - show if onboarded but goals not set
  if (showGoalCollection) {
    return <GoalCollectionScreen onComplete={handleGoalsComplete} />;
  }

  // Main app content - show goal collection as main screen for now
  return <GoalCollectionScreen onComplete={handleGoalsComplete} />;
}